
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';


// const PatientRegistration = ({onClose, fetchPatientsInvoice}) => {
//   const [patients, setPatients] = useState([]);
//   const [formData, setFormData] = useState({
//     name: '',
//     age: '',
//     gender: '',
//     contact: '',
//     address: '',
//     relation:'',
//     husbandOrFatherName: '',
//   });
//   const [editingId, setEditingId] = useState(null);

//   // Fetch all patients on component mount
//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   const fetchPatients = async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
//       setPatients(response.data);
//     } catch (error) {
//       console.error('Error fetching patients:', error);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         // Update patient
//         await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editingId}`, formData);
//         setEditingId(null);
//       } else {
//         // Create new patient
//         await axios.post(`${process.env.REACT_APP_API_URL}/patients`, formData);
//       }
//       setFormData({ name: '', age: '', gender: '', contact: '', address: '', husbandOrFatherName: '', relation: '' });
//       fetchPatients();
//       fetchPatientsInvoice();
//     } catch (error) {
//       console.error('Error saving patient:', error);
//     }
//   };

//   const handleEdit = (patient) => {
//     setFormData({
//       name: patient.name,
//       age: patient.age,
//       gender: patient.gender,
//       contact: patient.contact,
//       address: patient.address,
//       husbandOrFatherName: patient.husbandOrFatherName,
//       relation: patient.relation,
//     });
//     setEditingId(patient.mrNo);
//   };

//   const handleDelete = async (mrNo) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_API_URL}/patients/${mrNo}`);
//       fetchPatients();
//     } catch (error) {
//       console.error('Error deleting patient:', error);
//     }
//   };

//   return (
//     <div className="container my-4">
//       <h4 className="display-6 fw-bold text-primary mb-4">Patient Registration</h4>
      
//       <div className="card shadow-sm mb-5">
//         <div className="card-body">
//           <form onSubmit={handleSubmit}>
//             <div className="row g-3">
//               <div className="col-md-6 p-3">
//                 <label htmlFor="name" className="form-label">Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="age" className="form-label">Age</label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   id="age"
//                   name="age"
//                   value={formData.age}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="gender" className="form-label">Gender</label>
//                 <select
//                   className=" form-control"
//                   id="gender"
//                   name="gender"
//                   value={formData.gender}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="contact" className="form-label">Contact</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="contact"
//                   name="contact"
//                   value={formData.contact}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>

//               <div className="col-md-6 p-3">
//                 <label htmlFor="gender" className="form-label">Relation</label>
//                 <select
//                   className=" form-control"
//                   id="relation"
//                   name="relation"
//                   value={formData.relation}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Select Relation</option>
//                   <option>W/O</option>
//                   <option>H/O</option>
//                   <option>S/O</option>
//                   <option>D/O</option>
//                   <option>M/O</option>
//                  <option>F/O</option>
//                 </select>
//               </div>

//               <div className="col-md-6 p-3">
//                 <label htmlFor="husbandOrFatherName" className="form-label">Husband/Father Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="husbandOrFatherName"
//                   name="husbandOrFatherName"
//                   value={formData.husbandOrFatherName}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-12 p-3">
//                 <label htmlFor="address" className="form-label">Address</label>
//                 <textarea
//                   className="form-control"
//                   id="address"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleInputChange}
//                   rows="4"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="mt-4">
//               <button
//                 type="submit"
//                 className="btn btn-primary me-2 mr-3"
//               >
//                 {editingId ? 'Update Patient' : 'Register Patient'}
//               </button>
//               {editingId && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setFormData({ name: '', age: '', gender: '', contact: '', address: '', husbandOrFatherName: '' });
//                     setEditingId(null);
//                   }}
//                   className="btn btn-secondary"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>

//       <h5 className="h4 fw-bold text-primary mb-3">Patient Records</h5>
//       <div className="table-responsive">
//         <table className="table table-bordered">
//           <thead className="table-primary">
//             <tr>
//               <th scope="col">MR No</th>
//               <th scope="col">Name</th>
//               <th scope="col">Age</th>
//               <th scope="col">Gender</th>
//               <th scope="col">Contact</th>
//               <th scope="col">Husband/Father Name</th>
//               <th scope="col">Address</th>
//               <th scope="col">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {patients.map((patient) => (
//               <tr key={patient.mrNo}>
//                 <td>{patient.mrNo}</td>
//                 <td>{patient.name}</td>
//                 <td>{patient.age}</td>
//                 <td>{patient.gender}</td>
//                 <td>{patient.contact}</td>
//                 <td>{patient.husbandOrFatherName}</td>
//                 <td>{patient.address}</td>
//                 <td>
//                   <button
//                     onClick={() => handleEdit(patient)}
//                     className="btn btn-warning btn-sm me-2 mr-2"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(patient.mrNo)}
//                     className="btn btn-danger btn-sm"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PatientRegistration;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const PatientRegistration = ({ onClose, fetchPatientsInvoice }) => {
//   const [patients, setPatients] = useState([]); // Ensure initial state is an array
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [limit] = useState(10); // Number of patients per page
//   const [formData, setFormData] = useState({
//     name: '',
//     age: '',
//     gender: '',
//     contact: '',
//     address: '',
//     relation: '',
//     husbandOrFatherName: '',
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [error, setError] = useState(null); // Add state for error handling

