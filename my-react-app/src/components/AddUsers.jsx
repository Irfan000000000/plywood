import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useItems } from './ItemContext'
import LabTestHeads from './LabTestHeads';
import Select from "react-select";

function AddUsers() {
  // Data and pagination states
  const [data, setData] = useState([]);
  const [hit, setHit] = useState('');
  const { fetchAllItems } = useItems();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState("");
  const [getCategories, setCategories] = useState([]);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [showEdit, setShowEdit] = useState(null);
  const [itemDetail, getItemDetail] = useState([]);

  // Track whether the user has attempted to submit the form
  const [submitted, setSubmitted] = useState(false);

  const [editFormData, setEditFormData] = useState({
    user_name: "",
    password: "",
    user_type: "",
    user_id: "",
    doctor_name: "",
    hidden_id: "",
  });

  // For items per page
  const [totalItem, setTotalItemGet] = useState(10);

  // Fetch data from server
  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL+"/users", {
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

  // Handle form submission with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if ((!editFormData.user_name || !editFormData.password || !editFormData.user_type)) {
      setSubmitted(true);
      return;
    }
    

    if(editFormData.password.length<6){
      setSubmitted(true);
      toast.error("Password must be at least 6 characters long");
      return;
    }
    // Additional validation for doctor type
    if (editFormData.user_type === "Doctor" && !editFormData.user_id) {
      setSubmitted(true);
      toast.error("Please select a doctor");
      return;
    }

    // Proceed with update or insert
    if (editFormData.hidden_id !== "") {
      // Update existing item
      const itemId = editFormData.hidden_id;
      axios.put(`${process.env.REACT_APP_API_URL}/update-user/${itemId}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);
          toast.success('Data updated successfully!');
          setSubmitted(false);
          setEditFormData({
            user_name: '',
            password: '',
            user_type: '',
            user_id: '',
            doctor_name: '',
            hidden_id: '',
          });
          fetchData();
          fetchAllItems();
        })
        .catch(error => {
          console.error('Error updating data:', error);
          toast.error(error.response.data.error);
        });
    } else {
      // Insert new item
      try {
        const response = await fetch(process.env.REACT_APP_API_URL+'/insert-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Data inserted:", data);
          toast.success('User added successfully!');
          setSubmitted(false);
          setEditFormData({
            user_name: '',
            password: '',
            user_type: '',
            user_id: '',
            doctor_name: '',
            hidden_id: '',
          });
          fetchData();
          fetchAllItems();
        } else {
          throw new Error('User Already Exist');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("User Already Exist");
      }
    }
  };

  const editItem = (item_id_get) => {
    const itemId = item_id_get;
    axios.get(`${process.env.REACT_APP_API_URL}/user-get/${itemId}`)
      .then(response => {
        const { id, user_name, password, user_type, user_id, doctor_name } = response.data.results[0];
        setEditFormData({
          user_name: user_name || '',
          password: password || '',
          user_type: user_type || '',
          user_id: user_id || '',
          doctor_name: doctor_name || '',
          hidden_id: id || ''
        });
        setSubmitted(false);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const deleteItem = (item_id) => {
    let confirm_delete_item = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirm_delete_item) return;

    axios.delete(`${process.env.REACT_APP_API_URL}/delete-user/${item_id}`)
      .then(response => {
        console.log('User deleted successfully:', response.data);
        fetchData();
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  const fetchAllHeads = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "/get-users"
      );
      console.log(response.data.results);
      getItemDetail(response.data.results);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setLoading(false);
    }
  };

  // Fetch doctors when the component mounts or when user_type changes to Doctor
  useEffect(() => {
    if (editFormData.user_type === "Doctor") {
      fetchAllHeads();
    }
  }, [editFormData.user_type]);

  return (
    <>
      <div className="d-flex justify-content-center align-item-center">
        {/* --- User Form --- */}
        <div className='col-md-6 p-2'>
          <h5 className='text-warning bg-primary p-2 card-header border'>
            <i className="fas fa-user-plus"></i> Add Users Form
          </h5>
        
          <form className='border p-3' onSubmit={handleSubmit}>

          <div className="form-group row">
              <label htmlFor="user_type" className="col-sm-2 col-form-label">User Role</label>
              <div className="col-sm-10">
                <select
                  id="user_type"
                  name="user_type"
                  value={editFormData.user_type || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, user_type: e.target.value })}
                  className={`form-control ${submitted && !editFormData.user_type ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="">Select User Type</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
                {submitted && !editFormData.user_type && (
                  <div className="invalid-feedback">User Type is required</div>
                )}
              </div>
            </div>



            
            {editFormData.user_type === "Doctor" && (
              <div className="form-group row">
                <label htmlFor="doctor" className="col-sm-2 col-form-label">
                  Doctor
                </label>
                <div className="col-sm-10">
                  <Select
                    id="user_id"
                    name="user_id"
                    className={`${submitted && !editFormData.user_id ? 'is-invalid' : ''}`}
                    value={
                      editFormData.user_id
                        ? {
                            value: editFormData.user_id,
                            label: editFormData.doctor_name,
                          }
                        : null
                    }
                    options={itemDetail.map((item) => ({
                      value: item.id,
                      label: item.doctor_name,
                    }))}
                    onChange={(selectedOption) => {
                      setEditFormData({
                        ...editFormData,
                        user_id: selectedOption.value,
                        doctor_name: selectedOption.label,
                      });
                    }}
                    placeholder="Select Doctor"
                    required
                  />
                  {submitted && !editFormData.user_id && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>Doctor selection is required</div>
                  )}
                </div>
              </div>
            )}


            <div className="form-group row">
              <label htmlFor="user_name" className="col-sm-2 col-form-label">User Name</label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className={`form-control ${submitted && !editFormData.user_name ? 'is-invalid' : ''}`}
                  id="user_name"
                  name="user_name"
                  value={editFormData.user_name}
                  onChange={(e) => setEditFormData({...editFormData, user_name: e.target.value})}
                  placeholder="Enter User Name"
                  required
                />
                {submitted && !editFormData.user_name && (
                  <div className="invalid-feedback">User Name is required</div>
                )}
              </div>
            </div>

            <div className="form-group row">
              <label htmlFor="password" className="col-sm-2 col-form-label">Password</label>
              <div className="col-sm-10">
                <input
                  type="password"
                  className={`form-control ${submitted && !editFormData.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  placeholder="Enter Password"
                  required
                />
                {submitted && !editFormData.password && (
                  <div className="invalid-feedback">Password is required</div>
                )}
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

        {/* --- User List --- */}
        {/* <div className="col-md-6 p-2">
          <div className="card-header text-warning bg-primary p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-users"></i> Users List
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
                  <th>Username</th>
                  <th>User Type</th>
                  <th>Doctor</th>
                  <th className="text-center">Edit</th>
                  <th className="text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6">Loading...</td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id}</td>
                      <td>{item.user_name}</td>
                      <td>{item.user_type}</td>
                      <td>{item.doctor_name || '-'}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => editItem(item.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
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
        </div> */}
      </div>
    </>
  );
}

export default AddUsers;