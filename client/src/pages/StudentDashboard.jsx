import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { RefreshCcw, History, Printer, Award, FileCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/http.js";
import GatePassModal from "../components/GatePassModal.jsx";
import NoDuesCertificateModal from "../components/NoDuesCertificateModal.jsx";

export default function StudentDashboard() {
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({
    activeRequests: 0,
    approvedItems: 0,
    dueSoon: 0,
    activePenalties: 0,
    penaltyTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [showNoDuesModal, setShowNoDuesModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, reqRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/requests")
        ]);
        if (dashRes.data?.metrics) {
          setMetrics(dashRes.data.metrics);
        }
        setHistory(reqRes.data || []);
      } catch (error) {
        console.error("Failed to load student dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleGetAgain = (request) => {
    localStorage.setItem(
      "repeatRequest",
      JSON.stringify({
        requestId: request._id,
        items: request.items || []
      })
    );
  };

  return (
    <section>
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1>Student Dashboard</h1>
          <p className="dashboard-subtitle">Manage your lab requests, equipment clearances, and borrowing history.</p>
        </div>

        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowNoDuesModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              backgroundColor: "#285420",
              boxShadow: "0 2px 8px rgba(40, 84, 32, 0.25)"
            }}
            title="Generate Official Institutional No-Dues Certificate"
          >
            <Award size={18} />
            <span>Generate No-Dues Clearance</span>
          </button>
        </div>
      </div>


      <div className="metric-grid">
        <MetricCard label="Active Requests" value={metrics.activeRequests} />
        <MetricCard label="Approved Items" value={metrics.approvedItems} />
        <MetricCard label="Due Soon" value={metrics.dueSoon} />
        <MetricCard
          label="Penalties Due"
          value={metrics.activePenalties > 0 ? `₹${metrics.penaltyTotal}` : "₹0"}
        />
      </div>

      <div className="history-section">
        <div className="section-header">
          <div className="section-title">
            <History size={22} />
            <h2>Borrowing History</h2>
          </div>

          <span className="history-count">
            {history.length} {history.length === 1 ? "request" : "requests"}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">Loading borrowing history...</div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <History size={32} />
            <p>No borrowing history yet. Browse the inventory to borrow lab gear.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((request) => {
              const isEligibleForGatePass = ["approved", "issued", "returned"].includes((request.status || "").toLowerCase());

              return (
                <div className="history-card" key={request._id}>
                  <div className="history-main">
                    <div className="history-icon">
                      <History size={20} />
                    </div>

                    <div>
                      <h3>
                        Request #{String(request._id).slice(-6)} • {request.labId?.name || "Lab"}
                      </h3>

                      <p>
                        <strong>Items: </strong>
                        {request.items?.map((i) => `${i.itemName} (${i.quantityRequested}x)`).join(", ")}
                      </p>

                      <p>
                        Requested on{" "}
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                        {" • "}
                        Return deadline:{" "}
                        {request.expectedReturnDate
                          ? new Date(request.expectedReturnDate).toLocaleDateString()
                          : "Not specified"}
                      </p>

                      {request.facultyRemarks && (
                        <p style={{ color: "var(--accent)", fontStyle: "italic" }}>
                          Remarks: {request.facultyRemarks}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="history-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <span className={`history-status status-${(request.status || "pending").toLowerCase()}`}>
                      {request.status || "Pending"}
                    </span>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => setSelectedGatePass(request)}
                        title="View & Print Official Gate Pass / Slip"
                      >
                        <Printer size={14} /> {isEligibleForGatePass ? "Gate Pass" : "Preview Slip"}
                      </button>

                      <Link
                        to="/inventory"
                        className="get-again-btn"
                        onClick={() => handleGetAgain(request)}
                      >
                        <RefreshCcw size={15} />
                        Get Again
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedGatePass && (
        <GatePassModal
          request={selectedGatePass}
          onClose={() => setSelectedGatePass(null)}
        />
      )}

      {showNoDuesModal && (
        <NoDuesCertificateModal
          onClose={() => setShowNoDuesModal(false)}
        />
      )}
    </section>
  );
}