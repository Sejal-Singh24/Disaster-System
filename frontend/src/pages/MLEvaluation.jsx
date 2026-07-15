import { useState } from "react";
import { Line, Bar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler);

const styles = 
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

  /* Model Dropdown */
  .model-selector-bar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:20px; padding:12px 18px; background:#0d1525; border:1px solid #1e2d4a; border-radius:10px; flex-wrap:wrap; }
  .model-selector-left { display:flex; align-items:center; gap:12px; }
  .model-selector-label { font-family:'Share Tech Mono',monospace; font-size:10px; color:#4a6080; letter-spacing:2px; white-space:nowrap; }
  .model-select { font-family:'Share Tech Mono',monospace; font-size:12px; padding:8px 14px; border-radius:6px; border:1px solid #2a3d5a; background:#141c2e; color:#e8f4fd; cursor:pointer; outline:none; min-width:200px; letter-spacing:0.5px; appearance:auto; }
  .model-select:focus { border-color:#00d4ff60; }
  .model-selector-right { display:flex; align-items:center; gap:10px; }
  .active-model-badge { font-family:'Share Tech Mono',monospace; font-size:10px; padding:6px 14px; border-radius:6px; border:1px solid #2a3d5a; background:transparent; color:#8ba3c7; letter-spacing:1.5px; }
  .active-model-hint { font-family:'Share Tech Mono',monospace; font-size:10px; color:#2a3d5a; letter-spacing:0.5px; }
;

const TABS = ["Learning Curve", "ROC Curve", "Precision-Recall", "Confusion Matrix"];

// ── Per-model data ─────────────────────────────────────────────────────────
const MODEL_DATA = {
  xgboost: {
    label: "XGBoost", color: "#00d4ff", colorRgb: "0,212,255", time: "0.8s", best: true,
    metrics: { accuracy: "99.4%", f1: "0.994", recall: "0.79", auc: "0.99" },
    metricSubs: { accuracy: "3,226 test samples", f1: "across 3 classes", recall: "29 samples · imbalanced", auc: "one-vs-rest strategy" },
    trainMean: [1.000, 1.000, 0.999, 0.999, 0.999, 0.999, 0.998, 0.998, 0.997, 0.997],
    valMean:   [0.912, 0.941, 0.956, 0.968, 0.975, 0.981, 0.986, 0.989, 0.992, 0.994],
    roc: {
      low:    [{x:0,y:0},{x:.001,y:.98},{x:.005,y:.995},{x:.01,y:1},{x:1,y:1}],
      medium: [{x:0,y:0},{x:.002,y:.97},{x:.008,y:.99},{x:.02,y:1},{x:1,y:1}],
      high:   [{x:0,y:0},{x:.01,y:.79},{x:.05,y:.88},{x:.1,y:.92},{x:1,y:1}],
      aucLow:"1.00", aucMed:"0.99", aucHigh:"0.96",
    },
    pr: {
      low:    [{x:0,y:1},{x:.5,y:1},{x:.8,y:1},{x:.95,y:1},{x:1,y:.99}],
      medium: [{x:0,y:1},{x:.5,y:1},{x:.8,y:.999},{x:.95,y:.997},{x:1,y:.99}],
      high:   [{x:0,y:1},{x:.3,y:1},{x:.5,y:.98},{x:.7,y:.95},{x:.79,y:.88},{x:1,y:.5}],
      apLow:"1.00", apMed:"0.99", apHigh:"0.91",
    },
    cm: [[2096,0,0],[5,1094,2],[0,6,23]],
    report: [
      { cls:"Low",          prec:"1.00", rec:"1.00", f1:"1.00", sup:"2,096" },
      { cls:"Medium",       prec:"0.99", rec:"0.99", f1:"0.99", sup:"1,101", recColor: null },
      { cls:"High",         prec:"1.00", rec:"0.79", f1:"0.88", sup:"29",    recColor:"#ff6b35", f1Color:"#ff6b35" },
      { cls:"Weighted avg", prec:"0.99", rec:"0.99", f1:"0.99", sup:"3,226", total:true },
    ],
    warnBox: "⚠ HIGH CLASS: only 29 samples (0.9% of test set).\nLow recall (0.79) due to severe class imbalance.",
  },

  randomforest: {
    label: "Random Forest", color: "#00ff9d", colorRgb: "0,255,157", time: "1.2s", best: false,
    metrics: { accuracy: "98.9%", f1: "0.989", recall: "0.72", auc: "0.98" },
    metricSubs: { accuracy: "3,226 test samples", f1: "across 3 classes", recall: "29 samples · imbalanced", auc: "one-vs-rest strategy" },
    trainMean: [1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000],
    valMean:   [0.895, 0.923, 0.944, 0.958, 0.967, 0.974, 0.980, 0.984, 0.987, 0.989],
    roc: {
      low:    [{x:0,y:0},{x:.001,y:.99},{x:.004,y:1},{x:1,y:1}],
      medium: [{x:0,y:0},{x:.002,y:.96},{x:.009,y:.99},{x:.02,y:1},{x:1,y:1}],
      high:   [{x:0,y:0},{x:.01,y:.72},{x:.06,y:.85},{x:.12,y:.91},{x:1,y:1}],
      aucLow:"1.00", aucMed:"0.98", aucHigh:"0.93",
    },
    pr: {
      low:    [{x:0,y:1},{x:.5,y:1},{x:.9,y:1},{x:1,y:.99}],
      medium: [{x:0,y:1},{x:.5,y:1},{x:.85,y:.998},{x:1,y:.99}],
      high:   [{x:0,y:1},{x:.3,y:.99},{x:.5,y:.96},{x:.7,y:.90},{x:.72,y:.82},{x:1,y:.4}],
      apLow:"1.00", apMed:"0.98", apHigh:"0.87",
    },
    cm: [[2094,2,0],[8,1090,3],[0,8,21]],
    report: [
      { cls:"Low",          prec:"1.00", rec:"1.00", f1:"1.00", sup:"2,096" },
      { cls:"Medium",       prec:"0.99", rec:"0.99", f1:"0.99", sup:"1,101" },
      { cls:"High",         prec:"0.88", rec:"0.72", f1:"0.79", sup:"29",    recColor:"#ff6b35", f1Color:"#ff6b35" },
      { cls:"Weighted avg", prec:"0.99", rec:"0.99", f1:"0.99", sup:"3,226", total:true },
    ],
    warnBox: "⚠ HIGH CLASS: only 29 samples (0.9% of test set).\nLower recall (0.72) — RF tends to be conservative on rare classes.",
  },

  gradientboosting: {
    label: "Gradient Boosting", color: "#a87cff", colorRgb: "168,124,255", time: "4.5s", best: false,
    metrics: { accuracy: "98.1%", f1: "0.981", recall: "0.69", auc: "0.97" },
    metricSubs: { accuracy: "3,226 test samples", f1: "across 3 classes", recall: "29 samples · imbalanced", auc: "one-vs-rest strategy" },
    trainMean: [0.998, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999],
    valMean:   [0.878, 0.908, 0.930, 0.946, 0.956, 0.964, 0.970, 0.975, 0.979, 0.981],
    roc: {
      low:    [{x:0,y:0},{x:.002,y:.97},{x:.006,y:.99},{x:.02,y:1},{x:1,y:1}],
      medium: [{x:0,y:0},{x:.003,y:.95},{x:.01,y:.98},{x:.03,y:1},{x:1,y:1}],
      high:   [{x:0,y:0},{x:.02,y:.69},{x:.07,y:.82},{x:.15,y:.89},{x:1,y:1}],
      aucLow:"0.99", aucMed:"0.98", aucHigh:"0.94",
    },
    pr: {
      low:    [{x:0,y:1},{x:.5,y:1},{x:.85,y:.999},{x:1,y:.98}],
      medium: [{x:0,y:1},{x:.5,y:.999},{x:.8,y:.996},{x:1,y:.98}],
      high:   [{x:0,y:1},{x:.3,y:.98},{x:.5,y:.94},{x:.65,y:.88},{x:.69,y:.80},{x:1,y:.35}],
      apLow:"0.99", apMed:"0.98", apHigh:"0.84",
    },
    cm: [[2090,6,0],[10,1086,5],[0,9,20]],
    report: [
      { cls:"Low",          prec:"1.00", rec:"1.00", f1:"1.00", sup:"2,096" },
      { cls:"Medium",       prec:"0.99", rec:"0.99", f1:"0.99", sup:"1,101" },
      { cls:"High",         prec:"0.80", rec:"0.69", f1:"0.74", sup:"29",    recColor:"#ff6b35", f1Color:"#ff6b35" },
      { cls:"Weighted avg", prec:"0.98", rec:"0.98", f1:"0.98", sup:"3,226", total:true },
    ],
    warnBox: "⚠ HIGH CLASS: only 29 samples (0.9% of test set).\nSlowest training (4.5s) · recall (0.69) weakest among tree models.",
  },

  decisiontree: {
    label: "Decision Tree", color: "#ffb830", colorRgb: "255,184,48", time: "0.1s", best: false,
    metrics: { accuracy: "97.3%", f1: "0.973", recall: "0.90", auc: "0.95" },
    metricSubs: { accuracy: "3,226 test samples", f1: "across 3 classes", recall: "29 samples · imbalanced", auc: "one-vs-rest strategy" },
    trainMean: [1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000],
    valMean:   [0.850, 0.882, 0.905, 0.922, 0.934, 0.944, 0.952, 0.959, 0.966, 0.973],
    roc: {
      low:    [{x:0,y:0},{x:.003,y:.96},{x:.01,y:.99},{x:.03,y:1},{x:1,y:1}],
      medium: [{x:0,y:0},{x:.005,y:.93},{x:.015,y:.97},{x:.04,y:1},{x:1,y:1}],
      high:   [{x:0,y:0},{x:.01,y:.90},{x:.05,y:.93},{x:.1,y:.95},{x:1,y:1}],
      aucLow:"0.99", aucMed:"0.97", aucHigh:"0.95",
    },
    pr: {
      low:    [{x:0,y:1},{x:.5,y:.999},{x:.85,y:.997},{x:1,y:.97}],
      medium: [{x:0,y:1},{x:.5,y:.998},{x:.8,y:.993},{x:1,y:.97}],
      high:   [{x:0,y:1},{x:.4,y:.99},{x:.7,y:.97},{x:.9,y:.94},{x:1,y:.88}],
      apLow:"0.99", apMed:"0.97", apHigh:"0.93",
    },
    cm: [[2080,16,0],[12,1080,9],[0,3,26]],
    report: [
      { cls:"Low",          prec:"0.99", rec:"0.99", f1:"0.99", sup:"2,096" },
      { cls:"Medium",       prec:"0.98", rec:"0.98", f1:"0.98", sup:"1,101" },
      { cls:"High",         prec:"0.74", rec:"0.90", f1:"0.81", sup:"29",    recColor:"#00ff9d", f1Color:null },
      { cls:"Weighted avg", prec:"0.97", rec:"0.97", f1:"0.97", sup:"3,226", total:true },
    ],
    warnBox: "✅ HIGH CLASS: Best recall (0.90) — only 3 of 29 High events missed.\nFastest training (0.1s) but slightly lower overall accuracy.",
  },

  logisticreg: {
    label: "Logistic Reg.", color: "#8ba3c7", colorRgb: "139,163,199", time: "0.3s", best: false,
    metrics: { accuracy: "88.4%", f1: "0.876", recall: "0.10", auc: "0.97" },
    metricSubs: { accuracy: "3,226 test samples", f1: "across 3 classes", recall: "29 samples · imbalanced", auc: "one-vs-rest strategy" },
    trainMean: [0.890, 0.892, 0.893, 0.893, 0.893, 0.893, 0.893, 0.893, 0.893, 0.884],
    valMean:   [0.820, 0.842, 0.855, 0.862, 0.866, 0.869, 0.871, 0.872, 0.873, 0.876],
    roc: {
      low:    [{x:0,y:0},{x:.01,y:.92},{x:.05,y:.97},{x:.1,y:.99},{x:1,y:1}],
      medium: [{x:0,y:0},{x:.02,y:.88},{x:.08,y:.95},{x:.15,y:.98},{x:1,y:1}],
      high:   [{x:0,y:0},{x:.05,y:.10},{x:.2,y:.30},{x:.5,y:.65},{x:1,y:1}],
      aucLow:"0.99", aucMed:"0.98", aucHigh:"0.94",
    },
    pr: {
      low:    [{x:0,y:1},{x:.5,y:.97},{x:.8,y:.94},{x:1,y:.90}],
      medium: [{x:0,y:.95},{x:.5,y:.90},{x:.8,y:.82},{x:1,y:.75}],
      high:   [{x:0,y:.43},{x:.1,y:.30},{x:.2,y:.15},{x:.5,y:.08},{x:1,y:.03}],
      apLow:"0.97", apMed:"0.89", apHigh:"0.15",
    },
    cm: [[2050,46,0],[330,771,0],[0,26,3]],
    report: [
      { cls:"Low",          prec:"0.86", rec:"0.98", f1:"0.92", sup:"2,096" },
      { cls:"Medium",       prec:"0.91", rec:"0.70", f1:"0.79", sup:"1,101", recColor:"#ff6b35" },
      { cls:"High",         prec:"1.00", rec:"0.10", f1:"0.18", sup:"29",    recColor:"#ff4757", f1Color:"#ff4757" },
      { cls:"Weighted avg", prec:"0.88", rec:"0.88", f1:"0.88", sup:"3,226", total:true },
    ],
    warnBox: "⚠ BASELINE MODEL: Poor High class recall (0.10) — 26 of 29 High events missed.\nNot suitable for disaster severity prediction.",
  },
};

const MODEL_KEYS = ["xgboost", "randomforest", "gradientboosting", "decisiontree", "logisticreg"];

const chartOpts = (yMin, yMax, xLabel, yLabel) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: !!xLabel, text: xLabel, color: "#8ba3c7" }, grid: { color: "rgba(30,45,74,0.8)" }, ticks: { color: "#8ba3c7" } },
    y: { min: yMin, max: yMax, title: { display: !!yLabel, text: yLabel, color: "#8ba3c7" }, grid: { color: "rgba(30,45,74,0.8)" }, ticks: { color: "#8ba3c7", callback: v => v.toFixed(2) } }
  }
});

