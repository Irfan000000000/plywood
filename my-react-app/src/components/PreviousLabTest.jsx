


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import AddLabTestResult from "./AddLabTestResult";
// import ViewLabTestResults from "./ViewLabTestResults";
// import Pharmacy from "./Pharmacy"; 
// import { useAuth } from "./AuthContext";
// import axios from "axios";
// import PropTypes from "prop-types";

// const PreviousLabTest = ({ onClose, patientId, invoiceData = [] }) => {
//   const [updatedInvoiceData, setUpdatedInvoiceData] = useState(invoiceData);
//   const [previousLabHistory, setPreviousLabHistory] = useState([]);
//   const [showEdit, setShowEdit] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [selectedLabTests, setSelectedLabTests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { user } = useAuth();

//   const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000"; // Fallback URL

//   useEffect(() => {
//     if (!invoiceData || !invoiceData[0]?.patient_id) {
//       toast.error("Invalid or missing patient data.");
//       return;
//     }

//     const fetchPreviousLabHistory = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(`${apiUrl}/view-previous-lab-test`, {
//           params: { patient_id: invoiceData[0].patient_id },
//         });
//         setPreviousLabHistory(response.data.results || []);
//       } catch (err) {
//         console.error("Error fetching lab history:", err);
//         setError("Failed to fetch previous lab history.");
//         toast.error("Failed to fetch previous lab history.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPreviousLabHistory();
//   }, [invoiceData, apiUrl]);

//   const handleAddDescriptionClick = (item) => {
//     if (item?.lab_test_id && item?.id) {
//       setSelectedItem(item);
//       setShowEdit("add_lab_test_results");
//     } else {
//       toast.error("Invalid lab test selection.");
//     }
//   };


//   const formatDate = (dateString) => {
//   if (!dateString) return "N/A"; // Handle missing date

//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date

//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   } catch (error) {
//     console.error("Error formatting date:", error);
//     return "Invalid Date";
//   }
// };


//   const viewResults = () => {
//     if (selectedLabTests.length === 0) {
//       toast.error("Please select at least one lab test to view results.");
//       return;
//     }
//     setShowEdit("view_result");
//   };

//   const handleCheckboxChange = (item) => {
//     setSelectedLabTests((prev) => {
//       const isSelected = prev.some(
//         (selected) => selected.id === item.id && selected.lab_test_id === item.lab_test_id
//       );
//       if (isSelected) {
//         return prev.filter(
//           (selected) => !(selected.id === item.id && selected.lab_test_id === item.lab_test_id)
//         );
//       }
//       return [...prev, item];
//     });
//   };

//   const patientDetails = updatedInvoiceData[0]
//     ? {
//         name: updatedInvoiceData[0].patient_name || updatedInvoiceData[0].full_name || "N/A",
//         age: updatedInvoiceData[0].patient_age || updatedInvoiceData[0].age || "N/A",
//         gender: previousLabHistory[0]?.gender || "N/A",
//         relation: previousLabHistory[0]?.relation || "",
//         husbandOrFatherName: previousLabHistory[0]?.husbandOrFatherName || "",
//       }
//     : null;

//   return (
//     <div style={overlayStyle}>
//       <div style={modalStyle}>
//         <div style={headerStyle}>
//           <h5 style={{ color: "#007bff" }}>Patient Lab History</h5>
//           <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
//             ×
//           </button>
//         </div>

//         <div style={clinicInfoStyle}>
//           <h5 style={{ color: "#007bff" }}>Rehman Medical Center</h5>
//           <p style={clinicDetailStyle}>
//             <i className="fas fa-map-marker-alt"></i> Yum Backers wali Gali, P 15/3 End Lane.2 Lala Rukh Wah Cantt
//           </p>
//           <p style={clinicDetailStyle}>
//             <i className="fas fa-phone-alt"></i> +92 333 956 80 94
//           </p>
//         </div>

