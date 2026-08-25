import MetricCard from "../components/MetricCard.jsx";
import React from "react";
export default function FacultyDashboard() {
  return (
    <section>
      <h1>Faculty Dashboard</h1>
      <div className="metric-grid">
        <MetricCard label="Pending Requests" value="0" />
        <MetricCard label="Approved Requests" value="0" />
        <MetricCard label="Currently Borrowed" value="0" />
        <MetricCard label="Overdue Items" value="0" />
      </div>
    </section>
  );
}

