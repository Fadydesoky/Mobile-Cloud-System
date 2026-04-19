from flask import Flask, jsonify
import logging
from datetime import datetime
from flask_cors import CORS
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import os

app = Flask(__name__)
CORS(app)

# Prometheus Metrics
REQUEST_COUNT = Counter('product_service_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('product_service_request_latency_seconds', 'Request latency', ['endpoint'])

logging.basicConfig(level=logging.INFO)

PRODUCTS = {
    1: {"id": 1, "name": "Laptop", "price": 1200},
    2: {"id": 2, "name": "Phone", "price": 650},
    3: {"id": 3, "name": "Headphones", "price": 120}
}


@app.route("/health")
def health():
    REQUEST_COUNT.labels(method='GET', endpoint='/health', status='200').inc()
    return jsonify({
        "service": "product-service",
        "status": "up",
        "time": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0")
    })


@app.route("/ready")
def ready():
    """Readiness probe - service is always ready if running"""
    return jsonify({"status": "ready"}), 200


@app.route("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}


@app.route("/products")
def list_products():
    """List all available products"""
    REQUEST_COUNT.labels(method='GET', endpoint='/products', status='200').inc()
    return jsonify({"products": list(PRODUCTS.values())}), 200


@app.route("/products/<int:product_id>")
def get_product(product_id):
    product = PRODUCTS.get(product_id)

    if product:
        logging.info(f"Product found: {product_id}")
        return jsonify(product), 200

    logging.warning(f"Product not found: {product_id}")
    return jsonify({"error": "Product not found"}), 404


if __name__ == "__main__":
    PORT = int(os.getenv("PRODUCT_SERVICE_PORT", 5001))
    app.run(host="0.0.0.0", port=PORT)
