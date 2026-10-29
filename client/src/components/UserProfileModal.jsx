import React, { useState } from "react";
import { X, User, Lock, Mail, Phone, BookOpen, Building, Check, AlertCircle } from "lucide-react";
import { api } from "../api/http.js";

export default function UserProfileModal({ user, onClose, onUserUpdated }) {
  if (!user) return null;

  const [activeTab, setActiveTab] = useState("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="user-avatar" style={{ width: "42px", height: "42px", fontSize: "1.1rem" }}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{user.name}</h2>
              <span className={`badge badge-${user.role === "admin" ? "danger" : user.role === "faculty" ? "info" : "success"}`} style={{ textTransform: "capitalize" }}>
                {user.role} Account
              </span>
            </div>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="tab-group" style={{ marginBottom: "20px" }}>
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setError(""); setMessage(""); }}
          >
            Academic Profile
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => { setActiveTab("security"); setError(""); setMessage(""); }}
          >
            Security & Password
          </button>
        </div>

        {activeTab === "profile" ? (
          <div>
            <div className="gate-pass-grid" style={{ background: "var(--page-alt)", padding: "16px", borderRadius: "var(--radius-md)" }}>
              <div className="gate-pass-field">
                <span className="label"><Mail size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> University Email</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="gate-pass-field">
                <span className="label"><Phone size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Phone Number</span>
                <span className="value">{user.phone || "Not specified"}</span>
              </div>
              {user.role === "student" && (
                <>
                  <div className="gate-pass-field">
                    <span className="label"><BookOpen size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Enrollment Number</span>
                    <span className="value">{user.enrollmentNumber || "25BT04D251"}</span>
                  </div>
                  <div className="gate-pass-field">
                    <span className="label">Program & Class</span>
                    <span className="value">{user.universityProgram || "B.Tech CSE"} (Sem {user.semester || "5"}, Div {user.division || "A"})</span>
                  </div>
                  <div className="gate-pass-field">
                    <span className="label"><Building size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Residence Type</span>
                    <span className="value" style={{ textTransform: "capitalize" }}>{user.residenceType || "Home"}</span>
                  </div>
                </>
              )}
              {user.assignedLabId && (
                <div className="gate-pass-field">
                  <span className="label">Assigned Laboratory</span>
                  <span className="value">Designated Lab In-Charge</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange}>
            {error && (
              <div style={{ background: "var(--danger-bg)", color: "var(--danger-text)", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            {message && (
              <div style={{ background: "var(--success-bg)", color: "var(--success-text)", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
                <Check size={16} /> {message}
              </div>
            )}

            <label className="form-label">
              Current Password
              <input
                className="form-control"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </label>

            <label className="form-label">
              New Password
              <input
                className="form-control"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </label>

            <label className="form-label">
              Confirm New Password
              <input
                className="form-control"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Lock size={15} style={{ marginRight: "6px" }} />
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
