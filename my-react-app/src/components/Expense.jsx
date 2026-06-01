import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ReactPaginate from 'react-paginate';
import Select from 'react-select';

function Expense() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, totalPagesGet] = useState("");
  const [getExpenseHead, setExpenseHead] = useState([]);


  const [report, getAllReports] = useState({
    from_date: '',
    to_date: '',
    report_type : ''
  });


  useEffect(() => {
    const fetchExpenseHead = () => {
      axios.get(process.env.REACT_APP_API_URL+"/expense-head-list")
        .then(res => {
          setExpenseHead(res.data.results);
        })
        .catch(err => console.log(err));
    };
    fetchExpenseHead();
  }, []); // Empty dependency array ensures this effect runs only once, on mount


  const [editFormData, setEditFormData] = useState({
    head_id: '',
    amount: '',
    remarks: '',
    payment_type: '',
    hidden_id: ''
  });

  //const [itemsPerPage, setitemsPerPage] = useState(10); 

  const [totalItem, setTotalItemGet] = useState(10);

  // const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage, totalItem]);



  const fetchData = () => {
    axios.get(process.env.REACT_APP_API_URL+"/expenses-list", {
      params: {
        page: currentPage,
        limit: totalItem
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


  const calculate = (event) => {
    let total_pieces = editFormData.total_pieces;
    let price = editFormData.price;
    let discount = editFormData.discount;
    var calculate_discount = (total_pieces * price) / 100 * discount;

    setEditFormData({ ...editFormData, total_price: (total_pieces * price) - calculate_discount })
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editFormData.hidden_id !== "") {

      const itemId = editFormData.hidden_id; // Assuming you have an id field for the item to be updated

      axios.put(`${process.env.REACT_APP_API_URL}/expense/${itemId}`, editFormData)
        .then(response => {
          console.log('Data updated successfully:', response.data);

          setEditFormData({
            head_id: '',
            amount: '',
            remarks: '',
            payment_type: '',
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
        const response = await fetch(process.env.REACT_APP_API_URL+'/insert-expense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        });
        const data = await response.json();
      
        setEditFormData({
          head_id: '',
          amount: '',
          remarks: '',
          payment_type: '',
          hidden_id: ''
        });

        // console.log(formData);

        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    }

  };


  const editItem = (expense_id) => {
    const expenseId = expense_id;
    axios.get(`${process.env.REACT_APP_API_URL}/expense-get/${expenseId}`)
      .then(response => {
        const { id, head_id, amount, remarks, payment_type } = response.data.results[0];
      
        setEditFormData({
          head_id: parseInt(head_id) || '', 
          amount: amount || '', 
          remarks: remarks || '',
          payment_type: payment_type || '',
          hidden_id: id || ''
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  const deleteItem = (expense_id) => {


    axios.delete(`${process.env.REACT_APP_API_URL}/delete-expense/${expense_id}`)
      .then(response => {
        console.log('Item deleted successfully:', response.data);
        fetchData();
      })
      .catch(error => {
        console.error('Error deleting item:', error);
      });


  }



  function getReport() {
    if(report.report_type == "pdf"){
      pdfReport();
    }else if(report.report_type == "excel"){
      excelReport();
    }
  }



  

function pdfReport(){
  

  axios.get(process.env.REACT_APP_API_URL+"/pdf-report-expense", {
    params: {
      from_date: report.from_date,
      to_date: report.to_date,
      report_type: "sale-pdf"
    },
    responseType: 'blob'  // Important to handle the PDF binary data correctly
  })
  .then(res => {
    // Create a URL for the blob object
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${report.from_date}-to-${report.to_date}.pdf`); // Optionally you can set the file name dynamically
    
    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Free up the created URL
    window.URL.revokeObjectURL(url);
  })
  .catch(err => console.log(err));


}
  





  
function excelReport() {
  axios.get(process.env.REACT_APP_API_URL+"/excel-report-expense", {
    params: {
      from_date: report.from_date,
      to_date: report.to_date,
    },
    responseType: 'blob'  // Important to handle the Excel binary data correctly
  })
  .then(res => {
    // Create a URL for the blob object
    const url = window.URL.createObjectURL(new Blob([res.data]));
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${report.from_date}-to-${report.to_date}.xlsx`); // Set the file name with .xlsx extension
    
    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Free up the created URL
    window.URL.revokeObjectURL(url);
  })
  .catch(err => console.error(err));
}





  return (
    <>
      <style>{`
        /* ── Expense Component (exp-) ── */
        .exp-wrapper {
          display: flex;
          height: 100%;
          gap: 0;
          font-family: 'Segoe UI', sans-serif;
          background: #f5f3ff;
        }

        /* ── Left Panel (Form) ── */
        .exp-left {
          width: 360px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, #4c1d95 0%, #7c3aed 100%);
          min-height: 100%;
        }
        .exp-left-header {
          padding: 18px 20px 14px;
          flex-shrink: 0;
        }
        .exp-left-header h5 {
          margin: 0;
          color: #fde68a;
          font-size: 1.05rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .exp-left-header p {
          margin: 4px 0 0;
          color: #c4b5fd;
          font-size: 0.78rem;
        }
        .exp-form-body {
          flex: 1;
          overflow-y: auto;
          padding: 4px 20px 16px;
        }
        .exp-form-group {
          margin-bottom: 14px;
        }
        .exp-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #ddd6fe;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .exp-input,
        .exp-select-native {
          width: 100%;
          padding: 8px 11px;
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 7px;
          background: rgba(255,255,255,0.12);
          color: #fff;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .exp-input::placeholder { color: #c4b5fd; }
        .exp-input:focus,
        .exp-select-native:focus {
          border-color: #fde68a;
          background: rgba(255,255,255,0.18);
        }
        .exp-select-native option { color: #1f2937; background: #fff; }
        /* react-select overrides inside left panel */
        .exp-form-body .react-select__control {
          background: rgba(255,255,255,0.12) !important;
          border: 1.5px solid rgba(255,255,255,0.2) !important;
          border-radius: 7px !important;
          box-shadow: none !important;
          min-height: 36px !important;
        }
        .exp-form-body .react-select__control--is-focused {
          border-color: #fde68a !important;
        }
        .exp-form-body .react-select__single-value { color: #fff !important; }
        .exp-form-body .react-select__placeholder { color: #c4b5fd !important; }
        .exp-form-body .react-select__input-container { color: #fff !important; }
        .exp-form-body .react-select__indicator { color: #c4b5fd !important; }
        .exp-form-body .react-select__indicator:hover { color: #fff !important; }
        .exp-form-body .react-select__indicator-separator { background: rgba(255,255,255,0.2) !important; }
        .exp-form-body .react-select__menu { border-radius: 8px !important; }
        .exp-form-footer {
          flex-shrink: 0;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.15);
          display: flex;
          gap: 8px;
        }
        .exp-btn-save {
          flex: 1;
          background: linear-gradient(135deg, #f59e0b, #fde68a);
          color: #1f2937;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: opacity 0.2s;
        }
        .exp-btn-save:hover { opacity: 0.9; }
        .exp-btn-clear {
          background: rgba(255,255,255,0.12);
          color: #ddd6fe;
          border: 1.5px solid rgba(255,255,255,0.2);
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .exp-btn-clear:hover { background: rgba(255,255,255,0.2); }

        /* ── Right Panel (List) ── */
        .exp-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .exp-right-header {
          background: #fff;
          border-bottom: 2px solid #ede9fe;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          flex-shrink: 0;
        }
        .exp-right-title {
          font-size: 1rem;
          font-weight: 700;
          color: #4c1d95;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .exp-report-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .exp-date-input {
          padding: 6px 9px;
          border: 1.5px solid #ddd6fe;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #374151;
          outline: none;
        }
        .exp-date-input:focus { border-color: #7c3aed; }
        .exp-report-select {
          padding: 6px 9px;
          border: 1.5px solid #ddd6fe;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #374151;
          outline: none;
          background: #fff;
        }
        .exp-btn-report {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .exp-btn-report:hover { opacity: 0.9; }
        .exp-list-body {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
        }
        .exp-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .exp-toolbar-label {
          font-size: 0.78rem;
          color: #6b7280;
          font-weight: 600;
        }
        .exp-per-page {
          padding: 5px 8px;
          border: 1.5px solid #ddd6fe;
          border-radius: 6px;
          font-size: 0.8rem;
          outline: none;
          background: #fff;
          color: #374151;
        }
        .exp-per-page:focus { border-color: #7c3aed; }

        /* Table */
        .exp-table-wrap {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.08);
          overflow: hidden;
          margin-bottom: 14px;
        }
        .exp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.855rem;
        }
        .exp-table thead tr {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          color: #fff;
        }
        .exp-table thead th {
          padding: 10px 12px;
          font-weight: 600;
          font-size: 0.73rem;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }
        .exp-table thead th.exp-th-center { text-align: center; }
        .exp-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.15s;
        }
        .exp-table tbody tr:hover { background: #faf5ff; }
        .exp-table tbody tr:last-child { border-bottom: none; }
        .exp-table td {
          padding: 9px 12px;
          color: #374151;
          vertical-align: middle;
        }
        .exp-table td.exp-td-center { text-align: center; }
        .exp-empty {
          text-align: center;
          color: #9ca3af;
          padding: 32px !important;
          font-size: 0.875rem;
        }

        /* Action buttons */
        .exp-btn-edit,
        .exp-btn-delete {
          border: none;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: opacity 0.2s;
        }
        .exp-btn-edit {
          background: #d1fae5;
          color: #065f46;
        }
        .exp-btn-edit:hover { background: #a7f3d0; }
        .exp-btn-delete {
          background: #fee2e2;
          color: #991b1b;
          margin-left: 4px;
        }
        .exp-btn-delete:hover { background: #fecaca; }

        /* Pagination */
        .exp-pagination {
          display: flex;
          justify-content: center;
          gap: 4px;
          flex-wrap: wrap;
          padding-top: 4px;
        }
        .exp-pagination .pagination {
          display: flex;
          gap: 4px;
          list-style: none;
          padding: 0;
          margin: 0;
          flex-wrap: wrap;
          justify-content: center;
        }
        .exp-pagination .page-item .page-link {
          padding: 5px 11px;
          border: 1.5px solid #ddd6fe;
          border-radius: 6px;
          color: #7c3aed;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          background: #fff;
          text-decoration: none;
          transition: all 0.15s;
        }
        .exp-pagination .page-item.active .page-link {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          border-color: #7c3aed;
        }
        .exp-pagination .page-item .page-link:hover {
          background: #f3e8ff;
        }
      `}</style>

      <div className="exp-wrapper">

        {/* ── Left: Form ── */}
        <div className="exp-left">
          <div className="exp-left-header">
            <h5><i className="fas fa-receipt"></i> Expense Form</h5>
            <p>Add or update an expense entry</p>
          </div>

          <div className="exp-form-body">
            {/* Head */}
            <div className="exp-form-group">
              <label className="exp-label"><i className="fas fa-tag" style={{marginRight:4}}></i>Category / Head</label>
              <Select
                classNamePrefix="react-select"
                options={getExpenseHead.map(h => ({ value: h.id, label: h.head_name }))}
                value={
                  getExpenseHead.find(h => h.id === editFormData.head_id)
                    ? { value: editFormData.head_id, label: getExpenseHead.find(h => h.id === editFormData.head_id).head_name }
                    : null
                }
                onChange={(opt) => setEditFormData({ ...editFormData, head_id: opt ? opt.value : '' })}
                placeholder="Select Category"
              />
            </div>

            {/* Amount */}
            <div className="exp-form-group">
              <label className="exp-label"><i className="fas fa-money-bill-wave" style={{marginRight:4}}></i>Amount</label>
              <input
                type="number"
                className="exp-input"
                id="amount"
                name="amount"
                placeholder="0.00"
                value={editFormData.amount || ""}
                onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
              />
            </div>

            {/* Payment Type */}
            <div className="exp-form-group">
              <label className="exp-label"><i className="fas fa-credit-card" style={{marginRight:4}}></i>Payment Type</label>
              <select
                name="payment_type"
                id="payment_type"
                className="exp-select-native"
                value={editFormData.payment_type || ""}
                onChange={(e) => setEditFormData({ ...editFormData, payment_type: e.target.value })}
              >
                <option value="">Select Payment Type</option>
                <option>Online</option>
                <option>Cash</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="exp-form-group">
              <label className="exp-label"><i className="fas fa-comment-alt" style={{marginRight:4}}></i>Remarks</label>
              <input
                type="text"
                className="exp-input"
                id="remarks"
                name="remarks"
                placeholder="Optional note..."
                value={editFormData.remarks || ""}
                onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="exp-form-footer">
            <button className="exp-btn-save" onClick={handleSubmit}>
              <i className="fas fa-save"></i>
              {editFormData.hidden_id ? "Update Expense" : "Save Expense"}
            </button>
            <button
              className="exp-btn-clear"
              onClick={() => setEditFormData({ head_id: '', amount: '', remarks: '', payment_type: '', hidden_id: '' })}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* ── Right: List ── */}
        <div className="exp-right">
          <div className="exp-right-header">
            <div className="exp-right-title">
              <i className="fas fa-list"></i> Expense List
            </div>
            <div className="exp-report-controls">
              <input
                type="date"
                className="exp-date-input"
                id="from_date"
                onChange={(e) => getAllReports({ ...report, from_date: e.target.value })}
              />
              <input
                type="date"
                className="exp-date-input"
                id="to_date"
                onChange={(e) => getAllReports({ ...report, to_date: e.target.value })}
              />
              <select
                className="exp-report-select"
                onChange={(e) => getAllReports({ ...report, report_type: e.target.value })}
              >
                <option value="">Export As</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <button className="exp-btn-report" onClick={getReport}>
                <i className="fas fa-download"></i> Get Report
              </button>
            </div>
          </div>

          <div className="exp-list-body">
            <div className="exp-toolbar">
              <span className="exp-toolbar-label">Show</span>
              <select className="exp-per-page" value={totalItem} onChange={handleTotalItemChange}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
              <span className="exp-toolbar-label">entries</span>
            </div>

            <div className="exp-table-wrap">
              <table className="exp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Receipt#</th>
                    <th>Head</th>
                    <th>Amount</th>
                    <th>Pay Type</th>
                    <th>Remarks</th>
                    <th className="exp-th-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="exp-empty">
                        <i className="fas fa-spinner fa-spin" style={{marginRight:6}}></i>Loading…
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="exp-empty">No expense records found</td>
                    </tr>
                  ) : (
                    data.map((expenses, index) => (
                      <tr key={index}>
                        <td style={{color:"#9ca3af",fontSize:"0.8rem"}}>{expenses.id}</td>
                        <td style={{fontWeight:600,color:"#4c1d95"}}>{expenses.receipt_no}</td>
                        <td>{expenses.head_name}</td>
                        <td style={{fontWeight:600}}>{expenses.amount}</td>
                        <td>
                          <span style={{
                            background: expenses.payment_type === "Cash" ? "#d1fae5" : "#dbeafe",
                            color: expenses.payment_type === "Cash" ? "#065f46" : "#1e40af",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            fontSize: "0.72rem",
                            fontWeight: 700
                          }}>
                            {expenses.payment_type || "—"}
                          </span>
                        </td>
                        <td style={{color:"#6b7280",fontSize:"0.82rem"}}>{expenses.remarks || "—"}</td>
                        <td className="exp-td-center">
                          <button className="exp-btn-edit" onClick={() => editItem(expenses.id)}>
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button className="exp-btn-delete" onClick={() => deleteItem(expenses.id)}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="exp-pagination">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageChange}
                containerClassName={"pagination"}
                pageClassName={"page-item"}
                activeClassName={"active"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
              />
            </div>
          </div>
        </div>

      </div>
    </>
  )



}

export default Expense;