// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";

// const StaffCommissionManagement = () => {
//   // State variables
//   const [staffList, setStaffList] = useState([]);
//   const [commissionData, setCommissionData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
  
//   // Filter states
//   const [selectedStaff, setSelectedStaff] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [commissionStatus, setCommissionStatus] = useState(""); // paid, unpaid, all
//   const [searchInvoice, setSearchInvoice] = useState("");
  
//   // Modal states
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedCommission, setSelectedCommission] = useState(null);
//   const [paymentAmount, setPaymentAmount] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("cash");
//   const [paymentNotes, setPaymentNotes] = useState("");
  
//   // Summary states
//   const [totalCommission, setTotalCommission] = useState(0);
//   const [totalPaid, setTotalPaid] = useState(0);
//   const [totalUnpaid, setTotalUnpaid] = useState(0);
  
//   const [tableHeight, setTableHeight] = useState(500);
//   const [selectedRowIndex, setSelectedRowIndex] = useState(0);
//   const tableRef = useRef(null);
//   const selectedRowRef = useRef(null);

//   // Fetch staff list on component mount
//   useEffect(() => {
//     fetchStaffList();
//   }, []);

//   // Fetch commission data when filters change
//   useEffect(() => {
//     if (selectedStaff) {
//       fetchCommissionData();
//     }
//   }, [currentPage, selectedStaff, fromDate, toDate, commissionStatus]);

//   // Calculate table height
//   useEffect(() => {
//     const calculateHeight = () => {
//       const availableHeight = window.innerHeight - 400;
//       setTableHeight(Math.max(availableHeight, 400));
//     };

//     calculateHeight();
//     window.addEventListener('resize', calculateHeight);
//     return () => window.removeEventListener('resize', calculateHeight);
//   }, []);

//   // Fetch staff list
//   const fetchStaffList = async () => {
//     try {
//       const response = await axios.get('http://localhost:4000/get-staff-list');
//       setStaffList(response.data);
//     } catch (error) {
//       console.error("Error fetching staff list:", error);
//       alert("Failed to fetch staff list");
//     }
//   };

//   // Fetch commission data
//   const fetchCommissionData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get("http://localhost:4000/get-staff-commission", {
//         params: {
//           page: currentPage,
//           limit: 50,
//           staff_id: selectedStaff,
//           from_date: fromDate,
//           to_date: toDate,
//           status: commissionStatus,
//           search: searchInvoice
//         }
//       });

//       setCommissionData(response.data.results || []);
//       setTotalPages(response.data.totalPages || 0);
//       setTotalCount(response.data.totalCount || 0);
      
//       // Calculate summary
//       const summary = response.data.summary || {};
//       setTotalCommission(summary.total_commission || 0);
//       setTotalPaid(summary.total_paid || 0);
//       setTotalUnpaid(summary.total_unpaid || 0);
      
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching commission data:", error);
//       setLoading(false);
//       alert("Failed to fetch commission data");
//     }
//   };

//   // Handle pay commission
//   const handlePayCommission = (commission) => {
//     setSelectedCommission(commission);
//     setPaymentAmount(commission.remaining_commission || commission.commission_amount);
//     setShowPaymentModal(true);
//   };

//   // Submit payment
//   const submitPayment = async () => {
//     if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
//       alert("Please enter a valid payment amount");
//       return;
//     }

//     try {
//       await axios.post("http://localhost:4000/add-commission-payment", {
//         invoice_no: selectedCommission.invoice_no,
//         staff_id: selectedStaff,
//         payment_amount: parseFloat(paymentAmount),
//         payment_method: paymentMethod,
//         notes: paymentNotes
//       });

//       alert("Payment added successfully");
//       setShowPaymentModal(false);
//       setSelectedCommission(null);
//       setPaymentAmount("");
//       setPaymentNotes("");
//       fetchCommissionData();
//     } catch (error) {
//       console.error("Error adding payment:", error);
//       alert("Failed to add payment");
//     }
//   };

