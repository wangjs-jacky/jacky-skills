import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('account_pool', Path(__file__).with_name('account_pool.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class FakeKeychain:
    def __init__(self):
        self.values = {}
        self.adds = 0

    def add(self, service, account, secret):
        if (service, account) in self.values:
            raise module.KeychainError('add', -25299)
        self.values[(service, account)] = secret
        self.adds += 1

    def read(self, service, account):
        return self.values[(service, account)]


class PoolTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.backend = FakeKeychain()
        self.pool = module.Pool(self.temp.name, self.backend)

    def tearDown(self):
        self.temp.cleanup()

    def test_alias_and_metadata_contain_no_secret(self):
        secret = 'synthetic-test-key-one'
        self.pool.import_key('MinMax', secret)
        self.assertEqual(self.pool.get_secret('minimax'), secret)
        self.assertNotIn(secret, self.pool.path.read_text())
        self.assertNotIn(secret, json.dumps(self.pool.list_entries()))
        self.assertEqual(self.pool.path.stat().st_mode & 0o777, 0o600)
        self.assertEqual(Path(self.temp.name).stat().st_mode & 0o777, 0o700)

    def test_second_key_preserves_old_key_and_default(self):
        self.pool.import_key('minimax', 'synthetic-key-one')
        self.pool.import_key('minimax', 'synthetic-key-two', 'secondary')
        self.assertEqual(self.pool.get_secret('minimax'), 'synthetic-key-one')
        self.assertEqual(self.pool.get_secret('minimax', 'secondary'), 'synthetic-key-two')

    def test_duplicate_does_not_create_or_change_default(self):
        self.pool.import_key('minimax', 'synthetic-key-one')
        result = self.pool.import_key('minmax', 'synthetic-key-one')
        self.assertTrue(result['duplicate'])
        self.assertEqual(self.backend.adds, 1)
        self.assertEqual(len(self.pool.list_entries()), 1)

    def test_existing_name_never_overwrites_a_different_key(self):
        self.pool.import_key('minimax', 'synthetic-key-one', 'primary')
        with self.assertRaisesRegex(ValueError, 'already exists'):
            self.pool.import_key('minimax', 'synthetic-key-two', 'primary')
        self.assertEqual(self.pool.get_secret('minimax'), 'synthetic-key-one')

    def test_default_can_change_without_replacing_material(self):
        self.pool.import_key('minimax', 'synthetic-key-one')
        self.pool.import_key('minimax', 'synthetic-key-two', 'secondary')
        self.pool.set_default('minimax', 'secondary')
        self.assertEqual(self.pool.get_secret('minimax'), 'synthetic-key-two')
        self.assertEqual(self.pool.get_secret('minimax', 'primary'), 'synthetic-key-one')

    def test_disabled_key_does_not_fall_back(self):
        self.pool.import_key('minimax', 'synthetic-key-one')
        registry = self.pool.load()
        registry['platforms']['minimax']['entries'][0]['enabled'] = False
        self.pool.save(registry)
        with self.assertRaisesRegex(ValueError, 'no automatic fallback'):
            self.pool.get_secret('minimax')

    def test_tampered_reference_is_rejected_before_reading_another_item(self):
        self.pool.import_key('minimax', 'synthetic-key-one')
        registry = self.pool.load()
        registry['platforms']['minimax']['entries'][0]['service'] = 'unrelated-service'
        self.pool.save(registry)
        with self.assertRaisesRegex(ValueError, 'outside the expected entry'):
            self.pool.get_secret('minimax')

    def test_malformed_registry_is_not_replaced(self):
        self.pool.path.write_text('{broken')
        with self.assertRaises(ValueError):
            self.pool.import_key('minimax', 'synthetic-key-one')
        self.assertEqual(self.backend.adds, 0)
        self.assertEqual(self.pool.path.read_text(), '{broken')

    def test_backend_failure_does_not_claim_storage(self):
        def fail(*args):
            raise module.KeychainError('add', -25308)
        self.backend.add = fail
        with self.assertRaises(module.KeychainError):
            self.pool.import_key('minimax', 'synthetic-key-one')
        self.assertFalse(self.pool.path.exists())


if __name__ == '__main__':
    unittest.main()
