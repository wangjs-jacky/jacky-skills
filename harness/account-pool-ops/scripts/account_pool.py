#!/usr/bin/env python3
"""Local API credential registry. Secret values live only in macOS Keychain."""
import argparse
import ctypes
import fcntl
import hashlib
import json
import os
import re
import secrets
import sys
import tempfile
import urllib.error
import urllib.request
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PREFIX = 'com.jacky.account-pool-ops'
ALIASES = {'minmax': 'minimax', 'mini-max': 'minimax', 'minimaxi': 'minimax'}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def now():
    return datetime.now(timezone.utc).isoformat()


def canonical_platform(value):
    value = value.strip().lower()
    value = ALIASES.get(value, value)
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,62}', value):
        raise ValueError('platform must be a lowercase slug')
    return value


def safe_id(value):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,62}', value):
        raise ValueError('entry must be a lowercase slug')
    return value


def fingerprint(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


class KeychainError(RuntimeError):
    def __init__(self, operation, status):
        self.status = status
        super().__init__('Keychain %s failed (OSStatus %s)' % (operation, status))


class MacKeychain:
    """Security.framework avoids putting secrets in shell arguments or files."""
    def __init__(self):
        if sys.platform != 'darwin':
            raise RuntimeError('macOS Keychain is required; no plaintext fallback')
        self.security = ctypes.CDLL('/System/Library/Frameworks/Security.framework/Security')
        self.cf = ctypes.CDLL('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation')
        void = ctypes.c_void_p
        uint = ctypes.c_uint32
        self.security.SecKeychainSetUserInteractionAllowed.argtypes = [ctypes.c_ubyte]
        self.security.SecKeychainSetUserInteractionAllowed.restype = ctypes.c_int32
        self.security.SecKeychainSetUserInteractionAllowed(0)
        self.security.SecKeychainAddGenericPassword.argtypes = [void, uint, ctypes.c_char_p, uint, ctypes.c_char_p, uint, void, ctypes.POINTER(void)]
        self.security.SecKeychainAddGenericPassword.restype = ctypes.c_int32
        self.security.SecKeychainFindGenericPassword.argtypes = [void, uint, ctypes.c_char_p, uint, ctypes.c_char_p, ctypes.POINTER(uint), ctypes.POINTER(void), ctypes.POINTER(void)]
        self.security.SecKeychainFindGenericPassword.restype = ctypes.c_int32
        self.security.SecKeychainItemFreeContent.argtypes = [void, void]
        self.security.SecKeychainItemFreeContent.restype = ctypes.c_int32
        self.security.SecKeychainItemDelete.argtypes = [void]
        self.security.SecKeychainItemDelete.restype = ctypes.c_int32
        self.cf.CFRelease.argtypes = [void]
        self.cf.CFRelease.restype = None

    def add(self, service, account, secret):
        service_b, account_b, secret_b = (x.encode('utf-8') for x in (service, account, secret))
        item = ctypes.c_void_p()
        status = self.security.SecKeychainAddGenericPassword(None, len(service_b), service_b, len(account_b), account_b, len(secret_b), ctypes.c_char_p(secret_b), ctypes.byref(item))
        if item.value:
            self.cf.CFRelease(item)
        if status != 0:
            raise KeychainError('add', status)

    def _find(self, service, account):
        service_b, account_b = service.encode(), account.encode()
        length = ctypes.c_uint32()
        data, item = ctypes.c_void_p(), ctypes.c_void_p()
        status = self.security.SecKeychainFindGenericPassword(None, len(service_b), service_b, len(account_b), account_b, ctypes.byref(length), ctypes.byref(data), ctypes.byref(item))
        if status != 0:
            raise KeychainError('read', status)
        try:
            value = ctypes.string_at(data, length.value).decode('utf-8')
        finally:
            if data.value:
                self.security.SecKeychainItemFreeContent(None, data)
        return value, item

    def read(self, service, account):
        value, item = self._find(service, account)
        try:
            return value
        finally:
            if item.value:
                self.cf.CFRelease(item)

    def delete_self_test(self, service, account):
        if not service.startswith(PREFIX + '.self-test.'):
            raise ValueError('self-test cleanup cannot delete real entries')
        _, item = self._find(service, account)
        try:
            status = self.security.SecKeychainItemDelete(item)
            if status != 0:
                raise KeychainError('self-test cleanup', status)
        finally:
            if item.value:
                self.cf.CFRelease(item)


class Pool:
    def __init__(self, state_dir=None, backend=None):
        self.state_dir = Path(state_dir) if state_dir else ROOT / 'local'
        self.state_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.state_dir.chmod(0o700)
        self.path = self.state_dir / 'accounts.json'
        self.backend = backend

    @property
    def keychain(self):
        if self.backend is None:
            self.backend = MacKeychain()
        return self.backend

    def load(self):
        if not self.path.exists():
            return {'schema_version': 1, 'platforms': {}}
        result = json.loads(self.path.read_text(encoding='utf-8'))
        if result.get('schema_version') != 1 or not isinstance(result.get('platforms'), dict):
            raise ValueError('registry schema is invalid; refusing to replace it')
        return result

    @contextmanager
    def locked(self):
        with (self.state_dir / '.lock').open('a') as lock:
            os.chmod(lock.name, 0o600)
            fcntl.flock(lock, fcntl.LOCK_EX)
            try:
                yield
            finally:
                fcntl.flock(lock, fcntl.LOCK_UN)

    def save(self, registry):
        descriptor, temporary = tempfile.mkstemp(prefix='.accounts-', dir=self.state_dir)
        try:
            with os.fdopen(descriptor, 'w', encoding='utf-8') as file:
                os.fchmod(file.fileno(), 0o600)
                json.dump(registry, file, ensure_ascii=False, indent=2)
                file.write('\n')
                file.flush()
                os.fsync(file.fileno())
            os.replace(temporary, self.path)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)

    def import_key(self, platform, secret, entry=None, make_default=False):
        platform = canonical_platform(platform)
        secret = secret.strip()
        if len(secret) < 8 or any(x in secret for x in ['\x00', '\n', '\r']):
            raise ValueError('secret is empty, too short or multiline')
        digest = fingerprint(secret)
        with self.locked():
            registry = self.load()
            record = registry['platforms'].setdefault(platform, {'default': None, 'entries': []})
            for existing in record['entries']:
                if existing['fingerprint'] == digest:
                    actual = self.keychain.read(existing['service'], existing['account'])
                    if not secrets.compare_digest(actual, secret):
                        raise RuntimeError('Keychain and registry disagree; stop for reconciliation')
                    return {'platform': platform, 'entry': existing['id'], 'duplicate': True, 'stored': True, 'fingerprint': digest[:12]}
            entry = safe_id(entry) if entry else ('primary' if not record['entries'] else 'key-' + uuid.uuid4().hex[:12])
            if any(item['id'] == entry for item in record['entries']):
                raise ValueError('entry already exists; import with a new entry name')
            service, account = PREFIX + '.' + platform + '.' + entry, 'api-key'
            try:
                self.keychain.add(service, account, secret)
            except KeychainError as error:
                if error.status != -25299:
                    raise
                actual = self.keychain.read(service, account)
                if not secrets.compare_digest(actual, secret):
                    raise RuntimeError('existing Keychain item differs; refusing to overwrite')
            value = {'id': entry, 'service': service, 'account': account, 'fingerprint': digest, 'enabled': True, 'stored_at': now(), 'verification': None}
            record['entries'].append(value)
            if record['default'] is None or make_default:
                record['default'] = entry
            self.save(registry)
        return {'platform': platform, 'entry': entry, 'duplicate': False, 'stored': True, 'fingerprint': digest[:12]}

    def select(self, platform, entry=None):
        platform = canonical_platform(platform)
        record = self.load()['platforms'].get(platform)
        if not record:
            raise ValueError('platform has no stored entries')
        target = entry or record['default']
        value = next((item for item in record['entries'] if item['id'] == target), None)
        if not value or not value['enabled']:
            raise ValueError('requested entry is missing or disabled; no automatic fallback')
        return platform, value

    def get_secret(self, platform, entry=None):
        platform, value = self.select(platform, entry)
        if value['service'] != PREFIX + '.' + platform + '.' + safe_id(value['id']) or value['account'] != 'api-key':
            raise ValueError('registry Keychain reference is outside the expected entry')
        secret = self.keychain.read(value['service'], value['account'])
        if not secrets.compare_digest(fingerprint(secret), value['fingerprint']):
            raise RuntimeError('Keychain fingerprint changed; refusing to use this entry')
        return secret

    def list_entries(self, platform=None):
        entries = []
        wanted = canonical_platform(platform) if platform else None
        for name, record in self.load()['platforms'].items():
            if wanted and name != wanted:
                continue
            for value in record['entries']:
                entries.append({'platform': name, 'entry': value['id'], 'default': record['default'] == value['id'], 'enabled': value['enabled'], 'fingerprint': value['fingerprint'][:12], 'verification': value['verification']})
        return entries

    def set_default(self, platform, entry):
        platform, selected = self.select(platform, entry)
        with self.locked():
            registry = self.load()
            registry['platforms'][platform]['default'] = selected['id']
            self.save(registry)
        return {'platform': platform, 'default': selected['id']}

    def verify_minimax(self, entry=None, region='both', proxy=None):
        platform, selected = self.select('minimax', entry)
        key = self.get_secret(platform, selected['id'])
        endpoints = {'global': 'https://api.minimax.io', 'cn': 'https://api.minimaxi.com'}
        regions = list(endpoints) if region == 'both' else [region]
        results = []
        for name in regions:
            base = endpoints[name]
            handlers = [NoRedirect()]
            if proxy:
                handlers.append(urllib.request.ProxyHandler({'https': proxy}))
            opener = urllib.request.build_opener(*handlers)
            req = urllib.request.Request(base + '/v2/query/video_generation?page_num=1&page_size=1', headers={'Authorization': 'Bearer ' + key, 'Accept': 'application/json'})
            status, body = None, {}
            try:
                with opener.open(req, timeout=20) as response:
                    status = response.status
                    body = json.loads(response.read(262144))
            except urllib.error.HTTPError as error:
                status = error.code
                try:
                    body = json.loads(error.read(16384))
                except (ValueError, UnicodeError):
                    body = {}
            except Exception as error:
                results.append({'region': name, 'authenticated': False, 'transport_error': type(error).__name__})
                continue
            authenticated = status == 200 and isinstance(body.get('items'), list) and not body.get('error')
            error_type = (body.get('error') or {}).get('type')
            results.append({'region': name, 'http_status': status, 'authenticated': authenticated, 'error_type': error_type})
        accepted = next((item['region'] for item in results if item['authenticated']), None)
        verification = {'checked_at': now(), 'scope': 'one read-only H3 task-list request per selected region', 'generation_tested': False, 'preferred_region': accepted, 'preferred_endpoint': endpoints.get(accepted), 'results': results}
        with self.locked():
            registry = self.load()
            current = next(item for item in registry['platforms'][platform]['entries'] if item['id'] == selected['id'])
            current['verification'] = verification
            self.save(registry)
        return {'platform': platform, 'entry': selected['id'], **verification}


