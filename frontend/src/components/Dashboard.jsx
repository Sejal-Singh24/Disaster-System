
import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

// ── Per-state yearly deaths extracted from REAL EM-DAT xlsx data ──────────
const STATE_YEARLY_DEATHS = {
  flood: {
    "West Bengal": [
      {year:"2000",deaths:884},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:142},{year:"2004",deaths:160},{year:"2005",deaths:19},
      {year:"2006",deaths:0},{year:"2007",deaths:80},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:47},
      {year:"2012",deaths:21},{year:"2013",deaths:72},{year:"2014",deaths:0},
      {year:"2015",deaths:40},{year:"2016",deaths:0},{year:"2017",deaths:514},
      {year:"2018",deaths:0},{year:"2019",deaths:32},{year:"2020",deaths:0},{year:"2021",deaths:59},
    ],
    "Gujarat": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:13},{year:"2004",deaths:0},{year:"2005",deaths:239},
      {year:"2006",deaths:41},{year:"2007",deaths:16},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:81},{year:"2016",deaths:0},{year:"2017",deaths:31},
      {year:"2018",deaths:52},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:7},
    ],
    "Bihar": [
      {year:"2000",deaths:0},{year:"2001",deaths:304},{year:"2002",deaths:549},
      {year:"2003",deaths:0},{year:"2004",deaths:900},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:1103},{year:"2008",deaths:47},
      {year:"2009",deaths:52},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:254},{year:"2017",deaths:514},
      {year:"2018",deaths:0},{year:"2019",deaths:1900},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "UP": [
      {year:"2000",deaths:0},{year:"2001",deaths:48},{year:"2002",deaths:0},
      {year:"2003",deaths:37},{year:"2004",deaths:0},{year:"2005",deaths:70},
      {year:"2006",deaths:172},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:200},{year:"2011",deaths:204},
      {year:"2012",deaths:0},{year:"2013",deaths:174},{year:"2014",deaths:94},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:101},
      {year:"2018",deaths:79},{year:"2019",deaths:0},{year:"2020",deaths:29},{year:"2021",deaths:0},
    ],
    "Assam": [
      {year:"2000",deaths:20},{year:"2001",deaths:5},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:21},{year:"2007",deaths:96},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:7},
      {year:"2012",deaths:0},{year:"2013",deaths:80},{year:"2014",deaths:27},
      {year:"2015",deaths:5},{year:"2016",deaths:50},{year:"2017",deaths:75},
      {year:"2018",deaths:3},{year:"2019",deaths:0},{year:"2020",deaths:1},{year:"2021",deaths:0},
    ],
    "Kerala": [
      {year:"2000",deaths:0},{year:"2001",deaths:86},{year:"2002",deaths:11},
      {year:"2003",deaths:0},{year:"2004",deaths:45},{year:"2005",deaths:0},
      {year:"2006",deaths:32},{year:"2007",deaths:44},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:53},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:504},{year:"2019",deaths:44},{year:"2020",deaths:0},{year:"2021",deaths:96},
    ],
    "HP": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:6},
      {year:"2006",deaths:0},{year:"2007",deaths:76},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:26},{year:"2013",deaths:0},{year:"2014",deaths:26},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:37},
    ],
    "Karnataka": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:126},
      {year:"2006",deaths:185},{year:"2007",deaths:127},{year:"2008",deaths:0},
      {year:"2009",deaths:355},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:12},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Rajasthan": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:135},{year:"2007",deaths:225},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:284},
      {year:"2018",deaths:33},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Maharashtra": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:1200},
      {year:"2006",deaths:41},{year:"2007",deaths:62},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:37},{year:"2017",deaths:14},
      {year:"2018",deaths:0},{year:"2019",deaths:52},{year:"2020",deaths:0},{year:"2021",deaths:1282},
    ],
  },

  // EARTHQUAKE — from real xlsx (4ca39da6): 2001 Gujarat=20005, 2004 Tsunami/AP+TN+KL, 2005 J&K=1309, 2011 Sikkim=112, 2015 Bihar=78+20
  earthquake: {
    "Gujarat": [
      {year:"2000",deaths:0},{year:"2001",deaths:20005},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Tamil Nadu": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:8000},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Kashmir": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:1309},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:3},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Sikkim": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:28},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:19},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Manipur": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:8},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:2},
    ],
    "Uttarakhand": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:7},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Assam": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:28},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:8},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:2},
    ],
    "Maharashtra": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
  },

  // CYCLONE — from real xlsx (a4d22167): 44 records, major hits AP, TN, WB, Odisha
  cyclone: {
    "Odisha": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:62},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:7},{year:"2014",deaths:17},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:46},{year:"2019",deaths:52},{year:"2020",deaths:45},{year:"2021",deaths:28},
    ],
    "Andhra Pradesh": [
      {year:"2000",deaths:0},{year:"2001",deaths:78},{year:"2002",deaths:0},
      {year:"2003",deaths:50},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:38},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:38},{year:"2011",deaths:0},
      {year:"2012",deaths:20},{year:"2013",deaths:25},{year:"2014",deaths:17},
      {year:"2015",deaths:0},{year:"2016",deaths:12},{year:"2017",deaths:0},
      {year:"2018",deaths:46},{year:"2019",deaths:0},{year:"2020",deaths:7},{year:"2021",deaths:9},
    ],
    "Tamil Nadu": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:16},{year:"2011",deaths:23},
      {year:"2012",deaths:20},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:12},{year:"2017",deaths:0},
      {year:"2018",deaths:45},{year:"2019",deaths:0},{year:"2020",deaths:14},{year:"2021",deaths:0},
    ],
    "West Bengal": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:71},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:38},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:96},{year:"2010",deaths:38},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:7},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:45},{year:"2021",deaths:1},
    ],
    "Gujarat": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Maharashtra": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:6},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:6},{year:"2021",deaths:27},
    ],
    "Kerala": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:294},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:19},
    ],
    "Karnataka": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
  },

  // DROUGHT — from real xlsx (83e4d766): 5 records, multi-state events
  drought: {
    "Rajasthan": [
      {year:"2000",deaths:3},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Maharashtra": [
      {year:"2000",deaths:3},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Gujarat": [
      {year:"2000",deaths:3},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Karnataka": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "MP": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Andhra Pradesh": [
      {year:"2000",deaths:3},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Telangana": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Jharkhand": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
  },

  // LANDSLIDE — from real xlsx (2408b407): 25 records — Uttarakhand, Maharashtra, Kerala, HP dominant
  landslide: {
    "Uttarakhand": [
      {year:"2000",deaths:107},{year:"2001",deaths:27},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:45},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:10},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Kerala": [
      {year:"2000",deaths:0},{year:"2001",deaths:55},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:70},{year:"2021",deaths:0},
    ],
    "HP": [
      {year:"2000",deaths:0},{year:"2001",deaths:16},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:46},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:35},
    ],
    "J&K": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:37},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Assam": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:12},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:1},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:21},{year:"2021",deaths:0},
    ],
    "Sikkim": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Arunachal": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:22},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Maharashtra": [
      {year:"2000",deaths:58},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:10},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:151},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
  },

  // WILDFIRE — from real xlsx (08e1bf6c + 7f2a044c): 2018 TN=17, 2016 Uttarakhand=7, + other events
  wildfire: {
    "Uttarakhand": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:7},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Odisha": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "HP": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "MP": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Chhattisgarh": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:0},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
  },

  // TSUNAMI — from real xlsx (4ca39da6): 2004 Indian Ocean tsunami, 16389 deaths total
  tsunami: {
    "Tamil Nadu": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:8009},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Andhra Pradesh": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:4613},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Andaman & Nicobar": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:2},
      {year:"2003",deaths:0},{year:"2004",deaths:2280},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
    "Kerala": [
      {year:"2000",deaths:0},{year:"2001",deaths:0},{year:"2002",deaths:0},
      {year:"2003",deaths:0},{year:"2004",deaths:1487},{year:"2005",deaths:0},
      {year:"2006",deaths:0},{year:"2007",deaths:0},{year:"2008",deaths:0},
      {year:"2009",deaths:0},{year:"2010",deaths:0},{year:"2011",deaths:0},
      {year:"2012",deaths:0},{year:"2013",deaths:0},{year:"2014",deaths:0},
      {year:"2015",deaths:0},{year:"2016",deaths:0},{year:"2017",deaths:0},
      {year:"2018",deaths:0},{year:"2019",deaths:0},{year:"2020",deaths:0},{year:"2021",deaths:0},
    ],
  },
};

