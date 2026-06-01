import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ReactPaginate from 'react-paginate';
import Select from 'react-select';

function Category() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, totalPagesGet] = useState("");
  const [getCategories, setCategories] = useState([]);



  const [report, getAllReports] = useState({
    from_date: '',
    to_date: '',
    report_type : ''
  });


  const [searchCategoryReport, getSearchCategoryReport] = useState({
    search: '',
  });




  function searchCategory() {
    fetchData();
  }


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      getSearchCategoryReport(searchCategoryReport);
      fetchData();
    }
  };




  function getReport() {
    if(report.report_type == "pdf"){
      // pdfReport();
    }else if(report.report_type == "excel"){
      // excelReport();
    }
  }


  useEffect(() => {
    const fetchCategory = () => {
      axios.get(process.env.REACT_APP_API_URL+"/categories")
        .then(res => {
          setCategories(res.data.results);
        })
        .catch(err => console.log(err));
    };

    fetchCategory();
  }, []); // Empty dependency array ensures this effect runs only once, on mount


  const [editFormData, setEditFormData] = useState({
    category: '',
    hidden_id: ''
  });

  //const [itemsPerPage, setitemsPerPage] = useState(10); 

  const [totalItem, setTotalItemGet] = useState(10);

  // const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem]);



  

  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL+"/categories", {
      params: {
        page: currentPage,
        limit: totalItem,
        search: searchCategoryReport.search
      }
    })
      .then(res => {
        setData(res.data.results);
        setTotalCount(0);
        totalPagesGet(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => console.log(err));
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected + 1);
  };

  const handleTotalItemChange = (event) => {

    const newValue = event.target.value;
    setTotalItemGet(newValue);

  }


  


  const handleSubmit = async (e) => {

    
    e.preventDefault();
    if (editFormData.hidden_id !== "") {

      const category_id = editFormData.hidden_id; // Assuming you have an id field for the item to be updated

      axios.put(`${process.env.REACT_APP_API_URL}/update-category/${category_id}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);

          setEditFormData({
            category: '',
            hidden_id: ''

          });

          fetchData();

          // You can perform additional actions after successful update
        })
        .catch(error => {
          console.error('Error updating data:', error);
        });


    } else {

      try {
        const response = await fetch(process.env.REACT_APP_API_URL+'/insert-category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });
        const data = await response.json();
       
        setEditFormData({
          category: '',
          hidden_id: '',
        });

        // console.log(formData);

        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    }

  };


  const editItem = (category_id) => {
    const category = category_id;
    axios.get(`${process.env.REACT_APP_API_URL}/category-get/${category}`)
      .then(response => {
        const { id, category } = response.data.results[0];
       
        setEditFormData({
          category: category || '', // Providing default value if response doesn't contain category
          hidden_id: id || ''
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  const deleteItem = (category_id) => {


    axios.delete(`${process.env.REACT_APP_API_URL}/delete-category/${category_id}`)
      .then(response => {
        console.log('Item deleted successfully:', response.data);
        fetchData();
      })
      .catch(error => {
        console.error('Error deleting item:', error);
      });


  }






  return (
    <>
      <div className="d-flex">
        <div className='col-md-6 p-2'>
          <h5 className='text-warning bg-primary p-2 card-header border'><i className="fas fa-industry"></i> Manufacturer Form</h5>
          <form className='border p-3 border'>

            <div className="form-group row">
              <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Manufacturer</label>
              <div className="col-sm-10 ">
                <input type="text" className="form-control" id="category_name" name='category_name' value={editFormData.category ? editFormData.category : ""} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} />
              </div>
            </div>

            <div className="form-group row">
              <label htmlFor="inputEmail3" className="col-sm-2 col-form-label"></label>
              <div className="col-sm-10 d-flex justify-content-end">
                <input type="submit" className='btn btn-sm btn-primary' value={"Save"} onClick={handleSubmit} />
              </div>
            </div>

          </form>
        </div>

        <div className='col-md-6 p-2' >


        <div className="card-header text-warning bg-primary p-2">
  <div className="d-flex justify-content-between align-items-center">
    <div>
      <i className="fas fa-list"></i> Manufacturer List
    </div>


    {/* search category */}


    <div className="d-flex">
      <div className="me-2 mr-2">
        <input type="text" className="form-control" id="search_category"  onKeyDown={handleKeyDown}   onChange={(e) => getSearchCategoryReport({ ...searchCategoryReport, search: e.target.value })} />
      </div>
      <button className="btn btn-sm btn-danger" onClick={searchCategory} >Search</button>
    </div> 




     <div className="d-none">
      <div className="me-2 mr-2">
        <input type="date" className="form-control" id="from_date"  onChange={(e) => getAllReports({ ...report, from_date: e.target.value })} />
      </div>

      <div className="me-2 mr-2">
        <input type="date" className="form-control" id="to_date" onChange={(e) => getAllReports({ ...report, to_date: e.target.value })} />
      </div>

      <div className="me-2 mr-2">
        <select name="type" id="type" className="form-control" onChange={(e) => getAllReports({ ...report, report_type: e.target.value })}>
          <option value="">Select Type</option>
         
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      <button className="btn btn-sm btn-danger" onClick={getReport} >Get Report</button>
    </div> 



  </div>
</div>

          <div className='border p-2'>
            <div className='pb-3'>
              <select value={totalItem} onChange={handleTotalItemChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>


            <table className='table'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
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
                
                
                  data.map((category, index) => (
                    <tr key={index}>
                      <td>{category.id}</td>
                      <td>{category.category}</td>
                      <td className='text-center'>
                        <div><a href="#" className='btn btn-success btn-sm' onClick={() => editItem(category.id)} ><i className="fas fa-edit"></i></a></div>
                      </td>
                      <td className='text-center'>
                        <div><a href="#" className='btn btn-danger btn-sm' onClick={() => deleteItem(category.id)}><i className="fas fa-trash-alt"></i></a></div>
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

    </>
  )



}

export default Category