import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SankeyDiagram from './SankeyDiagram';
import TimelineChart from './TimelineChart';
import { fetchPipelineData, fetchTimelineData, fetchPipelineRoles, fetchPipelineCompanies, fetchPipelineJobTypes, fetchPipelinePlatforms, fetchPipelineHighlights } from '../utils/api';

const STAGES = [
  { key: 'applications', label: 'Applications', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', desc: 'Total jobs applied to' },
  { key: 'callbacks',    label: 'Callbacks',    color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', desc: 'Employer responses received' },
  { key: 'interviews',   label: 'Interviews',   color: '#10b981', bg: 'rgba(16,185,129,0.12)', desc: 'Moved to interview stage' },
  { key: 'offers',       label: 'Offers',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  desc: 'Final job offers received' },
];

const HIGHLIGHTS_CONFIG = [
  {
    key: 'top_company',
    filterKey: 'company_name',
    label: 'Company',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    statLine: h => `${h.applications} applications · ${(h.rate * 100).toFixed(0)}% callbacks`,
  },
  {
    key: 'best_role',
    filterKey: 'job_role',
    label: 'Role',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.12)',
    statLine: h => `${(h.rate * 100).toFixed(0)}% callback rate · ${h.applications} apps`,
  },
  {
    key: 'best_platform',
    filterKey: 'platform',
    label: 'Platform',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    statLine: h => `${(h.rate * 100).toFixed(0)}% callback rate · ${h.applications} apps`,
  },
  {
    key: 'best_job_type',
    filterKey: 'job_type',
    label: 'Job Type',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    statLine: h => `${(h.rate * 100).toFixed(0)}% offer rate · ${h.applications} apps`,
  },
];

const FILTER_CONFIG = [
  {
    key: 'job_role',
    label: 'Job Role',
    allLabel: 'All Roles',
    insight: 'Which roles get you the most callbacks?',
    tip: 'Start here — filtering by role reveals where your skills are resonating most.',
  },
  {
    key: 'company_name',
    label: 'Company',
    allLabel: 'All Companies',
    insight: 'How far do you get at each company?',
    tip: 'Spot which employers move you furthest through their pipeline.',
  },
  {
    key: 'job_type',
    label: 'Job Type',
    allLabel: 'All Types',
    insight: 'Does job type change your success rate?',
    tip: 'Compare full-time vs internship to see where your conversion is stronger.',
  },
  {
    key: 'platform',
    label: 'Platform',
    allLabel: 'All Platforms',
    insight: 'Which job source gives the best ROI?',
    tip: 'Find which platform turns applications into interviews most reliably.',
  },
];

const computeInsights = (data) => {
  if (!data) return [];
  const { applications, callbacks, interviews, offers } = data;
  const out = [];

  if (applications > 0 && callbacks >= 0) {
    out.push({
      label: 'Callback Rate',
      value: `${((callbacks / applications) * 100).toFixed(1)}%`,
      raw: (callbacks / applications) * 100,
      desc: `${callbacks} of ${applications} applications got a response`,
      color: '#3b82f6',
    });
  }
  if (callbacks > 0) {
    out.push({
      label: 'Callback → Interview',
      value: `${((interviews / callbacks) * 100).toFixed(1)}%`,
      raw: (interviews / callbacks) * 100,
      desc: `${interviews} interviews from ${callbacks} callbacks`,
      color: '#22d3ee',
    });
  }
  if (interviews > 0) {
    out.push({
      label: 'Interview → Offer',
      value: `${((offers / interviews) * 100).toFixed(1)}%`,
      raw: (offers / interviews) * 100,
      desc: `${offers} offers from ${interviews} interviews`,
      color: '#10b981',
    });
  }
  if (applications > 0 && offers > 0) {
    out.push({
      label: 'Overall Success Rate',
      value: `${((offers / applications) * 100).toFixed(2)}%`,
      raw: (offers / applications) * 100,
      desc: `1 offer per ~${Math.round(applications / offers)} applications`,
      color: '#f59e0b',
    });
  }
  return out;
};

/* Skeleton placeholder while first load is in progress */
const StatSkeleton = () => (
  <div className="pp-stats-grid">
    {STAGES.map(stage => (
      <div key={stage.key} className="pp-stat-card pp-skeleton-card">
        <div className="pp-stat-accent-bar" style={{ background: stage.color }} />
        <div className="pp-skel pp-skel-icon" />
        <div className="pp-skel pp-skel-num" />
        <div className="pp-skel pp-skel-label" />
        <div className="pp-skel pp-skel-desc" />
      </div>
    ))}
  </div>
);

const PipelinePage = () => {
  const [pipelineData, setPipelineData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [hasLoaded,    setHasLoaded]    = useState(false); // prevents scroll-reset on filter change
  const [error,        setError]        = useState(null);
  const [roles,        setRoles]        = useState([]);
  const [companies,    setCompanies]    = useState([]);
  const [jobTypes,     setJobTypes]     = useState([]);
  const [platforms,    setPlatforms]    = useState([]);
  const [highlights,   setHighlights]   = useState(null);
  const [filters,      setFilters]      = useState({
    job_role: 'All', company_name: 'All', job_type: 'All', platform: 'All',
  });

  const filterOptions = { job_role: roles, company_name: companies, job_type: jobTypes, platform: platforms };

  useEffect(() => {
    const load = async () => {
      try {
        const [r, c, j, p, h] = await Promise.all([
          fetchPipelineRoles(), fetchPipelineCompanies(), fetchPipelineJobTypes(), fetchPipelinePlatforms(),
          fetchPipelineHighlights(),
        ]);
        setRoles(r || []); setCompanies(c || []); setJobTypes(j || []); setPlatforms(p || []);
        setHighlights(h || null);
      } catch {
        setRoles([]); setCompanies([]); setJobTypes([]); setPlatforms([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pipeline, timeline] = await Promise.all([
          fetchPipelineData(filters), fetchTimelineData(filters),
        ]);
        setPipelineData(pipeline);
        setTimelineData(timeline);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };
    load();
  }, [filters]);

  const insights           = computeInsights(pipelineData);
  const activeFiltersCount = Object.values(filters).filter(v => v !== 'All').length;
  const resetFilters       = () => setFilters({ job_role: 'All', company_name: 'All', job_type: 'All', platform: 'All' });

  // Only block render on the very first load — subsequent filter changes keep the page mounted
  if (!hasLoaded && loading) return (
    <div className="pp-loading">
      <div className="pp-loading-spinner" />
      <p className="pp-loading-text">Loading pipeline data…</p>
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5 mx-4">Error: {error}</div>;

  return (
    <div className="pp-root">

      {/* ── Hero ── */}
      <div className="pp-hero">
        <div className="pp-hero-orbs" aria-hidden="true">
          <div className="pp-orb pp-orb-1" />
          <div className="pp-orb pp-orb-2" />
        </div>
        <div className="pp-hero-body">
          <div className="pp-hero-topbar">
            <Link to="/" className="btn btn-outline-future pp-back-btn">← Back</Link>
            <span className="pp-eyebrow">Flow Analytics</span>
          </div>
          <h1 className="pp-title">Job Search Application Pipeline</h1>
          <p className="pp-subtitle">
            See exactly how job applications move through each hiring stage — from first submission to final offer.
            Use the filters below to zoom into any role, company, or platform.
          </p>
          <div className="pp-stage-legend">
            {STAGES.map((stage, i) => (
              <React.Fragment key={stage.key}>
                <div className="pp-legend-item">
                  <div className="pp-legend-dot" style={{ background: stage.color }} />
                  <span className="pp-legend-label" style={{ color: stage.color }}>{stage.label}</span>
                </div>
                {i < STAGES.length - 1 && <span className="pp-legend-arrow" aria-hidden="true">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle updating bar — replaces the scroll-resetting full loading screen */}
      <div className={`pp-update-bar${loading && hasLoaded ? ' is-updating' : ''}`} aria-hidden="true" />

      <div className="pp-content">

        {/* ── Highlights ── */}
        {highlights && (
          <section className="pp-highlights-section">
            <div className="pp-highlights-guide">
              <span className="pp-guide-label">Quick Highlights</span>
            </div>
            <p className="pp-guide-hint pp-highlights-hint">Click any card to instantly filter the data below</p>
            <div className="pp-highlights-grid">
              {HIGHLIGHTS_CONFIG.map(({ key, filterKey, label, color, bg, statLine }) => {
                const h = highlights[key];
                if (!h) return null;
                const isActive = filters[filterKey] === h.name;
                return (
                  <div
                    key={key}
                    className={`pp-highlight-card${isActive ? ' is-active' : ''}`}
                    style={isActive ? { borderColor: color, boxShadow: `0 0 0 2px ${bg}, var(--shadow-lg)` } : {}}
                    onClick={() => setFilters(prev => ({ ...prev, [filterKey]: isActive ? 'All' : h.name }))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setFilters(prev => ({ ...prev, [filterKey]: isActive ? 'All' : h.name }))}
                  >
                    <div className="pp-highlight-accent" style={{ background: color }} />
                    <span className="pp-highlight-badge" style={{ color, background: bg }}>{label}</span>
                    <div className="pp-highlight-heading">{h.label}</div>
                    <div className="pp-highlight-name">{h.name}</div>
                    <div className="pp-highlight-stat">{statLine(h)}</div>
                    <div className="pp-highlight-cta" style={{ color }}>
                      {isActive ? '✕ Clear filter' : 'Filter by this →'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Filters ── */}
        <section className="pp-filters-section">
          <div className="pp-filters-header">
            <div>
              <h2 className="pp-section-title">Narrow Your View</h2>
              <p className="pp-section-sub">
                Every selection instantly refreshes the stats and charts below.
                {activeFiltersCount === 0 && (
                  <span className="pp-filter-start-hint"> Not sure where to start? Try <strong>Job Role</strong> first.</span>
                )}
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button className="pp-reset-btn" onClick={resetFilters}>
                Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
              </button>
            )}
          </div>

          <div className="pp-filters-grid">
            {FILTER_CONFIG.map(({ key, label, allLabel, insight, tip }) => (
              <div key={key} className={`pp-filter-item${filters[key] !== 'All' ? ' is-active' : ''}`}>
                <div className="pp-filter-label-row">
                  <label className="pp-filter-label">{label}</label>
                  {filters[key] !== 'All' && <div className="pp-filter-pip" />}
                </div>
                <select
                  className="pp-filter-select"
                  value={filters[key]}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                >
                  <option value="All">{allLabel}</option>
                  {(filterOptions[key] || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pp-filter-guidance">
                  {filters[key] === 'All' ? (
                    <span className="pp-filter-insight">{insight}</span>
                  ) : (
                    <span className="pp-filter-active-hint">
                      Showing results for <strong>{filters[key]}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="pp-stats-section">
          <div className="pp-stats-guide">
            <span className="pp-guide-label">Pipeline Summary</span>
            {loading && hasLoaded && (
              <span className="pp-updating-badge">Updating…</span>
            )}
          </div>
          {!pipelineData ? (
            <StatSkeleton />
          ) : (
            <div className={`pp-stats-grid${loading ? ' pp-data-refreshing' : ''}`}>
              {STAGES.map((stage) => {
                const value = pipelineData[stage.key] || 0;
                return (
                  <div key={stage.key} className="pp-stat-card">
                    <div className="pp-stat-accent-bar" style={{ background: stage.color }} />
                    <div className="pp-stat-icon" style={{ background: stage.bg }}>
                      <div className="pp-stat-dot" style={{ background: stage.color }} />
                    </div>
                    <div className="pp-stat-num" style={{ color: stage.color }}>
                      {value.toLocaleString()}
                    </div>
                    <div className="pp-stat-name">{stage.label}</div>
                    <div className="pp-stat-desc">{stage.desc}</div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Charts ── */}
        <section className="pp-charts-section">
          <div className="pp-chart-card">
            <div className="pp-chart-header">
              <div className="pp-chart-header-text">
                <h2 className="pp-chart-title">Application Flow</h2>
                <p className="pp-chart-guide">
                  Each band shows volume moving from one stage to the next.
                  <strong> Wider bands = more applicants.</strong> Where bands narrow, that's where drop-offs happen.
                </p>
              </div>
              <span className="pp-chart-badge pp-chart-badge-blue">Sankey Funnel Diagram</span>
            </div>
            <div className={`chart-shell${loading ? ' pp-data-refreshing' : ''}`}>
              <SankeyDiagram data={pipelineData} />
            </div>
          </div>

          {/* ── Insights (below Sankey) ── */}
          {insights.length > 0 && (
            <section className="pp-insights-section">
              <div className="pp-insights-guide">
                <span className="pp-guide-label">Key Insights</span>
              </div>
              <div className={`pp-insights-grid${loading ? ' pp-data-refreshing' : ''}`}>
                {insights.map(ins => (
                  <div key={ins.label} className="pp-insight-card">
                    <div className="pp-insight-value" style={{ color: ins.color }}>{ins.value}</div>
                    <div className="pp-insight-label">{ins.label}</div>
                    <div className="pp-insight-desc">{ins.desc}</div>
                    <div className="pp-insight-bar">
                      <div
                        className="pp-insight-bar-fill"
                        style={{ background: ins.color, width: `${Math.min(ins.raw, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="pp-chart-footnote">Conversion rates auto-computed from data</p>
            </section>
          )}

          <div className="pp-chart-card">
            <div className="pp-chart-header">
              <div className="pp-chart-header-text">
                <h2 className="pp-chart-title">Activity Timeline</h2>
                <p className="pp-chart-guide">
                  Track the time when most active in job search.
                  <strong> Peaks = high-volume periods;</strong> gaps reveal slowdowns or pauses.
                </p>
              </div>
              <span className="pp-chart-badge pp-chart-badge-cyan">Timeline</span>
            </div>
            <div className={`chart-shell${loading ? ' pp-data-refreshing' : ''}`}>
              <TimelineChart data={timelineData} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PipelinePage;
