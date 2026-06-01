import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";

function ExpenseHead() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, totalPagesGet] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [searchHeads, setSearchHeads] = useState("");

  useEffect(() => {
    const fetchCategory = () => {
      axios
        .get(process.env.REACT_APP_API_URL + "/categories")
        .then((res) => {
          setCategories(res.data.results);
        })
        .catch((err) => console.log(err));
    };

    fetchCategory();
  }, []);

  const [editFormData, setEditFormData] = useState({
    head_name: "",
    status: "",
    hidden_id: "",
  });

  const [totalItem, setTotalItemGet] = useState(10);

  const handleTotalItemChange = (event) => {
    const newValue = event.target.value;
    if (event.target.id === "search-heads") {
      if (event.key === "Enter") setSearchHeads(newValue);
    } else {
      setTotalItemGet(newValue);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem, searchHeads]);

  const fetchData = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "/expense-heads", {
        params: { page: currentPage, limit: totalItem, getSearch: searchHeads },
      })
      .then((res) => {
        setData(res.data.results);
        setTotalCount(0);
        totalPagesGet(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const handlePageChange = ({ selected }) => setCurrentPage(selected + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editFormData.hidden_id !== "") {
      const expense_head = editFormData.hidden_id;
      axios
        .put(`${process.env.REACT_APP_API_URL}/update-expense-head/${expense_head}`, editFormData)
        .then(() => {
          setEditFormData({ head_name: "", status: "", hidden_id: "" });
          fetchData();
        })
        .catch((error) => console.error("Error updating data:", error));
    } else {
      try {
        await fetch(process.env.REACT_APP_API_URL + "/insert-expense-head", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        });
        setEditFormData({ head_name: "", status: "", hidden_id: "" });
        fetchData();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const editItem = (head_id) => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/epxense-head/${head_id}`)
      .then((response) => {
        const { id, head_name, status } = response.data.results[0];
        setEditFormData({
          head_name: head_name || "",
          status: status || "",
          hidden_id: id || "",
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  const deleteItem = (expense_head_id_for_deletion) => {
    if (!window.confirm("Are you sure you want to delete this expense head?")) return;
    axios
      .delete(`${process.env.REACT_APP_API_URL}/delete-expense-head/${expense_head_id_for_deletion}`)
      .then(() => fetchData())
      .catch((error) => console.error("Error deleting item:", error));
  };

  const resetForm = () =>
    setEditFormData({ head_name: "", status: "", hidden_id: "" });

  return (
    <div
      style={{
        fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif",
        background: "#faf5ff",
        minHeight: "100%",
        padding: 14,
      }}
    >
      <style>{`
        .eh-wrap { display:flex; gap:14px; flex-wrap:wrap; }
        .eh-card { background:#fff; border:1.5px solid #ddd6fe; border-radius:12px; overflow:hidden; box-shadow:0 4px 14px rgba(124,58,237,.08); flex:1; min-width:340px; display:flex; flex-direction:column; }
        .eh-head { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; padding:10px 16px; display:flex; align-items:center; gap:10px; }
        .eh-head-icon { width:32px;height:32px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fde68a;font-size:14px; }
        .eh-head-title { font-size:14px; font-weight:800; line-height:1.2; }
        .eh-head-sub { font-size:10px; color:rgba(255,255,255,.65); }
        .eh-body { padding:14px 16px; flex:1; display:flex; flex-direction:column; }
        .eh-field { margin-bottom:11px; }
        .eh-field label { display:block;font-size:10px;font-weight:700;color:#7c3aed;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px; }
        .eh-input { width:100%;padding:8px 11px;border:1.5px solid #ddd6fe;border-radius:7px;font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s;background:#fff;color:#1e293b; }
        .eh-input:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12); }
        .eh-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:6px; }
        .eh-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; }
        .eh-btn-primary { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; box-shadow:0 3px 10px rgba(124,58,237,.32); }
        .eh-btn-primary:hover { background:linear-gradient(135deg,#3b0764,#6d28d9); }
        .eh-btn-ghost { background:#f5f3ff; color:#7c3aed; border:1.5px solid #ddd6fe; }
        .eh-btn-ghost:hover { background:#ede9fe; }
        .eh-toolbar { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 16px; background:#faf5ff; border-bottom:1.5px solid #ede9fe; flex-wrap:wrap; }
        .eh-mini-select { padding:7px 10px; border:1.5px solid #ddd6fe; border-radius:7px; font-size:12px; outline:none; background:#fff; color:#1e293b; cursor:pointer; }
        .eh-search { padding:7px 11px; border:1.5px solid #ddd6fe; border-radius:7px; font-size:13px; outline:none; min-width:200px; background:#fff; }
        .eh-search:focus { border-color:#7c3aed; }
        .eh-table-wrap { overflow:auto; }
        .eh-tbl { width:100%; border-collapse:collapse; font-size:13px; }
        .eh-tbl thead tr { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; }
        .eh-tbl th { padding:10px 12px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; text-align:left; white-space:nowrap; }
        .eh-tbl td { padding:9px 12px; border-bottom:1px solid #f3e8ff; vertical-align:middle; color:#1e293b; }
        .eh-tbl tbody tr:nth-child(even) td { background:#fdf8ff; }
        .eh-tbl tbody tr:hover td { background:#f5f3ff; }
        .eh-id { color:#8b5cf6; font-weight:800; }
        .eh-status { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.4px; }
        .eh-status.on { background:#d1fae5; color:#047857; }
        .eh-status.off { background:#fee2e2; color:#b91c1c; }
        .eh-row-btn { background:none;border:none;cursor:pointer;padding:5px 8px;border-radius:6px;transition:all .15s;font-size:13px; }
        .eh-row-btn.edit { color:#7c3aed; }
        .eh-row-btn.edit:hover { background:#ede9fe; }
        .eh-row-btn.del { color:#ef4444; }
        .eh-row-btn.del:hover { background:#fee2e2; }
        .eh-empty { text-align:center; padding:36px 12px; color:#9ca3af; }
        .eh-empty i { font-size:42px; color:#e9d5ff; margin-bottom:10px; display:block; }
        .eh-loading { text-align:center; padding:24px; color:#7c3aed; font-weight:700; }
        .eh-pager { display:flex; justify-content:center; padding:12px; background:#faf5ff; border-top:1.5px solid #ede9fe; }
        .eh-pager .pagination { display:flex; gap:4px; list-style:none; padding:0; margin:0; }
        .eh-pager .page-item .page-link { display:inline-block; padding:6px 11px; border:1.5px solid #ddd6fe; border-radius:6px; color:#7c3aed; font-size:12px; font-weight:700; cursor:pointer; background:#fff; text-decoration:none; }
        .eh-pager .page-item.active .page-link { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; border-color:#7c3aed; }
        .eh-pager .page-item .page-link:hover { background:#f5f3ff; }
        .eh-edit-banner { background:#fef3c7; border:1.5px solid #fcd34d; color:#92400e; padding:7px 11px; border-radius:7px; font-size:12px; font-weight:700; margin-bottom:11px; display:flex; align-items:center; gap:7px; }
      `}</style>

      <div className="eh-wrap">
        {/* ── LEFT: Form Card ── */}
        <div className="eh-card" style={{ flex: "0 0 420px" }}>
          <div className="eh-head">
            <div className="eh-head-icon">
              <i className="fas fa-tags"></i>
            </div>
            <div>
              <div className="eh-head-title">
                {editFormData.hidden_id ? "Edit Expense Head" : "New Expense Head"}
              </div>
              <div className="eh-head-sub">Manage expense categories</div>
            </div>
          </div>

          <form className="eh-body" onSubmit={handleSubmit}>
            {editFormData.hidden_id && (
              <div className="eh-edit-banner">
                <i className="fas fa-pen"></i> Editing record #{editFormData.hidden_id}
              </div>
            )}

            <div className="eh-field">
              <label>Head Name</label>
              <input
                type="text"
                className="eh-input"
                id="head_name"
                name="head_name"
                placeholder="e.g. Electricity, Rent, Salaries..."
                value={editFormData.head_name || ""}
                onChange={(e) => setEditFormData({ ...editFormData, head_name: e.target.value })}
              />
            </div>

            <div className="eh-field">
              <label>Status</label>
              <select
                name="status"
                id="status"
                className="eh-input"
                value={editFormData.status || ""}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="">Select Status</option>
                <option value="On">On</option>
                <option value="Off">Off</option>
              </select>
            </div>

            <div className="eh-actions">
              {editFormData.hidden_id && (
                <button type="button" className="eh-btn eh-btn-ghost" onClick={resetForm}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
              <button type="submit" className="eh-btn eh-btn-primary" onClick={handleSubmit}>
                <i className={`fas ${editFormData.hidden_id ? "fa-sync-alt" : "fa-save"}`}></i>
                {editFormData.hidden_id ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: List Card ── */}
        <div className="eh-card">
          <div className="eh-head">
            <div className="eh-head-icon">
              <i className="fas fa-list"></i>
            </div>
            <div>
              <div className="eh-head-title">Expense Heads</div>
              <div className="eh-head-sub">All categories</div>
            </div>
          </div>

          <div className="eh-toolbar">
            <select value={totalItem} onChange={handleTotalItemChange} className="eh-mini-select">
              {[10, 20, 30, 40, 50].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>

            <div style={{ position: "relative" }}>
              <i
                className="fas fa-search"
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#a78bfa",
                  fontSize: 12,
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type="text"
                placeholder="Search expense head..."
                className="eh-search"
                id="search-heads"
                onKeyUp={handleTotalItemChange}
                style={{ paddingLeft: 30 }}
              />
            </div>
          </div>

          <div className="eh-table-wrap">
            <table className="eh-tbl">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>ID</th>
                  <th>Head</th>
                  <th style={{ width: 110, textAlign: "center" }}>Status</th>
                  <th style={{ width: 80, textAlign: "center" }}>Edit</th>
                  <th style={{ width: 80, textAlign: "center" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="eh-loading">
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="eh-empty">
                      <i className="fas fa-inbox"></i>
                      <div style={{ fontWeight: 700, color: "#7c3aed" }}>No expense heads found</div>
                      <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 4 }}>
                        Add a new head from the form
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td className="eh-id">#{item.id}</td>
                      <td style={{ fontWeight: 600 }}>{item.head_name}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`eh-status ${item.status === "On" ? "on" : "off"}`}>
                          <i
                            className={`fas ${item.status === "On" ? "fa-check-circle" : "fa-times-circle"}`}
                          ></i>
                          {item.status || "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="eh-row-btn edit"
                          onClick={() => editItem(item.id)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="eh-row-btn del"
                          onClick={() => deleteItem(item.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="eh-pager">
            <ReactPaginate
              previousLabel={"← Prev"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageChange}
              containerClassName={"pagination"}
              pageClassName={"page-item"}
              activeClassName={"active"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseHead;
