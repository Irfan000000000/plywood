import React, { useEffect, useState } from "react";

const StaffSalaryManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [staffDetails, setStaffDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [baseSalary, setBaseSalary] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [bonuses, setBonuses] = useState(0);
  const [includeCommission, setIncludeCommission] = useState(true);
  const [pendingCommission, setPendingCommission] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);
  const [commissionToInclude, setCommissionToInclude] = useState(0);
  const [loadingCommission, setLoadingCommission] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [editingSalary, setEditingSalary] = useState(null);


  const [fromMonth, setFromMonth] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toYear, setToYear] = useState("");
  const [salaryTotals, setSalaryTotals] = useState(null);



  const netSalary = parseFloat(baseSalary || 0) + 
                    parseFloat(allowances || 0) + 
                    parseFloat(bonuses || 0) + 
                    (includeCommission ? parseFloat(commissionToInclude || 0) : 0) - 
                    parseFloat(deductions || 0);

  useEffect(() => {
    fetchStaffList();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchStaffDetails();
      fetchPendingCommission();
      fetchSalaryHistory();
    } else {
      // Reset when no staff selected
      setStaffDetails(null);
      setPendingCommission(0);
      setUnpaidInvoices(0);
      setCommissionToInclude(0);
      setSalaryHistory([]);
    }
  }, [selectedStaff]);

  useEffect(() => {
    if (includeCommission && !editingSalary) {
      setCommissionToInclude(pendingCommission);
    } else if (!includeCommission) {
      setCommissionToInclude(0);
    }
  }, [includeCommission, pendingCommission]);

  const fetchStaffList = async () => {
    try {
      const response = await fetch('http://localhost:4000/get-staff-list');
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      alert("Failed to fetch staff list");
    }
  };

  const fetchStaffDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/get-staff-details/${selectedStaff}`);
      const data = await response.json();
      setStaffDetails(data);
      if (!editingSalary) {
        setBaseSalary(data.salary || 0);
      }
    } catch (error) {
      console.error("Error fetching staff details:", error);
    }
  };

  const fetchPendingCommission = async () => {
    setLoadingCommission(true);
    try {
      const response = await fetch(`http://localhost:4000/get-pending-commission?staff_id=${selectedStaff}`);
      const data = await response.json();
      setPendingCommission(data.pending_commission || 0);
      setUnpaidInvoices(data.unpaid_invoices || 0);
      if (!editingSalary) {
        setCommissionToInclude(data.pending_commission || 0);
      }
    } catch (error) {
      console.error("Error fetching pending commission:", error);
      setPendingCommission(0);
      setUnpaidInvoices(0);
    } finally {
      setLoadingCommission(false);
    }
  };

  // const fetchSalaryHistory = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:4000/get-salary-history?staff_id=${selectedStaff}`);
  //     const data = await response.json();
  //     setSalaryHistory(data || []);
  //   } catch (error) {
  //     console.error("Error fetching salary history:", error);
  //   }
  // };

  const fetchSalaryHistory = async () => {
  try {
    // Build URL with optional staff_id
    let url = `http://localhost:4000/get-salary-history?`;
    
    const queryParams = [];
    
    // Add staff_id only if selected
    if (selectedStaff) {
      queryParams.push(`staff_id=${selectedStaff}`);
    }
    
    // Add date range parameters if set
    if (selectedMonth && selectedYear) {
      queryParams.push(`from_month=${selectedMonth}`);
      queryParams.push(`from_year=${selectedYear}`);
      queryParams.push(`to_month=${selectedMonth}`);
      queryParams.push(`to_year=${selectedYear}`);
    }
    
    url += queryParams.join('&');
    
    const response = await fetch(url);
    const data = await response.json();
    setSalaryHistory(data.records || []);
    setSalaryTotals(data.totals || null);
  } catch (error) {
    console.error("Error fetching salary history:", error);
  }
};

  const handleEditSalary = (record) => {
    setEditingSalary(record);
    setSelectedMonth(String(record.month).padStart(2, '0'));
    setSelectedYear(record.year);
    setBaseSalary(record.base_salary);
    setAllowances(record.allowances || 0);
    setDeductions(record.deductions || 0);
    setBonuses(record.bonuses || 0);
    setCommissionToInclude(record.commission_included || 0);
    setIncludeCommission(parseFloat(record.commission_included || 0) > 0);
    setPaymentMethod(record.payment_method);
    setPaymentNotes(record.notes || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSalary = async (salaryId) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/delete-staff-salary/${salaryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete salary");
      }

      alert("Salary record deleted successfully!");
      fetchSalaryHistory();
      fetchPendingCommission();
    } catch (error) {
      console.error("Error deleting salary:", error);
      alert(error.message || "Failed to delete salary");
    }
  };

  const handleProcessSalary = async () => {
    if (!selectedStaff || !selectedMonth || !selectedYear) {
      alert("Please select staff and month/year");
      return;
    }

    if (netSalary <= 0) {
      alert("Net salary must be greater than 0");
      return;
    }

    const isEdit = editingSalary !== null;
    
    let confirmMsg = "";
    if (isEdit) {
      confirmMsg = `Update salary to Rs. ${netSalary.toFixed(2)}?`;
    } else {
      if (includeCommission && commissionToInclude > 0) {
        confirmMsg = `Process salary of Rs. ${netSalary.toFixed(2)}\n\nThis includes Rs. ${commissionToInclude.toFixed(2)} commission payment that will be distributed across ${unpaidInvoices} unpaid invoice(s).\n\nContinue?`;
      } else {
        confirmMsg = `Process salary of Rs. ${netSalary.toFixed(2)}?`;
      }
    }

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const url = isEdit 
        ? `http://localhost:4000/update-staff-salary/${editingSalary.id}`
        : 'http://localhost:4000/process-staff-salary';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: selectedStaff,
          month: selectedMonth,
          year: selectedYear,
          base_salary: baseSalary,
          allowances: allowances,
          deductions: deductions,
          bonuses: bonuses,
          commission_included: includeCommission ? commissionToInclude : 0,
          net_salary: netSalary,
          payment_method: paymentMethod,
          notes: paymentNotes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process salary");
      }

      const result = await response.json();
      
      let successMsg = isEdit ? "Salary updated successfully!" : "Salary processed successfully!";
      if (result.commission_payments) {
        successMsg += `\n\n${result.commission_payments} commission payment(s) distributed.\nTotal commission paid: Rs. ${result.total_commission_paid.toFixed(2)}`;
      }
      
      alert(successMsg);
      resetForm();
      fetchPendingCommission();
      fetchSalaryHistory();
    } catch (error) {
      console.error("Error processing salary:", error);
      alert(error.message || "Failed to process salary");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingSalary(null);
    setAllowances(0);
    setDeductions(0);
    setBonuses(0);
    setIncludeCommission(true);
    setPaymentNotes("");
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    setSelectedMonth(currentMonth);
    if (staffDetails) {
      setBaseSalary(staffDetails.salary || 0);
    }
    if (pendingCommission > 0) {
      setCommissionToInclude(pendingCommission);
    }
  };

  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
  // Fetch history even when no staff is selected to show all records
  fetchSalaryHistory();
}, [selectedStaff, selectedMonth, selectedYear]);

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#faf5ff', minHeight: '100%' }}>
      <style>{`
        .ss-wrap { display: flex; gap: 0; height: 100%; }

        /* ── TOP BAR ── */
        .ss-topbar {
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(76,29,149,.3);
        }
        .ss-topbar-icon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 15px;
        }
        .ss-topbar-title { font-size: 14px; font-weight: 800; color: #fff; }
        .ss-topbar-sub   { font-size: 11px; color: rgba(255,255,255,.65); }

        /* ── LEFT (FORM) ── */
        .ss-left {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          padding: 14px 14px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── RIGHT (HISTORY) ── */
        .ss-right {
          width: 360px;
          flex-shrink: 0;
          border-left: 1px solid #e9d5ff;
          display: flex;
          flex-direction: column;
          background: #fff;
          overflow: hidden;
        }
        .ss-right-header {
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .ss-right-title { font-size: 13px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 7px; }
        .ss-history-body { flex: 1; overflow-y: auto; padding: 10px; }

        /* ── CARD / SECTION ── */
        .ss-card {
          background: #fff;
          border: 1px solid #e9d5ff;
          border-radius: 10px;
          overflow: hidden;
        }
        .ss-card-head {
          background: linear-gradient(90deg, #ede9fe, #f5f3ff);
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 800;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: .5px;
          display: flex;
          align-items: center;
          gap: 7px;
          border-bottom: 1px solid #e9d5ff;
        }
        .ss-card-body { padding: 12px; }

        /* ── FIELDS ── */
        .ss-row { display: flex; gap: 8px; }
        .ss-field { flex: 1; margin-bottom: 8px; }
        .ss-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: .4px;
          margin-bottom: 3px;
        }
        .ss-input {
          width: 100%;
          padding: 6px 9px;
          border: 1px solid #ddd6fe;
          border-radius: 6px;
          font-size: 12px;
          color: #1e1b4b;
          outline: none;
          box-sizing: border-box;
          transition: border .15s;
        }
        .ss-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.12); }
        .ss-input:disabled { background: #f5f3ff; color: #9ca3af; }
        .ss-textarea {
          width: 100%;
          padding: 7px 9px;
          border: 1px solid #ddd6fe;
          border-radius: 6px;
          font-size: 12px;
          color: #1e1b4b;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
        }
        .ss-textarea:focus { border-color: #7c3aed; }

        /* ── STAFF INFO BANNER ── */
        .ss-staff-banner {
          background: linear-gradient(90deg, #ede9fe, #faf5ff);
          border: 1px solid #c4b5fd;
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ss-staff-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 16px; flex-shrink: 0;
        }
        .ss-staff-name { font-size: 13px; font-weight: 700; color: #4c1d95; }
        .ss-staff-meta { font-size: 11px; color: #6b7280; margin-top: 1px; }
        .ss-salary-chip {
          margin-left: auto;
          background: #7c3aed;
          color: #fde68a;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* ── COMMISSION BOX ── */
        .ss-comm-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 12px;
        }
        .ss-comm-amount { font-size: 22px; font-weight: 800; color: #16a34a; line-height: 1; }
        .ss-comm-label  { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
        .ss-comm-toggle {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: #374151;
          cursor: pointer;
        }
        .ss-comm-toggle input { width: 15px; height: 15px; accent-color: #7c3aed; }
        .ss-info-note {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          padding: 7px 10px;
          font-size: 11px;
          color: #92400e;
          margin-top: 8px;
        }
        .ss-no-comm { color: #16a34a; font-size: 12px; font-weight: 600; text-align: center; padding: 4px; }

        /* ── NET SALARY BANNER ── */
        .ss-net-banner {
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
          border-radius: 10px;
          padding: 14px 16px;
        }
        .ss-net-banner.editing { background: linear-gradient(135deg, #92400e, #d97706); }
        .ss-net-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ss-net-item-label { font-size: 10px; color: rgba(255,255,255,.7); }
        .ss-net-item-val   { font-size: 13px; font-weight: 700; color: #fff; }
        .ss-net-item-val.ded { color: #fca5a5; }
        .ss-net-total {
          grid-column: span 2;
          border-top: 1px solid rgba(255,255,255,.25);
          padding-top: 10px;
          margin-top: 4px;
        }
        .ss-net-total-label { font-size: 11px; color: rgba(255,255,255,.7); }
        .ss-net-total-val   { font-size: 22px; font-weight: 800; color: #fde68a; }

        /* ── BUTTONS ── */
        .ss-btn-process {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: opacity .15s;
        }
        .ss-btn-process.editing { background: linear-gradient(135deg, #d97706, #f59e0b); color: #1a1a1a; }
        .ss-btn-process:disabled { opacity: .5; cursor: not-allowed; }
        .ss-btn-reset {
          padding: 10px 18px;
          background: rgba(124,58,237,.1);
          color: #7c3aed;
          border: 1px solid #ddd6fe;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .ss-btn-reset:hover { background: rgba(124,58,237,.18); }

        /* ── HISTORY RECORDS ── */
        .ss-totals-card {
          background: linear-gradient(135deg, #ede9fe, #f5f3ff);
          border: 1px solid #c4b5fd;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .ss-totals-title { font-size: 10px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 8px; }
        .ss-totals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .ss-totals-item-label { font-size: 10px; color: #6b7280; }
        .ss-totals-item-val   { font-size: 12px; font-weight: 700; color: #4c1d95; }
        .ss-totals-net-label { font-size: 10px; color: #7c3aed; }
        .ss-totals-net-val   { font-size: 15px; font-weight: 800; color: #7c3aed; }

        .ss-rec-card {
          border: 1px solid #e9d5ff;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
          background: #fff;
          transition: box-shadow .15s;
        }
        .ss-rec-card.active { border-color: #f59e0b; background: #fffbeb; }
        .ss-rec-card:hover  { box-shadow: 0 2px 8px rgba(124,58,237,.12); }
        .ss-rec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .ss-rec-period { font-size: 12px; font-weight: 700; color: #4c1d95; }
        .ss-rec-net { background: #7c3aed; color: #fff; padding: 2px 9px; border-radius: 10px; font-size: 11px; font-weight: 700; }
        .ss-rec-staff-tag {
          background: #ede9fe; color: #6d28d9;
          font-size: 10px; font-weight: 700;
          padding: 2px 8px; border-radius: 6px;
          margin-bottom: 6px; display: inline-flex; align-items: center; gap: 4px;
        }
        .ss-rec-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
        .ss-rec-chip {
          font-size: 10px; padding: 1px 7px; border-radius: 8px; font-weight: 600;
        }
        .ss-chip-base  { background: #f3f4f6; color: #374151; }
        .ss-chip-allow { background: #e0f2fe; color: #0369a1; }
        .ss-chip-bonus { background: #fef9c3; color: #854d0e; }
        .ss-chip-comm  { background: #dcfce7; color: #15803d; }
        .ss-chip-ded   { background: #fee2e2; color: #b91c1c; }
        .ss-rec-meta { font-size: 10px; color: #9ca3af; margin-top: 4px; }
        .ss-rec-del {
          width: 100%;
          margin-top: 7px;
          padding: 4px;
          background: rgba(239,68,68,.1);
          color: #dc2626;
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
        }
        .ss-rec-del:hover { background: rgba(239,68,68,.2); }

        .ss-empty { text-align: center; color: #9ca3af; font-size: 12px; padding: 24px 0; }

        /* placeholder state */
        .ss-placeholder {
          background: #f5f3ff;
          border: 1px dashed #c4b5fd;
          border-radius: 10px;
          padding: 24px;
          text-align: center;
          color: #8b5cf6;
        }
        .ss-placeholder-icon { font-size: 28px; margin-bottom: 8px; }
        .ss-placeholder-text { font-size: 12px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="ss-topbar">
        <div className="ss-topbar-icon"><i className="fas fa-money-bill-wave"></i></div>
        <div>
          <div className="ss-topbar-title">{editingSalary ? 'Edit Salary Record' : 'Staff Salary Management'}</div>
          <div className="ss-topbar-sub">Process and manage staff salary payments</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ss-wrap">

        {/* ═══════════ LEFT — FORM ═══════════ */}
        <div className="ss-left">

          {/* Staff + Period */}
          <div className="ss-card">
            <div className="ss-card-head"><i className="fas fa-user-tie"></i> Staff & Pay Period</div>
            <div className="ss-card-body">
              <div className="ss-row">
                <div className="ss-field" style={{ flex: 2 }}>
                  <label>Select Staff *</label>
                  <select className="ss-input" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} disabled={editingSalary !== null}>
                    <option value="">-- Select Staff Member --</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {s.cnic}</option>
                    ))}
                  </select>
                </div>
                <div className="ss-field">
                  <label>Month *</label>
                  <select className="ss-input" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} disabled={editingSalary !== null}>
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="ss-field">
                  <label>Year *</label>
                  <select className="ss-input" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} disabled={editingSalary !== null}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {staffDetails && (
                <div className="ss-staff-banner">
                  <div className="ss-staff-avatar"><i className="fas fa-user"></i></div>
                  <div>
                    <div className="ss-staff-name">{staffDetails.name}</div>
                    <div className="ss-staff-meta">CNIC: {staffDetails.cnic}</div>
                  </div>
                  <div className="ss-salary-chip">Base Rs. {parseFloat(staffDetails.salary || 0).toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          {staffDetails ? (
            <>
              {/* Salary Components */}
              <div className="ss-card">
                <div className="ss-card-head"><i className="fas fa-sliders-h"></i> Salary Components</div>
                <div className="ss-card-body">
                  <div className="ss-row">
                    <div className="ss-field">
                      <label>Base Salary</label>
                      <input className="ss-input" type="number" step="0.01" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} />
                    </div>
                    <div className="ss-field">
                      <label>Allowances</label>
                      <input className="ss-input" type="number" step="0.01" placeholder="Travel, food…" value={allowances} onChange={e => setAllowances(e.target.value)} />
                    </div>
                  </div>
                  <div className="ss-row">
                    <div className="ss-field">
                      <label>Bonuses</label>
                      <input className="ss-input" type="number" step="0.01" placeholder="Performance…" value={bonuses} onChange={e => setBonuses(e.target.value)} />
                    </div>
                    <div className="ss-field">
                      <label>Deductions</label>
                      <input className="ss-input" type="number" step="0.01" placeholder="Advance, penalty…" value={deductions} onChange={e => setDeductions(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Commission */}
              <div className="ss-card d-none">
                <div className="ss-card-head"><i className="fas fa-percentage"></i> Commission {loadingCommission && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(loading…)</span>}</div>
                <div className="ss-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="ss-comm-box" style={{ flex: 1 }}>
                      <div className="ss-comm-label">Pending Commission</div>
                      <div className="ss-comm-amount">Rs. {pendingCommission.toFixed(2)}</div>
                      {unpaidInvoices > 0 && (
                        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>
                          <i className="fas fa-file-invoice" style={{ marginRight: 4 }}></i>
                          {unpaidInvoices} unpaid invoice(s)
                        </div>
                      )}
                    </div>
                    <label className="ss-comm-toggle">
                      <input type="checkbox" checked={includeCommission} onChange={e => setIncludeCommission(e.target.checked)} disabled={pendingCommission <= 0} />
                      Include in Salary
                    </label>
                  </div>

                  {pendingCommission > 0 && (
                    <div className="ss-info-note">
                      <i className="fas fa-info-circle" style={{ marginRight: 5 }}></i>
                      Commission is distributed to unpaid invoices (oldest first) when salary is processed.
                    </div>
                  )}

                  {includeCommission && pendingCommission > 0 && (
                    <div className="ss-field" style={{ marginTop: 10, marginBottom: 0 }}>
                      <label>Commission Amount to Include <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(Max Rs. {pendingCommission.toFixed(2)})</span></label>
                      <input
                        className="ss-input"
                        type="number"
                        step="0.01"
                        value={commissionToInclude}
                        onChange={e => setCommissionToInclude(Math.min(parseFloat(e.target.value) || 0, pendingCommission))}
                      />
                    </div>
                  )}

                  {pendingCommission === 0 && !loadingCommission && (
                    <div className="ss-no-comm"><i className="fas fa-check-circle" style={{ marginRight: 5 }}></i>No pending commission</div>
                  )}
                </div>
              </div>

              {/* Net Salary Summary */}
              <div className={`ss-net-banner${editingSalary ? ' editing' : ''}`}>
                <div className="ss-net-grid">
                  <div>
                    <div className="ss-net-item-label">Base Salary</div>
                    <div className="ss-net-item-val">Rs. {parseFloat(baseSalary || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="ss-net-item-label">Allowances</div>
                    <div className="ss-net-item-val">Rs. {parseFloat(allowances || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="ss-net-item-label">Bonuses</div>
                    <div className="ss-net-item-val">Rs. {parseFloat(bonuses || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="ss-net-item-label">Commission</div>
                    <div className="ss-net-item-val">Rs. {parseFloat(commissionToInclude || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="ss-net-item-label">Deductions</div>
                    <div className="ss-net-item-val ded">− Rs. {parseFloat(deductions || 0).toFixed(2)}</div>
                  </div>
                  <div className="ss-net-total">
                    <div className="ss-net-total-label">Net Salary</div>
                    <div className="ss-net-total-val">Rs. {netSalary.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="ss-card">
                <div className="ss-card-head"><i className="fas fa-credit-card"></i> Payment Details</div>
                <div className="ss-card-body">
                  <div className="ss-row">
                    <div className="ss-field">
                      <label>Payment Method</label>
                      <select className="ss-input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="ss-field" style={{ marginBottom: 0 }}>
                    <label>Notes</label>
                    <textarea className="ss-textarea" rows={2} placeholder="Optional notes…" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`ss-btn-process${editingSalary ? ' editing' : ''}`}
                  onClick={handleProcessSalary}
                  disabled={loading || !selectedStaff}
                >
                  {loading
                    ? <><i className="fas fa-spinner fa-spin"></i> Processing…</>
                    : editingSalary
                      ? <><i className="fas fa-save"></i> Update Salary</>
                      : <><i className="fas fa-check-circle"></i> Process Salary Payment</>
                  }
                </button>
                <button className="ss-btn-reset" onClick={resetForm}>
                  {editingSalary ? 'Cancel' : 'Reset'}
                </button>
              </div>
            </>
          ) : (
            <div className="ss-placeholder">
              <div className="ss-placeholder-icon"><i className="fas fa-user-circle"></i></div>
              <div className="ss-placeholder-text">Select a staff member above to begin salary processing</div>
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT — HISTORY ═══════════ */}
        <div className="ss-right">
          <div className="ss-right-header">
            <div className="ss-right-title"><i className="fas fa-history"></i> Salary History</div>
            <button
              onClick={() => setShowHistory(h => !h)}
              style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>

          {showHistory && (
            <div className="ss-history-body">

              {/* Totals */}
              {salaryTotals && salaryTotals.count > 0 && (
                <div className="ss-totals-card">
                  <div className="ss-totals-title">
                    <i className="fas fa-sigma" style={{ marginRight: 5 }}></i>
                    Totals — {salaryTotals.count} record{salaryTotals.count !== 1 ? 's' : ''}
                  </div>
                  <div className="ss-totals-grid">
                    <div>
                      <div className="ss-totals-item-label">Base Salary</div>
                      <div className="ss-totals-item-val">Rs. {salaryTotals.base_salary.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="ss-totals-item-label">Allowances</div>
                      <div className="ss-totals-item-val" style={{ color: '#0369a1' }}>Rs. {salaryTotals.allowances.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="ss-totals-item-label">Bonuses</div>
                      <div className="ss-totals-item-val" style={{ color: '#d97706' }}>Rs. {salaryTotals.bonuses.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="ss-totals-item-label">Commission</div>
                      <div className="ss-totals-item-val" style={{ color: '#16a34a' }}>Rs. {salaryTotals.commission_included.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="ss-totals-item-label">Deductions</div>
                      <div className="ss-totals-item-val" style={{ color: '#b91c1c' }}>Rs. {salaryTotals.deductions.toFixed(2)}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #c4b5fd', paddingTop: 7, marginTop: 4 }}>
                      <div className="ss-totals-net-label">Net Total</div>
                      <div className="ss-totals-net-val">Rs. {salaryTotals.net_salary.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Records */}
              {salaryHistory.length === 0 ? (
                <div className="ss-empty"><i className="fas fa-inbox" style={{ display: 'block', fontSize: 22, marginBottom: 6 }}></i>No salary records found</div>
              ) : (
                salaryHistory.map((record, idx) => (
                  <div key={idx} className={`ss-rec-card${editingSalary?.id === record.id ? ' active' : ''}`}>
                    {!selectedStaff && (
                      <div className="ss-rec-staff-tag">
                        <i className="fas fa-user"></i>
                        {record.staff_name} — {record.staff_cnic}
                      </div>
                    )}
                    <div className="ss-rec-head">
                      <div className="ss-rec-period">
                        {months.find(m => m.value === String(record.month).padStart(2, '0'))?.label} {record.year}
                      </div>
                      <div className="ss-rec-net">Rs. {parseFloat(record.net_salary).toFixed(2)}</div>
                    </div>
                    <div className="ss-rec-row">
                      <span className="ss-rec-chip ss-chip-base">Base {parseFloat(record.base_salary).toFixed(0)}</span>
                      {parseFloat(record.allowances || 0) > 0 && <span className="ss-rec-chip ss-chip-allow">Allow {parseFloat(record.allowances).toFixed(0)}</span>}
                      {parseFloat(record.bonuses || 0) > 0 && <span className="ss-rec-chip ss-chip-bonus">Bonus {parseFloat(record.bonuses).toFixed(0)}</span>}
                      {parseFloat(record.commission_included || 0) > 0 && <span className="ss-rec-chip ss-chip-comm">Comm {parseFloat(record.commission_included).toFixed(0)}</span>}
                      {parseFloat(record.deductions || 0) > 0 && <span className="ss-rec-chip ss-chip-ded">Ded {parseFloat(record.deductions).toFixed(0)}</span>}
                    </div>
                    <div className="ss-rec-meta">
                      <i className="fas fa-calendar-alt" style={{ marginRight: 4 }}></i>
                      {new Date(record.payment_date).toLocaleDateString()}
                      &nbsp;·&nbsp;
                      <i className="fas fa-credit-card" style={{ marginRight: 4 }}></i>
                      {record.payment_method}
                    </div>
                    {selectedStaff && (
                      <button className="ss-rec-del" onClick={() => handleDeleteSalary(record.id)}>
                        <i className="fas fa-trash-alt" style={{ marginRight: 5 }}></i>Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StaffSalaryManagement;