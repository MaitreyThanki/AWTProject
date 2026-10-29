import React, { useState, useEffect } from "react";
import {
  QrCode,
  Search,
  X,
  PackageCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Zap,
  Printer
} from "lucide-react";
import { api } from "../api/http.js";
import { useToast } from "./Toast.jsx";
import GatePassModal from "./GatePassModal.jsx";

// Audio chime using browser Web Audio API
function playScanSound(success = true) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    if (success) {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
    } else {
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.15);
    }
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    // AudioContext blocked or unsupported
  }
}

export default function CounterScannerModal({ onClose, onActionCompleted, preloadedRequests = [] }) {
  const [query, setQuery] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageCost, setDamageCost] = useState(300);
  const [conditionNotes, setConditionNotes] = useState("");
  const [showGatePass, setShowGatePass] = useState(false);
  const { addToast } = useToast();

  // If there are preloaded requests, default to first approved/issued for quick-test
  const activeQueues = preloadedRequests.filter((r) =>
    ["approved", "issued"].includes((r.status || "").toLowerCase())
  );

  async function handleSearch(targetId) {
    const rawId = (targetId || query).trim();
    if (!rawId) return;

    // Clean input if QR payload e.g. AWT-PASS:ID or GP-ID or URL
    let cleanId = rawId;
    if (cleanId.includes("AWT-PASS:")) {
      cleanId = cleanId.split("AWT-PASS:")[1].trim();
    } else if (cleanId.startsWith("#GP-") || cleanId.startsWith("GP-")) {
      cleanId = cleanId.replace(/^#?GP-/, "").trim();
    }

    setLoading(true);
    setActiveRequest(null);
    try {
      // First try matching in preloaded list by full ID or last 6/8 chars
      const localMatch = preloadedRequests.find(
        (r) =>
          r._id === cleanId ||
          String(r._id).toUpperCase().endsWith(cleanId.toUpperCase()) ||
          (r.studentId?.enrollmentNumber || "").toLowerCase() === cleanId.toLowerCase()
      );

      if (localMatch) {
        // Fetch fresh detail
        const res = await api.get(`/requests/${localMatch._id}`);
        setActiveRequest(res.data);
        playScanSound(true);
        addToast(`Found Requisition #${String(res.data._id).slice(-6)}`, "info");
      } else {
        // Fetch directly from server by ID
        const res = await api.get(`/requests/${cleanId}`);
        setActiveRequest(res.data);
        playScanSound(true);
        addToast(`Found Requisition #${String(res.data._id).slice(-6)}`, "info");
      }
    } catch (err) {
      console.error("Scanner lookup error:", err);
      playScanSound(false);
      addToast(err.response?.data?.message || "Requisition not found with this ID/Barcode", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleIssue() {
    if (!activeRequest) return;
    setActionProcessing(true);
    try {
      await api.post(`/requests/${activeRequest._id}/issue`);
      playScanSound(true);
      addToast("Equipment issued to student. Inventory stock decremented.", "success");
      // Refresh current active request
      const refreshed = await api.get(`/requests/${activeRequest._id}`);
      setActiveRequest(refreshed.data);
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      playScanSound(false);
      addToast(err.response?.data?.message || "Failed to issue equipment", "error");
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleReturn() {
    if (!activeRequest) return;
    setActionProcessing(true);
    try {
      await api.post(`/requests/${activeRequest._id}/return`, {
        isDamaged,
        conditionNotes: isDamaged ? (conditionNotes || "Damaged equipment noted at counter") : "Good",
        damageCost: isDamaged ? Number(damageCost) : 0
      });
      playScanSound(true);
      addToast(
        isDamaged
          ? `Return processed with ₹${damageCost} damage penalty logged.`
          : "Return verified & inventory restocked.",
        "success"
      );
      // Refresh current active request
      const refreshed = await api.get(`/requests/${activeRequest._id}`);
      setActiveRequest(refreshed.data);
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      playScanSound(false);
      addToast(err.response?.data?.message || "Failed to process return", "error");
    } finally {
      setActionProcessing(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal scanner-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "700px" }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="scanner-badge-icon">
              <QrCode size={22} color="var(--white)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text)" }}>
                Lab Counter Quick Check-In / Check-Out
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                Fast 1-click Gate Pass verification, hardware handover, and instant returns
              </p>
            </div>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Input & Lookup Bar */}
        <div className="scanner-lookup-wrap">
          <div className="search-bar" style={{ flex: 1, margin: 0 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Scan QR code, enter Pass Ref #GP-XXXX or Student Roll..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              autoFocus
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Zap size={16} /> Lookup Requisition
          </button>
        </div>

        {/* Quick Test Queue Chips */}
        {activeQueues.length > 0 && !activeRequest && (
          <div style={{ marginTop: "14px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Active Counter Queue (Quick Test):
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
              {activeQueues.slice(0, 5).map((q) => (
                <button
                  key={q._id}
                  className="queue-chip-btn"
                  onClick={() => {
                    setQuery(String(q._id));
                    handleSearch(q._id);
                  }}
                >
                  <span className={`dot-status status-${(q.status || "").toLowerCase()}`} />
                  <strong>#{String(q._id).slice(-6)}</strong> • {q.studentId?.name || "Student"} ({q.status})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
            <Clock size={28} className="spinner" />
            <p style={{ marginTop: "8px" }}>Scanning and verifying requisition signature...</p>
          </div>
        )}

        {/* Requisition Card Details */}
        {activeRequest && !loading && (
          <div className="scanner-result-card">
            {/* Top Identity Banner */}
            <div className="scanner-result-header">
              <div>
                <span className="scanner-ref-tag">#GP-{String(activeRequest._id).slice(-8).toUpperCase()}</span>
                <h3 style={{ margin: "4px 0 0", fontSize: "1.15rem" }}>
                  {activeRequest.studentId?.name || "Unknown Student"}
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Roll: <strong>{activeRequest.studentId?.enrollmentNumber || "N/A"}</strong> • {activeRequest.studentId?.universityProgram || "B.Tech"} (Sem {activeRequest.studentId?.semester || "5"})
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`status-pill status-${(activeRequest.status || "").toLowerCase()}`}>
                  {activeRequest.status}
                </span>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>
                  Due: {activeRequest.expectedReturnDate ? new Date(activeRequest.expectedReturnDate).toLocaleDateString() : "Immediate"}
                </span>
              </div>
            </div>

            {/* Hardware Items List */}
            <div className="scanner-items-box">
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Requisitioned Equipment Items ({activeRequest.items?.length || 0}):
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {activeRequest.items?.map((it, idx) => (
                  <div key={idx} className="scanner-item-row">
                    <div>
                      <strong>{it.itemName}</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                        Condition: {it.itemId?.condition || "Good"} • Asset: {it.itemId?.assetCode || "LAB-HW"}
                      </span>
                    </div>
                    <span className="scanner-qty-tag">{it.quantityRequested} Unit(s)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Panels */}
            <div className="scanner-action-panel">
              {activeRequest.status === "approved" && (
                <div className="action-box issue-action">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <PackageCheck size={20} color="#2B5278" />
                    <strong>Ready for Physical Handover</strong>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 14px" }}>
                    Verify student ID card and components. Clicking below will mark the pass as <strong>Issued</strong> and automatically decrement inventory available quantities.
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleIssue}
                      disabled={actionProcessing}
                      style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center" }}
                    >
                      <Zap size={16} /> {actionProcessing ? "Processing..." : "1-Click Handover: Issue Hardware"}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowGatePass(true)}
                      title="Preview / Print Gate Pass"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeRequest.status === "issued" && (
                <div className="action-box return-action">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <RotateCcw size={20} color="#285420" />
                    <strong>Equipment Check-In & Restocking</strong>
                  </div>

                  {/* Damaged toggle */}
                  <div style={{ margin: "10px 0", background: "var(--card)", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={isDamaged}
                        onChange={(e) => setIsDamaged(e.target.checked)}
                      />
                      <span>Item received damaged or missing components?</span>
                    </label>

                    {isDamaged && (
                      <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Penalty (₹)</label>
                          <input
                            type="number"
                            value={damageCost}
                            onChange={(e) => setDamageCost(e.target.value)}
                            style={{ padding: "6px", width: "100%", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Damage Inspection Remarks</label>
                          <input
                            type="text"
                            placeholder="e.g. Pin 13 broken, burnt chip"
                            value={conditionNotes}
                            onChange={(e) => setConditionNotes(e.target.value)}
                            style={{ padding: "6px", width: "100%", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleReturn}
                      disabled={actionProcessing}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                        justifyContent: "center",
                        backgroundColor: isDamaged ? "#A83232" : "#285420"
                      }}
                    >
                      <CheckCircle2 size={16} />
                      {actionProcessing ? "Processing..." : isDamaged ? "Accept Return (Log Penalty)" : "1-Click Check-In: Accept Return"}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowGatePass(true)}
                      title="Preview Gate Pass"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              )}

              {activeRequest.status === "returned" && (
                <div className="action-box returned-action" style={{ textAlign: "center", padding: "16px" }}>
                  <CheckCircle2 size={32} color="#285420" style={{ margin: "0 auto 8px" }} />
                  <h4 style={{ margin: "0 0 4px", color: "#285420" }}>Hardware Already Returned</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                    This requisition has been fully closed and the items are restocked in the inventory.
                  </p>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowGatePass(true)}
                    style={{ marginTop: "10px" }}
                  >
                    <Printer size={15} /> View Archived Gate Pass
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gate pass modal */}
        {showGatePass && activeRequest && (
          <GatePassModal
            request={activeRequest}
            onClose={() => setShowGatePass(false)}
          />
        )}
      </div>
    </div>
  );
}