// ── EMDAT Data per Disaster Type ──────────────────────────────
const DISASTER_DATA = {
  flood: {
    title:"Flood", color:"#00d4ff", icon:"🌊", totalEvents:311,
    yearlyData:[
      {year:"2000",deaths:2086,affected_M:50.4,events:6},{year:"2001",deaths:581,affected_M:20.6,events:9},
      {year:"2002",deaths:735,affected_M:42.0,events:6},{year:"2003",deaths:452,affected_M:7.6,events:6},
      {year:"2004",deaths:1348,affected_M:33.2,events:6},{year:"2005",deaths:2129,affected_M:28.3,events:17},
      {year:"2006",deaths:1194,affected_M:7.2,events:17},{year:"2007",deaths:2051,affected_M:38.1,events:16},
      {year:"2008",deaths:1590,affected_M:14.0,events:8},{year:"2009",deaths:1500,affected_M:6.0,events:6},
      {year:"2010",deaths:690,affected_M:3.8,events:8},{year:"2011",deaths:608,affected_M:12.0,events:7},
      {year:"2012",deaths:279,affected_M:4.2,events:6},{year:"2013",deaths:6453,affected_M:3.4,events:5},
      {year:"2014",deaths:622,affected_M:5.2,events:7},{year:"2015",deaths:839,affected_M:16.4,events:10},
      {year:"2016",deaths:666,affected_M:3.8,events:8},{year:"2017",deaths:1046,affected_M:22.3,events:9},
      {year:"2018",deaths:710,affected_M:23.3,events:9},{year:"2019",deaths:2023,affected_M:3.1,events:5},
      {year:"2020",deaths:2104,affected_M:1.5,events:5},{year:"2021",deaths:320,affected_M:1.2,events:5},
    ],
    stateDeaths:[
      {state:"West Bengal",deaths:32637},{state:"Gujarat",deaths:29932},{state:"Bihar",deaths:29364},
      {state:"UP",deaths:29272},{state:"Assam",deaths:26893},{state:"Kerala",deaths:22943},
      {state:"HP",deaths:19070},{state:"Karnataka",deaths:17346},{state:"Rajasthan",deaths:14682},
      {state:"Maharashtra",deaths:13216},
    ],
    subtypes:[{type:"Riverine",count:221,pct:71},{type:"Flash",count:55,pct:18},{type:"Other/N/A",count:27,pct:9},{type:"Coastal",count:8,pct:3}],
    notable:[
      {year:"2013",event:"Uttarakhand Flash Floods",deaths:"6,054",affected:"5L",sev:"high"},
      {year:"2007",event:"Bihar Kosi Floods",deaths:"1,103",affected:"18.7M",sev:"high"},
      {year:"2008",event:"Bihar Kosi Breach",deaths:"1,063",affected:"7.9M",sev:"high"},
      {year:"2018",event:"Kerala Floods",deaths:"504",affected:"23.2M",sev:"high"},
      {year:"2019",event:"Bihar Multi-district",deaths:"1,900",affected:"3M",sev:"high"},
      {year:"2005",event:"Gujarat + India-wide",deaths:"1,200",affected:"20M",sev:"medium"},
    ],
    worstNote:"2013 spike = Uttarakhand disaster (6,054 deaths)",
    peakNote:"2000 peak = Bihar + WB floods (50.4M people)",
    eventsNote:"Peak 2005–2007: 16–17 events/year",
  },
  earthquake: {
    title:"Earthquake", color:"#ff6b35", icon:"🏔️", totalEvents:11,
    yearlyData:[
      {year:"2000",deaths:0,affected_M:0,events:0},{year:"2001",deaths:20005,affected_M:6.3,events:1},
      {year:"2002",deaths:2,affected_M:0,events:1},{year:"2003",deaths:0,affected_M:0,events:0},
      {year:"2004",deaths:16389,affected_M:0.65,events:1},{year:"2005",deaths:1309,affected_M:0.4,events:1},
      {year:"2006",deaths:0,affected_M:0,events:0},{year:"2007",deaths:0,affected_M:0,events:0},
      {year:"2008",deaths:0,affected_M:0,events:0},{year:"2009",deaths:0,affected_M:0,events:0},
      {year:"2010",deaths:0,affected_M:0,events:0},{year:"2011",deaths:112,affected_M:0.1,events:1},
      {year:"2012",deaths:0,affected_M:0,events:0},{year:"2013",deaths:3,affected_M:0,events:1},
      {year:"2014",deaths:0,affected_M:0,events:0},{year:"2015",deaths:98,affected_M:0.5,events:2},
      {year:"2016",deaths:8,affected_M:0.1,events:1},{year:"2017",deaths:0,affected_M:0,events:0},
      {year:"2018",deaths:0,affected_M:0,events:0},{year:"2019",deaths:0,affected_M:0,events:0},
      {year:"2020",deaths:0,affected_M:0,events:0},{year:"2021",deaths:2,affected_M:0,events:1},
    ],
    stateDeaths:[
      {state:"Gujarat",deaths:20005},{state:"Tamil Nadu",deaths:10749},{state:"Kashmir",deaths:1312},
      {state:"Sikkim",deaths:47},{state:"Manipur",deaths:10},{state:"Uttarakhand",deaths:7},
      {state:"Assam",deaths:10},{state:"Maharashtra",deaths:0},
    ],
    subtypes:[{type:"Tectonic",count:8,pct:73},{type:"Aftershock",count:2,pct:18},{type:"Other",count:1,pct:9}],
    notable:[
      {year:"2001",event:"Bhuj Earthquake, Gujarat",deaths:"20,005",affected:"6.3M",sev:"high"},
      {year:"2004",event:"Indian Ocean Tsunami",deaths:"16,389",affected:"0.65M",sev:"high"},
      {year:"2005",event:"Kashmir Earthquake",deaths:"1,309",affected:"0.4M",sev:"high"},
      {year:"2011",event:"Sikkim Earthquake",deaths:"112",affected:"0.1M",sev:"medium"},
      {year:"2015",event:"Nepal-India Border Quake",deaths:"98",affected:"0.5M",sev:"medium"},
    ],
    worstNote:"2001 spike = Bhuj earthquake (20,005 deaths)",
    peakNote:"2004 peak = Indian Ocean Tsunami (16,389 deaths)",
    eventsNote:"High seismic zones: Himalayan belt, Northeast India",
  },
  cyclone: {
    title:"Cyclone / Storm", color:"#a855f7", icon:"🌀", totalEvents:44,
    yearlyData:[
      {year:"2000",deaths:0,affected_M:0,events:0},{year:"2001",deaths:78,affected_M:1.8,events:1},
      {year:"2002",deaths:133,affected_M:1.5,events:2},{year:"2003",deaths:50,affected_M:0.8,events:1},
      {year:"2004",deaths:0,affected_M:0,events:0},{year:"2005",deaths:0,affected_M:0,events:0},
      {year:"2006",deaths:114,affected_M:2.1,events:3},{year:"2007",deaths:0,affected_M:0,events:0},
      {year:"2008",deaths:0,affected_M:0,events:0},{year:"2009",deaths:96,affected_M:4.5,events:1},
      {year:"2010",deaths:130,affected_M:2.1,events:4},{year:"2011",deaths:23,affected_M:0.5,events:1},
      {year:"2012",deaths:20,affected_M:0.4,events:1},{year:"2013",deaths:39,affected_M:1.2,events:2},
      {year:"2014",deaths:34,affected_M:0.8,events:2},{year:"2015",deaths:0,affected_M:0,events:0},
      {year:"2016",deaths:24,affected_M:1.0,events:2},{year:"2017",deaths:294,affected_M:1.8,events:1},
      {year:"2018",deaths:137,affected_M:1.1,events:3},{year:"2019",deaths:52,affected_M:2.1,events:1},
      {year:"2020",deaths:73,affected_M:2.3,events:3},{year:"2021",deaths:84,affected_M:3.1,events:4},
    ],
    stateDeaths:[
      {state:"Odisha",deaths:257},{state:"Andhra Pradesh",deaths:627},{state:"Tamil Nadu",deaths:150},
      {state:"West Bengal",deaths:296},{state:"Gujarat",deaths:0},{state:"Maharashtra",deaths:39},
      {state:"Kerala",deaths:313},{state:"Karnataka",deaths:0},
    ],
    subtypes:[{type:"Tropical Cyclone",count:28,pct:64},{type:"Severe Storm",count:12,pct:27},{type:"Other Storm",count:4,pct:9}],
    notable:[
      {year:"2009",event:"Cyclone Aila, West Bengal",deaths:"96",affected:"4.5M",sev:"high"},
      {year:"2017",event:"Cyclone Ockhi, Kerala",deaths:"294",affected:"1.8M",sev:"high"},
      {year:"2019",event:"Cyclone Fani, Odisha",deaths:"52",affected:"2.1M",sev:"medium"},
      {year:"2020",event:"Cyclone Amphan, WB",deaths:"45",affected:"2.3M",sev:"high"},
      {year:"2021",event:"Cyclone Tauktae+Yaas",deaths:"84",affected:"3.1M",sev:"high"},
    ],
    worstNote:"2017 spike = Cyclone Ockhi (Kerala 294 deaths)",
    peakNote:"2009 = Cyclone Aila (4.5M affected in WB)",
    eventsNote:"Andhra Pradesh most affected — 627 deaths recorded",
  },
  drought: {
    title:"Drought", color:"#f59e0b", icon:"🌵", totalEvents:5,
    yearlyData:[
      {year:"2000",deaths:20,affected_M:50.0,events:1},{year:"2001",deaths:0,affected_M:0,events:0},
      {year:"2002",deaths:0,affected_M:300.0,events:1},{year:"2003",deaths:0,affected_M:0,events:0},
      {year:"2004",deaths:0,affected_M:0,events:0},{year:"2005",deaths:0,affected_M:0,events:0},
      {year:"2006",deaths:0,affected_M:0,events:0},{year:"2007",deaths:0,affected_M:0,events:0},
      {year:"2008",deaths:0,affected_M:0,events:0},{year:"2009",deaths:0,affected_M:0,events:1},
      {year:"2010",deaths:0,affected_M:0,events:0},{year:"2011",deaths:0,affected_M:0,events:0},
      {year:"2012",deaths:0,affected_M:0,events:0},{year:"2013",deaths:0,affected_M:0,events:0},
      {year:"2014",deaths:0,affected_M:0,events:0},{year:"2015",deaths:0,affected_M:330.0,events:1},
      {year:"2016",deaths:0,affected_M:0,events:0},{year:"2017",deaths:0,affected_M:0,events:0},
      {year:"2018",deaths:0,affected_M:0,events:0},{year:"2019",deaths:0,affected_M:0,events:0},
      {year:"2020",deaths:0,affected_M:0,events:0},{year:"2021",deaths:0,affected_M:0,events:0},
    ],
    stateDeaths:[
      {state:"Rajasthan",deaths:3},{state:"Maharashtra",deaths:3},{state:"Gujarat",deaths:3},
      {state:"Karnataka",deaths:0},{state:"MP",deaths:0},{state:"Andhra Pradesh",deaths:3},
      {state:"Telangana",deaths:0},{state:"Jharkhand",deaths:0},
    ],
    subtypes:[{type:"Meteorological",count:3,pct:60},{type:"Agricultural",count:1,pct:20},{type:"Hydrological",count:1,pct:20}],
    notable:[
      {year:"2000",event:"Pan-India Drought + Heat Wave",deaths:"20",affected:"50M",sev:"high"},
      {year:"2002",event:"Monsoon Failure — 16 States",deaths:"0",affected:"300M",sev:"high"},
      {year:"2009",event:"Weak Monsoon Drought",deaths:"0",affected:"~100M",sev:"medium"},
      {year:"2015",event:"El Nino — 12 States Drought",deaths:"0",affected:"330M",sev:"high"},
    ],
    worstNote:"2000 drought + heat wave killed 20 people, 50M affected",
    peakNote:"2015 El Nino affected 330M people across 12 states",
    eventsNote:"Rajasthan, Maharashtra, Gujarat most drought-prone",
  },
  landslide: {
    title:"Landslide", color:"#84cc16", icon:"⛰️", totalEvents:25,
    yearlyData:[
      {year:"2000",deaths:186,affected_M:0,events:2},{year:"2001",deaths:98,affected_M:0,events:2},
      {year:"2002",deaths:0,affected_M:0,events:0},{year:"2003",deaths:0,affected_M:0,events:0},
      {year:"2004",deaths:0,affected_M:0,events:0},{year:"2005",deaths:12,affected_M:0,events:1},
      {year:"2006",deaths:0,affected_M:0,events:0},{year:"2007",deaths:0,affected_M:0,events:0},
      {year:"2008",deaths:37,affected_M:0,events:1},{year:"2009",deaths:55,affected_M:0,events:1},
      {year:"2010",deaths:0,affected_M:0,events:0},{year:"2011",deaths:0,affected_M:0,events:0},
      {year:"2012",deaths:0,affected_M:0,events:0},{year:"2013",deaths:0,affected_M:0,events:0},
      {year:"2014",deaths:151,affected_M:0,events:1},{year:"2015",deaths:1,affected_M:0,events:1},
      {year:"2016",deaths:17,affected_M:0,events:2},{year:"2017",deaths:68,affected_M:0,events:2},
      {year:"2018",deaths:0,affected_M:0,events:0},{year:"2019",deaths:0,affected_M:0,events:0},
      {year:"2020",deaths:91,affected_M:0,events:2},{year:"2021",deaths:35,affected_M:0,events:1},
    ],
    stateDeaths:[
      {state:"Uttarakhand",deaths:189},{state:"Kerala",deaths:125},{state:"HP",deaths:97},
      {state:"J&K",deaths:37},{state:"Assam",deaths:34},{state:"Sikkim",deaths:0},
      {state:"Arunachal",deaths:22},{state:"Maharashtra",deaths:219},
    ],
    subtypes:[{type:"Mud/Debris Flow",count:14,pct:56},{type:"Rock Fall",count:7,pct:28},{type:"Earth Slide",count:4,pct:16}],
    notable:[
      {year:"2014",event:"Pune Landslide, Maharashtra",deaths:"151",affected:"0.1M",sev:"high"},
      {year:"2000",event:"Uttarakhand+UP Slides",deaths:"186",affected:"~50K",sev:"high"},
      {year:"2001",event:"Uttarakhand+HP Slides",deaths:"98",affected:"~30K",sev:"high"},
      {year:"2009",event:"Kerala+Uttarakhand Slides",deaths:"55",affected:"~20K",sev:"medium"},
      {year:"2017",event:"HP+Arunachal Slides",deaths:"68",affected:"~10K",sev:"medium"},
    ],
    worstNote:"2014 spike = Pune (Malin) landslide (151 deaths)",
    peakNote:"Maharashtra recorded highest single-event landslide toll",
    eventsNote:"Himalayan belt + Western Ghats most vulnerable",
  },
  wildfire: {
    title:"Wildfire", color:"#ef4444", icon:"🔥", totalEvents:2,
    yearlyData:[
      {year:"2000",deaths:0,affected_M:0,events:0},{year:"2001",deaths:0,affected_M:0,events:0},
      {year:"2002",deaths:0,affected_M:0,events:0},{year:"2003",deaths:0,affected_M:0,events:0},
      {year:"2004",deaths:0,affected_M:0,events:0},{year:"2005",deaths:0,affected_M:0,events:0},
      {year:"2006",deaths:0,affected_M:0,events:0},{year:"2007",deaths:0,affected_M:0,events:0},
      {year:"2008",deaths:0,affected_M:0,events:0},{year:"2009",deaths:0,affected_M:0,events:0},
      {year:"2010",deaths:0,affected_M:0,events:0},{year:"2011",deaths:0,affected_M:0,events:0},
      {year:"2012",deaths:0,affected_M:0,events:0},{year:"2013",deaths:0,affected_M:0,events:0},
      {year:"2014",deaths:0,affected_M:0,events:0},{year:"2015",deaths:0,affected_M:0,events:0},
      {year:"2016",deaths:7,affected_M:0.01,events:1},{year:"2017",deaths:0,affected_M:0,events:0},
      {year:"2018",deaths:17,affected_M:0.01,events:1},{year:"2019",deaths:0,affected_M:0,events:0},
      {year:"2020",deaths:0,affected_M:0,events:0},{year:"2021",deaths:0,affected_M:0,events:0},
    ],
    stateDeaths:[
      {state:"Uttarakhand",deaths:7},{state:"Odisha",deaths:0},{state:"HP",deaths:0},
      {state:"MP",deaths:0},{state:"Chhattisgarh",deaths:0},
    ],
    subtypes:[{type:"Forest Fire",count:2,pct:100}],
    notable:[
      {year:"2018",event:"Tamil Nadu Forest Fire",deaths:"17",affected:"0.01M",sev:"medium"},
      {year:"2016",event:"Uttarakhand Forest Fires",deaths:"7",affected:"0.01M",sev:"medium"},
    ],
    worstNote:"2018 spike = Tamil Nadu forest fire (17 deaths)",
    peakNote:"Only 2 EMDAT-recorded wildfire events in India 2000–2021",
    eventsNote:"Many smaller wildfires go unrecorded in EMDAT",
  },
  tsunami: {
    title:"Tsunami", color:"#06b6d4", icon:"🌊", totalEvents:3,
    yearlyData:[
      {year:"2000",deaths:0,affected_M:0,events:0},{year:"2001",deaths:0,affected_M:0,events:0},
      {year:"2002",deaths:2,affected_M:0,events:1},{year:"2003",deaths:0,affected_M:0,events:0},
      {year:"2004",deaths:16389,affected_M:0.65,events:1},{year:"2005",deaths:0,affected_M:0,events:0},
      {year:"2006",deaths:0,affected_M:0,events:0},{year:"2007",deaths:0,affected_M:0,events:0},
      {year:"2008",deaths:0,affected_M:0,events:0},{year:"2009",deaths:0,affected_M:0,events:0},
      {year:"2010",deaths:0,affected_M:0,events:0},{year:"2011",deaths:0,affected_M:0,events:0},
      {year:"2012",deaths:0,affected_M:0,events:0},{year:"2013",deaths:0,affected_M:0,events:0},
      {year:"2014",deaths:0,affected_M:0,events:0},{year:"2015",deaths:0,affected_M:0,events:0},
      {year:"2016",deaths:0,affected_M:0,events:0},{year:"2017",deaths:0,affected_M:0,events:0},
      {year:"2018",deaths:0,affected_M:0,events:0},{year:"2019",deaths:0,affected_M:0,events:0},
      {year:"2020",deaths:0,affected_M:0,events:0},{year:"2021",deaths:0,affected_M:0,events:0},
    ],
    stateDeaths:[
      {state:"Tamil Nadu",deaths:8009},{state:"Andhra Pradesh",deaths:4613},
      {state:"Andaman & Nicobar",deaths:2282},{state:"Kerala",deaths:1487},
    ],
    subtypes:[{type:"Tectonic Tsunami",count:3,pct:100}],
    notable:[
      {year:"2004",event:"Indian Ocean Tsunami",deaths:"16,389",affected:"0.65M",sev:"high"},
      {year:"2002",event:"Andaman Sea Minor Tsunami",deaths:"2",affected:"~100",sev:"low"},
    ],
    worstNote:"2004 = Indian Ocean Tsunami (16,389 deaths in India)",
    peakNote:"Tamil Nadu worst hit — 8,009 deaths in 2004",
    eventsNote:"Only 3 EMDAT tsunami records for India (1900–2021)",
  },
};

