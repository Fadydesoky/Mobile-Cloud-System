from flask import Flask, jsonify
import logging
from datetime import datetime
from flask_cors import CORS
import os

CORS(app)

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

PRODUCTS = {
    1: {"id": 1, "name": "Laptop", "price": 1200},
    2: {"id": 2, "name": "Phone", "price": 650},
    3: {"id": 3, "name": "Headphones", "price": 120}
}


@app.route("/health")
def health():
    return jsonify({
        "service": "product-service",
        "status": "up",
        "time": datetime.utcnow().isoformat()
    })


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
