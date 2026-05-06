import axios from "axios";
import { useEffect, useRef, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

// ── Disaster Theme Config ─────────────────────────────────
const DISASTER_THEMES = {
  flood      : { color: "#00d4ff", bg: "#00d4ff08", icon: "🌊", label: "Flood"      },
  earthquake : { color: "#ff6b35", bg: "#ff6b3508", icon: "🏔️", label: "Earthquake" },
  cyclone    : { color: "#a855f7", bg: "#a855f708", icon: "🌀", label: "Cyclone"    },
  drought    : { color: "#f59e0b", bg: "#f59e0b08", icon: "🌵", label: "Drought"    },
  landslide  : { color: "#84cc16", bg: "#84cc1608", icon: "⛰️", label: "Landslide"  },
  wildfire   : { color: "#ef4444", bg: "#ef444408", icon: "🔥", label: "Wildfire"   },
  tsunami    : { color: "#06b6d4", bg: "#06b6d408", icon: "🌊", label: "Tsunami"    },
  weather    : { color: "#00e676", bg: "#00e67608", icon: "🌤️", label: "Weather"    },
  default    : { color: "#00d4ff", bg: "#00d4ff08", icon: "🛡️", label: "General"   },
};

const SEVERITY_BADGES = {
  Critical : { color: "#E24B4A", bg: "#E24B4A20", emoji: "🔴" },
  High     : { color: "#EF9F27", bg: "#EF9F2720", emoji: "🟠" },
  Medium   : { color: "#185FA5", bg: "#185FA520", emoji: "🟡" },
  Low      : { color: "#639922", bg: "#63992220", emoji: "🟢" },
};

const DISASTER_PILLS = [
  { key: "flood",      icon: "🌊", label: "Flood",      query: "Moradabad flood risk"    },
  { key: "earthquake", icon: "🏔️", label: "Quake",      query: "Delhi earthquake risk"   },
  { key: "cyclone",    icon: "🌀", label: "Cyclone",    query: "Mumbai cyclone risk"     },
  { key: "drought",    icon: "🌵", label: "Drought",    query: "Jaipur drought risk"     },
  { key: "landslide",  icon: "⛰️", label: "Landslide",  query: "Dehradun landslide risk" },
  { key: "wildfire",   icon: "🔥", label: "Wildfire",   query: "Nainital wildfire risk"  },
  { key: "tsunami",    icon: "🌊", label: "Tsunami",    query: "Chennai tsunami risk"    },
  { key: "weather",    icon: "🌤️", label: "Weather",    query: "Delhi weather"           },
];

const AUTO_SUGGESTIONS = [
  "Delhi earthquake risk",
  "Mumbai cyclone risk",
  "Jaipur drought risk",
  "Chennai tsunami risk",
  "Dehradun landslide risk",
  "Nainital wildfire risk",
  "Moradabad flood risk",
  "Delhi weather",
  "Lucknow weather",
  "2013 Uttarakhand flood",
  "Kerala 2018 flood",
  "Bihar flood history",
  "India’s worst flood.",
  "2001 Bhuj earthquake",
  "2004 tsunami India",
  "Assam flood history",
  "Odisha cyclone",
  "Kedarnath disaster",
];

const WELCOME = `Namaste! 🙏 Main **DisasterGuard AI** hoon.

Mujhse poochh sakte ho:
🌊 Flood · 🏔️ Earthquake · 🌀 Cyclone
🌵 Drought · ⛰️ Landslide · 🔥 Wildfire · 🌊 Tsunami

Hindi ya English mein — koi bhi disaster risk poochho!`;

// ── Detect disaster type from text ────────────────────────
function detectDisaster(text) {
  const t = text.toLowerCase();
  if (t.includes("flood") || t.includes("baarish"))    return "flood";
  if (t.includes("earthquake") || t.includes("bhukamp")) return "earthquake";
  if (t.includes("cyclone") || t.includes("toofan"))   return "cyclone";
  if (t.includes("drought") || t.includes("sukha"))    return "drought";
  if (t.includes("landslide"))                         return "landslide";
  if (t.includes("wildfire") || t.includes("fire"))    return "wildfire";
  if (t.includes("tsunami"))                           return "tsunami";
  if (t.includes("weather") || t.includes("mausam"))  return "weather";
  return "default";
}

// ── Detect severity from response ─────────────────────────
function detectSeverity(text) {
  if (text.includes("Critical")) return "Critical";
  if (text.includes("High"))     return "High";
  if (text.includes("Medium"))   return "Medium";
  if (text.includes("Low"))      return "Low";
  return null;
}

// ── Group messages by time ────────────────────────────────
function getTimeGroup(time) {
  const now  = new Date();
  const hour = now.getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 20) return "Evening";
  return "Night";
}

