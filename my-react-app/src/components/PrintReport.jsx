import React, { useRef } from "react";

const PrintReport = ({ showReport, setShowReport, setShowHeading, reportData, report }) => {
  const printRef = useRef(); // Reference for print section

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (!showReport) return null;

  return (
    <>
      {/* Transparent Background Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
        }}
        onClick={() => setShowReport(false)}
      ></div>

      {/* Modal Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          width: "80%",
          minWidth: "1200px",
          overflowY: "auto",
          maxHeight: "90vh",
          zIndex: 1000,
        }}
      >
        {/* Print Button */}
        <button className="btn btn-primary mb-3" onClick={handlePrint}>
          Print Report
        </button>

        <div ref={printRef}>
          {/* Report Header */}
          <h3 className="text-center">Ghafoor Medical Store Sibi (Pvt) Ltd.</h3>

          <div className="d-flex w-100" style={{ height: "30vh" }}>
            {/* Account Details */}
            <div className="col-4">
              <p><b>Commanding Officer</b></p>
              <p><b>Combined Military Hospital (CMH) Sibi Cantt</b></p>
              <p><b>Account Title:</b> Ghafoor Medical Store Sibi</p>
              <p><b>Account No:</b> -</p>
              <p><b>Branch Name:</b> Muslim Commercial Bank</p>
              <p><b>Branch:</b> -</p>
            </div>

            {/* Center Logo */}
            <div className="col-4 d-flex justify-content-center align-items-center">
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/medical.png`}
                style={{ width: "250px" }}
                alt="Medical"
              />
            </div>

            {/* Invoice Details */}
            <div className="col-4">
              <p><b>Date:</b> {new Date().toLocaleDateString()}</p>
              <p><b>Invoice#:</b> {reportData?.[0]?.invoice_no || ""}</p>
              <p><b>Sale Tax#:</b></p>
              <p><b>PO#:</b> {reportData?.[0]?.type === "daily_lp_medicine" ? "Daily LP Medicine" : "Daily LP Surg/Disp"}</p>
              <p><b>NTN No:</b></p>
              <p><b>Sale Tax No:</b></p>
              <p><b>Print Date:</b> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Invoice Title */}
          <h4 className="text-center p-2">Invoice/Bill</h4>

          {/* Table for Invoice */}
          {reportData.map((group, index) => {
            const subtotal = group.items.reduce((acc, item) => acc + Number(item.total), 0);

            return (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  border: "1px solid #ddd",
                  padding: "20px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px",
                  }}
                  border="1"
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                      <th>Ser</th>
                      <th>Brand</th>
                      <th>Manufacturer</th>
                      <th>A/U</th>
                      <th>Unit Rate</th>
                      <th>Quantity</th>
                      <th>Discount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.brand}</td>
                        <td>{item.manufacturer}</td>
                        <td>{item.unit_type}</td>
                        <td>{item.price}</td>
                        <td>{item.quantity}</td>
                        <td>{item.discount}</td>
                        <td>{item.total}</td>
                      </tr>
                    ))}
                    {/* Subtotal */}
                    <tr>
                      <td colSpan="7"><b>Subtotal:</b></td>
                      <td>{subtotal.toFixed(2)}</td>
                    </tr>

                    {/* Tax and Discount Calculations */}
                    {(reportData[0]?.type === "daily_lp_medicine" || reportData[0]?.type === "daily_lp_surg_disp") && (
                      <>
                        <tr>
                          <td colSpan="7"><b>Amount of Rebate (20%):</b></td>
                          <td>{(subtotal * 0.2).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="7"><b>Amount After Rebate Exclusive (GST):</b></td>
                          <td>{(subtotal * 0.8).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="7"><b>Amount of Sale Tax (18%):</b></td>
                          <td>{((subtotal * 0.8) * 0.18).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="7"><b>Total Amount Inclusive GST:</b></td>
                          <td>{((subtotal * 0.8) * 1.18).toFixed(2)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Grand Total */}
          <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "18px", color: "#333" }}>
            Grand Total:{" "}
            {reportData
              .reduce(
                (grandTotal, group) =>
                  grandTotal + group.items.reduce((sum, item) => sum + Number(item.total), 0),
                0
              )
              .toFixed(2)}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintReport;
