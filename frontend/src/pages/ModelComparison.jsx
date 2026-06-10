import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler);

const MODELS = [
  {
    name: "Decision Tree", color: "#ffb830", rgb: "255,184,48", dash: [],
    acc: 0.9969, f1: 0.9969, precision: 0.96, recall: 0.90, auc: 0.997,
    cm: [[2080,16,0],[12,1080,9],[0,3,26]],
  },
  {
    name: "Random Forest", color: "#00ff9d", rgb: "0,255,157", dash: [6,3],
    acc: 0.9954, f1: 0.9952, precision: 1.00, recall: 0.72, auc: 1.000,
    cm: [[2095,1,0],[6,1095,0],[0,8,21]],
  },
  {
    name: "XGBoost", color: "#00d4ff", rgb: "0,212,255", dash: [4,4],
    acc: 0.9946, f1: 0.9946, precision: 0.99, recall: 0.79, auc: 0.990,
    cm: [[2096,0,0],[5,1094,2],[0,6,23]],
  },
  {
    name: "Gradient Boosting", color: "#a87cff", rgb: "168,124,255", dash: [8,3,2,3],
    acc: 0.9944, f1: 0.9943, precision: 0.92, recall: 0.79, auc: 1.000,
    cm: [[2090,6,0],[10,1086,5],[0,9,20]],
  },
  {
    name: "Logistic Reg.", color: "#ff6b35", rgb: "255,107,53", dash: [3,3],
    acc: 0.8819, f1: 0.8760, precision: 0.43, recall: 0.10, auc: 0.970,
    cm: [[2050,46,0],[330,771,0],[0,26,3]],
  },
];

