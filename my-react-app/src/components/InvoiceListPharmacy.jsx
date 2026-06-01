// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";

// const InvoiceList = ({ ViewInvoice, editInvoice }) => {
//   const [invoiceListGet, setInvoiceList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [searchInvoice, setSearchInvoice] = useState("");
//   const [selectedInvoiceType, setSelectedInvoiceType] = useState("sale"); // Default to 'all'
//   const [invoiceStatus, setInvoiceStatus] = useState("");

//   const [alertDate, setAlertDate] = useState("");

//   const searchRef = useRef(""); // Use ref to store the search term without triggering rerenders

//   const fetchInvoiceData = (shouldLoad = true) => {
//     // setLoading(true);
//     if (shouldLoad) setLoading(true);
//     axios
//       .get("http://localhost:4000/get-invoice-list-for-pharmacy", {
//         params: {
//           page: currentPage,
//           limit: 100,
//           search: searchRef.current,
//           type: selectedInvoiceType === "all" ? "" : selectedInvoiceType, // Send type only if not 'all'
//           invoice_status : invoiceStatus,
//           alert_date: alertDate
//         },
//       })
//       .then((response) => {
//         setInvoiceList(response.data.results);
//         setTotalCount(response.data.totalCount);
//         setTotalPages(response.data.totalPages);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching invoice data", error);
//         setLoading(false);
//       });
//   };

//   const handleSearchChange = (event) => {
//     setSearchInvoice(event.target.value);
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       searchRef.current = searchInvoice;
//       fetchInvoiceData(false);
//     }
//   };

//   const handleInvoiceTypeChange = (event) => {
//     setSelectedInvoiceType(event.target.value);
//     setCurrentPage(1);
//   };

//   const changeInvoiceStatus = (event) => {
//     setInvoiceStatus(event.target.value);
//     setCurrentPage(1);
//   };

//   const changeAlertDate = (event) => {
//     setAlertDate(event.target.value);
//     // setCurrentPage(1);
//   };

//   const handlePageChange = ({ selected }) => {
//     setCurrentPage(selected + 1);
//   };

//   // Fetch data when currentPage or selectedInvoiceType changes
//   useEffect(() => {
//     fetchInvoiceData(false);
//   }, [currentPage, selectedInvoiceType, invoiceStatus, alertDate]);

//   return (
//     <div>
//       <div className="d-flex justify-content-between mb-3">
//         <div className="d-flex align-items-center gap-3 ">
//           <input
//             type="text"
//             placeholder="Search Invoice"
//             className="form-control mb-2 col-md-6"
//             id="search-invoice"
//             value={searchInvoice}
//             onChange={handleSearchChange}
//             onKeyDown={handleKeyDown}
//           />
//           <select
//             className="form-control mb-2 col-md-6 ml-2"
//             value={selectedInvoiceType}
//             onChange={handleInvoiceTypeChange}
//           >
//             <option value="sale">Sale Invoice</option>
//             <option value="quotation">Quotation</option>
//             <option value="hold">Hold</option>
//           </select>
//         </div>
//         <div className="col-md-4 d-flex justify-content-end mr-2">
//           <div className="col-md-6">
//             Status
//             <select
//               id="invoice_status"
//               name="invoice_status"
//               value={invoiceStatus}
//               onChange={changeInvoiceStatus}
//               className="form-control col-md-12"
//             >
//               <option value="">Select Status</option>
//               <option value="paid">Paid</option>
//               <option value="unpaid">Unpaid</option>
//             </select>
//           </div>
//           <div className="col-md-6">
//             Alert.Date
//             <input
//               type="date"
//               id="alert_date"
//               name="alert_date"
//               value={alertDate}
//               onChange={changeAlertDate}
//               className="form-control"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="table-responsive">
//         <table className="table table-striped">
//           <thead>
//             <tr>
//               <th className="text-center">Invoice No</th>
//               <th>Name#</th>
//               <th>Phone#</th>
//               <th className="text-center">Total Amount</th>
//               <th className="text-center">Status</th>
//               <th className="text-center">Remaining</th>
//               <th className="text-center">Alert</th>
//               <th className="text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="5" className="text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : (
//               invoiceListGet.map((invoice) => (
//                 <tr key={invoice.invoice_no}>
//                   <td className="text-center">{invoice.invoice_no}</td>
//                   <td>{invoice.full_name == "" ? "-" : invoice.full_name}</td>
//                   <td>{invoice.phone_no}</td>
//                   <td className="text-center">{invoice.total_amount}</td>
//                   <td className="text-center" style={{
//   textTransform: "uppercase",
//   color: invoice.invoice_status === 'paid' ? '#10b981' : '#ef4444'
// }}>
//   {invoice.invoice_status}
// </td>
//                   <td className="text-center">{invoice.remaining_amount}</td>
//                   <td className="text-center">{invoice.alert_date}</td>
//                   <td className="text-center">
//                     <button
//                       className="btn btn-sm btn-warning mr-2"
//                       onClick={() => ViewInvoice(invoice.invoice_no)}
//                     >
//                       <i className="fas fa-eye"></i> View
//                     </button>
//                     <button
//                       className="btn btn-sm btn-success mr-2"
//                       onClick={() => editInvoice(invoice.invoice_no)}
//                     >
//                       <i className="fas fa-edit"></i> Edit
//                     </button>
//                     {/* <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() => deleteInvoice(invoice.invoice_no)}
//                     >
//                       <i className="fas fa-trash-alt"></i> Delete
//                     </button> */}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="d-flex justify-content-end">
//         <ReactPaginate
//           previousLabel={"Previous"}
//           nextLabel={"Next"}
//           breakLabel={"..."}
//           pageCount={totalPages}
//           marginPagesDisplayed={2}
//           pageRangeDisplayed={3}
//           onPageChange={handlePageChange}
//           containerClassName={"pagination"}
//           pageClassName={"page-item"}
//           activeClassName={"active"}
//           pageLinkClassName={"page-link"}
//           previousClassName={"page-item"}
//           previousLinkClassName={"page-link"}
//           nextClassName={"page-item"}
//           nextLinkClassName={"page-link"}
//           breakClassName={"page-item"}
//           breakLinkClassName={"page-link"}
//         />
//       </div>
//     </div>
//   );
// };

