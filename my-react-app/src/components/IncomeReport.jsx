// // import React, { useState } from "react";
// // import axios from "axios";
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";
// // import { format } from "date-fns";
// // import { useEffect } from "react";
// // import Select from "react-select";

// // const IncomeReport = () => {
// //   const [incomeReport, setIncomeReport] = useState([]);
// //   const [groupedReport, setGroupedReport] = useState([]);
// //   const [summary, setSummary] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [medicineType, setMedicineType] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);

// //   const [totalRebate, setTotalRebate] = useState(0);

// //   const [totalExpense, setTotalExpense] = useState(0);


// //   const [formData, setFormData] = useState({
// //     from_date: null,
// //     to_date: null,
// //     supplier_id_for_report: "",
// //   });

// //   const [getAllSupplier, setAllSupplier] = useState([]);
// //   const [expandedItems, setExpandedItems] = useState({});

// //   const fetchInvoiceData = async (from_date, to_date, shouldLoad = true) => {
// //     if (shouldLoad) setIsLoading(true);

// //     try {
// //       const response = await axios.get(
// //         `${process.env.REACT_APP_API_URL}/income_report_list`,
// //         {
// //           params: {
// //             from_date: from_date ? format(from_date, "yyyy-MM-dd") : null,
// //             to_date: to_date ? format(to_date, "yyyy-MM-dd") : null,
// //             medicine_type: medicineType,
// //             supplier_id: formData.supplier_id_for_report || "",
// //           },
// //         }
// //       );

// //       const data = response.data.results;
// //       setIncomeReport(data);
// //       groupDataByItem(data);
// //       calculateSummary(data);
// //       setTotalRebate(response.data.total_paid_payments || 0);
// //       setTotalExpense(response.data.total_expense_payments || 0);

// //     } catch (error) {
// //       console.error("Error fetching invoice data", error);
// //     } finally {
// //       if (shouldLoad) setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchSupplier = () => {
// //       axios
// //         .get(process.env.REACT_APP_API_URL + "/get-all-supplier")
// //         .then((res) => {
// //           setAllSupplier(res.data.results);
// //         })
// //         .catch((err) => console.log(err));
// //     };
// //     fetchSupplier();
// //   }, []);

// //   const groupDataByItem = (data) => {
// //     const grouped = data.reduce((acc, item) => {
// //       const quantity = parseFloat(item.quantity) || 0;
// //       const price = parseFloat(item.price_after_discount) || 0;
// //       const purchasePrice =
// //         parseFloat(item.purchase_rate_calculate_per_tablet) * quantity || 0;
// //       const discount = parseFloat(item.discount) || 0;
// //       const total = price * quantity - discount;
// //       const profit = total - purchasePrice;

// //       const itemKey = `${item.item_id}-${item.item_name}`;

// //       if (!acc[itemKey]) {
// //         acc[itemKey] = {
// //           item_id: item.item_id,
// //           item_name: item.item_name,
// //           medicine_type: item.medicine_type,
// //           quantity: 0,
// //           total_sale: 0,
// //           total_purchase: 0,
// //           total_discount: 0,
// //           total_profit: 0,
// //           transactions: [],
// //         };
// //       }

// //       acc[itemKey].quantity += quantity;
// //       acc[itemKey].total_sale += total;
// //       acc[itemKey].total_purchase += purchasePrice;
// //       acc[itemKey].total_discount += discount;
// //       acc[itemKey].total_profit += profit;
// //       acc[itemKey].transactions.push(item);

// //       return acc;
// //     }, {});

// //     const groupedArray = Object.values(grouped);
// //     groupedArray.sort((a, b) => a.item_name.localeCompare(b.item_name));

// //     setGroupedReport(groupedArray);

// //     // Initialize all items as collapsed by default
// //     const initialExpandedState = {};
// //     groupedArray.forEach((item) => {
// //       const itemKey = `${item.item_id}-${item.item_name}`;
// //       initialExpandedState[itemKey] = false;
// //     });
// //     setExpandedItems(initialExpandedState);
// //   };

// //   const toggleItemExpansion = (itemKey) => {
// //     setExpandedItems((prev) => ({
// //       ...prev,
// //       [itemKey]: !prev[itemKey],
// //     }));
// //   };

// //   const calculateSummary = (data) => {
// //     const summaryData = data.reduce(
// //       (acc, item) => {
// //         const quantity = parseFloat(item.quantity) || 0;
// //         const price = parseFloat(item.price_after_discount) || 0;
// //         const purchasePrice =
// //           parseFloat(item.purchase_rate_calculate_per_tablet) * quantity || 0;
// //         const discount = parseFloat(item.discount) || 0;
// //         const total = price * quantity - discount;
// //         const profit = total - purchasePrice;

// //         return {
// //           totalRevenue: acc.totalRevenue + total,
// //           totalCOGS: acc.totalCOGS + purchasePrice,
// //           totalItemsSold: acc.totalItemsSold + quantity,
// //           totalDiscount: acc.totalDiscount + discount,
// //           grossProfit: acc.grossProfit + profit,
// //         };
// //       },
// //       {
// //         totalRevenue: 0,
// //         totalCOGS: 0,
// //         totalItemsSold: 0,
// //         totalDiscount: 0,
// //         grossProfit: 0,
// //       }
// //     );

// //     const grossMargin =
// //       summaryData.totalRevenue > 0
// //         ? (summaryData.grossProfit / summaryData.totalRevenue) * 100
// //         : 0;

// //     setSummary({
// //       ...summaryData,
// //       grossMargin,
// //     });
// //   };

// //   const handleDateChangeForReport = (field, date) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       [field]: date,
// //     }));
// //   };

// //   const handleGenerateReport = () => {
// //     if (formData.from_date && formData.to_date) {
// //       fetchInvoiceData(formData.from_date, formData.to_date, false);
// //     }
// //   };

// //   const handleResetDates = () => {
// //     setFormData({
// //       from_date: null,
// //       to_date: null,
// //     });
// //     setIncomeReport([]);
// //     setGroupedReport([]);
// //     setSummary(null);
// //     setSearchTerm("");
// //     setExpandedItems({});
// //   };

// //   const calculateGrandTotal = () => {
// //     return groupedReport.reduce(
// //       (acc, item) => {
// //         return {
// //           grandTotalQty: acc.grandTotalQty + item.quantity,
// //           grandTotalSalePrice: acc.grandTotalSalePrice + item.total_sale,
// //           grandTotalPurchasePrice:
// //             acc.grandTotalPurchasePrice + item.total_purchase,
// //           grandTotalDiscount: acc.grandTotalDiscount + item.total_discount,
// //           grandTotalTotal: acc.grandTotalTotal + item.total_sale,
// //           grandTotalProfit: acc.grandTotalProfit + item.total_profit,
// //         };
// //       },
// //       {
// //         grandTotalQty: 0,
// //         grandTotalSalePrice: 0,
// //         grandTotalPurchasePrice: 0,
// //         grandTotalDiscount: 0,
// //         grandTotalTotal: 0,
// //         grandTotalProfit: 0,
// //       }
// //     );
// //   };

// //   const {
// //     grandTotalQty,
// //     grandTotalSalePrice,
// //     grandTotalPurchasePrice,
// //     grandTotalDiscount,
// //     grandTotalTotal,
// //     grandTotalProfit,
// //   } = calculateGrandTotal();

// //   const handleSearchChange = (event) => {
// //     const term = event.target.value.toLowerCase();
// //     setSearchTerm(term);

// //     if (term === "") {
// //       groupDataByItem(incomeReport);
// //       calculateSummary(incomeReport);
// //       return;
// //     }

// //     const filteredData = incomeReport.filter((item) => {
// //       return (
// //         item.invoice_no?.toString().includes(term) ||
// //         item.item_name?.toLowerCase().includes(term) ||
// //         item.invoice_date?.toString().includes(term)
// //       );
// //     });

// //     groupDataByItem(filteredData);
// //     calculateSummary(filteredData);
// //   };

// //   return (
// //     <div className="w-100 mt-4">
// //       <div className="d-flex justify-content-center">
// //         <div className="col-md-2">
// //           <div className="form-group report_date">
// //             <DatePicker
// //               id="fromDate"
// //               selected={formData.from_date}
// //               onChange={(date) => handleDateChangeForReport("from_date", date)}
// //               selectsStart
// //               startDate={formData.from_date}
// //               endDate={formData.to_date}
// //               dateFormat="dd-MM-yyyy"
// //               className="form-control"
// //               placeholderText="Select From Date"
// //               maxDate={formData.to_date || new Date()}
// //               isClearable
// //             />
// //           </div>
// //         </div>

