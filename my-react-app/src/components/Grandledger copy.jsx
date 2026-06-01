// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const API = process.env.REACT_APP_API_URL;

// const SOURCE_LABELS = {
//   invoice_pharmacy: 'Invoice',
//   stock:            'Stock',
//   daily_expenses:   'Expense',
//   staff_salary:     'Salary',
//   supplier_ledger:  'Supplier',
// };

// const SOURCE_COLORS = {
//   invoice_pharmacy: '#0d6efd',
//   stock:            '#198754',
//   daily_expenses:   '#dc3545',
//   staff_salary:     '#6f42c1',
//   supplier_ledger:  '#fd7e14',
// };

// const fmt = (n) =>
//   parseFloat(n || 0).toLocaleString('en-PK', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// const LIMIT = 50;

// export default function GrandLedger() {
//   const [rows, setRows]               = useState([]);
//   const [loading, setLoading]         = useState(false);
//   const [summary, setSummary]         = useState({ total_in: 0, total_out: 0, balance: 0 });
//   const [totalPages, setTotalPages]   = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [total, setTotal]             = useState(0);

//   const [filters, setFilters] = useState({
//     date_from:   '',
//     date_to:     '',
//     source_type: '',
//     search:      '',
//   });

//   // ── Fix: ensure scroll is never blocked by a parent container ──
//   useEffect(() => {
//     const prevBody = document.body.style.overflow;
//     const prevHtml = document.documentElement.style.overflow;
//     document.body.style.overflow = 'auto';
//     document.documentElement.style.overflow = 'auto';
//     return () => {
//       document.body.style.overflow = prevBody;
//       document.documentElement.style.overflow = prevHtml;
//     };
//   }, []);

//   // ── Fetch ──────────────────────────────────────────────────
//   const fetchLedger = useCallback(async (page = 1) => {
//     setLoading(true);
//     try {
//       const params = { page, limit: LIMIT, ...filters };
//       const res = await axios.get(`${API}/grand-ledger`, { params });
//       setRows(res.data.rows || []);
//       setSummary(res.data.summary || { total_in: 0, total_out: 0, balance: 0 });
//       setTotalPages(res.data.totalPages || 1);
//       setCurrentPage(res.data.currentPage || 1);
//       setTotal(res.data.total || 0);
//     } catch (err) {
//       toast.error('Ledger load failed: ' + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => { fetchLedger(1); }, [fetchLedger]);

//   // ── Handlers ───────────────────────────────────────────────
//   const handleFilterChange = (e) =>
//     setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

//   const handleSearch = (e) => { e.preventDefault(); fetchLedger(1); };

//   const handleClear = () =>
//     setFilters({ date_from: '', date_to: '', source_type: '', search: '' });

//   const goPage = (p) => {
//     if (p >= 1 && p <= totalPages) fetchLedger(p);
//   };

//   const balColor = summary.balance >= 0 ? '#198754' : '#dc3545';

//   return (
//     // ── Page wrapper: full-height flex column, no overflow hidden ──
//     <div style={styles.page}>

//       {/* ── Header ── */}
//       <div style={styles.header}>
//         <div>
//           <h2 style={styles.title}>📒 Grand Ledger</h2>
//           <span style={styles.subtitle}>
//             Auto-consolidated from all sources &nbsp;|&nbsp; {total.toLocaleString()} records
//           </span>
//         </div>
//       </div>

