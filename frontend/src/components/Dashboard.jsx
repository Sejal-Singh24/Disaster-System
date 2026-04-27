import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// REAL DATA — EM-DAT India Floods 2000–2021
const yearlyData = [
  { year: "2000", deaths: 2086, affected_M: 50.4, events: 6  },
  { year: "2001", deaths: 581,  affected_M: 20.6, events: 9  },
  { year: "2002", deaths: 735,  affected_M: 42.0, events: 6  },
  { year: "2003", deaths: 452,  affected_M: 7.6,  events: 6  },
  { year: "2004", deaths: 1348, affected_M: 33.2, events: 6  },
  { year: "2005", deaths: 2129, affected_M: 28.3, events: 17 },
  { year: "2006", deaths: 1194, affected_M: 7.2,  events: 17 },
  { year: "2007", deaths: 2051, affected_M: 38.1, events: 16 },
  { year: "2008", deaths: 1590, affected_M: 14.0, events: 8  },
  { year: "2009", deaths: 1500, affected_M: 6.0,  events: 6  },
  { year: "2010", deaths: 690,  affected_M: 3.8,  events: 8  },
  { year: "2011", deaths: 608,  affected_M: 12.0, events: 7  },
  { year: "2012", deaths: 279,  affected_M: 4.2,  events: 6  },
  { year: "2013", deaths: 6453, affected_M: 3.4,  events: 5  },
  { year: "2014", deaths: 622,  affected_M: 5.2,  events: 7  },
  { year: "2015", deaths: 839,  affected_M: 16.4, events: 10 },
  { year: "2016", deaths: 666,  affected_M: 3.8,  events: 8  },
  { year: "2017", deaths: 1046, affected_M: 22.3, events: 9  },
  { year: "2018", deaths: 710,  affected_M: 23.3, events: 9  },
  { year: "2019", deaths: 2023, affected_M: 3.1,  events: 5  },
  { year: "2020", deaths: 2104, affected_M: 1.5,  events: 5  },
  { year: "2021", deaths: 320,  affected_M: 1.2,  events: 5  },
];

// State-wise deaths — EMDAT all years
const stateDeaths = [
  { state: "West Bengal", deaths: 32637 },
  { state: "Gujarat",     deaths: 29932 },
  { state: "Bihar",       deaths: 29364 },
  { state: "UP",          deaths: 29272 },
  { state: "Assam",       deaths: 26893 },
  { state: "Kerala",      deaths: 22943 },
  { state: "HP",          deaths: 19070 },
  { state: "Karnataka",   deaths: 17346 },
  { state: "Rajasthan",   deaths: 14682 },
  { state: "Maharashtra", deaths: 13216 },
];

// Flood types from EMDAT India
const floodTypes = [
  { type: "Riverine",  count: 221, pct: 71 },
  { type: "Flash",     count: 55,  pct: 18 },
  { type: "Other/N/A", count: 27,  pct: 9  },
  { type: "Coastal",   count: 8,   pct: 3  },
];

// Tooltip style
const TT = {
  background:   "#111827",
  border:       "1px solid #1e2d45",
  borderRadius: 8,
  fontFamily:   "Space Mono, monospace",
  fontSize:     11,
  color:        "#e8f4fd",
};