// //         <div className="col-md-2">
// //           <div className="form-group report_date">
// //             <DatePicker
// //               id="toDate"
// //               selected={formData.to_date}
// //               onChange={(date) => handleDateChangeForReport("to_date", date)}
// //               selectsEnd
// //               startDate={formData.from_date}
// //               endDate={formData.to_date}
// //               minDate={formData.from_date}
// //               dateFormat="dd-MM-yyyy"
// //               className="form-control"
// //               placeholderText="Select To Date"
// //               maxDate={new Date()}
// //               isClearable
// //             />
// //           </div>
// //         </div>

// //         <div className="col-sm-3">
// //           <select
// //             name="medicine_type"
// //             id="medicine_type"
// //             className="form-control"
// //             value={medicineType || ""}
// //             onChange={(e) => setMedicineType(e.target.value)}
// //           >
// //             <option value="">Select Item Type</option>
// //             <option value="other">Other</option>
// //             <option value="drum">Drum</option>
// //           </select>
// //         </div>

// //         <div className="col-sm-3">
// //           <Select
// //             id="supplier_id_for_report"
// //             name="supplier_id_for_report"
// //             value={
// //               formData.supplier_id_for_report
// //                 ? {
// //                     value: formData.supplier_id_for_report,
// //                     label: formData.full_name,
// //                   }
// //                 : null
// //             }
// //             options={[
// //               { value: "", label: "Select Supplier" },
// //               ...getAllSupplier.map((supplier) => ({
// //                 value: supplier.id,
// //                 label: supplier.full_name,
// //               })),
// //             ]}
// //             onChange={(selectedOption) => {
// //               setFormData({
// //                 ...formData,
// //                 supplier_id_for_report: selectedOption.value,
// //                 full_name: selectedOption.label,
// //               });
// //             }}
// //             placeholder="Select Supplier"
// //           />
// //         </div>


// //         <div className="col-md-2">
// //           <input
// //             type="text"
// //             className="form-control"
// //             placeholder="Search by Item Name"
// //             value={searchTerm}
// //             onChange={handleSearchChange}
// //             disabled={isLoading || incomeReport.length === 0}
// //           />
// //         </div>

        
// //       </div>

// //       <div className="d-flex justify-content-center mb-2">
// //         <div>
// //           <button
// //             className="btn btn-primary"
// //             onClick={handleGenerateReport}
// //             disabled={!formData.from_date || !formData.to_date}
// //           >
// //             <i className="fas fa-search"></i> Report
// //           </button>

// //           <button
// //             className="btn btn-outline-secondary ml-2"
// //             onClick={handleResetDates}
// //           >
// //             <i className="fas fa-undo"></i> Reset
// //           </button>
// //         </div>
// //       </div>

// //       {isLoading && (
// //         <div className="text-center my-4">
// //           <div className="spinner-border text-primary" role="status">
// //             <span className="visually-hidden">Loading...</span>
// //           </div>
// //         </div>
// //       )}

// //       {summary && !isLoading && (
// //         <div className="card mb-4">
// //           <div className="card-header bg-primary text-white">
// //             <h5 className="mb-0">Profit & Loss Summary</h5>
// //           </div>
// //           <div className="card-body">
// //             <div className="row">
// //               <div className="col-md-6">
// //                 <table className="table table-bordered">
// //                   <tbody>
// //                     <tr>
// //                       <th>Total Revenue</th>
// //                       <td className="text-end">
// //                         {summary.totalRevenue.toFixed(2)}
// //                       </td>
// //                     </tr>
// //                     <tr>
// //                       <th>Total COGS</th>
// //                       <td className="text-end">
// //                         {summary.totalCOGS.toFixed(2)}
// //                       </td>
// //                     </tr>
// //                     <tr className="table-success">
// //                       <th>Gross Profit</th>
// //                       <td className="text-end">
// //                         {summary.grossProfit.toFixed(2)}
// //                       </td>
// //                     </tr>
// //                     <tr>
// //                       <th>Gross Margin</th>
// //                       <td className="text-end">
// //                         {summary.grossMargin.toFixed(2)}%
// //                       </td>
// //                     </tr>
// //                   </tbody>
// //                 </table>
// //               </div>
// //               <div className="col-md-6">
// //                 <table className="table table-bordered">
// //                   <tbody>
// //                     <tr>
// //                       <th>Total Items Sold</th>
// //                       <td className="text-end">{summary.totalItemsSold}</td>
// //                     </tr>
// //                     <tr>
// //                       <th>Total Discount</th>
// //                       <td className="text-end">
// //                         {summary.totalDiscount.toFixed(2)}
// //                       </td>
// //                     </tr>
// //                     <tr>
// //                       <th>Date Range</th>
// //                       <td className="text-end">
// //                         {formData.from_date &&
// //                           format(formData.from_date, "dd-MM-yyyy")}{" "}
// //                         to{" "}
// //                         {formData.to_date &&
// //                           format(formData.to_date, "dd-MM-yyyy")}
// //                       </td>
// //                     </tr>
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <div className="row justify-content-center mb-3"></div>

