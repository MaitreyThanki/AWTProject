import React, { useState } from "react";
import {
  Boxes,
  ClipboardList,
  Gauge,
  LogIn,
  LogOut,
  ShieldAlert,
  WalletCards,
  UserCheck,
  Compass,
  User as UserIcon,
  Settings
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import UserProfileModal from "../components/UserProfileModal.jsx";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [showProfileModal, setShowProfileModal] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    user = null;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const role = user?.role || "guest";

  const links = [
    { to: "/inventory", label: "Inventory", icon: Boxes },
    ...(role === "student" ? [{ to: "/student", label: "My Dashboard", icon: Gauge }] : []),
    ...(role === "faculty" ? [{ to: "/faculty", label: "Faculty Panel", icon: UserCheck }] : []),
    ...(role === "admin" ? [{ to: "/admin", label: "Admin Panel", icon: ShieldAlert }] : []),
    ...(role !== "guest" ? [{ to: "/requests", label: "Requests", icon: ClipboardList }] : []),
    ...(role !== "guest" ? [{ to: "/penalties", label: "Penalties", icon: WalletCards }] : [])
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <div>
          <div className="brand">
            <div className="brand-icon">
              <Compass size={22} color="var(--white)" />
            </div>
            <div>
              <span style={{ display: "block", fontSize: "1.05rem" }}>Lab Inventory</span>
              <span style={{ fontSize: "0.72rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
                Equipment Portal
              </span>
            </div>
          </div>

          <nav className="nav">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  to={to}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                </Link>
              );
            })}

            {!token ? (
              <Link className="nav-link" to="/login">
                <LogIn size={19} />
                <span>Sign In</span>
              </Link>
            ) : (
              <button
                type="button"
                className="nav-link nav-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={19} />
                <span>Sign Out</span>
              </button>
            )}
          </nav>
        </div>

        {user && (
          <div
            className="user-badge clickable"
            onClick={() => setShowProfileModal(true)}
            title="Click to view profile & settings"
            style={{ cursor: "pointer", transition: "all 0.2s" }}
          >
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <strong>{user.name}</strong>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {user.role} <Settings size={12} style={{ opacity: 0.7 }} />
              </span>
            </div>
          </div>
        )}
      </aside>

      <main className="content">
        <Outlet />
      </main>

      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUserUpdated={() => {
            // refresh user if needed
          }}
        />
      )}
    </div>
  );
}
