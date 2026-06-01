


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Autosuggest from 'react-autosuggest';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useItems } from './ItemContext'
import Select from 'react-select';


function AddDoctor() {
  // Data and pagination states
  const [data, setData] = useState([]);
  const [suggestedData, getSuggestedData] = useState([]);

  const [hit, setHit] = useState('');


    const [departments, getDepartments] = useState([]);



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
    doctor_name: '',
    price: 0,
    discount: 0,
    rack_no: '',
    formula: '',
    unitType: '',
    gst: 0,
    hidden_id: '',
    medicine_type: 'other',
    alert:0,
    department_id:'',
    department_name:'',
    rates: '',
    specialization:''
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
          suggestion.doctor_name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  // Return the suggestion value
  const getSuggestionValue = suggestion => suggestion.doctor_name;

  // How to render each suggestion
  const renderSuggestion = suggestion => <div>{suggestion.doctor_name}</div>;

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
    placeholder: "Enter Doctor Name",
    value: editFormData.doctor_name,
    onChange: (e, { newValue }) =>
      setEditFormData({ ...editFormData, doctor_name: newValue }),
    // Only add 'is-invalid' if the form has been submitted and the field is empty
    className: `form-control ${submitted && !editFormData.doctor_name ? 'is-invalid' : ''}`,
    id: "doctor_name",
    name: "doctor_name"
  };

  // ---------------------------
  // End of Autosuggest configuration
  // ---------------------------

  // Fetch data from server
  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL+"/doctors", {
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
    axios.get(process.env.REACT_APP_API_URL+"/get-all-doctors-for-suggestion", {
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
      !editFormData.doctor_name || !editFormData.department_id ||
      !editFormData.specialization 
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Proceed with update or insert
    if (editFormData.hidden_id !== "") {
      // Update existing item
      const itemId = editFormData.hidden_id;
      axios.put(`${process.env.REACT_APP_API_URL}/update-doctor/${itemId}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);
          toast.success('Data updated successfully!');
          // Reset submitted state after success
          setSubmitted(false);
          setEditFormData({
            ...editFormData,
            doctor_name: '',
            department_id: '',
            specialization: '',
            hidden_id: '',
            medicine_type: ''
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
        const response = await fetch(process.env.REACT_APP_API_URL+'/insert_doctor', {
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
            doctor_name: '',
            department_id: '',
            specialization: '',
            hidden_id: '',
            medicine_type: ''
          });
          fetchData();
          fetchSuggestionList();
        } else {
          throw new Error('Item Already Exist');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Item Already Exist");
      }
    }
  };



  const editDoctor = (doctor_id) => {
    const doctor_id_get = doctor_id;
    axios.get(`${process.env.REACT_APP_API_URL}/doctor-get/${doctor_id_get}`)
      .then(response => {
        const { id, doctor_name, department_id, specialization, department } = response.data.results[0];
        setEditFormData({
          ...editFormData,
          hidden_id: id,
          doctor_name: doctor_name,
          department_id: department_id, 
          department_name: department, // Set department name if found
          specialization: specialization
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



  const fetchAllDepartments = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL+"/get-all-departments");
        getDepartments(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };
  
    // Fetch items when the provider mounts
    useEffect(() => {
      fetchAllDepartments();
    }, []);

  return (
    <>
      <div className="d-flex">
        {/* --- Medicine Form --- */}
        <div className='col-md-6 p-2'>
          <h5 className='text-warning bg-primary p-2 card-header border'>
            <i className="fas fa-first-aid"></i> Add Doctor Form
          </h5>
          <form className='border p-3' onSubmit={handleSubmit}>
            {/* --------------------
                Autosuggest Name Field
                -------------------- */}
            <div className="form-group row">
              <label htmlFor="doctor_name" className="col-sm-2 col-form-label">Name</label>
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

            <label htmlFor="item_name" className="col-sm-2 col-form-label">Department</label>
              <div className="col-sm-10">
              <Select
  id="department_id"
  name="department_id"
  value={editFormData.department_id ? { value: editFormData.department_id, label: editFormData.department_name } : null}
  options={departments.map(department => ({ value: department.id, label: department.department }))}
  onChange={selectedOption => {
    setEditFormData({
      ...editFormData,
      department_id: selectedOption.value,
      department_name: selectedOption.label,
    });
  }}
  placeholder="Select Department"
/>

              </div>
            </div>

            <div className="form-group row">
            <label htmlFor="specialization" className="col-sm-2 col-form-label">Rates</label>
              <div className="col-sm-10">
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={editFormData.specialization || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                    placeholder="Specialization"
                    className="form-control"
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
                <i className="fas fa-list"></i> Doctors List
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
                  <th>Doctor.Name</th>
                  <th>Special.</th>
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
                      <td>{item.doctor_name}</td>
                      <td>{item.specialization}</td>
                      <td>{item.department}</td>
                      <td className="text-center">
                        <a
                          href="#"
                          className="btn btn-success btn-sm"
                          onClick={() => editDoctor(item.id)}
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

export default AddDoctor;
