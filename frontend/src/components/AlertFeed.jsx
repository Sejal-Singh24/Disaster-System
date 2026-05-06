import { useState } from "react";

// REAL EVENTS — EM-DAT India flood records
const INITIAL_ALERTS = [
  {
    id: 1,
    year: "2021",
    location: "Maharashtra & Gujarat",
    message: "217 deaths, 3.8L displaced. Pune, Konkan, Satara districts worst hit.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 2,
    year: "2020",
    location: "Assam, Bihar, Gujarat",
    message: "1,922 deaths, 1.3M affected. Deadliest multi-state flood event of 2020.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 3,
    year: "2019",
    location: "Bihar (Sitamarhi, Muzaffarpur)",
    message: "1,900 deaths — worst since 2013. Sheohar, East Champaran heavily affected.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 4,
    year: "2018",
    location: "Kerala (Thrissur, Chengannur)",
    message: "504 deaths, 23.2M affected. Worst Kerala flood in 100 years.",
    severity: "high",
    type: "FLASH FLOOD",
  },
  {
    id: 5,
    year: "2017",
    location: "Bihar, UP, West Bengal",
    message: "514 deaths, 17.2M affected. Araria, Jogbani among worst hit.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 6,
    year: "2016",
    location: "Bihar & Uttar Pradesh",
    message: "254 deaths in Varanasi, Allahabad, Ghazipur region. Prolonged monsoon.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 7,
    year: "2013",
    location: "Uttarakhand (Kedarnath)",
    message: "WORST EVENT: 6,054 deaths — Uttarakhand flash floods. Kedarnath devastated.",
    severity: "high",
    type: "FLASH FLOOD",
  },
  {
    id: 8,
    year: "2008",
    location: "Bihar (Kosi Breach)",
    message: "1,063 deaths, 7.9M affected. Kosi river embankment breached.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 9,
    year: "2007",
    location: "Bihar, UP, Assam, WB",
    message: "1,103 deaths, 18.7M affected. Multi-state disaster.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 10,
    year: "2005",
    location: "Gujarat, Maharashtra, Goa",
    message: "1,200 deaths, 20M affected. Gujarat, MP, Maharashtra, Orissa all hit.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 11,
    year: "2004",
    location: "Bihar (multi-district)",
    message: "900 deaths, 33M affected. Darbhanga, Madhubani, Sitamarhi hit hard.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 12,
    year: "2002",
    location: "Assam (Barpeta, Bongaigaon)",
    message: "549 deaths, 42M affected. Multi-district Assam flood.",
    severity: "high",
    type: "RIVERINE",
  },
  {
    id: 13,
    year: "2015",
    location: "Gujarat, Maharashtra, TN",
    message: "839 deaths, 16.4M affected. Kachchh, Patan among worst hit.",
    severity: "medium",
    type: "RIVERINE",
  },
  {
    id: 14,
    year: "2014",
    location: "Jammu & Kashmir",
    message: "298 deaths. Worst J&K floods in decades. Srinagar submerged.",
    severity: "medium",
    type: "RIVERINE",
  },
  {
    id: 15,
    year: "2010",
    location: "J&K Leh (Cloudburst)",
    message: "196 deaths. Flash flood in Leh and Cholglamsar from cloudburst.",
    severity: "medium",
    type: "FLASH FLOOD",
  },
  {
    id: 16,
    year: "2009",
    location: "Karnataka (Belgaum, Gulbarga)",
    message: "355 deaths, 4.1M affected. Bijapur, Raichur, Dharwad also hit.",
    severity: "medium",
    type: "RIVERINE",
  },
  {
    id: 17,
    year: "2003",
    location: "Assam, Bihar, Tripura, WB",
    message: "142 deaths, 4.55M affected. Prolonged monsoon floods across NE.",
    severity: "medium",
    type: "RIVERINE",
  },
  {
    id: 18,
    year: "2000",
    location: "Bihar + West Bengal",
    message: "2,086 deaths, 46.6M affected. One of India's largest flood events.",
    severity: "high",
    type: "RIVERINE",
  },
];

// Color for each type.
const TYPE_COLORS = {
  "RIVERINE":    "#00d4ff",
  "FLASH FLOOD": "#ff3b5c",
  "COASTAL":     "#00e676",
};

