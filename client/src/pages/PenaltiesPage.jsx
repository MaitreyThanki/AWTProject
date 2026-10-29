import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api/http.js";
import { AlertCircle, CheckCircle, ShieldAlert, Download, Search } from "lucide-react";
import { exportToCsv } from "../utils/exportCsv.js";
import { useToast } from "../components/Toast.jsx";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

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
      addToast("Failed to load penalty records", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(penaltyId, newStatus) {
    try {
      await api.patch(`/penalties/${penaltyId}/status`, { status: newStatus });
      addToast(`Penalty record marked as ${newStatus}`, "success");
      fetchPenalties();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update penalty status", "error");
    }
  }

  const filteredPenalties = useMemo(() => {
    if (!search.trim()) return penalties;
    const q = search.toLowerCase();
    return penalties.filter((p) => {
      const sName = (p.studentId?.name || "").toLowerCase();
      const sRoll = (p.studentId?.enrollmentNumber || "").toLowerCase();
      const reason = (p.reason || "").toLowerCase();
      const item = (p.itemId?.name || "").toLowerCase();
      return sName.includes(q) || sRoll.includes(q) || reason.includes(q) || item.includes(q);
    });
  }, [penalties, search]);

  function handleExportCsv() {
    exportToCsv("Laboratory_Penalty_Ledger", [
      { key: "penaltyId", label: "Penalty ID", formatter: (_, r) => String(r._id) },
      { key: "studentName", label: "Student Name", formatter: (_, r) => r.studentId?.name || "N/A" },
      { key: "rollNo", label: "Roll / Enrollment No", formatter: (_, r) => r.studentId?.enrollmentNumber || "N/A" },
      { key: "item", label: "Component", formatter: (_, r) => r.itemId?.name || "N/A" },
      { key: "reason", label: "Reason", formatter: (_, r) => r.reason || "N/A" },
      { key: "amount", label: "Amount (INR)", formatter: (_, r) => `INR ${r.amount}` },
      { key: "status", label: "Status" }
    ], filteredPenalties);
    addToast("Exported penalty ledger as CSV", "success");
  }

  const totalOutstanding = penalties
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Penalties & Violations Ledger</h1>
          <p className="dashboard-subtitle">
            Late return surcharges, equipment damage recovery, and fee clearances
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Download CSV ledger">
            <Download size={16} /> Export CSV
          </button>
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

      {/* Search Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div className="search-bar" style={{ minWidth: "260px", margin: 0 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search student, roll number, item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading penalty records...</div>
      ) : filteredPenalties.length === 0 ? (
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
              {filteredPenalties.map((p) => (
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
