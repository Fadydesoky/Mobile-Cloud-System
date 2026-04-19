from flask import Flask, request, jsonify
import redis
import os

app = Flask(__name__)

# ============================
# Redis Config
# ============================
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

REDIS_REPLICA_HOST = os.getenv("REDIS_REPLICA_HOST", "localhost")
REDIS_REPLICA_PORT = int(os.getenv("REDIS_REPLICA_PORT", 6380))


def connect_redis(host, port):
    try:
        r = redis.Redis(host=host, port=port, decode_responses=True)
        r.ping()
        return r
    except Exception:
        return None


redis_primary = connect_redis(REDIS_HOST, REDIS_PORT)
redis_replica = connect_redis(REDIS_REPLICA_HOST, REDIS_REPLICA_PORT)

# ============================
# Routes
# ============================

@app.route("/")
def home():
    return jsonify({"message": "Lab2 Redis API"})


@app.route("/write", methods=["POST"])
def write():
    key = request.json.get("key")
    value = request.json.get("value")

    if not key or not value:
        return jsonify({"error": "key and value required"}), 400

    if redis_primary:
        redis_primary.set(key, value)
        return jsonify({"status": "written", "key": key, "value": value})

    return jsonify({"error": "Primary unavailable"}), 503


@app.route("/read")
def read():
    key = request.args.get("key", "test")

    if redis_primary:
        value = redis_primary.get(key)
        return jsonify({
            "source": "primary",
            "key": key,
            "value": value
        })

    return jsonify({"error": "Primary unavailable"}), 503


@app.route("/read-replica")
def read_replica():
    key = request.args.get("key", "test")

    if redis_replica:
        value = redis_replica.get(key)
        return jsonify({
            "source": "replica",
            "key": key,
            "value": value,
            "note": "eventual consistency"
        })

    return jsonify({"error": "Replica unavailable"}), 503


@app.route("/health")
def health():
    return "ok", 200


@app.route("/status")
def status():
    def check(r):
        try:
            r.ping()
            return "healthy"
        except:
            return "down"

    return jsonify({
        "primary": check(redis_primary) if redis_primary else "missing",
        "replica": check(redis_replica) if redis_replica else "missing"
    })


# ============================
# Run
# ============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
