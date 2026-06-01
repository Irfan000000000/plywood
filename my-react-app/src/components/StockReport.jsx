// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import Select from "react-select";

// const StockReport = () => {
//   const [stockReport, setStockReport] = useState([]);
//   const [filteredReport, setFilteredReport] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [formData, setFormData] = useState({
//     from_date: null,
//     to_date: null,
//     supplier_id_for_report: "",
    
//   });
//   const [isLoading, setIsLoading] = useState(false);

//     const [getAllSupplier, setAllSupplier] = useState([]);

//   const [medicineType, setMedicineType] = useState("");

//   const fetchStockData = (shouldLoad = true) => {
//     if (shouldLoad) setIsLoading(true);

//     const from_date = formData.from_date
//       ? format(formData.from_date, "yyyy-MM-dd")
//       : null;
//     const to_date = formData.to_date
//       ? format(formData.to_date, "yyyy-MM-dd")
//       : null;

//     const medicine_type = medicineType || 'all';

//     const supplier_id = formData.supplier_id_for_report || 'all';

//     axios
//       .get(
//         `${process.env.REACT_APP_API_URL}/stock_report_list/${from_date}/${to_date}/${medicine_type}/${supplier_id}`,
//         {}
//       )
//       .then((response) => {
//         const data = response.data.results;
//         setStockReport(data);
//         setFilteredReport(data);
//         calculateSummary(data);
//       })
//       .catch((error) => {
//         console.error("Error fetching stock data", error);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   };



//   useEffect(() => {
//       const fetchSupplier = () => {
//         axios
//           .get(process.env.REACT_APP_API_URL + "/get-all-supplier")
//           .then((res) => {
//             setAllSupplier(res.data.results);
//           })
//           .catch((err) => console.log(err));
//       };
//       fetchSupplier();
//     }, []);




//   const calculateSummary = (data) => {
//     let totalStockPurchased = 0;
//     let totalRemainingStock = 0;
//     let totalPurchaseCost = 0;
//     let totalRemainingValue = 0;
//     let totalSoldQuantity = 0;
//     let totalSales = 0;
//     let totalCostOfSold = 0;

//     data.forEach((item) => {
//       totalStockPurchased += parseFloat(item.total_stock) || 0;
//       totalRemainingStock += parseFloat(item.remaining_stock) || 0;
//       totalPurchaseCost += parseFloat(item.total_purchase_cost) || 0;
//       totalRemainingValue +=
//         parseFloat(item.remaining_stock_value - item.total_expire_cost) || 0;
//       totalSoldQuantity += parseFloat(item.sold_quantity) || 0;
//       totalSales += parseFloat(item.total_sales) || 0;
//       totalCostOfSold += parseFloat(item.purchased_cost_of_sold) || 0;
//     });

//     setSummary({
//       totalStockPurchased,
//       totalRemainingStock,
//       totalPurchaseCost,
//       totalRemainingValue,
//       totalSoldQuantity,
//       totalSales,
//       totalCostOfSold,
//     });
//   };

//   const handleDateChangeForReport = (field, date) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: date,
//     }));
//   };

//   const handleGenerateReport = () => {
//     // if (formData.from_date && formData.to_date) {
//     fetchStockData(false);
//     // }
//   };

//   useEffect(() => {
//     fetchStockData(false);
//   }, []);

//   const handleResetDates = () => {
//     setFormData({
//       from_date: null,
//       to_date: null,
//     });
//     setStockReport([]);
//     setFilteredReport([]);
//     setSummary(null);
//     setSearchTerm("");
//   };

//   const calculateGrandTotal = () => {
//     let totals = {
//       stockPurchased: 0,
//       remainingStock: 0,
//       purchaseCost: 0,
//       remainingValue: 0,
//       expireValue: 0,
//       soldQuantity: 0,
//       totalSales: 0,
//       costOfSold: 0,
//       profit: 0,
//     };

//     filteredReport.forEach((item) => {
//       totals.stockPurchased += parseFloat(item.total_stock) || 0;
//       totals.remainingStock += parseFloat(item.remaining_stock) || 0;
//       totals.purchaseCost += parseFloat(item.total_purchase_cost) || 0;
//       totals.remainingValue +=
//         parseFloat(item.remaining_stock_value - item.total_expire_cost) || 0;
//       totals.expireValue += parseFloat(item.total_expire_cost) || 0;
//       totals.soldQuantity += parseFloat(item.sold_quantity) || 0;
//       totals.totalSales += parseFloat(item.total_sales) || 0;
//       totals.costOfSold += parseFloat(item.purchased_cost_of_sold) || 0;
//       totals.profit +=
//         parseFloat(item.total_sales) -
//           parseFloat(item.purchased_cost_of_sold) || 0;
//     });

//     return totals;
//   };

//   const {
//     stockPurchased,
//     remainingStock,
//     purchaseCost,
//     remainingValue,
//     expireValue,
//     soldQuantity,
//     totalSales,
//     costOfSold,
//     profit,
//   } = calculateGrandTotal();

//   const handleSearchChange = (event) => {
//     const term = event.target.value.toLowerCase();
//     setSearchTerm(term);

//     const filteredData = stockReport.filter((item) => {
//       return item.item_name.toLowerCase().includes(term);
//     });

//     setFilteredReport(filteredData);
//     calculateSummary(filteredData);
//   };

//   const downloadPDF = () => {
//     if (!summary || filteredReport.length === 0) {
//       console.error("No data available to generate PDF");
//       return;
//     }

//     const pdf = new jsPDF("p", "mm", "a4");
//     const margin = 10;

//     // Add Summary Section
//     pdf.setFontSize(14);
//     pdf.text("Stock Summary", margin, margin);
//     pdf.setFontSize(10);

//     const summaryData = [
//       ["Total Purchase Cost", summary.totalPurchaseCost.toFixed(2)],
//       ["Remaining Stock Value", summary.totalRemainingValue.toFixed(2)],
//       ["Total Sales", summary.totalSales.toFixed(2)],
//       ["Cost of Sold Items", summary.totalCostOfSold.toFixed(2)],
//       ["Total Profit", profit.toFixed(2)],
//       [
//         "Date Range",
//         `${
//           formData.from_date ? format(formData.from_date, "dd-MM-yyyy") : ""
//         } to ${formData.to_date ? format(formData.to_date, "dd-MM-yyyy") : ""}`,
//       ],
//     ];

//     autoTable(pdf, {
//       startY: margin + 5,
//       head: [["Description", "Value"]],
//       body: summaryData,
//       theme: "striped",
//       margin: { left: margin, right: margin },
//       styles: { fontSize: 10 },
//       headStyles: { fillColor: [0, 102, 204] },
//     });

//     // Add Detailed Stock Report
//     pdf.setFontSize(14);
//     pdf.text("Detailed Stock Report", margin, pdf.lastAutoTable.finalY + 10);
//     pdf.setFontSize(10);

//     const tableData = filteredReport.map((item) => [
//       item.item_name,
//       item.total_stock,
//       item.total_purchase_cost.toFixed(2),
//       item.remaining_stock,
//       item.remaining_stock_value.toFixed(2),
//       item.sold_quantity,
//       item.total_sales.toFixed(2),
//       item.purchased_cost_of_sold.toFixed(2),
//       (
//         parseFloat(item.total_sales) - parseFloat(item.purchased_cost_of_sold)
//       ).toFixed(2),
//     ]);

//     const footerData = [
//       [
//         "Total",
//         "",
//         purchaseCost.toFixed(2),
//         "",
//         remainingValue.toFixed(2),
//         "",
//         totalSales.toFixed(2),
//         costOfSold.toFixed(2),
//         profit.toFixed(2),
//       ],
//     ];

