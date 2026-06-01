
import React, { useEffect, useState, useCallback, useRef  } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
import Home from '../Home';
import UpdateRates from '../UpdateRates';
import Stock from './Stock';
import { saveAs } from 'file-saver';
import HtmlDocx from 'html-docx-js/dist/html-docx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isValid, format } from "date-fns";
import { useItems } from './ItemContext';

import InvoiceModal from './InvoiceModal'; 
import InvoiceList from './InvoiceList';
import Report from './Report';
import IncomeReport from './IncomeReport';
import StockReport from './StockReport';
// import Supplier from './Supplier';
import SuppliersList from './SuppliersList';
import AddDepartment from './AddDepartment';
import AddDoctor from './AddDoctor';
import AddLabTest from './AddLabTest';
import AddFee from './AddFee';
import { AuthProvider, useAuth } from "./AuthContext";
import PatientRegistration from './PatientRegistration';
import EmployeeAttendanceGrid from './EmployeeAttendanceGrid';
import Pharmacy from './Pharmacy';

const Invoice = () => {
//   const printRef = useRef(); // Reference for print section

//   const { user } = useAuth();

//   const handleCloseModal = () => {
//     setIsModalOpen(false);  // Close the modal
//   };

  
// // pdfMake.vfs = pdfFonts.pdfMake.vfs;

//   const notify = () => {
//     toast.success("Your Invoice Saved!");
//   };
//   const [formData, setFormData] = useState({
//     item: '',
//     price: 0,
//     final_price:0,
//     quantity: 1,
//     discount: 0,
//     rate_after_discount: 0,
//     reserve_stock_id:0,
//     total: 0,
//     stock: 0,
//     rack_no: '',
//     stock_id: '',
//     formula: '',
//     final_price: 0,
//     stock_remain: 0,
//     item_name: '',
//     hidden_id: '',
//     invoice_no: '',
//     phone_no: '',
//     patient_id: '',
//     full_name: '',
//     account_no: '',
//     barcode_no:'',
//     reserve_quantity:0,
//     return_unit : 0,
//     total_return_amount: 0,
//     gst:0,
//     invoice_date:  new Date().toLocaleDateString('en-CA'),
//     //this is for reports only
//     from_date:'',
//     to_date:'',
//     status:'paid',
//     age:'',
//     weight:'',
//     bp:''
//   });



//   const { items } = useItems();



// //   const formatDate = (dateString) => {
// //     const date = new Date(dateString);
// //     const day = String(date.getUTCDate()).padStart(2, "0"); // Use getUTCDate()
// //     const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Use getUTCMonth()
// //     const year = date.getUTCFullYear(); // Use getUTCFullYear()
// //     return `${day}-${month}-${year}`;
// // };



// // const inputRef = useRef(null);\\
// const phoneRef = useRef(null);
// const barcodeRef = useRef(null);



// //   const formatDateNew = (date) => {
// //     return date.toLocaleDateString("en-GB", {
// //         day: "2-digit",
// //         month: "short",
// //         year: "numeric"
// //     }).replace(",", ""); // Remove unnecessary comma
// // };


//   const [data, setData] = useState([]);

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
//   const [checkComponent, setComponent] = useState('pharmacy');
//   // const [invoiceListGet, setInvoiceList] = useState([]);

//   // const handleInvoiceListChange = (newInvoiceList) => {
//   //   setInvoiceList(newInvoiceList);
//   // };

//   const [getStock, setStock] = useState([]);

//   const [showBakupLoading, setBakupLoading] = useState(false);

//   const [formDisabled, setFormDisabled] = useState(true);



//    const [invoiceData, setInvoiceData] = useState([]);  // This will hold the invoice data
//   const [isModalOpen, setIsModalOpen] = useState(false);  // To control modal visibility


//   const [invoiceTable, updateInvoiceTable] = useState([]);


//   const [invoiceNoUpdate, setInvoiceUpdate] = useState({
//     invoice_no: ""
//   });



//   const [isVisible, setIsVisible] = useState(false);


//   const [showDatesForReport, setShowDatesForReport] = useState(false);

//   const [patients, setPatients] = useState([]);
//   const [selectedPatientGet, setSelectedPatient] = useState(null);
//   const [error, setError] = useState(null);



//   // const [invoiceData, showInvoiceData] = useState([]);


//   const [reportData, setReportData] = useState('');
//   const [showReport, setShowReport] = useState(false); // Toggle state for the report

//   const [viewReport, setViewReport] = useState(false); // Toggle state for the report

//   const [showEdit, setShow] = useState('');


//   // const [medicine, setMedicine] = useState('');
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [medicine, setMedicine] = useState({
//     item: "",
//     item_name: "",
//   });



//   const [isEditing, setIsEditing] = useState(false);
//   const [isFormDisabled, setIsFormDisabled] = useState((user.user.user_type === 'Receptionist' || user.user.user_type === 'Lab Assistant')  ? false : true);


//   const handleItemChange = (selectedOption) => {
//     const itemDetails = items.find(item => item.id === selectedOption.value);
    
//     setSelectedItem(selectedOption);
    
//     setMedicine({
//       ...medicine,
//       item: selectedOption.value,
//       item_name: selectedOption.label
//     });
//   };

//   const [report, getAllReports] = useState({
//     from_date: '',
//     to_date: '',
//     type: '',
//     gst_or_without: 'gst',
//     medicine_type: ''
//   });


//     const handleDateChangeForm = (event) => {
//      const newDate = event.target.value;
  
//       // Update state
//       setFormData({ ...formData, invoice_date: newDate });
  
//     };

//     function refreshData(){
//       window.location.reload();
//     }


//   function getBackup() {
//     setBakupLoading(true);
//     axios
//       .get(process.env.REACT_APP_API_URL+"/backup")
//       .then((res) => {
//         toast.success("Backup Saved Successfully!");
//         setBakupLoading(false);
//       })
//       .catch((err) => {
//         setBakupLoading(false);
//         // Handle different types of errors
//         if (err.response) {
//           // The request was made and the server responded with a status code
//           // that falls out of the range of 2xx
//           console.error('Error Response:', err.response);
//           toast.error(`Error: ${err.response.data.message || "Something went wrong!"}`);
//         } else if (err.request) {
//           // The request was made but no response was received
//           console.error('Error Request:', err.request);
//           toast.error("Token Refresh! Please Get Backup Again");
//         } else {
//           // Something else caused an error
//           console.error('General Error:', err.message);
//           toast.error(`Error: ${err.message}`);
//         }
//       });
//   }
  


//   function getIncomeReport(){
//      setShowDatesForReport(true);
//   }



//   const fetchStockForBarcode = () => {
//     const numberString = formData.barcode_no;
//     const numberArray = numberString.split(',').map(num => Number(num));
//     // console.log(numberArray);
//     const params = {
//       item_id: numberArray[0],
//       stock_id: numberArray[1]
//     };
//     const selectedItem = items.find(item => item.id === params.item_id);
//     if (!selectedItem) {
//       console.warn("Item not found for ID:", params.item_id);
//       return;
//     }
//     // Set item info from getItems
//     setFormData((prev) => ({
//       ...prev,
//       item: selectedItem.id,
//       item_name: selectedItem.items + " (" + selectedItem.manufacturer + ")",
//       price: selectedItem.price,
//       rate_after_discount: selectedItem.price - formData.discount,
//       final_price: selectedItem.final_price,
//       total: (selectedItem.price - formData.discount) * formData.quantity,
//       stock_id:''
      
//     }));
//     // Fetch stock info
//     axios.get(process.env.REACT_APP_API_URL+"/get-all-stock-for-barcode", { params })
//       .then(res => {
//         const fetchedStock = res.data.results;
//         setStock(fetchedStock);
//         // console.log(fetchedStock);
//         const selectedStock = fetchedStock.find(stock => stock.stock_id === params.stock_id);
//         // console.log("barcode", selectedStock);
//         if (selectedStock) {
//           const remainingStock = selectedStock.remaining_quantity - formData.quantity;
//           // console.log(selectedStock.rack_no);
//           setFormData(prevState => ({
//               ...prevState,
//               stock_remain: remainingStock >= 0 ? remainingStock : 0,  // Ensure remaining stock doesn't go below 0
//               rack_no: selectedStock.rack_no
//           }));
//         }
//       })
//       .catch(err => console.log(err));
//   };
  




//   // const editInvoice = (invoice_no_get) => {

//   //   axios.get(`${process.env.REACT_APP_API_URL}/get-invoice-no/${invoice_no_get}`)
//   //     .then(response => {
//   //       const invoiceData = response.data.results; // Original data from the API

//   //       setFormData({
//   //         ...formData,
//   //         invoice_date: invoiceData[0].invoice_date,        // Assign default value if undefined
//   //         phone_no: invoiceData[0].phone_no,  // Assign default value if undefined
//   //         patient_id: invoiceData[0].patient_id,
//   //         full_name: invoiceData[0].full_name,
//   //         age: invoiceData[0].age,
//   //         weight: invoiceData[0].weight,
//   //         bp: invoiceData[0].bp,
//   //         invoice_date: invoiceData[0].invoice_date,
//   //         hidden_id:''
//   //       });

//   //       setInvoiceUpdate({
//   //         ...invoiceNoUpdate,
//   //         invoice_no: invoice_no_get
//   //       })
        
       
//   //       const transformedData = invoiceData.map(item => {
//   //         // console.log(item.rack_no);
//   //         return {
//   //           // Assuming you want to keep some original properties
//   //           invoice_date: item.invoice_date,        // Assign default value if undefined
//   //           phone_no: item.phone_no,  // Assign default value if undefined
//   //           patient_id:item.patient_id,
//   //           full_name: item.full_name,
//   //           account_no: item.account_no,
//   //           item: item.item,
//   //           hidden_id: item.id,
//   //           item_name: item.item_name, // Rename property
//   //           price: parseFloat(item.price).toFixed(2), // Format and keep original
//   //           quantity: item.quantity, // Keep original
//   //           reserve_quantity: item.quantity, // Keep original
//   //           discount: item.discount, // Keep original
//   //           rate_after_discount: item.price_after_discount, // Calculate new property
//   //           total: item.total,
//   //           stock_id : item.stock_id,
//   //           rack_no: item.rack_no,
//   //           gst: item.gst,
//   //           formula: item.formula,
//   //           invoice_no: item.invoice_no,
//   //           reserve_stock_id:item.stock_id,
//   //           return_unit:item.return_unit,
//   //           total_return_amount:item.total_return_amount,
//   //           status: item.status
//   //         };
//   //       });

//   //     setTableData(transformedData); // Set transformed data to state

//   //       setFormDisabled(false);
//   //       setShow(false);
//   //     })
//   //     .catch(error => {
//   //       console.error('Error:', error);
//   //     });

//   // }

//  const editInvoice = (invoice_no_get) => {
//   axios.get(`${process.env.REACT_APP_API_URL}/get-invoice-no/${invoice_no_get}`)
//     .then(response => {
//       const invoiceData = response.data.results; // Original data from the API

//       // Find the patient in the patients array that matches the patient_id
//       const selectedPatient = patients.find(patient => patient.value === invoiceData[0].patient_id);

//       // Update formData
//       setFormData({
//         ...formData,
//         invoice_date: invoiceData[0].invoice_date || new Date().toLocaleDateString('en-CA'), // Fallback if undefined
//         patient_id: invoiceData[0].patient_id || '',
//         full_name: selectedPatient.name || '',
//         age: selectedPatient.age || '',
//         weight: invoiceData[0].weight || '',
//         bp: invoiceData[0].bp || '',
//         hidden_id: ''
//       });

//       // Update selectedPatientGet for the Select component
//       setSelectedPatient(selectedPatient || null); // Set to null if no matching patient is found

//       // Update invoiceNoUpdate
//       setInvoiceUpdate({
//         ...invoiceNoUpdate,
//         invoice_no: invoice_no_get
//       });

//       // Transform invoice data for table
//       const transformedData = invoiceData.map(item => ({
//         invoice_date: item.invoice_date || new Date().toLocaleDateString('en-CA'),
//         patient_id: item.patient_id || '',
//         item: item.item,
//         hidden_id: item.id,
//         item_name: item.item_name,
//         price: parseFloat(item.price).toFixed(2),
//         quantity: item.quantity,
//         reserve_quantity: item.quantity,
//         discount: item.discount,
//         rate_after_discount: item.price_after_discount,
//         total: item.total,
//         stock_id: item.stock_id,
//         rack_no: item.rack_no,
//         gst: item.gst,
//         formula: item.formula,
//         invoice_no: item.invoice_no,
//         reserve_stock_id: item.stock_id,
//         return_unit: item.return_unit,
//         total_return_amount: item.total_return_amount,
//         status: item.status
//       }));

//       // Update table data
//       setTableData(transformedData);

//       // Enable form and hide modal
//       setFormDisabled(false);
//       setShow(false);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
// };





//   const ViewInvoice = (invoice_no) => {

//     axios.get(`${process.env.REACT_APP_API_URL}/view-invoice-new`, {
//       params: {
//         invoice_no: invoice_no 
//       }
//     })
//       .then(res => {
//         let results = res.data.results;
//         setInvoiceData(results);
//         setIsModalOpen(true);
//       })
//       .catch(err => console.log(err));


//   }




//   const handleInputChange = (event) => {

//     // console.log(formData.reserve_quantity);
//     const { name, value } = event.target;
//     if (name === 'item') {
//       const selectedItem = items.find(item => item.id === parseInt(value));
//       const itemName = selectedItem ? selectedItem.items : '';
//       setFormData({
//         ...formData,
//         [name]: value,
//         item_name: itemName,
//       });
//       // getItemRate(value);
//     } else {
//       const updatedFormData = {
//         ...formData,
//         [name]: value,
//       };
//       if (name === 'rate' || name === 'quantity' || name === 'discount' || name === 'return_unit') {
//         const price = parseFloat(updatedFormData.price);
       
//         const return_unit =  parseFloat(updatedFormData.return_unit);
//         const discount = parseFloat(updatedFormData.discount);

//         if (formData.hidden_id !== "" && formData.reserve_quantity !== "" && name == 'return_unit') {
//           updatedFormData.quantity = formData.reserve_quantity - return_unit;
//         }
        
//         const quantity = parseFloat(updatedFormData.quantity);


//         const stock_get = Number(updatedFormData.stock.toFixed(2));

//         // Calculate total
//         let total = price * quantity;

//         // Apply discount if provided
//         if (!isNaN(discount)) {
//           // var discount_get = (price * quantity) / 100 * discount;
//           var final_amount = (price * quantity) - discount;
//           total = final_amount;
//           if (formData.hidden_id !== "" && formData.reserve_quantity !== "" && name == 'return_unit') {
//             var total_return_amount = (price * parseFloat(updatedFormData.return_unit)) - discount;
//           }
          
//         }

//         // Set total in formData
//         updatedFormData.total = total.toFixed(2);
//         if (formData.hidden_id !== "" && formData.reserve_quantity !== "" && name == 'return_unit') {
//         updatedFormData.total_return_amount = total_return_amount.toFixed(2);
//         }

//         if (!isNaN(stock_get) && !isNaN(quantity)) {
//           updatedFormData.stock_remain = Number(stock_get - quantity).toFixed(2);
//         }

//       }
//       setFormData(updatedFormData);
//     }
//   };


//   const handleSubmit = (event) => {
//     event.preventDefault(); 

//     if (
//       formData.item == "" ||
//       formData.item == null ||
//       formData.invoice_date == "" ||
//       formData.invoice_date == null
//     ) {
//       alert("Please Select Date or Item");
//       return;
//     }
    
//     if (editIndex !== null && editIndex >= 0 && editIndex < tableData.length) {
//       // Use functional updates to ensure we are working with the latest state
//       setTableData(currentTableData => {
//         const updatedTableData = [...currentTableData];
//         // Update the item at editIndex with formData
//         updatedTableData[editIndex] = { ...formData }; // Ensure we're copying formData to avoid direct state mutation

//         return updatedTableData;
//       });

//       // Reset editIndex and form data after update
//       setEditIndex(null);
//       resetFormData();
//       setIsEditing(false); // Set editing flag

//     } else {
//       // Your existing logic for adding new items
//       setTableData(currentTableData => [formData, ...currentTableData]);
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
//       rack_no: '',
//       stock_id: '',
//       formula: '',
//       stock_remain: 0,
//       item_name: '',
//       barcode_no:'',
//       hidden_id:'',
//       reserve_quantity:0,
//       return_unit: 0,
//       total_return_amount: 0,
//     });
//   };

  

//   const handleEdit = (index) => {
   
//     if(formData.hidden_id !== ''){
//       if(tableData[index].hidden_id == formData.hidden_id){
//         return false;
//       }
//     }
    
//     setIsEditing(true);

//     setFormDisabled(false); // Set editing flag
//     setFormData(tableData[index]);

//     const selectedInvoice = tableData[index];

//     // Stock is calculated later in useEffect (below)
//     setEditIndex(index); // S
//   };


//   useEffect(() => {
//     // Recalculate stock_remain whenever formData is updated (after handleEdit)
//     if (formData.stock_id && formData.quantity && formData.stock) {
//       const selectedStock = getStock.find(stock => stock.stock_id === formData.stock_id);
//       if (selectedStock) {
//         if(isEditing == true){

//           var remainingStock = formData.stock - formData.quantity;
//             // console.log("remainingStock", remainingStock,  selectedStock.remaining_quantity, formData.stock);
//         }else{
//           var remainingStock = selectedStock.remaining_quantity - formData.quantity;
//         }
        
//         setFormData(prevState => ({
//           ...prevState,
//           // stock: parseInt(selectedStock.remaining_quantity) + parseInt(formData.quantity),
//           stock_remain: remainingStock >= 0 ? Number(remainingStock.toFixed(1)) : 0,
          
    
//         }));
//       }
//     }

//     if(getStock.length>0 && formData.stock_id &&  checkBarcodeFetch){
//       // console.log("hitted", formData);
//       setTableData(currentTableData => [formData, ...currentTableData]);
//       setBarcodeFetch(false);
//       resetFormData();
//     }

//   }, [formData.stock_id, getStock, formData.stock]);  // Run the effect when stock_id or quantity changes




//   // useEffect(() => {
    
   
//   // }, [getStock]);



//   const handleDelete = (index) => {
//     let updatedTableData = [...tableData];
//     updatedTableData.splice(index, 1);
//     setTableData(updatedTableData);
//   };

//   // Calculate totals before the return statement in your component
//   const totals = tableData.reduce(
//     (acc, item) => {
//       acc.totalQuantity += parseFloat(item.quantity) || 0;
//       acc.totalAmount += parseFloat(item.total) || 0;
//       return acc;
//     },
//     { totalQuantity: 0, totalAmount: 0 }
//   );


//   const calculateDiscount = (get_discount) => {
//     const get_created_discount = get_discount.target.value;
//     const rate_get = formData.price;
//     setFormData(prevState => ({
//       ...prevState,
//       rate_after_discount: rate_get - (rate_get / 100 * get_created_discount)
//     }));


//   }


  
 
  



//   // const filteredStockOptions = getStock
//   // ? getStock
//   //     .filter(stock => formData.hidden_id ? true : stock.remaining_quantity > 0) 
//   //     .map(stock => {
//   //       return {
//   //         value: stock.stock_id,
//   //         label: `Invoice: ${stock.invoice_no} (Remaining: ${stock.remaining_quantity}, Stock Date: ${stock.earliest_expiry})`,
//   //         rack_no:stock.rack_no,
//   //         final_price:stock.final_price,
//   //         // price_get: stock.price,
//   //         // price_get_after_discount: stock.price_after_discount,
//   //         get_stock: stock.remaining_quantity +  (stock.stock_id == formData.reserve_stock_id ? Number(Number(formData.reserve_quantity).toFixed()) : 0),

//   //         // get_discount: stock.discount
//   //       };
//   //     })
//   // : [];


  

//   // useEffect(() => {

   
//   //   if (filteredStockOptions.length > 0) {
//   //     setFormData(prev => ({
//   //       ...prev,
//   //       stock_id: formData.hidden_id !== '' || isEditing == true ? formData.stock_id : filteredStockOptions[0].value,
//   //       rack_no: formData.hidden_id !== ''  || isEditing == true ? formData.rack_no : filteredStockOptions[0].rack_no,
//   //       final_price: formData.hidden_id !== ''  || isEditing == true ? formData.final_price : filteredStockOptions[0].final_price,
//   //       stock: formData.hidden_id !== '' || showEdit == true || isEditing == true
//   //         ? Number(filteredStockOptions.find((option) => option.value === formData.stock_id)?.get_stock) 
//   //         : filteredStockOptions[0].get_stock,
//   //     }));
//   //   }

  

//   // }, [getStock]); // Ensure dependencies are correctly defined



//   // Below code is change
//   const filteredStockOptions = getStock
//   ? getStock
//       .filter(stock => formData.hidden_id ? true : stock.remaining_quantity > 0)
//       .map(stock => {
//         return {
//           value: stock.stock_id,
//           label: `Invoice: ${stock.invoice_no} (Remaining: ${stock.remaining_quantity}, Stock Date: ${stock.earliest_expiry})`,
//           rack_no: stock.rack_no,
//           final_price: stock.final_price,
//           get_stock: stock.remaining_quantity + (stock.stock_id == formData.reserve_stock_id ? parseFloat(formData.reserve_quantity) : 0),
//         };
//       })
//   : [];



  
//   useEffect(() => {
//   if (filteredStockOptions.length > 0) {
//     setFormData(prev => ({
//       ...prev,
//       stock_id: formData.hidden_id !== '' || isEditing ? formData.stock_id : filteredStockOptions[0].value,
//       rack_no: formData.hidden_id !== '' || isEditing ? formData.rack_no : filteredStockOptions[0].rack_no,
//       final_price: formData.hidden_id !== '' || isEditing ? formData.final_price : filteredStockOptions[0].final_price,
//       stock: formData.hidden_id !== '' || showEdit || isEditing
//         ? parseFloat(filteredStockOptions.find((option) => option.value === formData.stock_id)?.get_stock || 0)
//         : parseFloat(filteredStockOptions[0].get_stock),
//     }));
//   }
// }, [getStock, formData.hidden_id, formData.stock_id, isEditing, showEdit]);
  







//   const calculateDaysDifference = (fromDate, toDate) => {
//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     const differenceInTime = to.getTime() - from.getTime();
//     return Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert to days
//   };

//   // Check if the difference in days is greater than zero
//   const isDateDifferenceValid = report.from_date && report.to_date && calculateDaysDifference(report.from_date, report.to_date) > 1;

  


//   const deleteItem = (id, item_id, index) => {
  
//     let confirm_delete = window.confirm("Are you sure you want to delete this item?");

//     if(!confirm_delete){
//       return false;
//     }
    
//     axios.get(`${process.env.REACT_APP_API_URL}/delete-invoice-item/${id}/${item_id}`)
//     .then(response => {
    
//       toast.error("Item Deleted Successfully!");

//       let updatedTableData = [...tableData];
//       updatedTableData.splice(index, 1);
//       setTableData(updatedTableData);

//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
//   };








// useEffect(() => {
//   // console.log(selectedPatientGet.value);
//   setTableData((prevTableData) =>
//     prevTableData.map((item) => ({
//       ...item,
//       invoice_date: formData.invoice_date,
//       phone_no: formData.phone_no,
//       full_name: formData.full_name,
//       account_no: formData.account_no,
//       age: formData.age,
//       weight: formData.weight,
//       bp: formData.bp,
//       patient_id: formData.patient_id
//     }))
//   );
// }, [formData.patient_id,formData.invoice_date, formData.phone_no,  formData.full_name, formData.account_no, formData.age, formData.weight, formData.bp]);




// const tableDataRef = useRef(tableData); // Create a ref to store tableData

// useEffect(() => {
//   tableDataRef.current = tableData; // Update ref whenever tableData changes
// }, [tableData]); // This ensures ref always holds the latest value





//         const handleSaveAllData = useCallback(async () => {
//           // console.log(selectedPatient);
//           // console.log(JSON.stringify(tableDataRef.current)); // Use ref to get the latest tableData
//           // console.log(invoiceNoUpdate);
//           // console.log(formData.phone_no.length, tableDataRef.current.length);
//           // if (formData.phone_no.length !== 12 &&  tableDataRef.current.length <= 0) {
//           //     // toast.error("Enter All Required Fields!");
//           //     return false;
//           // }


//           // console.log(tableDataRef.current);



//           try {
//             const response = await fetch(process.env.REACT_APP_API_URL+'/insert-invoice', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json'
//               },
//               body: JSON.stringify({
//                 tableData: tableDataRef.current,  // First set of data
//                 invoice_no_get: invoiceNoUpdate.invoice_no
//               })
//             });

//             if (!response.ok) {
//               throw new Error('Failed to insert data');
//             }

//             const data = await response.json();
//             setInvoiceData(data.items);
//             setIsModalOpen(true); 

//             setFormData((prevFormData) => ({
//               ...prevFormData,
//             item: '',
//             price: 0,
//             // final_price:0,
//             quantity: 1,
//             discount: 0,
//             rate_after_discount: 0,
//             reserve_stock_id:0,
//             total: 0,
//             stock: 0,
//             rack_no: '',
//             stock_id: '',
//             formula: '',
//             final_price: 0,
//             stock_remain: 0,
//             item_name: '',
//             hidden_id: '',
//             patient_id:'',
//             invoice_no: '',
//             phone_no: '',
//             full_name: '',
//             account_no: '',
//             barcode_no:'',
//             reserve_quantity:0,
//             gst:0,
//             age:'',
//             weight:'',
//             bp:''
//             }));
//             setTableData([]);
//             setSelectedPatient(null);
//             updateInvoiceTable([]);
//             notify();
//             setInvoiceUpdate((prevFormData) => ({
//               ...prevFormData,
//               invoice_no:''
//             }));

//             setFormDisabled(true);

//           } catch (error) {
//             console.error('Error sending data:', error);
//           }
//         }, [invoiceNoUpdate]); // No dependencies to avoid stale state issues





// useEffect(() => {
//   const handleKeyDown = (event) => {
//     if (event.ctrlKey && event.key === "s" && checkComponent === "invoice") {
//       event.preventDefault();
//       handleSaveAllData();
//       if (tableDataRef.current?.length > 0) {
//         setFormDisabled(true);
//       }
//     }
//   };

//   if (checkComponent === "invoice") {
//     window.addEventListener("keydown", handleKeyDown);
//   }

//   return () => {
//     window.removeEventListener("keydown", handleKeyDown);
//   };
// }, [checkComponent, handleSaveAllData, showEdit]);
// // start from store previosu value and set reserverd all data



// const handleFetch = () => {
//   axios.get(`${process.env.REACT_APP_API_URL}/fetch-customer-data/${formData.phone_no}`)
//   .then(response => {
   
//     const customerData = response.data.results[0];
//     if (customerData) {
//       setFormData(prevState => ({
//         ...prevState,
//         full_name: customerData.full_name,
//         phone_no: customerData.phone_no,
//         account_no: customerData.account_no,
//       }));
//     } else {
//       // alert("No data found for this phone number.");
//       setFormData(prevState => ({
//         ...prevState,
//         full_name: "",
//         account_no: "",
//       }));

//     }

//     setFormDisabled(false);

//     barcodeRef.current?.focus(); // Focus barcode field

//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
// };


// const handleRateChange = (e, index) => {
//   const newData = [...tableData];
//   const newRate = parseFloat(e.target.value); // Ensure it's a number
//   newData[index].price = newRate;

//   // Recalculate After Discount and Total
//   newData[index].rate_after_discount = (newRate - (newRate * (newData[index].discount / 100))).toFixed(2); // Rounded to 2 decimal places
//   newData[index].total = (newData[index].rate_after_discount * newData[index].quantity).toFixed(2); // Rounded to 2 decimal places

//   setTableData(newData);
// };

// const handleQuantityChange = (e, index) => {
//   const newData = [...tableData];
//   const newQuantity = parseFloat(e.target.value); // Ensure it's a number
//   newData[index].quantity = newQuantity;

//   // Recalculate Total (Total = After Disc * Quantity)
//   newData[index].total = (newData[index].rate_after_discount * newQuantity).toFixed(2); // Rounded to 2 decimal places

//   setTableData(newData);
// };

// const handleDiscountChange = (e, index) => {
//   const newData = [...tableData];
//   const newDiscount = parseFloat(e.target.value); // Ensure it's a number
//   newData[index].discount = newDiscount;

//   // Recalculate After Discount and Total
//   newData[index].rate_after_discount = (newData[index].price - newDiscount).toFixed(2); // Rounded to 2 decimal places
//   newData[index].total = (newData[index].rate_after_discount * newData[index].quantity).toFixed(2); // Rounded to 2 decimal places

//   setTableData(newData);
// };

// const handleAfterDiscountChange = (e, index) => {
//   const newData = [...tableData];
//   const newAfterDiscount = parseFloat(e.target.value); // Ensure it's a number
//   newData[index].rate_after_discount = newAfterDiscount;

//   // Recalculate Total (Total = After Disc * Quantity)
//   newData[index].total = (newData[index].rate_after_discount * newData[index].quantity).toFixed(2); // Rounded to 2 decimal places

//   setTableData(newData);
// };

// const handleTotalChange = (e, index) => {
//   const newData = [...tableData];
//   newData[index].total = parseFloat(e.target.value).toFixed(2); // Ensure it's a number and rounded to 2 decimal places
//   setTableData(newData);
// };



// useEffect(() => {
//   phoneRef.current?.focus();
// }, []);


// const fetchPatients = async () => {
//       setLoading(true);
//       try {
//         // Assuming an API endpoint '/api/patients' that returns patient records
//         const response = await axios.get(process.env.REACT_APP_API_URL+'/api/patients');
//         const patientOptions = response.data.map((patient) => ({
//           value: patient.id,
//           label: `${patient.mrNo} - ${patient.contact} (${patient.name} ${patient.relation} ${patient.husbandOrFatherName})`,
//           name: patient.name,
//           age: patient.age
//         }));
//         setPatients(patientOptions);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch patient records');
//         setLoading(false);
//         console.error(err);
//       }
//     };

// useEffect(() => {
//     fetchPatients();
//   }, []);


// const handleChange = (selectedOptionGet) => {
//   setSelectedPatient(selectedOptionGet);
//   if (selectedOptionGet) {
//     // Use the selected patient's data directly from the patients array
//     setFormData(prevState => ({
//       ...prevState,
//       full_name: selectedOptionGet.name || '',
//       age: selectedOptionGet.age || '',
//       weight: selectedOptionGet.weight || '',
//       bp: selectedOptionGet.bp || '',
//       patient_id: selectedOptionGet.value || ''
//     }));
//     setFormDisabled(false); // Enable form after selecting a patient
//   } else {
//     // Clear fields if no patient is selected
//     setFormData(prevState => ({
//       ...prevState,
//       full_name: '',
//       age: '',
//       weight: '',
//       bp: '',
//       patient_id:''
//     }));
//     setFormDisabled(true); // Disable form if no patient is selected
//   }
// };


// function fetchPatientMedicine(){
//     //this is compulsory dont delete it
// }

//   return (
//     <div className="d-flex">
//      {showBakupLoading && (
//   <div className="loading-container">
//     <div className="loading-text">Backup is Being Created... Please wait</div>
//   </div>
// )}


//       <div>
//         {/* <button onClick={handleToggleVisibility} style={{margin: '20px'}}>
//         {isVisible ? 'Close' : 'View'}
//       </button> */}

//         {isVisible && (
//           <div>
//             <div style={{ display: 'flex', justifyContent: 'space-between' }}>  <h5>Invoice</h5> <a href="#" onClick={() => setIsVisible(false)} ><i className='fa fa-window-close'></i></a></div>

//             <table className='tableStyle'>
//               <thead>
//                 <tr>
//                   <th>Item</th>
//                   <th>Price</th>
//                   <th>Quantity</th>
//                   <th>Discount</th>
//                   <th>After_Discount</th>
//                   <th>Total</th>
//                   {/* <th>Created_At</th> */}
//                 </tr>
//               </thead>
//               <tbody>
//                 {invoiceData.map((item) => (
//                   <tr>
//                     <td> {item.item_name} </td>
//                     <td> {item.price} </td>
//                     <td> {item.quantity} </td>
//                     <td> {item.discount} </td>
//                     <td style={{ color: 'green' }}>  {item.price - (item.price / 100 * item.discount)} </td>
//                     <td> {item.total} </td>
//                     {/* <td> {item.created_at} </td> */}
//                   </tr>
//                 ))}
//                 <tr>
//                   <td colSpan="5" className='text-right'><b>Grand Total (Rs.):</b></td>
//                   {/* Calculate and display the overall total */}
//                   <td className='text-left'>
//                     {invoiceData.reduce((acc, item) => acc + parseFloat(item.total), 0)}
//                   </td>
//                 </tr>
//               </tbody>
//             </table >


//           </div>
//         )}


// <div className={`d-flex ${showEdit ? 'blur-background' : ''}`}>

// {showEdit == 'add_department' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "90%",
//   maxWidth: "1600px",
//   maxHeight: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <AddDepartment onClose={() => setShow(false)}/>
//         </div>
//       )}


// {showEdit == 'add_patient' && (
//   <div style={{
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     zIndex: 1000,
//     backgroundColor: "#fff",
//     padding: "10px",
//     border: "1px solid #ccc",
//     boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//     width: "90%",
//     maxWidth: "1600px",
//     maxHeight: "90vh",
//     overflowY: "auto",
//     overflowX: "hidden",
//   }}>
//     {/* Close button with sticky positioning */}
//     <div style={{
//       position: "sticky",
//       top: "10px",
//       right: "10px",
//       zIndex: 1001, // Ensure button stays above other content
//       textAlign: "right",
//     }}>
//       <button
//         className="btn btn-primary mb-2"
//         onClick={() => setShow(false)}
//       >
//         x
//       </button>
//     </div>
//     <PatientRegistration onClose={() => setShow(false)} fetchPatientsInvoice={fetchPatients}/>
//   </div>
// )}






// {showEdit == 'EmployeeAttendanceGrid' && (
//   <div style={{
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     zIndex: 1000,
//     backgroundColor: "#fff",
//     padding: "10px",
//     border: "1px solid #ccc",
//     boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//     width: "90%",
//     maxWidth: "1600px",
//     maxHeight: "90vh",
//     overflowY: "auto",
//     overflowX: "hidden",
//   }}>
//     {/* Close button with sticky positioning */}
//     <div style={{
//       position: "sticky",
//       top: "10px",
//       right: "10px",
//       zIndex: 1001, // Ensure button stays above other content
//       textAlign: "right",
//     }}>
//       <button
//         className="btn btn-primary mb-2"
//         onClick={() => setShow(false)}
//       >
//         x
//       </button>
//     </div>
//     <EmployeeAttendanceGrid onClose={() => setShow(false)}/>
//   </div>
// )}


// {showEdit == 'add_fee' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "90%",
//   maxWidth: "1600px",
//   maxHeight: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <AddFee onClose={() => setShow(false)}/>
//         </div>
//       )}




// {showEdit == 'add_doctor' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "90%",
//   maxWidth: "1600px",
//   maxHeight: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <AddDoctor onClose={() => setShow(false)}/>
//         </div>
// )}




// {showEdit == 'add_lab_test' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "100%",
//   height:"100%",
//   // maxWidth: "1600px",
//   // maxHeight: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <AddLabTest onClose={() => setShow(false)}/>
//         </div>
// )}


// {showEdit == 'invoice' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "98%",
//   maxWidth: "1600px",
//   height: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end sticky-top"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <InvoiceList  
//            ViewInvoice={ViewInvoice} 
//            editInvoice={editInvoice} 
//           //  deleteInvoice={deleteInvoice}
//           onClose={() => setShow(false)}/>
//           {/* <InvoiceList/> */}
//         </div>
//       )}





//  {showEdit === "pharmacy" && (
//         <>
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 1000,
//             }}
//             onClick={() => setShow(false)}
//           ></div>
//           <div
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 1005,
//               backgroundColor: "#fff",
//               padding: "5px",
//               width: "100%",
//               height: "100%",
//               overflowY: "auto",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//           >
//             <div className="d-flex justify-content-end">
//               <button
//                 className="btn btn-primary mb-2"
//                 onClick={() => {
//                   setShow(false);
//                   setComponent('pharmacy');
//                 }}
//               >
//                 x
//               </button>
//             </div>
//             <Pharmacy
//               onClose={() => {
//                   setShow(false);
//                   setComponent('pharmacy');
//                 }}
//               invoiceNo={''}
//               patientId={''}
//               fetchPatientMedicine={fetchPatientMedicine}
//               setComponent = {setComponent}
//               checkComponent = {checkComponent}
//             />
//           </div>
//         </>
//       )}




//  {showEdit === "add_stock" && (
//         <>
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 1000,
//             }}
//             onClick={() => setShow(false)}
//           ></div>
//           <div
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 1005,
//               backgroundColor: "#fff",
//               padding: "5px",
//               width: "100%",
//               height: "100%",
//               overflowY: "auto",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//           >
//             <div className="d-flex justify-content-end sticky-top">
//               <button
//                 className="btn btn-primary mb-2"
//                 onClick={() => {
//                   setShow(false);
//                   setComponent('pharmacy');
//                 }}
//               >
//                 x
//               </button>
//             </div>
//             <Stock
//               onClose={() => {
//                   setShow(false);
//                   setComponent('pharmacy');
//                 }}
//               invoiceNo={''}
//               patientId={''}
//               fetchPatientMedicine={fetchPatientMedicine}
//               setComponent = {setComponent}
//               checkComponent = {checkComponent}
//             />
//           </div>
//         </>
//       )}




// {showEdit == 'report' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "98%",
//   maxWidth: "1600px",
//   height: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           {/* <InvoiceList  
//            ViewInvoice={ViewInvoice} 
//            editInvoice={editInvoice} 
//           //  deleteInvoice={deleteInvoice}
//           onClose={() => setShow(false)}/> */}
//           <Report/>
//         </div>
//       )}





// {showEdit == 'update_rates' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "90%",
//   maxWidth: "1000px",
//   maxHeight: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <UpdateRates onClose={() => setShow(false)} />
//         </div>
//       )}



// {showEdit == 'Stock' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "90%",
//   // maxWidth: "1800px",
//   maxHeight: "90vh", // Set a max height to make sure it scrolls when content overflows
//   overflowY: "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <Stock onClose={() => setShow(false)} />
//         </div>
//       )}




      
// {showEdit == 'income_report' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "98%",
//   maxWidth: "1200px",
//   height: "90vh", // Set a max height to make sure it scrolls when content overflows
//   // minHeight: "400px", // Set a 
//   overflowY:  "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <IncomeReport  
//           onClose={() => setShow(false)}/>
//         </div>
//       )}



// {showEdit == 'stock_report' && (
//         <div  style={{
//           position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   zIndex: 1000,
//   backgroundColor: "#fff",
//   padding: "10px",
//   border: "1px solid #ccc",
//   boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//   width: "98%",
//   maxWidth: "1200px",
//   height: "90vh", // Set a max height to make sure it scrolls when content overflows
//   // minHeight: "400px", // Set a 
//   overflowY:  "auto", // Allows vertical scrolling when content overflows
//   overflowX: "hidden", // Optionally, hide horizontal scrolling
          
//         }}>
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end"><button
//             className="btn btn-primary mr-2 mb-2"
//             onClick={() => setShow(false)}
//           >
//            x
//           </button>
//           </div>
//           <StockReport  
//           onClose={() => setShow(false)}/>
//         </div>
//       )}


// </div>



// {showEdit == 'suppliers' && (

//   <SuppliersList 
//   onClose={() => setShow(false)} 
//   showEdit={showEdit} 
//   setShow={setShow} 
// />

//       )}


//       </div>


//       <div className='col-md-6 p-2'>
//         <div className='border p-2'>
//           <h5 className='text-warning bg-primary p-2 card-header'> <i className='fas fa-shopping-cart'></i> Invoice Form</h5>
//           <form className='p-3'  onSubmit={handleSubmit}  >


         

        
//     <div className='d-flex flex-column'>

//   {user.user.user_type !== 'Pharmacy Assistant' && (
//  <div className='d-flex mb-2'>
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => getBackup()}><i className="fas fa-database"></i> Get Backup</a>
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('report'); resetFormData(); }}><i className="fas fa-search"></i> Report</a>
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('add_lab_test'); resetFormData(); }}><i className="fas fa-flask"></i> Create Heads</a>
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('add_doctor'); resetFormData(); }}><i className="fas fa-user-md"></i> Add Doctor</a>
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('add_department'); resetFormData(); }}><i className="fas fa-building"></i> Add Department</a>
//       <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('add_fee'); resetFormData(); }}><i className="fas fa-credit-card"></i> Add Fee</a>
//   </div>
//   )}
 

