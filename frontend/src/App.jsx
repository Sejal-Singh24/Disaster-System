import MLEvaluation from "./pages/MLEvaluation";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import AlertFeed from "./components/AlertFeed";
import Chatbot from "./components/Chatbot";
import Dashboard from "./components/Dashboard";
import DisasterAlarm from "./components/DisasterAlarm";
import MapView from "./components/MapView";

const DISASTER_TYPES = [
  { key: "flood",      label: "🌊 Flood"      },
  { key: "earthquake", label: "🏔️ Earthquake" },
  { key: "cyclone",    label: "🌀 Cyclone"    },
  { key: "drought",    label: "🌵 Drought"    },
  { key: "landslide",  label: "⛰️ Landslide"  },
  { key: "wildfire",   label: "🔥 Wildfire"   },
  { key: "tsunami",    label: "🌊 Tsunami"    },
];

const DISASTER_COLORS = {
  flood:      "#00d4ff",
  earthquake: "#ff6b35",
  cyclone:    "#a855f7",
  drought:    "#f59e0b",
  landslide:  "#84cc16",
  wildfire:   "#ef4444",
  tsunami:    "#06b6d4",
};

// ── Animated content wrapper ──────────────────────────────
function AnimatedPane({ id, children }) {
  const [visible, setVisible]   = useState(false);
  const [content, setContent]   = useState(children);
  const [animKey, setAnimKey]   = useState(id);
  const prevId = useRef(id);

  useEffect(() => {
    if (id === prevId.current) {
      // first mount
      setVisible(true);
      return;
    }
    // id changed — fade out, swap, fade in
    setVisible(false);
    const t = setTimeout(() => {
      setContent(children);
      setAnimKey(id);
      prevId.current = id;
      setVisible(true);
    }, 220);
    return () => clearTimeout(t);
  }, [id]);

  // keep content fresh while visible
  useEffect(() => {
    if (visible) setContent(children);
  }, [children]);

  return (
    <div style={{
      opacity:   visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.99)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
      willChange: "opacity, transform",
    }}>
      {content}
    </div>
  );
}

export default function App() {
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [disasterType, setDisasterType] = useState("flood");
  const [mapFilter, setMapFilter] = useState({ mode: "global", country: "all", state: "all" });
  const [prevDisaster, setPrevDisaster] = useState("flood");
  const [tabChanging,  setTabChanging]  = useState(false);

  const accentColor = DISASTER_COLORS[disasterType] || "#00d4ff";

  // Handle disaster type switch with animation
  const handleDisasterChange = (key) => {
    if (key === disasterType) return;
    setPrevDisaster(disasterType);
    setDisasterType(key);
  };

  // Handle tab switch
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setTabChanging(true);
    // Map ke alawa baaki tabs pe India ka data dikhao
    if (tab !== "map") {
      setMapFilter({ mode: "country", country: "India", state: "all" });
    }
    setTimeout(() => {
      setActiveTab(tab);
      setTabChanging(false);
    }, 180);
  };

  return (
    <div className="app">
      <style>{`
        @keyframes tabUnderline {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes disasterPulse {
          0%   { box-shadow: 0 0 0 0 ${accentColor}60; }
          70%  { box-shadow: 0 0 0 8px ${accentColor}00; }
          100% { box-shadow: 0 0 0 0 ${accentColor}00; }
        }
        .disaster-btn-active {
          animation: disasterPulse 0.5s ease forwards;
        }
        .nav-btn-enhanced {
          position: relative;
          overflow: hidden;
        }
        .nav-btn-enhanced::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #00d4ff;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .nav-btn-enhanced.active::after {
          transform: scaleX(1);
        }
      `}</style>

      <div style={{ position:"sticky", top:0, zIndex:1000 }}>
      <header className="header">
        <div className="header-left">
          {/* Logo icon color matches current disaster */}
          <span className="logo-icon" style={{
            filter: `drop-shadow(0 0 8px ${accentColor}80)`,
            transition: "filter 0.4s ease",
          }}>🌊</span>
          <div>
            <h1 className="logo-title" style={{
              background: `linear-gradient(90deg, #ffffff, ${accentColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: "all 0.4s ease",
            }}>DisasterGuard India</h1>
            <p className="logo-sub">EM-DAT Disaster Intelligence · 1900–2021</p>
          </div>
        </div>

        <nav className="nav">
          {["map", "dashboard", "alerts", "chatbot", "ml"].map((tab) => (
            <button
              key={tab}
              className={`nav-btn nav-btn-enhanced ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
              style={{
                transition: "all 0.2s ease",
                transform: activeTab === tab ? "translateY(-1px)" : "translateY(0)",
              }}
            >
              {tab === "map"       && "🗺️ Risk Map"}
              {tab === "dashboard" && "📊 Dashboard"}
              {tab === "alerts"    && "🔔 EMDAT Events"}
              {tab === "chatbot"   && "🤖 AI Assistant"}
              {tab === "ml"        && "📈 ML Evaluation"}
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
          display      : "flex",
          gap          : 10,
          padding      : "12px 24px",
          background   : "#0d1321",
          borderBottom : `1px solid ${accentColor}30`,
          overflowX    : "auto",
          transition   : "border-color 0.4s ease",
        }}>
        <span style={{ color: "#7a9bbf", fontSize: 13, alignSelf: "center", whiteSpace: "nowrap" }}>
          Disaster Type:
        </span>
        {DISASTER_TYPES.map((d) => {
          const isActive = disasterType === d.key;
          const color    = DISASTER_COLORS[d.key];
          return (
            <button
              key={d.key}
              onClick={() => handleDisasterChange(d.key)}
              className={isActive ? "disaster-btn-active" : ""}
              style={{
                padding      : "6px 14px",
                borderRadius : 20,
                border       : `1px solid ${isActive ? color : "#1e2d45"}`,
                background   : isActive ? `${color}22` : "#0a0e1a",
                color        : isActive ? color : "#7a9bbf",
                cursor       : "pointer",
                fontSize     : 13,
                fontWeight   : isActive ? 700 : 400,
                whiteSpace   : "nowrap",
                transition   : "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                transform    : isActive ? "translateY(-2px)" : "translateY(0)",
                boxShadow    : isActive ? `0 4px 16px ${color}30` : "none",
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
    <main className="main">
      {/* Alert always visible, animates on disaster change */}
      <DisasterAlarm disasterType={disasterType} mapFilter={mapFilter} />
        {/* Tab content fades on tab switch */}
        <div style={{
          opacity:   tabChanging ? 0 : 1,
          transform: tabChanging ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}>
          {/* Dashboard & Map animate on disaster type change */}
          {activeTab === "dashboard" && (
            <AnimatedPane id={`dashboard-${disasterType}`}>
              <Dashboard disasterType={disasterType} />
            </AnimatedPane>
          )}
          {activeTab === "map" && (
            <AnimatedPane id={`map-${disasterType}`}>
              <MapView disasterType={disasterType} onFilterChange={setMapFilter} />
            </AnimatedPane>
          )}
          {activeTab === "alerts" && (
            <AnimatedPane id={`alerts-${disasterType}`}>
              <AlertFeed disasterType={disasterType} />
            </AnimatedPane>
          )}
          {activeTab === "chatbot" && (
            <AnimatedPane id={`chatbot-${disasterType}`}>
              <Chatbot disasterType={disasterType} />
            </AnimatedPane>
          )}
          {activeTab === "ml" && (
            <AnimatedPane id="ml-evaluation">
             <MLEvaluation />
             </AnimatedPane>
          )}
        </div>
      </main>
    </div>
  );
}