//     autoTable(pdf, {
//       startY: pdf.lastAutoTable.finalY + 15,
//       head: [
//         [
//           "Item",
//           "Total Stock",
//           "Purchase Cost",
//           "Remaining",
//           "Remaining Value",
//           "Sold Qty",
//           "T.Sales",
//           "COGS",
//           "Profit",
//         ],
//       ],
//       body: [...tableData, ...footerData],
//       theme: "striped",
//       margin: { left: margin, right: margin },
//       styles: { fontSize: 8 },
//       headStyles: { fillColor: [0, 102, 204] },
//       didParseCell: (data) => {
//         if (data.section === "body" && data.column.index === 3) {
//           const rowIndex = data.row.index;
//           if (rowIndex < filteredReport.length) {
//             const remainingStock = filteredReport[rowIndex].remaining_stock;
//             const alertStock = filteredReport[rowIndex].alert_stock || 0; // Default to 0 if undefined
//             if (remainingStock <= alertStock) {
//               data.cell.styles.textColor = [255, 0, 0];
//             }
//           }
//         }
//         if (data.section === "body" && data.column.index === 8) {
//           data.cell.styles.textColor = [0, 128, 0];
//         }
//       },
//     });

//     pdf.save(`Stock_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
//   };

//   return (
//     <div className="w-100 mt-4">
//       <div className="d-flex justify-content-center">
//         <div className="col-md-3">
//           <div className="form-group report_date">
//             <DatePicker
//               selected={formData.from_date}
//               onChange={(date) => handleDateChangeForReport("from_date", date)}
//               selectsStart
//               startDate={formData.from_date}
//               endDate={formData.to_date}
//               dateFormat="dd-MM-yyyy"
//               className="form-control"
//               placeholderText="From Date"
//               maxDate={formData.to_date || new Date()}
//               isClearable
//             />
//           </div>
//         </div>
//         <div className="col-md-3">
//           <div className="form-group report_date">
//             <DatePicker
//               selected={formData.to_date}
//               onChange={(date) => handleDateChangeForReport("to_date", date)}
//               selectsEnd
//               startDate={formData.from_date}
//               endDate={formData.to_date}
//               minDate={formData.from_date}
//               dateFormat="dd-MM-yyyy"
//               className="form-control"
//               placeholderText="To Date"
//               maxDate={new Date()}
//               isClearable
//             />
//           </div>
//         </div>
//         <div className="col-sm-3">
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

//         <div className="col-sm-3">
//                               <Select
//                                 id="supplier_id_for_report"
//                                 name="supplier_id_for_report"
//                                 value={
//                                   formData.supplier_id_for_report
//                                     ? {
//                                         value: formData.supplier_id_for_report,
//                                         label: formData.full_name,
//                                       }
//                                     : null
//                                 }
//                                 options={[
//                                   { value: "", label: "Select Supplier" },
//                                   ...getAllSupplier.map((supplier) => ({
//                                     value: supplier.id,
//                                     label: supplier.full_name,
//                                   })),
//                                 ]}
//                                 onChange={(selectedOption) => {
//                                   setFormData({
//                                     ...formData,
//                                     supplier_id_for_report: selectedOption.value,
//                                     full_name: selectedOption.label,
//                                   });
//                                 }}
//                                 placeholder="Select Supplier"
//                               />
//                             </div>
//       </div>

//       <div className="d-flex justify-content-center mb-2">
//         <div>
//           <button
//             className="btn btn-primary"
//             onClick={handleGenerateReport}
//             disabled={isLoading}
//           >
//             {isLoading ? "Loading..." : "Generate Report"}
//           </button>
//           <button
//             className="btn btn-outline-secondary ml-2"
//             onClick={handleResetDates}
//             disabled={isLoading}
//           >
//             Reset
//           </button>
//           <button
//             className="btn btn-success ml-2"
//             onClick={downloadPDF}
//             disabled={!summary || filteredReport.length === 0 || isLoading}
//           >
//             Download PDF
//           </button>
//         </div>
//       </div>