//   // Fetch patients based on search term and page
//   useEffect(() => {
//     fetchPatients();
//   }, [currentPage]);

//   const fetchPatients = async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients`, {
//         params: { search: searchTerm, page: currentPage, limit }
//       });
//       // Ensure patients is an array, even if response is malformed
//       setPatients(Array.isArray(response.data.patients) ? response.data.patients : []);
//       setTotalPages(Number(response.data.totalPages) || 1);
//       setError(null); // Clear any previous errors
//     } catch (error) {
//       console.error('Error fetching patients:', error);
//       setPatients([]); // Reset to empty array on error
//       setError('Failed to fetch patients. Please try again later.');
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//  const handleSearchChange = (e) => {
//   const term = e.target.value;
//     setSearchTerm(term);
//     setCurrentPage(1);
// };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         // Update patient
//         await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editingId}`, formData);
//         setEditingId(null);
//       } else {
//         // Create new patient
//         await axios.post(`${process.env.REACT_APP_API_URL}/patients`, formData);
//       }
//       setFormData({ name: '', age: '', gender: '', contact: '', address: '', husbandOrFatherName: '', relation: '' });
//       setCurrentPage(1); // Reset to first page after save
//       fetchPatients();
//       fetchPatientsInvoice();
//       setError(null);
//     } catch (error) {
//       console.error('Error saving patient:', error);
//       setError('Failed to save patient. Please try again.');
//     }
//   };

//   const handleEdit = (patient) => {
//     setFormData({
//       name: patient.name || '',
//       age: patient.age || '',
//       gender: patient.gender || '',
//       contact: patient.contact || '',
//       address: patient.address || '',
//       husbandOrFatherName: patient.husbandOrFatherName || '',
//       relation: patient.relation || '',
//     });
//     setEditingId(patient.mrNo);
//   };

//   const handleDelete = async (mrNo) => {
//     try {
//       await axios.delete(`${process.env.REACT_APP_API_URL}/patients/${mrNo}`);
//       fetchPatients();
//       setError(null);
//     } catch (error) {
//       console.error('Error deleting patient:', error);
//       setError('Failed to delete patient. Please try again.');
//     }
//   };

//   return (
//     <div className="container my-4">
//       <h4 className="display-6 fw-bold text-primary mb-4">Patient Registration</h4>
      
//       {error && (
//         <div className="alert alert-danger" role="alert">
//           {error}
//         </div>
//       )}

//       <div className="card shadow-sm mb-5">
//         <div className="card-body">
//           <form onSubmit={handleSubmit}>
//             <div className="row g-3">
//               <div className="col-md-6 p-3">
//                 <label htmlFor="name" className="form-label">Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="age" className="form-label">Age</label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   id="age"
//                   name="age"
//                   value={formData.age}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="gender" className="form-label">Gender</label>
//                 <select
//                   className="form-control"
//                   id="gender"
//                   name="gender"
//                   value={formData.gender}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="contact" className="form-label">Contact</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="contact"
//                   name="contact"
//                   value={formData.contact}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="relation" className="form-label">Relation</label>
//                 <select
//                   className="form-control"
//                   id="relation"
//                   name="relation"
//                   value={formData.relation}
//                   onChange={handleInputChange}
//                   required
//                 >
//                   <option value="">Select Relation</option>
//                   <option>W/O</option>
//                   <option>H/O</option>
//                   <option>S/O</option>
//                   <option>D/O</option>
//                   <option>M/O</option>
//                   <option>F/O</option>
//                 </select>
//               </div>
//               <div className="col-md-6 p-3">
//                 <label htmlFor="husbandOrFatherName" className="form-label">Husband/Father Name</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="husbandOrFatherName"
//                   name="husbandOrFatherName"
//                   value={formData.husbandOrFatherName}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="col-12 p-3">
//                 <label htmlFor="address" className="form-label">Address</label>
//                 <textarea
//                   className="form-control"
//                   id="address"
//                   name="address"
//                   value={formData.address}
//                   onChange={handleInputChange}
//                   rows="4"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="mt-4">
//               <button
//                 type="submit"
//                 className="btn btn-primary me-2 mr-3"
//               >
//                 {editingId ? 'Update Patient' : 'Register Patient'}
//               </button>
//               {editingId && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setFormData({ name: '', age: '', gender: '', contact: '', address: '', husbandOrFatherName: '', relation: '' });
//                     setEditingId(null);
//                   }}
//                   className="btn btn-secondary"
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>

