


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import 'react-toastify/dist/ReactToastify.css';
import SupplierStockReport from './SupplierStockReport';

function SuppliersList({ showEdit, setShow }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [childSet, closeChild] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState("");
  const [totalItem, setTotalItemGet] = useState(10);
  const [searchInvoice, setSearchInvoice] = useState("");
  const [supplierData, setSupplierData] = useState(null);


  // Fetch data from server
  const fetchData = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/suppliers-list`, {
      params: {
        page: currentPage,
        limit: totalItem,
        getSearch: searchInvoice
      }
    })
      .then(res => {
        setData(res.data.results);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  // Handle page change for pagination
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem, searchInvoice]);

  const viewSupplierRecord = (supplier_id) => {
    axios.get(`${process.env.REACT_APP_API_URL}/supplier-stock-report/${supplier_id}`)
      .then(response => {
        setSupplierData(response.data);
        // setSupplierPersonalInfo(response.data.supplierData);
        closeChild(true);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <>
        


        
            
         
        
    
    <div className={`main-container ${showEdit ? "blur-background" : ""}`} style={showEdit ? {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
      backgroundColor: "#fff",
      padding: "10px",
      border: "1px solid #ccc",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      width: "98%",
      maxWidth: "1200px",
      height: "90vh",
      overflowY: "auto",
      overflowX: "hidden",
    } : {}}>
      {/* Close button */}
      <div className="d-flex justify-content-end">
        <button className="btn btn-primary mr-2 mb-2" onClick={() => setShow(false)}>
          x
        </button>
      </div>

      {/* Main content */}
      {showEdit === "suppliers" ? (
        <div>
          <div className="col-md-12 p-2">
            <div className="card-header text-warning bg-primary p-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="fas fa-list"></i> Suppliers List
                </div>
              </div>
            </div>

            <div className="border p-2">
              <div className="pb-3 d-flex justify-content-between">
                <div className="pb-3">
                  <select value={totalItem} onChange={e => setTotalItemGet(e.target.value)}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search........."
                    className="form-control"
                    onKeyUp={(e) => setSearchInvoice(e.target.value)}
                  />
                </div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>Name</th>
                    <th>Phone#</th>
                    <th>Account#</th>
                    <th className="text-center">View</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7">Loading...</td>
                    </tr>
                  ) : (
                    data.map((supplier, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{supplier.full_name}</td>
                        <td>{supplier.phone_no}</td>
                        <td>{supplier.account_no}</td>
                        <td className="text-center">
                          <a
                            href="#"
                            className="btn btn-success btn-sm"
                            onClick={() => viewSupplierRecord(supplier.id)}
                          >
                            <i className="fas fa-eye"></i>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

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
        </div>
      ) : null}
    </div>


{supplierData && childSet && (
    <div 
  className="blur-background"
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000,
    backgroundColor: "#fff",
    padding: "10px",
    border: "1px solid #ccc",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "98%",
    maxWidth: "1200px",
    height: "90vh",
    overflowY: "auto",
    overflowX: "hidden"
  }}
> 
<div className="d-flex justify-content-end">
        <button className="btn btn-primary mr-2 mb-2" onClick={() => closeChild(false)}>
          x
        </button>
      </div>

  {supplierData && <SupplierStockReport data={supplierData} />}
</div>
)}
    </>

    
  );
}

export default SuppliersList;
