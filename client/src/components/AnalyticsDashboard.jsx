import React, { useEffect, useState } from "react";
import { api } from "../api/http.js";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Boxes,
  Layers,
  Sparkles
} from "lucide-react";

// Curated earthy-modern palette matching the design system
const PALETTE = [
  "#5C381E", // Accent Brown
  "#8E5830", // Warm Terracotta
  "#C07D48", // Ochre Clay
  "#4A6B56", // Sage Green
  "#73937E", // Pale Olive
  "#A3704C", // Sandstone
  "#6B5344", // Deep Taupe
  "#D99B6A"  // Warm Caramel
];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load visual analytics. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw size={28} className="spinner" />
        <p>Generating real-time lab equipment insights & charts...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <AlertTriangle size={32} color="var(--danger)" />
        <p>{error || "No analytics data available"}</p>
        <button className="btn btn-primary" onClick={loadAnalytics} style={{ marginTop: "12px" }}>
          Retry
        </button>
      </div>
    );
  }

  const { categories = [], requestStatuses = {}, topBorrowed = [], stockHealth = {}, recentEvents = [] } = data;

  // Prepare Donut Chart Slices
  const totalCategoryStock = categories.reduce((sum, c) => sum + (c.totalQuantity || 0), 0) || 1;
  let cumulativeAngle = 0;
  const donutSlices = categories.map((cat, i) => {
    const value = cat.totalQuantity || 0;
    const percentage = (value / totalCategoryStock) * 100;
    const angle = (value / totalCategoryStock) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      name: cat.name,
      value,
      percentage: percentage.toFixed(1),
      color: PALETTE[i % PALETTE.length],
      startAngle,
      angle
    };
  });

  // Calculate SVG arc paths for donut chart (center 120, 120, outer radius 90, inner radius 55)
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  function describeArc(x, y, innerRadius, outerRadius, startAngle, endAngle) {
    // Avoid full 360 degree arc rendering bug in SVG by clamping endAngle
    const safeEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
    const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, safeEnd);
    const startInner = polarToCartesian(x, y, innerRadius, safeEnd);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);
    const largeArcFlag = safeEnd - startAngle <= 180 ? "0" : "1";

    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
      "L", startInner.x, startInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 0, endInner.x, endInner.y,
      "Z"
    ].join(" ");
  }

  // Max value for top borrowed items
  const maxBorrowedCount = Math.max(...topBorrowed.map((t) => t.count), 1);

  // Status breakdown array
  const statusList = [
    { key: "pending", label: "Pending Approval", count: requestStatuses.pending || 0, color: "var(--muted)" },
    { key: "approved", label: "Approved (Ready)", count: requestStatuses.approved || 0, color: "#2B5278" },
    { key: "issued", label: "Currently Issued", count: requestStatuses.issued || 0, color: "#8E5830" },
    { key: "returned", label: "Returned", count: requestStatuses.returned || 0, color: "#2E6930" },
    { key: "overdue", label: "Overdue", count: requestStatuses.overdue || 0, color: "#A83232" }
  ];
  const maxStatusCount = Math.max(...statusList.map((s) => s.count), 1);

  return (
    <div className="analytics-container">
      {/* Top Banner */}
      <div className="analytics-header-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="analytics-icon-badge">
            <Sparkles size={24} color="var(--white)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", color: "var(--text)" }}>
              Laboratory Inventory & Requisition Analytics
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "var(--muted)" }}>
              Real-time hardware distribution, borrow frequency, and equipment reliability telemetry
            </p>
          </div>
        </div>
        <button
          className="btn btn-outline"
          onClick={loadAnalytics}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}
          title="Refresh analytics telemetry"
        >
          <RefreshCw size={15} /> Refresh Telemetry
        </button>
      </div>

      {/* Stock Health Metric Strip */}
      <div className="stock-health-strip">
        <div className="health-card in-stock">
          <div className="health-card-top">
            <span className="health-label">Healthy Stock (&gt; 5)</span>
            <CheckCircle2 size={18} color="#2E6930" />
          </div>
          <div className="health-val">{stockHealth.inStock || 0}</div>
          <span className="health-sub">Assets with optimal buffer</span>
        </div>

        <div className="health-card low-stock">
          <div className="health-card-top">
            <span className="health-label">Low Stock (1 - 5)</span>
            <AlertTriangle size={18} color="#9C6B1F" />
          </div>
          <div className="health-val">{stockHealth.lowStock || 0}</div>
          <span className="health-sub">Replenishment recommended</span>
        </div>

        <div className="health-card out-stock">
          <div className="health-card-top">
            <span className="health-label">Stock Depleted (0)</span>
            <AlertTriangle size={18} color="#A83232" />
          </div>
          <div className="health-val">{stockHealth.outOfStock || 0}</div>
          <span className="health-sub">Unavailable for borrow</span>
        </div>

        <div className="health-card damaged-stock">
          <div className="health-card-top">
            <span className="health-label">Damaged / Repair</span>
            <Activity size={18} color="#684273" />
          </div>
          <div className="health-val">{stockHealth.damaged || 0}</div>
          <span className="health-sub">Quarantined for maintenance</span>
        </div>
      </div>

      {/* Two Column Grid for Main Visual Charts */}
      <div className="analytics-grid">
        {/* Chart 1: Donut Category Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PieChart size={18} color="var(--accent)" />
              <h3>Hardware Category Allocation</h3>
            </div>
            <span className="badge-pill">{categories.length} Categories</span>
          </div>

          <div className="donut-chart-wrapper">
            <svg
              viewBox="0 0 240 240"
              className="donut-svg"
              style={{ width: "220px", height: "220px" }}
            >
              <g transform="translate(0, 0)">
                {donutSlices.map((slice, i) => {
                  const isHovered = activeCategoryIndex === i;
                  return (
                    <path
                      key={slice.name}
                      d={describeArc(120, 120, isHovered ? 52 : 55, isHovered ? 95 : 90, slice.startAngle, slice.startAngle + slice.angle)}
                      fill={slice.color}
                      stroke="var(--white)"
                      strokeWidth="2"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        opacity: activeCategoryIndex !== null && !isHovered ? 0.6 : 1
                      }}
                      onMouseEnter={() => setActiveCategoryIndex(i)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                    >
                      <title>{`${slice.name}: ${slice.value} units (${slice.percentage}%)`}</title>
                    </path>
                  );
                })}
              </g>
              {/* Central Text */}
              <circle cx="120" cy="120" r="50" fill="var(--card)" />
              <text x="120" y="115" textAnchor="middle" className="donut-center-num">
                {activeCategoryIndex !== null
                  ? donutSlices[activeCategoryIndex].value
                  : totalCategoryStock}
              </text>
              <text x="120" y="133" textAnchor="middle" className="donut-center-label">
                {activeCategoryIndex !== null
                  ? donutSlices[activeCategoryIndex].name
                  : "Total Units"}
              </text>
            </svg>

            {/* Legend Grid */}
            <div className="donut-legend">
              {donutSlices.map((slice, i) => (
                <div
                  key={slice.name}
                  className={`legend-item ${activeCategoryIndex === i ? "highlighted" : ""}`}
                  onMouseEnter={() => setActiveCategoryIndex(i)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  <span className="legend-dot" style={{ backgroundColor: slice.color }} />
                  <span className="legend-name" title={slice.name}>{slice.name}</span>
                  <span className="legend-val">{slice.value} u ({slice.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Top Borrowed Components Bar Chart */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="var(--accent)" />
              <h3>Most In-Demand Lab Hardware</h3>
            </div>
            <span className="badge-pill">Top Requisitioned</span>
          </div>

          <div className="top-borrowed-list">
            {topBorrowed.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                No borrowing requisitions recorded yet.
              </p>
            ) : (
              topBorrowed.map((item, idx) => {
                const pct = Math.round((item.count / maxBorrowedCount) * 100);
                return (
                  <div className="borrow-bar-row" key={item.name}>
                    <div className="borrow-bar-label">
                      <span className="borrow-rank">#{idx + 1}</span>
                      <strong className="borrow-name" title={item.name}>{item.name}</strong>
                      <span className="borrow-count">{item.count} borrowed</span>
                    </div>
                    <div className="borrow-track">
                      <div
                        className="borrow-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: idx === 0 ? "var(--accent)" : PALETTE[idx % PALETTE.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Requisition Status Funnel & Live Ticker */}
      <div className="analytics-grid" style={{ marginTop: "20px" }}>
        {/* Requisition Status Funnel */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={18} color="var(--accent)" />
              <h3>Requisition Lifecycle Breakdown</h3>
            </div>
            <span className="badge-pill">Status Distribution</span>
          </div>

          <div className="status-bars-container">
            {statusList.map((st) => {
              const pct = maxStatusCount > 0 ? Math.round((st.count / maxStatusCount) * 100) : 0;
              return (
                <div key={st.key} className="status-bar-item">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                      {st.label}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: st.color }}>
                      {st.count} requests
                    </span>
                  </div>
                  <div className="status-track">
                    <div
                      className="status-fill"
                      style={{
                        width: `${Math.max(pct, st.count > 0 ? 5 : 0)}%`,
                        backgroundColor: st.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Lab Activity Stream */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="var(--accent)" />
              <h3>Live Lab Equipment Stream</h3>
            </div>
            <span className="badge-pill" style={{ backgroundColor: "#285420", color: "#fff" }}>
              ● Live Feed
            </span>
          </div>

          <div className="activity-stream">
            {recentEvents.length === 0 ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                No recent transactions recorded.
              </p>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="stream-event">
                  <div className="stream-bullet" />
                  <div className="stream-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                        {evt.studentName} ({evt.enrollment})
                      </strong>
                      <span className={`status-badge-sm status-${(evt.status || "").toLowerCase()}`}>
                        {evt.status}
                      </span>
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      {evt.itemsSummary}
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", opacity: 0.8 }}>
                      {new Date(evt.timestamp).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
