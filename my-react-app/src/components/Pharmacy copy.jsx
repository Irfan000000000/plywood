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

const Pharmacy = ({
  onClose,
  invoiceNo,
  patientId = 0,
  doctorID = 0,
  fetchPatientMedicine = "",
}) => {
  const [patientIdGet, setPatientId] = useState(patientId);
  const [doctorInvoiceId, setDoctorInvoiceId] = useState(doctorID);
  const [checkComponent, setComponent] = useState("pharmacy");


  
  // Add this state variable with your other useState declarations
  const [barcodeInput, setBarcodeInput] = useState("");


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
    invoice_status:"paid",
    alert_date:""
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

  // POS specific states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const phoneRef = useRef(null);
  const barcodeRef = useRef(null);
  const fullNameRef = useRef(null);
  const searchRef = useRef(null);

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

  // POS Card Click Handler
  const handleItemCardClick = (selectedItem) => {
    const itemPrice = selectedItem.price || 0;
    const finalPrice = selectedItem.final_price || 0;
    const itemDiscount = selectedItem.discount || 0;
    const discountedPrice = itemPrice - itemDiscount;

    // Check if item already exists in table
    const existingItemIndex = tableData.findIndex(
      (item) => item.item === selectedItem.id
    );

    if (existingItemIndex !== -1) {
      // Item exists, increase quantity by 1
      const updatedTableData = [...tableData];
      const currentQuantity = parseFloat(updatedTableData[existingItemIndex].quantity) || 0;
      const newQuantity = currentQuantity + 1;
      
      updatedTableData[existingItemIndex] = {
        ...updatedTableData[existingItemIndex],
        quantity: newQuantity,
        total: (updatedTableData[existingItemIndex].rate_after_discount * newQuantity).toFixed(2)
      };
      
      setTableData(updatedTableData);
    } else {
      // Item doesn't exist, add new item with quantity 1
      const newItem = {
        item: selectedItem.id,
        item_name: selectedItem.items,
        price: itemPrice,
        final_price: finalPrice,
        discount: itemDiscount,
        quantity: 1,
        rate_after_discount: discountedPrice,
        total: discountedPrice.toFixed(2),
        return_unit: 0,
        total_return_amount: 0,
        stock_type: selectedItem.stock_type || "",
        stock_id: "",
        hidden_id: "",
        reserve_price: itemPrice,
        reserve_discount: itemDiscount,
        reserve_quantity: 1,
        rate_after_discount_reserve: discountedPrice,
        total_reserve: discountedPrice.toFixed(2),
        reserve_return_unit: 0,
        reserve_total_return_amount: 0,
        reserve_stock_id: 0,
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
        book_id: formData.book_id,
      };

      setTableData([newItem, ...tableData]);
    }
  };





  // Add this function to handle barcode scanning/input
const handleBarcodeInput = (barcodeValue) => {
  if (!barcodeValue.trim()) return;
  
  // Find item by barcode (assuming items have a barcode field)
  const foundItem = items.find(item => 
    item.barcode === barcodeValue || 
    item.barcode_no === barcodeValue ||
    item.id.toString() === barcodeValue
  );
  
  if (foundItem) {
    handleItemCardClick(foundItem);
    setBarcodeInput(""); // Clear barcode input after successful scan
    
    // Focus back to barcode input for next scan
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
  } else {
    toast.error(`Item with barcode ${barcodeValue} not found!`);
    setBarcodeInput("");
  }
};




// Add this to handle barcode input changes and Enter key
const handleBarcodeChange = (e) => {
  setBarcodeInput(e.target.value);
};

const handleBarcodeKeyPress = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleBarcodeInput(barcodeInput);
  }
};



