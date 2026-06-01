

// import React, { useState } from 'react';

// const InvoiceModalPharmacy = ({ invoiceData, onClose }) => {

//   console.log("InvoiceModalPharmacy invoiceData", invoiceData);


//   const [isVisible, setIsVisible] = useState(true);

//   // Merge items with the same item_name (or item.item if that's the field)
//   const mergedInvoiceData = Object.values(
//     invoiceData.reduce((acc, item) => {
//       // Use item.item_name (change to item.item if that's the correct field)
//       const key = item.item;
//       if (!acc[key]) {
//         acc[key] = {
//           ...item,
//           quantity: 0,
//           total: 0,
//           discount: 0,
//           // Ensure hidden_id is preserved or generate a unique one if needed
//           hidden_id: item.hidden_id || `${key}-${Date.now()}`,
//         };
//       }
//       acc[key].quantity += parseFloat(item.quantity || 0);
//       acc[key].total += parseFloat(item.total || 0);
//       acc[key].discount += parseFloat(item.discount || 0);
//       return acc;
//     }, {})
//   );

//   // Calculate the Grand Total and Discount Total
//   const grandTotal = mergedInvoiceData
//     .reduce((total, item) => total + parseFloat(item.total + item.discount || 0), 0)
//     .toFixed(2);
//   const discountTotal = mergedInvoiceData
//     .reduce((total, item) => total + parseFloat(item.discount || 0), 0)
//     .toFixed(2);

//   // Handle print function
//   const handlePrint = async () => {
//     try {
//       const response = await fetch('http://localhost:4000/print-invoice', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           invoiceData: mergedInvoiceData, // Use merged data
//           grandTotal,
//           discountTotal,
//           storeInfo: {
//             name: 'Outre Tailor Service',
//             address: 'Outre Tailor Service New City Phase-II Wah Cantt',
//             phone: '0514-531040',
//           },
//         }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         // alert(result.message || 'Invoice sent to printer!');
//       } else {
//         // alert(result.error || 'Failed to print invoice');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error connecting to print service');
//     }
//   };

//   return (
//     <div style={overlayStyle}>
//       <div style={modalStyle}>
//         <div style={headerStyle}>
//           <h3 style={titleStyle}></h3>
//           <div>
//             <button onClick={onClose} style={closeButtonStyle}>
//               X
//             </button>
//           </div>
//         </div>
//         <h3 style={titleStyle}>Client Invoice</h3>
//         <div style={infoStyle}>
//           <h3 style={storeNameStyle}>Outre Tailor Service</h3>
//           <p style={storeInfoStyle}>
//             <i className="fas fa-map-marker-alt"></i> Outre Tailor Service New
//             City Phase-II Wah Cantt
//           </p>
//           <p style={storeInfoStyle}>
//             <i className="fas fa-phone-alt"></i> +92 333 956 80 94
//           </p>
//           <p style={{ marginTop: "20px" }}></p>
//           <p
//             style={{
//               fontSize: "20px",
//               textAlign: "left",
//               fontWeight: "bolder",
//             }}
//           >
//             Invoice# : {" "}
//             {mergedInvoiceData.length > 0
//               ? mergedInvoiceData[0].invoice_no
//               : ""}
//           </p>


//           <p
//             style={{
//               fontSize: "20px",
//               textAlign: "left",
//               fontWeight: "bolder",
//             }}
//           >
//             Book# : {" "}
//             {mergedInvoiceData.length > 0
//               ? mergedInvoiceData[0].book_id
//               : ""}
//           </p>

//            <p
//             style={{
//               fontSize: "20px",
//               textAlign: "left",
//               fontWeight: "bolder",
//             }}
//           >
//             Rack# : {" "}
//             {mergedInvoiceData.length > 0
//               ? mergedInvoiceData[0].rack_no
//               : ""}
//           </p>


//            <p
//             style={{
//               fontSize: "20px",
//               textAlign: "left",
//               fontWeight: "bolder",
//             }}
//           >
//             Delivery Date : {" "}
//             {mergedInvoiceData.length > 0
//               ? mergedInvoiceData[0].delivery_date
//               : ""}
//           </p>


//           <p
//             style={{
//               fontSize: "20px",
//               textAlign: "left",
//               fontWeight: "bolder",
//             }}
//           >
//             Name (Phone) : {" "}
//             {mergedInvoiceData.length > 0
//               ? mergedInvoiceData[0].full_name + " (" + mergedInvoiceData[0].phone_no + ") (" +  mergedInvoiceData[0].phone_no_type + ")"
//               : ""}
//           </p>



//         </div>

