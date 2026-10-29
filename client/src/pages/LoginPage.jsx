import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/http.js";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [universityProgram, setUniversityProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [stay, setStay] = useState("home");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password, role });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "faculty") {
        navigate("/faculty");
      } else {
        navigate("/student");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/student/register", {
        name,
        email,
        phone,
        universityProgram,
        semester,
        division,
        stay,
        password,
        confirmPassword
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/student");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-panel" style={{ maxWidth: isRegistering ? "480px" : "420px" }}>
        <h1>Lab Inventory Portal</h1>
        <p className="dashboard-subtitle">Makers Lab 2 & Design IoT Lab</p>

        <div className="tab-group" style={{ marginTop: "16px" }}>
          <button
            type="button"
            className={`tab-btn ${!isRegistering ? "active" : ""}`}
            onClick={() => {
              setIsRegistering(false);
              setMessage("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${isRegistering ? "active" : ""}`}
            onClick={() => {
              setIsRegistering(true);
              setRole("student");
              setMessage("");
            }}
          >
            Student Sign Up
          </button>
        </div>

        {!isRegistering ? (
          <form onSubmit={handleLogin}>
            <label className="form-label">
              Role
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </label>

            <label className="form-label">
              University Email
              <input
                className="form-control"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.edu"
              />
            </label>

            <label className="form-label">
              Password
              <input
                className="form-control"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label className="form-label">
              Full Name
              <input
                className="form-control"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
              />
            </label>

            <label className="form-label">
              University Email
              <input
                className="form-control"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="form-label">
                Phone Number
                <input
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                />
              </label>

              <label className="form-label">
                Program
                <input
                  className="form-control"
                  value={universityProgram}
                  onChange={(e) => setUniversityProgram(e.target.value)}
                  placeholder="e.g. B.Tech CS"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <label className="form-label">
                Semester
                <input
                  className="form-control"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="5"
                />
              </label>
              <label className="form-label">
                Division
                <input
                  className="form-control"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="B"
                />
              </label>
              <label className="form-label">
                Stay
                <select
                  className="form-select"
                  value={stay}
                  onChange={(e) => setStay(e.target.value)}
                >
                  <option value="home">Home</option>
                  <option value="hostel">Hostel</option>
                </select>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label className="form-label">
                Password
                <input
                  className="form-control"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              <label className="form-label">
                Confirm
                <input
                  className="form-control"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} type="submit" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>
        )}

        {message && <p className="form-message" style={{ color: message.includes("successful") ? "#385A2E" : "#8A3324" }}>{message}</p>}

        <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <Link to="/admin-login" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>
            Admin Portal (Authenticator OTP) →
          </Link>
        </div>
      </div>
    </main>
  );
}
