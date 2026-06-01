// import React, { useEffect, useState, useCallback, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Home from "../Home";
// import Stock from "./Stock";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { isValid, format } from "date-fns";

// import { useItemPharmacy } from "./ItemContextPharmacy";

// import InvoiceModalPharmacy from "./InvoiceModalPharmacy";
// import InvoiceListPharmacy from "./InvoiceListPharmacy";
// import IncomeReport from "./IncomeReport";
// import StockReport from "./StockReport";
// import ExpiredStock from "./ExpiredStock";
// import Modal from "./Modal";
// import SuppliersList from "./SuppliersList";
// import StockDeficitReport from "./StockDeficitReport";
// import { Link } from "react-router-dom";
// import PaidPayments from "./PaidPayments";
// import BankAccounts from "./BankAccounts";
// import Heads from "./Heads";
// import AddTransaction from "./AddTransaction";
// import DailyExpense from "./DailyExpense";
// import { AuthProvider, useAuth } from "./AuthContext";

// const PharmacyTest = ({
//   onClose,
//   invoiceNo,
//   patientId = 0,
//   doctorID = 0,
//   fetchPatientMedicine = "",
// }) => {
//   const [patientIdGet, setPatientId] = useState(patientId);
//   const [doctorInvoiceId, setDoctorInvoiceId] = useState(doctorID);
//   const [checkComponent, setComponent] = useState("pharmacy");

//   // Add this state variable with your other useState declarations
//   const [barcodeInput, setBarcodeInput] = useState("");

  
// // Add these states near your other useState declarations (around line 90)
// const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
// const [activeBlock, setActiveBlock] = useState('itemsPOS'); // 'invoiceForm', 'itemsPOS', 'invoiceItems'
// const [activeFieldIndex, setActiveFieldIndex] = useState(0);


//   const { user } = useAuth();

// const invoiceItemsRefs = useRef([]);

//   const printRef = useRef();


  
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   const notify = (message) => {
//     toast.success(message);
//   };

//   const current_date_get = new Intl.DateTimeFormat("en-CA", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   })
//     .format(new Date())
//     .replace(/\//g, "-");

//   const [formData, setFormData] = useState({
//     item: "",
//     price: 0,
//     final_price: 0,
//     quantity: 1,
//     discount: 0,
//     rate_after_discount: 0,
//     reserve_stock_id: 0,
//     actual_edit_item: "",
//     total: 0,
//     stock: 0,
//     rack_no: "",
//     stock_id: "",
//     formula: "",
//     final_price: 0,
//     stock_remain: 0,
//     item_name: "",
//     hidden_id: "",
//     invoice_no: "",
//     phone_no: "",
//     full_name: "",
//     age: "",
//     barcode_no: "",
//     reserve_quantity: 0,
//     reserve_price: 0,
//     reserve_discount: 0,
//     return_unit: 0,
//     total_return_amount: 0,
//     gst: 0,
//     invoice_date: current_date_get,
//     from_date: "",
//     to_date: "",
//     advance: 0,
//     grand_total: 0,
//     remaining_amount: 0,
//     delivery_date: "",
//     book_id: "",
//     stock_type: "",
//     rate_after_discount_reserve: 0,
//     total_reserve: 0,
//     reserve_return_unit: 0,
//     reserve_total_return_amount: 0,
//     invoice_status: "paid",
//     alert_date: "",
//     location: "",
//   });

//   const { items } = useItemPharmacy();

//   const [selectedInvoiceType, setSelectedInvoiceType] = useState("sale");
//   const [showHeading, setShowHeading] = useState(false);
//   const [checkEdit, setEdit] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [checkBarcodeFetch, setBarcodeFetch] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);
//   const [totalPages, totalPagesGet] = useState("");
//   const [getCategories, setCategories] = useState([]);
//   const [totalItem, setTotalItemGet] = useState(5);
//   const [searchInvoice, setSearchInvoice] = useState("");
//   const [tableData, setTableData] = useState([]);
//   const [editIndex, setEditIndex] = useState(null);
//   const [contactMethod, setContactMethod] = useState("phone");
//   const [getStock, setStock] = useState([]);
//   const [showBakupLoading, setBakupLoading] = useState(false);
//   const [formDisabled, setFormDisabled] = useState(false);
//   const [invoiceData, setInvoiceData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [invoiceTable, updateInvoiceTable] = useState([]);
//   const [invoiceNoUpdate, setInvoiceUpdate] = useState({ invoice_no: "" });
//   const [isVisible, setIsVisible] = useState(false);
//   const [showDatesForReport, setShowDatesForReport] = useState(false);
//   const [reportData, setReportData] = useState("");
//   const [showReport, setShowReport] = useState(false);
//   const [viewReport, setViewReport] = useState(false);
//   const [showEdit, setShow] = useState("");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [medicine, setMedicine] = useState({ item: "", item_name: "" });
//   const [isEditing, setIsEditing] = useState(false);

//   // POS specific states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");

//   const phoneRef = useRef(null);
//   const barcodeRef = useRef(null);
//   const fullNameRef = useRef(null);
//   const searchRef = useRef(null);

//   const itemsPOSRefs = {
//   search: searchRef,
//   barcode: barcodeRef

// };
// const invoiceFormRefs = {
//   invoice_date: useRef(null),
//   phone_no: phoneRef,
//   full_name: fullNameRef,
//   book_id: useRef(null),
//   invoice_status: useRef(null),
//   alert_date: useRef(null),
//   advance: useRef(null),
// };
//   const handleInvoiceChange = (event) => {
//     setSelectedInvoiceType(event.target.value);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getUTCDate()).padStart(2, "0");
//     const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//     const year = date.getUTCFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   const formatDateNew = (date) => {
//     return date
//       .toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       })
//       .replace(",", "");
//   };

//   const [data, setData] = useState([]);

//   const [report, getAllReports] = useState({
//     from_date: "",
//     to_date: "",
//     type: "",
//     gst_or_without: "gst",
//     medicine_type: "",
//   });

//   const handleDateChangeForm = (date) => {
//     if (!date) return;
//     const backendDate = format(date, "yyyy-MM-dd");
//     setFormData({ ...formData, invoice_date: date });
//   };

//   // Enhanced handleItemCardClick to handle stock_id parameter
//   const handleItemCardClick = (selectedItem, stockId = null) => {
//     const itemPrice = selectedItem.price || 0;
//     const finalPrice = selectedItem.final_price || 0;
//     const itemDiscount = selectedItem.discount || 0;
//     const discountedPrice = itemPrice - itemDiscount;

//     // Check if item already exists in table
//     const existingItemIndex = tableData.findIndex(
//       (item) =>
//         item.item === selectedItem.id && (!stockId || item.stock_id === stockId)
//     );

//     if (existingItemIndex !== -1) {
//       // Item exists, increase quantity by 1
//       const updatedTableData = [...tableData];
//       const currentQuantity =
//         parseFloat(updatedTableData[existingItemIndex].quantity) || 0;
//       const newQuantity = currentQuantity + 1;

//       updatedTableData[existingItemIndex] = {
//         ...updatedTableData[existingItemIndex],
//         quantity: newQuantity,
//         total: (
//           updatedTableData[existingItemIndex].rate_after_discount * newQuantity
//         ).toFixed(2),
//       };

//       setTableData(updatedTableData);
//     } else {
//       // Item doesn't exist, add new item with quantity 1
//       const newItem = {
//         item: selectedItem.id,
//         item_name: selectedItem.items,
//         location: selectedItem.location || "",
//         price: itemPrice,
//         final_price: finalPrice,
//         discount: itemDiscount,
//         quantity: 1,
//         rate_after_discount: discountedPrice,
//         total: discountedPrice.toFixed(2),
//         return_unit: 0,
//         total_return_amount: 0,
//         stock_type: selectedItem.stock_type || "",
//         stock_id: stockId || "", // Store the stock_id from composite barcode
//         hidden_id: "",
//         reserve_price: itemPrice,
//         reserve_discount: itemDiscount,
//         reserve_quantity: 1,
//         rate_after_discount_reserve: discountedPrice,
//         total_reserve: discountedPrice.toFixed(2),
//         reserve_return_unit: 0,
//         reserve_total_return_amount: 0,
//         reserve_stock_id: stockId || 0, // Store the stock_id
//         actual_edit_item: "",
//         rack_no: "",
//         gst: 0,
//         formula: "",
//         invoice_date: formData.invoice_date,
//         phone_no: formData.phone_no,
//         full_name: formData.full_name,
//         age: formData.age,
//         delivery_date: formData.delivery_date,
//         advance: formData.advance,
//         grand_total: formData.grand_total,
//         remaining_amount: formData.remaining_amount,
//         book_id: formData.book_id
//       };

//       setTableData([newItem, ...tableData]);
//     }
//   };

//   const handleBarcodeInput = (barcodeValue) => {
//     if (!barcodeValue.trim()) return;

//     let foundItem = null;
//     let stockId = null;

//     // Check if barcode is in composite format (barcodeno,stock_id)
//     // const compositeMatch = barcodeValue.match(/^\((.+),(\d+)\)$/);

//     const compositeMatch = barcodeValue.match(/^\(?(.+),(\d+)\)?$/);

//     if (compositeMatch) {
//       // Handle composite barcode format (barcodeno,stock_id)
//       const [, barcodeNo, extractedStockId] = compositeMatch;
//       stockId = parseInt(extractedStockId);

//       // Find item by barcode number
//       foundItem = items.find(
//         (item) =>
//           item.barcode === barcodeNo ||
//           item.barcode_no === barcodeNo ||
//           item.id.toString() === barcodeNo
//       );

//       if (foundItem) {
//         // Validate stock_id exists for this item (optional validation)
//         // You might want to add API call here to validate stock_id
//         console.log(
//           `Found item with composite barcode: ${barcodeNo}, Stock ID: ${stockId}`
//         );
//       }
//     } else {
//       // Handle regular barcode format
//       foundItem = items.find(
//         (item) =>
//           item.barcode === barcodeValue ||
//           item.barcode_no === barcodeValue ||
//           item.id.toString() === barcodeValue
//       );
//     }

//     if (foundItem) {
//       handleItemCardClick(foundItem, stockId);
//       setBarcodeInput(""); // Clear barcode input after successful scan

//       // Focus back to barcode input for next scan
//       setTimeout(() => {
//         barcodeRef.current?.focus();
//       }, 100);
//     } else {
//       const errorMsg = compositeMatch
//         ? `Item with barcode ${compositeMatch[1]} not found!`
//         : `Item with barcode ${barcodeValue} not found!`;
//       toast.error(errorMsg);
//       setBarcodeInput("");
//     }
//   };

//   // Add this to handle barcode input changes and Enter key
//   const handleBarcodeChange = (e) => {
//     setBarcodeInput(e.target.value);
//   };

//   const handleBarcodeKeyPress = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleBarcodeInput(barcodeInput);
//     }
//   };

//   // Also update the useEffect for focus to include barcode input
//   useEffect(() => {
//     // Focus on barcode input after phone number is filled
//     if (formData.phone_no && formData.phone_no.length >= 11) {
//       setTimeout(() => {
//         barcodeRef.current?.focus();
//       }, 100);
//     } else {
//       // phoneRef.current?.focus();
//     }
//   }, []);

//   // Get unique categories from items
//   const categories = [
//     "All",
//     ...new Set(items.map((item) => item.category || "Other")),
//   ];

//   // Filter items based on search and category
//   // const filteredItems = items.filter((item) => {
//   //   const matchesSearch = item.items
//   //     .toLowerCase()
//   //     .includes(searchTerm.toLowerCase());
//   //   const matchesCategory =
//   //     selectedCategory === "All" ||
//   //     (item.category || "Other") === selectedCategory;
//   //   return matchesSearch && matchesCategory;
//   // });

//   // Filter and sort items based on search and category
//   const filteredItems = items
//     .filter((item) => {
//       const matchesSearch = item.items
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase());
//       const matchesCategory =
//         selectedCategory === "All" ||
//         (item.category || "Other") === selectedCategory;
//       return matchesSearch && matchesCategory;
//     })
//     .sort((a, b) => {
//       // Sort alphabetically by item name (case-insensitive)
//       const nameA = (a.items || "").toUpperCase();
//       const nameB = (b.items || "").toUpperCase();
      
//       if (nameA < nameB) return -1;
//       if (nameA > nameB) return 1;
//       return 0;
//     });

//   function refreshData() {
//     window.location.reload();
//   }

//   function getBackup() {
//     setBakupLoading(true);
//     axios
//       .get("http://localhost:4000/backup")
//       .then((res) => {
//         toast.success("Backup Saved Successfully!");
//         setBakupLoading(false);
//       })
//       .catch((err) => {
//         setBakupLoading(false);
//         if (err.response) {
//           console.error("Error Response:", err.response);
//           toast.error(
//             `Error: ${err.response.data.message || "Something went wrong!"}`
//           );
//         } else if (err.request) {
//           console.error("Error Request:", err.request);
//           toast.error("Token Refresh! Please Get Backup Again");
//         } else {
//           console.error("General Error:", err.message);
//           toast.error(`Error: ${err.message}`);
//         }
//       });
//   }

//   function getIncomeReport() {
//     setShowDatesForReport(true);
//   }

//   const editInvoice = (invoice_no_get) => {
//     axios
//       .get(
//         `${process.env.REACT_APP_API_URL}/get-invoice-no-pharmacy/${invoice_no_get}`
//       )
//       .then((response) => {
//         const invoiceData = response.data.results;

