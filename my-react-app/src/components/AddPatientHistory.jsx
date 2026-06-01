
// import React, { useEffect, useMemo, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { AuthProvider, useAuth } from "./AuthContext";
// import InvoiceListForPatientHistory from './InvoiceListForPatientHistory';
// import Pharmacy from './Pharmacy';

// const AddPatientHistory = ({ onClose, labTestIdGet, invoiceId, itemData, invoiceData, ViewInvoice }) => {
//   const [history, setHistory] = useState('');
//   const [alreadyExit, setAlreadyExist] = useState(false);
//   const [labTests, setLabTests] = useState([]);
//   const [selectedTests, setSelectedTests] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showEdit, setShow] = useState('');

//   const { user } = useAuth();

//   const [searchTerm, setSearchTerm] = useState('');

// // Add this memoized filter (place it with your other hooks)
// const filteredLabTests = useMemo(() => {
//   if (!searchTerm) return labTests;
//   return labTests.filter(test => 
//     test.lab_test.toLowerCase().includes(searchTerm.toLowerCase())
//   );
// }, [labTests, searchTerm]);

//   // Fetch available lab tests from backend
//   useEffect(() => {
//     const fetchLabTests = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_API_URL}/lab-tests`);
//         setLabTests(response.data.results);

//         // Extract all lab_test_ids from invoiceData
//         const invoiceLabTestIds = invoiceData
//           .filter(item => item.lab_test_id) // Only items with lab_test_id
//           .map(item => item.lab_test_id);
        
//         // Combine with labTestIdGet if provided and not already included
//         const initialSelectedTests = labTestIdGet && !invoiceLabTestIds.includes(labTestIdGet)
//           ? [...invoiceLabTestIds, labTestIdGet]
//           : invoiceLabTestIds;
        
//         setSelectedTests(initialSelectedTests);
//       } catch (error) {
//         toast.error('Failed to fetch lab tests');
//         console.error('Error fetching lab tests:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLabTests();
//   }, [labTestIdGet, invoiceData]);




//   useEffect(() => {
//     const fetchLabTests = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/get-patient-history-already-exit/${itemData.id}`
//         );
//         console.log(response.data.results);
//         setHistory(response.data.results[0]?.patient_history);
//         if(response.data.results.length>0){
//           setAlreadyExist(true);
//         }
//       } catch (error) {
//         toast.error("Failed to fetch lab tests");
//         console.error("Error fetching lab tests:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchLabTests();
//   }, [invoiceId, user.user.user_id]);




//    const fetchPatientMedicine = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/get-medicine-of-patients/${itemData.id}/${itemData.patient_id}`
//         );
//         console.log(response.data.results, "Medicine of Patient");
       
//       } catch (error) {
//         toast.error("Failed to fetch lab tests");
//         console.error("Error fetching lab tests:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };


//    useEffect(() => {
//     fetchPatientMedicine();
//   }, [invoiceId, user.user.user_id]);


//   // Handle test selection
//   const handleTestSelect = (testId) => {
//     setSelectedTests(prev => 
//       prev.includes(testId) 
//         ? prev.filter(id => id !== testId) 
//         : [...prev, testId]
//     );
//   };

//   // Handle form submission
//     // Handle form submission

//     // console.log("Existing Tests:", invoiceData);
   

//     // Handle form submission
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setIsSubmitting(true);
  
//   try {
//     // Get all test IDs from the invoice
//     const invoiceTestIds = invoiceData
//       .filter(item => item.lab_test_id)
//       .map(item => item.lab_test_id);

//     // Separate selected tests into existing and new
//     const existingTests = selectedTests
//       .filter(testId => invoiceTestIds.includes(testId))
//       .map(testId => ({
//         id: testId,
//         type: 'existing'
//       }));

//     const newTests = selectedTests
//       .filter(testId => !invoiceTestIds.includes(testId))
//       .map(testId => {
//         // Find the full test details from labTests array
//         const testDetails = labTests.find(test => test.lab_test_table_id === testId);
//         return {
//           id: testDetails.id,
//           type: 'new_test',
//           price: testDetails ? testDetails.price : '0', // Default to '0' if price not found
//           test_name: testDetails ? testDetails.lab_test : '' // Include test name if needed
//         };
//       });


      

//     const payload = {
//       //this is invoice table id
//       patientId: itemData.id,
//       //this is registerater patient id
//       patient_id:itemData.patient_id,
//       invoice_no: invoiceData[0].invoice_no,
//       phone_no: invoiceData[0].contact,
//       full_name: invoiceData[0].patient_name,
//       age: invoiceData[0].age,
//       weight: invoiceData[0].weight,
//       bp: invoiceData[0].bp,
//       invoice_date: invoiceData[0].invoice_date,
//       labTestIds: newTests, // Send only new tests with their prices
//       existingTestIds: existingTests, // Send existing tests separately if needed
//       history,
//       date: new Date().toISOString(),
//       user_id: user.user.user_id,
//       alreadyExit:alreadyExit,
//       patient_id: invoiceData[0].patient_id
     
//     };

//     await axios.post(`${process.env.REACT_APP_API_URL}/patient-history-insert-with-test`, payload);
//     toast.success('Lab results saved successfully!');
//     ViewInvoice(invoiceData[0].invoice_no);
//   } catch (error) {
//     toast.error('Failed to save lab results');
//     console.error('Error saving lab results:', error);
//   } finally {
//     setIsSubmitting(false);
//   }
// };


//   // Text editor modules configuration
//   const modules = {
//     toolbar: [
//       [{ 'header': [1, 2, 3, false] }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//       ['link'],
//       ['clean']
//     ],
//   };

//   // Get all test names from the invoice for display
//   const invoiceTestNames = invoiceData
//     .filter(item => item.lab_test_id)
//     .map(item => item.item_name)
//     .join(', ');


//     function getPrevousHistory(phone_no){
//       setShow('previous_history');
//     }
    

//     function AddMedicine(){
//     setShow('pharmacy');
//   }


//   return (
//     <div className="p-3">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="text-primary">Patient History</h5>
//         <div>

       
//         <button
//           className="btn btn-sm btn-warning mr-2"
//           onClick={() => getPrevousHistory(invoiceData[0].phone_no)}
         
//         >
//           <i className="fas fa-scroll"></i> Previous History
//         </button>

//          <button
//          className='btn btn-sm btn-warning'
//             onClick={AddMedicine}
//           >
//             <i className="fas fa-plus"></i> Add Medicine
//           </button>
//            </div>
//       </div>

//       <form onSubmit={handleSubmit}>
//         {/* Patient Info Section */}
//         <div className="card mb-3">
//           <div className="card-header bg-light">
//             <h6 className="mb-0">Patient Information</h6>
//           </div>
//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-6">
//                 <p>
//                   <strong>Name:</strong> {itemData.patient_name}
//                 </p>
//                 <p>
//                   <strong>Age:</strong> {itemData.patient_age || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Weight:</strong> {itemData.weight || "N/A"}
//                 </p>
//                 <p>
//                   <strong>BP:</strong> {itemData.bp || "N/A"}
//                 </p>
//               </div>
//               <div className="col-md-6">
//                 <p>
//                   <strong>Invoice #:</strong> {itemData.invoice_no}
//                 </p>
//                 <p>
//                   <strong>Date:</strong>{" "}
//                   {new Date(itemData.invoice_date).toLocaleDateString()}
//                 </p>
//                 <p>
//                   <strong>Tests in Invoice:</strong> {invoiceTestNames}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Patient History Editor */}
//         <div className="card mb-3">
//           <div className="card-header bg-light">
//             <h6 className="mb-0">Patient History</h6>
//           </div>
//           <div className="card-body">
//             <ReactQuill
//               theme="snow"
//               value={history}
//               onChange={setHistory}
//               modules={modules}
//               placeholder="Enter patient history and observations..."
//               style={{ height: "200px", marginBottom: "50px" }}
//             />
//           </div>
//         </div>

//         {/* Lab Tests Selection */}
//         <div className="card mb-4">
//           <div className="card-header bg-light d-flex justify-content-between align-items-center">
//             <h6 className="mb-0">Select Patient Tests</h6>
          