//       {summary && (
//         <div className="card mb-4">
//           <div className="card-header bg-primary text-white">
//             <h5>Stock Summary</h5>
//           </div>
//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <table className="table table-bordered">
//                   <tbody>
//                     <tr>
//                       <th>Total Purchase Cost</th>
//                       <td className="text-right">
//                         {summary.totalPurchaseCost.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>Remaining Stock Value</th>
//                       <td className="text-right">
//                         {summary.totalRemainingValue.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>Total Sales</th>
//                       <td className="text-right">
//                         {summary.totalSales.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>Cost of Sold Items</th>
//                       <td className="text-right">
//                         {summary.totalCostOfSold.toFixed(2)}
//                       </td>
//                     </tr>
//                     <tr>
//                       <th>T.Profit</th>
//                       <td className="text-right">{profit.toFixed(2)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//               <div className="col-md-6">
//                 <table className="table table-bordered">
//                   <tbody>
//                     <tr>
//                       <th>Date Range</th>
//                       <td className="text-right">
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
//       )}

//       <div className="d-flex justify-content-center mb-3">
//         <div className="col-md-4">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search by Item"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             disabled={isLoading}
//           />
//         </div>
//       </div>

//       <div className="card">
//         <div className="card-header bg-primary text-white">
//           <h5>Detailed Stock Report</h5>
//         </div>
//         <div className="card-body">
//           <div className="table-responsive">
//             <table className="table table-striped">
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>T.Purchase Stock</th>
//                   <th>T.Purchase Cost</th>
//                   <th>Expire Stock</th>
//                   <th>Expire Cost</th>
//                   <th>Remaining</th>
//                   <th>Remaining Cost</th>
//                   <th>Sold Stock</th>
//                   <th>Sold Cost</th>
//                   <th>COGS</th>
//                   <th>Profit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredReport.map((item) => (
//                   <tr key={item.id}>
//                     <td>{item.item_name}</td>
//                     <td>{item.total_stock}</td>
//                     <td>{item.total_purchase_cost.toFixed(2)}</td>
//                     <td>{item.expired_stock_quantity.toFixed(2)}</td>
//                     <td>{item.total_expire_cost.toFixed(2)}</td>
//                     <td
//                       style={{
//                         color:
//                           item.remaining_stock <= (item.alert_stock || 0)
//                             ? "red"
//                             : "inherit",
//                       }}
//                     >
//                       {item.remaining_stock - item.expired_stock_quantity}
//                     </td>
//                     <td>
//                       {(
//                         item.remaining_stock_value - item.total_expire_cost
//                       ).toFixed(2)}
//                     </td>
//                     <td>{item.sold_quantity}</td>
//                     <td>{item.total_sales.toFixed(2)}</td>
//                     <td>{item.purchased_cost_of_sold.toFixed(2)}</td>
//                     <td className="text-success">
//                       {(
//                         parseFloat(item.total_sales) -
//                         parseFloat(item.purchased_cost_of_sold)
//                       ).toFixed(2)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr>
//                   <th>Total</th>
//                   <th></th>
//                   <th>{purchaseCost.toFixed(2)}</th>
//                   <th></th>
//                   <th>{expireValue.toFixed(2)}</th>
//                   <th></th>
//                   <th>{remainingValue.toFixed(2)}</th>
//                   <th></th>
//                   <th>{totalSales.toFixed(2)}</th>
//                   <th>{costOfSold.toFixed(2)}</th>
//                   <th className="text-success">{profit.toFixed(2)}</th>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StockReport;




import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "react-select";

