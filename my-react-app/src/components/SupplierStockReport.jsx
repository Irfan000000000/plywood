// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";

// const StockReport = ({data, setPaymentStatus, paymentStatus}) => {

//   console.log("SupplierStockReport data:", data);
//   const [stockReport, setStockReport] = useState(data.data);
//   const [filteredReport, setFilteredReport] = useState(data.data);
//   const [summary, setSummary] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
 

//   const [formData, setFormData] = useState({
//     from_date: null,
//     to_date: null
//   });



//   const calculateSummary = (data) => {
//     let totalStockPurchased = 0;
//     let totalRemainingStock = 0;
//     let totalPurchaseCost = 0;
//     let totalRemainingValue = 0;
//     let totalSoldQuantity = 0;
//     let totalSales = 0;
//     let totalCostOfSold = 0;

//     data.forEach(item => {
//       totalStockPurchased += parseFloat(item.total_stock) || 0;
//       totalRemainingStock += parseFloat(item.remaining_stock) || 0;
//       totalPurchaseCost += parseFloat(item.total_purchase_cost) || 0;
//       totalRemainingValue += parseFloat(item.remaining_stock_value) || 0;
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
//       totalCostOfSold
//     });
//   };

//   const handleDateChangeForReport = (field, date) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: date
//     }));
//   };

 

//   const handleResetDates = () => {
//     setFormData({
//       from_date: null,
//       to_date: null
//     });
//     setStockReport([]);
//     setFilteredReport([]);
//     setSummary(null);
//     setSearchTerm('');
//   };

//   const calculateGrandTotal = () => {
//     let totals = {
//       stockPurchased: 0,
//       remainingStock: 0,
//       purchaseCost: 0,
//       remainingValue: 0,
//       soldQuantity: 0,
//       totalSales: 0,
//       costOfSold: 0,
//       profit: 0,
//       expireCost: 0,
//     };

//     filteredReport.forEach(item => {
//       totals.stockPurchased += parseFloat(item.total_stock) || 0;
//       totals.remainingStock += parseFloat(item.remaining_stock) || 0;
//       totals.purchaseCost += parseFloat(item.total_purchase_cost) || 0;
//       totals.remainingValue += parseFloat(item.remaining_stock_value - item.total_expire_cost) || 0;
//       totals.soldQuantity += parseFloat(item.sold_quantity) || 0;
//       totals.totalSales += parseFloat(item.total_sales) || 0;
//       totals.costOfSold += parseFloat(item.purchased_cost_of_sold) || 0;
//        totals.expireCost += parseFloat(item.total_expire_cost) || 0;

//       totals.profit +=  (parseFloat(item.total_sales)  - parseFloat(item.purchased_cost_of_sold)) || 0;
//     });

//     return totals;
//   };

//   const {
//     stockPurchased,
//     remainingStock,
//     purchaseCost,
//     expireCost,
//     remainingValue,
//     soldQuantity,
//     totalSales,
//     costOfSold,
//     profit,
//   } = calculateGrandTotal();

//   const handleSearchChange = (event) => {
//     const term = event.target.value.toLowerCase();
//     setSearchTerm(term);

//     const filteredData = stockReport.filter(item => {
//       return (
//         item.item_name.toLowerCase().includes(term)
//       );
//     });

//     setFilteredReport(filteredData);
//     calculateSummary(filteredData);
//   };

//   const handlePaymentStatusChange = (event) => {
//     const status = event.target.value.toLowerCase();
//     setPaymentStatus(status);
//   };

//   return (
//     <div className="mt-4">
//       <div className="card mb-4">
//         <div className="card-header bg-primary text-white">
//           <h5>Supplier Personal Information</h5>
//         </div>
//         <div className="card-body">
//           <div className="row">
//             <div className="col-md-4">
//               <p>
//                 <strong>Name:</strong>{" "}
//                 {data?.supplierDetail?.[0]?.full_name || "-"}
//               </p>
//             </div>
//             <div className="col-md-4">
//               <p>
//                 <strong>Phone:</strong>{" "}
//                 {data?.supplierDetail?.[0]?.phone_no || "-"}
//               </p>
//             </div>
//             <div className="col-md-4">
//               <p>
//                 <strong>Account No:</strong>{" "}
//                 {data?.supplierDetail?.[0]?.account_no || "-"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="d-flex justify-content-center mb-3">
//         <div className="col-md-4">
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search by Item"
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//         </div>
//         <div className="col-md-4">
//           <select
//             id="payment_status"
//             className="form-control"
//             name="payment_status"
//             value={paymentStatus}
//             onChange={handlePaymentStatusChange}
//           >
//             <option value="">Select Status</option>
//             <option value="paid">Paid</option>
//             <option value="unpaid">Unpaid</option>
//           </select>
//         </div>
//       </div>

