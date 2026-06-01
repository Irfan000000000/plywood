
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from "date-fns";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const ExpiredStockReport = () => {
  const [stockReport, setStockReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    from_date: null,
    to_date: null
  });
  const [isLoading, setIsLoading] = useState(false);




  const handleStockToggle = (stockId, currentStatus, removed_expired_quantity) => {
    const newStatus = currentStatus === 'In Stock' ? 'Out Of Stock' : 'In Stock';
    const actionText = newStatus === 'In Stock' ? 'restock' : 'mark as out of stock';
  
    if (window.confirm(`Are you sure you want to ${actionText} this item?`)) {
      setIsLoading(true);
      axios.put(`${process.env.REACT_APP_API_URL}/set-stock-status/${stockId}`, { status: newStatus, removed_expired_quantity:removed_expired_quantity })
        .then(() => {
          fetchStockData(false); // Refresh data
        })
        .catch(error => {
          console.error('Error updating stock status', error);
          alert('Failed to update status');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };


  const fetchStockData = (shouldLoad = true) => {
    if (shouldLoad) setIsLoading(true);
    // setIsLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/expired_stock_report`, {
      params: {
        from_date: formData.from_date ? format(formData.from_date, 'yyyy-MM-dd') : null,
        to_date: formData.to_date ? format(formData.to_date, 'yyyy-MM-dd') : null,
      }
    })
    .then((response) => {
      const data = response.data.results;
      setStockReport(data);
      setFilteredReport(data);
      calculateSummary(data);
    })
    .catch((error) => {
      console.error('Error fetching stock data', error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  const calculateSummary = (data) => {
    let totalItems = 0;
    let totalQuantity = 0;
    let totalValue = 0;
    let criticalItems = 0;
    let warningItems = 0;

    data.forEach(item => {
      const daysLeft = differenceInDays(new Date(item.date_of_expiry), new Date());
      totalItems++;
      totalQuantity += parseFloat(item.quantity - item.allocated_quantity) || 0;
      totalValue += parseFloat(item.purchase_rate_calculate_per_tablet * (item.quantity - item.allocated_quantity)) || 0;
      
      if (daysLeft <= 3) criticalItems++;
      else if (daysLeft <= 7) warningItems++;
    });

    setSummary({
      totalItems,
      totalQuantity,
      totalValue,
      criticalItems,
      warningItems
    });
  };

  const handleDateChangeForReport = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleGenerateReport = () => {
    if (formData.from_date && formData.to_date) {
      fetchStockData(false);
    }
  };

  useEffect(() => {
    fetchStockData(false);
  }, []);

  const handleResetDates = () => {
    setFormData({
      from_date: null,
      to_date: null
    });
    setStockReport([]);
    setFilteredReport([]);
    setSummary(null);
    setSearchTerm('');
  };

  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filteredData = stockReport.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(term);
      const daysLeft = differenceInDays(new Date(item.date_of_expiry), new Date());
      return matchesSearch && daysLeft <= 10; // Only show items expiring within 10 days
    });

    setFilteredReport(filteredData);
    calculateSummary(filteredData);
  };

  const downloadPDF = () => {
    if (!summary || filteredReport.length === 0) {
      console.error("No data available to generate PDF");
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;

    // Add Summary Section
    pdf.setFontSize(14);
    pdf.text("Expired Stock Summary", margin, margin);
    pdf.setFontSize(10);

    const summaryData = [
      ["Total Items", summary.totalItems],
      ["Total Quantity", summary.totalQuantity],
      ["Total Value", `${summary.totalValue.toFixed(2)}`],
      ["Critical Items (<3 days)", summary.criticalItems],
      ["Warning Items (4-7 days)", summary.warningItems],
      [
        "Date Range",
        `${formData.from_date ? format(formData.from_date, 'dd-MM-yyyy') : ''} to ${
          formData.to_date ? format(formData.to_date, 'dd-MM-yyyy') : ''
        }`,
      ],
    ];

    autoTable(pdf, {
      startY: margin + 5,
      head: [["Description", "Value"]],
      body: summaryData,
      theme: 'striped',
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    // Add Detailed Report
    pdf.setFontSize(14);
    pdf.text("Expired Stock Details", margin, pdf.lastAutoTable.finalY + 10);
    pdf.setFontSize(10);

    const tableData = filteredReport.map((item) => {
      const daysLeft = differenceInDays(new Date(item.date_of_expiry), new Date());
      return [
        item.item_name,
        item.supplier_name,
        item.quantity-item.allocated_quantity,
        format(new Date(item.date_of_expiry), 'dd-MMM-yyyy'),
        daysLeft <= 0 ? 'EXPIRED' : daysLeft,
        `${item.purchase_rate_calculate_per_tablet}`,
        `${(item.purchase_rate_calculate_per_tablet * (item.quantity-item.allocated_quantity)).toFixed(2)}`,
        item.rack_no
      ];
    });

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 15,
      head: [
        ["Item", "Supplier", "Qty", "Expiry Date", "Days Left", "Unit Price", "Total Value", "Location"],
      ],
      body: tableData,
      theme: 'striped',
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 102, 204] },
      didDrawCell: (data) => {
        if (data.column.index === 4) { // Days Left column
          const daysLeft = data.cell.raw;
          if (daysLeft === 'EXPIRED' || daysLeft <= 0) {
            pdf.setTextColor(255, 0, 0);
          } else if (daysLeft <= 3) {
            pdf.setTextColor(255, 0, 0); // Red for critical
          } else if (daysLeft <= 7) {
            pdf.setTextColor(255, 165, 0); // Orange for warning
          }
        }
      },
    });

    pdf.save(`Expired_Stock_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="w-100 mt-4">
      <div className="d-flex justify-content-center">
        <div className="col-md-4">
          <div className="form-group report_date">
            <DatePicker
              selected={formData.from_date}
              onChange={(date) => handleDateChangeForReport('from_date', date)}
              selectsStart
              startDate={formData.from_date}
              endDate={formData.to_date}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="From Date"
              maxDate={formData.to_date || new Date()}
              isClearable
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group report_date">
            <DatePicker
              selected={formData.to_date}
              onChange={(date) => handleDateChangeForReport('to_date', date)}
              selectsEnd
              startDate={formData.from_date}
              endDate={formData.to_date}
              minDate={formData.from_date}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              placeholderText="To Date"
              maxDate={new Date()}
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mb-2">
        <div>
          <button
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={!formData.from_date || !formData.to_date || isLoading}
          >
            {isLoading ? 'Loading...' : 'Generate Report'}
          </button>
          <button
            className="btn btn-outline-secondary ml-2"
            onClick={handleResetDates}
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            className="btn btn-danger ml-2"
            onClick={downloadPDF}
            disabled={!summary || filteredReport.length === 0 || isLoading}
          >
            {/* <FaExclamationTriangle className="me-1" /> */}
            Download PDF
          </button>
        </div>
      </div>

      {summary && (
        <div className="card mb-4">
          <div className="card-header bg-danger text-white">
            <h5>Expired Stock Summary</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Total Items</th>
                      <td className="text-right">{summary.totalItems}</td>
                    </tr>
                    <tr>
                      <th>Total Quantity</th>
                      <td className="text-right">{summary.totalQuantity}</td>
                    </tr>
                    <tr>
                      <th>Total Value</th>
                      <td className="text-right">{summary.totalValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Critical Items (≤3 days)</th>
                      <td className="text-right text-danger">{summary.criticalItems}</td>
                    </tr>
                    <tr>
                      <th>Warning Items (4-7 days)</th>
                      <td className="text-right text-warning">{summary.warningItems}</td>
                    </tr>
                    <tr>
                      <th>Date Range</th>
                      <td className="text-right">
                        {formData.from_date && format(formData.from_date, 'dd-MM-yyyy')} to{' '}
                        {formData.to_date && format(formData.to_date, 'dd-MM-yyyy')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Item"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-danger text-white">
          <h5>Expired Stock Details</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Sr#</th>
                  <th>Item</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Purchase Price</th>
                  <th>Total Value</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport.map((item, index) => {
                  const daysLeft = differenceInDays(new Date(item.date_of_expiry), new Date());
                  let rowClass = '';
                  let daysLeftDisplay = daysLeft;
                  
                  if (daysLeft <= 0) {
                    rowClass = 'table-danger';
                    daysLeftDisplay = 'EXPIRED';
                  } else if (daysLeft <= 3) {
                    rowClass = 'table-danger';
                  } else if (daysLeft <= 7) {
                    rowClass = 'table-warning';
                  }

                  return (
                    <tr key={item.id} className={rowClass}>
                      <td>{index + 1}</td>
                      <td>{item.item_name}</td>
                      <td>{item.supplier_name}</td>
                      <td>{item.quantity-item.allocated_quantity}</td>
                      <td>{format(new Date(item.date_of_expiry), 'dd-MMM-yyyy')}</td>
                      <td>
                        {daysLeft <= 0 ? (
                          <span className="badge bg-white">EXPIRED</span>
                        ) : (
                          daysLeft
                        )}
                      </td>
                      <td>{item.purchase_rate_calculate_per_tablet}</td>
                      <td>{(item.purchase_rate_calculate_per_tablet * (item.quantity-item.allocated_quantity)).toFixed(2)}</td>
                      <td>{item.rack_no}</td>
                     
                      <td>
  <button
    className={`btn btn-sm ${item.stock_status === 'In Stock' ? 'btn-success' : 'btn-danger'}`}
    onClick={() => handleStockToggle(item.id, item.stock_status, (item.quantity-item.allocated_quantity))}
    disabled={isLoading}
    title={item.stock_status === 'In Stock' ? 'Set to Out of Stock' : 'Set to In Stock'}
  >
    {item.stock_status === 'In Stock' ? (
      <><i className="fas fa-check-circle me-1"></i> In Stock</>
    ) : (
      <><i className="fas fa-times-circle me-1"></i> Out of Stock</>
    )}
  </button>
</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredReport.length === 0 && (
              <div className="text-center py-4 text-muted">
                {isLoading ? 'Loading...' : 'No expired stock found in the selected date range'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiredStockReport;