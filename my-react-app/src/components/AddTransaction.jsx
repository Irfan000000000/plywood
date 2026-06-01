import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddTransaction({ onClose }) {
  const [payments, setPayments] = useState([]);
  const [getAmount, setAmount] = useState("");
  const [amountDate, setAmountDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [getAllBanks, setAllBanks] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [getAllHeads, setAllHeads] = useState([]);

  const [closingBalanceBeforeDate, setClosingBalanceBeforeDate] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  const [formData, setFormData] = useState({
    bank_id_for_report: "",
    head_id_for_report: "",
  });

  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    search: "",
  });

  // ── Fetch transactions ──
  const fetchPayments = async (bank_id, shouldLoad = true) => {
    if (shouldLoad) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (bank_id) params.append("bank_id", bank_id);
      if (filters.date_from) {
        params.append("date_from", filters.date_from);
      } else {
        params.append("date_from", amountDate);
      }
      if (filters.date_to) params.append("date_to", filters.date_to);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/payments/bank/transactions?${params}`
      );
      const data = await response.json();
      setPayments(data.transactions || []);
      setClosingBalanceBeforeDate(data.closingBalanceBeforeDate || 0);
      setCurrentBalance(data.currentBalance || 0);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
      setClosingBalanceBeforeDate(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "/get-all-banks")
      .then((res) => setAllBanks(res.data.results || []))
      .catch(() => setAllBanks([]));
  }, []);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "/get-all-transactions-heads")
      .then((res) => setAllHeads(res.data.results || []))
      .catch(() => setAllHeads([]));
  }, []);

  useEffect(() => {
    if (formData.bank_id_for_report !== "") {
      fetchPayments(formData.bank_id_for_report, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date_from, filters.date_to, formData.bank_id_for_report, amountDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ date_from: "", date_to: "", search: "" });

  const getFilteredPayments = () => {
    if (!payments) return [];
    if (!filters.search.trim()) return payments;
    const term = filters.search.toLowerCase().trim();
    return payments.filter((p) =>
      (p.head_name && p.head_name.toLowerCase().includes(term)) ||
      (p.bank_name && p.bank_name.toLowerCase().includes(term)) ||
      (p.amount && p.amount.toString().includes(term))
    );
  };

  const resetForm = () => {
    setAmount("");
    setSelectedValue("");
    setEditId(null);
    setFormData((p) => ({ ...p, head_id_for_report: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amountDate || !getAmount || !formData.bank_id_for_report || !formData.head_id_for_report || !selectedValue) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${process.env.REACT_APP_API_URL}/api/payments/bank/transaction/${editId}`
        : `${process.env.REACT_APP_API_URL}/api/payments/bank/transactions`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: getAmount,
          dates: amountDate,
          bank_id: formData.bank_id_for_report,
          head_id: formData.head_id_for_report,
          transaction_status: selectedValue,
        }),
      });
      if (!res.ok) throw new Error("Failed to save transaction");
      toast.success(editId ? "Transaction updated" : "Transaction added");
      resetForm();
      await fetchPayments(formData.bank_id_for_report, false);
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const editPayment = (payment) => {
    setEditId(payment.id);
    setAmount(payment.amount);
    setAmountDate(payment.dates ? payment.dates.split("T")[0] : "");
    setSelectedValue(payment.transaction_status || "");
    setFormData({
      bank_id_for_report: payment.bank_id,
      head_id_for_report: payment.head_id,
    });
  };

  const filteredPayments = getFilteredPayments();

  const transactionsWithBalance = (() => {
    let running = closingBalanceBeforeDate;
    return (filteredPayments || []).map((t) => {
      const amt = parseFloat(t.amount || 0);
      running += t.transaction_status === "In" ? amt : -amt;
      return { ...t, runningBalance: running };
    });
  })();

  const totalIn = (filteredPayments || [])
    .filter((p) => p.transaction_status === "In")
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalOut = (filteredPayments || [])
    .filter((p) => p.transaction_status === "Out")
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  const fmt = (n) => parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0 });

  const fmtDate = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d)) return "—";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // ── react-select shared style ──
  const selectStyles = {
    control: (b) => ({
      ...b, border: "1.5px solid #ddd6fe", borderRadius: 7, fontSize: 12, minHeight: 36,
      boxShadow: "none", "&:hover": { borderColor: "#7c3aed" },
    }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
    option: (b, s) => ({
      ...b,
      background: s.isSelected ? "#7c3aed" : s.isFocused ? "#f5f3ff" : "#fff",
      color: s.isSelected ? "#fff" : "#1e293b", fontSize: 12,
    }),
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif" }}>
      <style>{`
        .at-card {margin-bottom:10px; }
        .at-head { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; padding:11px 16px; display:flex; align-items:center; gap:10px; }
        .at-head-icon { width:32px;height:32px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fde68a;font-size:14px; }
        .at-head-title { font-size:14px; font-weight:800; line-height:1.2; }
        .at-head-sub   { font-size:11px; color:rgba(255,255,255,.65); }
        .at-head-close {
          margin-left:auto; width:26px;height:26px;
          background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25);
          border-radius:6px; color:#fff; font-size:14px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
        }
        .at-head-close:hover { background:rgba(255,255,255,.28); }
        .at-body { padding:14px 0px; }

        .at-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
        @media (max-width:1100px) { .at-grid { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:600px)  { .at-grid { grid-template-columns:repeat(2,1fr); } }
        .at-field { display:flex; flex-direction:column; }
        .at-field label { font-size:10px; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; }
        .at-input, .at-select-native {
          padding:7px 10px; border:1.5px solid #ddd6fe; border-radius:7px;
          font-size:12px; outline:none; background:#fff; color:#1e293b; min-height:36px;
        }
        .at-input:focus, .at-select-native:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,.12); }

        .at-edit-banner {
          background:#fef3c7; border:1.5px solid #fcd34d; color:#92400e;
          padding:8px 12px; border-radius:8px; font-size:11px; font-weight:700;
          margin-bottom:11px; display:flex; align-items:center; gap:7px;
        }

        .at-actions { display:flex; gap:9px; margin-top:12px; flex-wrap:wrap; }
        .at-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; }
        .at-btn.primary { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; box-shadow:0 3px 10px rgba(124,58,237,.32); }
        .at-btn.primary:hover { background:linear-gradient(135deg,#3b0764,#6d28d9); }
        .at-btn.primary:disabled { background:#d1d5db; cursor:not-allowed; box-shadow:none; }
        .at-btn.editing { background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; }
        .at-btn.ghost { background:#f5f3ff; color:#7c3aed; border:1.5px solid #ddd6fe; }
        .at-btn.ghost:hover { background:#ede9fe; }

        .at-summary { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
        @media (max-width:1100px) { .at-summary { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:600px)  { .at-summary { grid-template-columns:repeat(2,1fr); } }
        .at-sum {
          background:#faf5ff; border:1.5px solid #ede9fe; border-radius:10px;
          padding:11px; text-align:center;
        }
        .at-sum.balance-card { background:linear-gradient(135deg,#ede9fe,#f5f3ff); border-color:#c4b5fd; }
        .at-sum-label { font-size:10px; font-weight:800; color:#8b5cf6; text-transform:uppercase; letter-spacing:.4px; margin-bottom:5px; }
        .at-sum-val   { font-size:16px; font-weight:800; color:#4c1d95; }
        .at-sum-val.in   { color:#16a34a; }
        .at-sum-val.out  { color:#b91c1c; }
        .at-sum-val.bal  { color:#7c3aed; }

        .at-toolbar-row { display:flex; gap:9px; align-items:center; margin-top:11px; flex-wrap:wrap; }
        .at-search { min-width:220px; flex:1; }

        .at-table-wrap { max-height:48vh; overflow:auto; border-radius:10px; }
        .at-tbl { width:100%; border-collapse:collapse; font-size:12px; }
        .at-tbl thead tr { background:linear-gradient(135deg,#4c1d95,#7c3aed); position:sticky; top:0; z-index:5; }
        .at-tbl th { padding:9px 10px; font-size:10px; font-weight:800; color:#fde68a; text-transform:uppercase; letter-spacing:.4px; text-align:left; white-space:nowrap; }
        .at-tbl td { padding:8px 10px; border-bottom:1px solid #f3e8ff; vertical-align:middle; color:#374151; }
        .at-tbl tbody tr:nth-child(even) td { background:#fdf8ff; }
        .at-tbl tbody tr:hover td { background:#f5f3ff; }
        .at-tbl tfoot td { padding:10px; font-weight:800; border-top:2px solid #c4b5fd; background:#ede9fe; color:#4c1d95; font-size:13px; }
        .at-tbl tr.opening td { background:#fef3c7 !important; color:#92400e; font-weight:700; }
        .at-in   { color:#16a34a; font-weight:800; text-align:right; white-space:nowrap; }
        .at-out  { color:#b91c1c; font-weight:800; text-align:right; white-space:nowrap; }
        .at-bal  { color:#4c1d95; font-weight:800; text-align:right; white-space:nowrap; }
        .at-row-edit {
          background:rgba(245,158,11,.12); color:#d97706;
          border:1px solid rgba(245,158,11,.3); border-radius:6px;
          padding:4px 10px; font-size:11px; font-weight:700; cursor:pointer;
        }
        .at-row-edit:hover { background:rgba(245,158,11,.25); }

        .at-empty { text-align:center; padding:36px 12px; color:#9ca3af; }
        .at-empty i { font-size:42px; color:#e9d5ff; margin-bottom:10px; display:block; }
        .at-loading { text-align:center; padding:24px; color:#7c3aed; font-weight:700; }

        .at-info-bar { font-size:11px; color:#6b7280; margin-bottom:8px; }
        .at-info-bar b { color:#7c3aed; }
      `}</style>

      {/* ── Form Card ── */}
      <div className="at-card">
       

        <div className="at-body">
          {editId && (
            <div className="at-edit-banner">
              <i className="fas fa-pen"></i> Editing transaction #{editId}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="at-grid">
              <div className="at-field">
                <label>Date</label>
                <input
                  type="date"
                  className="at-input"
                  required
                  value={amountDate}
                  onChange={(e) => setAmountDate(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="at-field">
                <label>Amount (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="at-input"
                  placeholder="0.00"
                  required
                  value={getAmount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="at-field">
                <label>Head</label>
                <Select
                  value={
                    formData.head_id_for_report
                      ? {
                          value: formData.head_id_for_report,
                          label: getAllHeads.find((h) => h.id === formData.head_id_for_report)?.head_name || "",
                        }
                      : null
                  }
                  options={getAllHeads.map((h) => ({ value: h.id, label: h.head_name }))}
                  onChange={(opt) => setFormData({ ...formData, head_id_for_report: opt ? opt.value : "" })}
                  placeholder="Select head…"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              <div className="at-field">
                <label>Bank Account</label>
                <Select
                  value={
                    formData.bank_id_for_report
                      ? {
                          value: formData.bank_id_for_report,
                          label: getAllBanks.find((b) => b.id === formData.bank_id_for_report)?.bank_name || "",
                        }
                      : null
                  }
                  options={getAllBanks.map((b) => ({ value: b.id, label: b.bank_name }))}
                  onChange={(opt) => setFormData({ ...formData, bank_id_for_report: opt ? opt.value : "" })}
                  placeholder="Select bank…"
                  isClearable
                  styles={selectStyles}
                />
              </div>

              <div className="at-field">
                <label>Status</label>
                <select
                  className="at-select-native"
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="In">In (Cash Received)</option>
                  <option value="Out">Out (Cash Paid)</option>
                </select>
              </div>

              <div className="at-field" style={{ justifyContent: "flex-end" }}>
                <label style={{ visibility: "hidden" }}>Submit</label>
                <button type="submit" className={`at-btn primary ${editId ? "editing" : ""}`} disabled={submitting}>
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin"></i> {editId ? "Updating…" : "Saving…"}</>
                  ) : editId ? (
                    <><i className="fas fa-save"></i> Update</>
                  ) : (
                    <><i className="fas fa-plus-circle"></i> Add</>
                  )}
                </button>
              </div>
            </div>

            {editId && (
              <div className="at-actions" style={{ marginTop: 10 }}>
                <button type="button" className="at-btn ghost" onClick={resetForm}>
                  <i className="fas fa-times"></i> Cancel Edit
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Filters + Summary + Table ── */}
      <div className="at-card">
        <div className="at-head">
          <div className="at-head-icon"><i className="fas fa-list"></i></div>
          <div>
            <div className="at-head-title">Transaction Ledger</div>
            <div className="at-head-sub">{formData.bank_id_for_report ? "Filtered by selected bank" : "Pick a bank above to load transactions"}</div>
          </div>
        </div>

        <div className="at-body">
          {/* Summary */}
          <div className="at-summary">
            <div className="at-sum">
              <div className="at-sum-label">Total Records</div>
              <div className="at-sum-val">{filteredPayments.length}</div>
            </div>
            <div className="at-sum">
              <div className="at-sum-label">Last Closing</div>
              <div className="at-sum-val">Rs. {fmt(closingBalanceBeforeDate)}</div>
            </div>
            <div className="at-sum">
              <div className="at-sum-label">Total In</div>
              <div className="at-sum-val in">Rs. {fmt(totalIn)}</div>
            </div>
            <div className="at-sum">
              <div className="at-sum-label">Total Out</div>
              <div className="at-sum-val out">Rs. {fmt(totalOut)}</div>
            </div>
            <div className="at-sum">
              <div className="at-sum-label">Period Balance</div>
              <div className="at-sum-val bal">Rs. {fmt(totalIn - totalOut)}</div>
            </div>
            <div className="at-sum balance-card">
              <div className="at-sum-label">Current Balance</div>
              <div className="at-sum-val bal">Rs. {fmt(currentBalance)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="at-toolbar-row">
            <div className="at-field" style={{ flex: "0 0 160px" }}>
              <label>Date From</label>
              <input
                type="date" name="date_from" className="at-input"
                value={filters.date_from} onChange={handleFilterChange} disabled={loading}
              />
            </div>
            <div className="at-field" style={{ flex: "0 0 160px" }}>
              <label>Date To</label>
              <input
                type="date" name="date_to" className="at-input"
                value={filters.date_to} onChange={handleFilterChange} disabled={loading}
              />
            </div>
            <div className="at-field at-search">
              <label>Search</label>
              <input
                type="text" name="search" className="at-input"
                value={filters.search} onChange={handleFilterChange}
                placeholder="Head, bank or amount…" disabled={loading}
              />
            </div>
            <div className="at-field" style={{ flex: "0 0 auto", justifyContent: "flex-end" }}>
              <label style={{ visibility: "hidden" }}>x</label>
              <button type="button" className="at-btn ghost" onClick={clearFilters} disabled={loading}>
                <i className="fas fa-times"></i> Clear
              </button>
            </div>
          </div>

          <div className="at-info-bar" style={{ marginTop: 10 }}>
            Showing <b>{filteredPayments.length}</b> of <b>{payments.length}</b> total entries
            {filters.search && <> (filtered by "<b>{filters.search}</b>")</>}
          </div>

          {/* Table */}
          <div className="at-table-wrap">
            <table className="at-tbl">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Date</th>
                  <th>Head</th>
                  <th>Bank</th>
                  <th style={{ textAlign: "right" }}>In</th>
                  <th style={{ textAlign: "right" }}>Out</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                  <th style={{ width: 80, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="at-loading">
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Loading transactions…
                  </td></tr>
                ) : (
                  <>
                    {closingBalanceBeforeDate !== 0 && (
                      <tr className="opening">
                        <td>—</td>
                        <td>—</td>
                        <td><i className="fas fa-flag" style={{ marginRight: 6 }}></i>Last Closing</td>
                        <td>—</td>
                        <td className="at-in">Rs. {fmt(closingBalanceBeforeDate)}</td>
                        <td>—</td>
                        <td className="at-bal">Rs. {fmt(closingBalanceBeforeDate)}</td>
                        <td>—</td>
                      </tr>
                    )}

                    {filteredPayments.length === 0 ? (
                      <tr><td colSpan="8" className="at-empty">
                        <i className="fas fa-inbox"></i>
                        <div style={{ fontWeight: 700, color: "#7c3aed" }}>
                          {filters.search ? `No transactions match "${filters.search}"` : "No transactions found"}
                        </div>
                        <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 4 }}>
                          {!formData.bank_id_for_report ? "Select a bank account to view transactions" : "Try a different date range"}
                        </div>
                      </td></tr>
                    ) : (
                      transactionsWithBalance.map((p, idx) => (
                        <tr key={p.id}>
                          <td style={{ color: "#9ca3af", fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ whiteSpace: "nowrap", color: "#6b7280" }}>{fmtDate(p.dates)}</td>
                          <td style={{ fontWeight: 600 }}>{p.head_name || "—"}</td>
                          <td>{p.bank_name || "—"}</td>
                          <td className={p.transaction_status === "In" ? "at-in" : ""} style={{ textAlign: "right", color: p.transaction_status === "In" ? "#16a34a" : "#cbd5e1" }}>
                            {p.transaction_status === "In" ? `Rs. ${fmt(p.amount)}` : "—"}
                          </td>
                          <td className={p.transaction_status === "Out" ? "at-out" : ""} style={{ textAlign: "right", color: p.transaction_status === "Out" ? "#b91c1c" : "#cbd5e1" }}>
                            {p.transaction_status === "Out" ? `Rs. ${fmt(p.amount)}` : "—"}
                          </td>
                          <td className="at-bal">Rs. {fmt(p.runningBalance)}</td>
                          <td style={{ textAlign: "center" }}>
                            <button className="at-row-edit" onClick={() => editPayment(p)} type="button" title="Edit">
                              <i className="fas fa-edit"></i> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </>
                )}
              </tbody>
              {filteredPayments.length > 0 && !loading && (
                <tfoot>
                  <tr>
                    <td colSpan="4" style={{ textAlign: "right" }}>Period Totals →</td>
                    <td style={{ textAlign: "right", color: "#16a34a" }}>Rs. {fmt(totalIn)}</td>
                    <td style={{ textAlign: "right", color: "#b91c1c" }}>Rs. {fmt(totalOut)}</td>
                    <td style={{ textAlign: "right", color: "#7c3aed" }}>Rs. {fmt(closingBalanceBeforeDate + totalIn - totalOut)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;