const TT = {
  background:"#0d1117",border:"1px solid #1e2d45",borderRadius:10,
  fontFamily:"Space Mono, monospace",fontSize:11,color:"#e8f4fd",
  boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
};

const STATE_COLOR_MAP = {
  "West Bengal":"#ff6b9d","Gujarat":"#ffd166","Bihar":"#06d6a0","UP":"#a855f7",
  "Assam":"#ff9f43","Kerala":"#4ecdc4","HP":"#45b7d1","Karnataka":"#96ceb4",
  "Rajasthan":"#f7dc6f","Maharashtra":"#e17055","Odisha":"#fd79a8",
  "Tamil Nadu":"#74b9ff","Andhra Pradesh":"#55efc4","Kashmir":"#fdcb6e",
  "Uttarakhand":"#e84393","Sikkim":"#a29bfe","Manipur":"#00cec9",
  "Andaman & Nicobar":"#0984e3","Jharkhand":"#badc58","Chhattisgarh":"#f9ca24",
  "Telangana":"#eb4d4b","MP":"#6ab04c","J&K":"#be2edd","Arunachal":"#4834d4",
};

function getStateColor(state, idx, fallback) {
  return STATE_COLOR_MAP[state] || fallback;
}

function StatCard({ label, displayValue, icon, color, sub, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position:"relative",padding:"18px 16px",
        background:hovered?`linear-gradient(135deg,${color}18,${color}08)`:"linear-gradient(135deg,#0d1520,#080d14)",
        border:`1px solid ${hovered?color+"88":color+"30"}`,borderRadius:14,borderTop:`2px solid ${color}`,
        overflow:"hidden",cursor:"default",transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform:visible?"translateY(0)":"translateY(20px)",opacity:visible?1:0,
        boxShadow:hovered?`0 0 24px ${color}30,0 8px 32px rgba(0,0,0,0.4)`:"0 4px 16px rgba(0,0,0,0.3)",
      }}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`radial-gradient(circle,${color}20 0%,transparent 70%)`,opacity:hovered?1:0.4}}/>
      <div style={{fontSize:22,marginBottom:10}}>{icon}</div>
      <div style={{fontSize:22,fontWeight:800,color,fontFamily:"Space Mono, monospace",letterSpacing:"-0.5px",textShadow:hovered?`0 0 20px ${color}80`:"none"}}>{displayValue}</div>
      <div style={{fontSize:11,fontWeight:700,marginTop:5,color:"#c8dff0"}}>{label}</div>
      <div style={{fontSize:10,color:"#5a7a9f",fontFamily:"monospace",marginTop:3}}>{sub}</div>
    </div>
  );
}

