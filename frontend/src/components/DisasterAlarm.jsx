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

function requestNotifPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendBrowserNotif(alert) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`🚨 ${alert.alert_level} Alert — ${alert.district}!`, {
      body: alert.message,
      tag: alert.id,
    });
  }
}

function playAlarm(level) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs =
      level === "Critical" ? [880, 660, 880, 660] :
      level === "High"     ? [660, 440, 660]       : [440, 330];
    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "square";
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.4 + 0.35);
      osc.start(ctx.currentTime + i * 0.4);
      osc.stop(ctx.currentTime + i * 0.4 + 0.35);
    });
  } catch (_) {}
}

function levelColor(level) {
  return { Critical: "#E24B4A", High: "#EF9F27", Medium: "#185FA5", Low: "#639922", All: "#00d4ff" }[level] || "#7a9bbf";
}

function btnStyle(bg, color) {
  return {
    background: bg, color,
    border: "1px solid #1e2d45", borderRadius: 6,
    padding: "4px 10px", cursor: "pointer",
    fontSize: 12, fontFamily: "monospace",
  };
}

export default function DisasterAlarm() {
  const [alerts,      setAlerts]      = useState([]);
  const [expanded,    setExpanded]    = useState(false);
  const [muted,       setMuted]       = useState(false);
  const [filterLevel, setFilterLevel] = useState("All");
  const [lastChecked, setLastChecked] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [dismissed,   setDismissed]   = useState(new Set());
  const seenIds = useRef(new Set());

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let data = [];
    try {
      const resp = await fetch("http://localhost:8000/api/", {
        signal: AbortSignal.timeout(15000),
      });
      if (resp.ok) data = await resp.json();
      else throw new Error();
    } catch {
      data = MOCK_ALERTS.map(a => ({ ...a, timestamp: new Date().toISOString() }));
    }

    data.forEach(alert => {
     if (alert.alert_level === "Critical" || alert.alert_level === "High") {
      if (!seenIds.current.has(alert.id)) {
        seenIds.current.add(alert.id);
      }
      if (!muted) { 
        playAlarm(alert.alert_level); 
        sendBrowserNotif(alert); 
      }
    }
    });

    data.sort((a, b) => LEVEL_ORDER[b.alert_level] - LEVEL_ORDER[a.alert_level]);
    setAlerts(data);
    setLastChecked(new Date());
    setLoading(false);
  }, [muted]);

  useEffect(() => {
    requestNotifPermission();
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 30000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  const visibleAlerts  = alerts.filter(a => !dismissed.has(a.id) && (filterLevel === "All" || a.alert_level === filterLevel));
  const criticalCount  = alerts.filter(a => a.alert_level === "Critical" && !dismissed.has(a.id)).length;
  const highCount      = alerts.filter(a => a.alert_level === "High"     && !dismissed.has(a.id)).length;
  const urgentCount    = criticalCount + highCount;
  const hasCritical    = criticalCount > 0;
  const bannerBorder   = hasCritical ? "#E24B4A" : urgentCount > 0 ? "#EF9F27" : "#639922";
  const bannerBg       = hasCritical
    ? "linear-gradient(135deg,#3a0a0a,#1a0505)"
    : urgentCount > 0 ? "linear-gradient(135deg,#2a1800,#1a0e00)"
    : "linear-gradient(135deg,#0d1f0d,#081408)";

  return (
    <div style={{
      position:"sticky", top:0, zIndex:999,
      background:bannerBg, border:`1px solid ${bannerBorder}`,
      borderRadius: expanded ? "12px 12px 0 0" : 12,
      marginBottom: expanded ? 0 : 16, overflow:"hidden",
      boxShadow: hasCritical ? `0 0 20px ${bannerBorder}40` : "none",
      transition:"all 0.3s",
    }}>

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer" }}
        onClick={() => setExpanded(e => !e)}>

        <span style={{ fontSize:22, animation: hasCritical ? "pulse-anim 1s infinite" : "none" }}>
          {hasCritical ? "🚨" : urgentCount > 0 ? "⚠️" : "✅"}
        </span>

        <div style={{ flex:1 }}>
          <span style={{ fontWeight:800, fontFamily:"monospace", fontSize:13,
            color: hasCritical ? "#ff6b6b" : urgentCount > 0 ? "#ffb347" : "#81c784" }}>
            {hasCritical
              ? `🔴 CRITICAL ALERT — ${criticalCount} district(s) mein turant khatra!`
              : urgentCount > 0 ? `🟠 ${urgentCount} high-risk district(s) — dhyan dein`
              : "🟢 Abhi koi critical alert nahi — sab theek hai"}
          </span>
          {lastChecked && (
            <span style={{ marginLeft:12, fontSize:10, color:"#7a9bbf", fontFamily:"monospace" }}>
              Last check: {lastChecked.toLocaleTimeString()}
              {loading && " · Refresh ho raha hai..."}
            </span>
          )}
        </div>

        <div style={{ display:"flex", gap:6 }}>
          {criticalCount > 0 && <span style={{ background:"#E24B4A", color:"#fff", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:800, fontFamily:"monospace" }}>{criticalCount} Critical</span>}
          {highCount     > 0 && <span style={{ background:"#EF9F27", color:"#1a0e00", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:800, fontFamily:"monospace" }}>{highCount} High</span>}
        </div>

        <div style={{ display:"flex", gap:8 }} onClick={e => e.stopPropagation()}>
          <button onClick={fetchAlerts} style={btnStyle("#1e2d45","#7a9bbf")} title="Refresh">{loading ? "⏳" : "🔄"}</button>
          <button onClick={() => setMuted(m => !m)} style={btnStyle(muted?"#2a1800":"#1e2d45", muted?"#ffb347":"#7a9bbf")} title="Mute/Unmute">{muted ? "🔇" : "🔔"}</button>
          <button onClick={() => { if(!muted) playAlarm("Critical"); }} style={btnStyle("#1a0a2a","#cc88ff")} title="Test Alarm">🔊 Test</button>
        </div>

        <span style={{ color:"#7a9bbf", fontSize:12 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* EXPANDED PANEL */}
      {expanded && (
        <div style={{ borderTop:`1px solid ${bannerBorder}40`, padding:16, background:"rgba(0,0,0,0.3)" }}>

          {/* Filter */}
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#7a9bbf", fontFamily:"monospace" }}>Filter:</span>
            {["All","Critical","High","Medium","Low"].map(lvl => (
              <button key={lvl} onClick={() => setFilterLevel(lvl)} style={{
                ...btnStyle(filterLevel===lvl ? levelColor(lvl) : "transparent", filterLevel===lvl ? "#fff" : levelColor(lvl)),
                border:`1px solid ${levelColor(lvl)}`, fontWeight:700,
              }}>{lvl}</button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:10, color:"#7a9bbf", fontFamily:"monospace" }}>
              Auto-refresh: 30s · {muted ? "🔇 Muted" : "🔔 Alarm On"}
            </span>
          </div>

          {/* Alert Cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:420, overflowY:"auto" }}>
            {visibleAlerts.length === 0
              ? <div style={{ textAlign:"center", padding:30, color:"#7a9bbf", fontFamily:"monospace" }}>✅ Koi active alert nahi</div>
              : visibleAlerts.map(alert => (
                <div key={alert.id} style={{
                  background:`${alert.alert_color}10`, border:`1px solid ${alert.alert_color}40`,
                  borderLeft:`4px solid ${alert.alert_color}`, borderRadius:8, padding:"12px 14px",
                  display:"grid", gridTemplateColumns:"1fr auto", gap:12,
                }}>
                  <div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                      <span style={{ background:alert.alert_color, color:"#fff", borderRadius:4, padding:"2px 8px", fontSize:10, fontWeight:800, fontFamily:"monospace" }}>
                        {alert.alert_level.toUpperCase()}
                      </span>
                      <span style={{ fontWeight:700, fontSize:13, color:"#e8f4fd" }}>📍 {alert.district}, {alert.state}</span>
                      <span style={{ fontSize:10, color:"#7a9bbf", background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:4, padding:"2px 8px", fontFamily:"monospace" }}>
                        ⏰ {alert.predicted_for}
                      </span>
                      {alert.disaster_type !== "None" && (
                        <span style={{ fontSize:10, color:"#00d4ff", fontFamily:"monospace" }}>🌊 {alert.disaster_type}</span>
                      )}
                    </div>
                    <p style={{ fontSize:12, color:"#c8dff0", margin:"0 0 10px", lineHeight:1.6 }}>{alert.message}</p>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                      {[["🌡 Temp",`${alert.temperature}°C`],["💧 Rainfall",`${alert.rainfall_mm}mm`],["💨 Wind",`${alert.wind_kmh}km/h`],["🌫 Humidity",`${alert.humidity}%`]].map(([l,v]) => (
                        <div key={l} style={{ fontFamily:"monospace", fontSize:11 }}>
                          <span style={{ color:"#7a9bbf" }}>{l}: </span>
                          <span style={{ color:"#e8f4fd", fontWeight:700 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
                    style={{ background:"transparent", border:"1px solid #1e2d45", borderRadius:6, color:"#7a9bbf", cursor:"pointer", padding:"4px 8px", fontSize:13 }}>✕</button>
                </div>
              ))
            }
          </div>

          {/* Emergency strip */}
          <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(226,75,74,0.08)", border:"1px solid rgba(226,75,74,0.2)", borderRadius:8, display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#E24B4A", fontWeight:700, fontFamily:"monospace" }}>📞 EMERGENCY:</span>
            {[["NDMA","1078"],["Flood Relief","1070"],["Police","100"],["Ambulance","108"]].map(([n,num]) => (
              <span key={n} style={{ fontSize:11, fontFamily:"monospace" }}>
                <span style={{ color:"#7a9bbf" }}>{n}: </span>
                <span style={{ color:"#ff6b6b", fontWeight:800 }}>{num}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse-anim { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.2);opacity:0.8} }`}</style>
    </div>
  );
}