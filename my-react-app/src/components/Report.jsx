


import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const Report = ({ ViewInvoice, editInvoice }) => {
  const [invoiceListGet, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('today');
  const [groupedData, setGroupedData] = useState({});

  const [viewedInvoices, setViewedInvoices] = useState([]);
  const [newInvoices, setNewInvoices] = useState([]);

  const [formData, setFormData] = useState({
    from_date: '',
    to_date: ''
  });

  const { user } = useAuth();
  const searchRef = useRef('');

  // Type display names mapping
  const typeDisplayNames = {
    lab_test: "Lab Tests",
    doctor: "Doctors",
    radiology: "Radiology",
    other_procedure: "Other Procedures",
    other: "Other",
  };

  // Load viewed invoice list from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewedInvoices')) || '[]';
    setViewedInvoices(stored);
  }, []);

  const fetchInvoiceData = (shouldLoad = true) => {
    if (shouldLoad) setLoading(true);

    const params = {
      from_date: formData.from_date,
      to_date: formData.to_date,
      search: searchRef.current,
      page: currentPage,
      filter: invoiceFilter
    };

    axios
      .get(process.env.REACT_APP_API_URL + `/get-report/`, { params })
      .then((response) => {
        setInvoiceList(response.data.results);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        
        // Group data by type with proper initialization
        const grouped = response.data.results.reduce((acc, item) => {
          const type = item.type || 'other';
          if (!acc[type]) {
            acc[type] = {
              items: [],
              totalAmount: 0,
              totalQuantity: 0
            };
          }
          acc[type].items.push(item);
          acc[type].totalAmount += item.total_amount;
          acc[type].totalQuantity += item.total_quantity;
          return acc;
        }, {});
        
        setGroupedData(grouped);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching invoice data', error);
        setLoading(false);
      });
  };

  const handleWebSocketMessage = (data) => {
    console.log("Received message:", data);
    if (data.type === 'invoice_updated' && data.invoice_no) {
      console.log("Received invoice_updated message:", data);
      if (!viewedInvoices.includes(data.invoice_no)) {
        setNewInvoices((prev) => [...new Set([...prev, data.invoice_no])]);
      }
      fetchInvoiceData(false);
    }
  };

  const deleteInvoice = (invoice_no) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/delete-invoice/${invoice_no}`)
        .then((response) => {
          console.log('Item deleted successfully:', response.data);
          setInvoiceList((prevList) =>
            prevList.filter((invoice) => invoice.invoice_no !== invoice_no)
          );
        })
        .catch((error) => {
          console.error('Error deleting item:', error);
        });
    }
  };

  const handleSearchChange = (event) => {
    setSearchInvoice(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchRef.current = searchInvoice;
      fetchInvoiceData(false);
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleFilterChange = (filter) => {
    setInvoiceFilter(filter);
    setCurrentPage(1);
    fetchInvoiceData(false);
  };

  const getReport = (from_date, to_date) => {
    if (from_date && to_date) {
      fetchInvoiceData(false);
    }
  };

  const handleViewInvoice = (invoice_no) => {
    ViewInvoice(invoice_no);

    setViewedInvoices((prev) => {
      const updated = [...new Set([...prev, invoice_no])];
      localStorage.setItem('viewedInvoices', JSON.stringify(updated));
      return updated;
    });

    setNewInvoices((prev) => prev.filter((id) => id !== invoice_no));
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [currentPage, invoiceFilter]);

  // Calculate grand totals
  const grandTotalAmount = invoiceListGet.reduce((total, invoice) => total + invoice.total_amount, 0);
  const grandTotalQuantity = invoiceListGet.reduce((total, invoice) => total + invoice.total_quantity, 0);

  return (
    <div className="container-fluid">
      <div className="card mt-3">
        <div className="card-header bg-primary text-white">
          <h4>Report Dashboard</h4>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                value={searchInvoice}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                id="from_date"
                name="from_date"
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                id="to_date"
                name="to_date"
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={() => getReport(formData.from_date, formData.to_date)}
              >
                <i className="fas fa-search mr-2"></i> Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Loading report data...</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedData).map(([type, group]) => (
                <div key={type} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="text-capitalize font-weight-bold">
                      {typeDisplayNames[type] || type.replace('_', ' ')}
                    </h5>
                    <div className="badge badge-primary p-2">
                      Total: {group.items.length} items
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th className="text-center" style={{ width: '5%' }}>#</th>
                          <th style={{ width: '60%' }}>
                            {(type === 'lab_test' || type === 'radiology' || type === 'other_procedure') ? 'Test Name' : 'Name'}
                          </th>
                          <th className="text-center" style={{ width: '15%' }}>Amount</th>
                          <th className="text-center" style={{ width: '15%' }}>Quantity</th>
                          {/* <th className="text-center" style={{ width: '5%' }}>Actions</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item, index) => (
                          <tr key={`${type}-${index}`}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              {(type === 'lab_test' || type === 'radiology' || type === 'other_procedure') ? item.lab_test_name : item.doctor_name}
                              {newInvoices.includes(item.invoice_no) && (
                                <span className="badge badge-danger ml-2">New</span>
                              )}
                            </td>
                            <td className="text-center">{item.total_amount.toFixed(2)}</td>
                            <td className="text-center">{item.total_quantity}</td>
                          </tr>
                        ))}
                        <tr className="font-weight-bold bg-light">
                          <td className="text-right"></td>
                          <td className="text-right">Subtotal:</td>
                          <td className="text-center">{group.totalAmount.toFixed(2)}</td>
                          <td className="text-center">{group.totalQuantity}</td>
                          
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {!loading && invoiceListGet.length > 0 && (
                <div className="card-footer bg-light">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between">
                        <span>Total Records:</span>
                        <strong>{totalCount}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between">
                        <span>Grand Total:</span>
                        <div>
                          <strong className="mr-3">Amount: {grandTotalAmount.toFixed(2)}</strong>
                          <strong>Quantity: {grandTotalQuantity}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!loading && invoiceListGet.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                  <h5>No report data found</h5>
                  <p className="text-muted">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;