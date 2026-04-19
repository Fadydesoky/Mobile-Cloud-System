import os
import time
import logging
import requests
from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS

CORS(app)

app = Flask(__name__)

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
    return jsonify({
        "service": "order-service",
        "status": "up",
        "time": datetime.utcnow().isoformat()
    })


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
    PRODUCT_SERVICE_URL = os.getenv(
        "PRODUCT_SERVICE_URL",
        "http://product-service:5001"
    )
    PORT = int(os.getenv("ORDER_SERVICE_PORT", 5002))
