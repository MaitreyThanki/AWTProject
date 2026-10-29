import React, { useEffect, useState } from "react";
import { api } from "../api/http.js";
import { AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isPrivileged = user?.role === "admin" || user?.role === "faculty";

  useEffect(() => {
    fetchPenalties();
  }, []);

  async function fetchPenalties() {
    setLoading(true);
    try {
      const res = await api.get("/penalties");
      setPenalties(res.data || []);
    } catch (err) {
      console.error("Failed to fetch penalties:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(penaltyId, newStatus) {
    try {
      await api.patch(`/penalties/${penaltyId}/status`, { status: newStatus });
      setMessage(`Penalty marked as ${newStatus}`);
      fetchPenalties();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update penalty status");
    }
  }

  const totalOutstanding = penalties
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Penalties & Violations</h1>
          <p className="dashboard-subtitle">
            Late returns, damaged items, or lost equipment fee tracking
          </p>
        </div>
      </div>

      <div className="metric-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span>Active Pending Penalties</span>
          <strong>{penalties.filter((p) => p.status === "pending").length}</strong>
        </div>
        <div className="metric-card">
          <span>Total Outstanding Dues</span>
          <strong style={{ color: totalOutstanding > 0 ? "#8A3324" : "var(--accent)" }}>
            ₹{totalOutstanding}
          </strong>
        </div>
        <div className="metric-card">
          <span>Cleared / Paid Penalties</span>
          <strong>{penalties.filter((p) => p.status === "paid").length}</strong>
        </div>
      </div>

      {message && (
        <div style={{ background: "#DDE9D8", color: "#385A2E", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading penalty records...</div>
      ) : penalties.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={32} color="#385A2E" />
          <p>No penalties recorded. All equipment returned in good standing.</p>
        </div>
      ) : (
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Violation Reason</th>
                <th>Associated Item</th>
                <th>Amount</th>
                <th>Status</th>
                {isPrivileged && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {penalties.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.studentId?.name || "Student"}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {p.studentId?.email} • {p.studentId?.enrollmentNumber || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div>{p.reason}</div>
                    {p.remarks && (
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Note: {p.remarks}</div>
                    )}
                  </td>
                  <td>{p.itemId?.name || "Lab Item"}</td>
                  <td>
                    <strong style={{ color: p.status === "pending" ? "#8A3324" : "inherit" }}>
                      ₹{p.amount}
                    </strong>
                  </td>
                  <td>
                    <span className={`history-status status-${p.status === "paid" ? "returned" : p.status === "pending" ? "overdue" : "approved"}`}>
                      {p.status}
                    </span>
                  </td>
                  {isPrivileged && (
                    <td>
                      {p.status === "pending" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn btn-success"
                            style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                            onClick={() => handleStatusUpdate(p._id, "paid")}
                          >
                            Mark Paid
                          </button>
                          {user?.role === "admin" && (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                              onClick={() => handleStatusUpdate(p._id, "waived")}
                            >
                              Waive
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