//       {/* ── Summary cards ── */}
//       <div style={styles.cardGrid}>
//         {[
//           { label: 'Total IN',  value: summary.total_in,  color: '#198754', bg: '#d1e7dd', icon: '💰' },
//           { label: 'Total OUT', value: summary.total_out, color: '#dc3545', bg: '#f8d7da', icon: '💸' },
//           { label: 'Balance',   value: summary.balance,   color: balColor,  bg: '#e9ecef', icon: '⚖️' },
//         ].map(c => (
//           <div key={c.label} style={{ ...styles.card, background: c.bg, borderLeftColor: c.color }}>
//             <div style={styles.cardLabel}>{c.icon} {c.label}</div>
//             <div style={{ ...styles.cardValue, color: c.color }}>₨ {fmt(c.value)}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── Filters ── */}
//       <form onSubmit={handleSearch} style={styles.filterBar}>
//         <Field label="From">
//           <input type="date" name="date_from" value={filters.date_from}
//             onChange={handleFilterChange} style={styles.input} />
//         </Field>
//         <Field label="To">
//           <input type="date" name="date_to" value={filters.date_to}
//             onChange={handleFilterChange} style={styles.input} />
//         </Field>
//         <Field label="Source">
//           <select name="source_type" value={filters.source_type}
//             onChange={handleFilterChange} style={styles.input}>
//             <option value="">All Sources</option>
//             {Object.entries(SOURCE_LABELS).map(([v, l]) => (
//               <option key={v} value={v}>{l}</option>
//             ))}
//           </select>
//         </Field>
//         <Field label="Search">
//           <input type="text" name="search" value={filters.search}
//             onChange={handleFilterChange} placeholder="Search description…"
//             style={{ ...styles.input, width: 180 }} />
//         </Field>
//         <button type="submit" style={styles.btnPrimary}>🔍 Search</button>
//         <button type="button" onClick={handleClear} style={styles.btnSecondary}>✕ Clear</button>
//       </form>

//       {/* ── Table wrapper: THIS is what scrolls horizontally + vertically ── */}
//       <div style={styles.tableCard}>
//         {loading ? (
//           <div style={styles.centerMsg}>⏳ Loading...</div>
//         ) : rows.length === 0 ? (
//           <div style={styles.centerMsg}>No entries found for the selected filters.</div>
//         ) : (
//           /* Horizontal scroll container */
//           <div style={styles.scrollWrap}>
//             <table style={styles.table}>
//               <thead>
//                 <tr>
//                   {['#', 'Date & Time', 'Source', 'Description',
//                     'Amount IN (₨)', 'Amount OUT (₨)', 'Running Balance'].map(h => (
//                     <th key={h} style={styles.th}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody>
//                 {rows.map((r, i) => {
//                   /* running_balance comes directly from backend — no frontend math */
//                   const bal     = parseFloat(r.running_balance || 0);
//                   const rColor  = bal >= 0 ? '#198754' : '#dc3545';
//                   const hasIn   = parseFloat(r.amount_in)  > 0;
//                   const hasOut  = parseFloat(r.amount_out) > 0;

//                   return (
//                     <tr
//                       key={`${r.source_type}-${r.source_id}`}
//                       style={{
//                         background: i % 2 === 0 ? '#fff' : '#f8f9fa',
//                         borderBottom: '1px solid #dee2e6',
//                       }}
//                     >
//                       {/* # */}
//                       <td style={styles.td}>
//                         {(currentPage - 1) * LIMIT + i + 1}
//                       </td>

//                       {/* Date & Time */}
//                       <td style={styles.td}>
//                         <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
//                           {new Date(r.entry_date).toLocaleDateString('en-PK')}
//                         </div>
//                         <div style={{ color: '#6c757d', fontSize: 11 }}>
//                           {new Date(r.entry_date).toLocaleTimeString('en-PK', {
//                             hour: '2-digit', minute: '2-digit',
//                           })}
//                         </div>
//                       </td>

//                       {/* Source badge */}
//                       <td style={styles.td}>
//                         <span style={{
//                           background:   SOURCE_COLORS[r.source_type] || '#6c757d',
//                           color:        '#fff',
//                           borderRadius: 12,
//                           padding:      '3px 10px',
//                           fontSize:     11,
//                           fontWeight:   700,
//                           whiteSpace:   'nowrap',
//                         }}>
//                           {SOURCE_LABELS[r.source_type] || r.source_type}
//                         </span>
//                       </td>

//                       {/* Description */}
//                       <td style={{ ...styles.td, maxWidth: 280, fontSize: 13 }}>
//                         {r.description}
//                       </td>

