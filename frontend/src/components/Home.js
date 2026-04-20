import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const TILES = [
  {
    Icon: PipelineIcon,
    title: 'Job Search Pipeline',
    badge: 'Flow Analytics',
    description:
      'See exactly where applications stall or succeed across every stage of your hiring funnel — from submission to offer.',
    insights: [
      'Sankey diagram maps the full application journey',
      'Filter by role, company, job type & platform',
      'Pinpoint the highest drop-off stages at a glance',
    ],
    to: '/pipeline',
    cta: 'View Pipeline',
    c1: '#3b82f6',
    c2: '#6366f1',
  },
  {
    Icon: HeatmapIcon,
    title: 'Role Heatmap',
    badge: 'Conversion Rates',
    description:
      'A colour-coded matrix that reveals which roles and stages have the strongest — and weakest — conversion performance.',
    insights: [
      'Compare conversion rates across every role at a glance',
      'Identify hot spots where candidates advance most',
      'Spot cold zones that need a strategy shift',
    ],
    to: '/heatmap',
    cta: 'View Heatmap',
    c1: '#06b6d4',
    c2: '#3b82f6',
  },
  {
    Icon: TrendsIcon,
    title: 'Yearly Trends',
    badge: 'Market Patterns',
    description:
      'Understand how hiring activity has evolved year over year and identify the best windows to apply.',
    insights: [
      'Track application volume & offer rates by year',
      'Detect seasonal peaks in hiring activity',
      'Benchmark your pipeline against historical norms',
    ],
    to: '/trends',
    cta: 'View Trends',
    c1: '#10b981',
    c2: '#06b6d4',
  },
  {
    Icon: RecommendIcon,
    title: 'Personalized Strategy',
    badge: 'AI-Powered',
    description:
      'Share your profile and receive LLM-generated recommendations tailored to your experience, target roles, and the data.',
    insights: [
      'Personalised action plan built from your resume',
      'Targeted role & platform recommendations',
      'Before / after comparison of your search approach',
    ],
    to: '/recommendations',
    cta: 'Get My Strategy',
    c1: '#8b5cf6',
    c2: '#ec4899',
  },
];

const STATS = [
  { value: '4',    label: 'Interactive Views' },
  { value: '360°', label: 'Funnel Coverage' },
  { value: 'AI',   label: 'Strategy Engine' },
  { value: 'Live', label: 'Data Insights' },
];

const HOW_STEPS = [
  { num: '01', label: 'Connect Data',  desc: 'Application records power every visualization in real time.' },
  { num: '02', label: 'Explore',       desc: 'Filter, compare, and drill into what matters most to you.' },
  { num: '03', label: 'Understand',    desc: 'Identify patterns, drop-offs, and high-conversion opportunities.' },
  { num: '04', label: 'Act',           desc: 'Get an AI strategy built on insights from your own data.' },
];

const Home = () => (
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
          <div className="hero-ctas">
            <Link to="/pipeline" className="btn btn-future hero-btn-primary">
              Explore the Pipeline
            </Link>
            <Link to="/recommendations" className="btn btn-outline-future hero-btn-secondary">
              Get My Strategy
            </Link>
          </div>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="hero-preview-card">
            <div className="hpc-label">Applications by Stage</div>
            <div className="hpc-bars">
              {[90, 62, 45, 28, 14].map((h, i) => (
                <div key={i} className="hpc-bar-wrap">
                  <div className="hpc-bar" style={{ height: `${h}%` }} />
                  <div className="hpc-bar-val">{h}%</div>
                </div>
              ))}
            </div>
            <div className="hpc-labels">
              {['Apply', 'Screen', 'Interview', 'Final', 'Offer'].map(l => (
                <span key={l}>{l}</span>
              ))}
            </div>
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
    <div className="home-section-head">
      <h2 className="home-section-title">Explore the Dashboards</h2>
      <p className="home-section-sub">
        Each view is purpose-built to answer a different question about your job search.
      </p>
    </div>

    {/* ── Tiles ── */}
    <div className="home-tiles">
      {TILES.map(({ Icon, title, badge, description, insights, to, cta, c1, c2 }) => (
        <Link key={to} to={to} className="home-tile-link">
          <article className="home-tile">
            <div className="home-tile-top">
              <div className="home-tile-icon" style={{ color: c1, background: `${c1}1a` }}>
                <Icon />
              </div>
              <span className="home-tile-badge" style={{ color: c1, background: `${c1}18` }}>
                {badge}
              </span>
            </div>
            <h3 className="home-tile-title">{title}</h3>
            <p className="home-tile-desc">{description}</p>
            <ul className="home-tile-insights">
              {insights.map(ins => (
                <li key={ins}>
                  <span
                    className="home-tile-dot"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                  />
                  {ins}
                </li>
              ))}
            </ul>
            <div
              className="home-tile-cta"
              style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
            >
              {cta} <span className="tile-cta-arrow">→</span>
            </div>
          </article>
        </Link>
      ))}
    </div>

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

export default Home;
