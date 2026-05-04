import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Animated Counter Hook ─────────────────────────────────
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

// ── EMDAT Data per Disaster Type ──────────────────────────────
const DISASTER_DATA = {
  flood: {
    title       : "Flood",
    color       : "#00d4ff",
    icon        : "🌊",
    totalEvents : 311,
    yearlyData  : [
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
    ],
    stateDeaths : [
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
    ],
    subtypes : [
      { type: "Riverine",  count: 221, pct: 71 },
      { type: "Flash",     count: 55,  pct: 18 },
      { type: "Other/N/A", count: 27,  pct: 9  },
      { type: "Coastal",   count: 8,   pct: 3  },
    ],
    notable : [
      { year: "2013", event: "Uttarakhand Flash Floods", deaths: "6,054",  affected: "5L",    sev: "high"   },
      { year: "2007", event: "Bihar Kosi Floods",        deaths: "1,103",  affected: "18.7M", sev: "high"   },
      { year: "2008", event: "Bihar Kosi Breach",        deaths: "1,063",  affected: "7.9M",  sev: "high"   },
      { year: "2018", event: "Kerala Floods",            deaths: "504",    affected: "23.2M", sev: "high"   },
      { year: "2019", event: "Bihar Multi-district",     deaths: "1,900",  affected: "3M",    sev: "high"   },
      { year: "2005", event: "Gujarat + India-wide",     deaths: "1,200",  affected: "20M",   sev: "medium" },
    ],
    worstNote : "2013 spike = Uttarakhand disaster (6,054 deaths)",
    peakNote  : "2000 peak = Bihar + WB floods (50.4M people)",
    eventsNote: "Peak 2005–2007: 16–17 events/year",
  },
  earthquake: {
    title: "Earthquake", color: "#ff6b35", icon: "🏔️", totalEvents: 27,
    yearlyData: [
      { year: "2000", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2001", deaths: 20005, affected_M: 6.3,  events: 3 },
      { year: "2002", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2003", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2004", deaths: 10749, affected_M: 0.65, events: 2 },
      { year: "2005", deaths: 1309,  affected_M: 0.4,  events: 2 },
      { year: "2006", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2007", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2008", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2009", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2010", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2011", deaths: 111,   affected_M: 0.1,  events: 2 },
      { year: "2012", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2013", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2014", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2015", deaths: 218,   affected_M: 0.5,  events: 3 },
      { year: "2016", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2017", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2018", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2019", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2020", deaths: 0,     affected_M: 0,    events: 0 },
      { year: "2021", deaths: 0,     affected_M: 0,    events: 0 },
    ],
    stateDeaths: [
      { state: "Gujarat", deaths: 20005 }, { state: "Tamil Nadu", deaths: 10749 },
      { state: "Kashmir", deaths: 1309 }, { state: "Sikkim", deaths: 111 },
      { state: "Manipur", deaths: 80 }, { state: "Uttarakhand", deaths: 72 },
      { state: "Assam", deaths: 50 }, { state: "Maharashtra", deaths: 30 },
    ],
    subtypes: [
      { type: "Tectonic", count: 20, pct: 74 },
      { type: "Aftershock", count: 5, pct: 19 },
      { type: "Other", count: 2, pct: 7 },
    ],
    notable: [
      { year: "2001", event: "Bhuj Earthquake, Gujarat", deaths: "20,005", affected: "6.3M", sev: "high" },
      { year: "2004", event: "Indian Ocean Tsunami", deaths: "10,749", affected: "0.65M", sev: "high" },
      { year: "2005", event: "Kashmir Earthquake", deaths: "1,309", affected: "0.4M", sev: "high" },
      { year: "2011", event: "Sikkim Earthquake", deaths: "111", affected: "0.1M", sev: "medium" },
      { year: "2015", event: "Nepal-India Border Quake", deaths: "218", affected: "0.5M", sev: "medium" },
    ],
    worstNote: "2001 spike = Bhuj earthquake (20,005 deaths)",
    peakNote: "2004 peak = Indian Ocean Tsunami",
    eventsNote: "High seismic zones: Himalayan belt, Northeast India",
  },
  cyclone: {
    title: "Cyclone / Storm", color: "#a855f7", icon: "🌀", totalEvents: 206,
    yearlyData: [
      { year: "2000", deaths: 120, affected_M: 2.1, events: 8 },
      { year: "2001", deaths: 213, affected_M: 1.8, events: 9 },
      { year: "2002", deaths: 180, affected_M: 1.5, events: 7 },
      { year: "2003", deaths: 294, affected_M: 3.2, events: 10 },
      { year: "2004", deaths: 450, affected_M: 2.8, events: 8 },
      { year: "2005", deaths: 320, affected_M: 4.1, events: 11 },
      { year: "2006", deaths: 980, affected_M: 5.2, events: 12 },
      { year: "2007", deaths: 1800, affected_M: 8.4, events: 10 },
      { year: "2008", deaths: 210, affected_M: 1.9, events: 8 },
      { year: "2009", deaths: 290, affected_M: 4.5, events: 9 },
      { year: "2010", deaths: 180, affected_M: 2.1, events: 7 },
      { year: "2011", deaths: 112, affected_M: 1.4, events: 6 },
      { year: "2012", deaths: 95, affected_M: 0.9, events: 5 },
      { year: "2013", deaths: 45, affected_M: 1.2, events: 8 },
      { year: "2014", deaths: 82, affected_M: 0.8, events: 6 },
      { year: "2015", deaths: 280, affected_M: 3.1, events: 9 },
      { year: "2016", deaths: 450, affected_M: 4.2, events: 10 },
      { year: "2017", deaths: 190, affected_M: 1.8, events: 7 },
      { year: "2018", deaths: 120, affected_M: 1.1, events: 6 },
      { year: "2019", deaths: 89, affected_M: 1.5, events: 8 },
      { year: "2020", deaths: 128, affected_M: 2.3, events: 9 },
      { year: "2021", deaths: 210, affected_M: 3.1, events: 11 },
    ],
    stateDeaths: [
      { state: "Odisha", deaths: 12500 }, { state: "Andhra Pradesh", deaths: 9800 },
      { state: "Tamil Nadu", deaths: 8200 }, { state: "West Bengal", deaths: 6100 },
      { state: "Gujarat", deaths: 4200 }, { state: "Maharashtra", deaths: 2800 },
      { state: "Kerala", deaths: 1900 }, { state: "Karnataka", deaths: 1200 },
    ],
    subtypes: [
      { type: "Tropical Cyclone", count: 120, pct: 58 },
      { type: "Severe Storm", count: 56, pct: 27 },
      { type: "Other Storm", count: 30, pct: 15 },
    ],
    notable: [
      { year: "1999", event: "Odisha Super Cyclone", deaths: "10,000+", affected: "15M", sev: "high" },
      { year: "2007", event: "Cyclone Sidr (Bay Bengal)", deaths: "1,800", affected: "8.4M", sev: "high" },
      { year: "2013", event: "Cyclone Phailin, Odisha", deaths: "45", affected: "1.2M", sev: "medium" },
      { year: "2019", event: "Cyclone Fani, Odisha", deaths: "89", affected: "1.5M", sev: "medium" },
      { year: "2020", event: "Cyclone Amphan, WB", deaths: "128", affected: "2.3M", sev: "high" },
    ],
    worstNote: "2007 spike = Cyclone Sidr (Bay of Bengal)",
    peakNote: "2007 peak = 8.4M people affected",
    eventsNote: "Odisha most affected state — 10,000+ deaths in 1999",
  },
  drought: {
    title: "Drought", color: "#f59e0b", icon: "🌵", totalEvents: 16,
    yearlyData: [
      { year: "2000", deaths: 0, affected_M: 0, events: 0 },
      { year: "2001", deaths: 0, affected_M: 0, events: 0 },
      { year: "2002", deaths: 400, affected_M: 30.0, events: 2 },
      { year: "2003", deaths: 0, affected_M: 0, events: 0 },
      { year: "2004", deaths: 100, affected_M: 10.0, events: 1 },
      { year: "2005", deaths: 0, affected_M: 0, events: 0 },
      { year: "2006", deaths: 0, affected_M: 0, events: 0 },
      { year: "2007", deaths: 0, affected_M: 0, events: 0 },
      { year: "2008", deaths: 0, affected_M: 0, events: 0 },
      { year: "2009", deaths: 200, affected_M: 25.0, events: 2 },
      { year: "2010", deaths: 0, affected_M: 0, events: 0 },
      { year: "2011", deaths: 0, affected_M: 0, events: 0 },
      { year: "2012", deaths: 150, affected_M: 15.0, events: 2 },
      { year: "2013", deaths: 0, affected_M: 0, events: 0 },
      { year: "2014", deaths: 0, affected_M: 0, events: 0 },
      { year: "2015", deaths: 300, affected_M: 20.0, events: 2 },
      { year: "2016", deaths: 0, affected_M: 0, events: 0 },
      { year: "2017", deaths: 0, affected_M: 0, events: 0 },
      { year: "2018", deaths: 0, affected_M: 0, events: 0 },
      { year: "2019", deaths: 50, affected_M: 5.0, events: 1 },
      { year: "2020", deaths: 0, affected_M: 0, events: 0 },
      { year: "2021", deaths: 0, affected_M: 0, events: 0 },
    ],
    stateDeaths: [
      { state: "Rajasthan", deaths: 800 }, { state: "Maharashtra", deaths: 650 },
      { state: "Gujarat", deaths: 400 }, { state: "Karnataka", deaths: 350 },
      { state: "MP", deaths: 280 }, { state: "Andhra Pradesh", deaths: 200 },
      { state: "Telangana", deaths: 180 }, { state: "Jharkhand", deaths: 120 },
    ],
    subtypes: [
      { type: "Meteorological", count: 8, pct: 50 },
      { type: "Agricultural", count: 5, pct: 31 },
      { type: "Hydrological", count: 3, pct: 19 },
    ],
    notable: [
      { year: "2002", event: "Pan-India Drought", deaths: "400", affected: "30M", sev: "high" },
      { year: "2009", event: "Monsoon Failure Drought", deaths: "200", affected: "25M", sev: "high" },
      { year: "2012", event: "Weak Monsoon Drought", deaths: "150", affected: "15M", sev: "medium" },
      { year: "2015", event: "El Nino Drought", deaths: "300", affected: "20M", sev: "high" },
      { year: "2019", event: "Maharashtra Water Crisis", deaths: "50", affected: "5M", sev: "medium" },
    ],
    worstNote: "2002 spike = Pan-India drought (400 deaths)",
    peakNote: "2002 peak = 30M people affected",
    eventsNote: "Rajasthan most drought-prone state",
  },
  landslide: {
    title: "Landslide", color: "#84cc16", icon: "⛰️", totalEvents: 53,
    yearlyData: [
      { year: "2000", deaths: 210, affected_M: 0.1, events: 3 },
      { year: "2001", deaths: 180, affected_M: 0.08, events: 2 },
      { year: "2002", deaths: 95, affected_M: 0.05, events: 2 },
      { year: "2003", deaths: 120, affected_M: 0.06, events: 2 },
      { year: "2004", deaths: 85, affected_M: 0.04, events: 2 },
      { year: "2005", deaths: 270, affected_M: 0.12, events: 4 },
      { year: "2006", deaths: 150, affected_M: 0.07, events: 3 },
      { year: "2007", deaths: 310, affected_M: 0.15, events: 4 },
      { year: "2008", deaths: 95, affected_M: 0.05, events: 2 },
      { year: "2009", deaths: 180, affected_M: 0.09, events: 3 },
      { year: "2010", deaths: 420, affected_M: 0.2, events: 5 },
      { year: "2011", deaths: 230, affected_M: 0.11, events: 3 },
      { year: "2012", deaths: 680, affected_M: 0.3, events: 4 },
      { year: "2013", deaths: 1800, affected_M: 0.8, events: 5 },
      { year: "2014", deaths: 320, affected_M: 0.15, events: 3 },
      { year: "2015", deaths: 110, affected_M: 0.05, events: 2 },
      { year: "2016", deaths: 95, affected_M: 0.04, events: 2 },
      { year: "2017", deaths: 280, affected_M: 0.13, events: 3 },
      { year: "2018", deaths: 190, affected_M: 0.09, events: 3 },
      { year: "2019", deaths: 150, affected_M: 0.07, events: 2 },
      { year: "2020", deaths: 320, affected_M: 0.15, events: 4 },
      { year: "2021", deaths: 180, affected_M: 0.08, events: 2 },
    ],
    stateDeaths: [
      { state: "Uttarakhand", deaths: 2800 }, { state: "Kerala", deaths: 1900 },
      { state: "HP", deaths: 1500 }, { state: "J&K", deaths: 1200 },
      { state: "Assam", deaths: 980 }, { state: "Sikkim", deaths: 650 },
      { state: "Arunachal", deaths: 420 }, { state: "Manipur", deaths: 310 },
    ],
    subtypes: [
      { type: "Mud/Debris Flow", count: 28, pct: 53 },
      { type: "Rock Fall", count: 15, pct: 28 },
      { type: "Earth Slide", count: 10, pct: 19 },
    ],
    notable: [
      { year: "2013", event: "Kedarnath Landslide+Flood", deaths: "1,800", affected: "0.8M", sev: "high" },
      { year: "2010", event: "Leh Cloudburst Landslide", deaths: "420", affected: "0.2M", sev: "high" },
      { year: "2012", event: "Assam-Meghalaya Slides", deaths: "680", affected: "0.3M", sev: "high" },
      { year: "2018", event: "Kerala Landslides", deaths: "190", affected: "0.09M", sev: "medium" },
      { year: "2020", event: "Rajamala Munnar Slide", deaths: "320", affected: "0.15M", sev: "high" },
    ],
    worstNote: "2013 spike = Kedarnath (1,800 deaths)",
    peakNote: "2013 peak = 0.8M people affected",
    eventsNote: "Himalayan belt most vulnerable zone",
  },
  wildfire: {
    title: "Wildfire", color: "#ef4444", icon: "🔥", totalEvents: 4,
    yearlyData: [
      { year: "2000", deaths: 0, affected_M: 0, events: 0 }, { year: "2001", deaths: 0, affected_M: 0, events: 0 },
      { year: "2002", deaths: 0, affected_M: 0, events: 0 }, { year: "2003", deaths: 0, affected_M: 0, events: 0 },
      { year: "2004", deaths: 0, affected_M: 0, events: 0 }, { year: "2005", deaths: 0, affected_M: 0, events: 0 },
      { year: "2006", deaths: 0, affected_M: 0, events: 0 }, { year: "2007", deaths: 0, affected_M: 0, events: 0 },
      { year: "2008", deaths: 0, affected_M: 0, events: 0 },
      { year: "2009", deaths: 43, affected_M: 0.02, events: 1 },
      { year: "2010", deaths: 0, affected_M: 0, events: 0 }, { year: "2011", deaths: 0, affected_M: 0, events: 0 },
      { year: "2012", deaths: 0, affected_M: 0, events: 0 }, { year: "2013", deaths: 0, affected_M: 0, events: 0 },
      { year: "2014", deaths: 0, affected_M: 0, events: 0 }, { year: "2015", deaths: 0, affected_M: 0, events: 0 },
      { year: "2016", deaths: 31, affected_M: 0.01, events: 1 },
      { year: "2017", deaths: 0, affected_M: 0, events: 0 }, { year: "2018", deaths: 0, affected_M: 0, events: 0 },
      { year: "2019", deaths: 25, affected_M: 0.01, events: 1 },
      { year: "2020", deaths: 0, affected_M: 0, events: 0 },
      { year: "2021", deaths: 18, affected_M: 0.01, events: 1 },
    ],
    stateDeaths: [
      { state: "Uttarakhand", deaths: 43 }, { state: "Odisha", deaths: 31 },
      { state: "HP", deaths: 25 }, { state: "MP", deaths: 18 }, { state: "Chhattisgarh", deaths: 12 },
    ],
    subtypes: [{ type: "Forest Fire", count: 3, pct: 75 }, { type: "Grass Fire", count: 1, pct: 25 }],
    notable: [
      { year: "2009", event: "Uttarakhand Forest Fires", deaths: "43", affected: "0.02M", sev: "medium" },
      { year: "2016", event: "Odisha Forest Fires", deaths: "31", affected: "0.01M", sev: "medium" },
      { year: "2019", event: "HP Wildfire Season", deaths: "25", affected: "0.01M", sev: "medium" },
      { year: "2021", event: "MP Forest Fires", deaths: "18", affected: "0.01M", sev: "medium" },
    ],
    worstNote: "2009 spike = Uttarakhand forest fires (43 deaths)",
    peakNote: "Limited EMDAT records — many smaller fires unrecorded",
    eventsNote: "High risk: Dry season (March-June)",
  },
  tsunami: {
    title: "Tsunami", color: "#06b6d4", icon: "🌊", totalEvents: 2,
    yearlyData: [
      { year: "2000", deaths: 0, affected_M: 0, events: 0 }, { year: "2001", deaths: 0, affected_M: 0, events: 0 },
      { year: "2002", deaths: 0, affected_M: 0, events: 0 }, { year: "2003", deaths: 0, affected_M: 0, events: 0 },
      { year: "2004", deaths: 10749, affected_M: 0.65, events: 1 },
      { year: "2005", deaths: 0, affected_M: 0, events: 0 }, { year: "2006", deaths: 0, affected_M: 0, events: 0 },
      { year: "2007", deaths: 0, affected_M: 0, events: 0 }, { year: "2008", deaths: 0, affected_M: 0, events: 0 },
      { year: "2009", deaths: 0, affected_M: 0, events: 0 }, { year: "2010", deaths: 0, affected_M: 0, events: 0 },
      { year: "2011", deaths: 0, affected_M: 0, events: 0 }, { year: "2012", deaths: 0, affected_M: 0, events: 0 },
      { year: "2013", deaths: 0, affected_M: 0, events: 0 }, { year: "2014", deaths: 0, affected_M: 0, events: 0 },
      { year: "2015", deaths: 0, affected_M: 0, events: 0 }, { year: "2016", deaths: 0, affected_M: 0, events: 0 },
      { year: "2017", deaths: 0, affected_M: 0, events: 0 }, { year: "2018", deaths: 0, affected_M: 0, events: 0 },
      { year: "2019", deaths: 0, affected_M: 0, events: 0 }, { year: "2020", deaths: 0, affected_M: 0, events: 0 },
      { year: "2021", deaths: 0, affected_M: 0, events: 0 },
    ],
    stateDeaths: [
      { state: "Tamil Nadu", deaths: 8000 }, { state: "Andaman & Nicobar", deaths: 749 },
      { state: "Andhra Pradesh", deaths: 1500 }, { state: "Kerala", deaths: 500 },
    ],
    subtypes: [{ type: "Tectonic Tsunami", count: 2, pct: 100 }],
    notable: [
      { year: "2004", event: "Indian Ocean Tsunami", deaths: "10,749", affected: "0.65M", sev: "high" },
      { year: "1945", event: "Makran Coast Tsunami", deaths: "4,000", affected: "N/A", sev: "high" },
    ],
    worstNote: "2004 = Indian Ocean Tsunami (10,749 deaths in India)",
    peakNote: "Tamil Nadu worst affected — 8,000+ deaths",
    eventsNote: "Indian Ocean most tsunami-prone zone in Asia",
  },
};

// ── Tooltip Style ─────────────────────────────────────────
const TT = {
  background: "#0d1117",
  border: "1px solid #1e2d45",
  borderRadius: 10,
  fontFamily: "Space Mono, monospace",
  fontSize: 11,
  color: "#e8f4fd",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

// ── Stat Card with animated counter ──────────────────────
function StatCard({ label, rawValue, displayValue, icon, color, sub, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "18px 16px",
        background: hovered
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : "linear-gradient(135deg, #0d1520, #080d14)",
        border: `1px solid ${hovered ? color + "88" : color + "30"}`,
        borderRadius: 14,
        borderTop: `2px solid ${color}`,
        overflow: "hidden",
        cursor: "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        boxShadow: hovered
          ? `0 0 24px ${color}30, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* Glow orb */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        transition: "opacity 0.3s",
        opacity: hovered ? 1 : 0.4,
      }} />

      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontSize: 22, fontWeight: 800, color,
        fontFamily: "Space Mono, monospace",
        letterSpacing: "-0.5px",
        textShadow: hovered ? `0 0 20px ${color}80` : "none",
        transition: "text-shadow 0.3s",
      }}>
        {displayValue}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, color: "#c8dff0" }}>{label}</div>
      <div style={{ fontSize: 10, color: "#5a7a9f", fontFamily: "monospace", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ── Chart Card wrapper ────────────────────────────────────
function ChartCard({ title, note, children, color, delay = 0 }) {
  const [visible,      setVisible]      = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [btnHovered,   setBtnHovered]   = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0d1520",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
    setDownloading(false);
  };

  return (
    <div ref={cardRef} style={{
      background: "linear-gradient(135deg, #0d1520 0%, #080d14 100%)",
      border: "1px solid #1a2840",
      borderRadius: 14,
      padding: "18px 20px",
      transform: visible ? "translateY(0)" : "translateY(24px)",
      opacity: visible ? 1 : 0,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />

      {/* Header row with download button */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{
          margin: 0, fontSize: 11, fontWeight: 700,
          letterSpacing: "1.5px", color: "#8ab4d4", textTransform: "uppercase",
          fontFamily: "Space Mono, monospace", flex: 1,
        }}>{title}</p>

        {/* Download button */}
        <button
          onClick={handleDownload}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          title="Download as PNG"
          style={{
            background: btnHovered ? `${color}20` : "transparent",
            border: `1px solid ${btnHovered ? color + "60" : "#1a2840"}`,
            borderRadius: 8,
            padding: "4px 10px",
            cursor: downloading ? "wait" : "pointer",
            color: btnHovered ? color : "#4a6a8a",
            fontSize: 11,
            fontFamily: "monospace",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s ease",
            flexShrink: 0,
            marginLeft: 8,
            boxShadow: btnHovered ? `0 0 12px ${color}30` : "none",
          }}
        >
          {downloading ? (
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
          ) : (
            <>
              <span>📥</span>
              <span style={{ fontSize: 9, letterSpacing: "0.5px" }}>PNG</span>
            </>
          )}
        </button>
      </div>

      {note && (
        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4a6a8a", marginBottom: 14 }}>
          {note}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Main Dashboard Component ──────────────────────────────
export default function Dashboard({ disasterType = "flood" }) {
  const d = DISASTER_DATA[disasterType] || DISASTER_DATA.flood;

  const totalDeaths   = d.yearlyData.reduce((s, r) => s + r.deaths,     0);
  const totalAffected = d.yearlyData.reduce((s, r) => s + r.affected_M, 0);
  const totalEvents   = d.yearlyData.reduce((s, r) => s + r.events,     0);
  const worstYear     = d.yearlyData.reduce((a, b) => a.deaths > b.deaths ? a : b);

  const sevColor = { high: "#ff3b5c", medium: "#f59e0b", low: "#00e676" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "Space Mono, monospace" }}>

      {/* ── Disaster Type Header ── */}
      <div style={{
        padding: "14px 20px",
        background: `linear-gradient(135deg, ${d.color}14, ${d.color}05)`,
        border: `1px solid ${d.color}40`,
        borderLeft: `4px solid ${d.color}`,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: `0 0 40px ${d.color}15, 0 4px 20px rgba(0,0,0,0.3)`,
        animation: "fadeSlideIn 0.5s ease forwards",
      }}>
        <span style={{ fontSize: 32, filter: `drop-shadow(0 0 12px ${d.color}80)` }}>{d.icon}</span>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 800, color: d.color,
            textShadow: `0 0 30px ${d.color}60`,
            letterSpacing: "-0.3px",
          }}>
            {d.title} — India EMDAT Data
          </div>
          <div style={{ fontSize: 11, color: "#5a7a9f", fontFamily: "monospace", marginTop: 3 }}>
            Historical records 1900–2021 · Total EMDAT events: {d.totalEvents}
          </div>
        </div>
      </div>

      {/* ── ROW 1: STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <StatCard delay={0}   label="Total Deaths (2000–21)" displayValue={totalDeaths.toLocaleString()}       icon="💀" color="#ff3b5c" sub="EMDAT recorded"         />
        <StatCard delay={80}  label="People Affected"        displayValue={`${totalAffected.toFixed(1)}M`}     icon="👥" color="#ffb347" sub="total displaced"         />
        <StatCard delay={160} label={`${d.title} Events`}    displayValue={totalEvents}                        icon={d.icon} color={d.color} sub="India 2000–2021"     />
        <StatCard delay={240} label="Worst Year Deaths"      displayValue={worstYear.deaths.toLocaleString()}  icon="⚠️" color="#ff3b5c" sub={`${worstYear.year} worst`} />
        <StatCard delay={320} label="Avg Events/Year"        displayValue={(totalEvents / 22).toFixed(1)}      icon="📊" color="#00e676" sub="per year avg"            />
      </div>

      {/* ── ROW 2: Deaths bar + Affected area ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title={`Annual ${d.title} Deaths — India (2000–2021)`} note={`📊 EM-DAT · ${d.worstNote}`} color="#ff3b5c" delay={400}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.yearlyData.map((row) => {
              // Find notable event for this year to show state context
              const notable = d.notable.find(n => n.year === row.year);
              const worstState = notable ? notable.event : d.stateDeaths[0]?.state || "—";
              return { ...row, worstState };
            })} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={d.color} stopOpacity={1}   />
                  <stop offset="100%" stopColor={d.color} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1d2e" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "#4a6a8a", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#4a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TT}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload;
                  return (
                    <div style={{ ...TT, padding: "10px 14px", minWidth: 160 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#8ab4d4", marginBottom: 6, fontFamily: "monospace" }}>📅 {row.year}</div>
                      <div style={{ fontSize: 12, color: "#ff3b5c", fontWeight: 700, fontFamily: "monospace" }}>💀 {row.deaths.toLocaleString()} deaths</div>
                      <div style={{ fontSize: 10, color: "#6a9abf", marginTop: 4, fontFamily: "monospace" }}>📍 {row.worstState}</div>
                      <div style={{ fontSize: 10, color: "#4a6a8a", marginTop: 2, fontFamily: "monospace" }}>🗓️ {row.events} events</div>
                    </div>
                  );
                }}
                cursor={{ fill: `${d.color}10` }}
              />
              <Bar dataKey="deaths" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`People Affected by Subtype (Millions) — India (2000–2021)`} note={`📊 EM-DAT · ${d.peakNote}`} color={d.color} delay={480}>
          {/* Build subtype-split data */}
          {(() => {
            const subtypeColors = ["#00d4ff","#ff6b35","#a855f7","#00e676","#f59e0b","#ef4444","#06b6d4","#84cc16"];
            const keys = d.subtypes.map(s => s.type);
            const splitData = d.yearlyData.map(row => {
              const out = { year: row.year };
              d.subtypes.forEach(s => {
                out[s.type] = parseFloat((row.affected_M * s.pct / 100).toFixed(2));
              });
              return out;
            });
            const gradColors = [d.color, "#ff6b35", "#a855f7", "#00e676"];
            return (
              <>
                {/* Legend */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  {d.subtypes.map((s, i) => (
                    <div key={s.type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: gradColors[i] || subtypeColors[i] }} />
                      <span style={{ fontSize: 9, color: "#6a8aaa", fontFamily: "monospace" }}>{s.type} ({s.pct}%)</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={185}>
                  <AreaChart data={splitData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                    <defs>
                      {d.subtypes.map((s, i) => (
                        <linearGradient key={s.type} id={`aff${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={gradColors[i] || subtypeColors[i]} stopOpacity={0.5} />
                          <stop offset="95%" stopColor={gradColors[i] || subtypeColors[i]} stopOpacity={0}   />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f1d2e" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: "#4a6a8a", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fill: "#4a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TT} formatter={(v, name) => [`${v}M`, name]} cursor={{ stroke: d.color, strokeWidth: 1, strokeDasharray: "4 4" }} />
                    {d.subtypes.map((s, i) => (
                      <Area key={s.type} type="monotone" dataKey={s.type}
                        stroke={gradColors[i] || subtypeColors[i]} strokeWidth={2}
                        fill={`url(#aff${i})`} stackId="1"
                        dot={false}
                        activeDot={{ r: 4, fill: gradColors[i] || subtypeColors[i], stroke: "#0d1520", strokeWidth: 2 }}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </>
            );
          })()}
        </ChartCard>
      </div>

      {/* ── ROW 3: Events line + State bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title={`${d.title} Events Per Year (2000–2021)`} note={`📊 ${d.eventsNote}`} color="#00e676" delay={560}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={d.yearlyData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1d2e" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "#4a6a8a", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#4a6a8a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} formatter={(v) => [v, "Events"]} />
              <Line type="monotone" dataKey="events" stroke="#00e676" strokeWidth={2.5}
                dot={{ r: 4, fill: "#00e676", stroke: "#0d1520", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#00e676", filter: "url(#glow)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top States by Deaths (All Years)" note="📊 EM-DAT 1900–2021 · Total recorded deaths per state" color="#ff6b35" delay={640}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {d.stateDeaths.map((s, i) => {
              const max = d.stateDeaths[0].deaths;
              const pct = (s.deaths / max) * 100;
              return (
                <div key={s.state} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Rank */}
                  <span style={{ fontSize: 9, color: "#4a6a8a", fontFamily: "monospace", width: 14, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                  {/* Bar + label container */}
                  <div style={{ flex: 1, position: "relative", height: 22 }}>
                    {/* Background track */}
                    <div style={{ position: "absolute", inset: 0, background: "#0a1220", borderRadius: 4 }} />
                    {/* Filled bar */}
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, #ff6b35, #ff3b5c)`,
                      borderRadius: 4,
                      boxShadow: i === 0 ? "0 0 12px #ff6b3550" : "none",
                      minWidth: 4,
                    }} />
                    {/* State name — always on top of bar */}
                    <span style={{
                      position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                      fontSize: 10, fontFamily: "Space Mono, monospace", fontWeight: 700,
                      color: "#fff",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                      whiteSpace: "nowrap",
                      zIndex: 2,
                    }}>{s.state}</span>
                  </div>
                  {/* Death count */}
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#ff9060", fontWeight: 700, flexShrink: 0, minWidth: 52, textAlign: "right" }}>
                    {s.deaths.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* ── ROW 4: Subtypes + Notable events ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title={`${d.title} Type Distribution — India EMDAT`} color={d.color} delay={720}>
          {d.subtypes.map((ft, i) => (
            <div key={ft.type} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#8ab4d4" }}>{ft.type}</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: d.color }}>
                  {ft.count} ({ft.pct}%)
                </span>
              </div>
              <div style={{ background: "#060b12", borderRadius: 6, height: 8, overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${ft.pct}%`, height: "100%", borderRadius: 6,
                  background: `linear-gradient(90deg, ${d.color}, ${d.color}80)`,
                  boxShadow: `0 0 10px ${d.color}50`,
                  animation: `barSlide 0.8s ease ${i * 0.1 + 0.8}s both`,
                }} />
              </div>
            </div>
          ))}
          <div style={{
            padding: "10px 12px",
            background: "#060b12",
            borderRadius: 8,
            border: "1px solid #1a2840",
            fontSize: 10, fontFamily: "monospace", color: "#4a6a8a",
          }}>
            Total India {d.title} records: {d.totalEvents} (all years)
          </div>
        </ChartCard>

        <ChartCard title="Notable Events from EMDAT" color="#ff3b5c" delay={800}>
          {d.notable.map((e, i) => (
            <div key={e.year + e.event} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0",
              borderBottom: i < d.notable.length - 1 ? "1px solid #0f1d2e" : "none",
              transition: "background 0.2s",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: "monospace", fontSize: 11, color: d.color,
                    fontWeight: 700, background: `${d.color}15`,
                    padding: "1px 6px", borderRadius: 4,
                  }}>{e.year}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#c8dff0" }}>{e.event}</span>
                </div>
                <div style={{ fontSize: 10, color: "#4a6a8a", fontFamily: "monospace" }}>
                  💀 {e.deaths} · 👥 {e.affected}
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                letterSpacing: "1px",
                background: `${sevColor[e.sev]}20`,
                color: sevColor[e.sev],
                border: `1px solid ${sevColor[e.sev]}40`,
              }}>{e.sev.toUpperCase()}</span>
            </div>
          ))}
        </ChartCard>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barSlide {
          from { width: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
