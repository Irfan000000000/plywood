
const express = require("express"); //express package initiated
const app = express(); // express instance has been created and will be access by app variable
const cors = require("cors");
const dotenv = require("dotenv");

const PDFDocument = require('pdfkit');
const fs = require('fs');
const printer = require('pdf-to-printer');


const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = require("./config/db");
dotenv.config();

app.use(cors());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});








app.post('/insert_all_items', (req, res) => {
  console.log('Request body:', req.body); // Log request body

  const sql = 'INSERT INTO items (items, category, price, discount, total_pieces, total_price ,  expire, alert) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [req.body.item_name, req.body.category, req.body.price, req.body.discount, req.body.total_pieces, req.body.total_price, req.body.expire, req.body.alert];
  console.log('SQL query:', sql);
  console.log('Values:', values);

  connection.query(sql, values, (err, result) => {
    // return res.send(result);
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Error inserting data' }); // Send JSON error response
    }
    console.log('Data inserted successfully');
    res.status(200).json({ message: 'Data inserted successfully' }); // Send JSON success response
  });
});



app.get('/items', (req, res) => {
  // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  // SQL query to select paginated results
  const sql = `SELECT items.*, categories.category AS category_name FROM items INNER JOIN categories ON items.category = categories.id LIMIT ${limit} OFFSET ${offset}`;
  // Execute the query
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error executing SQL query: ', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Query to get total count of items
    const countSql = 'SELECT COUNT(*) as total FROM items';

    // Execute the count query
    connection.query(countSql, (countError, countResult) => {
      if (countError) {
        console.error('Error executing count SQL query: ', countError);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const totalItems = countResult[0].total;

      // Calculate total pages based on total count and limit
      const totalPages = Math.ceil(totalItems / limit);

      // Send paginated results and pagination metadata as JSON
      res.json({
        totalItems,
        currentPage: page,
        totalPages,
        results
      });
    });
  });
});



app.get('/item-get/:item_id', (req, res) => {

  const item_id = req.params.item_id;

  const sql = `SELECT * FROM items where id = ${item_id}`;
  // Execute the query
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error executing SQL query: ', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({
      results
    });
  });
});






// PUT route to update an item by ID

// PUT route to update an item by ID
app.put('/update-item/:id', (req, res) => {
  const itemId = parseInt(req.params.id); // Corrected to req.params.id
  const { category, item_name, price, discount, total_pieces, expire, total_price, alert } = req.body; // Updated item data from the request body

  // Build the UPDATE query with all the columns to be updated
  const sql = 'UPDATE items SET category = ?, items = ?, price = ?,  discount = ?, total_pieces = ?, expire = ?, total_price = ?, alert = ? WHERE id = ?';
  const values = [category, item_name, price, discount, total_pieces, expire, total_price, alert, itemId];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Error updating item' });
    } else {
      console.log('Item updated successfully');
      res.status(200).json({ message: 'Item updated successfully' });
    }
  });
});




app.delete('/delete-item/:item_id', (req, res) => {
  const itemId = parseInt(req.params.item_id);

  const sql = 'DELETE FROM items WHERE id = ?';
  const values = [itemId];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Error updating item' });
    } else {
      console.log('Item updated successfully');
      res.status(200).json({ message: 'Item deleted successfully' });
    }
  });
});



app.get('/categories', (req, res) => {

  const sql = 'SELECT * FROM categories';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error updating item' });
    } else {
      console.log('Fetch Successfully');
      res.status(200).json({ results });
    }
  });
});





app.get('/get-item-rate/:item_id', (req, res) => {
  const itemId = parseInt(req.params.item_id);

  const sql = 'Select price FROM items WHERE id = ?';
  const values = [itemId];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error' });
    } else {
      console.log('Fetch Successfully');
      res.status(200).json({ results });
    }
  });
});





//   app.post('/insert-invoice', (req, res) => {
//     console.log('Request body:', req.body); // Log request body]

//     const items = req.body; // Assuming the array of items is sent in the request body

//     const check_invoice_no = "SELECT invoice_no FROM invoice ORDER BY invoice_no DESC LIMIT 1";

//     const values = items.map(item => [1000,item.item, item.rate, item.quantity, item.discount, item.total]); // Extracting values from each item

//     const sql = 'INSERT INTO invoice (invoice_no, item, rate, quantity, discount, total) VALUES ?'; // Use ? placeholder for multiple value insertion
//     console.log('SQL query:', sql);
//     console.log('Values:', values);

//     connection.query(sql, [values], (err, result) => {
//         if (err) {
//             console.error('Error inserting data:', err);
//             return res.status(500).json({ error: 'Error inserting data' }); // Send JSON error response
//         }

