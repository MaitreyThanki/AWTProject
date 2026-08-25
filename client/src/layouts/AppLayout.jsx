import { Boxes, ClipboardList, Gauge, LogIn, WalletCards } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import React from "react";

const links = [
  { to: "/student", label: "Dashboard", icon: Gauge },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/requests", label: "Requests", icon: ClipboardList },
  { to: "/penalties", label: "Penalties", icon: WalletCards },
  { to: "/login", label: "Login", icon: LogIn }
];

export default function AppLayout() {
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
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