//                       {/* Amount IN */}
//                       <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700,
//                                    color: hasIn ? '#198754' : '#adb5bd', whiteSpace: 'nowrap' }}>
//                         {hasIn ? fmt(r.amount_in) : '—'}
//                       </td>

//                       {/* Amount OUT */}
//                       <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700,
//                                    color: hasOut ? '#dc3545' : '#adb5bd', whiteSpace: 'nowrap' }}>
//                         {hasOut ? fmt(r.amount_out) : '—'}
//                       </td>

//                       {/* Running Balance — from backend */}
//                       <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700,
//                                    color: rColor, whiteSpace: 'nowrap' }}>
//                         ₨ {fmt(bal)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>

//               <tfoot>
//                 <tr style={{ background: '#1a1a2e', color: '#fff', fontWeight: 700 }}>
//                   <td colSpan={4} style={{ ...styles.td, textAlign: 'right', color: '#ccc' }}>
//                     Page Totals →
//                   </td>
//                   <td style={{ ...styles.td, textAlign: 'right',
//                                color: '#90ee90', fontSize: 14, whiteSpace: 'nowrap' }}>
//                     ₨ {fmt(summary.total_in)}
//                   </td>
//                   <td style={{ ...styles.td, textAlign: 'right',
//                                color: '#ff6b6b', fontSize: 14, whiteSpace: 'nowrap' }}>
//                     ₨ {fmt(summary.total_out)}
//                   </td>
//                   <td style={{ ...styles.td, textAlign: 'right', fontSize: 14,
//                                color: summary.balance >= 0 ? '#90ee90' : '#ff6b6b',
//                                whiteSpace: 'nowrap' }}>
//                     ₨ {fmt(summary.balance)}
//                   </td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ── Pagination ── */}
//       {totalPages > 1 && (
//         <div style={styles.pagination}>
//           <PageBtn onClick={() => goPage(1)}               disabled={currentPage === 1}>«</PageBtn>
//           <PageBtn onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}>‹</PageBtn>

//           {buildPageRange(currentPage, totalPages).map((p, i) =>
//             p === '...' ? (
//               <span key={'e' + i} style={{ padding: '0 6px', color: '#6c757d' }}>…</span>
//             ) : (
//               <PageBtn key={p} onClick={() => goPage(p)} active={p === currentPage}>{p}</PageBtn>
//             )
//           )}

//           <PageBtn onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages}>›</PageBtn>
//           <PageBtn onClick={() => goPage(totalPages)}      disabled={currentPage === totalPages}>»</PageBtn>

//           <span style={{ color: '#6c757d', fontSize: 12, marginLeft: 8 }}>
//             Page {currentPage} of {totalPages}
//           </span>
//         </div>
//       )}

//     </div>
//   );
// }

// // ── Sub-components ────────────────────────────────────────────

// function Field({ label, children }) {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//       <label style={{ fontSize: 11, fontWeight: 600, color: '#495057' }}>{label}</label>
//       {children}
//     </div>
//   );
// }

// function PageBtn({ onClick, disabled, active, children }) {
//   return (
//     <button onClick={onClick} disabled={disabled} style={{
//       background:   active ? '#0d6efd' : disabled ? '#e9ecef' : '#fff',
//       color:        active ? '#fff'    : disabled ? '#adb5bd' : '#212529',
//       border:       '1px solid #dee2e6',
//       borderRadius: 6,
//       padding:      '4px 11px',
//       cursor:       disabled ? 'not-allowed' : 'pointer',
//       fontWeight:   active ? 700 : 400,
//       fontSize:     13,
//     }}>
//       {children}
//     </button>
//   );
// }

// function buildPageRange(current, total) {
//   const delta = 2;
//   const range = [];
//   for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
//     range.push(i);
//   }
//   const result = [];
//   if (range[0] > 1) { result.push(1); if (range[0] > 2) result.push('...'); }
//   result.push(...range);
//   if (range[range.length - 1] < total) {
//     if (range[range.length - 1] < total - 1) result.push('...');
//     result.push(total);
//   }
//   return result;
// }

