from flask import Flask, jsonify
from flask_cors import CORS
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
import redis
import logging
import os

app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Prometheus Metrics
REQUEST_COUNT = Counter('lab2_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REDIS_OPS = Counter('lab2_redis_operations_total', 'Redis operations', ['operation', 'node', 'status'])

# Redis Configuration
REDIS_PRIMARY_HOST = os.getenv("REDIS_PRIMARY_HOST", "localhost")
REDIS_PRIMARY_PORT = int(os.getenv("REDIS_PRIMARY_PORT", 6379))
REDIS_REPLICA_HOST = os.getenv("REDIS_REPLICA_HOST", "localhost")
REDIS_REPLICA_PORT = int(os.getenv("REDIS_REPLICA_PORT", 6380))

# Connect to Redis primary
try:
    redis_primary = redis.Redis(
        host=REDIS_PRIMARY_HOST, 
        port=REDIS_PRIMARY_PORT, 
        decode_responses=True,
        socket_timeout=5
    )
    redis_primary.ping()
    logging.info(f"Connected to Redis primary at {REDIS_PRIMARY_HOST}:{REDIS_PRIMARY_PORT}")
except Exception as e:
    redis_primary = None
    logging.warning(f"Failed to connect to Redis primary: {e}")

# Connect to Redis replica (optional)
try:
    redis_replica = redis.Redis(
        host=REDIS_REPLICA_HOST, 
        port=REDIS_REPLICA_PORT, 
        decode_responses=True,
        socket_timeout=5
    )
    redis_replica.ping()
    logging.info(f"Connected to Redis replica at {REDIS_REPLICA_HOST}:{REDIS_REPLICA_PORT}")
except Exception as e:
    redis_replica = None
    logging.warning(f"Failed to connect to Redis replica: {e}")


@app.route("/")
def home():
    REQUEST_COUNT.labels(method='GET', endpoint='/', status='200').inc()
    return jsonify({
        "service": "Redis Distributed Simulation API",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "endpoints": ["/write", "/read-primary", "/read-replica", "/health", "/metrics"]
    })


@app.route("/write")
def write():
    if redis_primary:
        try:
            redis_primary.set("test_key", "hello")
            REDIS_OPS.labels(operation='write', node='primary', status='success').inc()
            logging.info("Data written to primary node")
            REQUEST_COUNT.labels(method='GET', endpoint='/write', status='200').inc()
            return jsonify({"status": "success", "message": "Data written to primary"})
        except redis.RedisError as e:
            REDIS_OPS.labels(operation='write', node='primary', status='error').inc()
            logging.error(f"Write failed: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500
    REQUEST_COUNT.labels(method='GET', endpoint='/write', status='503').inc()
    return jsonify({"status": "unavailable", "message": "Primary Redis not available"}), 503


@app.route("/read-primary")
def read_primary():
    if redis_primary:
        try:
            value = redis_primary.get("test_key")
            REDIS_OPS.labels(operation='read', node='primary', status='success').inc()
            logging.info(f"Read from primary: {value}")
            REQUEST_COUNT.labels(method='GET', endpoint='/read-primary', status='200').inc()
            return jsonify({"node": "primary", "value": value})
        except redis.RedisError as e:
            REDIS_OPS.labels(operation='read', node='primary', status='error').inc()
            return jsonify({"status": "error", "message": str(e)}), 500
    REQUEST_COUNT.labels(method='GET', endpoint='/read-primary', status='503').inc()
    return jsonify({"status": "unavailable", "message": "Primary Redis not available"}), 503


@app.route("/read-replica")
def read_replica():
    if redis_replica:
        try:
            value = redis_replica.get("test_key")
            REDIS_OPS.labels(operation='read', node='replica', status='success').inc()
            logging.info(f"Read from replica: {value}")
            REQUEST_COUNT.labels(method='GET', endpoint='/read-replica', status='200').inc()
            return jsonify({"node": "replica", "value": value})
        except redis.RedisError as e:
            REDIS_OPS.labels(operation='read', node='replica', status='error').inc()
            return jsonify({"status": "error", "message": str(e)}), 500
    REQUEST_COUNT.labels(method='GET', endpoint='/read-replica', status='503').inc()
    return jsonify({"status": "unavailable", "message": "Replica Redis not available"}), 503


@app.route("/health")
def health():
    REQUEST_COUNT.labels(method='GET', endpoint='/health', status='200').inc()
    primary_status = "up" if redis_primary else "down"
    replica_status = "up" if redis_replica else "down"
    return jsonify({
        "service": "lab2-redis-api",
        "status": "healthy",
        "redis": {
            "primary": primary_status,
            "replica": replica_status
        },
        "version": os.getenv("APP_VERSION", "1.0.0")
    })


@app.route("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=PORT)
