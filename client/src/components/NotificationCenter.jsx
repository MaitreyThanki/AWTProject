import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PackageCheck,
  RotateCcw,
  Info,
  Check,
  Trash2,
  ShieldAlert
} from "lucide-react";
import { api } from "../api/http.js";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const dropdownRef = useRef(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicked outside
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const [reqRes, dashRes] = await Promise.all([
        api.get("/requests").catch(() => ({ data: [] })),
        api.get("/dashboard").catch(() => ({ data: {} }))
      ]);

      const requests = reqRes.data || [];
      const metrics = dashRes.data?.metrics || {};
      const generatedList = [];

      const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");

      // 1. Requisition status updates
      requests.forEach((r) => {
        const reqShort = String(r._id).slice(-6);
        const itemNames = r.items?.map((i) => i.itemName).join(", ") || "Hardware";
        const date = r.updatedAt || r.createdAt || new Date();

        if (r.status === "approved") {
          generatedList.push({
            id: `notif-appr-${r._id}`,
            title: `Requisition #${reqShort} Approved`,
            message: `Your request for ${itemNames} has been approved. Gate pass ready for counter collection.`,
            type: "success",
            icon: CheckCircle2,
            timestamp: date,
            read: readIds.includes(`notif-appr-${r._id}`)
          });
        } else if (r.status === "issued") {
          generatedList.push({
            id: `notif-iss-${r._id}`,
            title: `Hardware In Possession: #${reqShort}`,
            message: `${itemNames} currently issued. Return deadline: ${r.expectedReturnDate ? new Date(r.expectedReturnDate).toLocaleDateString() : "Immediate"}.`,
            type: "info",
            icon: PackageCheck,
            timestamp: date,
            read: readIds.includes(`notif-iss-${r._id}`)
          });
        } else if (r.status === "overdue") {
          generatedList.push({
            id: `notif-ovd-${r._id}`,
            title: `OVERDUE NOTICE: #${reqShort}`,
            message: `Return deadline passed for ${itemNames}. Please return immediately to avoid daily penalty.`,
            type: "warning",
            icon: AlertTriangle,
            timestamp: date,
            read: readIds.includes(`notif-ovd-${r._id}`)
          });
        } else if (r.status === "returned") {
          generatedList.push({
            id: `notif-ret-${r._id}`,
            title: `Return Verified: #${reqShort}`,
            message: `${itemNames} restocked into Makers Lab inventory.`,
            type: "neutral",
            icon: RotateCcw,
            timestamp: date,
            read: readIds.includes(`notif-ret-${r._id}`)
          });
        }
      });

      // 2. Due soon alerts
      if (metrics.dueSoon > 0 && user?.role === "student") {
        const id = `notif-due-soon`;
        generatedList.unshift({
          id,
          title: "Hardware Return Due Soon",
          message: `You have ${metrics.dueSoon} item(s) due for lab return within the next 72 hours.`,
          type: "warning",
          icon: Clock,
          timestamp: new Date(),
          read: readIds.includes(id)
        });
      }

      // 3. Penalty alerts
      if (metrics.penaltyTotal > 0 && user?.role === "student") {
        const id = `notif-penalty-alert`;
        generatedList.unshift({
          id,
          title: "Outstanding Lab Penalty",
          message: `₹${metrics.penaltyTotal} pending penalty balance. Settle at lab counter for No-Dues clearance.`,
          type: "danger",
          icon: ShieldAlert,
          timestamp: new Date(),
          read: readIds.includes(id)
        });
      }

      // 4. Faculty pending approvals alert
      if (metrics.pendingRequests > 0 && user?.role === "faculty") {
        const id = `notif-faculty-pending`;
        generatedList.unshift({
          id,
          title: "Student Requests Pending",
          message: `${metrics.pendingRequests} student requisition(s) require your review and decision.`,
          type: "info",
          icon: Clock,
          timestamp: new Date(),
          read: readIds.includes(id)
        });
      }

      // Sort newest first
      generatedList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(generatedList);
    } catch (err) {
      console.error("Failed to compile notifications:", err);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id) {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    const readIds = updated.filter((n) => n.read).map((n) => n.id);
    localStorage.setItem("read_notifications", JSON.stringify(readIds));
  }

  function markAllAsRead() {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    const readIds = updated.map((n) => n.id);
    localStorage.setItem("read_notifications", JSON.stringify(readIds));
  }

  function clearAll() {
    setNotifications([]);
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem("read_notifications", JSON.stringify(allIds));
  }

  const displayedList = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        className="notif-trigger-btn"
        onClick={() => setOpen(!open)}
        title="View lab notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-popover">
          <div className="notif-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "0.92rem", color: "var(--text)" }}>Lab Notifications</strong>
              {unreadCount > 0 && (
                <span className="badge-pill" style={{ backgroundColor: "#8E5830", color: "#fff", fontSize: "0.7rem", padding: "1px 7px" }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {unreadCount > 0 && (
                <button
                  className="notif-text-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <Check size={13} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notif-text-btn"
                  onClick={clearAll}
                  title="Clear all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="notif-filter-bar">
            <button
              className={`notif-filter-chip ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`notif-filter-chip ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="notif-list">
            {displayedList.length === 0 ? (
              <div className="notif-empty">
                <Bell size={24} style={{ opacity: 0.3 }} />
                <p>No notifications at this time.</p>
              </div>
            ) : (
              displayedList.map((notif) => {
                const IconComponent = notif.icon || Info;
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${notif.read ? "read" : "unread"} type-${notif.type}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="notif-item-icon">
                      <IconComponent size={16} />
                    </div>
                    <div className="notif-item-content">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <strong className="notif-title">{notif.title}</strong>
                        <span className="notif-time">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="notif-msg">{notif.message}</p>
                    </div>
                    {!notif.read && <span className="notif-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