// export default InvoiceList;

























// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";

// const InvoiceList = ({ ViewInvoice, editInvoice }) => {
//   const [invoiceListGet, setInvoiceList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const [searchInvoice, setSearchInvoice] = useState("");
//   const [selectedInvoiceType, setSelectedInvoiceType] = useState("sale");
//   const [invoiceStatus, setInvoiceStatus] = useState("");
//   const [alertDate, setAlertDate] = useState("");
//   const [invoiceDate, setInvoiceDate] = useState("");
//   const [invoiceToDate, setInvoiceToDate] = useState("");
//   const [tableHeight, setTableHeight] = useState(600);
//   const [selectedRowIndex, setSelectedRowIndex] = useState(0);

//   const searchRef = useRef("");
//   const tableRef = useRef(null);
//   const selectedRowRef = useRef(null);

//   const fetchInvoiceData = (shouldLoad = true) => {
//     if (shouldLoad) setLoading(true);
//     axios
//       .get("http://localhost:4000/get-invoice-list-for-pharmacy", {
//         params: {
//           page: currentPage,
//           limit: 100,
//           search: searchRef.current,
//           type: selectedInvoiceType === "all" ? "" : selectedInvoiceType,
//           invoice_status : invoiceStatus,
//           alert_date: alertDate,
//           invoice_date: invoiceDate,
//           invoice_to_date: invoiceToDate
//         },
//       })
//       .then((response) => {
//         setInvoiceList(response.data.results);
//         setTotalCount(response.data.totalCount);
//         setTotalPages(response.data.totalPages);
//         setLoading(false);
//         setSelectedRowIndex(0); // Reset selection when data changes
//       })
//       .catch((error) => {
//         console.error("Error fetching invoice data", error);
//         setLoading(false);
//       });
//   };

//   const handleSearchChange = (event) => {
//     setSearchInvoice(event.target.value);
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       searchRef.current = searchInvoice;
//       fetchInvoiceData(false);
//     }
//   };

//   const handleInvoiceTypeChange = (event) => {
//     setSelectedInvoiceType(event.target.value);
//     setCurrentPage(1);
//   };

//   const changeInvoiceStatus = (event) => {
//     setInvoiceStatus(event.target.value);
//     setCurrentPage(1);
//   };

//   const changeAlertDate = (event) => {
//     setAlertDate(event.target.value);
//   };

//   const changeInvoiceDate = (event) => {
//     setInvoiceDate(event.target.value);
//   };

