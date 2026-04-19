from flask import Flask, jsonify
import redis
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

# Connect to Redis primary
try:
    redis_primary = redis.Redis(host="localhost", port=6379, decode_responses=True)
except:
    redis_primary = None

# Connect to Redis replica (optional)
try:
    redis_replica = redis.Redis(host="localhost", port=6380, decode_responses=True)
except:
    redis_replica = None


@app.route("/")
def home():
    return "Redis Distributed Simulation API"


@app.route("/write")
def write():
    if redis_primary:
        redis_primary.set("test_key", "hello")
        logging.info("Data written to primary node")
        return "Data written to primary"
    return "Primary Redis not available"


@app.route("/read-primary")
def read_primary():
    if redis_primary:
        value = redis_primary.get("test_key")
        logging.info(f"Read from primary: {value}")
        return jsonify({"primary": value})
    return "Primary Redis not available"


@app.route("/read-replica")
def read_replica():
    if redis_replica:
        value = redis_replica.get("test_key")
        logging.info(f"Read from replica: {value}")
        return jsonify({"replica": value})
    return "Replica Redis not available"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