def keychain_self_test():
    backend = MacKeychain()
    service, account = PREFIX + '.self-test.' + uuid.uuid4().hex, 'temporary-test'
    value = secrets.token_urlsafe(32)
    backend.add(service, account, value)
    try:
        if not secrets.compare_digest(backend.read(service, account), value):
            raise RuntimeError('Keychain roundtrip mismatch')
    finally:
        backend.delete_self_test(service, account)
    return {'keychain_roundtrip': True, 'temporary_item_removed': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    add = commands.add_parser('import-key', help='Read one secret from stdin; never accept a secret argument')
    add.add_argument('--platform', required=True)
    add.add_argument('--entry')
    add.add_argument('--make-default', action='store_true')
    listing = commands.add_parser('list', help='Show metadata only; never prints secret values')
    listing.add_argument('--platform')
    choose = commands.add_parser('set-default')
    choose.add_argument('--platform', required=True)
    choose.add_argument('--entry', required=True)
    verify = commands.add_parser('verify-minimax', help='Read-only task-list authentication, no generation')
    verify.add_argument('--entry')
    verify.add_argument('--region', choices=['global', 'cn', 'both'], default='both')
    verify.add_argument('--proxy')
    commands.add_parser('keychain-self-test')
    args = parser.parse_args()
    pool = Pool()
    if args.command == 'import-key':
        if sys.stdin.isatty():
            import getpass
            secret = getpass.getpass('API key: ')
        else:
            secret = sys.stdin.read(131072)
        result = pool.import_key(args.platform, secret, args.entry, args.make_default)
    elif args.command == 'list':
        result = pool.list_entries(args.platform)
    elif args.command == 'set-default':
        result = pool.set_default(args.platform, args.entry)
    elif args.command == 'verify-minimax':
        result = pool.verify_minimax(args.entry, args.region, args.proxy)
    else:
        result = keychain_self_test()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.command == 'verify-minimax' and not any(item['authenticated'] for item in result['results']):
        return 1
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, RuntimeError, OSError) as error:
        print(json.dumps({'error': str(error)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
