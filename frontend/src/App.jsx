import { useState } from "react";
import "./App.css";
import AlertFeed from "./components/AlertFeed";
import Chatbot from "./components/Chatbot";
import Dashboard from "./components/Dashboard";
import DisasterAlarm from "./components/DisasterAlarm"; // ← Line 1: ADD
import MapView from "./components/MapView";

export default function App() {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-icon">🌊</span>
          <div>
            <h1 className="logo-title">FloodGuard India</h1>
            <p className="logo-sub">EM-DAT Disaster Intelligence · 1900–2021</p>
          </div>
        </div>
        <nav className="nav">
          {["map", "dashboard", "alerts", "chatbot"].map((tab) => (
            <button key={tab} className={`nav-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab === "map"       && "🗺️ Risk Map"}
              {tab === "dashboard" && "📊 Dashboard"}
              {tab === "alerts"    && "🔔 EMDAT Events"}
              {tab === "chatbot"   && "🤖 AI Assistant"}
            </button>
          ))}
        </nav>
        <div className="live-badge"><span className="pulse" />EMDAT</div>
      </header>

      <main className="main">
        <DisasterAlarm />   {/* ← Line 2: ADD — yeh bas yahan add karo */}

        {activeTab === "map"       && <MapView />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "alerts"    && <AlertFeed />}
        {activeTab === "chatbot"   && <Chatbot />}
      </main>
    </div>
  );
}