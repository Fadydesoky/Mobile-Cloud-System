from flask import Flask, request, jsonify
import random
import time
import os
from datetime import datetime

app = Flask(__name__)

MIN_DELAY = float(os.getenv('MIN_DELAY', 0.1))
MAX_DELAY = float(os.getenv('MAX_DELAY', 1.5))


@app.route("/")
def home():
    delay = round(random.uniform(MIN_DELAY, MAX_DELAY), 2)
    time.sleep(delay)

    return jsonify({
        "message": "Mobile Cloud API",
        "delay": delay,
        "timestamp": datetime.utcnow().isoformat()
    })


@app.route("/data")
def data():
    size = int(request.args.get("size", 5))
    data = [random.randint(1, 100) for _ in range(size)]

    return jsonify({
        "count": len(data),
        "sample": data[:5]
    })


@app.route("/health")
def health():
    return "ok", 200


@app.route("/status")
def status():
    return jsonify({
        "status": "healthy"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