export default function Dashboard() {
  const totalDeaths   = yearlyData.reduce((s, d) => s + d.deaths,     0);
  const totalAffected = yearlyData.reduce((s, d) => s + d.affected_M, 0);
  const totalEvents   = yearlyData.reduce((s, d) => s + d.events,     0);
  const worstYear     = yearlyData.reduce((a, b) => a.deaths > b.deaths ? a : b);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── ROW 1: STAT CARDS ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 12,
      }}>
        {[
          {
            label: "Total Deaths (2000–21)",
            value: totalDeaths.toLocaleString(),
            icon: "💀", color: "#ff3b5c",
            sub: "EMDAT recorded",
          },
          {
            label: "People Affected",
            value: `${totalAffected.toFixed(0)}M`,
            icon: "👥", color: "#ffb347",
            sub: "total displaced",
          },
          {
            label: "Flood Events",
            value: totalEvents,
            icon: "🌊", color: "#00d4ff",
            sub: "India 2000–2021",
          },
          {
            label: "Worst Year Deaths",
            value: worstYear.deaths.toLocaleString(),
            icon: "⚠️", color: "#ff3b5c",
            sub: `${worstYear.year} — Uttarakhand`,
          },
          {
            label: "Avg Events/Year",
            value: (totalEvents / 22).toFixed(1),
            icon: "📊", color: "#00e676",
            sub: "per year avg",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ borderTop: `2px solid ${s.color}`, padding: 16 }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{
              fontSize: 20, fontWeight: 800,
              color: s.color, fontFamily: "monospace",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 10, color: "#7a9bbf",
              fontFamily: "monospace", marginTop: 2,
            }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: Deaths bar + Affected area ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Deaths per year — Bar Chart */}
        <div className="card">
          <p className="card-title">Annual Flood Deaths — India (2000–2021)</p>
          <div style={{
            fontSize: 10, fontFamily: "monospace",
            color: "#7a9bbf", marginBottom: 10,
          }}>
            📊 EM-DAT · 2013 spike = Uttarakhand disaster (6,054 deaths)
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={yearlyData}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#7a9bbf", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false} tickLine={false} interval={2}
              />
              <YAxis
                tick={{ fill: "#7a9bbf", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={TT}
                formatter={(val) => [val.toLocaleString(), "Deaths"]}
                labelFormatter={(label) =>
                  label === "2013" ? "2013 — Uttarakhand disaster" : label
                }
              />
              <Bar
                dataKey="deaths"
                fill="#ff3b5c"
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* People affected — Area Chart */}
        <div className="card">
          <p className="card-title">People Affected (Millions) — India (2000–2021)</p>
          <div style={{
            fontSize: 10, fontFamily: "monospace",
            color: "#7a9bbf", marginBottom: 10,
          }}>
            📊 EM-DAT · 2000 peak = Bihar + WB floods (50.4M people)
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart
              data={yearlyData}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <defs>
                <linearGradient id="affGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#7a9bbf", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false} tickLine={false} interval={2}
              />
              <YAxis
                tick={{ fill: "#7a9bbf", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={TT}
                formatter={(v) => [`${v}M`, "Affected"]}
              />
              <Area
                type="monotone"
                dataKey="affected_M"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#affGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 3: Events line + State bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Events per year — Line Chart */}
        <div className="card">
          <p className="card-title">Flood Events Per Year (2000–2021)</p>
          <div style={{
            fontSize: 10, fontFamily: "monospace",
            color: "#7a9bbf", marginBottom: 10,
          }}>
            📊 Peak 2005–2007: 16–17 events/year
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={yearlyData}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#7a9bbf", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false} tickLine={false} interval={2}
              />
              <YAxis
                tick={{ fill: "#7a9bbf", fontSize: 10 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={TT}
                formatter={(v) => [v, "Events"]}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#00e676"
                strokeWidth={2}
                dot={{ r: 3, fill: "#00e676" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* State-wise deaths — Horizontal Bar */}
        <div className="card">
          <p className="card-title">Top States by Deaths (All Years)</p>
          <div style={{
            fontSize: 10, fontFamily: "monospace",
            color: "#7a9bbf", marginBottom: 10,
          }}>
            📊 EM-DAT 1900–2021 · Total recorded deaths per state
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stateDeaths}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis
                type="number"
                tick={{ fill: "#7a9bbf", fontSize: 9 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fill: "#b0c8e0", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false} tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={TT}
                formatter={(v) => [v.toLocaleString(), "Deaths"]}
              />
              <Bar
                dataKey="deaths"
                fill="#ff6b35"
                radius={[0, 3, 3, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 4: Flood types + Notable events ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Flood type progress bars */}
        <div className="card">
          <p className="card-title">Flood Type Distribution — India EMDAT</p>
          {floodTypes.map((ft) => (
            <div key={ft.type} style={{ marginBottom: 16 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}>
                <span style={{
                  fontSize: 13, fontFamily: "monospace", color: "#b0c8e0",
                }}>
                  {ft.type} Flood
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  fontFamily: "monospace", color: "#00d4ff",
                }}>
                  {ft.count} ({ft.pct}%)
                </span>
              </div>
              <div style={{
                background: "#0a0e1a",
                borderRadius: 4, height: 8, overflow: "hidden",
              }}>
                <div style={{
                  width: `${ft.pct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background:
                    ft.type === "Riverine"  ? "#00d4ff" :
                    ft.type === "Flash"     ? "#ff6b35" :
                    ft.type === "Coastal"   ? "#00e676" : "#7a9bbf",
                }} />
              </div>
            </div>
          ))}
          <div style={{
            padding: "8px 10px",
            background: "#0a0e1a",
            borderRadius: 6,
            fontSize: 10,
            fontFamily: "monospace",
            color: "#7a9bbf",
          }}>
            Total India flood records: 311 (all years) · 181 (2000–2021)
          </div>
        </div>

        {/* Notable events table */}
        <div className="card">
          <p className="card-title">Notable Events from EMDAT</p>
          {[
            { year: "2013", event: "Uttarakhand Flash Floods",  deaths: "6,054",  affected: "5L",    sev: "high"   },
            { year: "2007", event: "Bihar Kosi Floods",         deaths: "1,103",  affected: "18.7M", sev: "high"   },
            { year: "2008", event: "Bihar Kosi Breach",         deaths: "1,063",  affected: "7.9M",  sev: "high"   },
            { year: "2018", event: "Kerala Floods",             deaths: "504",    affected: "23.2M", sev: "high"   },
            { year: "2019", event: "Bihar Multi-district",      deaths: "1,900",  affected: "3M",    sev: "high"   },
            { year: "2002", event: "Assam Barpeta Floods",      deaths: "549",    affected: "42M",   sev: "high"   },
            { year: "2005", event: "Gujarat + India-wide",      deaths: "1,200",  affected: "20M",   sev: "medium" },
            { year: "2014", event: "J&K Srinagar Floods",       deaths: "298",    affected: "2.75L", sev: "medium" },
          ].map((e) => (
            <div key={e.year + e.event} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid #1e2d45",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontFamily: "monospace", fontSize: 11,
                    color: "#00d4ff", fontWeight: 700,
                  }}>
                    {e.year}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {e.event}
                  </span>
                </div>
                <div style={{
                  fontSize: 10, color: "#7a9bbf", fontFamily: "monospace",
                }}>
                  💀 {e.deaths} · 👥 {e.affected}
                </div>
              </div>
              <span className={`badge badge-${e.sev}`} style={{ fontSize: 9 }}>
                {e.sev.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}