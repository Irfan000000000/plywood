import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = process.env.REACT_APP_API_URL;

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "bank_opening", label: "Bank Opening Balance" },
  { value: "bank_transaction", label: "Bank Transactions (In/Out)" },
  { value: "invoice_pharmacy", label: "Sales (Invoice)" },
  { value: "invoice_payment", label: "Invoice Client Payments" },
  { value: "stock", label: "Stock Purchases" },
  { value: "daily_expenses", label: "Expenses" },
  { value: "staff_salary", label: "Staff Salary" },
  { value: "supplier_ledger", label: "Supplier Payments" },
];

const SOURCE_META = {
  bank_opening:     { label: "Bank Open",    icon: "fa-piggy-bank",    color: "#0891b2", bg: "#cffafe" },
  bank_transaction: { label: "Bank Txn",     icon: "fa-university",    color: "#0369a1", bg: "#e0f2fe" },
  invoice_pharmacy: { label: "Sale",         icon: "fa-cash-register", color: "#16a34a", bg: "#dcfce7" },
  invoice_payment:  { label: "Inv Payment",  icon: "fa-receipt",       color: "#059669", bg: "#d1fae5" },
  stock:            { label: "Stock",        icon: "fa-truck",         color: "#7c3aed", bg: "#ede9fe" },
  daily_expenses:   { label: "Expense",      icon: "fa-minus-circle",  color: "#dc2626", bg: "#fee2e2" },
  staff_salary:     { label: "Salary",       icon: "fa-money-bill",    color: "#d97706", bg: "#fef3c7" },
  supplier_ledger:  { label: "Supplier Pay", icon: "fa-handshake",     color: "#1d4ed8", bg: "#dbeafe" },
};

