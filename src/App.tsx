import { useState, useEffect, type ReactNode } from "react";
import RealTimeMap from "./components/RealTimeMap";
import NetworkMap from "./components/NetworkMap";

type IconName =
  | "activity"
  | "bell"
  | "chevron"
  | "clock"
  | "cloud"
  | "crosshair"
  | "info"
  | "location"
  | "menu"
  | "route"
  | "search"
  | "shield"
  | "sparkles"
  | "train"
  | "user";

const iconPaths: Record<IconName, ReactNode> = {
  activity: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  cloud: <path d="M17.5 19H7a5 5 0 1 1 1.1-9.9A6 6 0 0 1 19.8 11 4 4 0 0 1 17.5 19Z" />,
  crosshair: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v5c0 5 3.3 8.5 8 10 4.7-1.5 8-5 8-10V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sparkles: <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15ZM19 14l.6 1.4L21 16l-1.4.6L19 18l-.6-1.4L17 16l1.4-.6L19 14Z" />,
  train: (
    <>
      <rect x="5" y="3" width="14" height="15" rx="3" />
      <path d="M8 7h8M8 12h.01M16 12h.01M8 18l-2 3M16 18l2 3M8 21h8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "soft";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button className={`button button-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

const defaultStops = [
  { city: "New Delhi", code: "NDLS", time: "06:15", state: "passed" },
  { city: "Mathura Jn", code: "MTJ", time: "07:42", state: "passed" },
  { city: "Agra Cantt", code: "AGC", time: "08:37", state: "current" },
  { city: "Gwalior Jn", code: "GWL", time: "10:06", state: "next" },
  { city: "Jhansi Jn", code: "VGLJ", time: "11:31", state: "future" },
];

const defaultApproaching = [
  {
    number: "12002",
    name: "Bhopal Shatabdi",
    from: "Mathura Jn",
    scheduled: "08:29",
    predicted: "08:37",
    platform: "2",
    delay: "+8 min",
    confidence: "92%",
    state: "warning",
  },
  {
    number: "12626",
    name: "Kerala Express",
    from: "New Delhi",
    scheduled: "08:48",
    predicted: "08:51",
    platform: "1",
    delay: "+3 min",
    confidence: "96%",
    state: "healthy",
  },
  {
    number: "12190",
    name: "Mahakaushal Express",
    from: "Hazrat Nizamuddin",
    scheduled: "09:05",
    predicted: "09:24",
    platform: "4",
    delay: "+19 min",
    confidence: "86%",
    state: "critical",
  },
  {
    number: "22221",
    name: "Rajdhani Express",
    from: "Mumbai Central",
    scheduled: "09:32",
    predicted: "09:31",
    platform: "3",
    delay: "On time",
    confidence: "94%",
    state: "healthy",
  },
  {
    number: "11808",
    name: "Intercity Express",
    from: "Agra Fort",
    scheduled: "09:46",
    predicted: "09:52",
    platform: "5",
    delay: "+6 min",
    confidence: "90%",
    state: "warning",
  },
];

function OperationsHeader({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <section className="operations-header">
      <div>
        <span className="operations-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {children}
    </section>
  );
}

function StationDashboard() {
  const [station, setStation] = useState("Agra Cantt · AGC");
  const [alertFilter, setAlertFilter] = useState("All arrivals");
  const [approaching, setApproaching] = useState(defaultApproaching);

  useEffect(() => {
    const stationCode = station.includes("NDLS") ? "NDLS" : (station.includes("GWL") ? "GWL" : "AGC");
    fetch(`http://127.0.0.1:8000/api/station/${stationCode}/trains`)
      .then((res) => res.json())
      .then((data) => {
        if (data.approaching_trains) {
          setApproaching(data.approaching_trains);
        }
      })
      .catch(() => {
        // Local fallback
      });
  }, [station]);

  return (
    <section className="operations-page">
      <OperationsHeader
        eyebrow="Station operations"
        title="Approaching trains"
        copy="Live arrival forecasts, platform readiness, and actionable delay alerts."
      >
        <div className="operations-controls">
          <label htmlFor="station-select">Monitoring station</label>
          <div className="select-shell">
            <Icon name="location" size={18} />
            <select id="station-select" value={station} onChange={(event) => setStation(event.target.value)}>
              <option>Agra Cantt · AGC</option>
              <option>New Delhi · NDLS</option>
              <option>Gwalior Jn · GWL</option>
            </select>
          </div>
        </div>
      </OperationsHeader>

      <div className="ops-kpi-grid">
        <article>
          <span className="metric-icon blue"><Icon name="train" /></span>
          <div><span>Approaching in 2 hours</span><strong>18 trains</strong><small>4 within 30 minutes</small></div>
        </article>
        <article>
          <span className="metric-icon amber"><Icon name="clock" /></span>
          <div><span>Average delay</span><strong>7.4 minutes</strong><small className="positive-text">2.1 min lower today</small></div>
        </article>
        <article>
          <span className="metric-icon green"><Icon name="shield" /></span>
          <div><span>On-time forecast</span><strong>78%</strong><small>14 of 18 services</small></div>
        </article>
        <article>
          <span className="metric-icon violet"><Icon name="activity" /></span>
          <div><span>Active alerts</span><strong>3 alerts</strong><small className="warning-text">1 needs attention</small></div>
        </article>
      </div>

      <div className="station-layout">
        <article className="operations-card arrivals-card">
          <div className="ops-card-header">
            <div>
              <span className="section-kicker">Live station board</span>
              <h3>Arrival forecast</h3>
            </div>
            <div className="segmented-control" aria-label="Arrival filter">
              {["All arrivals", "Delayed", "Critical"].map((filter) => (
                <button
                  key={filter}
                  className={alertFilter === filter ? "is-active" : ""}
                  onClick={() => setAlertFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="table-scroll">
            <table className="arrival-table">
              <thead>
                <tr>
                  <th>Train</th>
                  <th>Scheduled</th>
                  <th>Predicted</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {approaching
                  .filter((train) => alertFilter === "All arrivals" || (alertFilter === "Delayed" ? train.delay !== "On time" : train.state === "critical"))
                  .map((train) => (
                    <tr key={train.number}>
                      <td>
                        <div className="train-cell">
                          <span>{train.number}</span>
                          <div><strong>{train.name}</strong><small>From {train.from}</small></div>
                        </div>
                      </td>
                      <td>{train.scheduled}</td>
                      <td><strong className="predicted-time">{train.predicted}</strong></td>
                      <td><span className="platform-badge">PF {train.platform}</span></td>
                      <td><span className={`status-badge ${train.state}`}>{train.delay}</span></td>
                      <td><div className="confidence-cell"><strong>{train.confidence}</strong><span><i className={`fill-${train.confidence.replace("%", "")}`} /></span></div></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="station-side">
          <article className="operations-card alert-card">
            <div className="ops-card-header">
              <div><span className="section-kicker">Priority queue</span><h3>Operational alerts</h3></div>
              <span className="alert-count">3</span>
            </div>
            <div className="alert-list">
              <div className="ops-alert critical">
                <span><Icon name="activity" size={18} /></span>
                <div><strong>Platform conflict risk</strong><p>12190 and 11808 may overlap at Platform 4 near 09:24.</p><small>Detected 2 min ago</small></div>
              </div>
              <div className="ops-alert warning">
                <span><Icon name="clock" size={18} /></span>
                <div><strong>Significant ETA change</strong><p>12190 forecast moved by +7 minutes after an unscheduled halt.</p><small>Updated 5 min ago</small></div>
              </div>
              <div className="ops-alert info">
                <span><Icon name="cloud" size={18} /></span>
                <div><strong>Visibility advisory</strong><p>Moderate haze expected after 10:00. No current ETA impact.</p><small>Updated 12 min ago</small></div>
              </div>
            </div>
          </article>

          <article className="operations-card flow-card">
            <div className="ops-card-header"><div><span className="section-kicker">Next 6 hours</span><h3>Arrival load</h3></div><span className="healthy-label">Normal flow</span></div>
            <div className="bar-chart">
              {[52, 70, 45, 86, 62, 38].map((value, index) => (
                <div key={index}><span className={`bar-height-${value}`} /><small>{8 + index}:00</small></div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function NetworkDashboard() {
  const [period, setPeriod] = useState("Live");
  const [activeCount, setActiveCount] = useState(2846);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/network")
      .then((res) => res.json())
      .then((data) => {
        if (data.active_trains) {
          setActiveCount(data.active_trains);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="operations-page">
      <OperationsHeader
        eyebrow="Control room"
        title="Network intelligence"
        copy="Monitor train movement, congestion risk, and delay propagation across the active network."
      >
        <div className="live-control">
          <span className="pulse-dot" />
          Live network · updated 24s ago
          <Button variant="soft">Export report</Button>
        </div>
      </OperationsHeader>

      <div className="ops-kpi-grid network-kpis">
        <article><span className="metric-icon blue"><Icon name="train" /></span><div><span>Active trains</span><strong>{activeCount.toLocaleString()}</strong><small className="positive-text">98.7% reporting live</small></div></article>
        <article><span className="metric-icon amber"><Icon name="clock" /></span><div><span>Delayed services</span><strong>184</strong><small>6.5% of network</small></div></article>
        <article><span className="metric-icon violet"><Icon name="route" /></span><div><span>Congestion hotspots</span><strong>12 sections</strong><small className="warning-text">3 high severity</small></div></article>
        <article><span className="metric-icon green"><Icon name="shield" /></span><div><span>Prediction accuracy</span><strong>91.8%</strong><small className="positive-text">+1.4% this week</small></div></article>
      </div>

      <div className="network-layout">
        <article className="operations-card network-map-card">
          <div className="ops-card-header">
            <div><span className="section-kicker">System overview</span><h3>Live network health</h3></div>
            <div className="network-legend"><span className="normal">Normal</span><span className="moderate">Moderate</span><span className="severe">Severe</span></div>
          </div>
          <NetworkMap />
        </article>

        <aside className="network-side">
          <article className="operations-card hotspots-card">
            <div className="ops-card-header"><div><span className="section-kicker">Predictive congestion</span><h3>Priority hotspots</h3></div><Button variant="ghost">View all</Button></div>
            <div className="hotspot-list">
              <div><span className="severity severe">High</span><p><strong>Lucknow → Kanpur</strong><small>+18 min predicted impact</small></p><b>87</b></div>
              <div><span className="severity moderate">Med</span><p><strong>Agra → Gwalior</strong><small>+9 min predicted impact</small></p><b>64</b></div>
              <div><span className="severity moderate">Med</span><p><strong>Jaipur → Bandikui</strong><small>+7 min predicted impact</small></p><b>58</b></div>
            </div>
          </article>
          <article className="operations-card accuracy-card">
            <div className="ops-card-header">
              <div><span className="section-kicker">Model performance</span><h3>ETA accuracy trend</h3></div>
              <select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Live</option><option>7 days</option><option>30 days</option></select>
            </div>
            <div className="accuracy-score"><strong>91.8%</strong><span>within ±5 minutes</span></div>
            <div className="line-chart">
              <svg viewBox="0 0 360 100" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0969e8" stopOpacity=".2" /><stop offset="100%" stopColor="#0969e8" stopOpacity="0" /></linearGradient></defs>
                <path className="area" d="M0 82 C40 70 60 78 95 55 S150 65 185 38 240 50 275 28 330 35 360 14 L360 100 L0 100Z" />
                <path className="line" d="M0 82 C40 70 60 78 95 55 S150 65 185 38 240 50 275 28 330 35 360 14" />
              </svg>
              <div><span>06:00</span><span>10:00</span><span>14:00</span><span>Now</span></div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function PredictiveDashboard() {
  const [congestion, setCongestion] = useState(42);
  const [dwell, setDwell] = useState(6);
  const [restriction, setRestriction] = useState(18);
  const [scenarioRun, setScenarioRun] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/model/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.mae) {
          setModelMetrics(data);
        }
      })
      .catch(() => {});
  }, []);

  const runSimulation = () => {
    fetch("http://127.0.0.1:8000/api/predict/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        train_number: "12002",
        congestion_pct: congestion,
        additional_dwell_min: dwell,
        speed_restriction_km: restriction,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.revised_destination_eta) {
          setSimResult(data);
          setScenarioRun(true);
        }
      })
      .catch(() => {
        setScenarioRun(true);
      });
  };

  const impact = simResult ? simResult.total_impact_min : Math.round(congestion / 12 + dwell * 0.8 + restriction / 9);
  const confidence = simResult ? simResult.confidence_score : `${Math.max(74, Math.round(96 - congestion / 14 - restriction / 18))}%`;
  const revisedEta = simResult ? simResult.revised_destination_eta : `14:${String(18 + impact).padStart(2, "0")}`;

  return (
    <section className="operations-page">
      <OperationsHeader
        eyebrow="Predictive operations"
        title="ETA intelligence lab"
        copy="Explain predictions, test operational scenarios, and monitor model quality before conditions affect the network."
      >
        <div className="live-control">
          <span className="model-status-dot" />
          ETA Engine v3.8 · ML Active
          <Button variant="soft">Model details</Button>
        </div>
      </OperationsHeader>

      <div className="analytics-status-row">
        <div>
          <span className="metric-icon green"><Icon name="shield" /></span>
          <p><span>Production model</span><strong>{modelMetrics ? modelMetrics.model_name : "Gradient Ensemble v3.8"}</strong></p>
        </div>
        <div><span>Predictions today</span><strong>1.84M</strong><small>99.98% served</small></div>
        <div><span>MAE / Median Error</span><strong>{modelMetrics ? `${modelMetrics.mae}m / ${modelMetrics.median_absolute_error}m` : "1.71m / 1.43m"}</strong><small className="positive-text">±5 min: {modelMetrics ? `${modelMetrics.pct_within_5_min}%` : "98.0%"}</small></div>
        <div><span>Data freshness</span><strong>24 sec</strong><small className="positive-text">All feeds healthy</small></div>
        <div><span>Dataset size</span><strong>{modelMetrics ? `${modelMetrics.training_samples.toLocaleString()} runs` : "10,000 runs"}</strong><small>Official IR records</small></div>
      </div>

      <div className="predictive-layout">
        <article className="operations-card simulator-card">
          <div className="ops-card-header">
            <div><span className="section-kicker">What-if simulator</span><h3>Test operational impact</h3></div>
            <span className="simulation-label"><Icon name="sparkles" size={14} /> Scenario mode</span>
          </div>
          <div className="simulation-route">
            <div>
              <span className="route-code">NDLS</span>
              <p><strong>New Delhi</strong><small>06:15 departure</small></p>
            </div>
            <span className="route-connector"><i /><Icon name="train" size={18} /><i /></span>
            <div>
              <span className="route-code destination">RKMP</span>
              <p><strong>Rani Kamlapati</strong><small>14:18 baseline ETA</small></p>
            </div>
          </div>
          <div className="scenario-controls">
            <label>
              <div><span>Section congestion</span><strong>{congestion}%</strong></div>
              <input type="range" min="0" max="100" value={congestion} onChange={(event) => { setCongestion(Number(event.target.value)); setScenarioRun(false); }} />
              <small>Expected traffic density between Agra and Gwalior</small>
            </label>
            <label>
              <div><span>Additional station dwell</span><strong>{dwell} min</strong></div>
              <input type="range" min="0" max="20" value={dwell} onChange={(event) => { setDwell(Number(event.target.value)); setScenarioRun(false); }} />
              <small>Unplanned passenger or operational dwell</small>
            </label>
            <label>
              <div><span>Speed-restricted section</span><strong>{restriction} km</strong></div>
              <input type="range" min="0" max="60" value={restriction} onChange={(event) => { setRestriction(Number(event.target.value)); setScenarioRun(false); }} />
              <small>Temporary section restriction at 50 km/h</small>
            </label>
          </div>
          <div className="simulation-actions">
            <Button variant="ghost" onClick={() => { setCongestion(42); setDwell(6); setRestriction(18); setScenarioRun(false); setSimResult(null); }}>Reset scenario</Button>
            <Button onClick={runSimulation}><Icon name="activity" size={17} /> Run simulation</Button>
          </div>
        </article>

        <article className={`operations-card impact-card ${scenarioRun ? "has-run" : ""}`}>
          <div className="ops-card-header">
            <div><span className="section-kicker">Forecast outcome</span><h3>Predicted impact</h3></div>
            <span className="confidence-chip">{confidence} confidence</span>
          </div>
          <div className="impact-hero">
            <span>Revised destination ETA</span>
            <strong>{scenarioRun ? revisedEta : "14:18"}</strong>
            <small>{scenarioRun ? `+${impact} minutes vs. baseline` : "Run the scenario to calculate impact"}</small>
          </div>
          <div className="impact-stations">
            {simResult && simResult.station_impacts ? (
              simResult.station_impacts.slice(0, 3).map((st: any) => (
                <div key={st.station_code}>
                  <p><strong>{st.station_name}</strong><small>{st.baseline_arr} baseline</small></p>
                  <span>{st.delay_impact_min}</span>
                </div>
              ))
            ) : (
              <>
                <div><p><strong>Agra Cantt</strong><small>08:37 baseline</small></p><span>{scenarioRun ? `+${Math.max(2, Math.round(impact * 0.3))}m` : "—"}</span></div>
                <div><p><strong>Gwalior Jn</strong><small>10:06 baseline</small></p><span>{scenarioRun ? `+${Math.round(impact * 0.55)}m` : "—"}</span></div>
                <div><p><strong>Jhansi Jn</strong><small>11:31 baseline</small></p><span>{scenarioRun ? `+${Math.round(impact * 0.8)}m` : "—"}</span></div>
              </>
            )}
          </div>
          <div className="recovery-callout">
            <Icon name="sparkles" size={19} />
            <div><strong>Recovery opportunity</strong><p>{simResult?.recovery_recommendation || "Reducing Gwalior dwell by 4 minutes could recover approximately 3 minutes downstream."}</p></div>
          </div>
        </article>
      </div>

      <div className="analytics-grid">
        <article className="operations-card explain-card">
          <div className="ops-card-header">
            <div><span className="section-kicker">Explainable ETA</span><h3>Prediction contributors</h3></div>
            <span className="station-code">12002</span>
          </div>
          <div className="factor-list">
            <div><p><strong>Current train delay</strong><small>Latest movement observation</small></p><span><i className="factor-delay" /></span><b>+8.2m</b></div>
            <div><p><strong>Downstream congestion</strong><small>Agra–Gwalior section</small></p><span><i className="factor-congestion" /></span><b>+3.6m</b></div>
            <div><p><strong>Historical recovery</strong><small>Train-specific behavior</small></p><span><i className="factor-recovery" /></span><b className="positive-text">−4.1m</b></div>
            <div><p><strong>Weather conditions</strong><small>Clear visibility, dry track</small></p><span><i className="factor-weather" /></span><b>+0.3m</b></div>
          </div>
          <div className="explanation-summary"><Icon name="info" size={17} /> The current ETA is driven mainly by the existing delay, partially offset by this train's strong historical recovery pattern.</div>
        </article>

        <article className="operations-card anomaly-card">
          <div className="ops-card-header">
            <div><span className="section-kicker">Anomaly detection</span><h3>Live observations</h3></div>
            <span className="alert-count">4</span>
          </div>
          <div className="anomaly-list">
            <div><span className="anomaly-icon critical"><Icon name="activity" size={17} /></span><p><strong>Unusual stoppage pattern</strong><small>Train 12190 · Palwal section</small></p><b>High</b></div>
            <div><span className="anomaly-icon warning"><Icon name="clock" size={17} /></span><p><strong>Excessive station dwell</strong><small>Train 11808 · Platform 3</small></p><b>Medium</b></div>
            <div><span className="anomaly-icon info"><Icon name="location" size={17} /></span><p><strong>Location feed inconsistency</strong><small>Train 22414 · Last 3 events</small></p><b>Review</b></div>
            <div><span className="anomaly-icon warning"><Icon name="route" size={17} /></span><p><strong>Abnormal section speed</strong><small>Train 12626 · 18% below profile</small></p><b>Medium</b></div>
          </div>
        </article>

        <article className="operations-card quality-card">
          <div className="ops-card-header"><div><span className="section-kicker">Model monitoring</span><h3>Quality by horizon</h3></div><Button variant="ghost">Full report</Button></div>
          <div className="quality-score-ring"><div><strong>{modelMetrics ? `${modelMetrics.pct_within_5_min}%` : "98.0%"}</strong><span>within ±5m</span></div></div>
          <div className="quality-legend">
            <p><span className="horizon-dot near" /><strong>Next station</strong><b>98.0%</b></p>
            <p><span className="horizon-dot medium" /><strong>2–5 stations</strong><b>95.2%</b></p>
            <p><span className="horizon-dot far" /><strong>Destination</strong><b>91.4%</b></p>
          </div>
        </article>
      </div>
    </section>
  );
}

function App() {
  const [query, setQuery] = useState("12002");
  const [activeQuery, setActiveQuery] = useState("12002");
  const [navOpen, setNavOpen] = useState(false);
  const [notice, setNotice] = useState("Live ML feed connected · 24s ago");
  const [activeView, setActiveView] = useState<"track" | "station" | "network" | "analytics">("track");

  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [stops, setStops] = useState<any[]>(defaultStops);

  const searchTrain = () => {
    const q = query.trim() || "12002";
    setActiveQuery(q);
    setNotice("Fetching ML predictions from backend...");

    fetch(`http://127.0.0.1:8000/api/train/${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.itinerary) {
          setLiveStatus(data);
          const formattedStops = data.itinerary.map((st: any) => ({
            city: st.station_name,
            code: st.station_code,
            time: st.predicted_arr,
            state: st.status
          }));
          setStops(formattedStops);
          setNotice(`Train ${q} ML prediction refreshed just now`);
        }
      })
      .catch(() => {
        setNotice(`Train ${q} status updated (offline mode)`);
      });
  };

  useEffect(() => {
    searchTrain();
  }, []);

  const changeView = (view: "track" | "station" | "network" | "analytics") => {
    setActiveView(view);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="nav-container">
          <img className="brand-logo" src="/railvista-logo.png" alt="RailVista" />
          <nav className={navOpen ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
            <button className={`nav-link ${activeView === "track" ? "is-active" : ""}`} onClick={() => changeView("track")}>Track train</button>
            <button className={`nav-link ${activeView === "station" ? "is-active" : ""}`} onClick={() => changeView("station")}>Station board</button>
            <button className={`nav-link ${activeView === "network" ? "is-active" : ""}`} onClick={() => changeView("network")}>Network insights</button>
            <button className={`nav-link ${activeView === "analytics" ? "is-active" : ""}`} onClick={() => changeView("analytics")}>Predictive lab</button>
          </nav>
          <div className="nav-actions">
            <button className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" />
              <span className="notification-dot" />
            </button>
            <Button variant="soft" className="account-button">
              <span className="avatar">
                <Icon name="user" size={16} />
              </span>
              Passenger
              <Icon name="chevron" size={15} />
            </Button>
            <button
              className="icon-button menu-button"
              aria-label="Toggle navigation"
              onClick={() => setNavOpen(!navOpen)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {activeView === "track" && (
          <>
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-inner">
            <div className="eyebrow">
              <span className="live-dot" />
              Predictive railway intelligence
            </div>
            <h1>Every journey, clearly predicted.</h1>
            <p className="hero-copy">
              Live train movement, dynamic arrival forecasts, and the context behind every update — all in one
              reliable view.
            </p>
            <div className="search-panel">
              <div className="search-label-row">
                <label htmlFor="train-search">Find your train</label>
                <span>Train number or name</span>
              </div>
              <div className="search-row">
                <div className="search-field">
                  <Icon name="search" size={21} />
                  <input
                    id="train-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && searchTrain()}
                    placeholder="e.g. 12002 or Shatabdi Express"
                  />
                </div>
                <Button onClick={searchTrain}>
                  Track train
                  <Icon name="chevron" size={17} />
                </Button>
              </div>
              <div className="recent-row">
                <span>Recent</span>
                <button onClick={() => { setQuery("12002"); searchTrain(); }}>12002 · Shatabdi</button>
                <button onClick={() => { setQuery("22221"); searchTrain(); }}>22221 · Rajdhani</button>
                <button onClick={() => { setQuery("12626"); searchTrain(); }}>12626 · Kerala</button>
                <button onClick={() => { setQuery("12190"); searchTrain(); }}>12190 · Mahakaushal</button>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard">
          <div className="status-strip">
            <div>
              <div className="status-title">
                <span className="status-icon">
                  <Icon name="train" />
                </span>
                <div>
                  <div className="train-heading">
                    <h2>{activeQuery} · {liveStatus ? liveStatus.train_name : "Bhopal Shatabdi Express"}</h2>
                    <span className="running-badge">Running</span>
                  </div>
                  <p>{liveStatus ? `${liveStatus.origin} → ${liveStatus.destination}` : "New Delhi → Rani Kamlapati"}</p>
                </div>
              </div>
            </div>
            <div className="freshness">
              <span className="freshness-icon">
                <Icon name="activity" size={17} />
              </span>
              <div>
                <strong>Live ML data</strong>
                <span>{notice}</span>
              </div>
              <Button variant="ghost" onClick={searchTrain}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="primary-column">
              <article className="map-card">
                <div className="card-heading">
                  <div>
                    <span className="section-kicker">Current position</span>
                    <h3>Approaching {stops[2]?.city || "Agra Cantt"}</h3>
                  </div>
                  <div className="map-actions">
                    <span className="weather-pill">
                      <Icon name="cloud" size={16} />
                      24°C · Clear
                    </span>
                    <button className="icon-button map-locate" aria-label="Locate train">
                      <Icon name="crosshair" size={18} />
                    </button>
                  </div>
                </div>

                <RealTimeMap stops={stops} currentStationCode="AGC" />
              </article>

              <article className="insight-card">
                <div className="insight-icon">
                  <Icon name="sparkles" />
                </div>
                <div className="insight-copy">
                  <span className="section-kicker">RailVista ML insight</span>
                  <h3>Arrival remains on track</h3>
                  <p>
                    Gradient Boosting model factors clear signals ahead and historical recovery patterns to predict
                    arrival within ±3 minutes.
                  </p>
                </div>
                <div className="confidence">
                  <span>Prediction confidence</span>
                  <strong>{liveStatus ? liveStatus.confidence_overall : "92%"}</strong>
                  <div className="confidence-bar">
                    <span />
                  </div>
                </div>
              </article>
            </div>

            <aside className="side-column">
              <article className="eta-card">
                <div className="eta-topline">
                  <span className="section-kicker">Next station</span>
                  <span className="delay-badge">+{liveStatus ? liveStatus.current_delay_min : 8} min</span>
                </div>
                <div className="eta-station">
                  <div>
                    <h3>{stops[2]?.city || "Agra Cantt"}</h3>
                    <p>Platform 2 · 6.4 km away</p>
                  </div>
                  <span className="station-code">{stops[2]?.code || "AGC"}</span>
                </div>
                <div className="eta-time">
                  <strong>{stops[2]?.time || "08:37"}</strong>
                  <div>
                    <span>Expected arrival</span>
                    <small>08:34–08:41 window</small>
                  </div>
                </div>
                <div className="time-to-arrival">
                  <Icon name="clock" size={17} />
                  Arriving in approximately <strong>12 minutes</strong>
                </div>
              </article>

              <article className="journey-card">
                <div className="card-heading compact">
                  <div>
                    <span className="section-kicker">Journey progress</span>
                    <h3>Upcoming stations</h3>
                  </div>
                  <Button variant="ghost">Full route</Button>
                </div>
                <div className="timeline">
                  {stops.map((stop) => (
                    <div className={`timeline-row ${stop.state}`} key={stop.code}>
                      <div className="timeline-track">
                        <span className="timeline-node" />
                      </div>
                      <div className="stop-info">
                        <strong>{stop.city}</strong>
                        <span>{stop.code}</span>
                      </div>
                      <div className="stop-time">
                        <strong>{stop.time}</strong>
                        {stop.state === "current" && <span>+{liveStatus ? liveStatus.current_delay_min : 8} min</span>}
                        {stop.state === "next" && <span>+6 min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </aside>
          </div>

          <div className="metric-grid">
            <article>
              <span className="metric-icon blue">
                <Icon name="route" />
              </span>
              <div>
                <span>Journey complete</span>
                <strong>34%</strong>
              </div>
              <div className="mini-progress">
                <span />
              </div>
            </article>
            <article>
              <span className="metric-icon amber">
                <Icon name="clock" />
              </span>
              <div>
                <span>Current delay</span>
                <strong>{liveStatus ? liveStatus.current_delay_min : 8} minutes</strong>
              </div>
              <small>Recovering</small>
            </article>
            <article>
              <span className="metric-icon green">
                <Icon name="shield" />
              </span>
              <div>
                <span>ETA reliability</span>
                <strong>High</strong>
              </div>
              <small>{liveStatus ? liveStatus.confidence_overall : "92%"} confidence</small>
            </article>
            <article>
              <span className="metric-icon violet">
                <Icon name="location" />
              </span>
              <div>
                <span>Destination ETA</span>
                <strong>{liveStatus ? liveStatus.predicted_destination_eta : "14:18"}</strong>
              </div>
              <small>± 5 minutes</small>
            </article>
          </div>
        </section>
          </>
        )}
        {activeView === "station" && <StationDashboard />}
        {activeView === "network" && <NetworkDashboard />}
        {activeView === "analytics" && <PredictiveDashboard />}
      </main>

      <footer>
        <div>
          <Icon name="info" size={17} />
          Predictions are continuously updated using live movement, network conditions, and ML models trained on official IR records.
        </div>
        <span>RailVista · Smarter journeys through predictive intelligence</span>
      </footer>
    </div>
  );
}

export default App;
