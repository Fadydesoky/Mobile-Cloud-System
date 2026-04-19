import React, { useState } from "react";
import axios from "axios";
function App() {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [delay, setDelay] = useState(null);
  const [data, setData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("Idle");

  const runDemo = async () => {
    setLoading(true);
    setStatus("Running...");
    setLogs([]);
    setData([]);
    setDelay(null);


// API call function
export const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching data');
  }
};

// API call with retry logic
export const fetchDataWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchData(url);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};
    
    const start = performance.now();

    try {
      const res = await fetch("http://130.41.39.7:5002/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: 1, quantity: 2 }),
      });

      const result = await res.json();

      const end = performance.now();
      const latency = ((end - start) / 1000).toFixed(2);

      setDelay(latency);

      setData({
        product: result.product || "N/A",
        quantity: result.quantity || 0,
        total_price: result.total_price || 0,
      });

      setLogs([
        "[INFO] Request sent to Order Service",
        "[INFO] Order Service processing",
        "[INFO] Fetching from Product Service",
        "[INFO] Response received",
        "[SUCCESS] Order completed",
      ]);

      setStatus("Healthy");
    } catch (err) {
      setStatus("Failed");

      setLogs([
        "[ERROR] Service unavailable",
        "[ERROR] Product service down",
        "[INFO] Retry or recovery needed",
      ]);
    }

    setLoading(false);
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
        Real microservices demo (Frontend → Order Service → Product Service)
      </p>

      {/* Flow */}
      <div style={styles.flow}>
        📱 → ⚙️ → 🐳 → ☸️ → 🟥
      </div>

      {/* Run */}
      <button style={styles.runBtn} onClick={runDemo}>
        {loading ? "Running..." : "Run Simulation"}
      </button>

      {/* Status */}
      <div style={{ marginTop: 10 }}>
        <span style={{
          color:
            status === "Healthy"
              ? "limegreen"
              : status === "Running..."
              ? "orange"
              : status === "Failed"
              ? "red"
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
      { message: "Order API", latency: delay + "s" },
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
            <pre>
{data.product
  ? JSON.stringify(data, null, 2)
  : "No data"}
            </pre>
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
        Live backend connected — not simulated
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
  },
};

export default App;
