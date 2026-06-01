

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddLabTestResult from "./AddLabTestResult";
import ViewLabTestResults from "./ViewLabTestResults";
import AddPatientHistory from "./AddPatientHistory";
import Pharmacy from './Pharmacy'; 
import { useAuth } from "./AuthContext";
import axios from "axios";
import PreviousLabTest from "./PreviousLabTest";
import { getCurrentUserPrinter } from "./services/printerService";

const InvoiceModal = ({ invoiceData, onClose, ViewInvoice, setComponent, checkComponent }) => {


  const [updatedInvoiceData, setUpdatedInvoiceData] = useState(invoiceData);
  const [showEdit, setShowEdit] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]); // New state for multiple selections
  const { user } = useAuth();

  const handleAddDescriptionClick = (item) => {
    setSelectedItem(item);
    setShowEdit("add_lab_test_results");
  };


  const previousLabTestGet = (item) => {
    setShowEdit("previous_lab_test");
  };

  const viewResults = () => {
    if (selectedLabTests.length === 0) {
      toast.error("Please select at least one lab test to view results.");
      return;
    }
    setShowEdit("view_result");
  };


  function AddMedicine(){
    setShowEdit('pharmacy');
  }



  const handleCheckboxChange = (item) => {
    setSelectedLabTests((prev) => {
      if (prev.some((selected) => selected.id === item.id && selected.lab_test_id === item.lab_test_id)) {
        return prev.filter((selected) => !(selected.id === item.id && selected.lab_test_id === item.lab_test_id));
      } else {
        return [...prev, item];
      }
    });
  };

  useEffect(() => {
    setUpdatedInvoiceData(invoiceData);
  }, [invoiceData]);

  const patientHistory = (item) => {
    setSelectedItem(item);
    setShowEdit("patient_history");
  };

  const handlePrint = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/print-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceData,
          grandTotal,
          discountTotal,
          printer: getCurrentUserPrinter() || undefined,
          storeInfo: {
            name: "Rehman Medical Center",
            address: "P 15/3 End Lane No 2 Lala Rukh Wah Cantt",
            phone: "0514-531040",
          },
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || "Invoice sent to printer!");
      } else {
        toast.error(result.error || "Failed to print invoice");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error connecting to print service");
    }
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";

    fetch(process.env.REACT_APP_API_URL + "/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status: newStatus }),
    })
      .then((response) => {
        if (response.ok) {
          toast.success(`Status updated to ${newStatus}!`);
          return response.json();
        }
        throw new Error("Failed to update status");
      })
      .then((result) => {
        const updatedData = updatedInvoiceData.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        );
        setUpdatedInvoiceData(updatedData);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to update status");
      });
  };

  const grandTotal = updatedInvoiceData
    .reduce((total, item) => total + parseFloat(item.price_after_discount * item.quantity), 0)
    .toFixed(2);
  const discountTotal = updatedInvoiceData
    .reduce((total, item) => total + parseFloat(item.discount), 0)
    .toFixed(2);

  const patientDetails =
    updatedInvoiceData.length > 0
      ? {
          name: updatedInvoiceData[0].patient_name ? updatedInvoiceData[0].patient_name : updatedInvoiceData[0].full_name,
          age: updatedInvoiceData[0].patient_age ? updatedInvoiceData[0].patient_age : updatedInvoiceData[0].age,
          weight: updatedInvoiceData[0].weight || "N/A",
          bp: updatedInvoiceData[0].bp || "N/A",
          invoiceNo: updatedInvoiceData[0].invoice_no,
          date: updatedInvoiceData[0].invoice_date,
          patient_id: updatedInvoiceData[0].patient_id
        }
      : null;

  const deleteItem = (id, item_id) => {
    let confirm_delete = window.confirm("Are you sure you want to delete this item?");
    if (!confirm_delete) {
      return false;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/delete-invoice-item/${id}/${item_id}`)
      .then((response) => {
        setUpdatedInvoiceData((prevData) =>
          prevData.filter((item) => item.id !== id || item.item !== item_id)
        );
        toast.error("Deleted Successfully!");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };


  function fetchPatientMedicine(){
    
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{
      position: "sticky",
      top: "10px",
      right: "10px",
      zIndex: 1001, // Ensure button stays above other content
      textAlign: "right",
      color: "#007bff"
    }}>
          
          <button onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={clinicInfoStyle}>
          <h5 style={{ color: "#007bff" }}>Rehman Medical Center</h5>
          <p style={clinicDetailStyle}>
            <i className="fas fa-map-marker-alt"></i> Yum Backers wali Gali, P
            15/3 End Lane.2 Lala Rukh Wah Cantt
          </p>
          <p style={clinicDetailStyle}>
            <i className="fas fa-phone-alt"></i> +92 333 956 80 94
          </p>
        </div>

        <div style={infoContainerStyle}>
          <div style={invoiceInfoStyle}>
            <p style={infoLabelStyle}>Invoice #:</p>
            <p style={infoValueStyle}>{patientDetails?.invoiceNo || "N/A"}</p>
            <p style={infoLabelStyle}>Date:</p>
            <p style={infoValueStyle}>{patientDetails?.date}</p>
          </div>

          <div style={patientInfoStyle}>
            <p style={infoLabelStyle}>Patient Name:</p>
            <p style={infoValueStyle}>{patientDetails?.name || "N/A"}</p>
            <div style={patientDetailsRowStyle}>
              <div style={patientDetailItemStyle}>
                <p style={infoLabelStyle}>Age:</p>
                <p style={infoValueStyle}>{patientDetails?.age}</p>
              </div>
              <div style={patientDetailItemStyle}>
                <p style={infoLabelStyle}>Weight:</p>
                <p style={infoValueStyle}>{patientDetails?.weight}</p>
              </div>
              <div style={patientDetailItemStyle}>
                <p style={infoLabelStyle}>BP:</p>
                <p style={infoValueStyle}>{patientDetails?.bp}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={tableWrapperStyle}>
          <div className="p-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => previousLabTestGet()}
            >
              <i className="fas fa-undo"></i> All Lab Test History
            </button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLabTests(
                          updatedInvoiceData.filter(
                            (item) => item.type === "lab_test"
                          )
                        );
                      } else {
                        setSelectedLabTests([]);
                      }
                    }}
                    checked={
                      selectedLabTests.length ===
                      updatedInvoiceData.filter(
                        (item) => item.type === "lab_test"
                      ).length
                    }
                  />
                </th>
                <th style={tableHeaderStyle}>Service/Test</th>
                <th style={tableHeaderStyle}>Fee (Rs.)</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {updatedInvoiceData.map((item, index) => (
                <tr key={item.hidden_id}>
                  <td style={tableCellStyle}>
                    {item.type === "lab_test" && (
                      <input
                        type="checkbox"
                        checked={selectedLabTests.some(
                          (selected) =>
                            selected.id === item.id &&
                            selected.lab_test_id === item.lab_test_id
                        )}
                        onChange={() => handleCheckboxChange(item)}
                      />
                    )}
                  </td>
                  <td style={tableCellStyle}>{item.item_name}</td>
                  <td style={tableCellStyle}>
                    {item.price_after_discount || 0}
                  </td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          item.status === "paid" ? "#d4edda" : "#f8d7da",
                        color: item.status === "paid" ? "#155724" : "#721c24",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={actionButtonsStyle}>
                      <button
                        onClick={() => handleStatusChange(item.id, item.status)}
                        style={{
                          ...actionButtonStyle,
                          width: "120px",
                          color: "#fff",
                          backgroundColor:
                            item.status === "paid" ? "#28a745" : "#dc3545",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px", // Adds spacing between icon and text
                        }}
                      >
                        <i
                          className={
                            item.status === "paid"
                              ? "fas fa-check-circle"
                              : "fas fa-times-circle"
                          }
                          style={{ fontSize: "16px" }}
                          aria-hidden="true"
                        ></i>
                        {item.status === "paid" ? "Paid" : "Unpaid"}
                      </button>
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
                          {/* <button
                            onClick={() => {
                              setSelectedItem(item);
                              setSelectedLabTests([item]);
                              viewResults();
                            }}
                            style={{ ...actionButtonStyle, backgroundColor: "#17a2b8" }}
                          >
                            <i className="fas fa-eye"></i> View Results
                          </button> */}
                        </>
                      )}
                      {item.type === "opd" && (
                        <button
                          onClick={() => patientHistory(item)}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: "gray",
                          }}
                        >
                          <i className="fas fa-clipboard-list"></i> Patient
                          History
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteItem(item.id, item.item)}
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...actionButtonsStyle, marginBottom: "20px" }} className="p-2">
          {updatedInvoiceData.some((item) => item.type === "lab_test") && (
            <button
              onClick={viewResults}
              style={{ ...actionButtonStyle, backgroundColor: "#17a2b8" }}
            >
              <i className="fas fa-eye"></i> View Selected Results
            </button>
          )}

          <button
            onClick={AddMedicine}
            style={{ ...actionButtonStyle, backgroundColor: "#123456" }}
          >
           <i class="fas fa-pills"></i> Add Medicine
          </button>
        </div>

        <div style={totalsContainerStyle}>
          <div style={totalRowStyle}>
            <span style={totalLabelStyle}>Subtotal:</span>
            <span style={totalValueStyle}>{grandTotal} Rs.</span>
          </div>
          <div style={totalRowStyle}>
            <span style={totalLabelStyle}>Discount:</span>
            <span style={totalValueStyle}>{discountTotal} Rs.</span>
          </div>
          <div
            style={{
              ...totalRowStyle,
              borderTop: "1px solid #ddd",
              paddingTop: "8px",
            }}
          >
            <span style={{ ...totalLabelStyle, fontWeight: "bold" }}>
              Total:
            </span>
            <span style={{ ...totalValueStyle, fontWeight: "bold" }}>
              {parseFloat(grandTotal - discountTotal).toFixed(2)} Rs.
            </span>
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={handlePrint} className="btn btn-sm btn-primary">
            <i className="fas fa-print"></i> Print Invoice
          </button>
          <p style={footerTextStyle}>
            Thank you for choosing Rehman Medical Center
          </p>
        </div>
      </div>

      {showEdit === "add_lab_test_results" && selectedItem && (
        <>
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
            onClick={() => setShowEdit(false)}
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
              borderRadius: "8px",
              width: "80%",
              height: "90%",
              overflowY: "auto",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-end sticky-top">
              <button
                className="btn btn-primary mb-2"
                onClick={() => setShowEdit(false)}
              >
                x
              </button>
            </div>
            <AddLabTestResult
              onClose={() => setShowEdit(false)}
              labTestIdGet={selectedItem.lab_test_id}
              invoiceId={selectedItem.id}
              itemData={selectedItem}
            />
          </div>
        </>
      )}

      {showEdit === "view_result" && selectedLabTests.length > 0 && (
        <>
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
            onClick={() => setShowEdit(false)}
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
              borderRadius: "8px",
              width: "80%",
              height: "90%",
              overflowY: "auto",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex justify-content-end sticky-top">
              <button
                className="btn btn-primary mb-2"
                onClick={() => setShowEdit(false)}
              >
                x
              </button>
            </div>
            <ViewLabTestResults
              onClose={() => setShowEdit(false)}
              labTestIdGet={selectedLabTests.map((item) => item.lab_test_id)}
              invoiceId={selectedLabTests.map((item) => item.id)}
              itemsData={selectedLabTests}
            />
          </div>
        </>
      )}

      {showEdit === "patient_history" && selectedItem && (
        <>
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
            onClick={() => setShowEdit(false)}
          ></div>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1005,
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
                onClick={() => setShowEdit(false)}
              >
                x
              </button>
            </div>
            <AddPatientHistory
              onClose={() => setShowEdit(false)}
              labTestIdGet={selectedItem.lab_test_id}
              invoiceId={selectedItem.id}
              itemData={selectedItem}
              invoiceData={updatedInvoiceData}
              ViewInvoice={ViewInvoice}
              setComponent = {setComponent}
              checkComponent = {checkComponent}
            />
          </div>
        </>
      )}

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
              zIndex: 1000,
            }}
            onClick={() => setShowEdit(false)}
          ></div>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1005,
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
                // onClick={() => setShowEdit(false)}
                onClick={() => {
                  setShowEdit(false);
                  setComponent('invoice');
                }}
              >
                x
              </button>
            </div>
            <Pharmacy
              onClose={() => setShowEdit(false)}
              invoiceNo={patientDetails?.invoiceNo}
              patientId={patientDetails?.patient_id}
              fetchPatientMedicine={fetchPatientMedicine}
              setComponent = {setComponent}
              checkComponent = {checkComponent}
            />
          </div>
        </>
      )}

      {showEdit === "previous_lab_test" && (
        <>
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
            onClick={() => setShowEdit(false)}
          ></div>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1010,
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
                onClick={() => setShowEdit(false)}
              >
                x
              </button>
            </div>
            <PreviousLabTest
              onClose={() => setShowEdit(false)}
              patientId={updatedInvoiceData[0].patient_id}
              invoiceData={invoiceData}
            />
          </div>
        </>
      )}
    </div>
  );
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

export default InvoiceModal;