// // ── Styles ────────────────────────────────────────────────────

// const styles = {
//   // ✅ FIX: No overflow:hidden on page — let content flow naturally
//   page: {
//     padding:    16,
//     fontFamily: 'Nunito, sans-serif',
//     background: '#f0f2f5',
//     minHeight:  '100vh',
//     boxSizing:  'border-box',
//   },

//   header: {
//     display:        'flex',
//     alignItems:     'center',
//     justifyContent: 'space-between',
//     marginBottom:   16,
//     flexWrap:       'wrap',
//     gap:            8,
//   },
//   title:    { margin: 0, color: '#1a1a2e', fontSize: 22, fontWeight: 800 },
//   subtitle: { color: '#6c757d', fontSize: 12 },

//   cardGrid: {
//     display:             'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//     gap:                 12,
//     marginBottom:        18,
//   },
//   card: {
//     borderRadius: 10,
//     padding:      '14px 18px',
//     borderLeft:   '4px solid',
//     boxShadow:    '0 1px 3px rgba(0,0,0,0.08)',
//   },
//   cardLabel: { fontSize: 11, color: '#495057', fontWeight: 700 },
//   cardValue: { fontSize: 20, fontWeight: 800, marginTop: 4 },

//   filterBar: {
//     background:    '#fff',
//     borderRadius:  10,
//     padding:       '12px 16px',
//     marginBottom:  14,
//     display:       'flex',
//     flexWrap:      'wrap',
//     gap:           10,
//     alignItems:    'flex-end',
//     boxShadow:     '0 1px 3px rgba(0,0,0,0.08)',
//   },
//   input: {
//     border:       '1px solid #ced4da',
//     borderRadius: 6,
//     padding:      '6px 10px',
//     fontSize:     13,
//     outline:      'none',
//     background:   '#fff',
//   },
//   btnPrimary: {
//     background:   '#0d6efd',
//     color:        '#fff',
//     border:       'none',
//     borderRadius: 6,
//     padding:      '7px 16px',
//     fontWeight:   700,
//     cursor:       'pointer',
//     fontSize:     13,
//   },
//   btnSecondary: {
//     background:   '#6c757d',
//     color:        '#fff',
//     border:       'none',
//     borderRadius: 6,
//     padding:      '7px 16px',
//     fontWeight:   700,
//     cursor:       'pointer',
//     fontSize:     13,
//   },

//   tableCard: {
//     background:   '#fff',
//     borderRadius: 10,
//     boxShadow:    '0 1px 3px rgba(0,0,0,0.08)',
//     marginBottom: 14,
//   },

//   scrollWrap: {
//     overflowY:  'auto',
//     maxHeight:  'calc(100vh - 320px)',
//     overflowX: 'auto',
//     width:     '100%',
//   },

//   centerMsg: { padding: 40, textAlign: 'center', color: '#6c757d', fontSize: 15 },

//   table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },

//   th: {
//     padding:         '10px 12px',
//     textAlign:       'left',
//     fontWeight:      700,
//     whiteSpace:      'nowrap',
//     fontSize:        12,
//     background:      '#1a1a2e',
//     color:           '#fff',
//     position:        'sticky',
//     top:             0,
//     zIndex:          1,
//   },

//   td: { padding: '8px 12px', verticalAlign: 'middle' },

//   pagination: {
//     display:        'flex',
//     justifyContent: 'center',
//     alignItems:     'center',
//     gap:            5,
//     flexWrap:       'wrap',
//     paddingBottom:  16,
//   },
// };






import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL;

const SOURCE_LABELS = {
  invoice_pharmacy: 'Invoice',
  stock:            'Stock',
  daily_expenses:   'Expense',
  staff_salary:     'Salary',
  supplier_ledger:  'Supplier',
};

const SOURCE_COLORS = {
  invoice_pharmacy: '#0d6efd',
  stock:            '#198754',
  daily_expenses:   '#dc3545',
  staff_salary:     '#6f42c1',
  supplier_ledger:  '#fd7e14',
};

