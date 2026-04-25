/**
 * Landing page introducing the Hire Sight features.
 *
 * This component renders five feature cards linking to each analytics view
 * and fires a backend ping on mount to warm up the Render cold-start.
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { pingBackend } from '../utils/api';

const PipelineIcon = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <rect x="4" y="10" width="10" height="28" rx="3" fill="currentColor" opacity="0.9"/>
    <rect x="19" y="16" width="10" height="22" rx="3" fill="currentColor" opacity="0.7"/>
    <rect x="34" y="22" width="10" height="16" rx="3" fill="currentColor" opacity="0.5"/>
    <path d="M14 20 L19 20 M29 26 L34 26" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round"/>
  </svg>
);

const HeatmapIcon = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <rect x="4"  y="4"  width="9" height="9" rx="2" fill="currentColor" opacity="0.95"/>
    <rect x="15" y="4"  width="9" height="9" rx="2" fill="currentColor" opacity="0.45"/>
    <rect x="26" y="4"  width="9" height="9" rx="2" fill="currentColor" opacity="0.7"/>
    <rect x="37" y="4"  width="7" height="9" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="4"  y="15" width="9" height="9" rx="2" fill="currentColor" opacity="0.4"/>
    <rect x="15" y="15" width="9" height="9" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="26" y="15" width="9" height="9" rx="2" fill="currentColor" opacity="0.6"/>
    <rect x="37" y="15" width="7" height="9" rx="2" fill="currentColor" opacity="0.85"/>
    <rect x="4"  y="26" width="9" height="9" rx="2" fill="currentColor" opacity="0.7"/>
    <rect x="15" y="26" width="9" height="9" rx="2" fill="currentColor" opacity="0.35"/>
    <rect x="26" y="26" width="9" height="9" rx="2" fill="currentColor" opacity="1"/>
    <rect x="37" y="26" width="7" height="9" rx="2" fill="currentColor" opacity="0.55"/>
    <rect x="4"  y="37" width="9" height="7" rx="2" fill="currentColor" opacity="0.55"/>
    <rect x="15" y="37" width="9" height="7" rx="2" fill="currentColor" opacity="0.8"/>
    <rect x="26" y="37" width="9" height="7" rx="2" fill="currentColor" opacity="0.4"/>
    <rect x="37" y="37" width="7" height="7" rx="2" fill="currentColor" opacity="0.95"/>
  </svg>
);

const TrendsIcon = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <polyline points="4,38 14,28 22,32 32,16 44,10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4"  cy="38" r="2.5" fill="currentColor"/>
    <circle cx="14" cy="28" r="2.5" fill="currentColor"/>
    <circle cx="22" cy="32" r="2.5" fill="currentColor"/>
    <circle cx="32" cy="16" r="2.5" fill="currentColor"/>
    <circle cx="44" cy="10" r="2.5" fill="currentColor"/>
    <line x1="4" y1="42" x2="44" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>
  </svg>
);

const RecommendIcon = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="17" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <path d="M19 16 L22 19 L29 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 32 C14 28 18 26 24 26 C30 26 34 28 34 32 L34 38 C34 40 32 42 30 42 L18 42 C16 42 14 40 14 38 Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <circle cx="39" cy="9"  r="3.5" fill="currentColor" opacity="0.35"/>
    <circle cx="43" cy="20" r="2.5" fill="currentColor" opacity="0.6"/>
    <circle cx="37" cy="26" r="2"   fill="currentColor" opacity="0.25"/>
  </svg>
);

const ScopeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

const RouteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 18 C5 12 10 12 10 8 C10 5.8 11.8 4 14 4 C16.2 4 18 5.8 18 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="18" cy="8" r="2" fill="currentColor" />
    <circle cx="5" cy="18" r="2" fill="currentColor" />
  </svg>
);

const CompareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="6" height="12" rx="1.8" fill="currentColor" opacity="0.9" />
    <rect x="14" y="4" width="6" height="14" rx="1.8" fill="currentColor" opacity="0.45" />
  </svg>
);

const CompassIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M15.5 8.5 L13.4 13.4 L8.5 15.5 L10.6 10.6 Z" fill="currentColor" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 4 V8 M16 4 V8 M4 10 H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const PulseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 12 H7 L10 7 L14 17 L17 12 H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FlowInsightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 7 H11 M13 7 H19 M5 17 H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="7" r="2" fill="currentColor" />
  </svg>
);

const FilterInsightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 6 H20 L13.5 13.2 V18 L10.5 19.6 V13.2 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const AlertInsightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 5 L20 19 H4 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10 V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.2" fill="currentColor" />
  </svg>
);

const DETAIL_ICONS = [ScopeIcon, RouteIcon, CompareIcon, CompassIcon, CalendarIcon, PulseIcon];
const INSIGHT_ICONS = [FlowInsightIcon, FilterInsightIcon, AlertInsightIcon];

const DASHBOARD_TILES = [
  {
    Icon: PipelineIcon,
    title: 'Job Search Pipeline',
    badge: 'Flow Analytics',
    summaryPoints: [
      'Track funnel momentum',
      'Spot drop-off stages fast',
      'Compare movement across stages',
    ],
    detailPoints: [
      'Follow application volume from submission to offer',
      'See which roles or platforms move candidates forward more reliably',
      'Understand where momentum breaks before conversion drops further',
    ],
    insights: [
      'Sankey diagram maps the full application journey',
      'Filter by role, company, job type & platform',
      'Pinpoint the highest drop-off stages at a glance',
    ],
    outcome: 'Best for diagnosing where your process is leaking opportunities and where to focus first.',
    to: '/pipeline',
    cta: 'View Pipeline',
    c1: '#3b82f6',
    c2: '#6366f1',
  },
  {
    Icon: HeatmapIcon,
    title: 'Role Heatmap',
    badge: 'Conversion Rates',
    summaryPoints: [
      'Compare role performance',
      'Find strong conversion pockets',
      'Flag weak target areas',
    ],
    detailPoints: [
      'Scan categories quickly instead of reading a stage-by-stage funnel',
      'See where your targeting is aligned and where it may be too broad',
      'Prioritise stronger-fit roles before spending effort on weaker ones',
    ],
    insights: [
      'Compare conversion rates across every role at a glance',
      'Identify hot spots where candidates advance most',
      'Spot cold zones that need a strategy shift',
    ],
    outcome: 'Best for deciding which roles deserve more attention and which ones need a different positioning strategy.',
    to: '/heatmap',
    cta: 'View Heatmap',
    c1: '#06b6d4',
    c2: '#3b82f6',
  },
  {
    Icon: TrendsIcon,
    title: 'Yearly Trends',
    badge: 'Market Patterns',
    summaryPoints: [
      'Track patterns over time',
      'See stronger application windows',
      'Separate trends from noise',
    ],
    detailPoints: [
      'Compare activity, interviews, and offers across different periods',
      'Tell whether a slowdown is seasonal or part of a bigger pattern',
      'Use timing signals to plan when to apply more aggressively',
    ],
    insights: [
      'Track application volume & offer rates by year',
      'Detect seasonal peaks in hiring activity',
      'Benchmark your pipeline against historical norms',
    ],
    outcome: 'Best for understanding timing, seasonality, and whether your recent performance is part of a broader trend.',
    to: '/trends',
    cta: 'View Trends',
    c1: '#10b981',
    c2: '#06b6d4',
  },
];

const STRATEGY_FEATURE = {
  Icon: RecommendIcon,
  title: 'Personalized Strategy',
  badge: 'AI Guidance',
  summaryPoints: [
    'Turn insight into action',
    'Get role-specific guidance',
    'Refine your search focus',
  ],
  detailPoints: [
    'Translate dashboard patterns into concrete next steps',
    'Decide what to prioritise based on your own search data',
    'Turn broad analytics into a narrower, more actionable plan',
  ],
  highlights: [
    'Resume-aware recommendations grounded in your experience',
    'Role, platform, and focus suggestions based on observed patterns',
    'Action-oriented guidance instead of another exploratory chart',
  ],
  outcome: 'Best for converting analysis into a practical search plan you can act on immediately.',
  to: '/recommendations',
  cta: 'Build My Strategy',
  c1: '#8b5cf6',
  c2: '#ec4899',
};

const STATS = [
  { value: '3',    label: 'Analytical Views' },
  { value: '360°', label: 'Funnel Coverage' },
  { value: 'AI',   label: 'Strategy Engine' },
];

const HOW_STEPS = [
  { num: '01', label: 'Connect Data',  desc: 'Application records power the three analytical views across the platform.' },
  { num: '02', label: 'Explore',       desc: 'Filter, compare, and drill into what matters most to you.' },
  { num: '03', label: 'Understand',    desc: 'Identify patterns, drop-offs, and high-conversion opportunities.' },
  { num: '04', label: 'Act',           desc: 'Get an AI strategy built on insights from your own data.' },
];

const Home = () => {
  useEffect(() => { pingBackend(); }, []);

  return (
  <div className="home-wrapper">

    {/* ── Hero ── */}
    <section className="home-hero">
      <div className="hero-orbs" aria-hidden="true">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      <div className="home-hero-body">
        <div className="home-hero-text">
          <span className="hero-eyebrow">Hiring Intelligence Platform</span>
          <h1 className="hero-headline">
            Understand Every Step of<br />
            <span className="hero-highlight">Your Hiring Journey</span>
          </h1>
          <p className="hero-subtext">
            Hire Sight turns raw application data into clear, actionable visuals — so you can see
            where opportunities are won, where they're lost, and exactly what to do next.
          </p>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="hero-preview-card hero-preview-image-card">
            <img
              className="home-hero-image"
              src="/home_img.png"
              alt="Hire Sight dashboard preview"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </section>

    {/* ── Stats strip ── */}
    <div className="home-stats-strip">
      {STATS.map(({ value, label }) => (
        <div key={label} className="home-stat-item">
          <span className="home-stat-value">{value}</span>
          <span className="home-stat-label">{label}</span>
        </div>
      ))}
    </div>

    {/* ── Section heading ── */}
    <div className="home-section-head home-dashboards-head">
      <h2 className="home-section-title">Explore the Dashboards</h2>
      <p className="home-section-sub">
        These three analytical views answer different questions about performance, conversion, and timing in your job search.
      </p>
      <div className="home-dashboards-divider" aria-hidden="true" />
    </div>

    {/* ── Tiles ── */}
    <div className="home-tiles">
      {DASHBOARD_TILES.map(({ Icon, title, badge, summaryPoints, detailPoints, insights, outcome, to, cta, c1, c2 }) => (
        <Link key={to} to={to} className="home-tile-link">
          <article className="home-tile">
            <div className="home-tile-main">
              <div className="home-tile-visual">
                <div className="home-tile-icon" style={{ color: c1, background: `${c1}1a` }}>
                  <Icon />
                </div>
                <span className="home-tile-badge" style={{ color: c1, background: `${c1}18` }}>
                  {badge}
                </span>
              </div>
              <div className="home-tile-copy">
                <div className="home-tile-top">
                  <div className="home-tile-title-wrap" style={{ borderColor: `${c1}2e` }}>
                    <h3 className="home-tile-title" style={{ color: c1 }}>{title}</h3>
                  </div>
                  <div className="home-tile-summary">
                    {summaryPoints.map((point) => (
                      <span key={point} className="home-tile-summary-pill">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="home-tile-matrix">
                  <div className="home-tile-panel">
                    <span className="home-tile-section-label" style={{ color: c1 }}>Why this matters</span>
                    <ul className="home-tile-detail-list">
                      {detailPoints.map((point, index) => {
                        const ItemIcon = DETAIL_ICONS[index % DETAIL_ICONS.length];
                        return (
                          <li key={point}>
                            <span className="home-tile-item-icon" style={{ color: c1, background: `${c1}16` }}>
                              <ItemIcon />
                            </span>
                            <span className="home-tile-item-text">{point}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="home-tile-panel">
                    <span className="home-tile-section-label" style={{ color: c1 }}>What you can explore</span>
                    <ul className="home-tile-insights">
                      {insights.map((ins, index) => {
                        const ItemIcon = INSIGHT_ICONS[index % INSIGHT_ICONS.length];
                        return (
                          <li key={ins}>
                            <span className="home-tile-item-icon" style={{ color: c1, background: `${c1}16` }}>
                              <ItemIcon />
                            </span>
                            <span className="home-tile-item-text">{ins}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
                <div
                  className="home-tile-outcome"
                  style={{ borderColor: `${c1}36`, background: `${c1}10` }}
                >
                  <span className="home-tile-outcome-label" style={{ color: c1 }}>
                    Best used for
                  </span>
                  <p className="home-tile-outcome-text">{outcome}</p>
                </div>
                <div
                  className="home-tile-cta"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                >
                  {cta} <span className="tile-cta-arrow">→</span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>

    <section className="home-strategy-feature">
      <div className="home-section-head home-strategy-head">
        <h2 className="home-section-title">From Insight to Action</h2>
        <p className="home-section-sub">
          Personalised Strategy sits apart from the dashboards and helps you turn what you learned into a concrete next move.
        </p>
        <div className="home-strategy-divider" aria-hidden="true" />
      </div>

      <Link to={STRATEGY_FEATURE.to} className="strategy-feature-link">
        <article className="strategy-feature-card">
          <div className="strategy-feature-glow" aria-hidden="true" />
          <div className="strategy-feature-main">
            <div className="strategy-feature-visual">
              <div
                className="strategy-feature-icon"
                style={{ color: STRATEGY_FEATURE.c1, background: `${STRATEGY_FEATURE.c1}20` }}
              >
                <STRATEGY_FEATURE.Icon />
              </div>
              <span
                className="strategy-feature-badge"
                style={{ color: STRATEGY_FEATURE.c1, background: `${STRATEGY_FEATURE.c1}18` }}
              >
                {STRATEGY_FEATURE.badge}
              </span>
            </div>

            <div className="strategy-feature-copy">
              <div
                className="strategy-feature-title-wrap"
                style={{ borderColor: `${STRATEGY_FEATURE.c1}2e` }}
              >
                <h3 className="strategy-feature-title" style={{ color: STRATEGY_FEATURE.c1 }}>
                  {STRATEGY_FEATURE.title}
                </h3>
              </div>
              <div className="strategy-feature-summary">
                {STRATEGY_FEATURE.summaryPoints.map((point) => (
                  <span key={point} className="strategy-feature-summary-pill">
                    {point}
                  </span>
                ))}
              </div>
              <div className="strategy-feature-matrix">
                <div className="strategy-feature-panel">
                  <span className="strategy-feature-section-label" style={{ color: STRATEGY_FEATURE.c1 }}>
                    Why this matters
                  </span>
                  <ul className="strategy-feature-list">
                    {STRATEGY_FEATURE.detailPoints.map((item, index) => {
                      const ItemIcon = DETAIL_ICONS[index % DETAIL_ICONS.length];
                      return (
                        <li key={item}>
                          <span
                            className="strategy-feature-item-icon"
                            style={{ color: STRATEGY_FEATURE.c1, background: `${STRATEGY_FEATURE.c1}16` }}
                          >
                            <ItemIcon />
                          </span>
                          <span className="strategy-feature-item-text">{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="strategy-feature-panel">
                  <span className="strategy-feature-section-label" style={{ color: STRATEGY_FEATURE.c1 }}>
                    What you get
                  </span>
                  <ul className="strategy-feature-list">
                    {STRATEGY_FEATURE.highlights.map((item, index) => {
                      const ItemIcon = INSIGHT_ICONS[index % INSIGHT_ICONS.length];
                      return (
                        <li key={item}>
                          <span
                            className="strategy-feature-item-icon"
                            style={{ color: STRATEGY_FEATURE.c1, background: `${STRATEGY_FEATURE.c1}16` }}
                          >
                            <ItemIcon />
                          </span>
                          <span className="strategy-feature-item-text">{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div
                className="strategy-feature-outcome"
                style={{ borderColor: `${STRATEGY_FEATURE.c1}36`, background: `${STRATEGY_FEATURE.c1}10` }}
              >
                <span className="strategy-feature-section-label" style={{ color: STRATEGY_FEATURE.c1 }}>
                  Best used for
                </span>
                <p className="strategy-feature-outcome-text">{STRATEGY_FEATURE.outcome}</p>
              </div>
              <div
                className="strategy-feature-cta"
                style={{
                  background: `linear-gradient(135deg, ${STRATEGY_FEATURE.c1}, ${STRATEGY_FEATURE.c2})`,
                }}
              >
                {STRATEGY_FEATURE.cta} <span className="tile-cta-arrow">→</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </section>

    {/* ── How it works ── */}
    <section className="home-how">
      <h2 className="home-section-title" style={{ textAlign: 'center' }}>How It Works</h2>
      <div className="home-how-steps">
        {HOW_STEPS.map(({ num, label, desc }, i) => (
          <React.Fragment key={num}>
            <div className="home-step">
              <div className="home-step-num">{num}</div>
              <div className="home-step-label">{label}</div>
              <p className="home-step-desc">{desc}</p>
            </div>
            {i < HOW_STEPS.length - 1 && (
              <div className="home-step-arrow" aria-hidden="true">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>

  </div>
  );
};

export default Home;
