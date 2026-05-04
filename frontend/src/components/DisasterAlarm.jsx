import { useCallback, useEffect, useRef, useState } from "react";

const MOCK_ALERTS = [
  {
    id: "a1", district: "Moradabad", state: "Uttar Pradesh",
    alert_level: "Critical", alert_color: "#E24B4A",
    message: "Moradabad mein critical flood risk — rainfall 138mm, wind 85km/h",
    temperature: 36.2, humidity: 91, rainfall_mm: 138, wind_kmh: 85,
    predicted_for: "Agli 6 ghante", disaster_type: "Flash Flood",
  },
  {
    id: "a2", district: "Bareilly", state: "Uttar Pradesh",
    alert_level: "High", alert_color: "#EF9F27",
    message: "Bareilly mein high flood risk — rainfall 72mm, wind 55km/h",
    temperature: 34.8, humidity: 85, rainfall_mm: 72, wind_kmh: 55,
    predicted_for: "Agli 12 ghante", disaster_type: "Riverine Flood",
  },
  {
    id: "a3", district: "Rampur", state: "Uttar Pradesh",
    alert_level: "High", alert_color: "#EF9F27",
    message: "Rampur mein high risk — rainfall 68mm, wind 48km/h",
    temperature: 35.5, humidity: 88, rainfall_mm: 68, wind_kmh: 48,
    predicted_for: "Agli 18 ghante", disaster_type: "Riverine Flood",
  },
  {
    id: "a4", district: "Lucknow", state: "Uttar Pradesh",
    alert_level: "Medium", alert_color: "#185FA5",
    message: "Lucknow mein medium risk — rainfall 28mm, wind 32km/h",
    temperature: 33.1, humidity: 78, rainfall_mm: 28, wind_kmh: 32,
    predicted_for: "Agli 24 ghante", disaster_type: "Urban Flood",
  },
  {
    id: "a5", district: "Agra", state: "Uttar Pradesh",
    alert_level: "Low", alert_color: "#639922",
    message: "Agra mein low risk — conditions normal hain",
    temperature: 31.4, humidity: 65, rainfall_mm: 8, wind_kmh: 18,
    predicted_for: "Agli 48 ghante", disaster_type: "None",
  },
];

const LEVEL_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const LEVEL_CONFIG = {
  Critical: { color: "#ff4444", bg: "linear-gradient(135deg,#2d0808,#1a0404)", glow: "#ff444450" },
  High:     { color: "#ff9500", bg: "linear-gradient(135deg,#2a1800,#1a0e00)", glow: "#ff950040" },
  Medium:   { color: "#3b82f6", bg: "linear-gradient(135deg,#0a1628,#060e1a)", glow: "#3b82f630" },
  Low:      { color: "#22c55e", bg: "linear-gradient(135deg,#0a1f0d,#061408)", glow: "#22c55e20" },
  All:      { color: "#00d4ff", bg: "transparent",                             glow: "none"      },
};

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default")
    Notification.requestPermission();
}

function sendBrowserNotif(alert) {
  if ("Notification" in window && Notification.permission === "granted")
    new Notification(`🚨 ${alert.alert_level} Alert — ${alert.district}!`, { body: alert.message, tag: alert.id });
}

function playAlarm(level) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = level === "Critical" ? [880,660,880,660] : level === "High" ? [660,440,660] : [440,330];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "square";
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.35);
      osc.start(ctx.currentTime + i * 0.4);
      osc.stop(ctx.currentTime + i * 0.4 + 0.35);
    });
  } catch (_) {}
}

// ── Animated stat pill ────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "6px 14px", borderRadius: 10,
      background: `${color}12`, border: `1px solid ${color}30`,
      minWidth: 60,
    }}>
      <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</span>
      <span style={{ fontSize: 9, color: "#4a6a8a", fontFamily: "monospace", marginTop: 1 }}>{label}</span>
    </div>
  );
}

