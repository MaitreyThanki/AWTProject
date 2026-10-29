import React, { useEffect, useState } from "react";
import { api } from "../api/http.js";
import { ClipboardList, Calendar, MapPin, FileText } from "lucide-react";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await api.get("/requests", { params });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Borrow Requests</h1>
          <p className="dashboard-subtitle">Track status and return dates for all lab equipment requisitions</p>
        </div>
      </div>

      <div className="tab-group">
        {["all", "pending", "approved", "issued", "returned", "overdue"].map((status) => (
          <button
            key={status}
            className={`tab-btn ${filterStatus === status ? "active" : ""}`}
            onClick={() => setFilterStatus(status)}
            style={{ textTransform: "capitalize" }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading requisitions...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={32} />
          <p>No borrow requests found in this status category.</p>
        </div>
      ) : (
        <div className="history-list">
          {requests.map((req) => (
            <div className="history-card" key={req._id}>
              <div className="history-main" style={{ alignItems: "flex-start" }}>
                <div className="history-icon" style={{ marginTop: "4px" }}>
                  <ClipboardList size={20} />
                </div>

                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0 }}>Request #{String(req._id).slice(-6)}</h3>
                    <span className="badge badge-warning">{req.labId?.name || "Lab"}</span>
                  </div>

                  <p style={{ margin: "4px 0", color: "var(--ink)" }}>
                    <strong>Items: </strong>
                    {req.items?.map((it) => `${it.itemName} (${it.quantityRequested} unit)`).join(", ")}
                  </p>

                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0" }}>
                    <strong>Purpose: </strong> {req.purpose || "Not specified"}
                  </p>

                  <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--muted)", marginTop: "8px" }}>
                    <span>Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>Expected Return: {req.expectedReturnDate ? new Date(req.expectedReturnDate).toLocaleDateString() : "N/A"}</span>
                    {req.actualReturnDate && (
                      <span style={{ color: "#385A2E" }}>Returned: {new Date(req.actualReturnDate).toLocaleDateString()}</span>
                    )}
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

              <div className="history-actions">
                <span className={`history-status status-${(req.status || "pending").toLowerCase()}`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
