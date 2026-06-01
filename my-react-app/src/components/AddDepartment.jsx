


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Autosuggest from 'react-autosuggest';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useItems } from './ItemContext'

function AddDepartment() {
  // Data and pagination states
  const [data, setData] = useState([]);
  const [suggestedData, getSuggestedData] = useState([]);

  const [hit, setHit] = useState('');

  const { fetchAllItems } = useItems();


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
    category: '',
    manufacturer: '-',
    item_name: '',
    total_pieces: '',
    price: 0,
    discount: 0,
    rack_no: '',
    formula: '',
    unitType: '',
    gst: 0,
    hidden_id: '',
    medicine_type: 'other',
    alert:0
  });

  // For items per page
  const [totalItem, setTotalItemGet] = useState(10);

  // State for autosuggest suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Filter suggestions based on input value
  const getSuggestions = (value) => {
    console.log(value);
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
    axios.get(process.env.REACT_APP_API_URL+"/departments", {
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
    axios.get(process.env.REACT_APP_API_URL+"/get-all-department-for-suggestion", {
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
      !editFormData.item_name
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Proceed with update or insert
    if (editFormData.hidden_id !== "") {
      // Update existing item
      const itemId = editFormData.hidden_id;
      axios.put(`${process.env.REACT_APP_API_URL}/update-department/${itemId}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);
          toast.success('Data updated successfully!');
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
            category: '',
            manufacturer: '',
            item_name: '',
            price: '',
            discount: '',
            rack_no: '',
            formula: '',
            unitType: '',
            gst: '',
            hidden_id: '',
            medicine_type: ''
          });
          fetchData();
          fetchSuggestionList();
          fetchAllItems();
        })
        .catch(error => {
          console.error('Error updating data:', error);
          toast.error(error.response.data.error);
        });
    } else {
      // Insert new item
      try {
        const response = await fetch(process.env.REACT_APP_API_URL+'/insert_department', {
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
            category: '',
            item_name: '',
            price: 0,
            discount: 0,
            gst: '',
            total_pieces: '',
            total_price: '',
            alert: '',
            expire: '',
            hidden_id: '',
            category_id: '',
            manufacturer: '',
            formula: '',
            unitType: '',
            rack_no: ''
          });
          fetchData();
          fetchSuggestionList();
          fetchAllItems();
        } else {
          throw new Error('Item Already Exist');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Item Already Exist");
      }
    }
  };



  const editItem = (item_id_get) => {
    const itemId = item_id_get;
    axios.get(`${process.env.REACT_APP_API_URL}/department-get/${itemId}`)
      .then(response => {
        const { id, department } = response.data.results[0];
        setEditFormData({
          item_name: department || '',
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

    let confirm_delete_item = window.confirm(
      "Are you sure you want to delete this department?"
    );
    if (!confirm_delete_item) return;

    axios.delete(`${process.env.REACT_APP_API_URL}/delete-department/${item_id}`)
      .then(response => {
        console.log('Item deleted successfully:', response.data);
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
        <div className='col-md-6 p-2'>
          <h5 className='text-warning bg-primary p-2 card-header border'>
            <i className="fas fa-first-aid"></i> Add Department Form
          </h5>
          <form className='border p-3' onSubmit={handleSubmit}>
            {/* --------------------
                Autosuggest Name Field
                -------------------- */}
            <div className="form-group row">
              <label htmlFor="item_name" className="col-sm-2 col-form-label">Name</label>
              <div className="col-sm-10">
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                />
              </div>
            </div>

           
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
        <div className="col-md-6 p-2">
          <div className="card-header text-warning bg-primary p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-list"></i> Departments List
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
                  <th>ID</th>
                  <th>Department</th>
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
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>{item.department}</td>
                      <td className="text-center">
                        <a
                          href="#"
                          className="btn btn-success btn-sm"
                          onClick={() => editItem(item.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </a>
                      </td>
                      <td className="text-center">
                        <a
                          href="#"
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteItem(item.id)}
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
              previousLabel={'Previous'}
              nextLabel={'Next'}
              breakLabel={'...'}
              pageCount={totalPages}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageChange}
              containerClassName={'pagination'}
              pageClassName={'page-item'}
              activeClassName={'active'}
              pageLinkClassName={'page-link'}
              previousClassName={'page-item'}
              previousLinkClassName={'page-link'}
              nextClassName={'page-item'}
              nextLinkClassName={'page-link'}
              breakClassName={'page-item'}
              breakLinkClassName={'page-link'}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default AddDepartment;
