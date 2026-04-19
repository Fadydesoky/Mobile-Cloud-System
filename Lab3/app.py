from flask import Flask, jsonify
import random
import time

app = Flask(__name__)

@app.route("/")
def home():
    delay = round(random.uniform(0.1, 1.5), 2)
    time.sleep(delay)

    return jsonify({
        "message": "Lab3 API",
        "delay": delay
    })

@app.route("/health")
def health():
    return "ok", 200

@app.route("/status")
def status():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
