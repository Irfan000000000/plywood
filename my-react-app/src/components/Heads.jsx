import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Heads() {
  const [data, setData] = useState([]);
  const [suggestedData, getSuggestedData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const [editFormData, setEditFormData] = useState({
    head_name: "",
    hidden_id: "",
  });

  const [totalItem, setTotalItemGet] = useState(10);

  const fetchData = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "/heads-list", {
        params: { page: currentPage, limit: totalItem, getSearch: searchInvoice },
      })
      .then((res) => {
        setData(res.data.results);
        setTotalCount(0);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchSuggestionList();
  }, []);

  function fetchSuggestionList() {
    axios
      .get(process.env.REACT_APP_API_URL + "/get-all-items-for-suggestion", {
        params: { page: currentPage, limit: totalItem },
      })
      .then((res) => {
        getSuggestedData(res.data.results);
      })
      .catch((err) => console.log(err));
  }

  const handlePageChange = ({ selected }) => setCurrentPage(selected + 1);

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem, searchInvoice]);

  const handleTotalItemChange = (event) => {
    const newValue = event.target.value;
    if (event.target.id === "search-invoice") {
      if (event.key === "Enter") setSearchInvoice(newValue);
    } else {
      setTotalItemGet(newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!editFormData.head_name) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (editFormData.hidden_id !== "") {
      const itemId = editFormData.hidden_id;
      axios
        .put(`${process.env.REACT_APP_API_URL}/update-head/${itemId}`, editFormData)
        .then(() => {
          toast.success("Data updated successfully!");
          setSubmitted(false);
          setEditFormData({ ...editFormData, head_name: "", hidden_id: "" });
          fetchData();
          fetchSuggestionList();
        })
        .catch((error) => {
          console.error("Error updating data:", error);
          toast.error(error.response?.data?.error || "Update failed");
        });
    } else {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + "/insert-heads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        });
        if (response.ok) {
          toast.success("Data added successfully!");
          setSubmitted(false);
          setEditFormData({ ...editFormData, head_name: "", hidden_id: "" });
          fetchData();
          fetchSuggestionList();
        } else {
          throw new Error("Head Already Exist");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Head Already Exist");
      }
    }
  };

  const editItem = (item_id_get) => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/head-get/${item_id_get}`)
      .then((response) => {
        const { id, head_name } = response.data.results[0];
        setEditFormData({ head_name: head_name || "", hidden_id: id || "" });
        setSubmitted(false);
      })
      .catch((error) => console.error("Error:", error));
  };

  const deleteItem = (item_id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    axios
      .delete(`${process.env.REACT_APP_API_URL}/delete-head/${item_id}`)
      .then(() => fetchData())
      .catch((error) => console.error("Error deleting item:", error));
  };

  const resetForm = () => {
    setEditFormData({ head_name: "", hidden_id: "" });
    setSubmitted(false);
  };

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
        .hd-wrap { display:flex; gap:14px; flex-wrap:wrap; }
        .hd-card { background:#fff; border:1.5px solid #ddd6fe; border-radius:12px; overflow:hidden; box-shadow:0 4px 14px rgba(124,58,237,.08); flex:1; min-width:340px; display:flex; flex-direction:column; }
        .hd-head { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; padding:10px 16px; display:flex; align-items:center; gap:10px; }
        .hd-head-icon { width:32px;height:32px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fde68a;font-size:14px; }
        .hd-head-title { font-size:14px; font-weight:800; line-height:1.2; }
        .hd-head-sub { font-size:10px; color:rgba(255,255,255,.65); }
        .hd-body { padding:14px 16px; flex:1; display:flex; flex-direction:column; }
        .hd-field { margin-bottom:11px; }
        .hd-field label { display:block;font-size:10px;font-weight:700;color:#7c3aed;margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px; }
        .hd-input { width:100%;padding:8px 11px;border:1.5px solid #ddd6fe;border-radius:7px;font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s;background:#fff;color:#1e293b; }
        .hd-input:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12); }
        .hd-input.error { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.1); }
        .hd-error-msg { color:#ef4444; font-size:11px; font-weight:600; margin-top:4px; display:flex; align-items:center; gap:4px; }
        .hd-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:6px; }
        .hd-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; }
        .hd-btn-primary { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; box-shadow:0 3px 10px rgba(124,58,237,.32); }
        .hd-btn-primary:hover { background:linear-gradient(135deg,#3b0764,#6d28d9); }
        .hd-btn-ghost { background:#f5f3ff; color:#7c3aed; border:1.5px solid #ddd6fe; }
        .hd-btn-ghost:hover { background:#ede9fe; }
        .hd-toolbar { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 16px; background:#faf5ff; border-bottom:1.5px solid #ede9fe; flex-wrap:wrap; }
        .hd-mini-select { padding:7px 10px; border:1.5px solid #ddd6fe; border-radius:7px; font-size:12px; outline:none; background:#fff; color:#1e293b; cursor:pointer; }
        .hd-search { padding:7px 11px; border:1.5px solid #ddd6fe; border-radius:7px; font-size:13px; outline:none; min-width:200px; background:#fff; }
        .hd-search:focus { border-color:#7c3aed; }
        .hd-table-wrap { overflow:auto; }
        .hd-tbl { width:100%; border-collapse:collapse; font-size:13px; }
        .hd-tbl thead tr { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; }
        .hd-tbl th { padding:10px 12px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; text-align:left; white-space:nowrap; }
        .hd-tbl td { padding:9px 12px; border-bottom:1px solid #f3e8ff; vertical-align:middle; color:#1e293b; }
        .hd-tbl tbody tr:nth-child(even) td { background:#fdf8ff; }
        .hd-tbl tbody tr:hover td { background:#f5f3ff; }
        .hd-sr { color:#8b5cf6; font-weight:800; text-align:center; }
        .hd-row-btn { background:none;border:none;cursor:pointer;padding:5px 8px;border-radius:6px;transition:all .15s;font-size:13px; }
        .hd-row-btn.edit { color:#7c3aed; }
        .hd-row-btn.edit:hover { background:#ede9fe; }
        .hd-row-btn.del { color:#ef4444; }
        .hd-row-btn.del:hover { background:#fee2e2; }
        .hd-empty { text-align:center; padding:36px 12px; color:#9ca3af; }
        .hd-empty i { font-size:42px; color:#e9d5ff; margin-bottom:10px; display:block; }
        .hd-loading { text-align:center; padding:24px; color:#7c3aed; font-weight:700; }
        .hd-pager { display:flex; justify-content:center; padding:12px; background:#faf5ff; border-top:1.5px solid #ede9fe; }
        .hd-pager .pagination { display:flex; gap:4px; list-style:none; padding:0; margin:0; }
        .hd-pager .page-item .page-link { display:inline-block; padding:6px 11px; border:1.5px solid #ddd6fe; border-radius:6px; color:#7c3aed; font-size:12px; font-weight:700; cursor:pointer; background:#fff; text-decoration:none; }
        .hd-pager .page-item.active .page-link { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; border-color:#7c3aed; }
        .hd-pager .page-item .page-link:hover { background:#f5f3ff; }
        .hd-edit-banner { background:#fef3c7; border:1.5px solid #fcd34d; color:#92400e; padding:7px 11px; border-radius:7px; font-size:12px; font-weight:700; margin-bottom:11px; display:flex; align-items:center; gap:7px; }
      `}</style>

      <div className="hd-wrap">
        {/* ── LEFT: Form Card ── */}
        <div className="hd-card" style={{ flex: "0 0 380px" }}>
          <div className="hd-head">
            <div className="hd-head-icon">
              <i className="fas fa-first-aid"></i>
            </div>
            <div>
              <div className="hd-head-title">
                {editFormData.hidden_id ? "Edit Head" : "New Head"}
              </div>
              <div className="hd-head-sub">Manage head records</div>
            </div>
          </div>

          <form className="hd-body" onSubmit={handleSubmit}>
            {editFormData.hidden_id && (
              <div className="hd-edit-banner">
                <i className="fas fa-pen"></i> Editing record #{editFormData.hidden_id}
              </div>
            )}

            <div className="hd-field">
              <label>Name</label>
              <input
                type="text"
                className={`hd-input ${submitted && !editFormData.head_name ? "error" : ""}`}
                id="head_name"
                name="head_name"
                placeholder="Enter head name..."
                value={editFormData.head_name || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, head_name: e.target.value })
                }
              />
              {submitted && !editFormData.head_name && (
                <div className="hd-error-msg">
                  <i className="fas fa-exclamation-circle"></i> Name is required
                </div>
              )}
            </div>

            <div className="hd-actions">
              {editFormData.hidden_id && (
                <button type="button" className="hd-btn hd-btn-ghost" onClick={resetForm}>
                  <i className="fas fa-times"></i> Cancel
                </button>
              )}
              <button type="submit" className="hd-btn hd-btn-primary">
                <i className={`fas ${editFormData.hidden_id ? "fa-sync-alt" : "fa-save"}`}></i>
                {editFormData.hidden_id ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: List Card ── */}
        <div className="hd-card">
          <div className="hd-head">
            <div className="hd-head-icon">
              <i className="fas fa-list"></i>
            </div>
            <div>
              <div className="hd-head-title">Heads List</div>
              <div className="hd-head-sub">All records</div>
            </div>
          </div>

          <div className="hd-toolbar">
            <select value={totalItem} onChange={handleTotalItemChange} className="hd-mini-select">
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
                placeholder="Search..."
                className="hd-search"
                id="search-invoice"
                onKeyUp={handleTotalItemChange}
                style={{ paddingLeft: 30 }}
              />
            </div>
          </div>

          <div className="hd-table-wrap">
            <table className="hd-tbl">
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: "center" }}>Sr#</th>
                  <th>Name</th>
                  <th style={{ width: 80, textAlign: "center" }}>Edit</th>
                  <th style={{ width: 80, textAlign: "center" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="hd-loading">
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="hd-empty">
                      <i className="fas fa-inbox"></i>
                      <div style={{ fontWeight: 700, color: "#7c3aed" }}>No heads found</div>
                      <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 4 }}>
                        Add a new head from the form
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((supplier, index) => (
                    <tr key={index}>
                      <td className="hd-sr">{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{supplier.head_name}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="hd-row-btn edit"
                          onClick={() => editItem(supplier.id)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="hd-row-btn del"
                          onClick={() => deleteItem(supplier.id)}
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

          <div className="hd-pager">
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

export default Heads;