//         {patientDetails && (
//           <div style={infoContainerStyle}>
//             <div style={patientInfoStyle}>
//               <p style={infoLabelStyle}>Patient Name:</p>
//               <p style={infoValueStyle}>
//                 {`${patientDetails.name} (${patientDetails.relation}) ${patientDetails.husbandOrFatherName}`.trim() || "N/A"}
//               </p>
//               <p style={infoLabelStyle}>Age:</p>
//               <p style={infoValueStyle}>{patientDetails.age}</p>
//             </div>
//           </div>
//         )}

//         {loading && <p>Loading previous lab history...</p>}
//         {error && <p style={{ color: "red" }}>{error}</p>}

//         {!loading && previousLabHistory.length > 0 && (
//           <div style={tableWrapperStyle}>
//             <table style={tableStyle}>
//               <thead>
//                 <tr>
//                   <th style={tableHeaderStyle}>
//                     <input
//                       type="checkbox"
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setSelectedLabTests(previousLabHistory.filter((item) => item.type === "lab_test"));
//                         } else {
//                           setSelectedLabTests([]);
//                         }
//                       }}
//                       checked={
//                         selectedLabTests.length ===
//                         previousLabHistory.filter((item) => item.type === "lab_test").length
//                       }
//                       aria-label="Select all lab tests"
//                     />
//                   </th>
//                   <th style={tableHeaderStyle}>Service/Test</th>
//                   <th style={tableHeaderStyle}>Date</th>
//                   <th style={tableHeaderStyle}>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {previousLabHistory.map((item) => (
//                   <tr key={`${item.id}-${item.lab_test_id}`}>
//                     <td style={tableCellStyle}>
//                       {item.type === "lab_test" && (
//                         <input
//                           type="checkbox"
//                           checked={selectedLabTests.some(
//                             (selected) => selected.id === item.id && selected.lab_test_id === item.lab_test_id
//                           )}
//                           onChange={() => handleCheckboxChange(item)}
//                           aria-label={`Select ${item.item_name}`}
//                         />
//                       )}
//                     </td>
//                     <td style={tableCellStyle}>
//                       {item.item_name}
//                     </td>
//                     <td style={tableCellStyle}>
//                       {formatDate(item.invoice_date)}
                    
