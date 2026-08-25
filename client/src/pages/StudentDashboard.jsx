import MetricCard from "../components/MetricCard.jsx";
import React from "react";
export default function StudentDashboard() {
  return (
    <section>
      <h1>Student Dashboard</h1>
      <div className="metric-grid">
        <MetricCard label="Active Requests" value="0" />
        <MetricCard label="Approved Items" value="0" />
        <MetricCard label="Due Soon" value="0" />
        <MetricCard label="Penalties" value="0" />
      </div>
    </section>
  );
}

