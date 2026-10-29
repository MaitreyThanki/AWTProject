import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { api } from "../api/http.js";
import { Check, X, FileText, PackageCheck, RotateCcw } from "lucide-react";

export default function FacultyDashboard() {
  const [metrics, setMetrics] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    currentlyBorrowed: 0,
    overdueItems: 0,
    totalLabInventory: 0
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [actionRemarks, setActionRemarks] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const [dashRes, reqRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/requests", { params: { status: activeTab === "all" ? undefined : activeTab } })
      ]);
      if (dashRes.data?.metrics) setMetrics(dashRes.data.metrics);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error("Faculty dashboard failed to load:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(requestId, decision) {
    const remarks = actionRemarks[requestId] || "";
    try {
      await api.patch(`/approvals/${requestId}/decision`, {
        decision,
        remarks
      });
      setMessage(`Request marked as ${decision}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit decision");
    }
  }

  async function handleIssue(requestId) {
    if (!window.confirm("Confirm item handover to student? Inventory available quantity will be decremented.")) return;
    try {
      await api.post(`/requests/${requestId}/issue`);
      setMessage("Items issued to student. Inventory updated.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue items");
    }
  }

  async function handleReturn(requestId) {
    const isDamaged = window.confirm("Is the equipment damaged? Press OK if damaged, Cancel if returned in good condition.");
    try {
      await api.post(`/requests/${requestId}/return`, {
        isDamaged,
        conditionNotes: isDamaged ? "Damaged during practical" : "Good",
        damageCost: isDamaged ? 300 : 0
      });
      setMessage("Equipment return verified. Stock restored.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process return");
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="dashboard-subtitle">Review lab equipment borrowing requests, documents, and manage returns</p>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Pending Requests" value={metrics.pendingRequests} />
        <MetricCard label="Approved Requests" value={metrics.approvedRequests} />
        <MetricCard label="Currently Borrowed" value={metrics.currentlyBorrowed} />
        <MetricCard label="Overdue Items" value={metrics.overdueItems} />
      </div>

      {message && (
        <div style={{ background: "#DDE9D8", color: "#385A2E", padding: "12px", borderRadius: "8px", margin: "20px 0" }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="tab-group" style={{ marginTop: "28px" }}>
        {["pending", "approved", "issued", "overdue", "all"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: "capitalize" }}
          >
            {tab} Requests
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">No requests found in this queue.</div>
      ) : (
        <div className="table-wrap" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Requested Items</th>
                <th>Lab</th>
                <th>Expected Dates</th>
                <th>Documents</th>
                <th>Remarks / Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.studentId?.name || "Student"}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {r.studentId?.email}<br />
                      Roll: {r.studentId?.enrollmentNumber || "N/A"} ({r.studentId?.residenceType || "stay"})
                    </div>
                  </td>
                  <td>
                    {r.items?.map((it) => (
                      <div key={it._id || it.itemName} style={{ fontSize: "0.9rem" }}>
                        • {it.itemName} (<strong>{it.quantityRequested}x</strong>)
                      </div>
                    ))}
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "4px" }}>
                      Purpose: {r.purpose || "N/A"}
                    </div>
                  </td>
                  <td>{r.labId?.name || "Lab"}</td>
                  <td style={{ fontSize: "0.85rem" }}>
                    <div>Due: {r.expectedReturnDate ? new Date(r.expectedReturnDate).toLocaleDateString() : "N/A"}</div>
                    <span className={`history-status status-${(r.status || "pending").toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.documents && r.documents.length > 0 ? (
                      r.documents.map((d, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}>
                          <FileText size={14} />
                          <span title={d.fileName}>{d.fileName.slice(0, 15)}...</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>None attached</span>
                    )}
                  </td>
                  <td>
                    {r.status === "pending" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <input
                          className="form-control"
                          placeholder="Faculty remarks..."
                          style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                          value={actionRemarks[r._id] || ""}
                          onChange={(e) => setActionRemarks({ ...actionRemarks, [r._id]: e.target.value })}
                        />
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                            onClick={() => handleDecision(r._id, "approved")}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                            onClick={() => handleDecision(r._id, "rejected")}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {r.status === "approved" && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        onClick={() => handleIssue(r._id)}
                      >
                        <PackageCheck size={14} /> Issue Equipment
                      </button>
                    )}

                    {["issued", "overdue"].includes(r.status) && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                        onClick={() => handleReturn(r._id)}
                      >
                        <RotateCcw size={14} /> Confirm Return
                      </button>
                    )}

                    {["returned", "rejected", "cancelled"].includes(r.status) && (
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
