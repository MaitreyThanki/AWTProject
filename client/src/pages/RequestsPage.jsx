import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/http.js";
import {
  ClipboardList,
  Calendar,
  MapPin,
  FileText,
  Search,
  Download,
  Printer,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  QrCode,
  ExternalLink,
  Zap
} from "lucide-react";
import GatePassModal from "../components/GatePassModal.jsx";
import CounterScannerModal from "../components/CounterScannerModal.jsx";
import { exportToCsv } from "../utils/exportCsv.js";
import { useToast } from "../components/Toast.jsx";

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const { addToast } = useToast();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Check for ?verify=ID or ?scan=ID from camera QR scan or deep links
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verifyId = params.get("verify") || params.get("scan");
    if (verifyId) {
      // First try public verification endpoint to avoid 401/403 blocks
      api.get(`/requests/public-verify/${verifyId}`)
        .then((res) => {
          setSelectedGatePass(res.data);
          addToast(`Gate Pass #${String(res.data._id).slice(-6)} verified successfully!`, "success");
        })
        .catch(() => {
          // Fallback to regular endpoint with ?verify=true
          api.get(`/requests/${verifyId}?verify=true`)
            .then((res) => {
              setSelectedGatePass(res.data);
              addToast("Gate Pass loaded successfully!", "success");
            })
            .catch((err) => {
              console.error("Auto verify error:", err);
              addToast("Could not verify Gate Pass link", "error");
            });
        });
    }
  }, [location.search]);

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
      addToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.toLowerCase();
    return requests.filter((req) => {
      const idMatch = String(req._id || "").toLowerCase().includes(q);
      const labMatch = (req.labId?.name || "").toLowerCase().includes(q);
      const itemMatch = req.items?.some((it) => (it.itemName || "").toLowerCase().includes(q));
      const purposeMatch = (req.purpose || "").toLowerCase().includes(q);
      return idMatch || labMatch || itemMatch || purposeMatch;
    });
  }, [requests, search]);

  function handleExportCsv() {
    exportToCsv("Equipment_Borrow_Requests", [
      { key: "requestId", label: "Request ID", formatter: (_, r) => String(r._id) },
      { key: "labName", label: "Laboratory", formatter: (_, r) => r.labId?.name || "N/A" },
      { key: "items", label: "Items Requested", formatter: (_, r) => r.items?.map((i) => `${i.itemName} (${i.quantityRequested})`).join("; ") },
      { key: "purpose", label: "Purpose" },
      { key: "status", label: "Status" },
      { key: "expectedReturnDate", label: "Expected Return", formatter: (d) => d ? new Date(d).toLocaleDateString() : "N/A" },
      { key: "actualReturnDate", label: "Actual Return", formatter: (d) => d ? new Date(d).toLocaleDateString() : "N/A" },
      { key: "facultyRemarks", label: "Faculty Remarks" }
    ], filteredRequests);
    addToast("Exported requests as CSV", "success");
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Borrow Requests & Clearance</h1>
          <p className="dashboard-subtitle">Track requisition statuses, return dates, and print official equipment gate passes</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {user && ["faculty", "admin"].includes(user.role) && (
            <button
              className="btn btn-primary"
              onClick={() => setShowScanner(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              title="Open hardware check-in / check-out counter scanner"
            >
              <Zap size={16} /> Counter Scanner
            </button>
          )}
          <Link to="/inventory" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <PlusCircle size={16} /> New Requisition
          </Link>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Download CSV Records">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div className="tab-group" style={{ margin: 0 }}>
          {["all", "pending", "approved", "issued", "returned", "overdue", "rejected"].map((status) => (
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

        <div className="search-bar" style={{ minWidth: "240px", margin: 0 }}>

          <Search size={16} />
          <input
            type="text"
            placeholder="Search request ID, item, lab..."
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
        <div className="empty-state">
          <ClipboardList size={32} />
          <p>No borrow requests found in this status category.</p>
        </div>
      ) : (
        <div className="history-list">
          {filteredRequests.map((req) => {
            const isApprovedOrActive = ["approved", "issued", "returned"].includes((req.status || "").toLowerCase());

            return (
              <div className="history-card" key={req._id}>
                <div className="history-main" style={{ alignItems: "flex-start" }}>
                  <div className="history-icon" style={{ marginTop: "4px" }}>
                    <ClipboardList size={20} />
                  </div>

                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
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

                    <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--muted)", marginTop: "8px", flexWrap: "wrap" }}>
                      <span>Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                      <span>Expected Return: {req.expectedReturnDate ? new Date(req.expectedReturnDate).toLocaleDateString() : "N/A"}</span>
                      {req.actualReturnDate && (
                        <span style={{ color: "#385A2E", fontWeight: 600 }}>Returned: {new Date(req.actualReturnDate).toLocaleDateString()}</span>
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

                <div className="history-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span className={`history-status status-${(req.status || "pending").toLowerCase()}`}>
                    {req.status}
                  </span>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}
                      onClick={() => setSelectedGatePass(req)}
                      title="View & Print Official Gate Pass / Slip"
                    >
                      <Printer size={14} />
                      {isApprovedOrActive ? "Gate Pass" : req.status === "pending" ? "Preview Pass" : "View Record"}
                    </button>
                    <Link
                      to={`/verify/${req._id}`}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: "6px 8px", fontSize: "0.82rem" }}
                      title="Open Public Verification Link"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedGatePass && (
        <GatePassModal
          request={selectedGatePass}
          onClose={() => setSelectedGatePass(null)}
        />
      )}

      {showScanner && (
        <CounterScannerModal
          preloadedRequests={requests}
          onClose={() => setShowScanner(false)}
          onActionCompleted={fetchRequests}
        />
      )}
    </section>
  );
}
