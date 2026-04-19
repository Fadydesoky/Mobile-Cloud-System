import unittest
import redis

class TestLab2Backend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        cls.redis_client.flushall()  # Clear the Redis database before tests

    def test_redis_integration(self):
        # Test Redis connection
        self.assertIsNotNone(self.redis_client)

        # Test setting and getting a value
        self.redis_client.set('key', 'value')
        retrieved_value = self.redis_client.get('key').decode('utf-8')
        self.assertEqual(retrieved_value, 'value')

    def test_error_handling(self):
        # Test error handling for non-existing key
        with self.assertRaises(redis.exceptions.ResponseError):
            self.redis_client.get('non_existing_key')

    def test_distributed_consistency(self):
        # Test consistency across multiple clients
        def set_value_in_redis(redis_key, value):
            self.redis_client.set(redis_key, value)

        # Simulating two clients setting the same key
        set_value_in_redis('distributed_key', 'first_value')
        current_value = self.redis_client.get('distributed_key').decode('utf-8')
        self.assertEqual(current_value, 'first_value')

        set_value_in_redis('distributed_key', 'second_value')
        current_value = self.redis_client.get('distributed_key').decode('utf-8')
        self.assertEqual(current_value, 'second_value')

if __name__ == '__main__':
    unittest.main()