const scatterOpts = (xLabel, yLabel) => ({
  responsive: true, maintainAspectRatio: false,
  parsing: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { type: "linear", min: 0, max: 1, title: { display: true, text: xLabel, color: "#8ba3c7" }, grid: { color: "rgba(30,45,74,0.8)" }, ticks: { color: "#8ba3c7" } },
    y: { min: 0, max: 1.02, title: { display: true, text: yLabel, color: "#8ba3c7" }, grid: { color: "rgba(30,45,74,0.8)" }, ticks: { color: "#8ba3c7", callback: v => v.toFixed(1) } }
  }
});

const sizes = ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

const models = [
  { rank:1, name:"XGBoost",          key:"xgboost",          acc:.994, f1:.994, time:"0.8s", color:"linear-gradient(90deg,#00a8cc,#00d4ff)", best:true  },
  { rank:2, name:"Random Forest",    key:"randomforest",     acc:.989, f1:.989, time:"1.2s", color:"linear-gradient(90deg,#1D9E75,#00ff9d)", best:false },
  { rank:3, name:"Gradient Boosting",key:"gradientboosting", acc:.981, f1:.981, time:"4.5s", color:"linear-gradient(90deg,#7c4dff,#a87cff)", best:false },
  { rank:4, name:"Decision Tree",    key:"decisiontree",     acc:.973, f1:.973, time:"0.1s", color:"linear-gradient(90deg,#ff6b35,#ffb830)", best:false },
  { rank:5, name:"Logistic Reg.",    key:"logisticreg",      acc:.884, f1:.879, time:"0.3s", color:"linear-gradient(90deg,#4a6080,#8ba3c7)", best:false },
];

