import React, { useEffect, useState } from "react";
import {
  Printer,
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck2,
  Calendar,
  Building2,
  UserCheck
} from "lucide-react";
import QRCode from "qrcode";
import { api } from "../api/http.js";

export default function NoDuesCertificateModal({ onClose }) {
  const [clearanceData, setClearanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    loadClearance();
  }, []);

  async function loadClearance() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/no-dues-clearance");
      setClearanceData(res.data);

      if (res.data.eligible && res.data.clearanceRef) {
        const payload = `GSFCU-VERIFY-NODUES:${res.data.clearanceRef}|STUDENT:${res.data.student?.enrollmentNumber || ""}|DATE:${new Date().toISOString().slice(0, 10)}`;
        QRCode.toDataURL(payload, {
          width: 140,
          margin: 1,
          color: {
            dark: "#2A4027",
            light: "#FFFFFF"
          }
        })
          .then((url) => setQrCodeUrl(url))
          .catch((e) => console.error("Certificate QR generation failed:", e));
      }
    } catch (err) {
      console.error("Failed to fetch clearance:", err);
      setError("Failed to verify laboratory clearance records. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", textAlign: "center", padding: "40px" }}>
          <Clock size={36} className="spinner" style={{ margin: "0 auto 12px" }} />
          <h3>Verifying Laboratory Records...</h3>
          <p style={{ color: "var(--muted)" }}>Checking active inventory borrowings, return statuses, and lab penalty ledger.</p>
        </div>
      </div>
    );
  }

  if (error || !clearanceData) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", padding: "30px", textAlign: "center" }}>
          <AlertTriangle size={36} color="var(--danger)" style={{ margin: "0 auto 12px" }} />
          <h3>Verification Error</h3>
          <p style={{ color: "var(--muted)" }}>{error || "Unable to check clearance status"}</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
            <button className="btn btn-primary" onClick={loadClearance}>Retry</button>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const { eligible, student, clearanceRef, activeBorrowings = [], unpaidPenalties = [], totalReturnedCount = 0 } = clearanceData;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal no-dues-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: eligible ? "740px" : "600px", padding: 0 }}
      >
        {/* Actions bar (hidden during print) */}
        <div className="gate-pass-toolbar no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={20} color={eligible ? "#285420" : "var(--danger)"} />
            <strong>Laboratory "No-Dues" Clearance Status</strong>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {eligible && (
              <button
                className="btn btn-primary"
                onClick={handlePrint}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: "#285420" }}
              >
                <Printer size={16} /> Print Certificate / PDF
              </button>
            )}
            <button className="btn btn-outline" onClick={onClose} style={{ padding: "8px" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* INELIGIBLE VIEW: Outstanding Checklist */}
        {!eligible ? (
          <div style={{ padding: "28px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#FDE8E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <AlertTriangle size={28} color="#A83232" />
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: "1.3rem", color: "var(--text)" }}>
                Clearance Pending: Action Required
              </h2>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                You have active equipment borrowings or unpaid penalties. All lab liabilities must be settled before official No-Dues clearance can be issued.
              </p>
            </div>

            {/* Active Borrowings Checklist */}
            {activeBorrowings.length > 0 && (
              <div style={{ marginBottom: "18px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <Clock size={16} color="var(--accent)" />
                  <strong style={{ fontSize: "0.9rem" }}>Active Borrowed Hardware in Your Possession ({activeBorrowings.length})</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activeBorrowings.map((b) => (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", padding: "8px", background: "var(--bg)", borderRadius: "6px" }}>
                      <div>
                        <strong>{b.items}</strong>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)" }}>
                          Status: <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{b.status}</span> • Due Date: {b.expectedReturnDate ? new Date(b.expectedReturnDate).toLocaleDateString() : "Immediate"}
                        </span>
                      </div>
                      <span className="badge-pill" style={{ backgroundColor: "#FBE6D6", color: "#8E5830" }}>
                        Return Required
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unpaid Penalties Checklist */}
            {unpaidPenalties.length > 0 && (
              <div style={{ marginBottom: "18px", background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "8px", padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <AlertTriangle size={16} color="#A83232" />
                  <strong style={{ fontSize: "0.9rem", color: "#A83232" }}>
                    Unsettled Laboratory Penalties ({unpaidPenalties.length})
                  </strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {unpaidPenalties.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", padding: "8px", background: "#fff", borderRadius: "6px" }}>
                      <div>
                        <strong>{p.reason}</strong>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)" }}>
                          Issued on {new Date(p.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: "#A83232" }}>₹{p.amount} Due</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: "var(--bg)", padding: "12px", borderRadius: "8px", fontSize: "0.82rem", color: "var(--muted)", textAlign: "center" }}>
              💡 Visit <strong>Makers Lab 2 / Design IoT Lab</strong> to physically return components and settle outstanding fines at the faculty counter.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
              <button className="btn btn-outline" onClick={onClose}>
                Understood, Close
              </button>
            </div>
          </div>
        ) : (
          /* ELIGIBLE VIEW: Official Printable Certificate */
          <div className="nodues-certificate-printable">
            <div className="nodues-border-frame">
              {/* Header with GSFC Seal */}
              <div className="nodues-header">
                <div className="nodues-seal-box">
                  <div className="nodues-emblem">GSFCU</div>
                </div>
                <div className="nodues-inst-meta">
                  <h1>GSFC UNIVERSITY</h1>
                  <h2>SCHOOL OF TECHNOLOGY • VADODARA, GUJARAT</h2>
                  <p>Department of Computer Science & Engineering • Central Laboratories</p>
                </div>
                <div className="nodues-cert-meta">
                  <span className="nodues-cert-tag">OFFICIAL CLEARANCE</span>
                  <span className="nodues-ref">{clearanceRef}</span>
                </div>
              </div>

              <div className="nodues-ribbon">
                <span>LABORATORY & HARDWARE NO-DUES CLEARANCE CERTIFICATE</span>
              </div>

              {/* Certificate Body Text */}
              <div className="nodues-body">
                <p className="nodues-intro">
                  This is to officially certify that the student detailed below has fulfilled all equipment obligations, returned all borrowed electronic hardware, development modules, sensors, and peripherals, and holds <strong>ZERO OUTSTANDING DUES OR LIABILITIES</strong> with the Central Laboratory facilities.
                </p>

                {/* Candidate Particulars Table */}
                <div className="nodues-details-grid">
                  <div className="nodues-field">
                    <span className="nodues-lbl">STUDENT NAME</span>
                    <span className="nodues-val">{student?.name || "N/A"}</span>
                  </div>
                  <div className="nodues-field">
                    <span className="nodues-lbl">ENROLLMENT NUMBER</span>
                    <span className="nodues-val">{student?.enrollmentNumber || "25BT04D251"}</span>
                  </div>
                  <div className="nodues-field">
                    <span className="nodues-lbl">PROGRAM & BRANCH</span>
                    <span className="nodues-val">{student?.universityProgram || "B.Tech Computer Science & Engineering"}</span>
                  </div>
                  <div className="nodues-field">
                    <span className="nodues-lbl">SEMESTER & DIVISION</span>
                    <span className="nodues-val">Semester {student?.semester || "5"} (Division {student?.division || "A"})</span>
                  </div>
                  <div className="nodues-field">
                    <span className="nodues-lbl">FACILITIES CLEARED</span>
                    <span className="nodues-val">Makers Lab 2 & Design IoT Lab</span>
                  </div>
                  <div className="nodues-field">
                    <span className="nodues-lbl">SUCCESSFUL RETURNS</span>
                    <span className="nodues-val">{totalReturnedCount} Hardware Requisitions Cleared</span>
                  </div>
                </div>

                {/* Formal Declaration Statement */}
                <div className="nodues-declaration">
                  <CheckCircle2 size={18} color="#285420" />
                  <p>
                    Verified: All components inspected and restocked in working condition. No overdue penalties, damage fees, or unreturned components exist against this enrollment number as of{" "}
                    <strong>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
                    Student is formally cleared for semester examinations and degree convocation.
                  </p>
                </div>

                {/* Footer Signatures & QR Block */}
                <div className="nodues-signatures">
                  <div className="nodues-sig-item">
                    <div className="nodues-sig-line" />
                    <span>Laboratory Technical Assistant</span>
                    <small>Makers Lab 2</small>
                  </div>

                  {/* QR Digital Verification Seal */}
                  <div className="nodues-qr-seal">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Clearance QR Verification" style={{ width: "80px", height: "80px" }} />
                    ) : (
                      <div style={{ width: "80px", height: "80px", background: "#e8efe6" }} />
                    )}
                    <span className="nodues-digital-stamp">
                      <ShieldCheck size={12} /> DIGITALLY VALIDATED
                    </span>
                  </div>

                  <div className="nodues-sig-item">
                    <div className="nodues-sig-line" />
                    <span>Faculty In-Charge / Lab Head</span>
                    <small>School of Technology, GSFCU</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