//   <div className='d-flex '>
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('invoice'); resetFormData(); }}><i className="fas fa-receipt"></i> Reception Invoices</a>

//       {user.user.user_type !== 'Pharmacy Assistant' && (
//          <>
         
//           <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('add_patient'); resetFormData(); }}><i className="fas fa-plus"></i> Add Patient</a>
//           <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('EmployeeAttendanceGrid'); resetFormData(); }}>Attendance</a>
//       </>
//               )}
//     <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('pharmacy'); resetFormData(); }}><i class="fas fa-pills"></i> Add Medicine</a>
//    <a href="#" className='btn btn-sm btn-warning mb-2 mr-2' onClick={() => { setShow('add_stock'); resetFormData(); }}><i class="fas fa-truck"></i> Add Stock</a>
//   </div>
// </div>
            
          
//           <fieldset disabled={isFormDisabled}>
           
//         <div style={{"border" : "2px solid #007bff", "padding" : "10px", "borderRadius" : "10px"}}>

//         <div className="form-group row mt-3">
//         <label htmlFor="invoice_date"  className="col-sm-2 col-form-label">
//         Date
//       </label>
//         <div className="col-sm-10">
//         <input
//         type="date"
//         onChange={handleDateChangeForm}
//         readOnly
//         className="form-control"
//         value={formData.invoice_date} // Controlled component
//       />
//         </div>
//         </div>
//         <>



//           <div className="form-group row mt-3">
//   <label htmlFor="army_no" className="col-sm-2 col-form-label">
//     Patient
//   </label>
//     <div className="col-sm-10">
//      <Select
//         id="patient-select"
//         options={patients}
//         value={selectedPatientGet}
//         onChange={handleChange}
//         isLoading={loading}
//         isClearable
//         placeholder="Select a patient..."
//         noOptionsMessage={() => "No patients found"}
//         isSearchable
//       />
//   </div>
// </div>



//           <div className="form-group row mt-3">
//             <label htmlFor="full_name" className="col-sm-2 col-form-label">
//               Particulars
//             </label>
//             <div className="col-sm-4">
//               <input
//                 type="text"
//                 id="full_name"
//                 name="full_name"
//                 value={formData.full_name}
//                 onChange={handleInputChange}
//                 placeholder="Full Name"
//                 className="form-control"
//                 readOnly
//               />
//             </div>

//             <div className="col-sm-2">
//               <input
//                 type="text"
//                 id="age"
//                 name="age"
//                 value={formData.age || ""}
//                 onChange={handleInputChange}
//                 placeholder="Age"
//                 className="form-control"
//                 readOnly
//               />
//             </div>

//             <div className="col-sm-2">
//               <input
//                 type="text"
//                 id="weight"
//                 name="weight"
//                 value={formData.weight || ""}
//                 onChange={handleInputChange}
//                 placeholder="Weight"
//                 className="form-control"
//               />
//             </div>

