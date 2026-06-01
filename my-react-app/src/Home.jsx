import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Autosuggest from "react-autosuggest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useItemPharmacy } from "./components/ItemContextPharmacy";

function Home({ onClose }) {
  // Data and pagination states
  const [data, setData] = useState([]);
  const [suggestedData, getSuggestedData] = useState([]);

  const [hit, setHit] = useState("");

  const { fetchAllItemsPharmacy } = useItemPharmacy();

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [searchInvoice, setSearchInvoice] = useState("");

  // Report state (for later use)
  const [report, getAllReports] = useState({
    from_date: "",
    to_date: "",
    report_type: "",
  });

  // NEW: Track whether the user has attempted to submit the form
  const [submitted, setSubmitted] = useState(false);

  // Form state – using empty strings for required fields
  const [editFormData, setEditFormData] = useState({
    category: "",
    manufacturer: "-",
    item_name: "",
    total_pieces: "",
    price: 0,
    discount: 0,
    rack_no: "",
    formula: "",
    unitType: "",
    gst: 0,
    hidden_id: "",
    stock_type: "Stock Item",
    medicine_type: "other",
    alert: 0,
    barcode_no: "",
    location:"In Store",
    item_purchase_price:0
  });

  // For items per page
  const [totalItem, setTotalItemGet] = useState(10);

  // State for autosuggest suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Filter suggestions based on input value
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0
      ? []
      : suggestedData.filter(
          (suggestion) =>
            suggestion.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  // Return the suggestion value
  const getSuggestionValue = (suggestion) => suggestion.name;

  // How to render each suggestion
  const renderSuggestion = (suggestion) => <div>{suggestion.name}</div>;

  // When suggestions are needed (typing)
  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  // When suggestions should be cleared
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  // Input props for Autosuggest with conditional validation styling
  const inputProps = {
    placeholder: "Enter Item Name",
    value: editFormData.item_name,
    onChange: (e, { newValue }) =>
      setEditFormData({ ...editFormData, item_name: newValue }),
    // Only add 'is-invalid' if the form has been submitted and the field is empty
    className: `form-control ${
      submitted && !editFormData.item_name ? "is-invalid" : ""
    }`,
    id: "item_name",
    name: "item_name",
  };

  // ---------------------------
  // End of Autosuggest configuration
  // ---------------------------

  // Fetch data from server
  const fetchData = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "/items", {
        params: {
          page: currentPage,
          limit: totalItem,
          getSearch: searchInvoice,
        },
      })
      .then((res) => {
        setData(res.data.results);
        setTotalCount(0);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchSuggestionList();
  }, []);

  function fetchSuggestionList() {
    axios
      .get(process.env.REACT_APP_API_URL + "/get-all-items-for-suggestion", {
        params: {
          page: currentPage,
          limit: totalItem,
        },
      })
      .then((res) => {
        getSuggestedData(res.data.results);
      })
      .catch((err) => console.log(err));
  }

  // Handle page change for pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem, searchInvoice]);

  const handleTotalItemChange = (event) => {
    const newValue = event.target.value;
    if (event.target.id === "search-invoice") {
      if (event.key === "Enter") {
        setSearchInvoice(newValue);
        console.log("Search started with: ", newValue);
      }
    } else {
      setTotalItemGet(newValue);
    }
  };

  const calculate = () => {
    const { total_pieces, price, discount } = editFormData;
    const calculate_discount = ((total_pieces * price) / 100) * discount;
    setEditFormData({
      ...editFormData,
      total_price: total_pieces * price - calculate_discount,
    });
  };

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark the form as submitted so validation errors appear
    setSubmitted(true);

    // Validate required fields (adjust these as needed)
    // console.log(editFormData.gst);
    if (
      !editFormData.item_name ||
      !editFormData.manufacturer ||
      !editFormData.unitType ||
      editFormData.gst < 0 ||
      !editFormData.medicine_type
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Proceed with update or insert
    if (editFormData.hidden_id !== "") {
      // Update existing item
      const itemId = editFormData.hidden_id;
      axios
        .put(
          `${process.env.REACT_APP_API_URL}/update-item/${itemId}`,
          editFormData
        )
        .then((response) => {
          console.log("Data updated successfully:", response.data);
          toast.success("Data updated successfully!");
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
            category: "",
            manufacturer: "-",
            item_name: "",
            price: "",
            discount: "",
            rack_no: "",
            formula: "",
            unitType: "",
            // stock_type: "",
            gst: 0,
            hidden_id: "",
            // medicine_type: "",
            alert: 0,
            barcode_no: "",
            location:"In Store",
            item_purchase_price:0
          });
          fetchData();
          fetchSuggestionList();
          fetchAllItemsPharmacy();
        })
        .catch((error) => {
          console.error("Error updating data:", error);
          toast.error(error.response.data.error);
        });
    } else {
      // Insert new item
      try {
        const response = await fetch(
          process.env.REACT_APP_API_URL + "/insert_all_items",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editFormData),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Data inserted:", data);
          toast.success("Data added successfully!");
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
            category: "",
            item_name: "",
            price: 0,
            discount: 0,
            gst: 0,
            total_pieces: "",
            total_price: "",
            alert: 0,
            expire: "",
            hidden_id: "",
            category_id: "",
            manufacturer: "-",
            // stock_type: "",
            formula: "",
            unitType: "",
            rack_no: "",
            barcode_no: "",
            location:"In Store",
            item_purchase_price:0
          });
          fetchData();
          fetchSuggestionList();
          fetchAllItemsPharmacy();
        } else {
          throw new Error("Item Already Exist");
        }
      } catch (error) {
        console.error("Error updating data:", error);
        toast.error("Item Already Exist or Barcode Already Exist");
      }
    }
  };

  const editItem = (item_id_get) => {
    const itemId = item_id_get;
    axios
      .get(`${process.env.REACT_APP_API_URL}/item-get/${itemId}`)
      .then((response) => {
        const {
          id,
          items,
          price,
          discount,
          unit_type,
          gst,
          manufacturer,
          medicine_type,
          stock_type,
          alert,
          barcode_no,
          location,
          item_purchase_price
        } = response.data.results[0];
        setEditFormData({
          manufacturer: manufacturer || "",
          item_name: items || "",
          price: price || "",
          discount: discount !== null && discount !== undefined ? discount : "",
          gst: gst || 0,
          unitType: unit_type || "",
          medicine_type: medicine_type || "",
          stock_type: stock_type || "",
          alert: alert || 0,
          barcode_no: barcode_no || 0,
          item_purchase_price: item_purchase_price || 0,
          location: location || "In Store",
          hidden_id: id || "",
        });
        // Reset submitted so errors don't show during edit
        setSubmitted(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteItem = (item_id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    axios
      .delete(`${process.env.REACT_APP_API_URL}/delete-item/${item_id}`)
      .then((response) => {
        console.log("Item deleted successfully:", response.data);
        fetchData();
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
      });
  };

  return (
    <>
      <style>{`
        .hm-wrap {
          display: flex;
          height: 100%;
          background: #f5f3ff;
          font-family: 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .hm-left {
          width: 400px;
          min-width: 340px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #4c1d95 0%, #7c3aed 100%);
          overflow: hidden;
          flex-shrink: 0;
        }
        .hm-left-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(255,255,255,.15);
        }
        .hm-left-header h2 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #fde68a;
          letter-spacing: .5px;
        }
        .hm-left-header p {
          margin: 2px 0 0;
          font-size: .75rem;
          color: rgba(255,255,255,.6);
        }
        .hm-mode-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: .7rem;
          font-weight: 600;
          background: rgba(253,230,138,.18);
          color: #fde68a;
          border: 1px solid rgba(253,230,138,.35);
        }
        .hm-mode-badge.edit { background: rgba(251,191,36,.22); color: #fbbf24; border-color: rgba(251,191,36,.4); }

        .hm-form-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .hm-form-body {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hm-form-footer {
          padding: 12px 20px;
          border-top: 1px solid rgba(255,255,255,.15);
          flex-shrink: 0;
          background: rgba(0,0,0,.1);
        }
        .hm-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hm-label {
          font-size: .72rem;
          font-weight: 600;
          color: rgba(253,230,138,.85);
          text-transform: uppercase;
          letter-spacing: .6px;
        }
        .hm-input, .hm-select {
          width: 100%;
          padding: 8px 11px;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.1);
          color: #fff;
          font-size: .85rem;
          outline: none;
          transition: border .2s, background .2s;
          box-sizing: border-box;
        }
        .hm-input::placeholder { color: rgba(255,255,255,.45); }
        .hm-input:focus, .hm-select:focus {
          border-color: #fde68a;
          background: rgba(255,255,255,.16);
        }
        .hm-input.invalid { border-color: #f87171; }
        .hm-select option { background: #4c1d95; color: #fff; }

        /* Autosuggest override */
        .hm-form-body .react-autosuggest__container { position: relative; }
        .hm-form-body .react-autosuggest__input {
          width: 100%;
          padding: 8px 11px;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.1);
          color: #fff;
          font-size: .85rem;
          outline: none;
          box-sizing: border-box;
          transition: border .2s, background .2s;
        }
        .hm-form-body .react-autosuggest__input::placeholder { color: rgba(255,255,255,.45); }
        .hm-form-body .react-autosuggest__input:focus { border-color: #fde68a; background: rgba(255,255,255,.16); }
        .hm-form-body .react-autosuggest__suggestions-container--open {
          position: absolute;
          z-index: 999;
          width: 100%;
          background: #3b0764;
          border: 1px solid rgba(253,230,138,.3);
          border-radius: 8px;
          margin-top: 2px;
          max-height: 180px;
          overflow-y: auto;
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
        }
        .hm-form-body .react-autosuggest__suggestion {
          padding: 8px 12px;
          font-size: .85rem;
          color: #e9d5ff;
          cursor: pointer;
        }
        .hm-form-body .react-autosuggest__suggestion--highlighted { background: rgba(253,230,138,.15); color: #fde68a; }
        .hm-form-body .react-autosuggest__input.invalid { border-color: #f87171; }
        .hm-select.invalid { border-color: #f87171; }

        .hm-purchase-field {
          border-radius: 8px;
          border: 1px dashed rgba(253,230,138,.4);
          background: rgba(253,230,138,.07);
          padding: 10px 12px;
        }

        .hm-btn-save {
          margin-top: 4px;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #1c1917;
          font-weight: 700;
          font-size: .9rem;
          cursor: pointer;
          letter-spacing: .3px;
          transition: opacity .2s, transform .1s;
          box-shadow: 0 4px 14px rgba(245,158,11,.4);
        }
        .hm-btn-save:hover { opacity: .9; transform: translateY(-1px); }
        .hm-btn-save:active { transform: translateY(0); }

        /* ── RIGHT PANEL ── */
        .hm-right {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .hm-right-header {
          padding: 14px 20px;
          background: #fff;
          border-bottom: 2px solid #ede9fe;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .hm-right-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #4c1d95;
        }
        .hm-count-pill {
          font-size: .72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          background: #ede9fe;
          color: #6d28d9;
        }
        .hm-btn-close {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
          border-radius: 7px;
          border: none;
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          color: #fff;
          font-size: .8rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .15s;
        }
        .hm-btn-close:hover { opacity: .85; }

        .hm-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #faf5ff;
          border-bottom: 1px solid #ede9fe;
          flex-shrink: 0;
        }
        .hm-per-page {
          padding: 6px 10px;
          border-radius: 7px;
          border: 1.5px solid #ddd6fe;
          font-size: .8rem;
          color: #4c1d95;
          background: #fff;
          outline: none;
          cursor: pointer;
        }
        .hm-search {
          flex: 1;
          padding: 7px 12px;
          border-radius: 8px;
          border: 1.5px solid #ddd6fe;
          font-size: .85rem;
          color: #1e1b4b;
          outline: none;
          transition: border .2s;
        }
        .hm-search:focus { border-color: #7c3aed; }

        .hm-table-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 8px;
        }
        .hm-tbl {
          width: 100%;
          border-collapse: collapse;
          font-size: .83rem;
        }
        .hm-tbl thead tr {
          background: linear-gradient(90deg, #4c1d95, #7c3aed);
        }
        .hm-tbl thead th {
          padding: 10px 12px;
          color: #fde68a;
          font-weight: 600;
          font-size: .75rem;
          text-transform: uppercase;
          letter-spacing: .5px;
          border: none;
          white-space: nowrap;
        }
        .hm-tbl tbody tr {
          border-bottom: 1px solid #f3f0ff;
          transition: background .15s;
        }
        .hm-tbl tbody tr:hover { background: #faf5ff; }
        .hm-tbl tbody td {
          padding: 9px 12px;
          color: #374151;
          vertical-align: middle;
        }
        .hm-tbl tbody tr:last-child { border-bottom: none; }

        .hm-stock-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: .68rem;
          font-weight: 600;
        }
        .hm-stock-badge.stock { background: #d1fae5; color: #065f46; }
        .hm-stock-badge.nonstock { background: #fef3c7; color: #92400e; }

        .hm-btn-edit, .hm-btn-del {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: .8rem;
          transition: opacity .15s, transform .1s;
        }
        .hm-btn-edit { background: #d1fae5; color: #065f46; }
        .hm-btn-del  { background: #fee2e2; color: #991b1b; margin-left: 4px; }
        .hm-btn-edit:hover, .hm-btn-del:hover { opacity: .8; transform: scale(1.08); }

        .hm-empty {
          text-align: center;
          padding: 40px 20px;
          color: #a78bfa;
          font-size: .85rem;
        }

        .hm-pagination-wrap {
          padding: 10px 16px;
          background: #faf5ff;
          border-top: 1px solid #ede9fe;
          flex-shrink: 0;
        }
        .hm-pagination-wrap .pagination {
          margin: 0;
          gap: 4px;
          flex-wrap: wrap;
        }
        .hm-pagination-wrap .page-link {
          border-radius: 6px !important;
          border: 1px solid #ddd6fe;
          color: #6d28d9;
          font-size: .78rem;
          padding: 4px 10px;
        }
        .hm-pagination-wrap .page-item.active .page-link {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          border-color: #7c3aed;
          color: #fff;
        }
        .hm-pagination-wrap .page-link:hover { background: #ede9fe; }
      `}</style>

      <div className="hm-wrap">
        {/* ── LEFT: Item Form ── */}
        <div className="hm-left">
          <div className="hm-left-header">
            <h2><i className="fas fa-box-open" style={{marginRight:7}}></i>Item Form</h2>
            <p>Add or update inventory items</p>
            <span className={`hm-mode-badge${editFormData.hidden_id ? " edit" : ""}`}>
              {editFormData.hidden_id ? "Edit Mode" : "New Item"}
            </span>
          </div>

          <form style={{display:'flex',flexDirection:'column',flex:1,minHeight:0,overflow:'hidden'}} onSubmit={handleSubmit}>
          <div className="hm-form-scroll">
          <div className="hm-form-body">
            {/* Stock Type */}
            <div className="hm-field">
              <label className="hm-label">Stock Type</label>
              <select
                className="hm-select"
                id="stock_type"
                name="stock_type"
                value={editFormData.stock_type || ""}
                onChange={(e) => setEditFormData({ ...editFormData, stock_type: e.target.value })}
              >
                <option value="Stock Item">With Stock Entry (FIFO)</option>
                <option value="Non Stock Item">Without Stock Entry (Avg Cost)</option>
              </select>
            </div>

            {/* Item Name (Autosuggest) */}
            <div className="hm-field">
              <label className="hm-label">Item Name</label>
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  ...inputProps,
                  className: `${submitted && !editFormData.item_name ? "invalid" : ""}`,
                  placeholder: "Enter item name",
                }}
              />
            </div>

            {/* Hidden manufacturer field (kept for form submission) */}
            <input type="hidden" name="manufacturer" value={editFormData.manufacturer || "-"} />

            {/* Item Type */}
            <div className="hm-field">
              <label className="hm-label">Item Type</label>
              <select
                className="hm-select"
                name="medicine_type"
                id="medicine_type"
                value={editFormData.medicine_type || ""}
                onChange={(e) => setEditFormData({ ...editFormData, medicine_type: e.target.value })}
              >
                <option value="other">Other</option>
              </select>
            </div>

            {/* Sale Price */}
            <div className="hm-field">
              <label className="hm-label">Sale Price</label>
              <input
                type="number"
                className="hm-input"
                onKeyUp={calculate}
                id="price"
                name="price"
                placeholder="0.00"
                value={editFormData.price || ""}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
              />
            </div>

            {/* Purchase Price (Non Stock Item only) */}
            {editFormData.stock_type === "Non Stock Item" && (
              <div className="hm-field hm-purchase-field">
                <label className="hm-label">Purchase Price</label>
                <input
                  type="number"
                  className="hm-input"
                  id="item_purchase_price"
                  name="item_purchase_price"
                  placeholder="0.00"
                  value={editFormData.item_purchase_price || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, item_purchase_price: e.target.value })}
                />
              </div>
            )}

            {/* Unit Type */}
            <div className="hm-field">
              <label className="hm-label">Unit Type</label>
              <select
                className={`hm-select${submitted && !editFormData.unitType ? " invalid" : ""}`}
                id="unitType"
                name="unitType"
                value={editFormData.unitType || ""}
                onChange={(e) => setEditFormData({ ...editFormData, unitType: e.target.value })}
              >
                <option value="">Select Unit</option>
                <option value="Sheet">Sheet</option>
                <option value="Piece">Piece</option>
                <option value="Set">Set</option>
                <option value="L">Liter (L)</option>
                <option value="gal">Gallon (gal)</option>
                <option value="Pallet">Pallet</option>
                <option value="Carton">Carton</option>
                <option value="Box">Box</option>
              </select>
            </div>

            {/* Hidden discount */}
            <input type="hidden" name="discount" value={editFormData.discount || 0} />
            {/* Hidden gst */}
            <input type="hidden" name="gst" value={editFormData.gst || 0} />

            {/* Alert */}
            <div className="hm-field">
              <label className="hm-label">Alert Qty</label>
              <input
                type="number"
                className="hm-input"
                placeholder="0"
                min={0}
                id="alert"
                name="alert"
                value={editFormData.alert || 0}
                onChange={(e) => setEditFormData({ ...editFormData, alert: e.target.value })}
              />
            </div>

            {/* Barcode */}
            <div className="hm-field">
              <label className="hm-label">Barcode No</label>
              <input
                type="text"
                className="hm-input"
                placeholder="Enter barcode"
                id="barcode_no"
                name="barcode_no"
                value={editFormData.barcode_no}
                onChange={(e) => setEditFormData({ ...editFormData, barcode_no: e.target.value })}
              />
            </div>

            {/* Location */}
            <div className="hm-field">
              <label className="hm-label">Location</label>
              <select
                className="hm-select"
                id="location"
                name="location"
                value={editFormData.location || ""}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              >
                <option>In Store</option>
                <option>Out of Store</option>
              </select>
            </div>

            </div>{/* end hm-form-body */}
            </div>{/* end hm-form-scroll */}
            <div className="hm-form-footer">
              <button type="submit" className="hm-btn-save" style={{width:'100%'}}>
                <i className="fas fa-save" style={{marginRight:7}}></i>
                {editFormData.hidden_id ? "Update Item" : "Save Item"}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Items List ── */}
        <div className="hm-right">
          <div className="hm-right-header">
            <h3><i className="fas fa-layer-group" style={{marginRight:8,color:'#7c3aed'}}></i>Items List</h3>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span className="hm-count-pill">{data.length} shown</span>
              
            </div>
          </div>

          <div className="hm-toolbar">
            <select className="hm-per-page" value={totalItem} onChange={handleTotalItemChange}>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="30">30 / page</option>
              <option value="40">40 / page</option>
              <option value="50">50 / page</option>
            </select>
            <input
              type="text"
              className="hm-search"
              placeholder="Search items..."
              id="search-invoice"
              onKeyUp={handleTotalItemChange}
            />
          </div>

          <div className="hm-table-wrap">
            <table className="hm-tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>Unit</th>
                  <th>Stock Type</th>
                  <th>Alert</th>
                  <th style={{textAlign:'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="hm-empty">Loading items...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="6" className="hm-empty">No items found.</td></tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td style={{color:'#6d28d9',fontWeight:600}}>{item.id}</td>
                      <td style={{fontWeight:500}}>{item.items}</td>
                      <td>{item.unit_type}</td>
                      <td>
                        <span className={`hm-stock-badge ${item.stock_type === "Stock Item" ? "stock" : "nonstock"}`}>
                          {item.stock_type === "Stock Item" ? "Stock" : "Non-Stock"}
                        </span>
                      </td>
                      <td>{item.alert}</td>
                      <td style={{textAlign:'center'}}>
                        <button
                          className="hm-btn-edit"
                          onClick={() => editItem(item.id)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="hm-btn-del"
                          onClick={() => deleteItem(item.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="hm-pagination-wrap">
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
        </div>
      </div>
    </>
  );
}

export default Home;
