


import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import Select from "react-select";

function PaidPayments() {
    const [payments, setPayments] = useState([]);
    const [receivedPayment, setReceivedPayment] = useState('');
     const [rebateDate, setRebateDate] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
      const [getAllSupplier, setAllSupplier] = useState([]);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

      const [formData, setFormData] = useState({
        supplier_id_for_report: ""});

    // Fetch payments with server-side pagination
    const fetchPayments = async (page = currentPage, limit = itemsPerPage, shouldLoad = true, supplier_id) => {
            if (shouldLoad) setLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/payments?page=${page}&limit=${limit}&supplier_id=${supplier_id || ''}`
            );
            const data = await response.json();
            
            setPayments(data.payments);
            setTotalCount(data.totalCount);
            setTotalPages(data.totalPages);
            setGrandTotal(data.grandTotal);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };


     useEffect(() => {
    const fetchSupplier = () => {
      axios
        .get(process.env.REACT_APP_API_URL + "/get-all-supplier")
        .then((res) => {
          setAllSupplier(res.data.results);
        })
        .catch((err) => console.log(err));
    };
    fetchSupplier();
  }, []);


    useEffect(() => {
        fetchPayments(1, 100, false, formData.supplier_id_for_report);
    }, [formData.supplier_id_for_report]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId 
                ? `${process.env.REACT_APP_API_URL}/api/payments/${editId}` 
                : `${process.env.REACT_APP_API_URL}/api/payments`;
            
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paid_payments: receivedPayment, rebate_date: rebateDate, supplier_id: formData.supplier_id_for_report }),
            });

            setReceivedPayment('');
            setRebateDate('');
            // setFormData({ supplier_id: ""});
            setEditId(null);
            
            // If we're adding a new payment, go to first page to see it
            // If we're editing, stay on current page
            const pageToFetch = editId ? currentPage : 1;
            await fetchPayments(pageToFetch, itemsPerPage, false, formData.supplier_id_for_report);
            
        } catch (error) {
            console.error('Error submitting payment:', error);
        } finally {
            setLoading(false);
        }
    };

    // Edit payment
    const editPayment = (payment) => {
        setEditId(payment.id);
        setReceivedPayment(payment.paid_payments);
        setRebateDate(payment.created_at);
        setFormData({ ...formData, supplier_id_for_report: payment.supplier_id });
    };

    // Delete payment
    const deletePayment = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            setLoading(true);
            try {
                await fetch(`${process.env.REACT_APP_API_URL}/api/payments/${id}`, { 
                    method: 'DELETE' 
                });
                
                // Calculate if we need to go to previous page after deletion
                const remainingItemsOnPage = payments.length - 1;
                const pageToFetch = remainingItemsOnPage === 0 && currentPage > 1 
                    ? currentPage - 1 
                    : currentPage;
                
                await fetchPayments(pageToFetch, itemsPerPage, false);
            } catch (error) {
                console.error('Error deleting payment:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle page change
    const handlePageChange = (selectedPage) => {
        const newPage = selectedPage.selected + 1; // react-paginate uses 0-based indexing
        fetchPayments(newPage, itemsPerPage, false);
    };

    // Calculate current range for display
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

    return (
      <div className="container">
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label htmlFor="rebate_date" className="form-label fw-medium">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rebateDate}
                    onChange={(e) => setRebateDate(e.target.value)}
                    className="form-control"
                    id="rebate_date"
                    disabled={loading}
                  />
                </div>

                <div className="col-md-3">
                  <label
                    htmlFor="receivedPayment"
                    className="form-label fw-medium"
                  >
                    Rebate Payment
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={receivedPayment}
                    onChange={(e) => setReceivedPayment(e.target.value)}
                    className="form-control"
                    id="receivedPayment"
                    disabled={loading}
                  />
                </div>

                <div className="col-sm-3">
                                      <Select
                                        id="supplier_id_for_report"
                                        name="supplier_id_for_report"
                                        value={
                                          formData.supplier_id_for_report
                                            ? {
                                                value: formData.supplier_id_for_report,
                                                label: formData.full_name,
                                              }
                                            : null
                                        }
                                        options={[
                                          { value: "", label: "Select Supplier" },
                                          ...getAllSupplier.map((supplier) => ({
                                            value: supplier.id,
                                            label: supplier.full_name,
                                          })),
                                        ]}
                                        onChange={(selectedOption) => {
                                          setFormData({
                                            ...formData,
                                            supplier_id_for_report: selectedOption.value,
                                            full_name: selectedOption.label,
                                          });
                                        }}
                                        placeholder="Select Supplier"
                                      />
                                    </div>

                <div className="col-md-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>{editId ? "Updating..." : "Adding..."}</>
                    ) : editId ? (
                      "Update Payment"
                    ) : (
                      "Add Payment"
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Summary Section */}
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="alert alert-info mb-0">
                  <strong>Total Payments: </strong>
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    totalCount.toLocaleString()
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="alert alert-success mb-0">
                  <strong>Grand Total: </strong>
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    `${parseFloat(grandTotal || 0).toFixed(2)}`
                  )}
                </div>
              </div>
            </div>

            {/* Items per page selector */}
            <div className="row mb-3">
              <div className="col-md-6">
                <small className="text-muted">
                  Showing {totalCount > 0 ? startIndex : 0} to {endIndex} of{" "}
                  {totalCount} entries
                </small>
              </div>
            </div>

            {/* Payments List */}
            <div className="table-responsive">
              <table className="table table-hover table-bordered">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Sr.No</th>
                    <th scope="col">Rebate Payment Recieved</th>
                    <th scope="col">Recieving Date</th>
                    <th scope="col">Supplier</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-2">Loading payments...</div>
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, index) => (
                      <tr key={payment.id}>
                        <td>{startIndex + index}</td>
                        <td>{parseFloat(payment.paid_payments).toFixed(2)}</td>
                        <td>
                          {new Date(payment.created_at)
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                            .replace(/\//g, "-")}
                        </td>
                          <td>{payment.full_name}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              onClick={() => editPayment(payment)}
                              className="btn btn-warning btn-sm me-2"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePayment(payment.id)}
                              className="btn btn-danger btn-sm"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="d-flex justify-content-center mt-4">
                <ReactPaginate
                  previousLabel="← Previous"
                  nextLabel="Next →"
                  breakLabel="..."
                  pageCount={totalPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageChange}
                  forcePage={currentPage - 1} // react-paginate uses 0-based indexing
                  containerClassName="pagination mb-0"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item"
                  previousLinkClassName="page-link"
                  nextClassName="page-item"
                  nextLinkClassName="page-link"
                  breakClassName="page-item"
                  breakLinkClassName="page-link"
                  activeClassName="active"
                  disabledClassName="disabled"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
}

export default PaidPayments;