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

  const fetchSalaryHistory = async () => {
    try {
      const response = await fetch(`http://localhost:4000/get-salary-history?staff_id=${selectedStaff}`);
      const data = await response.json();
      setSalaryHistory(data || []);
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

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left Panel - Salary Processing */}
        <div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {/* <div style={{ background: editingSalary ? '#ffc107' : '#0d6efd', color: editingSalary ? '#000' : 'white', padding: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>
                {editingSalary ? '✏️ Edit Salary Record' : 'Staff Salary Processing'}
              </h2>
            </div> */}
            <div style={{ padding: '20px' }}>
              
              {/* Staff Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Select Staff *
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    disabled={editingSalary !== null}
                  >
                    <option value="">-- Select Staff --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.cnic}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Month *</label>
                  <select
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    disabled={editingSalary !== null}
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Year *</label>
                  <select
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    disabled={editingSalary !== null}
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {staffDetails && (
                <>
                  {/* Staff Info */}
                  <div style={{ background: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '4px', padding: '12px', marginBottom: '20px' }}>
                    <strong>Staff Details:</strong><br/>
                    Name: {staffDetails.name} | CNIC: {staffDetails.cnic} | 
                    Base Salary: Rs. {parseFloat(staffDetails.salary || 0).toFixed(2)}
                  </div>

                  {/* Salary Components */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Base Salary
                      </label>
                      <input
                        type="number"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(e.target.value)}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Allowances
                      </label>
                      <input
                        type="number"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={allowances}
                        onChange={(e) => setAllowances(e.target.value)}
                        step="0.01"
                        placeholder="Travel, Food, etc."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Bonuses
                      </label>
                      <input
                        type="number"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={bonuses}
                        onChange={(e) => setBonuses(e.target.value)}
                        step="0.01"
                        placeholder="Performance bonus, etc."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Deductions
                      </label>
                      <input
                        type="number"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        value={deductions}
                        onChange={(e) => setDeductions(e.target.value)}
                        step="0.01"
                        placeholder="Advance, penalties, etc."
                      />
                    </div>
                  </div>

                  {/* Commission Section */}
                  <div style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', padding: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          Pending Commission 
                          {loadingCommission && <span style={{ fontSize: '12px', marginLeft: '8px' }}>(Loading...)</span>}
                        </h4>
                        <h3 style={{ margin: '5px 0', fontSize: '24px', color: pendingCommission > 0 ? '#28a745' : '#6c757d' }}>
                          Rs. {pendingCommission.toFixed(2)}
                        </h3>
                        {unpaidInvoices > 0 && (
                          <small style={{ color: '#666', fontSize: '12px' }}>
                            📋 {unpaidInvoices} unpaid invoice(s)
                          </small>
                        )}
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={includeCommission}
                          onChange={(e) => setIncludeCommission(e.target.checked)}
                          style={{ width: '18px', height: '18px' }}
                          disabled={pendingCommission <= 0}
                        />
                        <span>Include in Salary</span>
                      </label>
                    </div>
                    
                    {pendingCommission > 0 && (
                      <div style={{ 
                        background: '#fff3cd', 
                        border: '1px solid #ffc107', 
                        borderRadius: '4px', 
                        padding: '10px', 
                        marginBottom: '10px',
                        fontSize: '13px'
                      }}>
                        ℹ️ <strong>Distribution Info:</strong> Commission will be automatically distributed to unpaid invoices (oldest first).
                      </div>
                    )}
                    
                    {includeCommission && pendingCommission > 0 && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Commission Amount to Include
                        </label>
                        <input
                          type="number"
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                          value={commissionToInclude}
                          onChange={(e) => setCommissionToInclude(Math.min(parseFloat(e.target.value) || 0, pendingCommission))}
                          max={pendingCommission}
                          step="0.01"
                        />
                        <small style={{ color: '#666', fontSize: '12px' }}>
                          Max: Rs. {pendingCommission.toFixed(2)} | You can include partial or full amount
                        </small>
                      </div>
                    )}
                    
                    {pendingCommission === 0 && !loadingCommission && (
                      <div style={{ textAlign: 'center', color: '#28a745', padding: '10px' }}>
                        ✓ No pending commission
                      </div>
                    )}
                  </div>

                  {/* Net Salary Summary */}
                  <div style={{ background: editingSalary ? '#ffc107' : '#0d6efd', color: editingSalary ? '#000' : 'white', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <small>Base Salary:</small>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Rs. {parseFloat(baseSalary || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <small>Allowances:</small>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Rs. {parseFloat(allowances || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <small>Bonuses:</small>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Rs. {parseFloat(bonuses || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <small>Commission:</small>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Rs. {parseFloat(commissionToInclude || 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <small>Deductions:</small>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: editingSalary ? '#dc3545' : '#ffc107' }}>- Rs. {parseFloat(deductions || 0).toFixed(2)}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2', borderTop: `1px solid ${editingSalary ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}`, paddingTop: '10px', marginTop: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '22px' }}>Net Salary: Rs. {netSalary.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                      Payment Method
                    </label>
                    <select
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Notes</label>
                    <textarea
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      rows="3"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Optional notes about this salary payment..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: loading ? '#6c757d' : (editingSalary ? '#ffc107' : '#28a745'),
                        color: editingSalary ? '#000' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                      onClick={handleProcessSalary}
                      disabled={loading || !selectedStaff}
                    >
                      {loading ? 'Processing...' : (editingSalary ? '✏️ Update Salary' : 'Process Salary Payment')}
                    </button>
                    <button
                      style={{
                        padding: '12px 24px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                      onClick={resetForm}
                    >
                      {editingSalary ? 'Cancel' : 'Reset'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Salary History */}
        <div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              background: '#6c757d',
              color: 'white',
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Salary History</h3>
              <button
                style={{
                  background: 'white',
                  color: '#6c757d',
                  border: 'none',
                  padding: '5px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide' : 'Show'}
              </button>
            </div>
            {showHistory && selectedStaff && (
              <div style={{ padding: '15px', maxHeight: '600px', overflowY: 'auto' }}>
                {salaryHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>No salary history found</p>
                ) : (
                  salaryHistory.map((record, index) => (
                    <div key={index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '10px',
                      marginBottom: '10px',
                      background: editingSalary?.id === record.id ? '#fff3cd' : 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong>
                          {months.find(m => m.value === String(record.month).padStart(2, '0'))?.label} {record.year}
                        </strong>
                        <span style={{
                          background: '#28a745',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}>
                          Rs. {parseFloat(record.net_salary).toFixed(2)}
                        </span>
                      </div>
                      <small style={{ display: 'block', color: '#666' }}>
                        Base: Rs. {parseFloat(record.base_salary).toFixed(2)}
                      </small>
                      {parseFloat(record.commission_included || 0) > 0 && (
                        <small style={{ display: 'block', color: '#28a745' }}>
                          ✓ Commission: Rs. {parseFloat(record.commission_included).toFixed(2)}
                        </small>
                      )}
                      {parseFloat(record.allowances || 0) > 0 && (
                        <small style={{ display: 'block', color: '#17a2b8' }}>
                          Allowances: Rs. {parseFloat(record.allowances).toFixed(2)}
                        </small>
                      )}
                      {parseFloat(record.deductions || 0) > 0 && (
                        <small style={{ display: 'block', color: '#dc3545' }}>
                          Deductions: Rs. {parseFloat(record.deductions).toFixed(2)}
                        </small>
                      )}
                      <small style={{ display: 'block', color: '#666', marginTop: '5px', marginBottom: '8px' }}>
                        {new Date(record.payment_date).toLocaleDateString()} - {record.payment_method}
                      </small>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                        {/* <button
                          style={{
                            flex: 1,
                            padding: '5px',
                            background: '#ffc107',
                            color: '#000',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                          onClick={() => handleEditSalary(record)}
                        >
                          ✏️ Edit
                        </button> */}
                        <button
                          style={{
                            flex: 1,
                            padding: '5px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                          onClick={() => handleDeleteSalary(record.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSalaryManagement;