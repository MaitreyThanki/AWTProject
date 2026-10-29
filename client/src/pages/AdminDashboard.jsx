import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { api } from "../api/http.js";
import { ShieldCheck, UserPlus, History, AlertTriangle, FileText, Download, Printer, CheckCircle, QrCode, BarChart3, Zap } from "lucide-react";
import GatePassModal from "../components/GatePassModal.jsx";
import CounterScannerModal from "../components/CounterScannerModal.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import { useToast } from "../components/Toast.jsx";

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
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const { addToast } = useToast();


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
      addToast("Failed to load admin metrics", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleExportOverrides() {
    exportToCsv("Admin_Override_Audit_Logs", [
      { key: "requestId", label: "Request ID", formatter: (_, r) => String(r.requestId?._id || r.requestId || "") },
      { key: "adminEmail", label: "Admin Account", formatter: (_, r) => r.adminId?.email || "System Admin" },
      { key: "prevStatus", label: "Previous Status", formatter: (_, r) => r.previousStatus || "N/A" },
      { key: "updatedStatus", label: "New Status", formatter: (_, r) => r.updatedStatus || "N/A" },
      { key: "reason", label: "Mandatory Reason", formatter: (_, r) => r.reason || "N/A" },
      { key: "timestamp", label: "Date & Time", formatter: (_, r) => new Date(r.createdAt || r.overrideDate).toLocaleString() }
    ], overrideLogs);
    addToast("Exported override logs as CSV", "success");
  }

  function handleExportRequests() {
    exportToCsv("Campus_Requisitions_Master", [
      { key: "requestId", label: "Request ID", formatter: (_, r) => String(r._id) },
      { key: "studentName", label: "Student", formatter: (_, r) => r.studentId?.name || "N/A" },
      { key: "labName", label: "Facility", formatter: (_, r) => r.labId?.name || "N/A" },
      { key: "status", label: "Status" },
      { key: "expectedReturn", label: "Due Date", formatter: (_, r) => r.expectedReturnDate ? new Date(r.expectedReturnDate).toLocaleDateString() : "N/A" }
    ], requests);
    addToast("Exported master request records as CSV", "success");
  }

  async function handleApplyOverride(e) {
    e.preventDefault();
    if (!overrideTarget || !overrideReason.trim()) return;

    try {
      await api.post(`/approvals/${overrideTarget._id}/override`, {
        updatedStatus: overrideStatus,
        reason: overrideReason.trim()
      });
      addToast(`Decision overridden for Request #${String(overrideTarget._id).slice(-6)}. Action logged.`, "success");
      setOverrideTarget(null);
      setOverrideReason("");
      loadAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || "Override failed", "error");
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
      addToast("Faculty account created successfully!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create faculty", "error");
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Administrator Control Center</h1>
          <p className="dashboard-subtitle">Institutional governance, decision overrides, and faculty account provisioning</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowScannerModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            title="Open Counter Scanner for fast handover & returns"
          >
            <QrCode size={16} /> ⚡ Counter Quick Scanner
          </button>

          {activeTab === "overrides" ? (
            <button className="btn btn-outline" onClick={handleExportOverrides}>
              <Download size={16} /> Export Audit Logs
            </button>
          ) : (
            <button className="btn btn-outline" onClick={handleExportRequests}>
              <Download size={16} /> Export Requisitions
            </button>
          )}

          <button className="btn btn-primary" onClick={() => setShowFacultyModal(true)}>
            <UserPlus size={16} /> Provision Faculty Account
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Campus Gear Stock" value={`${metrics.availableItems} / ${metrics.totalStock}`} />
        <MetricCard label="Currently Borrowed" value={metrics.borrowedItems} />
        <MetricCard label="Pending Approvals" value={metrics.pendingApprovals} />
        <MetricCard label="Overdue Items" value={metrics.overdueReturns} />
      </div>

      <div className="tab-group" style={{ margin: "24px 0 16px" }}>
        <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          Governance Overview
        </button>
        <button className={`tab-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>
          Supervise Requisitions ({requests.length})
        </button>
        <button className={`tab-btn ${activeTab === "overrides" ? "active" : ""}`} onClick={() => setActiveTab("overrides")}>
          Override Audit Logs ({overrideLogs.length})
        </button>
        <button className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
          <BarChart3 size={15} style={{ marginRight: "4px" }} /> Analytics & Insights
        </button>
      </div>

      {activeTab === "analytics" ? (
        <AnalyticsDashboard />
      ) : loading ? (
        <div className="empty-state">Loading administration records...</div>
      ) : activeTab === "overrides" ? (
        <div className="audit-table-wrap">

          {overrideLogs.length === 0 ? (
            <div className="empty-state">No administrative overrides have been logged yet.</div>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Request #</th>
                  <th>Previous</th>
                  <th>New Status</th>
                  <th>Admin User</th>
                  <th>Mandatory Justification</th>
                </tr>
              </thead>
              <tbody>
                {overrideLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt || log.overrideDate).toLocaleString()}</td>
                    <td><strong>#{String(log.requestId?._id || log.requestId).slice(-6)}</strong></td>
                    <td><span className="badge badge-warning">{log.previousStatus}</span></td>
                    <td><span className="badge badge-success">{log.updatedStatus}</span></td>
                    <td>{log.adminId?.email || "Super Admin"}</td>
                    <td style={{ color: "var(--accent)" }}>"{log.reason}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="history-list">
          {requests.map((req) => (
            <div className="history-card" key={req._id}>
              <div className="history-main" style={{ alignItems: "flex-start" }}>
                <div className="history-icon" style={{ marginTop: "4px" }}>
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0 }}>Request #{String(req._id).slice(-6)}</h3>
                    <span className="badge badge-warning">{req.labId?.name || "Lab"}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Student: {req.studentId?.name} ({req.studentId?.email})
                    </span>
                  </div>

                  <p style={{ margin: "4px 0", color: "var(--ink)" }}>
                    <strong>Items: </strong>
                    {req.items?.map((it) => `${it.itemName} (${it.quantityRequested}x)`).join(", ")}
                  </p>

                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0" }}>
                    <strong>Purpose:</strong> {req.purpose || "N/A"}
                  </p>

                  <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--muted)", marginTop: "6px" }}>
                    <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>Expected Return: {req.expectedReturnDate ? new Date(req.expectedReturnDate).toLocaleDateString() : "Immediate"}</span>
                  </div>

                  {req.facultyRemarks && (
                    <p style={{ fontSize: "0.85rem", color: "var(--accent)", margin: "6px 0 0" }}>
                      <strong>Faculty Remarks:</strong> "{req.facultyRemarks}"
                    </p>
                  )}

                  {req.adminRemarks && (
                    <p style={{ fontSize: "0.85rem", color: "#8A3324", margin: "4px 0 0" }}>
                      <strong>Admin Override Note:</strong> "{req.adminRemarks}"
                    </p>
                  )}
                </div>
              </div>

              <div className="history-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <span className={`history-status status-${(req.status || "pending").toLowerCase()}`}>
                  {req.status}
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                  {["approved", "issued", "returned"].includes((req.status || "").toLowerCase()) && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={() => setSelectedGatePass(req)}
                      title="View & Print Official Gate Pass"
                    >
                      <Printer size={14} /> Gate Pass
                    </button>
                  )}

                  <button
                    className="btn btn-outline"
                    style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                    onClick={() => {
                      setOverrideTarget(req);
                      setOverrideStatus(req.status === "rejected" ? "approved" : "rejected");
                      setOverrideReason("");
                    }}
                  >
                    Override Decision
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Override Modal */}
      {overrideTarget && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Administrative Decision Override</h2>
              <button className="close-btn" onClick={() => setOverrideTarget(null)}>✕</button>
            </div>

            <form onSubmit={handleApplyOverride}>
              <div style={{ background: "#F1DDD8", color: "#782C1D", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem" }}>
                <strong>Institutional Notice:</strong> All administrative decision overrides are immutably logged into the audit ledger for institutional compliance.
              </div>

              <p>
                Target: <strong>Request #{String(overrideTarget._id).slice(-6)}</strong> ({overrideTarget.studentId?.name})
                <br />
                Current Status: <span className="badge badge-warning">{overrideTarget.status}</span>
              </p>

              <label className="form-label">
                Override Target Status
                <select
                  className="form-select"
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                >
                  <option value="approved">Approve Application</option>
                  <option value="rejected">Reject Application</option>
                  <option value="cancelled">Cancel Request</option>
                </select>
              </label>

              <label className="form-label">
                Mandatory Override Justification / Reason
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="State academic reason, faculty escalation, or special university exception..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                />
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOverrideTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Override & Log Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Account Modal */}
      {showFacultyModal && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Provision Faculty Account</h2>
              <button className="close-btn" onClick={() => { setShowFacultyModal(false); setGeneratedCreds(null); }}>✕</button>
            </div>

            {generatedCreds ? (
              <div>
                <div style={{ background: "#DDE9D8", color: "#385A2E", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                  <h3 style={{ margin: "0 0 6px" }}>Faculty Account Provisioned!</h3>
                  <p style={{ margin: "4px 0" }}>An account email notice has been sent to the instructor.</p>
                  <p style={{ margin: "4px 0", fontFamily: "monospace", fontSize: "0.95rem" }}>
                    Email: <strong>{generatedCreds.faculty?.email}</strong>
                    <br />
                    Temporary Password: <strong>{generatedCreds.temporaryPassword}</strong>
                  </p>
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { setShowFacultyModal(false); setGeneratedCreds(null); }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateFaculty}>
                <label className="form-label">
                  Faculty Member Full Name
                  <input
                    className="form-control"
                    required
                    placeholder="e.g. Dr. Yoothika Patel"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                  />
                </label>

                <label className="form-label">
                  Official University Email
                  <input
                    className="form-control"
                    type="email"
                    required
                    placeholder="e.g. yoothika.patel@gsfcuniversity.ac.in"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                  />
                </label>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFacultyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Provision & Generate Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedGatePass && (
        <GatePassModal
          request={selectedGatePass}
          onClose={() => setSelectedGatePass(null)}
        />
      )}

      {showScannerModal && (
        <CounterScannerModal
          onClose={() => setShowScannerModal(false)}
          onActionCompleted={loadAdminData}
          preloadedRequests={requests}
        />
      )}
    </section>
  );
}

