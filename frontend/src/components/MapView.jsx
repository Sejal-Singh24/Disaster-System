import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const GDACS_API = "/gdacs-api/api/events/geteventlist/SEARCH";

const DISASTER_TYPE_MAP = {
  flood:      { code: "FL", label: "Flood",          color: "#00d4ff", icon: "🌊" },
  earthquake: { code: "EQ", label: "Earthquake",     color: "#ff6b35", icon: "🌍" },
  cyclone:    { code: "TC", label: "Cyclone / Storm", color: "#a855f7", icon: "🌀" },
  wildfire:   { code: "WF", label: "Wildfire",       color: "#ef4444", icon: "🔥" },
  drought:    { code: "DR", label: "Drought",        color: "#f59e0b", icon: "☀️" },
  volcano:    { code: "VO", label: "Volcano",        color: "#f97316", icon: "🌋" },
};

const ALERT_MAP = {
  Red:    { risk: "high",   color: "#ff3b5c" },
  Orange: { risk: "medium", color: "#ffb347" },
  Green:  { risk: "low",    color: "#00e676" },
};

function makeDotIcon(color) {
  return L.divIcon({
    html: `<div style="
      width:14px;height:14px;
      background:${color};border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 10px ${color};
    "></div>`,
    className: "",
    iconSize:   [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapView({ disasterType = "flood" }) {
  const [liveData,    setLiveData]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const typeInfo = DISASTER_TYPE_MAP[disasterType] || DISASTER_TYPE_MAP.flood;

  const fetchLiveData = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const info   = DISASTER_TYPE_MAP[type] || DISASTER_TYPE_MAP.flood;
      const params = new URLSearchParams({
        eventlist:  info.code,
        alertlevel: "Green,Orange,Red",
        limit:      100,
      });

      const res  = await fetch(`${GDACS_API}?${params}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();

      const features = json?.features || [];
      const points   = features.map((f) => {
        const p         = f.properties || {};
        const coords    = f.geometry?.coordinates || [0, 0];
        const alertInfo = ALERT_MAP[p.alertlevel] || ALERT_MAP.Green;
        return {
          name:         p.name         || p.eventname || "Unknown",
          country:      p.country      || p.iso3       || "—",
          lat:          coords[1],
          lng:          coords[0],
          risk:         alertInfo.risk,
          color:        alertInfo.color,
          alertlevel:   p.alertlevel   || "Green",
          severity:     p.severitydata?.severity     ?? p.severity ?? "N/A",
          severityUnit: p.severitydata?.severityunit ?? "",
          deaths:       p.sendai?.deaths   ?? 0,
          affected:     p.sendai?.affected ?? 0,
          date:         p.todate || p.fromdate || "",
          eventId:      p.eventid || "",
          url:          p.url?.report ||
            `https://www.gdacs.org/report.aspx?eventid=${p.eventid}&eventtype=${info.code}`,
        };
      }).filter(pt => !(pt.lat === 0 && pt.lng === 0));

      setLiveData(points);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
      setLiveData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData(disasterType);
    const interval = setInterval(() => fetchLiveData(disasterType), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [disasterType, fetchLiveData]);

  const highCount   = liveData.filter(d => d.alertlevel === "Red").length;
  const medCount    = liveData.filter(d => d.alertlevel === "Orange").length;
  const totalDeaths = liveData.reduce((s, d) => s + (d.deaths || 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, height: "calc(100vh - 140px)" }}>

      {/* ── MAP COLUMN ── */}
      <div style={{
        background: "#111827", borderRadius: 12,
        border: `1px solid ${typeInfo.color}30`,
        overflow: "hidden", position: "relative",
        boxShadow: `0 0 30px ${typeInfo.color}15`,
      }}>
        {/* Badge */}
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 1000,
          background: "#0a0e1a", border: `1px solid ${typeInfo.color}40`,
          borderRadius: 8, padding: "8px 14px",
          fontFamily: "monospace", fontSize: 12, color: "#7a9bbf",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: loading ? "#ffb347" : "#00e676",
            display: "inline-block",
          }} />
          {typeInfo.icon} {typeInfo.label} — LIVE · GDACS Global
          {lastUpdated && <span style={{ color: "#3a5a7a", fontSize: 10 }}>· {lastUpdated}</span>}
        </div>

        {/* Refresh */}
        <button onClick={() => fetchLiveData(disasterType)} style={{
          position: "absolute", top: 16, right: 16, zIndex: 1000,
          background: "#0a0e1a", border: `1px solid ${typeInfo.color}40`,
          borderRadius: 8, padding: "8px 12px",
          fontFamily: "monospace", fontSize: 11, color: typeInfo.color,
          cursor: "pointer",
        }}>↻ Refresh</button>

        {/* Loading overlay */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 999,
            background: "#0a0e1acc",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40,
              border: `3px solid ${typeInfo.color}40`,
              borderTop: `3px solid ${typeInfo.color}`,
              borderRadius: "50%", animation: "spin 1s linear infinite",
            }} />
            <span style={{ fontFamily: "monospace", color: typeInfo.color, fontSize: 13 }}>
              Fetching live data from GDACS...
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, background: "#1a0a0a", border: "1px solid #ff3b5c50",
            borderRadius: 8, padding: "10px 16px",
            fontFamily: "monospace", fontSize: 11, color: "#ff3b5c",
          }}>
            ⚠ {error} — Click Refresh to retry
          </div>
        )}

        {/* ── THE MAP — react-leaflet, no manual init ── */}
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          {liveData.map((point, i) => {
            const color        = point.color;
            const severityText = point.severity !== "N/A"
              ? `${Number(point.severity).toFixed(1)} ${point.severityUnit}`
              : "N/A";
            const deathsText   = point.deaths   > 0 ? point.deaths.toLocaleString()   : "—";
            const affectedText = point.affected > 0 ? point.affected.toLocaleString() : "—";
            const dateText     = point.date
              ? new Date(point.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—";

            return (
              <div key={`${point.eventId}-${i}`}>
                <Circle
                  center={[point.lat, point.lng]}
                  radius={80000}
                  pathOptions={{
                    color, fillColor: color,
                    fillOpacity: 0.12, weight: 1, opacity: 0.35,
                  }}
                />
                <Marker position={[point.lat, point.lng]} icon={makeDotIcon(color)}>
                  <Popup>
                    <div style={{
                      fontFamily: "monospace", background: "#111827",
                      color: "#e8f4fd", padding: 16, borderRadius: 10,
                      border: `1px solid ${color}40`, minWidth: 230,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{typeInfo.icon}</span>
                        <div>
                          <strong style={{ fontSize: 14, color }}>{point.name}</strong><br />
                          <span style={{ color: "#7a9bbf", fontSize: 11 }}>{point.country}</span>
                        </div>
                      </div>
                      <div style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 20,
                        background: `${color}22`, border: `1px solid ${color}`,
                        color, fontSize: 10, fontWeight: 700,
                        textTransform: "uppercase", marginBottom: 10,
                      }}>⚠ {point.alertlevel} ALERT</div>
                      <div style={{ display: "grid", gap: 5, fontSize: 11 }}>
                        {[
                          ["Severity",    severityText, "white"   ],
                          ["Deaths",      deathsText,   "#ff3b5c" ],
                          ["Affected",    affectedText, "#ffb347" ],
                          ["Last Update", dateText,     "#00e676" ],
                        ].map(([label, val, c]) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#7a9bbf" }}>{label}</span>
                            <span style={{ color: c, fontWeight: 700 }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <a href={point.url} target="_blank" rel="noopener" style={{
                        display: "block", marginTop: 12, textAlign: "center",
                        padding: 6, borderRadius: 6,
                        background: `${color}20`, border: `1px solid ${color}50`,
                        color, fontSize: 10, textDecoration: "none", fontWeight: 700,
                      }}>🔗 VIEW ON GDACS →</a>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>

      {/* ── SIDE PANEL ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

        <div className="card" style={{ borderTop: `2px solid ${typeInfo.color}` }}>
          <p className="card-title" style={{ display: "flex", justifyContent: "space-between" }}>
            Live Stats
            <span style={{ fontSize: 9, color: "#00e676", fontFamily: "monospace" }}>● LIVE</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[
              { label: "Active Events", value: liveData.length,              color: typeInfo.color },
              { label: "Red Alerts",    value: highCount,                    color: "#ff3b5c"      },
              { label: "Orange Alerts", value: medCount,                     color: "#ffb347"      },
              { label: "Total Deaths",  value: totalDeaths.toLocaleString(), color: "#ff3b5c"      },
            ].map(s => (
              <div key={s.label} style={{ background: "#0a0e1a", borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 10px", background: "#0a0e1a", borderRadius: 6, fontSize: 10, fontFamily: "monospace", color: "#7a9bbf", lineHeight: 1.8 }}>
            📡 Source: GDACS (UN / European Commission)<br />
            🌍 Coverage: Global · All Countries<br />
            🔄 Auto-refreshes every 5 minutes<br />
            📅 Last fetch: {lastUpdated || "—"}
          </div>
        </div>

        <div className="card">
          <p className="card-title">Alert Levels</p>
          {[
            { level: "Red",    label: "High — International response needed", color: "#ff3b5c" },
            { level: "Orange", label: "Medium — Significant regional impact",  color: "#ffb347" },
            { level: "Green",  label: "Low — Monitoring in progress",          color: "#00e676" },
          ].map(a => (
            <div key={a.level} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #1e2d45" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.level}</div>
                <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace" }}>{a.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ flex: 1, overflowY: "auto" }}>
          <p className="card-title">Active Events ({liveData.length})</p>
          {loading && (
            <div style={{ color: "#3a5a7a", fontFamily: "monospace", fontSize: 11, textAlign: "center", padding: 20 }}>
              Loading live events...
            </div>
          )}
          {!loading && liveData.length === 0 && (
            <div style={{ color: "#3a5a7a", fontFamily: "monospace", fontSize: 11, textAlign: "center", padding: 20 }}>
              {error ? "⚠ Could not load data" : "✅ No active events right now"}
            </div>
          )}
          {[...liveData]
            .sort((a, b) => ({ Red: 0, Orange: 1, Green: 2 }[a.alertlevel] ?? 3) - ({ Red: 0, Orange: 1, Green: 2 }[b.alertlevel] ?? 3))
            .map((event, i) => (
              <div key={`${event.eventId}-${i}`} style={{
                padding: "9px 0", borderBottom: "1px solid #1e2d45",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, background: "#0a0e1a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "monospace", fontSize: 10, color: "#7a9bbf", flexShrink: 0,
                  }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{event.name}</div>
                    <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace" }}>{event.country}</div>
                    {event.severity !== "N/A" && (
                      <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace" }}>
                        {Number(event.severity).toFixed(1)} {event.severityUnit}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span className={`badge badge-${event.risk}`} style={{ fontSize: 9 }}>
                    {event.alertlevel.toUpperCase()}
                  </span>
                  {event.deaths > 0 && (
                    <div style={{ fontSize: 10, color: "#ff3b5c", fontFamily: "monospace", marginTop: 3 }}>
                      ✝ {event.deaths.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