//             <div className="col-sm-2">
//               <input
//                 type="text"
//                 id="bp"
//                 name="bp"
//                 value={formData.bp || ""}
//                 onChange={handleInputChange}
//                 placeholder="bp"
//                 className="form-control"
//               />
//             </div>
//           </div>
//         </>
    

// </div>


// <div style={{"border" : "2px solid #007bff", "padding" : "10px", "borderRadius" : "10px", "marginTop" : "20px"}}>
// <div className="form-group row">
//   <div className="col-md-12">
//   <label htmlFor="stock">Select Head</label>
//     <Select
//     isDisabled={formDisabled}
//       id="item"
//       name="item"
//       value={formData.item ? { value: formData.item, label: formData.item_name } : null}
//       options={items.map(item => ({ value: item.id, label: item.item}))}
//       onChange={selectedOption => {
//         const selectedItem = items.find(item => item.id === selectedOption.value);
//         setFormData({
//           ...formData,
//           item: selectedOption.value,
//           item_name: selectedOption.label,
//           price: selectedItem.price ? selectedItem.price : "",
//           rate_after_discount: selectedItem.price
//             ? selectedItem.price - formData.discount
//             : "",
//           total: selectedItem.price * formData.quantity,
//           barcode_no:'',
//           stock_id:''
//         });

