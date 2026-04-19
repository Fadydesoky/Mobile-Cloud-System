"""
Unit tests for Product Service
"""
import pytest

# Note: conftest.py in parent handles order-service imports
# For product-service tests we need direct import
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'product-service'))

from app import app, PRODUCTS


@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestProductServiceHealth:
    """Tests for health and readiness endpoints"""

    def test_health_endpoint(self, client):
        """Test health endpoint returns correct status"""
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['service'] == 'product-service'
        assert data['status'] == 'up'
        assert 'time' in data
        assert 'version' in data

    def test_ready_endpoint(self, client):
        """Test readiness endpoint"""
        response = client.get('/ready')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ready'


class TestProductServiceProducts:
    """Tests for product endpoints"""

    def test_get_existing_product(self, client):
        """Test getting an existing product"""
        response = client.get('/products/1')
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == 1
        assert data['name'] == 'Laptop'
        assert data['price'] == 1200

    def test_get_all_products(self, client):
        """Test listing all products"""
        response = client.get('/products')
        assert response.status_code == 200
        data = response.get_json()
        assert 'products' in data
        assert len(data['products']) == len(PRODUCTS)

    def test_get_nonexistent_product(self, client):
        """Test getting a product that doesn't exist"""
        response = client.get('/products/999')
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data

    def test_get_product_2(self, client):
        """Test getting product 2 (Phone)"""
        response = client.get('/products/2')
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Phone'
        assert data['price'] == 650

    def test_get_product_3(self, client):
        """Test getting product 3 (Headphones)"""
        response = client.get('/products/3')
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Headphones'
        assert data['price'] == 120


class TestProductServiceMetrics:
    """Tests for metrics endpoint"""

    def test_metrics_endpoint(self, client):
        """Test Prometheus metrics endpoint"""
        response = client.get('/metrics')
        assert response.status_code == 200
        assert b'product_service_requests_total' in response.data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