//             {isLoading && (
//               <span className="spinner-border spinner-border-sm"></span>
//             )}
//           </div>
//             <div className="p-2 pb-0">
//   <input
//     type="text"
//     className="form-control"
//     placeholder="Search patient tests..."
//     value={searchTerm}
//     onChange={(e) => setSearchTerm(e.target.value)}
//   />
// </div>
//           <div className="card-body">
//             {isLoading ? (
//               <div className="text-center py-3">
//                   <span>Loading...</span>
//               </div>
//             ) : (
//               <div className="row">
                
//                 {filteredLabTests.length > 0 ? (
//   filteredLabTests.map((test) => {
//     const isInInvoice = invoiceData.some(
//       (item) => item.lab_test_id === test.lab_test_table_id
//     );
//     return (
//       <div key={test.id} className="col-md-4 mb-2">
//         <div className="form-check">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             id={`test-${test.id}`}
//             checked={selectedTests.includes(test.lab_test_table_id)}
//             onChange={() => handleTestSelect(test.lab_test_table_id)}
//           />
//           <label className="form-check-label" htmlFor={`test-${test.id}`}>
//             {test.lab_test}
//           </label>
//         </div>
//       </div>
//     );
//   })
// ) : (
//   <div className="col-12 text-center py-3">
//     <p>No lab tests found matching your search.</p>
//   </div>
// )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="d-flex justify-content-end gap-2">
//           {user.user.user_type == "Doctor" && (
//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-1"></span>
//                   Saving...
//                 </>
//               ) : (
//                 "Save Results"
//               )}
//             </button>
//           )}
//         </div>
//       </form>




//       {showEdit === "pharmacy" && (
//               <>
//                 <div
//                   style={{
//                     position: "fixed",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     backgroundColor: "rgba(0,0,0,0.5)",
//                     zIndex: 2000,
//                   }}
//                   onClick={() => setShow(false)}
//                 ></div>
//                 <div
//                   style={{
//                     position: "fixed",
//                     top: "50%",
//                     left: "50%",
//                     transform: "translate(-50%, -50%)",
//                     zIndex: 2000,
//                     backgroundColor: "#fff",
//                     padding: "5px",
//                     width: "100%",
//                     height: "100%",
//                     overflowY: "auto",
//                     boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//                   }}
//                 >
//                   <div className="d-flex justify-content-end sticky-top">
//                     <button
//                       className="btn btn-primary mb-2"
//                       onClick={() => setShow(false)}
//                     >
//                       x
//                     </button>
//                   </div>
//                   <Pharmacy
//                     onClose={() => setShow(false)}
//                     invoiceNo={itemData.invoice_no}
//                     patientId={itemData.patient_id}
//                     doctorID = {itemData.id}
//                   />
//                 </div>
//               </>
//             )}

//       {showEdit == "previous_history" && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             zIndex: 2000,
//             backgroundColor: "#fff",
//             padding: "10px",
//             border: "1px solid #ccc",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             width: "100%",
//             height: "100%", // Set a max height to make sure it scrolls when content overflows
//             overflowY: "auto", // Allows vertical scrolling when content overflows
//             overflowX: "hidden", // Optionally, hide horizontal scrolling
//           }}
//         >
//           {/* A close button to hide the Edit component */}
//           <div className="d-flex justify-content-end">
//             <button
//               className="btn btn-primary mr-2 mb-2"
//               onClick={() => setShow(false)}
//             >
//               x
//             </button>
//           </div>
//           <InvoiceListForPatientHistory
//             getSearch={invoiceData[0].patient_id}
//             onClose={() => setShow(false)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddPatientHistory;



import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AuthProvider, useAuth } from "./AuthContext";
import InvoiceListForPatientHistory from './InvoiceListForPatientHistory';
import Pharmacy from './Pharmacy';

