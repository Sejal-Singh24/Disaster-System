import { useEffect, useRef } from "react";

const DISASTER_MAP_DATA = {
  flood: {
    color: "#00d4ff",
    label: "Flood",
    points: [
      { name: "Guwahati",    lat: 26.1445, lng: 91.7362, state: "Assam",            events: 69, deaths: 26893, risk: "high"   },
      { name: "Lucknow",     lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh",    events: 60, deaths: 29272, risk: "high"   },
      { name: "Patna",       lat: 25.5941, lng: 85.1376, state: "Bihar",            events: 45, deaths: 29364, risk: "high"   },
      { name: "Kolkata",     lat: 22.5726, lng: 88.3639, state: "West Bengal",      events: 44, deaths: 32637, risk: "high"   },
      { name: "Ahmedabad",   lat: 23.0225, lng: 72.5714, state: "Gujarat",          events: 43, deaths: 29932, risk: "high"   },
      { name: "Kochi",       lat: 9.9312,  lng: 76.2673, state: "Kerala",           events: 32, deaths: 22943, risk: "high"   },
      { name: "Vijayawada",  lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh",   events: 31, deaths: 8376,  risk: "high"   },
      { name: "Mumbai",      lat: 19.0760, lng: 72.8777, state: "Maharashtra",      events: 29, deaths: 13216, risk: "high"   },
      { name: "Shimla",      lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh", events: 27, deaths: 19070, risk: "high"   },
      { name: "Bengaluru",   lat: 12.9716, lng: 77.5946, state: "Karnataka",        events: 25, deaths: 17346, risk: "medium" },
      { name: "Chennai",     lat: 13.0827, lng: 80.2707, state: "Tamil Nadu",       events: 22, deaths: 3063,  risk: "medium" },
      { name: "Jaipur",      lat: 26.9124, lng: 75.7873, state: "Rajasthan",        events: 21, deaths: 14682, risk: "medium" },
      { name: "Srinagar",    lat: 34.0837, lng: 74.7973, state: "J&K",              events: 20, deaths: 9358,  risk: "medium" },
      { name: "Dehradun",    lat: 30.3165, lng: 78.0322, state: "Uttarakhand",      events: 17, deaths: 9426,  risk: "medium" },
      { name: "Agartala",    lat: 23.8315, lng: 91.2868, state: "Tripura",          events: 11, deaths: 2046,  risk: "medium" },
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, state: "Odisha",           events: 7,  deaths: 4577,  risk: "low"    },
    ],
  },
  earthquake: {
    color: "#ff6b35",
    label: "Earthquake",
    points: [
      { name: "Bhuj",        lat: 23.2420, lng: 69.6669, state: "Gujarat",          events: 3,  deaths: 20005, risk: "high"   },
      { name: "Port Blair",  lat: 11.6234, lng: 92.7265, state: "Andaman & Nicobar",events: 2,  deaths: 10749, risk: "high"   },
      { name: "Srinagar",    lat: 34.0837, lng: 74.7973, state: "J&K",              events: 2,  deaths: 1309,  risk: "high"   },
      { name: "Gangtok",     lat: 27.3389, lng: 88.6065, state: "Sikkim",           events: 2,  deaths: 111,   risk: "medium" },
      { name: "Imphal",      lat: 24.8170, lng: 93.9368, state: "Manipur",          events: 2,  deaths: 80,    risk: "medium" },
      { name: "Dehradun",    lat: 30.3165, lng: 78.0322, state: "Uttarakhand",      events: 1,  deaths: 72,    risk: "medium" },
      { name: "Guwahati",    lat: 26.1445, lng: 91.7362, state: "Assam",            events: 1,  deaths: 50,    risk: "low"    },
      { name: "Mumbai",      lat: 19.0760, lng: 72.8777, state: "Maharashtra",      events: 1,  deaths: 30,    risk: "low"    },
    ],
  },
  cyclone: {
    color: "#a855f7",
    label: "Cyclone",
    points: [
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, state: "Odisha",           events: 45, deaths: 12500, risk: "high"   },
      { name: "Vijayawada",  lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh",   events: 38, deaths: 9800,  risk: "high"   },
      { name: "Chennai",     lat: 13.0827, lng: 80.2707, state: "Tamil Nadu",       events: 32, deaths: 8200,  risk: "high"   },
      { name: "Kolkata",     lat: 22.5726, lng: 88.3639, state: "West Bengal",      events: 28, deaths: 6100,  risk: "high"   },
      { name: "Ahmedabad",   lat: 23.0225, lng: 72.5714, state: "Gujarat",          events: 20, deaths: 4200,  risk: "medium" },
      { name: "Mumbai",      lat: 19.0760, lng: 72.8777, state: "Maharashtra",      events: 15, deaths: 2800,  risk: "medium" },
      { name: "Kochi",       lat: 9.9312,  lng: 76.2673, state: "Kerala",           events: 10, deaths: 1900,  risk: "medium" },
      { name: "Bengaluru",   lat: 12.9716, lng: 77.5946, state: "Karnataka",        events: 6,  deaths: 1200,  risk: "low"    },
    ],
  },
  drought: {
    color: "#f59e0b",
    label: "Drought",
    points: [
      { name: "Jaipur",      lat: 26.9124, lng: 75.7873, state: "Rajasthan",        events: 8,  deaths: 800,   risk: "high"   },
      { name: "Mumbai",      lat: 19.0760, lng: 72.8777, state: "Maharashtra",      events: 6,  deaths: 650,   risk: "high"   },
      { name: "Ahmedabad",   lat: 23.0225, lng: 72.5714, state: "Gujarat",          events: 5,  deaths: 400,   risk: "high"   },
      { name: "Bengaluru",   lat: 12.9716, lng: 77.5946, state: "Karnataka",        events: 4,  deaths: 350,   risk: "medium" },
      { name: "Bhopal",      lat: 23.2599, lng: 77.4126, state: "MP",               events: 3,  deaths: 280,   risk: "medium" },
      { name: "Vijayawada",  lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh",   events: 2,  deaths: 200,   risk: "medium" },
      { name: "Hyderabad",   lat: 17.3850, lng: 78.4867, state: "Telangana",        events: 2,  deaths: 180,   risk: "low"    },
      { name: "Ranchi",      lat: 23.3441, lng: 85.3096, state: "Jharkhand",        events: 1,  deaths: 120,   risk: "low"    },
    ],
  },
  landslide: {
    color: "#84cc16",
    label: "Landslide",
    points: [
      { name: "Dehradun",    lat: 30.3165, lng: 78.0322, state: "Uttarakhand",      events: 12, deaths: 2800,  risk: "high"   },
      { name: "Kochi",       lat: 9.9312,  lng: 76.2673, state: "Kerala",           events: 10, deaths: 1900,  risk: "high"   },
      { name: "Shimla",      lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh", events: 8,  deaths: 1500,  risk: "high"   },
      { name: "Srinagar",    lat: 34.0837, lng: 74.7973, state: "J&K",              events: 7,  deaths: 1200,  risk: "high"   },
      { name: "Guwahati",    lat: 26.1445, lng: 91.7362, state: "Assam",            events: 6,  deaths: 980,   risk: "medium" },
      { name: "Gangtok",     lat: 27.3389, lng: 88.6065, state: "Sikkim",           events: 4,  deaths: 650,   risk: "medium" },
      { name: "Itanagar",    lat: 27.0844, lng: 93.6053, state: "Arunachal",        events: 3,  deaths: 420,   risk: "low"    },
      { name: "Imphal",      lat: 24.8170, lng: 93.9368, state: "Manipur",          events: 2,  deaths: 310,   risk: "low"    },
    ],
  },
  wildfire: {
    color: "#ef4444",
    label: "Wildfire",
    points: [
      { name: "Dehradun",    lat: 30.3165, lng: 78.0322, state: "Uttarakhand",      events: 2,  deaths: 43,    risk: "high"   },
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, state: "Odisha",           events: 1,  deaths: 31,    risk: "medium" },
      { name: "Shimla",      lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh", events: 1,  deaths: 25,    risk: "medium" },
      { name: "Bhopal",      lat: 23.2599, lng: 77.4126, state: "MP",               events: 1,  deaths: 18,    risk: "low"    },
      { name: "Raipur",      lat: 21.2514, lng: 81.6296, state: "Chhattisgarh",     events: 1,  deaths: 12,    risk: "low"    },
    ],
  },
  tsunami: {
    color: "#06b6d4",
    label: "Tsunami",
    points: [
      { name: "Chennai",     lat: 13.0827, lng: 80.2707, state: "Tamil Nadu",       events: 1,  deaths: 8000,  risk: "high"   },
      { name: "Vijayawada",  lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh",   events: 1,  deaths: 1500,  risk: "high"   },
      { name: "Port Blair",  lat: 11.6234, lng: 92.7265, state: "Andaman & Nicobar",events: 1,  deaths: 749,   risk: "high"   },
      { name: "Kochi",       lat: 9.9312,  lng: 76.2673, state: "Kerala",           events: 1,  deaths: 500,   risk: "medium" },
    ],
  },
};

const RISK_COLORS = {
  high:   "#ff3b5c",
  medium: "#ffb347",
  low:    "#00e676",
};

export default function MapView({ disasterType = "flood" }) {
  const mapRef        = useRef(null);
  const mapInstance   = useRef(null);
  const markersLayer  = useRef(null);
  const leafletLoaded = useRef(false);

  // ── Initialize map once ──────────────────────────────────
  useEffect(() => {
    if (mapInstance.current) return;

    const link  = document.createElement("link");
    link.rel    = "stylesheet";
    link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script  = document.createElement("script");
    script.src    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      leafletLoaded.current = true;
      const L   = window.L;
      const map = L.map(mapRef.current, { center: [22.5, 82.5], zoom: 5 });
      mapInstance.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      markersLayer.current = L.layerGroup().addTo(map);
      renderMarkers(disasterType);
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current  = null;
        markersLayer.current = null;
        leafletLoaded.current = false;
      }
    };
  }, []);

  // ── Re-render markers when disasterType changes ──────────
  useEffect(() => {
    if (mapInstance.current && leafletLoaded.current) {
      renderMarkers(disasterType);
    }
  }, [disasterType]);

  function renderMarkers(type) {
    if (!markersLayer.current || !window.L) return;
    const L    = window.L;
    const data = DISASTER_MAP_DATA[type] || DISASTER_MAP_DATA.flood;

    markersLayer.current.clearLayers();

    data.points.forEach((city) => {
      const color = RISK_COLORS[city.risk];

      L.circle([city.lat, city.lng], {
        radius: city.events * 8000,
        color, fillColor: color,
        fillOpacity: 0.15, weight: 1, opacity: 0.4,
      }).addTo(markersLayer.current);

      const icon = L.divIcon({
        html: `<div style="
          width:14px; height:14px;
          background:${color}; border-radius:50%;
          border:2px solid white;
          box-shadow:0 0 10px ${color};
        "></div>`,
        className: "", iconSize: [14, 14], iconAnchor: [7, 7],
      });

      L.marker([city.lat, city.lng], { icon })
        .addTo(markersLayer.current)
        .bindPopup(`
          <div style="
            font-family:monospace; background:#111827;
            color:#e8f4fd; padding:14px; border-radius:8px;
            border:1px solid #1e2d45; min-width:210px;
          ">
            <strong style="font-size:15px; color:${color}">${city.name}</strong><br/>
            <span style="color:#7a9bbf; font-size:11px">${city.state}</span><br/><br/>
            <span style="color:#7a9bbf">Risk Level:</span>
            <span style="color:${color}; font-weight:bold; text-transform:uppercase"> ${city.risk}</span><br/>
            <span style="color:#7a9bbf">${data.label} Events:</span>
            <span style="color:white"> ${city.events}</span><br/>
            <span style="color:#7a9bbf">Total Deaths:</span>
            <span style="color:#ff3b5c; font-weight:700"> ${city.deaths.toLocaleString()}</span><br/>
            <span style="color:#7a9bbf; font-size:10px">📊 Source: EM-DAT 1900–2021</span>
          </div>
        `);
    });
  }

  const data         = DISASTER_MAP_DATA[disasterType] || DISASTER_MAP_DATA.flood;
  const totalEvents  = data.points.reduce((s, d) => s + d.events, 0);
  const totalDeaths  = data.points.reduce((s, d) => s + d.deaths, 0);
  const highRisk     = data.points.filter(d => d.risk === "high").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 20, height: "calc(100vh - 140px)" }}>

      {/* MAP */}
      <div style={{
        background: "#111827", borderRadius: 12,
        border: `1px solid ${data.color}30`, overflow: "hidden", position: "relative",
        boxShadow: `0 0 30px ${data.color}15`,
        transition: "border-color 0.4s, box-shadow 0.4s",
      }}>
        <div style={{
          position: "absolute", top: 16, left: 16, zIndex: 1000,
          background: "#0a0e1a", border: `1px solid ${data.color}40`,
          borderRadius: 8, padding: "8px 14px",
          fontFamily: "monospace", fontSize: 12, color: "#7a9bbf",
          boxShadow: `0 0 12px ${data.color}20`,
          transition: "all 0.3s",
        }}>
          {data.label} Risk Map — EM-DAT 1900–2021 · Markers click karo
        </div>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* SIDE PANEL */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

        {/* Dataset info */}
        <div className="card" style={{ borderTop: `2px solid ${data.color}` }}>
          <p className="card-title">Dataset Info</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[
              { label: "Total Events", value: totalEvents,                  color: data.color  },
              { label: "High Risk",    value: highRisk,                     color: "#ff3b5c"   },
              { label: "Total Deaths", value: totalDeaths.toLocaleString(), color: "#ff3b5c"   },
              { label: "States",       value: data.points.length,           color: "#00e676"   },
            ].map(s => (
              <div key={s.label} style={{ background: "#0a0e1a", borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 10px", background: "#0a0e1a", borderRadius: 6, fontSize: 10, fontFamily: "monospace", color: "#7a9bbf", lineHeight: 1.8 }}>
            📊 EM-DAT International Disaster Database<br />
            🗓️ Period: 1900–2021 &nbsp;|&nbsp; Country: India<br />
            🌊 Type: {data.label} (all subtypes)
          </div>
        </div>

        {/* State ranking */}
        <div className="card" style={{ flex: 1, overflowY: "auto" }}>
          <p className="card-title">States by Deaths (EMDAT)</p>
          {[...data.points].sort((a, b) => b.deaths - a.deaths).map((city, i) => (
            <div key={city.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 0", borderBottom: "1px solid #1e2d45",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4, background: "#0a0e1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "monospace", fontSize: 10, color: "#7a9bbf", flexShrink: 0,
                }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{city.name}</div>
                  <div style={{ fontSize: 10, color: "#7a9bbf", fontFamily: "monospace" }}>
                    {city.state} · {city.events} events
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#ff3b5c", fontWeight: 700 }}>
                  {city.deaths.toLocaleString()}
                </div>
                <span className={`badge badge-${city.risk}`} style={{ fontSize: 9 }}>
                  {city.risk.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
