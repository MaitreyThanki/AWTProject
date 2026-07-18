import MetricCard from "../components/MetricCard.jsx";

export default function AdminDashboard() {
  return (
    <section>
      <h1>Admin Dashboard</h1>
      <div className="metric-grid">
        <MetricCard label="Total Inventory" value="0" />
        <MetricCard label="Pending Approvals" value="0" />
        <MetricCard label="Overdue Returns" value="0" />
        <MetricCard label="Active Penalties" value="0" />
      </div>
    </section>
  );
}

