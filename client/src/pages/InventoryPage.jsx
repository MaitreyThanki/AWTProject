import React, { useEffect, useState } from "react";
import { api } from "../api/http.js";
import { Plus, Search, Filter, CheckCircle, Upload, Boxes } from "lucide-react";

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
          <h1>Lab Inventory</h1>
          <p className="dashboard-subtitle">Browse and request equipment across lab facilities</p>
        </div>
        {isPrivileged && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Inventory Item
          </button>
        )}
      </div>

      {message && (
        <div style={{ background: "#DDE9D8", color: "#385A2E", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle size={18} /> {message}
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

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", flex: 1, minWidth: "220px" }}>
          <Search size={18} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search items, asset code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", padding: "9px 10px", width: "100%", fontFamily: "inherit" }}
          />
        </div>

        <select
          className="form-select"
          style={{ width: "auto", minWidth: "180px" }}
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
        <div className="empty-state">Loading lab inventory...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Boxes size={32} />
          <p>No inventory items found matching your filters.</p>
        </div>
      ) : (
        <div className="inventory-grid">
          {items.map((item) => (
            <div className="inventory-card" key={item._id}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span className="badge badge-warning">{item.labId?.name || "Lab Item"}</span>
                  <span className={`badge ${item.availableQuantity > 0 ? "badge-success" : "badge-danger"}`}>
                    {item.availableQuantity > 0 ? `${item.availableQuantity} / ${item.totalQuantity} Available` : "Out of Stock"}
                  </span>
                </div>
                <h3 style={{ margin: "4px 0", color: "var(--accent)" }}>{item.name}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "2px 0 8px" }}>Asset: {item.assetCode} • {item.category}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--ink)", margin: "6px 0 14px", lineHeight: 1.4 }}>
                  {item.description || "No description provided."}
                </p>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                  <div>Max Borrow: {item.borrowDurationDays || 7} days</div>
                  <div>In-Charge: {item.labId?.facultyInchargeEmail || "faculty@university.edu"}</div>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
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
                  {user?.role !== "student" ? "Students Only" : item.availableQuantity > 0 ? "Request to Borrow" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Borrow Request Modal */}
      {requestModalItem && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>Borrow Request</h2>
              <button className="close-btn" onClick={() => setRequestModalItem(null)}>✕</button>
            </div>

            <form onSubmit={handleBorrowSubmit}>
              <div style={{ background: "var(--page)", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <strong>{requestModalItem.name}</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Lab: {requestModalItem.labId?.name} | Available: {requestModalItem.availableQuantity}
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
                  placeholder="e.g. Project prototype development, coursework lab practical..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Approval / Permission Document (Optional, max 5MB PDF/PNG)
                <input
                  className="form-control"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                />
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRequestModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
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
              <h2>Add Inventory Item</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddItem}>
              <label className="form-label">
                Item Name
                <input
                  className="form-control"
                  required
                  placeholder="e.g. Arduino Mega 2560"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label className="form-label">
                  Asset Code
                  <input
                    className="form-control"
                    required
                    placeholder="e.g. ML2-ARD-009"
                    value={newItemAssetCode}
                    onChange={(e) => setNewItemAssetCode(e.target.value)}
                  />
                </label>
                <label className="form-label">
                  Lab
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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
                  Total Quantity
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
                Description
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Specification and usage..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "Saving..." : "Add to Lab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
