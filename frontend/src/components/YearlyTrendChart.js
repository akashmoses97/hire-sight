/**
 * Yearly hiring trend dashboard.
 *
 * This component renders either a true time-series view or a snapshot-first
 * market composition view depending on the coverage of the underlying dataset.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const numberFormatter = new Intl.NumberFormat('en-US');
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 0,
});

const FILTER_LABELS = {
  job_title: 'Role',
  company: 'Company',
  location: 'Location',
  job_type: 'Job Type',
  experience_bucket: 'Experience',
  salary_bucket: 'Salary',
  remote_only: 'Remote Only',
};

const JOB_TYPE_COLORS = {
  Onsite: '#2563eb',
  Hybrid: '#14b8a6',
  Remote: '#8b5cf6',
  'Location-Based': '#64748b',
};

const formatCurrency = (value) => {
  if (value == null) return 'Unavailable';
  return compactCurrencyFormatter.format(value);
};

const formatCount = (value) => numberFormatter.format(value || 0);

const formatPercent = (value) => {
  if (value == null) return 'n/a';
  return percentFormatter.format(value);
};

const formatDateRange = (dateRange) => {
  if (!dateRange?.start || !dateRange?.end) return 'Date coverage unavailable';

  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  const dateFormatter =
    start.getFullYear() === end.getFullYear()
      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
      : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `${dateFormatter.format(start)} - ${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end)}`;
};

const buildMetricCards = (summary) => [
  {
    label: 'Total postings',
    value: formatCount(summary?.total_postings),
    detail: `${summary?.distinct_companies || 0} distinct companies`,
    accent: 'var(--accent)',
  },
  {
    label: 'Average salary',
    value: formatCurrency(summary?.average_salary),
    detail:
      summary?.average_salary == null
        ? 'This dataset does not provide reliable salary coverage'
        : 'Mean listed midpoint',
    accent: '#f59e0b',
  },
  {
    label: 'Median salary',
    value: formatCurrency(summary?.median_salary),
    detail:
      summary?.median_salary == null
        ? 'Salary median unavailable for this source'
        : 'More stable central tendency',
    accent: '#14b8a6',
  },
  {
    label: 'Median experience',
    value: summary?.median_experience != null ? `${summary.median_experience} yrs` : 'Unavailable',
    detail: 'Required years across filtered postings',
    accent: '#8b5cf6',
  },
  {
    label: 'Remote share',
    value: formatPercent(summary?.remote_share),
    detail: summary?.top_job_type ? `${summary.top_job_type.job_type || summary.top_job_type.name} leads the mix` : 'No dominant job type',
    accent: '#ec4899',
  },
  {
    label: 'Top company',
    value: summary?.top_company?.company || 'Unavailable',
    detail: summary?.top_company ? `${formatCount(summary.top_company.count)} postings` : 'No filtered company leader',
    accent: '#0ea5e9',
  },
];

const renderBreakdownRows = (items, itemKey, labelKey, valueFormatter, secondaryFormatter) =>
  items.map((item) => (
    <div key={item[itemKey]} className="trend-breakdown-row">
      <div className="trend-breakdown-meta">
        <div className="trend-breakdown-label">{item[labelKey]}</div>
        <div className="trend-breakdown-secondary">{secondaryFormatter(item)}</div>
      </div>
      <div className="trend-breakdown-bar-wrap">
        <div className="trend-breakdown-bar-track">
          <div
            className="trend-breakdown-bar-fill"
            style={{ width: `${Math.max((item.share || 0) * 100, 6)}%` }}
          />
        </div>
        <div className="trend-breakdown-value">{valueFormatter(item)}</div>
      </div>
    </div>
  ));

const renderEmptyBreakdown = (message) => (
  <div className="trend-empty">
    <p>{message}</p>
  </div>
);

const RecentMarketWeightedPanel = ({ summary, yearlyBreakdown, monthlyBreakdown }) => {
  const latestYear = summary?.latest_year;
  const dominantShare = summary?.recent_market_share || 0;
  const leadMonth = monthlyBreakdown.reduce(
    (best, month) => (month.job_postings > (best?.job_postings || 0) ? month : best),
    null
  );
  const maxMonthlyPostings = Math.max(...monthlyBreakdown.map((month) => month.job_postings), 1);
  const sparseYears = yearlyBreakdown.filter(
    (item) => item.year !== latestYear && item.job_postings < 250
  );

  return (
    <section className="futuristic-card trend-weighted-panel">
      <div className="trend-panel-header">
        <div>
          <h3>Recent-Market Weighted View</h3>
          <p>
            This dataset is strongest as a read of the recent market. Older years are retained as
            context, but the newest year carries most of the sample.
          </p>
        </div>
      </div>

      <div className="trend-weighted-grid">
        <div className="trend-weighted-card trend-weighted-card-primary">
          <span className="trend-mini-label">Latest year share</span>
          <strong>{formatPercent(dominantShare)}</strong>
          <span>
            {latestYear} contributes {formatCount(yearlyBreakdown.find((item) => item.year === latestYear)?.job_postings)}{' '}
            of {formatCount(summary?.total_postings)} postings.
          </span>
        </div>
        <div className="trend-weighted-card">
          <span className="trend-mini-label">Lead month</span>
          <strong>{leadMonth?.month_label || 'n/a'}</strong>
          <span>{leadMonth ? `${formatCount(leadMonth.job_postings)} postings` : 'No month data'}</span>
        </div>
        <div className="trend-weighted-card">
          <span className="trend-mini-label">Sparse context years</span>
          <strong>{formatCount(sparseYears.length)}</strong>
          <span>
            {sparseYears.length > 0
              ? sparseYears.map((item) => item.year).join(', ')
              : 'Every year has a workable sample'}
          </span>
        </div>
      </div>

      <div className="trend-monthly-list">
        {monthlyBreakdown.map((month) => (
          <div key={month.month} className="trend-monthly-row">
            <div className="trend-monthly-month">{month.month_label}</div>
            <div className="trend-monthly-bar-wrap">
              <div className="trend-monthly-bar-track">
                <div
                  className="trend-monthly-bar-fill"
                  style={{ width: `${(month.job_postings / maxMonthlyPostings) * 100}%` }}
                />
              </div>
            </div>
            <div className="trend-monthly-stats">
              <strong>{formatCount(month.job_postings)}</strong>
              <span>{formatCurrency(month.average_salary)}</span>
              <span>{formatPercent(month.remote_share)} remote</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SnapshotVisualization = ({ summary, jobTypes, topRoles, topLocations }) => {
  const totalShare = jobTypes.reduce((acc, item) => acc + (item.share || 0), 0) || 1;
  const leadLocation = topLocations[0];

  return (
    <div className="trend-snapshot-layout">
      <div className="trend-snapshot-block trend-snapshot-hero">
        <div className="trend-snapshot-kicker">Snapshot Read</div>
        <h4>Software job market composition</h4>
        <p>
          This source is a one-day scrape, so the useful signal is composition:
          which work modes dominate, which titles appear most often, and where the
          current hiring concentration is highest.
        </p>
        <div className="trend-snapshot-pills">
          <span className="trend-snapshot-pill">
            Coverage: {formatDateRange(summary?.date_range)}
          </span>
          <span className="trend-snapshot-pill">
            Source: {summary?.dataset_source || 'n/a'}
          </span>
          <span className="trend-snapshot-pill">
            Companies: {formatCount(summary?.distinct_companies)}
          </span>
        </div>
      </div>

      <div className="trend-snapshot-block">
        <div className="trend-snapshot-section-title">Work mode split</div>
        <div className="trend-snapshot-stack">
          {jobTypes.map((item) => (
            <div
              key={item.job_type}
              className="trend-snapshot-segment"
              style={{
                width: `${((item.share || 0) / totalShare) * 100}%`,
                background: JOB_TYPE_COLORS[item.job_type] || '#334155',
              }}
              title={`${item.job_type}: ${formatCount(item.count)} postings`}
            />
          ))}
        </div>
        <div className="trend-snapshot-legend">
          {jobTypes.map((item) => (
            <div key={item.job_type} className="trend-snapshot-legend-item">
              <span
                className="trend-snapshot-legend-dot"
                style={{ background: JOB_TYPE_COLORS[item.job_type] || '#334155' }}
              />
              <span>{item.job_type}</span>
              <strong>{formatPercent(item.share)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="trend-snapshot-block">
        <div className="trend-snapshot-section-title">Role concentration</div>
        <div className="trend-role-bars">
          {topRoles.slice(0, 6).map((role, index) => (
            <div key={role.job_title} className="trend-role-bar-row">
              <div className="trend-role-rank">{index + 1}</div>
              <div className="trend-role-copy">
                <div className="trend-role-name">{role.job_title}</div>
                <div className="trend-role-meta">
                  {formatCount(role.count)} postings · {formatPercent(role.share)}
                </div>
              </div>
              <div className="trend-role-track">
                <div
                  className="trend-role-fill"
                  style={{ width: `${Math.max((role.share || 0) * 100 * 3.5, 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="trend-snapshot-grid">
        <div className="trend-snapshot-mini-card">
          <span className="trend-mini-label">Top role</span>
          <strong>{summary?.top_role?.job_title || 'Unavailable'}</strong>
          <span>{summary?.top_role ? `${formatCount(summary.top_role.count)} postings` : 'No dominant role'}</span>
        </div>
        <div className="trend-snapshot-mini-card">
          <span className="trend-mini-label">Top company</span>
          <strong>{summary?.top_company?.company || 'Unavailable'}</strong>
          <span>{summary?.top_company ? `${formatCount(summary.top_company.count)} postings` : 'No dominant company'}</span>
        </div>
        <div className="trend-snapshot-mini-card">
          <span className="trend-mini-label">Lead location</span>
          <strong>{leadLocation?.location || 'Unavailable'}</strong>
          <span>{leadLocation ? `${formatCount(leadLocation.count)} postings` : 'No lead geography'}</span>
        </div>
      </div>
    </div>
  );
};

const SnapshotInsightPanel = ({ summary, topLocations }) => {
  const leadLocation = topLocations[0];
  const salarySignal =
    summary?.average_salary == null && summary?.median_salary == null ? 'Sparse' : 'Usable';
  const timeSeriesDepth = summary?.has_multiple_years ? 'Multi-year' : 'Single snapshot';

  return (
    <>
      <div className="trend-side-stack">
        <div className="trend-side-stat">
          <span className="trend-side-label">Coverage window</span>
          <strong>
            {summary?.coverage_window_days
              ? `${formatCount(summary.coverage_window_days)} day${summary.coverage_window_days === 1 ? '' : 's'}`
              : 'n/a'}
          </strong>
        </div>
        <div className="trend-side-stat">
          <span className="trend-side-label">Time-series depth</span>
          <strong>{timeSeriesDepth}</strong>
        </div>
        <div className="trend-side-stat">
          <span className="trend-side-label">Salary signal</span>
          <strong>{salarySignal}</strong>
        </div>
        <div className="trend-side-stat">
          <span className="trend-side-label">Remote share</span>
          <strong>{formatPercent(summary?.remote_share)}</strong>
        </div>
      </div>

      <div className="trend-context-card">
        <div className="trend-context-kicker">What this view supports</div>
        <ul className="trend-context-list">
          <li>Role and company concentration</li>
          <li>Remote, hybrid, and onsite mix</li>
          <li>Current-market geography</li>
        </ul>
      </div>

      <div className="trend-context-card">
        <div className="trend-context-kicker">Leading signals</div>
        <div className="trend-signal-list">
          <div className="trend-signal-row">
            <span>Top work mode</span>
            <strong>
              {summary?.top_job_type?.job_type || summary?.top_job_type?.name || 'Unavailable'}
            </strong>
          </div>
          <div className="trend-signal-row">
            <span>Top role</span>
            <strong>{summary?.top_role?.job_title || 'Unavailable'}</strong>
          </div>
          <div className="trend-signal-row">
            <span>Top company</span>
            <strong>{summary?.top_company?.company || 'Unavailable'}</strong>
          </div>
          <div className="trend-signal-row">
            <span>Lead location</span>
            <strong>{leadLocation?.location || 'Unavailable'}</strong>
          </div>
        </div>
      </div>
    </>
  );
};

const YearlyTrendChart = ({ data, filters }) => {
  const svgRef = useRef(null);
  const [themeMode, setThemeMode] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  );

  const summary = data?.summary || {};
  const metricCards = buildMetricCards(summary);
  const breakdown = data?.yearly_breakdown || [];
  const jobTypes = data?.job_type_distribution || [];
  const topRoles = data?.top_roles || [];
  const topLocations = data?.top_locations || [];
  const topCompanies = data?.top_companies || [];
  const latestYearMonthlyBreakdown = data?.latest_year_monthly_breakdown || [];
  const snapshotMode = summary.view_mode === 'snapshot';
  const showTrendChart = !snapshotMode && breakdown.length > 1;
  const recentMarketWeighted = !snapshotMode && (summary.recent_market_share || 0) >= 0.6;
  const appliedFilters = Object.entries(filters || {}).filter(([key, value]) => {
    if (key === 'top_n') return false;
    if (typeof value === 'boolean') return value;
    return value && value !== 'All';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeMode(document.documentElement.getAttribute('data-theme') || 'dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showTrendChart) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return undefined;
    }

    const records = data?.yearly_breakdown || [];
    if (!svgRef.current || records.length === 0) {
      return undefined;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const vizText = rootStyles.getPropertyValue('--viz-text').trim() || '#0f172a';
    const vizAxis = rootStyles.getPropertyValue('--viz-axis').trim() || '#64748b';
    const surface = rootStyles.getPropertyValue('--viz-surface').trim() || '#f8fafc';

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 880;
    const height = 360;
    const margin = { top: 26, right: 90, bottom: 58, left: 72 };
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'trend-bar-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '100%')
      .attr('y2', '0%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#2563eb');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#22d3ee');

    const x = d3
      .scaleBand()
      .domain(records.map((item) => String(item.year)))
      .range([margin.left, width - margin.right])
      .padding(0.32);

    const maxPostings = d3.max(records, (item) => item.job_postings) || 1;
    const y = d3
      .scaleLinear()
      .domain([0, maxPostings * 1.2])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const salaryValues = records
      .map((item) => item.average_salary)
      .filter((value) => value != null && Number.isFinite(value));

    const salaryScale =
      salaryValues.length > 0
        ? d3
            .scaleLinear()
            .domain([0, (d3.max(salaryValues) || 1) * 1.15])
            .nice()
            .range([height - margin.bottom, margin.top])
        : null;

    svg
      .append('g')
      .attr('class', 'trend-grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat(''))
      .call((axis) => axis.select('.domain').remove())
      .call((axis) => axis.selectAll('.tick line').attr('stroke', vizAxis).attr('opacity', 0.16));

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.selectAll('.domain, .tick line').attr('stroke', vizAxis))
      .call((axis) =>
        axis.selectAll('.tick text').attr('fill', vizText).style('font-weight', 700).style('font-size', '12px')
      );

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .call((axis) => axis.selectAll('.domain, .tick line').attr('stroke', vizAxis))
      .call((axis) =>
        axis.selectAll('.tick text').attr('fill', vizText).style('font-weight', 600)
      );

    const bars = svg
      .append('g')
      .selectAll('g')
      .data(records)
      .join('g')
      .attr('transform', (item) => `translate(${x(String(item.year))},0)`);

    bars
      .append('rect')
      .attr('x', 0)
      .attr('y', (item) => y(item.job_postings))
      .attr('width', x.bandwidth())
      .attr('height', (item) => y(0) - y(item.job_postings))
      .attr('rx', 14)
      .attr('fill', 'url(#trend-bar-gradient)')
      .attr('stroke', 'rgba(255,255,255,0.22)')
      .style('filter', 'drop-shadow(0 12px 20px rgba(15, 23, 42, 0.18))');

    bars
      .append('text')
      .attr('x', x.bandwidth() / 2)
      .attr('y', (item) => y(item.job_postings) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', vizText)
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .text((item) => formatCount(item.job_postings));

    if (salaryScale) {
      svg
        .append('g')
        .attr('transform', `translate(${width - margin.right},0)`)
        .call(d3.axisRight(salaryScale).ticks(5).tickFormat((value) => `$${Math.round(value / 1000)}k`))
        .call((axis) => axis.selectAll('.domain, .tick line').attr('stroke', vizAxis))
        .call((axis) =>
          axis.selectAll('.tick text').attr('fill', vizText).style('font-weight', 600)
        );

      const line = d3
        .line()
        .defined((item) => item.average_salary != null)
        .x((item) => x(String(item.year)) + x.bandwidth() / 2)
        .y((item) => salaryScale(item.average_salary));

      svg
        .append('path')
        .datum(records)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', line);

      svg
        .append('g')
        .selectAll('circle')
        .data(records.filter((item) => item.average_salary != null))
        .join('circle')
        .attr('cx', (item) => x(String(item.year)) + x.bandwidth() / 2)
        .attr('cy', (item) => salaryScale(item.average_salary))
        .attr('r', 5.5)
        .attr('fill', surface)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 3);
    }

    const legend = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top - 8})`);
    legend.append('rect').attr('width', 12).attr('height', 12).attr('rx', 3).attr('fill', '#2563eb');
    legend
      .append('text')
      .attr('x', 18)
      .attr('y', 10)
      .attr('fill', vizText)
      .style('font-weight', 700)
      .style('font-size', '12px')
      .text('Job postings');

    if (salaryScale) {
      legend
        .append('circle')
        .attr('cx', 124)
        .attr('cy', 6)
        .attr('r', 5)
        .attr('fill', surface)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 3);
      legend
        .append('text')
        .attr('x', 138)
        .attr('y', 10)
        .attr('fill', vizText)
        .style('font-weight', 700)
        .style('font-size', '12px')
        .text('Average salary');
    }

    return undefined;
  }, [data, showTrendChart, themeMode]);

  if (!data) {
    return <div>Loading yearly trend data...</div>;
  }

  return (
    <div className="trend-dashboard">
      {appliedFilters.length > 0 ? (
        <div className="trend-active-filters">
          <span className="trend-active-label">Active filters</span>
          <div className="trend-pill-group">
            {appliedFilters.map(([key, value]) => (
              <span key={key} className="trend-filter-pill">
                {FILTER_LABELS[key]}: {value === true ? 'Yes' : value}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {recentMarketWeighted ? (
        <div className="trend-coverage-banner trend-coverage-banner-weighted">
          <strong>Recent-market weighted:</strong> {formatPercent(summary.recent_market_share)} of the
          filtered sample comes from {summary.latest_year}. Use the yearly chart as historical context
          and the monthly view below as the clearest read of the current database.
        </div>
      ) : null}

      {snapshotMode ? (
        <div className="trend-coverage-banner">
          <strong>Snapshot mode:</strong> the imported software-job dataset covers{' '}
          {formatDateRange(summary.date_range)} only, so this page now emphasizes market composition
          instead of pretending there is a real time trend where none exists.
        </div>
      ) : null}

      <div className="trend-metrics-grid">
        {metricCards.map((card) => (
          <div key={card.label} className="trend-metric-card futuristic-card">
            <div className="trend-metric-kicker" style={{ color: card.accent }}>
              {card.label}
            </div>
            <div className="trend-metric-value">{card.value}</div>
            <div className="trend-metric-detail">{card.detail}</div>
          </div>
        ))}
      </div>

      <div className="trend-main-grid">
        <section className="yearly-trend-container futuristic-card trend-chart-panel">
          <div className="trend-panel-header">
            <div>
              <h3>{showTrendChart ? 'Historical context by year' : 'Market composition snapshot'}</h3>
              <p>
                {showTrendChart
                  ? recentMarketWeighted
                    ? 'A yearly context chart for a dataset that is dominated by the most recent market window.'
                    : 'Posting volume and salary movement across real time periods.'
                  : 'A snapshot-focused view of work mode split, dominant roles, and concentration in the imported software-job market dataset.'}
              </p>
            </div>
          </div>

          {showTrendChart ? (
            <svg ref={svgRef} className="trend-chart-svg" aria-label="Yearly hiring trends chart" />
          ) : (
            <SnapshotVisualization
              summary={summary}
              jobTypes={jobTypes}
              topRoles={topRoles}
              topLocations={topLocations}
            />
          )}
        </section>

        <section className="futuristic-card trend-side-panel">
          <div className="trend-panel-header">
            <div>
              <h3>{snapshotMode ? 'Snapshot reliability read' : 'Filtered market summary'}</h3>
              <p>
                {snapshotMode
                  ? 'This source behaves like a market snapshot, so the key question is what signal is reliable.'
                  : 'High-signal facts for the currently selected market slice.'}
              </p>
            </div>
          </div>
          {snapshotMode ? (
            <SnapshotInsightPanel summary={summary} topLocations={topLocations} />
          ) : (
            <>
              <div className="trend-side-stack">
                <div className="trend-side-stat">
                  <span className="trend-side-label">Dataset source</span>
                  <strong>{summary.dataset_source || 'n/a'}</strong>
                </div>
                <div className="trend-side-stat">
                  <span className="trend-side-label">Coverage window</span>
                  <strong>{formatDateRange(summary.date_range)}</strong>
                </div>
                <div className="trend-side-stat">
                  <span className="trend-side-label">Latest year share</span>
                  <strong>{formatPercent(summary.recent_market_share)}</strong>
                </div>
                <div className="trend-side-stat">
                  <span className="trend-side-label">Highest-paying role</span>
                  <strong>{summary.highest_paying_role?.job_title || 'Unavailable'}</strong>
                </div>
                <div className="trend-side-stat">
                  <span className="trend-side-label">Highest-paying salary</span>
                  <strong>{formatCurrency(summary.highest_paying_role?.average_salary)}</strong>
                </div>
              </div>

              <div className="trend-year-list">
                {breakdown.length > 0 ? (
                  breakdown.map((item) => (
                    <div key={item.year} className="trend-year-card">
                      <div className="trend-year-row">
                        <span className="trend-year-chip">{item.year}</span>
                        <span className="trend-year-growth">
                          Share of remote work {formatPercent(item.remote_share)}
                        </span>
                      </div>
                      <div className="trend-year-stats">
                        <span>{formatCount(item.job_postings)} postings</span>
                        <span>{formatCurrency(item.average_salary)} avg salary</span>
                        <span>
                          {item.median_experience != null
                            ? `${item.median_experience} yrs median exp`
                            : 'Experience n/a'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  renderEmptyBreakdown('No time-series rows match the current filters.')
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {showTrendChart && recentMarketWeighted ? (
        latestYearMonthlyBreakdown.length > 0 ? (
          <RecentMarketWeightedPanel
            summary={summary}
            yearlyBreakdown={breakdown}
            monthlyBreakdown={latestYearMonthlyBreakdown}
          />
        ) : (
          <section className="futuristic-card trend-weighted-panel">
            {renderEmptyBreakdown('No monthly breakdown is available for the latest year.')}
          </section>
        )
      ) : null}

      <div className="trend-secondary-grid trend-secondary-grid-4">
        <section className="futuristic-card trend-breakdown-card">
          <div className="trend-panel-header">
            <div>
              <h3>Job type mix</h3>
              <p>How posting formats are distributed in the filtered result set.</p>
            </div>
          </div>
          <div className="trend-breakdown-list">
            {jobTypes.length > 0
              ? renderBreakdownRows(
                  jobTypes,
                  'job_type',
                  'job_type',
                  (item) => `${formatPercent(item.share)} · ${formatCount(item.count)}`,
                  (item) => `${item.count} postings`
                )
              : renderEmptyBreakdown('No job type data matches the current filters.')}
          </div>
        </section>

        <section className="futuristic-card trend-breakdown-card">
          <div className="trend-panel-header">
            <div>
              <h3>Top roles</h3>
              <p>The roles showing up most often in the current slice.</p>
            </div>
          </div>
          <div className="trend-breakdown-list">
            {topRoles.length > 0
              ? renderBreakdownRows(
                  topRoles,
                  'job_title',
                  'job_title',
                  (item) => `${formatPercent(item.share)} · ${formatCount(item.count)}`,
                  (item) =>
                    item.average_salary != null
                      ? `${formatCurrency(item.average_salary)} avg salary`
                      : 'Salary unavailable'
                )
              : renderEmptyBreakdown('No roles match the current filters.')}
          </div>
        </section>

        <section className="futuristic-card trend-breakdown-card">
          <div className="trend-panel-header">
            <div>
              <h3>Top companies</h3>
              <p>Which employers dominate the filtered market view.</p>
            </div>
          </div>
          <div className="trend-breakdown-list">
            {topCompanies.length > 0
              ? renderBreakdownRows(
                  topCompanies,
                  'company',
                  'company',
                  (item) => `${formatPercent(item.share)} · ${formatCount(item.count)}`,
                  (item) =>
                    item.average_salary != null
                      ? `${formatCurrency(item.average_salary)} avg salary`
                      : 'Salary unavailable'
                )
              : renderEmptyBreakdown('No companies match the current filters.')}
          </div>
        </section>

        <section className="futuristic-card trend-breakdown-card">
          <div className="trend-panel-header">
            <div>
              <h3>Top locations</h3>
              <p>Where the filtered postings are concentrated geographically.</p>
            </div>
          </div>
          <div className="trend-breakdown-list">
            {topLocations.length > 0
              ? renderBreakdownRows(
                  topLocations,
                  'location',
                  'location',
                  (item) => `${formatPercent(item.share)} · ${formatCount(item.count)}`,
                  (item) => `${item.count} postings`
                )
              : renderEmptyBreakdown('No locations match the current filters.')}
          </div>
        </section>
      </div>
    </div>
  );
};

export default YearlyTrendChart;