//   const changeInvoiceToDate = (event) => {
//     setInvoiceToDate(event.target.value);
//   };

//   const handlePageChange = ({ selected }) => {
//     setCurrentPage(selected + 1);
//   };

//   // Keyboard navigation handler
//   const handleTableKeyDown = (event) => {
//     if (loading || invoiceListGet.length === 0) return;

//     const maxIndex = invoiceListGet.length - 1;

//     switch(event.key) {
//       case "ArrowUp":
//         event.preventDefault();
//         setSelectedRowIndex(prev => Math.max(0, prev - 1));
//         break;
//       case "ArrowDown":
//         event.preventDefault();
//         setSelectedRowIndex(prev => Math.min(maxIndex, prev + 1));
//         break;
//       case "v":
//       case "V":
//         event.preventDefault();
//         if (invoiceListGet[selectedRowIndex]) {
//           ViewInvoice(invoiceListGet[selectedRowIndex].invoice_no);
//         }
//         break;
//       case "e":
//       case "E":
//         event.preventDefault();
//         if (invoiceListGet[selectedRowIndex]) {
//           editInvoice(invoiceListGet[selectedRowIndex].invoice_no);
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   // Scroll selected row into view
//   useEffect(() => {
//     if (selectedRowRef.current) {
//       selectedRowRef.current.scrollIntoView({
//         behavior: 'smooth',
//         block: 'nearest'
//       });
//     }
//   }, [selectedRowIndex]);

//   // Add keyboard event listener
//   useEffect(() => {
//     const tableContainer = tableRef.current;
//     if (tableContainer) {
//       tableContainer.addEventListener('keydown', handleTableKeyDown);
//       // Focus the table on mount
//       tableContainer.focus();
//     }

//     return () => {
//       if (tableContainer) {
//         tableContainer.removeEventListener('keydown', handleTableKeyDown);
//       }
//     };
//   }, [selectedRowIndex, invoiceListGet, loading]);

//   useEffect(() => {
//     fetchInvoiceData(false);
//   }, [currentPage, selectedInvoiceType, invoiceStatus, alertDate, invoiceDate, invoiceToDate]);

//   useEffect(() => {
//     const calculateHeight = () => {
//       const availableHeight = window.innerHeight - 260;
//       setTableHeight(Math.max(availableHeight, 400));
//     };

//     calculateHeight();
//     window.addEventListener('resize', calculateHeight);
    
//     return () => window.removeEventListener('resize', calculateHeight);
//   }, []);

//   return (
//     <div>
//       <div className="d-flex justify-content-between mb-3">
//         <div className="d-flex align-items-center gap-3 ">
//            <div className="col-md-3">
//             Search
//           <input
//             type="text"
//             placeholder="Search Invoice"
//             className="form-control mb-2"
//             id="search-invoice"
//             value={searchInvoice}
//             onChange={handleSearchChange}
//             onKeyDown={handleKeyDown}
//           />
//           </div>
//            <div className="col-md-3">
//             Invoice Type
//           <select
//             className="form-control mb-2"
//             value={selectedInvoiceType}
//             onChange={handleInvoiceTypeChange}
//           >
//             <option value="sale">Sale Invoice</option>
//             <option value="quotation">Quotation</option>
//             <option value="hold">Hold</option>
//             <option value="appointment">Appointment</option>
//           </select>
//           </div>
          
//           <div className="col-md-3">
//             From
//           <input
//             type="date"
//             id="invoice_date"
//             name="invoice_date"
//             value={invoiceDate}
//             onChange={changeInvoiceDate}
//             className="form-control mb-2 "
//           />
// </div>
// <div className="col-md-3">
//   To
//            <input
//             type="date"
//             id="invoice_date"
//             name="invoice_date"
//             value={invoiceToDate}
//             onChange={changeInvoiceToDate}
//             className="form-control mb-2"
//           />
//           </div>
//         </div>

//         <div className="col-md-4 d-flex justify-content-end mr-2">
//           <div className="col-md-6">
//             Status
//             <select
//               id="invoice_status"
//               name="invoice_status"
//               value={invoiceStatus}
//               onChange={changeInvoiceStatus}
//               className="form-control col-md-12"
//             >
//               <option value="">Select Status</option>
//               <option value="paid">Paid</option>
//               <option value="unpaid">Unpaid</option>
//             </select>
//           </div>
//           <div className="col-md-6">
//             Alert.Date
//             <input
//               type="date"
//               id="alert_date"
//               name="alert_date"
//               value={alertDate}
//               onChange={changeAlertDate}
//               className="form-control"
//             />
//           </div>
//         </div>
//       </div>