// Also update the useEffect for focus to include barcode input
useEffect(() => {
  // Focus on barcode input after phone number is filled
  if (formData.phone_no && formData.phone_no.length >= 11) {
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 100);
  } else {
    phoneRef.current?.focus();
  }
}, []);

  // Get unique categories from items
  const categories = ["All", ...new Set(items.map(item => item.category || "Other"))];

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.items.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (item.category || "Other") === selectedCategory;
    return matchesSearch && matchesCategory;
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
          };
        });

        setTableData(transformedData);
        setFormDisabled(false);
        setShow(false);
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

      // Reset advance to 0 when invoice_status is unpaid
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

  // Calculate totals
  const totals = tableData.reduce(
    (acc, item) => {
      acc.totalQuantity += parseFloat(item.quantity) || 0;
      acc.totalAmount += parseFloat(item.total) || 0;
      return acc;
    },
    { totalQuantity: 0, totalAmount: 0 }
  );

  const calculateDiscount = (get_discount) => {
    // Your existing discount calculation logic
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

  // const remaining =
  //   formData.advance > 0
  //     ? (parseFloat(formData.grand_total) || 0) -
  //       (parseFloat(formData.advance) || 0)
  //     : 0;

  const remaining =
  formData.invoice_status === "unpaid"
    ? parseFloat(formData.grand_total) || 0 // Set remaining to grand_total if unpaid
    : formData.advance > 0
    ? (parseFloat(formData.grand_total) || 0) - (parseFloat(formData.advance) || 0)
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
        alert_date:formData.alert_date
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
    formData.alert_date
  ]);

  const tableDataRef = useRef(tableData);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  const handleSaveAllData = useCallback(async () => {
    // console.log(formData.invoice_no);

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
            invoice_status:formData.invoice_status,
            alert_date:formData.alert_date,
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
        invoice_status:"",
        alert_date:""
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
    formData.alert_date
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s" && checkComponent == "pharmacy") {
        event.preventDefault();
        handleSaveAllData();
        if (tableDataRef.current?.length > 0) {
          setFormDisabled(true);
        }
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
    const newData = [...tableData];
    const newRate = parseFloat(e.target.value);
    newData[index].price = newRate;

    newData[index].rate_after_discount = (
      newRate -
      newRate * (newData[index].discount / 100)
    ).toFixed(2);
    newData[index].total = (
      newData[index].rate_after_discount * newData[index].quantity
    ).toFixed(2);

    setTableData(newData);
  };

  const handleQuantityChange = (e, index) => {
    const newData = [...tableData];
    const newQuantity = parseFloat(e.target.value);
    newData[index].quantity = newQuantity;

    newData[index].total = (
      (newData[index].rate_after_discount * newQuantity) -  newData[index].discount
    ).toFixed(2);

    setTableData(newData);
  };

  const handleDiscountChange = (e, index) => {
    const newData = [...tableData];
    const newDiscount = parseFloat(e.target.value);
    newData[index].discount = newDiscount;

    // newData[index].rate_after_discount = (
    //   newData[index].price - newDiscount
    // ).toFixed(2);
    newData[index].total = (
      (newData[index].rate_after_discount * newData[index].quantity) - newDiscount
    ).toFixed(2);

    setTableData(newData);
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

  return (
    <div>
      <div className="d-flex justify-content-center flex-wrap mt-2">
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
          onClick={() => setShow("expired_stock_report")}
        >
          <i class="fas fa-exclamation-triangle" title="Expired Stock"></i>{" "}
          Expired Stock
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
        <a href="#" className="btn btn-sm btn-warning mb-2 mr-2">
          <Link to="/stock">
            <i className="fas fa-truck"></i> Create Stock
          </Link>
        </a>
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
      </div>

      <div className="d-flex">
        {showBakupLoading && (
          <div className="loading-container">
            <div className="loading-text">
              Backup is Being Created... Please wait
            </div>
          </div>
        )}

        <div>
          {isVisible && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h5>Invoice</h5>
                <a href="#" onClick={() => setIsVisible(false)}>
                  <i className="fa fa-window-close"></i>
                </a>
              </div>

              <table className="tableStyle">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Discount</th>
                    <th>After_Discount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((item) => (
                    <tr key={item.id}>
                      <td> {item.item_name} </td>
                      <td> {item.price} </td>
                      <td> {item.quantity} </td>
                      <td> {item.discount} </td>
                      <td style={{ color: "green" }}>
                        {item.price - (item.price / 100) * item.discount}
                      </td>
                      <td> {item.total} </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="5" className="text-right">
                      <b>Grand Total (Rs.):</b>
                    </td>
                    <td className="text-left">
                      {invoiceData.reduce(
                        (acc, item) => acc + parseFloat(item.total),
                        0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className={`d-flex ${showEdit ? "blur-background" : ""}`}>
            {showEdit == "medicine" && (
              <div
                style={{
                  position: "absolute",
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
                  overflowX: "hidden",
                }}
              >
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

            {showEdit == "invoice" && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1000,
                  backgroundColor: "#fff",
                  padding: "10px",
                  border: "1px solid #ccc",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  width: "95%",
                  height: "90vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary mr-2 mb-2"
                    onClick={() => setShow(false)}
                  >
                    x
                  </button>
                </div>
                <InvoiceListPharmacy
                  ViewInvoice={ViewInvoice}
                  editInvoice={editInvoice}
                  onClose={() => setShow(false)}
                />
              </div>
            )}

            {showEdit == "Stock" && (
              <div
                style={{
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
                  overflowX: "hidden",
                }}
              >
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
          </div>

          {showEdit == "suppliers" && (
            <SuppliersList
              onClose={() => setShow(false)}
              showEdit={showEdit}
              setShow={setShow}
            />
          )}
        </div>

        {/* Customer Information Section */}
        <div className="col-md-3 p-2">
          <div className="border p-2">
            <h5 className="text-warning bg-primary p-2 card-header">
              <i className="fas fa-shopping-cart"></i> Invoice Form
            </h5>
            <div className="p-3">
              <div
                className="bg-light border rounded"
                style={{
                  padding: "10px",
                }}
              >
                <div className="flex pt-2 mb-2 pb-0 pl-3 bg-warning">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="sale"
                      checked={selectedInvoiceType === "sale"}
                      onChange={handleInvoiceChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="text-lg"> Sale</span>
                  </label>
                  <label className="flex items-center gap-2 ml-3">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="quotation"
                      checked={selectedInvoiceType === "quotation"}
                      onChange={handleInvoiceChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="text-lg"> Quotation</span>
                  </label>

                  <label className="flex items-center gap-2 ml-3">
                    <input
                      type="radio"
                      name="invoiceType"
                      value="hold"
                      checked={selectedInvoiceType === "hold"}
                      onChange={handleInvoiceChange}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="text-lg"> Hold</span>
                  </label>
                </div>

                <div className="form-group row mt-3">
                  <label
                    htmlFor="invoice_date"
                    className="col-sm-2 col-form-label"
                  >
                    Date
                  </label>
                  <div className="col-sm-10 w-100 d-block">
                    <DatePicker
                      selected={formData.invoice_date}
                      onChange={handleDateChangeForm}
                      dateFormat="dd-MM-yyyy"
                      className="form-control d-block w-100"
                      placeholderText="Select Date"
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group row mt-3">
                  <label htmlFor="army_no" className="col-sm-2 col-form-label">
                    Ph#
                  </label>
                  <div className="col-sm-10">
                    <input
                      ref={phoneRef}
                      type="text"
                      id="phone_no"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={(e) => {
                        let input = e.target.value.replace(/\D/g, "");

                        if (!input.startsWith("92") && input.length > 0) {
                          input = "92" + input;
                        }

                        if (input.length > 12) {
                          input = input.slice(0, 12);
                        }

                        handleInputChange({
                          target: {
                            name: "phone_no",
                            value: input,
                          },
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFetch(invoiceNo, patientId, formData.phone_no);
                          setTimeout(() => {
                            fullNameRef.current?.focus();
                          }, 100);
                        }
                      }}
                      maxLength="12"
                      placeholder="923001234567"
                      className="form-control"
                    />
                  </div>

                  <div className="col-sm-2 d-none">
                    <button
                      type="button"
                      className={`btn btn-sm btn-${
                        contactMethod === "whatsapp" ? "success" : "primary"
                      }`}
                      onClick={toggleContactMethod}
                    >
                      {contactMethod === "whatsapp" ? "WA" : "Ph"}
                    </button>
                  </div>
                </div>

                <div className="form-group row mt-3">
                  <label
                    htmlFor="full_name"
                    className="col-sm-2 col-form-label"
                  >
                    Name
                  </label>
                  <div className="col-sm-10">
                    <input
                      ref={fullNameRef}
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group row mt-3">
                  <label htmlFor="book_id" className="col-sm-2 col-form-label">
                    ID
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      id="book_id"
                      name="book_id"
                      value={formData.book_id || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Book ID"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="form-group row mt-3">
                  <label
                    htmlFor="invoice_status"
                    className="col-sm-2 col-form-label"
                  >
                    Status
                  </label>
                  <div className="col-sm-10">
                    <select
                      id="invoice_status"
                      name="invoice_status"
                      value={formData.invoice_status}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                {(remaining > 0 || formData.invoice_status === "unpaid") && (
                  <div className="form-group row mt-3">
                    <label
                      htmlFor="alert_date"
                      className="col-sm-2 col-form-label"
                    >
                      Alert
                    </label>
                    <div className="col-sm-10">
                      <input
                        type="date"
                        id="alert_date"
                        name="alert_date"
                        value={formData.alert_date || ""}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Totals and Save Section */}
              <div className="mt-3 p-3 bg-light border rounded">
                <div className="row">
                  <div className="col-12 mb-2">
                    <label className="d-block">
                      <i className="fas fa-calculator"></i> Total Amount
                    </label>
                    <input
                      type="text"
                      className="form-control text-center bg-primary text-white font-weight-bold"
                      value={totals.totalAmount.toFixed(2)}
                      disabled
                      style={{ fontSize: "18px" }}
                    />
                  </div>

                  <div className="col-6 mb-2">
                    <label className="d-block">
                      <i className="fas fa-money-bill-wave"></i> Advance
                    </label>
                    <input
                      readOnly={
                        formData.invoice_status == "unpaid" ? true : false
                      }
                      type="number"
                      id="advance"
                      name="advance"
                      value={formData.advance}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          advance: e.target.value,
                        }));
                      }}
                      placeholder="Advance"
                      className="form-control"
                      disabled={formDisabled}
                    />
                  </div>

                  <div className="col-6 mb-2">
                    <label className="d-block">
                      <i className="fas fa-wallet"></i> Remaining
                    </label>
                    <input
                      type="text"
                      value={remaining}
                      readOnly
                      className="form-control"
                      disabled={formDisabled}
                    />
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-warning btn-block"
                      style={{ fontSize: "18px", padding: "5px" }}
                      onClick={handleSaveAllData}
                    >
                      <i className="fas fa-print"></i> Save Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POS Items Section */}
        <div className="col-md-4 p-2">
          <div className="border p-2">
            <h5 className="text-warning bg-primary p-2 card-header">
              <i className="fas fa-plus-square"></i> Items (POS)
            </h5>
            <div className="p-3">
              {/* Search and Category Filter */}
              <div className="mb-3">
                <div className="input-group mb-2">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                  </div>
                  <input
                    ref={searchRef}
                    type="text"
                    className="form-control"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="form-control d-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Grid */}
              <div
                style={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div className="row">
                  {filteredItems.map((item) => {
                    const existingItem = tableData.find(
                      (tableItem) => tableItem.item === item.id
                    );
                    const currentQuantity = existingItem
                      ? parseFloat(existingItem.quantity) || 0
                      : 0;

                    return (
                      <div key={item.id} className="col-12 mb-2">
                        <div
                          className={`card h-100 shadow-sm cursor-pointer ${
                            currentQuantity > 0 ? "border-primary" : ""
                          }`}
                          style={{
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backgroundColor: formDisabled
                              ? "#f8f9fa"
                              : "#ffffff",
                          }}
                          onClick={() =>
                            !formDisabled && handleItemCardClick(item)
                          }
                          onMouseEnter={(e) => {
                            if (!formDisabled) {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 8px rgba(0,0,0,0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!formDisabled) {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(0,0,0,0.1)";
                            }
                          }}
                        >
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6
                                  className="card-title mb-1 text-warning"
                                  style={{
                                    fontSize: "16px",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {item.items}
                                </h6>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <small
                                      className="text-primary font-weight-bold"
                                      style={{ fontSize: "15px" }}
                                    >
                                      Rs.{" "}
                                      {parseFloat(item.price || 0).toFixed(2)}
                                    </small>
                                    {item.discount > 0 && (
                                      <small className="text-muted d-block">
                                        Disc: {item.discount}
                                      </small>
                                    )}
                                  </div>
                                  {currentQuantity > 0 && (
                                    <span
                                      className="badge badge-warning text-black p-2"
                                      style={{
                                        color: "black",
                                        fontSize: "10px",
                                      }}
                                    >
                                      Qty: {currentQuantity}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-center ml-2">
                                <i
                                  className={`fas fa-plus-circle text-${
                                    formDisabled ? "muted" : "warning"
                                  }`}
                                  style={{ fontSize: "20px" }}
                                ></i>
                              </div>
                            </div>
                            {/* {item.stock_type && (
                            <small className="badge badge-secondary mt-1" style={{ fontSize: "9px" }}>
                              {item.stock_type}
                            </small>
                          )} */}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center text-muted mt-3">
                  <i className="fas fa-search fa-2x mb-2"></i>
                  <p>No items found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Table Section */}
        <div className="col-md-5 p-2">
          <div className="table-responsive p-2 border">
            <div>
              <h5 className="text-warning bg-primary p-2 card-header">
                <div className="row">
                  <div className="col">
                    <i className="fas fa-receipt"></i> Invoice Items (
                    {tableData.length})
                  </div>
                </div>
              </h5>
            </div>

            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <table className="table table-striped">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: "200px" }}>Item</th>
                    <th style={{ width: "150px" }}>Rate</th>
                    <th>Qty</th>
                    <th>Disc</th>
                    <th className="text-center">Total</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((data, index) => (
                    <tr key={index}>
                      <td style={{ display: "none" }}>{data.item}</td>
                      <td style={{ display: "none" }}>{data.hidden_id}</td>
                      <td className="" style={{ maxWidth: "100px" }}>
                        <div
                          style={{ wordBreak: "break-word", lineHeight: "1.2" }}
                        >
                          {data.item_name}
                        </div>
                      </td>

                      <td className="text-center">
                        <input
                          readOnly={true}
                          type="number"
                          className="form-control form-control-sm"
                          value={data.price}
                          onChange={(e) => handleRateChange(e, index)}
                          // style={{padding: "2px" }}
                        />
                      </td>

                      <td className="text-center">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={data.quantity}
                          onChange={(e) => handleQuantityChange(e, index)}
                          style={{ width: "80px" }}
                        />
                      </td>

                      <td className="text-center">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={data.discount}
                          onChange={(e) => handleDiscountChange(e, index)}
                          style={{ width: "80px" }}
                        />
                      </td>

                      <td
                        className="text-center text-primary"
                        style={{ fontWeight: "bold" }}
                      >
                        {parseFloat(data.total || 0).toFixed(2)}
                      </td>

                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className="btn btn-warning btn-sm d-none"
                            onClick={() => handleEdit(index)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleDelete(index)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tableData.length === 0 && (
                <div className="text-center text-muted mt-3 mb-3">
                  <i className="fas fa-shopping-cart fa-2x mb-2"></i>
                  <p>No items added yet</p>
                  <small>Click on items to add them to invoice</small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {isModalOpen && (
            <InvoiceModalPharmacy
              invoiceData={invoiceData}
              onClose={handleCloseModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
