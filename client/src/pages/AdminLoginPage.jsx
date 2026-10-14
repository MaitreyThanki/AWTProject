import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http.js";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleAdminLogin(event) {
    event.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/admin/login", {
        email,
        otp,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Administrator login failed"
      );
    }
  }

  return (
    <main>
      <h1>Administrator Login</h1>

      <form onSubmit={handleAdminLogin}>
        <label htmlFor="email">University Admin Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="otp">Authenticator Code</label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="6-digit code"
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit">Verify and Sign In</button>
      </form>
    </main>
  );
}