//         res.status(200).json({ message: 'Data inserted successfully' }); // Send JSON success response
//     });
// });



app.post('/insert-invoice', (req, res) => {

  const items = req.body; // Assuming the array of items is sent in the request body



  // Query to retrieve the last invoice number
  const check_invoice_no = "SELECT invoice_no FROM invoice ORDER BY invoice_no DESC LIMIT 1";

  connection.query(check_invoice_no, (error, results) => {
    if (error) {
      console.error('Error retrieving last invoice number:', error);
      return res.status(500).json({ error: 'Error retrieving last invoice number' });
    }

    let nextInvoiceNo;

    if (results == "") {
      nextInvoiceNo = 1000;
    } else {

      const lastInvoiceNo = results[0].invoice_no;
      nextInvoiceNo = lastInvoiceNo + 1;

    }

    // Prepare values for insertion
    const values = items.map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total]);

    // SQL query to insert invoice data
    const sql = 'INSERT INTO invoice (invoice_no, item, price, quantity, discount, total) VALUES ?';
    console.log('SQL query:', sql);
    console.log('Values:', values);

    // Execute the insert query
    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Error inserting data' });
      }




      function getCurrentTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
      }

      let currentTimestamp = getCurrentTimestamp();





      const rawData = items.map(item => ({
        "invoice_no": nextInvoiceNo,
        "timestamp": currentTimestamp,
        "item": item.item_name,
        "price": item.price,
        "quantity": item.quantity,
        "discount": item.discount,
        "total": item.total
      }));




      function convertDataFormat(rawData) {
        // Transform the raw data into the desired items format
        const convertedItems = rawData.map(entry => ({
          itemNumber: entry.item,
          description: `${entry.item}`,
          price: parseFloat(entry.price),
          quantity: parseInt(entry.quantity),
          discount: parseFloat(entry.discount),
          total: parseFloat(entry.total),
          timestamp: entry.timestamp // Add timestamp property
        }));

        // Calculate the invoice total
        const invoiceTotal = convertedItems.reduce((acc, item) => acc + item.total, 0);

        // Build the data to print object
        const dataToPrint = {
          title: `Invoice #${rawData[0].invoice_no}`,
          date: `${rawData[0].timestamp}`, // Corrected access to timestamp
          items: convertedItems,
          total: invoiceTotal.toFixed(2) // Convert to 2 decimal places
        };

        return dataToPrint;
      }

      const dataToPrint = convertDataFormat(rawData);



      function generatePDF(data) {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream('printable_document.pdf');
        doc.pipe(stream);

        // Styling constants
        const pageMargin = 50;
        const lineHeight = 25;
        const itemIndent = 200;

        // Draw a header
        doc.fontSize(15).fillColor('#333').text(data.title, { align: 'center' });
        doc.moveDown(0);

        // Draw a header
        doc.fontSize(15).fillColor('#333').text(data.date, { align: 'center' });
        doc.moveDown(0);


        // Table headers
        const tableHeaderVerticalPosition = 120; // Adjust this value to reduce space between header and table headers
        doc.fontSize(12).fillColor('#333').font('Helvetica-Bold').text('Item', pageMargin, tableHeaderVerticalPosition);
        doc.text('Price', pageMargin + itemIndent, tableHeaderVerticalPosition, { width: 100, align: 'center' });
        doc.text('Qty', pageMargin + itemIndent + 100, tableHeaderVerticalPosition, { width: 50, align: 'center' });
        doc.text('Disc(%)', pageMargin + itemIndent + 150, tableHeaderVerticalPosition, { width: 70, align: 'center' });
        doc.text('Total', pageMargin + itemIndent + 220, tableHeaderVerticalPosition, { width: 100, align: 'center' });
        doc.strokeColor('#dddddd').lineWidth(1).moveTo(pageMargin, tableHeaderVerticalPosition + 20).lineTo(pageMargin + itemIndent + 320, tableHeaderVerticalPosition + 20).stroke();

        let verticalPosition = tableHeaderVerticalPosition + 40;

        // Line items
        data.items.forEach(item => {
          doc.fontSize(12).fillColor('#333').text(item.description, pageMargin, verticalPosition);
          doc.text(`${item.price.toFixed(2)}`, pageMargin + itemIndent, verticalPosition, { width: 100, align: 'center' });
          doc.text(`${item.quantity}`, pageMargin + itemIndent + 100, verticalPosition, { width: 50, align: 'center' });
          doc.text(`${item.discount}%`, pageMargin + itemIndent + 150, verticalPosition, { width: 70, align: 'center' });
          doc.text(`${item.total.toFixed(2)}`, pageMargin + itemIndent + 220, verticalPosition, { width: 100, align: 'center' });
          verticalPosition += lineHeight;
        });

        // Draw a line above the grand total
        doc.strokeColor('#dddddd').moveTo(pageMargin, verticalPosition).lineTo(pageMargin + itemIndent + 320, verticalPosition).stroke();

        // Grand Total
        const grandTotal = data.items.reduce((acc, item) => acc + item.total, 0);
        doc.fontSize(10).fillColor('#333').font('Helvetica-Bold').text(`G. Total : Rs. ${grandTotal.toFixed(2)}`, pageMargin + itemIndent + 185, verticalPosition + 20, { width: 120, align: 'center' });

        // Finalize the PDF and end the stream
        doc.end();
        stream.on('finish', function () {
          // Print PDF using pdf-to-printer
          const pdfPath = 'printable_document.pdf';
          const printerName = 'Microsoft Print to PDF'; // Replace with the actual printer name

          printer.print(pdfPath, { printer: printerName })
            .then(() => res.send("Printed"))
            .catch((error) => console.error('Error printing PDF:', error));

        });
      }
      generatePDF(dataToPrint);


    });
  });
});





