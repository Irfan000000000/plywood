


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Autosuggest from 'react-autosuggest';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BankAccounts() {
  // Data and pagination states
  const [data, setData] = useState([]);
  const [suggestedData, getSuggestedData] = useState([]);

  const [hit, setHit] = useState('');


  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [searchInvoice, setSearchInvoice] = useState("");

  // Report state (for later use)
  const [report, getAllReports] = useState({
    from_date: '',
    to_date: '',
    report_type: ''
  });

  // NEW: Track whether the user has attempted to submit the form
  const [submitted, setSubmitted] = useState(false);

  // Form state – using empty strings for required fields
  const [editFormData, setEditFormData] = useState({
    bank_name: '',
    opening_balance:'',
    account_no:'',
    hidden_id: '',
    medicine_type: 'other',
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
      : suggestedData.filter(suggestion =>
          suggestion.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  // Return the suggestion value
  const getSuggestionValue = suggestion => suggestion.name;

  // How to render each suggestion
  const renderSuggestion = suggestion => <div>{suggestion.name}</div>;

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
    className: `form-control ${submitted && !editFormData.item_name ? 'is-invalid' : ''}`,
    id: "item_name",
    name: "item_name"
  };

  // ---------------------------
  // End of Autosuggest configuration
  // ---------------------------

  // Fetch data from server
  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL+"/bank-accounts-list", {
      params: {
        page: currentPage,
        limit: totalItem,
        getSearch: searchInvoice
      }
    })
      .then(res => {
        setData(res.data.results);
        setTotalCount(0);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchSuggestionList();
  }, []);


  function fetchSuggestionList(){
    axios.get(process.env.REACT_APP_API_URL+"/get-all-items-for-suggestion", {
      params: {
        page: currentPage,
        limit: totalItem
      }
    })
      .then(res => {
        getSuggestedData(res.data.results);
      })
      .catch(err => console.log(err));
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
    const calculate_discount = (total_pieces * price) / 100 * discount;
    setEditFormData({
      ...editFormData,
      total_price: (total_pieces * price) - calculate_discount
    });
  };

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark the form as submitted so validation errors appear
    setSubmitted(true);

    // Validate required fields (adjust these as needed)
    console.log(editFormData.gst);
    if (
      !editFormData.bank_name ||
      !editFormData.opening_balance
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Proceed with update or insert
    if (editFormData.hidden_id !== "") {
      // Update existing item
      const itemId = editFormData.hidden_id;
      axios.put(`${process.env.REACT_APP_API_URL}/update-bank-account/${itemId}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);
          toast.success('Data updated successfully!');
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
            bank_name: '',
            opening_balance: '',
            account_no: '',
            hidden_id:''
          });
          fetchData();
          fetchSuggestionList();
        })
        .catch(error => {
          console.error('Error updating data:', error);
          toast.error(error.response.data.error);
        });
    } else {
      // Insert new item
      try {
        const response = await fetch(process.env.REACT_APP_API_URL+'/insert-bank-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Data inserted:", data);
          toast.success('Data added successfully!');
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
              bank_name: '',
            opening_balance: '',
            account_no: '',
            hidden_id:''
          });
          fetchData();
          fetchSuggestionList();
        } else {
          throw new Error('Bank Name Already Exist');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Bank Name Already Exist");
      }
    }
  };

  const editItem = (item_id_get) => {
    const itemId = item_id_get;
    axios.get(`${process.env.REACT_APP_API_URL}/bank-account-get/${itemId}`)
      .then(response => {
        const { id, bank_name, account_no, opening_balance } =
          response.data.results[0];
        setEditFormData({
          bank_name: bank_name || '',
          opening_balance: opening_balance || 0,
          account_no: account_no || '',
          hidden_id: id || ''
        });
        // Reset submitted so errors don't show during edit
        setSubmitted(false);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const deleteItem = (item_id) => {

    const confirmation = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if(!confirmation){
      return false;
    }


    axios.delete(`${process.env.REACT_APP_API_URL}/delete-bank-account/${item_id}`)
      .then(response => {
        console.log('Deleted successfully:', response.data);
        fetchData();
      })
      .catch(error => {
        console.error('Error deleting item:', error);
      });
  };

  return (
    <>
      <div className="d-flex">
        {/* --- Medicine Form --- */}
        <div className="col-md-4 p-2">
          <h5 className="text-warning bg-primary p-2 card-header border">
            <i className="fas fa-first-aid"></i> Bank Accounts Form
          </h5>
          <form className="border p-3" onSubmit={handleSubmit}>
            {/* --------------------
                Autosuggest Name Field
                -------------------- */}

            {/* Manufacturer Field */}
            <div className="form-group row">
              <label htmlFor="bank_name" className="col-sm-2 col-form-label">
                Name
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className={`form-control ${
                    submitted && !editFormData.bank_name ? "is-invalid" : ""
                  }`}
                  id="bank_name"
                  name="bank_name"
                  value={editFormData.bank_name || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      bank_name: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group row">
              <label htmlFor="opening_balance" className="col-sm-2 col-form-label">
                O.Balance
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className={`form-control ${
                    submitted && !editFormData.opening_balance ? "is-invalid" : ""
                  }`}
                  id="opening_balance"
                  name="opening_balance"
                  value={editFormData.opening_balance || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      opening_balance: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group row">
              <label htmlFor="account_no" className="col-sm-2 col-form-label">
                Acc#
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className={`form-control ${
                    submitted && !editFormData.account_no ? "is-invalid" : ""
                  }`}
                  id="account_no"
                  name="account_no"
                  value={editFormData.account_no || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      account_no: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-group row">
              <div className="col-sm-10 offset-sm-2 d-flex justify-content-end">
                <input
                  type="submit"
                  className="btn btn-sm btn-primary"
                  value="Save"
                />
              </div>
            </div>
          </form>
        </div>

        {/* --- Medicine List --- */}
        <div className="col-md-8 p-2">
          <div className="card-header text-warning bg-primary p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-list"></i> Bank Accounts List
              </div>
            </div>
          </div>

          <div className="border p-2">
            <div className="pb-3 d-flex justify-content-between">
              <div className="pb-3">
                <select value={totalItem} onChange={handleTotalItemChange}>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search........."
                  className="form-control"
                  id="search-invoice"
                  onKeyUp={handleTotalItemChange}
                />
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Sr#</th>
                  <th>Name</th>
                  <th>Opening.Balance</th>
                  <th>Account#</th>
                  <th className="text-center">Edit</th>
                  <th className="text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">Loading...</td>
                  </tr>
                ) : (
                  data.map((supplier, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{supplier.bank_name}</td>
                      <td>{supplier.opening_balance}</td>
                      <td>{supplier.account_no}</td>
                      <td className="text-center">
                        <a
                          href="#"
                          className="btn btn-success btn-sm"
                          onClick={() => editItem(supplier.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </a>
                      </td>
                      <td className="text-center">
                        <a
                          href="#"
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteItem(supplier.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

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

export default BankAccounts;
