


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';

function SaleReport() {



    const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, totalPagesGet] = useState("");
  const [getCategories, setCategories] = useState([]);

  const [totalItem, setTotalItemGet] = useState(5);

  const [searchInvoice, setSearchInvoice] = useState("");

  const [tableData, setTableData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [invoiceList, setIvoiceList] = useState([]);

  const [getItems, setItems] = useState([]);


  const [invoiceTable, updateInvoiceTable] = useState([]);


  const [isVisible, setIsVisible] = useState(false);

  const [invoiceData, showInvoiceData] = useState([]);





  const ViewInvoice = (invoice_no) => {


    axios.get(`${process.env.REACT_APP_API_URL}/view-invoice/${invoice_no}`)
      .then(response => {
        console.log(response.data.results);
        setIsVisible(true);
        showInvoiceData(response.data.results);

      })
      .catch(error => {
        console.error('Error deleting item:', error);
      });


  }




  
  const editInvoice = (invoice_no_get) => {
    axios.get(`${process.env.REACT_APP_API_URL}/get-invoice-no/${invoice_no_get}`)
      .then(response => {
        const invoiceData = response.data.results; // Original data from the API

        console.log(invoiceData);
        // Transforming each item in the array
        const transformedData = invoiceData.map(item => {
          return {
            // Assuming you want to keep some original properties
            item: item.item,
            hidden_id: item.id,
            item_name: item.item_name, // Rename property
            price: parseFloat(item.price).toFixed(2), // Format and keep original
            quantity: item.quantity, // Keep original
            discount: item.discount, // Keep original
            rate_after_discount: item.price - (item.price / 100 * item.discount), // Calculate new property
            total: (item.price - (item.price / 100 * item.discount)) * item.quantity,
            stock: item.stock,
            stock_remain: item.stock_remain,
            invoice_no: item.invoice_no
          };
        });

        setTableData(transformedData); // Set transformed data to state
      })
      .catch(error => {
        console.error('Error:', error);
      });

  }


  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };


  const deleteInvoice = (invoice_no) => {


    axios.delete(`${process.env.REACT_APP_API_URL}/delete-invoice/${invoice_no}`)
      .then(response => {
        console.log('Item deleted successfully:', response.data);
        fetchData();
      })
      .catch(error => {
        console.error('Error deleting item:', error);
      });


  }




    const handleTotalItemChange = (event) => {
        const newValue = event.target.value;
    
        if (event.target.id == "search-invoice") {
    
          if (event.key == "Enter") {
            setSearchInvoice(newValue);
            console.log("Search started with: ", newValue);
          }
    
    
        } else {
          setTotalItemGet(newValue);
        }
      }

      


      useEffect(() => {
        // const fetchItems = () => {
        axios.get(process.env.REACT_APP_API_URL+"/get-invoice-list")
          .then(res => {
            setIvoiceList(res.data.results);
          })
          .catch(err => console.log(err));
        // };
    
        // fetchItems();
      }, []);

      

  
      

  const fetchData = () => {


    axios.get(process.env.REACT_APP_API_URL+"/get-invoice-list", {
      params: {
        page: currentPage,
        limit: totalItem,
        getSearch: searchInvoice
      }
    })
      .then(res => {
        setIvoiceList(res.data.results);
        setTotalCount(0);
        totalPagesGet(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => console.log(err));



  };


  // const itemsPerPage = 10;
  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem, searchInvoice, invoiceTable]);



  useEffect(() => {
    // const fetchItems = () => {
    axios.get(process.env.REACT_APP_API_URL+"/get-invoice-list")
      .then(res => {
        setIvoiceList(res.data.results);
      })
      .catch(err => console.log(err));
    // };

    // fetchItems();
  }, []);




  useEffect(() => {
    const fetchItems = () => {
      axios.get(process.env.REACT_APP_API_URL+"/items")
        .then(res => {
          setItems(res.data.results);

        })
        .catch(err => console.log(err));
    };

    fetchItems();
  }, []);





  return (    
    <div className='fixed_div'>
    <div>
      <h5 className='text-warning bg-primary p-2 card-header'>
        <div className='row'>
          <div className="col">
            <i className="fas fa-list"></i> Invoice List
          </div>
        </div>
      </h5>

      <div className='border p-2'>
        <div className='pb-3 d-flex justify-content-between'>
          <div>
            <select value={totalItem} onChange={handleTotalItemChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
          <div>
            <input type="text" placeholder='Search Invoice' className='form-control' id='search-invoice' onKeyUp={handleTotalItemChange} />
          </div>


        </div>


        <table className='table'>
          <thead>
            <tr>
              <th className='text-center' >Invoice#</th>
              <th className='text-center' >Quantity</th>
              <th className='text-center' >Total</th>
              <th className='text-center'>View</th>
              <th className='text-center'>Edit</th>
              <th className='text-center'>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            ) : (
              invoiceList.map((invoice_data, index) => (
                <tr key={index}>
                  <td className='text-center'>{invoice_data.invoice_no}</td>
                  <td className='text-center'>{invoice_data.total_quantity}</td>
                  <td className='text-center'>{invoice_data.total_amount}</td>

                  <td className='text-center'>
                    <div><button href="#" className='btn btn-warning btn-sm' onClick={() => ViewInvoice(invoice_data.invoice_no)}><i className="fas fa-eye"></i>

                      {/* {isVisible ? 'Close' : 'View'} */}

                    </button></div>
                  </td>

                  <td className='text-center'>
                    <div><a href="#" className='btn btn-success btn-sm' onClick={() => editInvoice(invoice_data.invoice_no)} ><i className="fas fa-edit"></i></a></div>
                  </td>
                  <td className='text-center'>
                    <div><a href="#" className='btn btn-danger btn-sm' onClick={() => deleteInvoice(invoice_data.invoice_no)}><i className="fas fa-trash-alt"></i></a></div>
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



  )
}

export default SaleReport