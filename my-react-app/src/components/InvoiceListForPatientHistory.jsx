import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import useWebSocket from './useWebSocket';
import { useAuth } from './AuthContext';
import InvoiceModal from './InvoiceModal';

const InvoiceListForPatientHistory = ({getSearch}) => {
  const [invoiceListGet, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [patientIDGet, setPatientID] = useState(getSearch);
  const [invoiceFilter, setInvoiceFilter] = useState('today');
  const [frontendSearchTerm, setFrontendSearchTerm] = useState(''); // New state for frontend search

  const [viewedInvoices, setViewedInvoices] = useState([]);
  const [newInvoices, setNewInvoices] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      limit: 1000,
      search: searchInvoice,
      patient_id: patientIDGet, 
      user_type: user.user.user_type,
      user_id: user.user.user_id,
      filter: invoiceFilter,
    };

    axios
      .get(process.env.REACT_APP_API_URL + `/get-invoice-list-patient-history/`, { params })
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

  const handleSearchChange = (event) => {
    setSearchInvoice(event.target.value);
  };

  // const handleKeyDown = (event) => {
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //     searchRef.current = searchInvoice;
  //     // fetchInvoiceData(false);
  //   }
  // };


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

  // const handleFilterChange = (filter) => {
  //   setInvoiceFilter(filter);
  //   setCurrentPage(1);
  //   fetchInvoiceData(false);
  // };


  

  function getReport(from_date, to_date) {
    console.log(from_date, to_date);
  }

  const handleViewInvoice = (invoice_no) => {
    axios.get(`${process.env.REACT_APP_API_URL}/view-invoice-new`, {
      params: {
        invoice_no: invoice_no 
      }
    })
      .then(res => {
        let results = res.data.results;
        setInvoiceData(results);
        setIsModalOpen(true);
      })
      .catch(err => console.log(err));

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
  }, [currentPage]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Filter invoices for frontend search
  const filteredInvoices = invoiceListGet.filter(invoice => {
    if (!frontendSearchTerm) return true;
    const searchLower = frontendSearchTerm.toLowerCase();
    return (
      (invoice.full_name && invoice.full_name.toLowerCase().includes(searchLower)) ||
      (invoice.phone_no && invoice.phone_no.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      <div className="mt-2">
        <div className="d-flex justify-content-end">

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
              <th className="text-center">Name</th>
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
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No invoices found</td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => {
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
                    <td className="text-center">{invoice.patient_name}</td>
                    <td className="text-center">{invoice.phone_no}</td>
                    <td className="text-center">{invoice.total_amount}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-warning mr-2"
                        onClick={() => handleViewInvoice(invoice.invoice_no)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
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
      {isModalOpen && <InvoiceModal invoiceData={invoiceData} onClose={handleCloseModal} />}
    </div>
  );
};

export default InvoiceListForPatientHistory;