const METRICS = ["Accuracy", "F1 Score", "Precision", "Recall", "AUC"];
const CLASSES = ["Low", "Medium", "High"];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@600;700&display=swap');
.mc-wrap { background:#0a0e1a; min-height:100vh; padding:24px; color:#e8f4fd; }
.mc-header-title { font-family:'Share Tech Mono',monospace; font-size:11px; color:#c8d8ed; letter-spacing:2px; }
.mc-header-sub { font-family:'Share Tech Mono',monospace; font-size:9px; color:#4a6080; letter-spacing:1px; margin-top:4px; }
.mc-card { background:#141c2e; border:1px solid #1e2d4a; border-radius:12px; padding:22px; margin-bottom:16px; box-shadow:0 4px 24px rgba(0,0,0,0.3); }
.mc-card-title { font-family:'Share Tech Mono',monospace; font-size:11px; color:#ffb830; letter-spacing:2px; margin-bottom:4px; }
.mc-card-sub { font-family:'Share Tech Mono',monospace; font-size:10px; color:#4a6080; margin-bottom:18px; }

/* Summary cards */
.mc-summary { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:16px; }
.mc-scard { background:#141c2e; border-radius:8px; padding:12px 14px; border-top:2px solid; }
.mc-scard-name { font-family:'Rajdhani',sans-serif; font-size:13px; font-weight:700; margin-bottom:6px; }
.mc-scard-row { display:flex; justify-content:space-between; font-family:'Share Tech Mono',monospace; font-size:10px; margin-bottom:3px; }

/* Confusion Matrix grid */
.cm-tabs { display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap; }
.cm-tab { font-family:'Share Tech Mono',monospace; font-size:10px; padding:6px 14px; border-radius:6px; border:1px solid #1e2d4a; background:#0a0e1a; color:#4a6080; cursor:pointer; transition:all .2s; letter-spacing:1px; }
.cm-tab.active { border-color:var(--mc); color:var(--mc); background:rgba(255,255,255,0.04); }
.cm-grid { display:grid; grid-template-columns:auto 1fr 1fr 1fr; gap:3px; font-family:'Share Tech Mono',monospace; font-size:12px; max-width:420px; }
.cm-cell { padding:14px; text-align:center; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:17px; }
.cm-header { color:#4a6080; font-size:10px; letter-spacing:1px; padding:8px 12px; text-align:center; }
.cm-row-label { color:#4a6080; font-size:10px; letter-spacing:1px; display:flex; align-items:center; justify-content:flex-end; padding-right:12px; white-space:nowrap; }
.cm-diag { background:rgba(0,255,157,0.15); color:#00ff9d; border:1px solid rgba(0,255,157,0.3); }
.cm-off  { background:rgba(255,71,87,0.08);  color:#ff4757; border:1px solid rgba(255,71,87,0.15); }
.cm-zero { background:rgba(30,45,74,0.5);    color:#4a6080; border:1px solid #1e2d4a; font-size:14px; }
`;

export default function ModelComparison() {
  const [selCM, setSelCM] = useState(0);

  const chartData = {
    labels: METRICS,
    datasets: MODELS.map(m => ({
      label: m.name,
      data: [m.acc, m.f1, m.precision, m.recall, m.auc],
      borderColor: m.color,
      backgroundColor: `rgba(${m.rgb},0.06)`,
      borderWidth: 2.5,
      pointBackgroundColor: m.color,
      pointRadius: 6,
      pointHoverRadius: 9,
      tension: 0.3,
      fill: false,
      borderDash: m.dash,
    }))
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display:true, position:"bottom", labels:{ color:"#8ba3c7", font:{size:12,family:"'Share Tech Mono',monospace"}, boxWidth:28, padding:18, usePointStyle:true }},
      tooltip: { backgroundColor:"#0d1525", borderColor:"#1e2d4a", borderWidth:1, titleColor:"#c8dff0", bodyColor:"#8ba3c7",
        callbacks:{ label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y*100).toFixed(2)}%` }}
    },
    scales: {
      x: { grid:{color:"rgba(30,45,74,0.8)"}, ticks:{color:"#8ba3c7", font:{size:13,family:"'Share Tech Mono',monospace"}}},
      y: { min:0, max:1.05, grid:{color:"rgba(30,45,74,0.8)"}, ticks:{color:"#8ba3c7", font:{size:11}, callback: v=>`${(v*100).toFixed(0)}%`}}
    }
  };

  const cm = MODELS[selCM].cm;
  const mc = MODELS[selCM].color;

  return (
    <>
      <style>{S}</style>
      <div className="mc-wrap">

        {/* Header */}
        <div style={{marginBottom:20}}>
          <div className="mc-header-title">🏆 MODEL COMPARISON DASHBOARD</div>
          <div className="mc-header-sub">EM-DAT INDIA DATASET · 3,226 TEST SAMPLES · 5 MODELS</div>
        </div>

        {/* Summary cards */}
        <div className="mc-summary">
          {MODELS.map((m,i) => (
            <div key={m.name} className="mc-scard" style={{borderTopColor:m.color, border:`1px solid ${m.color}25`, borderTop:`2px solid ${m.color}`}}>
              <div className="mc-scard-name" style={{color:m.color}}>
                {i===0?"🥇 ":i===1?"🥈 ":i===2?"🥉 ":""}{m.name}
              </div>
              {[["Acc",m.acc],["F1",m.f1],["Recall",m.recall],["AUC",m.auc]].map(([k,v])=>(
                <div key={k} className="mc-scard-row">
                  <span style={{color:"#4a6080"}}>{k}</span>
                  <span style={{color:"#c8dff0"}}>{(v*100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div className="mc-card">
          <div className="mc-card-title">PERFORMANCE COMPARISON — ALL 5 MODELS</div>
          <div className="mc-card-sub">X-axis: evaluation metrics · Y-axis: score (0–100%) · each line = one model</div>
          <div style={{height:380}}>
            <Line data={chartData} options={chartOpts}/>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="mc-card">
          <div className="mc-card-title">CONFUSION MATRIX</div>
          <div className="mc-card-sub">Select model to view · Actual vs Predicted severity class · Low / Medium / High</div>

          {/* Model selector tabs */}
          <div className="cm-tabs">
            {MODELS.map((m,i) => (
              <button
                key={m.name}
                className={`cm-tab${selCM===i?" active":""}`}
                style={{"--mc": m.color}}
                onClick={() => setSelCM(i)}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div style={{display:"flex", gap:40, flexWrap:"wrap", alignItems:"flex-start"}}>
            {/* Matrix */}
            <div>
              <div className="cm-grid">
                <div className="cm-header"></div>
                <div className="cm-header" style={{color:mc}}>PRED LOW</div>
                <div className="cm-header" style={{color:mc}}>PRED MED</div>
                <div className="cm-header" style={{color:mc}}>PRED HIGH</div>
                {CLASSES.map((cls,r) => (
                  <>
                    <div key={cls} className="cm-row-label">ACT {cls.toUpperCase()}</div>
                    {cm[r].map((val,c) => (
                      <div key={c} className={`cm-cell ${r===c?"cm-diag":val===0?"cm-zero":"cm-off"}`}>{val}</div>
                    ))}
                  </>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11}}>
              <div style={{color:"#4a6080", letterSpacing:1, marginBottom:12}}>MODEL STATS</div>
              {[
                ["Accuracy",  `${(MODELS[selCM].acc*100).toFixed(2)}%`],
                ["F1 Score",  MODELS[selCM].f1.toFixed(4)],
                ["Precision", MODELS[selCM].precision.toFixed(2)],
                ["Recall",    MODELS[selCM].recall.toFixed(2)],
                ["AUC",       MODELS[selCM].auc.toFixed(3)],
              ].map(([k,v]) => (
                <div key={k} style={{display:"flex", justifyContent:"space-between", gap:24, marginBottom:10, padding:"8px 12px", background:"#0a0e1a", borderRadius:6, border:"1px solid #1e2d4a"}}>
                  <span style={{color:"#4a6080"}}>{k}</span>
                  <span style={{color:mc, fontWeight:700}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:14, padding:"10px 12px", background:`rgba(${MODELS[selCM].rgb},0.07)`, border:`1px solid ${mc}30`, borderRadius:6, color:"#8ba3c7", lineHeight:1.7}}>
                {selCM===0 && "✅ Best recall (0.90)\nOnly 3 High events missed"}
                {selCM===1 && "⚠ Low recall (0.72)\n8 High events missed"}
                {selCM===2 && "⚠ Moderate recall (0.79)\n6 High events missed"}
                {selCM===3 && "⚠ Moderate recall (0.79)\n9 High events missed"}
                {selCM===4 && "❌ Poor recall (0.10)\n26 High events missed"}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}