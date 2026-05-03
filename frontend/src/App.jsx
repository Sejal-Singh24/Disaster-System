import { useState } from "react";
import MapView       from "./components/MapView";
import Dashboard     from "./components/Dashboard";
import Chatbot       from "./components/Chatbot";
import AlertFeed     from "./components/AlertFeed";
import DisasterAlarm from "./components/DisasterAlarm";
import "./App.css";

const DISASTER_TYPES = [
  { key: "flood",      label: "🌊 Flood"      },
  { key: "earthquake", label: "🏔️ Earthquake" },
  { key: "cyclone",    label: "🌀 Cyclone"    },
  { key: "drought",    label: "🌵 Drought"    },
  { key: "landslide",  label: "⛰️ Landslide"  },
  { key: "wildfire",   label: "🔥 Wildfire"   },
  { key: "tsunami",    label: "🌊 Tsunami"    },
];

export default function App() {
  const [activeTab,     setActiveTab]     = useState("dashboard");
  const [disasterType,  setDisasterType]  = useState("flood");

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">🌊</span>
          <div>
            <h1 className="logo-title">DisasterGuard India</h1>
            <p className="logo-sub">EM-DAT Disaster Intelligence · 1900–2021</p>
          </div>
        </div>

        <nav className="nav">
          {["map", "dashboard", "alerts", "chatbot"].map((tab) => (
            <button
              key={tab}
              className={`nav-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "map"       && "🗺️ Risk Map"}
              {tab === "dashboard" && "📊 Dashboard"}
              {tab === "alerts"    && "🔔 EMDAT Events"}
              {tab === "chatbot"   && "🤖 AI Assistant"}
            </button>
          ))}
        </nav>

        <div className="live-badge">
          <span className="pulse" />
          EMDAT
        </div>
      </header>

      {/* ── Disaster Type Selector ── */}
      <div style={{
        display        : "flex",
        gap            : 10,
        padding        : "12px 24px",
        background     : "#0d1321",
        borderBottom   : "1px solid #1e2d45",
        overflowX      : "auto",
      }}>
        <span style={{ color: "#7a9bbf", fontSize: 13, alignSelf: "center", whiteSpace: "nowrap" }}>
          Disaster Type:
        </span>
        {DISASTER_TYPES.map((d) => (
          <button
            key={d.key}
            onClick={() => setDisasterType(d.key)}
            style={{
              padding      : "6px 14px",
              borderRadius : 20,
              border       : `1px solid ${disasterType === d.key ? "#00d4ff" : "#1e2d45"}`,
              background   : disasterType === d.key ? "#00d4ff22" : "#0a0e1a",
              color        : disasterType === d.key ? "#00d4ff"   : "#7a9bbf",
              cursor       : "pointer",
              fontSize     : 13,
              fontWeight   : disasterType === d.key ? 700 : 400,
              whiteSpace   : "nowrap",
              transition   : "all 0.2s",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      <main className="main">
        <DisasterAlarm disasterType={disasterType} />

        {activeTab === "map"       && <MapView       disasterType={disasterType} />}
        {activeTab === "dashboard" && <Dashboard     disasterType={disasterType} />}
        {activeTab === "alerts"    && <AlertFeed     disasterType={disasterType} />}
        {activeTab === "chatbot"   && <Chatbot       disasterType={disasterType} />}
      </main>
    </div>
  );
}
