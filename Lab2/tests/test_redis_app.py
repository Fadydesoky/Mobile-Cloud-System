import unittest
import json
from unittest.mock import patch, MagicMock
from Lab2.app import app


class TestRedisDatabaseAPI(unittest.TestCase):
    """Test suite for Lab2 Redis distributed system API"""

    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_home_endpoint(self):
        """Test home endpoint returns welcome message"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Redis Distributed Simulation API', response.data.decode())

    @patch('Lab2.app.redis_primary')
    def test_write_endpoint_success(self, mock_redis):
        """Test write endpoint successfully writes data to primary"""
        mock_redis.set.return_value = True
        response = self.client.get('/write')
        self.assertEqual(response.status_code, 200)
        mock_redis.set.assert_called_once_with('test_key', 'hello')

    @patch('Lab2.app.redis_primary', None)
    def test_write_endpoint_no_redis(self):
        """Test write endpoint when Redis is not available"""
        response = self.client.get('/write')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Primary Redis not available', response.data.decode())

    @patch('Lab2.app.redis_primary')
    def test_read_primary_endpoint_success(self, mock_redis):
        """Test read from primary node"""
        mock_redis.get.return_value = 'hello'
        response = self.client.get('/read-primary')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['primary'], 'hello')

    @patch('Lab2.app.redis_primary', None)
    def test_read_primary_endpoint_no_redis(self):
        """Test read primary when Redis is unavailable"""
        response = self.client.get('/read-primary')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Primary Redis not available', response.data.decode())

    @patch('Lab2.app.redis_replica')
    def test_read_replica_endpoint_success(self, mock_redis):
        """Test read from replica node"""
        mock_redis.get.return_value = 'hello'
        response = self.client.get('/read-replica')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['replica'], 'hello')

    @patch('Lab2.app.redis_replica', None)
    def test_read_replica_endpoint_no_redis(self):
        """Test read replica when Redis is unavailable"""
        response = self.client.get('/read-replica')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Replica Redis not available', response.data.decode())

    def test_response_content_type_json(self):
        """Test endpoints return JSON when applicable"""
        with patch('Lab2.app.redis_primary') as mock_redis:
            mock_redis.get.return_value = 'test_value'
            response = self.client.get('/read-primary')
            self.assertIn('application/json', response.content_type)

    @patch('Lab2.app.redis_primary')
    @patch('Lab2.app.redis_replica')
    def test_consistency_simulation(self, mock_replica, mock_primary):
        """Test eventual consistency behavior"""
        # Write to primary
        mock_primary.set.return_value = True
        write_response = self.client.get('/write')
        self.assertEqual(write_response.status_code, 200)
        
        # Immediate read from primary should succeed
        mock_primary.get.return_value = 'hello'
        primary_response = self.client.get('/read-primary')
        self.assertEqual(primary_response.status_code, 200)
        primary_data = json.loads(primary_response.data)
        self.assertEqual(primary_data['primary'], 'hello')
        
        # Replica might not have data immediately (eventual consistency)
        mock_replica.get.return_value = None
        replica_response = self.client.get('/read-replica')
        self.assertEqual(replica_response.status_code, 200)


class TestRedisConnectionHandling(unittest.TestCase):
    """Test Redis connection and error handling"""

    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_graceful_degradation_primary_down(self):
        """Test API gracefully handles primary node failure"""
        with patch('Lab2.app.redis_primary', None):
            response = self.client.get('/write')
            self.assertEqual(response.status_code, 200)
            self.assertIn('not available', response.data.decode())

    def test_graceful_degradation_replica_down(self):
        """Test API gracefully handles replica node failure"""
        with patch('Lab2.app.redis_replica', None):
            response = self.client.get('/read-replica')
            self.assertEqual(response.status_code, 200)
            self.assertIn('not available', response.data.decode())

    def test_all_endpoints_accessible(self):
        """Test all API endpoints are accessible"""
        endpoints = ['/', '/write', '/read-primary', '/read-replica']
        for endpoint in endpoints:
            with patch('Lab2.app.redis_primary'):
                with patch('Lab2.app.redis_replica'):
                    response = self.client.get(endpoint)
                    self.assertNotEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
