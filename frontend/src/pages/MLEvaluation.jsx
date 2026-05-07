import { useState } from "react";
import { Line, Bar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;600&display=swap');
  .ml-wrap { background: #0a0e1a; min-height: 100vh; color: #e8f4fd; font-family: 'Exo 2', sans-serif; padding: 20px 24px; }
  .ml-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
  .ml-metric { border-radius: 10px; padding: 16px 20px; position: relative; overflow: hidden; border: 1px solid #1e2d4a; background: #141c2e; }
  .ml-metric::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; }
  .ml-metric.cyan::before { background: linear-gradient(90deg,transparent,#00d4ff,transparent); }
  .ml-metric.green::before { background: linear-gradient(90deg,transparent,#00ff9d,transparent); }
  .ml-metric.orange::before { background: linear-gradient(90deg,transparent,#ff6b35,transparent); }
  .ml-metric.purple::before { background: linear-gradient(90deg,transparent,#7c4dff,transparent); }
  .ml-metric-label { font-family:'Share Tech Mono',monospace; font-size:10px; color:#4a6080; letter-spacing:2px; margin-bottom:8px; }
  .ml-metric-val { font-family:'Rajdhani',sans-serif; font-size:32px; font-weight:700; line-height:1; }
  .ml-metric.cyan .ml-metric-val { color:#00d4ff; }
  .ml-metric.green .ml-metric-val { color:#00ff9d; }
  .ml-metric.orange .ml-metric-val { color:#ff6b35; }
  .ml-metric.purple .ml-metric-val { color:#7c4dff; }
  .ml-metric-sub { font-size:11px; color:#4a6080; margin-top:6px; font-family:'Share Tech Mono',monospace; }
  .ml-tabs { display:flex; gap:6px; border-bottom:1px solid #1e2d4a; margin-bottom:16px; }
  .ml-tab { padding:10px 18px; font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:600; color:#4a6080; cursor:pointer; border:none; background:transparent; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .2s; }
  .ml-tab:hover { color:#8ba3c7; }
  .ml-tab.active { color:#00d4ff; border-bottom-color:#00d4ff; }
  .ml-card { background:#141c2e; border:1px solid #1e2d4a; border-radius:10px; padding:20px; margin-bottom:16px; }
  .ml-card-title { font-family:'Share Tech Mono',monospace; font-size:11px; color:#00d4ff; letter-spacing:2px; text-transform:uppercase; margin-bottom:4px; }
  .ml-card-sub { font-size:11px; color:#4a6080; font-family:'Share Tech Mono',monospace; margin-bottom:16px; }
  .ml-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .ml-legend { display:flex; gap:16px; flex-wrap:wrap; margin-top:12px; }
  .ml-legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#8ba3c7; }
  .ml-legend-dot { width:24px; height:3px; border-radius:2px; flex-shrink:0; }
  .cm-grid { display:grid; grid-template-columns:auto 1fr 1fr 1fr; gap:2px; font-family:'Share Tech Mono',monospace; font-size:12px; }
  .cm-cell { padding:12px; text-align:center; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:600; }
  .cm-header { color:#4a6080; font-size:10px; letter-spacing:1px; padding:8px 12px; text-align:center; }
  .cm-row-label { color:#4a6080; font-size:10px; letter-spacing:1px; display:flex; align-items:center; justify-content:flex-end; padding-right:12px; }
  .cm-diag { background:rgba(0,255,157,0.15); color:#00ff9d; border:1px solid rgba(0,255,157,0.3); font-size:18px; }
  .cm-off { background:rgba(255,71,87,0.08); color:#ff4757; border:1px solid rgba(255,71,87,0.15); }
  .cm-zero { background:rgba(30,45,74,0.5); color:#4a6080; border:1px solid #1e2d4a; }
  .cls-table { width:100%; border-collapse:collapse; font-size:13px; }
  .cls-table th { font-family:'Share Tech Mono',monospace; font-size:10px; letter-spacing:1px; color:#4a6080; padding:10px 16px; text-align:right; border-bottom:1px solid #1e2d4a; }
  .cls-table th:first-child { text-align:left; }
  .cls-table td { padding:11px 16px; text-align:right; border-bottom:1px solid rgba(30,45,74,0.5); font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:500; color:#e8f4fd; }
  .cls-table td:first-child { text-align:left; font-family:'Share Tech Mono',monospace; font-size:12px; color:#8ba3c7; }
  .cls-table tr.total td { color:#00d4ff; border-top:1px solid #1e2d4a; }
  .model-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(30,45,74,0.5); }
  .model-rank { font-family:'Share Tech Mono',monospace; font-size:12px; color:#4a6080; width:20px; }
  .model-name { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:600; width:160px; color:#e8f4fd; }
  .model-row.best .model-name { color:#00d4ff; }
  .model-bar-bg { flex:1; height:8px; background:#0a0e1a; border-radius:4px; overflow:hidden; border:1px solid #1e2d4a; }
  .model-bar-fill { height:100%; border-radius:4px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }
  .model-score { font-family:'Share Tech Mono',monospace; font-size:13px; width:50px; text-align:right; }
  .model-time { font-family:'Share Tech Mono',monospace; font-size:11px; color:#4a6080; width:40px; text-align:right; }
  .warn-box { margin-top:14px; padding:10px 14px; background:rgba(255,107,53,0.07); border:1px solid rgba(255,107,53,0.2); border-radius:6px; font-size:11px; color:#ff6b35; font-family:'Share Tech Mono',monospace; line-height:1.7; }
`;

const TABS = ["Learning Curve","ROC Curve","Precision-Recall","Confusion Matrix","Model Comparison"];

const chartOpts = (yMin, yMax, xLabel, yLabel) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: !!xLabel, text: xLabel, color:"#8ba3c7" }, grid: { color:"rgba(30,45,74,0.8)" }, ticks:{ color:"#8ba3c7" } },
    y: { min: yMin, max: yMax, title: { display: !!yLabel, text: yLabel, color:"#8ba3c7" }, grid: { color:"rgba(30,45,74,0.8)" }, ticks:{ color:"#8ba3c7", callback: v=>v.toFixed(2) } }
  }
});

export default function MLEvaluation() {
  const [tab, setTab] = useState(0);

  // ── Learning Curve data ──
  const sizes = ["10%","20%","30%","40%","50%","60%","70%","80%","90%","100%"];
  const trainMean = [1.000,1.000,0.999,0.999,0.999,0.999,0.998,0.998,0.997,0.997];
  const valMean   = [0.912,0.941,0.956,0.968,0.975,0.981,0.986,0.989,0.992,0.994];
  const lcData = {
    labels: sizes,
    datasets: [
      { label:"Training Score", data: trainMean, borderColor:"#00d4ff", backgroundColor:"rgba(0,212,255,0.08)", fill:true, tension:.4, pointRadius:4, pointBackgroundColor:"#00d4ff", borderWidth:2 },
      { label:"Validation Score", data: valMean, borderColor:"#00ff9d", backgroundColor:"rgba(0,255,157,0.07)", fill:true, tension:.4, borderDash:[6,4], pointRadius:4, pointBackgroundColor:"#00ff9d", borderWidth:2 }
    ]
  };

  // ── ROC Curve data ──
  const rocData = {
    datasets: [
      { label:"Low (AUC=1.00)",    data:[{x:0,y:0},{x:.001,y:.98},{x:.005,y:.995},{x:.01,y:1},{x:1,y:1}],  borderColor:"#00d4ff", borderWidth:2, showLine:true, pointRadius:0, tension:.1 },
      { label:"Medium (AUC=0.99)", data:[{x:0,y:0},{x:.002,y:.97},{x:.008,y:.99},{x:.02,y:1},{x:1,y:1}],   borderColor:"#00ff9d", borderWidth:2, showLine:true, pointRadius:0, tension:.1, borderDash:[6,4] },
      { label:"High (AUC=0.96)",   data:[{x:0,y:0},{x:.01,y:.79},{x:.05,y:.88},{x:.1,y:.92},{x:1,y:1}],   borderColor:"#ff6b35", borderWidth:2, showLine:true, pointRadius:0, tension:.1, borderDash:[3,3] },
      { label:"Random",            data:[{x:0,y:0},{x:1,y:1}], borderColor:"#4a6080", borderWidth:1, showLine:true, pointRadius:0, borderDash:[4,4] }
    ]
  };

  // ── PR Curve data ──
  const prData = {
    datasets: [
      { label:"Low (AP=1.00)",    data:[{x:0,y:1},{x:.5,y:1},{x:.8,y:1},{x:.95,y:1},{x:1,y:.99}],                         borderColor:"#00d4ff", borderWidth:2, showLine:true, pointRadius:0, tension:.2 },
      { label:"Medium (AP=0.99)", data:[{x:0,y:1},{x:.5,y:1},{x:.8,y:.999},{x:.95,y:.997},{x:1,y:.99}],                   borderColor:"#00ff9d", borderWidth:2, showLine:true, pointRadius:0, tension:.2, borderDash:[6,4] },
      { label:"High (AP=0.91)",   data:[{x:0,y:1},{x:.3,y:1},{x:.5,y:.98},{x:.7,y:.95},{x:.79,y:.88},{x:1,y:.5}],        borderColor:"#ff6b35", borderWidth:2, showLine:true, pointRadius:0, tension:.2, borderDash:[3,3] }
    ]
  };

  // ── Models ──
  const models = [
    { rank:1, name:"XGBoost",          acc:.994, f1:.994, time:"0.8s", color:"linear-gradient(90deg,#00a8cc,#00d4ff)", best:true  },
    { rank:2, name:"Random Forest",    acc:.989, f1:.989, time:"1.2s", color:"linear-gradient(90deg,#1D9E75,#00ff9d)", best:false },
    { rank:3, name:"Gradient Boosting",acc:.981, f1:.981, time:"4.5s", color:"linear-gradient(90deg,#7c4dff,#a87cff)", best:false },
    { rank:4, name:"Decision Tree",    acc:.973, f1:.973, time:"0.1s", color:"linear-gradient(90deg,#ff6b35,#ffb830)", best:false },
    { rank:5, name:"Logistic Reg.",    acc:.884, f1:.879, time:"0.3s", color:"linear-gradient(90deg,#4a6080,#8ba3c7)", best:false },
  ];
  const cmpData = {
    labels: models.map(m=>m.name),
    datasets:[{ label:"Accuracy", data: models.map(m=>m.acc),
      backgroundColor:["rgba(0,212,255,0.7)","rgba(0,255,157,0.5)","rgba(124,77,255,0.5)","rgba(255,107,53,0.5)","rgba(74,96,128,0.5)"],
      borderColor:["#00d4ff","#00ff9d","#7c4dff","#ff6b35","#4a6080"], borderWidth:1, borderRadius:4 }]
  };

  const scatterOpts = (xLabel, yLabel) => ({
    responsive:true, maintainAspectRatio:false,
    parsing:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ type:"linear", min:0, max:1, title:{ display:true, text:xLabel, color:"#8ba3c7" }, grid:{ color:"rgba(30,45,74,0.8)" }, ticks:{ color:"#8ba3c7" } },
      y:{ min:0, max:1.02, title:{ display:true, text:yLabel, color:"#8ba3c7" }, grid:{ color:"rgba(30,45,74,0.8)" }, ticks:{ color:"#8ba3c7", callback:v=>v.toFixed(1) } }
    }
  });

  return (
    <>
      <style>{styles}</style>
      <div className="ml-wrap">

        {/* METRIC CARDS */}
        <div className="ml-metrics">
          {[
            {cls:"cyan",   label:"OVERALL ACCURACY",    val:"99.4%", sub:"3,226 test samples"},
            {cls:"green",  label:"F1 SCORE (WEIGHTED)", val:"0.994", sub:"across 3 classes"},
            {cls:"orange", label:"HIGH SEVERITY RECALL",val:"0.79",  sub:"29 samples · imbalanced"},
            {cls:"purple", label:"AVG ROC AUC",         val:"0.99",  sub:"one-vs-rest strategy"},
          ].map(m=>(
            <div key={m.label} className={`ml-metric ${m.cls}`}>
              <div className="ml-metric-label">{m.label}</div>
              <div className="ml-metric-val">{m.val}</div>
              <div className="ml-metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="ml-tabs">
          {TABS.map((t,i)=>(
            <button key={t} className={`ml-tab${tab===i?" active":""}`} onClick={()=>setTab(i)}>{t}</button>
          ))}
        </div>

        {/* LEARNING CURVE */}
        {tab===0 && (
          <div className="ml-card">
            <div className="ml-card-title">Learning Curve — XGBoost</div>
            <div className="ml-card-sub">F1 weighted score vs training size · 5-fold CV</div>
            <div style={{height:300}}><Line data={lcData} options={chartOpts(.88,1.005,"Training Size","F1 Score")}/></div>
            <div className="ml-legend">
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#00d4ff"}}></div>Training score</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#00ff9d"}}></div>Validation score</div>
            </div>
          </div>
        )}

        {/* ROC CURVE */}
        {tab===1 && (
          <div className="ml-card">
            <div className="ml-card-title">ROC Curve — One-vs-Rest</div>
            <div className="ml-card-sub">Receiver operating characteristic · all 3 severity classes</div>
            <div style={{height:300}}><Scatter data={rocData} options={scatterOpts("False Positive Rate","True Positive Rate")}/></div>
            <div className="ml-legend">
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#00d4ff"}}></div>Low (AUC=1.00)</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#00ff9d"}}></div>Medium (AUC=0.99)</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#ff6b35"}}></div>High (AUC=0.96)</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#4a6080"}}></div>Random baseline</div>
            </div>
          </div>
        )}

        {/* PR CURVE */}
        {tab===2 && (
          <div className="ml-card">
            <div className="ml-card-title">Precision-Recall Curve</div>
            <div className="ml-card-sub">Average precision per class · High class imbalance clearly visible</div>
            <div style={{height:300}}><Scatter data={prData} options={scatterOpts("Recall","Precision")}/></div>
            <div className="ml-legend">
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#00d4ff"}}></div>Low (AP=1.00)</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#00ff9d"}}></div>Medium (AP=0.99)</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{background:"#ff6b35"}}></div>High (AP=0.91)</div>
            </div>
          </div>
        )}

        {/* CONFUSION MATRIX */}
        {tab===3 && (
          <div className="ml-grid2">
            <div className="ml-card">
              <div className="ml-card-title">Confusion Matrix</div>
              <div className="ml-card-sub">Actual vs predicted severity class</div>
              <div className="cm-grid">
                <div className="cm-header"></div>
                <div className="cm-header" style={{color:"#00d4ff"}}>PRED LOW</div>
                <div className="cm-header" style={{color:"#00d4ff"}}>PRED MED</div>
                <div className="cm-header" style={{color:"#00d4ff"}}>PRED HIGH</div>
                <div className="cm-row-label">ACT LOW</div>
                <div className="cm-cell cm-diag">2,096</div>
                <div className="cm-cell cm-zero">0</div>
                <div className="cm-cell cm-zero">0</div>
                <div className="cm-row-label">ACT MED</div>
                <div className="cm-cell cm-off">5</div>
                <div className="cm-cell cm-diag">1,094</div>
                <div className="cm-cell cm-off">2</div>
                <div className="cm-row-label">ACT HIGH</div>
                <div className="cm-cell cm-zero">0</div>
                <div className="cm-cell cm-off">6</div>
                <div className="cm-cell cm-diag">23</div>
              </div>
            </div>
            <div className="ml-card">
              <div className="ml-card-title">Classification Report</div>
              <div className="ml-card-sub">Per-class precision · recall · F1</div>
              <table className="cls-table">
                <thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th></tr></thead>
                <tbody>
                  <tr><td>Low</td><td>1.00</td><td>1.00</td><td>1.00</td><td>2,096</td></tr>
                  <tr><td>Medium</td><td>0.99</td><td>0.99</td><td>0.99</td><td>1,101</td></tr>
                  <tr><td>High</td><td>1.00</td><td style={{color:"#ff6b35"}}>0.79</td><td style={{color:"#ff6b35"}}>0.88</td><td style={{color:"#4a6080"}}>29</td></tr>
                  <tr className="total"><td>Weighted avg</td><td>0.99</td><td>0.99</td><td>0.99</td><td>3,226</td></tr>
                </tbody>
              </table>
              <div className="warn-box">⚠ HIGH CLASS: only 29 samples (0.9% of test set).<br/>Low recall (0.79) due to severe class imbalance.</div>
            </div>
          </div>
        )}

        {/* MODEL COMPARISON */}
        {tab===4 && (
          <div className="ml-grid2">
            <div className="ml-card">
              <div className="ml-card-title">F1 Score Comparison</div>
              <div className="ml-card-sub">XGBoost vs 4 baseline models</div>
              {models.map(m=>(
                <div key={m.name} className={`model-row${m.best?" best":""}`}>
                  <div className="model-rank">{m.rank}</div>
                  <div className="model-name">{m.name}{m.best && <span style={{fontSize:9,padding:"2px 6px",background:"rgba(0,212,255,0.15)",color:"#00d4ff",border:"1px solid rgba(0,212,255,0.3)",borderRadius:3,marginLeft:6,letterSpacing:1}}>BEST</span>}</div>
                  <div className="model-bar-bg"><div className="model-bar-fill" style={{width:`${Math.round(m.f1*100)}%`,background:m.color}}></div></div>
                  <div className="model-score" style={m.best?{color:"#00d4ff"}:{}}>{m.f1.toFixed(3)}</div>
                  <div className="model-time">{m.time}</div>
                </div>
              ))}
            </div>
            <div className="ml-card">
              <div className="ml-card-title">Accuracy Comparison</div>
              <div className="ml-card-sub">Test set accuracy · all models</div>
              <div style={{height:260}}><Bar data={cmpData} options={chartOpts(.85,1.01,"","Accuracy")}/></div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}