app.post('/insert-stock', (req, res) => {

  const items = req.body; // Assuming the array of items is sent in the request body



  // Query to retrieve the last invoice number
  const check_invoice_no = "SELECT invoice_no FROM stock ORDER BY invoice_no DESC LIMIT 1";

  connection.query(check_invoice_no, (error, results) => {
    if (error) {
      console.error('Error retrieving last invoice number:', error);
      return res.status(500).json({ error: 'Error retrieving last invoice number' });
    }

    let nextInvoiceNo;

    if (results == "") {
      nextInvoiceNo = 1000;
    } else {

      const lastInvoiceNo = results[0].invoice_no;
      nextInvoiceNo = lastInvoiceNo + 1;

    }




    // Prepare values for insertion
    const values = items.map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total, item.priceOption, item.discountOption, item.remarks]);

    // SQL query to insert invoice data
    const sql = 'INSERT INTO stock (invoice_no, item_id, price, quantity, discount, total, price_option, discount_option, remarks) VALUES ?';
    // console.log('SQL query:', sql);
    // console.log('Values:', values);

    // Execute the insert query
    connection.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Error inserting data' });
      }



      // Create a new array to store the desired objects
      const newData = [];

      // Iterate through data and add objects to the new array based on conditions
      items.forEach(item => {
        const newItem = {
          item: item.item,
        };
        if (item.priceOption === "update") {
          newItem.priceOption = "update";
          newItem.price = item.price;
        }
        if (item.discountOption === "update") {
          newItem.discountOption = "update";
          newItem.discount = item.discount;
        }
        if (newItem.priceOption || newItem.discountOption) {
          newData.push(newItem);
        }
      });


      // Construct and execute update query for each object
      newData.forEach(data => {
        let sql = 'UPDATE items SET ';
        const values = [];

        // Check if priceOption is present and add price to the query
        if (data.priceOption === 'update') {
          sql += 'price = ?, ';
          values.push(data.price);
        }

        // Check if discountOption is present and add discount to the query
        if (data.discountOption === 'update') {
          sql += 'discount = ?, ';
          values.push(data.discount);
        }

        // Remove the trailing comma and space
        sql = sql.slice(0, -2);

        // Add the WHERE clause
        sql += ' WHERE id = ?';

        // Push the item_id to values array
        values.push(data.item);

        // Execute the query
        connection.query(sql, values, (err, result) => {
          if (err) {
            console.error('Error updating data:', err);
            return;
          }
          console.log(`Data updated successfully for item ${data.item}.`);
        });
      });



      return res.status(200).json({ "items": newData });

    });
  });
});




// Close all database connections when the Node.js process exits
process.on('exit', () => {
  console.log('Closing all database connections...');
  connection.end((err) => {
    if (err) {
      console.error('Error closing database connections:', err);
    } else {
      console.log('All database connections closed successfully.');
    }
  });
});

// Log an error if an uncaught exception occurs
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Close all database connections before exiting due to uncaught exception
  connection.end(() => {
    process.exit(1);
  });
});

// Start the server
app.listen(process.env.PORT, function (err) {
  if (err) console.log(err);
  console.log(`listening to port ${process.env.PORT}`);
});



// app.listen(process.env.PORT, function (err) {
//   if (err) console.log(err);
//   console.log(`listening to port ${process.env.PORT}`);
// });