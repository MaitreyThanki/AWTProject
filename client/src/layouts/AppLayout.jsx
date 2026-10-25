import React from "react";
import { Boxes, ClipboardList, Gauge, LogIn, LogOut, ShieldAlert, WalletCards, UserCheck } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
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
      <aside className="sidebar">
        <div className="brand">Lab Inventory</div>
        <nav className="nav flex-column gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} className="nav-link" to={to}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
          {!token ? (
            <Link className="nav-link" to="/login">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          ) : (
            <button
              type="button"
              className="nav-link"
              onClick={handleLogout}
              style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </nav>

        {user && (
          <div className="user-badge">
            <div>
              <strong style={{ display: "block" }}>{user.name}</strong>
              <span style={{ textTransform: "capitalize", opacity: 0.85 }}>{user.role}</span>
            </div>
          </div>
        )}
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
