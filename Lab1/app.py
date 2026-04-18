from flask import Flask
import time
import random

app = Flask(__name__)

@app.route("/")
def home():
    delay = random.uniform(0.1, 1.5)
    time.sleep(delay)
    return f"Response after {delay:.2f} seconds"

@app.route("/health")
def health():
    return "ok"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
