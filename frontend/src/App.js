import React, { useState } from "react";
import "./App.css";

function App() {
  const [api, setApi] = useState(null);
  const [data, setData] = useState([]);
  const [health, setHealth] = useState("");

  const runDemo = () => {
    setApi({
      message: "Mobile Cloud API",
      delay: (Math.random() * 1.5).toFixed(2),
    });

    setData(
      Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 100)
      )
    );

    setHealth("OK");
  };

  return (
    <div style={styles.container}>
      <h1>Mobile Cloud System Dashboard</h1>
      <p style={{ color: "#aaa" }}>
        Simulating a cloud-native architecture
      </p>

      <button style={styles.button} onClick={runDemo}>
        🚀 Run Demo
      </button>

      <div style={styles.flow}>
        Frontend → API → Docker → Kubernetes → Redis
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>API Response</h3>
          <pre>{api ? JSON.stringify(api, null, 2) : "No data"}</pre>
        </div>

        <div style={styles.card}>
          <h3>Data</h3>
          <p>{data.length ? data.join(", ") : "No data"}</p>
        </div>

        <div style={styles.card}>
          <h3>Health</h3>
          <p>{health || "No data"}</p>
        </div>
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: "#888" }}>
        Simulated environment for demonstration purposes
      </p>
    </div>
  );
}

const styles = {
  container: {
    background: "#0d1117",
    color: "white",
    minHeight: "100vh",
    textAlign: "center",
    padding: "40px",
    fontFamily: "Arial",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    margin: "20px 0",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    background: "#238636",
    color: "white",
  },
  flow: {
    margin: "20px 0",
    color: "#58a6ff",
  },
  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    background: "#161b22",
    padding: "20px",
    borderRadius: "10px",
    width: "250px",
  },
};

export default App;