//       <div 
//         ref={tableRef}
//         className="table-responsive" 
//         style={{
//           height: `${tableHeight}px`, 
//           overflowY: 'auto',
//           outline: 'none'
//         }}
//         tabIndex={0}
//       >
//         <table className="table table-striped">
//           <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10, boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.4)' }}>
//             <tr>
//               <th className="text-center">Invoice No</th>
//               <th>Name#</th>
//               <th>Phone#</th>
//               <th className="text-center">Total Amount</th>
//               <th className="text-center">Status</th>
//               <th className="text-center">Remaining</th>
//               <th className="text-center">Alert</th>
//               <th className="text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="8" className="text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : (
//               invoiceListGet.map((invoice, index) => (
//                 <tr 
//                   key={invoice.invoice_no}
//                   ref={index === selectedRowIndex ? selectedRowRef : null}
//                   style={{
//                     backgroundColor: index === selectedRowIndex ? '#e3f2fd' : 'transparent',
//                     cursor: 'pointer',
//                     transition: 'background-color 0.2s'
//                   }}
//                   onClick={() => setSelectedRowIndex(index)}
//                 >
//                   <td className="text-center">{invoice.invoice_no}</td>
//                   <td>{invoice.full_name == "" ? "-" : invoice.full_name}</td>
//                   <td>{invoice.phone_no}</td>
//                   <td className="text-center">{invoice.total_amount}</td>
//                   <td className="text-center" style={{
//                     textTransform: "uppercase",
//                     color: invoice.invoice_status === 'paid' ? '#10b981' : '#ef4444'
//                   }}>
//                     {invoice.invoice_status}
//                   </td>
//                   <td className="text-center">{invoice.remaining_amount}</td>
//                   <td className="text-center">{invoice.alert_date}</td>
//                   <td className="text-center">
//                     <button
//                       className="btn btn-sm btn-warning mr-2"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         ViewInvoice(invoice.invoice_no);
//                       }}
//                     >
//                       <i className="fas fa-eye"></i> View
//                     </button>
//                     <button
//                       className="btn btn-sm btn-success mr-2"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         editInvoice(invoice.invoice_no);
//                       }}
//                     >
//                       <i className="fas fa-edit"></i> Edit
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="d-flex justify-content-between align-items-center">
//         <small className="text-muted">
//           Keyboard shortcuts: ↑↓ Navigate | V View | E Edit
//         </small>
//         <ReactPaginate
//           previousLabel={"Previous"}
//           nextLabel={"Next"}
//           breakLabel={"..."}
//           pageCount={totalPages}
//           marginPagesDisplayed={2}
//           pageRangeDisplayed={3}
//           onPageChange={handlePageChange}
//           containerClassName={"pagination"}
//           pageClassName={"page-item"}
//           activeClassName={"active"}
//           pageLinkClassName={"page-link"}
//           previousClassName={"page-item"}
//           previousLinkClassName={"page-link"}
//           nextClassName={"page-item"}
//           nextLinkClassName={"page-link"}
//           breakClassName={"page-item"}
//           breakLinkClassName={"page-link"}
//         />
//       </div>
//     </div>
//   );
// };

// export default InvoiceList;




import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import PaymentManagement from "./PaymentManagement";