//         setFormData({
//           ...formData,
//           invoice_date: invoiceData[0].invoice_date,
//           phone_no: invoiceData[0].phone_no,
//           full_name: invoiceData[0].full_name,
//           age: invoiceData[0].age,
//           invoice_date: invoiceData[0].invoice_date,
//           book_id: invoiceData[0].book_id,
//           invoice_status: invoiceData[0].invoice_status,
//           alert_date: invoiceData[0].alert_date,
//           advance: invoiceData[0].advance,
//           grand_total: invoiceData[0].grand_total,
//           delivery_date: invoiceData[0].delivery_date,
//           remaining_amount: invoiceData[0].remaining_amount,
//           hidden_id: "",
//         });

//         setPatientId(invoiceData[0].patient_id);
//         setDoctorInvoiceId(invoiceData[0].doctor_invoice_id);
//         setSelectedInvoiceType(invoiceData[0].invoice_type);

//         setInvoiceUpdate({
//           ...invoiceNoUpdate,
//           invoice_no: invoice_no_get,
//         });

//         const transformedData = invoiceData.map((item) => {
//           return {
//             invoice_date: item.invoice_date,
//             phone_no: item.phone_no,
//             full_name: item.full_name,
//             age: item.age,
//             item: item.item,
//             hidden_id: item.id,
//             item_name: item.item_name,
//             price: parseFloat(item.price).toFixed(2),
//             reserve_price: parseFloat(item.price).toFixed(2),
//             quantity: item.quantity,
//             reserve_quantity: item.quantity,
//             discount: item.discount,
//             reserve_discount: item.discount,
//             rate_after_discount: item.price_after_discount,
//             rate_after_discount_reserve: item.price_after_discount,
//             stock_type: item.stock_type,
//             total: item.total,
//             total_reserve: item.total,
//             stock_id: item.stock_id,
//             rack_no: item.rack_no,
//             gst: item.gst,
//             formula: item.formula,
//             invoice_no: item.invoice_no,
//             reserve_stock_id: item.stock_id,
//             actual_edit_item: item.item,
//             return_unit: item.return_unit,
//             reserve_return_unit: item.return_unit,
//             total_return_amount: item.total_return_amount,
//             reserve_total_return_amount: item.total_return_amount,
//              location: item.location,
//           };
//         });

//         setTableData(transformedData);
//         setFormDisabled(false);
//         setShow(false);
        
//         // Set focus to search field after invoice is loaded
//         setActiveBlock('itemsPOS');
//         setActiveFieldIndex(0);
//         setTimeout(() => {
//           searchRef.current?.focus();
//         }, 100);
       
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   };

//   const ViewInvoice = (invoice_no) => {
//     axios
//       .get(`${process.env.REACT_APP_API_URL}/view-invoice-new-pharmacy`, {
//         params: {
//           invoice_no: invoice_no,
//         },
//       })
//       .then((res) => {
//         let results = res.data.results;
//         setInvoiceData(results);
//         setIsModalOpen(true);
//       })
//       .catch((err) => console.log(err));
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;

//     if (name === "item") {
//       const selectedItem = items.find((item) => item.id === parseInt(value));
//       const itemName = selectedItem ? selectedItem.items : "";
//       setFormData({
//         ...formData,
//         [name]: value,
//         item_name: itemName,
//       });
//     } else {
//       const updatedFormData = {
//         ...formData,
//         [name]: value,
//       };

//       // Reset advance to 0 when invoice_status is unpaid
//       if (name === "invoice_status" && value === "unpaid") {
//         updatedFormData.advance = 0;
//       }

//       if (
//         name === "rate" ||
//         name === "price" ||
//         name === "quantity" ||
//         name === "discount" ||
//         name === "return_unit"
//       ) {
//         const price = parseFloat(updatedFormData.price);
//         const discount = parseFloat(updatedFormData.discount);
//         updatedFormData.rate_after_discount = price - discount;
//         const return_unit = parseFloat(updatedFormData.return_unit);
//         const quantity = parseFloat(updatedFormData.quantity);
//         let total = updatedFormData.rate_after_discount * quantity;
//         updatedFormData.total_return_amount =
//           return_unit * updatedFormData.rate_after_discount;
//         updatedFormData.total = total.toFixed(2);
//       }
//       setFormData(updatedFormData);
//     }
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     if (formData.item == "") {
//       return;
//     }

//     if (formData.invoice_date == "" || formData.invoice_date == null) {
//       alert("Date is wrong! Reselect");
//     }

//     if (editIndex !== null && editIndex >= 0 && editIndex < tableData.length) {
//       setTableData((currentTableData) => {
//         const updatedTableData = [...currentTableData];
//         updatedTableData[editIndex] = { ...formData };
//         return updatedTableData;
//       });

//       setEditIndex(null);
//       resetFormData();
//       setIsEditing(false);
//     } else {
//       setTableData((currentTableData) => [formData, ...currentTableData]);
//       resetFormData();
//     }
//   };

//   const resetFormData = () => {
//     setFormData({
//       ...formData,
//       item: "",
//       price: 0,
//       final_price: 0,
//       quantity: 1,
//       discount: 0,
//       rate_after_discount: 0,
//       total: 0,
//       stock: 0,
//       rack_no: "",
//       stock_id: "",
//       formula: "",
//       stock_remain: 0,
//       item_name: "",
//       barcode_no: "",
//       hidden_id: "",
//       reserve_quantity: 0,
//       reserve_stock_id: "",
//       actual_edit_item: "",
//       return_unit: 0,
//       total_return_amount: 0,
//     });
//   };

//   const handleEdit = (index) => {
//     if (formData.hidden_id !== "") {
//       if (tableData[index].hidden_id == formData.hidden_id) {
//         return false;
//       }
//     }

//     setIsEditing(true);
//     setFormDisabled(false);
//     setFormData(tableData[index]);
//     const selectedInvoice = tableData[index];
//     setEditIndex(index);
//   };

//   const handleDelete = (index) => {
//     let updatedTableData = [...tableData];
//     updatedTableData.splice(index, 1);
//     setTableData(updatedTableData);
//   };

//   // Calculate totals
//   const totals = tableData.reduce(
//     (acc, item) => {
//       acc.totalQuantity += parseFloat(item.quantity) || 0;
//       acc.totalAmount += parseFloat(item.total) || 0;
//       return acc;
//     },
//     { totalQuantity: 0, totalAmount: 0 }
//   );

//   const calculateDiscount = (get_discount) => {
//     // Your existing discount calculation logic
//   };

//   useEffect(() => {
//     const newTotals = tableData.reduce(
//       (acc, item) => {
//         acc.totalQuantity += parseFloat(item.quantity) || 0;
//         acc.totalAmount += parseFloat(item.total) || 0;
//         return acc;
//       },
//       { totalQuantity: 0, totalAmount: 0 }
//     );

//     setFormData((prevState) => ({
//       ...prevState,
//       grand_total: newTotals.totalAmount.toFixed(2),
//       remaining_amount: newTotals.totalAmount.toFixed(2),
//     }));
//   }, [tableData]);

//   const filteredStockOptions = getStock
//     ? getStock
//         .filter((stock) =>
//           formData.hidden_id ? true : stock.remaining_quantity > 0
//         )
//         .map((stock) => {
//           return {
//             value: stock.stock_id,
//             label: `Invoice: ${stock.invoice_no} (Remaining: ${stock.remaining_quantity}, Stock Date: ${stock.earliest_expiry})`,
//             rack_no: stock.rack_no,
//             final_price: stock.final_price,
//             get_stock:
//               stock.remaining_quantity +
//               (stock.stock_id == formData.reserve_stock_id
//                 ? Number(Number(formData.reserve_quantity).toFixed())
//                 : 0),
//           };
//         })
//     : [];

//   const calculateDaysDifference = (fromDate, toDate) => {
//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     const differenceInTime = to.getTime() - from.getTime();
//     return Math.ceil(differenceInTime / (1000 * 3600 * 24));
//   };

//   const isDateDifferenceValid =
//     report.from_date &&
//     report.to_date &&
//     calculateDaysDifference(report.from_date, report.to_date) > 1;

//   const deleteItem = (id, index) => {
//     axios
//       .get(
//         `${process.env.REACT_APP_API_URL}/delete-invoice-item-pharmacy/${id}`
//       )
//       .then((response) => {
//         toast.error("Item Deleted Successfully!");
//         let updatedTableData = [...tableData];
//         updatedTableData.splice(index, 1);
//         setTableData(updatedTableData);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   };

//   // const remaining =
//   //   formData.advance > 0
//   //     ? (parseFloat(formData.grand_total) || 0) -
//   //       (parseFloat(formData.advance) || 0)
//   //     : 0;

//   const remaining =
//     formData.invoice_status === "unpaid"
//       ? parseFloat(formData.grand_total) || 0 // Set remaining to grand_total if unpaid
//       : formData.advance > 0
//       ? (parseFloat(formData.grand_total) || 0) -
//         (parseFloat(formData.advance) || 0)
//       : 0;

//   useEffect(() => {
//     setTableData((prevTableData) =>
//       prevTableData.map((item) => ({
//         ...item,
//         invoice_date: formData.invoice_date,
//         phone_no: formData.phone_no,
//         full_name: formData.full_name,
//         age: formData.age,
//         delivery_date: formData.delivery_date,
//         advance: formData.advance,
//         grand_total: formData.grand_total,
//         remaining_amount: remaining,
//         book_id: formData.book_id,
//         invoice_status: formData.invoice_status,
//         alert_date: formData.alert_date,
//       }))
//     );
//   }, [
//     formData.invoice_date,
//     formData.phone_no,
//     formData.full_name,
//     formData.rack_no,
//     formData.delivery_date,
//     formData.advance,
//     formData.grand_total,
//     remaining,
//     formData.book_id,
//     formData.invoice_status,
//     formData.alert_date,
//   ]);

//   const tableDataRef = useRef(tableData);

//   useEffect(() => {
//     tableDataRef.current = tableData;
//   }, [tableData]);

//   const handleSaveAllData = useCallback(async () => {
//     // console.log(formData.invoice_no);

//     if (
//       formData.phone_no.length !== 12 &&
//       tableDataRef.current.length <= 0 &&
//       invoiceNoUpdate.invoice_no == ""
//     ) {
//       return false;
//     }

//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_API_URL}/insert-invoice-pharmacy`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             tableData: tableDataRef.current,
//             invoice_no_get: invoiceNoUpdate.invoice_no,
//             patient_id: patientIdGet,
//             doctor_id: doctorInvoiceId,
//             rack_no: formData.rack_no,
//             delivery_date: formData.delivery_date,
//             advance: formData.advance,
//             grand_total: formData.grand_total,
//             remaining_amount: remaining,
//             book_id: formData.book_id,
//             phone_no_type: contactMethod,
//             invoice_type: selectedInvoiceType,
//             invoice_status: formData.invoice_status,
//             alert_date: formData.alert_date,
//              user_name: user.user.username
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         if (response.status === 404 && data.error) {
//           throw new Error(data.error);
//         }
//         throw new Error(data.message || "Failed to insert invoice data");
//       }

//       setInvoiceData(data.items);
//       setIsModalOpen(true);

//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         item: "",
//         price: 0,
//         quantity: 1,
//         discount: 0,
//         rate_after_discount: 0,
//         reserve_stock_id: 0,
//         actual_edit_item: "",
//         total: 0,
//         stock: 0,
//         rack_no: "",
//         stock_id: "",
//         formula: "",
//         final_price: 0,
//         stock_remain: 0,
//         item_name: "",
//         hidden_id: "",
//         invoice_no: "",
//         phone_no: "",
//         full_name: "",
//         age: "",
//         barcode_no: "",
//         reserve_quantity: 0,
//         gst: 0,
//         delivery_date: "",
//         advance: 0,
//         book_id: "",
//         invoice_status: "",
//         alert_date: "",
//       }));
//       setTableData([]);
//       updateInvoiceTable([]);
//       let message = "Invoice Created Successfully!";
//       notify(message);
//       setInvoiceUpdate((prevFormData) => ({
//         ...prevFormData,
//         invoice_no: "",
//       }));
//       setFormDisabled(false);
//       setPatientId(0);
//       setDoctorInvoiceId(0);
//     } catch (error) {
//       const errorMessage = error.message || "Failed to create invoice";
//       notify(errorMessage);
//       console.error("Error sending data:", error);
//     }
//   }, [
//     selectedInvoiceType,
//     invoiceNoUpdate,
//     contactMethod,
//     formData.advance,
//     formData.delivery_date,
//     formData.grand_total,
//     formData.book_id,
//     remaining,
//     formData.rack_no,
//     formData.invoice_status,
//     formData.alert_date,
//   ]);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.ctrlKey && event.key === "s" && checkComponent == "pharmacy") {
//         event.preventDefault();
//         handleSaveAllData();
//         if (tableDataRef.current?.length > 0) {
//           setFormDisabled(false);
//           setActiveBlock('itemsPOS')
//         }
//       }
//       if (event.ctrlKey && event.key === "i" && checkComponent == "pharmacy") {
//       event.preventDefault();
//       setShow("invoice");
//       resetFormData();
//     }
//     };



//     if (checkComponent == "pharmacy") {
//       window.addEventListener("keydown", handleKeyDown);
//     }

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [checkComponent, handleSaveAllData, showEdit]);

//   const handleFetch = (invoice_no, patient_id, phone_no) => {
//     axios
//       .post(
//         `${process.env.REACT_APP_API_URL}/fetch-customer-data-for-pharmacy`,
//         {
//           patient_id,
//           phone_no,
//         }
//       )
//       .then((response) => {
//         const customerData = response.data.results[0];
//         if (customerData) {
//           setFormData((prevState) => ({
//             ...prevState,
//             full_name: customerData.name,
//             phone_no: customerData.contact,
//             age: customerData.age,
//           }));
//         }
//         console.log("Customer Data:", customerData);
//         setFormDisabled(false);
//         fullNameRef.current?.focus();
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   };

//   useEffect(() => {
//     handleFetch(invoiceNo, patientId, formData.phone_no);
//   }, [invoiceNo, patientId]);




//   const handleRateChange = (e, index) => {
//   const value = e.target.value;
  
//   // Allow empty string, numbers with optional decimal point
//   if (value === '' || /^\d*\.?\d*$/.test(value)) {
//     const newData = [...tableData];
//     const newRate = parseFloat(value) || 0;
//     const discount = parseFloat(newData[index].discount) || 0;
//     const quantity = parseFloat(newData[index].quantity) || 0;
    
//     newData[index].price = value; // Store the actual input value
//     newData[index].rate_after_discount = (newRate * quantity - discount).toFixed(2);
//     newData[index].total = newData[index].rate_after_discount;
    
//     setTableData(newData);
//   }
// };

// const handleQuantityChange = (e, index) => {
//   const value = e.target.value;
  
//   // Allow empty string, numbers with optional decimal point
//   if (value === '' || /^\d*\.?\d*$/.test(value)) {
//     const newData = [...tableData];
//     const newQuantity = parseFloat(value) || 0;
//     const price = parseFloat(newData[index].price) || 0;
//     const discount = parseFloat(newData[index].discount) || 0;
    
//     newData[index].quantity = value; // Store the actual input value
//     newData[index].rate_after_discount = (price * newQuantity - discount).toFixed(2);
//     newData[index].total = newData[index].rate_after_discount;
    
//     setTableData(newData);
//   }
// };

// const handleDiscountChange = (e, index) => {
//   const value = e.target.value;
  
//   // Allow empty string, numbers with optional decimal point
//   if (value === '' || /^\d*\.?\d*$/.test(value)) {
//     const newData = [...tableData];
//     const newDiscount = parseFloat(value) || 0;
//     const price = parseFloat(newData[index].price) || 0;
//     const quantity = parseFloat(newData[index].quantity) || 0;
    
//     newData[index].discount = value; // Store the actual input value
//     newData[index].rate_after_discount = (price * quantity - newDiscount).toFixed(2);
//     newData[index].total = newData[index].rate_after_discount;
    
//     setTableData(newData);
//   }
// };





//   const handleTotalChange = (e, index) => {
//     const newData = [...tableData];
//     newData[index].total = parseFloat(e.target.value).toFixed(2);
//     setTableData(newData);
//   };

//   const handleAfterDiscountChange = (e, index) => {
//     const newData = [...tableData];
//     const newAfterDiscount = parseFloat(e.target.value);
//     const currentItemId = newData[index].item;

//     newData.forEach((item, idx) => {
//       if (item.item === currentItemId) {
//         newData[idx].rate_after_discount = newAfterDiscount;
//         newData[idx].total = (newAfterDiscount * newData[idx].quantity).toFixed(
//           2
//         );
//       }
//     });

//     setTableData(newData);
//   };

//   useEffect(() => {
//     phoneRef.current?.focus();
//   }, []);

//   const toggleContactMethod = () => {
//     setContactMethod((prev) => (prev === "phone" ? "whatsapp" : "phone"));
//   };




//   const getActiveBlockRefs = () => {
//     // console.log("Active Block:", activeBlock);
//   switch (activeBlock) {
//     case 'invoiceForm':
//       return Object.values(invoiceFormRefs).filter(ref => ref?.current);
//     case 'itemsPOS':
//       return Object.values(itemsPOSRefs).filter(ref => ref?.current);
//     case 'invoiceItems':
//       return invoiceItemsRefs.current.filter(ref => ref);
//     default:
//       return [];
//   }
// };

// const focusActiveField = () => {
//   const refs = getActiveBlockRefs();
//   if (refs[activeFieldIndex]?.focus) {
//     refs[activeFieldIndex].focus();
//   } else if (refs[activeFieldIndex]?.current?.focus) {
//     refs[activeFieldIndex].current.focus();
//   }
// };




// // useEffect(() => {
// //   const handleGlobalKeyDown = (e) => {
// //     // Don't interfere with Ctrl+S
// //     if (e.ctrlKey && e.key === 's') {
// //       return;
// //     }

// //     const activeElement = document.activeElement;
// //     const isInInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement?.tagName);

// useEffect(() => {
//   const handleGlobalKeyDown = (e) => {
//     // Don't interfere with Ctrl+S
//     if (e.ctrlKey && e.key === 's') {
//       return;
//     }

//     // Handle Ctrl+X for deleting invoice items
//     // if (e.ctrlKey && e.key === 'x' && activeBlock === 'invoiceItems') {
//     //   e.preventDefault();
//     //   const rowIndex = Math.floor(activeFieldIndex / 4); // 4 fields per row (Rate, Qty, Disc, Total)
//     //   if (rowIndex >= 0 && rowIndex < tableData.length) {
//     //     handleDelete(rowIndex);
//     //     toast.success('Item deleted successfully!');
//     //     // Adjust activeFieldIndex if needed
//     //     if (activeFieldIndex >= (tableData.length - 1) * 4) {
//     //       setActiveFieldIndex(Math.max(0, activeFieldIndex - 4));
//     //     }
//     //   }
//     //   return;
//     // }

//     // Handle Ctrl+X for deleting invoice items
// if (e.ctrlKey && e.key === 'x' && activeBlock === 'invoiceItems') {
//   e.preventDefault();
//   const rowIndex = Math.floor(activeFieldIndex / 3); // 3 editable fields per row (Rate, Qty, Disc)
//   if (rowIndex >= 0 && rowIndex < tableData.length) {
//     handleDelete(rowIndex);
//     // toast.success('Item deleted successfully!');
//     // Adjust activeFieldIndex if needed
//     if (activeFieldIndex >= (tableData.length - 1) * 3) {
//       setActiveFieldIndex(Math.max(0, activeFieldIndex - 3));
//     }
//   }
//   return;
// }

//     const activeElement = document.activeElement;
//     const isInInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement?.tagName);


//     // Ctrl+Left Arrow - Move to previous block (works even in input fields)
//     if (e.ctrlKey && e.key === 'ArrowLeft') {
//       e.preventDefault();
//       setActiveBlock(prev => {
//         if (prev === 'invoiceItems') return 'itemsPOS';
//         if (prev === 'itemsPOS') return 'invoiceForm';
//         return prev;
//       });
//       setActiveFieldIndex(0);
//       setSelectedItemIndex(-1);
//       return;
//     }

//     // Ctrl+Right Arrow - Move to next block (works even in input fields)
//     if (e.ctrlKey && e.key === 'ArrowRight') {
//       e.preventDefault();
//       setActiveBlock(prev => {
//         if (prev === 'invoiceForm') return 'itemsPOS';
//         if (prev === 'itemsPOS') return 'invoiceItems';
//         return prev;
//       });
//       setActiveFieldIndex(0);
//       setSelectedItemIndex(-1);
//       return;
//     }

//     // Left Arrow - Move to previous block (only when NOT in input)
//     if (e.key === 'ArrowLeft' && !isInInput) {
//       e.preventDefault();
//       setActiveBlock(prev => {
//         if (prev === 'invoiceItems') return 'itemsPOS';
//         if (prev === 'itemsPOS') return 'invoiceForm';
//         return prev;
//       });
//       setActiveFieldIndex(0);
//       setSelectedItemIndex(-1);
//     }

//     // Right Arrow - Move to next block (only when NOT in input)
//     if (e.key === 'ArrowRight' && !isInInput) {
//       e.preventDefault();
//       setActiveBlock(prev => {
//         if (prev === 'invoiceForm') return 'itemsPOS';
//         if (prev === 'itemsPOS') return 'invoiceItems';
//         return prev;
//       });
//       setActiveFieldIndex(0);
//       setSelectedItemIndex(-1);
//     }

//     // Handle navigation within Invoice Form block
//     if (activeBlock === 'invoiceForm' && isInInput) {
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         const refs = getActiveBlockRefs();
//         setActiveFieldIndex(prev => {
//           const next = prev < refs.length - 1 ? prev + 1 : prev;
//           return next;
//         });
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         setActiveFieldIndex(prev => {
//           const next = prev > 0 ? prev - 1 : 0;
//           return next;
//         });
//       }
//     }

//     // Handle navigation within Items POS block (item selection)
//     if (activeBlock === 'itemsPOS') {
//       const itemCount = filteredItems.length;
      
//       // If in search field
//       if (activeElement === searchRef.current) {
//         if (e.key === 'ArrowDown') {
//           e.preventDefault();
//           setSelectedItemIndex(prev => 
//             prev < itemCount - 1 ? prev + 1 : prev
//           );
//         } else if (e.key === 'ArrowUp') {
//           e.preventDefault();
//           setSelectedItemIndex(prev => 
//             prev > 0 ? prev - 1 : -1
//           );
//         } else if (e.key === 'Enter' && selectedItemIndex >= 0) {
//           e.preventDefault();
//           const selectedItem = filteredItems[selectedItemIndex];
//           if (selectedItem && !formDisabled) {
//             handleItemCardClick(selectedItem);
//             setSearchTerm('');
//             setSelectedItemIndex(-1);
//           }
//         }
//       }
      
//       // If in barcode field
//       if (activeElement === barcodeRef.current) {
//         if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
//           e.preventDefault();
//           const refs = getActiveBlockRefs();
//           setActiveFieldIndex(prev => {
//             const next = e.key === 'ArrowDown' 
//               ? (prev < refs.length - 1 ? prev + 1 : prev)
//               : (prev > 0 ? prev - 1 : 0);
//             return next;
//           });
//         }
//       }
//     }

//     // Handle navigation within Invoice Items block
//     if (activeBlock === 'invoiceItems' && isInInput) {
//       const currentRow = Math.floor(activeFieldIndex / 3); // 4 editable fields per row
//       const currentCol = activeFieldIndex % 3;
//       const totalRows = tableData.length;
//       const refs = getActiveBlockRefs();

//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         if (currentRow < totalRows - 1) {
//           setActiveFieldIndex(prev => prev + 3);
//         }
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         if (currentRow > 0) {
//           setActiveFieldIndex(prev => prev - 3);
//         }
//       } else if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
//         // Move to next field in same row if cursor is at end
//         if (currentCol < 3) {
//           e.preventDefault();
//           setActiveFieldIndex(prev => prev + 1);
//         }
//       } else if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) {
//         // Move to previous field in same row if cursor is at start
//         if (currentCol > 0) {
//           e.preventDefault();
//           setActiveFieldIndex(prev => prev - 1);
//         }
//       }
//     }

//     // Escape - Reset everything
//     if (e.key === 'Escape') {
//       setSelectedItemIndex(-1);
//       setActiveFieldIndex(0);
//       if (activeBlock === 'itemsPOS') {
//         setSearchTerm('');
//       }
//     }
//   };

//   window.addEventListener('keydown', handleGlobalKeyDown);
//   return () => window.removeEventListener('keydown', handleGlobalKeyDown);
// }, [activeBlock, activeFieldIndex, filteredItems, selectedItemIndex, formDisabled, tableData.length, searchTerm]);

// useEffect(() => {
//   setTimeout(() => {
//     focusActiveField();
//   }, 50);
// }, [activeBlock, activeFieldIndex]);


// useEffect(() => {
//   setSelectedItemIndex(-1);
// }, [searchTerm]);


// useEffect(() => {
//   if (selectedItemIndex >= 0 && activeBlock === 'itemsPOS') {
//     const element = document.getElementById(`item-card-${selectedItemIndex}`);
//     if (element) {
//       element.scrollIntoView({ 
//         behavior: 'smooth', 
//         block: 'nearest' 
//       });
//     }
//   }
// }, [selectedItemIndex, activeBlock]);


// useEffect(() => {
//   invoiceItemsRefs.current = [];
// }, [tableData]);

//   return (
//     <div>
//       <div className="d-flex justify-content-center flex-wrap mt-2">
//         <a href="#" className="btn btn-sm btn-warning mb-2 mr-2">
//           <Link to="/stock">
//             <i className="fas fa-truck"></i> Create Stock
//           </Link>
//         </a>

//      {user.user.user_type !== 'Receptionist' && (
//         <>
//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("stock_report")}
//         >
//           <i className="fas fa-chart-line"></i> Stock Report
//         </a>
        
        
//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("income_report")}
//         >
//           <i className="fas fa-hand-holding-usd"></i> Income Report
//         </a>

//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("paid_payments")}
//         >
//           <i className="fas fa-tag"></i> Add Rebates
//         </a>

//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("suppliers")}
//         >
//           <i className="fas fa-handshake"></i> Suppliers
//         </a>

//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("stock_deficit_report")}
//         >
//           <i className="fas fa-redo"></i> Stock Deficit
//         </a>
//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("expired_stock_report")}
//         >
//           <i class="fas fa-exclamation-triangle" title="Expired Stock"></i>{" "}
//           Expired Stock
//         </a>

        
//         </>
//         )}

//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => {
//             setShow("invoice");
//             resetFormData();
//           }}
//         >
//           <i className="fas fa-receipt"></i> Invoices
//         </a>
        

//  <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("add_expense")}
//         >
//           <i className="fas fa-minus-circle"></i>  Add Expense
//         </a>

//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => setShow("add_transactions")}
//         >
//           <i className="fas fa-exchange-alt"></i> Add Transactions
//         </a>

        
//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => {
//             setShow("bank_accounts");
//             resetFormData();
//           }}
//         >
//           <i className="fas fa-credit-card"></i> Bank Accounts
//         </a>

//         <a
//           href="#"
//           className="btn btn-sm btn-warning mb-2 mr-2"
//           onClick={() => {
//             setShow("heads");
//             resetFormData();
//           }}
//         >
//           <i className="fas fa-wallet"></i> Heads
//         </a>
//       </div>

//       <div className="d-flex">
//         {showBakupLoading && (
//           <div className="loading-container">
//             <div className="loading-text">
//               Backup is Being Created... Please wait
//             </div>
//           </div>
//         )}

//         <div>
//           {isVisible && (
//             <div>
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <h5>Invoice</h5>
//                 <a href="#" onClick={() => setIsVisible(false)}>
//                   <i className="fa fa-window-close"></i>
//                 </a>
//               </div>

//               <table className="tableStyle">
//                 <thead>
//                   <tr>
//                     <th>Item</th>
//                     <th>Price</th>
//                     <th>Quantity</th>
//                     <th>Discount</th>
//                     <th>After_Discount</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {invoiceData.map((item) => (
//                     <tr key={item.id}>
//                       <td> {item.item_name} </td>
//                       <td> {item.price} </td>
//                       <td> {item.quantity} </td>
//                       <td> {item.discount} </td>
//                       <td style={{ color: "green" }}>
//                         {item.price - (item.price / 100) * item.discount}
//                       </td>
//                       <td> {item.total} </td>
//                     </tr>
//                   ))}
//                   <tr>
//                     <td colSpan="5" className="text-right">
//                       <b>Grand Total (Rs.):</b>
//                     </td>
//                     <td className="text-left">
//                       {invoiceData.reduce(
//                         (acc, item) => acc + parseFloat(item.total),
//                         0
//                       )}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           )}

//           <div className={`d-flex ${showEdit ? "blur-background" : ""}`}>
//             {showEdit == "medicine" && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: "50%",
//                   left: "50%",
//                   transform: "translate(-50%, -50%)",
//                   zIndex: 1000,
//                   backgroundColor: "#fff",
//                   padding: "10px",
//                   border: "1px solid #ccc",
//                   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//                   width: "90%",
//                   maxWidth: "1600px",
//                   maxHeight: "90vh",
//                   overflowY: "auto",
//                   overflowX: "hidden",
//                 }}
//               >
//                 <div className="d-flex justify-content-end">
//                   <button
//                     className="btn btn-primary mr-2 mb-2"
//                     onClick={() => setShow(false)}
//                   >
//                     x
//                   </button>
//                 </div>
//                 <Home onClose={() => setShow(false)} />
//               </div>
//             )}

//             {/* {showEdit == "invoice" && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: "50%",
//                   left: "50%",
//                   transform: "translate(-50%, -50%)",
//                   zIndex: 1000,
//                   backgroundColor: "#fff",
//                   padding: "10px",
//                   border: "1px solid #ccc",
//                   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//                   width: "95%",
//                   height: "90vh",
//                   overflowY: "auto",
//                   overflowX: "hidden",
//                 }}
//               >
//                 <div className="d-flex justify-content-end">
//                   <button
//                     className="btn btn-primary mr-2 mb-2"
//                     onClick={() => setShow(false)}
//                   >
//                     x
//                   </button>
//                 </div>
//                 <InvoiceListPharmacy
//                   ViewInvoice={ViewInvoice}
//                   editInvoice={editInvoice}
//                   onClose={() => setShow(false)}
//                 />
//               </div>
//             )} */}


//             {showEdit === "invoice" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Invoice List"
//                 maxWidth="1400px"
//               >
//                 <InvoiceListPharmacy
//                   ViewInvoice={ViewInvoice}
//                   editInvoice={editInvoice}
//                   onClose={() => setShow(false)}
//                 />
//               </Modal>
//             )}

//             {showEdit == "Stock" && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: "50%",
//                   left: "50%",
//                   transform: "translate(-50%, -50%)",
//                   zIndex: 1000,
//                   backgroundColor: "#fff",
//                   padding: "10px",
//                   border: "1px solid #ccc",
//                   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//                   width: "98%",
//                   height: "98vh",
//                   overflowY: "auto",
//                   overflowX: "hidden",
//                 }}
//               >
//                 <div className="d-flex justify-content-end">
//                   <button
//                     className="btn btn-primary mr-2 mb-2"
//                     onClick={() => setShow(false)}
//                   >
//                     x
//                   </button>
//                 </div>
//                 <Stock onClose={() => setShow(false)} />
//               </div>
//             )}

//             {showEdit === "income_report" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Income Report"
//                 maxWidth="1400px"
//               >
//                 <IncomeReport onClose={() => setShow(false)} />
//               </Modal>
//             )}

//             {showEdit === "bank_accounts" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Bank Accounts"
//                 maxWidth="1400px"
//               >
//                 <BankAccounts onClose={() => setShow(false)} />
//               </Modal>
//             )}


//             {showEdit === "add_transactions" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Add Transactions"
//                 maxWidth="1400px"
//               >
//                 <AddTransaction onClose={() => setShow(false)} />
//               </Modal>
//             )}


//               {showEdit === "add_expense" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Add Expense"
//                 maxWidth="1400px"
//               >
//                 <DailyExpense onClose={() => setShow(false)} />
//               </Modal>
//             )}

//             {showEdit === "heads" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="(Expense Or Income) Head Form"
//                 maxWidth="1400px"
//               >
//                 <Heads onClose={() => setShow(false)} />
//               </Modal>
//             )}

//             {showEdit === "stock_report" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Stock Report"
//                 showFooter={false}
//               >
//                 <StockReport onClose={() => setShow(false)} />
//               </Modal>
//             )}

//             {showEdit === "stock_deficit_report" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Stock Deficit Report"
//                 showFooter={false}
//               >
//                 <StockDeficitReport onClose={() => setShow(false)} />
//               </Modal>
//             )}

//             {showEdit === "paid_payments" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Rebates"
//                 showFooter={false}
//               >
//                 <PaidPayments onClose={() => setShow(false)} />
//               </Modal>
//             )}

//             {showEdit === "expired_stock_report" && (
//               <Modal
//                 isOpen={true}
//                 onClose={() => setShow(false)}
//                 title="Expired Stock Alert"
//                 closeOnOutsideClick={false}
//               >
//                 <ExpiredStock onClose={() => setShow(false)} />
//               </Modal>
//             )}
//           </div>

//           {showEdit == "suppliers" && (
//             <SuppliersList
//               onClose={() => setShow(false)}
//               showEdit={showEdit}
//               setShow={setShow}
//             />
//           )}
//         </div>

//         {/* Customer Information Section */}
//        <div className={`col-md-3 p-2`} 
//     //  style={{ border: activeBlock === 'invoiceForm' ? '3px solid #007bff' : '' }}
//      >
//   <div className="border p-2">
//     <h5 className={`text-warning p-2 card-header ${activeBlock === 'invoiceForm' ? 'bg-primary' : 'bg-primary'}`}>
//       <i className="fas fa-shopping-cart"></i> Invoice Form
//       {activeBlock === 'invoiceForm' && (
//   <>
//     <i className="ml-2 fas fa-check-circle"></i>
//   </>
// )}
//     </h5>
//             <div className="p-3">
//               <div
//                 className="bg-light border rounded"
//                 style={{
//                   padding: "10px",
//                 }}
//               >
//                 <div className="flex pt-2 mb-2 pb-0 pl-3 bg-warning">
//                   <label className="flex items-center gap-2">
//                     <input
//                       type="radio"
//                       name="invoiceType"
//                       value="sale"
//                       checked={selectedInvoiceType === "sale"}
//                       onChange={handleInvoiceChange}
//                       className="h-5 w-5 text-blue-600"
//                     />
//                     <span className="text-lg"> Sale</span>
//                   </label>
//                   <label className="flex items-center gap-2 ml-3">
//                     <input
//                       type="radio"
//                       name="invoiceType"
//                       value="quotation"
//                       checked={selectedInvoiceType === "quotation"}
//                       onChange={handleInvoiceChange}
//                       className="h-5 w-5 text-blue-600"
//                     />
//                     <span className="text-lg"> Quotation</span>
//                   </label>

//                   <label className="flex items-center gap-2 ml-3">
//                     <input
//                       type="radio"
//                       name="invoiceType"
//                       value="hold"
//                       checked={selectedInvoiceType === "hold"}
//                       onChange={handleInvoiceChange}
//                       className="h-5 w-5 text-blue-600"
//                     />
//                     <span className="text-lg"> Hold</span>
//                   </label>
//                 </div>

//                <div className="form-group row mt-3">
//       <label htmlFor="invoice_date" className="col-sm-2 col-form-label">Date</label>
//       <div className="col-sm-10 w-100 d-block">
//         <DatePicker
//           ref={invoiceFormRefs.invoice_date}
//           selected={formData.invoice_date}
//           onChange={handleDateChangeForm}
//           dateFormat="dd-MM-yyyy"
//           className="form-control d-block w-100"
//           placeholderText="Select Date"
//           readOnly
//         />
//       </div>
//     </div>

//                 <div className="form-group row mt-3">
//                   <label htmlFor="army_no" className="col-sm-2 col-form-label">
//                     Ph#
//                   </label>
//                   <div className="col-sm-10">
//                     <input
//                       ref={phoneRef}
//                       type="text"
//                       id="phone_no"
//                       name="phone_no"
//                       value={formData.phone_no}
//                       onChange={(e) => {
//                         let input = e.target.value.replace(/\D/g, "");

//                         if (!input.startsWith("92") && input.length > 0) {
//                           input = "92" + input;
//                         }

//                         if (input.length > 12) {
//                           input = input.slice(0, 12);
//                         }

//                         handleInputChange({
//                           target: {
//                             name: "phone_no",
//                             value: input,
//                           },
//                         });
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           handleFetch(invoiceNo, patientId, formData.phone_no);
//                           setTimeout(() => {
//                             fullNameRef.current?.focus();
//                           }, 100);
//                         }
//                       }}
//                       maxLength="12"
//                       placeholder="923001234567"
//                       className="form-control"
//                     />
//                   </div>

//                   <div className="col-sm-2 d-none">
//                     <button
//                       type="button"
//                       className={`btn btn-sm btn-${
//                         contactMethod === "whatsapp" ? "success" : "primary"
//                       }`}
//                       onClick={toggleContactMethod}
//                     >
//                       {contactMethod === "whatsapp" ? "WA" : "Ph"}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="form-group row mt-3">
//                   <label
//                     htmlFor="full_name"
//                     className="col-sm-2 col-form-label"
//                   >
//                     Name
//                   </label>
//                   <div className="col-sm-10">
//                     <input
//                       ref={fullNameRef}
//                       type="text"
//                       id="full_name"
//                       name="full_name"
//                       value={formData.full_name}
//                       onChange={handleInputChange}
//                       placeholder="Full Name"
//                       className="form-control"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group row mt-3">
//       <label htmlFor="book_id" className="col-sm-2 col-form-label">ID</label>
//       <div className="col-sm-10">
//         <input
//           ref={invoiceFormRefs.book_id}
//           type="text"
//           id="book_id"
//           name="book_id"
//           value={formData.book_id || ""}
//           onChange={handleInputChange}
//           placeholder="Enter Book ID"
//           className="form-control"
//         />
//       </div>
//     </div>
//                 <div className="form-group row mt-3">
//       <label htmlFor="invoice_status" className="col-sm-2 col-form-label">Status</label>
//       <div className="col-sm-10">
//         <select
//           ref={invoiceFormRefs.invoice_status}
//           id="invoice_status"
//           name="invoice_status"
//           value={formData.invoice_status}
//           onChange={handleInputChange}
//           className="form-control"
//         >
//           <option value="paid">Paid</option>
//           <option value="unpaid">Unpaid</option>
//         </select>
//       </div>
//     </div>

//                {(remaining > 0 || formData.invoice_status === "unpaid") && (
//       <div className="form-group row mt-3">
//         <label htmlFor="alert_date" className="col-sm-2 col-form-label">Alert</label>
//         <div className="col-sm-10">
//           <input
//             ref={invoiceFormRefs.alert_date}
//             type="date"
//             id="alert_date"
//             name="alert_date"
//             value={formData.alert_date || ""}
//             onChange={handleInputChange}
//             className="form-control"
//           />
//         </div>
//       </div>
//     )}
//               </div>

//               {/* Totals and Save Section */}
//               <div className="mt-3 p-3 bg-light border rounded">
//                 <div className="row">
//                   <div className="col-12 mb-2">
//                     <label className="d-block">
//                       <i className="fas fa-calculator"></i> Total Amount
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control text-center bg-primary text-white font-weight-bold"
//                       value={totals.totalAmount.toFixed(2)}
//                       disabled
//                       style={{ fontSize: "18px" }}
//                     />
//                   </div>

//                   <div className="col-6 mb-2">
//       <label className="d-block">
//         <i className="fas fa-money-bill-wave"></i> Advance
//       </label>
//       <input
//         ref={invoiceFormRefs.advance}
//         readOnly={formData.invoice_status == "unpaid" ? true : false}
//         type="number"
//         id="advance"
//         name="advance"
//         value={formData.advance}
//         onChange={(e) => {
//           setFormData((prev) => ({
//             ...prev,
//             advance: e.target.value,
//           }));
//         }}
//         placeholder="Advance"
//         className="form-control"
//         disabled={formDisabled}
//       />
//     </div>

//                   <div className="col-6 mb-2">
//                     <label className="d-block">
//                       <i className="fas fa-wallet"></i> Remaining
//                     </label>
//                     <input
//                       type="text"
//                       value={remaining}
//                       readOnly
//                       className="form-control"
//                       disabled={formDisabled}
//                     />
//                   </div>

//                   <div className="col-12">
//                     <button
//                       className="btn btn-warning btn-block"
//                       style={{ fontSize: "18px", padding: "5px" }}
//                       onClick={handleSaveAllData}
//                     >
//                       <i className="fas fa-print"></i> Save Invoice
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={`col-md-4 p-2`}
//     //  style={{ border: activeBlock === 'itemsPOS' ? '3px solid #28a745' : '' }}
//      >
//   <div className="border p-2">
//     <h5 className={`text-warning p-2 card-header ${activeBlock === 'itemsPOS' ? 'bg-primary' : 'bg-primary'}`}>
//       <i className="fas fa-plus-square"></i> Items (POS)
//       {activeBlock === 'itemsPOS' && <i className="ml-2 fas fa-check-circle"></i>}
//     </h5>
//             <div className="p-3">
//               <div className="mb-3">
//                 <div className="input-group mb-2">
//                   <div className="input-group-prepend">
//                     <span className="input-group-text bg-warning">
//                       <i className="fas fa-barcode"></i>
//                     </span>
//                   </div>
//                   <input
//                     // ref={barcodeRef}
//                     type="text"
//                     className="form-control"
//                     placeholder="Scan barcode or enter (barcode,stock_id)..."
//                     value={barcodeInput}
//                     onChange={handleBarcodeChange}
//                     onKeyPress={handleBarcodeKeyPress}
//                     disabled={formDisabled}
//                     style={{
//                       backgroundColor: formDisabled ? "#f8f9fa" : "#ffffff",
//                       fontSize: "16px",
//                       fontWeight: "bold",
//                     }}
//                   />
//                   <div className="input-group-append">
//                     <button
//                       className="btn btn-warning"
//                       type="button"
//                       onClick={() => handleBarcodeInput(barcodeInput)}
//                       disabled={formDisabled || !barcodeInput.trim()}
//                     >
//                       <i className="fas fa-plus"></i>
//                     </button>
//                   </div>
//                 </div>
//                 <small className="text-muted">
//                   <i className="fas fa-info-circle"></i> Examples: "1234" or
//                   "(1234,4)" for barcode with stock ID
//                 </small>
//               </div>

//               {/* Search and Category Filter */}
//               <div className="mb-3">
//                 <div className="input-group mb-2">
//                   <div className="input-group-prepend">
//                     <span className="input-group-text">
//                       <i className="fas fa-search"></i>
//                     </span>
//                   </div>
//                   <input
//                     ref={searchRef}
//                     type="text"
//                     className="form-control"
//                     placeholder="Search items..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     disabled={formDisabled}
//                   />
//                 </div>

//                 <select
//                   className="form-control d-none"
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   disabled={formDisabled}
//                 >
//                   {categories.map((category) => (
//                     <option key={category} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Items Grid */}
//               <div
//                 style={{
//                   maxHeight: "55vh", // Reduced slightly to accommodate barcode input
//                   overflowY: "auto",
//                   overflowX: "hidden",
//                 }}
//               >
//                 <div className="row">
//                   {filteredItems.map((item, idx) => {
//       const existingItem = tableData.find(
//         (tableItem) => tableItem.item === item.id
//       );
//       const currentQuantity = existingItem
//         ? parseFloat(existingItem.quantity) || 0
//         : 0;
      
//       const isSelected = idx === selectedItemIndex;

//       return (
//         <div key={item.id} className="col-12 mb-2">
//           <div
//             id={`item-card-${idx}`}
//             className={`card h-100 shadow-sm cursor-pointer ${
//               currentQuantity > 0 ? "border-primary" : ""
//             } ${isSelected ? "border-success" : ""}`}
//             style={{
//               cursor: "pointer",
//               transition: "all 0.2s",
//               backgroundColor: formDisabled
//                 ? "#f8f9fa"
//                 : isSelected 
//                 ? "#d4edda" 
//                 : "#ffffff",
//               border: isSelected ? "2px solid #28a745" : "",
//             }}
//             onClick={() => !formDisabled && handleItemCardClick(item)}
//           >
//             <div className="card-body p-2">
//               <div className="d-flex justify-content-between align-items-start">
//                 <div className="flex-grow-1">
//                   <h6
//                     className={`card-title mb-1 ${
//                       isSelected ? "text-success" : "text-warning font-weight-bold"
//                     }`}
//                     style={{
//                       fontSize: "18px",
//                       lineHeight: "1.2",
//                       fontWeight: isSelected ? "bold" : "normal",
//                     }}
//                   >
//                     {item.items}
//                     {/* {item.items && item.location
//                   ? `${item.items} (${item.location})`
//                   : "(-)"} */}
//                   </h6>
//                   {(item.barcode || item.barcode_no) && (
//                     <small className="text-muted d-block">
//                       <i className="fas fa-barcode"></i>{" "}
//                       {item.barcode || item.barcode_no}
//                     </small>
//                   )}
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div>
//                       <small className="text-primary font-weight-bold" style={{ fontSize: "15px" }}>
//                         Rs. {parseFloat(item.price || 0).toFixed(2)}
//                       </small>
//                       {item.discount > 0 && (
//                         <small className="text-muted d-block">
//                           Disc: {item.discount}
//                         </small>
//                       )}
//                     </div>
//                     {currentQuantity > 0 && (
//                       <span className="badge badge-warning text-black p-2" style={{ color: "black", fontSize: "10px" }}>
//                         Qty: {currentQuantity}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="text-center ml-2">
//                   <i
//                     className={`fas ${isSelected ? "fa-check-circle" : "fa-plus-circle"} text-${
//                       formDisabled ? "muted" : isSelected ? "success" : "warning"
//                     }`}
//                     style={{ fontSize: "20px" }}
//                   ></i>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     })}
//                 </div>
//               </div>

//               {filteredItems.length === 0 && (
//                 <div className="text-center text-muted mt-3">
//                   <i className="fas fa-search fa-2x mb-2"></i>
//                   <p>No items found</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Invoice Table Section */}
//        <div className={`col-md-5 p-2`}
//     //  style={{ border: activeBlock === 'invoiceItems' ? '3px solid #ffc107' : '' }}
//      >
//   <div className="table-responsive p-2 border">
//     <div>
//       <h5 className={`text-warning p-2 card-header ${activeBlock === 'invoiceItems' ? 'bg-primary' : 'bg-primary'}`}>
//         <div className="row">
//           <div className="col">
//             <i className="fas fa-receipt"></i> Invoice Items ({tableData.length})
//             {activeBlock === 'invoiceItems' && <i className="ml-2 fas fa-check-circle"></i>}
//           </div>
//         </div>
//       </h5>
//     </div>

//     <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
//       <table className="table table-striped">
//         <thead className="bg-light">
//           <tr>
//             <th style={{ width: "200px" }}>Item</th>
//             <th style={{ width: "150px" }}>Rate</th>
//             <th>Qty</th>
//             <th>Disc</th>
//             <th className="text-center">Total</th>
//             <th className="text-center">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tableData.map((data, index) => {
//             const baseIndex = index * 4; // 4 editable fields per row
//             return (
//               <tr key={index}>
//                 <td style={{ display: "none" }}>{data.item}</td>
//                 <td style={{ display: "none" }}>{data.hidden_id}</td>
//                 <td className="" style={{ maxWidth: "100px" }}>
//                   <div style={{ wordBreak: "break-word", lineHeight: "1.2" }}>
//                     {data.item_name}
//                   </div>
//                 </td>

//                 <td className="text-center">
//                   <input
//                     ref={el => invoiceItemsRefs.current[baseIndex] = el}
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={data.price || 0}
//                     onChange={(e) => handleRateChange(e, index)}
//                   />
//                 </td>

//                 <td className="text-center">
//                   <input
//                     ref={el => invoiceItemsRefs.current[baseIndex + 1] = el}
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={data.quantity || 0}
//                     onChange={(e) => handleQuantityChange(e, index)}
//                     style={{ width: "80px" }}
//                   />
//                 </td>

//                 <td className="text-center">
//                   <input
//                     ref={el => invoiceItemsRefs.current[baseIndex + 2] = el}
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={data.discount || 0}
//                     onChange={(e) => handleDiscountChange(e, index)}
//                     style={{ width: "80px" }}
//                   />
//                 </td>

//                 <td className="text-center text-primary" style={{ fontWeight: "bold" }}>
//                   {parseFloat(data.total || 0).toFixed(2)}
//                 </td>

//                 <td className="text-center">
//                   <div className="btn-group btn-group-sm" role="group">
//                     <button
//                       className="btn btn-warning btn-sm"
//                       onClick={() => handleDelete(index)}
//                     >
//                       <i className="fas fa-trash-alt"></i>
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   </div>
// </div>

//         <div>
//           {isModalOpen && (
//             <InvoiceModalPharmacy
//               invoiceData={invoiceData}
//               onClose={handleCloseModal}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PharmacyTest;



import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "../Home";
import Stock from "./Stock";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid, format } from "date-fns";

import { useItemPharmacy } from "./ItemContextPharmacy";

import InvoiceModalPharmacy from "./InvoiceModalPharmacy";
import InvoiceListPharmacy from "./InvoiceListPharmacy";
import IncomeReport from "./IncomeReport";
import StockReport from "./StockReport";
import ExpiredStock from "./ExpiredStock";
import Modal from "./Modal";
import SuppliersList from "./SuppliersList";
import StockDeficitReport from "./StockDeficitReport";
import { Link } from "react-router-dom";
import PaidPayments from "./PaidPayments";
import BankAccounts from "./BankAccounts";
import Heads from "./Heads";
import AddTransaction from "./AddTransaction";
import DailyExpense from "./DailyExpense";
import { AuthProvider, useAuth } from "./AuthContext";

const PharmacyTest = ({
  onClose,
  invoiceNo,
  patientId = 0,
  doctorID = 0,
  fetchPatientMedicine = "",
}) => {
  const [patientIdGet, setPatientId] = useState(patientId);
  const [doctorInvoiceId, setDoctorInvoiceId] = useState(doctorID);
  const [checkComponent, setComponent] = useState("pharmacy");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [activeBlock, setActiveBlock] = useState('itemsPOS');
  const [activeFieldIndex, setActiveFieldIndex] = useState(0);

  const { user } = useAuth();
  const invoiceItemsRefs = useRef([]);
  const printRef = useRef();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const notify = (message) => {
    toast.success(message);
  };

  const current_date_get = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "-");

  const [formData, setFormData] = useState({
    item: "",
    price: 0,
    final_price: 0,
    quantity: 1,
    discount: 0,
    rate_after_discount: 0,
    reserve_stock_id: 0,
    actual_edit_item: "",
    total: 0,
    stock: 0,
    rack_no: "",
    stock_id: "",
    formula: "",
    final_price: 0,
    stock_remain: 0,
    item_name: "",
    hidden_id: "",
    invoice_no: "",
    phone_no: "",
    full_name: "",
    age: "",
    barcode_no: "",
    reserve_quantity: 0,
    reserve_price: 0,
    reserve_discount: 0,
    return_unit: 0,
    total_return_amount: 0,
    gst: 0,
    invoice_date: current_date_get,
    from_date: "",
    to_date: "",
    advance: 0,
    grand_total: 0,
    remaining_amount: 0,
    delivery_date: "",
    book_id: "",
    stock_type: "",
    rate_after_discount_reserve: 0,
    total_reserve: 0,
    reserve_return_unit: 0,
    reserve_total_return_amount: 0,
    invoice_status: "paid",
    alert_date: "",
    location: "",
  });

  const { items } = useItemPharmacy();

  const [selectedInvoiceType, setSelectedInvoiceType] = useState("sale");
  const [showHeading, setShowHeading] = useState(false);
  const [checkEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkBarcodeFetch, setBarcodeFetch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, totalPagesGet] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [totalItem, setTotalItemGet] = useState(5);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [tableData, setTableData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [contactMethod, setContactMethod] = useState("phone");
  const [getStock, setStock] = useState([]);
  const [showBakupLoading, setBakupLoading] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [invoiceData, setInvoiceData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceTable, updateInvoiceTable] = useState([]);
  const [invoiceNoUpdate, setInvoiceUpdate] = useState({ invoice_no: "" });
  const [isVisible, setIsVisible] = useState(false);
  const [showDatesForReport, setShowDatesForReport] = useState(false);
  const [reportData, setReportData] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [viewReport, setViewReport] = useState(false);
  const [showEdit, setShow] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [medicine, setMedicine] = useState({ item: "", item_name: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCheckout, setShowCheckout] = useState(false);

  const phoneRef = useRef(null);
  const barcodeRef = useRef(null);
  const fullNameRef = useRef(null);
  const searchRef = useRef(null);

  const itemsPOSRefs = {
    search: searchRef,
    barcode: barcodeRef
  };

  const invoiceFormRefs = {
    invoice_date: useRef(null),
    phone_no: phoneRef,
    full_name: fullNameRef,
    book_id: useRef(null),
    invoice_status: useRef(null),
    alert_date: useRef(null),
    advance: useRef(null),
  };

  const handleInvoiceChange = (event) => {
    setSelectedInvoiceType(event.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateNew = (date) => {
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(",", "");
  };

  const [data, setData] = useState([]);

  const [report, getAllReports] = useState({
    from_date: "",
    to_date: "",
    type: "",
    gst_or_without: "gst",
    medicine_type: "",
  });

  const handleDateChangeForm = (date) => {
    if (!date) return;
    const backendDate = format(date, "yyyy-MM-dd");
    setFormData({ ...formData, invoice_date: date });
  };

  const handleItemCardClick = (selectedItem, stockId = null) => {
    const itemPrice = selectedItem.price || 0;
    const finalPrice = selectedItem.final_price || 0;
    const itemDiscount = selectedItem.discount || 0;
    const discountedPrice = itemPrice - itemDiscount;

    const existingItemIndex = tableData.findIndex(
      (item) =>
        item.item === selectedItem.id && (!stockId || item.stock_id === stockId)
    );

    if (existingItemIndex !== -1) {
      const updatedTableData = [...tableData];
      const currentQuantity =
        parseFloat(updatedTableData[existingItemIndex].quantity) || 0;
      const newQuantity = currentQuantity + 1;

      updatedTableData[existingItemIndex] = {
        ...updatedTableData[existingItemIndex],
        quantity: newQuantity,
        total: (
          updatedTableData[existingItemIndex].rate_after_discount * newQuantity
        ).toFixed(2),
      };

      setTableData(updatedTableData);
    } else {
      const newItem = {
        item: selectedItem.id,
        item_name: selectedItem.items,
        location: selectedItem.location || "",
        price: itemPrice,
        final_price: finalPrice,
        discount: itemDiscount,
        quantity: 1,
        rate_after_discount: discountedPrice,
        total: discountedPrice.toFixed(2),
        return_unit: 0,
        total_return_amount: 0,
        stock_type: selectedItem.stock_type || "",
        stock_id: stockId || "",
        hidden_id: "",
        reserve_price: itemPrice,
        reserve_discount: itemDiscount,
        reserve_quantity: 1,
        rate_after_discount_reserve: discountedPrice,
        total_reserve: discountedPrice.toFixed(2),
        reserve_return_unit: 0,
        reserve_total_return_amount: 0,
        reserve_stock_id: stockId || 0,
        actual_edit_item: "",
        rack_no: "",
        gst: 0,
        formula: "",
        invoice_date: formData.invoice_date,
        phone_no: formData.phone_no,
        full_name: formData.full_name,
        age: formData.age,
        delivery_date: formData.delivery_date,
        advance: formData.advance,
        grand_total: formData.grand_total,
        remaining_amount: formData.remaining_amount,
        book_id: formData.book_id
      };

      setTableData([newItem, ...tableData]);
    }
  };

  const handleBarcodeInput = (barcodeValue) => {
    if (!barcodeValue.trim()) return;

    let foundItem = null;
    let stockId = null;

    const compositeMatch = barcodeValue.match(/^\(?(.+),(\d+)\)?$/);

    if (compositeMatch) {
      const [, barcodeNo, extractedStockId] = compositeMatch;
      stockId = parseInt(extractedStockId);

      foundItem = items.find(
        (item) =>
          item.barcode === barcodeNo ||
          item.barcode_no === barcodeNo ||
          item.id.toString() === barcodeNo
      );

      if (foundItem) {
        console.log(
          `Found item with composite barcode: ${barcodeNo}, Stock ID: ${stockId}`
        );
      }
    } else {
      foundItem = items.find(
        (item) =>
          item.barcode === barcodeValue ||
          item.barcode_no === barcodeValue ||
          item.id.toString() === barcodeValue
      );
    }

    if (foundItem) {
      handleItemCardClick(foundItem, stockId);
      setBarcodeInput("");

      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    } else {
      const errorMsg = compositeMatch
        ? `Item with barcode ${compositeMatch[1]} not found!`
        : `Item with barcode ${barcodeValue} not found!`;
      toast.error(errorMsg);
      setBarcodeInput("");
    }
  };

  const handleBarcodeChange = (e) => {
    setBarcodeInput(e.target.value);
  };

  const handleBarcodeKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBarcodeInput(barcodeInput);
    }
  };

  useEffect(() => {
    if (formData.phone_no && formData.phone_no.length >= 11) {
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    }
  }, []);

  const categories = [
    "All",
    ...new Set(items.map((item) => item.category || "Other")),
  ];

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.items
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        (item.category || "Other") === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const nameA = (a.items || "").toUpperCase();
      const nameB = (b.items || "").toUpperCase();
      
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  function refreshData() {
    window.location.reload();
  }

  function getBackup() {
    setBakupLoading(true);
    axios
      .get("http://localhost:4000/backup")
      .then((res) => {
        toast.success("Backup Saved Successfully!");
        setBakupLoading(false);
      })
      .catch((err) => {
        setBakupLoading(false);
        if (err.response) {
          console.error("Error Response:", err.response);
          toast.error(
            `Error: ${err.response.data.message || "Something went wrong!"}`
          );
        } else if (err.request) {
          console.error("Error Request:", err.request);
          toast.error("Token Refresh! Please Get Backup Again");
        } else {
          console.error("General Error:", err.message);
          toast.error(`Error: ${err.message}`);
        }
      });
  }

  function getIncomeReport() {
    setShowDatesForReport(true);
  }

  const editInvoice = (invoice_no_get) => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/get-invoice-no-pharmacy/${invoice_no_get}`
      )
      .then((response) => {
        const invoiceData = response.data.results;

        setFormData({
          ...formData,
          invoice_date: invoiceData[0].invoice_date,
          phone_no: invoiceData[0].phone_no,
          full_name: invoiceData[0].full_name,
          age: invoiceData[0].age,
          invoice_date: invoiceData[0].invoice_date,
          book_id: invoiceData[0].book_id,
          invoice_status: invoiceData[0].invoice_status,
          alert_date: invoiceData[0].alert_date,
          advance: invoiceData[0].advance,
          grand_total: invoiceData[0].grand_total,
          delivery_date: invoiceData[0].delivery_date,
          remaining_amount: invoiceData[0].remaining_amount,
          hidden_id: "",
        });

        setPatientId(invoiceData[0].patient_id);
        setDoctorInvoiceId(invoiceData[0].doctor_invoice_id);
        setSelectedInvoiceType(invoiceData[0].invoice_type);

        setInvoiceUpdate({
          ...invoiceNoUpdate,
          invoice_no: invoice_no_get,
        });

        const transformedData = invoiceData.map((item) => {
          return {
            invoice_date: item.invoice_date,
            phone_no: item.phone_no,
            full_name: item.full_name,
            age: item.age,
            item: item.item,
            hidden_id: item.id,
            item_name: item.item_name,
            price: parseFloat(item.price).toFixed(2),
            reserve_price: parseFloat(item.price).toFixed(2),
            quantity: item.quantity,
            reserve_quantity: item.quantity,
            discount: item.discount,
            reserve_discount: item.discount,
            rate_after_discount: item.price_after_discount,
            rate_after_discount_reserve: item.price_after_discount,
            stock_type: item.stock_type,
            total: item.total,
            total_reserve: item.total,
            stock_id: item.stock_id,
            rack_no: item.rack_no,
            gst: item.gst,
            formula: item.formula,
            invoice_no: item.invoice_no,
            reserve_stock_id: item.stock_id,
            actual_edit_item: item.item,
            return_unit: item.return_unit,
            reserve_return_unit: item.return_unit,
            total_return_amount: item.total_return_amount,
            reserve_total_return_amount: item.total_return_amount,
            location: item.location,
          };
        });

        setTableData(transformedData);
        setFormDisabled(false);
        setShow(false);
        
        setActiveBlock('itemsPOS');
        setActiveFieldIndex(0);
        setTimeout(() => {
          searchRef.current?.focus();
        }, 100);
       
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const ViewInvoice = (invoice_no) => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/view-invoice-new-pharmacy`, {
        params: {
          invoice_no: invoice_no,
        },
      })
      .then((res) => {
        let results = res.data.results;
        setInvoiceData(results);
        setIsModalOpen(true);
      })
      .catch((err) => console.log(err));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "item") {
      const selectedItem = items.find((item) => item.id === parseInt(value));
      const itemName = selectedItem ? selectedItem.items : "";
      setFormData({
        ...formData,
        [name]: value,
        item_name: itemName,
      });
    } else {
      const updatedFormData = {
        ...formData,
        [name]: value,
      };

      if (name === "invoice_status" && value === "unpaid") {
        updatedFormData.advance = 0;
      }

      if (
        name === "rate" ||
        name === "price" ||
        name === "quantity" ||
        name === "discount" ||
        name === "return_unit"
      ) {
        const price = parseFloat(updatedFormData.price);
        const discount = parseFloat(updatedFormData.discount);
        updatedFormData.rate_after_discount = price - discount;
        const return_unit = parseFloat(updatedFormData.return_unit);
        const quantity = parseFloat(updatedFormData.quantity);
        let total = updatedFormData.rate_after_discount * quantity;
        updatedFormData.total_return_amount =
          return_unit * updatedFormData.rate_after_discount;
        updatedFormData.total = total.toFixed(2);
      }
      setFormData(updatedFormData);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.item == "") {
      return;
    }

    if (formData.invoice_date == "" || formData.invoice_date == null) {
      alert("Date is wrong! Reselect");
    }

    if (editIndex !== null && editIndex >= 0 && editIndex < tableData.length) {
      setTableData((currentTableData) => {
        const updatedTableData = [...currentTableData];
        updatedTableData[editIndex] = { ...formData };
        return updatedTableData;
      });

      setEditIndex(null);
      resetFormData();
      setIsEditing(false);
    } else {
      setTableData((currentTableData) => [formData, ...currentTableData]);
      resetFormData();
    }
  };

  const resetFormData = () => {
    setFormData({
      ...formData,
      item: "",
      price: 0,
      final_price: 0,
      quantity: 1,
      discount: 0,
      rate_after_discount: 0,
      total: 0,
      stock: 0,
      rack_no: "",
      stock_id: "",
      formula: "",
      stock_remain: 0,
      item_name: "",
      barcode_no: "",
      hidden_id: "",
      reserve_quantity: 0,
      reserve_stock_id: "",
      actual_edit_item: "",
      return_unit: 0,
      total_return_amount: 0,
    });
  };

  const handleEdit = (index) => {
    if (formData.hidden_id !== "") {
      if (tableData[index].hidden_id == formData.hidden_id) {
        return false;
      }
    }

    setIsEditing(true);
    setFormDisabled(false);
    setFormData(tableData[index]);
    const selectedInvoice = tableData[index];
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    let updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  const totals = tableData.reduce(
    (acc, item) => {
      acc.totalQuantity += parseFloat(item.quantity) || 0;
      acc.totalAmount += parseFloat(item.total) || 0;
      return acc;
    },
    { totalQuantity: 0, totalAmount: 0 }
  );

  const calculateDiscount = (get_discount) => {
  };

  useEffect(() => {
    const newTotals = tableData.reduce(
      (acc, item) => {
        acc.totalQuantity += parseFloat(item.quantity) || 0;
        acc.totalAmount += parseFloat(item.total) || 0;
        return acc;
      },
      { totalQuantity: 0, totalAmount: 0 }
    );

    setFormData((prevState) => ({
      ...prevState,
      grand_total: newTotals.totalAmount.toFixed(2),
      remaining_amount: newTotals.totalAmount.toFixed(2),
    }));
  }, [tableData]);

  const filteredStockOptions = getStock
    ? getStock
        .filter((stock) =>
          formData.hidden_id ? true : stock.remaining_quantity > 0
        )
        .map((stock) => {
          return {
            value: stock.stock_id,
            label: `Invoice: ${stock.invoice_no} (Remaining: ${stock.remaining_quantity}, Stock Date: ${stock.earliest_expiry})`,
            rack_no: stock.rack_no,
            final_price: stock.final_price,
            get_stock:
              stock.remaining_quantity +
              (stock.stock_id == formData.reserve_stock_id
                ? Number(Number(formData.reserve_quantity).toFixed())
                : 0),
          };
        })
    : [];

  const calculateDaysDifference = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const differenceInTime = to.getTime() - from.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  const isDateDifferenceValid =
    report.from_date &&
    report.to_date &&
    calculateDaysDifference(report.from_date, report.to_date) > 1;

  const deleteItem = (id, index) => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/delete-invoice-item-pharmacy/${id}`
      )
      .then((response) => {
        toast.error("Item Deleted Successfully!");
        let updatedTableData = [...tableData];
        updatedTableData.splice(index, 1);
        setTableData(updatedTableData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const remaining =
    formData.invoice_status === "unpaid"
      ? parseFloat(formData.grand_total) || 0
      : formData.advance > 0
      ? (parseFloat(formData.grand_total) || 0) -
        (parseFloat(formData.advance) || 0)
      : 0;

  useEffect(() => {
    setTableData((prevTableData) =>
      prevTableData.map((item) => ({
        ...item,
        invoice_date: formData.invoice_date,
        phone_no: formData.phone_no,
        full_name: formData.full_name,
        age: formData.age,
        delivery_date: formData.delivery_date,
        advance: formData.advance,
        grand_total: formData.grand_total,
        remaining_amount: remaining,
        book_id: formData.book_id,
        invoice_status: formData.invoice_status,
        alert_date: formData.alert_date,
      }))
    );
  }, [
    formData.invoice_date,
    formData.phone_no,
    formData.full_name,
    formData.rack_no,
    formData.delivery_date,
    formData.advance,
    formData.grand_total,
    remaining,
    formData.book_id,
    formData.invoice_status,
    formData.alert_date,
  ]);

  const tableDataRef = useRef(tableData);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const handleSaveAllData = useCallback(async () => {
    if (
      formData.phone_no.length !== 12 &&
      tableDataRef.current.length <= 0 &&
      invoiceNoUpdate.invoice_no == ""
    ) {
      return false;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/insert-invoice-pharmacy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableData: tableDataRef.current,
            invoice_no_get: invoiceNoUpdate.invoice_no,
            patient_id: patientIdGet,
            doctor_id: doctorInvoiceId,
            rack_no: formData.rack_no,
            delivery_date: formData.delivery_date,
            advance: formData.advance,
            grand_total: formData.grand_total,
            remaining_amount: remaining,
            book_id: formData.book_id,
            phone_no_type: contactMethod,
            invoice_type: selectedInvoiceType,
            invoice_status: formData.invoice_status,
            alert_date: formData.alert_date,
            user_name: user.user.username
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.error) {
          throw new Error(data.error);
        }
        throw new Error(data.message || "Failed to insert invoice data");
      }

      setInvoiceData(data.items);
      setIsModalOpen(true);

      setFormData((prevFormData) => ({
        ...prevFormData,
        item: "",
        price: 0,
        quantity: 1,
        discount: 0,
        rate_after_discount: 0,
        reserve_stock_id: 0,
        actual_edit_item: "",
        total: 0,
        stock: 0,
        rack_no: "",
        stock_id: "",
        formula: "",
        final_price: 0,
        stock_remain: 0,
        item_name: "",
        hidden_id: "",
        invoice_no: "",
        phone_no: "",
        full_name: "",
        age: "",
        barcode_no: "",
        reserve_quantity: 0,
        gst: 0,
        delivery_date: "",
        advance: 0,
        book_id: "",
        invoice_status: "",
        alert_date: "",
      }));
      setTableData([]);
      updateInvoiceTable([]);
      let message = "Invoice Created Successfully!";
      notify(message);
      setInvoiceUpdate((prevFormData) => ({
        ...prevFormData,
        invoice_no: "",
      }));
      setFormDisabled(false);
      setPatientId(0);
      setDoctorInvoiceId(0);
      setShowCheckout(false);
    } catch (error) {
      const errorMessage = error.message || "Failed to create invoice";
      notify(errorMessage);
      console.error("Error sending data:", error);
    }
  }, [
    selectedInvoiceType,
    invoiceNoUpdate,
    contactMethod,
    formData.advance,
    formData.delivery_date,
    formData.grand_total,
    formData.book_id,
    remaining,
    formData.rack_no,
    formData.invoice_status,
    formData.alert_date,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s" && checkComponent == "pharmacy") {
        event.preventDefault();
        handleSaveAllData();
        if (tableDataRef.current?.length > 0) {
          setFormDisabled(false);
          setActiveBlock('itemsPOS')
        }
      }
      if (event.ctrlKey && event.key === "i" && checkComponent == "pharmacy") {
        event.preventDefault();
        setShow("invoice");
        resetFormData();
      }
    };

    if (checkComponent == "pharmacy") {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [checkComponent, handleSaveAllData, showEdit]);

  const handleFetch = (invoice_no, patient_id, phone_no) => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/fetch-customer-data-for-pharmacy`,
        {
          patient_id,
          phone_no,
        }
      )
      .then((response) => {
        const customerData = response.data.results[0];
        if (customerData) {
          setFormData((prevState) => ({
            ...prevState,
            full_name: customerData.name,
            phone_no: customerData.contact,
            age: customerData.age,
          }));
        }
        console.log("Customer Data:", customerData);
        setFormDisabled(false);
        fullNameRef.current?.focus();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    handleFetch(invoiceNo, patientId, formData.phone_no);
  }, [invoiceNo, patientId]);

  const handleRateChange = (e, index) => {
    const value = e.target.value;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const newData = [...tableData];
      const newRate = parseFloat(value) || 0;
      const discount = parseFloat(newData[index].discount) || 0;
      const quantity = parseFloat(newData[index].quantity) || 0;
      
      newData[index].price = value;
      newData[index].rate_after_discount = (newRate * quantity - discount).toFixed(2);
      newData[index].total = newData[index].rate_after_discount;
      
      setTableData(newData);
    }
  };

  const handleQuantityChange = (e, index) => {
    const value = e.target.value;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const newData = [...tableData];
      const newQuantity = parseFloat(value) || 0;
      const price = parseFloat(newData[index].price) || 0;
      const discount = parseFloat(newData[index].discount) || 0;
      
      newData[index].quantity = value;
      newData[index].rate_after_discount = (price * newQuantity - discount).toFixed(2);
      newData[index].total = newData[index].rate_after_discount;
      
      setTableData(newData);
    }
  };

  const handleDiscountChange = (e, index) => {
    const value = e.target.value;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const newData = [...tableData];
      const newDiscount = parseFloat(value) || 0;
      const price = parseFloat(newData[index].price) || 0;
      const quantity = parseFloat(newData[index].quantity) || 0;
      
      newData[index].discount = value;
      newData[index].rate_after_discount = (price * quantity - newDiscount).toFixed(2);
      newData[index].total = newData[index].rate_after_discount;
      
      setTableData(newData);
    }
  };

  const handleTotalChange = (e, index) => {
    const newData = [...tableData];
    newData[index].total = parseFloat(e.target.value).toFixed(2);
    setTableData(newData);
  };

  const handleAfterDiscountChange = (e, index) => {
    const newData = [...tableData];
    const newAfterDiscount = parseFloat(e.target.value);
    const currentItemId = newData[index].item;

    newData.forEach((item, idx) => {
      if (item.item === currentItemId) {
        newData[idx].rate_after_discount = newAfterDiscount;
        newData[idx].total = (newAfterDiscount * newData[idx].quantity).toFixed(
          2
        );
      }
    });

    setTableData(newData);
  };

  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

  const toggleContactMethod = () => {
    setContactMethod((prev) => (prev === "phone" ? "whatsapp" : "phone"));
  };

  const getActiveBlockRefs = () => {
    switch (activeBlock) {
      case 'invoiceForm':
        return Object.values(invoiceFormRefs).filter(ref => ref?.current);
      case 'itemsPOS':
        return Object.values(itemsPOSRefs).filter(ref => ref?.current);
      case 'invoiceItems':
        return invoiceItemsRefs.current.filter(ref => ref);
      default:
        return [];
    }
  };

  const focusActiveField = () => {
    const refs = getActiveBlockRefs();
    if (refs[activeFieldIndex]?.focus) {
      refs[activeFieldIndex].focus();
    } else if (refs[activeFieldIndex]?.current?.focus) {
      refs[activeFieldIndex].current.focus();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        return;
      }

      if (e.ctrlKey && e.key === 'x' && activeBlock === 'invoiceItems') {
        e.preventDefault();
        const rowIndex = Math.floor(activeFieldIndex / 3);
        if (rowIndex >= 0 && rowIndex < tableData.length) {
          handleDelete(rowIndex);
          if (activeFieldIndex >= (tableData.length - 1) * 3) {
            setActiveFieldIndex(Math.max(0, activeFieldIndex - 3));
          }
        }
        return;
      }

      const activeElement = document.activeElement;
      const isInInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement?.tagName);

      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveBlock(prev => {
          if (prev === 'invoiceItems') return 'itemsPOS';
          if (prev === 'itemsPOS') return 'invoiceForm';
          return prev;
        });
        setActiveFieldIndex(0);
        setSelectedItemIndex(-1);
        return;
      }

      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveBlock(prev => {
          if (prev === 'invoiceForm') return 'itemsPOS';
          if (prev === 'itemsPOS') return 'invoiceItems';
          return prev;
        });
        setActiveFieldIndex(0);
        setSelectedItemIndex(-1);
        return;
      }

      if (e.key === 'ArrowLeft' && !isInInput) {
        e.preventDefault();
        setActiveBlock(prev => {
          if (prev === 'invoiceItems') return 'itemsPOS';
          if (prev === 'itemsPOS') return 'invoiceForm';
          return prev;
        });
        setActiveFieldIndex(0);
        setSelectedItemIndex(-1);
      }

      if (e.key === 'ArrowRight' && !isInInput) {
        e.preventDefault();
        setActiveBlock(prev => {
          if (prev === 'invoiceForm') return 'itemsPOS';
          if (prev === 'itemsPOS') return 'invoiceItems';
          return prev;
        });
        setActiveFieldIndex(0);
        setSelectedItemIndex(-1);
      }

      if (activeBlock === 'invoiceForm' && isInInput) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const refs = getActiveBlockRefs();
          setActiveFieldIndex(prev => {
            const next = prev < refs.length - 1 ? prev + 1 : prev;
            return next;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveFieldIndex(prev => {
            const next = prev > 0 ? prev - 1 : 0;
            return next;
          });
        }
      }

      if (activeBlock === 'itemsPOS') {
        const itemCount = filteredItems.length;
        
        if (activeElement === searchRef.current) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedItemIndex(prev => 
              prev < itemCount - 1 ? prev + 1 : prev
            );
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedItemIndex(prev => 
              prev > 0 ? prev - 1 : -1
            );
          } else if (e.key === 'Enter' && selectedItemIndex >= 0) {
            e.preventDefault();
            const selectedItem = filteredItems[selectedItemIndex];
            if (selectedItem && !formDisabled) {
              handleItemCardClick(selectedItem);
              setSearchTerm('');
              setSelectedItemIndex(-1);
            }
          }
        }
        
        if (activeElement === barcodeRef.current) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const refs = getActiveBlockRefs();
            setActiveFieldIndex(prev => {
              const next = e.key === 'ArrowDown' 
                ? (prev < refs.length - 1 ? prev + 1 : prev)
                : (prev > 0 ? prev - 1 : 0);
              return next;
            });
          }
        }
      }

      if (activeBlock === 'invoiceItems' && isInInput) {
        const currentRow = Math.floor(activeFieldIndex / 3);
        const currentCol = activeFieldIndex % 3;
        const totalRows = tableData.length;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentRow < totalRows - 1) {
            setActiveFieldIndex(prev => prev + 3);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentRow > 0) {
            setActiveFieldIndex(prev => prev - 3);
          }
        } else if (e.key === 'ArrowRight' && e.target.selectionStart === e.target.value.length) {
          if (currentCol < 2) {
            e.preventDefault();
            setActiveFieldIndex(prev => prev + 1);
          }
        } else if (e.key === 'ArrowLeft' && e.target.selectionStart === 0) {
          if (currentCol > 0) {
            e.preventDefault();
            setActiveFieldIndex(prev => prev - 1);
          }
        }
      }

      if (e.key === 'Escape') {
        setSelectedItemIndex(-1);
        setActiveFieldIndex(0);
        if (activeBlock === 'itemsPOS') {
          setSearchTerm('');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeBlock, activeFieldIndex, filteredItems, selectedItemIndex, formDisabled, tableData.length, searchTerm]);

  useEffect(() => {
    setTimeout(() => {
      focusActiveField();
    }, 50);
  }, [activeBlock, activeFieldIndex]);

  useEffect(() => {
    setSelectedItemIndex(-1);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedItemIndex >= 0 && activeBlock === 'itemsPOS') {
      const element = document.getElementById(`item-card-${selectedItemIndex}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }, [selectedItemIndex, activeBlock]);

  useEffect(() => {
    invoiceItemsRefs.current = [];
  }, [tableData]);

  return (
    <div>
      <style>
        {`
          .modern-pos-container {
            min-height: 100vh;
            background-color: #f8f9fa;
          }
          
          .pos-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 1rem 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .pos-header h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
          }
          
          .pos-main-grid {
            display: flex;
            height: calc(100vh - 80px);
          }
          
          .products-section {
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
            background: white;
          }
          
          .search-bar {
            position: relative;
            margin-bottom: 1rem;
          }
          
          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
          }
          
          .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          }
          
          .barcode-input {
            background-color: #fffbeb;
            border-color: #fbbf24;
          }
          
          .barcode-input:focus {
            border-color: #f59e0b;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          }
          
          .category-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
          
          .category-tab {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 20px;
            background-color: #f3f4f6;
            color: #374151;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
            font-weight: 500;
          }
          
          .category-tab:hover {
            background-color: #e5e7eb;
          }
          
          .category-tab.active {
            background-color: #10b981;
            color: white;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
          }
          
          .product-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
          }
          
          .product-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
          }
          
          .product-card.in-cart {
            border-color: #10b981;
            background-color: #f0fdf4;
          }
          
          .product-card.selected {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          
          .product-image {
            width: 100%;
            height: 120px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.75rem;
            font-size: 2.5rem;
          }
          
          .product-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: #10b981;
            color: white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          }
          
          .product-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .product-category {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          
          .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .product-price {
            font-size: 1.125rem;
            font-weight: 700;
            color: #10b981;
          }
          
          .cart-section {
            width: 400px;
            background: white;
            border-left: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
          }
          
          .cart-header {
            background-color: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .cart-items {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
          }
          
          .cart-item {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.75rem;
            margin-bottom: 0.75rem;
          }
          
          .cart-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }
          
          .cart-item-name {
            font-weight: 600;
            color: #1f2937;
          }
          
          .cart-item-detail {
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .cart-item-controls {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }
          
          .cart-item-input {
            width: 60px;
            padding: 0.25rem 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            text-align: center;
            font-size: 0.875rem;
          }
          
          .cart-item-total {
            flex: 1;
            text-align: right;
            font-weight: 700;
            color: #10b981;
          }
          
          .delete-btn {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.2s;
          }
          
          .delete-btn:hover {
            background-color: #fee2e2;
          }
          
          .cart-empty {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
          }
          
          .cart-footer {
            border-top: 1px solid #e5e7eb;
            padding: 1rem;
          }
          
          .cart-total-box {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          
          .cart-total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            color: #6b7280;
          }
          
          .cart-total-final {
            display: flex;
            justify-content: space-between;
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
          }
          
          .cart-total-final .amount {
            color: #10b981;
          }
          
          .checkout-btn {
            width: 100%;
            background-color: #10b981;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .checkout-btn:hover:not(:disabled) {
            background-color: #059669;
          }
          
          .checkout-btn:disabled {
            background-color: #d1d5db;
            cursor: not-allowed;
          }
          
          .checkout-view {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .checkout-header {
            background-color: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .checkout-tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .checkout-tab {
            flex: 1;
            padding: 1rem;
            border: none;
            background: none;
            border-bottom: 2px solid transparent;
            color: #6b7280;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .checkout-tab:hover {
            color: #374151;
          }
          
          .checkout-tab.active {
            color: #10b981;
            border-bottom-color: #10b981;
          }
          
          .checkout-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
          }
          
          .checkout-section {
            margin-bottom: 1.5rem;
          }
          
          .checkout-section h3 {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.75rem;
          }
          
          .invoice-table {
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .invoice-table thead {
            background-color: #f9fafb;
          }
          
          .invoice-table th {
            padding: 0.75rem;
            text-align: left;
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
          }
          
          .invoice-table td {
            padding: 0.75rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.875rem;
          }
          
          .form-group {
            margin-bottom: 1rem;
          }
          
          .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.25rem;
          }
          
          .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.2s;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          }
          
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          
          .checkout-footer {
            border-top: 1px solid #e5e7eb;
            padding: 1.5rem;
          }
          
          .checkout-summary {
            margin-bottom: 1rem;
          }
          
          .checkout-summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 1.125rem;
            margin-bottom: 0.75rem;
          }
          
          .checkout-summary-row.total {
            font-size: 1.5rem;
            font-weight: 700;
          }
          
          .advance-input {
            background-color: #f0fdf4;
            border-color: #86efac;
            text-align: center;
            font-size: 1.125rem;
            font-weight: 600;
          }
          
          .remaining-amount {
            color: #ef4444;
            font-weight: 700;
            font-size: 1.25rem;
          }
          
          .complete-sale-btn {
            width: 100%;
            background-color: #10b981;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.2s;
          }
          
          .complete-sale-btn:hover {
            background-color: #059669;
          }
          
          .close-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: all 0.2s;
          }
          
          .close-btn:hover {
            background-color: rgba(255,255,255,0.1);
          }
          
          .badge {
            background-color: #059669;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 700;
          }
        `}
      </style>

      <div className="d-flex justify-content-center flex-wrap mt-2">
        <a href="#" className="btn btn-sm btn-warning mb-2 mr-2">
          <Link to="/stock">
            <i className="fas fa-truck"></i> Create Stock
          </Link>
        </a>

        {user.user.user_type !== 'Receptionist' && (
          <>
            <a
              href="#"
              className="btn btn-sm btn-warning mb-2 mr-2"
              onClick={() => setShow("stock_report")}
            >
              <i className="fas fa-chart-line"></i> Stock Report
            </a>
            
            <a
              href="#"
              className="btn btn-sm btn-warning mb-2 mr-2"
              onClick={() => setShow("income_report")}
            >
              <i className="fas fa-hand-holding-usd"></i> Income Report
            </a>

            <a
              href="#"
              className="btn btn-sm btn-warning mb-2 mr-2"
              onClick={() => setShow("paid_payments")}
            >
              <i className="fas fa-tag"></i> Add Rebates
            </a>

            <a
              href="#"
              className="btn btn-sm btn-warning mb-2 mr-2"
              onClick={() => setShow("suppliers")}
            >
              <i className="fas fa-handshake"></i> Suppliers
            </a>

            <a
              href="#"
              className="btn btn-sm btn-warning mb-2 mr-2"
              onClick={() => setShow("stock_deficit_report")}
            >
              <i className="fas fa-redo"></i> Stock Deficit
            </a>

            <a
              href="#"
              className="btn btn-sm btn-warning mb-2 mr-2"
              onClick={() => setShow("expired_stock_report")}
            >
              <i className="fas fa-exclamation-triangle"></i> Expired Stock
            </a>
          </>
        )}

        <a
          href="#"
          className="btn btn-sm btn-warning mb-2 mr-2"
          onClick={() => {
            setShow("invoice");
            resetFormData();
          }}
        >
          <i className="fas fa-receipt"></i> Invoices
        </a>

        <a
          href="#"
          className="btn btn-sm btn-warning mb-2 mr-2"
          onClick={() => setShow("add_expense")}
        >
          <i className="fas fa-minus-circle"></i> Add Expense
        </a>

        <a
          href="#"
          className="btn btn-sm btn-warning mb-2 mr-2"
          onClick={() => setShow("add_transactions")}
        >
          <i className="fas fa-exchange-alt"></i> Add Transactions
        </a>

        <a
          href="#"
          className="btn btn-sm btn-warning mb-2 mr-2"
          onClick={() => {
            setShow("bank_accounts");
            resetFormData();
          }}
        >
          <i className="fas fa-credit-card"></i> Bank Accounts
        </a>

        <a
          href="#"
          className="btn btn-sm btn-warning mb-2 mr-2"
          onClick={() => {
            setShow("heads");
            resetFormData();
          }}
        >
          <i className="fas fa-wallet"></i> Heads
        </a>
      </div>

      <div className="modern-pos-container">
        {showBakupLoading && (
          <div className="loading-container">
            <div className="loading-text">
              Backup is Being Created... Please wait
            </div>
          </div>
        )}

        {/* Modals */}
        {showEdit === "medicine" && (
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            width: "90%",
            maxWidth: "1600px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary mr-2 mb-2"
                onClick={() => setShow(false)}
              >
                x
              </button>
            </div>
            <Home onClose={() => setShow(false)} />
          </div>
        )}

        {showEdit === "invoice" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Invoice List"
            maxWidth="1400px"
          >
            <InvoiceListPharmacy
              ViewInvoice={ViewInvoice}
              editInvoice={editInvoice}
              onClose={() => setShow(false)}
            />
          </Modal>
        )}

        {showEdit == "Stock" && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            width: "98%",
            height: "98vh",
            overflowY: "auto",
          }}>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary mr-2 mb-2"
                onClick={() => setShow(false)}
              >
                x
              </button>
            </div>
            <Stock onClose={() => setShow(false)} />
          </div>
        )}

        {showEdit === "income_report" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Income Report"
            maxWidth="1400px"
          >
            <IncomeReport onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "bank_accounts" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Bank Accounts"
            maxWidth="1400px"
          >
            <BankAccounts onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "add_transactions" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Add Transactions"
            maxWidth="1400px"
          >
            <AddTransaction onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "add_expense" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Add Expense"
            maxWidth="1400px"
          >
            <DailyExpense onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "heads" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="(Expense Or Income) Head Form"
            maxWidth="1400px"
          >
            <Heads onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "stock_report" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Stock Report"
            showFooter={false}
          >
            <StockReport onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "stock_deficit_report" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Stock Deficit Report"
            showFooter={false}
          >
            <StockDeficitReport onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "paid_payments" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Rebates"
            showFooter={false}
          >
            <PaidPayments onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit === "expired_stock_report" && (
          <Modal
            isOpen={true}
            onClose={() => setShow(false)}
            title="Expired Stock Alert"
            closeOnOutsideClick={false}
          >
            <ExpiredStock onClose={() => setShow(false)} />
          </Modal>
        )}

        {showEdit == "suppliers" && (
          <SuppliersList
            onClose={() => setShow(false)}
            showEdit={showEdit}
            setShow={setShow}
          />
        )}

        {/* Main POS Layout */}
        {/* <div className="pos-header"> */}
          {/* <div className="d-flex justify-content-between align-items-center">
            <h1>
              <i className="fas fa-shopping-cart mr-2"></i>
              POS System
            </h1>
            <div className="d-flex align-items-center">
              <span className="mr-3">Current User: {user.user.username}</span>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '50%'
              }}>
                <i className="fas fa-user"></i>
              </div>
            </div>
          </div> */}
        {/* </div> */}

        <div className="pos-main-grid">
          {/* Left Section - Products */}
          <div className="products-section">
            {/* Search Bar */}
            <div className="search-bar">
              <i className="fas fa-search search-icon"></i>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search medicine (Ctrl+/)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={formDisabled}
              />
            </div>

            {/* Barcode Scanner */}
            <div className="search-bar">
              <i className="fas fa-barcode search-icon"></i>
              <input
                ref={barcodeRef}
                type="text"
                placeholder="Scan Barcode..."
                value={barcodeInput}
                onChange={handleBarcodeChange}
                onKeyPress={handleBarcodeKeyPress}
                className="search-input barcode-input"
                disabled={formDisabled}
              />
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  disabled={formDisabled}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredItems.map((item, idx) => {
                const existingItem = tableData.find(tableItem => tableItem.item === item.id);
                const currentQuantity = existingItem ? parseFloat(existingItem.quantity) || 0 : 0;
                const isSelected = idx === selectedItemIndex;

                return (
                  <div
                    key={item.id}
                    id={`item-card-${idx}`}
                    className={`product-card ${currentQuantity > 0 ? 'in-cart' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => !formDisabled && handleItemCardClick(item)}
                    style={{ opacity: formDisabled ? 0.6 : 1 }}
                  >
                    <div className="product-image">📦</div>
                    
                    {currentQuantity > 0 && (
                      <div className="product-badge">{currentQuantity}</div>
                    )}

                    <div className="product-name" title={item.items}>
                      {item.items}
                    </div>
                    <div className="product-category">{item.category || 'Other'}</div>
                    <div className="product-footer">
                      <span className="product-price">Rs. {parseFloat(item.price || 0).toFixed(2)}</span>
                      <i className="fas fa-plus-circle" style={{ color: '#10b981', fontSize: '20px' }}></i>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="cart-empty">
                <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                <p>No items found</p>
              </div>
            )}
          </div>

          {/* Right Section - Cart */}
          <div className="cart-section">
            {!showCheckout ? (
              <>
                {/* Cart Header */}
                <div className="cart-header">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-shopping-cart mr-2"></i>
                    <span style={{ fontWeight: 600 }}>Current Order</span>
                  </div>
                  <span className="badge">{tableData.length} items</span>
                </div>

                {/* Cart Items */}
                <div className="cart-items">
                  {tableData.length === 0 ? (
                    <div className="cart-empty">
                      <i className="fas fa-shopping-cart" style={{ fontSize: '64px', marginBottom: '16px' }}></i>
                      <p>No items in cart</p>
                    </div>
                  ) : (
                    tableData.map((item, index) => (
                      <div key={index} className="cart-item">
                        <div className="cart-item-header">
                          <div style={{ flex: 1 }}>
                            <div className="cart-item-name">{item.item_name}</div>
                            <div className="cart-item-detail">
                              Rs. {item.price} x {item.quantity}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(index)}
                            className="delete-btn"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="cart-item-controls">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(e, index)}
                            className="cart-item-input"
                            placeholder="Qty"
                          />
                          <input
                            type="text"
                            value={item.discount}
                            onChange={(e) => handleDiscountChange(e, index)}
                            className="cart-item-input"
                            placeholder="Disc"
                          />
                          <div className="cart-item-total">Rs. {item.total}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Footer */}
                <div className="cart-footer">
                  <div className="cart-total-box">
                    <div className="cart-total-row">
                      <span>Subtotal</span>
                      <span>{totals.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="cart-total-final">
                      <span>Total</span>
                      <span className="amount">Rs. {totals.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={tableData.length === 0}
                    className="checkout-btn"
                  >
                    Proceed to Checkout
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="checkout-view">
                {/* Checkout Header */}
                <div className="checkout-header">
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Finalize Sale</h2>
                  <button onClick={() => setShowCheckout(false)} className="close-btn">
                    <i className="fas fa-times" style={{ fontSize: '24px' }}></i>
                  </button>
                </div>

                {/* Tabs */}
                <div className="checkout-tabs">
                  <button className="checkout-tab active">
                    <i className="fas fa-list mr-2"></i>
                    Review Items
                  </button>
                  <button className="checkout-tab">
                    <i className="fas fa-user mr-2"></i>
                    Customer Details
                  </button>
                </div>

                {/* Checkout Content */}
                <div className="checkout-content">
                  {/* Invoice Items */}
                  <div className="checkout-section">
                    <h3>Invoice Items</h3>
                    <table className="invoice-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th style={{ textAlign: 'center' }}>Price</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'center' }}>Disc</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((item, index) => (
                          <tr key={index}>
                            <td>{item.item_name}</td>
                            <td style={{ textAlign: 'center' }}>{item.price}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'center' }}>{item.discount}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Information */}
                  <div className="checkout-section">
                    <h3>Customer Information</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Invoice Date</label>
                      <input
                        type="date"
                        value={formData.invoice_date}
                        onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone_no}
                        onChange={(e) => {
                          let input = e.target.value.replace(/\D/g, "");
                          if (!input.startsWith("92") && input.length > 0) {
                            input = "92" + input;
                          }
                          if (input.length > 12) {
                            input = input.slice(0, 12);
                          }
                          setFormData({...formData, phone_no: input});
                        }}
                        placeholder="923001234567"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        placeholder="Patient Name"
                        className="form-input"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          value={formData.invoice_status}
                          onChange={(e) => setFormData({...formData, invoice_status: e.target.value})}
                          className="form-input"
                        >
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Doc ID</label>
                        <input
                          type="text"
                          value={formData.book_id}
                          onChange={(e) => setFormData({...formData, book_id: e.target.value})}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Footer */}
                <div className="checkout-footer">
                  <div className="checkout-summary">
                    <div className="checkout-summary-row total">
                      <span>Total Amount</span>
                      <span>{totals.totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Advance / Paid</label>
                      <input
                        type="number"
                        value={formData.advance}
                        onChange={(e) => setFormData({...formData, advance: parseFloat(e.target.value) || 0})}
                        className="form-input advance-input"
                        readOnly={formData.invoice_status === "unpaid"}
                      />
                    </div>

                    <div className="checkout-summary-row">
                      <span>Remaining</span>
                      <span className="remaining-amount">{remaining.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveAllData}
                    className="complete-sale-btn"
                  >
                    <i className="fas fa-check-circle"></i>
                    Complete Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <InvoiceModalPharmacy
          invoiceData={invoiceData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PharmacyTest;