//       <div className="card">
//         <div className="card-header bg-primary text-white">
//           <h5>Supplier Detailed Stock Report</h5>
//         </div>
//         <div className="card-body">
//           <div className="table-responsive">
//             <table className="table table-striped">
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>T.Purchase.Stock</th>
//                   <th>T.Purchase Cost</th>
//                   <th>T.Expire.Stock</th>
//                   <th>T.Expire Cost</th>
//                   <th>Remaining Stock</th>
//                   <th>Remaining Stock Value</th>
//                   <th>Sold Qty</th>
//                   <th>T.Sales</th>
//                   <th>COGS</th>
//                   <th>Profit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredReport.map((item) => (
//                   <tr key={item.id}>
//                     <td>{item.item_name}</td>
//                     <td>{item.total_stock}</td>
//                     <td> {item.total_purchase_cost.toFixed(2)}</td>
//                     <td>{item.expired_stock_quantity}</td>
//                     <td> {item.total_expire_cost.toFixed(2)}</td>
//                     <td>
//                       {item.remaining_stock - item.expired_stock_quantity}
//                     </td>
//                     <td>
//                       {" "}
//                       {(
//                         item.remaining_stock_value - item.total_expire_cost
//                       ).toFixed(2)}
//                     </td>
//                     <td>{item.sold_quantity}</td>
//                     <td> {item.total_sales.toFixed(2)}</td>
//                     <td> {item.purchased_cost_of_sold.toFixed(2)}</td>
//                     <td className="text-success">
//                       {" "}
//                       {item.total_sales.toFixed(2) -
//                         item.purchased_cost_of_sold.toFixed(2)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr>
//                   <th>Total</th>
//                   <th></th>
//                   <th> {purchaseCost.toFixed(2)}</th>
//                   <th></th>
//                   <th> {expireCost.toFixed(2)}</th>
//                   <th></th>
//                   <th> {remainingValue.toFixed(2)}</th>
//                   <th></th>
//                   <th> {totalSales.toFixed(2)}</th>
//                   <th> {costOfSold.toFixed(2)}</th>
//                   <th className="text-success"> {profit.toFixed(2)}</th>
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



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import PaidPayments from './PaidPayments';
import Modal from "./Modal";

