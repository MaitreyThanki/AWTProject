import React, { useEffect, useState } from "react";
import { api } from "../api/http.js";
import { Plus, Search, CheckCircle, Boxes, Tag, Shield, Clock, Send } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Request modal state
  const [requestModalItem, setRequestModalItem] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add Item modal state (Admin / Faculty)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAssetCode, setNewItemAssetCode] = useState("");
  const [newItemLabId, setNewItemLabId] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Microcontrollers");
  const [newItemTotalQty, setNewItemTotalQty] = useState(5);
  const [newItemCondition, setNewItemCondition] = useState("Good");
  const [newItemDesc, setNewItemDesc] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isPrivileged = user?.role === "admin" || user?.role === "faculty";

  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedLab, selectedCategory, search]);

  async function fetchLabs() {
    try {
      const res = await api.get("/items/labs");
      setLabs(res.data);
      if (res.data.length > 0 && !newItemLabId) {
        setNewItemLabId(res.data[0]._id);
      }
    } catch (err) {
      console.warn("Could not load labs:", err.message);
    }
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const params = {};
      if (selectedLab !== "all") params.labId = selectedLab;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/items", { params });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBorrowSubmit(e) {
    e.preventDefault();
    if (!requestModalItem) return;

    setSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append(
        "items",
        JSON.stringify([
          {
            itemId: requestModalItem._id,
            quantityRequested: Number(requestQuantity)
          }
        ])
      );
      formData.append("expectedReturnDate", expectedReturnDate);
      formData.append("purpose", purpose);
      if (requestModalItem.labId?._id) {
        formData.append("labId", requestModalItem.labId._id);
      }
      if (documentFile) {
        formData.append("documents", documentFile);
      }

      await api.post("/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage(`Borrow request submitted for ${requestModalItem.name}! Awaiting faculty approval.`);
      setRequestModalItem(null);
      setDocumentFile(null);
      setPurpose("");
      fetchItems();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/items", {
        name: newItemName,
        assetCode: newItemAssetCode,
        labId: newItemLabId,
        category: newItemCategory,
        totalQuantity: Number(newItemTotalQty),
        availableQuantity: Number(newItemTotalQty),
        condition: newItemCondition,
        description: newItemDesc
      });
      setShowAddModal(false);
      setNewItemName("");
      setNewItemAssetCode("");
      setNewItemDesc("");
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  }

  const categories = [
    "all",
    "Microcontrollers",
    "Sensors",
    "Electronics",
    "Measuring instruments",
    "Mechanical tools"
  ];

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Lab Equipment Inventory</h1>
          <p className="dashboard-subtitle">Makers Lab 2 & Design IoT Lab — Search, check stock, and requisition</p>
        </div>
        {isPrivileged && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Equipment
          </button>
        )}
      </div>

      {message && (
        <div style={{ background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid #C4DCBE", padding: "14px 18px", borderRadius: "var(--radius-md)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 500 }}>
          <CheckCircle size={20} /> {message}
        </div>
      )}

      {/* Lab Tabs */}
      <div className="tab-group">
        <button
          className={`tab-btn ${selectedLab === "all" ? "active" : ""}`}
          onClick={() => setSelectedLab("all")}
        >
          All Labs ({items.length})
        </button>
        {labs.map((lab) => (
          <button
            key={lab._id}
            className={`tab-btn ${selectedLab === lab._id ? "active" : ""}`}
            onClick={() => setSelectedLab(lab._id)}
          >
            {lab.name}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0 14px", flex: 1, minWidth: "260px", boxShadow: "var(--shadow-sm)" }}>
          <Search size={18} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search items by name, asset code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", padding: "11px 12px", width: "100%", fontFamily: "inherit", fontSize: "0.92rem", background: "transparent" }}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "190px", height: "42px", boxShadow: "var(--shadow-sm)" }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="empty-state">Loading lab equipment...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Boxes size={36} color="var(--muted)" />
          <p style={{ margin: 0, fontWeight: 500 }}>No equipment matches your search or filter criteria.</p>
        </div>
      ) : (
        <div className="inventory-grid">
          {items.map((item) => {
            const percentage = item.totalQuantity > 0 ? (item.availableQuantity / item.totalQuantity) * 100 : 0;
            const meterColor = percentage > 50 ? "#346327" : percentage > 20 ? "#B8751E" : "#8D2F1E";

            return (
              <div className="inventory-card" key={item._id}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span className="badge badge-warning">
                      <Tag size={12} /> {item.labId?.name || "Lab Item"}
                    </span>
                    <span className={`badge ${item.availableQuantity > 0 ? "badge-success" : "badge-danger"}`}>
                      {item.availableQuantity > 0 ? `${item.availableQuantity} / ${item.totalQuantity} Available` : "Unavailable"}
                    </span>
                  </div>

                  <h3>{item.name}</h3>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)", display: "flex", gap: "10px", alignItems: "center" }}>
                    <span><code>{item.assetCode}</code></span>
                    <span>•</span>
                    <span>{item.category}</span>
                  </div>

                  {/* Stock Availability Meter */}
                  <div className="stock-meter-bar" title={`${percentage.toFixed(0)}% available in stock`}>
                    <div
                      className="stock-meter-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: meterColor
                      }}
                    />
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.45, opacity: 0.9 }}>
                    {item.description || "Lab equipment component for coursework and project development."}
                  </p>

                  <div style={{ fontSize: "0.82rem", color: "var(--muted)", borderTop: "1px solid var(--page)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} /> Allowed: <strong>{item.borrowDurationDays || 7} days</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Shield size={13} /> In-Charge: {item.labId?.facultyInchargeEmail || "faculty@university.edu"}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    disabled={item.availableQuantity <= 0 || user?.role !== "student"}
                    onClick={() => {
                      setRequestModalItem(item);
                      setRequestQuantity(1);
                      const defaultReturn = new Date();
                      defaultReturn.setDate(defaultReturn.getDate() + (item.borrowDurationDays || 7));
                      setExpectedReturnDate(defaultReturn.toISOString().split("T")[0]);
                    }}
                  >
                    {user?.role !== "student" ? "Students Only" : item.availableQuantity > 0 ? "Request to Borrow" : "Out of Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Borrow Request Modal */}
      {requestModalItem && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Borrow Equipment</h2>
              <button className="close-btn" onClick={() => setRequestModalItem(null)}>✕</button>
            </div>

            <form onSubmit={handleBorrowSubmit}>
              <div style={{ background: "var(--page)", border: "1px solid var(--border)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "18px" }}>
                <strong style={{ fontSize: "1.05rem", color: "var(--accent)" }}>{requestModalItem.name}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "4px" }}>
                  Lab: {requestModalItem.labId?.name} | Available Quantity: <strong>{requestModalItem.availableQuantity}</strong>
                </div>
              </div>

              <label className="form-label">
                Quantity Requested
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  max={requestModalItem.availableQuantity}
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Expected Return Date
                <input
                  className="form-control"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Purpose of Borrowing
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Capstone project prototype, lab experiment practical..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Approval / Permission Document (Optional, PDF or Image up to 5MB)
                <input
                  className="form-control"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                />
              </label>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRequestModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  <Send size={15} /> {submitting ? "Submitting..." : "Submit Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Add Equipment to Lab</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddItem}>
              <label className="form-label">
                Item Name
                <input
                  className="form-control"
                  required
                  placeholder="e.g. Raspberry Pi 4 Model B (8GB)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="form-label">
                  Asset Code
                  <input
                    className="form-control"
                    required
                    placeholder="e.g. ML2-RPI-008"
                    value={newItemAssetCode}
                    onChange={(e) => setNewItemAssetCode(e.target.value)}
                  />
                </label>
                <label className="form-label">
                  Lab Location
                  <select
                    className="form-select"
                    value={newItemLabId}
                    onChange={(e) => setNewItemLabId(e.target.value)}
                  >
                    {labs.map((l) => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="form-label">
                  Category
                  <select
                    className="form-select"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    <option value="Microcontrollers">Microcontrollers</option>
                    <option value="Sensors">Sensors</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Measuring instruments">Measuring instruments</option>
                    <option value="Mechanical tools">Mechanical tools</option>
                  </select>
                </label>

                <label className="form-label">
                  Total Inventory Units
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    value={newItemTotalQty}
                    onChange={(e) => setNewItemTotalQty(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="form-label">
                Description / Notes
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Model specifications, accessories, or lab restrictions..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Saving..." : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
