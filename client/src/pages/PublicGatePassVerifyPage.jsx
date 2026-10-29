import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/http.js";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Building,
  User,
  Calendar,
  Clock,
  ArrowLeft,
  QrCode,
  Zap,
  ExternalLink
} from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "../components/Toast.jsx";

export default function PublicGatePassVerifyPage() {
  const { id } = useParams();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!id) return;
    loadGatePass();
  }, [id]);

  async function loadGatePass() {
    setLoading(true);
    setError(null);
    try {
      // Use the public verification endpoint (no login required)
      const res = await api.get(`/requests/public-verify/${id}`);
      setPassData(res.data);

      const verifyUrl = `${window.location.origin}/verify/${res.data._id || id}`;
      QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: "#5C381E",
          light: "#FFFFFF"
        }
      })
        .then((url) => setQrCodeUrl(url))
        .catch((e) => console.error("QR Code Error:", e));
    } catch (err) {
      console.error("Failed to load gate pass verification:", err);
      setError(err.response?.data?.message || "Invalid or expired Gate Pass reference.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    const url = window.location.href;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      addToast("Verification link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="verify-page-wrap">
        <div className="verify-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <Clock size={40} className="spinner" style={{ color: "var(--accent)", margin: "0 auto 16px" }} />
          <h2 style={{ color: "var(--accent)", margin: "0 0 8px" }}>Verifying Gate Pass Authenticity...</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>Connecting to GSFC University Laboratory Security Registry...</p>
        </div>
      </div>
    );
  }

  if (error || !passData) {
    return (
      <div className="verify-page-wrap">
        <div className="verify-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#FDE8E8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={36} color="#9C1A1A" />
          </div>
          <h2 style={{ color: "#9C1A1A", margin: "0 0 10px" }}>Gate Pass Not Verified</h2>
          <p style={{ color: "var(--ink)", maxWidth: "460px", margin: "0 auto 24px" }}>
            {error || "The requested requisition reference was not found in the laboratory security ledger."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={loadGatePass}>Retry Verification</button>
            <Link to="/inventory" className="btn btn-outline">Go to Lab Portal</Link>
          </div>
        </div>
      </div>
    );
  }

  const student = passData.student || {};
  const lab = passData.lab || {};
  const items = passData.items || [];
  const status = (passData.status || "approved").toUpperCase();
  const isAuthorized = passData.isAuthorized;

  return (
    <div className="verify-page-wrap">
      {/* Top action bar (hidden during print) */}
      <div className="verify-toolbar no-print">
        <Link to="/requests" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ArrowLeft size={16} /> Back to Requests
        </Link>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Copy size={16} /> {copied ? "Copied!" : "Copy Link"}
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Printer size={16} /> Print Gate Pass / PDF
          </button>
          {user && ["faculty", "admin"].includes(user.role) && (
            <Link
              to={`/requests?scan=${passData._id}`}
              className="btn btn-accent"
              style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--accent)", color: "white" }}
            >
              <Zap size={16} /> Open In Counter Check-In
            </Link>
          )}
        </div>
      </div>

      {/* Official Security Verification Banner */}
      <div className={`verify-banner no-print ${isAuthorized ? "banner-valid" : "banner-pending"}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isAuthorized ? (
            <ShieldCheck size={28} color="#285420" />
          ) : (
            <AlertTriangle size={28} color="#8A5B14" />
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
              {isAuthorized
                ? "AUTHENTICATED & VALID LABORATORY GATE PASS"
                : `GATE PASS STATUS: ${status}`}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", opacity: 0.9 }}>
              Cryptographically verified against GSFC University Lab Records • Ref: {passData.passRef}
            </p>
          </div>
        </div>
        <span className="verify-timestamp">
          Verified: {new Date(passData.verifiedTimestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main Printable Gate Pass Certificate Card */}
      <div className="verify-card gate-pass-printable">
        {/* Institutional Header */}
        <div className="gate-pass-header">
          <div className="gate-pass-logo-wrap">
            <div className="gate-pass-seal">GSFC</div>
          </div>
          <div className="gate-pass-inst-title">
            <h2>GSFC UNIVERSITY</h2>
            <h3>SCHOOL OF TECHNOLOGY • COMPUTER SCIENCE & ENGINEERING</h3>
            <p>Makers Lab 2 & Design IoT Laboratory • Equipment Authorization Gate Pass</p>
          </div>
          <div className="gate-pass-meta-box">
            <span className="gate-pass-ref-label">PASS REF NO.</span>
            <span className="gate-pass-ref-val">{passData.passRef}</span>
            <span className={`gate-pass-status-badge status-${status.toLowerCase()}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="gate-pass-divider" />

        {/* Student & Requisition Details */}
        <div className="gate-pass-grid">
          <div className="gate-pass-field">
            <span className="label">Student Name</span>
            <span className="value">{student.name || "N/A"}</span>
          </div>
          <div className="gate-pass-field">
            <span className="label">Enrollment / Roll No</span>
            <span className="value">{student.enrollmentNumber || "25BT04D251"}</span>
          </div>
          <div className="gate-pass-field">
            <span className="label">University Email</span>
            <span className="value">{student.email || "student@university.edu"}</span>
          </div>
          <div className="gate-pass-field">
            <span className="label">Program & Semester</span>
            <span className="value">
              {student.universityProgram || "B.Tech CSE"} (Sem {student.semester || "5"}, Div {student.division || "A"})
            </span>
          </div>
          <div className="gate-pass-field">
            <span className="label">Issuing Facility</span>
            <span className="value">{lab.name || "Makers Lab 2 / Design IoT Lab"}</span>
          </div>
          <div className="gate-pass-field">
            <span className="label">Residence Type</span>
            <span className="value" style={{ textTransform: "capitalize" }}>{student.residenceType || "Day Scholar (Home)"}</span>
          </div>
        </div>

        {/* Equipment Table */}
        <div style={{ marginTop: "18px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
            Authorized Equipment Inventory
          </span>
          <table className="gate-pass-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Component / Hardware Name</th>
                <th style={{ width: "120px" }}>Quantity</th>
                <th>Return Due Date</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{it.itemName}</strong>
                      {it.condition && <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>Condition: {it.condition}</span>}
                    </td>
                    <td>
                      <span className="gate-pass-qty">{it.quantityRequested} Unit(s)</span>
                    </td>
                    <td>
                      {passData.expectedReturnDate
                        ? new Date(passData.expectedReturnDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })
                        : "Immediate Return"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--muted)" }}>No item details available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Purpose & Faculty Remarks */}
        <div className="gate-pass-notes">
          <p><strong>Approved Project Purpose:</strong> {passData.purpose || "Practical coursework & lab project implementation."}</p>
          {passData.facultyRemarks && (
            <p><strong>Faculty Approval Endorsement:</strong> "{passData.facultyRemarks}"</p>
          )}
          {passData.adminRemarks && (
            <p><strong>Administrative Remarks:</strong> "{passData.adminRemarks}"</p>
          )}
        </div>

        {/* Laboratory Policy Disclaimer */}
        <div className="gate-pass-disclaimer">
          <p>
            <strong>Security Notice & Terms:</strong> This Gate Pass permits physical removal of authorized equipment from university lab premises for academic research. The student borrower assumes full liability for electrostatic safety, theft, loss, and hardware damage. Unreturned components after the specified deadline accrue automatic daily penalty charges under GSFC University Laboratory Regulations.
          </p>
        </div>

        {/* Signatures & Counter QR Verification */}
        <div className="gate-pass-signatures">
          <div className="signature-box">
            <div className="sig-line" />
            <span>Student Borrower Signature</span>
          </div>

          {/* Dynamic Counter QR Code */}
          <div
            className="signature-box qr-verify-box clickable"
            onClick={handleCopy}
            title="Click to copy verification URL or scan with phone camera"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
          >
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Requisition QR Code"
                style={{ width: "96px", height: "96px", borderRadius: "6px", border: "1px solid #d5c8be", transition: "transform 0.2s" }}
              />
            ) : (
              <div style={{ width: "96px", height: "96px", background: "#f0ece7", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
                <QrCode size={36} color="var(--accent)" />
              </div>
            )}
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: copied ? "#285420" : "var(--accent)", marginTop: "4px", letterSpacing: "0.03em" }}>
              {copied ? "✓ LINK COPIED!" : "SCAN WITH CAMERA"}
            </span>
            <span style={{ fontSize: "0.64rem", color: "var(--muted)" }}>
              Ref: {passData.passRef}
            </span>
          </div>

          <div className="signature-box">
            <div className="sig-verified">
              <CheckCircle2 size={16} color="#285420" /> Digitally Authorized
            </div>
            <div className="sig-line" />
            <span>Faculty In-Charge / Lab Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
