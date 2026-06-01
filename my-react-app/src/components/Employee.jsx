import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useDropzone } from 'react-dropzone';

const Employee = () => {
  const initialFormData = {
    employee_name: '',
    dob: '',
    gender: '',
    phone_no: '',
    address: '',
    employee_status: '',
    cnic: '',
    account_no: '',
    employee_image: null,
    hidden_id: ''
  };

  const [editFormData, setEditFormData] = useState(initialFormData);
  const [filePreview, setFilePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItemGet] = useState(10);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, totalPagesGet] = useState("");
  const [loading, setLoading] = useState(true);

  const [report, getAllReports] = useState({
    from_date: '',
    to_date: '',
    report_type: ''
  });




  const [employeeData, setEmployeeData] = useState(null);
  const [showData, setShowData] = useState(false);

  const viewEmployee = (employee_id) => {
    axios.get(`${process.env.REACT_APP_API_URL}/view-employee/${employee_id}`)
      .then(response => {
        setEmployeeData(response.data.results[0]);
        setShowData(true);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleHide = () => {
    setShowData(false);
    setEmployeeData(null);
  };


  function getReport() {
    if (report.report_type === "pdf") {
      // pdfReport();
    } else if (report.report_type === "excel") {
      // excelReport();
    }
  }

  const handleTotalItemChange = (event) => {
    const newValue = event.target.value;
    setTotalItemGet(newValue);
  }

  const editEmployee = (employee_id) => {
    axios.get(`${process.env.REACT_APP_API_URL}/employee-get/${employee_id}`)
      .then(response => {
        const { id, employee_name, dob, gender, phone_no, address, employment_status, cnic, account_no, employee_image } = response.data.results[0];

        const formatDate = (dateString) => {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const formattedDob = dob ? formatDate(dob) : '';

        setEditFormData({
          employee_name: employee_name || '',
          dob: formattedDob || '',
          gender: gender || '',
          phone_no: phone_no || '',
          address: address || '',
          employee_status: employment_status || '',
          cnic: cnic || '',
          account_no: account_no || '',
          employee_image: employee_image || '',
          hidden_id: id || '',
        });

        setFilePreview(employee_image ? `${process.env.REACT_APP_API_URL}/uploads/${employee_image}` : '');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }







  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setEditFormData({ ...editFormData, employee_image: file });
    setFilePreview(URL.createObjectURL(file));
  }, [editFormData]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in editFormData) {
      formData.append(key, editFormData[key]);
    }

    try {
      if (editFormData.hidden_id !== "") {
        const employee_id_get = editFormData.hidden_id; // Assuming you have an id field for the item to be updated
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/update-employee/${employee_id_get}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Data updated successfully:', response.data);
      } else {
        const response = await axios.post(process.env.REACT_APP_API_URL+'/submit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Data saved successfully:', response.data);
      }

      setEditFormData(initialFormData);
      setFilePreview(null);
      fetchData();
    } catch (error) {
      console.error('There was an error!', error);
    }
  };




  const deleteEmployee = (employee_id_get) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/delete-employee/${employee_id_get}`)
      .then(response => {
        console.log('Employee deleted successfully:', response.data);
        fetchData();
      })
      .catch(error => {
        console.error('Error deleting employee:', error);
      });


  }

  const updateStatus =  (employee_id_get) => {

  }




  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      getSearchReport(searchReport);
      fetchData();
    }
  };

  const [searchReport, getSearchReport] = useState({
    search: '',
  });

  function searchCategory() {
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem]);

  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL+"/employee-list", {
      params: {
        page: currentPage,
        limit: totalItem,
        search: searchReport.search
      }
    })
      .then(res => {
        setData(res.data.results);
        setTotalCount(0);
        totalPagesGet(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  //   return (
  //     <div className="d-flex">

  // <div>


  // {showData && employeeData && (
  //   <div style={{
  //     border: '1px solid #ddd',
  //     padding: '20px',
  //     position: 'absolute',
  //     left: '0',
  //     right: '0',
  //     top: '0',
  //     bottom: '0',
  //     margin: 'auto',
  //     zIndex: '100',
  //     backdropFilter: 'blur(10px)',
  //     width: '350px',    /* Adjust width as needed */
  //     maxHeight: '80vh', /* Adjust height as needed */
  //     overflowY: 'auto',
  //     backgroundColor: 'white',
  //     borderRadius: '10px',
  //     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  //     textAlign: 'left',  /* Align text to the left inside the div */
  //     display: 'flex',
  //     flexDirection: 'column',
  //     alignItems: 'center'
  //   }}>
  //     <style>
  //       {`
  //         /* Custom scrollbar styles */
  //         div::-webkit-scrollbar {
  //           width: 8px;
  //         }

  //         div::-webkit-scrollbar-track {
  //           background: #f1f1f1;
  //           border-radius: 10px;
  //         }

  //         div::-webkit-scrollbar-thumb {
  //           background: #888;
  //           border-radius: 10px;
  //         }

  //         div::-webkit-scrollbar-thumb:hover {
  //           background: #555;
  //         }
  //       `}
  //     </style>
  //     <button
  //       onClick={handleHide}
  //       style={{
  //         position: 'absolute',
  //         top: '10px',
  //         right: '10px',
  //         background: 'transparent',
  //         border: 'none',
  //         fontSize: '20px',
  //         cursor: 'pointer'
  //       }}
  //     >
  //       &times;
  //     </button>
  //     <div style={{ width: '100%' }}>
  //       <div style={{ marginBottom: '20px', textAlign: 'center' }}>
  //         {employeeData.employee_image && (
  //           <div style={{ marginTop: '10px' }}>
  //             <img src={`${process.env.REACT_APP_API_URL}/uploads/${employeeData.employee_image}`} alt="Employee" style={{width: '80px', borderRadius: '5px' }} />
  //           </div>
  //         )}
  //       </div>

  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Name:</strong> {employeeData.employee_name}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Date of Birth:</strong> {new Date(employeeData.dob).toLocaleDateString()}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Gender:</strong> {employeeData.gender}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Phone Number:</strong> {employeeData.phone_no}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Address:</strong> {employeeData.address}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Employment Status:</strong> {employeeData.employment_status}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>CNIC:</strong> {employeeData.cnic}
  //       </div>
  //       <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
  //         <strong>Account Number:</strong> {employeeData.account_no}
  //       </div>
  //     </div>
  //   </div>
  // )}



  //     </div>


  //       <div className='col-md-6 p-2'>
  //         <h6 className='text-warning bg-primary p-2 card-header border'>
  //           <i className="fas fa-user"></i> Employee Form
  //         </h6>
  //         <form className='border p-3 border-warning' onSubmit={handleSubmit} encType="multipart/form-data">
  //           <div className="form-group row">
  //             <label htmlFor="employee_name" className="col-sm-2 col-form-label">Name</label>
  //             <div className="col-sm-10">
  //               <input type="text" className="form-control" id="employee_name" name='employee_name' value={editFormData.employee_name} onChange={(e) => setEditFormData({ ...editFormData, employee_name: e.target.value })} />
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="dob" className="col-sm-2 col-form-label">DOB</label>
  //             <div className="col-sm-10">
  //               <input type="date" className="form-control" id="dob" name='dob' value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} />
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="gender" className="col-sm-2 col-form-label">Gender</label>
  //             <div className="col-sm-10">
  //               <select name="gender" id="gender" className='form-control' value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}>
  //                 <option value="">Select Gender</option>
  //                 <option>Male</option>
  //                 <option>Female</option>
  //               </select>
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="phone_no" className="col-sm-2 col-form-label">Phone#</label>
  //             <div className="col-sm-10">
  //               <input type="text" className="form-control" id="phone_no" name='phone_no' value={editFormData.phone_no} onChange={(e) => setEditFormData({ ...editFormData, phone_no: e.target.value })} />
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="address" className="col-sm-2 col-form-label">Address</label>
  //             <div className="col-sm-10">
  //               <input type="text" className="form-control" id="address" name='address' value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} />
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="employee_status" className="col-sm-2 col-form-label">Employee&nbsp;Status</label>
  //             <div className="col-sm-10">
  //               <select name="employee_status" id="employee_status" className='form-control' value={editFormData.employee_status} onChange={(e) => setEditFormData({ ...editFormData, employee_status: e.target.value })}>
  //                 <option value="">Select Employment Job Status</option>
  //                 <option>Full Time</option>
  //                 <option>Part Time</option>
  //                 <option>Temporary</option>
  //               </select>
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="cnic" className="col-sm-2 col-form-label">CNIC</label>
  //             <div className="col-sm-10">
  //               <input type="text" className="form-control" id="cnic" name='cnic' value={editFormData.cnic} onChange={(e) => setEditFormData({ ...editFormData, cnic: e.target.value })} />
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="account_no" className="col-sm-2 col-form-label">Account#</label>
  //             <div className="col-sm-10">
  //               <input type="text" className="form-control" id="account_no" name='account_no' value={editFormData.account_no} onChange={(e) => setEditFormData({ ...editFormData, account_no: e.target.value })} />
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label htmlFor="employee_image" className="col-sm-2 col-form-label">Image</label>
  //             <div className="col-sm-10">
  //               <div {...getRootProps({ className: 'dropzone' })} className="border p-3 text-center drag_image_zone">
  //                 <input {...getInputProps()} />
  //                 {filePreview ? (
  //                   <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
  //                 ) : (
  //                   <p>Drag & Drop an image here, or Click to Select an Image</p>
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //           <div className="form-group row">
  //             <label className="col-sm-2 col-form-label"></label>
  //             <div className="col-sm-10 d-flex justify-content-end">
  //               <input type="submit" className='btn btn-sm btn-primary' value={"Save"} />
  //             </div>
  //           </div>
  //         </form>
  //       </div>
  //       <div className='col-md-6 p-2'>
  //         <div className="card-header text-warning bg-primary p-2">
  //           <div className="d-flex justify-content-between align-items-center">
  //             <div>
  //               <i className="fas fa-list"></i> Employee List
  //             </div>
  //             <div className="d-flex">
  //               <div className="me-2 mr-2">
  //                 <input type="text" className="form-control" id="search_category" onKeyDown={handleKeyDown} onChange={(e) => getSearchReport({ ...searchReport, search: e.target.value })} />
  //               </div>
  //               <button className="btn btn-sm btn-danger" onClick={searchCategory}>Search</button>
  //             </div>
  //             <div className="d-none">
  //               <div className="me-2 mr-2">
  //                 <input type="date" className="form-control" id="from_date" onChange={(e) => getAllReports({ ...report, from_date: e.target.value })} />
  //               </div>
  //               <div className="me-2 mr-2">
  //                 <input type="date" className="form-control" id="to_date" onChange={(e) => getAllReports({ ...report, to_date: e.target.value })} />
  //               </div>
  //               <div className="me-2 mr-2">
  //                 <select name="type" id="type" className="form-control" onChange={(e) => getAllReports({ ...report, report_type: e.target.value })}>
  //                   <option value="">Select Type</option>
  //                   <option value="excel">Excel</option>
  //                   <option value="pdf">PDF</option>
  //                 </select>
  //               </div>
  //               <button className="btn btn-sm btn-danger" onClick={getReport}>Get Report</button>
  //             </div>
  //           </div>
  //         </div>
  //         <div className='border p-2'>
  //           <div className='pb-3'>
  //             <select value={totalItem} onChange={handleTotalItemChange}>
  //               <option value="10">10</option>
  //               <option value="20">20</option>
  //               <option value="30">30</option>
  //               <option value="40">40</option>
  //               <option value="50">50</option>
  //             </select>
  //           </div>
  //           <table className='table'>
  //             <thead>
  //               <tr>
  //                 <th>ID</th>
  //                 <th>Name</th>
  //                 <th>Phone#</th>
  //                 <th>Job_Status</th>
  //                 <th>CNIC#</th>
  //                 <th className='text-center'>View</th>
  //                 <th className='text-center'>Edit</th>
  //                 <th className='text-center'>Delete</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {loading ? (
  //                 <tr>
  //                   <td colSpan="4">Loading...</td>
  //                 </tr>
  //               ) : (
  //                 data.map((employee, index) => (
  //                   <tr key={index}>
  //                     <td>{employee.id}</td>
  //                     <td>{employee.employee_name}</td>
  //                     <td>{employee.phone_no}</td>
  //                     <td>{employee.employment_status}</td>
  //                     <td>{employee.cnic}</td>
  //                     <td className='text-center'>
  //                       <div><a href="#" className='btn btn-warning btn-sm' onClick={() => viewEmployee(employee.id)} ><i className="fas fa-eye icon"></i></a></div>
  //                     </td>
  //                     <td className='text-center'>
  //                       <div><a href="#" className='btn btn-success btn-sm' onClick={() => editEmployee(employee.id)} ><i className="fas fa-edit"></i></a></div>
  //                     </td>
  //                     <td className='text-center'>
  //                       <div><a href="#" className='btn btn-danger btn-sm' onClick={() => deleteEmployee(employee.id)}><i className="fas fa-trash-alt"></i></a></div>
  //                     </td>
  //                   </tr>
  //                 ))
  //               )}
  //             </tbody>
  //           </table>
  //           <ReactPaginate
  //             previousLabel={'Previous'}
  //             nextLabel={'Next'}
  //             breakLabel={'...'}
  //             pageCount={totalPages}
  //             marginPagesDisplayed={2}
  //             pageRangeDisplayed={3}
  //             onPageChange={handlePageChange}
  //             containerClassName={'pagination'}
  //             pageClassName={'page-item'}
  //             activeClassName={'active'}
  //             pageLinkClassName={'page-link'}
  //             previousClassName={'page-item'}
  //             previousLinkClassName={'page-link'}
  //             nextClassName={'page-item'}
  //             nextLinkClassName={'page-link'}
  //             breakClassName={'page-item'}
  //             breakLinkClassName={'page-link'}
  //           />
  //         </div>
  //       </div>
  //     </div>
  //   );

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-md-6 p-2">
          <h6 className="text-warning bg-primary p-2 card-header border">
            <i className="fas fa-user"></i> Employee Form
          </h6>
          <form className="border p-3 border-warning" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group row">
              <label htmlFor="employee_name" className="col-sm-2 col-form-label">Name</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" id="employee_name" name='employee_name' value={editFormData.employee_name} onChange={(e) => setEditFormData({ ...editFormData, employee_name: e.target.value })} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="dob" className="col-sm-2 col-form-label">DOB</label>
              <div className="col-sm-10">
                <input type="date" className="form-control" id="dob" name='dob' value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="gender" className="col-sm-2 col-form-label">Gender</label>
              <div className="col-sm-10">
                <select name="gender" id="gender" className='form-control' value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="phone_no" className="col-sm-2 col-form-label">Phone#</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" id="phone_no" name='phone_no' value={editFormData.phone_no} onChange={(e) => setEditFormData({ ...editFormData, phone_no: e.target.value })} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="address" className="col-sm-2 col-form-label">Address</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" id="address" name='address' value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="employee_status" className="col-sm-2 col-form-label">Employee Status</label>
              <div className="col-sm-10">
                <select name="employee_status" id="employee_status" className='form-control' value={editFormData.employee_status} onChange={(e) => setEditFormData({ ...editFormData, employee_status: e.target.value })}>
                  <option value="">Select Employment Job Status</option>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Temporary</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="cnic" className="col-sm-2 col-form-label">CNIC</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" id="cnic" name='cnic' value={editFormData.cnic} onChange={(e) => setEditFormData({ ...editFormData, cnic: e.target.value })} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="account_no" className="col-sm-2 col-form-label">Account#</label>
              <div className="col-sm-10">
                <input type="text" className="form-control" id="account_no" name='account_no' value={editFormData.account_no} onChange={(e) => setEditFormData({ ...editFormData, account_no: e.target.value })} />
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="employee_image" className="col-sm-2 col-form-label">Image</label>
              <div className="col-sm-10">
                <div {...getRootProps({ className: 'dropzone' })} className="border p-3 text-center drag_image_zone">
                  <input {...getInputProps()} />
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                  ) : (
                    <p>Drag & Drop an image here, or Click to Select an Image</p>
                  )}
                </div>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-sm-2 col-form-label"></label>
              <div className="col-sm-10 d-flex justify-content-end">
                <input type="submit" className='btn btn-sm btn-primary' value={"Save"} />
              </div>
            </div>
          </form>
        </div>
        <div className="col-12 col-md-6 p-2">
          <div className="card-header text-warning bg-primary p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-list"></i> Employee List
              </div>
              <div className="d-flex">
                <div className="me-2 mr-2">
                  <input type="text" className="form-control" id="search_category" onKeyDown={handleKeyDown} onChange={(e) => getSearchReport({ ...searchReport, search: e.target.value })} />
                </div>
                <button className="btn btn-sm btn-danger" onClick={searchCategory}>Search</button>
              </div>
              <div className="d-none">
                <div className="me-2 mr-2">
                  <input type="date" className="form-control" id="from_date" onChange={(e) => getAllReports({ ...report, from_date: e.target.value })} />
                </div>
                <div className="me-2 mr-2">
                  <input type="date" className="form-control" id="to_date" onChange={(e) => getAllReports({ ...report, to_date: e.target.value })} />
                </div>
                <div className="me-2 mr-2">
                  <select name="type" id="type" className="form-control" onChange={(e) => getAllReports({ ...report, report_type: e.target.value })}>
                    <option value="">Select Type</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <button className="btn btn-sm btn-danger" onClick={getReport}>Get Report</button>
              </div>
            </div>
          </div>
          <div className='border p-2'>
            <div className='pb-3'>
              <select value={totalItem} onChange={handleTotalItemChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>
            <table className='table'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone#</th>
                  <th>Job_Status</th>
                  <th>CNIC#</th>
                  <th>Status</th>
                  <th className='text-center'>View</th>
                  <th className='text-center'>Edit</th>
                  <th className='text-center'>Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">Loading...</td>
                  </tr>
                ) : (
                  data.map((employee, index) => (
                    <tr key={index}>
                      <td>{employee.id}</td>
                      <td>{employee.employee_name}</td>
                      <td>{employee.phone_no}</td>
                      <td>{employee.employment_status}</td>
                      <td>{employee.cnic}</td>
                      <td className='text-center'>

                        {employee.status === 1 &&   <button className='btn btn-success btn-sm' onClick={() => updateStatus(employee.id)}><i class="fas fa-check-circle"></i></button> }
                        {employee.status === 0 &&   <button className='btn btn-danger btn-sm' onClick={() => updateStatus(employee.id)}><i class="fas fa-exclamation-circle"></i></button> }

                      </td>

                      <td className='text-center'>
                        <button className='btn btn-warning btn-sm' onClick={() => viewEmployee(employee.id)}><i className="fas fa-eye icon"></i></button>
                      </td>
                      <td className='text-center'>
                        <button className='btn btn-success btn-sm' onClick={() => editEmployee(employee.id)}><i className="fas fa-edit"></i></button>
                      </td>
                      <td className='text-center'>
                        <button className='btn btn-danger btn-sm' onClick={() => deleteEmployee(employee.id)}><i className="fas fa-trash-alt"></i></button>
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
        {showData && employeeData && (
          <div className="col-12">
            <div style={{
              border: '1px solid #ddd',
              padding: '20px',
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: '100',
              backdropFilter: 'blur(10px)',
              width: '350px',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <style>
                {`
                /* Custom scrollbar styles */
                div::-webkit-scrollbar {
                  width: 8px;
                }

                div::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }

                div::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 10px;
                }

                div::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
              `}
              </style>
              <button
                onClick={handleHide}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
              <div style={{ width: '100%' }}>
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  {employeeData.employee_image && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={`${process.env.REACT_APP_API_URL}/uploads/${employeeData.employee_image}`} alt="Employee" style={{ width: '80px', borderRadius: '5px' }} />
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Name:</strong> {employeeData.employee_name}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Date of Birth:</strong> {new Date(employeeData.dob).toLocaleDateString()}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Gender:</strong> {employeeData.gender}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Phone Number:</strong> {employeeData.phone_no}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Address:</strong> {employeeData.address}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Employment Status:</strong> {employeeData.employment_status}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>CNIC:</strong> {employeeData.cnic}
                </div>
                <div style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <strong>Account Number:</strong> {employeeData.account_no}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );


};

export default Employee;