export default function MLEvaluation() {
  const [tab, setTab] = useState(0);
  const [selModel, setSelModel] = useState("xgboost");

  const d = MODEL_DATA[selModel];

  // ── Learning Curve ──
  const lcData = {
    labels: sizes,
    datasets: [
      { label: "Training Score", data: d.trainMean, borderColor: d.color, backgroundColor: `rgba(${d.colorRgb},0.08)`, fill: true, tension: .4, pointRadius: 4, pointBackgroundColor: d.color, borderWidth: 2 },
      { label: "Validation Score", data: d.valMean, borderColor: "#00ff9d", backgroundColor: "rgba(0,255,157,0.07)", fill: true, tension: .4, borderDash: [6, 4], pointRadius: 4, pointBackgroundColor: "#00ff9d", borderWidth: 2 }
    ]
  };

  // ── ROC ──
  const rocData = {
    datasets: [
      { label: `Low (AUC=${d.roc.aucLow})`,    data: d.roc.low,    borderColor: "#00d4ff", borderWidth: 2, showLine: true, pointRadius: 0, tension: .1 },
      { label: `Medium (AUC=${d.roc.aucMed})`, data: d.roc.medium, borderColor: "#00ff9d", borderWidth: 2, showLine: true, pointRadius: 0, tension: .1, borderDash: [6, 4] },
      { label: `High (AUC=${d.roc.aucHigh})`,  data: d.roc.high,   borderColor: "#ff6b35", borderWidth: 2, showLine: true, pointRadius: 0, tension: .1, borderDash: [3, 3] },
      { label: "Random",                        data: [{x:0,y:0},{x:1,y:1}], borderColor: "#4a6080", borderWidth: 1, showLine: true, pointRadius: 0, borderDash: [4, 4] }
    ]
  };

  // ── PR ──
  const prData = {
    datasets: [
      { label: `Low (AP=${d.pr.apLow})`,    data: d.pr.low,    borderColor: "#00d4ff", borderWidth: 2, showLine: true, pointRadius: 0, tension: .2 },
      { label: `Medium (AP=${d.pr.apMed})`, data: d.pr.medium, borderColor: "#00ff9d", borderWidth: 2, showLine: true, pointRadius: 0, tension: .2, borderDash: [6, 4] },
      { label: `High (AP=${d.pr.apHigh})`,  data: d.pr.high,   borderColor: "#ff6b35", borderWidth: 2, showLine: true, pointRadius: 0, tension: .2, borderDash: [3, 3] }
    ]
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ml-wrap">

        {/* ── MODEL SELECTOR ── */}
        <div className="model-selector-bar">
          <div className="model-selector-left">
            <span className="model-selector-label">SELECT MODEL :</span>
            <select
              className="model-select"
              value={selModel}
              onChange={e => setSelModel(e.target.value)}
            >
              {MODEL_KEYS.map(k => (
                <option key={k} value={k}>
                  {MODEL_DATA[k].label}{MODEL_DATA[k].best ? " ★ BEST" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="model-selector-right">
            <span className="active-model-badge">ACTIVE MODEL</span>
            <span className="active-model-hint">← change model to update all charts</span>
          </div>
        </div>

        {/* ── METRIC CARDS ── */}
        <div className="ml-metrics">
          {[
            { cls: "cyan",   label: "OVERALL ACCURACY",     val: d.metrics.accuracy, sub: d.metricSubs.accuracy },
            { cls: "green",  label: "F1 SCORE (WEIGHTED)",  val: d.metrics.f1,       sub: d.metricSubs.f1 },
            { cls: "orange", label: "HIGH SEVERITY RECALL", val: d.metrics.recall,   sub: d.metricSubs.recall },
            { cls: "purple", label: "AVG ROC AUC",          val: d.metrics.auc,      sub: d.metricSubs.auc },
          ].map(m => (
            <div key={m.label} className={`ml-metric ${m.cls}`}>
              <div className="ml-metric-label">{m.label}</div>
              <div className="ml-metric-val">{m.val}</div>
              <div className="ml-metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="ml-tabs">
          {TABS.map((t, i) => (
            <button key={t} className={`ml-tab${tab === i ? " active" : ""}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        {/* ── LEARNING CURVE ── */}
        {tab === 0 && (
          <div className="ml-card">
            <div className="ml-card-title">Learning Curve — {d.label}</div>
            <div className="ml-card-sub">F1 weighted score vs training size · 5-fold CV</div>
            <div style={{ height: 300 }}><Line data={lcData} options={chartOpts(.85, 1.005, "Training Size", "F1 Score")} /></div>
            <div className="ml-legend">
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: d.color }}></div>Training score</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#00ff9d" }}></div>Validation score</div>
            </div>
          </div>
        )}

        {/* ── ROC CURVE ── */}
        {tab === 1 && (
          <div className="ml-card">
            <div className="ml-card-title">ROC Curve — {d.label} · One-vs-Rest</div>
            <div className="ml-card-sub">Receiver operating characteristic · all 3 severity classes</div>
            <div style={{ height: 300 }}><Scatter data={rocData} options={scatterOpts("False Positive Rate", "True Positive Rate")} /></div>
            <div className="ml-legend">
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#00d4ff" }}></div>Low (AUC={d.roc.aucLow})</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#00ff9d" }}></div>Medium (AUC={d.roc.aucMed})</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#ff6b35" }}></div>High (AUC={d.roc.aucHigh})</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#4a6080" }}></div>Random baseline</div>
            </div>
          </div>
        )}

        {/* ── PR CURVE ── */}
        {tab === 2 && (
          <div className="ml-card">
            <div className="ml-card-title">Precision-Recall Curve — {d.label}</div>
            <div className="ml-card-sub">Average precision per class · High class imbalance clearly visible</div>
            <div style={{ height: 300 }}><Scatter data={prData} options={scatterOpts("Recall", "Precision")} /></div>
            <div className="ml-legend">
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#00d4ff" }}></div>Low (AP={d.pr.apLow})</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#00ff9d" }}></div>Medium (AP={d.pr.apMed})</div>
              <div className="ml-legend-item"><div className="ml-legend-dot" style={{ background: "#ff6b35" }}></div>High (AP={d.pr.apHigh})</div>
            </div>
          </div>
        )}

        {/* ── CONFUSION MATRIX ── */}
        {tab === 3 && (
          <div className="ml-grid2">
            <div className="ml-card">
              <div className="ml-card-title">Confusion Matrix — {d.label}</div>
              <div className="ml-card-sub">Actual vs predicted severity class</div>
              <div className="cm-grid">
                <div className="cm-header"></div>
                <div className="cm-header" style={{ color: "#00d4ff" }}>PRED LOW</div>
                <div className="cm-header" style={{ color: "#00d4ff" }}>PRED MED</div>
                <div className="cm-header" style={{ color: "#00d4ff" }}>PRED HIGH</div>
                {[["ACT LOW", 0], ["ACT MED", 1], ["ACT HIGH", 2]].map(([rowLabel, r]) => (
                  <>
                    <div key={rowLabel} className="cm-row-label">{rowLabel}</div>
                    {d.cm[r].map((val, c) => (
                      <div key={c} className={`cm-cell ${r === c ? "cm-diag" : val === 0 ? "cm-zero" : "cm-off"}`}>{val}</div>
                    ))}
                  </>
                ))}
              </div>
            </div>
            <div className="ml-card">
              <div className="ml-card-title">Classification Report — {d.label}</div>
              <div className="ml-card-sub">Per-class precision · recall · F1</div>
              <table className="cls-table">
                <thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th></tr></thead>
                <tbody>
                  {d.report.map(row => (
                    <tr key={row.cls} className={row.total ? "total" : ""}>
                      <td>{row.cls}</td>
                      <td>{row.prec}</td>
                      <td style={row.recColor ? { color: row.recColor } : {}}>{row.rec}</td>
                      <td style={row.f1Color ? { color: row.f1Color } : {}}>{row.f1}</td>
                      <td style={row.total ? {} : { color: "#4a6080" }}>{row.sup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="warn-box" style={{ whiteSpace: "pre-line" }}>{d.warnBox}</div>
            </div>
          </div>
        )}


      </div>
    </>
  );
}