const StockReport = () => {
  const [stockReport, setStockReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    from_date: null,
    to_date: null,
    supplier_id_for_report: "",
    
  });
  const [isLoading, setIsLoading] = useState(false);

    const [getAllSupplier, setAllSupplier] = useState([]);

  const [medicineType, setMedicineType] = useState("");

  const fetchStockData = (shouldLoad = true) => {
    if (shouldLoad) setIsLoading(true);

    const from_date = formData.from_date
      ? format(formData.from_date, "yyyy-MM-dd")
      : null;
    const to_date = formData.to_date
      ? format(formData.to_date, "yyyy-MM-dd")
      : null;

    const medicine_type = medicineType || 'all';

    const supplier_id = formData.supplier_id_for_report || 'all';

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/stock_report_list/${from_date}/${to_date}/${medicine_type}/${supplier_id}`,
        {}
      )
      .then((response) => {
        const data = response.data.results;
        setStockReport(data);
        setFilteredReport(data);
        calculateSummary(data);
      })
      .catch((error) => {
        console.error("Error fetching stock data", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };



  useEffect(() => {
      const fetchSupplier = () => {
        axios
          .get(process.env.REACT_APP_API_URL + "/get-all-supplier")
          .then((res) => {
            setAllSupplier(res.data.results);
          })
          .catch((err) => console.log(err));
      };
      fetchSupplier();
    }, []);




  const calculateSummary = (data) => {
    let totalStockPurchased = 0;
    let totalRemainingStock = 0;
    let totalPurchaseCost = 0;
    let totalRemainingValue = 0;
    let totalSoldQuantity = 0;
    let totalSales = 0;
    let totalCostOfSold = 0;

    data.forEach((item) => {
      totalStockPurchased += parseFloat(item.total_stock) || 0;
      totalRemainingStock += parseFloat(item.remaining_stock) || 0;
      totalPurchaseCost += parseFloat(item.total_purchase_cost) || 0;
      totalRemainingValue +=
        parseFloat(item.remaining_stock_value - item.total_expire_cost) || 0;
      totalSoldQuantity += parseFloat(item.sold_quantity) || 0;
      totalSales += parseFloat(item.total_sales) || 0;
      totalCostOfSold += parseFloat(item.purchased_cost_of_sold) || 0;
    });

    setSummary({
      totalStockPurchased,
      totalRemainingStock,
      totalPurchaseCost,
      totalRemainingValue,
      totalSoldQuantity,
      totalSales,
      totalCostOfSold,
    });
  };

  const handleDateChangeForReport = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleGenerateReport = () => {
    // if (formData.from_date && formData.to_date) {
    fetchStockData(false);
    // }
  };

  useEffect(() => {
    fetchStockData(false);
  }, []);

  const handleResetDates = () => {
    setFormData({
      from_date: null,
      to_date: null,
    });
    setStockReport([]);
    setFilteredReport([]);
    setSummary(null);
    setSearchTerm("");
  };

  const calculateGrandTotal = () => {
    let totals = {
      stockPurchased: 0,
      remainingStock: 0,
      purchaseCost: 0,
      remainingValue: 0,
      expireValue: 0,
      soldQuantity: 0,
      totalSales: 0,
      costOfSold: 0,
      profit: 0,
    };

    filteredReport.forEach((item) => {
      totals.stockPurchased += parseFloat(item.total_stock) || 0;
      totals.remainingStock += parseFloat(item.remaining_stock) || 0;
      totals.purchaseCost += parseFloat(item.total_purchase_cost) || 0;
      totals.remainingValue +=
        parseFloat(item.remaining_stock_value - item.total_expire_cost) || 0;
      totals.expireValue += parseFloat(item.total_expire_cost) || 0;
      totals.soldQuantity += parseFloat(item.sold_quantity) || 0;
      totals.totalSales += parseFloat(item.total_sales) || 0;
      totals.costOfSold += parseFloat(item.purchased_cost_of_sold) || 0;
      totals.profit +=
        parseFloat(item.total_sales) -
          parseFloat(item.purchased_cost_of_sold) || 0;
    });

    return totals;
  };

  const {
    stockPurchased,
    remainingStock,
    purchaseCost,
    remainingValue,
    expireValue,
    soldQuantity,
    totalSales,
    costOfSold,
    profit,
  } = calculateGrandTotal();

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filteredData = stockReport.filter((item) => {
      return item.item_name.toLowerCase().includes(term);
    });

    setFilteredReport(filteredData);
    calculateSummary(filteredData);
  };

  const downloadPDF = () => {
    if (!summary || filteredReport.length === 0) {
      console.error("No data available to generate PDF");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;

    // Add Summary Section
    pdf.setFontSize(14);
    pdf.text("Stock Summary", margin, margin);
    pdf.setFontSize(10);

    const summaryData = [
      ["Total Purchase Cost", summary.totalPurchaseCost.toFixed(2)],
      ["Remaining Stock Value", summary.totalRemainingValue.toFixed(2)],
      ["Total Sales", summary.totalSales.toFixed(2)],
      ["Cost of Sold Items", summary.totalCostOfSold.toFixed(2)],
      ["Total Profit", profit.toFixed(2)],
      [
        "Date Range",
        `${
          formData.from_date ? format(formData.from_date, "dd-MM-yyyy") : ""
        } to ${formData.to_date ? format(formData.to_date, "dd-MM-yyyy") : ""}`,
      ],
    ];

    autoTable(pdf, {
      startY: margin + 5,
      head: [["Description", "Value"]],
      body: summaryData,
      theme: "striped",
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    // Add Detailed Stock Report
    pdf.setFontSize(14);
    pdf.text("Detailed Stock Report", margin, pdf.lastAutoTable.finalY + 10);
    pdf.setFontSize(10);

    const tableData = filteredReport.map((item) => [
      item.item_name,
      item.total_stock,
      item.total_purchase_cost.toFixed(2),
      item.remaining_stock,
      item.remaining_stock_value.toFixed(2),
      item.sold_quantity,
      item.total_sales.toFixed(2),
      item.purchased_cost_of_sold.toFixed(2),
      (
        parseFloat(item.total_sales) - parseFloat(item.purchased_cost_of_sold)
      ).toFixed(2),
    ]);

    const footerData = [
      [
        "Total",
        "",
        purchaseCost.toFixed(2),
        "",
        remainingValue.toFixed(2),
        "",
        totalSales.toFixed(2),
        costOfSold.toFixed(2),
        profit.toFixed(2),
      ],
    ];

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 15,
      head: [
        [
          "Item",
          "Total Stock",
          "Purchase Cost",
          "Remaining",
          "Remaining Value",
          "Sold Qty",
          "T.Sales",
          "COGS",
          "Profit",
        ],
      ],
      body: [...tableData, ...footerData],
      theme: "striped",
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 102, 204] },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const rowIndex = data.row.index;
          if (rowIndex < filteredReport.length) {
            const remainingStock = filteredReport[rowIndex].remaining_stock;
            const alertStock = filteredReport[rowIndex].alert_stock || 0; // Default to 0 if undefined
            if (remainingStock <= alertStock) {
              data.cell.styles.textColor = [255, 0, 0];
            }
          }
        }
        if (data.section === "body" && data.column.index === 8) {
          data.cell.styles.textColor = [0, 128, 0];
        }
      },
    });

    pdf.save(`Stock_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="w-100">
      <div className="d-flex justify-content-center">
        <div className="col-md-3 d-none">
          <div className="form-group report_date">
            <DatePicker
              selected={formData.from_date}
              onChange={(date) => handleDateChangeForReport("from_date", date)}
              selectsStart
              startDate={formData.from_date}
              endDate={formData.to_date}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="From Date"
              maxDate={formData.to_date || new Date()}
              isClearable
            />
          </div>
        </div>
        <div className="col-md-3 d-none">
          <div className="form-group report_date">
            <DatePicker
              selected={formData.to_date}
              onChange={(date) => handleDateChangeForReport("to_date", date)}
              selectsEnd
              startDate={formData.from_date}
              endDate={formData.to_date}
              minDate={formData.from_date}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="To Date"
              maxDate={new Date()}
              isClearable
            />
          </div>
        </div>
        <div className="col-sm-3 d-none">
          <select
            name="medicine_type"
            id="medicine_type"
            className="form-control"
            value={medicineType || ""}
            onChange={(e) => setMedicineType(e.target.value)}
          >
            <option value="">Select Item Type</option>
            <option value="other">Other</option>
            <option value="drum">Drum</option>
          </select>
        </div>

        <div className="col-sm-3 d-none">
                              <Select
                                id="supplier_id_for_report"
                                name="supplier_id_for_report"
                                value={
                                  formData.supplier_id_for_report
                                    ? {
                                        value: formData.supplier_id_for_report,
                                        label: formData.full_name,
                                      }
                                    : null
                                }
                                options={[
                                  { value: "", label: "Select Supplier" },
                                  ...getAllSupplier.map((supplier) => ({
                                    value: supplier.id,
                                    label: supplier.full_name,
                                  })),
                                ]}
                                onChange={(selectedOption) => {
                                  setFormData({
                                    ...formData,
                                    supplier_id_for_report: selectedOption.value,
                                    full_name: selectedOption.label,
                                  });
                                }}
                                placeholder="Select Supplier"
                              />
                            </div>
      </div>
{/* d-flex justify-content-center  */}
      <div className="mb-2 d-none">
        <div>
          <button
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Generate Report"}
          </button>
          <button
            className="btn btn-outline-secondary ml-2"
            onClick={handleResetDates}
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            className="btn btn-success ml-2"
            onClick={downloadPDF}
            disabled={!summary || filteredReport.length === 0 || isLoading}
          >
            Download PDF
          </button>
        </div>
      </div>

      {summary && (
        <div className="card mb-4 d-none">
          <div className="card-header bg-primary text-white">
            <h5>Stock Summary</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Total Purchase Cost</th>
                      <td className="text-right">
                        {summary.totalPurchaseCost.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th>Remaining Stock Value</th>
                      <td className="text-right">
                        {summary.totalRemainingValue.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th>Total Sales</th>
                      <td className="text-right">
                        {summary.totalSales.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th>Cost of Sold Items</th>
                      <td className="text-right">
                        {summary.totalCostOfSold.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th>T.Profit</th>
                      <td className="text-right">{profit.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6 d-none">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Date Range</th>
                      <td className="text-right">
                        {formData.from_date &&
                          format(formData.from_date, "dd-MM-yyyy")}{" "}
                        to{" "}
                        {formData.to_date &&
                          format(formData.to_date, "dd-MM-yyyy")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Item"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="card">
        {/* <div className="card-header bg-primary text-white">
          <h5>Detailed Stock Report</h5>
        </div> */}
        {/* <div className="card-body"> */}
          {/* <div className="table-responsive">
            <table className="table table-striped">
              <thead> */}
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-striped">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10, boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.4)' }}>
                <tr>
                  <th>Item</th>
                  <th>T.Purchase Unit</th>
                  <th className="d-none">T.Purchase Cost</th>
                  <th className="d-none">Expire Stock</th>
                  <th className="d-none">Expire Cost</th>
                  
                  <th>Sold/Stock Out Unit</th>
                  <th className="d-none">Sold Cost</th>
                  <th className="d-none">COGS</th>
                  <th className="d-none">Profit</th>
                  <th>Remaining Unit</th>
                  <th className="d-none">Remaining Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.total_stock}</td>
                    <td className="d-none">{item.total_purchase_cost.toFixed(2)}</td>
                    <td className="d-none">{item.expired_stock_quantity.toFixed(2)}</td>
                    <td className="d-none">{item.total_expire_cost.toFixed(2)}</td>
                    
                    <td>{item.sold_quantity}</td>
                    <td className="d-none">{item.total_sales.toFixed(2)}</td>
                    <td className="d-none">{item.purchased_cost_of_sold.toFixed(2)}</td>
                    <td className="text-success d-none">
                      {(
                        parseFloat(item.total_sales) -
                        parseFloat(item.purchased_cost_of_sold)
                      ).toFixed(2)}
                    </td>

                    <td
                      style={{
                        color:
                          item.remaining_stock <= (item.alert_stock || 0)
                            ? "red"
                            : "inherit",
                      }}
                    >
                      {item.remaining_stock - item.expired_stock_quantity}
                    </td>
                    <td className="d-none">
                      {(
                        item.remaining_stock_value - item.total_expire_cost
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th></th>
                  <th className="d-none">{purchaseCost.toFixed(2)}</th>
                  
                  <th></th>
                   <th className="d-none">{totalSales.toFixed(2)}</th>
                  {/* <th>{expireValue.toFixed(2)}</th> */}
                  {/* <th></th> */}
                 
                  <th></th>
                  <th className="d-none">{remainingValue.toFixed(2)}</th>
                  {/* <th>{costOfSold.toFixed(2)}</th> */}
                  {/* <th className="text-success">{profit.toFixed(2)}</th> */}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    // </div>
  );
};

export default StockReport;
