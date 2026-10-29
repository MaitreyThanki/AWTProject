import React, { useEffect, useState, useMemo } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { api } from "../api/http.js";
import { Check, X, FileText, PackageCheck, RotateCcw, Download, Search, Printer } from "lucide-react";
import GatePassModal from "../components/GatePassModal.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import { useToast } from "../components/Toast.jsx";

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
  const [search, setSearch] = useState("");
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const { addToast } = useToast();

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
      addToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter((r) => {
      const sName = (r.studentId?.name || "").toLowerCase();
      const sRoll = (r.studentId?.enrollmentNumber || "").toLowerCase();
      const sEmail = (r.studentId?.email || "").toLowerCase();
      const itemsMatch = r.items?.some((i) => (i.itemName || "").toLowerCase().includes(q));
      return sName.includes(q) || sRoll.includes(q) || sEmail.includes(q) || itemsMatch;
    });
  }, [requests, search]);

  function handleExportCsv() {
    exportToCsv("Faculty_Lab_Requests", [
      { key: "requestId", label: "Request ID", formatter: (_, r) => String(r._id) },
      { key: "studentName", label: "Student Name", formatter: (_, r) => r.studentId?.name || "N/A" },
      { key: "rollNo", label: "Enrollment No", formatter: (_, r) => r.studentId?.enrollmentNumber || "N/A" },
      { key: "items", label: "Items", formatter: (_, r) => r.items?.map((i) => `${i.itemName} (${i.quantityRequested})`).join("; ") },
      { key: "status", label: "Status" },
      { key: "expectedReturnDate", label: "Due Date", formatter: (d) => d ? new Date(d).toLocaleDateString() : "N/A" },
      { key: "purpose", label: "Purpose" }
    ], filteredRequests);
    addToast("Exported lab requests as CSV", "success");
  }

  async function handleDecision(requestId, decision) {
    const remarks = actionRemarks[requestId] || "";
    try {
      await api.patch(`/approvals/${requestId}/decision`, {
        decision,
        remarks
      });
      addToast(`Request marked as ${decision}`, "success");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to submit decision", "error");
    }
  }

  async function handleIssue(requestId) {
    if (!window.confirm("Confirm item handover to student? Inventory available quantity will be decremented.")) return;
    try {
      await api.post(`/requests/${requestId}/issue`);
      addToast("Items issued to student. Inventory updated.", "success");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to issue items", "error");
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
      addToast("Equipment return verified. Stock restored.", "success");
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to process return", "error");
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="dashboard-subtitle">Review lab equipment borrowing requests, documents, and manage returns</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Download CSV report">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Pending Requests" value={metrics.pendingRequests} />
        <MetricCard label="Approved Requests" value={metrics.approvedRequests} />
        <MetricCard label="Currently Borrowed" value={metrics.currentlyBorrowed} />
        <MetricCard label="Overdue Items" value={metrics.overdueItems} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", margin: "24px 0 16px" }}>
        <div className="tab-group" style={{ margin: 0 }}>
          <button className={`tab-btn ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
            Pending Approvals ({metrics.pendingRequests})
          </button>
          <button className={`tab-btn ${activeTab === "approved" ? "active" : ""}`} onClick={() => setActiveTab("approved")}>
            Approved / Ready for Handover
          </button>
          <button className={`tab-btn ${activeTab === "issued" ? "active" : ""}`} onClick={() => setActiveTab("issued")}>
            Currently Issued ({metrics.currentlyBorrowed})
          </button>
          <button className={`tab-btn ${activeTab === "overdue" ? "active" : ""}`} onClick={() => setActiveTab("overdue")}>
            Overdue ({metrics.overdueItems})
          </button>
          <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
            All Requests
          </button>
        </div>

        <div className="search-bar" style={{ minWidth: "240px", margin: 0 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search student, roll no, item..."
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
        <div className="empty-state">Loading requisitions...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">No requests found in this queue.</div>
      ) : (
        <div className="faculty-queue">
          {filteredRequests.map((req) => (
            <div className="faculty-card" key={req._id}>
              <div className="faculty-card-header">
                <div>
                  <span className="badge badge-warning" style={{ marginRight: "8px" }}>{req.labId?.name || "Lab"}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Request #{String(req._id).slice(-6)}</span>
                  <h3 style={{ margin: "6px 0 2px" }}>
                    {req.studentId?.name || "Student"}
                    {req.studentId?.enrollmentNumber && (
                      <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--muted)", marginLeft: "8px" }}>
                        ({req.studentId.enrollmentNumber})
                      </span>
                    )}
                  </h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    Program: {req.studentId?.universityProgram || "B.Tech CSE"} • Stay: {req.studentId?.residenceType || "Home"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className={`history-status status-${(req.status || "pending").toLowerCase()}`}>
                    {req.status}
                  </span>
                  {["approved", "issued", "returned"].includes((req.status || "").toLowerCase()) && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={() => setSelectedGatePass(req)}
                      title="Print Official Gate Pass"
                    >
                      <Printer size={14} /> Gate Pass
                    </button>
                  )}
                </div>
              </div>

              <div className="faculty-card-body">
                <div style={{ margin: "8px 0" }}>
                  <strong>Requested Equipment:</strong>
                  <ul style={{ margin: "4px 0 8px 18px", padding: 0 }}>
                    {req.items?.map((it, idx) => (
                      <li key={idx}>
                        <strong>{it.itemName}</strong> - {it.quantityRequested} unit(s)
                      </li>
                    ))}
                  </ul>
                </div>

                <p style={{ margin: "4px 0", fontSize: "0.9rem" }}>
                  <strong>Purpose:</strong> {req.purpose || "Not provided"}
                </p>

                <p style={{ margin: "4px 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  <strong>Requested Return Date:</strong> {req.expectedReturnDate ? new Date(req.expectedReturnDate).toLocaleDateString() : "Immediate"}
                </p>

                {req.documentUrls && req.documentUrls.length > 0 && (
                  <div style={{ margin: "10px 0" }}>
                    <strong>Attached Approval Slips:</strong>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      {req.documentUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url.startsWith("http") ? url : `http://localhost:5000${url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline"
                          style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                        >
                          <FileText size={14} /> View Document #{idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {req.status === "pending" && (
                  <div style={{ marginTop: "12px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add remarks or justification (optional)..."
                      value={actionRemarks[req._id] || ""}
                      onChange={(e) => setActionRemarks({ ...actionRemarks, [req._id]: e.target.value })}
                      style={{ marginBottom: "10px", fontSize: "0.85rem" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                        onClick={() => handleDecision(req._id, "approved")}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 14px", fontSize: "0.85rem", color: "#8A3324", borderColor: "#D5A49C" }}
                        onClick={() => handleDecision(req._id, "rejected")}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {req.status === "approved" && (
                  <div style={{ marginTop: "14px", borderTop: "1px dashed var(--border)", paddingTop: "10px" }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      onClick={() => handleIssue(req._id)}
                    >
                      <PackageCheck size={16} /> Confirm Handover (Issue to Student)
                    </button>
                  </div>
                )}

                {req.status === "issued" && (
                  <div style={{ marginTop: "14px", borderTop: "1px dashed var(--border)", paddingTop: "10px" }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      onClick={() => handleReturn(req._id)}
                    >
                      <RotateCcw size={16} /> Confirm Return & Verify Condition
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedGatePass && (
        <GatePassModal
          request={selectedGatePass}
          onClose={() => setSelectedGatePass(null)}
        />
      )}
    </section>
  );
}