//         // getItemRate(selectedOption.value);
//       }}
//       placeholder="Select OPD/Lab Test"
//     />
//   </div>



//   <div className="col-sm-4 d-none">
//               <label htmlFor="quantity">Qty/Unit</label>
//                 <input
//                   type="text"
//                   id="quantity"
//                   name="quantity"
//                   value={formData.quantity}
//                   onChange={handleInputChange}
//                   placeholder="Quantity"
//                   className='form-control'
//                   disabled={formDisabled || formData.item === ""}
//                 />
//               </div>



// </div>





            




//             <div className="form-group row">
//               {/* <label htmlFor="rate" className="col-sm-2 col-form-label">Price</label> */}
//               <div className="col-sm-4">
//               <label htmlFor="price">Fee</label>
//                 <input readOnly
//                   type="text"
//                   id="price"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleInputChange}
//                   placeholder="Actual Price"
//                   className='form-control'
//                   disabled={formDisabled}
//                 />
//               </div>


//               <div className="col-sm-4">
//               <label htmlFor="discount">Discount</label>
//                 <input
//                   type="text"
//                   id="discount"
//                   name="discount"
//                   value={formData.discount}
//                   onChange={handleInputChange}
//                   onKeyUp={calculateDiscount}
//                   placeholder="Discount"
//                   className='form-control'
//                   disabled={formDisabled}
//                 />
//               </div>