// //       <div className="card">
// //         <div className="card-header bg-primary text-white">
// //           <h5 className="mb-0">Detailed Sales Report</h5>
// //         </div>
// //         <div className="card-body">
// //           <div className="table-responsive">
// //             <table className="table table-striped table-hover">
// //               <thead>
// //                 <tr>
// //                   <th style={{ width: "30%" }}>Item</th>
// //                   <th className="text-end">Type</th>
// //                   <th className="text-end">Total Qty</th>
// //                   <th className="text-end">Total Sale</th>
// //                   <th className="text-end">COGS</th>
// //                   <th className="text-end">Profit</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {groupedReport.length === 0 ? (
// //                   <tr>
// //                     <td colSpan="6" className="text-center text-muted py-4">
// //                       {incomeReport.length === 0
// //                         ? "Please select date range and generate report"
// //                         : "No matching records found"}
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   groupedReport.map((item) => {
// //                     const itemKey = `${item.item_id}-${item.item_name}`;
// //                     const isExpanded = expandedItems[itemKey];

// //                     return (
// //                       <React.Fragment key={itemKey}>
// //                         <tr className="item-row">
// //                           <td>
// //                             <button
// //                               className="btn btn-sm btn-outline-primary me-2"
// //                               onClick={() => toggleItemExpansion(itemKey)}
// //                               style={{ width: "30px", marginRight: "10px" }}
// //                             >
// //                               {isExpanded ? "-" : "+"}
// //                             </button>
// //                             <strong>{item.item_name}</strong>
// //                           </td>
// //                           <td
// //                             className="text-end"
// //                             style={{ textTransform: "capitalize" }}
// //                           >
// //                             {item.medicine_type}
// //                           </td>
// //                           <td className="text-end">{item.quantity}</td>
// //                           <td className="text-end">
// //                             {item.total_sale.toFixed(2)}
// //                           </td>
// //                           <td className="text-end">
// //                             {item.total_purchase.toFixed(2)}
// //                           </td>
// //                           <td
// //                             className={`text-end ${
// //                               item.total_profit >= 0
// //                                 ? "text-success"
// //                                 : "text-danger"
// //                             }`}
// //                           >
// //                             {item.total_profit.toFixed(2)}
// //                           </td>
// //                         </tr>
// //                         {isExpanded &&
// //                           item.transactions.map((transaction, idx) => {
// //                             const quantity =
// //                               parseFloat(transaction.quantity) || 0;
// //                             const price =
// //                               parseFloat(transaction.price_after_discount) || 0;
// //                             const purchasePrice =
// //                               parseFloat(
// //                                 transaction.purchase_rate_calculate_per_tablet
// //                               ) * quantity || 0;
// //                             const discount =
// //                               parseFloat(transaction.discount) || 0;
// //                             const total = price * quantity - discount;
// //                             const profit = total - purchasePrice;

// //                             return (
// //                               <tr
// //                                 key={`${transaction.invoice_no}-${idx}`}
// //                                 className="transaction-row"
// //                               >
// //                                 <td className="ps-5">
// //                                   <small>
// //                                     Invoice #{transaction.invoice_no} -{" "}
// //                                     {transaction.invoice_date}
// //                                   </small>
// //                                 </td>
// //                                 <td></td>
// //                                 <td className="text-end">
// //                                   <small>{quantity}</small>
// //                                 </td>
// //                                 <td className="text-end">
// //                                   <small>{total.toFixed(2)}</small>
// //                                 </td>
// //                                 <td className="text-end">
// //                                   <small>{purchasePrice.toFixed(2)}</small>
// //                                 </td>
// //                                 <td
// //                                   className={`text-end ${
// //                                     profit >= 0 ? "text-success" : "text-danger"
// //                                   }`}
// //                                 >
// //                                   <small>{profit.toFixed(2)}</small>
// //                                 </td>
// //                               </tr>
// //                             );
// //                           })}
// //                       </React.Fragment>
// //                     );
// //                   })
// //                 )}
// //               </tbody>
// //               {groupedReport.length > 0 && (
// //                 <tfoot>
// //                   <tr className="table-active">
// //                     <th>Total Income</th>
// //                     <th></th>
// //                     <th className="text-end">{grandTotalQty}</th>
// //                     <th className="text-end">{grandTotalTotal.toFixed(2)}</th>
// //                     <th className="text-end">
// //                       {grandTotalPurchasePrice.toFixed(2)}
// //                     </th>
// //                     <th
// //                       className={`text-end ${
// //                         grandTotalProfit >= 0 ? "text-success" : "text-danger"
// //                       }`}
// //                     >
// //                       {grandTotalProfit.toFixed(2)}
// //                     </th>
// //                   </tr>


// //                   <tr className="table-active">
// //                     <th>Rebate</th>
// //                     <th></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-success">
// //                       {totalRebate.toFixed(2)}
// //                     </th>
// //                   </tr>
                

// //                   <tr className="table-active">
// //                     <th>Grand Total Income</th>
// //                     <th></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-success">
// //                       {(grandTotalProfit + totalRebate).toFixed(2)}
// //                     </th>
// //                   </tr>

// //                      <tr className="table-active">
// //                     <th className="text-danger">Expense</th>
// //                     <th></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-success">
// //                       {totalExpense.toFixed(2)}
// //                     </th>
// //                   </tr>


// //                     <tr className="table-active">
// //                     <th className="text-success">Actual Income (After Subtraction of Expense)</th>
// //                     <th></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-end"></th>
// //                     <th className="text-success">
// //                       {((grandTotalProfit + totalRebate) - totalExpense).toFixed(2)}
// //                     </th>
// //                   </tr>
// //                 </tfoot>
// //               )}
// //             </table>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default IncomeReport;



// import React, { useState } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import { useEffect } from "react";
// import Select from "react-select";

// const IncomeReport = () => {
//   const [incomeReport, setIncomeReport] = useState([]);
//   const [groupedReport, setGroupedReport] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [medicineType, setMedicineType] = useState("");

//   const [previousRemainingAmount, getPreviousRemainingAmount] = useState(0);

//     const [actualremainingAmount, getActualRemainingAmount] = useState(0);


//   const [isLoading, setIsLoading] = useState(false);

//   const [totalRebate, setTotalRebate] = useState(0);

//   const [totalExpense, setTotalExpense] = useState(0);

//   const [totalCommissionPaid, setTotalCommission] = useState(0);

//   const [totalSalaryPaid, setTotalSalaryPaid] = useState(0);


//   const [formData, setFormData] = useState({
//     from_date: null,
//     to_date: null,
//     supplier_id_for_report: "",
//   });

//   const [getAllSupplier, setAllSupplier] = useState([]);
//   const [expandedItems, setExpandedItems] = useState({});


//   const calculateActualRemainingAmount = (data) => {
//   // Group by invoice_no and get unique remaining amounts
//   const invoiceMap = new Map();
  
//   data.forEach(item => {
//     if (!invoiceMap.has(item.invoice_no)) {
//       invoiceMap.set(item.invoice_no, {
//         remaining_amount: parseFloat(item.remaining_amount) || 0,
//         grand_total: parseFloat(item.grand_total) || 0
//       });
//     }
//   });
  
//   // Sum up unique remaining amounts
//   let totalRemaining = 0;
//   invoiceMap.forEach(invoice => {
//     totalRemaining += invoice.remaining_amount;
//   });
  
//   return totalRemaining;
// };


//   const fetchInvoiceData = async (from_date, to_date, shouldLoad = true) => {
//     if (shouldLoad) setIsLoading(true);

//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/income_report_list`,
//         {
//           params: {
//             from_date: from_date ? format(from_date, "yyyy-MM-dd") : null,
//             to_date: to_date ? format(to_date, "yyyy-MM-dd") : null,
//             medicine_type: medicineType,
//             supplier_id: formData.supplier_id_for_report || "",
//           },
//         }
//       );

//       const data = response.data.results;
//       setIncomeReport(data);
//       groupDataByItem(data);
//       calculateSummary(data);
//       setTotalRebate(response.data.total_paid_payments || 0);
//       setTotalExpense(response.data.total_expense_payments || 0);
//       setTotalCommission(response.data.total_commission_payments || 0);
//       setTotalSalaryPaid(response.data.total_salary_payments || 0);
//       getPreviousRemainingAmount(response.data.additional_payments_in_period);

//          const actualRemaining = calculateActualRemainingAmount(data);
//     getActualRemainingAmount(actualRemaining);

//     } catch (error) {
//       console.error("Error fetching invoice data", error);
//     } finally {
//       if (shouldLoad) setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchSupplier = () => {
//       axios
//         .get(process.env.REACT_APP_API_URL + "/get-all-supplier")
//         .then((res) => {
//           setAllSupplier(res.data.results);
//         })
//         .catch((err) => console.log(err));
//     };
//     fetchSupplier();
//   }, []);

//   const groupDataByItem = (data) => {
//     const grouped = data.reduce((acc, item) => {
//       const quantity = parseFloat(item.quantity) || 0;
//       const price = parseFloat(item.price_after_discount) || 0;
//       const purchasePrice = (item.item_stock_type == 'Stock Item' 
//   ? parseFloat(item.purchase_rate_calculate_per_tablet) * quantity 
//   : item.purchase_price_non_stock * quantity) || 0;
//       const discount = parseFloat(item.discount) || 0;
//       const total = (parseFloat(item.price) * parseFloat(item.quantity)) - parseFloat(item.discount);
//       const profit = total - purchasePrice;

//       // console.log(item.item_name, item.price, item.quantity, item.discount, total)

//       const itemKey = `${item.item_id}-${item.item_name}`;

//       if (!acc[itemKey]) {
//         acc[itemKey] = {
//           item_id: item.item_id,
//           item_name: item.item_name,
//           medicine_type: item.medicine_type,
//           quantity: 0,
//           total_sale: 0,
//           total_purchase: 0,
//           total_discount: 0,
//           total_profit: 0,
//           transactions: [],
//         };
//       }

//       acc[itemKey].quantity += quantity;
//       acc[itemKey].total_sale += total;
//       acc[itemKey].total_purchase += purchasePrice;
//       acc[itemKey].total_discount += discount;
//       acc[itemKey].total_profit += profit;
//       acc[itemKey].transactions.push(item);

//       return acc;
//     }, {});

//     const groupedArray = Object.values(grouped);
//     groupedArray.sort((a, b) => a.item_name.localeCompare(b.item_name));

//     setGroupedReport(groupedArray);

//     // Initialize all items as collapsed by default
//     const initialExpandedState = {};
//     groupedArray.forEach((item) => {
//       const itemKey = `${item.item_id}-${item.item_name}`;
//       initialExpandedState[itemKey] = false;
//     });
//     setExpandedItems(initialExpandedState);
//   };

//   const toggleItemExpansion = (itemKey) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [itemKey]: !prev[itemKey],
//     }));
//   };

//   const calculateSummary = (data) => {
//     const summaryData = data.reduce(
//       (acc, item) => {
//         const quantity = parseFloat(item.quantity) || 0;
//         const price = parseFloat(item.price_after_discount) || 0;
//         const purchasePrice =
//           parseFloat(item.purchase_rate_calculate_per_tablet) * quantity || 0;
//         const discount = parseFloat(item.discount) || 0;
//         const total = (parseFloat(item.price) * parseFloat(item.quantity)) - parseFloat(item.discount);
//         const profit = total - purchasePrice;

//         return {
//           totalRevenue: acc.totalRevenue + total,
//           totalCOGS: acc.totalCOGS + purchasePrice,
//           totalItemsSold: acc.totalItemsSold + quantity,
//           totalDiscount: acc.totalDiscount + discount,
//           grossProfit: acc.grossProfit + profit,
//         };
//       },
//       {
//         totalRevenue: 0,
//         totalCOGS: 0,
//         totalItemsSold: 0,
//         totalDiscount: 0,
//         grossProfit: 0,
//       }
//     );

//     const grossMargin =
//       summaryData.totalRevenue > 0
//         ? (summaryData.grossProfit / summaryData.totalRevenue) * 100
//         : 0;

//     setSummary({
//       ...summaryData,
//       grossMargin,
//     });
//   };

//   const handleDateChangeForReport = (field, date) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: date,
//     }));
//   };

//   const handleGenerateReport = () => {
//     if (formData.from_date && formData.to_date) {
//       fetchInvoiceData(formData.from_date, formData.to_date, false);
//     }
//   };

//   const handleResetDates = () => {
//     setFormData({
//       from_date: null,
//       to_date: null,
//     });
//     setIncomeReport([]);
//     setGroupedReport([]);
//     setSummary(null);
//     setSearchTerm("");
//     setExpandedItems({});
//   };

//   const calculateGrandTotal = () => {
//     return groupedReport.reduce(
//       (acc, item) => {
//         return {
//           grandTotalQty: acc.grandTotalQty + item.quantity,
//           grandTotalSalePrice: acc.grandTotalSalePrice + item.total_sale,
//           grandTotalPurchasePrice:
//             acc.grandTotalPurchasePrice + item.total_purchase,
//           grandTotalDiscount: acc.grandTotalDiscount + item.total_discount,
//           grandTotalTotal: acc.grandTotalTotal + item.total_sale,
//           grandTotalProfit: acc.grandTotalProfit + item.total_profit,
//         };
//       },
//       {
//         grandTotalQty: 0,
//         grandTotalSalePrice: 0,
//         grandTotalPurchasePrice: 0,
//         grandTotalDiscount: 0,
//         grandTotalTotal: 0,
//         grandTotalProfit: 0,
//       }
//     );
//   };

//   const {
//     grandTotalQty,
//     grandTotalSalePrice,
//     grandTotalPurchasePrice,
//     grandTotalDiscount,
//     grandTotalTotal,
//     grandTotalProfit,
//   } = calculateGrandTotal();

//   const handleSearchChange = (event) => {
//     const term = event.target.value.toLowerCase();
//     setSearchTerm(term);

//     if (term === "") {
//       groupDataByItem(incomeReport);
//       calculateSummary(incomeReport);
//       return;
//     }

//     const filteredData = incomeReport.filter((item) => {
//       return (
//         item.invoice_no?.toString().includes(term) ||
//         item.item_name?.toLowerCase().includes(term) ||
//         item.invoice_date?.toString().includes(term)
//       );
//     });

//     groupDataByItem(filteredData);
//     calculateSummary(filteredData);
//   };



//   return (
//     <div className="w-100">
//       <div className="d-flex justify-content-center">
//         <div className="col-md-2">
//           <div className="form-group report_date">
//             <DatePicker
//               id="fromDate"
//               selected={formData.from_date}
//               onChange={(date) => handleDateChangeForReport("from_date", date)}
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

//         <div className="col-md-2">
//           <div className="form-group report_date">
//             <DatePicker
//               id="toDate"
//               selected={formData.to_date}
//               onChange={(date) => handleDateChangeForReport("to_date", date)}
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

//         <div className="col-sm-3 d-none">
//           <select
//             name="medicine_type"
//             id="medicine_type"
//             className="form-control"
//             value={medicineType || ""}
//             onChange={(e) => setMedicineType(e.target.value)}
//           >
//             <option value="">Select Item Type</option>
//             <option value="other">Other</option>
//             <option value="drum">Drum</option>
//           </select>
//         </div>

//         <div className="col-sm-3 d-none">
//           <Select
//             id="supplier_id_for_report"
//             name="supplier_id_for_report"
//             value={
//               formData.supplier_id_for_report
//                 ? {
//                     value: formData.supplier_id_for_report,
//                     label: formData.full_name,
//                   }
//                 : null
//             }
//             options={[
//               { value: "", label: "Select Supplier" },
//               ...getAllSupplier.map((supplier) => ({
//                 value: supplier.id,
//                 label: supplier.full_name,
//               })),
//             ]}
//             onChange={(selectedOption) => {
//               setFormData({
//                 ...formData,
//                 supplier_id_for_report: selectedOption.value,
//                 full_name: selectedOption.label,
//               });
//             }}
//             placeholder="Select Supplier"
//           />
//         </div>


//         <div className="col-md-2">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search by Item Name"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             disabled={isLoading || incomeReport.length === 0}
//           />
//         </div>
// <div>
//           <button
//             className="btn btn-primary"
//             onClick={handleGenerateReport}
//             disabled={!formData.from_date || !formData.to_date}
//           >
//             <i className="fas fa-search"></i> Report
//           </button>

//           <button
//             className="btn btn-outline-secondary ml-2"
//             onClick={handleResetDates}
//           >
//             <i className="fas fa-undo"></i> Reset
//           </button>
//         </div>
        
//       </div>

//       {/* <div className="d-flex justify-content-center mb-2">
//         <div>
//           <button
//             className="btn btn-primary"
//             onClick={handleGenerateReport}
//             disabled={!formData.from_date || !formData.to_date}
//           >
//             <i className="fas fa-search"></i> Report
//           </button>

//           <button
//             className="btn btn-outline-secondary ml-2"
//             onClick={handleResetDates}
//           >
//             <i className="fas fa-undo"></i> Reset
//           </button>
//         </div>
//       </div> */}

//       {isLoading && (
//         <div className="text-center my-4">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       )}

//       {/* {summary && !isLoading && (
//         <div className="card mb-4">
//           <div className="card-header bg-primary text-white">
//             <h5 className="mb-0">Profit & Loss Summary</h5>
//           </div>
//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <table className="table table-bordered">
//                   <tbody>
//                     <tr>
//                       <th>Total Revenue</th>
//                       <td className="text-end">
//                         {summary.totalRevenue.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>Total COGS</th>
//                       <td className="text-end">
//                         {summary.totalCOGS.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr className="table-success">
//                       <th>Gross Profit</th>
//                       <td className="text-end">
//                         {summary.grossProfit.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>Gross Margin</th>
//                       <td className="text-end">
//                         {summary.grossMargin.toFixed(2)}%
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//               <div className="col-md-6">
//                 <table className="table table-bordered">
//                   <tbody>
//                     <tr>
//                       <th>Total Items Sold</th>
//                       <td className="text-end">{summary.totalItemsSold}</td>
//                     </tr>
//                     <tr>
//                       <th>Total Discount</th>
//                       <td className="text-end">
//                         {summary.totalDiscount.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>Date Range</th>
//                       <td className="text-end">
//                         {formData.from_date &&
//                           format(formData.from_date, "dd-MM-yyyy")}{" "}
//                         to{" "}
//                         {formData.to_date &&
//                           format(formData.to_date, "dd-MM-yyyy")}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       )} */}

//       <div className="row justify-content-center mb-3"></div>

//       <div className="card">
//         {/* <div className="card-header bg-primary text-white">
//           <h5 className="mb-0">Detailed Sales Report</h5>
//         </div> */}
//         {/* <div className="card-body"> */}
//           <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
//             <table className="table table-striped">
//               <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.4)' }}>
//                 <tr>
//                   <th style={{ width: "30%" }}>Item</th>
//                   <th className="text-end">Type</th>
//                   <th className="text-end">Total Qty</th>
//                   <th className="text-end">Total Sale</th>
//                   <th className="text-end">COGS</th>
//                   <th className="text-end">Profit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupedReport.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="text-center text-muted py-4">
//                       {incomeReport.length === 0
//                         ? "Please select date range and generate report"
//                         : "No matching records found"}
//                     </td>
//                   </tr>
//                 ) : (
//                   groupedReport.map((item) => {
//                     const itemKey = `${item.item_id}-${item.item_name}`;
//                     const isExpanded = expandedItems[itemKey];

//                     return (
//                       <React.Fragment key={itemKey}>
//                         <tr className="item-row">
//                           <td>
//                             <button
//                               className="btn btn-sm btn-outline-primary me-2"
//                               onClick={() => toggleItemExpansion(itemKey)}
//                               style={{ width: "30px", marginRight: "10px" }}
//                             >
//                               {isExpanded ? "-" : "+"}
//                             </button>
//                             <strong>{item.item_name}</strong>
//                           </td>
//                           <td
//                             className="text-end"
//                             style={{ textTransform: "capitalize" }}
//                           >
//                             {item.medicine_type}
//                           </td>
//                           <td className="text-end">{item.quantity}</td>
//                           <td className="text-end">
//                             {item.total_sale.toFixed(2)}
//                           </td>
//                           <td className="text-end">
//                             {item.total_purchase.toFixed(2)}
//                           </td>
//                           <td
//                             className={`text-end ${
//                               item.total_profit >= 0
//                                 ? "text-success"
//                                 : "text-danger"
//                             }`}
//                           >
//                             {item.total_profit.toFixed(2)}
//                           </td>
//                         </tr>
//                         {isExpanded &&
//                           item.transactions.map((transaction, idx) => {
//                             const quantity =
//                               parseFloat(transaction.quantity) || 0;
//                             const price =
//                               parseFloat(transaction.price) || 0;
//                             const purchasePrice =
//                               parseFloat(
//                                 transaction.purchase_rate_calculate_per_tablet
//                               ) * quantity || 0;
//                             const discount =
//                               parseFloat(transaction.discount) || 0;
//                             const total = (parseFloat(transaction.price) * parseFloat(transaction.quantity)) - parseFloat(transaction.discount);
//                             const profit = total - purchasePrice;

//                             return (
//                               <tr
//                                 key={`${transaction.invoice_no}-${idx}`}
//                                 className="transaction-row"
//                               >
//                                 <td className="ps-5">
//                                   <small>
//                                     Invoice #{transaction.invoice_no} -{" "}
//                                     {transaction.invoice_date}
//                                   </small>
//                                 </td>
//                                 <td></td>
//                                 <td className="text-end">
//                                   <small>{quantity}</small>
//                                 </td>
//                                 <td className="text-end">
//                                   <small>{total.toFixed(2)}</small>
//                                 </td>
//                                 <td className="text-end">
//                                   <small>{purchasePrice.toFixed(2)}</small>
//                                 </td>
//                                 <td
//                                   className={`text-end ${
//                                     profit >= 0 ? "text-success" : "text-danger"
//                                   }`}
//                                 >
//                                   <small>{profit.toFixed(2)}</small>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                       </React.Fragment>
//                     );
//                   })
//                 )}
//               </tbody>
//               {/* {groupedReport.length > 0 && ( */}
//                 {/* <tfoot>
//                   <tr className="table-active">
//                     <th>Total Income</th>
//                     <th></th>
//                     <th className="text-end">{grandTotalQty}</th>
//                     <th className="text-end">{grandTotalTotal.toFixed(2)}</th>
//                     <th className="text-end">
//                       {grandTotalPurchasePrice.toFixed(2)}
//                     </th>
//                     <th
//                       className={`text-end ${
//                         grandTotalProfit >= 0 ? "text-success" : "text-danger"
//                       }`}
//                     >
//                       {grandTotalProfit.toFixed(2)}
//                     </th>
//                   </tr>

//                   <tr className="table-active">
//                     <th>Total Remaining (Debt)</th>
//                     <th></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-success">
//                       {actualremainingAmount.toFixed(2)}
//                     </th>
//                   </tr>


//                   <tr className="table-active">
//                     <th>Rebate</th>
//                     <th></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-success">
//                       {totalRebate.toFixed(2)}
//                     </th>
//                   </tr>

//                   <tr className="table-active">
//                     <th>Previous Debt Get From Client (Income)</th>
//                     <th></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-success">
//                       {previousRemainingAmount.toFixed(2)}
//                     </th>
//                   </tr>
                

//                   <tr className="table-active">
//                     <th>Grand Total Profit</th>
//                     <th></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-success">
//                       {((grandTotalProfit + totalRebate + previousRemainingAmount) - actualremainingAmount).toFixed(2)}
//                     </th>
//                   </tr>

//                      <tr className="table-active">
//                     <th className="text-danger">Expense</th>
//                     <th></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-success">
//                       {totalExpense.toFixed(2)}
//                     </th>
//                   </tr>


//                     <tr className="table-active">
//                     <th className="text-success" colSpan={2}>Actual Profit (After Subtraction of (Expense + Total Remaining (Debt)))</th>
//                     <th></th> 
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-end"></th>
//                     <th className="text-success">
//                       {(((grandTotalProfit + totalRebate + previousRemainingAmount) - actualremainingAmount) - totalExpense).toFixed(2)}
//                     </th>
//                   </tr>
//                 </tfoot> */}

//                 <tfoot>
//   {/* Section 1: Sales Summary */}
//   <tr className="table-active">
//     <th colSpan="6" className="bg-light">
//       <strong>SALES SUMMARY</strong>
//     </th>
//   </tr>
  
//   <tr className="table-active">
//     <th>Total Sales Income</th>
//     <th></th>
//     <th className="text-end">{grandTotalQty}</th>
//     <th className="text-end">{grandTotalTotal.toFixed(2)}</th>
//     <th className="text-end">{grandTotalPurchasePrice.toFixed(2)}</th>
//     <th className={`text-end ${grandTotalProfit >= 0 ? "text-success" : "text-danger"}`}>
//       {grandTotalProfit.toFixed(2)}
//     </th>
//   </tr>

//   {/* Section 2: Additional Income */}
//   <tr className="table-active">
//     <th colSpan="6" className="bg-light mt-2">
//       <strong>ADDITIONAL INCOME</strong>
//     </th>
//   </tr>

//   <tr className="table-active">
//     <th className="ps-4">+ Rebate Received</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-success text-end">
//       {totalRebate.toFixed(2)}
//     </th>
//   </tr>

//   <tr className="table-active">
//     <th className="ps-4">+ Previous Debt Recovered</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-success text-end">
//       {previousRemainingAmount.toFixed(2)}
//     </th>
//   </tr>

//   {/* Section 3: Deductions */}
//   <tr className="table-active">
//     <th colSpan="6" className="bg-light">
//       <strong>DEDUCTIONS</strong>
//     </th>
//   </tr>

//   <tr className="table-active">
//     <th className="ps-4 text-danger">- Outstanding Debt (Unpaid)</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-danger text-end">
//       {actualremainingAmount.toFixed(2)}
//     </th>
//   </tr>

//   <tr className="table-active">
//     <th className="ps-4 text-danger">- Total Expenses</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-danger text-end">
//       {totalExpense.toFixed(2)}
//     </th>
//   </tr>

//   <tr className="table-active">
//     <th className="ps-4 text-danger">- Total Commission</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-danger text-end">
//       {totalCommissionPaid.toFixed(2)}
//     </th>
//   </tr>

//    <tr className="table-active">
//     <th className="ps-4 text-danger">- Total Salary</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-danger text-end">
//       {totalSalaryPaid.toFixed(2)}
//     </th>
//   </tr>

//   {/* Section 4: Final Totals */}
//   <tr className="table-active border-top border-2">
//     <th colSpan="6" className="bg-light">
//       <strong>FINAL CALCULATIONS</strong>
//     </th>
//   </tr>

//   {/* <tr className="table-active">
//     <th>Gross Profit (Before Deductions)</th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-info text-end">
//       {((grandTotalProfit + totalRebate + previousRemainingAmount) - actualremainingAmount).toFixed(2)}
//     </th>
//   </tr> */}

//   <tr className="table-active border-top border-2">
//     <th className="text-success">
//       <strong>NET PROFIT (Final Amount)</strong>
//     </th>
//     <th></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-end"></th>
//     <th className="text-success text-end">
//       <strong>
//         {(((grandTotalProfit + totalRebate + previousRemainingAmount) - actualremainingAmount) - (totalExpense + totalCommissionPaid + totalSalaryPaid)).toFixed(2)}
//       </strong>
//     </th>
//   </tr>
// </tfoot>
//               {/* )} */}
//             </table>
//           </div>
//         </div>
//       </div>
//     // </div>
//   );
// };

// export default IncomeReport;







import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const IncomeReport = () => {
  // ─── State ────────────────────────────────────────────────────────────
  const [incomeReport, setIncomeReport] = useState([]);
  const [groupedReport, setGroupedReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [totalRebate, setTotalRebate] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalCommissionPaid, setTotalCommission] = useState(0);
  const [totalSalaryPaid, setTotalSalaryPaid] = useState(0);
  const [previousRemainingAmount, setPreviousRemainingAmount] = useState(0);
  const [actualRemainingAmount, setActualRemainingAmount] = useState(0);

  const [formData, setFormData] = useState({
    from_date: null,
    to_date: null,
    supplier_id_for_report: "",
  });

  const [expandedItems, setExpandedItems] = useState({});

  // ─── Helpers ──────────────────────────────────────────────────────────
  const n = (v) => parseFloat(v) || 0;

  // ─── Core formulas (per-unit price + per-unit discount) ───────────────
  //
  // CONFIRMED BUSINESS RULES:
  //   • price    = per-unit sale price
  //   • discount = per-unit discount
  //   • sale     = (price - discount) × quantity
  //   • COGS     = (Stock Item ? purchase_rate_per_tablet : purchase_price_non_stock) × quantity
  //
  // ─────────────────────────────────────────────────────────────────────

  // Single row ka COGS — used inside merge
  const computeRowCogs = (row) => {
    const qty = n(row.quantity);
    if (row.item_stock_type === "Stock Item") {
      return n(row.purchase_rate_calculate_per_tablet) * qty;
    }
    return n(row.purchase_price_non_stock) * qty;
  };

  // Single row ka sale total — used inside merge
  const computeRowSale = (row) => {
    const qty = n(row.quantity);
    const price = n(row.price);
    const discount = n(row.discount);
    return (price - discount) * qty;
  };

  // Single row ka total discount value (per-unit × qty)
  const computeRowDiscountTotal = (row) => {
    return n(row.discount) * n(row.quantity);
  };

  // Display helpers — agar merge ke waqt precompute kiya gaya hai
  // to woh values use karo, warna fresh calculate karo
  const getRowPurchasePrice = (row) => {
    if (row._precomputed_cogs !== undefined) return n(row._precomputed_cogs);
    return computeRowCogs(row);
  };

  const getRowTotal = (row) => {
    if (row._precomputed_sale !== undefined) return n(row._precomputed_sale);
    return computeRowSale(row);
  };

  const getRowDiscountTotal = (row) => {
    if (row._precomputed_discount_total !== undefined) {
      return n(row._precomputed_discount_total);
    }
    return computeRowDiscountTotal(row);
  };

  // ─── Merge logic ──────────────────────────────────────────────────────
  // Same invoice + same Stock Item agar duplicate hai (same ya different stock_id
  // se aaya ho), to merge karo:
  //   • quantity: sum (display ke liye)
  //   • _precomputed_sale:           HAR row ka sale calculate karke sum
  //   • _precomputed_cogs:           HAR row ka COGS calculate karke sum
  //   • _precomputed_discount_total: HAR row ka (discount × qty) sum
  // Kyun precompute? Kyunki har row mein price/discount/purchase_rate alag ho
  // sakti hai. Merged single row mein recalculate nahi kar sakte.
  //
  // Non-Stock / Other items: duplicate nahi aata (confirmed) — as-is pass.
  const consolidateStockItemDuplicates = (rows) => {
    const stockMap = new Map();
    const nonStockRows = [];

    for (const row of rows) {
      if (row.item_stock_type === "Stock Item" && row.item != null) {
        const key = `${row.invoice_no}__${row.item}`;
        const rowSale = computeRowSale(row);
        const rowCogs = computeRowCogs(row);
        const rowDiscTotal = computeRowDiscountTotal(row);

        if (!stockMap.has(key)) {
          // Pehli occurrence — precomputed totals seed karo
          stockMap.set(key, {
            ...row,
            quantity: n(row.quantity),
            _precomputed_sale: rowSale,
            _precomputed_cogs: rowCogs,
            _precomputed_discount_total: rowDiscTotal,
          });
        } else {
          // Duplicate — sab kuch add karte jao
          const existing = stockMap.get(key);
          existing.quantity = existing.quantity + n(row.quantity);
          existing._precomputed_sale =
            n(existing._precomputed_sale) + rowSale;
          existing._precomputed_cogs =
            n(existing._precomputed_cogs) + rowCogs;
          existing._precomputed_discount_total =
            n(existing._precomputed_discount_total) + rowDiscTotal;
        }
      } else {
        // Non-Stock / Other — as-is
        nonStockRows.push({
          ...row,
          quantity: n(row.quantity),
        });
      }
    }

    return [...stockMap.values(), ...nonStockRows];
  };

  // Outstanding remaining amount — har unique invoice ka pehla remaining
  const calculateActualRemainingAmount = (data) => {
    const seenInvoices = new Set();
    let totalRemaining = 0;

    for (const row of data) {
      if (!seenInvoices.has(row.invoice_no)) {
        seenInvoices.add(row.invoice_no);
        totalRemaining += n(row.remaining_amount);
      }
    }

    return totalRemaining;
  };

  // ─── Aggregations (single source of truth) ────────────────────────────
  const buildGroupsAndSummary = (data) => {
    const groupMap = {};
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalItemsSold = 0;
    let totalDiscount = 0;
    let grossProfit = 0;

    for (const row of data) {
      const qty = n(row.quantity);
      const sale = getRowTotal(row);
      const cogs = getRowPurchasePrice(row);
      const discountValue = getRowDiscountTotal(row);
      const profit = sale - cogs;

      totalRevenue += sale;
      totalCOGS += cogs;
      totalItemsSold += qty;
      totalDiscount += discountValue;
      grossProfit += profit;

      const itemKey = `${row.item}-${row.item_name}`;
      if (!groupMap[itemKey]) {
        groupMap[itemKey] = {
          item: row.item,
          item_name: row.item_name,
          medicine_type: row.medicine_type,
          item_stock_type: row.item_stock_type,
          quantity: 0,
          total_sale: 0,
          total_purchase: 0,
          total_discount: 0,
          total_profit: 0,
          transactions: [],
        };
      }
      const g = groupMap[itemKey];
      g.quantity += qty;
      g.total_sale += sale;
      g.total_purchase += cogs;
      g.total_discount += discountValue;
      g.total_profit += profit;
      g.transactions.push(row);
    }

    const groupedArray = Object.values(groupMap).sort((a, b) =>
      (a.item_name || "").localeCompare(b.item_name || "")
    );

    const grossMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      groupedArray,
      summaryData: {
        totalRevenue,
        totalCOGS,
        totalItemsSold,
        totalDiscount,
        grossProfit,
        grossMargin,
      },
    };
  };

  const applyData = (data) => {
    const { groupedArray, summaryData } = buildGroupsAndSummary(data);
    setGroupedReport(groupedArray);
    setSummary(summaryData);

    const expanded = {};
    groupedArray.forEach((g) => {
      expanded[`${g.item}-${g.item_name}`] = false;
    });
    setExpandedItems(expanded);
  };

  // ─── API ──────────────────────────────────────────────────────────────
  const fetchInvoiceData = async (from_date, to_date, shouldLoad = true) => {
    if (shouldLoad) setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/income_report_list`,
        {
          params: {
            from_date: from_date ? format(from_date, "yyyy-MM-dd") : null,
            to_date: to_date ? format(to_date, "yyyy-MM-dd") : null,
            medicine_type: medicineType,
            supplier_id: formData.supplier_id_for_report || "",
          },
        }
      );

      const rawData = response.data.results || [];
      const data = consolidateStockItemDuplicates(rawData);

      setIncomeReport(data);
      applyData(data);

      setTotalRebate(response.data.total_paid_payments || 0);
      setTotalExpense(response.data.total_expense_payments || 0);
      setTotalCommission(response.data.total_commission_payments || 0);
      setTotalSalaryPaid(response.data.total_salary_payments || 0);
      setPreviousRemainingAmount(
        response.data.additional_payments_in_period || 0
      );

      setActualRemainingAmount(calculateActualRemainingAmount(data));
    } catch (error) {
      console.error("Error fetching invoice data", error);
    } finally {
      if (shouldLoad) setIsLoading(false);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleDateChangeForReport = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleGenerateReport = () => {
    if (formData.from_date && formData.to_date) {
      fetchInvoiceData(formData.from_date, formData.to_date, false);
    }
  };

  const handleResetDates = () => {
    setFormData({ from_date: null, to_date: null, supplier_id_for_report: "" });
    setIncomeReport([]);
    setGroupedReport([]);
    setSummary(null);
    setSearchTerm("");
    setExpandedItems({});
    setTotalRebate(0);
    setTotalExpense(0);
    setTotalCommission(0);
    setTotalSalaryPaid(0);
    setPreviousRemainingAmount(0);
    setActualRemainingAmount(0);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      applyData(incomeReport);
      return;
    }

    const filteredData = incomeReport.filter(
      (item) =>
        item.invoice_no?.toString().includes(term) ||
        item.item_name?.toLowerCase().includes(term) ||
        item.invoice_date?.toString().includes(term)
    );

    applyData(filteredData);
  };

  const toggleItemExpansion = (itemKey) => {
    setExpandedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const expandAll = () => {
    const next = {};
    groupedReport.forEach((item) => {
      next[`${item.item}-${item.item_name}`] = true;
    });
    setExpandedItems(next);
  };

  const collapseAll = () => {
    const next = {};
    groupedReport.forEach((item) => {
      next[`${item.item}-${item.item_name}`] = false;
    });
    setExpandedItems(next);
  };

  // ─── Derived totals ───────────────────────────────────────────────────
  const grandTotalQty = groupedReport.reduce((s, x) => s + x.quantity, 0);
  const grandTotalTotal = groupedReport.reduce((s, x) => s + x.total_sale, 0);
  const grandTotalPurchasePrice = groupedReport.reduce(
    (s, x) => s + x.total_purchase,
    0
  );
  const grandTotalProfit = groupedReport.reduce(
    (s, x) => s + x.total_profit,
    0
  );

  // Net Profit (cash basis):
  //   Gross Profit + Rebate + Previous Debt Recovered
  //   − Outstanding Debt − Expenses − Commission − Salary
  const netProfit =
    grandTotalProfit +
    n(totalRebate) +
    n(previousRemainingAmount) -
    n(actualRemainingAmount) -
    (n(totalExpense) + n(totalCommissionPaid) + n(totalSalaryPaid));

  // ─── Formatters ───────────────────────────────────────────────────────
  const fmt = (val) =>
    n(val).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtMoney = (val) =>
    "Rs. " +
    n(val).toLocaleString("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="ir-wrapper">
      <style>{`
        .ir-wrapper {
          padding: 24px;
          background: #f5f7fb;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1f2937;
        }
        .ir-container { max-width: 1400px; margin: 0 auto; }

        .ir-page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .ir-title {
          font-size: 22px; font-weight: 700; color: #111827;
          display: flex; align-items: center; gap: 10px; margin: 0;
        }
        .ir-title-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .ir-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; }

        .ir-btn {
          padding: 9px 16px; border: none; border-radius: 8px;
          cursor: pointer; font-weight: 600; font-size: 13px;
          display: inline-flex; align-items: center; gap: 8px;
          transition: transform .05s, box-shadow .15s, background .15s;
        }
        .ir-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ir-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
        .ir-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff;
          box-shadow: 0 4px 12px rgba(79,70,229,.25);
        }
        .ir-btn-ghost { background: #fff; color: #4b5563; border: 1px solid #e5e7eb; }
        .ir-btn-ghost:hover:not(:disabled) { background: #f9fafb; }

        .ir-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; margin-bottom: 18px;
        }
        @media (max-width: 900px) { .ir-stats { grid-template-columns: repeat(2, 1fr); } }
        .ir-stat-card {
          background: #fff; border-radius: 12px; padding: 16px 18px;
          border: 1px solid #eef0f4;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 1px 2px rgba(15,23,42,.04);
        }
        .ir-stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: #fff; flex-shrink: 0;
        }
        .ir-stat-icon.blue   { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .ir-stat-icon.amber  { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .ir-stat-icon.green  { background: linear-gradient(135deg, #10b981, #059669); }
        .ir-stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .ir-stat-icon.red    { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .ir-stat-label {
          font-size: 11px; color: #6b7280; text-transform: uppercase;
          letter-spacing: .05em; font-weight: 600;
        }
        .ir-stat-value { font-size: 19px; font-weight: 700; color: #111827; margin-top: 2px; }
        .ir-stat-value.neg { color: #dc2626; }
        .ir-stat-value.pos { color: #059669; }

        .ir-toolbar {
          background: #fff; border: 1px solid #eef0f4; border-radius: 12px;
          padding: 14px 16px; margin-bottom: 16px;
          display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;
        }
        .ir-field { display: flex; flex-direction: column; min-width: 160px; }
        .ir-field label {
          font-size: 11px; color: #6b7280; text-transform: uppercase;
          letter-spacing: .04em; font-weight: 600; margin-bottom: 6px;
        }
        .ir-field .react-datepicker-wrapper { width: 100%; }
        .ir-field input.form-control,
        .ir-field input {
          padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
          font-size: 13px; background: #fafbfc;
        }
        .ir-field input:focus {
          outline: none; border-color: #6366f1; background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .ir-toolbar-actions { display: flex; gap: 8px; margin-left: auto; }

        .ir-table-card {
          background: #fff; border-radius: 12px; border: 1px solid #eef0f4;
          overflow: hidden; box-shadow: 0 1px 2px rgba(15,23,42,.04);
          margin-bottom: 18px;
        }
        .ir-table-header {
          padding: 14px 18px; border-bottom: 1px solid #eef0f4;
          display: flex; justify-content: space-between; align-items: center;
          background: #fafbfc;
        }
        .ir-table-header h3 {
          margin: 0; font-size: 14px; font-weight: 600; color: #111827;
          display: flex; align-items: center; gap: 8px;
        }
        .ir-table-actions { display: flex; gap: 6px; }
        .ir-link-btn {
          background: none; border: 1px solid #e5e7eb;
          padding: 5px 10px; border-radius: 6px; font-size: 11px;
          color: #4b5563; cursor: pointer; font-weight: 600;
        }
        .ir-link-btn:hover { background: #f9fafb; }

        .ir-table-scroll { max-height: 520px; overflow-y: auto; }
        .ir-table {
          width: 100%; border-collapse: separate; border-spacing: 0;
        }
        .ir-table thead th {
          position: sticky; top: 0; z-index: 2;
          background: #f9fafb; padding: 11px 14px; text-align: left;
          font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
          color: #6b7280; font-weight: 600; border-bottom: 1px solid #eef0f4;
          white-space: nowrap;
        }
        .ir-table tbody td {
          padding: 11px 14px; border-bottom: 1px solid #f3f4f6;
          font-size: 13px; vertical-align: middle;
        }
        .ir-table .item-row { background: #fff; }
        .ir-table .item-row:hover { background: #f9fafc; }
        .ir-table .item-row td { font-weight: 600; }
        .ir-table .txn-row td { background: #fafbfc; font-size: 12px; color: #4b5563; }
        .ir-table .num { text-align: right; font-variant-numeric: tabular-nums; }
        .ir-table .pos { color: #059669; }
        .ir-table .neg { color: #dc2626; }

        .ir-toggle-btn {
          width: 24px; height: 24px; border: 1px solid #d1d5db;
          background: #fff; border-radius: 6px; cursor: pointer;
          font-size: 11px; color: #4b5563; margin-right: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: all .12s;
        }
        .ir-toggle-btn:hover { background: #eef2ff; border-color: #6366f1; color: #4f46e5; }

        .ir-type-badge {
          display: inline-block; padding: 3px 9px; border-radius: 10px;
          background: #eef2ff; color: #4338ca; font-size: 11px; font-weight: 600;
          text-transform: capitalize;
        }

        .ir-summary-card {
          background: #fff; border-radius: 12px; border: 1px solid #eef0f4;
          overflow: hidden; box-shadow: 0 1px 2px rgba(15,23,42,.04);
          margin-bottom: 18px;
        }
        .ir-summary-header {
          padding: 14px 18px; background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff;
        }
        .ir-summary-header h3 {
          margin: 0; font-size: 14px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .ir-summary-body { padding: 0; }
        .ir-summary-section {
          padding: 12px 18px; border-bottom: 1px solid #f3f4f6;
        }
        .ir-summary-section:last-child { border-bottom: none; }
        .ir-summary-section .section-title {
          font-size: 11px; text-transform: uppercase; letter-spacing: .05em;
          color: #6b7280; font-weight: 700; margin-bottom: 8px;
        }
        .ir-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 0; font-size: 13px;
        }
        .ir-summary-row .label { color: #374151; }
        .ir-summary-row .val   { font-weight: 600; font-variant-numeric: tabular-nums; }
        .ir-summary-row .val.pos { color: #059669; }
        .ir-summary-row .val.neg { color: #dc2626; }
        .ir-summary-row .val.muted { color: #6b7280; }

        .ir-net-card {
          background: linear-gradient(135deg, #064e3b, #047857);
          color: #fff; padding: 18px 22px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .ir-net-card.loss { background: linear-gradient(135deg, #7f1d1d, #b91c1c); }
        .ir-net-label {
          font-size: 12px; text-transform: uppercase; letter-spacing: .06em;
          opacity: .85; font-weight: 600;
        }
        .ir-net-amount { font-size: 26px; font-weight: 800; margin-top: 4px; }

        .ir-empty {
          padding: 60px 20px; text-align: center; color: #6b7280;
        }
        .ir-empty-icon {
          width: 64px; height: 64px; border-radius: 50%; background: #f3f4f6;
          color: #9ca3af; font-size: 24px; margin: 0 auto 12px;
          display: flex; align-items: center; justify-content: center;
        }

        .ir-loader { text-align: center; padding: 50px; }
      `}</style>

      <div className="ir-container">
        <div className="ir-page-header">
          <div>
            <h2 className="ir-title">
              <span className="ir-title-icon">
                <i className="fas fa-chart-line"></i>
              </span>
              Income Report
            </h2>
            <div className="ir-subtitle">
              Sales, profitability, and overall financial summary
            </div>
          </div>
        </div>

        <div className="ir-toolbar">
          <div className="ir-field">
            <label>From Date</label>
            <DatePicker
              selected={formData.from_date}
              onChange={(date) => handleDateChangeForReport("from_date", date)}
              selectsStart
              startDate={formData.from_date}
              endDate={formData.to_date}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="Select from date"
              maxDate={formData.to_date || new Date()}
              isClearable
            />
          </div>

          <div className="ir-field">
            <label>To Date</label>
            <DatePicker
              selected={formData.to_date}
              onChange={(date) => handleDateChangeForReport("to_date", date)}
              selectsEnd
              startDate={formData.from_date}
              endDate={formData.to_date}
              minDate={formData.from_date}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="Select to date"
              maxDate={new Date()}
              isClearable
            />
          </div>

          <div className="ir-field" style={{ flex: 1, minWidth: 220 }}>
            <label>Search</label>
            <input
              type="text"
              placeholder="Item name, invoice no, date..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={isLoading || incomeReport.length === 0}
            />
          </div>

          <div className="ir-toolbar-actions">
            <button
              className="ir-btn ir-btn-primary"
              onClick={handleGenerateReport}
              disabled={!formData.from_date || !formData.to_date || isLoading}
            >
              <i className="fas fa-search"></i> Generate
            </button>
            <button className="ir-btn ir-btn-ghost" onClick={handleResetDates}>
              <i className="fas fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>

        <div className="ir-stats">
          <div className="ir-stat-card">
            <div className="ir-stat-icon blue">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div>
              <div className="ir-stat-label">Total Sales</div>
              <div className="ir-stat-value">{fmtMoney(grandTotalTotal)}</div>
            </div>
          </div>
          <div className="ir-stat-card">
            <div className="ir-stat-icon amber">
              <i className="fas fa-boxes-stacked"></i>
            </div>
            <div>
              <div className="ir-stat-label">Total COGS</div>
              <div className="ir-stat-value">
                {fmtMoney(grandTotalPurchasePrice)}
              </div>
            </div>
          </div>
          <div className="ir-stat-card">
            <div className="ir-stat-icon green">
              <i className="fas fa-arrow-trend-up"></i>
            </div>
            <div>
              <div className="ir-stat-label">Gross Profit</div>
              <div
                className={`ir-stat-value ${
                  grandTotalProfit >= 0 ? "pos" : "neg"
                }`}
              >
                {fmtMoney(grandTotalProfit)}
              </div>
            </div>
          </div>
          <div className="ir-stat-card">
            <div
              className={`ir-stat-icon ${netProfit >= 0 ? "purple" : "red"}`}
            >
              <i className="fas fa-wallet"></i>
            </div>
            <div>
              <div className="ir-stat-label">Net Profit</div>
              <div
                className={`ir-stat-value ${netProfit >= 0 ? "pos" : "neg"}`}
              >
                {fmtMoney(netProfit)}
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="ir-loader">
            <i
              className="fas fa-spinner fa-spin"
              style={{ fontSize: 32, color: "#6366f1" }}
            ></i>
            <p style={{ marginTop: 10, color: "#6b7280" }}>
              Generating report...
            </p>
          </div>
        )}

        {!isLoading && (
          <div className="ir-table-card">
            <div className="ir-table-header">
              <h3>
                <i
                  className="fas fa-table"
                  style={{ color: "#6366f1" }}
                ></i>{" "}
                Detailed Sales Report
              </h3>
              {groupedReport.length > 0 && (
                <div className="ir-table-actions">
                  <button className="ir-link-btn" onClick={expandAll}>
                    <i className="fas fa-plus"></i> Expand All
                  </button>
                  <button className="ir-link-btn" onClick={collapseAll}>
                    <i className="fas fa-minus"></i> Collapse All
                  </button>
                </div>
              )}
            </div>

            {groupedReport.length === 0 ? (
              <div className="ir-empty">
                <div className="ir-empty-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>
                  {incomeReport.length === 0
                    ? "Please select a date range and generate the report"
                    : "No matching records found"}
                </p>
              </div>
            ) : (
              <div className="ir-table-scroll">
                <table className="ir-table">
                  <thead>
                    <tr>
                      <th style={{ width: "32%" }}>Item</th>
                      <th>Type</th>
                      <th className="num">Total Qty</th>
                      <th className="num">Total Sale</th>
                      <th className="num">COGS</th>
                      <th className="num">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedReport.map((item) => {
                      const itemKey = `${item.item}-${item.item_name}`;
                      const isExpanded = expandedItems[itemKey];
                      return (
                        <React.Fragment key={itemKey}>
                          <tr className="item-row">
                            <td>
                              <button
                                className="ir-toggle-btn"
                                onClick={() => toggleItemExpansion(itemKey)}
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                <i
                                  className={`fas fa-${
                                    isExpanded ? "minus" : "plus"
                                  }`}
                                ></i>
                              </button>
                              {item.item_name}
                            </td>
                            <td>
                              {item.medicine_type ? (
                                <span className="ir-type-badge">
                                  {item.medicine_type}
                                </span>
                              ) : (
                                <span style={{ color: "#9ca3af" }}>—</span>
                              )}
                            </td>
                            <td className="num">{item.quantity}</td>
                            <td className="num">{fmt(item.total_sale)}</td>
                            <td className="num">{fmt(item.total_purchase)}</td>
                            <td
                              className={`num ${
                                item.total_profit >= 0 ? "pos" : "neg"
                              }`}
                            >
                              {fmt(item.total_profit)}
                            </td>
                          </tr>
                          {isExpanded &&
                            item.transactions.map((transaction, idx) => {
                              const qty = n(transaction.quantity);
                              const sale = getRowTotal(transaction);
                              const cogs = getRowPurchasePrice(transaction);
                              const profit = sale - cogs;

                              return (
                                <tr
                                  key={`${transaction.invoice_no}-${idx}`}
                                  className="txn-row"
                                >
                                  <td style={{ paddingLeft: 48 }}>
                                    <i
                                      className="fas fa-receipt"
                                      style={{
                                        color: "#9ca3af",
                                        marginRight: 6,
                                      }}
                                    ></i>
                                    Invoice #{transaction.invoice_no}
                                    <span
                                      style={{
                                        color: "#9ca3af",
                                        marginLeft: 8,
                                      }}
                                    >
                                      {transaction.invoice_date}
                                    </span>
                                  </td>
                                  <td></td>
                                  <td className="num">{qty}</td>
                                  <td className="num">{fmt(sale)}</td>
                                  <td className="num">{fmt(cogs)}</td>
                                  <td
                                    className={`num ${
                                      profit >= 0 ? "pos" : "neg"
                                    }`}
                                  >
                                    {fmt(profit)}
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!isLoading && groupedReport.length > 0 && (
          <div className="ir-summary-card">
            <div className="ir-summary-header">
              <h3>
                <i className="fas fa-calculator"></i> Profit & Loss Summary
              </h3>
            </div>
            <div className="ir-summary-body">
              <div className="ir-summary-section">
                <div className="section-title">Sales Summary</div>
                <div className="ir-summary-row">
                  <span className="label">Total Items Sold</span>
                  <span className="val muted">{grandTotalQty}</span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">Total Sales Income</span>
                  <span className="val">{fmtMoney(grandTotalTotal)}</span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">Total COGS</span>
                  <span className="val muted">
                    {fmtMoney(grandTotalPurchasePrice)}
                  </span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">Total Discount</span>
                  <span className="val muted">
                    {fmtMoney(summary?.totalDiscount || 0)}
                  </span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">Gross Profit</span>
                  <span
                    className={`val ${grandTotalProfit >= 0 ? "pos" : "neg"}`}
                  >
                    {fmtMoney(grandTotalProfit)}
                  </span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">Gross Margin</span>
                  <span className="val muted">
                    {(summary?.grossMargin || 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="ir-summary-section">
                <div className="section-title">Additional Income</div>
                <div className="ir-summary-row">
                  <span className="label">
                    <i
                      className="fas fa-plus-circle"
                      style={{ color: "#10b981", marginRight: 6 }}
                    ></i>
                    Rebate Received
                  </span>
                  <span className="val pos">{fmtMoney(totalRebate)}</span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">
                    <i
                      className="fas fa-plus-circle"
                      style={{ color: "#10b981", marginRight: 6 }}
                    ></i>
                    Previous Debt Recovered
                  </span>
                  <span className="val pos">
                    {fmtMoney(previousRemainingAmount)}
                  </span>
                </div>
              </div>

              <div className="ir-summary-section">
                <div className="section-title">Deductions</div>
                <div className="ir-summary-row">
                  <span className="label">
                    <i
                      className="fas fa-minus-circle"
                      style={{ color: "#ef4444", marginRight: 6 }}
                    ></i>
                    Outstanding Debt (Unpaid)
                  </span>
                  <span className="val neg">
                    {fmtMoney(actualRemainingAmount)}
                  </span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">
                    <i
                      className="fas fa-minus-circle"
                      style={{ color: "#ef4444", marginRight: 6 }}
                    ></i>
                    Total Expenses
                  </span>
                  <span className="val neg">{fmtMoney(totalExpense)}</span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">
                    <i
                      className="fas fa-minus-circle"
                      style={{ color: "#ef4444", marginRight: 6 }}
                    ></i>
                    Total Commission
                  </span>
                  <span className="val neg">
                    {fmtMoney(totalCommissionPaid)}
                  </span>
                </div>
                <div className="ir-summary-row">
                  <span className="label">
                    <i
                      className="fas fa-minus-circle"
                      style={{ color: "#ef4444", marginRight: 6 }}
                    ></i>
                    Total Salary
                  </span>
                  <span className="val neg">{fmtMoney(totalSalaryPaid)}</span>
                </div>
              </div>
            </div>
            <div className={`ir-net-card ${netProfit < 0 ? "loss" : ""}`}>
              <div>
                <div className="ir-net-label">
                  {netProfit >= 0 ? "Net Profit (Final)" : "Net Loss (Final)"}
                </div>
                <div className="ir-net-amount">{fmtMoney(netProfit)}</div>
              </div>
              <i
                className={`fas ${
                  netProfit >= 0 ? "fa-trophy" : "fa-triangle-exclamation"
                }`}
                style={{ fontSize: 38, opacity: 0.5 }}
              ></i>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeReport;