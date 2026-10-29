import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { RefreshCcw, History } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/http.js";

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
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="dashboard-subtitle">Manage your lab requests and borrowing history.</p>
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
            {history.map((request) => (
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

                <div className="history-actions">
                  <span className={`history-status status-${(request.status || "pending").toLowerCase()}`}>
                    {request.status || "Pending"}
                  </span>

                  <Link
                    to="/inventory"
                    className="get-again-btn"
                    onClick={() => handleGetAgain(request)}
                  >
                    <RefreshCcw size={16} />
                    Get Again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}