//               <div className="col-sm-4">
//               <label htmlFor="rate_after_discount">Total</label>
//                 <input readOnly
//                   type="text"
//                   id="rate_after_discount"
//                   name="rate_after_discount"
//                   value={formData.rate_after_discount}
//                   onChange={handleInputChange}
//                   placeholder="Rate After Discount"
//                   className='form-control'
//                   disabled={formDisabled}
//                 />
//               </div>
//             </div>

//             <div className="form-group row">
           
//         <div className="col-sm-12">
//         <label htmlFor="stock">Status</label>
//           <select
//             id="status"
//             name="status"
//             value={formData.status}
//             className="form-control"
//             onChange={(e) => setFormData({ ...formData, status: e.target.value })} >
//             <option value="paid">Paid</option>
//             <option value="unpaid">Unpaid</option>
//           </select>
//         </div>
//       </div>



//             {formData.hidden_id !== '' && (
//             <div className="form-group row d-none">
//               {/* <label htmlFor="rate" className="col-sm-2 col-form-label">Price</label> */}
//               <div className="col-sm-4">
//               <label htmlFor="return_unit">Return.Unit</label>
//                 <input 
//                   type="text"
//                   id="return_unit"
//                   name="return_unit"
//                   value={formData.return_unit}
//                   onChange={handleInputChange}
//                   placeholder="Return Unit"
//                   className='form-control'
                 