//   // Handle page change
//   const handlePageChange = ({ selected }) => {
//     setCurrentPage(selected + 1);
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setFromDate("");
//     setToDate("");
//     setCommissionStatus("");
//     setSearchInvoice("");
//     setCurrentPage(1);
//   };

//   // Keyboard navigation
//   const handleTableKeyDown = (event) => {
//     if (loading || commissionData.length === 0) return;

//     const maxIndex = commissionData.length - 1;

//     switch(event.key) {
//       case "ArrowUp":
//         event.preventDefault();
//         setSelectedRowIndex(prev => Math.max(0, prev - 1));
//         break;
//       case "ArrowDown":
//         event.preventDefault();
//         setSelectedRowIndex(prev => Math.min(maxIndex, prev + 1));
//         break;
//       case "p":
//       case "P":
//         event.preventDefault();
//         if (commissionData[selectedRowIndex]) {
//           handlePayCommission(commissionData[selectedRowIndex]);
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   useEffect(() => {
//     if (selectedRowRef.current) {
//       selectedRowRef.current.scrollIntoView({
//         behavior: 'smooth',
//         block: 'nearest'
//       });
//     }
//   }, [selectedRowIndex]);

//   useEffect(() => {
//     const tableContainer = tableRef.current;
//     if (tableContainer) {
//       tableContainer.addEventListener('keydown', handleTableKeyDown);
//       tableContainer.focus();
//     }

//     return () => {
//       if (tableContainer) {
//         tableContainer.removeEventListener('keydown', handleTableKeyDown);
//       }
//     };
//   }, [selectedRowIndex, commissionData, loading]);

//   return (
//     <div className="container-fluid p-1">
    
//       {/* Filters Section */}
//       <div className="card mb-3">
//         <div className="card-body">
//           <div className="row g-3">
//             {/* Staff Selection */}
//             <div className="col-md-3">
//               <label className="form-label fw-bold">Select Staff *</label>
//               <select
//                 className="form-control"
//                 value={selectedStaff}
//                 onChange={(e) => {
//                   setSelectedStaff(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 required
//               >
//                 <option value="">-- Select Staff --</option>
//                 {staffList.map((staff) => (
//                   <option key={staff.id} value={staff.id}>
//                     {staff.name} ({staff.cnic})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* From Date */}
//             <div className="col-md-2">
//               <label className="form-label fw-bold">From Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//               />
//             </div>

//             {/* To Date */}
//             <div className="col-md-2">
//               <label className="form-label fw-bold">To Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//               />
//             </div>

//             {/* Commission Status */}
//             <div className="col-md-2 d-none">
//               <label className="form-label fw-bold">Status</label>
//               <select
//                 className="form-select"
//                 value={commissionStatus}
//                 onChange={(e) => {
//                   setCommissionStatus(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               >
//                 <option value="">All</option>
//                 <option value="paid">Paid</option>
//                 <option value="unpaid">Unpaid</option>
//               </select>
//             </div>

//             {/* Search Invoice */}
//             <div className="col-md-2 d-none">
//               <label className="form-label fw-bold">Search Invoice</label>
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Invoice #"
//                 value={searchInvoice}
//                 onChange={(e) => setSearchInvoice(e.target.value)}
//               />
//             </div>

//             {/* Reset Button */}
//             <div className="col-md-1 d-flex align-items-end">
//               <button
//                 className="btn btn-secondary w-100"
//                 onClick={resetFilters}
//               >
//                 Reset
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       {selectedStaff && (
//         <div className="row mb-3">
//           <div className="col-md-4">
//             <div className="card bg-primary text-white">
//               <div className="card-body">
//                 <h6 className="card-title">Total Commission</h6>
//                 <h3 className="mb-0">Rs. {totalCommission.toFixed(2)}</h3>
//               </div>
//             </div>
//           </div>
//           <div className="col-md-4">
//             <div className="card bg-success text-white">
//               <div className="card-body">
//                 <h6 className="card-title">Total Paid</h6>
//                 <h3 className="mb-0">Rs. {totalPaid.toFixed(2)}</h3>
//               </div>
//             </div>
//           </div>
//           <div className="col-md-4">
//             <div className="card bg-danger text-white">
//               <div className="card-body">
//                 <h6 className="card-title">Total Unpaid</h6>
//                 <h3 className="mb-0">Rs. {totalUnpaid.toFixed(2)}</h3>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Commission Table */}
//       {selectedStaff && (
//         <div 
//           ref={tableRef}
//           className="table-responsive" 
//           style={{
//             height: `${tableHeight}px`, 
//             overflowY: 'auto',
//             outline: 'none'
//           }}
//           tabIndex={0}
//         >
//           <table className="table table-striped table-hover">
//             <thead style={{ 
//               position: 'sticky', 
//               top: 0, 
//               backgroundColor: '#fff', 
//               zIndex: 10, 
//               boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.4)' 
//             }}>
//               <tr>
//                 <th className="text-center">Invoice #</th>
//                 <th>Date</th>
//                 <th>Customer</th>
//                 <th className="text-end">Invoice Amount</th>
//                 {/* <th className="text-end">Commission Rate</th> */}
//                 <th className="text-end">Commission</th>
//                 <th className="text-end">Paid</th>
//                 <th className="text-end">Remaining</th>
//                 <th className="text-center">Status</th>
//                 <th className="text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="10" className="text-center py-4">
//                     {/* <div className="spinner-border text-primary" role="status"> */}
//                       <span className="visually-hidden">Loading...</span>
//                     {/* </div> */}
//                   </td>
//                 </tr>
//               ) : commissionData.length === 0 ? (
//                 <tr>
//                   <td colSpan="10" className="text-center py-4">
//                     No commission data found
//                   </td>
//                 </tr>
//               ) : (
//                 commissionData.map((item, index) => (
//                   <tr 
//                     key={`${item.invoice_no}-${index}`}
//                     ref={index === selectedRowIndex ? selectedRowRef : null}
//                     style={{
//                       backgroundColor: index === selectedRowIndex ? '#e3f2fd' : 'transparent',
//                       cursor: 'pointer',
//                       transition: 'background-color 0.2s'
//                     }}
//                     onClick={() => setSelectedRowIndex(index)}
//                   >
//                     <td className="text-center">{item.invoice_no}</td>
//                     <td>{item.invoice_date}</td>
//                     <td>{item.customer_name || '-'}</td>
//                     <td className="text-end">Rs. {parseFloat(item.invoice_amount || 0).toFixed(2)}</td>
//                     {/* <td className="text-end">{parseFloat(item.commission_rate || 0).toFixed(2)}%</td> */}
//                     <td className="text-end fw-bold">Rs. {parseFloat(item.commission_amount || 0).toFixed(2)}</td>
//                     <td className="text-end text-success">Rs. {parseFloat(item.paid_commission || 0).toFixed(2)}</td>
//                     <td className="text-end text-danger fw-bold">Rs. {parseFloat(item.remaining_commission || 0).toFixed(2)}</td>
//                     <td className="text-center">
//                       <span className={`badge ${parseFloat(item.remaining_commission || 0) > 0 ? 'bg-warning' : 'bg-success'}`}>
//                         {parseFloat(item.remaining_commission || 0) > 0 ? 'Unpaid' : 'Paid'}
//                       </span>
//                     </td>
//                     <td className="text-center">
//                       {parseFloat(item.remaining_commission || 0) > 0 && (
//                         <button
//                           className="btn btn-sm btn-primary"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handlePayCommission(item);
//                           }}
//                           title="Pay Commission (Press P)"
//                         >
//                           <i className="fas fa-money-bill-wave me-1"></i>
//                           Pay
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Pagination */}
//       {selectedStaff && totalPages > 1 && (
//         <div className="d-flex justify-content-between align-items-center mt-3">
//           <small className="text-muted">
//             Keyboard shortcuts: ↑↓ Navigate | P Pay Commission
//           </small>
//           <ReactPaginate
//             previousLabel={"Previous"}
//             nextLabel={"Next"}
//             breakLabel={"..."}
//             pageCount={totalPages}
//             marginPagesDisplayed={2}
//             pageRangeDisplayed={3}
//             onPageChange={handlePageChange}
//             forcePage={currentPage - 1}
//             containerClassName={"pagination mb-0"}
//             pageClassName={"page-item"}
//             activeClassName={"active"}
//             pageLinkClassName={"page-link"}
//             previousClassName={"page-item"}
//             previousLinkClassName={"page-link"}
//             nextClassName={"page-item"}
//             nextLinkClassName={"page-link"}
//             breakClassName={"page-item"}
//             breakLinkClassName={"page-link"}
//           />
//         </div>
//       )}

//       {/* Payment Modal */}
//       {showPaymentModal && selectedCommission && (
//         <>
//           <div 
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 999
//             }}
//             onClick={() => setShowPaymentModal(false)}
//           />
          
//           <div style={{
//             position: "fixed",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             zIndex: 1000,
//             backgroundColor: "#fff",
//             padding: "30px",
//             border: "1px solid #ccc",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//             width: "90%",
//             maxWidth: "500px",
//             borderRadius: "8px"
//           }}>
//             <h4 className="mb-4">Pay Commission</h4>
            
//             <div className="mb-3">
//               <label className="form-label fw-bold">Invoice #</label>
//               <input 
//                 type="text" 
//                 className="form-control" 
//                 value={selectedCommission.invoice_no} 
//                 disabled 
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Total Commission</label>
//               <input 
//                 type="text" 
//                 className="form-control" 
//                 value={`Rs. ${parseFloat(selectedCommission.commission_amount || 0).toFixed(2)}`} 
//                 disabled 
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Remaining Commission</label>
//               <input 
//                 type="text" 
//                 className="form-control text-danger fw-bold" 
//                 value={`Rs. ${parseFloat(selectedCommission.remaining_commission || 0).toFixed(2)}`} 
//                 disabled 
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Payment Amount *</label>
//               <input 
//                 type="number" 
//                 className="form-control" 
//                 value={paymentAmount}
//                 onChange={(e) => setPaymentAmount(e.target.value)}
//                 max={selectedCommission.remaining_commission}
//                 step="0.01"
//                 placeholder="Enter amount"
//                 autoFocus
//               />
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Payment Method</label>
//               <select
//                 className="form-select"
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="cash">Cash</option>
//                 <option value="bank_transfer">Bank Transfer</option>
//                 <option value="cheque">Cheque</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             <div className="mb-3">
//               <label className="form-label fw-bold">Notes</label>
//               <textarea
//                 className="form-control"
//                 rows="3"
//                 value={paymentNotes}
//                 onChange={(e) => setPaymentNotes(e.target.value)}
//                 placeholder="Optional notes..."
//               />
//             </div>

//             <div className="d-flex gap-2 justify-content-end" >
//               <button 
//                 className="btn btn-secondary" style={{marginRight:"5px"}}
//                 onClick={() => {
//                   setShowPaymentModal(false);
//                   setSelectedCommission(null);
//                   setPaymentAmount("");
//                   setPaymentNotes("");
//                 }}
//               >
//                 Cancel
//               </button>
//               <button 
//                 className="btn btn-primary"
//                 onClick={submitPayment}
//               >
//                 Submit Payment
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default StaffCommissionManagement;








import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const StaffCommissionManagement = () => {
  // State variables
  const [staffList, setStaffList] = useState([]);
  const [commissionData, setCommissionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [selectedStaff, setSelectedStaff] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [editingPayment, setEditingPayment] = useState(null);
  
  // Summary states
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  
  const [tableHeight, setTableHeight] = useState(500);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const tableRef = useRef(null);
  const selectedRowRef = useRef(null);

  // Fetch staff list on component mount
  useEffect(() => {
    fetchStaffList();
  }, []);

  // Fetch commission data when filters change
  useEffect(() => {
    if (selectedStaff) {
      fetchCommissionData();
    }
  }, [currentPage, selectedStaff, fromDate, toDate]);

  // Calculate table height
  useEffect(() => {
    const calculateHeight = () => {
      const availableHeight = window.innerHeight - 400;
      setTableHeight(Math.max(availableHeight, 400));
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Fetch staff list
  const fetchStaffList = async () => {
    try {
      const response = await axios.get('http://localhost:4000/get-staff-list');
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      alert("Failed to fetch staff list");
    }
  };

  // Fetch commission data
  const fetchCommissionData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/get-staff-commission", {
        params: {
          page: currentPage,
          limit: 50,
          staff_id: selectedStaff,
          from_date: fromDate,
          to_date: toDate
        }
      });

      setCommissionData(response.data.results || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalCount(response.data.totalCount || 0);
      
      const summary = response.data.summary || {};
      setTotalCommission(summary.total_commission || 0);
      setTotalPaid(summary.total_paid || 0);
      setTotalUnpaid(summary.total_unpaid || 0);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching commission data:", error);
      setLoading(false);
      alert("Failed to fetch commission data");
    }
  };

  // Fetch payment history for an invoice
  const fetchPaymentHistory = async (invoiceNo) => {
    setLoadingHistory(true);
    try {
      const response = await axios.get("http://localhost:4000/get-commission-payment-history", {
        params: {
          invoice_no: invoiceNo,
          staff_id: selectedStaff
        }
      });
      setPaymentHistory(response.data);
      setLoadingHistory(false);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setLoadingHistory(false);
      alert("Failed to fetch payment history");
    }
  };

  // Handle pay commission
  const handlePayCommission = (commission) => {
    setSelectedCommission(commission);
    setPaymentAmount(commission.remaining_commission || commission.commission_amount);
    setShowPaymentModal(true);
  };

  // Handle view payment history
  const handleViewHistory = async (commission) => {
    setSelectedCommission(commission);
    setShowPaymentHistoryModal(true);
    await fetchPaymentHistory(commission.invoice_no);
  };

  // Handle edit payment
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentAmount(payment.payment_amount);
    setPaymentMethod(payment.payment_method);
    setPaymentNotes(payment.notes || "");
    setShowEditPaymentModal(true);
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/delete-commission-payment/${paymentId}`);
      alert("Payment deleted successfully");
      await fetchPaymentHistory(selectedCommission.invoice_no);
      fetchCommissionData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment");
    }
  };

  // Submit new payment
  const submitPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    try {
      await axios.post("http://localhost:4000/add-commission-payment", {
        invoice_no: selectedCommission.invoice_no,
        staff_id: selectedStaff,
        payment_amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        notes: paymentNotes
      });

      alert("Payment added successfully");
      setShowPaymentModal(false);
      setSelectedCommission(null);
      setPaymentAmount("");
      setPaymentNotes("");
      fetchCommissionData();
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment");
    }
  };

  // Submit edit payment
  const submitEditPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    try {
      await axios.put(`http://localhost:4000/update-commission-payment/${editingPayment.id}`, {
        payment_amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        notes: paymentNotes
      });

      alert("Payment updated successfully");
      setShowEditPaymentModal(false);
      setEditingPayment(null);
      setPaymentAmount("");
      setPaymentNotes("");
      await fetchPaymentHistory(selectedCommission.invoice_no);
      fetchCommissionData();
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment");
    }
  };

  // Handle page change
  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  // Keyboard navigation
  const handleTableKeyDown = (event) => {
    if (loading || commissionData.length === 0) return;

    const maxIndex = commissionData.length - 1;

    switch(event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedRowIndex(prev => Math.max(0, prev - 1));
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedRowIndex(prev => Math.min(maxIndex, prev + 1));
        break;
      case "p":
      case "P":
        event.preventDefault();
        if (commissionData[selectedRowIndex] && parseFloat(commissionData[selectedRowIndex].remaining_commission || 0) > 0) {
          handlePayCommission(commissionData[selectedRowIndex]);
        }
        break;
      case "h":
      case "H":
        event.preventDefault();
        if (commissionData[selectedRowIndex]) {
          handleViewHistory(commissionData[selectedRowIndex]);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedRowIndex]);

  useEffect(() => {
    const tableContainer = tableRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('keydown', handleTableKeyDown);
      tableContainer.focus();
    }

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('keydown', handleTableKeyDown);
      }
    };
  }, [selectedRowIndex, commissionData, loading]);

  return (
    <div className="container-fluid p-3">
      {/* <h2 className="mb-4">Staff Commission Management</h2> */}
    
      {/* Filters Section */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-bold">Select Staff *</label>
              <select
                className="form-control"
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  setCurrentPage(1);
                }}
                required
              >
                <option value="">-- Select Staff --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.cnic})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">From Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-bold">To Date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {selectedStaff && (
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h6 className="card-title">Total Commission</h6>
                <h3 className="mb-0">Rs. {totalCommission.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h6 className="card-title">Total Paid</h6>
                <h3 className="mb-0">Rs. {totalPaid.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <h6 className="card-title">Total Unpaid</h6>
                <h3 className="mb-0">Rs. {totalUnpaid.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Table */}
      {selectedStaff && (
        <div 
          ref={tableRef}
          className="table-responsive" 
          style={{
            height: `${tableHeight}px`, 
            overflowY: 'auto',
            outline: 'none',
            border: '1px solid #dee2e6'
          }}
          tabIndex={0}
        >
          <table className="table table-striped table-hover mb-0">
            <thead style={{ 
              position: 'sticky', 
              top: 0, 
              backgroundColor: '#fff', 
              zIndex: 10, 
              boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.4)' 
            }}>
              <tr>
                <th className="text-center">Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="text-end">Invoice Amount</th>
                <th className="text-end">Commission</th>
                <th className="text-end">Paid</th>
                <th className="text-end">Remaining</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <span>Loading...</span>
                  </td>
                </tr>
              ) : commissionData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No commission data found
                  </td>
                </tr>
              ) : (
                commissionData.map((item, index) => (
                  <tr 
                    key={`${item.invoice_no}-${index}`}
                    ref={index === selectedRowIndex ? selectedRowRef : null}
                    style={{
                      backgroundColor: index === selectedRowIndex ? '#e3f2fd' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => setSelectedRowIndex(index)}
                  >
                    <td className="text-center">{item.invoice_no}</td>
                    <td>{item.invoice_date}</td>
                    <td>{item.customer_name || '-'}</td>
                    <td className="text-end">Rs. {parseFloat(item.invoice_amount || 0).toFixed(2)}</td>
                    <td className="text-end fw-bold">Rs. {parseFloat(item.commission_amount || 0).toFixed(2)}</td>
                    <td className="text-end text-success">Rs. {parseFloat(item.paid_commission || 0).toFixed(2)}</td>
                    <td className="text-end text-danger fw-bold">Rs. {parseFloat(item.remaining_commission || 0).toFixed(2)}</td>
                    <td className="text-center">
                      <span className={`badge ${parseFloat(item.remaining_commission || 0) > 0 ? 'bg-warning' : 'bg-success'}`}>
                        {parseFloat(item.remaining_commission || 0) > 0 ? 'Unpaid' : 'Paid'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        {parseFloat(item.remaining_commission || 0) > 0 && (
                          <button
                            className="btn btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayCommission(item);
                            }}
                            title="Pay Commission (Press P)"
                          >
                            Pay
                          </button>
                        )}
                        {parseFloat(item.paid_commission || 0) > 0 && (
                          <button
                            className="btn btn-info"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewHistory(item);
                            }}
                            title="View Payment History (Press H)"
                          >
                            History
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {selectedStaff && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Keyboard shortcuts: ↑↓ Navigate | P Pay | H History
          </small>
          <div className="btn-group">
            <button 
              className="btn btn-outline-secondary"
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button className="btn btn-outline-secondary" disabled>
              Page {currentPage} of {totalPages}
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && selectedCommission && (
        <>
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999
            }}
            onClick={() => setShowPaymentModal(false)}
          />
          
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            backgroundColor: "#fff",
            padding: "30px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            width: "90%",
            maxWidth: "500px",
            borderRadius: "8px"
          }}>
            <h4 className="mb-4">Pay Commission</h4>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Invoice #</label>
              <input 
                type="text" 
                className="form-control" 
                value={selectedCommission.invoice_no} 
                disabled 
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Total Commission</label>
              <input 
                type="text" 
                className="form-control" 
                value={`Rs. ${parseFloat(selectedCommission.commission_amount || 0).toFixed(2)}`} 
                disabled 
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Remaining Commission</label>
              <input 
                type="text" 
                className="form-control text-danger fw-bold" 
                value={`Rs. ${parseFloat(selectedCommission.remaining_commission || 0).toFixed(2)}`} 
                disabled 
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Payment Amount *</label>
              <input 
                type="number" 
                className="form-control" 
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedCommission.remaining_commission}
                step="0.01"
                placeholder="Enter amount"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Payment Method</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedCommission(null);
                  setPaymentAmount("");
                  setPaymentNotes("");
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={submitPayment}
              >
                Submit Payment
              </button>
            </div>
          </div>
        </>
      )}

      {/* Payment History Modal */}
      {showPaymentHistoryModal && selectedCommission && (
        <>
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999
            }}
            onClick={() => setShowPaymentHistoryModal(false)}
          />
          
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            backgroundColor: "#fff",
            padding: "30px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            width: "90%",
            maxWidth: "700px",
            borderRadius: "8px",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <h4 className="mb-4">Payment History - Invoice #{selectedCommission.invoice_no}</h4>
            
            <div className="mb-3">
              <strong>Total Commission:</strong> Rs. {parseFloat(selectedCommission.commission_amount || 0).toFixed(2)}
              <br />
              <strong>Total Paid:</strong> <span className="text-success">Rs. {parseFloat(selectedCommission.paid_commission || 0).toFixed(2)}</span>
              <br />
              <strong>Remaining:</strong> <span className="text-danger">Rs. {parseFloat(selectedCommission.remaining_commission || 0).toFixed(2)}</span>
            </div>

            <hr />

            {loadingHistory ? (
              <div className="text-center py-4">Loading payment history...</div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-4">No payments found for this invoice</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th className="text-end">Amount</th>
                      <th>Method</th>
                      <th>Notes</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="text-end fw-bold">Rs. {parseFloat(payment.payment_amount).toFixed(2)}</td>
                        <td>{payment.payment_method}</td>
                        <td>{payment.notes || '-'}</td>
                        <td className="text-center">
                          {(payment.salary_id === 0 || payment.salary_id === null) ? (
  <div className="btn-group btn-group-sm">
    <button
      className="btn btn-warning"
      onClick={() => {
        setShowPaymentHistoryModal(false);
        handleEditPayment(payment);
      }}
      title="Edit Payment"
    >
      Edit
    </button>
    <button
      className="btn btn-danger"
      onClick={() => handleDeletePayment(payment.id)}
      title="Delete Payment"
    >
      Delete
    </button>
  </div>
) : (
  <span className="text-muted">Paid from Salary</span>
)}
                         
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPaymentHistoryModal(false);
                  setSelectedCommission(null);
                  setPaymentHistory([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentModal && editingPayment && (
        <>
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1001
            }}
            onClick={() => setShowEditPaymentModal(false)}
          />
          
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1002,
            backgroundColor: "#fff",
            padding: "30px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            width: "90%",
            maxWidth: "500px",
            borderRadius: "8px"
          }}>
            <h4 className="mb-4">Edit Payment</h4>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Payment Amount *</label>
              <input 
                type="number" 
                className="form-control" 
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                step="0.01"
                placeholder="Enter amount"
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Payment Method</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditPaymentModal(false);
                  setEditingPayment(null);
                  setPaymentAmount("");
                  setPaymentNotes("");
                  setShowPaymentHistoryModal(true);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={submitEditPayment}
              >
                Update Payment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffCommissionManagement;