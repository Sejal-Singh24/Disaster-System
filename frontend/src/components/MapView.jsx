import { useEffect, useRef } from "react";

// REAL DATA — EM-DAT International Disaster Database
// India, Flood events, 1900–2021
// events = total recorded floods | deaths = total historical deaths
const FLOOD_DATA = [
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
  { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, state: "Odisha",           events: 7,  deaths: 4577,  risk: "low"   },
];

const RISK_COLORS = {
  high:   "#ff3b5c",
  medium: "#ffb347",
  low:    "#00e676",
};

export default function MapView() {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    // Step 1: Load the Leaflet CSS 
    const link  = document.createElement("link");
    link.rel    = "stylesheet";
    link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Step 2: Load the Leaflet JS
    const script   = document.createElement("script");
    script.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload  = () => {
      const L   = window.L;
      const map = L.map(mapRef.current, {
        center: [22.5, 82.5],
        zoom:   5,
      });
      mapInstance.current = map;

      // Dark tile layer (dark map layer).
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap © CARTO",
          subdomains:  "abcd",
          maxZoom:     19,
        }
      ).addTo(map);

      // Add a marker and a heatmap circle for each city.
      FLOOD_DATA.forEach((city) => {
        const color = RISK_COLORS[city.risk];

        // Heatmap circle size should be proportional to the actual EMDAT event count.
        L.circle([city.lat, city.lng], {
          radius:      city.events * 8000,
          color,
          fillColor:   color,
          fillOpacity: 0.15,
          weight:      1,
          opacity:     0.4,
        }).addTo(map);

        // Marker dot
        const icon = L.divIcon({
          html: `<div style="
            width: 14px;
            height: 14px;
            background: ${color};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px ${color};
          "></div>`,
          className:  "",
          iconSize:   [14, 14],
          iconAnchor: [7, 7],
        });

        // On click, show a popup with real EMDAT data.
        L.marker([city.lat, city.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="
              font-family: monospace;
              background: #111827;
              color: #e8f4fd;
              padding: 14px;
              border-radius: 8px;
              border: 1px solid #1e2d45;
              min-width: 210px;
            ">
              <strong style="font-size:15px; color:${color}">
                ${city.name}
              </strong><br/>
              <span style="color:#7a9bbf; font-size:11px">
                ${city.state}
              </span><br/><br/>
              <span style="color:#7a9bbf">Risk Level:</span>
              <span style="color:${color}; font-weight:bold; text-transform:uppercase">
                ${city.risk}
              </span><br/>
              <span style="color:#7a9bbf">Flood Events (1900–2021):</span>
              <span style="color:white"> ${city.events}</span><br/>
              <span style="color:#7a9bbf">Total Deaths (historical):</span>
              <span style="color:#ff3b5c; font-weight:700">
                ${city.deaths.toLocaleString()}
              </span><br/>
              <span style="color:#7a9bbf; font-size:10px">
                📊 Source: EM-DAT International Disaster Database
              </span>
            </div>
          `);
      });

      // Legend
      const legend    = L.control({ position: "bottomright" });
      legend.onAdd    = () => {
        const div       = L.DomUtil.create("div");
        div.innerHTML   = `
          <div style="
            background: #111827;
            border: 1px solid #1e2d45;
            border-radius: 10px;
            padding: 14px;
            font-family: monospace;
            font-size: 12px;
            color: #e8f4fd;
          ">
            <div style="font-weight:bold; margin-bottom:8px; color:#00d4ff; font-size:11px;">
              RISK ZONES — EMDAT DATA
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px">
              <span style="width:12px; height:12px; background:#ff3b5c; border-radius:50%; display:inline-block;"></span>
              High (25+ events)
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px">
              <span style="width:12px; height:12px; background:#ffb347; border-radius:50%; display:inline-block;"></span>
              Medium (10–25)
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px">
              <span style="width:12px; height:12px; background:#00e676; border-radius:50%; display:inline-block;"></span>
              Low (&lt;10 events)
            </div>
            <div style="color:#7a9bbf; font-size:10px; margin-top:6px;">
              Circle size = flood frequency
            </div>
          </div>
        `;
        return div;
      };
      legend.addTo(map);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 310px",
      gap: 20,
      height: "calc(100vh - 140px)",
    }}>

      {/* MAP */}
      <div style={{
        background:   "#111827",
        borderRadius: 12,
        border:       "1px solid #1e2d45",
        overflow:     "hidden",
        position:     "relative",
      }}>
        <div style={{
          position:   "absolute",
          top: 16, left: 16,
          zIndex:     1000,
          background: "#0a0e1a",
          border:     "1px solid #1e2d45",
          borderRadius: 8,
          padding:    "8px 14px",
          fontFamily: "monospace",
          fontSize:   12,
          color:      "#7a9bbf",
        }}>
          🗺️ India Flood Risk — EM-DAT 1900–2021 · Click the markers.
        </div>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* SIDE PANEL */}
      <div style={{
        display:        "flex",
        flexDirection:  "column",
        gap:            14,
        overflowY:      "auto",
      }}>

        {/* Dataset info */}
        <div className="card" style={{ borderTop: "2px solid #00d4ff" }}>
          <p className="card-title">Dataset Info</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}>
            {[
              {
                label: "Total Events",
                value: FLOOD_DATA.reduce((s, d) => s + d.events, 0),
                color: "#00d4ff",
              },
              {
                label: "High Risk",
                value: FLOOD_DATA.filter((d) => d.risk === "high").length,
                color: "#ff3b5c",
              },
              {
                label: "Total Deaths",
                value: FLOOD_DATA.reduce((s, d) => s + d.deaths, 0).toLocaleString(),
                color: "#ff3b5c",
              },
              {
                label: "States",
                value: FLOOD_DATA.length,
                color: "#00e676",
              },
            ].map((s) => (
              <div key={s.label} style={{
                background:   "#0a0e1a",
                borderRadius: 8,
                padding:      "12px 10px",
                textAlign:    "center",
              }}>
                <div style={{
                  fontSize:   18,
                  fontWeight: 800,
                  color:      s.color,
                  fontFamily: "monospace",
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize:   10,
                  color:      "#7a9bbf",
                  fontFamily: "monospace",
                  marginTop:  2,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding:    "8px 10px",
            background: "#0a0e1a",
            borderRadius: 6,
            fontSize:   10,
            fontFamily: "monospace",
            color:      "#7a9bbf",
            lineHeight: 1.8,
          }}>
            📊 EM-DAT International Disaster Database<br />
            🗓️ Period: 1900–2021 &nbsp;|&nbsp; Country: India<br />
            🌊 Type: Flood (all subtypes)
          </div>
        </div>

        {/* State ranking by deaths */}
        <div className="card" style={{ flex: 1, overflowY: "auto" }}>
          <p className="card-title">States by Deaths (EMDAT)</p>
          {[...FLOOD_DATA]
            .sort((a, b) => b.deaths - a.deaths)
            .map((city, i) => (
              <div key={city.name} style={{
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "center",
                padding:        "9px 0",
                borderBottom:   "1px solid #1e2d45",
              }}>
                <div style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        10,
                }}>
                  {/* Rank number */}
                  <span style={{
                    width:          20,
                    height:         20,
                    borderRadius:   4,
                    background:     "#0a0e1a",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontFamily:     "monospace",
                    fontSize:       10,
                    color:          "#7a9bbf",
                    flexShrink:     0,
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {city.name}
                    </div>
                    <div style={{
                      fontSize:   10,
                      color:      "#7a9bbf",
                      fontFamily: "monospace",
                    }}>
                      {city.state} · {city.events} events
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: "monospace",
                    fontSize:   11,
                    color:      "#ff3b5c",
                    fontWeight: 700,
                  }}>
                    {city.deaths.toLocaleString()}
                  </div>
                  <span
                    className={`badge badge-${city.risk}`}
                    style={{ fontSize: 9 }}
                  >
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