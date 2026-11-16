#!/usr/bin/env python3
"""Validate structure and metadata without reading Keychain secrets or calling APIs."""
import json
import re
import stat
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
issues = []


def fail(path, message):
    issues.append(str(path.relative_to(ROOT)) + ': ' + message)


def no_secret_fields(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key.lower() in {'secret', 'api_key', 'password', 'access_token', 'refresh_token'}:
                return False
            if not no_secret_fields(child):
                return False
    elif isinstance(value, list):
        return all(no_secret_fields(child) for child in value)
    return True


for name in ['SKILL.md', '.gitignore', 'references/ops-model.md', 'references/knowledge-schema.md', 'references/global-agents-prompt.md', 'references/platforms/index.md']:
    if not (ROOT / name).is_file():
        issues.append(name + ': missing required file')

for path in ROOT.rglob('*'):
    if not path.is_file() or 'local' in path.relative_to(ROOT).parts or '__pycache__' in path.parts:
        continue
    if path.suffix not in {'.md', '.py', '.yaml', '.json'}:
        continue
    text = path.read_text(encoding='utf-8')
    if re.search(r'(?:sk-api-|sk-|gh[pousr]_)[A-Za-z0-9_-]{32,}', text):
        fail(path, 'possible credential material in distributable file')
    if path.suffix == '.md':
        for target in re.findall(r'\]\(([^)]+)\)', text):
            if target.startswith(('https://', 'http://', '#')):
                continue
            resolved = (path.parent / target.split('#')[0]).resolve()
            if ROOT not in resolved.parents or not resolved.exists():
                fail(path, 'invalid relative reference')

for operation in (ROOT / 'references/platforms').glob('*/operations/*.md'):
    text = operation.read_text(encoding='utf-8')
    if not text.startswith('---\n') or '\n---\n' not in text[4:]:
        fail(operation, 'missing metadata')
        continue
    header = text.split('---', 2)[1]
    fields = dict(re.findall(r'^([a-z_]+):\s*(.*?)\s*$', header, re.M))
    platform = operation.parent.parent.name
    if fields.get('platform') != platform or fields.get('operation') != operation.stem:
        fail(operation, 'platform or operation differs from path')
    status = fields.get('status')
    verified = fields.get('last_verified')
    if status not in {'documented', 'partial', 'verified'}:
        fail(operation, 'invalid status')
    if status == 'verified':
        try:
            date.fromisoformat(verified)
        except (ValueError, TypeError):
            fail(operation, 'verified operation requires an actual date')
    elif verified != 'null':
        fail(operation, 'unverified operation must not carry a success date')
    index = operation.parent.parent / 'index.md'
    expected = '| ' + operation.stem + ' | ' + status + ' | ' + (verified if status == 'verified' else '—') + ' |'
    if not index.is_file() or expected not in index.read_text(encoding='utf-8'):
        fail(operation, 'platform index status/date mismatch')

registry = ROOT / 'local/accounts.json'
entry_count = 0
if registry.exists():
    data = json.loads(registry.read_text(encoding='utf-8'))
    if data.get('schema_version') != 1 or not no_secret_fields(data):
        fail(registry, 'invalid registry schema or secret-bearing field')
    if stat.S_IMODE(registry.stat().st_mode) != 0o600 or stat.S_IMODE(registry.parent.stat().st_mode) != 0o700:
        fail(registry, 'metadata permissions must be 0600 in a 0700 directory')
    for platform, record in data.get('platforms', {}).items():
        if not (ROOT / 'references/platforms' / platform / 'index.md').is_file():
            fail(registry, 'platform has no knowledge index')
        ids = set()
        for entry in record.get('entries', []):
            entry_count += 1
            entry_id = entry.get('id', '')
            if entry_id in ids or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,62}', entry_id):
                fail(registry, 'duplicate or invalid entry id')
            ids.add(entry_id)
            if entry.get('service') != 'com.jacky.account-pool-ops.' + platform + '.' + entry_id or entry.get('account') != 'api-key':
                fail(registry, 'unexpected secure-store reference')
            if not re.fullmatch(r'[a-f0-9]{64}', entry.get('fingerprint', '')):
                fail(registry, 'invalid fingerprint')
        if record.get('default') not in ids:
            fail(registry, 'default does not identify an entry')

if issues:
    print(json.dumps({'valid': False, 'issues': issues}, ensure_ascii=False, indent=2))
    raise SystemExit(1)
print(json.dumps({'valid': True, 'operations': len(list((ROOT / 'references/platforms').glob('*/operations/*.md'))), 'entries': entry_count, 'secret_values_read': False}, ensure_ascii=False))
