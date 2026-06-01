// import React, { useState, useEffect, useRef } from 'react';
// import Barcode from 'react-barcode'; // Assumes installed in local environment
// import axios from 'axios'; // Assumes installed in local environment

// const StockBarcodeGenerator = ({onClose , barcodeInvoiceNo}) => {
//   const [stockData, setStockData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [quantities, setQuantities] = useState({});
//   const [barcodeOptions, setBarcodeOptions] = useState({
//     format: 'CODE128',
//     width: 2,
//     height: 100,
//     displayValue: true,
//     fontSize: 14,
//     textAlign: 'center',
//     textPosition: 'bottom'
//   });
//   const [barcodeErrors, setBarcodeErrors] = useState({});
//   const printRef = useRef();

//   // Validate barcode value for the given format
//   const validateBarcode = (value, format) => {
//     try {
//       if (!value) return false;
//       if (format === 'EAN13' && !/^\d{13}$/.test(value)) return false;
//       if (format === 'UPC' && !/^\d{12}$/.test(value)) return false;
//       if (format === 'CODE39' && !/^[A-Z0-9\-.$\/+% ]+$/.test(value)) return false;
//       // CODE128 supports most characters, so minimal validation
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   // Mock API function - replace with your actual API endpoint
//   const fetchStockData = async () => {
//       const stock_invoice_no = barcodeInvoiceNo;
//     try {
//       setLoading(true);

    
//       // Replace this mock data with actual axios API call:
//       const response = await axios.get(
//         process.env.REACT_APP_API_URL +
//           `/get-all-stock-with-barcode/${stock_invoice_no}`
//       );
//       // console.log(response.data);

//       // Simulating API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const mockData = response.data.results;
      
//       // Validate barcodes
//       const errors = {};
//       mockData.forEach(item => {
//         if (!validateBarcode(item.barcode || item.sku, barcodeOptions.format)) {
//           errors[item.id] = `Invalid barcode for ${barcodeOptions.format}`;
//         }
//       });
//       setBarcodeErrors(errors);
      
//       return mockData;
//     } catch (error) {
//       console.error('Error fetching stock data:', error);
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load stock data on component mount
//   useEffect(() => {
//     const loadStockData = async () => {
//       const data = await fetchStockData();
//       setStockData(data);
      
//       // Initialize quantities with stock amounts
//       const initialQuantities = {};
//       data.forEach(item => {
//         initialQuantities[item.id] = 1;
//       });
//       setQuantities(initialQuantities);
//     };
    
//     loadStockData();
//   }, []);

//   // Update barcode errors when format changes
//   useEffect(() => {
//     const errors = {};
//     stockData.forEach(item => {
//       if (!validateBarcode(item.barcode || item.sku, barcodeOptions.format)) {
//         errors[item.id] = `Invalid barcode for ${barcodeOptions.format}`;
//       }
//     });
//     setBarcodeErrors(errors);
//   }, [barcodeOptions.format, stockData]);

//   // Update quantity for specific item
//   const updateQuantity = (itemId, change) => {
//     setQuantities(prev => ({
//       ...prev,
//       [itemId]: Math.max(1, (prev[itemId] || 1) + change)
//     }));
//   };

//   // Set specific quantity
//   const setQuantity = (itemId, quantity) => {
//     const qty = Math.max(1, parseInt(quantity) || 1);
//     setQuantities(prev => ({
//       ...prev,
//       [itemId]: qty
//     }));
//   };

//   // Generate barcodes for printing
//   const generateBarcodesForPrint = () => {
//     const barcodes = [];
//     stockData.forEach(item => {
//       const quantity = quantities[item.id] || 1;
//       for (let i = 0; i < quantity; i++) {
//         barcodes.push({
//           ...item,
//           copyNumber: i + 1,
//           totalCopies: quantity
//         });
//       }
//     });
//     return barcodes;
//   };

//   // Print function
//   const handlePrint = () => {
//     const printWindow = window.open('', '_blank');
//     const printContent = printRef.current.innerHTML;

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Stock Barcodes</title>
//           <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
//           <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
//             .barcode-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
//             .barcode-item { border: 1px solid #dee2e6; padding: 15px; page-break-inside: avoid; }
//             .item-info { text-align: center; margin-bottom: 10px; }
//             .item-name { font-weight: bold; font-size: 14px; }
//             .item-sku { color: #6c757d; font-size: 12px; }
//             .item-price { color: #333; font-size: 12px; }
//             @media print { .no-print { display: none; } }
//           </style>
//         </head>
//         <body>
//           ${printContent}
//           <script>
//             document.querySelectorAll('svg[data-barcode]').forEach(svg => {
//               const value = svg.getAttribute('data-barcode');
//               const format = svg.getAttribute('data-format');
//               const width = parseInt(svg.getAttribute('data-width')) || 2;
//               const height = parseInt(svg.getAttribute('data-height')) || 100;
//               const displayValue = svg.getAttribute('data-display-value') === 'true';
//               const fontSize = parseInt(svg.getAttribute('data-font-size')) || 14;
//               const textAlign = svg.getAttribute('data-text-align') || 'center';
//               const textPosition = svg.getAttribute('data-text-position') || 'bottom';
//               JsBarcode(svg, value, {
//                 format,
//                 width,
//                 height,
//                 displayValue,
//                 fontSize,
//                 textAlign,
//                 textPosition
//               });
//             });
//           </script>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();

//     // Add event listener to detect when print dialog is closed
//     printWindow.addEventListener('afterprint', () => {
//       printWindow.close();
//     });

//     // Fallback: Close the window after a short delay if afterprint is not supported
//     setTimeout(() => {
//       printWindow.print();
//       setTimeout(() => {
//         if (!printWindow.closed) {
//           printWindow.close();
//         }
//       }, 100);
//     }, 100);
//   };

//   // Refresh stock data
//   const refreshData = async () => {
//     const data = await fetchStockData();
//     setStockData(data);
//   };

//   // Generate a unique key for Barcode component based on options
//   const barcodeKey = JSON.stringify(barcodeOptions);

//   return (
//     <>
//       {/* Bootstrap CSS */}
//       <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" />
//       <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      
//       <div className="container-fluid py-4">
//         <div className="mb-4">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <div className="d-flex align-items-center">
//               <i className="fas fa-box text-primary fs-2 me-3"></i>
//               <h1 className="h2 mb-0">Stock Barcode Generator</h1>
//             </div>
//             <div className="d-flex gap-2">
//               <button
//                 onClick={refreshData}
//                 disabled={loading}
//                 className="btn btn-primary d-flex align-items-center"
//               >
//                 <i className={`fas fa-sync-alt me-2 ${loading ? 'fa-spin' : ''}`}></i>
//                 Refresh
//               </button>
//               <button
//                 onClick={handlePrint}
//                 className="btn btn-success d-flex align-items-center"
//               >
//                 <i className="fas fa-print me-2"></i>
//                 Print All
//               </button>
//             </div>
//           </div>

//           {/* Barcode Settings */}
//           <div className="card mb-4">
//             <div className="card-header">
//               <h5 className="card-title mb-0 d-flex align-items-center">
//                 <i className="fas fa-cogs me-2"></i>
//                 Barcode Settings
//               </h5>
//             </div>
//             <div className="card-body">
//               <div className="row g-3">
//                 <div className="col-md-3">
//                   <label className="form-label">Format</label>
//                   <select
//                     value={barcodeOptions.format}
//                     onChange={(e) => setBarcodeOptions(prev => ({ ...prev, format: e.target.value }))}
//                     className="form-select"
//                   >
//                     <option value="CODE128">CODE128</option>
//                     {/* <option value="CODE39">CODE39</option>
//                     <option value="EAN13">EAN13</option>
//                     <option value="UPC">UPC</option> */}
//                   </select>
//                 </div>
//                 <div className="col-md-3">
//                   <label className="form-label">Width</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="5"
//                     value={barcodeOptions.width}
//                     onChange={(e) => setBarcodeOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 2 }))}
//                     className="form-control"
//                   />
//                 </div>
//                 <div className="col-md-3">
//                   <label className="form-label">Height</label>
//                   <input
//                     type="number"
//                     min="50"
//                     max="200"
//                     value={barcodeOptions.height}
//                     onChange={(e) => setBarcodeOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 100 }))}
//                     className="form-control"
//                   />
//                 </div>
//                 <div className="col-md-3">
//                   <label className="form-label">Font Size</label>
//                   <input
//                     type="number"
//                     min="8"
//                     max="20"
//                     value={barcodeOptions.fontSize}
//                     onChange={(e) => setBarcodeOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 14 }))}
//                     className="form-control"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="d-flex justify-content-center align-items-center py-5">
//             <div className="text-center">
//               <div className="spinner-border text-primary mb-3" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p className="h5 text-muted">Loading stock data...</p>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Stock Items List */}
//             <div className="row g-4 mb-4">
//               {stockData.map((item) => (
//                 <div key={item.id} className="col-lg-4 col-md-6">
//                   <div className="card h-100 shadow-sm">
//                     <div className="card-body">
//                       <h5 className="card-title">{item.name}</h5>
//                       <div className="mb-3">
//                         <small className="text-muted d-block"><strong>Price:</strong> ${item.price}</small>
//                         <small className="text-muted d-block"><strong>Stock:</strong> {item.stock} units</small>
//                       </div>

//                       <div className="mb-3">
//                         <label className="form-label fw-bold">Quantity to Print</label>
//                         <div className="input-group" style={{ width: '150px' }}>
//                           <button
//                             className="btn btn-outline-secondary"
//                             type="button"
//                             onClick={() => updateQuantity(item.id, -1)}
//                           >
//                             <i className="fas fa-minus"></i>
//                           </button>
//                           <input
//                             type="number"
//                             min="1"
//                             value={quantities[item.id] || 1}
//                             onChange={(e) => setQuantity(item.id, e.target.value)}
//                             className="form-control text-center"
//                             style={{ maxWidth: '60px' }}
//                           />
//                           <button
//                             className="btn btn-outline-secondary"
//                             type="button"
//                             onClick={() => updateQuantity(item.id, 1)}
//                           >
//                             <i className="fas fa-plus"></i>
//                           </button>
//                         </div>
//                       </div>

//                       <div className="text-center">
//                         {barcodeErrors[item.id] ? (
//                           <div className="text-danger">{barcodeErrors[item.id]}</div>
//                         ) : (
//                           <Barcode
//                             key={`${item.id}-${barcodeKey}`}
//                             value={item.item_id+","+item.id}
//                             {...barcodeOptions}
//                           />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Print Preview (Hidden) */}
//             <div ref={printRef} style={{ display: 'none' }}>
//               <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Stock Barcodes</h1>
//               <div className="barcode-grid">
//                 {generateBarcodesForPrint().map((item, index) => (
//                   <div key={`${item.id}-${index}`} className="barcode-item">
//                     <div className="item-info">
//                       <div className="item-name">{item.name}</div>
//                       <div className="item-sku">{item.sku}</div>
//                       <div className="item-price">${item.price}</div>
//                       {item.totalCopies > 1 && (
//                         <div style={{ fontSize: '10px', color: '#999' }}>
//                           Copy {item.copyNumber} of {item.totalCopies}
//                         </div>
//                       )}
//                     </div>
//                     <div style={{ textAlign: 'center' }}>
//                       {barcodeErrors[item.id] ? (
//                         <div className="text-danger">{barcodeErrors[item.id]}</div>
//                       ) : (
//                         <svg
//                           key={`${item.id}-${index}-${barcodeKey}`}
//                           data-barcode={item.barcode || item.sku}
//                           data-format={barcodeOptions.format}
//                           data-width={barcodeOptions.width}
//                           data-height={barcodeOptions.height}
//                           data-display-value={barcodeOptions.displayValue}
//                           data-font-size={barcodeOptions.fontSize}
//                           data-text-align={barcodeOptions.textAlign}
//                           data-text-position={barcodeOptions.textPosition}
//                         />
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default StockBarcodeGenerator;


// Note: The above code is a complete React component for generating and printing stock barcodes.


import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const StockTagGenerator = ({ onClose, barcodeInvoiceNo }) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [tagOptions, setTagOptions] = useState({
    showPrice: true,
    showStock: false,
    showSKU: false,
    showItemId: false,
    tagSize: 'medium',
    tagStyle: 'modern',
    border: 'solid'
  });

  // Fetch stock data from API
  const fetchStockData = async () => {
    if (!barcodeInvoiceNo) {
      setError('Invoice number is required');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/get-all-stock-with-barcode/${barcodeInvoiceNo}`
      );

      if (response.data && response.data.results) {
        return response.data.results;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load stock data');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    const loadStockData = async () => {
      const data = await fetchStockData();
      setStockData(data);
      
      const initialQuantities = {};
      data.forEach(item => {
        initialQuantities[item.id] = 1;
      });
      setQuantities(initialQuantities);
    };
    
    loadStockData();
  }, [barcodeInvoiceNo]);

  // Update quantity for specific item
  const updateQuantity = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(100, (prev[itemId] || 1) + change))
    }));
  };

  // Set specific quantity
  const setQuantity = (itemId, quantity) => {
    const qty = Math.max(1, Math.min(100, parseInt(quantity) || 1));
    setQuantities(prev => ({
      ...prev,
      [itemId]: qty
    }));
  };

  // Update all quantities at once
  const setAllQuantities = (quantity) => {
    const qty = Math.max(1, Math.min(100, parseInt(quantity) || 1));
    const newQuantities = {};
    stockData.forEach(item => {
      newQuantities[item.id] = qty;
    });
    setQuantities(newQuantities);
  };

  // Generate tags for printing
  const generateTagsForPrint = () => {
    const tags = [];
    stockData.forEach(item => {
      const quantity = quantities[item.id] || 1;
      for (let i = 0; i < quantity; i++) {
        tags.push({
          ...item,
          copyNumber: i + 1,
          totalCopies: quantity
        });
      }
    });
    return tags;
  };

  // Get tag size configuration
  const getTagSizeConfig = () => {
    const configs = {
      small: { width: '180px', padding: '10px', fontSize: '16px', nameSize: '1.1em', priceSize: '1.15em', textAlign: 'center' },
      medium: { width: '250px', padding: '14px', fontSize: '17px', nameSize: '1.15em', priceSize: '1.2em', textAlign: 'center' },
      large: { width: '320px', padding: '18px', fontSize: '18px', nameSize: '1.2em', priceSize: '1.25em', textAlign: 'center' }
    };
    return configs[tagOptions.tagSize] || configs.medium;
  };

  // Get border style
  const getBorderStyle = () => {
    const borders = {
      solid: '2px solid #333',
      double: '3px double #333',
      dashed: '2px dashed #333',
      thick: '4px solid #333'
    };
    return borders[tagOptions.border] || borders.solid;
  };

  // Handle print - direct from current page
  const handlePrint = () => {
    const tags = generateTagsForPrint();
    if (tags.length === 0) {
      alert('No tags to print');
      return;
    }

    const tagSize = getTagSizeConfig();
    const borderStyle = getBorderStyle();

    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    
    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Stock Tags - Invoice #${barcodeInvoiceNo}</title>
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              padding: 15mm;
              background: #ffffff;
              color: #000;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 3px solid #000;
            }
            
            .print-title {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #000;
            }
            
            .print-subtitle {
              font-size: 14px;
              color: #555;
              margin-top: 5px;
            }
            
            .tags-grid { 
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              justify-content: flex-start;
            }
            
            .tag-item { 
              width: calc(50% - 7.5px);
              background: #fff;
              border: ${borderStyle};
              padding: ${tagSize.padding};
              page-break-inside: avoid;
              font-size: ${tagSize.fontSize};
              position: relative;
              box-sizing: border-box;
            }
            
            ${tagOptions.tagStyle === 'modern' ? `
              .tag-item {
                border-radius: 8px;
                border-color: black;
                box-shadow: 0 2px 4px rgba(0,0,0,0.08);
              }
              
            ` : ''}
            
            ${tagOptions.tagStyle === 'classic' ? `
              .tag-item {
                border: 3px double #000;
                border-radius: 0;
              }
            ` : ''}
            
            ${tagOptions.tagStyle === 'minimal' ? `
              .tag-item {
                border: 1px solid #999;
                border-radius: 4px;
              }
            ` : ''}
            
            .item-name { 
              font-weight: 700; 
              font-size: ${tagSize.nameSize};
              margin-bottom: 4px;
              color: #000;
              line-height: 1.3;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            
            .item-sku { 
              color: #666; 
              font-size: 0.85em;
              font-family: 'Courier New', Courier, monospace;
              letter-spacing: 0.5px;
            }
            
            
            .tag-row {
              padding: 3px 0;
              text-align: center !important;
            }
            
            .tag-label {
              color: #555;
              font-weight: 600;
              font-size: 0.95em;
            }
            
            .tag-value {
              font-weight: 700;
              color: #000;
            }
            
            .price-row .tag-value { 
              color: #2E7D32;
              font-size: ${tagSize.priceSize};
              text-align: center;
            }
            
            .tag-footer {
              border-top: 1px solid #e5e5e5;
              padding-top: 6px;
              margin-top: 8px;
              font-size: 0.7em;
              color: #888;
              text-align: center;
            }
            
            .copy-badge {
              background: #f0f0f0;
              padding: 2px 8px;
              border-radius: 3px;
              display: inline-block;
              font-weight: 600;
            }
            
            @page {
              size: A4;
              margin: 5mm;
            }
            
            @media print { 
              body { 
                background: #fff; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-header {
                margin-bottom: 15px;
              }
              
              .tags-grid { 
                gap: 12px; 
              }
              
              .tag-item { 
                width: calc(50% - 6px);
                box-shadow: none !important;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          
          <div class="tags-grid">
            ${tags.map((item, index) => `
              <div class="tag-item">
                <div class="tag-header" style="text-align:center;">
                  <div class="item-name">${item.name || 'N/A'}</div>
                  ${tagOptions.showSKU && item.sku ? `<div class="item-sku">SKU: ${item.sku}</div>` : ''}
                </div>
                
                <div class="tag-body">
                  ${tagOptions.showPrice && item.price ? `
                    <div class="tag-row price-row">
                      <span class="tag-value">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ` : ''}
                  
                  ${tagOptions.showStock && item.stock !== undefined ? `
                    <div class="tag-row">
                      <span class="tag-label">Stock:</span>
                      <span class="tag-value">${item.stock} units</span>
                    </div>
                  ` : ''}
                  
                  ${tagOptions.showItemId && item.item_id ? `
                    <div class="tag-row">
                      <span class="tag-label">Item ID:</span>
                      <span class="tag-value">${item.item_id}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(printHTML);
    iframeDoc.close();

    // Wait for content to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };
  };

  // Refresh stock data
  const handleRefresh = async () => {
    const data = await fetchStockData();
    setStockData(data);
    
    const newQuantities = { ...quantities };
    data.forEach(item => {
      if (!newQuantities[item.id]) {
        newQuantities[item.id] = 1;
      }
    });
    setQuantities(newQuantities);
  };

  // Get total tags count
  const getTotalTags = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  // Preview tag style
  const getPreviewTagStyle = () => {
    const config = getTagSizeConfig();
    const baseStyle = {
      width: config.width,
      padding: config.padding,
      fontSize: config.fontSize,
      background: '#fff',
      // minHeight: '110px',
      // display: 'flex',
      // flexDirection: 'column',
      margin: '0 auto'
    };

    if (tagOptions.tagStyle === 'modern') {
      return { ...baseStyle, border: '2px solid black', textAlign:"center", borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' };
    } else if (tagOptions.tagStyle === 'classic') {
      return { ...baseStyle, border: '3px double #000', textAlign:"center", };
    } else if (tagOptions.tagStyle === 'minimal') {
      return { ...baseStyle, border: '1px solid #999', borderRadius: '4px', textAlign:"center", };
    }
    return { ...baseStyle, border: '2px solid #333' };
  };

  const getPreviewHeaderStyle = () => {
    const base = {
      // borderBottom: '2px solid #e5e5e5',
      // paddingBottom: '8px',
      // marginBottom: '10px'
    };
    // if (tagOptions.tagStyle === 'modern') {
    //   return { ...base, borderBottomColor: 'black' };
    // }
    return base;
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <i className="fas fa-tags text-primary fs-2 me-3"></i>
              <div>
                <h1 className="h3 mb-1">Stock Tag Generator</h1>
                <small className="text-muted">Invoice #{barcodeInvoiceNo}</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              {/* {onClose && (
                <button
                  onClick={onClose}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-times me-2"></i>
                  Close
                </button>
              )} */}
              {/* <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn btn-outline-primary"
              >
                <i className={`fas fa-sync-alt me-2 ${loading ? 'fa-spin' : ''}`}></i>
                Refresh
              </button> */}
              <button
                onClick={handlePrint}
                disabled={loading || stockData.length === 0}
                className="btn btn-success"
              >
                <i className="fas fa-print me-2"></i>
                Print {getTotalTags()} Tags
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">
            <i className="fas fa-cogs me-2"></i>
            Tag Configuration
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label fw-semibold">Size</label>
              <select
                value={tagOptions.tagSize}
                onChange={(e) => setTagOptions(prev => ({ ...prev, tagSize: e.target.value }))}
                className="form-control "
              >
                <option value="small">Small (180px)</option>
                <option value="medium">Medium (250px)</option>
                <option value="large">Large (320px)</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Style</label>
              <select
                value={tagOptions.tagStyle}
                onChange={(e) => setTagOptions(prev => ({ ...prev, tagStyle: e.target.value }))}
                className="form-control "
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Border</label>
              <select
                value={tagOptions.border}
                onChange={(e) => setTagOptions(prev => ({ ...prev, border: e.target.value }))}
                className="form-control"
              >
                <option value="solid">Solid</option>
                <option value="double">Double</option>
                <option value="dashed">Dashed</option>
                <option value="thick">Thick</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Display Options</label>
              <div className="d-flex flex-wrap gap-3">
                {/* <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={tagOptions.showPrice}
                    onChange={(e) => setTagOptions(prev => ({ ...prev, showPrice: e.target.checked }))}
                    id="showPrice"
                  />
                  <label className="form-check-label" htmlFor="showPrice">
                     Price
                  </label>
                </div> */}
                {/* <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={tagOptions.showStock}
                    onChange={(e) => setTagOptions(prev => ({ ...prev, showStock: e.target.checked }))}
                    id="showStock"
                  />
                  <label className="form-check-label" htmlFor="showStock">
                    Stock
                  </label>
                </div> */}
                {/* <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={tagOptions.showSKU}
                    onChange={(e) => setTagOptions(prev => ({ ...prev, showSKU: e.target.checked }))}
                    id="showSKU"
                  />
                  <label className="form-check-label" htmlFor="showSKU">
                    SKU
                  </label>
                </div> */}
                {/* <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={tagOptions.showItemId}
                    onChange={(e) => setTagOptions(prev => ({ ...prev, showItemId: e.target.checked }))}
                    id="showItemId"
                  />
                  <label className="form-check-label" htmlFor="showItemId">
                    <i className="fas fa-hashtag me-1"></i> Item ID
                  </label>
                </div> */}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-top">
            <div className="row align-items-center">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Set All Quantities:</label>
                <div className="input-group" style={{ maxWidth: '200px' }}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="1"
                    className="form-control"
                    id="bulkQuantity"
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const value = document.getElementById('bulkQuantity').value;
                      setAllQuantities(value);
                    }}
                  >
                    Apply to All
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <div className="alert alert-info mb-0 d-inline-block">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>{stockData.length}</strong> items | <strong>{getTotalTags()}</strong> total tags
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          {/* <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div> */}
          <h4 className="text-muted">Loading Tags...</h4>
        </div>
      )}

      {/* Stock Items Grid */}
      {!loading && stockData.length > 0 && (
        <div className="row g-4">
          {stockData.map((item) => (
            <div key={item.id} className="col-xl-4 col-lg-6">
              <div className="card h-100 shadow-sm hover-shadow" style={{ transition: 'box-shadow 0.3s' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-2">{item.name}</h5>
                      <div className="text-muted small">
                        {item.sku && <div><i className="fas fa-barcode me-1"></i> SKU: {item.sku}</div>}
                        {item.item_id && <div><i className="fas fa-hashtag me-1"></i> ID: {item.item_id}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      {/* <span className="text-muted"><i className="fas fa-dollar-sign me-1"></i> Price:</span> */}
                      <span className="fw-bold text-success">{parseFloat(item.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted"><i className="fas fa-boxes me-1"></i> Stock:</span>
                      <span className="fw-bold">{item.stock || 0} units</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Print Quantity</label>
                    <div className="input-group">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quantities[item.id] || 1}
                        onChange={(e) => setQuantity(item.id, e.target.value)}
                        className="form-control text-center fw-bold"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  {/* Tag Preview */}
                  <div className="border rounded p-2 bg-light">
                    <div className="text-center mb-2">
                      <small className="text-muted fw-semibold">Preview</small>
                    </div>
                    <div style={getPreviewTagStyle()}>
                      <div style={getPreviewHeaderStyle()}>
                        <div style={{ fontWeight: '700', fontSize: getTagSizeConfig().nameSize, marginBottom: '4px', color: '#000', lineHeight: '1.3' }}>
                          {item.name}
                        </div>
                        {tagOptions.showSKU && item.sku && (
                          <div style={{ color: '#666', fontSize: '0.85em', fontFamily: 'monospace' }}>
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>
                      <div>
                        {tagOptions.showPrice && (
                          <div>
                            {/* <span style={{ color: '#555', fontWeight: '600', fontSize: '0.95em' }}>Price:</span> */}
                            <span style={{ textAlign:"center", fontWeight: '700', color: '#2E7D32', fontSize: getTagSizeConfig().priceSize }}>{parseFloat(item.price || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {tagOptions.showStock && (
                          <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{ color: '#555', fontWeight: '600', fontSize: '0.95em' }}>Stock:</span>
                            <span style={{ fontWeight: '700', color: '#000' }}>{item.stock || 0} units</span>
                          </div>
                        )}
                        {tagOptions.showItemId && item.item_id && (
                          <div style={{ display: 'flex', justifyContent: 'space-between'}}>
                            <span style={{ color: '#555', fontWeight: '600', fontSize: '0.95em' }}>Item ID:</span>
                            <span style={{ fontWeight: '700', color: '#000' }}>{item.item_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && stockData.length === 0 && !error && (
        <div className="text-center py-5">
          <i className="fas fa-inbox text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3 text-muted">No stock items found</h4>
          <p className="text-muted">Try refreshing or check the invoice number</p>
        </div>
      )}
    </div>
  );
};

export default StockTagGenerator;


