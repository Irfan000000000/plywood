import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode';


function BarcodeGenerator() {

  const [getAllStock, setStock] = useState([]);

  useEffect(() => {

    const fetchStockData = () => {
      axios.get(process.env.REACT_APP_API_URL+"/stocks")
        .then(res => {
          setStock(res.data.results);
        })
        .catch(err => {
          console.error("Error fetching data:", err);
        });
    };
    fetchStockData();
  }, []);


  const renderStockBarcodes = () => {
    return getAllStock.map((stock, index) => (
      <Barcode key={index} value={stock.id+"-"+stock.invoice_no} />
    ));
  };

  return (
    <div>
      {/* Render Barcode components for each item in stock */}
      {renderStockBarcodes()}
    </div>
  );


}


export default BarcodeGenerator;
