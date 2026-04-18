from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello from Lab 3"

@app.route("/health")
def health():
    return "ok"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
