import os
import time
import logging
import requests
from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

app = Flask(__name__)
CORS(app)

# Prometheus Metrics
REQUEST_COUNT = Counter('order_service_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('order_service_request_latency_seconds', 'Request latency', ['endpoint'])

logging.basicConfig(level=logging.INFO)

PRODUCT_SERVICE_URL = os.getenv(
    "PRODUCT_SERVICE_URL",
    "http://product-service:5001"
)


def fetch_product(product_id, retries=2, delay=1):
    url = f"{PRODUCT_SERVICE_URL}/products/{product_id}"

    for attempt in range(retries + 1):
        try:
            start = time.time()
            response = requests.get(url, timeout=2)
            latency = round(time.time() - start, 3)

            logging.info(f"[Attempt {attempt+1}] Response in {latency}s")

            return response, latency

        except requests.exceptions.RequestException as e:
            logging.warning(f"Attempt {attempt+1} failed: {e}")

            if attempt < retries:
                time.sleep(delay)
            else:
                return None, None


@app.route("/health")
def health():
    REQUEST_COUNT.labels(method='GET', endpoint='/health', status='200').inc()
    return jsonify({
        "service": "order-service",
        "status": "up",
        "time": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0")
    })


@app.route("/ready")
def ready():
    """Readiness probe - checks if service can accept traffic"""
    try:
        # Check if product service is reachable
        response = requests.get(f"{PRODUCT_SERVICE_URL}/health", timeout=2)
        if response.status_code == 200:
            return jsonify({"status": "ready", "dependencies": {"product-service": "up"}}), 200
    except requests.exceptions.RequestException:
        pass
    return jsonify({"status": "not ready", "dependencies": {"product-service": "down"}}), 503


@app.route("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}


@app.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    response, latency = fetch_product(product_id)

    if response is None:
        return jsonify({
            "error": "product-service unavailable",
            "resilience": "retry exhausted"
        }), 503

    if response.status_code != 200:
        return jsonify({
            "error": "invalid product"
        }), 400

    product = response.json()
    total = product["price"] * quantity

    return jsonify({
        "message": "Order created",
        "product": product["name"],
        "quantity": quantity,
        "total_price": total,
        "latency": f"{latency}s"
    }), 201


if __name__ == "__main__":
    PORT = int(os.getenv("ORDER_SERVICE_PORT", 5002))
    app.run(host="0.0.0.0", port=PORT)