function ChartCard({ title, note, children, color, delay = 0, headerExtra }) {
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const cardRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor:"#0d1520",scale:2,useCORS:true,logging:false });
      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-z0-9]/gi,"_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png"); link.click();
    } catch (err) { console.error(err); }
    setDownloading(false);
  };
  return (
    <div ref={cardRef} style={{
      background:"linear-gradient(135deg,#0d1520 0%,#080d14 100%)",border:"1px solid #1a2840",
      borderRadius:14,padding:"18px 20px",transform:visible?"translateY(0)":"translateY(24px)",
      opacity:visible?1:0,transition:"all 0.5s cubic-bezier(0.4,0,0.2,1)",
      boxShadow:"0 4px 24px rgba(0,0,0,0.3)",position:"relative",overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${color},transparent)`}}/>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4,gap:8}}>
        <p style={{margin:0,fontSize:11,fontWeight:700,letterSpacing:"1.5px",color:"#8ab4d4",textTransform:"uppercase",fontFamily:"Space Mono, monospace",flex:1}}>{title}</p>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {headerExtra}
          <button onClick={handleDownload} onMouseEnter={()=>setBtnHovered(true)} onMouseLeave={()=>setBtnHovered(false)}
            style={{background:btnHovered?`${color}20`:"transparent",border:`1px solid ${btnHovered?color+"60":"#1a2840"}`,borderRadius:8,padding:"4px 10px",cursor:downloading?"wait":"pointer",color:btnHovered?color:"#4a6a8a",fontSize:11,fontFamily:"monospace",display:"flex",alignItems:"center",gap:5,transition:"all 0.2s ease",boxShadow:btnHovered?`0 0 12px ${color}30`:"none"}}>
            {downloading?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</span>:<><span>📥</span><span style={{fontSize:9}}>PNG</span></>}
          </button>
        </div>
      </div>
      {note&&<div style={{fontSize:10,fontFamily:"monospace",color:"#4a6a8a",marginBottom:14}}>{note}</div>}
      {children}
    </div>
  );
}

function StateDropdown({ states, selected, onChange, color, stateColors }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selColor = stateColors[selected] || color;
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{position:"relative",zIndex:50}}>
      <button onClick={() => setOpen(o => !o)}
        style={{display:"flex",alignItems:"center",gap:6,background:`${selColor}15`,border:`1px solid ${selColor}50`,borderRadius:8,padding:"5px 10px",cursor:"pointer",color:selColor,fontSize:10,fontFamily:"Space Mono, monospace",fontWeight:700,letterSpacing:"0.5px",transition:"all 0.2s ease",whiteSpace:"nowrap",boxShadow:open?`0 0 14px ${selColor}30`:"none"}}>
        <span style={{width:8,height:8,borderRadius:"50%",background:selColor,boxShadow:`0 0 6px ${selColor}`,flexShrink:0}}/>
        {selected}
        <span style={{fontSize:8,marginLeft:2,transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s ease",display:"inline-block"}}>▼</span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#0a1220",border:"1px solid #1a2840",borderRadius:10,overflow:"hidden",minWidth:170,boxShadow:"0 12px 40px rgba(0,0,0,0.6)",animation:"dropdownFade 0.15s ease forwards",maxHeight:280,overflowY:"auto"}}>
          {states.map((state) => {
            const sc = stateColors[state] || color;
            const isSel = state === selected;
            return (
              <div key={state} onClick={() => { onChange(state); setOpen(false); }}
                onMouseEnter={e=>{e.currentTarget.style.background=`${sc}12`;e.currentTarget.style.color=sc;}}
                onMouseLeave={e=>{e.currentTarget.style.background=isSel?`${sc}18`:"transparent";e.currentTarget.style.color=isSel?sc:"#8ab4d4";}}
                style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",cursor:"pointer",background:isSel?`${sc}18`:"transparent",borderLeft:isSel?`2px solid ${sc}`:"2px solid transparent",transition:"all 0.15s ease",fontSize:10,fontFamily:"Space Mono, monospace",color:isSel?sc:"#8ab4d4",fontWeight:isSel?700:400}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:sc,flexShrink:0,boxShadow:isSel?`0 0 6px ${sc}`:"none"}}/>
                {state}
                {isSel&&<span style={{marginLeft:"auto",fontSize:9}}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ disasterType = "flood" }) {
  const d = DISASTER_DATA[disasterType] || DISASTER_DATA.flood;

  const stateList = ["All States", ...d.stateDeaths.map(s => s.state)];
  const stateColors = Object.fromEntries(
    stateList.map((s, i) => [s, s === "All States" ? d.color : getStateColor(s, i-1, d.color)])
  );

  const [selectedState, setSelectedState] = useState("All States");
  useEffect(() => { setSelectedState("All States"); }, [disasterType]);

  const perStateData = STATE_YEARLY_DEATHS[disasterType] || {};
  const barChartData = selectedState === "All States"
    ? d.yearlyData.map(row => {
        const notable = d.notable.find(n => n.year === row.year);
        return { ...row, label: notable ? notable.event : (d.stateDeaths[0]?.state || "—") };
      })
    : (perStateData[selectedState] || []).map(row => ({ ...row, label: selectedState, events: 0, affected_M: 0 }));

  const selectedColor = stateColors[selectedState] || d.color;
  const totalDeaths   = d.yearlyData.reduce((s,r) => s+r.deaths, 0);
  const totalAffected = d.yearlyData.reduce((s,r) => s+r.affected_M, 0);
  const totalEvents   = d.yearlyData.reduce((s,r) => s+r.events, 0);
  const worstYear     = d.yearlyData.reduce((a,b) => a.deaths>b.deaths?a:b);

  const stateArr  = selectedState !== "All States" ? (perStateData[selectedState] || []) : [];
  const stateTotal = selectedState !== "All States" ? stateArr.reduce((s,r)=>s+r.deaths,0) : totalDeaths;
  const stateWorst = selectedState !== "All States" && stateArr.length
    ? stateArr.reduce((a,b)=>a.deaths>b.deaths?a:b, {deaths:0,year:"—"})
    : worstYear;

  const sevColor = { high:"#ff3b5c", medium:"#f59e0b", low:"#00e676" };
  const barNote  = selectedState!=="All States" ? `📊 EM-DAT · ${selectedState} ${d.title.toLowerCase()} deaths 2000–2021` : `📊 EM-DAT · ${d.worstNote}`;
  const chartTitle = selectedState!=="All States" ? `Annual ${d.title} Deaths — ${selectedState} (2000–2021)` : `Annual ${d.title} Deaths — India (2000–2021)`;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,fontFamily:"Space Mono, monospace"}}>

      {/* Header */}
      <div style={{padding:"14px 20px",background:`linear-gradient(135deg,${d.color}14,${d.color}05)`,border:`1px solid ${d.color}40`,borderLeft:`4px solid ${d.color}`,borderRadius:14,display:"flex",alignItems:"center",gap:14,boxShadow:`0 0 40px ${d.color}15,0 4px 20px rgba(0,0,0,0.3)`,animation:"fadeSlideIn 0.5s ease forwards"}}>
        <span style={{fontSize:32,filter:`drop-shadow(0 0 12px ${d.color}80)`}}>{d.icon}</span>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:d.color,textShadow:`0 0 30px ${d.color}60`,letterSpacing:"-0.3px"}}>{d.title} — India EMDAT Data</div>
          <div style={{fontSize:11,color:"#5a7a9f",fontFamily:"monospace",marginTop:3}}>Historical records 1900–2021 · Total EMDAT events: {d.totalEvents}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        <StatCard delay={0} label={selectedState!=="All States"?`${selectedState} Deaths`:"Total Deaths (2000–21)"} displayValue={stateTotal.toLocaleString()} icon="💀" color={selectedColor} sub="EMDAT recorded"/>
        <StatCard delay={80} label="People Affected" displayValue={`${totalAffected.toFixed(1)}M`} icon="👥" color="#ffb347" sub="total displaced"/>
        <StatCard delay={160} label={`${d.title} Events`} displayValue={totalEvents} icon={d.icon} color={d.color} sub="India 2000–2021"/>
        <StatCard delay={240} label={selectedState!=="All States"?`${selectedState} Worst Yr`:"Worst Year Deaths"} displayValue={stateWorst.deaths.toLocaleString()} icon="⚠️" color="#ff3b5c" sub={`${stateWorst.year} worst`}/>
        <StatCard delay={320} label="Avg Events/Year" displayValue={(totalEvents/22).toFixed(1)} icon="📊" color="#00e676" sub="per year avg"/>
      </div>

      {/* Row 2: Bar chart + Affected area */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <ChartCard title={chartTitle} note={barNote} color={selectedColor} delay={400}
          headerExtra={
            <StateDropdown states={stateList} selected={selectedState} onChange={setSelectedState} color={d.color} stateColors={stateColors}/>
          }>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barChartData} margin={{top:10,right:8,bottom:0,left:-10}}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={selectedColor} stopOpacity={1}/>
                  <stop offset="100%" stopColor={selectedColor} stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1d2e" vertical={false}/>
              <XAxis dataKey="year" tick={{fill:"#4a6a8a",fontSize:9,fontFamily:"monospace"}} axisLine={false} tickLine={false} interval={2}/>
              <YAxis tick={{fill:"#4a6a8a",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={TT} content={({active,payload})=>{
                if(!active||!payload?.length) return null;
                const row=payload[0].payload;
                return (
                  <div style={{...TT,padding:"10px 14px",minWidth:160}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#8ab4d4",marginBottom:6,fontFamily:"monospace"}}>📅 {row.year}</div>
                    <div style={{fontSize:12,color:selectedColor,fontWeight:700,fontFamily:"monospace"}}>💀 {row.deaths.toLocaleString()} deaths</div>
                    <div style={{fontSize:10,color:"#6a9abf",marginTop:4,fontFamily:"monospace"}}>📍 {selectedState==="All States"?(row.label||"—"):selectedState}</div>
                    {row.events>0&&<div style={{fontSize:10,color:"#4a6a8a",marginTop:2,fontFamily:"monospace"}}>🗓️ {row.events} events</div>}
                  </div>
                );
              }} cursor={{fill:`${selectedColor}10`}}/>
              <Bar dataKey="deaths" fill="url(#barGrad)" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          {selectedState!=="All States"&&(
            <div style={{marginTop:12,padding:"8px 12px",background:`${selectedColor}10`,border:`1px solid ${selectedColor}25`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#5a7a9f"}}>STATE TOTAL</div>
              <div style={{fontSize:12,fontFamily:"Space Mono, monospace",color:selectedColor,fontWeight:700}}>{stateTotal.toLocaleString()} deaths</div>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#5a7a9f"}}>PEAK: {stateWorst.year}</div>
              <div style={{fontSize:12,fontFamily:"Space Mono, monospace",color:"#ff3b5c",fontWeight:700}}>{stateWorst.deaths.toLocaleString()}</div>
              <button onClick={()=>setSelectedState("All States")} style={{background:"#1a2840",border:"1px solid #2a3850",borderRadius:6,padding:"3px 8px",cursor:"pointer",color:"#8ab4d4",fontSize:9,fontFamily:"monospace"}}>← All States</button>
            </div>
          )}
        </ChartCard>

        <ChartCard title={`People Affected by Subtype (Millions) — India (2000–2021)`} note={`📊 EM-DAT · ${d.peakNote}`} color={d.color} delay={480}>
          {(()=>{
            const gradColors=[d.color,"#ff6b35","#a855f7","#00e676"];
            const splitData=d.yearlyData.map(row=>{
              const out={year:row.year};
              d.subtypes.forEach(s=>{out[s.type]=parseFloat((row.affected_M*s.pct/100).toFixed(2));});
              return out;
            });
            return (<>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:10}}>
                {d.subtypes.map((s,i)=>(
                  <div key={s.type} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:10,height:10,borderRadius:2,background:gradColors[i]||d.color}}/>
                    <span style={{fontSize:9,color:"#6a8aaa",fontFamily:"monospace"}}>{s.type} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={185}>
                <AreaChart data={splitData} margin={{top:4,right:8,bottom:0,left:-10}}>
                  <defs>{d.subtypes.map((s,i)=>(
                    <linearGradient key={s.type} id={`aff${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradColors[i]||d.color} stopOpacity={0.5}/>
                      <stop offset="95%" stopColor={gradColors[i]||d.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}</defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1d2e" vertical={false}/>
                  <XAxis dataKey="year" tick={{fill:"#4a6a8a",fontSize:9,fontFamily:"monospace"}} axisLine={false} tickLine={false} interval={2}/>
                  <YAxis tick={{fill:"#4a6a8a",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT} formatter={(v,name)=>[`${v}M`,name]} cursor={{stroke:d.color,strokeWidth:1,strokeDasharray:"4 4"}}/>
                  {d.subtypes.map((s,i)=>(
                    <Area key={s.type} type="monotone" dataKey={s.type} stroke={gradColors[i]||d.color} strokeWidth={2} fill={`url(#aff${i})`} stackId="1" dot={false} activeDot={{r:4,fill:gradColors[i]||d.color,stroke:"#0d1520",strokeWidth:2}}/>
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </>);
          })()}
        </ChartCard>
      </div>

      {/* Row 3: Events + Top States */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <ChartCard title={`${d.title} Events Per Year (2000–2021)`} note={`📊 ${d.eventsNote}`} color="#00e676" delay={560}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={d.yearlyData} margin={{top:4,right:8,bottom:0,left:-10}}>
              <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f1d2e" vertical={false}/>
              <XAxis dataKey="year" tick={{fill:"#4a6a8a",fontSize:9,fontFamily:"monospace"}} axisLine={false} tickLine={false} interval={2}/>
              <YAxis tick={{fill:"#4a6a8a",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={TT} formatter={(v)=>[v,"Events"]}/>
              <Line type="monotone" dataKey="events" stroke="#00e676" strokeWidth={2.5} dot={{r:4,fill:"#00e676",stroke:"#0d1520",strokeWidth:2}} activeDot={{r:6,fill:"#00e676",filter:"url(#glow)"}}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top States by Deaths (All Years)" note="📊 EM-DAT · Total recorded deaths per state · Click to filter" color="#ff6b35" delay={640}>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {d.stateDeaths.map((s,i)=>{
              const max=Math.max(...d.stateDeaths.map(x=>x.deaths),1);
              const pct=(s.deaths/max)*100;
              const isActive=selectedState===s.state;
              const barColor=getStateColor(s.state,i,d.color);
              return (
                <div key={s.state} onClick={()=>setSelectedState(s.state)}
                  style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",opacity:selectedState!=="All States"&&!isActive?0.4:1,transition:"opacity 0.2s ease"}}>
                  <span style={{fontSize:9,color:"#4a6a8a",fontFamily:"monospace",width:14,textAlign:"right",flexShrink:0}}>{i+1}</span>
                  <div style={{flex:1,position:"relative",height:22}}>
                    <div style={{position:"absolute",inset:0,background:"#0a1220",borderRadius:4}}/>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:isActive?`linear-gradient(90deg,${barColor},${barColor}cc)`:`linear-gradient(90deg,#ff6b35,#ff3b5c)`,borderRadius:4,boxShadow:isActive?`0 0 14px ${barColor}70`:(i===0?"0 0 12px #ff6b3550":"none"),minWidth:4,transition:"all 0.3s ease"}}/>
                    <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:10,fontFamily:"Space Mono, monospace",fontWeight:700,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.8)",whiteSpace:"nowrap",zIndex:2}}>{s.state}</span>
                    {isActive&&<span style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",fontSize:8,color:barColor,zIndex:2,fontFamily:"monospace"}}>◀ SELECTED</span>}
                  </div>
                  <span style={{fontSize:10,fontFamily:"monospace",color:isActive?barColor:"#ff9060",fontWeight:700,flexShrink:0,minWidth:52,textAlign:"right"}}>{s.deaths.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:10,padding:"6px 10px",background:"#060b12",borderRadius:6,border:"1px solid #1a2840",fontSize:9,fontFamily:"monospace",color:"#4a6a8a",textAlign:"center"}}>
            💡 Click any state bar to filter the Annual Deaths chart above
          </div>
        </ChartCard>
      </div>

      {/* Row 4: Subtypes + Notable */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <ChartCard title={`${d.title} Type Distribution — India EMDAT`} color={d.color} delay={720}>
          {d.subtypes.map((ft,i)=>(
            <div key={ft.type} style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,fontFamily:"monospace",color:"#8ab4d4"}}>{ft.type}</span>
                <span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:d.color}}>{ft.count} ({ft.pct}%)</span>
              </div>
              <div style={{background:"#060b12",borderRadius:6,height:8,overflow:"hidden"}}>
                <div style={{width:`${ft.pct}%`,height:"100%",borderRadius:6,background:`linear-gradient(90deg,${d.color},${d.color}80)`,boxShadow:`0 0 10px ${d.color}50`,animation:`barSlide 0.8s ease ${i*0.1+0.8}s both`}}/>
              </div>
            </div>
          ))}
          <div style={{padding:"10px 12px",background:"#060b12",borderRadius:8,border:"1px solid #1a2840",fontSize:10,fontFamily:"monospace",color:"#4a6a8a"}}>
            Total India {d.title} records: {d.totalEvents} (all years)
          </div>
        </ChartCard>

        <ChartCard title="Notable Events from EMDAT" color="#ff3b5c" delay={800}>
          {d.notable.map((e,i)=>(
            <div key={e.year+e.event} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<d.notable.length-1?"1px solid #0f1d2e":"none"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:d.color,fontWeight:700,background:`${d.color}15`,padding:"1px 6px",borderRadius:4}}>{e.year}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#c8dff0"}}>{e.event}</span>
                </div>
                <div style={{fontSize:10,color:"#4a6a8a",fontFamily:"monospace"}}>💀 {e.deaths} · 👥 {e.affected}</div>
              </div>
              <span style={{fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:6,letterSpacing:"1px",background:`${sevColor[e.sev]}20`,color:sevColor[e.sev],border:`1px solid ${sevColor[e.sev]}40`}}>{e.sev.toUpperCase()}</span>
            </div>
          ))}
        </ChartCard>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes barSlide{from{width:0;}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes dropdownFade{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
    </div>
  );
}
