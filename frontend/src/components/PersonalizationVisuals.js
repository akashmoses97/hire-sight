import React from 'react';
import '../styles/PersonalizationVisuals.css';

const STAGES = [
  { key: 'applications', label: 'Applications', color: '#3b82f6' },
  { key: 'callbacks', label: 'Callbacks', color: '#06b6d4' },
  { key: 'interviews', label: 'Interviews', color: '#14b8a6' },
  { key: 'offers', label: 'Offers', color: '#22c55e' },
];

const RATE_LABELS = [
  { key: 'app_to_callback', label: 'App → Callback' },
  { key: 'callback_to_interview', label: 'Callback → Interview' },
  { key: 'interview_to_offer', label: 'Interview → Offer' },
];

const pct = (value) => `${((value || 0) * 100).toFixed(1)}%`;

const toRateMap = (metrics = {}) => {
  const apps = Number(metrics.applications || 0);
  const callbacks = Number(metrics.callbacks || 0);
  const interviews = Number(metrics.interviews || 0);
  const offers = Number(metrics.offers || 0);

  return {
    app_to_callback: apps > 0 ? callbacks / apps : 0,
    callback_to_interview: callbacks > 0 ? interviews / callbacks : 0,
    interview_to_offer: interviews > 0 ? offers / interviews : 0,
  };
};

const PersonalizationVisuals = ({
  userMetrics,
  predictedOutcomes,
  benchmarkMetrics,
  timingAnalysis,
}) => {
  const before = userMetrics || {};
  const after = predictedOutcomes || {};

  const stageMax = Math.max(
    1,
    ...STAGES.map((s) => Number(before[s.key] || 0)),
    ...STAGES.map((s) => Number(after[s.key] || 0))
  );

  const beforeRates = before.conversion_rates || toRateMap(before);
  const afterRates = toRateMap(after);
  const marketRates = {
    app_to_callback: Number(benchmarkMetrics?.avg_callback_rate || 0),
    callback_to_interview: Number(benchmarkMetrics?.avg_interview_rate || 0),
    interview_to_offer: Number(benchmarkMetrics?.avg_offer_rate || 0),
  };

  const monthlyVolume = timingAnalysis?.monthly_application_volume || [];
  const maxMonthApplications = Math.max(1, ...monthlyVolume.map((m) => Number(m.applications || 0)));
  const showSeasonPulse = Boolean(timingAnalysis?.has_year_round_trend);
  const firstMonth = monthlyVolume.length > 0 ? monthlyVolume[0].year_month : null;
  const lastMonth = monthlyVolume.length > 0 ? monthlyVolume[monthlyVolume.length - 1].year_month : null;
  const totalApplications = monthlyVolume.reduce((sum, point) => sum + Number(point.applications || 0), 0);

  return (
    <section className="viz-panel" aria-label="Personalized visual analytics">
      <div className="viz-title-wrap">
        <h3 className="viz-title">Data Story From Your Pipeline</h3>
        <p className="viz-subtitle">
          Visual comparison of your baseline, predicted improvement, and hiring activity seasonality.
        </p>
      </div>

      <div className="viz-grid">
        <article className="viz-card">
          <h4>Pipeline Lift by Stage</h4>
          <div className="viz-legend">
            <span className="legend-dot before" /> Baseline
            <span className="legend-dot after" /> Predicted
          </div>
          {STAGES.map((stage) => {
            const beforeValue = Number(before[stage.key] || 0);
            const afterValue = Number(after[stage.key] || 0);
            const beforeWidth = (beforeValue / stageMax) * 100;
            const afterWidth = (afterValue / stageMax) * 100;

            return (
              <div className="stage-row" key={stage.key}>
                <div className="stage-head">
                  <span>{stage.label}</span>
                  <span className="stage-delta">
                    {afterValue - beforeValue >= 0 ? '+' : ''}
                    {afterValue - beforeValue}
                  </span>
                </div>
                <div className="bar-track">
                  <div className="bar-before" style={{ width: `${beforeWidth}%` }} />
                  <div
                    className="bar-after"
                    style={{ width: `${afterWidth}%`, backgroundColor: stage.color }}
                  />
                </div>
                <div className="bar-values">
                  <span>{beforeValue.toLocaleString()}</span>
                  <span>{afterValue.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </article>

        <article className="viz-card">
          <h4>Conversion Efficiency Radar</h4>
          <p className="small-note">Three-stage conversion quality compared with market.</p>
          <div className="rate-grid">
            {RATE_LABELS.map((rate) => {
              const a = Number(beforeRates[rate.key] || 0);
              const b = Number(afterRates[rate.key] || 0);
              const c = Number(marketRates[rate.key] || 0);
              const top = Math.max(0.01, a, b, c);

              return (
                <div className="rate-row" key={rate.key}>
                  <div className="rate-label">{rate.label}</div>
                  <div className="triple-bars">
                    <div className="triple-bar before" style={{ width: `${(a / top) * 100}%` }}>
                      <span>{pct(a)}</span>
                    </div>
                    <div className="triple-bar after" style={{ width: `${(b / top) * 100}%` }}>
                      <span>{pct(b)}</span>
                    </div>
                    <div className="triple-bar market" style={{ width: `${(c / top) * 100}%` }}>
                      <span>{pct(c)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rate-legend">
            <span><i className="sw before" />Baseline</span>
            <span><i className="sw after" />Predicted</span>
            <span><i className="sw market" />Market</span>
          </div>
        </article>

        {showSeasonPulse && (
        <article className="viz-card viz-card-wide">
          <h4>Hiring Season Pulse</h4>
          <p className="small-note">Monthly application volume from the dataset (for context, not your personal timeline).</p>
          {monthlyVolume.length > 0 && (
            <p className="small-note" style={{ marginTop: '-0.25rem' }}>
              Coverage: {firstMonth} to {lastMonth} • Total applications: {totalApplications}
            </p>
          )}
          <div className="month-bars">
            {monthlyVolume.length === 0 && <div className="empty-mini">Monthly data not available.</div>}
            {monthlyVolume.map((point) => {
              const applications = Number(point.applications || 0);
              const heightPx = Math.max(16, Math.round((applications / maxMonthApplications) * 150));
              return (
                <div
                  className="month-col"
                  key={point.year_month}
                  title={`${point.year_month}: ${applications} applications`}
                >
                  <div className="month-bar" style={{ height: `${heightPx}px` }} />
                  <div className="month-label">{point.year_month}</div>
                  <div className="month-value">{applications}</div>
                </div>
              );
            })}
          </div>
          <div className="season-inline">
            <span>
              Peak: {(timingAnalysis?.peak_months || []).map((m) => m.month).join(', ') || 'N/A'}
            </span>
            <span>
              Slow: {(timingAnalysis?.slow_months || []).map((m) => m.month).join(', ') || 'N/A'}
            </span>
          </div>
        </article>
        )}
      </div>
    </section>
  );
};

export default PersonalizationVisuals;