//         <div style={tableWrapperStyle}>
//           <table style={tableStyle}>
//             <thead>
//               <tr>
//                 <th style={tableHeaderStyle} className="text-center">
//                   #
//                 </th>
//                 <th style={tableHeaderStyle}>Item</th>
//                 <th style={tableHeaderStyle} className="text-center">
//                   Price(Rs.)
//                 </th>
//                 <th style={tableHeaderStyle} className="text-center">
//                   Disc(-)
//                 </th>
//                 <th style={tableHeaderStyle} className="text-center">
//                   After.Disc
//                 </th>
//                 <th style={tableHeaderStyle} className="text-center">
//                   Unit.Qty
//                 </th>
//                 <th style={tableHeaderStyle} className="text-center">
//                   Total
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {mergedInvoiceData.map((item, index) => (
//                 <tr key={item.hidden_id || index}>
//                   <td style={tableCellStyle} className="text-center">
//                     {index + 1}
//                   </td>
//                   <td style={tableCellStyle} className="text-left">
//                     {item.item_name || item.item}
//                   </td>
//                   <td style={tableCellStyle} className="text-center">
//                     {item.price}
//                   </td>
//                   <td style={tableCellStyle} className="text-center">
//                     {item.discount}
//                   </td>
//                   <td style={tableCellStyle} className="text-center">
//                     {item.rate_after_discount}
//                   </td>
//                   <td style={tableCellStyle} className="text-center">
//                     {item.quantity}
//                   </td>
//                   <td style={tableCellStyle} className="text-center">
//                     {item.total}
//                   </td>
//                 </tr>
//               ))}
//               {/* <tr>
//                 <td colSpan="6" style={grandTotalStyle}>
//                   Grand Total
//                 </td>
//                 <td style={grandTotalStyle} className="text-center">
//                   {grandTotal}
//                 </td>
//               </tr> */}
//               <tr>
//                 <td colSpan="6" style={grandTotalStyle}>
//                   Discount
//                 </td>
//                 <td style={grandTotalStyle} className="text-center">
//                   {discountTotal}
//                 </td>
//               </tr>
//               <tr>
//                 <td colSpan="6" style={grandTotalStyle}>
//                   Grand Total
//                 </td>
//                 <td style={grandTotalStyle} className="text-center">
//                   {parseFloat(grandTotal - discountTotal).toFixed(2)}
//                 </td>
//               </tr>

//               <tr>
//                 <td colSpan="6" style={grandTotalStyle}>
//                   Advance
//                 </td>
//                 <td style={grandTotalStyle} className="text-center">
//                   {mergedInvoiceData[0] ? parseFloat(mergedInvoiceData[0].advance).toFixed(2) : '0.00'}
//                 </td>
//               </tr>

//               <tr>
//                 <td colSpan="6" style={grandTotalStyle}>
//                   Remaining.Amount
//                 </td>
//                 <td style={grandTotalStyle} className="text-center">
//                   {parseFloat(mergedInvoiceData[0]?.remaining_amount || 0).toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//         <div style={{ borderBottom: "2px dotted black" }}></div>
//         <div style={footerStyle}>
//           <div style={tableWrapperStyle}>
//             <button
//               onClick={handlePrint}
//               className="btn btn-sm btn-warning mt-2"
//             >
//               <i className="fas fa-print"></i> Print
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Styles (unchanged)
// const overlayStyle = {
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   // backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
//   zIndex: 9999,
// };

// const modalStyle = {
//   backgroundColor: 'white',
//   padding: '15px',
//   borderRadius: '10px',
//   minWidth: '800px',
//   height: 'auto',
//   maxWidth: '100%',
//   textAlign: 'center',
//   boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
//   fontSize: '12px',
// };

// const titleStyle = {
//   fontSize: '25px',
//   fontWeight: 'bold',
//   margin: '5px 0',
//   textDecoration: 'underline',
// };

// const headerStyle = {
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   marginBottom: '10px',
// };

// const closeButtonStyle = {
//   background: 'none',
//   border: 'none',
//   fontSize: '16px',
//   cursor: 'pointer',
//   color: 'red',
// };

// const tableWrapperStyle = {
//   width: '100%',
//   overflowX: 'auto',
// };

// const tableStyle = {
//   width: '100%',
//   borderCollapse: 'collapse',
//   marginTop: '10px',
//   fontSize: '20px',
// };

// const tableHeaderStyle = {
//   textAlign: 'left',
//   padding: '5px 0',
//   borderBottom: '1px solid #000',
//   fontWeight: 'bold',
// };

// const tableCellStyle = {
//   padding: '5px',
//   borderBottom: '1px solid #000',
// };

// const grandTotalStyle = {
//   textAlign: 'right',
//   padding: '5px',
//   fontWeight: 'bold',
// };

// const footerStyle = {
//   marginTop: '15px',
//   textAlign: 'center',
//   marginTop: '30px',
// };

// const infoStyle = {
//   marginBottom: '20px',
//   textAlign: 'center',
// };

// const storeNameStyle = {
//   fontSize: '25px',
//   fontWeight: 'bold',
//   marginBottom: '5px',
// };

// const storeInfoStyle = {
//   fontSize: '15px',
//   margin: '2px 0',
// };

// export default InvoiceModalPharmacy;





// const InvoiceModalPharmacy = ({ invoiceData, onClose }) => {
//   // Merge items with the same item_name
//   const mergedInvoiceData = Object.values(
//     invoiceData.reduce((acc, item) => {
//       const key = item.item;
//       if (!acc[key]) {
//         acc[key] = {
//           ...item,
//           quantity: 0,
//           total: 0,
//           discount: 0,
//           hidden_id: item.hidden_id || `${key}-${Date.now()}`,
//         };
//       }
//       acc[key].quantity += parseFloat(item.quantity || 0);
//       acc[key].total += parseFloat(item.total || 0);
//       acc[key].discount += parseFloat(item.discount || 0);
//       return acc;
//     }, {})
//   );

//   // Calculate totals
//   const grandTotal = mergedInvoiceData
//     .reduce((total, item) => total + parseFloat(item.total + item.discount || 0), 0)
//     .toFixed(2);
//   const discountTotal = mergedInvoiceData
//     .reduce((total, item) => total + parseFloat(item.discount || 0), 0)
//     .toFixed(2);
//   const netTotal = (grandTotal - discountTotal).toFixed(2);
//   const remainingAmount = parseFloat(mergedInvoiceData[0]?.remaining_amount || 0).toFixed(2);

//   const handlePrint = async () => {
//     try {
//       const response = await fetch('http://localhost:4000/print-invoice', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           invoiceData: mergedInvoiceData,
//           grandTotal,
//           discountTotal,
//           storeInfo: {
//             name: 'Outre Tailor Service',
//             address: 'Outre Tailor Service New City Phase-II Wah Cantt',
//             phone: '0514-531040',
//           },
//         }),
//       });
//       const result = await response.json();
//       if (!response.ok) console.error(result.error);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   return (
//     <div style={styles.overlay}>
//       <div style={styles.modal}>
//         <div style={styles.header}>
//           <button onClick={onClose} style={styles.closeButton}>
//             ✕
//           </button>
//         </div>
        
//         {/* Header Section */}
//         <div style={styles.storeHeader}>
//           <h1 style={styles.storeName}>Outre Tailor Service</h1>
//           <p style={styles.storeAddress}>New City Phase-II, Wah Cantt</p>
//           <p style={styles.storeContact}>📞 +92 333 956 80 94</p>
//         </div>
        
//         {/* Invoice Title */}
//         <div style={styles.invoiceTitle}>TAILORING INVOICE</div>
        
//         {/* Client Info */}
//         <div style={styles.clientInfo}>
//           <div style={styles.infoRow}>
//             <span>Invoice#: {mergedInvoiceData[0]?.invoice_no || ''}</span>
//             <span>Date: {new Date().toLocaleDateString()}</span>
//           </div>
//           <div style={styles.infoRow}>
//             <span>Book#: {mergedInvoiceData[0]?.book_id || ''}</span>
//             <span>Rack#: {mergedInvoiceData[0]?.rack_no || ''}</span>
//           </div>
//           <div style={styles.infoRow}>
//             <span>Delivery: {mergedInvoiceData[0]?.delivery_date || ''}</span>
//           </div>
//           <div style={styles.clientName}>
//             {mergedInvoiceData[0]?.full_name || ''} 
//             <span style={styles.clientPhone}>
//               ({mergedInvoiceData[0]?.phone_no || ''}) {mergedInvoiceData[0]?.phone_no_type || ''}
//             </span>
//           </div>
//         </div>
        
//         {/* Items Table */}
//         <table style={styles.table}>
//           <thead>
//             <tr>
//               <th style={styles.th}>#</th>
//               <th style={{...styles.th, textAlign: 'left'}}>Item Description</th>
//               <th style={styles.th}>Price</th>
//               <th style={styles.th}>Disc.</th>
//               <th style={styles.th}>Net</th>
//               <th style={styles.th}>Qty</th>
//               <th style={styles.th}>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {mergedInvoiceData.map((item, index) => (
//               <tr key={item.hidden_id || index}>
//                 <td style={styles.td}>{index + 1}</td>
//                 <td style={{...styles.td, textAlign: 'left'}}>{item.item_name || item.item}</td>
//                 <td style={styles.td}>{item.price}</td>
//                 <td style={styles.td}>{item.discount}</td>
//                 <td style={styles.td}>{item.rate_after_discount}</td>
//                 <td style={styles.td}>{item.quantity}</td>
//                 <td style={styles.td}>{item.total}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
        
//         {/* Totals Section */}
//         <div style={styles.totalsContainer}>
//           <div style={styles.totalRow}>
//             <span>Subtotal:</span>
//             <span>{grandTotal}</span>
//           </div>
//           <div style={styles.totalRow}>
//             <span>Discount:</span>
//             <span>-{discountTotal}</span>
//           </div>
//           <div style={{...styles.totalRow, borderTop: '1px solid #ddd'}}>
//             <span>Net Total:</span>
//             <span>{netTotal}</span>
//           </div>
//           <div style={styles.totalRow}>
//             <span>Advance:</span>
//             <span>-{mergedInvoiceData[0]?.advance || '0.00'}</span>
//           </div>
//           <div style={{...styles.totalRow, fontWeight: 'bold'}}>
//             <span>Balance Due:</span>
//             <span>{remainingAmount}</span>
//           </div>
//         </div>
        
//         {/* Footer */}
//         <div style={styles.footer}>
//           <button onClick={handlePrint} style={styles.printButton}>
//             🖨️ Print Invoice
//           </button>
//           <p style={styles.thankYou}>Thank you for your business!</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Modern, clean styles
// const styles = {
//   overlay: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//     padding: '20px',
//   },
//   modal: {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     width: '100%',
//     maxWidth: '800px',
//     padding: '30px',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'flex-end',
//   },
//   closeButton: {
//     background: 'none',
//     border: 'none',
//     fontSize: '24px',
//     cursor: 'pointer',
//     color: '#888',
//     padding: '5px 10px',
//     borderRadius: '50%',
//     transition: 'all 0.2s',
//     ':hover': {
//       backgroundColor: '#f5f5f5',
//       color: '#333',
//     },
//   },
//   storeHeader: {
//     textAlign: 'center',
//     marginBottom: '20px',
//     borderBottom: '2px solid #eee',
//     paddingBottom: '20px',
//   },
//   storeName: {
//     fontSize: '28px',
//     fontWeight: 'bold',
//     margin: '0 0 5px 0',
//     color: '#333',
//   },
//   storeAddress: {
//     fontSize: '14px',
//     color: '#666',
//     margin: '0 0 5px 0',
//   },
//   storeContact: {
//     fontSize: '16px',
//     color: '#444',
//     margin: 0,
//   },
//   invoiceTitle: {
//     fontSize: '22px',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     margin: '15px 0',
//     color: '#2c3e50',
//     letterSpacing: '1px',
//   },
//   clientInfo: {
//     backgroundColor: '#f9f9f9',
//     padding: '15px',
//     borderRadius: '8px',
//     marginBottom: '20px',
//   },
//   infoRow: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     marginBottom: '8px',
//     fontSize: '15px',
//   },
//   clientName: {
//     fontWeight: 'bold',
//     fontSize: '18px',
//     marginTop: '10px',
//   },
//   clientPhone: {
//     fontWeight: 'normal',
//     fontSize: '15px',
//     marginLeft: '10px',
//     color: '#555',
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     margin: '20px 0',
//     fontSize: '15px',
//   },
//   th: {
//     padding: '12px 8px',
//     backgroundColor: '#f2f2f2',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     borderBottom: '2px solid #ddd',
//   },
//   td: {
//     padding: '10px 8px',
//     borderBottom: '1px solid #eee',
//     textAlign: 'center',
//   },
//   totalsContainer: {
//     marginTop: '20px',
//     padding: '15px',
//     backgroundColor: '#f9f9f9',
//     borderRadius: '8px',
//   },
//   totalRow: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     marginBottom: '10px',
//     fontSize: '16px',
//   },
//   footer: {
//     marginTop: '30px',
//     textAlign: 'center',
//   },
//   printButton: {
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     padding: '12px 25px',
//     borderRadius: '6px',
//     fontSize: '16px',
//     cursor: 'pointer',
//     transition: 'background-color 0.3s',
//     ':hover': {
//       backgroundColor: '#45a049',
//     },
//   },
//   thankYou: {
//     marginTop: '20px',
//     fontStyle: 'italic',
//     color: '#666',
//   },
// };

// export default InvoiceModalPharmacy;



// import React from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';


// const InvoiceModalPharmacy = ({ invoiceData, onClose }) => {
//   // Merge items and calculate totals
//   const mergedItems = Object.values(
//     invoiceData.reduce((acc, item) => {
//       const key = item.item;
//       if (!acc[key]) acc[key] = { ...item, quantity: 0, total: 0, discount: 0 };
//       acc[key].quantity += +item.quantity || 0;
//       acc[key].total += +item.total || 0;
//       acc[key].discount += +item.discount || 0;
//       return acc;
//     }, {})
//   );

//   const subtotal = mergedItems.reduce((sum, item) => sum + +item.total + +item.discount, 0).toFixed(2);
//   const discount = mergedItems.reduce((sum, item) => sum + +item.discount, 0).toFixed(2);
//   const netTotal = (subtotal - discount).toFixed(2);
//   const advance = mergedItems[0]?.advance || 0;
//   const balance = (netTotal - advance).toFixed(2);

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div style={styles.overlay}>
//       <div style={styles.modal}>
//         <div style={styles.header}>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>

//         {/* Store Info */}
//         <div style={styles.storeInfo}>
//           <h4>Farman Ply Wood</h4>
//           <p>Timber Market Taxila</p>
//           <p>📞 +92 000 000 000 000</p>
//         </div>

//         {/* Client Info */}
//         <div style={styles.clientInfo}>
//           <div style={styles.row}>
//             <span><strong>Invoice#:</strong> {mergedItems[0]?.invoice_no || ''}</span>
//            <span>
//   <strong>Date:</strong> 
//   {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}
// </span>
//           </div>
//           <div style={styles.row}>
//             <span><strong>Client:</strong> {mergedItems[0]?.full_name || ''}</span>
//             <span><strong>Phone:</strong> {mergedItems[0]?.phone_no || ''}</span>
//           </div>
//           <div style={styles.row}>
//            <span>
//   <strong>Delivery:</strong> 
//   {mergedItems[0]?.delivery_date 
//     ? new Date(mergedItems[0].delivery_date)
//         .toLocaleDateString('en-GB')
//         .replace(/\//g, '-') 
//     : ''}
// </span>
//             {/* <span><strong>Rack#:</strong> {mergedItems[0]?.rack_no || ''}</span> */}
//           </div>
//         </div>

//         {/* Items Table */}
//         <table style={styles.table}>
//           <thead>
//             <tr>
//               <th style={styles.th}>#</th>
//               <th style={styles.thLeft}>Item</th>
//               <th style={styles.th}>Qty</th>
//               <th style={styles.th}>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {mergedItems.map((item, i) => (
//               <tr key={i}>
//                 <td style={styles.td}>{i+1}</td>
//                 <td style={styles.tdLeft}>{item.item_name || item.item}</td>
//                 <td style={styles.td}>{item.quantity}</td>
//                 <td style={styles.td}>{item.total}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Totals */}
//         <div style={styles.totals}>
//           <div style={styles.totalRow}>
//             <span>Subtotal:</span>
//             <span>{subtotal}</span>
//           </div>
//           <div style={styles.totalRow}>
//             <span>Discount:</span>
//             <span>-{discount}</span>
//           </div>
//           <div style={styles.totalRow}>
//             <span>Advance:</span>
//             <span>-{advance}</span>
//           </div>
//           <div style={{...styles.totalRow, fontWeight: 'bold'}}>
//             <span>Balance Due:</span>
//             <span>{balance}</span>
//           </div>
//         </div>

//         {/* Footer */}
//         <div style={styles.footer}>
//           <button onClick={handlePrint} style={styles.printBtn}>Print</button>
//           <p style={styles.thanks}>Thank you!</p>
//         </div>
//       </div>
//     </div>
//   );
// };



// import React from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const InvoiceModalPharmacy = ({ invoiceData, onClose }) => {
//   // Merge items and calculate totals
//   const mergedItems =  invoiceData;
 

//   const invoiceType = mergedItems[0]?.invoice_type || 'sale';
// const subtotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
//   const discount = mergedItems.reduce((sum, item) => sum + (Number(item.discount)), 0).toFixed(2);
//   const netTotal = (subtotal - discount).toFixed(2);
//   const advance = mergedItems[0]?.advance || 0;
//   const balance = (netTotal - advance).toFixed(2);



//    React.useEffect(() => {
//     const handleKeyDown = (event) => {
//       // Ctrl+X to close
//       if (event.ctrlKey && event.key === 'x') {
//         event.preventDefault();
//         event.stopImmediatePropagation();
//         onClose();
//       }
      
//       // P key to print all items
//       if (event.key === 'p' || event.key === 'P') {
//         event.preventDefault();
//         if (invoiceType === 'quotation') {
//           handleDownloadQuotation();
//         } else {
//           handlePrint('all');
//         }
//       }
      
//       // S key to print store items only
//       if (event.key === 's' || event.key === 'S') {
//         event.preventDefault();
//         if (invoiceType !== 'quotation') {
//           handlePrint('store');
//         }
//       }
//     };

//      window.addEventListener('keydown', handleKeyDown, true);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown, true);
//     };
//   }, [onClose, invoiceType]);


//  const handlePrint = async (printType = 'all') => {
//   try {

//      let itemsToPrint;
//     if (printType === 'store') {
//       // Only print items that are in stock
//       itemsToPrint = invoiceData.filter(item => item.location === 'In Store');
      
//       // If no in-stock items found, show alert
//       if (itemsToPrint.length === 0) {
//         alert('No In-Store items found to print.');
//         return;
//       }
//     } else {
//       // Print all items
//       itemsToPrint = invoiceData;
//     }

//      const filteredSubtotal = itemsToPrint.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
//     const filteredDiscount = itemsToPrint.reduce((sum, item) => sum + (Number(item.discount)), 0).toFixed(2);
//     const filteredNetTotal = (filteredSubtotal - filteredDiscount).toFixed(2);
//     const filteredAdvance = printType === 'store' ? 0 : (itemsToPrint[0]?.advance || 0); // No advance for store items
//     const filteredBalance = (filteredNetTotal - filteredAdvance).toFixed(2);

    
//     const response = await fetch(process.env.REACT_APP_API_URL+'/print-invoice', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         invoiceData: itemsToPrint,
//         grandTotal: filteredSubtotal,
//         discountTotal: filteredDiscount,
//         netTotal: filteredNetTotal,
//         advance: filteredAdvance,
//         balance: filteredBalance,
//         printType: printType, // Send print type to backend
//         storeInfo: {
//           name: "Farman Plywood",
//           address: "Near New City Phase-II Wah Cantt",
//           phone: "03128010847 / 03125851228"
//         }
//       }),
//     });

//     const result = await response.json();
//     if (response.ok) {
//       console.log(result.message || `${printType === 'store' ? 'Store items' : 'Invoice'} sent to printer!`);
//     } else {
//       alert(result.error || 'Failed to print invoice');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     alert('Error connecting to print service');
//   }
// };

//   const handleDownloadQuotation = () => {
//   const doc = new jsPDF();
  
//   // Add a subtle background color to the header
//   doc.setFillColor(245, 245, 245);
//   doc.rect(0, 0, 210, 45, 'F');
  
//   // Add a colored accent bar at the top
//   doc.setFillColor(76, 175, 80); // Green accent
//   doc.rect(0, 0, 210, 3, 'F');
  
//   // Company Header - Enhanced Typography
//   doc.setFontSize(20);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(51, 51, 51);
//   doc.text("Farman Ply Wood", 105, 18, { align: "center" });
  
//   // Subtitle with better spacing
//   doc.setFontSize(11);
//   doc.setFont('helvetica', 'normal');
//   doc.setTextColor(102, 102, 102);
//   doc.text("NEW CITY PHASE-II, WAH CANTT", 105, 26, { align: "center" });
  
//   // Contact with icon-like formatting
//   doc.setFontSize(10);
//   doc.setTextColor(76, 175, 80);
//   doc.text('+92 000 000 000 000', 105, 33, { align: 'center' });
  
//   // Quotation Title with elegant styling
//   doc.setFillColor(76, 175, 80);
//   doc.rect(70, 48, 70, 12, 'F');
//   doc.setFontSize(14);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(255, 255, 255);
//   doc.text('QUOTATION', 105, 56, { align: 'center' });
  
//   // Client Information Box with border
//   doc.setDrawColor(220, 220, 220);
//   doc.setFillColor(250, 250, 250);
//   doc.rect(14, 68, 182, 32, 'FD');
  
//   // Reset text color for content
//   doc.setTextColor(51, 51, 51);
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(10);
  
//   // Client info with better formatting
//   doc.setFont('helvetica', 'bold');
//   doc.text('Quotation #:', 20, 76);
//   doc.setFont('helvetica', 'normal');
//   doc.text(String(mergedItems[0]?.invoice_no || ''), 50, 76);
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('Date:', 130, 76);
//   doc.setFont('helvetica', 'normal');
//   doc.text(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), 150, 76);
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('Client:', 20, 84);
//   doc.setFont('helvetica', 'normal');
//   doc.text(String(mergedItems[0]?.full_name || ''), 50, 84);
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('Phone:', 130, 84);
//   doc.setFont('helvetica', 'normal');
//   doc.text(String(mergedItems[0]?.phone_no || ''), 150, 84);
  
//   if (mergedItems[0]?.delivery_date) {
//     doc.setFont('helvetica', 'bold');
//     doc.text('Delivery Date:', 20, 92);
//     doc.setFont('helvetica', 'normal');
//     doc.text(new Date(mergedItems[0].delivery_date)
//       .toLocaleDateString('en-GB')
//       .replace(/\//g, '-'), 60, 92);
//   }
  
//   // Enhanced Items Table
//   const tableStartY = 110;
  
//   autoTable(doc, {
//     startY: tableStartY,
//     head: [['#', 'Item Description', 'Quantity', 'Unit Price', 'Total Amount']],
//     body: mergedItems.map((item, i) => [
//       String(i + 1),
//       String(item.item_name || item.item || ''),
//       String(item.quantity || '0'),
//       `${String(item.price || (item.total / item.quantity).toFixed(2) || '0')}`,
//       `${String(item.total || '0')}`
//     ]),
//     styles: { 
//       fontSize: 9,
//       cellPadding: 5,
//       lineColor: [220, 220, 220],
//       lineWidth: 0.1,
//       textColor: [51, 51, 51]
//     },
//     headStyles: { 
//       fillColor: [76, 175, 80],
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       fontSize: 10,
//       textAlign: 'left',
//     },
//     alternateRowStyles: {
//       fillColor: [248, 248, 248]
//     },
//     columnStyles: {
//       0: { halign: 'left', cellWidth: 15 },
//       1: { halign: 'left', cellWidth: 80 },
//       2: { halign: 'left', cellWidth: 25 },
//       3: { halign: 'left', cellWidth: 30 },
//       4: { halign: 'left', cellWidth: 35 }
//     }
//   });
  
//   // Enhanced Totals Section
//   const finalY = doc.lastAutoTable.finalY + 15;
  
//   // Totals box
//   doc.setFillColor(248, 248, 248);
//   doc.setDrawColor(220, 220, 220);
//   doc.rect(120, finalY - 5, 76, 30, 'FD');
  
//   doc.setFontSize(10);
//   doc.setTextColor(51, 51, 51);
  
//   // Subtotal
//   doc.setFont('helvetica', 'normal');
//   doc.text('Subtotal:', 125, finalY + 3);
//   doc.text(`${String(subtotal)}`, 190, finalY + 3, { align: 'right' });
  
//   // Discount
//   doc.setTextColor(220, 53, 69); // Red for discount
//   doc.text('Discount:', 125, finalY + 10);
//   doc.text(`${String(discount)}`, 190, finalY + 10, { align: 'right' });
  
//   // Net Total with emphasis
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(12);
//   doc.setTextColor(76, 175, 80);
//   doc.text('Net Total:', 125, finalY + 20);
//   doc.text(`${String(netTotal)}`, 190, finalY + 20, { align: 'right' });
  
//   // Terms and Conditions
//   const termsY = finalY + 35;
//   doc.setFillColor(245, 245, 245);
//   doc.rect(14, termsY, 182, 20, 'F');
  
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(51, 51, 51);
//   doc.text('Terms & Conditions:', 20, termsY + 7);
  
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(8);
//   doc.text('• This quotation is valid for 7 days from the date of issue', 20, termsY + 12);
//   doc.text('• Prices are subject to change without prior notice', 20, termsY + 16);
  
//   // Footer with thank you message
//   const footerY = termsY + 30;
//   // doc.setFillColor(76, 175, 80);
//   // doc.rect(0, footerY, 210, 20, 'F');
  
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   // doc.setTextColor(255, 255, 255);
//   doc.text('Thank you for choosing Noor Oil Traders!', 105, footerY + 8, { align: 'center' });
  
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');
//   doc.text('We look forward to serving you', 105, footerY + 14, { align: 'center' });
  
//   // Save the PDF
//   doc.save(`Quotation_${String(mergedItems[0]?.invoice_no || 'new')}.pdf`);
// };

//   return (
//     <div style={styles.overlay}>
//       <div style={styles.modal}>
//         <div style={styles.header}>
//           <button onClick={onClose} style={styles.closeBtn}>
//             ✕
//           </button>
//         </div>

//         {/* Store Info */}
//         <div style={styles.storeInfo}>
//           <h4>Farman PlyWood</h4>
//           <p>New City Phase-II Wah Cantt</p>
//           <p>📞 +92 000 000 000 000</p>
//         </div>

//         {/* Title based on invoice type */}
//         <div style={{ textAlign: "center", marginBottom: "10px" }}>
//           <h5>{invoiceType === "quotation" ? "QUOTATION" : "INVOICE"}</h5>
//         </div>

//         {/* Client Info */}
//         <div style={styles.clientInfo}>
//           <div style={styles.row}>
//             <span>
//               <strong>
//                 {invoiceType === "quotation" ? "Quotation#" : "Invoice#"}:
//               </strong>{" "}
//               {mergedItems[0]?.invoice_no || ""}
//             </span>
//             <span>
//               <strong>Date:</strong>
//               {new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}
//             </span>
//           </div>
//           <div style={styles.row}>
//             <span>
//               <strong>Client:</strong> {mergedItems[0]?.full_name || ""}
//             </span>
//             <span>
//               <strong>Phone:</strong> {mergedItems[0]?.phone_no || ""}
//             </span>
//           </div>
//           <div style={styles.row}>
//             <span>
//               <strong>Delivery:</strong>
//               {mergedItems[0]?.delivery_date
//                 ? new Date(mergedItems[0].delivery_date)
//                     .toLocaleDateString("en-GB")
//                     .replace(/\//g, "-")
//                 : ""}
//             </span>
//              <span>
//               <strong>Created By:</strong> {mergedItems[0]?.user_name || "Unknown"}
//             </span>
//           </div>
//         </div>

//         {/* Items Table */}
//         <table style={styles.table}>
//           <thead>
//             <tr>
//               <th style={styles.th}>#</th>
//               <th style={styles.thLeft}>Item</th>
//               <th style={styles.th}>Qty</th>
//               <th style={styles.th}>Price</th>
//               <th style={styles.th}>Total</th>
//               {/* <th style={styles.th}>Rack</th> */}
//             </tr>
//           </thead>
//           <tbody>
//             {mergedItems.map((item, i) => (
//               <tr key={i}>
//                 <td style={styles.td}>{i + 1}</td>
//                 <td style={styles.tdLeft}>{(item.item_name || item.item) + (item.rack_no ?  " (" + item.rack_no.replace(/"/g, "") + ")" : "")}</td>
//                 <td style={styles.td}>{item.quantity}</td>
//                 <td style={styles.td}>{item.price}</td>
//                 <td style={styles.td}>{item.price * item.quantity}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Totals */}
//         <div style={styles.totals}>
//           <div style={styles.totalRow}>
//             <span>Total:</span>
//             <span>{subtotal}</span>
//           </div>

//           <div style={styles.totalRow}>
//             <span>T.Discount:</span>
//             <span>-{discount}</span>
//           </div>

//           <div
//             style={{ ...styles.totalRow, fontWeight: "bold", fontSize: "20px" }}
//           >
//             <span>After.Discount:</span>
//             <span>{subtotal - discount}</span>
//           </div>
//           <hr />
//           {invoiceType === "sale" && (
//             <div style={styles.totalRow}>
//               <span>Advance:</span>
//               <span>-{advance}</span>
//             </div>
//           )}
//           <div style={{ ...styles.totalRow, fontWeight: "bold", fontSize: "20px" }}>
//             <span>
//               {invoiceType === "quotation" ? "Total Amount" : "Balance"}:
//             </span>
//             <span>{invoiceType === "quotation" ? netTotal : balance}</span>
//           </div>
//         </div>

//         <div style={styles.footer}>
//   {/* Print All Items Button */}
//   <button 
//     onClick={() => handlePrint('all')} 
//     className='btn btn-primary mr-2'
//   >
//     <i className='fas fa-print'></i> Print Invoice
//   </button>

//   {/* Print Store Items Only Button */}
//   <button 
//     onClick={() => handlePrint('store')} 
//     className='btn btn-warning mr-2'
//   >
//     <i className='fas fa-store'></i> Print Store Items
//   </button>

//   {/* Download Quotation Button */}
//   {invoiceType === "quotation" && (
//     <button 
//       onClick={handleDownloadQuotation} 
//       className='btn btn-secondary'
//     >
//       <i className='fas fa-download'></i> Download Quotation PDF
//     </button>
//   )}
  
//   <p style={styles.thanks}>Thank you!</p>
//   {/* <p style={styles.thanks}>Click (P Key) to Print Invoice and (S Key) to Print Store Items</p> */}
//   <p style={styles.thanks}>
//   Keyboard shortcuts: | <b>P</b> Print Invoice | <b>S</b> Print Store Items
// </p>

// </div>
//       </div>
//     </div>
//   );
// };

// // ... (keep your existing styles object)


// // Compact styles
// const styles = {
//   overlay: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//     padding: '10px',
//      zIndex:'9999'
//   },
//   modal: {
//     backgroundColor: 'white',
//     borderRadius: '8px',
//     width: '100%',
//     maxWidth: '600px',
//     padding: '20px',
//     boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//     fontFamily: 'Arial, sans-serif',
//     fontSize: '14px',
//     zIndex:'9999'
//   },
//   header: { textAlign: 'right' },
//   closeBtn: {
//     background: 'none',
//     border: 'none',
//     fontSize: '18px',
//     cursor: 'pointer',
//     color: '#888',
//   },
//   storeInfo: {
//     textAlign: 'center',
//     marginBottom: '15px',
//     paddingBottom: '10px',
//     borderBottom: '1px solid #eee',
//   },
//   clientInfo: {
//     marginBottom: '15px',
//     padding: '10px',
//     background: '#f8f8f8',
//     borderRadius: '5px',
//   },
//   row: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     marginBottom: '5px',
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     margin: '10px 0',
//   },
//   th: {
//     padding: '8px',
//     background: '#f2f2f2',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   thLeft: {
//     padding: '8px',
//     background: '#f2f2f2',
//     fontWeight: 'bold',
//     textAlign: 'left',
//   },
//   td: {
//     padding: '8px',
//     borderBottom: '1px solid #eee',
//     textAlign: 'center',
//   },
//   tdLeft: {
//     padding: '8px',
//     borderBottom: '1px solid #eee',
//     textAlign: 'left',
//   },
//   totals: {
//     margin: '15px 0',
//     padding: '10px',
//     background: '#f8f8f8',
//     borderRadius: '5px',
//   },
//   totalRow: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     marginBottom: '5px',
//   },
//   footer: {
//     textAlign: 'center',
//     marginTop: '15px',
//   },
//   printBtn: {
//     background: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     padding: '8px 15px',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
//   thanks: {
//     marginTop: '10px',
//     fontStyle: 'italic',
//     color: '#666',
//   },
// };

// export default InvoiceModalPharmacy;





import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceModalPharmacy = ({ invoiceData, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Merge duplicate items by item name
  const mergeItems = (items) => {
    const itemMap = new Map();
    
    items.forEach(item => {
      const itemName = item.item_name || item.item || '';
      
      if (itemMap.has(itemName)) {
        const existing = itemMap.get(itemName);
        existing.quantity = Number(existing.quantity) + Number(item.quantity);
        existing.total = Number(existing.price) * Number(existing.quantity);
        existing.discount = Number(existing.discount || 0) + Number(item.discount || 0);
      } else {
        itemMap.set(itemName, {
          ...item,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.price) * Number(item.quantity),
          discount: Number(item.discount || 0)
        });
      }
    });
    
    return Array.from(itemMap.values());
  };

  // Filter and merge items
  const filteredItems = invoiceData.filter(item => {
    const itemName = (item.item_name || item.item || '').toLowerCase();
    return itemName.includes(searchTerm.toLowerCase());
  });

  const mergedItems = mergeItems(filteredItems);
  
  // Calculate totals
  const invoiceType = invoiceData[0]?.invoice_type || 'sale';
  const subtotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  const discount = mergedItems.reduce((sum, item) => sum + Number(item.discount || 0), 0).toFixed(2);
  const netTotal = (subtotal - discount).toFixed(2);
  const advance = invoiceData[0]?.advance || 0;
  const balance = (netTotal - advance).toFixed(2);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+X to close
      if (event.ctrlKey && event.key === 'x') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
      }
      
      // Ctrl+P to print
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        event.stopPropagation();
        if (invoiceType === 'quotation') {
          handleDownloadQuotation();
        } else {
          handlePrint('all');
        }
      }

      // Ctrl+S to print store items
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        event.stopPropagation();
        if (invoiceType !== 'quotation') {
          handlePrint('store');
        }
      }

      // Ctrl+F to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('invoice-search')?.focus();
      }
      
      // Escape to clear search
      if (event.key === 'Escape' && searchTerm) {
        event.preventDefault();
        event.stopPropagation();
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose, invoiceType, searchTerm]);

  // Print invoice handler
  const handlePrint = async (printType = 'all') => {
    try {
      let itemsToPrint;
      
      if (printType === 'store') {
        itemsToPrint = invoiceData.filter(item => item.location === 'In Store');
        
        if (itemsToPrint.length === 0) {
          alert('No In-Store items found to print.');
          return;
        }
      } else {
        itemsToPrint = invoiceData;
      }

      const filteredSubtotal = itemsToPrint.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
      const filteredDiscount = itemsToPrint.reduce((sum, item) => sum + Number(item.discount || 0), 0).toFixed(2);
      const filteredNetTotal = (filteredSubtotal - filteredDiscount).toFixed(2);
      const filteredAdvance = printType === 'store' ? 0 : (itemsToPrint[0]?.advance || 0);
      const filteredBalance = (filteredNetTotal - filteredAdvance).toFixed(2);

      const response = await fetch(process.env.REACT_APP_API_URL + '/print-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceData: itemsToPrint,
          grandTotal: filteredSubtotal,
          discountTotal: filteredDiscount,
          netTotal: filteredNetTotal,
          advance: filteredAdvance,
          balance: filteredBalance,
          printType: printType,
          storeInfo: {
            name: "Farman Plywood",
            address: "Near New City Phase-II Wah Cantt",
            phone: "03128010847 / 03125851228"
          }
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message || `${printType === 'store' ? 'Store items' : 'Invoice'} sent to printer!`);
      } else {
        alert(result.error || 'Failed to print invoice');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to print service');
    }
  };

  // Download quotation as PDF
  const handleDownloadQuotation = () => {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Accent bar
    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, 210, 3, 'F');
    
    // Company name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text("Farman Ply Wood", 105, 18, { align: "center" });
    
    // Address
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text("NEW CITY PHASE-II, WAH CANTT", 105, 26, { align: "center" });
    
    // Phone
    doc.setFontSize(10);
    doc.setTextColor(76, 175, 80);
    doc.text('+92 000 000 000 000', 105, 33, { align: 'center' });
    
    // Title
    doc.setFillColor(76, 175, 80);
    doc.rect(70, 48, 70, 12, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('QUOTATION', 105, 56, { align: 'center' });
    
    // Client info box
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.rect(14, 68, 182, 32, 'FD');
    
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Quotation details
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation #:', 20, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(String(mergedItems[0]?.invoice_no || ''), 50, 76);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 130, 76);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), 150, 76);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 20, 84);
    doc.setFont('helvetica', 'normal');
    doc.text(String(mergedItems[0]?.full_name || ''), 50, 84);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', 130, 84);
    doc.setFont('helvetica', 'normal');
    doc.text(String(mergedItems[0]?.phone_no || ''), 150, 84);
    
    if (mergedItems[0]?.delivery_date) {
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery Date:', 20, 92);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(mergedItems[0].delivery_date).toLocaleDateString('en-GB').replace(/\//g, '-'), 60, 92);
    }
    
    // Items table
    autoTable(doc, {
      startY: 110,
      head: [['#', 'Item Description', 'Quantity', 'Unit Price', 'Total Amount']],
      body: mergedItems.map((item, i) => [
        String(i + 1),
        String(item.item_name || item.item || ''),
        String(item.quantity || '0'),
        String(item.price || '0'),
        String(item.total || '0')
      ]),
      styles: { 
        fontSize: 9,
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        textColor: [51, 51, 51]
      },
      headStyles: { 
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        textAlign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'left', cellWidth: 25 },
        3: { halign: 'left', cellWidth: 30 },
        4: { halign: 'left', cellWidth: 35 }
      }
    });
    
    // Totals section
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(220, 220, 220);
    doc.rect(120, finalY - 5, 76, 30, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 125, finalY + 3);
    doc.text(String(subtotal), 190, finalY + 3, { align: 'right' });
    
    doc.setTextColor(220, 53, 69);
    doc.text('Discount:', 125, finalY + 10);
    doc.text(String(discount), 190, finalY + 10, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(76, 175, 80);
    doc.text('Net Total:', 125, finalY + 20);
    doc.text(String(netTotal), 190, finalY + 20, { align: 'right' });
    
    // Terms
    const termsY = finalY + 35;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, termsY, 182, 20, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('Terms & Conditions:', 20, termsY + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('• This quotation is valid for 7 days from the date of issue', 20, termsY + 12);
    doc.text('• Prices are subject to change without prior notice', 20, termsY + 16);
    
    // Footer
    const footerY = termsY + 30;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing Farman Ply Wood!', 105, footerY + 8, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('We look forward to serving you', 105, footerY + 14, { align: 'center' });
    
    doc.save(`Quotation_${String(mergedItems[0]?.invoice_no || 'new')}.pdf`);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        <div style={styles.title}>
          <h5>{invoiceType === "quotation" ? "QUOTATION" : "INVOICE"}</h5>
        </div>

        <div style={styles.clientInfo}>
          <div style={styles.row}>
            <span>
              <strong>{invoiceType === "quotation" ? "Quotation#" : "Invoice#"}:</strong>{" "}
              {mergedItems[0]?.invoice_no || ""}
            </span>
            <span>
              <strong>Date:</strong> {new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}
            </span>
          </div>
          <div style={styles.row}>
            <span>
              <strong>Client:</strong> {mergedItems[0]?.full_name || ""}
            </span>
            <span>
              <strong>Phone:</strong> {mergedItems[0]?.phone_no || ""}
            </span>
          </div>
          <div style={styles.row}>
            <span>
              <strong>Delivery:</strong>{" "}
              {mergedItems[0]?.delivery_date
                ? new Date(mergedItems[0].delivery_date).toLocaleDateString("en-GB").replace(/\//g, "-")
                : ""}
            </span>
            <span>
              <strong>Created By:</strong> {mergedItems[0]?.user_name || "Unknown"}
            </span>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.searchContainer}>
            <input
              id="invoice-search"
              type="text"
              placeholder="Search items... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={styles.clearBtn}
                title="Clear search (Esc)"
              >
                ✕
              </button>
            )}
          </div>

          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.thLeft}>Item</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {mergedItems.length > 0 ? (
                mergedItems.map((item, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.tdLeft}>{item.item_name || item.item}</td>
                    <td style={styles.td}>{item.quantity}</td>
                    <td style={styles.td}>{item.price}</td>
                    <td style={styles.td}>{item.total || (item.price * item.quantity)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.noData}>
                    No items found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.totals}>
          <div style={styles.totalRow}>
            <span>Total:</span>
            <span>{subtotal}</span>
          </div>
          <div style={styles.totalRow}>
            <span>T.Discount:</span>
            <span>-{discount}</span>
          </div>
          <div style={styles.totalRowBold}>
            <span>After.Discount:</span>
            <span>{subtotal - discount}</span>
          </div>
          <hr />
          {invoiceType === "sale" && (
            <div style={styles.totalRow}>
              <span>Advance:</span>
              <span>-{advance}</span>
            </div>
          )}
          <div style={styles.totalRowBold}>
            <span>{invoiceType === "quotation" ? "Total Amount" : "Balance"}:</span>
            <span>{invoiceType === "quotation" ? netTotal : balance}</span>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={() => handlePrint('all')} className='btn btn-primary mr-2'>
            <i className='fas fa-print'></i> Print Invoice
          </button>
          {/* <button onClick={() => handlePrint('store')} className='btn btn-warning mr-2'>
            <i className='fas fa-store'></i> Print Store Items
          </button> */}
          {invoiceType === "quotation" && (
            <button onClick={handleDownloadQuotation} className='btn btn-secondary'>
              <i className='fas fa-download'></i> Download Quotation PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: '10px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '600px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    position: 'relative',
    zIndex:1000
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#888',
    position: 'absolute',
    top: '15px',
    right: '15px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  clientInfo: {
    padding: '10px',
    background: '#f8f8f8',
    borderRadius: '5px',
    marginBottom: '10px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  tableContainer: {
    height: '270px',
    overflow: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '10px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 35px 10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '5px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#999',
    padding: '5px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '10px 0',
  },
  thead: {
    position: 'sticky',
    top: '0px',
  },
  th: {
    padding: '8px',
    background: '#f2f2f2',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  thLeft: {
    padding: '8px',
    background: '#f2f2f2',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #eee',
    textAlign: 'center',
  },
  tdLeft: {
    padding: '8px',
    borderBottom: '1px solid #eee',
    textAlign: 'left',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
    borderBottom: '1px solid #eee',
  },
  totals: {
    margin: '15px 0',
    padding: '10px',
    background: '#f8f8f8',
    borderRadius: '5px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  totalRowBold: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '15px',
  },
};

export default InvoiceModalPharmacy;