//                     </td>
//                     <td>
//                        {item.type === "lab_test" && (
//                         <>
//                           {user.user.user_type === "Lab Assistant" && (
//                             <button
//                               onClick={() => handleAddDescriptionClick(item)}
//                               style={{
//                                 ...actionButtonStyle,
//                                 backgroundColor: "#ffc107",
//                               }}
//                             >
//                               <i className="fas fa-plus"></i> Add Results
//                             </button>
//                           )}
                         
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {previousLabHistory.some((item) => item.type === "lab_test") && (
//           <div style={{ ...actionButtonsStyle, marginBottom: "20px" }}>
//             <button
//               onClick={viewResults}
//               style={{ ...actionButtonStyle, backgroundColor: "#17a2b8" }}
//             >
//               <i className="fas fa-eye"></i> View Selected Results
//             </button>
//           </div>
//         )}
//       </div>

//       {showEdit === "add_lab_test_results" && selectedItem && (
//         <div style={{ position: "relative", zIndex: 2000 }}>
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 1000,
//             }}
//             onClick={() => setShowEdit(null)}
//           />
//           <div
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 2000,
//               backgroundColor: "#fff",
//               padding: "5px",
//               borderRadius: "8px",
//               width: "80%",
//               height: "90%",
//               overflowY: "auto",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//           >
//             <div className="d-flex justify-content-end sticky-top">
//               <button className="btn btn-primary mb-2" onClick={() => setShowEdit(null)}>
//                 x
//               </button>
//             </div>
//             <AddLabTestResult
//               onClose={() => setShowEdit(null)}
//               labTestIdGet={selectedItem.lab_test_id}
//               invoiceId={selectedItem.id}
//               itemData={selectedItem}
//             />
//           </div>
//         </div>
//       )}

//       {showEdit === "view_result" && selectedLabTests.length > 0 && (
//         <div style={{ position: "relative", zIndex: 2000 }}>
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 1000,
//             }}
//             onClick={() => setShowEdit(null)}
//           />
//           <div
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 2000,
//               backgroundColor: "#fff",
//               padding: "5px",
//               borderRadius: "8px",
//               width: "80%",
//               height: "90%",
//               overflowY: "auto",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//           >
//             <div className="d-flex justify-content-end sticky-top">
//               <button className="btn btn-primary mb-2" onClick={() => setShowEdit(null)}>
//                 x
//               </button>
//             </div>
//             <ViewLabTestResults
//               onClose={() => setShowEdit(null)}
//               labTestIdGet={selectedLabTests.map((item) => item.lab_test_id)}
//               invoiceId={selectedLabTests.map((item) => item.id)}
//               itemsData={selectedLabTests}
//             />
//           </div>
//         </div>
//       )}

//       {showEdit === "pharmacy" && (
//         <div style={{ position: "relative", zIndex: 2000 }}>
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 1000,
//             }}
//             onClick={() => setShowEdit(null)}
//           />
//           <div
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 2000,
//               backgroundColor: "#fff",
//               padding: "5px",
//               borderRadius: "8px",
//               width: "80%",
//               height: "90%",
//               overflowY: "auto",
//               boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//             }}
//           >
//             <div className="d-flex justify-content-end sticky-top">
//               <button className="btn btn-primary mb-2" onClick={() => setShowEdit(null)}>
//                 x
//               </button>
//             </div>
//             <Pharmacy onClose={() => setShowEdit(null)} patientId={patientId} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // PropTypes for validation
// PreviousLabTest.propTypes = {
//   onClose: PropTypes.func.isRequired,
//   patientId: PropTypes.string,
//   invoiceData: PropTypes.arrayOf(
//     PropTypes.shape({
//       patient_id: PropTypes.string,
//       patient_name: PropTypes.string,
//       full_name: PropTypes.string,
//       patient_age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//       age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     })
//   ),
// };


// const overlayStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   backgroundColor: "rgba(0, 0, 0, 0.5)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   zIndex: 9999,
// };

// const modalStyle = {
//   backgroundColor: "white",
//   padding: "25px",
//   borderRadius: "10px",
//   width: "90%",
//   maxWidth: "1000px",
//   maxHeight: "90vh",
//   overflowY: "auto",
//   boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
//   fontSize: "14px",
//   position: "relative",
// };

// const headerStyle = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   marginBottom: "20px",
//   borderBottom: "1px solid #eee",
//   paddingBottom: "15px",
// };

// const closeButtonStyle = {
//   background: "none",
//   border: "none",
//   fontSize: "24px",
//   cursor: "pointer",
//   color: "#7f8c8d",
//   padding: "0 10px",
// };

// const clinicInfoStyle = {
//   textAlign: "center",
//   marginBottom: "20px",
// };

// const clinicDetailStyle = {
//   fontSize: "14px",
//   color: "#7f8c8d",
//   margin: "3px 0",
// };

// const infoContainerStyle = {
//   display: "flex",
//   justifyContent: "space-between",
//   marginBottom: "20px",
//   flexWrap: "wrap",
// };

// const invoiceInfoStyle = {
//   flex: 1,
//   minWidth: "200px",
//   marginBottom: "15px",
// };

// const patientInfoStyle = {
//   flex: 2,
//   minWidth: "300px",
// };

// const infoLabelStyle = {
//   fontWeight: "bold",
//   color: "#34495e",
//   margin: "5px 0",
//   fontSize: "14px",
// };

// const infoValueStyle = {
//   margin: "5px 0 10px 0",
//   fontSize: "14px",
//   color: "#2c3e50",
// };

// const patientDetailsRowStyle = {
//   display: "flex",
//   gap: "20px",
//   marginTop: "10px",
// };

// const patientDetailItemStyle = {
//   flex: 1,
// };

// const tableWrapperStyle = {
//   width: "100%",
//   overflowX: "auto",
//   marginBottom: "20px",
//   border: "1px solid #eee",
//   borderRadius: "5px",
// };

// const tableStyle = {
//   width: "100%",
//   borderCollapse: "collapse",
//   fontSize: "14px",
// };

// const tableHeaderStyle = {
//   padding: "12px 15px",
//   textAlign: "left",
//   backgroundColor: "#f8f9fa",
//   borderBottom: "1px solid #ddd",
//   fontWeight: "bold",
//   color: "#34495e",
// };

// const tableCellStyle = {
//   padding: "12px 15px",
//   borderBottom: "1px solid #eee",
//   verticalAlign: "middle",
// };

// const actionButtonsStyle = {
//   display: "flex",
//   gap: "8px",
//   flexWrap: "wrap",
// };

// const actionButtonStyle = {
//   padding: "6px 10px",
//   borderRadius: "4px",
//   border: "none",
//   color: "white",
//   cursor: "pointer",
//   fontSize: "12px",
//   fontWeight: "bold",
//   whiteSpace: "nowrap",
// };

// const totalsContainerStyle = {
//   marginTop: "20px",
//   padding: "15px",
//   backgroundColor: "#f8f9fa",
//   borderRadius: "5px",
// };

// const totalRowStyle = {
//   display: "flex",
//   justifyContent: "space-between",
//   marginBottom: "8px",
// };

// const totalLabelStyle = {
//   fontWeight: "600",
//   color: "#34495e",
// };

// const totalValueStyle = {
//   fontWeight: "600",
//   color: "#2c3e50",
// };

// const footerStyle = {
//   marginTop: "25px",
//   textAlign: "center",
//   borderTop: "1px solid #eee",
//   paddingTop: "15px",
// };

// const footerTextStyle = {
//   fontSize: "13px",
//   color: "#7f8c8d",
//   marginTop: "10px",
// };


// export default PreviousLabTest;


import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddLabTestResult from "./AddLabTestResult";
import ViewLabTestResults from "./ViewLabTestResults";
import Pharmacy from "./Pharmacy"; 
import { useAuth } from "./AuthContext";
import axios from "axios";
import PropTypes from "prop-types";

const PreviousLabTest = ({ onClose, patientId, invoiceData = [] }) => {
  const [updatedInvoiceData, setUpdatedInvoiceData] = useState(invoiceData);
  const [previousLabHistory, setPreviousLabHistory] = useState([]);
  const [filteredLabHistory, setFilteredLabHistory] = useState([]); // New state for filtered data
  const [searchQuery, setSearchQuery] = useState(""); // New state for search input
  const [showEdit, setShowEdit] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000"; // Fallback URL

  useEffect(() => {
    if (!invoiceData || !invoiceData[0]?.patient_id) {
      toast.error("Invalid or missing patient data.");
      return;
    }

    const fetchPreviousLabHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/view-previous-lab-test`, {
          params: { patient_id: invoiceData[0].patient_id },
        });
        setPreviousLabHistory(response.data.results || []);
        setFilteredLabHistory(response.data.results || []); // Initialize filtered data
      } catch (err) {
        console.error("Error fetching lab history:", err);
        setError("Failed to fetch previous lab history.");
        toast.error("Failed to fetch previous lab history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousLabHistory();
  }, [invoiceData, apiUrl]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = previousLabHistory.filter((item) => {
      const itemName = item.item_name?.toLowerCase() || "";
      const formattedDate = formatDate(item.invoice_date)?.toLowerCase() || "";
      return (
        itemName.includes(query.toLowerCase()) ||
        formattedDate.includes(query.toLowerCase())
      );
    });

    setFilteredLabHistory(filtered);
  };

  const handleAddDescriptionClick = (item) => {
    if (item?.lab_test_id && item?.id) {
      setSelectedItem(item);
      setShowEdit("add_lab_test_results");
    } else {
      toast.error("Invalid lab test selection.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle missing date

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid date

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const viewResults = () => {
    if (selectedLabTests.length === 0) {
      toast.error("Please select at least one lab test to view results.");
      return;
    }
    setShowEdit("view_result");
  };

  const handleCheckboxChange = (item) => {
    setSelectedLabTests((prev) => {
      const isSelected = prev.some(
        (selected) => selected.id === item.id && selected.lab_test_id === item.lab_test_id
      );
      if (isSelected) {
        return prev.filter(
          (selected) => !(selected.id === item.id && selected.lab_test_id === item.lab_test_id)
        );
      }
      return [...prev, item];
    });
  };

  const patientDetails = updatedInvoiceData[0]
    ? {
        name: updatedInvoiceData[0].patient_name || updatedInvoiceData[0].full_name || "N/A",
        age: updatedInvoiceData[0].patient_age || updatedInvoiceData[0].age || "N/A",
        gender: previousLabHistory[0]?.gender || "N/A",
        relation: previousLabHistory[0]?.relation || "",
        husbandOrFatherName: previousLabHistory[0]?.husbandOrFatherName || "",
      }
    : null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h5 style={{ color: "#007bff" }}>Patient Lab History</h5>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
            ×
          </button>
        </div>

        <div style={clinicInfoStyle}>
          <h5 style={{ color: "#007bff" }}>Rehman Medical Center</h5>
          <p style={clinicDetailStyle}>
            <i className="fas fa-map-marker-alt"></i> Yum Backers wali Gali, P 15/3 End Lane.2 Lala Rukh Wah Cantt
          </p>
          <p style={clinicDetailStyle}>
            <i className="fas fa-phone-alt"></i> +92 333 956 80 94
          </p>
        </div>

        {patientDetails && (
          <div style={infoContainerStyle}>
            <div style={patientInfoStyle}>
              <p style={infoLabelStyle}>Patient Name:</p>
              <p style={infoValueStyle}>
                {`${patientDetails.name} (${patientDetails.relation}) ${patientDetails.husbandOrFatherName}`.trim() || "N/A"}
              </p>
              <p style={infoLabelStyle}>Age:</p>
              <p style={infoValueStyle}>{patientDetails.age}</p>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search by test name or date..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
            aria-label="Search lab tests"
          />
        </div>

        {loading && <p>Loading previous lab history...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && filteredLabHistory.length > 0 && (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLabTests(filteredLabHistory.filter((item) => item.type === "lab_test"));
                        } else {
                          setSelectedLabTests([]);
                        }
                      }}
                      checked={
                        selectedLabTests.length ===
                        filteredLabHistory.filter((item) => item.type === "lab_test").length
                      }
                      aria-label="Select all lab tests"
                    />
                  </th>
                  <th style={tableHeaderStyle}>Service/Test</th>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabHistory.map((item) => (
                  <tr key={`${item.id}-${item.lab_test_id}`}>
                    <td style={tableCellStyle}>
                      {item.type === "lab_test" && (
                        <input
                          type="checkbox"
                          checked={selectedLabTests.some(
                            (selected) => selected.id === item.id && selected.lab_test_id === item.lab_test_id
                          )}
                          onChange={() => handleCheckboxChange(item)}
                          aria-label={`Select ${item.item_name}`}
                        />
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      {item.item_name}
                    </td>
                    <td style={tableCellStyle}>
                      {formatDate(item.invoice_date)}
                    </td>
                    <td>
                      {item.type === "lab_test" && (
                        <>
                          {user.user.user_type === "Lab Assistant" && (
                            <button
                              onClick={() => handleAddDescriptionClick(item)}
                              style={{
                                ...actionButtonStyle,
                                backgroundColor: "#ffc107",
                              }}
                            >
                              <i className="fas fa-plus"></i> Add Results
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLabHistory.length === 0 && !loading && (
          <p>No lab tests found matching your search.</p>
        )}

        {filteredLabHistory.some((item) => item.type === "lab_test") && (
          <div style={{ ...actionButtonsStyle, marginBottom: "20px" }}>
            <button
              onClick={viewResults}
              style={{ ...actionButtonStyle, backgroundColor: "#17a2b8" }}
            >
              <i className="fas fa-eye"></i> View Selected Results
            </button>
          </div>
        )}
      </div>

      {showEdit === "add_lab_test_results" && selectedItem && (
        <div style={{ position: "relative", zIndex: 2000 }}>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
            onClick={() => setShowEdit(null)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2000,
              backgroundColor: "#fff",
              padding: "5px",
              borderRadius: "8px",
              width: "80%",
              height: "90%",
              overflowY: "auto",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-end sticky-top">
              <button className="btn btn-primary mb-2" onClick={() => setShowEdit(null)}>
                x
              </button>
            </div>
            <AddLabTestResult
              onClose={() => setShowEdit(null)}
              labTestIdGet={selectedItem.lab_test_id}
              invoiceId={selectedItem.id}
              itemData={selectedItem}
            />
          </div>
        </div>
      )}

      {showEdit === "view_result" && selectedLabTests.length > 0 && (
        <div style={{ position: "relative", zIndex: 2000 }}>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
            onClick={() => setShowEdit(null)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2000,
              backgroundColor: "#fff",
              padding: "5px",
              borderRadius: "8px",
              width: "80%",
              height: "90%",
              overflowY: "auto",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-end sticky-top">
              <button className="btn btn-primary mb-2" onClick={() => setShowEdit(null)}>
                x
              </button>
            </div>
            <ViewLabTestResults
              onClose={() => setShowEdit(null)}
              labTestIdGet={selectedLabTests.map((item) => item.lab_test_id)}
              invoiceId={selectedLabTests.map((item) => item.id)}
              itemsData={selectedLabTests}
            />
          </div>
        </div>
      )}

      {showEdit === "pharmacy" && (
        <div style={{ position: "relative", zIndex: 2000 }}>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
            onClick={() => setShowEdit(null)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2000,
              backgroundColor: "#fff",
              padding: "5px",
              borderRadius: "8px",
              width: "80%",
              height: "90%",
              overflowY: "auto",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-end sticky-top">
              <button className="btn btn-primary mb-2" onClick={() => setShowEdit(null)}>
                x
              </button>
            </div>
            <Pharmacy onClose={() => setShowEdit(null)} patientId={patientId} />
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes for validation
PreviousLabTest.propTypes = {
  onClose: PropTypes.func.isRequired,
  patientId: PropTypes.string,
  invoiceData: PropTypes.arrayOf(
    PropTypes.shape({
      patient_id: PropTypes.string,
      patient_name: PropTypes.string,
      full_name: PropTypes.string,
      patient_age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
};


const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "1000px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  fontSize: "14px",
  position: "relative",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  borderBottom: "1px solid #eee",
  paddingBottom: "15px",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#7f8c8d",
  padding: "0 10px",
};

const clinicInfoStyle = {
  textAlign: "center",
  marginBottom: "20px",
};

const clinicDetailStyle = {
  fontSize: "14px",
  color: "#7f8c8d",
  margin: "3px 0",
};

const infoContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const invoiceInfoStyle = {
  flex: 1,
  minWidth: "200px",
  marginBottom: "15px",
};

const patientInfoStyle = {
  flex: 2,
  minWidth: "300px",
};

const infoLabelStyle = {
  fontWeight: "bold",
  color: "#34495e",
  margin: "5px 0",
  fontSize: "14px",
};

const infoValueStyle = {
  margin: "5px 0 10px 0",
  fontSize: "14px",
  color: "#2c3e50",
};

const patientDetailsRowStyle = {
  display: "flex",
  gap: "20px",
  marginTop: "10px",
};

const patientDetailItemStyle = {
  flex: 1,
};

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  marginBottom: "20px",
  border: "1px solid #eee",
  borderRadius: "5px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const tableHeaderStyle = {
  padding: "12px 15px",
  textAlign: "left",
  backgroundColor: "#f8f9fa",
  borderBottom: "1px solid #ddd",
  fontWeight: "bold",
  color: "#34495e",
};

const tableCellStyle = {
  padding: "12px 15px",
  borderBottom: "1px solid #eee",
  verticalAlign: "middle",
};

const actionButtonsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const actionButtonStyle = {
  padding: "6px 10px",
  borderRadius: "4px",
  border: "none",
  color: "white",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const totalsContainerStyle = {
  marginTop: "20px",
  padding: "15px",
  backgroundColor: "#f8f9fa",
  borderRadius: "5px",
};

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const totalLabelStyle = {
  fontWeight: "600",
  color: "#34495e",
};

const totalValueStyle = {
  fontWeight: "600",
  color: "#2c3e50",
};

const footerStyle = {
  marginTop: "25px",
  textAlign: "center",
  borderTop: "1px solid #eee",
  paddingTop: "15px",
};

const footerTextStyle = {
  fontSize: "13px",
  color: "#7f8c8d",
  marginTop: "10px",
};
export default PreviousLabTest;