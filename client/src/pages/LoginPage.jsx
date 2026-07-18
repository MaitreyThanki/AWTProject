import { useState } from "react";
import { api } from "../api/http.js";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/login", { email, password, role });
      localStorage.setItem("token", response.data.token);
      setMessage(`Logged in as ${response.data.user.role}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={handleSubmit}>
        <h1>Lab Inventory Login</h1>
        <label className="form-label">
          Role
          <select className="form-select" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </label>
        <label className="form-label">
          Email
          <input className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="form-label">
          Password
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit">Login</button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </main>
  );
}

