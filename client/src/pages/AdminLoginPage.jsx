import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/http.js";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleAdminLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/admin/login", {
        email,
        otp: otp.trim()
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Administrator login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-panel">
        <h1>Administrator Portal</h1>
        <p className="dashboard-subtitle">Makers Lab 2 & Design IoT Lab</p>

        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "14px 0" }}>
          Admin access requires OTP verification from your mobile authenticator app.
        </p>

        <form onSubmit={handleAdminLogin}>
          <label className="form-label">
            University Admin Email
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              required
            />
          </label>

          <label className="form-label">
            Authenticator Code (6-digit OTP)
            <input
              className="form-control"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 123456"
              required
            />
          </label>

          <button className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>

          {error && <p className="form-message" style={{ color: "#8A3324" }}>{error}</p>}
        </form>

        <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <Link to="/login" style={{ color: "var(--accent)", fontSize: "0.85rem", textDecoration: "none" }}>
            ← Back to Student & Faculty Login
          </Link>
        </div>
      </div>
    </main>
  );
}
