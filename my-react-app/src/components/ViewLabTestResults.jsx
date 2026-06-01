import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ViewLabTestResults = ({
  onClose,
  labTestIdGet,
  invoiceId,
  itemsData,
}) => {
  const [existingResults, setExistingResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTests, setExpandedTests] = useState({});


  const [patientData, setPatientData] = useState('');


  useEffect(() => {
    fetchExistingResults();
  }, [invoiceId, labTestIdGet]);







  
  const patientInfo = itemsData && itemsData.length > 0 ? itemsData[0] : {};




  
  
  const fetchPatientdata = async () => {
  try {
    setLoading(true);
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/fetch-customer-data-for-pharmacy`,
      {  // Request body
        patient_id: patientInfo.patient_id,  // Assuming patientInfo contains these fields
        phone_no: patientInfo.phone_no,
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      setPatientData(response.data.results[0]);
    } else {
      console.error("No patient data found");
      // Optionally set to null or default state:
      setPatientData(null);
    }


    // setPatientData(response.data.results[0]);

    // console.log("Response data:", response.data.results[0]);

    // if (response.data.success) {
    //   const formattedResults = response.data.results.map((item) => ({
    //     ...item,
    //     parsedResults: JSON.parse(item.results),
    //   }));
    //   setExistingResults(formattedResults);
    // }
  } catch (error) {
    console.error("Error fetching patient data:", error);
    // Handle error appropriately
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchPatientdata();
  }, [patientInfo.patient_id, patientInfo.phone_no]);
  





  
  
  const fetchExistingResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-lab-test-results-for-view`,
        {
          params: {
            invoice_id: invoiceId.join(","),
            lab_test_id: invoiceId.join(","),
          },
        }
      );

      if (response.data.success) {
        const formattedResults = response.data.results.map((item) => ({
          ...item,
          parsedResults: JSON.parse(item.results),
        }));
        setExistingResults(formattedResults);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.error || "Error loading results");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (testId) => {
    setExpandedTests((prev) => ({
      ...prev,
      [testId]: !prev[testId],
    }));
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const sortTestsByOrder = (tests) => {
    return Object.entries(tests).sort(([, a], [, b]) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  };


  // console.log("Patient Info:", itemsData);


  // Function to safely render HTML content
  const renderHtmlContent = (content) => {
    if (!content) return "";
    
    // Check if content contains HTML tags
    const hasHtmlTags = /<[^>]*>/g.test(content);
    
    if (hasHtmlTags) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            lineHeight: '1.4',
            fontSize: '14px'
          }}
        />
      );
    } else {
      return content;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const watermarkText = process.env.REACT_APP_CLINIC_NAME || "Rehman Clinic";

    printWindow.document.write(`
    <html>
      <head>
        <title>Pathology Report - Invoice ${
          patientInfo.invoice_no || "N/A"
        }</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.2; 
            color: #000; 
            margin: 0; 
            padding: 0; 
            font-size: 12px; 
            background-color: white; 
          }
          .print-container {max-width: 800px; margin: 0 auto; }
          .lab-header { margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #000; position: relative; }
          .lab-header h2 { color: #000; font-size: 16px; font-weight: 700; margin: 0; position: absolute; left: 50%; transform: translateX(-50%); }
          .patient-info { background-color: white; margin-bottom: 10px; }
          .patient-info p { margin-bottom: 5px; font-size: 12px; text-transform: uppercase; display: inline-block; margin-right: 15px; }
          .patient-info .title { font-weight: bold; margin-bottom: 5px; display: block; background-color: #000; color: #fff; padding: 3px; width: fit-content; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px; }
          th, td { padding: 5px; border: 1px solid #000; text-align: left; vertical-align: top; }
          th { background-color: #000; color: #fff; font-weight: bold; text-transform: uppercase; }
          .test-group { margin-bottom: 10px; page-break-inside: avoid; }
          .test-group .test-title { font-weight: bold; margin-bottom: 3px; text-transform: uppercase; border-bottom: 1px solid #000; }
          .signature-area { margin-top: 15px; text-align: right; font-size: 12px; }
          .head-test { font-weight: bolder; }
          .print-button { margin-top: 10px; padding: 5px 10px; font-size: 14px; }
          .rich-text-content { line-height: 1.4; font-size: 14px; }
          .rich-text-content p { margin: 2px 0; }
          .rich-text-content ul, .rich-text-content ol { margin: 2px 0; padding-left: 20px; }
          .rich-text-content li { margin: 1px 0; }
          @media print { 
            body { background-color: white; } 
            .print-container { margin: 10mm auto; width: 100%; max-width: 800px; } 
            .test-group { page-break-inside: avoid; } 
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap" rel="stylesheet">
      </head>
      <body>
        <div class="print-container">
          <div class="lab-header">
            <div>
              <p style="margin: 0; font-size: 12px; text-align:right; display:block;">Date: ${new Date().toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )} | Report Time: 12:57 PM</p>
            </div>
          </div>
          <div class="patient-info">
            <p class="title">Patient Profile</p>
             <p><strong>Invoice#:</strong> ${
               patientInfo.invoice_no || "Not Specified"
             }</p>
            <p><strong>Name:</strong> ${
              patientInfo.full_name || "Not Specified"
            }</p>
            <p><strong>Age:</strong> ${
              patientInfo.age ? `${patientInfo.age}y` : "Not Specified"
            }</p>
            <p><strong>Gender:</strong> ${
              patientData.gender || patientInfo.gender || "Not Specified"
            }</p>
          </div>
         ${existingResults
  .map(
    (testGroup) => `
    <div class="test-group">
      <div class="test-title">${testGroup.lab_test}</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Result</th>
            <th>Reference Range</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          ${(() => {
            let rows = "";
            const sortedTests = sortTestsByOrder(testGroup.parsedResults);
            let currentHead = null;

            sortedTests.forEach(([testId, test]) => {
              if (test.result === "head") {
                // Render a header row for the "head" test
                currentHead = test.test_description;
                rows += `
                  <tr>
                    <td colspan="4" class="head-test">${test.test_description}</td>
                  </tr>
                `;
              } else {
                // Render regular test rows under the current head
                // Check if result contains HTML and render accordingly
                const resultContent = test.result && /<[^>]*>/g.test(test.result) 
                  ? `<div class="rich-text-content">${test.result}</div>`
                  : test.result;
                
                rows += `
                  <tr>
                    <td>${test.test_description}</td>
                    <td>${resultContent}</td>
                    <td>${test.ref_range}</td>
                    <td>${test.unit}</td>
                  </tr>
                `;
              }
            });

            return rows;
          })()}
        </tbody>
      </table>
    </div>
  `
  )
  .join("")}
          <div class="signature-area">
            <p>Dr. Talat Khurram</p>
          </div>
        </div>
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 200);
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  return (
    <div className="container-fluid">
      <div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div>
                <span>Loading...</span>
              </div>
            </div>
          ) : existingResults.length === 0 ? (
            <div className="alert alert-info text-center rounded-pill py-3">
              <i className="fas fa-info-circle me-2"></i>
              No test results found for this invoice
            </div>
          ) : (
            <>
              <div className="patient-info mb-4 p-4 bg-white rounded-lg shadow-sm border-start border-4 border-primary">
                <p
                  className="mb-2 text-dark"
                  style={{ textTransform: "uppercase" }}
                >
                  <strong>Patient Name:</strong>{" "}
                  {patientInfo.full_name || "Not specified"}
                </p>
                <p
                  className="mb-2 text-dark"
                  style={{ textTransform: "uppercase" }}
                >
                  <strong>Age:</strong>{" "}
                  {patientInfo.age ? `${patientInfo.age} yrs` : "Not specified"}
                </p>
                <p
                  className="mb-2 text-dark"
                  style={{ textTransform: "uppercase" }}
                >
                  <strong>Gender:</strong> { patientData.gender || "Not Specified"}
                </p>
                <p
                  className="mb-2 text-dark"
                  style={{ textTransform: "uppercase" }}
                >
                  <strong>Invoice #:</strong> {patientInfo.invoice_no || "N/A"}
                </p>
                <p
                  className="mb-0 text-dark"
                  style={{ textTransform: "uppercase" }}
                >
                  <strong>Report Date:</strong>{" "}
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="d-flex justify-content-end mb-4">
                <button
                  className="btn btn-primary px-4 py-2 rounded-pill shadow-sm"
                  onClick={handlePrint}
                >
                  <i className="fas fa-print me-2"></i> Print Report
                </button>
              </div>
              {existingResults.map((testGroup, groupIndex) => (
                <div
                  key={groupIndex}
                  className="mb-4 border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="text-primary mb-0 fw-bold">
                      <i className="fas fa-microscope"></i> {testGroup.lab_test}
                    </h5>
                    <small className="text-muted">
                      <i className="fas fa-calendar-alt me-1"></i>{" "}
                      {formatDate(testGroup.created_at)}
                    </small>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-primary">
                        <tr>
                          <th style={{ width: "30%" }}>Description</th>
                          <th style={{ width: "15%" }}>Result</th>
                          <th style={{ width: "25%" }}>Reference Range</th>
                          <th style={{ width: "15%" }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let rowNumber = 0;
                          return sortTestsByOrder(testGroup.parsedResults).map(
                            ([testId, test], index) => {
                              if (test.result === "head") {
                                return (
                                  <tr
                                    key={`${testId}-head`}
                                    className="table-secondary fw-bold"
                                  >
                                    <td
                                      colSpan="5"
                                      style={{ fontSize: "15px" }}
                                    >
                                      {test.test_description}
                                    </td>
                                  </tr>
                                );
                              } else {
                                rowNumber++;
                                return (
                                  <React.Fragment key={testId}>
                                    <tr>
                                      <td>{test.test_description}</td>
                                      <td
                                        className={`fw-bold ${
                                          test.result_status === "abnormal"
                                            ? "text-danger"
                                            : "text-dark"
                                        }`}
                                        style={{ 
                                          verticalAlign: 'top',
                                          minHeight: '40px'
                                        }}
                                      >
                                        {renderHtmlContent(test.result)}
                                      </td>
                                      <td>{test.ref_range}</td>
                                      <td>{test.unit}</td>
                                    </tr>
                                  </React.Fragment>
                                );
                              }
                            }
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLabTestResults;