//                 />
//               </div>


//               <div className="col-sm-8 d-none">
//               <label htmlFor="total_return_amount">T.Return.Amount</label>
//                 <input
//                 readOnly
//                   type="text"
//                   id="total_return_amount"
//                   name="total_return_amount"
//                   value={formData.total_return_amount}
//                   onChange={handleInputChange}
//                   placeholder="total_return_amount"
//                   className='form-control'
//                   // disabled={formDisabled}
//                 />
//               </div>
//             </div>
// )}

//           </div>

//             <div style={{"border" : "2px solid #007bff", "display":"none",  "padding" : "10px", "borderRadius" : "10px", "marginTop" : "20px", "marginBottom" : "20px"}}>
//             <div className="form-group row d-none">
//               <label htmlFor="total" className="col-sm-2 col-form-label">Total</label>
//               <div className="col-sm-10">
//                 <input
//                   type="text"
//                   id="total"
//                   name="total"
//                   value={formData.total}
//                   readOnly
//                   placeholder="Total"
//                   className='form-control'
//                   disabled={formDisabled}
//                 />
//               </div>
//             </div>

//             </div>


            

//             <div className="form-group row mt-2">
//               <label className="col-sm-2 col-form-label"></label>
//               <div className="col-sm-10 d-flex justify-content-end">
//                 <button type="submit"  disabled={formDisabled}  className='btn btn-sm btn-primary'> <i className="fas fa-credit-card"></i> {editIndex !== null ? 'Update' : 'Add'}</button>
//               </div>
//             </div>