const StockReport = ({ data, setPaymentStatus, paymentStatus, setPaidForm, showPaidForm }) => {
  // console.log("SupplierStockReport data:", data);
  const [stockReport, setStockReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");



  const [formData, setFormData] = useState({
    from_date: null,
    to_date: null
  });

  // Update stockReport and filteredReport when data prop changes
  useEffect(() => {
    setStockReport(data.data);
    setFilteredReport(data.data);
    calculateSummary(data.data);
  }, [data]);

  const calculateSummary = (data) => {
    let totalStockPurchased = 0;
    let totalRemainingStock = 0;
    let totalPurchaseCost = 0;
    let totalRemainingValue = 0;
    let totalSoldQuantity = 0;
    let totalSales = 0;
    let totalCostOfSold = 0;

    data.forEach(item => {
      totalStockPurchased += parseFloat(item.total_stock) || 0;
      totalRemainingStock += parseFloat(item.remaining_stock) || 0;
      totalPurchaseCost += parseFloat(item.total_purchase_cost) || 0;
      totalRemainingValue += parseFloat(item.remaining_stock_value) || 0;
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
      totalCostOfSold
    });
  };

  const handleDateChangeForReport = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleResetDates = () => {
    setFormData({
      from_date: null,
      to_date: null
    });
    setStockReport(data.data);
    setFilteredReport(data.data);
    setSummary(null);
    setSearchTerm('');
  };

  const calculateGrandTotal = () => {
    let totals = {
      stockPurchased: 0,
      remainingStock: 0,
      purchaseCost: 0,
      remainingValue: 0,
      soldQuantity: 0,
      totalSales: 0,
      costOfSold: 0,
      profit: 0,
      expireCost: 0,
    };

    filteredReport.forEach(item => {
      totals.stockPurchased += parseFloat(item.total_stock) || 0;
      totals.remainingStock += parseFloat(item.remaining_stock) || 0;
      totals.purchaseCost += parseFloat(item.total_purchase_cost) || 0;
      totals.remainingValue += parseFloat(item.remaining_stock_value - item.total_expire_cost) || 0;
      totals.soldQuantity += parseFloat(item.sold_quantity) || 0;
      totals.totalSales += parseFloat(item.total_sales) || 0;
      totals.costOfSold += parseFloat(item.purchased_cost_of_sold) || 0;
      totals.expireCost += parseFloat(item.total_expire_cost) || 0;
      totals.profit += (parseFloat(item.total_sales) - parseFloat(item.purchased_cost_of_sold)) || 0;
    });

    return totals;
  };

  const {
    stockPurchased,
    remainingStock,
    purchaseCost,
    expireCost,
    remainingValue,
    soldQuantity,
    totalSales,
    costOfSold,
    profit,
  } = calculateGrandTotal();

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filteredData = stockReport.filter(item => {
      return (
        item.item_name.toLowerCase().includes(term)
      );
    });

    setFilteredReport(filteredData);
    calculateSummary(filteredData);
  };

  // const handlePaymentStatusChange = (event) => {
  //   const status = event.target.value.toLowerCase();
  //   setPaymentStatus(status);
  // };

  // const paidPayment = () => {
  //       setPaidForm(true);
  //   }

  return (
    <div className="mt-4">
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5>Supplier Personal Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <p>
                <strong>Name:</strong>{" "}
                {data?.supplierDetail?.[0]?.full_name || "-"}
              </p>
            </div>
            <div className="col-md-4">
              <p>
                <strong>Phone:</strong>{" "}
                {data?.supplierDetail?.[0]?.phone_no || "-"}
              </p>
            </div>
            <div className="col-md-4">
              <p>
                <strong>Account No:</strong>{" "}
                {data?.supplierDetail?.[0]?.account_no || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Item"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* <div className="col-md-4">
          <select
            id="payment_status"
            className="form-control"
            name="payment_status"
            value={paymentStatus}
            onChange={handlePaymentStatusChange}
          >
            <option value="">Select Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div> */}

        {/* <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={paidPayment}
          >
            Paid Payments
          </button>
        </div> */}
      </div>

      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5>Supplier Detailed Stock Report</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>T.Purchase.Stock</th>
                  <th>T.Purchase Cost</th>
                  <th>T.Expire.Stock</th>
                  <th>T.Expire Cost</th>
                  <th>Remaining Stock</th>
                  <th>Remaining Stock Value</th>
                  <th>Sold Qty</th>
                  <th>T.Sales</th>
                  <th>COGS</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.total_stock}</td>
                    <td>{item.total_purchase_cost.toFixed(2)}</td>
                    <td>{item.expired_stock_quantity}</td>
                    <td>{item.total_expire_cost.toFixed(2)}</td>
                    <td>
                      {item.remaining_stock - item.expired_stock_quantity}
                    </td>
                    <td>
                      {(
                        item.remaining_stock_value - item.total_expire_cost
                      ).toFixed(2)}
                    </td>
                    <td>{item.sold_quantity}</td>
                    <td>{item.total_sales.toFixed(2)}</td>
                    <td>{item.purchased_cost_of_sold.toFixed(2)}</td>
                    <td className="text-success">
                      {(item.total_sales - item.purchased_cost_of_sold).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>{stockPurchased}</th>
                  <th>{purchaseCost.toFixed(2)}</th>
                  <th>{expireCost}</th>
                  <th>{expireCost.toFixed(2)}</th>
                  <th>{remainingStock}</th>
                  <th>{remainingValue.toFixed(2)}</th>
                  <th>{soldQuantity}</th>
                  <th>{totalSales.toFixed(2)}</th>
                  <th>{costOfSold.toFixed(2)}</th>
                  <th className="text-success">{profit.toFixed(2)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* {showPaidForm && (
        <Modal
          isOpen={true}
          onClose={() => setPaidForm(false)}
          title="Add Supplier"
          maxWidth="1400px"
        >
          <PaidPayments onClose={() => setPaidForm(false)} />
        </Modal>
      )} */}
    </div>
  );
};

export default StockReport;

