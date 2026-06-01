import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import Home from "../Home";
import Supplier from "./Supplier";
import { format } from "date-fns";
import { useItemPharmacy } from "./ItemContextPharmacy";
import StockItemWiseDetailReport from "./StockItemWiseDetailReport";
import Modal from "./Modal";
import StockBarcodeGenerator from "./StockBarcodeGenerator";
import ModalForChild from "./ModalForChild";

const Stock = ({ onClose }) => {
  const notify = () => toast.success("Stock Saved Successfully!");

  const [formData, setFormData] = useState({
    supplier_id: "", full_name: "", item: "", price: "",
    purchase_rate_calculate_per_tablet: "", purchase_price: "",
    quantity: "", discount: 0, price_after_discount: "",
    after_discount_total: "", total: "", item_name: "", hidden_id: "",
    invoice_no: "", remarks: "", rack_no: "", date_of_expiry: "",
    priceOption: "current", discountOption: "current",
    packet_quantity: "", per_packet_quantity: "", selling_price: "",
    final_price: 0, stock_date: "", total_purchase_rate: "",
    payment_status: "paid", advance_amount: "",
    invoice_payment_status: "paid", supplier_id_for_report: "",
    from_date: "", to_date: "",
  });

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [isVisibleBarcode, setVisibleBarcode] = useState(false);
  const [barcodeInvoiceNo, setBarcodeInvoiceNo] = useState("");
  const [getAllSupplier, setAllSupplier] = useState([]);
  const [totalItem, setTotalItemGet] = useState(10);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [stockList, setStockList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [invoiceData, showInvoiceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, totalPagesGet] = useState("");
  const [stockTable, updateInvoiceTable] = useState([]);
  const [showEdit, setShowEdit] = useState("");
  const [checkComponent] = useState("stock");
  const [lastPurchaseList, setLastPurchaseList] = useState([]);
  const [showLastPurchase, setShowLastPurchase] = useState(false);
  const [lastPurchaseLoading, setLastPurchaseLoading] = useState(false);

  const { items, fetchAllItemsPharmacy } = useItemPharmacy();

  const [report, getAllReports] = useState({ from_date: "", to_date: "", report_type: "" });

  const handleTotalItemChange = (event) => {
    const newValue = event.target.value;
    if (event.target.id === "search-invoice") {
      if (event.key === "Enter") setSearchInvoice(newValue);
    } else {
      setTotalItemGet(newValue);
    }
  };

  function resetFields() {
    setFormData({ ...formData, supplier_id_for_report: "", from_date: "", to_date: "", remaining: "" });
  }

  const editInvoice = (invoice_no_get) => {
    axios.get(`${process.env.REACT_APP_API_URL}/get-invoice-no-stock/${invoice_no_get}`)
      .then((response) => {
        const inv = response.data.results;
        setFormData({
          ...formData,
          stock_date: inv[0].stock_date,
          advance_amount: inv[0].advance_payment,
          supplier_id: inv[0].supplier_id,
          full_name: inv[0].full_name,
        });
        const transformedData = inv.map((item) => ({
          item: item.item_id, hidden_id: item.id,
          item_name: item.item_name + " (" + item.stock_type + ")",
          price: parseFloat(item.price).toFixed(2),
          purchase_price: parseFloat(item.purchase_price).toFixed(2),
          quantity: item.quantity, packet_quantity: item.packet_quantity,
          per_packet_quantity: item.per_packet_quantity,
          selling_price: item.selling_price, discount: item.discount,
          price_after_discount: item.price_after_discount,
          after_discount_total: item.after_discount_total,
          total: item.total, payment_status: item.payment_status,
          date_of_expiry: item.date_of_expiry, final_price: item.final_price,
          stock_date: item.stock_date,
          rack_no: item.rack_no.split(","),
          priceOption: item.price_option, discountOption: item.discount_option,
          remarks: item.remarks, invoice_no: item.invoice_no,
          total_purchase_rate: item.total_purchase_rate,
          purchase_rate_calculate_per_tablet: item.purchase_rate_calculate_per_tablet,
        }));
        setTableData(transformedData);
      })
      .catch((error) => console.error("Error:", error));
  };

  const handlePageChange = ({ selected }) => setCurrentPage(selected + 1);

  const deleteInvoice = (invoice_no) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    axios.delete(`${process.env.REACT_APP_API_URL}/delete-stock/${invoice_no}`)
      .then(() => { toast.error("Stock Deleted!"); fetchData(); })
      .catch((error) => console.error("Error deleting:", error));
  };

  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL + "/get-stock-list", {
      params: {
        page: currentPage, limit: totalItem, getSearch: searchInvoice,
        supplier_id: formData.supplier_id_for_report, remaining: formData.remaining,
        from_date: formData.from_date, to_date: formData.to_date,
      },
    })
      .then((res) => { setStockList(res.data.results); totalPagesGet(res.data.totalPages); setLoading(false); })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem, searchInvoice, stockTable, formData.remaining, formData.supplier_id_for_report, formData.from_date, formData.to_date]);

  const ViewInvoice = (invoice_no) => {
    axios.get(`${process.env.REACT_APP_API_URL}/view-invoice-stock/${invoice_no}`)
      .then((response) => { setIsVisible(true); showInvoiceData(response.data.results); })
      .catch((error) => console.error("Error:", error));
  };

  const recalcPricing = (data) => {
    const updatedFormData = { ...data };
    const packet_quantity = parseFloat(updatedFormData.packet_quantity);
    const discount = parseFloat(updatedFormData.discount);
    const selling_price = parseFloat(updatedFormData.selling_price);
    const per_packet_quantity = parseFloat(updatedFormData.per_packet_quantity);
    let total = 0, discount_total = 0;
    if (discount !== "") {
      const discount_get = (selling_price / 100) * discount;
      const final_amount = selling_price - discount_get;
      discount_total = final_amount * packet_quantity;
      total = selling_price * per_packet_quantity * packet_quantity;
    } else {
      discount_total = selling_price * packet_quantity;
      total = selling_price * packet_quantity;
    }
    const total_quantity = per_packet_quantity * packet_quantity;
    updatedFormData.quantity = total_quantity;
    updatedFormData.total_purchase_rate = parseFloat(updatedFormData.purchase_price * per_packet_quantity * packet_quantity).toFixed(2);
    updatedFormData.purchase_rate_calculate_per_tablet = Number(updatedFormData.purchase_price).toFixed(2);
    updatedFormData.price_after_discount = parseFloat((discount_total / total_quantity).toFixed(2));
    updatedFormData.price = selling_price;
    updatedFormData.total = total.toFixed(2);
    updatedFormData.after_discount_total = parseFloat((total_quantity * updatedFormData.price_after_discount).toFixed(2));
    return updatedFormData;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "item") return;
    let updatedFormData = { ...formData, [name]: value };
    if (["per_packet_quantity", "packet_quantity", "selling_price", "discount", "purchase_price"].includes(name)) {
      updatedFormData = recalcPricing(updatedFormData);
    }
    setFormData(updatedFormData);
  };

  const handleSubmit = (event) => {
    event && event.preventDefault && event.preventDefault();
    const fieldLabels = {
      item: "Item Name", quantity: "Quantity",
      purchase_rate_calculate_per_tablet: "Purchase Rate",
      purchase_price: "Purchase Price", stock_date: "Stock Date",
      supplier_id: "Supplier", payment_status: "Payment Status",
      // date_of_expiry: "Date of Expiry",
    };
    const missingFields = Object.entries(fieldLabels)
      .filter(([f]) => !formData[f] || formData[f] === "")
      .map(([, l]) => l);
    if (missingFields.length > 0) {
      toast.error(
        <div>
          <div style={{ marginBottom: 5, fontWeight: "bold" }}>Missing Fields:</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {missingFields.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      return false;
    }
    if (editIndex !== null) {
      const updatedTableData = [...tableData];
      updatedTableData[editIndex] = formData;
      setTableData(updatedTableData);
      setEditIndex(null);
    } else {
      setTableData([...tableData, formData]);
    }
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      ...formData, item: "", price: "", quantity: "", discount: 0,
      price_after_discount: "", after_discount_total: "", total: "",
      item_name: "", date_of_expiry: "", purchase_price: "", hidden_id: "",
      invoice_no: "", remarks: "", packet_quantity: "", per_packet_quantity: "",
      selling_price: "", final_price: 0, rack_no: "", total_purchase_rate: "",
      purchase_rate_calculate_per_tablet: "", payment_status: "paid", advance_amount: "",
    });
  };

  const handleEdit = (index) => {
    setFormData({ ...formData, ...tableData[index] });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  // const calculateGrandTotal = () => invoiceData.reduce((acc, item) => acc + parseFloat(item.total), 0);

  const calculateGrandTotal = () => invoiceData.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.purchase_rate_calculate_per_tablet)), 0);

  const handleDeleteStock = (id, data, index) => {
    if (!window.confirm("Are you sure you want to delete this stock item?")) return;
    axios.get(`${process.env.REACT_APP_API_URL}/delete-stock-item/${id}`)
      .then(() => {
        const updatedData = data.filter((item) => item.id !== id);
        if (data === invoiceData) {
          showInvoiceData(updatedData);
          if (updatedData.length === 0) { setIsVisible(false); fetchData(); }
        }
        if (index !== undefined) {
          const updatedTableData = [...tableData];
          updatedTableData.splice(index, 1);
          setTableData(updatedTableData);
        }
        toast.success("Item deleted successfully!");
      })
      .catch((error) => { console.error("Error:", error); toast.error("Failed to delete item"); });
  };

  const tableDataRef = useRef(tableData);
  useEffect(() => { tableDataRef.current = tableData; }, [tableData]);

  const handleSaveAllData = useCallback(async () => {
    const totalAmount = tableDataRef.current.reduce((acc, item) => acc + parseFloat(item.total_purchase_rate || 0), 0);
    const advance = parseFloat(formData.advance_amount || 0);
    const remaining = advance > 0 ? parseFloat((totalAmount - advance).toFixed(2)) : 0;
    if (advance > totalAmount) { toast.error("Advance cannot be greater than total"); return false; }
    if (tableDataRef.current.length <= 0) { toast.error("Please add at least one item"); return false; }
    const payload = {
      invoice_list: tableDataRef.current, advance_amount: advance,
      remaining_amount: remaining, stock_date: formData.stock_date,
      supplier_id: formData.supplier_id,
    };
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/insert-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to insert data");
      resetFormData();
      setTableData([]);
      notify();
      fetchData();
      fetchAllItemsPharmacy();
    } catch (error) {
      console.error("Error:", error);
    }
  }, [formData.advance_amount, formData.stock_date, formData.supplier_id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s" && checkComponent === "stock") {
        event.preventDefault();
        handleSaveAllData();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checkComponent, handleSaveAllData]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_URL + "/get-all-supplier")
      .then((res) => setAllSupplier(res.data.results))
      .catch((err) => console.log(err));
  }, []);

  function printBarcode(invoice_no) {
    setVisibleBarcode(true);
    setBarcodeInvoiceNo(invoice_no);
  }

  const fetchLastPurchaseByItem = (item_id) => {
    if (!item_id) return;
    setLastPurchaseLoading(true);
    setShowLastPurchase(true);
    setLastPurchaseList([]);
    axios
      .get(`${process.env.REACT_APP_API_URL}/get-last-purchase-by-item/${item_id}`)
      .then((res) => {
        setLastPurchaseList(res.data.results || []);
      })
      .catch((err) => {
        console.error("Error fetching last purchase prices:", err);
        toast.error("Could not load last purchase prices");
      })
      .finally(() => setLastPurchaseLoading(false));
  };

  const grandPurchaseTotal = tableData.reduce((a, i) => a + parseFloat(i.total_purchase_rate || 0), 0);
  const advanceAmt = parseFloat(formData.advance_amount || 0);
  const remainingAmt = advanceAmt > 0 ? Math.max(0, grandPurchaseTotal - advanceAmt) : 0;

  const selectStyles = {
    control: (b) => ({ ...b, border: "1.5px solid #ddd6fe", borderRadius: 7, fontSize: 13, minHeight: 36, boxShadow: "none", "&:hover": { borderColor: "#7c3aed" } }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
    option: (b, s) => ({ ...b, background: s.isSelected ? "#7c3aed" : s.isFocused ? "#f5f3ff" : "#fff", color: s.isSelected ? "#fff" : "#1e293b", fontSize: 13 }),
  };

  return (
    <>
      {/* ── Last Purchase Prices (per supplier) — top of window ── */}
      {showLastPurchase && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 4000,
            width: "min(96%, 1100px)",
            background: "#fff",
            border: "1.5px solid #ddd6fe",
            borderRadius: 12,
            boxShadow: "0 12px 30px rgba(76,29,149,.25)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#4c1d95,#7c3aed)",
              color: "#fff",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i className="fas fa-history" style={{ color: "#fde68a" }}></i>
            <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>
              Last Purchase Prices — {formData.item_name || "Selected Item"}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowLastPurchase(false)}
                style={{
                  background: "rgba(255,255,255,.18)",
                  border: "1px solid rgba(255,255,255,.25)",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div style={{ maxHeight: "45vh", overflowY: "auto" }}>
            {lastPurchaseLoading ? (
              <div style={{ padding: 18, textAlign: "center", color: "#7c3aed", fontWeight: 700 }}>
                Loading...
              </div>
            ) : lastPurchaseList.length === 0 ? (
              <div style={{ padding: 18, textAlign: "center", color: "#9ca3af" }}>
                No previous purchases found for this item.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f5f3ff", color: "#5b21b6" }}>
                    {["Supplier", "Last Stock Date", "Invoice #", "Purchase/Unit", "Total Purchase", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: ".4px",
                          borderBottom: "2px solid #ddd6fe",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lastPurchaseList.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f3e8ff" }}>
                      <td style={{ padding: "7px 10px", fontWeight: 700, color: "#1e293b" }}>{row.full_name}</td>
                      <td style={{ padding: "7px 10px", color: "#6b7280" }}>
                        {row.stock_date ? format(new Date(row.stock_date), "dd-MM-yyyy") : "-"}
                      </td>
                      <td style={{ padding: "7px 10px", color: "#7c3aed", fontWeight: 700 }}>{row.invoice_no}</td>
                      {/* <td style={{ padding: "7px 10px", fontWeight: 700, color: "#dc2626" }}>
                        {parseFloat(row.purchase_price || 0).toFixed(2)}
                      </td> */}
                      <td style={{ padding: "7px 10px" }}>
                        {parseFloat(row.purchase_rate_calculate_per_tablet || 0).toFixed(2)}
                      </td>
                      {/* <td style={{ padding: "7px 10px", color: "#059669", fontWeight: 700 }}>
                        {parseFloat(row.selling_price || 0).toFixed(2)}
                      </td> */}
                      {/* <td style={{ padding: "7px 10px", textAlign: "center" }}>{row.quantity}</td> */}
                      <td style={{ padding: "7px 10px", fontWeight: 700, color: "#7c3aed" }}>
                        Rs. {parseFloat(row.total_purchase_rate || 0).toFixed(2)}
                      </td>
                      {/* <td style={{ padding: "7px 10px", color: "#6b7280" }}>
                        {row.date_of_expiry ? format(new Date(row.date_of_expiry), "dd-MM-yyyy") : "-"}
                      </td> */}
                      <td style={{ padding: "7px 10px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const next = {
                              ...formData,
                              supplier_id: row.supplier_id,
                              full_name: row.full_name,
                              purchase_price: parseFloat(row.purchase_price || 0).toFixed(2),
                              selling_price: parseFloat(row.selling_price || 0).toFixed(2),
                              packet_quantity: formData.packet_quantity || row.packet_quantity || "",
                              per_packet_quantity: formData.per_packet_quantity || row.per_packet_quantity || "",
                            };
                            setFormData(recalcPricing(next));
                          }}
                          style={{
                            background: "#ede9fe",
                            color: "#7c3aed",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontWeight: 700,
                            fontSize: 11,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          title="Use this supplier and prices"
                        >
                          <i className="fas fa-check" style={{ marginRight: 4 }}></i>Use
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Item edit overlay ── */}
      {showEdit === "item" && (
        // <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:3000,backgroundColor:"#fff",padding:10,border:"1px solid #ccc",boxShadow:"0 4px 24px rgba(0,0,0,.2)",width:"90%",maxWidth:1600,maxHeight:"90vh",overflowY:"auto" }}>
        //   <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:8 }}>
        //     <button onClick={() => setShowEdit("")} style={{ background:"#7c3aed",color:"#fff",border:"none",borderRadius:6,padding:"5px 14px",cursor:"pointer",fontWeight:700 }}>✕ Close</button>
        //   </div>
        //   <Home onClose={() => setShowEdit("")} />
        // </div>

         <Modal isOpen={true} onClose={() => setShowEdit("")} title="Add Supplier" maxWidth="1400px">
          <Home onClose={() => setShowEdit("")} />
        </Modal>

      )}

      {showEdit === "supplier" && (
        <Modal isOpen={true} onClose={() => setShowEdit("")} title="Add Supplier" maxWidth="1400px">
          <Supplier onClose={() => setShowEdit("")} />
        </Modal>
      )}

      {showEdit === "add_stock_item_wise_detail_report" && (
        <Modal isOpen={true} onClose={() => setShowEdit("")} title="Stock Item Wise Detail Report" maxWidth="1400px">
          <StockItemWiseDetailReport
            onClose={() => setShowEdit("")}
            items={items}
            getAllSupplier={getAllSupplier}
            ViewInvoice={ViewInvoice}
            editInvoice={(inv_no) => { editInvoice(inv_no); setShowEdit(""); }}
          />
        </Modal>
      )}

      {/* ── MAIN UI ── */}
      <div style={{ fontFamily:"'Segoe UI',Tahoma,Geneva,Verdana,sans-serif", background:"#faf5ff", display:"flex", flexDirection:"column", height:"100%" }}>
        <style>{`
          .sk-wrap { display:flex; flex:1; overflow:hidden; min-height:0; }
          .sk-left { flex:1; overflow-y:auto; padding:14px 16px; background:#fff; border-right:2px solid #e2e8f0; }
          .sk-right { width:460px; flex-shrink:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
          .sk-sec { font-size:10px;font-weight:800;color:#8b5cf6;text-transform:uppercase;letter-spacing:.6px;margin:12px 0 7px;display:flex;align-items:center;gap:6px; }
          .sk-sec::after { content:'';flex:1;height:1px;background:#ede9fe; }
          .sk-row { display:flex;gap:10px; }
          .sk-field { margin-bottom:9px;flex:1; }
          .sk-field label { display:block;font-size:10px;font-weight:700;color:#7c3aed;margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px; }
          .sk-input { width:100%;padding:7px 10px;border:1.5px solid #ddd6fe;border-radius:7px;font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s;background:#fff;color:#1e293b; }
          .sk-input:focus { border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1); }
          .sk-calc-label { font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;text-align:center; }
          .sk-calc-badge { background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:7px;padding:7px 10px;font-size:13px;font-weight:800;color:#7c3aed;text-align:center;min-height:36px;display:flex;align-items:center;justify-content:center; }
          .sk-add-btn { width:100%;padding:11px;background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;box-shadow:0 3px 10px rgba(124,58,237,.35);transition:all .15s; }
          .sk-add-btn:hover { background:linear-gradient(135deg,#3b0764,#6d28d9);box-shadow:0 5px 15px rgba(124,58,237,.45); }
          .sk-summary { padding:12px 14px;border-bottom:2px solid #e2e8f0;flex-shrink:0; }
          .sk-save-btn { width:100%;padding:11px;background:linear-gradient(135deg,#047857,#10b981);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 3px 10px rgba(16,185,129,.3);transition:all .15s;margin-top:10px; }
          .sk-save-btn:hover:not(:disabled) { background:linear-gradient(135deg,#065f46,#059669); }
          .sk-save-btn:disabled { background:#d1d5db;cursor:not-allowed;box-shadow:none; }
          .sk-items-wrap { flex:1;overflow-y:auto; }
          .sk-tbl { width:100%;border-collapse:collapse;font-size:12px; }
          .sk-tbl thead tr { background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff;position:sticky;top:0;z-index:5; }
          .sk-tbl th { padding:9px 8px;font-size:10px;font-weight:700;white-space:nowrap;letter-spacing:.4px;text-transform:uppercase;text-align:left; }
          .sk-tbl td { padding:7px 8px;border-bottom:1px solid #f3e8ff;vertical-align:middle; }
          .sk-tbl tr:hover td { background:#faf5ff; }
          .sk-tbl tfoot tr { background:#f5f3ff;border-top:2px solid #7c3aed; }
          .sk-del { background:none;border:none;color:#ef4444;cursor:pointer;padding:3px 6px;border-radius:5px;transition:background .15s; }
          .sk-del:hover { background:#fee2e2; }
          .sk-edt { background:none;border:none;color:#7c3aed;cursor:pointer;padding:3px 6px;border-radius:5px;transition:background .15s; }
          .sk-edt:hover { background:#f5f3ff; }
          .sk-topbtn { display:inline-flex;align-items:center;gap:5px;padding:5px 11px;background:rgba(255,255,255,.13);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap; }
          .sk-topbtn:hover { background:rgba(255,255,255,.26); }
          .sk-topbtn.acc { background:#f59e0b;color:#1a1a1a;border-color:#d97706; }
          .sk-topbtn.acc:hover { background:#d97706;color:#fff; }
          .sk-adv-input { width:100%;padding:8px;border:2px solid #ddd6fe;border-radius:7px;font-size:15px;font-weight:800;text-align:center;color:#7c3aed;outline:none;transition:border-color .2s; }
          .sk-adv-input:focus { border-color:#7c3aed; }
          .sk-rem-box { width:100%;padding:8px;border:2px solid #fca5a5;border-radius:7px;font-size:15px;font-weight:800;text-align:center;color:#dc2626;background:#fff1f2;cursor:default; }
          /* Stock List Modal table */
          .sl-tbl { width:100%;border-collapse:collapse;font-size:13px; }
          .sl-tbl thead tr { background:linear-gradient(135deg,#4c1d95,#7c3aed);color:#fff; }
          .sl-tbl th { padding:10px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;text-align:center; }
          .sl-tbl td { padding:8px 10px;border-bottom:1px solid #f3e8ff;text-align:center;vertical-align:middle; }
          .sl-tbl tr:nth-child(even) td { background:#fdf8ff; }
          .sl-tbl tr:hover td { background:#f5f3ff; }
          .sl-btn { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap; }
          .sl-btn-view { background:#ede9fe;color:#7c3aed; }
          .sl-btn-view:hover { background:#7c3aed;color:#fff; }
          .sl-btn-edit { background:#d1fae5;color:#059669; }
          .sl-btn-edit:hover { background:#059669;color:#fff; }
          .sl-btn-del { background:#fee2e2;color:#ef4444; }
          .sl-btn-del:hover { background:#ef4444;color:#fff; }
          .sl-btn-bar { background:#fef3c7;color:#d97706; }
          .sl-btn-bar:hover { background:#d97706;color:#fff; }
        `}</style>

        {/* ── TOP BAR ── */}
        <div style={{ background:"linear-gradient(135deg,#4c1d95,#7c3aed)",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 2px 8px rgba(76,29,149,.35)",flexShrink:0 }}>
          <div style={{ width:34,height:34,background:"rgba(255,255,255,.15)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:"#fde68a",fontSize:16,flexShrink:0 }}>
            <i className="fas fa-truck"></i>
          </div>
          <div>
            <div style={{ fontSize:14,fontWeight:800,color:"#fff",lineHeight:1.2 }}>Create Stock</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,.65)" }}>Inventory Management</div>
          </div>
          <div style={{ marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
            {onClose && (
              <button className="sk-topbtn" onClick={onClose}><i className="fas fa-arrow-left"></i> Back to POS</button>
            )}
            <button className="sk-topbtn" onClick={() => { setShowEdit("stock_list"); fetchData(); }}>
              <i className="fas fa-list"></i> Stock List
            </button>
            <button className="sk-topbtn" onClick={() => setShowEdit("add_stock_item_wise_detail_report")}>
              <i className="fas fa-chart-bar"></i> Stock Detail Report
            </button>
            <button className="sk-topbtn" onClick={() => setShowEdit("supplier")}>
              <i className="fas fa-handshake"></i> Suppliers
            </button>
            <button className="sk-topbtn acc" onClick={() => setShowEdit("item")}>
              <i className="fas fa-plus"></i> New Item
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="sk-wrap">

          {/* LEFT: Form */}
          <form className="sk-left" onSubmit={handleSubmit}>

            {/* Invoice Details */}
            <div className="sk-sec"><i className="fas fa-file-invoice"></i> Invoice Details</div>
            <div className="sk-row">
              <div className="sk-field">
                <label>Stock Date</label>
                <input type="date" className="sk-input" name="stock_date" value={formData.stock_date || ""} onChange={handleInputChange} />
              </div>
              <div className="sk-field" style={{ flex: 2 }}>
                <label>Supplier</label>
                <Select
                  value={formData.supplier_id ? { value: formData.supplier_id, label: formData.full_name } : null}
                  options={getAllSupplier.map(s => ({ value: s.id, label: s.full_name }))}
                  onChange={opt => setFormData({ ...formData, supplier_id: opt.value, full_name: opt.label })}
                  placeholder="Select supplier..."
                  styles={selectStyles}
                />
              </div>
            </div>

            {/* Item */}
            <div className="sk-sec"><i className="fas fa-box"></i> Item</div>
            <div className="sk-field">
              <label>Select Item</label>
              <Select
                value={formData.item && formData.item_name ? { value: formData.item, label: formData.item_name } : null}
                options={items && Array.isArray(items) ? items.map(i => ({ value: i.id, label: i.items + " (" + i.stock_type + ")" })) : []}
                onChange={opt => {
                  setFormData({ ...formData, item: opt ? opt.value : "", item_name: opt ? opt.label : "" });
                  if (opt && opt.value) {
                    fetchLastPurchaseByItem(opt.value);
                  } else {
                    setShowLastPurchase(false);
                    setLastPurchaseList([]);
                  }
                }}
                placeholder="Search and select item..."
                isClearable
                styles={selectStyles}
              />
            </div>

            {/* Quantity */}
            <div className="sk-sec"><i className="fas fa-cubes"></i> Quantity</div>
            <div className="sk-row">
              <div className="sk-field">
                <label>Total Units</label>
                <input type="text" className="sk-input" name="packet_quantity" value={formData.packet_quantity} onChange={handleInputChange} placeholder="e.g. 10" />
              </div>
              <div className="sk-field">
                <label>Qty per Unit</label>
                <input type="text" className="sk-input" name="per_packet_quantity" value={formData.per_packet_quantity} onChange={handleInputChange} placeholder="e.g. 12" />
              </div>
              <div className="sk-field">
                <div className="sk-calc-label">Total Quantity</div>
                <div className="sk-calc-badge">{formData.quantity || "0"}</div>
              </div>
            </div>

            {/* Pricing */}
            <div className="sk-sec"><i className="fas fa-tag"></i> Pricing</div>
            <div className="sk-row">
              <div className="sk-field">
                <label>Sale Price / Unit</label>
                <input type="text" className="sk-input" name="selling_price" value={formData.selling_price} onChange={handleInputChange} placeholder="0.00" />
              </div>
              <div className="sk-field">
                {(() => {
                  const entered = parseFloat(formData.purchase_price);
                  if (!entered || isNaN(entered) || entered <= 0 || lastPurchaseList.length === 0) return null;

                  const latestBySupplier = {};
                  lastPurchaseList.forEach((row) => {
                    const sid = row.supplier_id;
                    if (sid == null) return;
                    const prev = latestBySupplier[sid];
                    if (!prev || new Date(row.stock_date) > new Date(prev.stock_date)) {
                      latestBySupplier[sid] = row;
                    }
                  });

                  const less = [];
                  const greater = [];
                  Object.values(latestBySupplier).forEach((row) => {
                    const price = parseFloat(row.purchase_price || 0);
                    if (!price) return;
                    if (price < entered) less.push({ name: row.full_name, price });
                    else if (price > entered) greater.push({ name: row.full_name, price });
                  });

                  if (less.length === 0 && greater.length === 0) return null;

                  const lineStyle = {
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 7px",
                    borderRadius: 6,
                    marginBottom: 3,
                    lineHeight: 1.35,
                    whiteSpace: "normal",
                  };

                  return (
                    <div style={{ marginBottom: 4 }}>
                      {less.length > 0 && (
                        <div style={{ ...lineStyle, background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
                          <i className="fas fa-arrow-down" style={{ marginRight: 4 }}></i>
                          Cheaper: {less.map((s, i) => (
                            <span key={i}>{s.name} (Rs. {s.price.toFixed(2)}){i < less.length - 1 ? ", " : ""}</span>
                          ))}
                        </div>
                      )}
                      {greater.length > 0 && (
                        <div style={{ ...lineStyle, background: "#fff1f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
                          <i className="fas fa-arrow-up" style={{ marginRight: 4 }}></i>
                          Higher: {greater.map((s, i) => (
                            <span key={i}>{s.name} (Rs. {s.price.toFixed(2)}){i < greater.length - 1 ? ", " : ""}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <label>Purchase Price / Unit</label>
                <input type="text" className="sk-input" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} placeholder="0.00" />
              </div>
            </div>
            <div className="sk-row">
              <div className="sk-field">
                <div className="sk-calc-label">Sale Price / Item</div>
                <div className="sk-calc-badge">{formData.price || "0.00"}</div>
              </div>
              <div className="sk-field">
                <div className="sk-calc-label">Purchase / Item</div>
                <div className="sk-calc-badge">{formData.purchase_rate_calculate_per_tablet || "0.00"}</div>
              </div>
              <div className="sk-field">
                <div className="sk-calc-label">Total Sale</div>
                <div className="sk-calc-badge" style={{ color:"#059669",borderColor:"#a7f3d0",background:"#f0fdf4" }}>{formData.total || "0.00"}</div>
              </div>
              <div className="sk-field">
                <div className="sk-calc-label">Total Purchase</div>
                <div className="sk-calc-badge" style={{ color:"#dc2626",borderColor:"#fca5a5",background:"#fff1f2" }}>{formData.total_purchase_rate || "0.00"}</div>
              </div>
            </div>

            {/* Details */}
            <div className="sk-sec"><i className="fas fa-info-circle"></i> Details</div>
            <div className="sk-row">
              {/* <div className="sk-field">
                <label>Final Price / Unit</label>
                <input type="text" className="sk-input" name="final_price" value={formData.final_price} onChange={handleInputChange} placeholder="Final price" />
              </div> */}
              {/* <div className="sk-field">
                <label>Expiry Date</label>
                <input type="date" className="sk-input" name="date_of_expiry" value={formData.date_of_expiry} onChange={handleInputChange} />
              </div> */}
            </div>
            <div className="sk-field">
              <label>Remarks</label>
              <input type="text" className="sk-input" name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="Optional notes..." />
            </div>
            {/* <div className="sk-field">
              <label>Rack Numbers</label>
              <Select
                isMulti isClearable
                value={formData.rack_no ? formData.rack_no.map(r => ({ value: r, label: r })) : []}
                onChange={opts => setFormData({ ...formData, rack_no: opts ? opts.map(o => o.value) : [] })}
                options={Array.from({ length: 300 }, (_, i) => ({ value: `Rack No ${i + 1}`, label: `Rack No ${i + 1}` }))}
                placeholder="Select rack numbers..."
                styles={{ ...selectStyles, control: (b) => ({ ...selectStyles.control(b), minHeight: 36 }) }}
              />
            </div> */}

            <button type="submit" className="sk-add-btn">
              <i className={`fas ${editIndex !== null ? "fa-sync-alt" : "fa-plus-circle"}`}></i>
              {editIndex !== null ? "Update Item" : "Add to Stock List"}
            </button>
          </form>

          {/* RIGHT: Summary + Items Table */}
          <div className="sk-right">

            {/* Summary */}
            <div className="sk-summary">
              <div style={{ background:"linear-gradient(135deg,#4c1d95,#7c3aed)",color:"#fde68a",fontWeight:800,fontSize:15,padding:"10px 14px",borderRadius:10,textAlign:"center",marginBottom:10 }}>
                <i className="fas fa-shopping-cart" style={{ marginRight:8 }}></i>
                Total Purchase: Rs. {grandPurchaseTotal.toFixed(2)}
              </div>

              <div className="sk-row">
                <div className="sk-field">
                  <label style={{ fontSize:10,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:".4px",display:"block",marginBottom:3 }}>
                    <i className="fas fa-hand-holding-usd" style={{ marginRight:4 }}></i>Advance Paid
                  </label>
                  <input
                    type="number"
                    className="sk-adv-input"
                    style={{ borderColor:"#a7f3d0",color:"#059669" }}
                    placeholder="0"
                    value={formData.advance_amount || ""}
                    onChange={e => setFormData({ ...formData, advance_amount: e.target.value })}
                  />
                </div>
                <div className="sk-field">
                  <label style={{ fontSize:10,fontWeight:700,color:"#dc2626",textTransform:"uppercase",letterSpacing:".4px",display:"block",marginBottom:3 }}>
                    <i className="fas fa-wallet" style={{ marginRight:4 }}></i>Remaining
                  </label>
                  <div className="sk-rem-box">{remainingAmt.toFixed(2)}</div>
                </div>
              </div>

              <button className="sk-save-btn" onClick={handleSaveAllData} disabled={tableData.length === 0} type="button">
                <i className="fas fa-save"></i> Save Stock Invoice (Ctrl+S)
              </button>
            </div>

            {/* Items Table */}
            <div className="sk-items-wrap">
              {tableData.length === 0 ? (
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:220,color:"#9ca3af",gap:10,padding:20 }}>
                  <i className="fas fa-boxes" style={{ fontSize:52,color:"#e9d5ff" }}></i>
                  <div style={{ fontWeight:700,color:"#7c3aed",fontSize:15 }}>No items added yet</div>
                  <div style={{ fontSize:12,color:"#a78bfa",textAlign:"center" }}>Fill the form and click "Add to Stock List"</div>
                </div>
              ) : (
                <table className="sk-tbl">
                  <thead>
                    <tr>
                      <th style={{ width:30 }}>#</th>
                      <th>Item</th>
                      <th>Buy/Unit</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th style={{ width:60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ color:"#8b5cf6",fontWeight:800,textAlign:"center" }}>{idx + 1}</td>
                        <td style={{ fontWeight:600,color:"#1e293b",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{row.item_name}</td>
                        <td style={{ color:"#6b7280" }}>{row.purchase_rate_calculate_per_tablet}</td>
                        <td style={{ fontWeight:600,textAlign:"center" }}>{row.quantity}</td>
                        <td style={{ fontWeight:800,color:"#7c3aed" }}>Rs. {parseFloat(row.total_purchase_rate || 0).toFixed(2)}</td>
                        <td style={{ whiteSpace:"nowrap",textAlign:"center" }}>
                          <button className="sk-edt" onClick={() => handleEdit(idx)} title="Edit" type="button">
                            <i className="fas fa-pen" style={{ fontSize:11 }}></i>
                          </button>
                          {row.hidden_id ? (
                            <button className="sk-del" onClick={() => handleDeleteStock(row.hidden_id, tableData, idx)} title="Delete" type="button">
                              <i className="fas fa-times" style={{ fontSize:11 }}></i>
                            </button>
                          ) : (
                            <button className="sk-del" onClick={() => handleDelete(idx)} title="Delete" type="button">
                              <i className="fas fa-times" style={{ fontSize:11 }}></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" style={{ textAlign:"right",color:"#5b21b6",fontSize:12,fontWeight:700,padding:"9px 8px" }}>
                        {tableData.length} item{tableData.length !== 1 ? "s" : ""}
                      </td>
                      <td style={{ fontWeight:800,color:"#7c3aed",fontSize:14,padding:"9px 8px" }}>
                        Rs. {grandPurchaseTotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STOCK LIST MODAL ── */}
      {showEdit === "stock_list" && (
        <Modal isOpen={true} onClose={() => setShowEdit("")} title="Stock List" maxWidth="1400px">
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8 }}>
              <select value={totalItem} onChange={handleTotalItemChange} style={{ padding:"6px 10px",border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:13,outline:"none" }}>
                {[10,20,30,50].map(n => <option key={n} value={n}>{n} per page</option>)}
              </select>

              <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                <input type="date" name="from_date" value={formData.from_date || ""} onChange={e => setFormData({...formData,from_date:e.target.value})} style={{ padding:"6px 10px",border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:13,outline:"none" }} />
                <input type="date" name="to_date" value={formData.to_date || ""} onChange={e => setFormData({...formData,to_date:e.target.value})} style={{ padding:"6px 10px",border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:13,outline:"none" }} />
                <div style={{ minWidth:180 }}>
                  <Select
                    value={formData.supplier_id_for_report ? { value:formData.supplier_id_for_report, label:formData.full_name } : null}
                    options={[{ value:"",label:"All Suppliers" },...getAllSupplier.map(s=>({value:s.id,label:s.full_name}))]}
                    onChange={opt => setFormData({...formData,supplier_id_for_report:opt.value,full_name:opt.label})}
                    placeholder="Filter by supplier"
                    styles={{ control:(b)=>({...b,border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:13,minHeight:36}),menu:(b)=>({...b,zIndex:9999}) }}
                  />
                </div>
                <select name="remaining" value={formData.remaining||""} onChange={e=>setFormData({...formData,remaining:e.target.value})} style={{ padding:"6px 10px",border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:13,outline:"none" }}>
                  <option value="">All Payments</option>
                  <option value="remaining">Remaining Amounts</option>
                </select>
                <input type="text" placeholder="Search invoice..." id="search-invoice" onKeyUp={handleTotalItemChange} style={{ padding:"6px 10px",border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:13,outline:"none",width:160 }} />
                <button onClick={resetFields} style={{ padding:"6px 12px",background:"#f1f5f9",border:"1.5px solid #ddd6fe",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                  <i className="fas fa-times" style={{ marginRight:4 }}></i>Reset
                </button>
              </div>
            </div>

            <div style={{ overflowX:"auto" }}>
              <table className="sl-tbl">
                <thead>
                  <tr>
                    <th>Invoice #</th><th>Supplier</th><th>Total</th><th>Advance</th><th>Remaining</th>
                    <th>Barcode</th><th>View</th><th>Edit</th><th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="9" style={{ textAlign:"center",padding:24,color:"#8b5cf6" }}>Loading...</td></tr>
                  ) : stockList.length === 0 ? (
                    <tr><td colSpan="9" style={{ textAlign:"center",padding:24,color:"#9ca3af" }}>No stock records found</td></tr>
                  ) : (
                    stockList.map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight:700,color:"#7c3aed" }}>{s.invoice_no}</td>
                        <td>{s.full_name}</td>
                        <td style={{ fontWeight:700 }}>Rs. {s.total_sum}</td>
                        <td style={{ color:"#059669",fontWeight:600 }}>{s.advance_payment}</td>
                        <td style={{ color:"#dc2626",fontWeight:600 }}>{s.remaining_amount}</td>
                        <td><button className="sl-btn sl-btn-bar" onClick={() => printBarcode(s.invoice_no)}><i className="fas fa-barcode"></i> Print</button></td>
                        <td><button className="sl-btn sl-btn-view" onClick={() => ViewInvoice(s.invoice_no)}><i className="fas fa-eye"></i> View</button></td>
                        <td><button className="sl-btn sl-btn-edit" onClick={() => { editInvoice(s.invoice_no); setShowEdit(""); }}><i className="fas fa-edit"></i> Edit</button></td>
                        <td><button className="sl-btn sl-btn-del" onClick={() => deleteInvoice(s.invoice_no)}><i className="fas fa-trash-alt"></i> Del</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop:16 }}>
              <ReactPaginate
                previousLabel={"← Prev"} nextLabel={"Next →"} breakLabel={"..."}
                pageCount={totalPages} marginPagesDisplayed={2} pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                containerClassName={"pagination"} pageClassName={"page-item"} activeClassName={"active"}
                pageLinkClassName={"page-link"} previousClassName={"page-item"} previousLinkClassName={"page-link"}
                nextClassName={"page-item"} nextLinkClassName={"page-link"}
                breakClassName={"page-item"} breakLinkClassName={"page-link"}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── INVOICE VIEW MODAL ── */}
      {isVisible && invoiceData.length > 0 && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ background:"#fff",borderRadius:14,width:"90%",maxWidth:1200,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
            <div style={{ background:"linear-gradient(135deg,#4c1d95,#7c3aed)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"14px 14px 0 0" }}>
              <div>
                <div style={{ color:"#fff",fontWeight:800,fontSize:16 }}>Stock Invoice #{invoiceData[0].invoice_no}</div>
                <div style={{ color:"rgba(255,255,255,.7)",fontSize:12 }}>
                  Date: {new Date(invoiceData[0].stock_date).toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g,"-")}
                </div>
              </div>
              <button onClick={() => setIsVisible(false)} style={{ background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontWeight:700,fontSize:14 }}>
                ✕ Close
              </button>
            </div>

            <div style={{ padding:20 }}>
              <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
                {/* Purchase Details */}
                <div style={{ flex:1,minWidth:300 }}>
                  <h4 style={{ color:"#7c3aed",fontWeight:700,marginBottom:10,fontSize:14 }}><i className="fas fa-shopping-cart" style={{ marginRight:6 }}></i>Purchase Details</h4>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#f5f3ff" }}>
                        {["#","Supplier","Item","Buy Price","Qty","Total"].map(h => (
                          <th key={h} style={{ padding:"8px",textAlign:"left",borderBottom:"2px solid #ddd6fe",fontSize:11,fontWeight:700,color:"#5b21b6",textTransform:"uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom:"1px solid #f3e8ff" }}>
                          <td style={{ padding:"7px 8px",color:"#8b5cf6",fontWeight:700 }}>{idx+1}</td>
                          <td style={{ padding:"7px 8px" }}>{item.full_name}</td>
                          <td style={{ padding:"7px 8px",fontWeight:600 }}>{item.item_name}</td>
                          <td style={{ padding:"7px 8px" }}>{item.purchase_rate_calculate_per_tablet}</td>
                          <td style={{ padding:"7px 8px",textAlign:"center" }}>{item.quantity}</td>
                          <td style={{ padding:"7px 8px",fontWeight:700,color:"#7c3aed" }}>Rs. {(item.quantity*item.purchase_rate_calculate_per_tablet).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Selling Details */}
                <div style={{ flex:1,minWidth:300 }}>
                  <h4 style={{ color:"#059669",fontWeight:700,marginBottom:10,fontSize:14 }}><i className="fas fa-credit-card" style={{ marginRight:6 }}></i>Selling Details</h4>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#f0fdf4" }}>
                        {["Sale Price","Qty","Total Selling","Action"].map(h => (
                          <th key={h} style={{ padding:"8px",textAlign:"left",borderBottom:"2px solid #a7f3d0",fontSize:11,fontWeight:700,color:"#047857",textTransform:"uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.map((item) => (
                        <tr key={item.id} style={{ borderBottom:"1px solid #f0fdf4" }}>
                          <td style={{ padding:"7px 8px" }}>{item.price}</td>
                          <td style={{ padding:"7px 8px",textAlign:"center" }}>{item.quantity}</td>
                          <td style={{ padding:"7px 8px",fontWeight:700,color:"#059669" }}>Rs. {(item.price*item.quantity).toFixed(2)}</td>
                          <td style={{ padding:"7px 8px" }}>
                            <button onClick={() => handleDeleteStock(item.id, invoiceData)} style={{ background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontWeight:700,fontSize:12 }}>
                              <i className="fas fa-trash" style={{ marginRight:4 }}></i>Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginTop:16,background:"#f5f3ff",border:"2px solid #ddd6fe",borderRadius:10,padding:"14px 18px",display:"flex",gap:24,flexWrap:"wrap" }}>
                <div><span style={{ fontSize:12,color:"#6b7280" }}>Grand Total</span><div style={{ fontWeight:800,fontSize:18,color:"#7c3aed" }}>Rs. {calculateGrandTotal().toFixed(2)}</div></div>
                <div><span style={{ fontSize:12,color:"#6b7280" }}>Advance Payment</span><div style={{ fontWeight:800,fontSize:18,color:"#059669" }}>Rs. {invoiceData[0]?.advance_payment || 0}</div></div>
                <div><span style={{ fontSize:12,color:"#6b7280" }}>Remaining</span><div style={{ fontWeight:800,fontSize:18,color:"#dc2626" }}>Rs. {parseFloat(invoiceData[0]?.remaining_amount || 0).toFixed(2)}</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BARCODE MODAL ── */}
      {isVisibleBarcode && (
        <ModalForChild isOpen={true} onClose={() => setVisibleBarcode(false)} title="Barcode Print" maxWidth="1400px">
          <StockBarcodeGenerator onClose={() => setVisibleBarcode(false)} barcodeInvoiceNo={barcodeInvoiceNo} />
        </ModalForChild>
      )}
    </>
  );
};

export default Stock;
