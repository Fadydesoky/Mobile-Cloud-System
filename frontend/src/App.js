import React, { useState } from "react";

function App() {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [delay, setDelay] = useState(null);
  const [data, setData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Idle");

  const runDemo = () => {
    setLoading(true);
    setStatus("Running...");
    setLogs([]);
    setDelay(null);
    setData([]);

    setTimeout(() => {
      const newDelay = (Math.random() * 1.5).toFixed(2);
      const newData = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 100)
      );

      setDelay(newDelay);
      setData(newData);
      setStatus("Healthy");

      setLogs([
        "[INFO] Request received",
        "[INFO] Processing in container",
        "[INFO] Routed via Kubernetes",
        "[INFO] Redis accessed",
        "[SUCCESS] Response sent",
      ]);

      setLoading(false);
    }, 1000);
  };

  const theme = {
    bg: dark ? "#0d1117" : "#f3f4f6",
    card: dark ? "#161b22" : "#ffffff",
    text: dark ? "#ffffff" : "#111",
    sub: dark ? "#8b949e" : "#555",
  };

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text }}>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>🚀 Mobile Cloud Dashboard</h1>
        <button onClick={() => setDark(!dark)} style={styles.toggle}>
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      <p style={{ color: theme.sub }}>
        Cloud-native simulation (Frontend → API → Docker → K8s → Redis)
      </p>

      {/* Flow */}
      <div style={styles.flow}>
        📱 → ⚙️ → 🐳 → ☸️ → 🟥
      </div>

      {/* Run */}
      <button style={styles.runBtn} onClick={runDemo}>
        {loading ? "Running..." : "Run Demo"}
      </button>

      {/* Status */}
      <div style={{ marginTop: 10 }}>
        <span style={{
          color:
            status === "Healthy"
              ? "limegreen"
              : status === "Running..."
              ? "orange"
              : "gray",
        }}>
          ● {status}
        </span>
      </div>

      {/* Cards */}
      <div style={styles.cards}>
        
        {/* API */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>API</h3>

          {loading ? (
            <div style={styles.skeleton} />
          ) : (
            <pre>
{delay
  ? JSON.stringify(
      { message: "Mobile Cloud API", delay },
      null,
      2
    )
  : "No data"}
            </pre>
          )}
        </div>

        {/* Data */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>Data</h3>

          {loading ? (
            <div style={styles.skeleton} />
          ) : (
            <p>{data.length ? data.join(", ") : "No data"}</p>
          )}
        </div>

        {/* Logs */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>Logs</h3>

          {loading ? (
            <div style={styles.skeleton} />
          ) : (
            <div style={styles.logs}>
              {logs.length
                ? logs.map((l, i) => <p key={i}>{l}</p>)
                : "No logs"}
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: theme.sub }}>
        Demo environment — backend simulated
      </p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "system-ui",
    textAlign: "center",
    transition: "0.3s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  runBtn: {
    marginTop: 20,
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#238636",
    color: "white",
    cursor: "pointer",
    transition: "0.2s",
  },
  flow: {
    marginTop: 20,
    fontSize: "22px",
  },
  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: 30,
    flexWrap: "wrap",
  },
  card: {
    width: "260px",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "left",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  logs: {
    fontSize: "12px",
    color: "#58a6ff",
  },
  skeleton: {
    height: "60px",
    background: "linear-gradient(90deg,#333,#555,#333)",
    borderRadius: "8px",
    animation: "pulse 1.2s infinite",
  },
};

export default App;
