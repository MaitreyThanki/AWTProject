import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api/http.js";
import { Plus, Search, CheckCircle, Boxes, Tag, Shield, Clock, Send, Download, ArrowUpDown, XCircle } from "lucide-react";
import { exportToCsv } from "../utils/exportCsv.js";
import { useToast } from "../components/Toast.jsx";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { addToast } = useToast();

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

  // Filter and Sort
  const processedItems = useMemo(() => {
    return items
      .filter((item) => {
        const avail = item.availableQuantity ?? 0;
        if (stockFilter === "in_stock") return avail > 0;
        if (stockFilter === "low_stock") return avail > 0 && avail <= 3;
        if (stockFilter === "out_of_stock") return avail === 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "stock_desc") return (b.availableQuantity ?? 0) - (a.availableQuantity ?? 0);
        if (sortBy === "stock_asc") return (a.availableQuantity ?? 0) - (b.availableQuantity ?? 0);
        if (sortBy === "duration_asc") return (a.borrowDurationDays || 7) - (b.borrowDurationDays || 7);
        return 0;
      });
  }, [items, stockFilter, sortBy]);

  function handleExportCsv() {
    exportToCsv("Lab_Inventory_Catalog", [
      { key: "name", label: "Component Name" },
      { key: "assetCode", label: "Asset Code" },
      { key: "category", label: "Category" },
      { key: "labName", label: "Laboratory", formatter: (_, r) => r.labId?.name || "N/A" },
      { key: "totalQuantity", label: "Total Stock" },
      { key: "availableQuantity", label: "Available Stock" },
      { key: "condition", label: "Condition" },
      { key: "borrowDurationDays", label: "Max Borrow Days" },
      { key: "status", label: "Status" }
    ], processedItems);
    addToast("Exported inventory catalog as CSV", "success");
  }

  function handleClearFilters() {
    setSelectedLab("all");
    setSelectedCategory("all");
    setStockFilter("all");
    setSearch("");
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

      addToast(`Requisition for ${requestModalItem.name} submitted successfully!`, "success");
      setRequestModalItem(null);
      setPurpose("");
      setDocumentFile(null);
      fetchItems();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to submit request";
      addToast(errMsg, "error");
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
        condition: newItemCondition,
        description: newItemDesc
      });

      addToast(`Added "${newItemName}" to laboratory inventory!`, "success");
      setShowAddModal(false);
      setNewItemName("");
      setNewItemAssetCode("");
      setNewItemDesc("");
      fetchItems();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add item", "error");
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

  const hasActiveFilters = selectedLab !== "all" || selectedCategory !== "all" || stockFilter !== "all" || search.trim() !== "";

  return (
    <section>
      <div className="section-header">
        <div>
          <h1>Laboratory Equipment Inventory</h1>
          <p className="dashboard-subtitle">
            Browse hardware and components available across Makers Lab 2 & Design IoT Lab
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={handleExportCsv} title="Download CSV Catalog">
            <Download size={16} /> Export CSV
          </button>
          {isPrivileged && (
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Lab Tabs */}
      <div className="tab-group" style={{ marginBottom: "16px" }}>
        <button
          className={`tab-btn ${selectedLab === "all" ? "active" : ""}`}
          onClick={() => setSelectedLab("all")}
        >
          All Facilities ({labs.length} Labs)
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

      {/* Search & Sort Toolbar */}
      <div className="inventory-filters" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: "260px" }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by component name, sensor type, board model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "0 6px" }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ArrowUpDown size={16} color="var(--muted)" />
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: "180px", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}
          >
            <option value="name_asc">Name (A to Z)</option>
            <option value="stock_desc">Available Stock (High to Low)</option>
            <option value="stock_asc">Available Stock (Low to High)</option>
            <option value="duration_asc">Borrow Duration (Short to Long)</option>
          </select>
        </div>
      </div>

      {/* Category Pills & Availability Chips */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        {/* Categories */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Stock status pills */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            className={`filter-chip ${stockFilter === "all" ? "active" : ""}`}
            onClick={() => setStockFilter("all")}
          >
            All Stock
          </button>
          <button
            className={`filter-chip ${stockFilter === "in_stock" ? "active" : ""}`}
            onClick={() => setStockFilter("in_stock")}
            style={{ color: stockFilter === "in_stock" ? "var(--white)" : "#285420" }}
          >
            ● In Stock
          </button>
          <button
            className={`filter-chip ${stockFilter === "low_stock" ? "active" : ""}`}
            onClick={() => setStockFilter("low_stock")}
            style={{ color: stockFilter === "low_stock" ? "var(--white)" : "#70541C" }}
          >
            ● Low (≤3)
          </button>
          <button
            className={`filter-chip ${stockFilter === "out_of_stock" ? "active" : ""}`}
            onClick={() => setStockFilter("out_of_stock")}
            style={{ color: stockFilter === "out_of_stock" ? "var(--white)" : "#782C1D" }}
          >
            ● Out of Stock
          </button>
        </div>
      </div>

      {/* Results Header Counter & Clear Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--muted)", marginBottom: "16px" }}>
        <span>
          Showing <strong>{processedItems.length}</strong> of <strong>{items.length}</strong> components
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", fontWeight: 600 }}
          >
            <XCircle size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Grid of Equipment Cards */}
      {loading ? (
        <div className="empty-state">Loading laboratory inventory...</div>
      ) : processedItems.length === 0 ? (
        <div className="empty-state">
          <Boxes size={36} color="var(--muted)" />
          <p style={{ marginTop: "12px", fontSize: "1.05rem", fontWeight: 600 }}>No hardware found matching your criteria</p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Try adjusting your search terms, categories, or stock filters.</p>
          {hasActiveFilters && (
            <button className="btn btn-outline" onClick={handleClearFilters} style={{ marginTop: "12px" }}>
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="inventory-grid">
          {processedItems.map((item) => {
            const avail = item.availableQuantity ?? 0;
            const total = item.totalQuantity || 1;
            const availPct = Math.round((avail / total) * 100);
            const isOutOfStock = avail <= 0;
            const isLowStock = avail > 0 && avail <= 3;

            return (
              <div className="inventory-card" key={item._id}>
                <div className="card-top">
                  <span className="card-tag">{item.category}</span>
                  <span className={`badge ${isOutOfStock ? "badge-danger" : isLowStock ? "badge-warning" : "badge-success"}`}>
                    {isOutOfStock ? "Out of Stock" : isLowStock ? `Low: ${avail} Left` : `${avail} Available`}
                  </span>
                </div>

                <h3 className="card-title">{item.name}</h3>

                <div className="card-specs">
                  <div className="spec-item">
                    <span className="spec-label">Facility</span>
                    <span className="spec-value">{item.labId?.name || "Engineering Lab"}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Condition</span>
                    <span className="spec-value">{item.condition || "Operational"}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Max Duration</span>
                    <span className="spec-value">{item.borrowDurationDays || 7} Days</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Asset Code</span>
                    <span className="spec-value" style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{item.assetCode || "N/A"}</span>
                  </div>
                </div>

                {/* Stock progress meter */}
                <div style={{ marginTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--muted)", marginBottom: "4px" }}>
                    <span>Live Stock Availability</span>
                    <span>{avail} / {total} units ({availPct}%)</span>
                  </div>
                  <div className="stock-meter">
                    <div
                      className="stock-meter-fill"
                      style={{
                        width: `${availPct}%`,
                        background: isOutOfStock ? "var(--danger-text)" : isLowStock ? "var(--warning-text)" : "var(--success-text)"
                      }}
                    />
                  </div>
                </div>

                <div className="card-footer" style={{ marginTop: "18px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    disabled={isOutOfStock}
                    onClick={() => {
                      setRequestModalItem(item);
                      setRequestQuantity(1);
                      const returnDate = new Date();
                      returnDate.setDate(returnDate.getDate() + (item.borrowDurationDays || 7));
                      setExpectedReturnDate(returnDate.toISOString().split("T")[0]);
                    }}
                  >
                    {isOutOfStock ? "Currently Unavailable" : "Request to Borrow"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requisition Checkout Modal */}
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
                  Lab: {requestModalItem.labId?.name} | Available Stock: <strong>{requestModalItem.availableQuantity} units</strong>
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