export default function Chatbot({ disasterType = "flood" }) {
  const [messages,    setMessages]    = useState([{
    id: 0, role: "assistant", text: WELCOME,
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    disaster: "default", reactions: { up: 0, down: 0 },
  }]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTheme, setActiveTheme] = useState("default");
  const [showScroll,  setShowScroll]  = useState(false);
  const [copied,      setCopied]      = useState(null);
  const [isListening, setIsListening] = useState(false);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const scrollRef    = useRef(null);
  const msgIdRef     = useRef(1);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll detection
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScroll(scrollHeight - scrollTop - clientHeight > 100);
  };

  // Auto-suggestions
  useEffect(() => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      return;
    }
    const q      = input.toLowerCase();
    const filtered = AUTO_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 4);
    setSuggestions(filtered);
  }, [input]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    setSuggestions([]);
    const time     = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const disaster = detectDisaster(userText);
    setActiveTheme(disaster);

    const userMsg = { id: msgIdRef.current++, role: "user", text: userText, time, disaster, reactions: { up: 0, down: 0 } };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/chatbot`, { message: userText }, { timeout: 15000 });
      const responseText = res.data.response || "Jawab nahi mila.";
      setMessages(prev => [...prev, {
        id: msgIdRef.current++, role: "assistant",
        text: responseText, time, disaster,
        severity: detectSeverity(responseText),
        reactions: { up: 0, down: 0 },
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: msgIdRef.current++, role: "assistant",
        text: "❌ Backend se connection nahi ho paya.\nServer check karo: http://localhost:8000",
        time, disaster: "default", isError: true, reactions: { up: 0, down: 0 },
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === "Escape") setSuggestions([]);
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const react = (id, type) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, reactions: { ...m.reactions, [type]: m.reactions[type] + 1 } } : m
    ));
  };

  const clearChat = () => {
    setMessages([{
      id: 0, role: "assistant", text: WELCOME,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      disaster: "default", reactions: { up: 0, down: 0 },
    }]);
    setActiveTheme("default");
  };

  // Voice input
  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input sirf Chrome mein kaam karta hai!");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onresult = e => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const theme = DISASTER_THEMES[activeTheme] || DISASTER_THEMES.default;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .cg-root {
          display: grid;
          grid-template-columns: 1fr 290px;
          gap: 18px;
          height: calc(100vh - 180px);
          font-family: 'Syne', sans-serif;
        }

        .cg-chat {
          display: flex;
          flex-direction: column;
          background: #080d18;
          border: 1px solid #1a2640;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          transition: border-color 0.4s;
        }

        .cg-chat-top-bar {
          height: 2px;
          background: linear-gradient(90deg, ${theme.color}, #0080ff, #7c3aed, ${theme.color});
          background-size: 200%;
          animation: gradientShift 3s linear infinite;
          transition: background 0.5s;
        }

        @keyframes gradientShift {
          0%   { background-position: 0%; }
          100% { background-position: 200%; }
        }

        /* ── Header ── */
        .cg-header {
          padding: 14px 18px;
          border-bottom: 1px solid #1a2640;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(8,13,24,0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .cg-avatar {
          width: 42px; height: 42px;
          border-radius: 13px;
          background: ${theme.bg};
          border: 1px solid ${theme.color}44;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          position: relative;
          transition: all 0.3s;
        }

        .cg-avatar::after {
          content: '';
          position: absolute; bottom: -2px; right: -2px;
          width: 9px; height: 9px;
          background: #00e676; border-radius: 50%;
          border: 2px solid #080d18;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.8); }
        }

        .cg-title { font-size: 14px; font-weight: 800; color: #e8f4fd; }

        .cg-badges {
          display: flex; gap: 5px; margin-top: 3px; flex-wrap: wrap;
        }

        .cg-badge {
          font-size: 9px; font-family: 'JetBrains Mono', monospace;
          padding: 2px 6px; border-radius: 4px;
          background: ${theme.bg}; border: 1px solid ${theme.color}33;
          color: ${theme.color};
          transition: all 0.3s;
        }

        .cg-header-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 8px;
        }

        .cg-clear-btn {
          background: #ff3b5c15; border: 1px solid #ff3b5c30;
          color: #ff3b5c; border-radius: 8px;
          padding: 5px 10px; font-size: 11px; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 600;
          transition: all 0.2s;
        }
        .cg-clear-btn:hover { background: #ff3b5c25; }

        .cg-status {
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          color: ${loading ? "#ffb347" : "#00e676"};
          display: flex; align-items: center; gap: 4px;
        }

        /* ── Disaster Pills ── */
        .cg-pills {
          display: flex; gap: 6px; padding: 10px 18px;
          border-bottom: 1px solid #0f1828;
          overflow-x: auto; scrollbar-width: none;
          background: #080d18;
        }
        .cg-pills::-webkit-scrollbar { display: none; }

        .cg-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 20px;
          border: 1px solid #1a2640; background: #0a0f1e;
          cursor: pointer; white-space: nowrap;
          font-size: 11px; font-weight: 600;
          color: #4a6a8f; transition: all 0.18s;
          flex-shrink: 0;
        }

        .cg-pill:hover, .cg-pill.active {
          border-color: ${theme.color}55;
          background: ${theme.bg};
          color: ${theme.color};
          transform: translateY(-1px);
        }

        /* ── Messages ── */
        .cg-messages {
          flex: 1; overflow-y: auto; padding: 18px;
          display: flex; flex-direction: column; gap: 14px;
          scrollbar-width: thin; scrollbar-color: #1a2640 transparent;
          background: ${theme.bg};
          transition: background 0.5s;
        }
        .cg-messages::-webkit-scrollbar { width: 3px; }
        .cg-messages::-webkit-scrollbar-thumb { background: #1a2640; border-radius: 3px; }

        .cg-time-group {
          text-align: center; font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          color: #1a3050; padding: 4px 0;
        }

        .cg-msg-row {
          display: flex; gap: 8px;
          animation: msgIn 0.25s ease-out;
        }
        .cg-msg-row.user { justify-content: flex-end; }

        @keyframes msgIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .cg-bot-icon {
          width: 28px; height: 28px; border-radius: 9px;
          background: ${theme.bg}; border: 1px solid ${theme.color}33;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0; align-self: flex-end;
          transition: all 0.3s;
        }

        .cg-bubble-wrap { display: flex; flex-direction: column; gap: 4px; max-width: 76%; }
        .cg-msg-row.user .cg-bubble-wrap { align-items: flex-end; }

        .cg-severity-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 6px;
          font-size: 10px; font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          align-self: flex-start;
        }

        .cg-bubble {
          padding: 11px 15px; border-radius: 16px;
          position: relative; width: 100%;
        }
        .cg-bubble.bot {
          background: #0f1828; border: 1px solid #1a2640;
          border-bottom-left-radius: 4px;
        }
        .cg-bubble.user {
          background: linear-gradient(135deg, ${theme.color}15, #0080ff12);
          border: 1px solid ${theme.color}33;
          border-bottom-right-radius: 4px;
        }
        .cg-bubble.error { background: #ff3b5c08; border-color: #ff3b5c25; }

        .cg-bubble-text {
          font-size: 13px; line-height: 1.65;
          white-space: pre-wrap; color: #d0e8ff;
          font-family: 'Syne', sans-serif;
        }

        .cg-bubble-footer {
          display: flex; justify-content: space-between;
          align-items: center; margin-top: 8px; gap: 8px;
        }

        .cg-bubble-time {
          font-size: 9px; color: #1a3050;
          font-family: 'JetBrains Mono', monospace;
        }

        .cg-bubble-actions {
          display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;
        }
        .cg-bubble:hover .cg-bubble-actions { opacity: 1; }

        .cg-action-btn {
          background: #1a2640; border: none; border-radius: 6px;
          padding: 3px 7px; font-size: 11px; cursor: pointer;
          color: #4a6a8f; transition: all 0.15s; display: flex;
          align-items: center; gap: 3px;
        }
        .cg-action-btn:hover { background: #243550; color: #e8f4fd; }
        .cg-action-btn.copied { color: #00e676; }

        /* ── Typing ── */
        .cg-typing { display: flex; gap: 8px; align-items: center; }
        .cg-typing-dots {
          background: #0f1828; border: 1px solid #1a2640;
          border-radius: 16px; border-bottom-left-radius: 4px;
          padding: 12px 16px; display: flex; gap: 5px; align-items: center;
        }
        .cg-dot {
          width: 6px; height: 6px; border-radius: 50%;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        .cg-dot:nth-child(1) { background: ${theme.color}; }
        .cg-dot:nth-child(2) { background: #0080ff; animation-delay: 0.2s; }
        .cg-dot:nth-child(3) { background: #7c3aed; animation-delay: 0.4s; }

        @keyframes typingBounce {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30%          { transform:translateY(-6px); opacity:1; }
        }

        /* ── Scroll to bottom ── */
        .cg-scroll-btn {
          position: absolute; bottom: 80px; right: 20px;
          width: 36px; height: 36px; border-radius: 50%;
          background: ${theme.color}; border: none;
          color: #080d18; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px ${theme.color}44;
          transition: all 0.2s; z-index: 10;
          animation: fadeIn 0.2s ease;
        }
        .cg-scroll-btn:hover { transform: scale(1.1); }

        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        /* ── Input ── */
        .cg-input-area {
          padding: 12px 16px; border-top: 1px solid #1a2640;
          background: rgba(8,13,24,0.9);
          backdrop-filter: blur(12px);
          position: relative;
        }

        .cg-suggestions {
          position: absolute; bottom: 100%; left: 16px; right: 16px;
          background: #0f1828; border: 1px solid #1a2640;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 -8px 24px #00000044;
          z-index: 100;
        }

        .cg-suggestion {
          padding: 9px 14px; font-size: 12px; color: #7a9bbf;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Syne', sans-serif; border-bottom: 1px solid #1a2640;
          display: flex; align-items: center; gap: 8px;
        }
        .cg-suggestion:last-child { border-bottom: none; }
        .cg-suggestion:hover { background: #1a2640; color: #e8f4fd; }

        .cg-input-row {
          display: flex; gap: 8px; align-items: flex-end;
        }

        .cg-textarea-wrap {
          flex: 1; background: #0a0f1e;
          border: 1px solid ${focused ? theme.color + "44" : "#1a2640"};
          border-radius: 13px; padding: 9px 13px;
          transition: all 0.2s;
          box-shadow: ${focused ? `0 0 0 3px ${theme.color}08` : "none"};
        }

        .cg-textarea {
          width: 100%; background: transparent; border: none; outline: none;
          color: #d0e8ff; font-family: 'Syne', sans-serif;
          font-size: 13px; line-height: 1.5; resize: none;
          min-height: 20px; max-height: 80px;
        }
        .cg-textarea::placeholder { color: #1a3050; }

        .cg-btn-group { display: flex; gap: 6px; }

        .cg-icon-btn {
          width: 40px; height: 40px; border-radius: 12px; border: 1px solid #1a2640;
          background: #0a0f1e; color: #4a6a8f; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .cg-icon-btn:hover { border-color: ${theme.color}44; color: ${theme.color}; }
        .cg-icon-btn.listening { background: #ff3b5c20; border-color: #ff3b5c; color: #ff3b5c; animation: micPulse 1s infinite; }

        @keyframes micPulse {
          0%,100% { box-shadow: 0 0 0 0 #ff3b5c44; }
          50%      { box-shadow: 0 0 0 6px #ff3b5c00; }
        }

        .cg-send-btn {
          width: 40px; height: 40px; border-radius: 12px; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; transition: all 0.2s;
        }
        .cg-send-btn.active {
          background: linear-gradient(135deg, ${theme.color}, #0080ff);
          color: #080d18;
          box-shadow: 0 4px 14px ${theme.color}44;
        }
        .cg-send-btn.active:hover { transform: scale(1.08); }
        .cg-send-btn.disabled { background: #0f1828; color: #1a3050; cursor: not-allowed; }

        /* ── Side Panel ── */
        .cg-side { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }

        .cg-panel {
          background: #080d18; border: 1px solid #1a2640; border-radius: 16px; padding: 14px;
        }

        .cg-panel-title {
          font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #2a4060;
          margin-bottom: 10px; font-family: 'JetBrains Mono', monospace;
        }

        .cg-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }

        .cg-quick-btn {
          background: #0a0f1e; border: 1px solid #1a2640; border-radius: 9px;
          padding: 7px 9px; cursor: pointer; transition: all 0.15s;
          text-align: left; display: flex; align-items: center; gap: 5px;
        }
        .cg-quick-btn:hover {
          border-color: ${theme.color}44; background: ${theme.bg};
          transform: translateY(-1px);
        }
        .cg-quick-label {
          font-size: 10px; color: #3a5a7f; font-weight: 600;
          font-family: 'Syne', sans-serif; line-height: 1.2;
        }
        .cg-quick-btn:hover .cg-quick-label { color: ${theme.color}; }

        .cg-stat-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 5px 0; border-bottom: 1px solid #0a1020;
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
        }
        .cg-stat-row:last-child { border-bottom: none; }
        .cg-stat-key { color: #2a4060; }
        .cg-stat-val { color: ${theme.color}; font-weight: 500; }

        .cg-theme-indicator {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px;
          background: ${theme.bg}; border: 1px solid ${theme.color}33;
          font-size: 11px; color: ${theme.color};
          font-family: 'JetBrains Mono', monospace; margin-bottom: 8px;
          transition: all 0.4s;
        }

        @media (max-width: 768px) {
          .cg-root { grid-template-columns: 1fr; }
          .cg-side { display: none; }
        }
      `}</style>

      <div className="cg-root">

        {/* ── CHAT PANEL ── */}
        <div 
  className="cg-chat chatbot-main" 
  style={{ 
    borderColor: theme.color + "55",
    boxShadow: `0 0 25px ${theme.color}55`
  }}
>
          <div className="cg-chat-top-bar" style={{ background: `linear-gradient(90deg, ${theme.color}, #0080ff, #7c3aed, ${theme.color})`, backgroundSize: "200%", animation: "gradientShift 3s linear infinite" }} />

          {/* Header — Glassmorphism */}
          <div className="cg-header">
            <div className="cg-avatar" style={{ background: theme.bg, borderColor: theme.color + "44" }}>
              {theme.icon}
            </div>
            <div>
              <div className="cg-title">
  🤖 DisasterGuard AI 
  <span style={{
    marginLeft: "8px",
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "6px",
    background: "#00e67620",
    color: "#00e676",
    fontWeight: "700"
  }}>
    MAIN
  </span>
</div>
              <div className="cg-badges">
                <span className="cg-badge">ML Model</span>
                <span className="cg-badge">EMDAT 1900–2021</span>
                <span className="cg-badge" style={{ background: theme.bg, borderColor: theme.color + "33", color: theme.color }}>
                  {theme.icon} {theme.label}
                </span>
              </div>
            </div>
            <div className="cg-header-right">
              <div className="cg-status">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "#ffb347" : "#00e676", display: "inline-block" }} />
                {loading ? "Thinking..." : "Online"}
              </div>
              <button className="cg-clear-btn" onClick={clearChat}>✕ Clear</button>
            </div>
          </div>

          {/* Disaster Pills */}
          <div className="cg-pills">
            {DISASTER_PILLS.map(p => (
              <button
                key={p.key}
                className={`cg-pill ${activeTheme === p.key ? "active" : ""}`}
                onClick={() => { setActiveTheme(p.key); sendMessage(p.query); }}
                style={activeTheme === p.key ? { borderColor: DISASTER_THEMES[p.key].color + "55", background: DISASTER_THEMES[p.key].bg, color: DISASTER_THEMES[p.key].color } : {}}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="cg-messages" ref={scrollRef} onScroll={handleScroll} style={{ background: theme.bg, transition: "background 0.5s" }}>
            <div className="cg-time-group">— {getTimeGroup()} —</div>

            {messages.map((msg, i) => (
              <div key={msg.id} className={`cg-msg-row ${msg.role === "user" ? "user" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="cg-bot-icon" style={{ background: theme.bg, borderColor: theme.color + "33" }}>
                    {DISASTER_THEMES[msg.disaster]?.icon || "🛡️"}
                  </div>
                )}
                <div className="cg-bubble-wrap">
                  {/* Severity Badge */}
                  {msg.severity && SEVERITY_BADGES[msg.severity] && (
                    <div
                      className="cg-severity-badge"
                      style={{ background: SEVERITY_BADGES[msg.severity].bg, color: SEVERITY_BADGES[msg.severity].color, border: `1px solid ${SEVERITY_BADGES[msg.severity].color}44` }}
                    >
                      {SEVERITY_BADGES[msg.severity].emoji} {msg.severity} Risk
                    </div>
                  )}
                  <div className={`cg-bubble ${msg.role === "assistant" ? "bot" : "user"} ${msg.isError ? "error" : ""}`}
                    style={msg.role === "user" ? { background: `linear-gradient(135deg, ${theme.color}15, #0080ff12)`, borderColor: theme.color + "33" } : {}}
                  >
                    <div className="cg-bubble-text">{msg.text}</div>
                    <div className="cg-bubble-footer">
                      <span className="cg-bubble-time">{msg.time}</span>
                      <div className="cg-bubble-actions">
                        {/* Reactions */}
                        <button className="cg-action-btn" onClick={() => react(msg.id, "up")}>
                          👍 {msg.reactions.up > 0 && msg.reactions.up}
                        </button>
                        <button className="cg-action-btn" onClick={() => react(msg.id, "down")}>
                          👎 {msg.reactions.down > 0 && msg.reactions.down}
                        </button>
                        {/* Copy */}
                        <button
                          className={`cg-action-btn ${copied === msg.id ? "copied" : ""}`}
                          onClick={() => copyMessage(msg.id, msg.text)}
                        >
                          {copied === msg.id ? "✓ Copied" : "⎘ Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="cg-typing">
                <div className="cg-bot-icon" style={{ background: theme.bg, borderColor: theme.color + "33" }}>{theme.icon}</div>
                <div className="cg-typing-dots">
                  <div className="cg-dot" /><div className="cg-dot" /><div className="cg-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Scroll to bottom */}
          {showScroll && (
            <button
              className="cg-scroll-btn"
              style={{ background: theme.color, boxShadow: `0 4px 12px ${theme.color}44` }}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            >↓</button>
          )}

          {/* Input Area */}
          <div className="cg-input-area">
            {suggestions.length > 0 && (
              <div className="cg-suggestions">
                {suggestions.map(s => (
                  <div key={s} className="cg-suggestion" onClick={() => { setInput(s); setSuggestions([]); inputRef.current?.focus(); }}>
                    🔍 {s}
                  </div>
                ))}
              </div>
            )}
            <div className="cg-input-row">
              <div className="cg-textarea-wrap" style={{ borderColor: focused ? theme.color + "44" : "#1a2640", boxShadow: focused ? `0 0 0 3px ${theme.color}08` : "none" }}>
                <textarea
                  ref={inputRef}
                  className="cg-textarea"
                  value={input}
                  rows={1}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="Koi bhi disaster risk poochho... (Hindi / English)"
                />
              </div>
              <div className="cg-btn-group">
                <button
                  className={`cg-icon-btn ${isListening ? "listening" : ""}`}
                  onClick={startVoice}
                  title="Voice input (Chrome only)"
                >🎤</button>
                <button
                  className={`cg-send-btn ${loading || !input.trim() ? "disabled" : "active"}`}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={!loading && input.trim() ? { background: `linear-gradient(135deg, ${theme.color}, #0080ff)`, boxShadow: `0 4px 14px ${theme.color}44` } : {}}
                >↑</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDE PANEL ── */}
        <div className="cg-side">
          <div className="cg-panel">
            <div className="cg-panel-title">🎨 Active Theme</div>
            <div className="cg-theme-indicator" style={{ background: theme.bg, borderColor: theme.color + "33", color: theme.color }}>
              <span style={{ fontSize: 18 }}>{theme.icon}</span>
              <span style={{ fontWeight: 700 }}>{theme.label} Mode</span>
            </div>
            <div className="cg-panel-title" style={{ marginTop: 8 }}>⚡ Quick Queries</div>
            <div className="cg-quick-grid">
              {DISASTER_PILLS.map(q => (
                <button key={q.key} className="cg-quick-btn"
                  style={activeTheme === q.key ? { borderColor: DISASTER_THEMES[q.key].color + "55", background: DISASTER_THEMES[q.key].bg } : {}}
                  onClick={() => sendMessage(q.query)}
                >
                  <span style={{ fontSize: 14 }}>{q.icon}</span>
                  <span className="cg-quick-label" style={activeTheme === q.key ? { color: DISASTER_THEMES[q.key].color } : {}}>{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cg-panel">
            <div className="cg-panel-title">⚙ System Status</div>
            {[
              ["Model",    "XGBoost"],
              ["Dataset",  "EMDAT 1900–2021"],
              ["Weather",  "OpenWeather API"],
              ["Disasters","7 types"],
              ["Messages", String(messages.length - 1)],
              ["Status",   loading ? "Processing..." : "Online ✅"],
            ].map(([k, v]) => (
              <div key={k} className="cg-stat-row">
                <span className="cg-stat-key">{k}</span>
                <span className="cg-stat-val" style={{ color: k === "Status" ? (loading ? "#ffb347" : "#00e676") : theme.color }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="cg-panel">
            <div className="cg-panel-title">🏷 Severity Guide</div>
            {Object.entries(SEVERITY_BADGES).map(([label, b]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #0a1020" }}>
                <span style={{ fontSize: 14 }}>{b.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: b.color, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                <span style={{ fontSize: 10, color: "#2a4060", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
                  {label === "Critical" ? "≥ 7.0" : label === "High" ? "≥ 5.0" : label === "Medium" ? "≥ 3.0" : "< 3.0"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
