import React, { useEffect, useState } from "react";
import { Printer, X, ShieldCheck, QrCode, Building, User, Calendar, CheckCircle2 } from "lucide-react";
import QRCode from "qrcode";

export default function GatePassModal({ request, onClose }) {
  if (!request) return null;

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const reqId = String(request._id || "").slice(-8).toUpperCase();
  const student = request.studentId || {};
  const labName = request.labId?.name || "Makers Lab 2 / Design IoT Lab";
  const items = request.items || [];
  const status = (request.status || "approved").toUpperCase();

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/requests?verify=${request._id}`
    : `AWT-PASS:${request._id}`;

  useEffect(() => {
    if (!request?._id) return;
    QRCode.toDataURL(verifyUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: "#5C381E",
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => {
        console.error("QR generation fallback to short string", err);
        QRCode.toDataURL(`AWT-PASS:${request._id}`, { width: 140, margin: 1 })
          .then((url) => setQrCodeUrl(url))
          .catch((e) => console.error(e));
      });
  }, [request]);

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal gate-pass-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px", padding: "0" }}
      >
        {/* Actions bar (hidden during print) */}
        <div className="gate-pass-toolbar no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--accent)" />
            <strong>Laboratory Equipment Gate Pass</strong>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
              <Printer size={16} /> Print Gate Pass / PDF
            </button>
            <button className="btn btn-outline" onClick={onClose} style={{ padding: "8px" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Gate Pass Document */}
        <div className="gate-pass-printable">
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
              <span className="gate-pass-ref-val">#GP-{reqId}</span>
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
              <span className="value">{labName}</span>
            </div>
            <div className="gate-pass-field">
              <span className="label">Residence Type</span>
              <span className="value" style={{ textTransform: "capitalize" }}>{student.residenceType || "Day Scholar (Home)"}</span>
            </div>
          </div>

          {/* Equipment Table */}
          <div style={{ marginTop: "16px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
              Authorized Component Inventory
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
                        {request.expectedReturnDate
                          ? new Date(request.expectedReturnDate).toLocaleDateString("en-IN", {
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
            <p><strong>Approved Project Purpose:</strong> {request.purpose || "Practical coursework & lab project implementation."}</p>
            {request.facultyRemarks && (
              <p><strong>Faculty Approval Endorsement:</strong> "{request.facultyRemarks}"</p>
            )}
            {request.adminRemarks && (
              <p><strong>Administrative Remarks:</strong> "{request.adminRemarks}"</p>
            )}
          </div>

          {/* Laboratory Policy Disclaimer */}
          <div className="gate-pass-disclaimer">
            <p>
              <strong>Notice & Terms:</strong> This Gate Pass permits physical removal of authorized equipment from university lab premises for academic research. The student borrower assumes full liability for electrostatic safety, theft, loss, and hardware damage. Unreturned components after the specified deadline accrue automatic daily penalty charges under GSFC University Laboratory Regulations.
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
              onClick={handleCopyLink}
              title="Click to copy verification URL or scan with phone camera"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
            >
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Requisition QR Code"
                  style={{ width: "92px", height: "92px", borderRadius: "6px", border: "1px solid #d5c8be", transition: "transform 0.2s" }}
                />
              ) : (
                <div style={{ width: "92px", height: "92px", background: "#f0ece7", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
                  <QrCode size={36} color="var(--accent)" />
                </div>
              )}
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: copied ? "#285420" : "var(--accent)", marginTop: "4px", letterSpacing: "0.03em" }}>
                {copied ? "✓ LINK COPIED!" : "SCAN WITH CAMERA"}
              </span>
              <span style={{ fontSize: "0.64rem", color: "var(--muted)" }}>
                Ref: #GP-{reqId}
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
    </div>
  );
}