const fmt = (n) =>
  parseFloat(n || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const LIMIT = 50;

// ── Build pagination range with ellipsis ─────────────────────
function buildPageRange(current, total) {
  if (total <= 1) return [];
  const delta  = 2;
  const range  = [];
  const start  = Math.max(1, current - delta);
  const end    = Math.min(total, current + delta);

  for (let i = start; i <= end; i++) range.push(i);

  const result = [];
  if (range[0] > 1) {
    result.push(1);
    if (range[0] > 2) result.push('...');
  }
  result.push(...range);
  if (range[range.length - 1] < total) {
    if (range[range.length - 1] < total - 1) result.push('...');
    result.push(total);
  }
  return result;
}

// ── Main Component ───────────────────────────────────────────
export default function GrandLedger() {
  // ── State ──
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [summary, setSummary]       = useState({ total_in: 0, total_out: 0, balance: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal]           = useState(0);

  const [filters, setFilters] = useState({
    date_from:   '',
    date_to:     '',
    source_type: '',
    search:      '',
  });

  // Keep a ref to the latest page so goPage doesn't stale-close over it
  const currentPageRef = useRef(1);

  // ── Scroll fix ──
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  // ── Fetch ──
  const fetchLedger = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...filters,
      };
      const res = await axios.get(`${API}/grand-ledger`, { params });

      const data        = res.data;
      const newPage     = Number(data.currentPage) || page;
      const newTotal    = Number(data.total)        || 0;
      const newTotPages = Number(data.totalPages)   || 1;

      setRows(data.rows || []);
      setSummary(data.summary || { total_in: 0, total_out: 0, balance: 0 });
      setTotal(newTotal);
      setTotalPages(newTotPages);
      setCurrentPage(newPage);
      currentPageRef.current = newPage;
    } catch (err) {
      toast.error('Ledger load failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Re-fetch on filter change, reset to page 1
  useEffect(() => {
    fetchLedger(1);
  }, [fetchLedger]);

  // ── Handlers ──
  const handleFilterChange = (e) =>
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLedger(1);
  };

  const handleClear = () => {
    setFilters({ date_from: '', date_to: '', source_type: '', search: '' });
  };

  const goPage = (p) => {
    const tp = totalPages;
    if (p < 1 || p > tp || p === currentPageRef.current) return;
    fetchLedger(p);
  };

  const balColor = summary.balance >= 0 ? '#198754' : '#dc3545';
  const pageRange = buildPageRange(currentPage, totalPages);

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📒 Grand Ledger</h2>
          <span style={s.subtitle}>
            Auto-consolidated from all sources &nbsp;|&nbsp; {total.toLocaleString()} records
          </span>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={s.cardGrid}>
        {[
          { label: 'Total IN',  value: summary.total_in,  color: '#198754', bg: '#d1e7dd', icon: '💰' },
          { label: 'Total OUT', value: summary.total_out, color: '#dc3545', bg: '#f8d7da', icon: '💸' },
          { label: 'Balance',   value: summary.balance,   color: balColor,  bg: '#e9ecef', icon: '⚖️' },
        ].map(c => (
          <div key={c.label} style={{ ...s.card, background: c.bg, borderLeftColor: c.color }}>
            <div style={s.cardLabel}>{c.icon} {c.label}</div>
            <div style={{ ...s.cardValue, color: c.color }}>₨ {fmt(c.value)}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <form onSubmit={handleSearch} style={s.filterBar}>
        <Field label="From">
          <input type="date" name="date_from" value={filters.date_from}
            onChange={handleFilterChange} style={s.input} />
        </Field>
        <Field label="To">
          <input type="date" name="date_to" value={filters.date_to}
            onChange={handleFilterChange} style={s.input} />
        </Field>
        <Field label="Source">
          <select name="source_type" value={filters.source_type}
            onChange={handleFilterChange} style={s.input}>
            <option value="">All Sources</option>
            {Object.entries(SOURCE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Search">
          <input type="text" name="search" value={filters.search}
            onChange={handleFilterChange} placeholder="Search description…"
            style={{ ...s.input, width: 180 }} />
        </Field>
        <button type="submit" style={s.btnPrimary}>🔍 Search</button>
        <button type="button" onClick={handleClear} style={s.btnSecondary}>✕ Clear</button>
      </form>

      {/* ── Table ── */}
      <div style={s.tableCard}>
        {loading ? (
          <div style={s.centerMsg}>⏳ Loading...</div>
        ) : rows.length === 0 ? (
          <div style={s.centerMsg}>No entries found for the selected filters.</div>
        ) : (
          <div style={s.scrollWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['#', 'Date & Time', 'Source', 'Description',
                    'Amount IN (₨)', 'Amount OUT (₨)', 'Running Balance'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => {
                  const bal    = parseFloat(r.running_balance || 0);
                  const rColor = bal >= 0 ? '#198754' : '#dc3545';
                  const hasIn  = parseFloat(r.amount_in)  > 0;
                  const hasOut = parseFloat(r.amount_out) > 0;

                  return (
                    <tr
                      key={`${r.source_type}-${r.source_id}`}
                      style={{
                        background:   i % 2 === 0 ? '#fff' : '#f8f9fa',
                        borderBottom: '1px solid #dee2e6',
                      }}
                    >
                      <td style={s.td}>{(currentPage - 1) * LIMIT + i + 1}</td>

                      <td style={s.td}>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                          {new Date(r.entry_date).toLocaleDateString('en-PK')}
                        </div>
                        <div style={{ color: '#6c757d', fontSize: 11 }}>
                          {new Date(r.entry_date).toLocaleTimeString('en-PK', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td style={s.td}>
                        <span style={{
                          background:   SOURCE_COLORS[r.source_type] || '#6c757d',
                          color:        '#fff',
                          borderRadius: 12,
                          padding:      '3px 10px',
                          fontSize:     11,
                          fontWeight:   700,
                          whiteSpace:   'nowrap',
                        }}>
                          {SOURCE_LABELS[r.source_type] || r.source_type}
                        </span>
                      </td>

                      <td style={{ ...s.td, maxWidth: 280, fontSize: 13 }}>{r.description}</td>

                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 700,
                                   color: hasIn ? '#198754' : '#adb5bd', whiteSpace: 'nowrap' }}>
                        {hasIn ? fmt(r.amount_in) : '—'}
                      </td>

                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 700,
                                   color: hasOut ? '#dc3545' : '#adb5bd', whiteSpace: 'nowrap' }}>
                        {hasOut ? fmt(r.amount_out) : '—'}
                      </td>

                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 700,
                                   color: rColor, whiteSpace: 'nowrap' }}>
                        ₨ {fmt(bal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr style={{ background: '#1a1a2e', color: '#fff', fontWeight: 700 }}>
                  <td colSpan={4} style={{ ...s.td, textAlign: 'right', color: '#ccc' }}>
                    Page Totals →
                  </td>
                  <td style={{ ...s.td, textAlign: 'right', color: '#90ee90', fontSize: 14, whiteSpace: 'nowrap' }}>
                    ₨ {fmt(summary.total_in)}
                  </td>
                  <td style={{ ...s.td, textAlign: 'right', color: '#ff6b6b', fontSize: 14, whiteSpace: 'nowrap' }}>
                    ₨ {fmt(summary.total_out)}
                  </td>
                  <td style={{ ...s.td, textAlign: 'right', fontSize: 14,
                               color: summary.balance >= 0 ? '#90ee90' : '#ff6b6b', whiteSpace: 'nowrap' }}>
                    ₨ {fmt(summary.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination — always rendered when totalPages > 1 ── */}
      {totalPages > 1 && (
        <div style={s.pagination}>

          <PageBtn onClick={() => goPage(1)} disabled={currentPage === 1}>«</PageBtn>
          <PageBtn onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}>‹</PageBtn>

          {pageRange.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} style={{ padding: '0 6px', color: '#6c757d', lineHeight: '30px' }}>
                …
              </span>
            ) : (
              <PageBtn key={`page-${p}`} onClick={() => goPage(p)} active={p === currentPage}>
                {p}
              </PageBtn>
            )
          )}

          <PageBtn onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages}>›</PageBtn>
          <PageBtn onClick={() => goPage(totalPages)} disabled={currentPage === totalPages}>»</PageBtn>

          <span style={{ color: '#6c757d', fontSize: 12, marginLeft: 8 }}>
            Page {currentPage} of {totalPages} &nbsp;|&nbsp; {total.toLocaleString()} records
          </span>
        </div>
      )}

    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#495057' }}>{label}</label>
      {children}
    </div>
  );
}

function PageBtn({ onClick, disabled, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background:   active ? '#0d6efd' : disabled ? '#e9ecef' : '#fff',
        color:        active ? '#fff'    : disabled ? '#adb5bd' : '#212529',
        border:       '1px solid ' + (active ? '#0d6efd' : '#dee2e6'),
        borderRadius: 6,
        padding:      '4px 11px',
        cursor:       disabled ? 'not-allowed' : 'pointer',
        fontWeight:   active ? 700 : 400,
        fontSize:     13,
        minWidth:     32,
        lineHeight:   '22px',
        transition:   'background 0.15s',
      }}
    >
      {children}
    </button>
  );
}

// ── Styles ───────────────────────────────────────────────────

const s = {
  page: {
    padding:    16,
    fontFamily: 'Nunito, sans-serif',
    background: '#f0f2f5',
    minHeight:  '100vh',
    boxSizing:  'border-box',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   16,
    flexWrap:       'wrap',
    gap:            8,
  },
  title:    { margin: 0, color: '#1a1a2e', fontSize: 22, fontWeight: 800 },
  subtitle: { color: '#6c757d', fontSize: 12 },

  cardGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap:                 12,
    marginBottom:        18,
  },
  card: {
    borderRadius: 10,
    padding:      '14px 18px',
    borderLeft:   '4px solid',
    boxShadow:    '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardLabel: { fontSize: 11, color: '#495057', fontWeight: 700 },
  cardValue: { fontSize: 20, fontWeight: 800, marginTop: 4 },

  filterBar: {
    background:   '#fff',
    borderRadius: 10,
    padding:      '12px 16px',
    marginBottom: 14,
    display:      'flex',
    flexWrap:     'wrap',
    gap:          10,
    alignItems:   'flex-end',
    boxShadow:    '0 1px 3px rgba(0,0,0,0.08)',
  },
  input: {
    border:       '1px solid #ced4da',
    borderRadius: 6,
    padding:      '6px 10px',
    fontSize:     13,
    outline:      'none',
    background:   '#fff',
  },
  btnPrimary: {
    background:   '#0d6efd',
    color:        '#fff',
    border:       'none',
    borderRadius: 6,
    padding:      '7px 16px',
    fontWeight:   700,
    cursor:       'pointer',
    fontSize:     13,
  },
  btnSecondary: {
    background:   '#6c757d',
    color:        '#fff',
    border:       'none',
    borderRadius: 6,
    padding:      '7px 16px',
    fontWeight:   700,
    cursor:       'pointer',
    fontSize:     13,
  },

  tableCard: {
    background:   '#fff',
    borderRadius: 10,
    boxShadow:    '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: 14,
  },
  scrollWrap: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 320px)',
    width:     '100%',
  },
  centerMsg: { padding: 40, textAlign: 'center', color: '#6c757d', fontSize: 15 },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding:      '10px 12px',
    textAlign:    'left',
    fontWeight:   700,
    whiteSpace:   'nowrap',
    fontSize:     12,
    background:   '#1a1a2e',
    color:        '#fff',
    position:     'sticky',
    top:          0,
    zIndex:       1,
  },
  td: { padding: '8px 12px', verticalAlign: 'middle' },

  pagination: {
    display:        'flex',
    justifyContent: 'center',
    alignItems:     'center',
    gap:            5,
    flexWrap:       'wrap',
    paddingBottom:  16,
  },
};