const AddPatientHistory = ({ onClose, labTestIdGet, invoiceId, itemData, invoiceData, ViewInvoice, setComponent, checkComponent }) => {
  const [history, setHistory] = useState('');
  const [alreadyExit, setAlreadyExist] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEdit, setShow] = useState('');
  const [patientMedicines, setPatientMedicines] = useState([]);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLabTests = useMemo(() => {
    if (!searchTerm) return labTests;
    return labTests.filter(test => 
      test.lab_test.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [labTests, searchTerm]);

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/lab-tests`);
        setLabTests(response.data.results);

        const invoiceLabTestIds = invoiceData
          .filter(item => item.lab_test_id)
          .map(item => item.lab_test_id);
        
        const initialSelectedTests = labTestIdGet && !invoiceLabTestIds.includes(labTestIdGet)
          ? [...invoiceLabTestIds, labTestIdGet]
          : invoiceLabTestIds;
        
        setSelectedTests(initialSelectedTests);
      } catch (error) {
        toast.error('Failed to fetch lab tests');
        console.error('Error fetching lab tests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabTests();
  }, [labTestIdGet, invoiceData]);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/get-patient-history-already-exit/${itemData.id}`
        );
        setHistory(response.data.results[0]?.patient_history);
        if (response.data.results.length > 0) {
          setAlreadyExist(true);
        }
      } catch (error) {
        toast.error("Failed to fetch patient history");
        console.error("Error fetching patient history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientHistory();
  }, [invoiceId, user.user.user_id]);

  const fetchPatientMedicine = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-medicine-of-patients/${itemData.id}/${itemData.patient_id}`
      );
      setPatientMedicines(response.data.results);
      console.log(response.data.results, "Medicine of Patient");
    } catch (error) {
      toast.error("Failed to fetch patient medicines");
      console.error("Error fetching patient medicines:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientMedicine();
  }, [invoiceId, user.user.user_id]);

  const handleTestSelect = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId) 
        : [...prev, testId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const invoiceTestIds = invoiceData
        .filter(item => item.lab_test_id)
        .map(item => item.lab_test_id);

      const existingTests = selectedTests
        .filter(testId => invoiceTestIds.includes(testId))
        .map(testId => ({
          id: testId,
          type: 'existing'
        }));

      const newTests = selectedTests
        .filter(testId => !invoiceTestIds.includes(testId))
        .map(testId => {
          const testDetails = labTests.find(test => test.lab_test_table_id === testId);
          return {
            id: testDetails.id,
            type: 'new_test',
            price: testDetails ? testDetails.price : '0',
            test_name: testDetails ? testDetails.lab_test : ''
          };
        });

      const payload = {
        patientId: itemData.id,
        patient_id: itemData.patient_id,
        invoice_no: invoiceData[0].invoice_no,
        phone_no: invoiceData[0].contact,
        full_name: invoiceData[0].patient_name,
        age: invoiceData[0].age,
        weight: invoiceData[0].weight,
        bp: invoiceData[0].bp,
        invoice_date: invoiceData[0].invoice_date,
        labTestIds: newTests,
        existingTestIds: existingTests,
        history,
        date: new Date().toISOString(),
        user_id: user.user.user_id,
        alreadyExit: alreadyExit,
        patient_id: invoiceData[0].patient_id
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/patient-history-insert-with-test`, payload);
      toast.success('Lab results saved successfully!');
      ViewInvoice(invoiceData[0].invoice_no);
    } catch (error) {
      toast.error('Failed to save lab results');
      console.error('Error saving lab results:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const invoiceTestNames = invoiceData
    .filter(item => item.lab_test_id)
    .map(item => item.item_name)
    .join(', ');

  function getPrevousHistory(phone_no) {
    setShow('previous_history');
  }

  function AddMedicine() {
    setShow('pharmacy');
  }


   const deleteItem = (id) => {
  axios
    .get(`${process.env.REACT_APP_API_URL}/delete-invoice-item-pharmacy/${id}`)
    .then((response) => {
      // Update the patientMedicines state to remove the deleted medicine
      setPatientMedicines((prev) =>
        prev.filter((medicine) => medicine.id !== id)
      );
      toast.success("Medicine Deleted Successfully!"); // Use toast.success instead of toast.error for consistency
    })
    .catch((error) => {
      toast.error("Failed to delete medicine");
      console.error("Error deleting medicine:", error);
    });
};

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-primary">Patient History</h5>
        <div>
          <button
            className="btn btn-sm btn-warning mr-2"
            onClick={() => getPrevousHistory(invoiceData[0].phone_no)}
          >
            <i className="fas fa-scroll"></i> Previous History
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={AddMedicine}
          >
            <i class="fas fa-pills"></i> Add Medicine
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-3">
          <div className="card-header bg-light">
            <h6 className="mb-0">Patient Information</h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {itemData.patient_name}</p>
                <p><strong>Age:</strong> {itemData.patient_age || "N/A"}</p>
                <p><strong>Weight:</strong> {itemData.weight || "N/A"}</p>
                <p><strong>BP:</strong> {itemData.bp || "N/A"}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Invoice #:</strong> {itemData.invoice_no}</p>
                <p><strong>Date:</strong> {new Date(itemData.invoice_date).toLocaleDateString()}</p>
                <p><strong>Tests in Invoice:</strong> {invoiceTestNames}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header bg-light">
            <h6 className="mb-0">Patient History</h6>
          </div>
          <div className="card-body">
            <ReactQuill
              theme="snow"
              value={history}
              onChange={setHistory}
              modules={modules}
              placeholder="Enter patient history and observations..."
              style={{ height: "200px", marginBottom: "50px" }}
            />
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Select Patient Tests</h6>
            {isLoading && (
              <span className="spinner-border spinner-border-sm"></span>
            )}
          </div>
          <div className="p-2 pb-0">
            <input
              type="text"
              className="form-control"
              placeholder="Search patient tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-3">
                <span>Loading...</span>
              </div>
            ) : (
              <div className="row">
                {filteredLabTests.length > 0 ? (
                  filteredLabTests.map((test) => {
                    const isInInvoice = invoiceData.some(
                      (item) => item.lab_test_id === test.lab_test_table_id
                    );
                    return (
                      <div key={test.id} className="col-md-4 mb-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`test-${test.id}`}
                            checked={selectedTests.includes(test.lab_test_table_id)}
                            onChange={() => handleTestSelect(test.lab_test_table_id)}
                          />
                          <label className="form-check-label" htmlFor={`test-${test.id}`}>
                            {test.lab_test}
                          </label>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-12 text-center py-3">
                    <p>No lab tests found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-light">
            <h6 className="mb-0">Patient Medicines</h6>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-3">
                <span>Loading...</span>
              </div>
            ) : patientMedicines.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Invoice #</th>
                      <th scope="col">Medicine</th>
                      <th scope="col">Quantity</th>
                       <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientMedicines.map((medicine, index) => (
                      <tr key={index}>
                        <td>{medicine.invoice_no}</td>
                        <td>{medicine.items}</td>
                        <td>{medicine.quantity}</td>
                        <td><a className='btn btn-sm btn-danger'   onClick={() => deleteItem(medicine.id)}><i className='fas fa-trash'></i></a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="col-12 text-center py-3">
                <p>No medicines found for this patient.</p>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {user.user.user_type === "Doctor" && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Saving...
                </>
              ) : (
                "Save Results"
              )}
            </button>
          )}
        </div>
      </form>

      {showEdit === "pharmacy" && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 2000,
            }}
            onClick={() => setShow(false)}
          ></div>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2000,
              backgroundColor: "#fff",
              padding: "5px",
              width: "100%",
              height: "100%",
              overflowY: "auto",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-end sticky-top">
              <button
                className="btn btn-primary mb-2"
                // onClick={() => setShow(false)}
                onClick={() => {
                  setShow(false);
                  setComponent('invoice');
                }}
              >
                x
              </button>
            </div>
            <Pharmacy
              onClose={() => setShow(false)}
              invoiceNo={itemData.invoice_no}
              patientId={itemData.patient_id}
              doctorID={itemData.id}
              fetchPatientMedicine={fetchPatientMedicine}
              setComponent = {setComponent}
              checkComponent = {checkComponent}
            />
          </div>
        </>
      )}

      {showEdit === "previous_history" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            width: "100%",
            height: "100%",
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
          <InvoiceListForPatientHistory
            getSearch={invoiceData[0].patient_id}
            onClose={() => setShow(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AddPatientHistory;