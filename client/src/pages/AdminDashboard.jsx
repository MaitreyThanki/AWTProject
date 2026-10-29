import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { api } from "../api/http.js";
import { ShieldCheck, UserPlus, History, AlertTriangle, FileText } from "lucide-react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalInventory: 0,
    totalStock: 0,
    availableItems: 0,
    borrowedItems: 0,
    pendingApprovals: 0,
    overdueReturns: 0,
    activePenalties: 0,
    totalStudents: 0
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [requests, setRequests] = useState([]);
  const [overrideLogs, setOverrideLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Override Modal
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState("approved");
  const [overrideReason, setOverrideReason] = useState("");

  // Faculty Account Modal
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyName, setFacultyName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [generatedCreds, setGeneratedCreds] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  async function loadAdminData() {
    setLoading(true);
    try {
      const dashRes = await api.get("/dashboard");
      if (dashRes.data?.metrics) setMetrics(dashRes.data.metrics);

      if (activeTab === "requests" || activeTab === "overview") {
        const reqRes = await api.get("/requests");
        setRequests(reqRes.data || []);
      }

      if (activeTab === "overrides") {
        const logsRes = await api.get("/approvals/overrides");
        setOverrideLogs(logsRes.data || []);
      }
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyOverride(e) {
    e.preventDefault();
    if (!overrideTarget || !overrideReason.trim()) return;

    try {
      await api.post(`/approvals/${overrideTarget._id}/override`, {
        updatedStatus: overrideStatus,
        reason: overrideReason.trim()
      });
      setMessage(`Decision overridden for Request #${overrideTarget._id}. Action logged.`);
      setOverrideTarget(null);
      setOverrideReason("");
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Override failed");
    }
  }

  async function handleCreateFaculty(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/faculty/create", {
        name: facultyName,
        email: facultyEmail
      });
      setGeneratedCreds(res.data);
      setFacultyName("");
      setFacultyEmail("");
      setMessage("Faculty account created and temporary password generated!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create faculty account");
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Administrator Panel</h1>
          <p className="dashboard-subtitle">Complete control over Makers Lab 2 & Design IoT Lab</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-primary" onClick={() => setShowFacultyModal(true)}>
            <UserPlus size={16} /> Register Faculty
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Total Equipment Items" value={metrics.totalInventory} />
        <MetricCard label="Total Physical Units" value={metrics.totalStock} />
        <MetricCard label="Currently Borrowed" value={metrics.borrowedItems} />
        <MetricCard label="Pending Approvals" value={metrics.pendingApprovals} />
        <MetricCard label="Overdue Items" value={metrics.overdueReturns} />
        <MetricCard label="Active Penalties" value={metrics.activePenalties} />
      </div>

      {message && (
        <div style={{ background: "#DDE9D8", color: "#385A2E", padding: "12px", borderRadius: "8px", margin: "20px 0" }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="tab-group" style={{ marginTop: "28px" }}>
        <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          Recent Activity
        </button>
        <button className={`tab-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>
          All Borrow Records & Overrides
        </button>
        <button className={`tab-btn ${activeTab === "overrides" ? "active" : ""}`} onClick={() => setActiveTab("overrides")}>
          Audit Override Logs
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading data...</div>
      ) : activeTab === "overrides" ? (
        <div className="table-wrap">
          <h2>Administrative Override History (Audit Trail)</h2>
          {overrideLogs.length === 0 ? (
            <div className="empty-state">No overrides recorded yet.</div>
          ) : (
            <table className="table" style={{ marginTop: "12px" }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Request ID</th>
                  <th>Transition</th>
                  <th>Mandatory Reason</th>
                </tr>
              </thead>
              <tbody>
                {overrideLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.overrideDate || log.createdAt).toLocaleString()}</td>
                    <td>{log.adminName || log.adminId?.name || "Admin"}</td>
                    <td>#{String(log.requestId?._id || log.requestId).slice(-6)}</td>
                    <td>
                      <span className="badge badge-warning">{log.previousStatus}</span>
                      {" → "}
                      <span className="badge badge-success">{log.updatedStatus}</span>
                    </td>
                    <td><em>"{log.reason}"</em></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Lab & Items</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.studentId?.name || "Student"}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {r.studentId?.email} • {r.studentId?.enrollmentNumber || "N/A"}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{r.labId?.name || "Lab"}</span>
                    <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                      {r.items?.map((it) => `${it.itemName} (${it.quantityRequested}x)`).join(", ")}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {r.expectedReturnDate ? new Date(r.expectedReturnDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td>
                    <span className={`history-status status-${(r.status || "pending").toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                      onClick={() => {
                        setOverrideTarget(r);
                        setOverrideStatus(r.status === "rejected" ? "approved" : "rejected");
                      }}
                    >
                      <ShieldCheck size={14} /> Override Decision
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Override Modal */}
      {overrideTarget && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Admin Decision Override</h2>
              <button className="close-btn" onClick={() => setOverrideTarget(null)}>✕</button>
            </div>

            <form onSubmit={handleApplyOverride}>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "0 0 16px" }}>
                Overriding decision for Request #{overrideTarget._id} (Current: <strong>{overrideTarget.status}</strong>).
                All actions are permanently logged in the audit trail.
              </p>

              <label className="form-label">
                New Target Status
                <select
                  className="form-select"
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                >
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="returned">Marked Returned</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label className="form-label">
                Mandatory Override Reason
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  placeholder="State academic / administrative justification for this override..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOverrideTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Faculty Modal */}
      {showFacultyModal && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Register Faculty Member</h2>
              <button className="close-btn" onClick={() => { setShowFacultyModal(false); setGeneratedCreds(null); }}>✕</button>
            </div>

            {generatedCreds ? (
              <div style={{ background: "#DDE9D8", padding: "16px", borderRadius: "8px" }}>
                <h3 style={{ color: "#385A2E", margin: "0 0 8px" }}>Faculty Account Created!</h3>
                <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                  <strong>Email:</strong> {generatedCreds.faculty?.email}
                </p>
                <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                  <strong>Temporary Password:</strong> <code>{generatedCreds.temporaryPassword}</code>
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "8px" }}>
                  Password has been sent via email. The faculty member must change their password upon first login.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "12px" }}
                  onClick={() => { setShowFacultyModal(false); setGeneratedCreds(null); }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateFaculty}>
                <label className="form-label">
                  Faculty Name
                  <input
                    className="form-control"
                    required
                    placeholder="Prof. / Dr. Name"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                  />
                </label>

                <label className="form-label">
                  University Email
                  <input
                    className="form-control"
                    type="email"
                    required
                    placeholder="faculty@university.edu"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                  />
                </label>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFacultyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Generate Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