// ── Alert card ────────────────────────────────────────────
function AlertCard({ alert, onDismiss }) {
  const [hovered, setHovered] = useState(false);
  const cfg = LEVEL_CONFIG[alert.alert_level] || LEVEL_CONFIG.Low;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${cfg.color}15` : `${cfg.color}08`,
        border: `1px solid ${cfg.color}${hovered ? "60" : "30"}`,
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 12, padding: "14px 16px",
        display: "grid", gridTemplateColumns: "1fr auto", gap: 12,
        transition: "all 0.25s ease",
        boxShadow: hovered ? `0 4px 20px ${cfg.color}20` : "none",
        transform: hovered ? "translateX(4px)" : "translateX(0)",
      }}
    >
      <div>
        {/* Header row */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{
            background: cfg.color, color: "#fff",
            borderRadius: 6, padding: "3px 10px",
            fontSize: 10, fontWeight: 800, fontFamily: "monospace",
            boxShadow: `0 0 10px ${cfg.color}60`,
            letterSpacing: "0.5px",
          }}>
            {alert.alert_level === "Critical" && "🔴 "}
            {alert.alert_level === "High"     && "🟠 "}
            {alert.alert_level === "Medium"   && "🔵 "}
            {alert.alert_level === "Low"      && "🟢 "}
            {alert.alert_level.toUpperCase()}
          </span>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#e8f4fd" }}>
            📍 {alert.district}, {alert.state}
          </span>
          <span style={{
            fontSize: 10, color: "#00d4ff", fontFamily: "monospace",
            background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 6, padding: "2px 8px",
          }}>⏰ {alert.predicted_for}</span>
          {alert.disaster_type !== "None" && (
            <span style={{ fontSize: 10, color: cfg.color, fontFamily: "monospace" }}>
              🌊 {alert.disaster_type}
            </span>
          )}
        </div>

        {/* Message */}
        <p style={{ fontSize: 12, color: "#a0c0e0", margin: "0 0 12px", lineHeight: 1.7 }}>
          {alert.message}
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["🌡", "Temp",     `${alert.temperature}°C`, "#ff6b6b"],
            ["💧", "Rain",     `${alert.rainfall_mm}mm`, "#00d4ff"],
            ["💨", "Wind",     `${alert.wind_kmh}km/h`,  "#a855f7"],
            ["🌫", "Humidity", `${alert.humidity}%`,      "#22c55e"],
          ].map(([icon, label, val, col]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 10px", borderRadius: 8,
              background: `${col}10`, border: `1px solid ${col}25`,
              fontSize: 11, fontFamily: "monospace",
            }}>
              <span>{icon}</span>
              <span style={{ color: "#4a6a8a" }}>{label}:</span>
              <span style={{ color: col, fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(alert.id)}
        style={{
          background: "transparent", border: "1px solid #1a2840",
          borderRadius: 8, color: "#4a6a8a", cursor: "pointer",
          padding: "6px 10px", fontSize: 14,
          transition: "all 0.2s",
          alignSelf: "flex-start",
        }}
        onMouseEnter={e => { e.target.style.borderColor = "#ff4444"; e.target.style.color = "#ff4444"; }}
        onMouseLeave={e => { e.target.style.borderColor = "#1a2840"; e.target.style.color = "#4a6a8a"; }}
      >✕</button>
    </div>
  );
}

export default function DisasterAlarm() {
  const [alerts,      setAlerts]      = useState([]);
  const [expanded,    setExpanded]    = useState(false);
  const [muted,       setMuted]       = useState(false);
  const [filterLevel, setFilterLevel] = useState("All");
  const [lastChecked, setLastChecked] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [dismissed,   setDismissed]   = useState(new Set());
  const [pulse,       setPulse]       = useState(false);
  const seenIds = useRef(new Set());

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let data = [];
    try {
      const resp = await fetch("http://localhost:8000/api/alerts", { signal: AbortSignal.timeout(5000) });
      if (resp.ok) data = await resp.json();
      else throw new Error();
    } catch {
      data = MOCK_ALERTS.map(a => ({ ...a, timestamp: new Date().toISOString() }));
    }

    data.forEach(alert => {
      if ((alert.alert_level === "Critical" || alert.alert_level === "High") && !seenIds.current.has(alert.id)) {
        seenIds.current.add(alert.id);
        if (!muted) { playAlarm(alert.alert_level); sendBrowserNotif(alert); }
      }
    });

    data.sort((a, b) => LEVEL_ORDER[b.alert_level] - LEVEL_ORDER[a.alert_level]);
    setAlerts(data);
    setLastChecked(new Date());
    setLoading(false);

    // trigger pulse animation
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  }, [muted]);

  useEffect(() => {
    requestNotifPermission();
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 30000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id) && (filterLevel === "All" || a.alert_level === filterLevel));
  const criticalCount = alerts.filter(a => a.alert_level === "Critical" && !dismissed.has(a.id)).length;
  const highCount     = alerts.filter(a => a.alert_level === "High"     && !dismissed.has(a.id)).length;
  const mediumCount   = alerts.filter(a => a.alert_level === "Medium"   && !dismissed.has(a.id)).length;
  const urgentCount   = criticalCount + highCount;
  const hasCritical   = criticalCount > 0;

  const cfg = hasCritical ? LEVEL_CONFIG.Critical : urgentCount > 0 ? LEVEL_CONFIG.High : LEVEL_CONFIG.Low;

  return (
    <>
      <style>{`
        @keyframes criticalPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes bannerGlow {
          0%, 100% { box-shadow: 0 0 20px ${cfg.glow}; }
          50%       { box-shadow: 0 0 40px ${cfg.glow}; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes refreshPulse {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .alarm-expand { animation: slideDown 0.3s ease forwards; }
      `}</style>

      <div style={{
        position: "sticky", top: 0, zIndex: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        borderRadius: expanded ? "14px 14px 0 0" : 14,
        marginBottom: expanded ? 0 : 16,
        overflow: "hidden",
        boxShadow: hasCritical ? `0 0 30px ${cfg.color}30, 0 4px 20px rgba(0,0,0,0.4)` : "0 4px 20px rgba(0,0,0,0.3)",
        animation: hasCritical ? "bannerGlow 2s infinite" : "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* ── TOP BAR ── */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 18px", cursor: "pointer",
            borderBottom: expanded ? `1px solid ${cfg.color}20` : "none",
          }}
          onClick={() => setExpanded(e => !e)}
        >
          {/* Icon */}
          <div style={{
            fontSize: 24, flexShrink: 0,
            animation: hasCritical ? "criticalPulse 1s infinite" : "none",
            filter: hasCritical ? `drop-shadow(0 0 8px ${cfg.color})` : "none",
          }}>
            {hasCritical ? "🚨" : urgentCount > 0 ? "⚠️" : "✅"}
          </div>

          {/* Message */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 800, fontFamily: "monospace", fontSize: 13,
              color: cfg.color,
              textShadow: hasCritical ? `0 0 20px ${cfg.color}80` : "none",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {hasCritical
                ? `🔴 CRITICAL ALERT — ${criticalCount} district(s) mein turant khatra!`
                : urgentCount > 0 ? `🟠 ${urgentCount} high-risk district(s) — dhyan dein`
                : "🟢 Abhi koi critical alert nahi — sab theek hai"}
            </div>
            {lastChecked && (
              <div style={{ fontSize: 10, color: "#4a6a8a", fontFamily: "monospace", marginTop: 2 }}>
                Last check: {lastChecked.toLocaleTimeString()}
                {loading && " · Refreshing..."}
              </div>
            )}
          </div>

          {/* Count badges */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {criticalCount > 0 && (
              <span style={{
                background: "#ff4444", color: "#fff",
                borderRadius: 20, padding: "3px 12px",
                fontSize: 11, fontWeight: 800, fontFamily: "monospace",
                boxShadow: "0 0 12px #ff444480",
              }}>{criticalCount} Critical</span>
            )}
            {highCount > 0 && (
              <span style={{
                background: "#ff9500", color: "#1a0e00",
                borderRadius: 20, padding: "3px 12px",
                fontSize: 11, fontWeight: 800, fontFamily: "monospace",
                boxShadow: "0 0 10px #ff950050",
              }}>{highCount} High</span>
            )}
            {mediumCount > 0 && (
              <span style={{
                background: "#3b82f6", color: "#fff",
                borderRadius: 20, padding: "3px 12px",
                fontSize: 11, fontWeight: 800, fontFamily: "monospace",
              }}>{mediumCount} Medium</span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={fetchAlerts} title="Refresh" style={{
              background: "#0d1520", border: "1px solid #1a2840",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              color: "#4a6a8a", fontSize: 13, transition: "all 0.2s",
            }}>
              <span style={{ display: "inline-block", animation: loading ? "refreshPulse 1s linear infinite" : "none" }}>
                {loading ? "⏳" : "🔄"}
              </span>
            </button>
            <button onClick={() => setMuted(m => !m)} title="Mute/Unmute" style={{
              background: muted ? "#2a1800" : "#0d1520",
              border: `1px solid ${muted ? "#ff9500" : "#1a2840"}`,
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              color: muted ? "#ff9500" : "#4a6a8a", fontSize: 13,
              transition: "all 0.2s",
            }}>{muted ? "🔇" : "🔔"}</button>
            <button onClick={() => { if (!muted) playAlarm("Critical"); }} title="Test Alarm" style={{
              background: "#120a20", border: "1px solid #a855f730",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              color: "#a855f7", fontSize: 12, fontFamily: "monospace",
              transition: "all 0.2s",
            }}>🔊 Test</button>
          </div>

          {/* Expand arrow */}
          <span style={{
            color: "#4a6a8a", fontSize: 12, flexShrink: 0,
            transition: "transform 0.3s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</span>
        </div>

        {/* ── EXPANDED PANEL ── */}
        {expanded && (
          <div className="alarm-expand" style={{ padding: 16, background: "rgba(0,0,0,0.25)" }}>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <StatPill label="Critical" value={criticalCount} color="#ff4444" />
              <StatPill label="High"     value={highCount}     color="#ff9500" />
              <StatPill label="Medium"   value={mediumCount}   color="#3b82f6" />
              <StatPill label="Total"    value={alerts.length} color="#00d4ff" />
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", fontSize: 10, color: "#4a6a8a", fontFamily: "monospace", gap: 8 }}>
                <span>🔁 Auto-refresh: 30s</span>
                <span>{muted ? "🔇 Muted" : "🔔 Alarm On"}</span>
              </div>
            </div>

            {/* Filter buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#4a6a8a", fontFamily: "monospace", alignSelf: "center" }}>Filter:</span>
              {["All", "Critical", "High", "Medium", "Low"].map(lvl => {
                const c = LEVEL_CONFIG[lvl]?.color || "#00d4ff";
                const isActive = filterLevel === lvl;
                return (
                  <button key={lvl} onClick={() => setFilterLevel(lvl)} style={{
                    background: isActive ? c : "transparent",
                    color: isActive ? "#fff" : c,
                    border: `1px solid ${c}`,
                    borderRadius: 8, padding: "4px 14px",
                    cursor: "pointer", fontSize: 11,
                    fontFamily: "monospace", fontWeight: 700,
                    transition: "all 0.2s",
                    boxShadow: isActive ? `0 0 10px ${c}40` : "none",
                  }}>{lvl}</button>
                );
              })}
            </div>

            {/* Alert cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
              {visibleAlerts.length === 0
                ? (
                  <div style={{
                    textAlign: "center", padding: 40,
                    color: "#4a6a8a", fontFamily: "monospace",
                    background: "#060b12", borderRadius: 12,
                    border: "1px solid #1a2840",
                  }}>
                    ✅ Koi active alert nahi
                  </div>
                )
                : visibleAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={id => setDismissed(prev => new Set([...prev, id]))}
                  />
                ))
              }
            </div>

            {/* Emergency strip */}
            <div style={{
              marginTop: 14, padding: "12px 16px",
              background: "rgba(255,68,68,0.06)",
              border: "1px solid rgba(255,68,68,0.2)",
              borderRadius: 10,
              display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: "#ff4444", fontWeight: 800, fontFamily: "monospace" }}>
                📞 EMERGENCY:
              </span>
              {[["NDMA","1078"],["Flood Relief","1070"],["Police","100"],["Ambulance","108"]].map(([n, num]) => (
                <div key={n} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 8,
                  background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.15)",
                }}>
                  <span style={{ fontSize: 11, color: "#4a6a8a", fontFamily: "monospace" }}>{n}:</span>
                  <span style={{ fontSize: 12, color: "#ff6b6b", fontWeight: 800, fontFamily: "monospace" }}>{num}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