const fmt = (n) =>
  parseFloat(n || 0).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDateTime = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mn}`;
};

export default function GrandLedger({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total_in: 0, total_out: 0, balance: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(200);

  const today = (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  })();

  const [filters, setFilters] = useState({
    date_from: today,
    date_to: today,
    source_type: "",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");

  const currentPageRef = useRef(1);

  const fetchLedger = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/grand-ledger`, {
          params: { page, limit, ...filters },
        });
        const data = res.data;
        const newPage = Number(data.currentPage) || page;
        setRows(data.rows || []);
        setSummary(data.summary || { total_in: 0, total_out: 0, balance: 0 });
        setTotal(Number(data.total) || 0);
        setTotalPages(Number(data.totalPages) || 1);
        setCurrentPage(newPage);
        currentPageRef.current = newPage;
      } catch (err) {
        toast.error("Ledger load failed: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    },
    [filters, limit]
  );

  useEffect(() => {
    fetchLedger(1);
  }, [fetchLedger]);

  const applySearch = (e) => {
    if (e.key === "Enter") {
      setFilters((p) => ({ ...p, search: searchInput }));
    }
  };

  const resetFilters = () => {
    setFilters({ date_from: today, date_to: today, source_type: "", search: "" });
    setSearchInput("");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif", background: "#faf5ff", padding: 14 }}>
      <style>{`
        .gl-card { background:#fff; border:1.5px solid #ddd6fe; border-radius:12px; overflow:hidden; box-shadow:0 4px 14px rgba(124,58,237,.08); }
        .gl-head { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; padding:11px 16px; display:flex; align-items:center; gap:10px; }
        .gl-head-icon { width:34px;height:34px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fde68a;font-size:15px; }
        .gl-head-title { font-size:14px; font-weight:800; line-height:1.2; }
        .gl-head-sub   { font-size:11px; color:rgba(255,255,255,.65); }
        .gl-head-count {
          margin-left:auto; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25);
          color:#fde68a; padding:3px 12px; border-radius:12px; font-size:11px; font-weight:700;
        }

        .gl-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:14px 16px; background:#fff; border-bottom:1.5px solid #ede9fe; }
        @media (max-width:800px) { .gl-summary { grid-template-columns:repeat(2,1fr); } }
        .gl-sum-card { background:#faf5ff; border:1.5px solid #ede9fe; border-radius:10px; padding:12px; text-align:center; }
        .gl-sum-card.balance-card { background:linear-gradient(135deg,#ede9fe,#f5f3ff); border-color:#c4b5fd; }
        .gl-sum-label { font-size:10px; font-weight:800; color:#8b5cf6; text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
        .gl-sum-val   { font-size:17px; font-weight:800; color:#4c1d95; }
        .gl-sum-val.in   { color:#16a34a; }
        .gl-sum-val.out  { color:#b91c1c; }
        .gl-sum-val.bal  { color:#7c3aed; }
        .gl-sum-val.bal.zero { color:#16a34a; }

        .gl-toolbar { display:flex; gap:9px; padding:11px 16px; background:#faf5ff; border-bottom:1.5px solid #ede9fe; flex-wrap:wrap; align-items:center; }
        .gl-input, .gl-select { padding:7px 10px; border:1.5px solid #ddd6fe; border-radius:7px; font-size:12px; outline:none; background:#fff; color:#1e293b; }
        .gl-input:focus, .gl-select:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,.12); }
        .gl-search { min-width:220px; }
        .gl-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 13px; border:none; border-radius:7px; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; }
        .gl-btn.reset { background:#f1f5f9; color:#475569; border:1.5px solid #e2e8f0; }
        .gl-btn.reset:hover { background:#e2e8f0; }
        .gl-btn.refresh { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; }
        .gl-btn.refresh:hover { opacity:.9; }
        .gl-btn.close { background:#fee2e2; color:#b91c1c; border:1.5px solid #fecaca; margin-left:auto; }
        .gl-btn.close:hover { background:#fecaca; }

        .gl-table-wrap { max-height:55vh; overflow:auto; }
        .gl-tbl { width:100%; border-collapse:collapse; font-size:12px; }
        .gl-tbl thead tr { background:linear-gradient(135deg,#4c1d95,#7c3aed); position:sticky; top:0; z-index:5; }
        .gl-tbl th { padding:9px 10px; font-size:10px; font-weight:800; color:#fde68a; text-transform:uppercase; letter-spacing:.4px; text-align:left; white-space:nowrap; }
        .gl-tbl td { padding:8px 10px; border-bottom:1px solid #f3e8ff; vertical-align:middle; color:#374151; }
        .gl-tbl tbody tr:nth-child(even) td { background:#fdf8ff; }
        .gl-tbl tbody tr:hover td { background:#f5f3ff; }
        .gl-tbl tfoot td { padding:10px; font-weight:800; border-top:2px solid #c4b5fd; background:#ede9fe; color:#4c1d95; font-size:13px; }
        .gl-source-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:10px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.4px; white-space:nowrap; }
        .gl-in   { color:#16a34a; font-weight:800; text-align:right; white-space:nowrap; }
        .gl-out  { color:#b91c1c; font-weight:800; text-align:right; white-space:nowrap; }
        .gl-bal  { color:#4c1d95; font-weight:800; text-align:right; white-space:nowrap; }
        .gl-bal.zero { color:#16a34a; }

        .gl-empty { text-align:center; padding:36px 12px; color:#9ca3af; }
        .gl-empty i { font-size:42px; color:#e9d5ff; margin-bottom:10px; display:block; }
        .gl-loading { text-align:center; padding:24px; color:#7c3aed; font-weight:700; }

        .gl-pager { display:flex; justify-content:center; padding:12px; background:#faf5ff; border-top:1.5px solid #ede9fe; }
        .gl-pager .pagination { display:flex; gap:4px; list-style:none; padding:0; margin:0; flex-wrap:wrap; }
        .gl-pager .page-item .page-link { display:inline-block; padding:5px 11px; border:1.5px solid #ddd6fe; border-radius:6px; color:#7c3aed; font-size:12px; font-weight:700; cursor:pointer; background:#fff; text-decoration:none; }
        .gl-pager .page-item.active .page-link { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; border-color:#7c3aed; }
        .gl-pager .page-item .page-link:hover { background:#f5f3ff; }
        .gl-pager .page-item.disabled .page-link { opacity:.4; cursor:not-allowed; }
      `}</style>

      <div className="gl-card">
        {/* Header */}
        <div className="gl-head">
          <div className="gl-head-icon"><i className="fas fa-balance-scale"></i></div>
          <div>
            <div className="gl-head-title">Grand Ledger</div>
            <div className="gl-head-sub">Combined: Sales · Stock · Expenses · Salaries · Supplier Payments</div>
          </div>
          <div className="gl-head-count">{total.toLocaleString()} entries</div>
        </div>

        {/* Summary cards */}
        <div className="gl-summary">
          <div className="gl-sum-card">
            <div className="gl-sum-label">Total Records</div>
            <div className="gl-sum-val">{total.toLocaleString()}</div>
          </div>
          <div className="gl-sum-card">
            <div className="gl-sum-label">Total In</div>
            <div className="gl-sum-val in">Rs. {fmt(summary.total_in)}</div>
          </div>
          <div className="gl-sum-card">
            <div className="gl-sum-label">Total Out</div>
            <div className="gl-sum-val out">Rs. {fmt(summary.total_out)}</div>
          </div>
          <div className="gl-sum-card balance-card">
            <div className="gl-sum-label">Ending Balance</div>
            <div className={`gl-sum-val bal ${(rows.length > 0 ? parseFloat(rows[rows.length - 1].running_balance || 0) : 0) <= 0 ? "zero" : ""}`}>
              Rs. {fmt(rows.length > 0 ? rows[rows.length - 1].running_balance : 0)}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="gl-toolbar">
          <input
            type="date"
            className="gl-input"
            value={filters.date_from}
            onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))}
            title="From date"
          />
          <input
            type="date"
            className="gl-input"
            value={filters.date_to}
            onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))}
            title="To date"
          />
          <select
            className="gl-select"
            value={filters.source_type}
            onChange={(e) => setFilters((p) => ({ ...p, source_type: e.target.value }))}
          >
            {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            className="gl-input gl-search"
            placeholder="Search description… (Enter)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={applySearch}
          />
          <select
            className="gl-select"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
          <button className="gl-btn reset" onClick={resetFilters} type="button">
            <i className="fas fa-times"></i> Reset
          </button>
          <button className="gl-btn refresh" onClick={() => fetchLedger(currentPage)} type="button">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          {onClose && (
            <button className="gl-btn close" onClick={onClose} type="button">
              <i className="fas fa-times"></i> Close
            </button>
          )}
        </div>

        {/* Table */}
        <div className="gl-table-wrap">
          <table className="gl-tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Date / Time</th>
                <th>Source</th>
                <th>Ref</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right" }}>In</th>
                <th style={{ textAlign: "right" }}>Out</th>
                <th style={{ textAlign: "right" }}>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="gl-loading">
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Loading ledger…
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="9" className="gl-empty">
                  <i className="fas fa-inbox"></i>
                  <div style={{ fontWeight: 700, color: "#7c3aed" }}>No ledger entries found</div>
                  <div style={{ fontSize: 12, color: "#a78bfa", marginTop: 4 }}>Try changing the filters or date range</div>
                </td></tr>
              ) : (
                <>
                  {(() => {
                    // Opening balance = first visible row's running_balance minus its own net effect.
                    // This is the carry-in balance from history before the visible period.
                    const first = rows[0];
                    const firstIn = parseFloat(first.amount_in || 0);
                    const firstOut = parseFloat(first.amount_out || 0);
                    const opening = parseFloat(first.running_balance || 0) - firstIn + firstOut;
                    if (opening === 0 && currentPage === 1) return null;
                    return (
                      <tr style={{ background: "#fef3c7" }}>
                        <td style={{ color: "#92400e", fontWeight: 800 }}>—</td>
                        <td style={{ color: "#92400e", fontWeight: 700 }}>—</td>
                        <td>
                          <span className="gl-source-chip" style={{ background: "#fde68a", color: "#92400e" }}>
                            <i className="fas fa-flag"></i> Opening
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: "#92400e" }}>—</td>
                        <td style={{ color: "#92400e", fontWeight: 700 }}>
                          {currentPage === 1 ? "Last balance carried forward (before period)" : "Carried from previous page"}
                        </td>
                        <td style={{ textAlign: "right", color: "#cbd5e1" }}>—</td>
                        <td style={{ textAlign: "right", color: "#cbd5e1" }}>—</td>
                        <td style={{ textAlign: "right", color: "#cbd5e1" }}>—</td>
                        <td className={`gl-bal ${opening <= 0 ? "zero" : ""}`}>Rs. {fmt(opening)}</td>
                      </tr>
                    );
                  })()}
                  {rows.map((r, idx) => {
                  const meta = SOURCE_META[r.source_type] || { label: r.source_type, icon: "fa-circle", color: "#6b7280", bg: "#f3f4f6" };
                  const rawIn = parseFloat(r.amount_in || 0);
                  const rawOut = parseFloat(r.amount_out || 0);
                  // Show raw values from backend: for a sale, In = full sale amount (net),
                  // Out = unpaid receivable (net − advance) when partial.
                  // Running balance is already computed by backend as amount_in − amount_out,
                  // so net effect on balance = advance (the cash actually received).
                  const inAmt = rawIn;
                  const outAmt = rawOut;
                  const amountVal = Math.max(rawIn, rawOut);
                  const balance = parseFloat(r.running_balance || 0);
                  return (
                    <tr key={`${r.source_type}-${r.source_id}`}>
                      <td style={{ color: "#9ca3af", fontWeight: 700 }}>{(currentPage - 1) * limit + idx + 1}</td>
                      <td style={{ whiteSpace: "nowrap", color: "#6b7280" }}>{fmtDateTime(r.entry_date)}</td>
                      <td>
                        <span className="gl-source-chip" style={{ background: meta.bg, color: meta.color }}>
                          <i className={`fas ${meta.icon}`}></i> {meta.label}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "#4c1d95" }}>#{r.source_id}</td>
                      <td>{r.description || "—"}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#1e293b" }}>
                        Rs. {fmt(amountVal)}
                      </td>
                      <td className={inAmt > 0 && r.source_type !== "stock" ? "gl-in" : ""} style={{ textAlign: "right", color: inAmt > 0 && r.source_type !== "stock" ? "#16a34a" : "#cbd5e1" }}>
                        {inAmt > 0 && r.source_type !== "stock" ? `Rs. ${fmt(inAmt)}` : "—"}
                      </td>
                      <td className={outAmt > 0 ? "gl-out" : ""} style={{ textAlign: "right", color: outAmt > 0 ? "#b91c1c" : "#cbd5e1" }}>
                        {outAmt > 0 ? `Rs. ${fmt(outAmt)}` : "—"}
                      </td>
                      <td className={`gl-bal ${balance <= 0 ? "zero" : ""}`}>Rs. {fmt(balance)}</td>
                    </tr>
                  );
                })}
                </>
              )}
            </tbody>
            {rows.length > 0 && (() => {
              const endingBalance = parseFloat(rows[rows.length - 1].running_balance || 0);
              return (
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "right" }}>Period Totals →</td>
                    <td style={{ textAlign: "right", color: "#1e293b" }}>Rs. {fmt(parseFloat(summary.total_in || 0) + parseFloat(summary.total_out || 0))}</td>
                    <td style={{ textAlign: "right", color: "#16a34a" }}>Rs. {fmt(summary.total_in)}</td>
                    <td style={{ textAlign: "right", color: "#b91c1c" }}>Rs. {fmt(summary.total_out)}</td>
                    <td style={{ textAlign: "right", color: endingBalance <= 0 ? "#16a34a" : "#7c3aed" }}>Rs. {fmt(endingBalance)}</td>
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="gl-pager">
            <ReactPaginate
              previousLabel={"← Prev"}
              nextLabel={"Next →"}
              breakLabel={"…"}
              pageCount={totalPages}
              forcePage={currentPage - 1}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={({ selected }) => fetchLedger(selected + 1)}
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
              disabledClassName={"disabled"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
