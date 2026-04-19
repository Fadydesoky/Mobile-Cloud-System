import React, { useState } from "react";

function App() {
  const [dark, setDark] = useState(true);
  const [delay, setDelay] = useState(null);
  const [data, setData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Idle");

  const runDemo = () => {
    setStatus("Running...");
    setLogs([]);

    const newDelay = (Math.random() * 1.5).toFixed(2);
    const newData = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 100)
    );

    setTimeout(() => {
      setDelay(newDelay);
      setData(newData);
      setStatus("Healthy");

      setLogs([
        "[INFO] Request received from frontend",
        "[INFO] Processing in container...",
        "[INFO] Routed via Kubernetes service",
        "[INFO] Data retrieved from Redis (simulated)",
        "[SUCCESS] Response sent successfully",
      ]);
    }, 800);
  };

  const theme = {
    bg: dark ? "#0d1117" : "#f5f5f5",
    card: dark ? "#161b22" : "#ffffff",
    text: dark ? "#ffffff" : "#000000",
    sub: dark ? "#8b949e" : "#555",
  };

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text }}>
      {/* Header */}
      <div style={styles.header}>
        <h1>🚀 Mobile Cloud Dashboard</h1>
        <button onClick={() => setDark(!dark)} style={styles.toggle}>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <p style={{ color: theme.sub }}>
        Simulating a cloud-native architecture (Frontend → API → Docker → Kubernetes → Redis)
      </p>

      {/* System Flow */}
      <div style={styles.flow}>
        <span>📱 Frontend</span> → <span>⚙️ API</span> → <span>🐳 Docker</span> →{" "}
        <span>☸️ Kubernetes</span> → <span>🟥 Redis</span>
      </div>

      {/* Run Button */}
      <button style={styles.runBtn} onClick={runDemo}>
        ▶ Run Demo
      </button>

      {/* Status */}
      <div style={{ marginTop: 10 }}>
        <span style={{ color: status === "Healthy" ? "limegreen" : "orange" }}>
          ● {status}
        </span>
      </div>

      {/* Cards */}
      <div style={styles.cards}>
        {/* API */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>API Response</h3>
          <pre>
{delay
  ? JSON.stringify(
      {
        message: "Mobile Cloud API",
        delay: delay,
      },
      null,
      2
    )
  : "No data"}
          </pre>
        </div>

        {/* Data */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>Data</h3>
          <p>{data.length ? data.join(", ") : "No data"}</p>
        </div>

        {/* Logs */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>System Logs</h3>
          <div style={styles.logs}>
            {logs.length
              ? logs.map((log, i) => <p key={i}>{log}</p>)
              : "No logs"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 40, fontSize: 12, color: theme.sub }}>
        Simulated environment for demonstration purposes
      </p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Arial",
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  runBtn: {
    marginTop: 20,
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "none",
    background: "#238636",
    color: "white",
    cursor: "pointer",
  },
  flow: {
    marginTop: 20,
    fontSize: "18px",
    color: "#58a6ff",
  },
  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: 30,
    flexWrap: "wrap",
  },
  card: {
    width: "280px",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "left",
  },
  logs: {
    fontSize: "12px",
    color: "#58a6ff",
  },
};

export default App;
