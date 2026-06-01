import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentManagement = ({ invoiceNo, onClose, onPaymentAdded }) => {
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    payment_amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "cash",
    notes: ""
  });

  useEffect(() => {
    fetchInvoiceAndPayments();
  }, [invoiceNo]);

  const fetchInvoiceAndPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice details
      const invoiceRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-invoice-details/${invoiceNo}`
      );
      
      // Fetch payment history
      const paymentsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-payment-history/${invoiceNo}`
      );
      
      setInvoiceDetails(invoiceRes.data);
      setPaymentHistory(paymentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payment information");
      setLoading(false);
    }
  };

  const calculateRemaining = () => {
    if (!invoiceDetails) return 0;
    
    const totalPaid = paymentHistory.reduce((sum, payment) => 
      sum + parseFloat(payment.payment_amount), 0
    );
    
    return (
      parseFloat(invoiceDetails.grand_total) - 
      parseFloat(invoiceDetails.advance || 0) - 
      totalPaid
    ).toFixed(2);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.payment_amount || parseFloat(paymentForm.payment_amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const remaining = parseFloat(calculateRemaining());
    if (parseFloat(paymentForm.payment_amount) > remaining) {
      toast.error(`Payment amount cannot exceed remaining amount (${remaining})`);
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/add-payment`,
        {
          invoice_no: invoiceNo,
          ...paymentForm
        }
      );

      toast.success("Payment added successfully!");
      
      // Reset form
      setPaymentForm({
        payment_amount: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "cash",
        notes: ""
      });

      // Refresh data
      fetchInvoiceAndPayments();
      
      if (onPaymentAdded) onPaymentAdded();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/delete-payment/${paymentId}`
      );
      
      toast.success("Payment deleted successfully!");
      fetchInvoiceAndPayments();
      
      if (onPaymentAdded) onPaymentAdded();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  const remaining = calculateRemaining();
  const totalAdditionalPayments = paymentHistory.reduce(
    (sum, payment) => sum + parseFloat(payment.payment_amount), 0
  );

  return (
    <div className="payment-management-container">
      <style>{`
        .payment-management-container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .payment-summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #dee2e6;
        }
        
        .summary-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 1.2rem;
          color: ${parseFloat(remaining) > 0 ? '#dc3545' : '#28a745'};
        }
        
        .payment-form {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-label {
          font-weight: 600;
          margin-bottom: 5px;
          display: block;
        }
        
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .btn-primary:hover {
          background-color: #0056b3;
        }
        
        .payment-history {
          margin-top: 30px;
        }
        
        .payment-history-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .payment-history-table th {
          background-color: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }
        
        .payment-history-table td {
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .btn-danger {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 5px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .btn-danger:hover {
          background-color: #c82333;
        }
        
        .no-payments {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }
      `}</style>

      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{position:"sticky", top:"0"}}>Payment Management - Invoice #{invoiceNo}</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          <i className="fas fa-times"></i> Close
        </button>
      </div> */}

      <div style={{ 
  position: 'sticky', 
  top: 0, 
  backgroundColor: 'white', // Add background so content doesn't show through
  zIndex: 10, // Ensure it stays above other content
  padding: '1rem 0' // Optional: add some padding
}}>
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h3>Payment Management - Invoice #{invoiceNo}</h3>
     <button className="btn btn-secondary" onClick={onClose}>
          <i className="fas fa-times"></i> Close
        </button>
  </div>
</div>

      {/* Summary Section */}
      <div className="payment-summary">
        <h5 className="mb-3">Payment Summary</h5>
        <div className="summary-row">
          <span>Invoice Total:</span>
          <span>Rs. {parseFloat(invoiceDetails?.grand_total || 0).toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Initial Advance:</span>
          <span>Rs. {parseFloat(invoiceDetails?.advance || 0).toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Additional Payments:</span>
          <span>Rs. {totalAdditionalPayments.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Remaining Amount:</span>
          <span>Rs. {remaining}</span>
        </div>
      </div>

      {/* Payment Form */}
      {parseFloat(remaining) > 0 && (
        <div className="payment-form">
          <h5 className="mb-3">Add New Payment</h5>
          <form onSubmit={handleAddPayment}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Payment Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={paymentForm.payment_amount}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      payment_amount: e.target.value
                    })}
                    placeholder="Enter amount"
                    max={remaining}
                    required
                  />
                  <small className="text-muted">
                    Maximum: Rs. {remaining}
                  </small>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      payment_date: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-control"
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      payment_method: e.target.value
                    })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      notes: e.target.value
                    })}
                    placeholder="Add payment notes"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <i className="fas fa-plus"></i> Add Payment
            </button>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div className="payment-history">
        <h5 className="mb-3">Payment History</h5>
        
        {paymentHistory.length === 0 ? (
          <div className="no-payments">
            <i className="fas fa-receipt" style={{ fontSize: '48px', marginBottom: '16px', color: '#dee2e6' }}></i>
            <p>No additional payments recorded yet</p>
          </div>
        ) : (
          <table className="payment-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Notes</th>
                <th>Added By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>Rs. {parseFloat(payment.payment_amount).toFixed(2)}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {payment.payment_method.replace('_', ' ')}
                  </td>
                  <td>{payment.notes || '-'}</td>
                  <td>{payment.created_by || '-'}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;