//       <h5 className="h4 fw-bold text-primary mb-3">Patient Records</h5>
//       <div className="mb-3">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Search by name, age, gender, contact, or address..."
//           value={searchTerm}
//           onChange={handleSearchChange}
//         />
//       </div>
//       <div className="table-responsive">
//         <table className="table table-bordered">
//           <thead className="table-primary">
//             <tr>
//               <th scope="col">MR No</th>
//               <th scope="col">Name</th>
//               <th scope="col">Age</th>
//               <th scope="col">Gender</th>
//               <th scope="col">Contact</th>
//               <th scope="col">Husband/Father Name</th>
//               <th scope="col">Address</th>
//               <th scope="col">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {patients.length > 0 ? (
//               patients.map((patient) => (
//                 <tr key={patient.mrNo}>
//                   <td>{patient.mrNo}</td>
//                   <td>{patient.name}</td>
//                   <td>{patient.age}</td>
//                   <td>{patient.gender}</td>
//                   <td>{patient.contact}</td>
//                   <td>{patient.husbandOrFatherName}</td>
//                   <td>{patient.address}</td>
//                   <td>
//                     <button
//                       onClick={() => handleEdit(patient)}
//                       className="btn btn-warning btn-sm me-2 mr-2"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(patient.mrNo)}
//                       className="btn btn-danger btn-sm"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" className="text-center">No patients found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       <div className="d-flex justify-content-between align-items-center mt-3">
//         <button
//           className="btn btn-outline-primary"
//           disabled={currentPage === 1}
//           onClick={() => handlePageChange(currentPage - 1)}
//         >
//           Previous
//         </button>
//         <span>Page {currentPage} of {totalPages}</span>
//         <button
//           className="btn btn-outline-primary"
//           disabled={currentPage === totalPages}
//           onClick={() => handlePageChange(currentPage + 1)}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PatientRegistration;



import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientRegistration = ({ onClose, fetchPatientsInvoice }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
    relation: '',
    husbandOrFatherName: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients`, {
        params: { search: searchTerm, page: currentPage, limit }
      });
      setPatients(Array.isArray(response.data.patients) ? response.data.patients : []);
      setTotalPages(Number(response.data.totalPages) || 1);
      setError(null);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setError('Failed to fetch patients. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1); // Reset to first page on new search
      fetchPatients();
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/patients`, formData);
      }
      setFormData({ name: '', age: '', gender: '', contact: '', address: '', husbandOrFatherName: '', relation: '' });
      setCurrentPage(1);
      fetchPatients();
      fetchPatientsInvoice();
      setError(null);
    } catch (error) {
      console.error('Error saving patient:', error);
      setError('Failed to save patient. Please try again.');
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || '',
      contact: patient.contact || '',
      address: patient.address || '',
      husbandOrFatherName: patient.husbandOrFatherName || '',
      relation: patient.relation || '',
    });
    setEditingId(patient.mrNo);
  };

  const handleDelete = async (mrNo) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/patients/${mrNo}`);
      fetchPatients();
      setError(null);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient. Please try again.');
    }
  };

  return (
    <div className="container my-4">
      <h4 className="display-6 fw-bold text-primary mb-4">Patient Registration</h4>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow-sm mb-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6 p-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 p-3">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 p-3">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  className="form-control"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6 p-3">
                <label htmlFor="contact" className="form-label">Contact</label>
                <input
                  type="text"
                  className="form-control"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 p-3">
                <label htmlFor="relation" className="form-label">Relation</label>
                <select
                  className="form-control"
                  id="relation"
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Relation</option>
                  <option>W/O</option>
                  <option>H/O</option>
                  <option>S/O</option>
                  <option>D/O</option>
                  <option>M/O</option>
                  <option>F/O</option>
                </select>
              </div>
              <div className="col-md-6 p-3">
                <label htmlFor="husbandOrFatherName" className="form-label">Husband/Father Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="husbandOrFatherName"
                  name="husbandOrFatherName"
                  value={formData.husbandOrFatherName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-12 p-3">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary me-2 mr-3"
              >
                {editingId ? 'Update Patient' : 'Register Patient'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', age: '', gender: '', contact: '', address: '', husbandOrFatherName: '', relation: '' });
                    setEditingId(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <h5 className="h4 fw-bold text-primary mb-3">Patient Records</h5>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, age, gender, contact, or address... (Press Enter to search)"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-primary">
            <tr>
              <th scope="col">MR No</th>
              <th scope="col">Name</th>
              <th scope="col">Age</th>
              <th scope="col">Gender</th>
              <th scope="col">Contact</th>
              <th scope="col">Husband/Father Name</th>
              <th scope="col">Address</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.mrNo}>
                  <td>{patient.mrNo}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.contact}</td>
                  <td>{patient.husbandOrFatherName}</td>
                  <td>{patient.address}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(patient)}
                      className="btn btn-warning btn-sm me-2 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(patient.mrNo)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No patients found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-primary"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-outline-primary"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientRegistration;