
import { useCallback, useEffect, useRef, useState } from "react";

const LEVEL_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
}

function sendBrowserNotif(alert) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`🚨 ${alert.alert_level} Alert — ${alert.district}!`, { body: alert.message, tag: alert.id });
  }
}

function playAlarm(level, mutedRef, alarmTimers) {
  if (mutedRef.current) return;
  try {
    if (level === "Critical") {
      const a1 = new Audio("/alarm.mp3"); a1.volume = 1.0; a1.play();
      alarmTimers.current.push(
        setTimeout(() => { if (!mutedRef.current) { const a = new Audio("/alarm.mp3"); a.volume = 1.0; a.play(); } }, 2000),
        setTimeout(() => { if (!mutedRef.current) { const a = new Audio("/alarm.mp3"); a.volume = 1.0; a.play(); } }, 4000)
      );
    } else if (level === "High") {
      const a1 = new Audio("/alarm.mp3"); a1.volume = 0.7; a1.play();
      alarmTimers.current.push(
        setTimeout(() => { if (!mutedRef.current) { const a = new Audio("/alarm.mp3"); a.volume = 0.7; a.play(); } }, 2500)
      );
    } else if (level === "Medium") {
      const a1 = new Audio("/alarm.mp3"); a1.volume = 0.4; a1.play();
    }
  } catch (_) {}
}

function levelColor(level) {
  return { Critical: "#E24B4A", High: "#EF9F27", Medium: "#185FA5", Low: "#639922", All: "#00d4ff" }[level] || "#7a9bbf";
}

function btnStyle(bg, color) {
  return { background: bg, color, border: "1px solid #1e2d45", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "monospace" };
}