const InvoiceList = ({ ViewInvoice, editInvoice }) => {
  const [invoiceListGet, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [selectedInvoiceType, setSelectedInvoiceType] = useState("sale");
  const [invoiceStatus, setInvoiceStatus] = useState("");
  const [alertDate, setAlertDate] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceToDate, setInvoiceToDate] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [tableHeight, setTableHeight] = useState(600);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  
  // Payment management modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  const searchRef = useRef("");
  const tableRef = useRef(null);
  const selectedRowRef = useRef(null);

  const fetchInvoiceData = (shouldLoad = true) => {
    if (shouldLoad) setLoading(true);
    axios
      .get("http://localhost:4000/get-invoice-list-for-pharmacy", {
        params: {
          page: currentPage,
          limit: 100,
          search: searchRef.current,
          type: selectedInvoiceType === "all" ? "" : selectedInvoiceType,
          invoice_status: invoiceStatus,
          alert_date: alertDate,
          invoice_date: invoiceDate,
          invoice_to_date: invoiceToDate,
          appointment_date: appointmentDate
        },
      })
      .then((response) => {
        setInvoiceList(response.data.results);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setLoading(false);
        setSelectedRowIndex(0);
      })
      .catch((error) => {
        console.error("Error fetching invoice data", error);
        setLoading(false);
      });
  };

  const handleSearchChange = (event) => {
    setSearchInvoice(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchRef.current = searchInvoice;
      fetchInvoiceData(false);
    }
  };

  const handleInvoiceTypeChange = (event) => {
    setSelectedInvoiceType(event.target.value);
    setCurrentPage(1);
  };

  const changeInvoiceStatus = (event) => {
    setInvoiceStatus(event.target.value);
    setCurrentPage(1);
  };

  const changeAlertDate = (event) => {
    setAlertDate(event.target.value);
  };

  const changeInvoiceDate = (event) => {
    setInvoiceDate(event.target.value);
  };

  const changeInvoiceToDate = (event) => {
    setInvoiceToDate(event.target.value);
  };

   const changeInvoiceAppointmentDate = (event) => {
    setAppointmentDate(event.target.value);
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleManagePayment = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentAdded = () => {
    fetchInvoiceData(false);
  };

  // Keyboard navigation handler
  const handleTableKeyDown = (event) => {
    if (loading || invoiceListGet.length === 0) return;

    const maxIndex = invoiceListGet.length - 1;

    switch(event.key) {
      case "ArrowUp":
        event.preventDefault();
        setSelectedRowIndex(prev => Math.max(0, prev - 1));
        break;
      case "ArrowDown":
        event.preventDefault();
        setSelectedRowIndex(prev => Math.min(maxIndex, prev + 1));
        break;
      case "v":
      case "V":
        event.preventDefault();
        if (invoiceListGet[selectedRowIndex]) {
          ViewInvoice(invoiceListGet[selectedRowIndex].invoice_no);
        }
        break;
      case "e":
      case "E":
        event.preventDefault();
        if (invoiceListGet[selectedRowIndex]) {
          editInvoice(invoiceListGet[selectedRowIndex].invoice_no);
        }
        break;
      case "p":
      case "P":
        event.preventDefault();
        if (invoiceListGet[selectedRowIndex]) {
          handleManagePayment(invoiceListGet[selectedRowIndex]);
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
  }, [selectedRowIndex, invoiceListGet, loading]);

  useEffect(() => {
    fetchInvoiceData(false);
  }, [currentPage, selectedInvoiceType, invoiceStatus, alertDate, invoiceDate, invoiceToDate, appointmentDate]);

  useEffect(() => {
    const calculateHeight = () => {
      const availableHeight = window.innerHeight - 260;
      setTableHeight(Math.max(availableHeight, 400));
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="col-md-3">
            Search
            <input
              type="text"
              placeholder="Search Invoice"
              className="form-control mb-2"
              id="search-invoice"
              value={searchInvoice}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="col-md-4">
            Invoice Type
            <select
              className="form-control mb-2"
              value={selectedInvoiceType}
              onChange={handleInvoiceTypeChange}
            >
              <option value="sale">Sale Invoice</option>
              <option value="quotation">Quotation</option>
              <option value="hold">Hold</option>
              <option value="appointment">Appointment</option>
              <option value="stock out">Stock Out</option>
            </select>
          </div>
          
          {/* <div className="col-md-3">
            From
            <input
              type="date"
              id="invoice_date"
              name="invoice_date"
              value={invoiceDate}
              onChange={changeInvoiceDate}
              className="form-control mb-2"
            />
          </div>
          <div className="col-md-3">
            To
            <input
              type="date"
              id="invoice_date"
              name="invoice_date"
              value={invoiceToDate}
              onChange={changeInvoiceToDate}
              className="form-control mb-2"
            />
          </div>

          <div className="col-md-3">
            Appointment.Date
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              value={appointmentDate}
              onChange={changeInvoiceAppointmentDate}
              className="form-control mb-2"
            />
          </div> */}

          {selectedInvoiceType !== 'appointment' ? (
  <>
    <div className="col-md-3">
      From
      <input
        type="date"
        id="invoice_date"
        name="invoice_date"
        value={invoiceDate}
        onChange={changeInvoiceDate}
        className="form-control mb-2"
      />
    </div>
    <div className="col-md-3">
      To
      <input
        type="date"
        id="invoice_date"
        name="invoice_date"
        value={invoiceToDate}
        onChange={changeInvoiceToDate}
        className="form-control mb-2"
      />
    </div>
  </>
) : (
  <div className="col-md-4">
    Appoint.Date
    <input
      type="date"
      id="appointment_date"
      name="appointment_date"
      value={appointmentDate}
      onChange={changeInvoiceAppointmentDate}
      className="form-control mb-2"
    />
  </div>
)}
        </div>

        <div className="col-md-4 d-flex justify-content-end mr-2">
          <div className="col-md-6">
            Status
            <select
              id="invoice_status"
              name="invoice_status"
              value={invoiceStatus}
              onChange={changeInvoiceStatus}
              className="form-control col-md-12"
            >
              <option value="">Select Status</option>
              {/* <option value="paid">Paid</option> */}
              <option value="unpaid">Remaining</option>
            </select>
          </div>
          <div className="col-md-6">
            Alert.Date
            <input
              type="date"
              id="alert_date"
              name="alert_date"
              value={alertDate}
              onChange={changeAlertDate}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div 
        ref={tableRef}
        className="table-responsive" 
        style={{
          height: `${tableHeight}px`, 
          overflowY: 'auto',
          outline: 'none'
        }}
        tabIndex={0}
      >
        <table className="table table-striped">
          <thead style={{ 
            position: 'sticky', 
            top: 0, 
            backgroundColor: '#fff', 
            zIndex: 10, 
            boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.4)' 
          }}>
            <tr>
              <th className="text-center">Invoice No</th>
              <th>Name#</th>
              <th>Phone#</th>
              <th className="text-center">Total Amount</th>
              {/* <th className="text-center">Status</th> */}
              <th className="text-center">Remaining</th>
              <th className="text-center">Alert</th>
              <th className="text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              invoiceListGet.map((invoice, index) => (
                <tr 
                  key={invoice.invoice_no}
                  ref={index === selectedRowIndex ? selectedRowRef : null}
                  style={{
                    backgroundColor: index === selectedRowIndex ? '#e3f2fd' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => setSelectedRowIndex(index)}
                >
                  <td className="text-center">{invoice.invoice_no}</td>
                  <td>{invoice.full_name == "" ? "-" : invoice.full_name}</td>
                  <td>{invoice.phone_no}</td>
                  <td className="text-center">{invoice.total_amount}</td>
                  {/* <td className="text-center" style={{
                    textTransform: "uppercase",
                    color: invoice.invoice_status === 'paid' ? '#10b981' : '#ef4444'
                  }}>
                    {invoice.invoice_status}
                  </td> */}
                  <td className="text-center" style={{
                    fontWeight: parseFloat(invoice.remaining_amount) > 0 ? 'bold' : 'normal',
                    color: parseFloat(invoice.remaining_amount) > 0 ? '#ef4444' : '#10b981'
                  }}>
                    {invoice.actual_remaining_amount}
                  </td>
                  <td className="text-center">{invoice.alert_date}</td>
                  <td className="text-start">
                    <button
                      className="btn btn-sm btn-warning mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        ViewInvoice(invoice.invoice_no);
                      }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button
                      className="btn btn-sm btn-success mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        editInvoice(invoice.invoice_no);
                      }}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    {/* {parseFloat(invoice.actual_remaining_amount) > 0 && ( */}
                      <button
                        className="btn btn-sm btn-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManagePayment(invoice);
                        }}
                        title="Manage Payments (Press P)"
                      >
                        <i className="fas fa-money-bill-wave"></i> Pay Remaining Advance
                      </button>
                    {/* )} */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          Keyboard shortcuts: ↑↓ Navigate | V View | E Edit | P Payment
        </small>
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
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

      {/* Payment Management Modal */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          backgroundColor: "#fff",
          padding: "20px",
          border: "1px solid #ccc",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          width: "90%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "8px"
        }}>
          <PaymentManagement
            invoiceNo={selectedInvoiceForPayment.invoice_no}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedInvoiceForPayment(null);
            }}
            onPaymentAdded={handlePaymentAdded}
          />
        </div>
      )}

      {showPaymentModal && (
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
          onClick={() => {
            setShowPaymentModal(false);
            setSelectedInvoiceForPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default InvoiceList;