//             <input
//               type="hidden"
//               name="invoice_no"
//               value={formData.invoice_no}
//               className='form-control'
//             />

//             </fieldset>
//           </form>


          
//         </div>
        

      
//       </div>

//       <div className='col-md-6 p-2'>

//         <div className='table-responsive p-2 border' >


//           <div>
//             <h5 className='text-warning bg-primary p-2 card-header'>
//               <div className='row'>
//                 <div className="col">
//                   <i className="fas fa-receipt"></i>  Invoice
//                 </div>
//                 <div className="col d-flex justify-content-end mr-1">
//                   <button className='btn btn-sm btn-warning' onClick={handleSaveAllData}>  <i className="fas fa-print"></i>&nbsp;Save&nbsp;Invoice</button>
//                 </div>

//               </div>
//             </h5>
//           </div>


          


// <table className='table table-striped'>
//   <thead>
//     <tr>
//       <td colSpan={7}>
//         <div className="row d-flex justify-content-center">
//           <div className="col-3 d-none">
//             <label htmlFor="" className='text-center d-block'>
//               <li className='fas fa-weight-hanging'></li> Total Quantity
//             </label>
//             <input 
//               type="text" 
//               className='form-control text-center bg-primary text-white' 
//               value={totals.totalQuantity.toFixed(2)} 
//               disabled 
//               placeholder='Total Quantity' 
//               id='total_amount' 
//             />
//           </div>
//           <div className="col-3">
//             <label htmlFor="" className='text-center d-block'>
//               <li className='fas fa-calculator'></li> Total Amount
//             </label>
//             <input 
//               type="text" 
//               className='form-control text-center bg-primary text-white' 
//               value={totals.totalAmount.toFixed(2)} 
//               disabled 
//               placeholder='Total Amount' 
//               id='total_amount' 
//             />
//           </div>
//         </div>
//       </td>
//     </tr>
//     <tr>
//       <th>Item</th>
//       <th className='text-center'>Rate</th>
//       {/* <th className='text-center'>Quantity</th> */}
//       <th className='text-center'>Discount</th>
//       <th className='text-center'>After Disc</th>
//       <th className='text-center'>Total</th>
//       <th >Edit</th>
//       <th>Delete</th>
//     </tr>
//   </thead>
//   <tbody>
//     {tableData.map((data, index) => (
//       <tr key={index}>
//         <td style={{ display: 'none' }} >{data.item}</td>
//         <td style={{ display: 'none' }} >{data.hidden_id}</td>
//         <td className=''>{data.item_name}</td>

//         {/* Editable Rate */}
//         <td className='text-center'>
//           <input
//             readOnly={true}
//             type="number"
//             className="form-control"
//             value={data.price}
//             onChange={(e) => handleRateChange(e, index)} // handleRateChange will update the rate state
//           />
//         </td>

//         {/* Editable Quantity */}
//         <td className='text-center d-none'>
//           <input
//             type="number"
//             className="form-control"
//             value={data.quantity}
//             readOnly
//             onChange={(e) => handleQuantityChange(e, index)} // handleQuantityChange will update the quantity state
//           />
//         </td>

//         {/* Editable Discount */}
//         <td className='text-center'>
//           <input
//             type="number"
//             className="form-control"
//             value={data.discount}
//             onChange={(e) => handleDiscountChange(e, index)} // handleDiscountChange will update the discount state
//           />
//         </td>

//         {/* Editable After Discount */}
//         <td className='text-center'>
//           <input
//            readOnly={true}
//             type="number"
//             className="form-control"
//             value={data.rate_after_discount}
//             onChange={(e) => handleAfterDiscountChange(e, index)} // handleAfterDiscountChange will update the after discount state
//           />
//         </td>

//         {/* Editable Total */}
//         <td className='text-center'>
//           <input
//              readOnly={true}
//             type="number"
//             className="form-control"
//             value={data.total}
//             onChange={(e) => handleTotalChange(e, index)} // handleTotalChange will update the total state
//           />
//         </td>

//         <td className='text-center'>
//           <button className='btn btn-sm btn-warning mr-2' onClick={() => handleEdit(index)}><i className="fas fa-edit"></i></button>
//         </td>
//         <td className='text-center'>
//         {data.hidden_id == '' ? (
//             <button className='btn btn-sm btn-danger' onClick={() => handleDelete(index)}><i className="fas fa-trash-alt"></i></button>
//           ) : (
//             <button className='btn btn-sm btn-danger' onClick={() => deleteItem(data.hidden_id, data.item, index)}><i className="fas fa-trash-alt"></i></button>
//           )}
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </table>


//         </div>
//       </div>
//       <div>
//       {isModalOpen && <InvoiceModal  ViewInvoice={ViewInvoice}  invoiceData={invoiceData}  onClose={handleCloseModal} setComponent = {setComponent}
//               checkComponent = {checkComponent} />}
//     </div>
// </div>



//   );
};

export default Invoice;





