"""
Unit tests for Lab3 Mobile Cloud API
"""
import pytest
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestHealthEndpoints:
    """Tests for health and readiness probes"""

    def test_health_endpoint(self, client):
        """Test health endpoint returns correct status"""
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'lab3-api'
        assert 'version' in data

    def test_ready_endpoint(self, client):
        """Test readiness probe endpoint"""
        response = client.get('/ready')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ready'


class TestHomeEndpoint:
    """Tests for the home endpoint"""

    def test_home_returns_200(self, client):
        """Test home endpoint returns 200 status"""
        response = client.get('/')
        assert response.status_code == 200

    def test_home_returns_json(self, client):
        """Test home endpoint returns valid JSON"""
        response = client.get('/')
        data = response.get_json()
        assert 'message' in data
        assert data['message'] == 'Mobile Cloud API'

    def test_home_includes_delay(self, client):
        """Test home endpoint includes delay information"""
        response = client.get('/')
        data = response.get_json()
        assert 'delay' in data
        assert isinstance(data['delay'], float)
        assert 0.1 <= data['delay'] <= 1.5


class TestDataEndpoint:
    """Tests for the data endpoint"""

    def test_data_default_size(self, client):
        """Test data endpoint with default size"""
        response = client.get('/data')
        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] == 100
        assert 'sample' in data
        assert len(data['sample']) <= 5

    def test_data_custom_size(self, client):
        """Test data endpoint with custom size"""
        response = client.get('/data?size=50')
        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] == 50

    def test_data_large_size(self, client):
        """Test data endpoint with large size"""
        response = client.get('/data?size=500')
        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] == 500

    def test_data_sample_contains_integers(self, client):
        """Test that sample contains valid integers"""
        response = client.get('/data?size=10')
        data = response.get_json()
        for item in data['sample']:
            assert isinstance(item, int)
            assert 1 <= item <= 100


class TestMetricsEndpoint:
    """Tests for Prometheus metrics endpoint"""

    def test_metrics_endpoint(self, client):
        """Test metrics endpoint returns prometheus format"""
        response = client.get('/metrics')
        assert response.status_code == 200
        assert b'lab3_requests_total' in response.data


class TestErrorHandling:
    """Tests for error handling"""

    def test_invalid_endpoint(self, client):
        """Test 404 for invalid endpoints"""
        response = client.get('/nonexistent')
        assert response.status_code == 404

    def test_invalid_method(self, client):
        """Test 405 for invalid method"""
        response = client.post('/')
        assert response.status_code == 405


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--cov=.', '--cov-report=term-missing'])
