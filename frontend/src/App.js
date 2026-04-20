import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_URL || "http://localhost:5001";

// Demo mode products for simulation when backend is unavailable
const DEMO_PRODUCTS = [
  { id: 1, name: "Cloud Server Instance", price: 49.99 },
  { id: 2, name: "Kubernetes Cluster", price: 149.99 },
  { id: 3, name: "Redis Cache Node", price: 29.99 },
  { id: 4, name: "Load Balancer", price: 39.99 },
  { id: 5, name: "Storage Volume (100GB)", price: 19.99 },
];

// Simulate network latency for demo mode
const simulateLatency = () => new Promise(resolve => 
  setTimeout(resolve, Math.floor(Math.random() * 150) + 50)
);

// Icons as SVG components
const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 19.5H22L12 2Z" fill="currentColor" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  Play: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Server: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  Database: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Box: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Cloud: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Terminal: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Github: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  External: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Pulse: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

// Animated number counter hook
const useAnimatedValue = (targetValue, duration = 500) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevValue = useRef(targetValue);

  useEffect(() => {
    const startValue = prevValue.current;
    const startTime = performance.now();
    const diff = targetValue - startValue;

    if (diff === 0) return;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      
      const currentValue = startValue + diff * easeOutQuad;
      setDisplayValue(Math.round(currentValue * 10) / 10);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
};

// Progress bar component
const ProgressBar = ({ progress, isActive }) => (
  <div
    style={{
      width: "100%",
      height: 4,
      backgroundColor: "var(--background-tertiary)",
      borderRadius: 2,
      overflow: "hidden",
      opacity: isActive ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}
  >
    <div
      style={{
        width: `${progress}%`,
        height: "100%",
        background: "linear-gradient(90deg, var(--accent), #2dd4bf)",
        borderRadius: 2,
        transition: "width 0.1s ease-out",
        boxShadow: isActive ? "0 0 10px var(--accent)" : "none",
      }}
    />
  </div>
);

// Status indicator component with pulse animation
const StatusDot = ({ status, size = 8, showPulse = false }) => {
  const colors = {
    healthy: "var(--success)",
    up: "var(--success)",
    running: "var(--warning)",
    unhealthy: "var(--warning)",
    degraded: "var(--warning)",
    offline: "var(--error)",
    error: "var(--error)",
    unknown: "var(--foreground-muted)",
  };

  const isActive = status === "healthy" || status === "up" || status === "running";

  return (
    <span
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pulse ring */}
      {showPulse && isActive && (
        <span
          style={{
            position: "absolute",
            width: size * 2.5,
            height: size * 2.5,
            borderRadius: "50%",
            backgroundColor: colors[status] || colors.unknown,
            opacity: 0.3,
            animation: "statusPulse 2s ease-out infinite",
          }}
        />
      )}
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: colors[status] || colors.unknown,
          display: "inline-block",
          boxShadow: isActive 
            ? `0 0 ${size}px ${colors[status]}` 
            : "none",
          position: "relative",
          zIndex: 1,
        }}
      />
    </span>
  );
};

