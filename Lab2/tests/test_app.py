"""
Unit tests for Lab2 Redis Distributed Simulation API
"""
import pytest
import sys
import os
from unittest.mock import patch, Mock

# Add Lab2 directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestHomeEndpoint:
    """Tests for the home endpoint"""

    def test_home_returns_200(self, client):
        """Test home endpoint returns 200 status"""
        response = client.get('/')
        assert response.status_code == 200

    def test_home_returns_json(self, client):
        """Test home endpoint returns valid JSON with service info"""
        response = client.get('/')
        data = response.get_json()
        assert 'service' in data
        assert data['service'] == 'Redis Distributed Simulation API'
        assert 'endpoints' in data
        assert 'version' in data


class TestHealthEndpoint:
    """Tests for health endpoint"""

    def test_health_returns_200(self, client):
        """Test health endpoint returns 200"""
        response = client.get('/health')
        assert response.status_code == 200

    def test_health_returns_status(self, client):
        """Test health endpoint returns status information"""
        response = client.get('/health')
        data = response.get_json()
        assert data['service'] == 'lab2-redis-api'
        assert data['status'] == 'healthy'
        assert 'redis' in data
        assert 'primary' in data['redis']
        assert 'replica' in data['redis']


class TestMetricsEndpoint:
    """Tests for Prometheus metrics"""

    def test_metrics_endpoint(self, client):
        """Test metrics endpoint returns prometheus format"""
        response = client.get('/metrics')
        assert response.status_code == 200
        assert b'lab2_requests_total' in response.data


class TestRedisEndpoints:
    """Tests for Redis operation endpoints"""

    def test_write_endpoint_without_redis(self, client):
        """Test write endpoint when Redis is unavailable"""
        # This will either succeed (if Redis is up) or return 503
        response = client.get('/write')
        assert response.status_code in [200, 503]

    def test_read_primary_endpoint(self, client):
        """Test read-primary endpoint"""
        response = client.get('/read-primary')
        assert response.status_code in [200, 503]
        data = response.get_json()
        assert 'node' in data or 'status' in data

    def test_read_replica_endpoint(self, client):
        """Test read-replica endpoint"""
        response = client.get('/read-replica')
        assert response.status_code in [200, 503]


class TestErrorHandling:
    """Tests for error handling"""

    def test_invalid_endpoint(self, client):
        """Test 404 for invalid endpoints"""
        response = client.get('/nonexistent')
        assert response.status_code == 404


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
