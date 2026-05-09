import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// ── APIs ──────────────────────────────────────────────────
const GDACS_API       = "/gdacs-api/api/events/geteventlist/SEARCH";
const OPENWEATHER_API = "/openweather-api/data/2.5/weather";
const OW_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";

const DISASTER_TYPE_MAP = {
  flood:      { code: "FL", label: "Flood",          color: "#00d4ff", icon: "🌊" },
  earthquake: { code: "EQ", label: "Earthquake",     color: "#ff6b35", icon: "🌍" },
  cyclone:    { code: "TC", label: "Cyclone / Storm", color: "#a855f7", icon: "🌀" },
  wildfire:   { code: "WF", label: "Wildfire",       color: "#ef4444", icon: "🔥" },
  drought:    { code: "DR", label: "Drought",        color: "#f59e0b", icon: "☀️" },
  landslide:  { code: "FL", label: "Landslide",      color: "#84cc16", icon: "⛰️" },
  tsunami:    { code: "EQ", label: "Tsunami",        color: "#06b6d4", icon: "🌊" },
};

const ALERT_MAP = {
  Red:    { risk: "high",   color: "#ff3b5c" },
  Orange: { risk: "medium", color: "#ffb347" },
  Green:  { risk: "low",    color: "#00e676" },
};

const COUNTRIES = [
  { name: "Afghanistan",    iso: "AFG", center: [33.9, 67.7],   zoom: 6 },
  { name: "Australia",      iso: "AUS", center: [-25.3, 133.8], zoom: 4 },
  { name: "Bangladesh",     iso: "BGD", center: [23.7, 90.4],   zoom: 7 },
  { name: "Brazil",         iso: "BRA", center: [-14.2, -51.9], zoom: 4 },
  { name: "China",          iso: "CHN", center: [35.9, 104.2],  zoom: 4 },
  { name: "Colombia",       iso: "COL", center: [4.6, -74.3],   zoom: 6 },
  { name: "DR Congo",       iso: "COD", center: [-4.0, 21.8],   zoom: 6 },
  { name: "Ethiopia",       iso: "ETH", center: [9.1, 40.5],    zoom: 6 },
  { name: "France",         iso: "FRA", center: [46.2, 2.2],    zoom: 6 },
  { name: "Germany",        iso: "DEU", center: [51.2, 10.4],   zoom: 6 },
  { name: "India",          iso: "IND", center: [22.5, 82.5],   zoom: 5 },
  { name: "Indonesia",      iso: "IDN", center: [-0.8, 113.9],  zoom: 5 },
  { name: "Iran",           iso: "IRN", center: [32.4, 53.7],   zoom: 6 },
  { name: "Italy",          iso: "ITA", center: [41.9, 12.6],   zoom: 6 },
  { name: "Japan",          iso: "JPN", center: [36.2, 138.3],  zoom: 5 },
  { name: "Kenya",          iso: "KEN", center: [-0.0, 37.9],   zoom: 6 },
  { name: "Mexico",         iso: "MEX", center: [23.6, -102.6], zoom: 5 },
  { name: "Myanmar",        iso: "MMR", center: [19.2, 96.7],   zoom: 6 },
  { name: "Nepal",          iso: "NPL", center: [28.4, 84.1],   zoom: 7 },
  { name: "Nigeria",        iso: "NGA", center: [9.1, 8.7],     zoom: 6 },
  { name: "Pakistan",       iso: "PAK", center: [30.4, 69.3],   zoom: 6 },
  { name: "Peru",           iso: "PER", center: [-9.2, -75.0],  zoom: 6 },
  { name: "Philippines",    iso: "PHL", center: [12.9, 121.8],  zoom: 6 },
  { name: "Russia",         iso: "RUS", center: [61.5, 105.3],  zoom: 3 },
  { name: "Somalia",        iso: "SOM", center: [5.2, 46.2],    zoom: 6 },
  { name: "South Africa",   iso: "ZAF", center: [-28.5, 24.7],  zoom: 6 },
  { name: "Sri Lanka",      iso: "LKA", center: [7.9, 80.8],    zoom: 7 },
  { name: "Sudan",          iso: "SDN", center: [12.9, 30.2],   zoom: 6 },
  { name: "Thailand",       iso: "THA", center: [15.9, 100.9],  zoom: 6 },
  { name: "Turkey",         iso: "TUR", center: [38.9, 35.2],   zoom: 6 },
  { name: "USA",            iso: "USA", center: [37.1, -95.7],  zoom: 4 },
  { name: "Vietnam",        iso: "VNM", center: [14.1, 108.3],  zoom: 6 },
  { name: "Yemen",          iso: "YEM", center: [15.6, 48.5],   zoom: 6 },
];

const INDIA_STATES = [
  { name: "Andhra Pradesh",    capital: "Amaravati",   center: [15.9, 79.7],  zoom: 7,  bbox: { minLat: 12.6, maxLat: 19.9, minLng: 76.8, maxLng: 84.8 } },
  { name: "Arunachal Pradesh", capital: "Itanagar",    center: [28.2, 94.7],  zoom: 7,  bbox: { minLat: 26.6, maxLat: 29.5, minLng: 91.6, maxLng: 97.4 } },
  { name: "Assam",             capital: "Dispur",      center: [26.2, 92.9],  zoom: 7,  bbox: { minLat: 24.1, maxLat: 27.9, minLng: 89.7, maxLng: 96.0 } },
  { name: "Bihar",             capital: "Patna",       center: [25.1, 85.3],  zoom: 7,  bbox: { minLat: 24.3, maxLat: 27.5, minLng: 83.3, maxLng: 88.3 } },
  { name: "Chhattisgarh",      capital: "Raipur",      center: [21.3, 81.9],  zoom: 7,  bbox: { minLat: 17.8, maxLat: 24.1, minLng: 80.0, maxLng: 84.4 } },
  { name: "Goa",               capital: "Panaji",      center: [15.3, 74.1],  zoom: 9,  bbox: { minLat: 14.9, maxLat: 15.8, minLng: 73.7, maxLng: 74.3 } },
  { name: "Gujarat",           capital: "Gandhinagar", center: [22.3, 71.2],  zoom: 7,  bbox: { minLat: 20.1, maxLat: 24.7, minLng: 68.2, maxLng: 74.5 } },
  { name: "Haryana",           capital: "Chandigarh",  center: [29.1, 76.1],  zoom: 8,  bbox: { minLat: 27.7, maxLat: 30.9, minLng: 74.5, maxLng: 77.6 } },
  { name: "Himachal Pradesh",  capital: "Shimla",      center: [31.1, 77.2],  zoom: 8,  bbox: { minLat: 30.4, maxLat: 33.2, minLng: 75.6, maxLng: 79.0 } },
  { name: "Jharkhand",         capital: "Ranchi",      center: [23.6, 85.3],  zoom: 7,  bbox: { minLat: 21.9, maxLat: 25.3, minLng: 83.3, maxLng: 87.9 } },
  { name: "Karnataka",         capital: "Bengaluru",   center: [15.3, 75.7],  zoom: 7,  bbox: { minLat: 11.6, maxLat: 18.5, minLng: 74.1, maxLng: 78.6 } },
  { name: "Kerala",            capital: "Thiruvananthapuram", center: [10.9, 76.3], zoom: 7, bbox: { minLat: 8.3, maxLat: 12.8, minLng: 74.9, maxLng: 77.4 } },
  { name: "Madhya Pradesh",    capital: "Bhopal",      center: [23.0, 78.7],  zoom: 7,  bbox: { minLat: 21.1, maxLat: 26.9, minLng: 74.0, maxLng: 82.8 } },
  { name: "Maharashtra",       capital: "Mumbai",      center: [19.8, 75.7],  zoom: 7,  bbox: { minLat: 15.6, maxLat: 22.0, minLng: 72.6, maxLng: 80.9 } },
  { name: "Manipur",           capital: "Imphal",      center: [24.7, 93.9],  zoom: 8,  bbox: { minLat: 23.8, maxLat: 25.7, minLng: 93.0, maxLng: 94.8 } },
  { name: "Meghalaya",         capital: "Shillong",    center: [25.5, 91.4],  zoom: 8,  bbox: { minLat: 25.0, maxLat: 26.1, minLng: 89.8, maxLng: 92.8 } },
  { name: "Mizoram",           capital: "Aizawl",      center: [23.2, 92.9],  zoom: 8,  bbox: { minLat: 21.9, maxLat: 24.5, minLng: 92.3, maxLng: 93.5 } },
  { name: "Nagaland",          capital: "Kohima",      center: [26.2, 94.6],  zoom: 8,  bbox: { minLat: 25.2, maxLat: 27.0, minLng: 93.3, maxLng: 95.3 } },
  { name: "Odisha",            capital: "Bhubaneswar", center: [20.9, 85.1],  zoom: 7,  bbox: { minLat: 17.8, maxLat: 22.6, minLng: 81.4, maxLng: 87.5 } },
  { name: "Punjab",            capital: "Chandigarh",  center: [31.1, 75.3],  zoom: 8,  bbox: { minLat: 29.5, maxLat: 32.5, minLng: 73.9, maxLng: 76.9 } },
  { name: "Rajasthan",         capital: "Jaipur",      center: [27.0, 74.2],  zoom: 7,  bbox: { minLat: 23.1, maxLat: 30.2, minLng: 69.5, maxLng: 78.3 } },
  { name: "Sikkim",            capital: "Gangtok",     center: [27.5, 88.5],  zoom: 9,  bbox: { minLat: 27.1, maxLat: 28.1, minLng: 88.0, maxLng: 88.9 } },
  { name: "Tamil Nadu",        capital: "Chennai",     center: [11.1, 78.7],  zoom: 7,  bbox: { minLat: 8.1,  maxLat: 13.6, minLng: 76.2, maxLng: 80.3 } },
  { name: "Telangana",         capital: "Hyderabad",   center: [18.1, 79.0],  zoom: 7,  bbox: { minLat: 15.9, maxLat: 19.9, minLng: 77.3, maxLng: 81.8 } },
  { name: "Tripura",           capital: "Agartala",    center: [23.9, 92.0],  zoom: 8,  bbox: { minLat: 22.9, maxLat: 24.5, minLng: 91.2, maxLng: 92.3 } },
  { name: "Uttar Pradesh",     capital: "Lucknow",     center: [26.8, 80.9],  zoom: 7,  bbox: { minLat: 23.9, maxLat: 30.4, minLng: 77.1, maxLng: 84.6 } },
  { name: "Uttarakhand",       capital: "Dehradun",    center: [30.1, 79.0],  zoom: 8,  bbox: { minLat: 28.7, maxLat: 31.5, minLng: 77.6, maxLng: 81.0 } },
  { name: "West Bengal",       capital: "Kolkata",     center: [23.0, 87.9],  zoom: 7,  bbox: { minLat: 21.5, maxLat: 27.2, minLng: 85.8, maxLng: 89.9 } },
  { name: "J&K",               capital: "Srinagar",    center: [33.8, 76.6],  zoom: 7,  bbox: { minLat: 32.3, maxLat: 37.1, minLng: 73.9, maxLng: 80.4 } },
  { name: "Andaman & Nicobar", capital: "Port Blair",  center: [11.7, 92.7],  zoom: 7,  bbox: { minLat: 6.8,  maxLat: 14.0, minLng: 92.2, maxLng: 94.3 } },
];

// ── OpenWeather risk calculator ───────────────────────────
function calcWeatherRisk(data, disasterType) {
  const temp      = data.main?.temp      ?? 25;
  const humidity  = data.main?.humidity  ?? 50;
  const windSpeed = data.wind?.speed     ?? 0;
  const rain1h    = data.rain?.["1h"]    ?? 0;
  const weatherId = data.weather?.[0]?.id ?? 800;
  let score = 0;

  switch (disasterType) {
    case "flood":
      if (rain1h > 20)  score = 3; else if (rain1h > 7) score = 2; else if (rain1h > 2) score = 1;
      if (humidity > 90) score += 1;
      if (weatherId < 300) score += 2; else if (weatherId < 600) score += 1;
      break;
    case "cyclone":
      if (windSpeed > 24) score = 3; else if (windSpeed > 17) score = 2; else if (windSpeed > 10) score = 1;
      if (weatherId >= 900 && weatherId < 910) score += 2;
      break;
    case "drought":
      if (rain1h === 0 && humidity < 30) score = 3; else if (humidity < 40) score = 2; else if (humidity < 55) score = 1;
      if (temp > 40) score += 2; else if (temp > 35) score += 1;
      break;
    case "wildfire":
      if (temp > 40 && humidity < 20) score = 3; else if (temp > 35 && humidity < 30) score = 2; else if (temp > 30) score = 1;
      if (windSpeed > 10) score += 1;
      break;
    case "landslide":
      if (rain1h > 15) score = 3; else if (rain1h > 5) score = 2; else if (rain1h > 1) score = 1;
      if (humidity > 85) score += 1;
      break;
    default:
      score = 0;
  }

  if (score >= 3) return { risk: "high",   color: "#ff3b5c", alertlevel: "Red"    };
  if (score >= 2) return { risk: "medium", color: "#ffb347", alertlevel: "Orange" };
  return            { risk: "low",    color: "#00e676", alertlevel: "Green"  };
}

// ── Helpers ───────────────────────────────────────────────
function makeDotIcon(color, size = 14) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border-radius:50%;
      border:2px solid rgba(255,255,255,0.8);
      box-shadow:0 0 12px ${color}, 0 0 4px ${color};
    "></div>`,
    className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  });
}

function MapController({ center, zoom }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    const key = `${center[0]},${center[1]},${zoom}`;
    if (prevRef.current === key) return;
    prevRef.current = key;
    map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

function Dropdown({ label, options, value, onChange, color, width = 190 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 1002 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: open ? `${color}25` : `${color}15`,
          border: `1px solid ${open ? color + "90" : color + "50"}`,
          borderRadius: 9, padding: "8px 13px", cursor: "pointer",
          color, fontSize: 11, fontFamily: "Space Mono, monospace", fontWeight: 700,
          whiteSpace: "nowrap", minWidth: width,
          boxShadow: open ? `0 0 18px ${color}35` : "0 2px 8px rgba(0,0,0,0.4)",
          transition: "all 0.2s ease", letterSpacing: "0.3px",
        }}
      >
        {label && <span style={{ fontSize: 9, color: color + "90", letterSpacing: "1px", marginRight: 2 }}>{label}:</span>}
        <span style={{ flex: 1, textAlign: "left" }}>{selected ? selected.label : "Select…"}</span>
        <span style={{ fontSize: 8, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          background: "#080e1c", border: "1px solid #1e2d45",
          borderRadius: 11, minWidth: width + 20,
          maxHeight: 300, overflowY: "auto",
          boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
          animation: "ddFade 0.15s ease forwards",
          scrollbarWidth: "thin", scrollbarColor: `${color}40 transparent`,
        }}>
          {options.map(opt => {
            const isSel = value === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.color = color; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSel ? `${color}18` : "transparent"; e.currentTarget.style.color = isSel ? color : "#8ab4d4"; }}
                style={{
                  padding: "9px 16px", cursor: "pointer",
                  fontSize: 11, fontFamily: "Space Mono, monospace",
                  color: isSel ? color : "#8ab4d4",
                  background: isSel ? `${color}18` : "transparent",
                  borderLeft: isSel ? `2px solid ${color}` : "2px solid transparent",
                  transition: "all 0.12s ease",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {isSel && <span style={{ fontSize: 8, color }}>●</span>}
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({ value, label, color }) {
  return (
    <div style={{ background: "#060b12", borderRadius: 10, padding: "12px 14px", border: "1px solid #1a2840" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "Space Mono, monospace", letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#5a7a9f", marginTop: 4, fontFamily: "monospace" }}>{label}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function MapView({ disasterType = "flood", onFilterChange }) {

  const [viewMode,        setViewMode]        = useState("global");
  const [selectedCountry, setSelectedCountry] = useState("IND");
  const [selectedState,   setSelectedState]   = useState("Uttar Pradesh");

  const [allEvents,       setAllEvents]       = useState([]);
  const [owStateData,     setOwStateData]     = useState(null);   // OpenWeather data for selected state
  const [owLoading,       setOwLoading]       = useState(false);

  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [lastUpdated,     setLastUpdated]      = useState(null);

  const typeInfo = DISASTER_TYPE_MAP[disasterType] || DISASTER_TYPE_MAP.flood;
  useEffect(() => {
  if (!onFilterChange) return;
  if (viewMode === "global") {
    onFilterChange({ mode: "global", country: "all", state: "all" });
  } else if (viewMode === "country") {
    const c = COUNTRIES.find(c => c.iso === selectedCountry);
    onFilterChange({ mode: "country", country: c?.name || "all", state: "all" });
  } else if (viewMode === "state") {
    onFilterChange({ mode: "state", country: "India", state: selectedState });
  }
}, [viewMode, selectedCountry, selectedState, onFilterChange]);

  // ── Fetch GDACS ───────────────────────────────────────
  const fetchEvents = useCallback(async (type, country = "") => {
    setLoading(true); setError(null);
    try {
      const info   = DISASTER_TYPE_MAP[type] || DISASTER_TYPE_MAP.flood;
      const params = new URLSearchParams({ eventlist: info.code, alertlevel: "Green,Orange,Red", limit: 500 });
      
      // ✅ Country filter add karo
      if (country && country !== "global") params.append("country", country);
      
      const res = await fetch(`${GDACS_API}?${params}`);
      if (!res.ok) throw new Error(`GDACS API ${res.status}`);
      const json   = await res.json();

      const events = (json?.features || []).map(f => {
        const p      = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const alert  = ALERT_MAP[p.alertlevel] || ALERT_MAP.Green;
        return {
          name:         p.name || p.eventname || "Event",
          country:      p.country || "",
          iso3:         (p.iso3 || "").toUpperCase(),
          lat:          coords[1], lng: coords[0],
          risk:         alert.risk, color: alert.color,
          alertlevel:   p.alertlevel || "Green",
          severity:     p.severitydata?.severity ?? p.severity ?? "N/A",
          severityUnit: p.severitydata?.severityunit ?? "",
          deaths:       p.sendai?.deaths   ?? 0,
          affected:     p.sendai?.affected ?? 0,
          date:         p.todate || p.fromdate || "",
          eventId:      p.eventid || "",
          source:       "GDACS",
          url:          p.url?.report || `https://www.gdacs.org/report.aspx?eventid=${p.eventid}&eventtype=${info.code}`,
        };
      }).filter(e => !(e.lat === 0 && e.lng === 0));

      setAllEvents(events);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message); setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch OpenWeather for selected state ──────────────
  const fetchStateWeather = useCallback(async (stateName, type) => {
    const st = INDIA_STATES.find(s => s.name === stateName);
    if (!st) return;
    setOwLoading(true);
    try {
      const params = new URLSearchParams({ lat: st.center[0], lon: st.center[1], appid: OW_KEY, units: "metric" });
      const res    = await fetch(`${OPENWEATHER_API}?${params}`);
      if (!res.ok) throw new Error("OW fetch failed");
      const data   = await res.json();
      const risk   = calcWeatherRisk(data, type);

      setOwStateData({
        stateName,
        capital:     st.capital,
        lat:         st.center[0],
        lng:         st.center[1],
        temp:        Math.round(data.main?.temp      ?? 0),
        feelsLike:   Math.round(data.main?.feels_like ?? 0),
        humidity:    data.main?.humidity  ?? 0,
        windSpeed:   data.wind?.speed     ?? 0,
        rain1h:      data.rain?.["1h"]    ?? 0,
        weatherDesc: data.weather?.[0]?.description ?? "—",
        weatherIcon: data.weather?.[0]?.icon        ?? "",
        cityId:      data.id,
        ...risk,
      });
    } catch {
      setOwStateData(null);
    } finally {
      setOwLoading(false);
    }
  }, []);

  // ── Initial + auto refresh ────────────────────────────
  useEffect(() => {
    fetchEvents(disasterType, viewMode === "country" ? selectedCountry : "");
    const iv = setInterval(() => fetchEvents(disasterType, viewMode === "country" ? selectedCountry : ""), 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [disasterType, fetchEvents, viewMode, selectedCountry]);
  
  // ── Fetch OW when state view active or state changes ──
  useEffect(() => {
    if (viewMode === "state") {
      fetchStateWeather(selectedState, disasterType);
      const iv = setInterval(() => fetchStateWeather(selectedState, disasterType), 10 * 60 * 1000);
      return () => clearInterval(iv);
    }
  }, [viewMode, selectedState, disasterType, fetchStateWeather]);

  // ── Filter events ─────────────────────────────────────
  const gdacsVisible = (() => {
    if (viewMode === "global") return allEvents;
    if (viewMode === "country") return allEvents.filter(e => e.iso3 === selectedCountry);
    if (viewMode === "state") {
      const st = INDIA_STATES.find(s => s.name === selectedState);
      if (!st) return [];
      return allEvents.filter(e =>
        e.lat >= st.bbox.minLat && e.lat <= st.bbox.maxLat &&
        e.lng >= st.bbox.minLng && e.lng <= st.bbox.maxLng
      );
    }
    return allEvents;
  })();

  // In state view: show GDACS events + OW marker
  const visibleEvents = viewMode === "state" && owStateData
    ? [...gdacsVisible, { ...owStateData, source: "OpenWeather", eventId: `ow-${owStateData.stateName}`, name: owStateData.stateName, country: "India" }]
    : gdacsVisible;

  // ── Map config ────────────────────────────────────────
  const mapConfig = (() => {
    if (viewMode === "global")  return { center: [20, 0], zoom: 2 };
    if (viewMode === "country") { const c = COUNTRIES.find(c => c.iso === selectedCountry); return { center: c?.center || [20, 0], zoom: c?.zoom || 5 }; }
    const st = INDIA_STATES.find(s => s.name === selectedState);
    return { center: st?.center || [22.5, 82.5], zoom: st?.zoom || 7 };
  })();

  const redCount    = visibleEvents.filter(e => e.alertlevel === "Red").length;
  const orangeCount = visibleEvents.filter(e => e.alertlevel === "Orange").length;
  const greenCount  = visibleEvents.filter(e => e.alertlevel === "Green").length;
  const totalDeaths = visibleEvents.reduce((s, e) => s + (e.deaths || 0), 0);

  const viewOptions    = [
    { value: "global",  label: "🌍  Global" },
    { value: "country", label: "🌐  By Country" },
    { value: "state",   label: "📍  India — By State" },
  ];
  const countryOptions = COUNTRIES.map(c => ({ value: c.iso, label: c.name }));
  const stateOptions   = INDIA_STATES.map(s => ({ value: s.name, label: s.name }));

  const badgeLabel = (() => {
    if (viewMode === "global")  return "LIVE · GDACS Global";
    if (viewMode === "country") { const c = COUNTRIES.find(c => c.iso === selectedCountry); return `LIVE · ${c?.name || selectedCountry}`; }
    return `LIVE · India › ${selectedState}`;
  })();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, height: "calc(100vh - 140px)" }}>

      {/* ══ MAP PANEL ══ */}
      <div style={{
        background: "#0a0e1a", borderRadius: 14,
        border: `1px solid ${typeInfo.color}35`,
        overflow: "hidden", position: "relative",
        boxShadow: `0 0 40px ${typeInfo.color}12, 0 8px 32px rgba(0,0,0,0.5)`,
      }}>

        {/* Top Controls */}
        <div style={{ position: "absolute", top: 14, left: 14, zIndex: 1002, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

          {/* Status badge */}
          <div style={{
            background: "rgba(8,14,28,0.92)", border: `1px solid ${typeInfo.color}45`,
            borderRadius: 9, padding: "7px 14px", fontFamily: "monospace",
            fontSize: 11, color: "#7a9bbf", display: "flex", alignItems: "center", gap: 8,
            backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", display: "inline-block",
              background: loading ? "#ffb347" : "#00e676",
              boxShadow: `0 0 8px ${loading ? "#ffb347" : "#00e676"}`,
              animation: "pulse 2s infinite",
            }} />
            {typeInfo.icon} {typeInfo.label} — {badgeLabel}
            {lastUpdated && <span style={{ color: "#3a5a7a", fontSize: 10 }}>· {lastUpdated}</span>}
          </div>

          <Dropdown options={viewOptions} value={viewMode} onChange={setViewMode} color={typeInfo.color} width={190} />

          {viewMode === "country" && (
            <Dropdown label="COUNTRY" options={countryOptions} value={selectedCountry} onChange={setSelectedCountry} color={typeInfo.color} width={190} />
          )}
          {viewMode === "state" && (
            <Dropdown label="STATE" options={stateOptions} value={selectedState} onChange={setSelectedState} color={typeInfo.color} width={210} />
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={() => { fetchEvents(disasterType); if (viewMode === "state") fetchStateWeather(selectedState, disasterType); }}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 1002,
            background: "rgba(8,14,28,0.92)", border: `1px solid ${typeInfo.color}45`,
            borderRadius: 9, padding: "8px 14px", fontFamily: "monospace",
            fontSize: 11, color: typeInfo.color, cursor: "pointer",
            backdropFilter: "blur(8px)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)", transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${typeInfo.color}20`}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(8,14,28,0.92)"}
        >↻ Refresh</button>

        {/* Loading */}
        {(loading || owLoading) && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 1000,
            background: "rgba(8,14,28,0.85)", backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
          }}>
            <div style={{ width: 44, height: 44, border: `3px solid ${typeInfo.color}35`, borderTop: `3px solid ${typeInfo.color}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <span style={{ fontFamily: "monospace", color: typeInfo.color, fontSize: 13 }}>
              {owLoading ? "Fetching live weather data…" : "Fetching live GDACS data…"}
            </span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 1001, background: "#1a0808", border: "1px solid #ff3b5c50", borderRadius: 9, padding: "10px 18px", fontFamily: "monospace", fontSize: 11, color: "#ff3b5c", whiteSpace: "nowrap" }}>
            ⚠ {error} — click Refresh to retry
          </div>
        )}

        {/* No events */}
        {!loading && !error && visibleEvents.length === 0 && (
          <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 1001, background: "rgba(8,14,28,0.92)", border: `1px solid ${typeInfo.color}40`, borderRadius: 9, padding: "10px 18px", fontFamily: "monospace", fontSize: 11, color: typeInfo.color, whiteSpace: "nowrap" }}>
            ℹ No live {typeInfo.label} events for {viewMode === "country" ? COUNTRIES.find(c => c.iso === selectedCountry)?.name : viewMode === "state" ? `${selectedState}, India` : "this region"} right now
          </div>
        )}

        {/* ── MAP ── */}
        <MapContainer center={[20, 0]} zoom={2} style={{ width: "100%", height: "100%" }} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={19} />
          <MapController center={mapConfig.center} zoom={mapConfig.zoom} />

          {visibleEvents.map((ev, i) => {
            const color    = ev.color;
            const isOW     = ev.source === "OpenWeather";
            const radius   = isOW ? 60000 : ev.deaths > 5000 ? 200000 : ev.deaths > 1000 ? 130000 : ev.deaths > 100 ? 90000 : 60000;
            const severity = ev.severity !== "N/A" ? `${Number(ev.severity).toFixed(1)} ${ev.severityUnit}` : "N/A";
            const dateStr  = ev.date ? new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

            return (
              <div key={`${ev.eventId}-${i}`}>
                <Circle center={[ev.lat, ev.lng]} radius={radius} pathOptions={{ color, fillColor: color, fillOpacity: 0.14, weight: 1.5, opacity: 0.5 }} />
                <Marker position={[ev.lat, ev.lng]} icon={makeDotIcon(color, isOW ? 18 : 14)}>
                  <Popup maxWidth={280}>
                    <div style={{ fontFamily: "monospace", background: "#0d1520", color: "#e8f4fd", padding: 16, borderRadius: 10, border: `1px solid ${color}40`, minWidth: 240 }}>

                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 22 }}>{isOW ? "🌤" : typeInfo.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color }}>{ev.name}</div>
                          <div style={{ fontSize: 10, color: "#7a9bbf", marginTop: 2 }}>
                            {isOW ? `${ev.capital} · India` : ev.country}
                          </div>
                          {isOW && (
                            <div style={{ fontSize: 10, color: "#5a7a9f", marginTop: 2 }}>
                              📡 OpenWeatherMap · Live
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Alert badge */}
                      <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, marginBottom: 12, background: `${color}22`, border: `1px solid ${color}`, color, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                        ⚠ {ev.alertlevel} {isOW ? "RISK" : "ALERT"}
                      </div>

                      {/* Stats */}
                      <div style={{ display: "grid", gap: 6, fontSize: 11 }}>
                        {isOW ? (
                          <>
                            {[
                              ["Condition",   ev.weatherDesc,          "white"   ],
                              ["Temperature", `${ev.temp}°C (feels ${ev.feelsLike}°C)`, "#ffb347"],
                              ["Humidity",    `${ev.humidity}%`,        "#00d4ff" ],
                              ["Wind Speed",  `${ev.windSpeed} m/s`,    "#a855f7" ],
                              ["Rain (1h)",   `${ev.rain1h} mm`,        "#00d4ff" ],
                              ["Risk Level",  ev.risk?.toUpperCase(),   color     ],
                            ].map(([label, val, c]) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ color: "#7a9bbf" }}>{label}</span>
                                <span style={{ color: c, fontWeight: 700 }}>{val}</span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {[
                              ["Severity",    severity,                                          "white"   ],
                              ["Deaths",      ev.deaths > 0 ? ev.deaths.toLocaleString() : "—", "#ff3b5c" ],
                              ["Affected",    ev.affected > 0 ? ev.affected.toLocaleString() : "—", "#ffb347"],
                              ["Last Update", dateStr,                                           "#00e676" ],
                            ].map(([label, val, c]) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ color: "#7a9bbf" }}>{label}</span>
                                <span style={{ color: c, fontWeight: 700 }}>{val}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Link */}
                      <a
                        href={isOW ? `https://openweathermap.org/city/${ev.cityId}` : ev.url}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", marginTop: 12, textAlign: "center", padding: "6px 10px", borderRadius: 7, background: `${color}18`, border: `1px solid ${color}50`, color, fontSize: 10, textDecoration: "none", fontWeight: 700 }}
                      >
                        {isOW ? "🌤 VIEW ON OPENWEATHER →" : "🔗 VIEW ON GDACS →"}
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>

      {/* ══ SIDE PANEL ══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

        {/* Live Stats */}
        <div style={{ background: "linear-gradient(135deg,#0d1520,#080d14)", border: "1px solid #1a2840", borderRadius: 14, padding: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#8ab4d4", textTransform: "uppercase", fontFamily: "Space Mono, monospace" }}>Live Stats</span>
            <span style={{ fontSize: 10, color: "#00e676", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, background: "#00e676", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #00e676", animation: "pulse 2s infinite" }} />
              LIVE
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StatBox value={visibleEvents.length} label="Active Events" color={typeInfo.color} />
            <StatBox value={redCount}             label="Red Alerts"    color="#ff3b5c" />
            <StatBox value={orangeCount}          label="Orange Alerts" color="#ffb347" />
            <StatBox value={totalDeaths > 0 ? totalDeaths.toLocaleString() : "0"} label="Total Deaths" color="#ff6b6b" />
          </div>
        </div>

        {/* OpenWeather State Card — shown only in state view */}
        {viewMode === "state" && owStateData && (
          <div style={{
            background: `linear-gradient(135deg, ${owStateData.color}12, #080d14)`,
            border: `1px solid ${owStateData.color}40`, borderRadius: 14, padding: 18,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: owStateData.color, textTransform: "uppercase", fontFamily: "Space Mono, monospace" }}>
                🌤 Live Weather
              </span>
              <span style={{ fontSize: 9, color: "#5a7a9f", fontFamily: "monospace" }}>OpenWeather</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#c8dff0", fontFamily: "monospace", marginBottom: 4 }}>
              {owStateData.stateName}
            </div>
            <div style={{ fontSize: 10, color: "#5a7a9f", fontFamily: "monospace", marginBottom: 12 }}>
              Capital: {owStateData.capital}
            </div>

            {/* Risk badge */}
            <div style={{
              display: "inline-block", padding: "4px 12px", borderRadius: 20, marginBottom: 12,
              background: `${owStateData.color}22`, border: `1px solid ${owStateData.color}`,
              color: owStateData.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            }}>
              {owStateData.alertlevel} {typeInfo.label.toUpperCase()} RISK
            </div>

            {[
              ["🌡 Temp",       `${owStateData.temp}°C (feels ${owStateData.feelsLike}°C)`, "#ffb347"],
              ["💧 Humidity",   `${owStateData.humidity}%`,                                  "#00d4ff"],
              ["💨 Wind",       `${owStateData.windSpeed} m/s`,                              "#a855f7"],
              ["🌧 Rain (1h)",  `${owStateData.rain1h} mm`,                                  "#00d4ff"],
              ["☁ Condition",  owStateData.weatherDesc,                                      "white"  ],
            ].map(([label, val, c]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6, fontFamily: "monospace" }}>
                <span style={{ color: "#5a7a9f" }}>{label}</span>
                <span style={{ color: c, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current View Info */}
        <div style={{ background: "linear-gradient(135deg,#0d1520,#080d14)", border: `1px solid ${typeInfo.color}30`, borderRadius: 14, padding: 18 }}>
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: typeInfo.color, textTransform: "uppercase", fontFamily: "Space Mono, monospace" }}>Current View</p>
          {[
            ["Mode",    viewMode === "global" ? "Global" : viewMode === "country" ? "By Country" : "India — State"],
            ["Filter",  viewMode === "global"  ? "All Countries" : viewMode === "country" ? (COUNTRIES.find(c => c.iso === selectedCountry)?.name || selectedCountry) : selectedState],
            ["Events",  `${visibleEvents.length} live events`],
            ["Source",  viewMode === "state" ? "GDACS + OpenWeather" : "GDACS · Real-time"],
            ["Refresh", viewMode === "state" ? "GDACS 5min / OW 10min" : "Every 5 minutes"],
            ["Updated", lastUpdated || "—"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 10, fontFamily: "monospace" }}>
              <span style={{ color: "#3a5a7a", minWidth: 56 }}>{k}</span>
              <span style={{ color: "#8ab4d4" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Alert Levels */}
        <div style={{ background: "linear-gradient(135deg,#0d1520,#080d14)", border: "1px solid #1a2840", borderRadius: 14, padding: 18 }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: "#8ab4d4", textTransform: "uppercase", fontFamily: "Space Mono, monospace" }}>Alert Levels</p>
          {[
            { color: "#ff3b5c", label: "Red",    count: redCount,    desc: "High — International response needed" },
            { color: "#ffb347", label: "Orange",  count: orangeCount, desc: "Medium — Significant regional impact" },
            { color: "#00e676", label: "Green",   count: greenCount,  desc: "Low — Monitoring in progress"         },
          ].map(({ color, label, count, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 2, boxShadow: `0 0 6px ${color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "Space Mono, monospace" }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color, fontFamily: "monospace", background: `${color}18`, padding: "1px 8px", borderRadius: 6 }}>{count}</span>
                </div>
                <div style={{ fontSize: 10, color: "#5a7a9f", fontFamily: "monospace", marginTop: 3 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Country events list */}
        {viewMode === "country" && visibleEvents.length > 0 && (
          <div style={{ background: "linear-gradient(135deg,#0d1520,#080d14)", border: `1px solid ${typeInfo.color}30`, borderRadius: 14, padding: 18 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: typeInfo.color, textTransform: "uppercase", fontFamily: "Space Mono, monospace" }}>
              {COUNTRIES.find(c => c.iso === selectedCountry)?.name} Events
            </p>
            {visibleEvents.slice(0, 6).map((ev, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < Math.min(visibleEvents.length, 6) - 1 ? "1px solid #0f1d2e" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#c8dff0", fontFamily: "monospace" }}>{ev.name}</div>
                  <div style={{ fontSize: 10, color: "#3a5a7a", fontFamily: "monospace", marginTop: 2 }}>
                    {ev.date ? new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: `${ev.color}20`, color: ev.color, border: `1px solid ${ev.color}40`, fontFamily: "monospace" }}>{ev.alertlevel}</span>
              </div>
            ))}
            {visibleEvents.length > 6 && (
              <div style={{ fontSize: 10, color: "#3a5a7a", fontFamily: "monospace", marginTop: 8, textAlign: "center" }}>+{visibleEvents.length - 6} more events on map</div>
            )}
          </div>
        )}

        {/* State events list */}
        {viewMode === "state" && (
          <div style={{ background: `linear-gradient(135deg, ${typeInfo.color}10, ${typeInfo.color}04)`, border: `1px solid ${typeInfo.color}35`, borderRadius: 14, padding: 18 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", color: typeInfo.color, textTransform: "uppercase", fontFamily: "Space Mono, monospace" }}>
              📍 {selectedState} — GDACS Events
            </p>
            {gdacsVisible.length === 0 ? (
              <div style={{ fontSize: 11, color: "#5a7a9f", fontFamily: "monospace" }}>
                No live {typeInfo.label} GDACS events in {selectedState} right now.
                <div style={{ marginTop: 8, fontSize: 10, color: "#3a5a7a" }}>Weather risk shown above via OpenWeather.</div>
              </div>
            ) : gdacsVisible.map((ev, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: i < gdacsVisible.length - 1 ? "1px solid #0f1d2e" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#c8dff0", fontFamily: "monospace" }}>{ev.name}</div>
                  <div style={{ fontSize: 10, color: "#3a5a7a", fontFamily: "monospace", marginTop: 2 }}>{ev.lat.toFixed(2)}°N, {ev.lng.toFixed(2)}°E</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5, background: `${ev.color}20`, color: ev.color, border: `1px solid ${ev.color}40`, fontFamily: "monospace" }}>{ev.alertlevel}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin   { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes ddFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .leaflet-popup-content-wrapper { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { display: none !important; }
      `}</style>
    </div>
  );
}