export default function DisasterAlarm() {
  const [alerts, setAlerts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [filterLevel, setFilterLevel] = useState("All");
  const [lastChecked, setLastChecked] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const seenIds = useRef(new Set());
  const mutedRef = useRef(false);
  const alarmTimers = useRef([]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let data = [];
    try {
      const resp = await fetch("http://localhost:8000/api/", { signal: AbortSignal.timeout(15000) });
      if (resp.ok) data = await resp.json();
      else throw new Error();
    } catch {
      data = [];
    }

    data.forEach(alert => {
      if (alert.alert_level === "Critical" || alert.alert_level === "High") {
        if (!seenIds.current.has(alert.id)) {
          seenIds.current.add(alert.id);
          if (!mutedRef.current) {
            playAlarm(alert.alert_level, mutedRef, alarmTimers);
            sendBrowserNotif(alert);
          }
        }
      }
    });

    data.sort((a, b) => LEVEL_ORDER[b.alert_level] - LEVEL_ORDER[a.alert_level]);
    setAlerts(data);
    setLastChecked(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    requestNotifPermission();
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 30000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id) && (filterLevel === "All" || a.alert_level === filterLevel));
  const criticalCount = alerts.filter(a => a.alert_level === "Critical" && !dismissed.has(a.id)).length;
  const highCount = alerts.filter(a => a.alert_level === "High" && !dismissed.has(a.id)).length;
  const urgentCount = criticalCount + highCount;
  const hasCritical = criticalCount > 0;
  const bannerBorder = hasCritical ? "#E24B4A" : urgentCount > 0 ? "#EF9F27" : "#639922";
  const bannerBg = hasCritical ? "linear-gradient(135deg,#3a0a0a,#1a0505)" : urgentCount > 0 ? "linear-gradient(135deg,#2a1800,#1a0e00)" : "linear-gradient(135deg,#0d1f0d,#081408)";

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 999, background: bannerBg, border: `1px solid ${bannerBorder}`, borderRadius: expanded ? "12px 12px 0 0" : 12, marginBottom: expanded ? 0 : 16, overflow: "hidden", boxShadow: hasCritical ? `0 0 20px ${bannerBorder}40` : "none", transition: "all 0.3s" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        <span style={{ fontSize: 22, animation: hasCritical ? "pulse-anim 1s infinite" : "none" }}>
          {hasCritical ? "🚨" : urgentCount > 0 ? "⚠️" : "✅"}
        </span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 800, fontFamily: "monospace", fontSize: 13, color: hasCritical ? "#ff6b6b" : urgentCount > 0 ? "#ffb347" : "#81c784" }}>
            {hasCritical ? `🔴 CRITICAL ALERT — ${criticalCount} Immediate danger in district(s)!` : urgentCount > 0 ? `🟠 ${urgentCount} High-risk district(s) — pay attention.` : "🟢 No critical alerts — everything is okay."}
          </span>
          {lastChecked && <span style={{ marginLeft: 12, fontSize: 10, color: "#7a9bbf", fontFamily: "monospace" }}>Last check: {lastChecked.toLocaleTimeString()}{loading && " · Refreshing..."}</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {criticalCount > 0 && <span style={{ background: "#E24B4A", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 800, fontFamily: "monospace" }}>{criticalCount} Critical</span>}
          {highCount > 0 && <span style={{ background: "#EF9F27", color: "#1a0e00", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 800, fontFamily: "monospace" }}>{highCount} High</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
          <button onClick={fetchAlerts} style={btnStyle("#1e2d45", "#7a9bbf")}>{loading ? "⏳" : "🔄"}</button>
          <button onClick={() => {
            setMuted(m => {
              const newMuted = !m;
              mutedRef.current = newMuted;
              if (newMuted) {
                alarmTimers.current.forEach(t => clearTimeout(t));
                alarmTimers.current = [];
              }
              return newMuted;
            });
          }} style={btnStyle(muted ? "#2a1800" : "#1e2d45", muted ? "#ffb347" : "#7a9bbf")}>
            {muted ? "🔇" : "🔔"}
          </button>
          <button onClick={() => { if (!mutedRef.current) playAlarm("Critical", mutedRef, alarmTimers); }} style={btnStyle("#1a0a2a", "#cc88ff")}>🔊 Test</button>
        </div>
        <span style={{ color: "#7a9bbf", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${bannerBorder}40`, padding: 16, background: "rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 6, padding: "6px 12px", marginBottom: 10, fontSize: 11, color: "#00d4ff", fontFamily: "monospace" }}>
              ℹ️ This alert system monitors live weather for all disaster types across India
            </div>
            <span style={{ fontSize: 11, color: "#7a9bbf", fontFamily: "monospace" }}>Filter:</span>
            {["All", "Critical", "High", "Medium", "Low"].map(lvl => (
              <button key={lvl} onClick={() => setFilterLevel(lvl)} style={{ ...btnStyle(filterLevel === lvl ? levelColor(lvl) : "transparent", filterLevel === lvl ? "#fff" : levelColor(lvl)), border: `1px solid ${levelColor(lvl)}`, fontWeight: 700 }}>{lvl}</button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#7a9bbf", fontFamily: "monospace" }}>Auto-refresh: 30s · {muted ? "🔇 Muted" : "🔔 Alarm On"}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
            {visibleAlerts.length === 0
              ? <div style={{ textAlign: "center", padding: 30, color: "#7a9bbf", fontFamily: "monospace" }}>✅ No active alerts.</div>
              : visibleAlerts.map(alert => (
                <div key={alert.id} style={{ background: `${alert.alert_color}10`, border: `1px solid ${alert.alert_color}40`, borderLeft: `4px solid ${alert.alert_color}`, borderRadius: 8, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ background: alert.alert_color, color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 800, fontFamily: "monospace" }}>{alert.alert_level.toUpperCase()}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#e8f4fd" }}>📍 {alert.district}, {alert.state}</span>
                      <span style={{ fontSize: 10, color: "#7a9bbf", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 4, padding: "2px 8px", fontFamily: "monospace" }}>⏰ {alert.predicted_for}</span>
                      {alert.disaster_type !== "None" && <span style={{ fontSize: 10, color: "#00d4ff", fontFamily: "monospace" }}>🌊 {alert.disaster_type}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "#c8dff0", margin: "0 0 10px", lineHeight: 1.6 }}>{alert.message}</p>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {[["🌡 Temp", `${alert.temperature}°C`], ["💧 Rainfall", `${alert.rainfall_mm}mm`], ["💨 Wind", `${alert.wind_kmh}km/h`], ["🌫 Humidity", `${alert.humidity}%`]].map(([l, v]) => (
                        <div key={l} style={{ fontFamily: "monospace", fontSize: 11 }}>
                          <span style={{ color: "#7a9bbf" }}>{l}: </span>
                          <span style={{ color: "#e8f4fd", fontWeight: 700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setDismissed(prev => new Set([...prev, alert.id]))} style={{ background: "transparent", border: "1px solid #1e2d45", borderRadius: 6, color: "#7a9bbf", cursor: "pointer", padding: "4px 8px", fontSize: 13 }}>✕</button>
                </div>
              ))}
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 8, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#E24B4A", fontWeight: 700, fontFamily: "monospace" }}>📞 EMERGENCY:</span>
            {[["NDMA", "1078"], ["Flood Relief", "1070"], ["Police", "100"], ["Ambulance", "108"]].map(([n, num]) => (
              <span key={n} style={{ fontSize: 11, fontFamily: "monospace" }}>
                <span style={{ color: "#7a9bbf" }}>{n}: </span>
                <span style={{ color: "#ff6b6b", fontWeight: 800 }}>{num}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes pulse-anim { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:0.8} }`}</style>
    </div>
  );
}