import axios from "axios";
import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import Select from "react-select";

function DailyExpense() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [getAllExpenseHead, setAllExpenseHead] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [formData, setFormData] = useState({
    expense_head_id: "",
    expense_head_id_for_report: "",
    head_name: "",
    from_date: "",
    to_date: "",
    search: "",
  });

  // Fetch expenses with server-side pagination
  // const fetchExpenses = async (
  //   page = currentPage,
  //   limit = itemsPerPage,
  //   shouldLoad = true
  // ) => {
  //   if (shouldLoad) setLoading(true);
  //   try {
  //     // const response = await fetch(
  //     //   `${process.env.REACT_APP_API_URL}/api/daily/expense?page=${page}&limit=${limit}${
  //     //     formData.expense_head_id_for_report
  //     //       ? `&expense_head_id_for_report=${formData.expense_head_id_for_report}`
  //     //       : ""
  //     //   }`
  //     // );
  //      const response = await fetch(
  //       `${process.env.REACT_APP_API_URL}/api/daily/expense?page=${page}&limit=${limit}`
  //     );
  //     const data = await response.json();

  //     setExpenses(data.expenses);
  //     setTotalCount(data.totalCount);
  //     setTotalPages(data.totalPages);
  //     setGrandTotal(data.grandTotal);
  //     setCurrentPage(data.currentPage);
  //   } catch (error) {
  //     console.error("Error fetching expenses:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchExpenses = async (
  page = currentPage,
  limit = itemsPerPage,
  shouldLoad = true
) => {
  if (shouldLoad) setLoading(true);
  try {
    let query = `page=${page}&limit=${limit}`;

    if (formData.expense_head_id_for_report) {
      query += `&expense_head_id_for_report=${formData.expense_head_id_for_report}`;
    }
    if (formData.from_date) {
      query += `&from_date=${formData.from_date}`;
    }
    if (formData.to_date) {
      query += `&to_date=${formData.to_date}`;
    }

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/daily/expense?${query}`
    );

    const data = await response.json();

    setExpenses(data.expenses);
    setTotalCount(data.totalCount);
    setTotalPages(data.totalPages);
    setGrandTotal(data.grandTotal);
    setCurrentPage(data.currentPage);
  } catch (error) {
    console.error("Error fetching expenses:", error);
  } finally {
    setLoading(false);
  }
};


  // Load expense heads
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "/get-all-transactions-heads")
      .then((res) => {
        setAllExpenseHead(res.data.results);
      })
      .catch((err) => console.log(err));
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    fetchExpenses(1, 100, false);
  }, [formData.expense_head_id_for_report, formData.to_date]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${process.env.REACT_APP_API_URL}/api/daily/expense/${editId}`
        : `${process.env.REACT_APP_API_URL}/api/daily/expense`;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          expense_date: expenseDate,
          expense_head_id: formData.expense_head_id,
        }),
      });

      setAmount("");
      // setExpenseDate("");
      setFormData({ expense_head_id: "", head_name: "" });
      setEditId(null);

      // Refetch
      const pageToFetch = editId ? currentPage : 1;
      await fetchExpenses(pageToFetch, itemsPerPage, false);
    } catch (error) {
      console.error("Error submitting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  // Edit expense
  const editExpense = (expense) => {
    setEditId(expense.id);
    setAmount(expense.amount);
    setExpenseDate(expense.expense_date?.slice(0, 10)); // format as yyyy-mm-dd
    setFormData({
      expense_head_id: expense.expense_head_id,
      head_name: expense.head_name,
    });
  };

  // Delete expense
  const deleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setLoading(true);
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/daily/expense/${id}`, {
          method: "DELETE",
        });

        const remainingItemsOnPage = expenses.length - 1;
        const pageToFetch =
          remainingItemsOnPage === 0 && currentPage > 1
            ? currentPage - 1
            : currentPage;

        await fetchExpenses(pageToFetch, itemsPerPage, false);
      } catch (error) {
        console.error("Error deleting expense:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle page change
  const handlePageChange = (selectedPage) => {
    const newPage = selectedPage.selected + 1;
    fetchExpenses(newPage, itemsPerPage, false);
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <>
      <style>{`
        /* ── Daily Expense Component (de-) ── */
        .de-wrapper {
          display: flex;
          height: 100%;
          font-family: 'Segoe UI', sans-serif;
          background: #f5f3ff;
        }

        /* ── Left Panel (Form) ── */
        .de-left {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #4c1d95 0%, #7c3aed 100%);
          min-height: 100%;
        }
        .de-left-header {
          padding: 18px 20px 12px;
          flex-shrink: 0;
        }
        .de-left-header h5 {
          margin: 0;
          color: #fde68a;
          font-size: 1.05rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .de-left-header p {
          margin: 4px 0 0;
          color: #c4b5fd;
          font-size: 0.78rem;
        }
        .de-form-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px 20px 16px;
        }
        .de-form-group { margin-bottom: 14px; }
        .de-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #ddd6fe;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .de-input {
          width: 100%;
          padding: 8px 11px;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 7px;
          background: rgba(255,255,255,0.12);
          color: #fff;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .de-input::-webkit-calendar-picker-indicator { filter: invert(1); }
        .de-input::placeholder { color: #c4b5fd; }
        .de-input:focus {
          border-color: #fde68a;
          background: rgba(255,255,255,0.18);
        }
        /* react-select overrides inside left panel */
        .de-form-body .react-select__control {
          background: rgba(255,255,255,0.12) !important;
          border: 1.5px solid rgba(255,255,255,0.2) !important;
          border-radius: 7px !important;
          box-shadow: none !important;
          min-height: 36px !important;
        }
        .de-form-body .react-select__control--is-focused {
          border-color: #fde68a !important;
        }
        .de-form-body .react-select__single-value { color: #fff !important; }
        .de-form-body .react-select__placeholder { color: #c4b5fd !important; }
        .de-form-body .react-select__input-container { color: #fff !important; }
        .de-form-body .react-select__indicator { color: #c4b5fd !important; }
        .de-form-body .react-select__indicator:hover { color: #fff !important; }
        .de-form-body .react-select__indicator-separator { background: rgba(255,255,255,0.2) !important; }
        .de-form-body .react-select__menu { border-radius: 8px !important; }
        .de-form-footer {
          flex-shrink: 0;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.15);
          display: flex;
          gap: 8px;
        }
        .de-btn-save {
          flex: 1;
          background: linear-gradient(135deg, #f59e0b, #fde68a);
          color: #1f2937;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: opacity 0.2s;
        }
        .de-btn-save:hover:not(:disabled) { opacity: 0.88; }
        .de-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .de-btn-clear {
          background: rgba(255,255,255,0.12);
          color: #ddd6fe;
          border: 1.5px solid rgba(255,255,255,0.2);
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .de-btn-clear:hover { background: rgba(255,255,255,0.2); }

        /* ── Right Panel (List) ── */
        .de-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .de-right-header {
          background: #fff;
          border-bottom: 2px solid #ede9fe;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          flex-shrink: 0;
        }
        .de-right-title {
          font-size: 1rem;
          font-weight: 700;
          color: #4c1d95;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* Summary cards */
        .de-summary-bar {
          display: flex;
          gap: 12px;
          padding: 12px 16px 0;
          flex-shrink: 0;
        }
        .de-card {
          flex: 1;
          background: #fff;
          border-radius: 10px;
          padding: 12px 16px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.08);
          border-left: 4px solid #7c3aed;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .de-card.green { border-left-color: #059669; }
        .de-card-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
        }
        .de-card-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1f2937;
        }
        .de-card-value.green { color: #059669; }

        /* Filter bar */
        .de-filter-bar {
          background: #fff;
          margin: 12px 16px 0;
          border-radius: 10px;
          padding: 12px 16px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.06);
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .de-filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 150px;
        }
        .de-filter-group label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #6d28d9;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .de-filter-input {
          padding: 7px 10px;
          border: 1.5px solid #ddd6fe;
          border-radius: 6px;
          font-size: 0.82rem;
          outline: none;
          color: #374151;
          width: 100%;
          box-sizing: border-box;
        }
        .de-filter-input:focus { border-color: #7c3aed; }
        /* react-select inside filter bar */
        .de-filter-bar .react-select__control {
          border: 1.5px solid #ddd6fe !important;
          border-radius: 6px !important;
          min-height: 36px !important;
          box-shadow: none !important;
        }
        .de-filter-bar .react-select__control--is-focused {
          border-color: #7c3aed !important;
        }
        .de-btn-apply {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          align-self: flex-end;
        }
        .de-btn-apply:hover:not(:disabled) { opacity: 0.88; }
        .de-btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }

        /* List body */
        .de-list-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px 16px;
        }
        .de-range-info {
          font-size: 0.78rem;
          color: #9ca3af;
          margin-bottom: 10px;
        }

        /* Table */
        .de-table-wrap {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.08);
          overflow: hidden;
          margin-bottom: 14px;
        }
        .de-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.865rem;
        }
        .de-table thead tr {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          color: #fff;
        }
        .de-table thead th {
          padding: 10px 14px;
          font-weight: 600;
          font-size: 0.73rem;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }
        .de-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.15s;
        }
        .de-table tbody tr:hover { background: #faf5ff; }
        .de-table tbody tr:last-child { border-bottom: none; }
        .de-table td {
          padding: 9px 14px;
          color: #374151;
          vertical-align: middle;
        }
        .de-empty {
          text-align: center;
          color: #9ca3af;
          padding: 36px !important;
          font-size: 0.875rem;
        }
        .de-spinner-cell {
          text-align: center;
          padding: 32px !important;
        }
        .de-spinner {
          width: 32px; height: 32px;
          border: 4px solid #ddd6fe;
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: de-spin 0.8s linear infinite;
          margin: 0 auto 8px;
        }
        @keyframes de-spin { to { transform: rotate(360deg); } }
        .de-btn-edit {
          border: none;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          background: #d1fae5;
          color: #065f46;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: background 0.15s;
        }
        .de-btn-edit:hover:not(:disabled) { background: #a7f3d0; }
        .de-btn-edit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Pagination */
        .de-pagination {
          display: flex;
          justify-content: center;
          padding-top: 4px;
        }
        .de-pagination .pagination {
          display: flex;
          gap: 4px;
          list-style: none;
          padding: 0;
          margin: 0;
          flex-wrap: wrap;
          justify-content: center;
        }
        .de-pagination .page-item .page-link {
          padding: 5px 11px;
          border: 1.5px solid #ddd6fe;
          border-radius: 6px;
          color: #7c3aed;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          background: #fff;
          text-decoration: none;
          transition: all 0.15s;
        }
        .de-pagination .page-item.active .page-link {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          border-color: #7c3aed;
        }
        .de-pagination .page-item .page-link:hover { background: #f3e8ff; }
        .de-pagination .page-item.disabled .page-link { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="de-wrapper">

        {/* ── Left: Form ── */}
        <div className="de-left">
          <div className="de-left-header">
            <h5><i className="fas fa-plus-circle"></i> Daily Expense</h5>
            <p>{editId ? "Editing an existing entry" : "Add a new expense entry"}</p>
          </div>

          <form className="de-form-body" onSubmit={handleSubmit}>
            <div className="de-form-group">
              <label className="de-label"><i className="fas fa-calendar-day" style={{marginRight:4}}></i>Expense Date</label>
              <input
                type="date"
                required
                className="de-input"
                id="expense_date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="de-form-group">
              <label className="de-label"><i className="fas fa-tag" style={{marginRight:4}}></i>Expense Head</label>
              <Select
                classNamePrefix="react-select"
                id="expense_head_id"
                name="expense_head_id"
                value={
                  formData.expense_head_id
                    ? { value: formData.expense_head_id, label: formData.head_name }
                    : null
                }
                options={[
                  { value: "", label: "Select Head" },
                  ...getAllExpenseHead.map((e) => ({ value: e.id, label: e.head_name })),
                ]}
                onChange={(opt) => setFormData({ expense_head_id: opt.value, head_name: opt.label })}
                placeholder="Select Expense Head"
              />
            </div>

            <div className="de-form-group">
              <label className="de-label"><i className="fas fa-money-bill-wave" style={{marginRight:4}}></i>Amount</label>
              <input
                type="number"
                step="0.01"
                required
                className="de-input"
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
          </form>

          <div className="de-form-footer">
            <button className="de-btn-save" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> {editId ? "Updating…" : "Saving…"}</>
              ) : (
                <><i className="fas fa-save"></i> {editId ? "Update Expense" : "Add Expense"}</>
              )}
            </button>
            {editId && (
              <button
                className="de-btn-clear"
                onClick={() => { setEditId(null); setAmount(""); setExpenseDate(""); setFormData({ expense_head_id: "", head_name: "" }); }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* ── Right: List ── */}
        <div className="de-right">
          <div className="de-right-header">
            <div className="de-right-title">
              <i className="fas fa-list-alt"></i> Daily Expense List
            </div>
            <small style={{color:"#9ca3af",fontSize:"0.78rem"}}>
              Showing {totalCount > 0 ? startIndex : 0}–{endIndex} of {totalCount} entries
            </small>
          </div>

          {/* Summary Cards */}
          <div className="de-summary-bar">
            <div className="de-card">
              <div className="de-card-label">Total Records</div>
              <div className="de-card-value">
                {loading ? "…" : totalCount.toLocaleString()}
              </div>
            </div>
            <div className="de-card green">
              <div className="de-card-label">Grand Total</div>
              <div className="de-card-value green">
                {loading ? "…" : parseFloat(grandTotal || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="de-filter-bar">
            <div className="de-filter-group">
              <label><i className="fas fa-calendar-alt" style={{marginRight:4}}></i>From Date</label>
              <input
                type="date"
                className="de-filter-input"
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
              />
            </div>
            <div className="de-filter-group">
              <label><i className="fas fa-calendar-alt" style={{marginRight:4}}></i>To Date</label>
              <input
                type="date"
                className="de-filter-input"
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
              />
            </div>
            <div className="de-filter-group" style={{minWidth:180}}>
              <label><i className="fas fa-tag" style={{marginRight:4}}></i>Expense Head</label>
              <Select
                classNamePrefix="react-select"
                id="expense_head_id_for_report"
                value={
                  formData.expense_head_id_for_report
                    ? { value: formData.expense_head_id_for_report, label: formData.head_name }
                    : null
                }
                options={[
                  { value: "", label: "All Heads" },
                  ...getAllExpenseHead.map((e) => ({ value: e.id, label: e.head_name })),
                ]}
                onChange={(opt) => setFormData({ ...formData, expense_head_id_for_report: opt.value, head_name: opt.label })}
                placeholder="All Heads"
              />
            </div>
            <button
              className="de-btn-apply"
              onClick={() => fetchExpenses(1, itemsPerPage, true)}
              disabled={loading}
            >
              <i className="fas fa-filter"></i> Apply Filters
            </button>
          </div>

          {/* Table */}
          <div className="de-list-body">
            <div className="de-table-wrap">
              <table className="de-table">
                <thead>
                  <tr>
                    <th style={{width:50}}>Sr.</th>
                    <th>Date</th>
                    <th>Expense Head</th>
                    <th style={{textAlign:"right"}}>Amount</th>
                    <th style={{textAlign:"center"}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="de-spinner-cell">
                        <div className="de-spinner"></div>
                        <div style={{fontSize:"0.82rem",color:"#7c3aed"}}>Loading expenses…</div>
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="de-empty">
                        <i className="fas fa-receipt" style={{fontSize:"2rem",opacity:0.2,display:"block",marginBottom:8}}></i>
                        No expense records found
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense, index) => {
                      const d   = new Date(expense.expense_date);
                      const day = String(d.getDate()).padStart(2, "0");
                      const mon = String(d.getMonth() + 1).padStart(2, "0");
                      const yr  = d.getFullYear();
                      return (
                        <tr key={expense.id}>
                          <td style={{color:"#9ca3af",fontSize:"0.8rem"}}>{startIndex + index}</td>
                          <td style={{fontWeight:600,color:"#4c1d95"}}>{`${day}-${mon}-${yr}`}</td>
                          <td>{expense.head_name}</td>
                          <td style={{textAlign:"right",fontWeight:700}}>
                            {parseFloat(expense.amount).toFixed(2)}
                          </td>
                          <td style={{textAlign:"center"}}>
                            <button
                              className="de-btn-edit"
                              onClick={() => editExpense(expense)}
                              disabled={loading}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="de-pagination">
                <ReactPaginate
                  previousLabel="← Prev"
                  nextLabel="Next →"
                  breakLabel="..."
                  pageCount={totalPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageChange}
                  forcePage={currentPage - 1}
                  containerClassName="pagination"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item"
                  previousLinkClassName="page-link"
                  nextClassName="page-item"
                  nextLinkClassName="page-link"
                  breakClassName="page-item"
                  breakLinkClassName="page-link"
                  activeClassName="active"
                  disabledClassName="disabled"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default DailyExpense;
