// import React, { useState } from 'react';
// import axios from 'axios';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import Select from "react-select";

// const StockItemWiseDetailReport = ({ items, getAllSupplier }) => {
//   const [incomeReport, setIncomeReport] = useState([]);
//   const [filteredReport, setFilteredReport] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     from_date: null,
//     to_date: null,
//     supplier_id: null,
//     item: null,
//     item_name: "",
//     full_name: ""
//   });

//   const fetchInvoiceData = async (from_date, to_date, supplier_id, item_id, shouldLoad = true) => {
//     if (shouldLoad) setIsLoading(true);
    
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/stock_item_wise_detail_report_list`, {
//         params: {
//           from_date: from_date ? format(from_date, 'yyyy-MM-dd') : null,
//           to_date: to_date ? format(to_date, 'yyyy-MM-dd') : null,
//           supplier_id: supplier_id || null,
//           item_id: item_id || null
//         },
//       });
      
//       const data = response.data.results;
//       setIncomeReport(data);
//       setFilteredReport(data);
//     } catch (error) {
//       console.error('Error fetching invoice data', error);
//     } finally {
//       if (shouldLoad) setIsLoading(false);
//     }
//   };

//   const handleDateChangeForReport = (field, date) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: date
//     }));
//   };

//   const handleGenerateReport = () => {
//     if (formData.item) {
//       fetchInvoiceData(
//         formData.from_date, 
//         formData.to_date,
//         formData.supplier_id,
//         formData.item,
//         false,
//       );
//     }
//   };

//   const handleResetDates = () => {
//     setFormData({
//       from_date: null,
//       to_date: null,
//       supplier_id: null,
//       item: null,
//       item_name: "",
//       full_name: ""
//     });
//     setIncomeReport([]);
//     setFilteredReport([]);
//     setSearchTerm("");
//   };

//   const calculateGrandTotal = () => {
//     return filteredReport.reduce((acc, item) => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.price_after_discount) || 0;
//       const purchasePrice = parseFloat(item.purchase_rate_calculate_per_tablet) * quantity || 0;
//       const purchase = parseFloat(item.purchase_rate_calculate_per_tablet) || 0;
//       const discount = parseFloat(item.discount) || 0;
//       const total = (price * quantity) - discount;
//       const profit = total - purchasePrice;

//       return {
//         grandTotalQty: acc.grandTotalQty + quantity,
//         grandTotalSalePrice: acc.grandTotalSalePrice + (price * quantity),
//         grandTotalPurchasePrice: acc.grandTotalPurchasePrice + purchasePrice,
//         grandTotalPurchase: acc.grandTotalPurchase + purchase,
//         grandTotalDiscount: acc.grandTotalDiscount + discount,
//         grandTotalTotal: acc.grandTotalTotal + total,
//         grandTotalProfit: acc.grandTotalProfit + profit
//       };
//     }, {
//       grandTotalQty: 0,
//       grandTotalSalePrice: 0,
//       grandTotalPurchasePrice: 0,
//       grandTotalPurchase: 0,
//       grandTotalDiscount: 0,
//       grandTotalTotal: 0,
//       grandTotalProfit: 0
//     });
//   };

//   const { 
//     grandTotalQty, 
//     grandTotalSalePrice, 
//     grandTotalPurchasePrice, 
//     grandTotalPurchase,
//     grandTotalDiscount, 
//     grandTotalTotal, 
//     grandTotalProfit 
//   } = calculateGrandTotal();

//   const handleSearchChange = (event) => {
//     const term = event.target.value.toLowerCase();
//     setSearchTerm(term);

//     const filteredData = incomeReport.filter(item => {
//       return (
//         item.invoice_no?.toString().includes(term) ||
//         item.item_name?.toLowerCase().includes(term) ||
//         item.stock_date?.toString().includes(term)
//       );
//     });

//     setFilteredReport(filteredData);
//   };

//   return (
//     <div className="w-100 mt-4">
//       <div className="d-flex justify-content-center">
//         <div className="col-md-3">
//           <div className="form-group report_date">
//             <DatePicker
//               id="fromDate"
//               selected={formData.from_date}
//               onChange={(date) => handleDateChangeForReport('from_date', date)}
//               selectsStart
//               startDate={formData.from_date}
//               endDate={formData.to_date}
//               dateFormat="dd-MM-yyyy"
//               className="form-control"
//               placeholderText="Select From Date"
//               maxDate={formData.to_date || new Date()}
//               isClearable
//             />
//           </div>
//         </div>
      
//         <div className="col-md-3">
//           <div className="form-group report_date">
//             <DatePicker
//               id="toDate"
//               selected={formData.to_date}
//               onChange={(date) => handleDateChangeForReport('to_date', date)}
//               selectsEnd
//               startDate={formData.from_date}
//               endDate={formData.to_date}
//               minDate={formData.from_date}
//               dateFormat="dd-MM-yyyy"
//               className="form-control"
//               placeholderText="Select To Date"
//               maxDate={new Date()}
//               isClearable
//             />
//           </div>
//         </div>


//          <div className="col-sm-3">
//           <Select
//             id="item"
//             name="item"
//             value={
//               formData.item
//                 ? { value: formData.item, label: formData.item_name }
//                 : null
//             }
//             options={items.map((item) => ({
//               value: item.id,
//               label: item.items + " (" + item.manufacturer + ")",
//             }))}
//             onChange={(selectedOption) => {
//               setFormData({
//                 ...formData,
//                 item: selectedOption?.value || null,
//                 item_name: selectedOption?.label || ""
//               });
//             }}
//             placeholder="Select Item"
//             isClearable
//           />
//         </div>
        
//         <div className="col-sm-3">
//           <Select
//             id="supplier_id"
//             name="supplier_id"
//             value={
//               formData.supplier_id
//                 ? {
//                     value: formData.supplier_id,
//                     label: formData.full_name,
//                   }
//                 : null
//             }
//             options={getAllSupplier.map((supplier) => ({
//               value: supplier.id,
//               label: supplier.full_name,
//             }))}
//             onChange={(selectedOption) => {
//               setFormData({
//                 ...formData,
//                 supplier_id: selectedOption?.value || null,
//                 full_name: selectedOption?.label || ""
//               });
//             }}
//             placeholder="Select Supplier"
//             isClearable
//           />
//         </div>
      
      
//       </div>

    
//       <div className="d-flex justify-content-center mb-4 mt-3">
//         <div>
//           <button 
//             className="btn btn-primary me-2 mr-2"
//             onClick={handleGenerateReport}
//             disabled={!formData.item}
//           >
//             <i className="fas fa-search"></i> Generate Report
//           </button>
          
//           <button 
//             className="btn btn-outline-secondary"
//             onClick={handleResetDates}
//           >
//             <i className="fas fa-undo"></i> Reset
//           </button>
//         </div>
//       </div>
      
//       {isLoading && (
//         // <div className="text-center my-4">
//         //   <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//         //   </div>
//         // </div>
//       )}

//       <div className="row justify-content-center mb-3">
//         <div className="col-md-6">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search by Invoice, Item, or Date"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             disabled={isLoading || incomeReport.length === 0}
//           />
//         </div>
//       </div>

//       <div className="card">
//         <div className="card-header bg-primary text-white">
//           <h5 className="mb-0">Stock Item Wise Detail Report</h5>
//         </div>
//         <div className="card-body">
//           <div className="table-responsive">
//             <table className="table table-striped table-hover">
//               <thead>
//                 <tr>
//                   <th>Invoice #</th>
//                   <th>Date</th>
//                   <th>Item</th>
//                   <th className="text-end">Qty</th>
//                   <th className="text-end">Purchase Price</th>
//                   <th className="text-end">T.Purchase Price</th>
//                   <th className="text-end">Sale Price</th>
//                   <th className="text-end">T.Sale Price</th>
//                   <th className="text-end">Rack#</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredReport.length === 0 ? (
//                   <tr>
//                     <td colSpan="9" className="text-center text-muted py-4">
//                       {incomeReport.length === 0 
//                         ? 'Please select date range and generate report' 
//                         : 'No matching records found'}
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredReport.map((item) => {
//                     const quantity = parseFloat(item.quantity) || 0;
//                     const price = parseFloat(item.price_after_discount) || 0;
//                     const purchasePrice = parseFloat(item.purchase_rate_calculate_per_tablet) * quantity || 0;
//                     const total = (price * quantity);

//                     return (
//                       <tr key={`${item.invoice_no}-${item.item_id}`}>
//                         <td>{item.invoice_no}</td>
//                         <td>{item.stock_date}</td>
//                         <td>{item.item_name}</td>
//                         <td className="text-end">{quantity}</td>
//                         <td className="text-end">
//                           {item.purchase_rate_calculate_per_tablet?.toFixed(2)}
//                         </td>
//                         <td className="text-end">{purchasePrice.toFixed(2)}</td>
//                         <td className="text-end">{price.toFixed(2)}</td>
//                         <td className="text-end">{total.toFixed(2)}</td>
//                         <td className="text-end">{item.rack_no}</td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//               {filteredReport.length > 0 && (
//                 <tfoot>
//                   <tr className="table-active">
//                     <th colSpan="3">Grand Total</th>
//                     <th className="text-end">{grandTotalQty}</th>
//                     <th className="text-end"></th>
//                     <th className="text-end">{grandTotalPurchasePrice.toFixed(2)}</th>
//                     <th className="text-end"></th>
//                     <th className="text-end" colSpan={2}>{grandTotalTotal.toFixed(2)}</th>
//                   </tr>
//                 </tfoot>
//               )}
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StockItemWiseDetailReport;




// import React, { useState } from 'react';
// import axios from 'axios';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import Select from "react-select";

// const StockItemWiseDetailReport = ({ items, getAllSupplier, ViewInvoice, editInvoice }) => {
//   const [incomeReport, setIncomeReport] = useState([]);
//   const [filteredReport, setFilteredReport] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     from_date: null,
//     to_date: null,
//     supplier_id: null,
//     item: null,
//     item_name: "",
//     full_name: ""
//   });

//   const fetchInvoiceData = async (from_date, to_date, supplier_id, item_id, shouldLoad = true) => {
//     if (shouldLoad) setIsLoading(true);
    
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/stock_item_wise_detail_report_list`, {
//         params: {
//           from_date: from_date ? format(from_date, 'yyyy-MM-dd') : null,
//           to_date: to_date ? format(to_date, 'yyyy-MM-dd') : null,
//           supplier_id: supplier_id || null,
//           item_id: item_id || null
//         },
//       });
      
//       const data = response.data.results;
//       setIncomeReport(data);
//       setFilteredReport(data);
//     } catch (error) {
//       console.error('Error fetching invoice data', error);
//     } finally {
//       if (shouldLoad) setIsLoading(false);
//     }
//   };

//   const handleDateChangeForReport = (field, date) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: date
//     }));
//   };

//   const handleGenerateReport = () => {
//     if (formData.supplier_id || formData.item || (formData.from_date && formData.to_date)) {
//       fetchInvoiceData(
//         formData.from_date, 
//         formData.to_date,
//         formData.supplier_id,
//         formData.item,
//         false,
//       );
//     }
//   };

//   const handleResetDates = () => {
//     setFormData({
//       from_date: null,
//       to_date: null,
//       supplier_id: null,
//       item: null,
//       item_name: "",
//       full_name: ""
//     });
//     setIncomeReport([]);
//     setFilteredReport([]);
//     setSearchTerm("");
//   };

//   const calculateGrandTotal = () => {
//     return filteredReport.reduce((acc, item) => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.price_after_discount) || 0;
//       const purchasePrice = parseFloat(item.purchase_rate_calculate_per_tablet) * quantity || 0;
//       const purchase = parseFloat(item.purchase_rate_calculate_per_tablet) || 0;
//       const discount = parseFloat(item.discount) || 0;
//       const total = (price * quantity) - discount;
//       const profit = total - purchasePrice;

//       return {
//         grandTotalQty: acc.grandTotalQty + quantity,
//         grandTotalSalePrice: acc.grandTotalSalePrice + (price * quantity),
//         grandTotalPurchasePrice: acc.grandTotalPurchasePrice + purchasePrice,
//         grandTotalPurchase: acc.grandTotalPurchase + purchase,
//         grandTotalDiscount: acc.grandTotalDiscount + discount,
//         grandTotalTotal: acc.grandTotalTotal + (item.price * item.quantity),
//         grandTotalProfit: acc.grandTotalProfit + profit
//       };
//     }, {
//       grandTotalQty: 0,
//       grandTotalSalePrice: 0,
//       grandTotalPurchasePrice: 0,
//       grandTotalPurchase: 0,
//       grandTotalDiscount: 0,
//       grandTotalTotal: 0,
//       grandTotalProfit: 0
//     });
//   };

//   const { 
//     grandTotalQty, 
//     grandTotalSalePrice, 
//     grandTotalPurchasePrice, 
//     grandTotalPurchase,
//     grandTotalDiscount, 
//     grandTotalTotal, 
//     grandTotalProfit 
//   } = calculateGrandTotal();

//   const handleSearchChange = (event) => {
//     const term = event.target.value.toLowerCase();
//     setSearchTerm(term);

//     const filteredData = incomeReport.filter(item => {
//       return (
//         item.invoice_no?.toString().includes(term) ||
//         item.item_name?.toLowerCase().includes(term) ||
//         item.stock_date?.toString().includes(term)
//       );
//     });

//     setFilteredReport(filteredData);
//   };

//   const grandTotalSaleAmt = filteredReport.reduce((s, r) => s + (parseFloat(r.price) || 0) * (parseFloat(r.quantity) || 0), 0);
//   const grandTotalProfit2 = grandTotalSaleAmt - grandTotalPurchasePrice;

//   return (
//     <>
//       <style>{`
//         .siw-wrap {
//           font-family: 'Segoe UI', sans-serif;
//           background: #f5f3ff;
//           min-height: 100%;
//           padding-bottom: 24px;
//         }

//         /* ── TOP BAR ── */
//         .siw-topbar {
//           background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
//           padding: 16px 24px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           flex-wrap: wrap;
//           gap: 8px;
//         }
//         .siw-topbar h2 {
//           margin: 0;
//           font-size: 1.1rem;
//           font-weight: 800;
//           color: #fde68a;
//           letter-spacing: .4px;
//         }
//         .siw-topbar span {
//           font-size: .75rem;
//           color: rgba(255,255,255,.65);
//         }
//         .siw-record-pill {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 4px 14px;
//           background: rgba(253,230,138,.18);
//           border: 1px solid rgba(253,230,138,.35);
//           border-radius: 20px;
//           font-size: .75rem;
//           font-weight: 700;
//           color: #fde68a;
//         }

//         /* ── FILTER PANEL ── */
//         .siw-filter-panel {
//           background: #fff;
//           border-bottom: 2px solid #ede9fe;
//           padding: 16px 24px;
//         }
//         .siw-filter-title {
//           font-size: .72rem;
//           font-weight: 700;
//           color: #6d28d9;
//           text-transform: uppercase;
//           letter-spacing: .7px;
//           margin-bottom: 10px;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//         }
//         .siw-filter-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//           gap: 10px;
//           margin-bottom: 12px;
//         }
//         .siw-filter-field label {
//           display: block;
//           font-size: .7rem;
//           font-weight: 600;
//           color: #6d28d9;
//           text-transform: uppercase;
//           letter-spacing: .5px;
//           margin-bottom: 4px;
//         }
//         .siw-filter-field .react-datepicker-wrapper { width: 100%; }
//         .siw-filter-field .react-datepicker__input-container input {
//           width: 100%;
//           padding: 7px 10px;
//           border: 1.5px solid #ddd6fe;
//           border-radius: 8px;
//           font-size: .82rem;
//           color: #1e1b4b;
//           outline: none;
//           transition: border .2s;
//         }
//         .siw-filter-field .react-datepicker__input-container input:focus { border-color: #7c3aed; }

//         .siw-filter-actions {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           flex-wrap: wrap;
//         }
//         .siw-search {
//           flex: 1;
//           min-width: 180px;
//           padding: 7px 12px;
//           border: 1.5px solid #ddd6fe;
//           border-radius: 8px;
//           font-size: .83rem;
//           color: #1e1b4b;
//           outline: none;
//           transition: border .2s;
//         }
//         .siw-search:focus { border-color: #7c3aed; }
//         .siw-search:disabled { background: #f3f0ff; opacity: .6; }

//         .siw-btn-gen {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 18px;
//           border-radius: 8px;
//           border: none;
//           background: linear-gradient(135deg, #4c1d95, #7c3aed);
//           color: #fff;
//           font-size: .82rem;
//           font-weight: 700;
//           cursor: pointer;
//           transition: opacity .15s;
//           white-space: nowrap;
//         }
//         .siw-btn-gen:disabled { opacity: .45; cursor: not-allowed; }
//         .siw-btn-gen:not(:disabled):hover { opacity: .88; }

//         .siw-btn-reset {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 8px 16px;
//           border-radius: 8px;
//           border: 1.5px solid #ddd6fe;
//           background: #fff;
//           color: #6d28d9;
//           font-size: .82rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: background .15s;
//           white-space: nowrap;
//         }
//         .siw-btn-reset:hover { background: #f5f3ff; }

//         .siw-hint {
//           font-size: .72rem;
//           color: #f59e0b;
//           font-weight: 600;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//         }

//         /* ── SUMMARY CARDS ── */
//         .siw-summary-row {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
//           gap: 12px;
//           padding: 16px 24px;
//         }
//         .siw-sum-card {
//           background: #fff;
//           border-radius: 12px;
//           padding: 14px 16px;
//           border-left: 4px solid #7c3aed;
//           box-shadow: 0 2px 8px rgba(124,58,237,.08);
//         }
//         .siw-sum-card.green  { border-left-color: #059669; }
//         .siw-sum-card.amber  { border-left-color: #d97706; }
//         .siw-sum-card.red    { border-left-color: #dc2626; }
//         .siw-sum-card.teal   { border-left-color: #0891b2; }
//         .siw-sum-label {
//           font-size: .67rem;
//           font-weight: 700;
//           color: #9ca3af;
//           text-transform: uppercase;
//           letter-spacing: .6px;
//           margin-bottom: 4px;
//         }
//         .siw-sum-val {
//           font-size: 1.15rem;
//           font-weight: 800;
//           color: #1e1b4b;
//           line-height: 1.2;
//         }
//         .siw-sum-sub {
//           font-size: .68rem;
//           color: #a78bfa;
//           margin-top: 2px;
//         }

//         /* ── TABLE AREA ── */
//         .siw-table-section {
//           padding: 0 24px 24px;
//         }
//         .siw-table-card {
//           background: #fff;
//           border-radius: 12px;
//           box-shadow: 0 2px 12px rgba(76,29,149,.07);
//           overflow: hidden;
//         }
//         .siw-table-head-bar {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 12px 18px;
//           border-bottom: 1px solid #f3f0ff;
//           flex-wrap: wrap;
//           gap: 8px;
//         }
//         .siw-table-head-bar h4 {
//           margin: 0;
//           font-size: .9rem;
//           font-weight: 700;
//           color: #4c1d95;
//         }
//         .siw-loading-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 3px 12px;
//           background: #ede9fe;
//           border-radius: 20px;
//           font-size: .72rem;
//           color: #6d28d9;
//           font-weight: 600;
//         }

//         .siw-tbl-wrap { overflow-x: auto; }
//         .siw-tbl {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: .82rem;
//         }
//         .siw-tbl thead tr {
//           background: linear-gradient(90deg, #4c1d95, #7c3aed);
//         }
//         .siw-tbl thead th {
//           padding: 10px 12px;
//           color: #fde68a;
//           font-weight: 600;
//           font-size: .72rem;
//           text-transform: uppercase;
//           letter-spacing: .5px;
//           white-space: nowrap;
//           border: none;
//         }
//         .siw-tbl thead th.r { text-align: right; }
//         .siw-tbl tbody tr { border-bottom: 1px solid #f3f0ff; transition: background .12s; }
//         .siw-tbl tbody tr:hover { background: #faf5ff; }
//         .siw-tbl tbody td { padding: 9px 12px; color: #374151; vertical-align: middle; }
//         .siw-tbl tbody td.r { text-align: right; font-variant-numeric: tabular-nums; }
//         .siw-tbl tbody tr:last-child { border-bottom: none; }

//         .siw-inv-badge {
//           display: inline-block;
//           padding: 2px 8px;
//           border-radius: 6px;
//           background: #ede9fe;
//           color: #6d28d9;
//           font-weight: 700;
//           font-size: .75rem;
//         }
//         .siw-profit-pos { color: #059669; font-weight: 700; }
//         .siw-profit-neg { color: #dc2626; font-weight: 700; }

//         .siw-tbl tfoot tr {
//           background: linear-gradient(90deg, #fef3c7, #fde68a);
//         }
//         .siw-tbl tfoot td, .siw-tbl tfoot th {
//           padding: 10px 12px;
//           font-weight: 700;
//           color: #1c1917;
//           font-size: .8rem;
//           border: none;
//         }
//         .siw-tbl tfoot td.r, .siw-tbl tfoot th.r { text-align: right; }

//         .siw-empty {
//           text-align: center;
//           padding: 48px 20px;
//           color: #a78bfa;
//         }
//         .siw-empty i { font-size: 2rem; margin-bottom: 10px; display: block; }
//         .siw-empty p { margin: 0; font-size: .85rem; }

//         .siw-inv-link {
//           background: #ede9fe;
//           color: #6d28d9;
//           border: none;
//           border-radius: 6px;
//           padding: 2px 8px;
//           font-weight: 700;
//           font-size: .75rem;
//           cursor: pointer;
//           transition: background .15s, color .15s;
//           white-space: nowrap;
//         }
//         .siw-inv-link:hover { background: #7c3aed; color: #fff; }

//         .sl-btn { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap; }
//         .sl-btn-view { background:#ede9fe;color:#7c3aed; }
//         .sl-btn-view:hover { background:#7c3aed;color:#fff; }
//         .sl-btn-edit { background:#d1fae5;color:#059669; }
//         .sl-btn-edit:hover { background:#059669;color:#fff; }
//       `}</style>

//       <div className="siw-wrap">

//         {/* ── TOP BAR ── */}
//         <div className="siw-topbar">
//           <div>
//             <h2><i className="fas fa-chart-bar" style={{marginRight:8}}></i>Stock Item Wise Detail Report</h2>
//             <span>Filter by date range, item, or supplier to analyze stock records</span>
//           </div>
//           {filteredReport.length > 0 && (
//             <div className="siw-record-pill">
//               <i className="fas fa-list"></i>
//               {filteredReport.length} record{filteredReport.length !== 1 ? 's' : ''}
//             </div>
//           )}
//         </div>

//         {/* ── FILTER PANEL ── */}
//         <div className="siw-filter-panel">
//           <div className="siw-filter-title">
//             <i className="fas fa-filter"></i> Filters
//           </div>

//           <div className="siw-filter-grid">
//             {/* From Date */}
//             <div className="siw-filter-field">
//               <label>From Date</label>
//               <DatePicker
//                 selected={formData.from_date}
//                 onChange={(date) => handleDateChangeForReport('from_date', date)}
//                 selectsStart
//                 startDate={formData.from_date}
//                 endDate={formData.to_date}
//                 dateFormat="dd-MM-yyyy"
//                 placeholderText="From date"
//                 maxDate={formData.to_date || new Date()}
//                 isClearable
//               />
//             </div>

//             {/* To Date */}
//             <div className="siw-filter-field">
//               <label>To Date</label>
//               <DatePicker
//                 selected={formData.to_date}
//                 onChange={(date) => handleDateChangeForReport('to_date', date)}
//                 selectsEnd
//                 startDate={formData.from_date}
//                 endDate={formData.to_date}
//                 minDate={formData.from_date}
//                 dateFormat="dd-MM-yyyy"
//                 placeholderText="To date"
//                 maxDate={new Date()}
//                 isClearable
//               />
//             </div>

//             {/* Item */}
//             <div className="siw-filter-field">
//               <label>Item <span style={{color:'#f59e0b'}}>*</span></label>
//               <Select
//                 value={formData.item ? { value: formData.item, label: formData.item_name } : null}
//                 options={items.map((i) => ({ value: i.id, label: i.items + (i.manufacturer ? ` (${i.manufacturer})` : '') }))}
//                 onChange={(sel) => setFormData({ ...formData, item: sel?.value || null, item_name: sel?.label || '' })}
//                 placeholder="Select item..."
//                 isClearable
//                 styles={{
//                   control: (b) => ({ ...b, borderColor: '#ddd6fe', borderRadius: 8, fontSize: '.82rem', minHeight: 36 }),
//                   menu: (b) => ({ ...b, zIndex: 9999 }),
//                 }}
//               />
//             </div>

//             {/* Supplier */}
//             <div className="siw-filter-field">
//               <label>Supplier</label>
//               <Select
//                 value={formData.supplier_id ? { value: formData.supplier_id, label: formData.full_name } : null}
//                 options={getAllSupplier.map((s) => ({ value: s.id, label: s.full_name }))}
//                 onChange={(sel) => setFormData({ ...formData, supplier_id: sel?.value || null, full_name: sel?.label || '' })}
//                 placeholder="All suppliers"
//                 isClearable
//                 styles={{
//                   control: (b) => ({ ...b, borderColor: '#ddd6fe', borderRadius: 8, fontSize: '.82rem', minHeight: 36 }),
//                   menu: (b) => ({ ...b, zIndex: 9999 }),
//                 }}
//               />
//             </div>
//           </div>

//           {/* Actions row */}
//           <div className="siw-filter-actions">
//             <input
//               type="text"
//               className="siw-search"
//               placeholder="Search by invoice, item or date…"
//               value={searchTerm}
//               onChange={handleSearchChange}
//               disabled={incomeReport.length === 0}
//             />
//             {/* {!formData.item && (
//               <span className="siw-hint"><i className="fas fa-exclamation-triangle"></i> Select an item to generate</span>
//             )} */}
//             <button className="siw-btn-gen" onClick={handleGenerateReport} disabled={isLoading}>
//               <i className="fas fa-search"></i>
//               {isLoading ? 'Loading…' : 'Generate Report'}
//             </button>
//             <button className="siw-btn-reset" onClick={handleResetDates}>
//               <i className="fas fa-undo"></i> Reset
//             </button>
//           </div>
//         </div>

//         {/* ── SUMMARY CARDS ── */}
//         {/* {filteredReport.length > 0 && (
//           <div className="siw-summary-row">
//             <div className="siw-sum-card">
//               <div className="siw-sum-label">Records</div>
//               <div className="siw-sum-val">{filteredReport.length}</div>
//               <div className="siw-sum-sub">stock entries</div>
//             </div>
//             <div className="siw-sum-card teal">
//               <div className="siw-sum-label">Total Qty</div>
//               <div className="siw-sum-val">{grandTotalQty.toFixed(0)}</div>
//               <div className="siw-sum-sub">units stocked</div>
//             </div>
//             <div className="siw-sum-card amber">
//               <div className="siw-sum-label">Total Purchase</div>
//               <div className="siw-sum-val">Rs {grandTotalPurchasePrice.toFixed(0)}</div>
//               <div className="siw-sum-sub">cost of stock</div>
//             </div>
//             <div className="siw-sum-card green">
//               <div className="siw-sum-label">Total Sale Value</div>
//               <div className="siw-sum-val">Rs {grandTotalSaleAmt.toFixed(0)}</div>
//               <div className="siw-sum-sub">at sale price</div>
//             </div>
//             <div className={`siw-sum-card ${grandTotalProfit2 >= 0 ? 'green' : 'red'}`}>
//               <div className="siw-sum-label">Gross Profit</div>
//               <div className={`siw-sum-val ${grandTotalProfit2 >= 0 ? 'siw-profit-pos' : 'siw-profit-neg'}`}>
//                 Rs {grandTotalProfit2.toFixed(0)}
//               </div>
//               <div className="siw-sum-sub">sale − purchase</div>
//             </div>
//           </div>
//         )} */}

//         {/* ── TABLE ── */}
//         <div className="siw-table-section">
//           <div className="siw-table-card">
//             <div className="siw-table-head-bar">
//               <h4><i className="fas fa-table" style={{marginRight:7,color:'#7c3aed'}}></i>Detail Records</h4>
//               {isLoading && <span className="siw-loading-badge"><i className="fas fa-spinner fa-spin"></i> Loading…</span>}
//             </div>

//             <div className="siw-tbl-wrap">
//               <table className="siw-tbl">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Invoice</th>
//                     <th>Date</th>
//                     <th>Item</th>
//                     <th>Rack</th>
//                     <th className="r">Qty</th>
//                     <th className="r">Purchase/Unit</th>
//                     <th className="r">Total Purchase</th>
//                     <th className="r">Sale Price</th>
//                     <th className="r">Total Sale</th>
//                     <th className="r">Profit</th>
//                     {(ViewInvoice || editInvoice) && <th style={{textAlign:'center'}}>Actions</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredReport.length === 0 ? (
//                     <tr>
//                       <td colSpan={(ViewInvoice || editInvoice) ? 12 : 11}>
//                         <div className="siw-empty">
//                           <i className={incomeReport.length === 0 ? 'fas fa-search' : 'fas fa-filter'}></i>
//                           <p>{incomeReport.length === 0 ? 'Select an item and click Generate Report' : 'No records match your search'}</p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredReport.map((row, idx) => {
//                       const qty      = parseFloat(row.quantity) || 0;
//                       const purUnit  = parseFloat(row.purchase_rate_calculate_per_tablet) || 0;
//                       const purTotal = purUnit * qty;
//                       const saleUnit = parseFloat(row.price) || 0;
//                       const saleTotal = saleUnit * qty;
//                       const rowProfit = saleTotal - purTotal;

//                       return (
//                         <tr key={`${row.invoice_no}-${row.item_id}-${idx}`}>
//                           <td style={{color:'#a78bfa',fontWeight:600,fontSize:'.75rem'}}>{idx + 1}</td>
//                           <td>
//                             {ViewInvoice ? (
//                               <button className="siw-inv-link" onClick={() => ViewInvoice(row.invoice_no)} title="View invoice">
//                                 <i className="fas fa-file-invoice" style={{marginRight:4}}></i>{row.invoice_no}
//                               </button>
//                             ) : (
//                               <span className="siw-inv-badge">{row.invoice_no}</span>
//                             )}
//                           </td>
//                           <td style={{whiteSpace:'nowrap'}}>{row.stock_date}</td>
//                           <td style={{fontWeight:500}}>{row.item_name}</td>
//                           <td>{row.rack_no || '—'}</td>
//                           <td className="r">{qty}</td>
//                           <td className="r">{purUnit.toFixed(2)}</td>
//                           <td className="r">{purTotal.toFixed(2)}</td>
//                           <td className="r">{saleUnit.toFixed(2)}</td>
//                           <td className="r">{saleTotal.toFixed(2)}</td>
//                           <td className={`r ${rowProfit >= 0 ? 'siw-profit-pos' : 'siw-profit-neg'}`}>
//                             {rowProfit.toFixed(2)}
//                           </td>
//                           {(ViewInvoice || editInvoice) && (
//                             <td style={{textAlign:'center',whiteSpace:'nowrap'}}>
//                               {ViewInvoice && (
//                                 <button className="sl-btn sl-btn-view" onClick={() => ViewInvoice(row.invoice_no)} title="View invoice">
//                                   <i className="fas fa-eye"></i> View
//                                 </button>
//                               )}
//                               {editInvoice && (
//                                 <button className="sl-btn sl-btn-edit" style={{marginLeft:4}} onClick={() => editInvoice(row.invoice_no)} title="Edit invoice">
//                                   <i className="fas fa-edit"></i> Edit
//                                 </button>
//                               )}
//                             </td>
//                           )}
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//                 {filteredReport.length > 0 && (
//                   <tfoot>
//                     <tr>
//                       <td colSpan="5" style={{fontWeight:700}}>Grand Total</td>
//                       <td className="r">{grandTotalQty.toFixed(0)}</td>
//                       <td className="r">—</td>
//                       <td className="r">{grandTotalPurchasePrice.toFixed(2)}</td>
//                       <td className="r">—</td>
//                       <td className="r">{grandTotalSaleAmt.toFixed(2)}</td>
//                       <td className={`r ${grandTotalProfit2 >= 0 ? 'siw-profit-pos' : 'siw-profit-neg'}`}>
//                         {grandTotalProfit2.toFixed(2)}
//                       </td>
//                       {(ViewInvoice || editInvoice) && <td></td>}
//                     </tr>
//                   </tfoot>
//                 )}
//               </table>
//             </div>
//           </div>
//         </div>

//       </div>
//     </>
//   );
// };

// export default StockItemWiseDetailReport;










import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Select from "react-select";

const StockItemWiseDetailReport = ({ items, getAllSupplier, ViewInvoice, editInvoice }) => {
  const [incomeReport, setIncomeReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    from_date: null, to_date: null,
    supplier_id: null, item: null,
    item_name: "", full_name: ""
  });

  const [advFilters, setAdvFilters] = useState({
    adv_item: null,
    adv_supplier: null,
    adv_from_date: null,
    adv_to_date: null,
    min_qty: "", max_qty: "",
    min_profit: "", max_profit: "",
    profit_sign: "all",
    adv_purchase_price: null,
    adv_sale_price: null,
    purchase_price_sort: "none",   // "none" | "asc" | "desc"
    sale_price_sort: "none",       // "none" | "asc" | "desc"
    sort_by: "default",
    sort_dir: "desc"
  });

  // ─── Fetch ────────────────────────────────────────────────────
  const fetchInvoiceData = async (from_date, to_date, supplier_id, item_id) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/stock_item_wise_detail_report_list`, {
        params: {
          from_date: from_date ? format(from_date, 'yyyy-MM-dd') : null,
          to_date: to_date ? format(to_date, 'yyyy-MM-dd') : null,
          supplier_id: supplier_id || null,
          item_id: item_id || null
        },
      });
      const data = response.data.results;
      setIncomeReport(data);
      applyFilters(data, searchTerm, advFilters);
    } catch (error) {
      console.error('Error fetching invoice data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Apply all client-side filters + sorting ─────────────────
  const applyFilters = (source, term, adv) => {
    let result = [...source];

    // basic search
    if (term) {
      const t = term.toLowerCase();
      result = result.filter(r =>
        r.invoice_no?.toString().includes(t) ||
        r.item_name?.toLowerCase().includes(t) ||
        r.stock_date?.toString().includes(t) ||
        r.supplier_name?.toLowerCase().includes(t)
      );
    }

    if (adv.adv_item)     result = result.filter(r => r.item_id === adv.adv_item);
    if (adv.adv_supplier) result = result.filter(r => r.supplier_id === adv.adv_supplier);

    if (adv.adv_from_date) {
      const from = format(adv.adv_from_date, 'yyyy-MM-dd');
      result = result.filter(r => r.stock_date >= from);
    }
    if (adv.adv_to_date) {
      const to = format(adv.adv_to_date, 'yyyy-MM-dd');
      result = result.filter(r => r.stock_date <= to);
    }

    if (adv.min_qty !== "") result = result.filter(r => (parseFloat(r.quantity) || 0) >= parseFloat(adv.min_qty));
    if (adv.max_qty !== "") result = result.filter(r => (parseFloat(r.quantity) || 0) <= parseFloat(adv.max_qty));

    // exact price filters
    if (adv.adv_purchase_price !== null && adv.adv_purchase_price !== undefined)
      result = result.filter(r => parseFloat(r.purchase_rate_calculate_per_tablet) === adv.adv_purchase_price);

    if (adv.adv_sale_price !== null && adv.adv_sale_price !== undefined)
      result = result.filter(r => parseFloat(r.price) === adv.adv_sale_price);

    // profit
    if (adv.profit_sign === "positive")
      result = result.filter(r => (parseFloat(r.price) - parseFloat(r.purchase_rate_calculate_per_tablet)) * (parseFloat(r.quantity) || 0) >= 0);
    if (adv.profit_sign === "negative")
      result = result.filter(r => (parseFloat(r.price) - parseFloat(r.purchase_rate_calculate_per_tablet)) * (parseFloat(r.quantity) || 0) < 0);

    if (adv.min_profit !== "")
      result = result.filter(r => (parseFloat(r.price) - parseFloat(r.purchase_rate_calculate_per_tablet)) * (parseFloat(r.quantity) || 0) >= parseFloat(adv.min_profit));
    if (adv.max_profit !== "")
      result = result.filter(r => (parseFloat(r.price) - parseFloat(r.purchase_rate_calculate_per_tablet)) * (parseFloat(r.quantity) || 0) <= parseFloat(adv.max_profit));

    // ── Sorting priority: purchase_price_sort > sale_price_sort > sort_by
    if (adv.purchase_price_sort !== "none") {
      const dir = adv.purchase_price_sort === "asc" ? 1 : -1;
      result.sort((a, b) => ((parseFloat(a.purchase_rate_calculate_per_tablet) || 0) - (parseFloat(b.purchase_rate_calculate_per_tablet) || 0)) * dir);
    } else if (adv.sale_price_sort !== "none") {
      const dir = adv.sale_price_sort === "asc" ? 1 : -1;
      result.sort((a, b) => ((parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)) * dir);
    } else if (adv.sort_by !== "default") {
      const dir = adv.sort_dir === "asc" ? 1 : -1;
      result.sort((a, b) => {
        const v = (row) => {
          const qty = parseFloat(row.quantity) || 0;
          const pur = parseFloat(row.purchase_rate_calculate_per_tablet) || 0;
          const sal = parseFloat(row.price) || 0;
          if (adv.sort_by === "qty")      return qty;
          if (adv.sort_by === "profit")   return (sal - pur) * qty;
          if (adv.sort_by === "sale")     return sal * qty;
          if (adv.sort_by === "purchase") return pur * qty;
          return 0;
        };
        return (v(a) - v(b)) * dir;
      });
    }

    setFilteredReport(result);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(incomeReport, term, advFilters);
  };

  const handleAdvChange = (key, val) => {
    // Mutual exclusion: only one sort group active at a time
    let extra = {};
    if (key === "purchase_price_sort" && val !== "none") extra = { sale_price_sort: "none", sort_by: "default" };
    if (key === "sale_price_sort"     && val !== "none") extra = { purchase_price_sort: "none", sort_by: "default" };
    if (key === "sort_by"             && val !== "default") extra = { purchase_price_sort: "none", sale_price_sort: "none" };
    const updated = { ...advFilters, [key]: val, ...extra };
    setAdvFilters(updated);
    applyFilters(incomeReport, searchTerm, updated);
  };

  const handleResetAdvanced = () => {
    const reset = {
      adv_item: null, adv_supplier: null,
      adv_from_date: null, adv_to_date: null,
      min_qty: "", max_qty: "",
      min_profit: "", max_profit: "",
      profit_sign: "all",
      adv_purchase_price: null, adv_sale_price: null,
      purchase_price_sort: "none", sale_price_sort: "none",
      sort_by: "default", sort_dir: "desc"
    };
    setAdvFilters(reset);
    applyFilters(incomeReport, searchTerm, reset);
  };

  const handleGenerateReport = () => {
    if (formData.supplier_id || formData.item || formData.from_date || formData.to_date)
      fetchInvoiceData(formData.from_date, formData.to_date, formData.supplier_id, formData.item);
  };

  const handleResetAll = () => {
    setFormData({ from_date: null, to_date: null, supplier_id: null, item: null, item_name: "", full_name: "" });
    setIncomeReport([]); setFilteredReport([]); setSearchTerm("");
    handleResetAdvanced();
  };

  // ─── Totals ───────────────────────────────────────────────────
  const grandTotalQty           = filteredReport.reduce((s, r) => s + (parseFloat(r.quantity) || 0), 0);
  const grandTotalPurchasePrice = filteredReport.reduce((s, r) => s + (parseFloat(r.purchase_rate_calculate_per_tablet) || 0) * (parseFloat(r.quantity) || 0), 0);
  const grandTotalSaleAmt       = filteredReport.reduce((s, r) => s + (parseFloat(r.price) || 0) * (parseFloat(r.quantity) || 0), 0);
  const grandTotalProfit        = grandTotalSaleAmt - grandTotalPurchasePrice;

  // ─── Unique dropdown options ──────────────────────────────────
  const advItemOptions = [...new Map(incomeReport.map(r => [r.item_id, { value: r.item_id, label: r.item_name }])).values()];

  const advSupplierOptions = [...new Map(
    incomeReport.map(r => [r.supplier_id, { value: r.supplier_id, label: r.supplier_name || '(No Supplier)' }])
  ).values()];

  const advPurchasePriceOptions = [...new Map(
    incomeReport.map(r => { const v = parseFloat(r.purchase_rate_calculate_per_tablet) || 0; return [v, { value: v, label: `Rs ${v.toFixed(2)}` }]; })
  ).values()].sort((a, b) => a.value - b.value);

  const advSalePriceOptions = [...new Map(
    incomeReport.map(r => { const v = parseFloat(r.price) || 0; return [v, { value: v, label: `Rs ${v.toFixed(2)}` }]; })
  ).values()].sort((a, b) => a.value - b.value);

  const hasAdvActive =
    advFilters.adv_item || advFilters.adv_supplier ||
    advFilters.adv_from_date || advFilters.adv_to_date ||
    advFilters.min_qty !== "" || advFilters.max_qty !== "" ||
    advFilters.min_profit !== "" || advFilters.max_profit !== "" ||
    advFilters.profit_sign !== "all" ||
    advFilters.adv_purchase_price !== null || advFilters.adv_sale_price !== null ||
    advFilters.purchase_price_sort !== "none" || advFilters.sale_price_sort !== "none" ||
    advFilters.sort_by !== "default";

  const selectStyles = {
    control: (b) => ({ ...b, borderColor: '#ddd6fe', borderRadius: 8, fontSize: '.82rem', minHeight: 34 }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
  };

  const hasActions = ViewInvoice || editInvoice;
  const colSpan    = hasActions ? 13 : 12;

  // Sort arrow indicators in table header
  const PurchaseSortIcon = () => {
    if (advFilters.purchase_price_sort === "asc")  return <span style={{color:'#fde68a',marginLeft:3}}>↑</span>;
    if (advFilters.purchase_price_sort === "desc") return <span style={{color:'#fde68a',marginLeft:3}}>↓</span>;
    return null;
  };
  const SaleSortIcon = () => {
    if (advFilters.sale_price_sort === "asc")  return <span style={{color:'#fde68a',marginLeft:3}}>↑</span>;
    if (advFilters.sale_price_sort === "desc") return <span style={{color:'#fde68a',marginLeft:3}}>↓</span>;
    return null;
  };

  return (
    <>
      <style>{`
        .siw-wrap { font-family:'Segoe UI',sans-serif;min-height:100%;padding-bottom:24px; }

        /* TOP BAR */
        .siw-topbar { background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px; }
        .siw-topbar h2 { margin:0;font-size:1.1rem;font-weight:800;color:#fde68a;letter-spacing:.4px; }
        .siw-topbar span { font-size:.75rem;color:rgba(255,255,255,.65); }
        .siw-record-pill { display:inline-flex;align-items:center;gap:6px;padding:4px 14px;background:rgba(253,230,138,.18);border:1px solid rgba(253,230,138,.35);border-radius:20px;font-size:.75rem;font-weight:700;color:#fde68a; }

        /* MAIN FILTER PANEL */
        .siw-filter-panel { background:#fff;padding:16px 24px; }
        .siw-filter-title { font-size:.72rem;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;display:flex;align-items:center;gap:6px; }
        .siw-filter-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:12px; }
        .siw-filter-field label { display:block;font-size:.7rem;font-weight:600;color:#6d28d9;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px; }
        .siw-filter-field .react-datepicker-wrapper { width:100%; }
        .siw-filter-field .react-datepicker__input-container input { width:100%;padding:7px 10px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;color:#1e1b4b;outline:none;transition:border .2s;box-sizing:border-box; }
        .siw-filter-field .react-datepicker__input-container input:focus { border-color:#7c3aed; }
        .siw-filter-actions { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }
        .siw-search { flex:1;min-width:180px;padding:7px 12px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.83rem;color:#1e1b4b;outline:none;transition:border .2s; }
        .siw-search:focus { border-color:#7c3aed; }
        .siw-search:disabled { background:#f3f0ff;opacity:.6; }
        .siw-btn-gen { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;font-size:.82rem;font-weight:700;cursor:pointer;transition:opacity .15s;white-space:nowrap; }
        .siw-btn-gen:disabled { opacity:.45;cursor:not-allowed; }
        .siw-btn-gen:not(:disabled):hover { opacity:.88; }
        .siw-btn-reset { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1.5px solid #ddd6fe;background:#fff;color:#6d28d9;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap; }
        .siw-btn-reset:hover { background:#f5f3ff; }

        /* ADV TOGGLE */
        .siw-adv-toggle { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1.5px solid #ddd6fe;background:#fff;color:#6d28d9;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s; }
        .siw-adv-toggle.active { background:#ede9fe;border-color:#7c3aed; }
        .siw-adv-toggle:disabled { opacity:.45;cursor:not-allowed; }
        .siw-adv-badge { display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:#7c3aed;color:#fff;border-radius:50%;font-size:.6rem;font-weight:800; }

        /* ADVANCED PANEL */
        .siw-adv-panel { background:#faf5ff;border-bottom:2px solid #ede9fe;padding:16px 24px;animation:slideDown .2s ease; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .siw-adv-panel-title { font-size:.72rem;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between; }
        .siw-adv-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-bottom:12px; }
        .siw-adv-field label { display:block;font-size:.68rem;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px; }
        .siw-adv-input { width:100%;padding:6px 10px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;color:#1e1b4b;outline:none;box-sizing:border-box;transition:border .2s; }
        .siw-adv-input:focus { border-color:#7c3aed; }
        .siw-adv-select-native { width:100%;padding:6px 10px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;color:#1e1b4b;outline:none;background:#fff;cursor:pointer; }
        .siw-adv-select-native.sort-active { border-color:#7c3aed;background:#f5f3ff;color:#6d28d9;font-weight:700; }
        .siw-adv-field .react-datepicker-wrapper { width:100%; }
        .siw-adv-field .react-datepicker__input-container input { width:100%;padding:6px 10px;border:1.5px solid #ddd6fe;border-radius:8px;font-size:.82rem;color:#1e1b4b;outline:none;transition:border .2s;box-sizing:border-box; }
        .siw-adv-field .react-datepicker__input-container input:focus { border-color:#7c3aed; }
        .siw-adv-actions { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
        .siw-adv-reset { padding:6px 14px;border-radius:7px;border:1.5px solid #fecaca;background:#fff;color:#dc2626;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .15s; }
        .siw-adv-reset:hover { background:#fee2e2; }
        .siw-active-count { font-size:.72rem;color:#7c3aed;font-weight:700; }
        .siw-adv-section-label { grid-column:1/-1;font-size:.65rem;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;padding:4px 0 2px;border-bottom:1px solid #ede9fe;margin-top:4px; }

        /* PRICE SORT BUTTONS */
        .siw-price-sort-pair { display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:6px; }
        .siw-sort-btn { display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:5px 6px;border-radius:7px;border:1.5px solid #ddd6fe;background:#fff;color:#6d28d9;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .15s;width:100%;white-space:nowrap; }
        .siw-sort-btn:hover { background:#ede9fe;border-color:#7c3aed; }
        .siw-sort-btn.asc-active  { background:#d1fae5;border-color:#059669;color:#065f46;font-weight:700; }
        .siw-sort-btn.desc-active { background:#fee2e2;border-color:#dc2626;color:#991b1b;font-weight:700; }

        /* TABLE */
        .siw-table-section { padding:0 24px 24px; }
        .siw-table-card { background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(76,29,149,.07);overflow:hidden; }
        .siw-table-head-bar { display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #f3f0ff;flex-wrap:wrap;gap:8px; }
        .siw-table-head-bar h4 { margin:0;font-size:.9rem;font-weight:700;color:#4c1d95; }
        .siw-loading-badge { display:inline-flex;align-items:center;gap:6px;padding:3px 12px;background:#ede9fe;border-radius:20px;font-size:.72rem;color:#6d28d9;font-weight:600; }
        .siw-tbl-wrap { overflow-x:auto; }
        .siw-tbl { width:100%;border-collapse:collapse;font-size:.82rem; }
        .siw-tbl thead tr { background:linear-gradient(90deg,#4c1d95,#7c3aed); }
        .siw-tbl thead th { padding:10px 12px;color:#fde68a;font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;border:none; }
        .siw-tbl thead th.r { text-align:right; }
        .siw-tbl tbody tr { border-bottom:1px solid #f3f0ff;transition:background .12s; }
        .siw-tbl tbody tr:hover { background:#faf5ff; }
        .siw-tbl tbody td { padding:9px 12px;color:#374151;vertical-align:middle; }
        .siw-tbl tbody td.r { text-align:right;font-variant-numeric:tabular-nums; }
        .siw-tbl tbody tr:last-child { border-bottom:none; }
        .siw-inv-badge { display:inline-block;padding:2px 8px;border-radius:6px;background:#ede9fe;color:#6d28d9;font-weight:700;font-size:.75rem; }
        .siw-inv-link { background:#ede9fe;color:#6d28d9;border:none;border-radius:6px;padding:2px 8px;font-weight:700;font-size:.75rem;cursor:pointer;transition:background .15s,color .15s;white-space:nowrap; }
        .siw-inv-link:hover { background:#7c3aed;color:#fff; }
        .siw-profit-pos { color:#059669;font-weight:700; }
        .siw-profit-neg { color:#dc2626;font-weight:700; }
        .siw-supplier-tag { font-size:.72rem;color:#6d28d9;background:#ede9fe;padding:1px 6px;border-radius:4px;display:inline-block; }
        .siw-tbl tfoot tr { background:linear-gradient(90deg,#fef3c7,#fde68a); }
        .siw-tbl tfoot td { padding:10px 12px;font-weight:700;color:#1c1917;font-size:.8rem;border:none; }
        .siw-tbl tfoot td.r { text-align:right; }
        .siw-empty { text-align:center;padding:48px 20px;color:#a78bfa; }
        .siw-empty i { font-size:2rem;margin-bottom:10px;display:block; }
        .siw-empty p { margin:0;font-size:.85rem; }
        .sl-btn { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap; }
        .sl-btn-view { background:#ede9fe;color:#7c3aed; }
        .sl-btn-view:hover { background:#7c3aed;color:#fff; }
        .sl-btn-edit { background:#d1fae5;color:#059669; }
        .sl-btn-edit:hover { background:#059669;color:#fff; }
      `}</style>

      <div className="siw-wrap">

        {/* TOP BAR */}
        {/* <div className="siw-topbar">
          <div>
            <h2><i className="fas fa-chart-bar" style={{marginRight:8}}></i>Stock Item Wise Detail Report</h2>
            <span>Filter by date range, item, or supplier to analyze stock records</span>
          </div>
          {filteredReport.length > 0 && (
            <div className="siw-record-pill">
              <i className="fas fa-list"></i>
              {filteredReport.length} record{filteredReport.length !== 1 ? 's' : ''}
              {incomeReport.length !== filteredReport.length && ` (of ${incomeReport.length})`}
            </div>
          )}
        </div> */}

        {/* MAIN FILTER PANEL */}
        <div className="siw-filter-panel">
          <div className="siw-filter-title"><i className="fas fa-filter"></i> Fetch Filters</div>
          <div className="siw-filter-grid">
            <div className="siw-filter-field">
              <label>From Date</label>
              <DatePicker selected={formData.from_date} onChange={d => setFormData(p => ({...p,from_date:d}))}
                dateFormat="dd-MM-yyyy" placeholderText="From date" maxDate={formData.to_date||new Date()} isClearable />
            </div>
            <div className="siw-filter-field">
              <label>To Date</label>
              <DatePicker selected={formData.to_date} onChange={d => setFormData(p => ({...p,to_date:d}))}
                minDate={formData.from_date} dateFormat="dd-MM-yyyy" placeholderText="To date" maxDate={new Date()} isClearable />
            </div>
            <div className="siw-filter-field">
              <label>Item <span style={{color:'#f59e0b'}}>*</span></label>
              <Select
                value={formData.item ? {value:formData.item,label:formData.item_name} : null}
                options={items.map(i => ({value:i.id,label:i.items+(i.manufacturer?` (${i.manufacturer})`:'')} ))}
                onChange={sel => setFormData({...formData,item:sel?.value||null,item_name:sel?.label||''})}
                placeholder="Select item..." isClearable styles={selectStyles}
              />
            </div>
            <div className="siw-filter-field">
              <label>Supplier</label>
              <Select
                value={formData.supplier_id ? {value:formData.supplier_id,label:formData.full_name} : null}
                options={getAllSupplier.map(s => ({value:s.id,label:s.full_name}))}
                onChange={sel => setFormData({...formData,supplier_id:sel?.value||null,full_name:sel?.label||''})}
                placeholder="All suppliers" isClearable styles={selectStyles}
              />
            </div>
          </div>
          <div className="siw-filter-actions">
            <input type="text" className="siw-search"
              placeholder="Search by invoice, item, supplier or date…"
              value={searchTerm} onChange={handleSearchChange} disabled={incomeReport.length === 0} />
            <button className={`siw-adv-toggle ${(showAdvanced||hasAdvActive)?'active':''}`}
              onClick={() => setShowAdvanced(p => !p)} disabled={incomeReport.length === 0}>
              <i className="fas fa-sliders-h"></i> Advanced
              {hasAdvActive && <span className="siw-adv-badge">✓</span>}
            </button>
            <button className="siw-btn-gen" onClick={handleGenerateReport} disabled={isLoading}>
              <i className="fas fa-search"></i> {isLoading ? 'Loading…' : 'Generate Report'}
            </button>
            <button className="siw-btn-reset" onClick={handleResetAll}>
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </div>

        {/* ADVANCED FILTER PANEL */}
        {showAdvanced && incomeReport.length > 0 && (
          <div className="siw-adv-panel">
            <div className="siw-adv-panel-title">
              <span>
                <i className="fas fa-sliders-h" style={{marginRight:6}}></i>Advanced Filters
                <span style={{color:'#a78bfa',fontWeight:400,fontSize:'.68rem',marginLeft:6}}>(applied on fetched data)</span>
              </span>
              {hasAdvActive && <span className="siw-active-count">Filters active</span>}
            </div>

            <div className="siw-adv-grid">

              {/* ── Narrow By ── */}
              <div className="siw-adv-section-label"><i className="fas fa-search" style={{marginRight:5}}></i>Narrow By</div>

              <div className="siw-adv-field">
                <label>Item</label>
                <Select value={advFilters.adv_item ? advItemOptions.find(o=>o.value===advFilters.adv_item) : null}
                  options={advItemOptions} onChange={sel=>handleAdvChange('adv_item',sel?.value||null)}
                  placeholder="All items" isClearable styles={selectStyles} />
              </div>

              <div className="siw-adv-field">
                <label>Supplier</label>
                <Select value={advFilters.adv_supplier ? advSupplierOptions.find(o=>o.value===advFilters.adv_supplier) : null}
                  options={advSupplierOptions} onChange={sel=>handleAdvChange('adv_supplier',sel?.value||null)}
                  placeholder="All suppliers" isClearable styles={selectStyles} />
              </div>


               <div className="siw-adv-field">
                <label>Purchase Price / Unit</label>
                {/* <Select
                  value={advFilters.adv_purchase_price !== null ? advPurchasePriceOptions.find(o=>o.value===advFilters.adv_purchase_price) : null}
                  options={advPurchasePriceOptions}
                  onChange={sel => handleAdvChange('adv_purchase_price', sel?.value ?? null)}
                  placeholder="Any purchase price" isClearable styles={selectStyles}
                /> */}
                <div className="siw-price-sort-pair">
                  <button
                    className={`siw-sort-btn ${advFilters.purchase_price_sort === 'asc' ? 'asc-active' : ''}`}
                    onClick={() => handleAdvChange('purchase_price_sort', advFilters.purchase_price_sort === 'asc' ? 'none' : 'asc')}
                  >
                    <i className="fas fa-sort-amount-up-alt"></i> Low → High
                  </button>
                  <button
                    className={`siw-sort-btn ${advFilters.purchase_price_sort === 'desc' ? 'desc-active' : ''}`}
                    onClick={() => handleAdvChange('purchase_price_sort', advFilters.purchase_price_sort === 'desc' ? 'none' : 'desc')}
                  >
                    <i className="fas fa-sort-amount-down"></i> High → Low
                  </button>
                </div>
              </div>
 <div className="siw-adv-field">
                <label>Sale Price / Unit</label>
                {/* <Select
                  value={advFilters.adv_sale_price !== null ? advSalePriceOptions.find(o=>o.value===advFilters.adv_sale_price) : null}
                  options={advSalePriceOptions}
                  onChange={sel => handleAdvChange('adv_sale_price', sel?.value ?? null)}
                  placeholder="Any sale price" isClearable styles={selectStyles}
                /> */}
                <div className="siw-price-sort-pair">
                  <button
                    className={`siw-sort-btn ${advFilters.sale_price_sort === 'asc' ? 'asc-active' : ''}`}
                    onClick={() => handleAdvChange('sale_price_sort', advFilters.sale_price_sort === 'asc' ? 'none' : 'asc')}
                  >
                    <i className="fas fa-sort-amount-up-alt"></i> Low → High
                  </button>
                  <button
                    className={`siw-sort-btn ${advFilters.sale_price_sort === 'desc' ? 'desc-active' : ''}`}
                    onClick={() => handleAdvChange('sale_price_sort', advFilters.sale_price_sort === 'desc' ? 'none' : 'desc')}
                  >
                    <i className="fas fa-sort-amount-down"></i> High → Low
                  </button>
                </div>
              </div>


                 {/* <div className="siw-adv-field">
                <label>From Date</label>
                <DatePicker selected={advFilters.adv_from_date} onChange={d=>handleAdvChange('adv_from_date',d)}
                  dateFormat="dd-MM-yyyy" placeholderText="Refine from" maxDate={advFilters.adv_to_date||new Date()} isClearable />
              </div>
              <div className="siw-adv-field">
                <label>To Date</label>
                <DatePicker selected={advFilters.adv_to_date} onChange={d=>handleAdvChange('adv_to_date',d)}
                  minDate={advFilters.adv_from_date} dateFormat="dd-MM-yyyy" placeholderText="Refine to" maxDate={new Date()} isClearable />
              </div> */}



              {/* <div className="siw-adv-field">
                <label>Sort By</label>
                <select className={`siw-adv-select-native ${advFilters.sort_by!=='default'?'sort-active':''}`}
                  value={advFilters.sort_by} onChange={e=>handleAdvChange('sort_by',e.target.value)}>
                  <option value="default">Default (ID order)</option>
                  <option value="qty">Quantity</option>
                  <option value="sale">Total Sale</option>
                  <option value="purchase">Total Purchase</option>
                  <option value="profit">Profit</option>
                </select>
              </div> */}
              {/* <div className="siw-adv-field">
                <label>Sort Direction</label>
                <select className="siw-adv-select-native" value={advFilters.sort_dir}
                  onChange={e=>handleAdvChange('sort_dir',e.target.value)}>
                  <option value="desc">Highest first ↓</option>
                  <option value="asc">Lowest first ↑</option>
                </select>
              </div> */}

              {/* ── Price Filters ── */}
              {/* <div className="siw-adv-section-label"><i className="fas fa-tag" style={{marginRight:5}}></i>Price Filter &amp; Sort</div> */}

              {/* Purchase Price */}
             

              {/* Sale Price */}
             

              {/* ── Date Refine ── */}
              {/* <div className="siw-adv-section-label"><i className="fas fa-calendar-alt" style={{marginRight:5}}></i>Refine Date Range</div> */}

           

              {/* ── Quantity ── */}
              {/* <div className="siw-adv-section-label"><i className="fas fa-boxes" style={{marginRight:5}}></i>Quantity Range</div> */}

              {/* <div className="siw-adv-field">
                <label>Min Qty</label>
                <input type="number" className="siw-adv-input" placeholder="0"
                  value={advFilters.min_qty} onChange={e=>handleAdvChange('min_qty',e.target.value)} min="0" />
              </div>
              <div className="siw-adv-field">
                <label>Max Qty</label>
                <input type="number" className="siw-adv-input" placeholder="∞"
                  value={advFilters.max_qty} onChange={e=>handleAdvChange('max_qty',e.target.value)} min="0" />
              </div> */}

              {/* ── Profit ── */}
              {/* <div className="siw-adv-section-label"><i className="fas fa-chart-line" style={{marginRight:5}}></i>Profit</div> */}

              {/* <div className="siw-adv-field">
                <label>Profit Sign</label>
                <select className="siw-adv-select-native" value={advFilters.profit_sign}
                  onChange={e=>handleAdvChange('profit_sign',e.target.value)}>
                  <option value="all">All</option>
                  <option value="positive">Profitable only ✅</option>
                  <option value="negative">Loss only ❌</option>
                </select>
              </div> */}
              {/* <div className="siw-adv-field">
                <label>Min Profit (Rs)</label>
                <input type="number" className="siw-adv-input" placeholder="e.g. 0"
                  value={advFilters.min_profit} onChange={e=>handleAdvChange('min_profit',e.target.value)} />
              </div>
              <div className="siw-adv-field">
                <label>Max Profit (Rs)</label>
                <input type="number" className="siw-adv-input" placeholder="e.g. 5000"
                  value={advFilters.max_profit} onChange={e=>handleAdvChange('max_profit',e.target.value)} />
              </div> */}

              {/* ── General Sort ── */}
              {/* <div className="siw-adv-section-label"><i className="fas fa-sort" style={{marginRight:5}}></i>General Sort</div> */}

              

            </div>

            <div className="siw-adv-actions">
              {hasAdvActive && (
                <button className="siw-adv-reset" onClick={handleResetAdvanced}>
                  <i className="fas fa-times"></i> Clear Advanced Filters
                </button>
              )}
              <span className="siw-active-count">
                Showing {filteredReport.length} of {incomeReport.length} records
              </span>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="siw-table-section">
          <div className="siw-table-card">
            <div className="siw-table-head-bar">
              <h4><i className="fas fa-table" style={{marginRight:7,color:'#7c3aed'}}></i>Detail Records</h4>
              {isLoading && <span className="siw-loading-badge"><i className="fas fa-spinner fa-spin"></i> Loading…</span>}
            </div>

            <div className="siw-tbl-wrap">
              <table className="siw-tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Item</th>
                    <th>Supplier</th>
                    <th>Rack</th>
                    <th className="r">Qty</th>
                    <th className="r">Purchase/Unit <PurchaseSortIcon /></th>
                    <th className="r">Total Purchase</th>
                    <th className="r">Sale/Unit <SaleSortIcon /></th>
                    <th className="r">Total Sale</th>
                    <th className="r">Profit</th>
                    {hasActions && <th style={{textAlign:'center'}}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredReport.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan}>
                        <div className="siw-empty">
                          <i className={incomeReport.length === 0 ? 'fas fa-search' : 'fas fa-filter'}></i>
                          <p>{incomeReport.length === 0 ? 'Select filters and click Generate Report' : 'No records match your filters'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReport.map((row, idx) => {
                      const qty       = parseFloat(row.quantity) || 0;
                      const purUnit   = parseFloat(row.purchase_rate_calculate_per_tablet) || 0;
                      const purTotal  = purUnit * qty;
                      const saleUnit  = parseFloat(row.price) || 0;
                      const saleTotal = saleUnit * qty;
                      const rowProfit = saleTotal - purTotal;
                      return (
                        <tr key={`${row.invoice_no}-${row.item_id}-${idx}`}>
                          <td style={{color:'#a78bfa',fontWeight:600,fontSize:'.75rem'}}>{idx+1}</td>
                          <td>
                            {ViewInvoice ? (
                              <button className="siw-inv-link" onClick={() => ViewInvoice(row.invoice_no)}>
                                <i className="fas fa-file-invoice" style={{marginRight:4}}></i>{row.invoice_no}
                              </button>
                            ) : (
                              <span className="siw-inv-badge">{row.invoice_no}</span>
                            )}
                          </td>
                          <td style={{whiteSpace:'nowrap'}}>{row.stock_date}</td>
                          <td style={{fontWeight:500}}>{row.item_name}</td>
                          <td>
                            {row.supplier_name
                              ? <span className="siw-supplier-tag">{row.supplier_name}</span>
                              : <span style={{color:'#d1d5db',fontSize:'.75rem'}}>—</span>}
                          </td>
                          <td>{row.rack_no || '—'}</td>
                          <td className="r">{qty}</td>
                          <td className="r">{purUnit.toFixed(2)}</td>
                          <td className="r">{purTotal.toFixed(2)}</td>
                          <td className="r">{saleUnit.toFixed(2)}</td>
                          <td className="r">{saleTotal.toFixed(2)}</td>
                          <td className={`r ${rowProfit >= 0 ? 'siw-profit-pos' : 'siw-profit-neg'}`}>
                            {rowProfit.toFixed(2)}
                          </td>
                          {hasActions && (
                            <td style={{textAlign:'center',whiteSpace:'nowrap'}}>
                              {ViewInvoice && (
                                <button className="sl-btn sl-btn-view" onClick={() => ViewInvoice(row.invoice_no)}>
                                  <i className="fas fa-eye"></i> View
                                </button>
                              )}
                              {editInvoice && (
                                <button className="sl-btn sl-btn-edit" style={{marginLeft:4}} onClick={() => editInvoice(row.invoice_no)}>
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredReport.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan="6" style={{fontWeight:700}}>Grand Total</td>
                      <td className="r">{grandTotalQty.toFixed(0)}</td>
                      <td className="r">—</td>
                      <td className="r">{grandTotalPurchasePrice.toFixed(2)}</td>
                      <td className="r">—</td>
                      <td className="r">{grandTotalSaleAmt.toFixed(2)}</td>
                      <td className={`r ${grandTotalProfit >= 0 ? 'siw-profit-pos' : 'siw-profit-neg'}`}>
                        {grandTotalProfit.toFixed(2)}
                      </td>
                      {hasActions && <td></td>}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default StockItemWiseDetailReport;