export default function AlertFeed() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Apply both filter and search together.
  const filtered = INITIAL_ALERTS.filter((a) => {
    const matchSev = filter === "all" || a.severity === filter;
    const matchSearch =
      search === "" ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.year.includes(search);
    return matchSev && matchSearch;
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

      {/* ── MAIN FEED ── */}
      <div>

        {/* Filter buttons + Search bar */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 14,
          alignItems: "center", flexWrap: "wrap",
        }}>
          {["all", "high", "medium"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: 700,
                background:
                  filter === f
                    ? f === "high"   ? "#ff3b5c"
                    : f === "medium" ? "#ffb347"
                    :                  "#00d4ff"
                    : "transparent",
                borderColor:
                  f === "high"   ? "#ff3b5c"
                  : f === "medium" ? "#ffb347"
                  :                  "#00d4ff",
                color: filter === f ? "#0a0e1a" : "#e8f4fd",
                transition: "all 0.2s",
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}

          {/* Search box */}
          <input
            placeholder="Search by year, state, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: "#0a0e1a",
              border: "1px solid #1e2d45",
              borderRadius: 8,
              padding: "6px 12px",
              color: "#e8f4fd",
              fontFamily: "monospace",
              fontSize: 12,
              outline: "none",
            }}
          />
        </div>

        {/* Dataset info banner */}
        <div style={{
          padding: "10px 14px",
          background: "rgba(0,212,255,0.06)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 11,
          color: "#7a9bbf",
          marginBottom: 14,
        }}>
          📊 Real events from{" "}
          <strong style={{ color: "#00d4ff" }}>
            EM-DAT International Disaster Database
          </strong>
          &nbsp;· India Floods · {filtered.length} events shown
        </div>

        {/* Alert cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className="card"
              style={{
                borderLeft: `3px solid ${TYPE_COLORS[alert.type] || "#7a9bbf"}`,
                padding: 16,
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}>
                <div style={{ flex: 1 }}>

                  {/* Type badge + Location */}
                  <div style={{
                    display: "flex", gap: 8,
                    alignItems: "center",
                    marginBottom: 6,
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      background: `${TYPE_COLORS[alert.type] || "#7a9bbf"}20`,
                      color:       TYPE_COLORS[alert.type] || "#7a9bbf",
                      border:     `1px solid ${TYPE_COLORS[alert.type] || "#7a9bbf"}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 10,
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}>
                      {alert.type}
                    </span>

                    <span style={{
                      fontSize: 11,
                      color: "#7a9bbf",
                      fontFamily: "monospace",
                    }}>
                      📍 {alert.location}
                    </span>
                  </div>

                  {/* Alert message */}
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "#c8dff0" }}>
                    {alert.message}
                  </p>
                </div>

                {/* Year */}
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#00d4ff",
                  marginLeft: 16,
                  flexShrink: 0,
                }}>
                  {alert.year}
                </div>
              </div>
            </div>
          ))}

          {/*No result found. */}
          {filtered.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: 40,
              color: "#7a9bbf",
              fontFamily: "monospace",
            }}>
              No events found. Try changing the filter.
            </div>
          )}
        </div>
      </div>

      {/* ── SIDE PANEL ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* EMDAT Summary */}
        <div className="card" style={{ borderTop: "2px solid #ff3b5c" }}>
          <p className="card-title">EMDAT Summary</p>
          {[
            { label: "Total Deaths (2000–21)", value: "36,503",    color: "#ff3b5c" },
            { label: "People Affected",         value: "298M+",    color: "#ffb347" },
            { label: "Flood Events",            value: "181",      color: "#00d4ff" },
            { label: "Dataset Period",          value: "1900–2021",color: "#00e676" },
          ].map((s) => (
            <div key={s.label} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #1e2d45",
            }}>
              <span style={{ fontSize: 12, color: "#b0c8e0" }}>{s.label}</span>
              <span style={{
                fontWeight: 800,
                color: s.color,
                fontFamily: "monospace",
                fontSize: 13,
              }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Most affected states */}
        <div className="card">
          <p className="card-title">Most Affected States</p>
          {[
            { state: "Assam",          events: 69, color: "#ff3b5c" },
            { state: "Uttar Pradesh",  events: 60, color: "#ff3b5c" },
            { state: "Bihar",          events: 45, color: "#ff3b5c" },
            { state: "West Bengal",    events: 44, color: "#ff3b5c" },
            { state: "Gujarat",        events: 43, color: "#ffb347" },
            { state: "Kerala",         events: 32, color: "#ffb347" },
            { state: "Andhra Pradesh", events: 31, color: "#ffb347" },
          ].map((s) => (
            <div key={s.state} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #1e2d45",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 12, fontFamily: "monospace" }}>
                {s.state}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: s.color,
                fontFamily: "monospace",
                background: `${s.color}15`,
                padding: "2px 8px",
                borderRadius: 4,
              }}>
                {s.events} events
              </span>
            </div>
          ))}
        </div>

        {/* Emergency contacts */}
        <div className="card" style={{
          background: "rgba(255,59,92,0.06)",
          borderColor: "#ff3b5c",
        }}>
          <p className="card-title" style={{ color: "#ff3b5c" }}>
            Emergency Contacts
          </p>
          {[
            { name: "NDMA Helpline", num: "1078" },
            { name: "Flood Relief",  num: "1070" },
            { name: "Police",        num: "100"  },
            { name: "Ambulance",     num: "108"  },
          ].map((c) => (
            <div key={c.name} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,59,92,0.2)",
            }}>
              <span style={{ fontSize: 12, color: "#c8dff0" }}>{c.name}</span>
              <span style={{
                fontWeight: 800,
                color: "#ff3b5c",
                fontFamily: "monospace",
              }}>
                {c.num}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}