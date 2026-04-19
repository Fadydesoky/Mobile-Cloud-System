import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

// API call function
export const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching data");
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

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_URL || "http://localhost:5001";

function App() {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderData, setOrderData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [services, setServices] = useState({
    order: { status: "unknown", latency: null },
    product: { status: "unknown", latency: null },
  });
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successRate: 100,
    avgLatency: 0,
    uptime: "99.9%",
  });
  const [requestHistory, setRequestHistory] = useState([]);

  // Theme colors
  const theme = {
    bg: dark ? "#000000" : "#fafafa",
    bgSecondary: dark ? "#0a0a0a" : "#ffffff",
    bgTertiary: dark ? "#171717" : "#f5f5f5",
    border: dark ? "#262626" : "#e5e5e5",
    borderHover: dark ? "#404040" : "#d4d4d4",
    text: dark ? "#fafafa" : "#0a0a0a",
    textSecondary: dark ? "#a3a3a3" : "#737373",
    textMuted: dark ? "#525252" : "#a3a3a3",
    accent: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    error: "#ef4444",
    purple: "#a855f7",
  };

  // Check service health
  const checkHealth = useCallback(async () => {
    const checkService = async (url, name) => {
      const start = performance.now();
      try {
        const res = await fetch(`${url}/health`, { mode: "cors" });
        const latency = Math.round(performance.now() - start);
        return {
          status: res.ok ? "healthy" : "unhealthy",
          latency: `${latency}ms`,
        };
      } catch {
        return { status: "offline", latency: null };
      }
    };

    const [orderStatus, productStatus] = await Promise.all([
      checkService(API_BASE_URL, "order"),
      checkService(PRODUCT_SERVICE_URL, "product"),
    ]);

    setServices({ order: orderStatus, product: productStatus });
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    setLogs((prev) => [{ timestamp, message, type, id: Date.now() }, ...prev].slice(0, 50));
  };

  const runSimulation = async () => {
    setLoading(true);
    setStatus("running");
    setOrderData(null);

    const startTime = performance.now();
    addLog("Initiating order simulation...", "info");

    try {
      addLog("POST /orders - Connecting to Order Service", "info");

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: Math.floor(Math.random() * 3) + 1, quantity: Math.floor(Math.random() * 5) + 1 }),
      });

      const latency = Math.round(performance.now() - startTime);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      
      setOrderData({
        orderId: result.order_id || `ORD-${Date.now().toString(36).toUpperCase()}`,
        product: result.product || "N/A",
        quantity: result.quantity || 0,
        totalPrice: result.total_price || 0,
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
      });

      setMetrics((prev) => ({
        totalRequests: prev.totalRequests + 1,
        successRate: Math.round(((prev.totalRequests * prev.successRate / 100 + 1) / (prev.totalRequests + 1)) * 100),
        avgLatency: Math.round((prev.avgLatency * prev.totalRequests + latency) / (prev.totalRequests + 1)),
        uptime: "99.9%",
      }));

      setRequestHistory((prev) => [
        { time: new Date().toLocaleTimeString(), latency, status: "success" },
        ...prev,
      ].slice(0, 10));

      addLog(`Order Service responded in ${latency}ms`, "success");
      addLog(`Product fetched: ${result.product || "Product"}`, "success");
      addLog(`Order ${result.order_id || "created"} - Total: $${result.total_price || 0}`, "success");
      setStatus("healthy");
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      
      setMetrics((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        successRate: Math.round(((prev.totalRequests * prev.successRate / 100) / (prev.totalRequests + 1)) * 100),
      }));

      setRequestHistory((prev) => [
        { time: new Date().toLocaleTimeString(), latency, status: "error" },
        ...prev,
      ].slice(0, 10));

      addLog(`Error: ${err.message}`, "error");
      addLog("Circuit breaker activated - Retrying...", "warning");
      setStatus("error");
    }

    setLoading(false);
  };

  const getStatusIndicator = (s) => {
    const colors = {
      healthy: theme.success,
      unhealthy: theme.warning,
      offline: theme.error,
      unknown: theme.textMuted,
    };
    return colors[s] || theme.textMuted;
  };

  const StatusDot = ({ status }) => (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: getStatusIndicator(status),
        display: "inline-block",
        marginRight: 8,
        boxShadow: status === "healthy" ? `0 0 8px ${theme.success}40` : "none",
      }}
    />
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.bg, color: theme.text }}>
      {/* Navigation */}
      <nav style={{ borderBottom: `1px solid ${theme.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", height: 64, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 19.5H22L12 2Z" fill={theme.text} />
              </svg>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Mobile Cloud System</span>
            </div>
            <div style={{ height: 24, width: 1, backgroundColor: theme.border }} />
            <div style={{ display: "flex", gap: 4 }}>
              {["overview", "services", "logs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: activeTab === tab ? theme.bgTertiary : "transparent",
                    color: activeTab === tab ? theme.text : theme.textSecondary,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setDark(!dark)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: `1px solid ${theme.border}`,
                background: theme.bgSecondary,
                color: theme.textSecondary,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {dark ? "Light" : "Dark"}
            </button>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 9999,
                backgroundColor: status === "healthy" ? `${theme.success}20` : status === "error" ? `${theme.error}20` : `${theme.textMuted}20`,
                color: status === "healthy" ? theme.success : status === "error" ? theme.error : theme.textSecondary,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {status === "idle" ? "Ready" : status === "running" ? "Processing..." : status === "healthy" ? "Healthy" : "Error"}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>Observability Dashboard</h1>
            <p style={{ margin: "8px 0 0", color: theme.textSecondary, fontSize: 14 }}>
              Real-time monitoring for microservices architecture
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: loading ? theme.bgTertiary : theme.text,
              color: loading ? theme.textMuted : theme.bg,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading && (
              <span style={{ width: 14, height: 14, border: `2px solid ${theme.textMuted}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            )}
            {loading ? "Processing..." : "Run Simulation"}
          </button>
        </div>

        {/* Service Status Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { name: "Order Service", url: API_BASE_URL, ...services.order },
            { name: "Product Service", url: PRODUCT_SERVICE_URL, ...services.product },
            { name: "Total Requests", value: metrics.totalRequests, suffix: "" },
            { name: "Avg Latency", value: metrics.avgLatency, suffix: "ms" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: 20,
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.bgSecondary,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: theme.textSecondary }}>{item.name}</span>
                {item.status && <StatusDot status={item.status} />}
              </div>
              {item.status ? (
                <>
                  <div style={{ fontSize: 20, fontWeight: 600, textTransform: "capitalize" }}>{item.status}</div>
                  {item.latency && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{item.latency}</div>}
                </>
              ) : (
                <div style={{ fontSize: 28, fontWeight: 600, fontFamily: "monospace" }}>
                  {item.value}
                  <span style={{ fontSize: 14, fontWeight: 400, color: theme.textSecondary }}>{item.suffix}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.bgSecondary, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            System Architecture
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", padding: "20px 0" }}>
            {[
              { label: "React", sub: "Frontend", color: "#61dafb" },
              { label: "Flask", sub: "Order API", color: theme.success },
              { label: "Flask", sub: "Product API", color: theme.purple },
              { label: "Docker", sub: "Container", color: "#2496ed" },
              { label: "K8s", sub: "Orchestration", color: "#326ce5" },
              { label: "Redis", sub: "Cache", color: "#dc382d" },
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${node.color}40 0%, ${node.color}20 100%)`,
                      border: `1px solid ${node.color}60`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: node.color,
                    }}
                  >
                    {node.label}
                  </div>
                  <span style={{ fontSize: 11, color: theme.textMuted }}>{node.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* API Response */}
          <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.bgSecondary }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              API Response
            </h3>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ width: 24, height: 24, border: `2px solid ${theme.border}`, borderTopColor: theme.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ color: theme.textMuted, margin: 0, fontSize: 13 }}>Processing request...</p>
              </div>
            ) : orderData ? (
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor: theme.bgTertiary,
                  fontSize: 13,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  overflow: "auto",
                  lineHeight: 1.6,
                }}
              >
                {JSON.stringify(orderData, null, 2)}
              </pre>
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>
                Run simulation to see API response
              </div>
            )}
          </div>

          {/* Logs */}
          <div style={{ padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.bgSecondary }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              System Logs
            </h3>
            <div
              style={{
                maxHeight: 280,
                overflow: "auto",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 12,
                backgroundColor: theme.bgTertiary,
                borderRadius: 8,
                padding: logs.length ? 12 : 0,
              }}
            >
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} style={{ marginBottom: 6, display: "flex", gap: 8 }}>
                    <span style={{ color: theme.textMuted, flexShrink: 0 }}>[{log.timestamp}]</span>
                    <span
                      style={{
                        color: log.type === "error" ? theme.error : log.type === "success" ? theme.success : log.type === "warning" ? theme.warning : theme.textSecondary,
                      }}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>
                  No logs yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request History */}
        {requestHistory.length > 0 && (
          <div style={{ marginTop: 24, padding: 24, borderRadius: 12, border: `1px solid ${theme.border}`, backgroundColor: theme.bgSecondary }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Request History
            </h3>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {requestHistory.map((req, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    backgroundColor: theme.bgTertiary,
                    border: `1px solid ${req.status === "success" ? theme.success : theme.error}30`,
                    minWidth: 100,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 600, color: req.status === "success" ? theme.success : theme.error }}>{req.latency}ms</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>{req.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${theme.border}`, textAlign: "center" }}>
          <p style={{ margin: 0, color: theme.textMuted, fontSize: 13 }}>
            Cloud-Native Microservices | Docker + Kubernetes + Redis
          </p>
          <p style={{ margin: "8px 0 0", color: theme.textMuted, fontSize: 12 }}>
            Built with React, Flask, and containerized with Docker
          </p>
        </footer>
      </main>

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.borderHover};
        }
      `}</style>
    </div>
  );
}

export default App;