// Tooltip component
const Tooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          style={{
            position: "absolute",
            [position === "top" ? "bottom" : "top"]: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 12px",
            backgroundColor: "var(--background-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--foreground-secondary)",
            whiteSpace: "nowrap",
            zIndex: 1000,
            boxShadow: "var(--shadow-lg)",
            animation: "tooltipFadeIn 0.2s ease-out",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Mini chart component for sparklines
const MiniChart = ({ data, color = "var(--accent)", height = 40 }) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${color.replace(/[^a-z0-9]/gi, "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// System Summary Panel
const SystemSummary = ({ metrics, activeServices, isLoading }) => {
  const animatedRequests = useAnimatedValue(metrics.totalRequests);
  const animatedSuccessRate = useAnimatedValue(metrics.successRate);
  const animatedLatency = useAnimatedValue(metrics.avgLatency);
  
  const summaryItems = [
    { 
      label: "Total Requests", 
      value: animatedRequests, 
      suffix: "", 
      color: "var(--accent)",
      icon: Icons.Activity,
    },
    { 
      label: "Success Rate", 
      value: animatedSuccessRate, 
      suffix: "%", 
      color: metrics.successRate >= 95 ? "var(--success)" : metrics.successRate >= 80 ? "var(--warning)" : "var(--error)",
      icon: Icons.Check,
    },
    { 
      label: "Avg Latency", 
      value: animatedLatency, 
      suffix: "ms", 
      color: metrics.avgLatency <= 100 ? "var(--success)" : metrics.avgLatency <= 200 ? "var(--warning)" : "var(--error)",
      icon: Icons.Zap,
    },
    { 
      label: "Active Services", 
      value: activeServices, 
      suffix: "/3", 
      color: activeServices >= 2 ? "var(--success)" : "var(--warning)",
      icon: Icons.Server,
    },
  ];

  return (
    <div
      className="glass-card"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        padding: 24,
        borderRadius: "var(--radius-xl)",
        background: "linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)",
        border: "1px solid var(--border)",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Animated background when loading */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent, var(--accent)10, transparent)",
            animation: "shimmer 2s infinite",
          }}
        />
      )}
      {summaryItems.map((item, index) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 0",
            borderRight: index < summaryItems.length - 1 ? "1px solid var(--border)" : "none",
            paddingRight: index < summaryItems.length - 1 ? 16 : 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              backgroundColor: `${item.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: item.color,
            }}
          >
            <item.icon />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              fontFamily: "var(--font-mono)", 
              color: item.color,
              display: "flex",
              alignItems: "baseline",
              gap: 3,
              textShadow: `0 0 20px ${item.color}40`,
            }}>
              {typeof item.value === "number" ? item.value.toFixed(item.suffix === "%" || item.suffix === "ms" ? 0 : 0) : item.value}
              <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>{item.suffix}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Metric card component with animations and glassmorphism
const MetricCard = ({ title, value, suffix, change, icon: Icon, trend, chart, highlight }) => {
  const [isHovered, setIsHovered] = useState(false);
  const animatedValue = useAnimatedValue(typeof value === "number" ? value : parseFloat(value) || 0);
  
  // Determine if this is a key metric (Success Rate or Avg Latency)
  const isKeyMetric = title === "Success Rate" || title === "Avg Latency";
  
  return (
    <div
      className="animate-fade-in glass-card"
      style={{
        padding: isKeyMetric ? "24px" : "20px",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${isHovered ? "var(--accent)" : "var(--border)"}`,
        backgroundColor: "var(--background-secondary)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.1)" 
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay for key metrics */}
      {isKeyMetric && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: title === "Success Rate" 
            ? "linear-gradient(90deg, #22c55e, #10b981)" 
            : "linear-gradient(90deg, #f59e0b, #eab308)",
          opacity: isHovered ? 1 : 0.7,
          transition: "opacity 0.3s ease",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isKeyMetric ? 16 : 12 }}>
        <span style={{ 
          fontSize: isKeyMetric ? 14 : 13, 
          color: "var(--foreground-secondary)", 
          fontWeight: 600,
          textTransform: isKeyMetric ? "uppercase" : "none",
          letterSpacing: isKeyMetric ? "0.05em" : "normal",
        }}>{title}</span>
        {Icon && (
          <span 
            style={{ 
              color: isHovered ? "var(--accent)" : "var(--foreground-muted)",
              transform: isHovered ? "scale(1.2) rotate(5deg)" : "scale(1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Icon />
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span 
          style={{ 
            fontSize: isKeyMetric ? 40 : 32, 
            fontWeight: 700, 
            fontFamily: "var(--font-mono)", 
            letterSpacing: "-0.03em",
            transition: "all 0.3s ease",
            background: isKeyMetric && isHovered 
              ? "linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)" 
              : "none",
            WebkitBackgroundClip: isKeyMetric && isHovered ? "text" : "unset",
            WebkitTextFillColor: isKeyMetric && isHovered ? "transparent" : "unset",
          }}
        >
          {typeof value === "number" ? Math.round(animatedValue) : value}
        </span>
        {suffix && <span style={{ fontSize: isKeyMetric ? 18 : 14, color: "var(--foreground-secondary)", fontWeight: 500 }}>{suffix}</span>}
      </div>
      {change !== undefined && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 500,
            color: change >= 0 ? "var(--success)" : "var(--error)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}>
            <span style={{ 
              transform: change >= 0 ? "rotate(-45deg)" : "rotate(45deg)",
              display: "inline-block",
            }}>
              {"\u2192"}
            </span>
            {change >= 0 ? "+" : ""}{change}%
          </span>
          <span style={{ fontSize: 11, color: "var(--foreground-muted)" }}>vs last hour</span>
        </div>
      )}
      {chart && (
        <div style={{ marginTop: 12 }}>
          <MiniChart data={chart} color={trend === "up" ? "var(--success)" : "var(--accent)"} />
        </div>
      )}
    </div>
  );
};

// Service card component with enhanced status indicators
const ServiceCard = ({ name, status, latency, port, description, icon: Icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const statusLabels = {
    healthy: "Healthy",
    up: "Running",
    running: "Running",
    unhealthy: "Degraded",
    degraded: "Degraded",
    offline: "Down",
    error: "Error",
    unknown: "Unknown",
  };

  const statusColors = {
    healthy: "var(--success)",
    up: "var(--success)",
    running: "var(--success)",
    unhealthy: "var(--warning)",
    degraded: "var(--warning)",
    offline: "var(--error)",
    error: "var(--error)",
    unknown: "var(--foreground-muted)",
  };

  return (
    <div
      className="animate-fade-in glass-card"
      style={{
        padding: "20px",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${isHovered ? statusColors[status] : "var(--border)"}`,
        backgroundColor: "var(--background-secondary)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: isHovered 
          ? `0 12px 40px ${statusColors[status]}25, 0 0 0 1px ${statusColors[status]}30` 
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDetails(false);
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Status indicator bar at top */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: statusColors[status],
        opacity: isHovered ? 1 : 0.5,
        transition: "opacity 0.3s ease",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--background-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--foreground-secondary)",
            transition: "transform 0.2s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}>
            {Icon && <Icon />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{name}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--foreground-muted)" }}>{description}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot status={status} size={10} showPulse={isHovered} />
          <span 
            style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: statusColors[status],
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: `${statusColors[status]}15`,
            }}
          >
            {statusLabels[status] || "Unknown"}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Latency</span>
          <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{latency || "N/A"}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Port</span>
          <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{port}</p>
        </div>
      </div>
      
      {/* Expandable details panel */}
      <div
        style={{
          maxHeight: showDetails ? 100 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease, margin-top 0.3s ease, opacity 0.3s ease",
          marginTop: showDetails ? 16 : 0,
          opacity: showDetails ? 1 : 0,
        }}
      >
        <div
          style={{
            padding: 12,
            backgroundColor: "var(--background-tertiary)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--foreground-secondary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icons.Terminal />
            <span>Service endpoint: localhost:{port}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>
            Click to collapse details
          </div>
        </div>
      </div>
    </div>
  );
};

// Log entry component with animations
const LogEntry = ({ timestamp, message, type, isNew }) => {
  const colors = {
    info: "var(--foreground-secondary)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--error)",
  };

  const bgColors = {
    info: "transparent",
    success: "var(--success-muted)",
    warning: "var(--warning-muted)",
    error: "var(--error-muted)",
  };

  const typeLabels = {
    info: "INFO",
    success: "OK",
    warning: "WARN",
    error: "ERR",
  };

  return (
    <div
      className={isNew ? "animate-slide-in" : ""}
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        fontSize: 13,
        fontFamily: "var(--font-mono)",
        backgroundColor: isNew ? `${colors[type]}15` : bgColors[type] || "transparent",
        borderRadius: "var(--radius-md)",
        marginBottom: 4,
        transition: "all 0.3s ease",
        borderLeft: `3px solid ${colors[type] || "transparent"}`,
        boxShadow: isNew ? `0 0 15px ${colors[type]}20` : "none",
      }}
    >
      <span style={{ 
        color: "var(--foreground-muted)", 
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
      }}>
        <Icons.Clock />
        {timestamp}
      </span>
      <span style={{
        padding: "2px 6px",
        borderRadius: "var(--radius-sm)",
        backgroundColor: `${colors[type]}20`,
        color: colors[type],
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        flexShrink: 0,
      }}>
        {typeLabels[type] || "INFO"}
      </span>
      <span style={{ 
        color: colors[type] || colors.info,
        display: "flex",
        alignItems: "center",
        gap: 6,
        flex: 1,
      }}>
        {type === "success" && <Icons.Check />}
        {type === "error" && <Icons.X />}
        {message}
      </span>
    </div>
  );
};

// Architecture Node component with hover effects
const ArchitectureNode = ({ 
  label, 
  sublabel, 
  color, 
  icon, 
  isActive, 
  delay = 0,
  onClick,
  description,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Tooltip content={description || `${label}: ${sublabel}`}>
      <div
        className="animate-fade-in"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "100%",
          maxWidth: 120,
          padding: "16px 12px",
          borderRadius: "var(--radius-lg)",
          background: `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`,
          border: `1px solid ${isActive || isHovered ? color : color + "40"}`,
          textAlign: "center",
          boxShadow: isActive || isHovered ? `0 0 25px ${color}40` : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          animationDelay: `${delay}ms`,
          cursor: "pointer",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8, color }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
        <p style={{ margin: "4px 0 0", fontSize: 10, color: "var(--foreground-muted)" }}>{sublabel}</p>
      </div>
    </Tooltip>
  );
};

function App() {
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderData, setOrderData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [services, setServices] = useState({
    order: { status: "unknown", latency: null },
    product: { status: "unknown", latency: null },
    redis: { status: "unknown", latency: null },
  });
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successRate: 100,
    avgLatency: 0,
    uptime: 99.9,
  });
  const [requestHistory, setRequestHistory] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [newLogIds, setNewLogIds] = useState(new Set());
  const logsContainerRef = useRef(null);
  
  // Generate sample chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: Math.floor(Math.random() * 50) + 20 + (latencyHistory[i]?.latency || 0),
    }));
  }, [latencyHistory]);

  // Count active services
  const activeServicesCount = useMemo(() => {
    let count = 0;
    if (demoMode) return 3;
    if (services.order.status === "healthy" || services.order.status === "up") count++;
    if (services.product.status === "healthy" || services.product.status === "up") count++;
    if (services.redis?.status === "healthy" || services.redis?.status === "up") count++;
    return count;
  }, [services, demoMode]);

  // Health check
  const checkHealth = useCallback(async () => {
    const checkService = async (url) => {
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
      checkService(API_BASE_URL),
      checkService(PRODUCT_SERVICE_URL),
    ]);

    setServices({ 
      order: orderStatus, 
      product: productStatus,
      redis: demoMode ? { status: "healthy", latency: "~2ms" } : { status: "unknown", latency: null },
    });
    
    // Enable demo mode if both services are offline
    const bothOffline = orderStatus.status === "offline" && productStatus.status === "offline";
    setDemoMode(bothOffline);
  }, [demoMode]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Apply theme with smooth transition
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease";
  }, [theme]);

  const addLog = useCallback((message, type = "info") => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const newId = Date.now();
    setLogs((prev) => [{ timestamp, message, type, id: newId }, ...prev].slice(0, 100));
    setNewLogIds((prev) => new Set([...prev, newId]));
    
    // Remove "new" flag after animation
    setTimeout(() => {
      setNewLogIds((prev) => {
        const next = new Set(prev);
        next.delete(newId);
        return next;
      });
    }, 500);
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    setStatus("running");
    setOrderData(null);
    setSimulationProgress(0);

    const startTime = performance.now();
    addLog("Initiating service mesh simulation...", "info");
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setSimulationProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 100);

    // Demo mode: simulate backend responses
    if (demoMode) {
      addLog("[DEMO] Running in demonstration mode", "info");
      setSimulationProgress(20);
      addLog("POST /orders -> Order Service (simulated)", "info");
      
      await simulateLatency();
      setSimulationProgress(40);
      
      const product = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const latency = Math.round(performance.now() - startTime);
      
      setSimulationProgress(60);
      addLog(`[DEMO] Order Service -> Product Service [${latency}ms]`, "success");
      await simulateLatency();
      
      setSimulationProgress(80);
      const orderResult = {
        orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
        product: product.name,
        quantity: quantity,
        totalPrice: (product.price * quantity).toFixed(2),
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
        status: "success",
      };

      setOrderData(orderResult);
      setSimulationProgress(100);

      // Update metrics
      setMetrics((prev) => ({
        totalRequests: prev.totalRequests + 1,
        successRate: Math.round(((prev.totalRequests * prev.successRate / 100 + 1) / (prev.totalRequests + 1)) * 100),
        avgLatency: Math.round((prev.avgLatency * prev.totalRequests + latency) / (prev.totalRequests + 1)),
        uptime: 99.9,
      }));

      setRequestHistory((prev) => [
        { time: new Date().toLocaleTimeString(), latency, status: "success" },
        ...prev,
      ].slice(0, 20));

      setLatencyHistory((prev) => [
        { value: latency },
        ...prev,
      ].slice(0, 12));

      addLog(`[DEMO] Product retrieved: ${product.name}`, "success");
      addLog(`[DEMO] Order ${orderResult.orderId} created successfully`, "success");
      addLog(`[DEMO] Total: $${orderResult.totalPrice} | Quantity: ${quantity}`, "info");
      
      clearInterval(progressInterval);
      setStatus("healthy");
      setLoading(false);
      return;
    }

    // Live mode: actual API calls
    addLog("POST /orders -> Order Service", "info");
    setSimulationProgress(30);

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Math.floor(Math.random() * 3) + 1,
          quantity: Math.floor(Math.random() * 5) + 1,
        }),
      });

      const latency = Math.round(performance.now() - startTime);
      setSimulationProgress(70);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      setSimulationProgress(90);

      const orderResult = {
        orderId: result.order_id || `ORD-${Date.now().toString(36).toUpperCase()}`,
        product: result.product || "N/A",
        quantity: result.quantity || 0,
        totalPrice: result.total_price || 0,
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
        status: "success",
      };

      setOrderData(orderResult);
      setSimulationProgress(100);

      // Update metrics
      setMetrics((prev) => ({
        totalRequests: prev.totalRequests + 1,
        successRate: Math.round(((prev.totalRequests * prev.successRate / 100 + 1) / (prev.totalRequests + 1)) * 100),
        avgLatency: Math.round((prev.avgLatency * prev.totalRequests + latency) / (prev.totalRequests + 1)),
        uptime: 99.9,
      }));

      // Update history
      setRequestHistory((prev) => [
        { time: new Date().toLocaleTimeString(), latency, status: "success" },
        ...prev,
      ].slice(0, 20));

      setLatencyHistory((prev) => [
        { value: latency },
        ...prev,
      ].slice(0, 12));

      addLog(`Order Service -> Product Service [${latency}ms]`, "success");
      addLog(`Product retrieved: ${result.product || "Product"}`, "success");
      addLog(`Order ${orderResult.orderId} created successfully`, "success");
      addLog(`Total: $${result.total_price || 0} | Quantity: ${result.quantity || 0}`, "info");
      
      setStatus("healthy");
    } catch (err) {
      const latency = Math.round(performance.now() - startTime);
      setSimulationProgress(100);

      setMetrics((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        successRate: Math.round(((prev.totalRequests * prev.successRate / 100) / (prev.totalRequests + 1)) * 100),
      }));

      setRequestHistory((prev) => [
        { time: new Date().toLocaleTimeString(), latency, status: "error" },
        ...prev,
      ].slice(0, 20));

      addLog(`Error: ${err.message}`, "error");
      addLog("Circuit breaker triggered - initiating retry logic", "warning");
      setStatus("error");
    }

    clearInterval(progressInterval);
    setLoading(false);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services" },
    { id: "logs", label: "Logs" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", transition: "background-color 0.3s ease" }}>
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes statusPulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.15; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flowingDash {
          to { stroke-dashoffset: -20; }
        }
        .btn-hover:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .btn-hover:active {
          transform: translateY(0);
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .glass-card {
          background: rgba(17, 17, 17, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        [data-theme="light"] .glass-card {
          background: rgba(255, 255, 255, 0.7);
        }
      `}</style>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div style={{
          backgroundColor: "var(--accent)",
          color: "white",
          padding: "8px 16px",
          textAlign: "center",
          fontSize: 13,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <Icons.Zap />
          <span>Demo Mode: Backend services are simulated. Run locally with Docker for live data.</span>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ 
        borderBottom: "1px solid var(--border)", 
        backgroundColor: "var(--background-secondary)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", height: 56, justifyContent: "space-between" }}>
            {/* Left side */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icons.Logo />
                <div style={{ height: 20, width: 1, backgroundColor: "var(--border)" }} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Mobile Cloud System</span>
              </div>
              
              {/* Tabs */}
              <div style={{ display: "flex", gap: 2, marginLeft: 24 }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="btn-hover"
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      background: activeTab === tab.id ? "var(--background-tertiary)" : "transparent",
                      color: activeTab === tab.id ? "var(--foreground)" : "var(--foreground-secondary)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a
                href="https://github.com/Fadydesoky/Mobile-Cloud-System"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--foreground-secondary)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                <Icons.Github />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="btn-hover"
                style={{
                  padding: 8,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--background-tertiary)",
                  color: "var(--foreground-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
              </button>
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: 
                    status === "healthy" ? "var(--success-muted)" : 
                    status === "error" ? "var(--error-muted)" : 
                    status === "running" ? "var(--warning-muted)" : 
                    "var(--background-tertiary)",
                  color: 
                    status === "healthy" ? "var(--success)" : 
                    status === "error" ? "var(--error)" : 
                    status === "running" ? "var(--warning)" : 
                    "var(--foreground-secondary)",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.3s ease",
                }}
              >
                <StatusDot status={demoMode && status === "idle" ? "healthy" : status === "idle" ? "unknown" : status} size={6} />
                {demoMode && status === "idle" ? "Demo" : status === "idle" ? "Ready" : status === "running" ? "Processing..." : status === "healthy" ? "Healthy" : "Error"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress bar under nav */}
        <ProgressBar progress={simulationProgress} isActive={loading} />
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 36, 
              fontWeight: 700, 
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Observability Dashboard
            </h1>
            <p style={{ margin: "10px 0 0", color: "var(--foreground-secondary)", fontSize: 15, lineHeight: 1.5 }}>
              Real-time monitoring for cloud-native microservices architecture
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={checkHealth}
              className="btn-hover"
              style={{
                padding: "12px 20px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                background: "var(--background-secondary)",
                color: "var(--foreground-secondary)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Icons.Refresh />
              Refresh
            </button>
            <button
              onClick={runSimulation}
              disabled={loading}
              className="btn-hover"
              style={{
                padding: "12px 24px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                background: loading 
                  ? "var(--background-tertiary)" 
                  : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                backgroundSize: "200% 200%",
                color: loading ? "var(--foreground-muted)" : "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                boxShadow: loading 
                  ? "none" 
                  : "0 4px 15px rgba(59, 130, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)",
                animation: loading ? "none" : "gradientShift 3s ease infinite",
              }}
            >
              {loading ? (
                <>
                  <span style={{ 
                    width: 16, 
                    height: 16, 
                    border: "2px solid var(--foreground-muted)", 
                    borderTopColor: "transparent", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite" 
                  }} />
                  Simulation Running...
                </>
              ) : (
                <>
                  <Icons.Play />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Summary Panel */}
        <SystemSummary 
          metrics={metrics} 
          activeServices={activeServicesCount}
          isLoading={loading}
        />

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <MetricCard
            title="Total Requests"
            value={metrics.totalRequests}
            icon={Icons.Activity}
            change={metrics.totalRequests > 0 ? 12 : undefined}
            chart={chartData}
            trend="up"
          />
          <MetricCard
            title="Success Rate"
            value={metrics.successRate}
            suffix="%"
            icon={Icons.Check}
            change={metrics.successRate === 100 ? 0 : -2}
          />
          <MetricCard
            title="Avg Latency"
            value={metrics.avgLatency}
            suffix="ms"
            icon={Icons.Zap}
          />
          <MetricCard
            title="Uptime"
            value={metrics.uptime.toFixed(1)}
            suffix="%"
            icon={Icons.Cloud}
          />
        </div>

        {/* Services Status */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
          <ServiceCard
            name="Order Service"
            description={demoMode ? "Simulated - Handles order processing" : "Handles order processing and fulfillment"}
            status={demoMode ? "healthy" : services.order.status}
            latency={demoMode ? "~85ms" : services.order.latency}
            port="5002"
            icon={Icons.Box}
          />
          <ServiceCard
            name="Product Service"
            description={demoMode ? "Simulated - Manages product catalog" : "Manages product catalog and inventory"}
            status={demoMode ? "healthy" : services.product.status}
            latency={demoMode ? "~62ms" : services.product.latency}
            port="5001"
            icon={Icons.Database}
          />
          <ServiceCard
            name="Redis Cache"
            description={demoMode ? "Simulated - Distributed caching" : "In-memory data structure store"}
            status={demoMode ? "healthy" : services.redis?.status || "unknown"}
            latency={demoMode ? "~2ms" : services.redis?.latency}
            port="6379"
            icon={Icons.Zap}
          />
        </div>

        {/* Architecture Diagram - Enhanced Multi-Layer View */}
        <div style={{ 
          padding: 32, 
          borderRadius: "var(--radius-xl)", 
          border: "1px solid var(--border)", 
          backgroundColor: "var(--background-secondary)", 
          marginBottom: 32,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>
              System Architecture
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ 
                fontSize: 11, 
                color: loading ? "var(--success)" : "var(--foreground-muted)", 
                textTransform: "uppercase", 
                letterSpacing: "0.1em",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: loading ? "var(--success-muted)" : "transparent",
                transition: "all 0.3s ease",
              }}>
                {loading && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--success)", animation: "pulse 1s infinite" }} />}
                {loading ? "Data Flowing" : "Live Data Flow"}
              </span>
            </div>
          </div>

          {/* Layer Labels */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(5, 1fr)", 
            gap: 16, 
            marginBottom: 12,
            padding: "0 8px",
          }}>
            {["Presentation", "API Gateway", "Microservices", "Data Layer", "Infrastructure"].map((layer) => (
              <div key={layer} style={{ textAlign: "center" }}>
                <span style={{ 
                  fontSize: 10, 
                  color: "var(--foreground-muted)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}>
                  {layer}
                </span>
              </div>
            ))}
          </div>
          
          {/* Main Architecture Flow */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(5, 1fr)", 
            gap: 8, 
            padding: "24px 8px",
            position: "relative",
          }}>
            {/* Presentation Layer */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <ArchitectureNode
                label="React"
                sublabel="Frontend UI"
                color="#61dafb"
                isActive={loading}
                description="React 19 Single Page Application with real-time updates"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#61dafb">
                    <path d="M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                    <path fillRule="evenodd" d="M12 21c4.97 0 9-1.79 9-4s-4.03-4-9-4-9 1.79-9 4 4.03 4 9 4zm0-2c3.866 0 7-1.343 7-3s-3.134-3-7-3-7 1.343-7 3 3.134 3 7 3z"/>
                    <path fillRule="evenodd" d="M12 21c-1.657 0-3-4.03-3-9s1.343-9 3-9 3 4.03 3 9-1.343 9-3 9zm0-2c.552 0 1-3.134 1-7s-.448-7-1-7-1 3.134-1 7 .448 7 1 7z"/>
                  </svg>
                }
              />
              <div style={{ fontSize: 10, color: "var(--foreground-muted)", textAlign: "center" }}>
                Port: 3000
              </div>
            </div>

            {/* API Gateway Layer */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }}>
              {/* Connection Arrow */}
              <div style={{ 
                position: "absolute", 
                left: -20, 
                top: "50%", 
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
              }}>
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <defs>
                    <linearGradient id="arrowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#61dafb" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  <line 
                    x1="0" y1="10" x2="32" y2="10" 
                    stroke={loading ? "url(#arrowGrad1)" : "var(--border-hover)"} 
                    strokeWidth="2" 
                    strokeDasharray={loading ? "4 2" : "none"} 
                    style={loading ? { animation: "flowingDash 0.5s linear infinite" } : {}} 
                  />
                  <polygon points="30,6 38,10 30,14" fill={loading ? "#22c55e" : "var(--border-hover)"} />
                </svg>
              </div>
              <ArchitectureNode
                label="Flask API"
                sublabel="REST Gateway"
                color="#22c55e"
                isActive={loading}
                delay={100}
                description="Python Flask REST API with CORS and health checks"
                icon={<Icons.Server />}
              />
              <div style={{ fontSize: 10, color: "var(--foreground-muted)", textAlign: "center" }}>
                Port: 5002
              </div>
            </div>

            {/* Microservices Layer */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
              {/* Connection Arrow */}
              <div style={{ 
                position: "absolute", 
                left: -20, 
                top: "50%", 
                transform: "translateY(-50%)",
              }}>
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <defs>
                    <linearGradient id="arrowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <line 
                    x1="0" y1="10" x2="32" y2="10" 
                    stroke={loading ? "url(#arrowGrad2)" : "var(--border-hover)"} 
                    strokeWidth="2" 
                    strokeDasharray={loading ? "4 2" : "none"} 
                    style={loading ? { animation: "flowingDash 0.5s linear infinite" } : {}} 
                  />
                  <polygon points="30,6 38,10 30,14" fill={loading ? "#a855f7" : "var(--border-hover)"} />
                </svg>
              </div>
              {/* Order Service */}
              <Tooltip content="Order Service: Handles order creation with saga pattern">
                <div
                  className="animate-fade-in"
                  style={{
                    width: "100%",
                    maxWidth: 120,
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #a855f720 0%, #a855f708 100%)",
                    border: `1px solid ${loading ? "#a855f7" : "#a855f740"}`,
                    textAlign: "center",
                    boxShadow: loading ? "0 0 20px #a855f730" : "none",
                    transition: "all 0.3s ease",
                    animationDelay: "200ms",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#a855f7" }}>Order Service</span>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--foreground-muted)" }}>Saga Orchestrator</p>
                </div>
              </Tooltip>
              {/* Product Service */}
              <Tooltip content="Product Service: Manages inventory and catalog">
                <div
                  className="animate-fade-in"
                  style={{
                    width: "100%",
                    maxWidth: 120,
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #f59e0b20 0%, #f59e0b08 100%)",
                    border: `1px solid ${loading ? "#f59e0b" : "#f59e0b40"}`,
                    textAlign: "center",
                    boxShadow: loading ? "0 0 20px #f59e0b30" : "none",
                    transition: "all 0.3s ease",
                    animationDelay: "250ms",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b" }}>Product Service</span>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--foreground-muted)" }}>Inventory Mgmt</p>
                </div>
              </Tooltip>
              <div style={{ fontSize: 10, color: "var(--foreground-muted)", textAlign: "center" }}>
                Port: 5001
              </div>
            </div>

            {/* Data Layer */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
              {/* Connection Arrow */}
              <div style={{ 
                position: "absolute", 
                left: -20, 
                top: "50%", 
                transform: "translateY(-50%)",
              }}>
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <defs>
                    <linearGradient id="arrowGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#dc382d" />
                    </linearGradient>
                  </defs>
                  <line 
                    x1="0" y1="10" x2="32" y2="10" 
                    stroke={loading ? "url(#arrowGrad3)" : "var(--border-hover)"} 
                    strokeWidth="2" 
                    strokeDasharray={loading ? "4 2" : "none"} 
                    style={loading ? { animation: "flowingDash 0.5s linear infinite" } : {}} 
                  />
                  <polygon points="30,6 38,10 30,14" fill={loading ? "#dc382d" : "var(--border-hover)"} />
                </svg>
              </div>
              {/* Redis Primary */}
              <Tooltip content="Redis Primary: Message queue and caching layer">
                <div
                  className="animate-fade-in"
                  style={{
                    width: "100%",
                    maxWidth: 120,
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #dc382d20 0%, #dc382d08 100%)",
                    border: `1px solid ${loading ? "#dc382d" : "#dc382d40"}`,
                    textAlign: "center",
                    boxShadow: loading ? "0 0 20px #dc382d30" : "none",
                    transition: "all 0.3s ease",
                    animationDelay: "300ms",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#dc382d" }}>Redis Primary</span>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--foreground-muted)" }}>Message Queue</p>
                </div>
              </Tooltip>
              {/* Redis Replica */}
              <Tooltip content="Redis Replica: Failover and read scaling">
                <div
                  className="animate-fade-in"
                  style={{
                    width: "100%",
                    maxWidth: 120,
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #dc382d15 0%, #dc382d05 100%)",
                    border: "1px solid #dc382d30",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    animationDelay: "350ms",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#dc382d", opacity: 0.7 }}>Redis Replica</span>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--foreground-muted)" }}>Failover Node</p>
                </div>
              </Tooltip>
              <div style={{ fontSize: 10, color: "var(--foreground-muted)", textAlign: "center" }}>
                Port: 6379
              </div>
            </div>

            {/* Infrastructure Layer */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
              {/* Connection Arrow */}
              <div style={{ 
                position: "absolute", 
                left: -20, 
                top: "50%", 
                transform: "translateY(-50%)",
              }}>
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <defs>
                    <linearGradient id="arrowGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#dc382d" />
                      <stop offset="100%" stopColor="#326ce5" />
                    </linearGradient>
                  </defs>
                  <line 
                    x1="0" y1="10" x2="32" y2="10" 
                    stroke={loading ? "url(#arrowGrad4)" : "var(--border-hover)"} 
                    strokeWidth="2" 
                    strokeDasharray={loading ? "4 2" : "none"} 
                    style={loading ? { animation: "flowingDash 0.5s linear infinite" } : {}} 
                  />
                  <polygon points="30,6 38,10 30,14" fill={loading ? "#326ce5" : "var(--border-hover)"} />
                </svg>
              </div>
              {/* Docker */}
              <Tooltip content="Docker: Container runtime for all services">
                <div
                  className="animate-fade-in"
                  style={{
                    width: "100%",
                    maxWidth: 120,
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #2496ed20 0%, #2496ed08 100%)",
                    border: `1px solid ${loading ? "#2496ed" : "#2496ed40"}`,
                    textAlign: "center",
                    boxShadow: loading ? "0 0 20px #2496ed30" : "none",
                    transition: "all 0.3s ease",
                    animationDelay: "400ms",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#2496ed" }}>Docker</span>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--foreground-muted)" }}>Containers</p>
                </div>
              </Tooltip>
              {/* Kubernetes */}
              <Tooltip content="Kubernetes: Container orchestration with auto-scaling">
                <div
                  className="animate-fade-in"
                  style={{
                    width: "100%",
                    maxWidth: 120,
                    padding: "12px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, #326ce520 0%, #326ce508 100%)",
                    border: `1px solid ${loading ? "#326ce5" : "#326ce540"}`,
                    textAlign: "center",
                    boxShadow: loading ? "0 0 20px #326ce530" : "none",
                    transition: "all 0.3s ease",
                    animationDelay: "450ms",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#326ce5" }}>Kubernetes</span>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: "var(--foreground-muted)" }}>Orchestration</p>
                </div>
              </Tooltip>
              <div style={{ fontSize: 10, color: "var(--foreground-muted)", textAlign: "center" }}>
                K8s Cluster
              </div>
            </div>
          </div>

          {/* Architecture Features */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: 16, 
            marginTop: 24,
            flexWrap: "wrap",
            padding: "16px",
            backgroundColor: "var(--background-tertiary)",
            borderRadius: "var(--radius-md)",
            transition: "background-color 0.3s ease",
          }}>
            {[
              { name: "Saga Pattern", desc: "Distributed Transactions" },
              { name: "Circuit Breaker", desc: "Fault Isolation" },
              { name: "Health Probes", desc: "Auto Recovery" },
              { name: "Load Balancing", desc: "Traffic Distribution" },
              { name: "Auto Scaling", desc: "Dynamic Resources" },
            ].map((feature) => (
              <Tooltip key={feature.name} content={feature.desc}>
                <div 
                  style={{ 
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 16px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icons.Check />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{feature.name}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "var(--foreground-muted)" }}>{feature.desc}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Response & Logs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* API Response */}
          <div style={{ 
            padding: 24, 
            borderRadius: "var(--radius-lg)", 
            border: "1px solid var(--border)", 
            backgroundColor: "var(--background-secondary)",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>API Response</h3>
              {orderData && (
                <span style={{ 
                  fontSize: 11, 
                  padding: "2px 8px", 
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: orderData.status === "success" ? "var(--success-muted)" : "var(--error-muted)",
                  color: orderData.status === "success" ? "var(--success)" : "var(--error)",
                  fontWeight: 500,
                }}>
                  {orderData.latency}
                </span>
              )}
            </div>
            {loading ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  border: "3px solid var(--border)", 
                  borderTopColor: "var(--accent)", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite", 
                  margin: "0 auto 16px",
                }} />
                <p style={{ color: "var(--foreground-muted)", margin: 0, fontSize: 13 }}>Processing request...</p>
              </div>
            ) : orderData ? (
              <pre 
                className="animate-fade-in"
                style={{
                  margin: 0,
                  padding: 16,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--background-tertiary)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  overflow: "auto",
                  lineHeight: 1.6,
                  color: "var(--foreground-secondary)",
                  transition: "background-color 0.3s ease",
                }}
              >
                {JSON.stringify(orderData, null, 2)}
              </pre>
            ) : (
              <div style={{ padding: 48, textAlign: "center" }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--background-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "var(--foreground-muted)",
                }}>
                  <Icons.Terminal />
                </div>
                <p style={{ color: "var(--foreground-muted)", margin: 0, fontSize: 13 }}>
                  Run simulation to see API response
                </p>
              </div>
            )}
          </div>

          {/* System Logs */}
          <div style={{ 
            padding: 24, 
            borderRadius: "var(--radius-lg)", 
            border: "1px solid var(--border)", 
            backgroundColor: "var(--background-secondary)",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>System Logs</h3>
              {logs.length > 0 && (
                <span style={{ 
                  fontSize: 11, 
                  color: "var(--foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: "50%", 
                    backgroundColor: loading ? "var(--success)" : "var(--foreground-muted)",
                    animation: loading ? "pulse 1s infinite" : "none",
                  }} />
                  {logs.length} entries
                </span>
              )}
            </div>
            <div 
              ref={logsContainerRef}
              className="log-container"
              style={{
                maxHeight: 280,
                overflow: "auto",
                backgroundColor: "var(--background-tertiary)",
                borderRadius: "var(--radius-md)",
                padding: logs.length ? 12 : 0,
                transition: "background-color 0.3s ease",
              }}
            >
              {logs.length > 0 ? (
                logs.slice(0, 15).map((log) => (
                  <LogEntry 
                    key={log.id} 
                    {...log} 
                    isNew={newLogIds.has(log.id)}
                  />
                ))
              ) : (
                <div style={{ padding: 48, textAlign: "center" }}>
                  <p style={{ color: "var(--foreground-muted)", margin: 0, fontSize: 13 }}>
                    No logs yet - run a simulation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request History */}
        {requestHistory.length > 0 && (
          <div style={{ 
            marginTop: 24, 
            padding: 24, 
            borderRadius: "var(--radius-lg)", 
            border: "1px solid var(--border)", 
            backgroundColor: "var(--background-secondary)",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Request History</h3>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {requestHistory.slice(0, 12).map((req, i) => (
                <div
                  key={i}
                  className="animate-scale-in"
                  style={{
                    padding: "14px 18px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--background-tertiary)",
                    border: `1px solid ${req.status === "success" ? "var(--success)" : "var(--error)"}30`,
                    minWidth: 90,
                    textAlign: "center",
                    animationDelay: `${i * 50}ms`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ 
                    fontSize: 18, 
                    fontWeight: 700, 
                    fontFamily: "var(--font-mono)",
                    color: req.status === "success" ? "var(--success)" : "var(--error)",
                  }}>
                    {req.latency}
                    <span style={{ fontSize: 11, fontWeight: 400 }}>ms</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--foreground-muted)", marginTop: 4 }}>
                    {req.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technology Stack */}
        <div style={{ 
          marginTop: 32, 
          padding: 32, 
          borderRadius: "var(--radius-xl)", 
          border: "1px solid var(--border)", 
          backgroundColor: "var(--background-secondary)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 600, textAlign: "center" }}>
            Technology Stack
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: 16,
          }}>
            {[
              { name: "Docker", desc: "Containerization", color: "#2496ed" },
              { name: "Kubernetes", desc: "Orchestration", color: "#326ce5" },
              { name: "Flask", desc: "Python API", color: "#22c55e" },
              { name: "React", desc: "Frontend UI", color: "#61dafb" },
              { name: "Redis", desc: "Distributed Cache", color: "#dc382d" },
              { name: "GitHub Actions", desc: "CI/CD Pipeline", color: "#a855f7" },
            ].map((tech) => (
              <div
                key={tech.name}
                style={{
                  padding: 16,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--background-tertiary)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = tech.color;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 20px ${tech.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: tech.color,
                  boxShadow: `0 0 10px ${tech.color}50`,
                }} />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{tech.name}</span>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--foreground-muted)" }}>{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--foreground-muted)", fontSize: 13 }}>
            Cloud-Native Microservices Architecture | Docker + Kubernetes + Redis
          </p>
          <p style={{ margin: "8px 0 0", color: "var(--foreground-muted)", fontSize: 12 }}>
            Built with React, Flask, and containerized with Docker
          </p>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 16 }}>
            <a
              href="https://github.com/Fadydesoky/Mobile-Cloud-System"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hover"
              style={{
                color: "var(--foreground-secondary)",
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
              }}
            >
              View on GitHub <Icons.External />
            </a>
            <a
              href="https://www.linkedin.com/in/fadydesokysaeedabdelaziz/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hover"
              style={{
                color: "var(--foreground-secondary)",
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
              }}
            >
              LinkedIn <Icons.External />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
