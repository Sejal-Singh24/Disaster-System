import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const SUGGESTED = [
  "Which state has most flood deaths in EMDAT?",
  "2013 mein Uttarakhand mein kya hua tha?",
  "Bihar mein kitne flood events recorded hain?",
  "Kerala 2018 flood ke baare mein batao",
  "India ka sabse bura flood year kaunsa tha?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "Namaste! 🙏 Main FloodGuard AI hoon.\n\nMujhe EM-DAT dataset ke baare mein poochho — India ke flood events, deaths, affected states — Hindi ya English mein!",
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput("");
    const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", text: userText, time }]);
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/chatbot`, {
        message: userText, language: "auto",
      }, { timeout: 15000 });

      setMessages(prev => [...prev, {
        role: "assistant",
        text: response.data.reply || "Jawab nahi mila.",
        time,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: getDemoReply(userText),
        time,
        isDemo: true,
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, height: "calc(100vh - 140px)" }}>

      {/* CHAT WINDOW */}
      <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2d45", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#00d4ff,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>FloodGuard AI</div>
            <div style={{ fontSize: 11, color: "#7a9bbf", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, background: "#00e676", borderRadius: "50%", display: "inline-block" }} />
              Claude AI · EMDAT Dataset · Hindi + English
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00d4ff,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: "72%",
                background: msg.role === "user" ? "linear-gradient(135deg,#00d4ff22,#0080ff22)" : "#1a2235",
                border: `1px solid ${msg.role === "user" ? "#00d4ff44" : "#1e2d45"}`,
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "12px 16px",
              }}>
                <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#e8f4fd" }}>
                  {msg.text}
                </p>
                <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace", marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>{msg.time}</span>
                  {msg.isDemo && <span style={{ color: "#ffb347" }}>⚡ demo mode</span>}
                </div>
              </div>
            </div>
          ))}

          {/* Typing dots */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00d4ff,#0080ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
              <div style={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, background: "#00d4ff", borderRadius: "50%", display: "inline-block", animation: `bounce 1s ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e2d45", display: "flex", gap: 10 }}>
          <textarea
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="EMDAT data ke baare mein poochho... (Hindi / English)"
            rows={2}
            style={{ flex: 1, background: "#0a0e1a", border: "1px solid #1e2d45", borderRadius: 10, padding: "10px 14px", color: "#e8f4fd", fontFamily: "inherit", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.5 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#1a2235" : "linear-gradient(135deg,#00d4ff,#0080ff)",
              border: "none", borderRadius: 10, padding: "0 20px",
              color: loading || !input.trim() ? "#7a9bbf" : "#0a0e1a",
              fontWeight: 700, fontSize: 14, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {loading ? "..." : "Send →"}
          </button>
        </div>
      </div>

      {/* SIDE PANEL */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          <p className="card-title">Quick Questions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUGGESTED.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{
                background: "#0a0e1a", border: "1px solid #1e2d45", borderRadius: 8,
                padding: "10px 12px", textAlign: "left", color: "#b0c8e0",
                fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s", lineHeight: 1.4,
              }}
              onMouseEnter={e => { e.target.style.borderColor="#00d4ff"; e.target.style.color="#00d4ff"; }}
              onMouseLeave={e => { e.target.style.borderColor="#1e2d45"; e.target.style.color="#b0c8e0"; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ fontSize: 12, color: "#7a9bbf", fontFamily: "monospace", lineHeight: 1.8 }}>
          <p className="card-title">Backend Info</p>
          <div>URL: <span style={{ color: "#00d4ff" }}>{BACKEND_URL}/chatbot</span></div>
          <div>Method: <span style={{ color: "#00e676" }}>POST</span></div>
          <div>Dataset: <span style={{ color: "#ffb347" }}>EMDAT 1900–2021</span></div>
          <div style={{ marginTop: 10, padding: 8, background: "#0a0e1a", borderRadius: 6, fontSize: 10 }}>
            .env mein VITE_BACKEND_URL set karo Anjali ke server se connect karne ke liye
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:translateY(0); }
          40%          { transform:translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// Demo replies when backend not connected
function getDemoReply(text) {
  const t = text.toLowerCase();
  if (t.includes("uttarakhand") || t.includes("2013"))
    return "⚠️ Uttarakhand 2013 Flash Floods:\nYe EMDAT dataset mein India ka sabse deadly flood event hai.\n6,054 deaths recorded.\nKedarnath, Chamoli, Rudraprayag worst affected.\nHimachal Pradesh, UP, Bihar bhi hit hue.";
  if (t.includes("kerala") || t.includes("2018"))
    return "🌊 Kerala Floods 2018:\n504 deaths, 23.2M people affected.\nThrissur, Chengannur worst hit.\nKerala ka 100 saal ka sabse bada flood.\nEMDAT mein Flash Flood type classified hai.";
  if (t.includes("assam") || t.includes("guwahati"))
    return "📊 Assam EMDAT Data:\nIndia ka number 1 most flood-prone state.\n69 flood events recorded (1900–2021).\n26,893 total deaths.\nBrahmaputra river main cause hai.";
  if (t.includes("bihar") || t.includes("patna"))
    return "📊 Bihar EMDAT Data:\n45 flood events (1900–2021).\n29,364 total deaths recorded.\nKosi river breach (2008) — 1,063 deaths.\n2007 mein 1,103 deaths, 18.7M affected.";
  if (t.includes("worst") || t.includes("sabse bura") || t.includes("most deaths"))
    return "💀 EMDAT Worst Years (India Floods):\n1. 2013 — 6,453 deaths (Uttarakhand)\n2. 2005 — 2,129 deaths (Gujarat + India)\n3. 2000 — 2,086 deaths (Bihar + WB)\n4. 2007 — 2,051 deaths (Bihar, multi-state)\n5. 2020 — 2,104 deaths (multi-state)";
  return "Main FloodGuard AI hoon. EMDAT dataset (India floods 1900–2021) ke baare mein kuch bhi poochho. Backend connect karo live Claude AI responses ke liye.";
}