import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import { RefreshCcw, History } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/http.js";

export default function StudentDashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/requests");
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to load borrowing history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleGetAgain = (request) => {
    localStorage.setItem(
      "repeatRequest",
      JSON.stringify({
        requestId: request.id,
        items: request.BorrowRequestItems || [],
      })
    );
  };

  return (
    <section>
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your lab requests and borrowing history.
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Active Requests" value="0" />
        <MetricCard label="Approved Items" value="0" />
        <MetricCard label="Due Soon" value="0" />
        <MetricCard label="Penalties" value="0" />
      </div>

      <div className="history-section">
        <div className="section-header">
          <div className="section-title">
            <History size={22} />
            <h2>Borrowing History</h2>
          </div>

          <span className="history-count">
            {history.length}{" "}
            {history.length === 1 ? "request" : "requests"}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading borrowing history...
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <History size={32} />
            <p>No borrowing history yet.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((request) => (
              <div className="history-card" key={request.id}>
                <div className="history-main">
                  <div className="history-icon">
                    <History size={20} />
                  </div>

                  <div>
                    <h3>Request #{request.id}</h3>

                    <p>
                      Requested on{" "}
                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <p>
                      Return date:{" "}
                      {request.expectedReturnDate || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="history-actions">
                  <span
                    className={`history-status status-${(
                      request.status || "pending"
                    ).toLowerCase()}`}
                  >
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