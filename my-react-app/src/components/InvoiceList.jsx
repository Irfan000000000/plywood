
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import useWebSocket from './useWebSocket';
import { useAuth } from './AuthContext';

const InvoiceList = ({ ViewInvoice, editInvoice }) => {
  const [invoiceListGet, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('today');

  const [viewedInvoices, setViewedInvoices] = useState([]);
  const [newInvoices, setNewInvoices] = useState([]);


  const [formData, setFormData] = useState({
      from_date: '',
      to_date:''
    });

  const { user } = useAuth();
  const searchRef = useRef('');

  // Load viewed invoice list from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewedInvoices') || '[]');
    setViewedInvoices(stored);
  }, []);

  const fetchInvoiceData = (shouldLoad = true) => {
    if (shouldLoad) setLoading(true);

    const params = {
      page: currentPage,
      limit: 100,
      search: searchRef.current,
      user_type: user.user.user_type,
      user_id: user.user.user_id,
      filter: invoiceFilter,
    };

    axios
      .get(process.env.REACT_APP_API_URL + `/get-invoice-list/`, { params })
      .then((response) => {
        setInvoiceList(response.data.results);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
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

  useWebSocket('ws://192.168.1.89:4000', handleWebSocketMessage);

  // const deleteInvoice = (invoice_no) => {
  //   if (window.confirm('Are you sure you want to delete this invoice?')) {
  //     axios
  //       .delete(`${process.env.REACT_APP_API_URL}/delete-invoice/${invoice_no}`)
  //       .then((response) => {
  //         console.log('Item deleted successfully:', response.data);
  //         setInvoiceList((prevList) =>
  //           prevList.filter((invoice) => invoice.invoice_no !== invoice_no)
  //         );
  //       })
  //       .catch((error) => {
  //         console.error('Error deleting item:', error);
  //       });
  //   }
  // };

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
    // console.log(filter);
    setInvoiceFilter(filter);
    setCurrentPage(1);
    // fetchInvoiceData(false);
  };


  function getReport(from_date, to_date){
    console.log(from_date, to_date);
  }

  const handleViewInvoice = (invoice_no) => {
    ViewInvoice(invoice_no);


    // if(user.user.user_type == 'Doctor')
    // Add to viewed and save in localStorage
    setViewedInvoices((prev) => {
      const updated = [...new Set([...prev, invoice_no])];
      localStorage.setItem('viewedInvoices', JSON.stringify(updated));
      return updated;
    });

    setNewInvoices((prev) => prev.filter((id) => id !== invoice_no));
  };

  useEffect(() => {
    fetchInvoiceData(false);
  }, [currentPage, invoiceFilter]);

  return (
    <div>
      <div className="mt-2">
        <div className="d-flex justify-content-between">
          <div>
            <button
              className={`btn btn-sm btn-info mr-2 ${invoiceFilter === 'today' ? 'active' : ''}`}
              onClick={() => handleFilterChange('today')}
            >
              Today Invoices
            </button>
            <button
              className={`btn btn-sm btn-info ${invoiceFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Invoices
            </button>

            

           

          </div>

          

          <input
            type="text"
            placeholder="Search Invoice"
            className="form-control mb-2 col-md-2 mr-2"
            value={searchInvoice}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>

      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="text-center">Invoice No</th>
              <th>MR#</th>
              <th>Name</th>
              <th className="text-center">Phone#</th>
              <th className="text-center">Total</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">Loading...</td>
              </tr>
            ) : (
              invoiceListGet.map((invoice) => {
                const isNew = newInvoices.includes(invoice.invoice_no);
                return (
                  <tr
                    key={invoice.invoice_no}
                    className={isNew ? 'table-success' : ''}
                  >
                    <td className="text-center">
                      {invoice.invoice_no}
                      {isNew && <span className="badge badge-primary ml-2">New</span>}
                    </td>
                    <td>{invoice.mrNo}</td>
                    <td>{invoice.patient_name}</td>
                    <td className="text-center">{invoice.phone_no}</td>
                    <td className="text-center">{invoice.total_amount || 0}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-warning mr-2"
                        onClick={() => handleViewInvoice(invoice.invoice_no)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>

                      <button
                        className="btn btn-sm btn-success mr-2"
                        onClick={() => editInvoice(invoice.invoice_no)}
                        disabled={user.user.user_type == 'Doctor'}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>

                      {/* <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteInvoice(invoice.invoice_no)}
                        disabled={user.user.user_type !== 'Receptionist'}
                      >
                        <i className="fas fa-trash-alt"></i> Delete
                      </button> */}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end">
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
  );
};

export default InvoiceList;
