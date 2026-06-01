
const express = require("express"); //express package initiated
const app = express(); 
const WebSocket = require('ws');
const http = require('http');
const cors = require("cors");
const dotenv = require("dotenv");
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const path = require("path");
const multer = require("multer");
const connection = require("./config/db");
const { exec } = require('child_process');
const { google } = require('googleapis');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const readline = require('readline');
const ZKLib = require('node-zklib');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const { print, getPrinters } = require('pdf-to-printer');


// const { printer: ThermalPrinter, types: PrinterTypes } = require('node-thermal-printer');
// const escpos = require('escpos');
// escpos.USB = require('escpos-usb');

dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const { body, validationResult } = require("express-validator");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });



// Create an HTTP server using Express
const server = http.createServer(app);

// Create WebSocket server using the same HTTP server
const wss = new WebSocket.Server({ server });


function heartbeat() {
    this.isAlive = true;
  }



  

const user = 'root';
const password = '';
const database = 'pos';
const host = 'localhost'; // or your MySQL server IP
const backupDir = './backups'; // Directory to store backups

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Google OAuth & MySQL Configurations
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';

/** ✅ Authorize Google OAuth */
async function authorize() {
    try {
        const content = fs.readFileSync(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        if (fs.existsSync(TOKEN_PATH)) {
            const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
            oAuth2Client.setCredentials(token);

            // ✅ Check if refresh token exists, else reauthenticate
            if (!token.refresh_token) {
                console.warn("⚠️ No refresh token found. Re-authenticating...");
                return await getNewToken(oAuth2Client);
            }

            // ✅ Refresh token if expired
            if (isTokenExpired(oAuth2Client)) {
                console.log("🔄 Token expired. Refreshing...");
                return await refreshAccessToken(oAuth2Client);
            }

            return oAuth2Client;
        } else {
            return await getNewToken(oAuth2Client);
        }
    } catch (error) {
        console.error("❌ Error during authorization:", error);
        throw error;
    }
}

/** ✅ Refresh access token automatically */
async function refreshAccessToken(oAuth2Client) {
    // console.log("hit");
    try {
        const refreshedToken = await oAuth2Client.refreshAccessToken();
        const updatedToken = {
            ...oAuth2Client.credentials, // Preserve refresh_token
            access_token: refreshedToken.credentials.access_token,
            expiry_date: refreshedToken.credentials.expiry_date,
        };

        oAuth2Client.setCredentials(updatedToken);
        saveToken(updatedToken);

        console.log("✅ Access token refreshed successfully.");
        return oAuth2Client;
    } catch (error) {
        console.error("❌ Error refreshing access token. Re-authenticating...");
        return await getNewToken(oAuth2Client);
    }
}

/** ✅ Get new OAuth token (only runs if no refresh token exists) */
async function getNewToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline', // Ensures refresh token is provided
            prompt: 'consent', // Forces Google to reissue a refresh token
            scope: SCOPES,
        });

        console.log("🔑 Authorize this app by visiting this URL:", authUrl);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question("Enter the code from that page here: ", async(code) => {
            rl.close();
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                oAuth2Client.setCredentials(tokens);

                if (!tokens.refresh_token) {
                    console.error("❌ No refresh token received! Delete token.json and try again.");
                    return reject("Refresh token missing.");
                }

                saveToken(tokens);
                console.log("✅ New token acquired and saved.");
                resolve(oAuth2Client);
            } catch (error) {
                console.error("❌ Error retrieving access token:", error);
                reject(error);
            }
        });
    });
}








// // Get all patients
// app.get('/patients', (req, res) => {

// const search = req.query.search;
// const page = req.query.page;
// const limit = req.query.limit;


//   connection.getConnection((err, connection) => {
//     if (err) {
//       console.error('Error connecting to the database:', err);
//       return res.status(500).json({ error: 'Error connecting to the database' });
//     }

//     const sql = "SELECT * FROM patients ORDER BY id DESC LIMIT 10";
//     connection.query(sql, (error, results) => {
//       connection.release(); // Release the connection

//       if (error) {
//         console.error('Error executing SQL query:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//       }

//       res.json(results);
//     });
//   });
// });



app.get('/patients', (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ error: 'Error connecting to the database' });
    }

    // Build the search condition
    const searchTerm = `%${search}%`;
    const searchQuery = search
      ? `WHERE name LIKE ? OR age LIKE ? OR gender LIKE ? OR contact LIKE ? OR address LIKE ?`
      : '';

    // Query to get total count of matching records
    const countSql = `SELECT COUNT(*) as total FROM patients ${searchQuery}`;
    const countParams = search ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm] : [];

    connection.query(countSql, countParams, (error, countResults) => {
      if (error) {
        console.error('Error executing count query:', error);
        connection.release();
        return res.status(500).json({ error: 'Internal server error' });
      }

      const totalRecords = countResults[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      // Query to get paginated results
      const offset = (page - 1) * limit;
      const dataSql = `
        SELECT * FROM patients 
        ${searchQuery} 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `;
      const dataParams = search
        ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
        : [limit, offset];

      connection.query(dataSql, dataParams, (error, results) => {
        connection.release(); // Release the connection

        if (error) {
          console.error('Error executing data query:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({
          patients: results,
          totalPages: totalPages
        });
      });
    });
  });
});


//this is for invoices component that add patient
app.get('/api/patients', (req, res) => {
  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ error: 'Error connecting to the database' });
    }

    const sql = "SELECT * FROM patients ORDER BY id DESC";
    connection.query(sql, (error, results) => {
      connection.release(); // Release the connection

      if (error) {
        console.error('Error executing SQL query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(results);
    });
  });
});




// Create a new patient
app.post(
  '/patients',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 0 }).withMessage('Age must be a positive integer'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('husbandOrFatherName').notEmpty().withMessage('Husband/Father Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('relation').notEmpty().withMessage('Relation is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, gender, contact, husbandOrFatherName, address, relation } = req.body;

    connection.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return res.status(500).json({ error: 'Error connecting to the database' });
      }

      // Start a transaction
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          console.error('Error starting transaction:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Ensure mrNo counter exists
        connection.query(`
          INSERT IGNORE INTO counters (counter_name, last_value) VALUES ('mrNo', 0)
        `, (err) => {
          if (err) {
            connection.rollback(() => connection.release());
            console.error('Error ensuring MR No counter:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Get and increment the MR No counter
          connection.query('UPDATE counters SET last_value = last_value + 1 WHERE counter_name = ?', ['mrNo'], (error, result) => {
            if (error) {
              connection.rollback(() => connection.release());
              console.error('Error updating MR No counter:', error);
              return res.status(500).json({ error: 'Internal server error' });
            }

            // Fetch the new counter value
            connection.query('SELECT last_value FROM counters WHERE counter_name = ?', ['mrNo'], (error, results) => {
              if (error || results.length === 0) {
                connection.rollback(() => connection.release());
                console.error('Error fetching MR No counter or counter missing:', error);
                return res.status(500).json({ error: 'Internal server error' });
              }

              const lastValue = results[0].last_value;
              const mrNo = `MR-${String(lastValue).padStart(4, '0')}`; // Format as MR-XXXX

              const patient = {
                mrNo,
                name,
                age,
                gender,
                contact,
                husbandOrFatherName,
                address,
                relation
              };

              // Insert the patient
              connection.query('INSERT INTO patients SET ?', patient, (error, result) => {
                if (error) {
                  connection.rollback(() => connection.release());
                  console.error('Error executing SQL query:', error);
                  return res.status(500).json({ error: 'Internal server error' });
                }

                // Commit the transaction
                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => connection.release());
                    console.error('Error committing transaction:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                  }

                  // Fetch the inserted patient to include the id
                  connection.query('SELECT * FROM patients WHERE id = ?', [result.insertId], (err, results) => {
                    connection.release();
                    if (err) {
                      console.error('Error fetching inserted patient:', err);
                      return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.status(201).json(results[0]);
                  });
                });
              });
            });
          });
        });
      });
    });
  }
);




// Update a patient
app.put(
  '/patients/:mrNo',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 0 }).withMessage('Age must be a positive integer'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('husbandOrFatherName').notEmpty().withMessage('Husband/Father Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('relation').notEmpty().withMessage('Relation is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mrNo } = req.params;
    const { name, age, gender, contact, husbandOrFatherName, address, relation } = req.body;

    connection.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return res.status(500).json({ error: 'Error connecting to the database' });
      }

      const sql = 'UPDATE patients SET name = ?, age = ?, gender = ?, contact = ?, husbandOrFatherName = ?, address = ?, relation = ? WHERE mrNo = ?';
      connection.query(
        sql,
        [name, age, gender, contact, husbandOrFatherName, address, relation, mrNo],
        (error, result) => {
          connection.release(); // Release the connection

          if (error) {
            console.error('Error executing SQL query:', error);
            return res.status(500).json({ error: 'Internal server error' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Patient not found' });
          }

          res.json({ mrNo, name, age, gender, contact, husbandOrFatherName, address, relation });
        }
      );
    });
  }
);

// Delete a patient
app.delete('/patients/:mrNo', (req, res) => {
  const { mrNo } = req.params;

  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ error: 'Error connecting to the database' });
    }

    const sql = 'DELETE FROM patients WHERE mrNo = ?';
    connection.query(sql, [mrNo], (error, result) => {
      connection.release(); // Release the connection

      if (error) {
        console.error('Error executing SQL query:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.status(204).send();
    });
  });
});





app.post(
    "/api/login",
    [
      body("username").notEmpty().withMessage("Username is required"),
      body("password").notEmpty().withMessage("Password is required"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { username, password } = req.body;
  
      connection.getConnection((err, connection) => {
        if (err) {
          console.error("Error connecting to the database:", err);
          res.status(500).json({ error: "Error connecting to the database" });
          return;
        }
  
        const sql =
          "SELECT * FROM users WHERE users.username = ?";
  
        connection.query(sql, [username], (error, results) => {
          connection.release(); // Release the connection
  
          if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
  
          if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
          }
  
          const user = results[0];
  
          console.log(user);
  
          const passwordIsValid = bcrypt.compareSync(password, user.password);
          if (!passwordIsValid) {
            return res.status(401).json({ error: "Invalid password" });
          }
          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 120,
          }); // 24 hours
          res.status(200).json({
            auth: true,
            token,
            user: {
              username: user.username,
              user_type: user.user_type,
              user_id: user.user_id,
            },
          });
        });
      });
    }
  );


/** ✅ Check if token is expired */
function isTokenExpired(oAuth2Client) {
    if (!oAuth2Client.credentials.expiry_date) return true;
    return Date.now() > oAuth2Client.credentials.expiry_date;
}

/** ✅ Save token, ensuring refresh_token is preserved */
function saveToken(token) {
    const existingToken = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH)) : {};

    const updatedToken = {
        ...existingToken,
        ...token,
        refresh_token: token.refresh_token || existingToken.refresh_token, // Preserve refresh token
    };

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedToken, null, 2));
    console.log("✅ Token saved successfully:", TOKEN_PATH);
}

/** ✅ Upload backup file to Google Drive */
async function uploadBackupToDrive(auth, backupFilePath) {
    if (!fs.existsSync(backupFilePath)) {
        console.error("❌ Error: Backup file does not exist at:", backupFilePath);
        return;
    }

    console.log("📤 Uploading backup file from:", backupFilePath);
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = { name: path.basename(backupFilePath), parents: ['root'] };
    const media = { mimeType: 'application/sql', body: fs.createReadStream(backupFilePath) };

    try {
        const file = await drive.files.create({ resource: fileMetadata, media, fields: 'id' });
        console.log("✅ Backup uploaded successfully! File ID:", file.data.id);
    } catch (error) {
        console.error("❌ Error uploading file:", error);
    }
}


// // 3. PRINTER CONFIGURATION
// // ======================
// const THERMAL_PRINTER = {
//   deviceId: "Black Copper BC-85AC",
//   name: "Black Copper BC-85AC",
//   paperSizes: [
//     "Paper(80 x 210mm)",  // We'll use this size
//     "Paper(80 x 297mm)",
//     "Paper(80 x 3276mm)",
//     "Paper(80(72) x 210mm)"
//   ]
// };

// // ======================
// // 4. PAPER DIMENSIONS (80mm x 210mm)
// // ======================
// const PAPER = {
//   WIDTH_MM: 80,
//   HEIGHT_MM: 210,
//   MARGIN_MM: 0, // Set all margins to 0 to eliminate any extra space
//   // Convert mm to points (1mm = 2.83465 points)
//   get widthPoints() { return this.WIDTH_MM * 2.83465 },
//   get heightPoints() { return this.HEIGHT_MM * 2.83465 },
//   get marginPoints() { return this.MARGIN_MM * 2.83465 }
// };

// // ======================
// // 5. CORE PRINT FUNCTION
// // ======================
// async function printToThermalPrinter(pdfPath) {
//   const options = {
//     printer: THERMAL_PRINTER.name,
//     scale: 'noscale', // Use 'noscale' to prevent scaling issues
//     paperSize: THERMAL_PRINTER.paperSizes[0], // "Paper(80 x 210mm)"
//     margins: { marginType: 'none' }, // Ensure no margins
//     silent: true,
//     printQuality: 'high',
//     pageRanges: '1' // Explicitly print only the first page
//   };

//   try {
//     await print(pdfPath, options);
//     return { success: true, printer: THERMAL_PRINTER.name };
//   } catch (error) {
//     return { 
//       success: false,
//       error: error.message,
//       troubleshooting: [
//         '1. Check printer is powered and connected',
//         '2. Verify paper is loaded (80mm width)',
//         '3. Ensure printer driver is installed',
//         '4. Check printer firmware for margin settings',
//         '5. Verify paper size is set to 80mm x 210mm in printer settings'
//       ]
//     };
//   }
// }

// // ======================
// // 6. PDF GENERATION
// // ======================
// // function generateInvoicePDF(data) {
// //   const { invoiceData = [], grandTotal = '0', discountTotal = '0',  netTotal = '0', advance = '0',  balance = '0', storeInfo = {} } = data;

// //   return new Promise((resolve, reject) => {
// //     // Create prints directory if needed
// //     const printsDir = path.join(__dirname, 'prints');
// //     if (!fs.existsSync(printsDir)) {
// //       fs.mkdirSync(printsDir);
// //     }

// //     // Create PDF file
// //     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
// //     const pdfPath = path.join(printsDir, `invoice_${timestamp}.pdf`);

// //     // PDF Document Setup - with better error handling
// //     const doc = new PDFDocument({
// //       size: [PAPER.widthPoints, PAPER.heightPoints],
// //       margins: {
// //         top: 0,
// //         bottom: 30,
// //         left: 0,
// //         right: 23,
// //       },
// //       layout: 'portrait',
// //       bufferPages: false // Disable buffering for simpler handling
// //     });

// //     // Pipe to file with proper error handling
// //     const stream = fs.createWriteStream(pdfPath);
// //     doc.pipe(stream);

// //     // Error handlers must be set before any content generation
// //     stream.on('error', reject);
// //     stream.on('finish', () => resolve(pdfPath));

// //     try {
// //       // Header
// //       doc.font('Helvetica-Bold')
// //          .fontSize(14)
// //          .text(storeInfo.name || 'MY CLINIC', { align: 'center' })
// //          .font('Courier')
// //          .fontSize(10)
// //          .text(storeInfo.address || '', { align: 'center' })
// //          .text(`Tel: ${storeInfo.phone || ''}`, { align: 'center' })
// //          .moveDown(0.2);

// //       // Invoice Info
// //       doc.text('------------------------------', { align: 'center' })
// //          .font('Courier-Bold')
// //          .text('INVOICE', { align: 'center' })
// //          .font('Courier')
// //          .text('------------------------------', { align: 'center' })
// //          .moveDown(0.2);

// //       // Patient Info
// //       if (invoiceData[0]) {
// //         doc.text(`Invoice No: ${invoiceData[0].invoice_no || 'N/A'}`)
// //             .text(`Name: ${invoiceData[0].full_name || 'N/A'}`)
// //             .moveDown(0.2);
// //       }

    
// // // Alternative solution: Multi-line description support
// // // Replace the items section with this code:

// // const descWidth = 12;
// // const qtyWidth = 4;
// // const priceWidth = 7;
// // const amountWidth = 9;
// // const totalWidth = descWidth + qtyWidth + priceWidth + amountWidth;

// // // Header
// // doc.font('Courier-Bold')
// //    .text(
// //      'Item'.padEnd(descWidth) + 
// //      'Qty'.padStart(qtyWidth) + 
// //      'Price'.padStart(priceWidth) + 
// //      'Total'.padStart(amountWidth)
// //    )
// //    .font('Courier')
// //    .text('-'.repeat(totalWidth));

// // // Items with multi-line support
// // invoiceData.forEach(item => {
// //   const itemName = (item.item_name || '').toString();
// //   const qty = (item.quantity || '1').toString().padStart(qtyWidth);
// //   const price = formatCurrency(item.price || '0').padStart(priceWidth);
// //   const amount = formatCurrency(item.quantity *item.price).padStart(amountWidth);
  
// //   if (itemName.length <= descWidth) {
// //     // Single line - fits in description width
// //     const desc = itemName.padEnd(descWidth);
// //     doc.text(desc + qty + price + amount);
// //   } else {
// //     // Multi-line - description on first line, numbers on second line
// //     doc.text(itemName.slice(0, totalWidth)) // Full description on first line
// //        .text(''.padEnd(descWidth) + qty + price + amount); // Numbers on second line
// //   }
// // });

// // // Continue with totals section...

// // // Totals
// // doc.text('---------------------------------')
// //    .font('Courier-Bold')
// //    // Pad the labels to match the 20+10 character format
// //    .text('Total:'.padEnd(22) + formatCurrency(addNumbers(grandTotal)).padStart(10))
// //    .text('Discount:'.padEnd(22) + formatCurrency(discountTotal).padStart(10))
// //    .text('Subtotal:'.padEnd(22) + formatCurrency(grandTotal - discountTotal).padStart(10))
// //    .text('Advance:'.padEnd(22) + formatCurrency(advance).padStart(10))
// //    .text('Balance:'.padEnd(22) + formatCurrency(balance).padStart(10))
// //    .moveDown()
// //    // Get current date/time in Pakistan Standard Time (UTC+5)
// //    .text(new Date().toLocaleString('en-PK', { 
// //        timeZone: 'Asia/Karachi',
// //        weekday: 'short', 
// //        year: 'numeric', 
// //        month: 'short', 
// //        day: 'numeric', 
// //        hour: '2-digit', 
// //        minute: '2-digit', 
// //        hour12: true 
// //    }), { align: 'center' })
// //    // Add space at the bottom to prevent cutting off
// //    .moveDown(2); // Adjust the number (e.g., 2, 3, 4) based on your needs

// //    doc.text('. . . . . . . . . . . . . . . . . . . .', { align: 'center' })
// //    .moveDown(2);

// //     doc.end();
// //     } catch (err) {
// //       doc.end(); // Ensure cleanup
// //       reject(err);
// //     }
// //   });
// // }

// //if this not properly print then use upper code which is also correct
// function generateInvoicePDF(data) {
//   const { 
//     invoiceData = [], 
//     grandTotal = 0, 
//     discountTotal = 0,  
//     netTotal = 0, 
//     advance = 0,  
//     balance = 0, 
//     storeInfo = {},
//     patientInfo = {}
//   } = data;

//   return new Promise((resolve, reject) => {
//     // Create prints directory if needed
//     const printsDir = path.join(__dirname, 'prints');
//     if (!fs.existsSync(printsDir)) {
//       fs.mkdirSync(printsDir);
//     }

//     // Create PDF file - using 80mm width (common thermal paper size)
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const pdfPath = path.join(printsDir, `invoice_${timestamp}.pdf`);

//     // PDF Document Setup for thermal printer
//     const doc = new PDFDocument({
//       size: [226.8, 1000], // 80mm width (226.8 points), variable height
//       margins: {
//         top: 10,
//         bottom: 10,
//         left: 5,
//         right: 5
//       },
//       layout: 'portrait',
//       bufferPages: false
//     });

//     // Pipe to file
//     const stream = fs.createWriteStream(pdfPath);
//     doc.pipe(stream);

//     // Error handling
//     stream.on('error', reject);
//     stream.on('finish', () => resolve(pdfPath));

//     try {
//       // Set monospace font for thermal printing
//       doc.font('Courier-Bold')
//          .fontSize(10)
//          .text(storeInfo.name || 'MY STORE', { align: 'center' })
//          .font('Courier')
//          .fontSize(8)
//          .text(storeInfo.address || '', { align: 'center' })
//          .text(`Tel: ${storeInfo.phone || ''}`, { align: 'center' })
//          .moveDown(0.5);

//       // Divider line
//       doc.text('--------------------------------', { align: 'center' })
//          .font('Courier-Bold')
//          .text('INVOICE', { align: 'center' })
//          .font('Courier')
//          .text('--------------------------------', { align: 'center' })
//          .moveDown(0.5);

//       // Invoice and patient info
//       doc.text(`Invoice #: ${invoiceData[0]?.invoice_no || 'N/A'}`)
//          .text(`Date: ${new Date().toLocaleDateString('en-PK')}`)
//          .text(`Name: ${patientInfo.full_name || invoiceData[0]?.full_name || 'N/A'}`)
//          .moveDown(0.5);

//       // Items table header
//       doc.font('Courier-Bold')
//          .text('ITEM'.padEnd(20) + 'QTY'.padStart(5) + 'PRICE'.padStart(10) + 'TOTAL'.padStart(10))
//          .font('Courier')
//          .text('-'.repeat(45))
//          .moveDown(0.2);

//       // Items list with thermal-friendly formatting
//       invoiceData.forEach(item => {
//         const itemName = (item.item_name || '').toString();
//         const qty = (item.quantity || 1).toString().padStart(3);
//         const price = formatCurrency(item.price || 0).padStart(8);
//         const total = formatCurrency((item.quantity || 1) * (item.price || 0)).padStart(10);
        
//         // Handle long item names by splitting into multiple lines
//         if (itemName.length <= 20) {
//           doc.text(itemName.padEnd(20) + qty.padStart(5) + price.padStart(10) + total.padStart(10));
//         } else {
//           // Split long item names
//           doc.text(itemName.substring(0, 20));
//           doc.text(''.padEnd(20) + qty.padStart(5) + price.padStart(10) + total.padStart(10));
//         }
//       });

//       // Totals section
//       doc.moveDown(0.5)
//          .text('-'.repeat(45))
//          .font('Courier-Bold')
//          .text('TOTAL:'.padEnd(35) + formatCurrency(grandTotal).padStart(10))
//          .text('DISCOUNT:'.padEnd(35) + formatCurrency(discountTotal).padStart(10))
//          .text('SUB TOTAL:'.padEnd(35) + formatCurrency(grandTotal - discountTotal).padStart(10))
//          .text('ADVANCE:'.padEnd(35) + formatCurrency(advance).padStart(10))
//          .text(' '.repeat(35) + '----------')
//          .text('BALANCE:'.padEnd(35) + formatCurrency(balance).padStart(10))
//          .font('Courier')
//          .text('-'.repeat(45))
//          .moveDown(1);

//       // Footer
//       doc.text('Thank you for your visit!', { align: 'center' })
//          .moveDown(0.5)
//          .text(new Date().toLocaleString('en-PK', { 
//            timeZone: 'Asia/Karachi',
//            hour: '2-digit',
//            minute: '2-digit',
//            hour12: true 
//          }), { align: 'center' })
//          .moveDown(1);

//       // Cut line (for thermal printers that support partial cuts)
//       doc.text('. . . . . . . . . . . . . . . . . . . .', { align: 'center' });

//       doc.end();
//     } catch (err) {
//       doc.end();
//       reject(err);
//     }
//   });
// }



// function formatCurrency(amount) {
//   return parseFloat(amount).toFixed(2).padStart(10);
// }

// function addNumbers(a, b) {
//   return (parseFloat(a) || 0) + (parseFloat(b) || 0);
// }




// // ======================
// // 8. API ENDPOINT
// // ======================
// app.post('/print-invoice', async (req, res) => {
//   try {
//     // 1. Generate PDF
//     const pdfPath = await generateInvoicePDF(req.body);
    
//     // 2. Print to thermal printer
//     const printResult = await printToThermalPrinter(pdfPath);

//     if (!printResult.success) {
//       throw new Error(printResult.error || 'Printing failed');
//     }

//     // 4. Verify printer actually printed
//     // const printed = await verifyPrintJobCompleted(THERMAL_PRINTER.name);
//     // if (!printed) {
//     //   throw new Error('Print job sent but printer not responding');
//     // }
    
//     // 3. Clean up (keep file if printing failed)
//     if (printResult.success) {
//       fs.unlink(pdfPath, () => {});
//     }

//     res.json(printResult);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       printer: THERMAL_PRINTER,
//       requiredPaper: '80mm x 210mm thermal roll'
//     });
//   }
// });






// function formatCurrency(amount) {
//   return parseFloat(amount).toFixed(2).padStart(10);
// }

// function addNumbers(a, b) {
//   return (parseFloat(a) || 0) + (parseFloat(b) || 0);
// }



// function generateInvoicePDF(data) {
//   const {
//     invoiceData = [],
//     grandTotal = 0,
//     discountTotal = 0,
//     netTotal = 0,
//     advance = 0,
//     balance = 0,
//     storeInfo = {},
//     patientInfo = {}
//   } = data;

//   return new Promise((resolve, reject) => {
//     const printsDir = path.join(__dirname, 'prints');
//     if (!fs.existsSync(printsDir)) {
//       fs.mkdirSync(printsDir);
//     }

//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const pdfPath = path.join(printsDir, `receipt_${timestamp}.pdf`);

//     // 80mm = 226.77 points (1mm = 2.834645669 points)
//     const THERMAL_WIDTH = 226.77;
//     const MARGIN = 8;
    
//     const doc = new PDFDocument({
//       size: [THERMAL_WIDTH, 1000], // Dynamic height
//       margins: {
//         top: MARGIN,
//         bottom: MARGIN,
//         left: MARGIN,
//         right: MARGIN
//       },
//       layout: 'portrait',
//       bufferPages: true
//     });

//     const stream = fs.createWriteStream(pdfPath);
//     doc.pipe(stream);

//     stream.on('error', reject);
//     stream.on('finish', () => resolve(pdfPath));

//     try {
//       const availableWidth = THERMAL_WIDTH - (MARGIN * 2); // Accounting for margins
//       const centerX = MARGIN; // Start from left margin for proper centering
//       const lineWidth = 32; // Characters per line adjusted for larger fonts

//       // Store Header - Professional styling with larger fonts
//       doc.font('Helvetica-Bold')
//          .fontSize(16)
//          .text(storeInfo.name || 'MEDICAL STORE', 0, undefined, { align: 'center', width: availableWidth });
      
//       if (storeInfo.address) {
//         doc.font('Helvetica-Bold')
//            .fontSize(11)
//            .text(storeInfo.address, 0, undefined, { align: 'center', width: availableWidth });
//       }
      
//       if (storeInfo.phone) {
//         doc.fontSize(11)
//            .text(`Tel: ${storeInfo.phone}`, 0, undefined, { align: 'center', width: availableWidth });
//       }

//       if (storeInfo.email) {
//         doc.fontSize(10)
//            .text(storeInfo.email, 0, undefined, { align: 'center', width: availableWidth });
//       }

//       // Separator line
//       doc.moveDown(0.4)
//          .font('Courier-Bold')
//          .fontSize(12)
//          .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth });

//       // Receipt type and number
//       doc.moveDown(0.3)
//          .font('Helvetica-Bold')
//          .fontSize(14)
//          .text('INVOICE RECEIPT', 0, undefined, { align: 'center', width: availableWidth });

//       doc.font('Courier-Bold')
//          .fontSize(12)
//          .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.4);

//       // Invoice details - Left aligned for better readability
//       const invoiceNo = invoiceData[0]?.invoice_no;
//       const currentDate = new Date().toLocaleDateString('en-PK', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//       const currentTime = new Date().toLocaleTimeString('en-PK', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });

//       doc.font('Helvetica-Bold')
//          .fontSize(11)
//          .text(`Invoice: ${invoiceNo}`, centerX)
//          .text(`Date: ${currentDate}`, centerX)
//          .text(`Time: ${currentTime}`, centerX)
//          .text(`Name: ${patientInfo.full_name || invoiceData[0]?.full_name || 'Walk-in Customer'}`, centerX)
//          .moveDown(0.4);

//       // Items header - Use monospace font for proper alignment
      

//       doc.font('Courier-Bold')
//    .fontSize(10)
//    .text('ITEM'.padEnd(13) + 'QTY'.padStart(4) + 'RATE'.padStart(6) + 'AMOUNT'.padStart(8), centerX)
//    .text('-'.repeat(34), centerX)
//    .moveDown(0.2);

// // Items list - All data in single lines with proper alignment
// doc.font('Courier-Bold')
//    .fontSize(10);


// invoiceData.forEach((item, index) => {
//   const fullItemName = (item.item_name || `Item ${index + 1}`).toString().trim();
//   const qty = (item.quantity || 1).toString();
//   const rate = parseFloat(item.price || 0);
//   const amount = qty * rate;

//   // Split long item names into multiple lines
//   const maxItemNameWidth = 13;
//   const words = fullItemName.split(' ');
//   const itemNameLines = [];
//   let currentLine = '';

//   words.forEach(word => {
//     if ((currentLine + word).length <= maxItemNameWidth) {
//       currentLine = currentLine ? `${currentLine} ${word}` : word;
//     } else {
//       if (currentLine) itemNameLines.push(currentLine);
//       currentLine = word;
//     }
//   });
//   if (currentLine) itemNameLines.push(currentLine);

//   // Print first line with all columns
//   const firstLine = itemNameLines[0].padEnd(maxItemNameWidth) +
//                    qty.padStart(4) +
//                    rate.toFixed(1).padStart(6) +
//                    amount.toFixed(1).padStart(8);
  
//   doc.text(firstLine, centerX);

//   // Print additional lines for item name only (if any)
//   for (let i = 1; i < itemNameLines.length; i++) {
//     doc.text(itemNameLines[i], centerX);
//   }

//   // Add empty line between items (except for the last item)
//   if (index < invoiceData.length - 1) {
//     doc.text('', centerX); // Empty line for spacing
//     doc.moveDown(0.8)
//   }
// });

//       // Totals section
//       doc.moveDown(0.3)
//          .font('Courier-Bold')
//          .fontSize(10)
//          .text('-'.repeat(32), centerX);

//       // Right-aligned totals - adjusted for larger font
//       const totalLabelWidth = 14;
//       const totalValueWidth = 12;

//       doc.moveDown(0.3).font('Courier-Bold')
//          .fontSize(12)
//          .text('G.TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal).padStart(totalValueWidth), centerX);

//       doc.moveDown(0.3).text('DISCOUNT:'.padEnd(totalLabelWidth) + formatCurrency(discountTotal).padStart(totalValueWidth), centerX);
//       doc.moveDown(0.3).text('NET TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal - discountTotal).padStart(totalValueWidth), centerX);

//       doc.moveDown(0.3).text('ADVANCE:'.padEnd(totalLabelWidth) + formatCurrency(advance).padStart(totalValueWidth), centerX);
//       doc.text(''.padEnd(totalLabelWidth) + '-'.repeat(totalValueWidth), centerX);
//       doc.font('Courier-Bold')
//          .fontSize(12)
//          .text('BALANCE:'.padEnd(totalLabelWidth) + formatCurrency(balance).padStart(totalValueWidth), centerX);

//       // Footer separator
//       doc.font('Courier-Bold')
//          .fontSize(10)
//          .text('='.repeat(28), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.5);

//       // Professional footer - Centered
//       doc.font('Helvetica-Bold')
//          .fontSize(11)
//          .text('Thank you for choosing us!', 0, undefined, { align: 'center', width: availableWidth })
//          .text('For Info: ' + (storeInfo.phone || 'Contact Store'), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.4);

//       // QR Code placeholder (if needed)
//       if (storeInfo.website || storeInfo.qrCode) {
//         doc.fontSize(10)
//            .text('Scan for digital receipt:', 0, undefined, { align: 'center', width: availableWidth })
//            .text('[QR CODE SPACE]', 0, undefined, { align: 'center', width: availableWidth })
//            .moveDown(0.4);
//       }

//       // Receipt footer
//     //   doc.font('Courier-Bold')
//     //      .fontSize(9)
//     //      .text('Generated: ' + new Date().toLocaleString('en-PK'), centerX, undefined, { align: 'center', width: availableWidth })
//     //      .moveDown(0.5);

//       // Cut line
//       doc.fontSize(10)
//          .text('- - - - CUT HERE - - - -', 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(1);

//       doc.end();
//     } catch (err) {
//       doc.end();
//       reject(err);
//     }
//   });
// }





// ======================
// 3. PRINTER CONFIGURATION
// ======================
const THERMAL_PRINTER = {
  deviceId: "Black Copper BC-85AC",
  name: "Black Copper BC-85AC",
  paperSizes: [
    "Paper(80 x 210mm)",  // We'll use this size
    "Paper(80 x 297mm)",
    "Paper(80 x 3276mm)",
    "Paper(80(72) x 210mm)"
  ]
};

// ======================
// 4. PAPER DIMENSIONS (80mm x 210mm)
// ======================
const PAPER = {
  WIDTH_MM: 79.5,       // Actual paper width
  HEIGHT_MM: 210,       // A common custom height, adjust as needed
  MARGIN_MM: 0,
  get widthPoints() { return this.WIDTH_MM * 2.83465 },
  get heightPoints() { return this.HEIGHT_MM * 2.83465 },
  get marginPoints() { return this.MARGIN_MM * 2.83465 }
};

// ======================
// 5. PDF GENERATION FUNCTION
// ======================
// function generateInvoicePDF(data) {
//   const {
//     invoiceData = [],
//     grandTotal = 0,
//     discountTotal = 0,
//     netTotal = 0,
//     advance = 0,
//     balance = 0,
//     storeInfo = {},
//     patientInfo = {}
//   } = data;

//   return new Promise((resolve, reject) => {
//     const printsDir = path.join(__dirname, 'prints');
//     if (!fs.existsSync(printsDir)) {
//       fs.mkdirSync(printsDir);
//     }

//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const pdfPath = path.join(printsDir, `invoice_${timestamp}.pdf`);

//     // const doc = new PDFDocument({
//     //   size: [PAPER.widthPoints, 1000], // Height can be fixed or dynamic
//     //   margins: {
//     //     top: 10,
//     //     bottom: 10,
//     //     left: 5,
//     //     right: 5
//     //   },
//     //   layout: 'portrait',
//     //   bufferPages: false
//     // });

//     const doc = new PDFDocument({
//     size: [PAPER.widthPoints, PAPER.heightPoints], // 79.5mm width
//     margins: {
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0
//     },
//     layout: 'portrait',
//     bufferPages: false
//     });



//     const stream = fs.createWriteStream(pdfPath);
//     doc.pipe(stream);

//     stream.on('error', reject);
//     stream.on('finish', () => resolve(pdfPath));

//     try {
//       doc.font('Courier-Bold')
//          .fontSize(10)
//          .text(storeInfo.name || 'MY STORE', { align: 'center' })
//          .font('Courier-Bold')
//          .fontSize(8)
//          .text(storeInfo.address || '', { align: 'center' })
//          .text(`Tel: ${storeInfo.phone || ''}`, { align: 'center' })
//          .moveDown(0.5);

//       doc.text('--------------------------------', { align: 'center' })
//          .font('Courier-Bold')
//          .text('INVOICE', { align: 'center' })
//          .font('Courier-Bold')
//          .text('--------------------------------', { align: 'center' })
//          .moveDown(0.5);

//       doc.text(`Invoice #: ${invoiceData[0]?.invoice_no || 'N/A'}`)
//          .text(`Date: ${new Date().toLocaleDateString('en-PK')}`)
//          .text(`Name: ${patientInfo.full_name || invoiceData[0]?.full_name || 'N/A'}`)
//          .moveDown(0.5);

//      doc.font('Courier-Bold')
//     .text(
//         'ITEM'.padEnd(16) +  // was 18
//         'QTY'.padStart(4) +  // was 5
//         'PRICE'.padStart(9) +  // was 10
//         'TOTAL'.padStart(11)   // was 12
//         ).font('Courier-Bold')
//             .text('-'.repeat(45))
//             .moveDown(0.2);


//             invoiceData.forEach(item => {
//                 const descWidth = 16;
//                 const qtyWidth = 4;
//                 const priceWidth = 9;
//                 const totalWidth = 11;

//                 // Prepare values
//                 const itemName = (item.item_name || '').toString().trim();
//                 const qty = (item.quantity || 1).toString().padStart(qtyWidth);
//                 const price = formatCurrency(item.price || 0).padStart(priceWidth);
//                 const total = formatCurrency((item.quantity || 1) * (item.price || 0)).padStart(totalWidth);

//                 // Truncate or pad item name to fit column
//                 const nameFixed = itemName.length > descWidth
//                     ? itemName.slice(0, descWidth)
//                     : itemName.padEnd(descWidth);

//                 // Print one perfectly aligned line
//                 doc.text(nameFixed + qty + price + total);
//                 });


//     //   invoiceData.forEach(item => {
//     //     const itemName = (item.item_name || '').toString();
//     //     const qty = (item.quantity || 1).toString().padStart(3);
//     //     const price = formatCurrency(item.price || 0).padStart(8);
//     //     const total = formatCurrency((item.quantity || 1) * (item.price || 0)).padStart(10);

//     //     if (itemName.length <= 20) {
//     //       doc.text(itemName.padEnd(20) + qty.padStart(5) + price + total);
//     //     } else {
//     //       doc.text(itemName.substring(0, 20));
//     //       doc.text(''.padEnd(20) + qty + price + total);
//     //     }
//     //   });


    

//     //   doc.moveDown(0.5)
//     //      .text('-'.repeat(45))
//     //      .font('Courier-Bold')
//     //      .text('TOTAL:'.padEnd(35) + formatCurrency(grandTotal))
//     //      .text('DISCOUNT:'.padEnd(35) + formatCurrency(discountTotal))
//     //      .text('SUB TOTAL:'.padEnd(35) + formatCurrency(grandTotal - discountTotal))
//     //      .text('ADVANCE:'.padEnd(35) + formatCurrency(advance))
//     //      .text(' '.repeat(35) + '----------')
//     //      .text('BALANCE DUE:'.padEnd(35) + formatCurrency(balance))
//     //      .font('Courier-Bold')
//     //      .text('-'.repeat(45))
//     //      .moveDown(1);

//     doc.moveDown(0.5)
//    .text('-'.repeat(45))
//    .font('Courier-Bold')
//    .text('TOTAL:'.padEnd(28) + formatCurrency(grandTotal).padStart(13))
//    .text('DISCOUNT:'.padEnd(28) + formatCurrency(discountTotal).padStart(13))
//    .text('SUB TOTAL:'.padEnd(28) + formatCurrency(grandTotal - discountTotal).padStart(13))
//    .text('ADVANCE:'.padEnd(28) + formatCurrency(advance).padStart(13))
//    .text(' '.repeat(28) + '--------------') // Divider for balance
//    .text('BALANCE DUE:'.padEnd(28) + formatCurrency(balance).padStart(13))
//    .text('-'.repeat(45))
//    .moveDown(1)
//    .font('Courier-Bold');


//       doc.text('Thank you for your visit!', { align: 'center' })
//       .text('-------', { align: 'center' })
//       .moveDown(0.5)
//          .text(new Date().toLocaleString('en-PK', {
//            timeZone: 'Asia/Karachi',
//            hour: '2-digit',
//            minute: '2-digit',
//            hour12: true
//          }), { align: 'center' })
//          .moveDown(1);

//       doc.text('. . . . . . . . . . . . . . . . . . . .', { align: 'center' });

//       doc.end();
//     } catch (err) {
//       doc.end();
//       reject(err);
//     }
//   });
// }



// function generateInvoicePDF(data) {
//   const {
//     invoiceData = [],
//     grandTotal = 0,
//     discountTotal = 0,
//     netTotal = 0,
//     advance = 0,
//     balance = 0,
//     storeInfo = {},
//     patientInfo = {}
//   } = data;

//   return new Promise((resolve, reject) => {
//     const printsDir = path.join(__dirname, 'prints');
//     if (!fs.existsSync(printsDir)) {
//       fs.mkdirSync(printsDir);
//     }

//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const pdfPath = path.join(printsDir, `receipt_${timestamp}.pdf`);

//     // 80mm = 226.77 points (1mm = 2.834645669 points)
//     const THERMAL_WIDTH = 226.77;
//     const MARGIN = 8;
    
//     const doc = new PDFDocument({
//       size: [THERMAL_WIDTH, 1000], // Dynamic height
//       margins: {
//         top: MARGIN,
//         bottom: MARGIN,
//         left: MARGIN,
//         right: MARGIN
//       },
//       layout: 'portrait',
//       bufferPages: true
//     });

//     const stream = fs.createWriteStream(pdfPath);
//     doc.pipe(stream);

//     stream.on('error', reject);
//     stream.on('finish', () => resolve(pdfPath));

//     try {
//       const availableWidth = THERMAL_WIDTH - (MARGIN * 2); // Accounting for margins
//       const centerX = MARGIN; // Start from left margin for proper centering
//       const lineWidth = 32; // Characters per line adjusted for larger fonts

//       // Store Header - Professional styling with larger fonts
//       doc.font('Helvetica-Bold')
//          .fontSize(16)
//          .text(storeInfo.name || 'MEDICAL STORE', 0, undefined, { align: 'center', width: availableWidth });
      
//       if (storeInfo.address) {
//         doc.font('Helvetica-Bold')
//            .fontSize(11)
//            .text(storeInfo.address, 0, undefined, { align: 'center', width: availableWidth });
//       }
      
//       if (storeInfo.phone) {
//         doc.fontSize(11)
//            .text(`Tel: ${storeInfo.phone}`, 0, undefined, { align: 'center', width: availableWidth });
//       }

//       if (storeInfo.email) {
//         doc.fontSize(10)
//            .text(storeInfo.email, 0, undefined, { align: 'center', width: availableWidth });
//       }

//       // Separator line
//       doc.moveDown(0.4)
//          .font('Courier-Bold')
//          .fontSize(12)
//          .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth });

//       // Receipt type and number
//       doc.moveDown(0.3)
//          .font('Helvetica-Bold')
//          .fontSize(14)
//          .text('INVOICE RECEIPT', 0, undefined, { align: 'center', width: availableWidth });

//       doc.font('Courier-Bold')
//          .fontSize(12)
//          .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.4);

//       // Invoice details - Left aligned for better readability
//       const invoiceNo = invoiceData[0]?.invoice_no || generateInvoiceNumber();
//       const currentDate = new Date().toLocaleDateString('en-PK', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//       const currentTime = new Date().toLocaleTimeString('en-PK', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });

//       doc.font('Helvetica-Bold')
//          .fontSize(11)
//          .text(`Invoice: ${invoiceNo}`, centerX)
//          .text(`Date: ${currentDate}`, centerX)
//          .text(`Time: ${currentTime}`, centerX)
//          .text(`Name: ${patientInfo.full_name || invoiceData[0]?.full_name || 'Walk-in Customer'}`, centerX)
//          .moveDown(0.4);

//       // Items header - Use monospace font for proper alignment
      

//       doc.font('Courier-Bold')
//    .fontSize(10)
//    .text('ITEM'.padEnd(13) + 'QTY'.padStart(4) + 'RATE'.padStart(6) + 'AMOUNT'.padStart(8), centerX)
//    .text('-'.repeat(34), centerX)
//    .moveDown(0.2);

// // Items list - All data in single lines with proper alignment
// doc.font('Courier-Bold')
//    .fontSize(10);

// invoiceData.forEach((item, index) => {
//   const fullItemName = (item.item_name || `Item ${index + 1}`).toString().trim();
//   // Truncate long names to fit - no wrapping
//   const itemName = fullItemName.length > 14 ? fullItemName.substring(0, 13) + '.' : fullItemName;
//   const qty = (item.quantity || 1).toString();
//   const rate = parseFloat(item.price || 0);
//   const amount = qty * rate;

//   // Format each column with exact spacing
//   const formattedLine = 
//     itemName.padEnd(13) +                           // Item name: 16 chars
//     qty.padStart(4) +                              // Quantity: 4 chars  
//     rate.toFixed(1).padStart(6) +                  // Rate: 6 chars
//     amount.toFixed(1).padStart(8);                 // Amount: 8 chars

//   doc.text(formattedLine, centerX);
// });


//       // Totals section
//       doc.moveDown(0.3)
//          .font('Courier-Bold')
//          .fontSize(10)
//          .text('-'.repeat(32), centerX);

//       // Right-aligned totals - adjusted for larger font
//       const totalLabelWidth = 16;
//       const totalValueWidth = 12;

//       doc.font('Courier-Bold')
//          .fontSize(11)
//          .text('GROSS TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal).padStart(totalValueWidth), centerX);

//       doc.text('DISCOUNT:'.padEnd(totalLabelWidth) + formatCurrency(discountTotal).padStart(totalValueWidth), centerX);
//       doc.text('NET TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal - discountTotal).padStart(totalValueWidth), centerX);

//       doc.text('ADVANCE:'.padEnd(totalLabelWidth) + formatCurrency(advance).padStart(totalValueWidth), centerX);
//       doc.text(''.padEnd(totalLabelWidth) + '-'.repeat(totalValueWidth), centerX);
//       doc.font('Courier-Bold')
//          .fontSize(11)
//          .text('BALANCE:'.padEnd(totalLabelWidth) + formatCurrency(balance).padStart(totalValueWidth), centerX);

//       // Footer separator
//       doc.font('Courier-Bold')
//          .fontSize(10)
//          .text('='.repeat(28), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.5);

//       // Professional footer - Centered
//       doc.font('Helvetica-Bold')
//          .fontSize(11)
//          .text('Thank you for choosing us!', 0, undefined, { align: 'center', width: availableWidth })
//          .text('For queries: ' + (storeInfo.phone || 'Contact Store'), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.4);

//       // QR Code placeholder (if needed)
//       if (storeInfo.website || storeInfo.qrCode) {
//         doc.fontSize(10)
//            .text('Scan for digital receipt:', 0, undefined, { align: 'center', width: availableWidth })
//            .text('[QR CODE SPACE]', 0, undefined, { align: 'center', width: availableWidth })
//            .moveDown(0.4);
//       }

//       // Receipt footer
//     //   doc.font('Courier-Bold')
//     //      .fontSize(9)
//     //      .text('Generated: ' + new Date().toLocaleString('en-PK'), centerX, undefined, { align: 'center', width: availableWidth })
//     //      .moveDown(0.5);

//       // Cut line
//       doc.fontSize(10)
//          .text('- - - - CUT HERE - - - -', 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(1);

//       doc.end();
//     } catch (err) {
//       doc.end();
//       reject(err);
//     }
//   });
// }


// function generateInvoicePDF(data) {
//   const {
//     invoiceData = [],
//     grandTotal = 0,
//     discountTotal = 0,
//     netTotal = 0,
//     advance = 0,
//     balance = 0,
//     storeInfo = {},
//     patientInfo = {}
//   } = data;

//   return new Promise((resolve, reject) => {
//     const printsDir = path.join(__dirname, 'prints');
//     if (!fs.existsSync(printsDir)) {
//       fs.mkdirSync(printsDir);
//     }

//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const pdfPath = path.join(printsDir, `receipt_${timestamp}.pdf`);

//     // 80mm = 226.77 points (1mm = 2.834645669 points)
//     const THERMAL_WIDTH = 226.77;
//     const MARGIN = 8;
    
//     const doc = new PDFDocument({
//       size: [THERMAL_WIDTH, 1000], // Dynamic height
//       margins: {
//         top: MARGIN,
//         bottom: MARGIN,
//         left: MARGIN,
//         right: MARGIN
//       },
//       layout: 'portrait',
//       bufferPages: true
//     });

//     const stream = fs.createWriteStream(pdfPath);
//     doc.pipe(stream);

//     stream.on('error', reject);
//     stream.on('finish', () => resolve(pdfPath));

//     try {
//       const availableWidth = THERMAL_WIDTH - (MARGIN * 2); // Accounting for margins
//       const centerX = MARGIN; // Start from left margin for proper centering
//       const lineWidth = 32; // Characters per line adjusted for larger fonts

//       // Store Header - Professional styling with larger fonts
//       doc.font('Helvetica-Bold')
//          .fontSize(16)
//          .text(storeInfo.name || 'MEDICAL STORE', 0, undefined, { align: 'center', width: availableWidth });
      
//       if (storeInfo.address) {
//         doc.font('Helvetica-Bold')
//            .fontSize(11)
//            .text(storeInfo.address, 0, undefined, { align: 'center', width: availableWidth });
//       }
      
//       if (storeInfo.phone) {
//         doc.fontSize(11)
//            .text(`Tel: ${storeInfo.phone}`, 0, undefined, { align: 'center', width: availableWidth });
//       }

//       if (storeInfo.email) {
//         doc.fontSize(10)
//            .text(storeInfo.email, 0, undefined, { align: 'center', width: availableWidth });
//       }

//       // Separator line
//       doc.moveDown(0.4)
//          .font('Courier-Bold')
//          .fontSize(12)
//          .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth });

//       // Receipt type and number
//       doc.moveDown(0.3)
//          .font('Helvetica-Bold')
//          .fontSize(14)
//          .text('INVOICE RECEIPT', 0, undefined, { align: 'center', width: availableWidth });

//       doc.font('Courier-Bold')
//          .fontSize(12)
//          .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.4);

//       // Invoice details - Left aligned for better readability
//       const invoiceNo = invoiceData[0]?.invoice_no;
//       const currentDate = new Date().toLocaleDateString('en-PK', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//       const currentTime = new Date().toLocaleTimeString('en-PK', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });

//       doc.font('Helvetica-Bold')
//          .fontSize(11)
//          .text(`Invoice: ${invoiceNo}`, centerX)
//          .text(`Date: ${currentDate}`, centerX)
//          .text(`Time: ${currentTime}`, centerX)
//          .text(`Name: ${patientInfo.full_name || invoiceData[0]?.full_name || 'Walk-in Customer'}`, centerX)
//          .moveDown(0.4);

//       // Items header - Use monospace font for proper alignment
      

//       doc.font('Courier-Bold')
//    .fontSize(10)
//    .text('ITEM'.padEnd(7) + 'QTY'.padStart(5) + 'RATE'.padStart(9) + 'AMOUNT'.padStart(10), centerX)
//    .text('-'.repeat(34), centerX)
//    .moveDown(0.2);

// // Items list - All data in single lines with proper alignment
// doc.font('Courier-Bold')
//    .fontSize(10);


// // invoiceData.forEach((item, index) => {
// //   const fullItemName = (item.item_name || `Item ${index + 1}`).toString().trim();
// //   const qty = (item.quantity || 1).toString();
// //   const rate = parseFloat(item.price || 0);
// //   const amount = (qty * rate).toString();

// //   // Split long item names into multiple lines
// //   const maxItemNameWidth = 7;
// //   const words = fullItemName.split(' ');
// //   const itemNameLines = [];
// //   let currentLine = '';

// //   words.forEach(word => {
// //     if ((currentLine + word).length <= maxItemNameWidth) {
// //       currentLine = currentLine ? `${currentLine} ${word}` : word;
// //     } else {
// //       if (currentLine) itemNameLines.push(currentLine);
// //       currentLine = word;
// //     }
// //   });
// //   if (currentLine) itemNameLines.push(currentLine);

// //   // Print first line with all columns
// //   const firstLine = itemNameLines[0].padEnd(maxItemNameWidth) +
// //                    qty.padStart(5) +
// //                    rate.toFixed(1).padStart(9) +
// //                    amount.padStart(10);
  
// //   doc.text(firstLine, centerX);

// //   // Print additional lines for item name only (if any)
// //   for (let i = 1; i < itemNameLines.length; i++) {
// //     doc.text(itemNameLines[i], centerX);
// //   }

// //   // Add empty line between items (except for the last item)
// //   if (index < invoiceData.length - 1) {
// //     doc.text('', centerX); // Empty line for spacing
// //     doc.moveDown(0.8)
// //   }
// // });

//       // Totals section
      
//       invoiceData.forEach((item, index) => {
//   const fullItemName = (item.item_name || `Item ${index + 1}`).toString().trim();
//   const qty = (item.quantity || 1).toString();
//   const rate = parseFloat(item.price || 0);
//   const amount = (qty * rate).toString();

//   // Split item names after every 6 characters per line
//   const maxCharsPerLine = 6;
//   const itemNameLines = [];

//   // Split string into chunks of 6 characters
//   for (let i = 0; i < fullItemName.length; i += maxCharsPerLine) {
//     const chunk = fullItemName.substring(i, i + maxCharsPerLine);
//     itemNameLines.push(chunk);
//   }

//   // If no words were found, add a default line
//   if (itemNameLines.length === 0) {
//     itemNameLines.push('');
//   }

//   // Print first line with all columns
//   const maxItemNameWidth = 7; // Keep this for padding purposes
//   const firstLine = itemNameLines[0].padEnd(maxItemNameWidth) +
//                    qty.padStart(5) +
//                    rate.toFixed(1).padStart(9) +
//                    amount.padStart(10);
  
//   doc.text(firstLine, centerX);

//   // Print additional lines for item name only (if any)
//   for (let i = 1; i < itemNameLines.length; i++) {
//     doc.text(itemNameLines[i], centerX);
//   }

//   // Add empty line between items (except for the last item)
//   if (index < invoiceData.length - 1) {
//     doc.text('', centerX); // Empty line for spacing
//     doc.moveDown(0.8)
//   }
// });
      
      
//       doc.moveDown(0.3)
//          .font('Courier-Bold')
//          .fontSize(10)
//          .text('-'.repeat(32), centerX);

//       // Right-aligned totals - adjusted for larger font
//       const totalLabelWidth = 14;
//       const totalValueWidth = 12;

//       doc.moveDown(0.3).font('Courier-Bold')
//          .fontSize(12)
//          .text('G.TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal).padStart(totalValueWidth), centerX);

//       doc.moveDown(0.3).text('DISCOUNT:'.padEnd(totalLabelWidth) + formatCurrency(discountTotal).padStart(totalValueWidth), centerX);
//       doc.moveDown(0.3).text('NET TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal - discountTotal).padStart(totalValueWidth), centerX);

//       doc.moveDown(0.3).text('ADVANCE:'.padEnd(totalLabelWidth) + formatCurrency(advance).padStart(totalValueWidth), centerX);
//       doc.text(''.padEnd(totalLabelWidth) + '-'.repeat(totalValueWidth), centerX);
//       doc.font('Courier-Bold')
//          .fontSize(12)
//          .text('BALANCE:'.padEnd(totalLabelWidth) + formatCurrency(balance).padStart(totalValueWidth), centerX);

//       // Footer separator
//       doc.font('Courier-Bold')
//          .fontSize(10)
//          .text('='.repeat(28), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.5);

//       // Professional footer - Centered
//       doc.font('Helvetica-Bold')
//          .fontSize(11)
//          .text('Thank you for choosing us!', 0, undefined, { align: 'center', width: availableWidth })
//          .text('Queries@' + (storeInfo.phone || 'Contact Store'), 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(0.4);

         

//       // QR Code placeholder (if needed)
//       if (storeInfo.website || storeInfo.qrCode) {
//         doc.fontSize(10)
//            .text('Scan for digital receipt:', 0, undefined, { align: 'center', width: availableWidth })
//            .text('[QR CODE SPACE]', 0, undefined, { align: 'center', width: availableWidth })
//            .moveDown(0.4);
//       }

//       // Receipt footer
//     //   doc.font('Courier-Bold')
//     //      .fontSize(9)
//     //      .text('Generated: ' + new Date().toLocaleString('en-PK'), centerX, undefined, { align: 'center', width: availableWidth })
//     //      .moveDown(0.5);

//       // Cut line
//       doc.fontSize(10)
//          .text('- - - - CUT HERE - - - -', 0, undefined, { align: 'center', width: availableWidth })
//          .moveDown(1);

//       doc.end();
//     } catch (err) {
//       doc.end();
//       reject(err);
//     }
//   });
// }


// function formatCurrency(amount) {
//   return parseFloat(amount).toFixed(1).padStart(10);
// }




function generateInvoicePDF(data) {
  const {
    invoiceData = [],
    grandTotal = 0,
    discountTotal = 0,
    netTotal = 0,
    advance = 0,
    balance = 0,
    printType= '',
    storeInfo = {},
    patientInfo = {}
  } = data;

  return new Promise((resolve, reject) => {
    const printsDir = path.join(__dirname, 'prints');
    if (!fs.existsSync(printsDir)) {
      fs.mkdirSync(printsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfPath = path.join(printsDir, `receipt_${timestamp}.pdf`);

    // 80mm = 226.77 points (1mm = 2.834645669 points)
    const THERMAL_WIDTH = 226.77;
    const MARGIN = 8;
    
    const doc = new PDFDocument({
      size: [THERMAL_WIDTH, 1000], // Dynamic height
      margins: {
        top: MARGIN,
        bottom: MARGIN,
        left: MARGIN,
        right: MARGIN
      },
      layout: 'portrait',
      bufferPages: true
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    stream.on('error', reject);
    stream.on('finish', () => resolve(pdfPath));

    try {
      const availableWidth = THERMAL_WIDTH - (MARGIN * 2); // Accounting for margins
      const centerX = MARGIN; // Start from left margin for proper centering
      const lineWidth = 32; // Characters per line adjusted for larger fonts

      // Store Header - Professional styling with larger fonts
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .text(storeInfo.name || 'MEDICAL STORE', 0, undefined, { align: 'center', width: availableWidth });
      
      if (storeInfo.address) {
        doc.font('Helvetica-Bold')
           .fontSize(11)
           .text(storeInfo.address, 0, undefined, { align: 'center', width: availableWidth });
      }
      
      if (storeInfo.phone) {
        doc.fontSize(11)
           .text(`Tel: ${storeInfo.phone}`, 0, undefined, { align: 'center', width: availableWidth });
      }

      if (storeInfo.email) {
        doc.fontSize(10)
           .text(storeInfo.email, 0, undefined, { align: 'center', width: availableWidth });
      }

      // Separator line
      doc.moveDown(0.4)
         .font('Courier-Bold')
         .fontSize(12)
         .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth });


//           doc.font('Helvetica-Bold')
//     .fontSize(12)
//    .text(`${invoiceData[0]?.invoice_type?.toUpperCase()} RECEIPT`, 0, undefined, { align: 'center', width: availableWidth });


doc.font('Helvetica-Bold')
   .fontSize(12)
   .text(
       printType === 'store' 
           ? 'Store Receipt' 
           : `${invoiceData[0]?.invoice_type?.toUpperCase()} RECEIPT`,
       0, undefined, { align: 'center', width: availableWidth }
   );


      doc.font('Courier-Bold')
         .fontSize(12)
         .text('='.repeat(25), 0, undefined, { align: 'center', width: availableWidth })
         .moveDown(0.4);

 

      // Invoice details - Left aligned for better readability
      const invoiceNo = invoiceData[0]?.invoice_no;
      const userName = invoiceData[0]?.user_name;
      const currentDate = new Date().toLocaleDateString('en-PK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const currentTime = new Date().toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text(`Invoice: ${invoiceNo}`, centerX)
         .text(`Customer: ${patientInfo.full_name || invoiceData[0]?.full_name || 'Walk-in Customer'}`, centerX)
         .text(`Date: ${currentDate}`, centerX)
         .text(`Time: ${currentTime}`, centerX)
         .text(`Created By: ${userName}`, centerX)
         .moveDown(0.4);

      // Items header - Use monospace font for proper alignment
      

      doc.font('Courier-Bold')
   .fontSize(10)
   .text('ITEM'.padEnd(7) + 'QTY'.padStart(5) + 'RATE'.padStart(9) + 'AMOUNT'.padStart(10), centerX)
   .text('-'.repeat(34), centerX)
   .moveDown(0.2);

// Items list - All data in single lines with proper alignment
doc.font('Courier-Bold')
   .fontSize(10);


// invoiceData.forEach((item, index) => {
//   const fullItemName = (item.item_name || `Item ${index + 1}`).toString().trim();
//   const qty = (item.quantity || 1).toString();
//   const rate = parseFloat(item.price || 0);
//   const amount = (qty * rate).toString();

//   // Split long item names into multiple lines
//   const maxItemNameWidth = 7;
//   const words = fullItemName.split(' ');
//   const itemNameLines = [];
//   let currentLine = '';

//   words.forEach(word => {
//     if ((currentLine + word).length <= maxItemNameWidth) {
//       currentLine = currentLine ? `${currentLine} ${word}` : word;
//     } else {
//       if (currentLine) itemNameLines.push(currentLine);
//       currentLine = word;
//     }
//   });
//   if (currentLine) itemNameLines.push(currentLine);

//   // Print first line with all columns
//   const firstLine = itemNameLines[0].padEnd(maxItemNameWidth) +
//                    qty.padStart(5) +
//                    rate.toFixed(1).padStart(9) +
//                    amount.padStart(10);
  
//   doc.text(firstLine, centerX);

//   // Print additional lines for item name only (if any)
//   for (let i = 1; i < itemNameLines.length; i++) {
//     doc.text(itemNameLines[i], centerX);
//   }

//   // Add empty line between items (except for the last item)
//   if (index < invoiceData.length - 1) {
//     doc.text('', centerX); // Empty line for spacing
//     doc.moveDown(0.8)
//   }
// });

      // Totals section
     
      invoiceData.forEach((item, index) => {
  const fullItemName = (item.item_name || `Item ${index + 1}`).toString().trim();
  const qty = (item.quantity || 1).toString();
  const rate = parseFloat(item.price || 0);
  const amount = (qty * rate).toString();

  // Split item names after every 6 characters per line
  const maxCharsPerLine = 6;
  const itemNameLines = [];

  // Split string into chunks of 6 characters
  for (let i = 0; i < fullItemName.length; i += maxCharsPerLine) {
    const chunk = fullItemName.substring(i, i + maxCharsPerLine);
    itemNameLines.push(chunk);
  }

  // If no words were found, add a default line
  if (itemNameLines.length === 0) {
    itemNameLines.push('');
  }

  // Print first line with all columns
  const maxItemNameWidth = 7; // Keep this for padding purposes
  const firstLine = itemNameLines[0].padEnd(maxItemNameWidth) +
                   qty.padStart(5) +
                   rate.toFixed(1).padStart(9) +
                   amount.padStart(10);
  
  doc.text(firstLine, centerX);

  // Print additional lines for item name only (if any)
  for (let i = 1; i < itemNameLines.length; i++) {
    doc.text(itemNameLines[i], centerX);
  }

  // Add empty line between items (except for the last item)
  if (index < invoiceData.length - 1) {
    doc.text('', centerX); // Empty line for spacing
    doc.moveDown(0.8)
  }
});
     
      doc.moveDown(0.3)
         .font('Courier-Bold')
         .fontSize(10)
         .text('-'.repeat(32), centerX);

      // Right-aligned totals - adjusted for larger font
      const totalLabelWidth = 14;
      const totalValueWidth = 12;

      doc.moveDown(0.3).font('Courier-Bold')
         .fontSize(12)
         .text('G.TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal).padStart(totalValueWidth), centerX);

      doc.moveDown(0.3).text('DISCOUNT:'.padEnd(totalLabelWidth) + formatCurrency(discountTotal).padStart(totalValueWidth), centerX);
      doc.moveDown(0.3).text('NET TOTAL:'.padEnd(totalLabelWidth) + formatCurrency(grandTotal - discountTotal).padStart(totalValueWidth), centerX);

      doc.moveDown(0.3).text('ADVANCE:'.padEnd(totalLabelWidth) + formatCurrency(advance).padStart(totalValueWidth), centerX);
      doc.text(''.padEnd(totalLabelWidth) + '-'.repeat(totalValueWidth), centerX);
      doc.font('Courier-Bold')
         .fontSize(12)
         .text('BALANCE:'.padEnd(totalLabelWidth) + formatCurrency(balance).padStart(totalValueWidth), centerX);

      // Footer separator
      doc.font('Courier-Bold')
         .fontSize(10)
         .text('='.repeat(28), 0, undefined, { align: 'center', width: availableWidth })
         .moveDown(0.5);

      // Professional footer - Centered
      doc.font('Helvetica-Bold')
         .fontSize(11)
         .text('Thank you for choosing us!', 0, undefined, { align: 'center', width: availableWidth })
         .text('@queries: ' + (storeInfo.phone || 'Contact Store'), 0, undefined, { align: 'center', width: availableWidth })
         .moveDown(0.4);

      // QR Code placeholder (if needed)
      if (storeInfo.website || storeInfo.qrCode) {
        doc.fontSize(10)
           .text('Scan for digital receipt:', 0, undefined, { align: 'center', width: availableWidth })
           .text('[QR CODE SPACE]', 0, undefined, { align: 'center', width: availableWidth })
           .moveDown(0.4);
      }

      // Receipt footer
    //   doc.font('Courier-Bold')
    //      .fontSize(9)
    //      .text('Generated: ' + new Date().toLocaleString('en-PK'), centerX, undefined, { align: 'center', width: availableWidth })
    //      .moveDown(0.5);

      // Cut line
      doc.fontSize(10)
         .text('- - - - CUT HERE - - - -', 0, undefined, { align: 'center', width: availableWidth })
         .moveDown(1);

      doc.end();
    } catch (err) {
      doc.end();
      reject(err);
    }
  });
}


function formatCurrency(amount) {
  return parseFloat(amount).toFixed(1).padStart(10);
}

// ======================
// 6. PRINT FUNCTION
// ======================
async function printToThermalPrinter(pdfPath) {
  const options = {
    printer: THERMAL_PRINTER.name,
    scale: 'noscale',
    paperSize: THERMAL_PRINTER.paperSizes[0],
    margins: { marginType: 'none' },
    silent: true,
    printQuality: 'high',
    pageRanges: '1'
  };

  try {
    await print(pdfPath, options);
    return { success: true, printer: THERMAL_PRINTER.name };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      troubleshooting: [
        '1. Check printer is powered and connected',
        '2. Verify paper is loaded (80mm width)',
        '3. Ensure printer driver is installed',
        '4. Check printer firmware for margin settings',
        '5. Verify paper size is set to 80mm x 210mm in printer settings'
      ]
    };
  }
}

// ======================
// 7. API ENDPOINT
// ======================
app.post('/print-invoice', async (req, res) => {
  try {
    const pdfPath = await generateInvoicePDF(req.body);

    // return false;
    const printResult = await printToThermalPrinter(pdfPath);

    if (!printResult.success) {
      throw new Error(printResult.error || 'Printing failed');
    }

    // Clean up
    fs.unlink(pdfPath, () => {});

    res.json(printResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      printer: THERMAL_PRINTER,
      requiredPaper: '80mm x 210mm thermal roll'
    });
  }
});







app.post('/update-status', (req, res) => {
    const { id, status } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error updating category' });
            return;
        }

        // Build the UPDATE query with all the columns to be updated
        const sql = 'UPDATE invoice SET status = ? WHERE id = ?';
        const values = [status, id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error updating category:', error);
                res.status(500).json({ error: 'Error updating category' });
            } else {
                console.log('Category updated successfully');
                res.status(200).json({ message: 'Category updated successfully' });
            }
        });
    });
});




// Set up heartbeat check
wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
  
    console.log('New WebSocket client connected');
  
    ws.on('message', (message) => {
      console.log('Received:', message);
      // Handle the incoming message (e.g., invoice updated)
    });
  
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });
  
  // Heartbeat interval to close dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log('Terminating dead connection');
        return ws.terminate();
      }
  
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds
  
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };
  
  process.on('exit', () => {
    clearInterval(interval);
  });


  

/** ✅ MySQL Backup Route */
app.get('/backup', async(req, res) => {
    try {
        fs.mkdirSync('./backups', { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:]/g, '-');
        const backupFile = path.join('./backups', `backup-${timestamp}.sql`);

        console.log("📂 Generated backup file path:", backupFile);

        // Construct the mysqldump command safely
        const passwordFlag = password ? `-p${password}` : '';
        const command = `mysqldump -u ${user} ${passwordFlag} -h ${host} ${database} > "${backupFile}"`;

        // Execute the backup command
        await executeCommand(command);
        console.log(`✅ Backup created successfully at ${backupFile}`);

        // Authorize and upload the backup to Google Drive
        const auth = await authorize();
        await uploadBackupToDrive(auth, backupFile);

        res.status(200).json({
            message: `✅ Backup successfully created and uploaded to Google Drive: ${backupFile}`,
        });
    } catch (error) {
        console.error("❌ Error during backup process:", error.message);
        res.status(500).json({ message: "Error creating database backup." });
    }
});

/** ✅ Execute a shell command */
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(new Error(stderr || "Error executing command"));
            }
            resolve(stdout);
        });
    });
}




app.get('/attendance/:date', (req, res) => {
    const { date } = req.params;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error connecting to the database' });
            return;
        }

        const sql = 'SELECT * FROM attendance WHERE date = ?';

        connection.query(sql, [date], (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error fetching attendance data:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ results });
            }
        });
    });
});





app.get('/get-all-heads', (req, res) => { 
    const { type } = req.query;  // Get 'date' and 'type' from query parameters

    if (!type) {
        return res.status(400).json({ error: 'type is required' });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error connecting to the database' });
            return;
        }

        let sql = '';
        // Check the type and set the appropriate query
        if (type === 'opd') {
            // Query for doctors table
            sql = `
               SELECT doctors.id, CONCAT(doctors.doctor_name, ' (', doctors.specialization, ') (', departments.department, ')') AS item_detail
FROM doctors
INNER JOIN departments ON departments.id = doctors.department_id `;
        } else if (type === 'lab_test' || type === 'radiology' || type === 'other_procedure') {
            // Query for lab_tests table
            sql = `
                SELECT id, lab_test as item_detail 
                FROM lab_tests`
        } else {
            return res.status(400).json({ error: 'Invalid type. It must be either "doctor" or "lab_test".' });
        }

        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ results });
            }
        });
    });
});




app.post('/submit-attendance', (req, res) => {
    const { date, attendanceData } = req.body;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error connecting to the database' });
            return;
        }

        // First, fetch existing attendance data for the date
        const fetchSql = 'SELECT employee_id FROM attendance WHERE date = ?';
        connection.query(fetchSql, [date], (fetchError, fetchResults) => {
            if (fetchError) {
                connection.release();
                console.error('Error fetching existing attendance:', fetchError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Extract existing employee IDs
            const existingEmployeeIds = fetchResults.map(result => result.employee_id);

            // Separate data into updates and inserts
            const updateData = [];
            const insertData = [];

            attendanceData.forEach(item => {
                if (existingEmployeeIds.includes(item.employee_id)) {
                    updateData.push([item.status, item.remarks, item.employee_id, date]);
                } else {
                    insertData.push([item.employee_id, date, item.status, item.remarks]);
                }
            });

            // Perform updates if any
            if (updateData.length > 0) {
                const updateSql = 'UPDATE attendance SET status = ?, remarks = ? WHERE employee_id = ? AND date = ?';
                updateData.forEach(data => {
                    connection.query(updateSql, data, (updateError) => {
                        if (updateError) {
                            connection.release();
                            console.error('Error updating attendance data:', updateError);
                            res.status(500).json({ error: 'Internal server error' });
                            return;
                        }
                    });
                });
            }

            // Perform inserts if any
            if (insertData.length > 0) {
                const insertSql = 'INSERT INTO attendance (employee_id, date, status, remarks) VALUES ?';
                connection.query(insertSql, [insertData], (insertError) => {
                    if (insertError) {
                        connection.release();
                        console.error('Error inserting attendance data:', insertError);
                        res.status(500).json({ error: 'Internal server error' });
                        return;
                    }
                });
            }

            // Ensure the connection is released only once after all operations are complete
            connection.release();
            res.json({ message: 'Attendance data saved/updated successfully!' });
        });
    });
});

app.get('/employee-list-for-attendance', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error connecting to the database' });
            return;
        }

        const sql = 'SELECT * FROM employees';

        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ results });
            }
        });
    });
});





app.get('/view-employee/:employee_id', (req, res) => {
    const employee_id = parseInt(req.params.employee_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error getting employee' });
            return;
        }

        const sql = 'SELECT * FROM employees WHERE id = ?';
        const values = [employee_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error getting employee:', error);
                res.status(500).json({ error: 'Error getting employee' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ results });
            }
        });
    });
});






app.get('/get-users', (req, res) => {

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error getting employee' });
            return;
        }

        const sql = 'SELECT * FROM doctors';

        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error getting users:', error);
                res.status(500).json({ error: 'Error getting users' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ results });
            }
        });
    });
});






app.post('/insert-user', (req, res) => {
    console.log('Request body:', req.body);

    // Validate required fields
    if (!req.body.user_name || !req.body.password || !req.body.user_type) {
        return res.status(400).json({ error: "Username, password, and user type are required" });
    }

    // Additional validation for Doctor type
    if (req.body.user_type === 'Doctor' && !req.body.user_id) {
        return res.status(400).json({ error: "Doctor ID is required for Doctor user type" });
    }

    // For non-Doctor types, set user_id to NULL
    const user_id = req.body.user_type === 'Doctor' ? req.body.user_id : null;

    const checkSql = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
    const insertSql = 'INSERT INTO users (username, password, user_type, user_id) VALUES (?, ?, ?, ?)';

    // Hash password
    bcrypt.hash(req.body.password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error('Error hashing password:', hashErr);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const values = [
            req.body.user_name,
            hashedPassword,
            req.body.user_type,
            user_id  // This will be either the provided user_id or NULL
        ];

        connection.getConnection((err, connection) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({ error: 'Database connection error' });
            }

            connection.query(checkSql, [req.body.user_name], (err, results) => {
                if (err) {
                    connection.release();
                    console.error("Error checking for duplicate user:", err);
                    return res.status(500).json({ error: "Error checking for duplicate user" });
                }

                if (results[0].count > 0) {
                    connection.release();
                    return res.status(400).json({ error: "User already exists" });
                }

                connection.query(insertSql, values, (err, result) => {
                    connection.release();

                    if (err) {
                        console.error("Error inserting data:", err);
                        return res.status(500).json({ error: "Error inserting data" });
                    } else {
                        console.log("Data inserted successfully");
                        return res.status(200).json({ message: "User registered successfully" });
                    }
                });
            });
        });
    });
});




app.get('/employee-list', (req, res) => {



    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.search;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching employees' });
            return;
        }

        // SQL query to select paginated results
        let sql = `SELECT * FROM employees`;
        if (search) {
            sql += ` WHERE employee_name LIKE '%${search}%' OR phone_no LIKE '%${search}%' OR cnic LIKE '%${search}%'`;
        }
        sql += ` LIMIT ${limit} OFFSET ${offset}`;


        // Execute the query
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release(); // Release the connection
                return;
            }

            // Query to get total count of items
            const countSql = 'SELECT COUNT(*) as total FROM employees';

            // Execute the count query
            connection.query(countSql, (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalCategories = countResult[0].total;

                // Calculate total pages based on total count and limit
                const totalPages = Math.ceil(totalCategories / limit);

                // Send paginated results and pagination metadata as JSON
                res.json({
                    totalCategories,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});


// app.get('/income_report_list', (req, res) => {
//     const from_date = req.query.from_date;
//     const to_date = req.query.to_date;
//     const medicine_type = req.query.medicine_type;
//     const supplier_id = req.query.supplier_id; // Parse the date string to a Date object
    
//     // Check if the required dates are provided
//     if (!from_date || !to_date) {
//         return res.status(400).json({ error: 'from_date and to_date are required' });
//     }
    
//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }
        
//         // Base SQL query
//         let sql = `SELECT invoice_pharmacy.*, items.items as item_name, items.medicine_type, stock.purchase_rate_calculate_per_tablet
//                    FROM invoice_pharmacy
//                    INNER JOIN items ON invoice_pharmacy.item = items.id 
//                    LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id
//                    WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ?`;
        
//         // Parameters array starting with the date range
//         let params = [from_date, to_date];
        
//         // Add medicine_type filter if provided
//         if (medicine_type && medicine_type.trim() !== '') {
//             sql += ` AND items.medicine_type = ?`;
//             params.push(medicine_type);
//         }

//          if (supplier_id && supplier_id.trim() !== '') {
//             sql += ` AND stock.supplier_id = ?`;
//             params.push(supplier_id);
//         }
        
//         // Add ORDER BY clause
//         sql += ` ORDER BY invoice_no ASC`;
        
//         // Execute the query with dynamic parameters
//         connection.query(sql, params, (error, results) => {
//             connection.release(); // Always release the connection after query
            
//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }
            
//             res.json({
//                 results
//             });
//         });
//     });
// });





// app.get('/income_report_list', (req, res) => {
//     const from_date = req.query.from_date;
//     const to_date = req.query.to_date;
//     const medicine_type = req.query.medicine_type;
//     const supplier_id = req.query.supplier_id;

//     // Check if the required dates are provided
//     if (!from_date || !to_date) {
//         return res.status(400).json({ error: 'from_date and to_date are required' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }

//         // Base SQL query for invoice data
//         let sql = `SELECT invoice_pharmacy.*, items.items as item_name, items.medicine_type, stock.purchase_rate_calculate_per_tablet
//                    FROM invoice_pharmacy
//                    INNER JOIN items ON invoice_pharmacy.item = items.id 
//                    LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id
//                    WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ?`;

//         // Parameters array starting with the date range
//         let params = [from_date, to_date];

//         // Add medicine_type filter if provided
//         if (medicine_type && medicine_type.trim() !== '') {
//             sql += ` AND items.medicine_type = ?`;
//             params.push(medicine_type);
//         }

//         if (supplier_id && supplier_id.trim() !== '') {
//             sql += ` AND stock.supplier_id = ?`;
//             params.push(supplier_id);
//         }

//         // Add ORDER BY clause
//         sql += ` ORDER BY invoice_no ASC`;

//         // Paid payments query
//         let paymentSql = `SELECT SUM(paid_payments) as total_paid_payments 
//                          FROM paid_payments WHERE created_at BETWEEN ? AND ?`;
        
//         let paymentParams = [from_date, to_date];

//         if (supplier_id && supplier_id.trim() !== '') {
//             paymentSql += ` AND paid_payments.supplier_id = ?`;
//             paymentParams.push(supplier_id);
//         }

//         // Execute the main query
//         connection.query(sql, params, (error, results) => {
//             if (error) {
//                 connection.release();
//                 console.error('Error executing main SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             // Execute the payment total query
//             connection.query(paymentSql, paymentParams, (paymentError, paymentResults) => {
//                 connection.release(); // Always release the connection after all queries

//                 if (paymentError) {
//                     console.error('Error executing payment SQL query: ', paymentError);
//                     return res.status(500).json({ error: 'Internal server error' });
//                 }

//                 const totalPaidPayments = paymentResults[0].total_paid_payments || 0;

//                 res.json({
//                     results,
//                     total_paid_payments: totalPaidPayments
//                 });
//             });
//         });
//     });
// });




// app.get('/income_report_list', (req, res) => {
//     const from_date = req.query.from_date;
//     const to_date = req.query.to_date;
//     const medicine_type = req.query.medicine_type;
//     const supplier_id = req.query.supplier_id;

//     // Check if the required dates are provided
//     if (!from_date || !to_date) {
//         return res.status(400).json({ error: 'from_date and to_date are required' });
//     }

//     connection.getConnection((err, conn) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error connecting to database' });
//         }

//         // Base SQL query for invoice data
//         let sql = `SELECT invoice_pharmacy.*, 
//                           items.items as item_name, 
//                           items.medicine_type, 
//                           stock.purchase_rate_calculate_per_tablet
//                    FROM invoice_pharmacy
//                    INNER JOIN items ON invoice_pharmacy.item = items.id 
//                    LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id
//                    WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ?`;

//         // Parameters array starting with the date range
//         let params = [from_date, to_date];

//         // Add medicine_type filter if provided
//         if (medicine_type && medicine_type.trim() !== '') {
//             sql += ` AND items.medicine_type = ?`;
//             params.push(medicine_type);
//         }

//         // Add supplier_id filter if provided
//         if (supplier_id && supplier_id.trim() !== '') {
//             sql += ` AND stock.supplier_id = ?`;
//             params.push(supplier_id);
//         }

//         // Add ORDER BY clause
//         sql += ` ORDER BY invoice_no ASC`;

//         // Paid payments query
//         let paymentSql = `SELECT SUM(paid_payments) as total_paid_payments
//                          FROM paid_payments 
//                          WHERE created_at >= ? AND created_at <= ?`;
        
//         let paymentParams = [from_date, to_date];

//         if (supplier_id && supplier_id.trim() !== '') {
//             paymentSql += ` AND supplier_id = ?`;
//             paymentParams.push(supplier_id);
//         }

//         // Expense query
//        let expenseSql = `SELECT SUM(amount) as total_expense_payments 
//                   FROM daily_expenses 
//                   WHERE expense_date >= ? AND expense_date <= ?`;

//         let expenseParams = [from_date, to_date];

//         // Execute all queries
//         conn.query(sql, params, (error, invoiceResults) => {
//             if (error) {
//                 conn.release();
//                 console.error('Error executing main SQL query: ', error);
//                 return res.status(500).json({ error: 'Error fetching invoice data' });
//             }

//             // Execute payment query
//             conn.query(paymentSql, paymentParams, (paymentError, paymentResults) => {
//                 if (paymentError) {
//                     conn.release();
//                     console.error('Error executing payment SQL query: ', paymentError);
//                     return res.status(500).json({ error: 'Error fetching payment data' });
//                 }

//                 // Execute expense query
//                 conn.query(expenseSql, expenseParams, (expenseError, expenseResults) => {
//                     conn.release(); // Release connection after all queries are done

//                     if (expenseError) {
//                         console.error('Error executing expense SQL query: ', expenseError);
//                         return res.status(500).json({ error: 'Error fetching expense data' });
//                     }

//                     const totalPaidPayments = paymentResults[0]?.total_paid_payments || 0;
//                     const totalExpensePayments = expenseResults[0]?.total_expense_payments || 0;

//                     res.json({
//                         results: invoiceResults,
//                         total_paid_payments: totalPaidPayments,
//                         total_expense_payments: totalExpensePayments
//                     });
//                 });
//             });
//         });
//     });
// });





// app.get("/income_report_list", (req, res) => {
//   const from_date = req.query.from_date;
//   const to_date = req.query.to_date;
//   const medicine_type = req.query.medicine_type;
//   const supplier_id = req.query.supplier_id;

//   // Check if the required dates are provided
//   if (!from_date || !to_date) {
//     return res
//       .status(400)
//       .json({ error: "from_date and to_date are required" });
//   }

//   connection.getConnection((err, conn) => {
//     if (err) {
//       console.error("Error getting connection: ", err);
//       return res.status(500).json({ error: "Error connecting to database" });
//     }

//     // Base SQL query for invoice data
//     let sql = `SELECT invoice_pharmacy.*, 
//                           items.items as item_name, 
//                           items.medicine_type, 
//                           stock.purchase_rate_calculate_per_tablet
//                    FROM invoice_pharmacy
//                    INNER JOIN items ON invoice_pharmacy.item = items.id 
//                    LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id
//                    WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ?`;

//     // Parameters array starting with the date range
//     let params = [from_date, to_date];

//     // Add medicine_type filter if provided
//     if (medicine_type && medicine_type.trim() !== "") {
//       sql += ` AND items.medicine_type = ?`;
//       params.push(medicine_type);
//     }

//     // Add supplier_id filter if provided
//     if (supplier_id && supplier_id.trim() !== "") {
//       sql += ` AND stock.supplier_id = ?`;
//       params.push(supplier_id);
//     }

//     // Add ORDER BY clause
//     sql += ` ORDER BY invoice_no ASC`;

//     // Paid payments query
//     let paymentSql = `SELECT SUM(paid_payments) as total_paid_payments
//                          FROM paid_payments 
//                          WHERE created_at >= ? AND created_at <= ?`;

//     let paymentParams = [from_date, to_date];

//     if (supplier_id && supplier_id.trim() !== "") {
//       paymentSql += ` AND supplier_id = ?`;
//       paymentParams.push(supplier_id);
//     }

//     // Expense query
//     let expenseSql = `SELECT SUM(amount) as total_expense_payments 
//                   FROM daily_expenses 
//                   WHERE expense_date >= ? AND expense_date <= ?`;

//     let expenseParams = [from_date, to_date];

//     // Execute all queries
//     conn.query(sql, params, (error, invoiceResults) => {
//       if (error) {
//         conn.release();
//         console.error("Error executing main SQL query: ", error);
//         return res.status(500).json({ error: "Error fetching invoice data" });
//       }

//       // Execute payment query
//       conn.query(paymentSql, paymentParams, (paymentError, paymentResults) => {
//         if (paymentError) {
//           conn.release();
//           console.error("Error executing payment SQL query: ", paymentError);
//           return res.status(500).json({ error: "Error fetching payment data" });
//         }

//         // Execute expense query
//         conn.query(
//           expenseSql,
//           expenseParams,
//           (expenseError, expenseResults) => {
//             conn.release(); // Release connection after all queries are done

//             if (expenseError) {
//               console.error(
//                 "Error executing expense SQL query: ",
//                 expenseError
//               );
//               return res
//                 .status(500)
//                 .json({ error: "Error fetching expense data" });
//             }

//             const totalPaidPayments =
//               paymentResults[0]?.total_paid_payments || 0;
//             const totalExpensePayments =
//               expenseResults[0]?.total_expense_payments || 0;

//             res.json({
//               results: invoiceResults,
//               total_paid_payments: totalPaidPayments,
//               total_expense_payments: totalExpensePayments,
//             });
//           }
//         );
//       });
//     });
//   });
// });






// app.get("/get-payment-summary-for-report", (req, res) => {
//   const { from_date, to_date } = req.query;
  
//   if (!from_date || !to_date) {
//     return res.status(400).json({ error: 'Date range is required' });
//   }

//   connection.getConnection((err, conn) => {
//     if (err) {
//       console.error("Error getting connection: ", err);
//       return res.status(500).json({ error: "Error connecting to database" });
//     }

//     // Payment Summary Query - PAYMENT_DATE based (not invoice_date)
//     let summaryQuery = `
//       SELECT 
//         -- Additional payments jo is date range mein RECEIVE hui (payment_date based)
//         COALESCE((
//           SELECT SUM(payment_amount)
//           FROM invoice_payments
//           WHERE DATE(payment_date) BETWEEN ? AND ?
//         ), 0) as additional_payments_in_period
//     `;

//     conn.query(
//       summaryQuery, 
//       [from_date, to_date, from_date, to_date, from_date, to_date], 
//       (error, results) => {
//         conn.release();

//         if (error) {
//           console.error("Error fetching payment summary:", error);
//           return res.status(500).json({ error: "Database error" });
//         }

//         const data = results[0];
//         const additionalPayments = parseFloat(data.additional_payments_in_period || 0);

//         res.json({
//           additional_payments_in_period: additionalPayments,
//         });
//       }
//     );
//   });
// });



// app.get('/income_report_list', (req, res) => {

//     const from_date = req.query.from_date; // Parse the date string to a Date object
//     const to_date = req.query.to_date; // Parse the date string to a Date object
//     const medicine_type = req.query.medicine_type; // Parse the date string to a Date object
    
//     // Check if the dates are valid
//     if (!from_date && !to_date) {
//         return res.status(400).json({ error: 'Invalid date format' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }

//         // SQL query to select paginated results
//         let sql = `SELECT invoice_pharmacy.*, items.items as item_name, items.medicine_type, stock.purchase_rate_calculate_per_tablet
//                    FROM invoice_pharmacy
//                    INNER JOIN items ON invoice_pharmacy.item = items.id 
//                    LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id 
//                    WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ? ORDER BY invoice_no ASC`;

//         // Execute the query with the date parameters
//         connection.query(sql, [from_date, to_date], (error, results) => {
//             connection.release(); // Always release the connection after query

//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             res.json({
//                 results
//             });
//         });
//     });
// });




// app.get('/stock_item_wise_detail_report_list', (req, res) => {
//     const { from_date, to_date, supplier_id, item_id } = req.query;
    

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }

//         // Base SQL query
//         let sql = `SELECT stock.*, items.items as item_name
//                    FROM stock
//                    INNER JOIN items ON stock.item_id = items.id 
//                    INNER JOIN suppliers ON stock.supplier_id = suppliers.id 
//                    WHERE stock.item_id = ?`;
        
//         // Parameters array starts with the dates
//         let params = [item_id];

//         // Add conditions for optional parameters
//         if (supplier_id) {
//             sql += ' AND stock.supplier_id = ?';
//             params.push(supplier_id);
//         }

//         if (from_date && to_date) {
//           sql += " AND stock.stock_date BETWEEN ? AND ?";
//           params.push(from_date, to_date);
//         }

//         sql += ' ORDER BY stock.id ASC';

//         // Execute the query with the parameters
//         connection.query(sql, params, (error, results) => {
//             connection.release(); // Always release the connection after query

//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             res.json({ results });
//         });
//     });
// });




// app.get("/income_report_list", (req, res) => {
//   const from_date = req.query.from_date;
//   const to_date = req.query.to_date;
//   const medicine_type = req.query.medicine_type;
//   const supplier_id = req.query.supplier_id;

//   // Check if the required dates are provided
//   if (!from_date || !to_date) {
//     return res
//       .status(400)
//       .json({ error: "from_date and to_date are required" });
//   }

//   connection.getConnection((err, conn) => {
//     if (err) {
//       console.error("Error getting connection: ", err);
//       return res.status(500).json({ error: "Error connecting to database" });
//     }

//     // Base SQL query for invoice data
//     let sql = `SELECT invoice_pharmacy.*, 
//                           items.items as item_name, 
//                           items.medicine_type, 
//                           stock.purchase_rate_calculate_per_tablet
//                    FROM invoice_pharmacy
//                    INNER JOIN items ON invoice_pharmacy.item = items.id 
//                    LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id
//                    WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ?`;

//     // Parameters array starting with the date range
//     let params = [from_date, to_date];

//     // Add medicine_type filter if provided
//     if (medicine_type && medicine_type.trim() !== "") {
//       sql += ` AND items.medicine_type = ?`;
//       params.push(medicine_type);
//     }

//     // Add supplier_id filter if provided
//     if (supplier_id && supplier_id.trim() !== "") {
//       sql += ` AND stock.supplier_id = ?`;
//       params.push(supplier_id);
//     }

//     // Add ORDER BY clause
//     sql += ` ORDER BY invoice_no ASC`;

//     // Paid payments query
//     let paymentSql = `SELECT SUM(paid_payments) as total_paid_payments
//                          FROM paid_payments 
//                          WHERE created_at >= ? AND created_at <= ?`;

//     let paymentParams = [from_date, to_date];

//     if (supplier_id && supplier_id.trim() !== "") {
//       paymentSql += ` AND supplier_id = ?`;
//       paymentParams.push(supplier_id);
//     }

//     // Expense query
//     let expenseSql = `SELECT SUM(amount) as total_expense_payments 
//                   FROM daily_expenses 
//                   WHERE expense_date >= ? AND expense_date <= ?`;

//     let expenseParams = [from_date, to_date];

//     // Payment summary query (additional payments)
//     let additionalPaymentsSql = `
//       SELECT COALESCE(SUM(payment_amount), 0) as additional_payments_in_period
//       FROM invoice_payments
//       WHERE DATE(payment_date) BETWEEN ? AND ?`;

//     let additionalPaymentsParams = [from_date, to_date];

//     // Execute all queries
//     conn.query(sql, params, (error, invoiceResults) => {
//       if (error) {
//         conn.release();
//         console.error("Error executing main SQL query: ", error);
//         return res.status(500).json({ error: "Error fetching invoice data" });
//       }

//       // Execute payment query
//       conn.query(paymentSql, paymentParams, (paymentError, paymentResults) => {
//         if (paymentError) {
//           conn.release();
//           console.error("Error executing payment SQL query: ", paymentError);
//           return res.status(500).json({ error: "Error fetching payment data" });
//         }

//         // Execute expense query
//         conn.query(
//           expenseSql,
//           expenseParams,
//           (expenseError, expenseResults) => {
//             if (expenseError) {
//               conn.release();
//               console.error("Error executing expense SQL query: ", expenseError);
//               return res
//                 .status(500)
//                 .json({ error: "Error fetching expense data" });
//             }

//             // Execute additional payments query
//             conn.query(
//               additionalPaymentsSql,
//               additionalPaymentsParams,
//               (additionalError, additionalResults) => {
//                 conn.release(); // Release connection after all queries are done

//                 if (additionalError) {
//                   console.error(
//                     "Error executing additional payments SQL query: ",
//                     additionalError
//                   );
//                   return res
//                     .status(500)
//                     .json({ error: "Error fetching additional payments data" });
//                 }

//                 const totalPaidPayments =
//                   paymentResults[0]?.total_paid_payments || 0;
//                 const totalExpensePayments =
//                   expenseResults[0]?.total_expense_payments || 0;
//                 const additionalPayments =
//                   parseFloat(additionalResults[0]?.additional_payments_in_period || 0);

//                 res.json({
//                   results: invoiceResults,
//                   total_paid_payments: totalPaidPayments,
//                   total_expense_payments: totalExpensePayments,
//                   additional_payments_in_period: additionalPayments,
//                 });
//               }
//             );
//           }
//         );
//       });
//     });
//   });
// });








app.get("/income_report_list", (req, res) => {
  const from_date = req.query.from_date;
  const to_date = req.query.to_date;
  const medicine_type = req.query.medicine_type;
  const supplier_id = req.query.supplier_id;

  // Check if the required dates are provided
  if (!from_date || !to_date) {
    return res
      .status(400)
      .json({ error: "from_date and to_date are required" });
  }

  connection.getConnection((err, conn) => {
    if (err) {
      console.error("Error getting connection: ", err);
      return res.status(500).json({ error: "Error connecting to database" });
    }

    // Base SQL query for invoice data
    let sql = `SELECT invoice_pharmacy.*, 
                          items.items as item_name, 
                          items.medicine_type, 
                          stock.purchase_rate_calculate_per_tablet
                   FROM invoice_pharmacy
                   INNER JOIN items ON invoice_pharmacy.item = items.id 
                   LEFT JOIN stock ON invoice_pharmacy.stock_id = stock.id
                   WHERE invoice_type = 'sale' AND invoice_date BETWEEN ? AND ?`;

    let params = [from_date, to_date];

    if (medicine_type && medicine_type.trim() !== "") {
      sql += ` AND items.medicine_type = ?`;
      params.push(medicine_type);
    }

    if (supplier_id && supplier_id.trim() !== "") {
      sql += ` AND stock.supplier_id = ?`;
      params.push(supplier_id);
    }

    sql += ` ORDER BY invoice_no ASC`;

    // Paid payments query
    let paymentSql = `SELECT SUM(paid_payments) as total_paid_payments
                         FROM paid_payments 
                         WHERE created_at >= ? AND created_at <= ?`;

    let paymentParams = [from_date, to_date];

    if (supplier_id && supplier_id.trim() !== "") {
      paymentSql += ` AND supplier_id = ?`;
      paymentParams.push(supplier_id);
    }

    // Expense query
    let expenseSql = `SELECT SUM(amount) as total_expense_payments 
                  FROM daily_expenses 
                  WHERE expense_date >= ? AND expense_date <= ?`;

    let expenseParams = [from_date, to_date];

    // Additional payments query
    let additionalPaymentsSql = `
      SELECT COALESCE(SUM(payment_amount), 0) as additional_payments_in_period
      FROM invoice_payments
      WHERE DATE(payment_date) BETWEEN ? AND ?`;

    let additionalPaymentsParams = [from_date, to_date];

    // Commission payments query
    let commissionSql = `
       SELECT COALESCE(SUM(payment_amount), 0) as total_commission_payments
  FROM commission_payments
  WHERE (salary_id IS NULL OR salary_id <= 0)
    AND DATE(payment_date) BETWEEN ? AND ?`;

    let commissionParams = [from_date, to_date];

    // Staff salary query
    let salarySql = `
      SELECT COALESCE(SUM(net_salary), 0) as total_salary_payments
      FROM staff_salary
      WHERE (year = YEAR(?) AND month >= MONTH(?)) 
         OR (year = YEAR(?) AND month <= MONTH(?))
         OR (year > YEAR(?) AND year < YEAR(?))`;

    let salaryParams = [from_date, from_date, to_date, to_date, from_date, to_date];

    // Execute all queries
    conn.query(sql, params, (error, invoiceResults) => {
      if (error) {
        conn.release();
        console.error("Error executing main SQL query: ", error);
        return res.status(500).json({ error: "Error fetching invoice data" });
      }

      conn.query(paymentSql, paymentParams, (paymentError, paymentResults) => {
        if (paymentError) {
          conn.release();
          console.error("Error executing payment SQL query: ", paymentError);
          return res.status(500).json({ error: "Error fetching payment data" });
        }

        conn.query(expenseSql, expenseParams, (expenseError, expenseResults) => {
          if (expenseError) {
            conn.release();
            console.error("Error executing expense SQL query: ", expenseError);
            return res.status(500).json({ error: "Error fetching expense data" });
          }

          conn.query(
            additionalPaymentsSql,
            additionalPaymentsParams,
            (additionalError, additionalResults) => {
              if (additionalError) {
                conn.release();
                console.error("Error executing additional payments SQL query: ", additionalError);
                return res.status(500).json({ error: "Error fetching additional payments data" });
              }

              // Execute commission query
              conn.query(commissionSql, commissionParams, (commissionError, commissionResults) => {
                if (commissionError) {
                  conn.release();
                  console.error("Error executing commission SQL query: ", commissionError);
                  return res.status(500).json({ error: "Error fetching commission data" });
                }

                // Execute salary query
                conn.query(salarySql, salaryParams, (salaryError, salaryResults) => {
                  conn.release();

                  if (salaryError) {
                    console.error("Error executing salary SQL query: ", salaryError);
                    return res.status(500).json({ error: "Error fetching salary data" });
                  }

                  const totalPaidPayments = paymentResults[0]?.total_paid_payments || 0;
                  const totalExpensePayments = expenseResults[0]?.total_expense_payments || 0;
                  const additionalPayments = parseFloat(additionalResults[0]?.additional_payments_in_period || 0);
                  const totalCommissionPayments = parseFloat(commissionResults[0]?.total_commission_payments || 0);
                  const totalSalaryPayments = parseFloat(salaryResults[0]?.total_salary_payments || 0);

                  res.json({
                    results: invoiceResults,
                    total_paid_payments: totalPaidPayments,
                    total_expense_payments: totalExpensePayments,
                    additional_payments_in_period: additionalPayments,
                    total_commission_payments: totalCommissionPayments,
                    total_salary_payments: totalSalaryPayments,
                  });
                });
              });
            }
          );
        });
      });
    });
  });
});




app.get('/stock_item_wise_detail_report_list', (req, res) => {
    const { from_date, to_date, supplier_id, item_id } = req.query;
    
    // Validate required parameter
    if (!item_id) {
        return res.status(400).json({ error: 'item_id is required' });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection: ', err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        try {
            // Base SQL query
            let sql = `SELECT stock.*, items.items as item_name
                       FROM stock
                       INNER JOIN items ON stock.item_id = items.id 
                       INNER JOIN suppliers ON stock.supplier_id = suppliers.id 
                       WHERE stock.item_id = ?`;
            
            let params = [item_id];

            // Add conditions for optional parameters
            if (supplier_id) {
                sql += ' AND stock.supplier_id = ?';
                params.push(supplier_id);
            }

            if (from_date && to_date) {
                sql += " AND stock.stock_date BETWEEN ? AND ?";
                params.push(from_date, to_date);
            } else if (from_date) {
                sql += " AND stock.stock_date >= ?";
                params.push(from_date);
            } else if (to_date) {
                sql += " AND stock.stock_date <= ?";
                params.push(to_date);
            }

            sql += ' ORDER BY stock.id ASC';

            connection.query(sql, params, (error, results) => {
                connection.release(); // Always release the connection

                if (error) {
                    console.error('Error executing SQL query: ', error);
                    return res.status(500).json({ error: 'Database query error' });
                }

                res.json({ results });
            });
        } catch (err) {
            connection.release();
            console.error('Unexpected error: ', err);
            res.status(500).json({ error: 'Unexpected server error' });
        }
    });
});



app.put('/set-stock-status/:id', (req, res) => {
    const id = parseInt(req.params.id); // Corrected to req.params.id
    const status = req.body.status; // Corrected to req.params.id
  
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error updating' });
            return;
        }

        // Build the UPDATE query with all the columns to be updated
        const sql = 'UPDATE stock SET stock_status = ? WHERE id = ?';
        const values = [status, id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error updating:', error);
                res.status(500).json({ error: 'Error updating' });
            } else {
                console.log('Updated successfully');
                res.status(200).json({ message: 'Updated successfully' });
            }
        });
    });
});



//this code is for remove expire stock from current stock dont delte it
// app.put('/set-stock-status/:id', (req, res) => {
//     const id = parseInt(req.params.id, 10);
//     const status = req.body.status;

//     if (isNaN(id)) {
//         return res.status(400).json({ error: 'Invalid stock ID' });
//     }

//     // Validate status
//     if (!['In Stock', 'Out Of Stock'].includes(status)) {
//         return res.status(400).json({ error: 'Invalid status value' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting DB connection:', err);
//             return res.status(500).json({ error: 'Database connection error' });
//         }

//         // 1. First, fetch current stock data
//         const getSql = 'SELECT quantity, removed_expired_quantity, (quantity - allocated_quantity) as expired_quantity_from_stock FROM stock WHERE id = ?';
        
//         connection.query(getSql, [id], (getError, getResults) => {
//             if (getError) {
//                 connection.release();
//                 console.error('Error fetching stock data:', getError);
//                 return res.status(500).json({ error: 'Error fetching stock data' });
//             }

//             if (getResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ error: 'Stock item not found' });
//             }

//             const currentQuantity = getResults[0].quantity || 0;
//             const currentRemovedExpired = getResults[0].removed_expired_quantity || 0;
//             const expiredQuantityFromStock = getResults[0].expired_quantity_from_stock || 0;

//             let newQuantity, newRemovedExpired;

//             // 2. Toggle logic
//             if (status === "In Stock") {
//                 newQuantity = currentQuantity + currentRemovedExpired;
//                 newRemovedExpired = 0;
//             } 
//             else if (status === "Out Of Stock") {
//                 // Ensure we don't go negative
//                 const quantityToRemove = Math.min(expiredQuantityFromStock, currentQuantity);
//                 newQuantity = currentQuantity - quantityToRemove;
//                 newRemovedExpired = currentRemovedExpired + quantityToRemove;
//             }

//             // 3. Update stock with new values
//             const updateSql = `
//                 UPDATE stock 
//                 SET 
//                     stock_status = ?, 
//                     quantity = ?, 
//                     removed_expired_quantity = ? 
//                 WHERE id = ?
//             `;
//             const updateValues = [status, newQuantity, newRemovedExpired, id];

//             connection.query(updateSql, updateValues, (updateError, updateResults) => {
//                 connection.release();

//                 if (updateError) {
//                     console.error('Error updating stock:', updateError);
//                     return res.status(500).json({ error: 'Error updating stock' });
//                 }

//                 console.log('Stock status updated successfully');
//                 return res.status(200).json({ 
//                     message: 'Stock status updated successfully',
//                     newQuantity,
//                     newRemovedExpired: newRemovedExpired
//                 });
//             });
//         });
//     });
// });









// app.get('/stock_report_list', (req, res) => {

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }

//         // SQL query to select paginated results
//         let sql = `WITH stock_agg AS (
//                     SELECT item_id, 
//                         SUM(quantity) AS stock_quantity,
//                         SUM(total_purchase_rate) AS total_purchase_cost
//                     FROM pharmacy.stock
//                     GROUP BY item_id
//                 ),
//                 invoice_agg AS (
//                     SELECT item,
//                         SUM(quantity) AS sale_quantity,
//                         SUM(total) AS total_sale_amount
//                     FROM pharmacy.invoice
//                     GROUP BY item
//                 )
//                 SELECT 
//                     i.id,
//                     i.items,
//                     COALESCE(s.stock_quantity, 0) AS stock_quantity,
//                     COALESCE(s.total_purchase_cost, 0) AS total_purchase_cost,
//                     COALESCE(inv.sale_quantity, 0) AS sale_quantity,
//                     COALESCE(inv.total_sale_amount, 0) AS total_sale_amount
//                 FROM pharmacy.items i
//                 LEFT JOIN stock_agg s ON s.item_id = i.id
//                 LEFT JOIN invoice_agg inv ON inv.item = i.id
//                 ORDER BY i.items`;

//         // Execute the query with the date parameters
//         connection.query(sql, (error, results) => {
//             connection.release(); // Always release the connection after query

//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             res.json({
//                 results
//             });
//         });
//     });
// });



// ....dont delete it is accurate code...............
// app.get('/stock_report_list', (req, res) => {

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }

//         // SQL query to select paginated results
//         let sql = `WITH inv AS (
//         SELECT 
//             stock_id, 
//             SUM(quantity) AS sold_quantity
//         FROM pharmacy.invoice
//         GROUP BY stock_id
//         ),
//         stock_details AS (
//             SELECT 
//                 s.item_id,
//                 SUM(s.quantity) AS total_stock,
//                 SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
//                 SUM(s.total_purchase_rate) AS total_purchase_cost,
//                 SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_price) AS remaining_value,
//                 -- Calculate purchasing cost of SOLD items directly
//                 SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_price) AS purchased_cost_of_sold
//             FROM pharmacy.stock s
//             LEFT JOIN inv ON s.id = inv.stock_id
//             GROUP BY s.item_id
//         ),
//         invoice_agg AS (
//             SELECT 
//                 item,
//                 SUM(quantity) AS sale_quantity,
//                 SUM(total) AS total_sale_amount
//             FROM pharmacy.invoice
//             GROUP BY item
//         )
//         SELECT 
//             i.id,
//             i.items AS item_name,
//             COALESCE(sd.total_stock, 0) AS total_stock,
//             COALESCE(sd.remaining_stock, 0) AS remaining_stock,
//             COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
//             COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
//             COALESCE(ia.sale_quantity, 0) AS sold_quantity,
//             COALESCE(ia.total_sale_amount, 0) AS total_sales,
//             COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold -- Direct cost of sold items
//         FROM pharmacy.items i
//         LEFT JOIN stock_details sd ON sd.item_id = i.id
//         LEFT JOIN invoice_agg ia ON ia.item = i.id
//         ORDER BY i.items`;

//         // Execute the query with the date parameters
//         connection.query(sql, (error, results) => {
//             connection.release(); // Always release the connection after query

//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             res.json({
//                 results
//             });
//         });
//     });
// });



// app.get('/stock_report_list/:from_date/:to_date', (req, res) => {

//     const from_date = req.params.from_date; // Get from_date and to_date from query parameters
//     const to_date = req.params.to_date   ; // Get from_date and to_date from query parameters

//     // console.log(from_date, to_date);

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Error fetching data from the database' });
//         }

//         // // Start building the SQL query
//         // let sql = `WITH inv AS (
//         //     SELECT 
//         //         stock_id, 
//         //         SUM(quantity) AS sold_quantity
//         //     FROM invoice_pharmacy
//         //     GROUP BY stock_id
//         // ),
//         // stock_details AS (
//         //     SELECT 
//         //         s.item_id,
//         //         SUM(s.quantity) AS total_stock,
//         //         SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
//         //         SUM(s.total_purchase_rate) AS total_purchase_cost,
//         //         SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//         //         SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold
//         //     FROM stock s
//         //     LEFT JOIN inv ON s.id = inv.stock_id`;

//         // // Add conditional WHERE clause for date filtering
//         // if (from_date && to_date) {
//         //     sql += ` WHERE s.stock_date BETWEEN ? AND ?`;
//         // }

//         // sql += `
//         //     GROUP BY s.item_id
//         // ),
//         // invoice_agg AS (
//         //     SELECT 
//         //         item,
//         //         SUM(quantity) AS sale_quantity,
//         //         SUM(total) AS total_sale_amount
//         //     FROM invoice_pharmacy
//         //     GROUP BY item
//         // )
//         // SELECT 
//         //     i.id,
//         //     i.items AS item_name,
//         //     COALESCE(i.alert, 0) AS alert_stock,
//         //     COALESCE(sd.total_stock, 0) AS total_stock,
//         //     COALESCE(sd.remaining_stock, 0) AS remaining_stock,
//         //     COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
//         //     COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
//         //     COALESCE(ia.sale_quantity, 0) AS sold_quantity,
//         //     COALESCE(ia.total_sale_amount, 0) AS total_sales,
//         //     COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold
//         // FROM items i
//         // LEFT JOIN stock_details sd ON sd.item_id = i.id
//         // LEFT JOIN invoice_agg ia ON ia.item = i.id
//         // ORDER BY i.items`;



//         // Execute the query with the date parameters if available
//         const queryParams = (from_date && to_date) ? [from_date, to_date] : [];

//         connection.query(sql, queryParams, (error, results) => {
//             connection.release(); // Always release the connection after query

//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             res.json({
//                 results
//             });
//         });
//     });
// });


// app.get('/stock_report_list/:from_date/:to_date', (req, res) => {
//     const from_date = req.params.from_date;
//     const to_date = req.params.to_date;

//     // First, get all stocks within date range
//     let sql = `WITH date_filtered_stocks AS (
//         SELECT 
//             id, 
//             item_id, 
//             quantity, 
//             purchase_rate_calculate_per_tablet,
//             total_purchase_rate
//         FROM stock
//         ${
//           from_date !== "null" && to_date !== "null"
//             ? "WHERE stock_date BETWEEN ? AND ?"
//             : ""
//         }
//     ),
//     -- Calculate sales for each stock item
//     stock_sales AS (
//         SELECT 
//             s.id AS stock_id,
//             s.item_id,
//             COALESCE(SUM(ip.quantity), 0) AS sold_quantity,
//             COALESCE(SUM(ip.total), 0) AS sales_amount
//         FROM date_filtered_stocks s
//         LEFT JOIN invoice_pharmacy ip ON s.id = ip.stock_id
//         WHERE ip.invoice_type = 'sale'
//         GROUP BY s.id, s.item_id
//     ),
//     -- Aggregate by item
//     item_summary AS (
//         SELECT
//             s.item_id,
//             SUM(s.quantity) AS total_stock,
//             SUM(s.quantity - COALESCE(ss.sold_quantity, 0)) AS remaining_stock,
//             SUM(s.total_purchase_rate) AS total_purchase_cost,
//             SUM((s.quantity - COALESCE(ss.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//             SUM(COALESCE(ss.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold,
//             SUM(COALESCE(ss.sales_amount, 0)) AS total_sales
//         FROM date_filtered_stocks s
//         LEFT JOIN stock_sales ss ON s.id = ss.stock_id
//         GROUP BY s.item_id
//     )
//     SELECT
//         i.id,
//         i.items AS item_name,
//         COALESCE(i.alert, 0) AS alert_stock,
//         COALESCE(isum.total_stock, 0) AS total_stock,
//         COALESCE(isum.remaining_stock, 0) AS remaining_stock,
//         COALESCE(isum.total_purchase_cost, 0) AS total_purchase_cost,
//         COALESCE(isum.remaining_value, 0) AS remaining_stock_value,
//         (SELECT SUM(sold_quantity) FROM stock_sales ss WHERE ss.item_id = i.id) AS sold_quantity,
//         COALESCE(isum.total_sales, 0) AS total_sales,
//         COALESCE(isum.purchased_cost_of_sold, 0) AS purchased_cost_of_sold
//     FROM items i
//     LEFT JOIN item_summary isum ON i.id = isum.item_id
//     WHERE i.stock_type = 'Stock Item'
//     ORDER BY i.items`;

//     const queryParams = (from_date !== 'null' && to_date !== 'null') ? [from_date, to_date] : [];

//     connection.query(sql, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//         res.json({ results });
//     });
// });



// app.get('/stock_report_list/:from_date/:to_date/:medicine_type?', (req, res) => {
//     const from_date = req.params.from_date;
//     const to_date = req.params.to_date;
//     const medicine_type = req.params.medicine_type;

//     // First, get all stocks within date range
//     let sql = `WITH date_filtered_stocks AS (
//         SELECT 
//             id, 
//             item_id, 
//             quantity, 
//             purchase_rate_calculate_per_tablet,
//             total_purchase_rate,
//             stock_status,
//             allocated_quantity
//         FROM stock
//         ${
//           from_date !== "null" && to_date !== "null"
//             ? "WHERE stock_date BETWEEN ? AND ?"
//             : ""
//         }
//     ),
//     -- Calculate sales for each stock item
//     stock_sales AS (
//         SELECT 
//             s.id AS stock_id,
//             s.item_id,
//             COALESCE(SUM(ip.quantity), 0) AS sold_quantity,
//             COALESCE(SUM(ip.total), 0) AS sales_amount
//         FROM date_filtered_stocks s
//         LEFT JOIN invoice_pharmacy ip ON s.id = ip.stock_id
//         WHERE ip.invoice_type = 'sale'
//         GROUP BY s.id, s.item_id
//     ),
//     -- Calculate expired stock for items marked as "Out Of Stock"
//     expired_stock AS (
//         SELECT
//             item_id,
//             SUM(CASE WHEN stock_status = 'Out Of Stock' THEN (quantity - COALESCE(allocated_quantity, 0)) ELSE 0 END) AS expired_stock_quantity,
//             SUM(CASE WHEN stock_status = 'Out Of Stock' THEN ((quantity - COALESCE(allocated_quantity, 0)) * purchase_rate_calculate_per_tablet) ELSE 0 END) AS total_expire_cost
//         FROM date_filtered_stocks
//         GROUP BY item_id
//     ),
//     -- Aggregate by item
//     item_summary AS (
//         SELECT
//             s.item_id,
//             SUM(s.quantity) AS total_stock,
//             SUM(s.quantity - COALESCE(ss.sold_quantity, 0)) AS remaining_stock,
//             SUM(s.total_purchase_rate) AS total_purchase_cost,
//             SUM((s.quantity - COALESCE(ss.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//             SUM(COALESCE(ss.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold,
//             SUM(COALESCE(ss.sales_amount, 0)) AS total_sales
//         FROM date_filtered_stocks s
//         LEFT JOIN stock_sales ss ON s.id = ss.stock_id
//         GROUP BY s.item_id
//     )
//     SELECT
//         i.id,
//         i.items AS item_name,
//         COALESCE(i.alert, 0) AS alert_stock,
//         COALESCE(isum.total_stock, 0) AS total_stock,
//         COALESCE(isum.remaining_stock, 0) AS remaining_stock,
//         COALESCE(isum.total_purchase_cost, 0) AS total_purchase_cost,
//         COALESCE(isum.remaining_value, 0) AS remaining_stock_value,
//         (SELECT SUM(sold_quantity) FROM stock_sales ss WHERE ss.item_id = i.id) AS sold_quantity,
//         COALESCE(isum.total_sales, 0) AS total_sales,
//         COALESCE(isum.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
//         COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
//         COALESCE(es.total_expire_cost, 0) AS total_expire_cost
//     FROM items i
//     LEFT JOIN item_summary isum ON i.id = isum.item_id
//     LEFT JOIN expired_stock es ON i.id = es.item_id
//     WHERE i.stock_type = 'Stock Item'
//     ORDER BY i.items`;

//     const queryParams = (from_date !== 'null' && to_date !== 'null') ? [from_date, to_date] : [];

//     connection.query(sql, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//         res.json({ results });
//     });
// });



// app.get('/stock_report_list/:from_date/:to_date/:medicine_type?/:supplier_id?', (req, res) => {
//     const from_date = req.params.from_date;
//     const to_date = req.params.to_date;
//     const medicine_type = req.params.medicine_type;
//      const supplier_id = req.params.supplier_id;

//     // Build WHERE conditions for stock table
//     let stockWhereConditions = [];
//     let stockQueryParams = [];

//     if (from_date !== "null" && to_date !== "null") {
//         stockWhereConditions.push("stock_date BETWEEN ? AND ?");
//         stockQueryParams.push(from_date, to_date);
//     }

//     if (supplier_id && supplier_id !== "all") {
//     stockWhereConditions.push("supplier_id = ?");
//     stockQueryParams.push(supplier_id);
//   }

//     // Build WHERE conditions for items table
//     let itemsWhereConditions = ["i.stock_type = 'Stock Item'"];
//     let itemsQueryParams = [];

//     if (medicine_type && medicine_type !== "all") {
//         itemsWhereConditions.push("i.medicine_type = ?");
//         itemsQueryParams.push(medicine_type);
//     }

//     // First, get all stocks within date range
//     let sql = `WITH date_filtered_stocks AS (
//         SELECT 
//             id,
//             item_id,
//             quantity,
//             purchase_rate_calculate_per_tablet,
//             total_purchase_rate,
//             stock_status,
//             allocated_quantity
//         FROM stock
//         ${stockWhereConditions.length > 0 ? "WHERE " + stockWhereConditions.join(" AND ") : ""}
//     ),
//     -- Calculate sales for each stock item
//     stock_sales AS (
//         SELECT 
//             s.id AS stock_id,
//             s.item_id,
//             COALESCE(SUM(ip.quantity), 0) AS sold_quantity,
//             COALESCE(SUM(ip.total), 0) AS sales_amount
//         FROM date_filtered_stocks s
//         LEFT JOIN invoice_pharmacy ip ON s.id = ip.stock_id
//         WHERE ip.invoice_type = 'sale'
//         GROUP BY s.id, s.item_id
//     ),
//     -- Calculate expired stock for items marked as "Out Of Stock"
//     expired_stock AS (
//         SELECT
//             item_id,
//             SUM(CASE WHEN stock_status = 'Out Of Stock' THEN (quantity - COALESCE(allocated_quantity, 0)) ELSE 0 END) AS expired_stock_quantity,
//             SUM(CASE WHEN stock_status = 'Out Of Stock' THEN ((quantity - COALESCE(allocated_quantity, 0)) * purchase_rate_calculate_per_tablet) ELSE 0 END) AS total_expire_cost
//         FROM date_filtered_stocks
//         GROUP BY item_id
//     ),
//     -- Aggregate by item
//     item_summary AS (
//         SELECT
//             s.item_id,
//             SUM(s.quantity) AS total_stock,
//             SUM(s.quantity - COALESCE(ss.sold_quantity, 0)) AS remaining_stock,
//             SUM(s.total_purchase_rate) AS total_purchase_cost,
//             SUM((s.quantity - COALESCE(ss.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//             SUM(COALESCE(ss.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold,
//             SUM(COALESCE(ss.sales_amount, 0)) AS total_sales
//         FROM date_filtered_stocks s
//         LEFT JOIN stock_sales ss ON s.id = ss.stock_id
//         GROUP BY s.item_id
//     )
//     SELECT
//         i.id,
//         i.items AS item_name,
//         COALESCE(i.alert, 0) AS alert_stock,
//         COALESCE(isum.total_stock, 0) AS total_stock,
//         COALESCE(isum.remaining_stock, 0) AS remaining_stock,
//         COALESCE(isum.total_purchase_cost, 0) AS total_purchase_cost,
//         COALESCE(isum.remaining_value, 0) AS remaining_stock_value,
//         (SELECT SUM(sold_quantity) FROM stock_sales ss WHERE ss.item_id = i.id) AS sold_quantity,
//         COALESCE(isum.total_sales, 0) AS total_sales,
//         COALESCE(isum.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
//         COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
//         COALESCE(es.total_expire_cost, 0) AS total_expire_cost
//     FROM items i
//     LEFT JOIN item_summary isum ON i.id = isum.item_id
//     LEFT JOIN expired_stock es ON i.id = es.item_id
//     WHERE ${itemsWhereConditions.join(" AND ")}
//     ORDER BY i.items`;

//     // Combine all query parameters
//     const queryParams = [...stockQueryParams, ...itemsQueryParams];

//     connection.query(sql, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//         res.json({ results });
//     });
// });



app.get(
  "/stock_report_list/:from_date/:to_date/:medicine_type?/:supplier_id?",
  (req, res) => {
    const from_date = req.params.from_date;
    const to_date = req.params.to_date;
    const medicine_type = req.params.medicine_type;
    const supplier_id = req.params.supplier_id;

    // Build WHERE conditions for stock table
    let stockWhereConditions = [];
    let stockQueryParams = [];

    if (from_date !== "null" && to_date !== "null") {
      stockWhereConditions.push("stock_date BETWEEN ? AND ?");
      stockQueryParams.push(from_date, to_date);
    }

    if (supplier_id && supplier_id !== "all") {
      stockWhereConditions.push("supplier_id = ?");
      stockQueryParams.push(supplier_id);
    }

    // Build WHERE conditions for items table
    let itemsWhereConditions = ["i.stock_type = 'Stock Item'"];
    let itemsQueryParams = [];

    if (medicine_type && medicine_type !== "all") {
      itemsWhereConditions.push("i.medicine_type = ?");
      itemsQueryParams.push(medicine_type);
    }

    // First, get all stocks within date range
    let sql = `WITH date_filtered_stocks AS (
        SELECT 
            id,
            item_id,
            quantity,
            purchase_rate_calculate_per_tablet,
            total_purchase_rate,
            stock_status,
            allocated_quantity
        FROM stock
        ${
          stockWhereConditions.length > 0
            ? "WHERE " + stockWhereConditions.join(" AND ")
            : ""
        }
    ),
    
    -- Calculate sales for each stock item
    stock_sales AS (
        SELECT 
            s.id AS stock_id,
            s.item_id,
            COALESCE(SUM(ip.quantity), 0) AS sold_quantity,
          COALESCE(SUM((ip.price * ip.quantity) - ip.discount), 0) AS sales_amount
        FROM date_filtered_stocks s
        LEFT JOIN invoice_pharmacy ip ON s.id = ip.stock_id
        WHERE ip.invoice_type = 'sale'
        GROUP BY s.id, s.item_id
    ),
    -- Calculate expired stock for items marked as "Out Of Stock"
    expired_stock AS (
        SELECT
            item_id,
            SUM(CASE WHEN stock_status = 'Out Of Stock' THEN (quantity - COALESCE(allocated_quantity, 0)) ELSE 0 END) AS expired_stock_quantity,
            SUM(CASE WHEN stock_status = 'Out Of Stock' THEN ((quantity - COALESCE(allocated_quantity, 0)) * purchase_rate_calculate_per_tablet) ELSE 0 END) AS total_expire_cost
        FROM date_filtered_stocks
        GROUP BY item_id
    ),
    -- Aggregate by item
    item_summary AS (
        SELECT
            s.item_id,
            SUM(s.quantity) AS total_stock,
            SUM(s.quantity - COALESCE(ss.sold_quantity, 0)) AS remaining_stock,
            SUM(s.total_purchase_rate) AS total_purchase_cost,
            SUM((s.quantity - COALESCE(ss.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
            SUM(COALESCE(ss.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold,
            SUM(COALESCE(ss.sales_amount, 0)) AS total_sales
        FROM date_filtered_stocks s
        LEFT JOIN stock_sales ss ON s.id = ss.stock_id
        GROUP BY s.item_id
    )
    SELECT
        i.id,
        i.items AS item_name,
        COALESCE(i.alert, 0) AS alert_stock,
        COALESCE(isum.total_stock, 0) AS total_stock,
        COALESCE(isum.remaining_stock, 0) AS remaining_stock,
        COALESCE(isum.total_purchase_cost, 0) AS total_purchase_cost,
        COALESCE(isum.remaining_value, 0) AS remaining_stock_value,
        (SELECT SUM(sold_quantity) FROM stock_sales ss WHERE ss.item_id = i.id) AS sold_quantity,
        COALESCE(isum.total_sales, 0) AS total_sales,
        COALESCE(isum.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
        COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
        COALESCE(es.total_expire_cost, 0) AS total_expire_cost
    FROM items i
    LEFT JOIN item_summary isum ON i.id = isum.item_id
    LEFT JOIN expired_stock es ON i.id = es.item_id
    WHERE ${itemsWhereConditions.join(" AND ")}
    ORDER BY i.items`;

    // Combine all query parameters
    const queryParams = [...stockQueryParams, ...itemsQueryParams];

    connection.query(sql, queryParams, (error, results) => {
      if (error) {
        console.error("Error executing SQL query: ", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ results });
    });
  }
);



app.get('/stock_deficit_report_list/:from_date/:to_date', (req, res) => {
    const from_date = req.params.from_date;
    const to_date = req.params.to_date;

    // First, get all stocks within date range
    let sql = `WITH date_filtered_stocks AS (
        SELECT 
            id, 
            item_id, 
            quantity, 
            purchase_rate_calculate_per_tablet,
            total_purchase_rate,
            stock_status,
            allocated_quantity
        FROM stock
        ${
          from_date !== "null" && to_date !== "null"
            ? "WHERE stock_date BETWEEN ? AND ?"
            : ""
        }
    ),
    -- Calculate sales for each stock item
    stock_sales AS (
        SELECT 
            s.id AS stock_id,
            s.item_id,
            COALESCE(SUM(ip.quantity), 0) AS sold_quantity,
            COALESCE(SUM(ip.total), 0) AS sales_amount
        FROM date_filtered_stocks s
        LEFT JOIN invoice_pharmacy ip ON s.id = ip.stock_id
        WHERE ip.invoice_type = 'sale'
        GROUP BY s.id, s.item_id
    ),
    -- Calculate expired stock for items marked as "Out Of Stock"
    expired_stock AS (
        SELECT
            item_id,
            SUM(CASE WHEN stock_status = 'Out Of Stock' THEN (quantity - COALESCE(allocated_quantity, 0)) ELSE 0 END) AS expired_stock_quantity,
            SUM(CASE WHEN stock_status = 'Out Of Stock' THEN ((quantity - COALESCE(allocated_quantity, 0)) * purchase_rate_calculate_per_tablet) ELSE 0 END) AS total_expire_cost
        FROM date_filtered_stocks
        GROUP BY item_id
    ),
    -- Aggregate by item
    item_summary AS (
        SELECT
            s.item_id,
            SUM(s.quantity) AS total_stock,
            SUM(s.quantity - COALESCE(ss.sold_quantity, 0)) AS remaining_stock,
            SUM(s.total_purchase_rate) AS total_purchase_cost,
            SUM((s.quantity - COALESCE(ss.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
            SUM(COALESCE(ss.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold,
            SUM(COALESCE(ss.sales_amount, 0)) AS total_sales
        FROM date_filtered_stocks s
        LEFT JOIN stock_sales ss ON s.id = ss.stock_id
        GROUP BY s.item_id
    )
    SELECT
        i.id,
        i.items AS item_name,
        COALESCE(i.alert, 0) AS alert_stock,
        COALESCE(isum.total_stock, 0) AS total_stock,
        COALESCE(isum.remaining_stock - COALESCE(es.expired_stock_quantity, 0), 0) AS remaining_stock,
        COALESCE(isum.total_purchase_cost, 0) AS total_purchase_cost,
        COALESCE(isum.remaining_value - COALESCE(es.total_expire_cost, 0), 0) AS remaining_stock_value,
        (SELECT SUM(sold_quantity) FROM stock_sales ss WHERE ss.item_id = i.id) AS sold_quantity,
        COALESCE(isum.total_sales, 0) AS total_sales,
        COALESCE(isum.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
        COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
        COALESCE(es.total_expire_cost, 0) AS total_expire_cost
    FROM items i
    LEFT JOIN item_summary isum ON i.id = isum.item_id
    LEFT JOIN expired_stock es ON i.id = es.item_id
    WHERE COALESCE(isum.remaining_stock - COALESCE(es.expired_stock_quantity, 0), 0) <= COALESCE(i.alert, 0) AND i.stock_type = 'Stock Item' 
    ORDER BY i.items`;

    const queryParams = (from_date !== 'null' && to_date !== 'null') ? [from_date, to_date] : [];

    connection.query(sql, queryParams, (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ results });
    });
});


// app.get('/stock_deficit_report_list/:from_date/:to_date', (req, res) => {
//     const from_date = req.params.from_date;
//     const to_date = req.params.to_date;

//     // First, get all stocks within date range
//     let sql = `WITH date_filtered_stocks AS (
//         SELECT 
//             id, 
//             item_id, 
//             quantity, 
//             purchase_rate_calculate_per_tablet,
//             total_purchase_rate
//         FROM stock
//         ${from_date !== 'null' && to_date !== 'null' ? 'WHERE stock_date BETWEEN ? AND ?' : ''}
//     ),
//     -- Calculate sales for each stock item
//     stock_sales AS (
//         SELECT 
//             s.id AS stock_id,
//             s.item_id,
//             COALESCE(SUM(ip.quantity), 0) AS sold_quantity,
//             COALESCE(SUM(ip.total), 0) AS sales_amount
//         FROM date_filtered_stocks s
//         LEFT JOIN invoice_pharmacy ip ON s.id = ip.stock_id
//         WHERE ip.invoice_type = 'sale'
//         GROUP BY s.id, s.item_id
//     ),
//     -- Aggregate by item
//     item_summary AS (
//         SELECT
//             s.item_id,
//             SUM(s.quantity) AS total_stock,
//             SUM(s.quantity - COALESCE(ss.sold_quantity, 0)) AS remaining_stock,
//             SUM(s.total_purchase_rate) AS total_purchase_cost,
//             SUM((s.quantity - COALESCE(ss.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//             SUM(COALESCE(ss.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold,
//             SUM(COALESCE(ss.sales_amount, 0)) AS total_sales
//         FROM date_filtered_stocks s
//         LEFT JOIN stock_sales ss ON s.id = ss.stock_id
//         GROUP BY s.item_id
//     )
//     SELECT
//         i.id,
//         i.items AS item_name,
//         COALESCE(i.alert, 0) AS alert_stock,
//         COALESCE(isum.total_stock, 0) AS total_stock,
//         COALESCE(isum.remaining_stock, 0) AS remaining_stock,
//         COALESCE(isum.total_purchase_cost, 0) AS total_purchase_cost,
//         COALESCE(isum.remaining_value, 0) AS remaining_stock_value,
//         (SELECT SUM(sold_quantity) FROM stock_sales ss WHERE ss.item_id = i.id) AS sold_quantity,
//         COALESCE(isum.total_sales, 0) AS total_sales,
//         COALESCE(isum.purchased_cost_of_sold, 0) AS purchased_cost_of_sold
//     FROM items i
//     LEFT JOIN item_summary isum ON i.id = isum.item_id
//     WHERE COALESCE(isum.remaining_stock, 0) <= COALESCE(i.alert, 0) AND i.stock_type = 'Stock Item'
//     ORDER BY i.items`;

//     const queryParams = (from_date !== 'null' && to_date !== 'null') ? [from_date, to_date] : [];

//     connection.query(sql, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//         res.json({ results });
//     });
// });




app.get('/expired_stock_report', (req, res) => {
    const { from_date, to_date } = req.query; // Optional date filters

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).json({ error: 'Failed to connect to database' });
        }

        // Base SQL query (without date filtering)
        // let sql = `
        //     SELECT 
        //         stock.*, 
        //         suppliers.full_name AS supplier_name,
        //         items.items AS item_name,
        //         stock.stock_date,
        //         stock.date_of_expiry,
        //         DATEDIFF(stock.date_of_expiry, CURDATE()) AS days_until_expiry
        //     FROM 
        //         stock 
        //     JOIN 
        //         suppliers ON stock.supplier_id = suppliers.id 
        //     JOIN 
        //         items ON stock.item_id = items.id
        //     WHERE 
        //         stock.date_of_expiry >= CURDATE()  -- Ensure future expiry
        //         AND DATEDIFF(stock.date_of_expiry, CURDATE()) <= 10
        //          AND (stock.quantity - stock.allocated_quantity)> 0 
        // `;
 // stock.date_of_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 10 DAY)
        let sql=`
        SELECT 
            stock.*, 
            suppliers.full_name AS supplier_name,
            items.items AS item_name,
            stock.stock_date,
            stock.date_of_expiry,
            DATEDIFF(stock.date_of_expiry, CURDATE()) AS days_until_expiry
        FROM 
            stock 
        JOIN 
            suppliers ON stock.supplier_id = suppliers.id 
        JOIN 
            items ON stock.item_id = items.id
        WHERE 
            DATEDIFF(stock.date_of_expiry, CURDATE()) <= 10
            AND (stock.quantity - stock.allocated_quantity) > 0`;

        // Optional: Filter by custom date range (if provided)
        const params = [];
        if (from_date && to_date) {
            sql += ` AND stock.date_of_expiry BETWEEN ? AND ?`;
            params.push(from_date, to_date);
        }

        sql += ` ORDER BY stock.date_of_expiry ASC`;

        connection.query(sql, params, (error, results) => {
            connection.release(); // Always release connection

            if (error) {
                console.error('SQL Query Error:', error);
                return res.status(500).json({ error: 'Failed to fetch expired stock report' });
            }

            res.json({ results });
        });
    });
});




// app.get('/supplier-stock-report/:supplier_id', (req, res) => {
//     // Get supplier ID from query parameters
//     const supplierId = parseInt(req.params.supplier_id, 10);
        
//     // Validate supplier ID
//     if (!supplierId || isNaN(supplierId)) {
//         return res.status(400).json({ error: 'Valid supplier ID is required' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Database connection error' });
//         }

//         // SQL query with parameter placeholders (?)
//         const sql = `
//             WITH inv AS (
//                 SELECT 
//                     stock_id, 
//                     SUM(quantity) AS sold_quantity
//                 FROM pharmacy.invoice
//                 GROUP BY stock_id
//             ),
//             stock_details AS (
//                 SELECT 
//                     s.item_id,
//                     SUM(s.quantity) AS total_stock,
//                     SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
//                     SUM(s.total_purchase_rate) AS total_purchase_cost,
//                     SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_price) AS remaining_value,
//                     SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_price) AS purchased_cost_of_sold
//                 FROM pharmacy.stock s
//                 LEFT JOIN inv ON s.id = inv.stock_id
//                 WHERE s.supplier_id = ?
//                 GROUP BY s.item_id
//             ),
//             invoice_agg AS (
//                 SELECT 
//                     i.item,
//                     SUM(i.quantity) AS sale_quantity,
//                     SUM(i.total) AS total_sale_amount
//                 FROM pharmacy.invoice i
//                 JOIN pharmacy.stock s ON i.stock_id = s.id
//                 WHERE s.supplier_id = ?
//                 GROUP BY i.item
//             )
//             SELECT 
//                 i.id,
//                 i.items AS item_name,
//                 COALESCE(sd.total_stock, 0) AS total_stock,
//                 COALESCE(sd.remaining_stock, 0) AS remaining_stock,
//                 COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
//                 COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
//                 COALESCE(ia.sale_quantity, 0) AS sold_quantity,
//                 COALESCE(ia.total_sale_amount, 0) AS total_sales,
//                 COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold
//             FROM pharmacy.items i
//             LEFT JOIN stock_details sd ON sd.item_id = i.id
//             LEFT JOIN invoice_agg ia ON ia.item = i.id
//             WHERE EXISTS (
//                 SELECT 1 FROM pharmacy.stock s 
//                 WHERE s.item_id = i.id AND s.supplier_id = ?
//             )
//             ORDER BY i.items;
//         `;

//         // Execute query with parameterized supplier ID (passed three times for three conditions)
//         connection.query(sql, [supplierId, supplierId, supplierId], (error, results) => {
//             connection.release(); // Always release connection

//             if (error) {
//                 console.error('Query error:', error);
//                 return res.status(500).json({ 
//                     error: 'Error fetching stock report',
//                     details: error.sqlMessage 
//                 });
//             }

//             res.json({
//                 success: true,
//                 supplierId,
//                 count: results.length,
//                 data: results
//             });
//         });
//     });
// });



// app.get('/supplier-stock-report/:supplier_id', (req, res) => {
//     // Get supplier ID from query parameters
//     const supplierId = parseInt(req.params.supplier_id, 10);
        
//     // Validate supplier ID
//     if (!supplierId || isNaN(supplierId)) {
//         return res.status(400).json({ error: 'Valid supplier ID is required' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Database connection error' });
//         }

//         // First, get the supplier name
//         connection.query('SELECT full_name, phone_no, account_no FROM suppliers WHERE id = ?', [supplierId], (supplierErr, supplierResults) => {
//             if (supplierErr) {
//                 connection.release();
//                 console.error('Error fetching supplier:', supplierErr);
//                 return res.status(500).json({ error: 'Error fetching supplier details' });
//             }

//             if (supplierResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ error: 'Supplier not found' });
//             }

//             const supplierDetail = supplierResults;

//             // SQL query with parameter placeholders (?)
//             const sql = `
//                 WITH inv AS (
//                     SELECT 
//                         stock_id, 
//                         SUM(quantity) AS sold_quantity
//                     FROM invoice_pharmacy
//                     WHERE invoice_type = 'sale'
//                     GROUP BY stock_id
//                 ),
//                 stock_details AS (
//                     SELECT 
//                         s.item_id,
//                         SUM(s.quantity) AS total_stock,
//                         SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
//                         SUM(s.total_purchase_rate) AS total_purchase_cost,
//                         SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//                         SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold
//                     FROM stock s
//                     LEFT JOIN inv ON s.id = inv.stock_id
//                     WHERE s.supplier_id = ?
//                     GROUP BY s.item_id
//                 ),
                
//                 invoice_agg AS (
//                     SELECT 
//                         i.item,
//                         SUM(i.quantity) AS sale_quantity,
//                         SUM(i.total) AS total_sale_amount
//                     FROM invoice_pharmacy i
//                     JOIN stock s ON i.stock_id = s.id
//                     WHERE s.supplier_id = ? AND i.invoice_type = 'sale'
//                     GROUP BY i.item
//                 )
//                 SELECT 
//                     i.id,
//                     i.items AS item_name,
//                     COALESCE(sd.total_stock, 0) AS total_stock,
//                     COALESCE(sd.remaining_stock, 0) AS remaining_stock,
//                     COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
//                     COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
//                     COALESCE(ia.sale_quantity, 0) AS sold_quantity,
//                     COALESCE(ia.total_sale_amount, 0) AS total_sales,
//                     COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold
//                 FROM items i
//                 LEFT JOIN stock_details sd ON sd.item_id = i.id
//                 LEFT JOIN invoice_agg ia ON ia.item = i.id
//                 WHERE EXISTS (
//                     SELECT 1 FROM stock s 
//                     WHERE s.item_id = i.id AND s.supplier_id = ?
//                 )
//                 ORDER BY i.items;
//             `;

//             // Execute query with parameterized supplier ID (passed three times for three conditions)
//             connection.query(sql, [supplierId, supplierId, supplierId], (error, results) => {
//                 connection.release(); // Always release connection

//                 if (error) {
//                     console.error('Query error:', error);
//                     return res.status(500).json({ 
//                         error: 'Error fetching stock report',
//                         details: error.sqlMessage 
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     supplierId,
//                     supplierDetail,
//                     count: results.length,
//                     data: results
//                 });
//             });
//         });
//     });
// });


// app.get('/supplier-stock-report/:supplier_id/:payment_status?', (req, res) => {
//     const supplierId = parseInt(req.params.supplier_id, 10);
//     const payment_Status = req.params.payment_status;

//     if (!supplierId || isNaN(supplierId)) {
//         return res.status(400).json({ error: 'Valid supplier ID is required' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Database connection error' });
//         }

//         connection.query('SELECT full_name, phone_no, account_no FROM suppliers WHERE id = ?', [supplierId], (supplierErr, supplierResults) => {
//             if (supplierErr) {
//                 connection.release();
//                 console.error('Error fetching supplier:', supplierErr);
//                 return res.status(500).json({ error: 'Error fetching supplier details' });
//             }

//             if (supplierResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ error: 'Supplier not found' });
//             }

//             const supplierDetail = supplierResults[0]; // Changed to get first record

//             const sql = `
//     WITH inv AS (
//         SELECT 
//             stock_id, 
//             SUM(quantity) AS sold_quantity
//         FROM invoice_pharmacy
//         WHERE invoice_type = 'sale'
//         GROUP BY stock_id
//     ),
//     expired_stock AS (
//         SELECT
//             s.item_id,
//             SUM(CASE WHEN s.stock_status = 'Out Of Stock' THEN 
//                 (s.quantity - COALESCE(s.allocated_quantity, 0)) 
//             ELSE 0 END) AS expired_stock_quantity,
//             SUM(CASE WHEN s.stock_status = 'Out Of Stock' THEN 
//                 ((s.quantity - COALESCE(s.allocated_quantity, 0)) * s.purchase_rate_calculate_per_tablet) 
//             ELSE 0 END) AS total_expire_cost
//         FROM stock s
//         WHERE s.supplier_id = ?
//         GROUP BY s.item_id
//     ),
//     stock_details AS (
//         SELECT 
//             s.item_id,
//             SUM(s.quantity) AS total_stock,
//             SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
//             SUM(s.total_purchase_rate) AS total_purchase_cost,
//             SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//             SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold
//         FROM stock s
//         LEFT JOIN inv ON s.id = inv.stock_id
//         WHERE s.supplier_id = ?
//         GROUP BY s.item_id
//     ),
//     invoice_agg AS (
//         SELECT 
//             i.item,
//             SUM(i.quantity) AS sale_quantity,
//             SUM(i.total) AS total_sale_amount
//         FROM invoice_pharmacy i
//         JOIN stock s ON i.stock_id = s.id
//         WHERE s.supplier_id = ? AND i.invoice_type = 'sale'
//         GROUP BY i.item
//     )
//     SELECT 
//         i.id,
//         i.items AS item_name,
//         COALESCE(sd.total_stock, 0) AS total_stock,
//         COALESCE(sd.remaining_stock, 0) AS remaining_stock,
//         COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
//         COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
//         COALESCE(ia.sale_quantity, 0) AS sold_quantity,
//         COALESCE(ia.total_sale_amount, 0) AS total_sales,
//         COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
//         COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
//         COALESCE(es.total_expire_cost, 0) AS total_expire_cost
//     FROM items i
//     LEFT JOIN stock_details sd ON i.id = sd.item_id
//     LEFT JOIN invoice_agg ia ON i.id = ia.item
//     LEFT JOIN expired_stock es ON i.id = es.item_id
//     WHERE EXISTS (
//         SELECT 1 FROM stock s 
//         WHERE s.item_id = i.id AND s.supplier_id = ?
//     )
//     ORDER BY i.items;
// `;
//             connection.query(sql, [supplierId, supplierId, supplierId, supplierId], (error, results) => {
//                 connection.release();

//                 if (error) {
//                     console.error('Query error:', error);
//                     return res.status(500).json({ 
//                         error: 'Error fetching stock report',
//                         details: error.sqlMessage 
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     supplierId,
//                     supplierDetail,
//                     count: results.length,
//                     data: results
//                 });
//             });
//         });
//     });
// });


app.get('/supplier-stock-report/:supplier_id/:payment_status?', (req, res) => {
    const supplierId = parseInt(req.params.supplier_id, 10);
    const paymentStatus = req.params.payment_status; // Optional parameter

    if (!supplierId || isNaN(supplierId)) {
        return res.status(400).json({ error: 'Valid supplier ID is required' });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection: ', err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        connection.query('SELECT full_name, phone_no, account_no FROM suppliers WHERE id = ?', [supplierId], (supplierErr, supplierResults) => {
            if (supplierErr) {
                connection.release();
                console.error('Error fetching supplier:', supplierErr);
                return res.status(500).json({ error: 'Error fetching supplier details' });
            }

            if (supplierResults.length === 0) {
                connection.release();
                return res.status(404).json({ error: 'Supplier not found' });
            }

            const supplierDetail = supplierResults[0];

            // Build the SQL query with dynamic payment_status filter
            let sql = `
    WITH inv AS (
        SELECT 
            stock_id, 
            SUM(quantity) AS sold_quantity
        FROM invoice_pharmacy
        WHERE invoice_type = 'sale'
        GROUP BY stock_id
    ),
    expired_stock AS (
        SELECT
            s.item_id,
            SUM(CASE WHEN s.stock_status = 'Out Of Stock' THEN 
                (s.quantity - COALESCE(s.allocated_quantity, 0)) 
            ELSE 0 END) AS expired_stock_quantity,
            SUM(CASE WHEN s.stock_status = 'Out Of Stock' THEN 
                ((s.quantity - COALESCE(s.allocated_quantity, 0)) * s.purchase_rate_calculate_per_tablet) 
            ELSE 0 END) AS total_expire_cost
        FROM stock s
        WHERE s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''}
        GROUP BY s.item_id
    ),
    stock_details AS (
        SELECT 
            s.item_id,
            SUM(s.quantity) AS total_stock,
            SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
            SUM(s.total_purchase_rate) AS total_purchase_cost,
            SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
            SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold
        FROM stock s
        LEFT JOIN inv ON s.id = inv.stock_id
        WHERE s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''}
        GROUP BY s.item_id
    ),
    invoice_agg AS (
        SELECT 
            i.item,
            SUM(i.quantity) AS sale_quantity,
            SUM(i.total) AS total_sale_amount
        FROM invoice_pharmacy i
        JOIN stock s ON i.stock_id = s.id
        WHERE s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''} AND i.invoice_type = 'sale'
        GROUP BY i.item
    )
    SELECT 
        i.id,
        i.items AS item_name,
        COALESCE(sd.total_stock, 0) AS total_stock,
        COALESCE(sd.remaining_stock, 0) AS remaining_stock,
        COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
        COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
        COALESCE(ia.sale_quantity, 0) AS sold_quantity,
        COALESCE(ia.total_sale_amount, 0) AS total_sales,
        COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
        COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
        COALESCE(es.total_expire_cost, 0) AS total_expire_cost
    FROM items i
    LEFT JOIN stock_details sd ON i.id = sd.item_id
    LEFT JOIN invoice_agg ia ON i.id = ia.item
    LEFT JOIN expired_stock es ON i.id = es.item_id
    WHERE EXISTS (
        SELECT 1 FROM stock s 
        WHERE s.item_id = i.id AND s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''}
    )
    ORDER BY i.items;
`;

            // Prepare query parameters
            const queryParams = paymentStatus
                ? [supplierId, paymentStatus, supplierId, paymentStatus, supplierId, paymentStatus, supplierId, paymentStatus]
                : [supplierId, supplierId, supplierId, supplierId];

            connection.query(sql, queryParams, (error, results) => {
                connection.release();

                if (error) {
                    console.error('Query error:', error);
                    return res.status(500).json({ 
                        error: 'Error fetching stock report',
                        details: error.sqlMessage 
                    });
                }

                res.json({
                    success: true,
                    supplierId,
                    supplierDetail,
                    count: results.length,
                    data: results
                });
            });
        });
    });
});



// app.get('/supplier-stock-report/:supplier_id/:payment_status?', (req, res) => {
//     const supplierId = parseInt(req.params.supplier_id, 10);
//     const paymentStatus = req.params.payment_status; // Optional parameter

//     if (!supplierId || isNaN(supplierId)) {
//         return res.status(400).json({ error: 'Valid supplier ID is required' });
//     }

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection: ', err);
//             return res.status(500).json({ error: 'Database connection error' });
//         }

//         connection.query('SELECT full_name, phone_no, account_no FROM suppliers WHERE id = ?', [supplierId], (supplierErr, supplierResults) => {
//             if (supplierErr) {
//                 connection.release();
//                 console.error('Error fetching supplier:', supplierErr);
//                 return res.status(500).json({ error: 'Error fetching supplier details' });
//             }

//             if (supplierResults.length === 0) {
//                 connection.release();
//                 return res.status(404).json({ error: 'Supplier not found' });
//             }

//             const supplierDetail = supplierResults[0];

//             let sql;
//             let queryParams;

//             if (paymentStatus === 'unpaid') {
//                 // Individual stock rows for unpaid status
//                 sql = `
//                     SELECT 
//                         i.id,
//                         i.items AS item_name,
//                         s.quantity AS total_stock,
//                         GREATEST(0, s.quantity - COALESCE(sold.sold_quantity, 0)) AS remaining_stock,
//                         s.total_purchase_rate AS total_purchase_cost,
//                         GREATEST(0, s.quantity - COALESCE(sold.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet AS remaining_stock_value,
//                         COALESCE(sold.sold_quantity, 0) AS sold_quantity,
//                         COALESCE(sold.total_sale_amount, 0) AS total_sales,
//                         COALESCE(sold.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet AS purchased_cost_of_sold,
//                         CASE WHEN s.stock_status = 'Out Of Stock' THEN 
//                             (s.quantity - COALESCE(s.allocated_quantity, 0)) 
//                         ELSE 0 END AS expired_stock_quantity,
//                         CASE WHEN s.stock_status = 'Out Of Stock' THEN 
//                             ((s.quantity - COALESCE(s.allocated_quantity, 0)) * s.purchase_rate_calculate_per_tablet) 
//                         ELSE 0 END AS total_expire_cost
//                     FROM items i
//                     JOIN stock s ON i.id = s.item_id
//                     LEFT JOIN (
//                         SELECT 
//                             stock_id,
//                             SUM(quantity) AS sold_quantity,
//                             SUM(total) AS total_sale_amount
//                         FROM invoice_pharmacy 
//                         WHERE invoice_type = 'sale'
//                         GROUP BY stock_id
//                     ) sold ON s.id = sold.stock_id
//                     WHERE s.supplier_id = ? AND s.payment_status = ?
//                     ORDER BY i.items;
//                 `;
//                 queryParams = [supplierId, paymentStatus];
//             } else {
//                 // Original grouped query for other statuses
//                 sql = `
//                     WITH inv AS (
//                         SELECT 
//                             stock_id, 
//                             SUM(quantity) AS sold_quantity
//                         FROM invoice_pharmacy
//                         WHERE invoice_type = 'sale'
//                         GROUP BY stock_id
//                     ),
//                     expired_stock AS (
//                         SELECT
//                             s.item_id,
//                             SUM(CASE WHEN s.stock_status = 'Out Of Stock' THEN 
//                                 (s.quantity - COALESCE(s.allocated_quantity, 0)) 
//                             ELSE 0 END) AS expired_stock_quantity,
//                             SUM(CASE WHEN s.stock_status = 'Out Of Stock' THEN 
//                                 ((s.quantity - COALESCE(s.allocated_quantity, 0)) * s.purchase_rate_calculate_per_tablet) 
//                             ELSE 0 END) AS total_expire_cost
//                         FROM stock s
//                         WHERE s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''}
//                         GROUP BY s.item_id
//                     ),
//                     stock_details AS (
//                         SELECT 
//                             s.item_id,
//                             SUM(s.quantity) AS total_stock,
//                             SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0))) AS remaining_stock,
//                             SUM(s.total_purchase_rate) AS total_purchase_cost,
//                             SUM(GREATEST(0, s.quantity - COALESCE(inv.sold_quantity, 0)) * s.purchase_rate_calculate_per_tablet) AS remaining_value,
//                             SUM(COALESCE(inv.sold_quantity, 0) * s.purchase_rate_calculate_per_tablet) AS purchased_cost_of_sold
//                         FROM stock s
//                         LEFT JOIN inv ON s.id = inv.stock_id
//                         WHERE s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''}
//                         GROUP BY s.item_id
//                     ),
//                     invoice_agg AS (
//                         SELECT 
//                             i.item,
//                             SUM(i.quantity) AS sale_quantity,
//                             SUM(i.total) AS total_sale_amount
//                         FROM invoice_pharmacy i
//                         JOIN stock s ON i.stock_id = s.id
//                         WHERE s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''} AND i.invoice_type = 'sale'
//                         GROUP BY i.item
//                     )
//                     SELECT 
//                         i.id,
//                         i.items AS item_name,
//                         COALESCE(sd.total_stock, 0) AS total_stock,
//                         COALESCE(sd.remaining_stock, 0) AS remaining_stock,
//                         COALESCE(sd.total_purchase_cost, 0) AS total_purchase_cost,
//                         COALESCE(sd.remaining_value, 0) AS remaining_stock_value,
//                         COALESCE(ia.sale_quantity, 0) AS sold_quantity,
//                         COALESCE(ia.total_sale_amount, 0) AS total_sales,
//                         COALESCE(sd.purchased_cost_of_sold, 0) AS purchased_cost_of_sold,
//                         COALESCE(es.expired_stock_quantity, 0) AS expired_stock_quantity,
//                         COALESCE(es.total_expire_cost, 0) AS total_expire_cost
//                     FROM items i
//                     LEFT JOIN stock_details sd ON i.id = sd.item_id
//                     LEFT JOIN invoice_agg ia ON i.id = ia.item
//                     LEFT JOIN expired_stock es ON i.id = es.item_id
//                     WHERE EXISTS (
//                         SELECT 1 FROM stock s 
//                         WHERE s.item_id = i.id AND s.supplier_id = ? ${paymentStatus ? 'AND s.payment_status = ?' : ''}
//                     )
//                     ORDER BY i.items;
//                 `;
                
//                 queryParams = paymentStatus
//                     ? [supplierId, paymentStatus, supplierId, paymentStatus, supplierId, paymentStatus, supplierId, paymentStatus]
//                     : [supplierId, supplierId, supplierId, supplierId];
//             }

//             connection.query(sql, queryParams, (error, results) => {
//                 connection.release();

//                 if (error) {
//                     console.error('Query error:', error);
//                     return res.status(500).json({ 
//                         error: 'Error fetching stock report',
//                         details: error.sqlMessage 
//                     });
//                 }

//                 res.json({
//                     success: true,
//                     supplierId,
//                     supplierDetail,
//                     count: results.length,
//                     data: results
//                 });
//             });
//         });
//     });
// });


//paid payments


// Create
app.post('/api/payments', (req, res) => {
    const { paid_payments, rebate_date, supplier_id } = req.body;
    const sql = 'INSERT INTO paid_payments (paid_payments, created_at, supplier_id) VALUES (?, ?, ?)';
    connection.query(sql, [paid_payments, rebate_date, supplier_id], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, paid_payments, rebate_date, supplier_id });
    });
});



app.post('/api/daily/expense', (req, res) => {
    const { expense_date, expense_head_id, amount } = req.body;
    const sql = 'INSERT INTO daily_expenses (expense_date, expense_head_id, amount) VALUES (?, ?, ?)';
    connection.query(sql, [expense_date, expense_head_id, amount], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
    });
});


app.post('/api/payments/bank/transactions', (req, res) => {
    const { dates, bank_id, head_id, amount, transaction_status } = req.body;
    const sql = 'INSERT INTO bank_transactions (dates, bank_id, head_id, amount, transaction_status) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [dates, bank_id, head_id, amount, transaction_status], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId });
    });
});



// Read all
// app.get('/api/payments', (req, res) => {
//     const sql = 'SELECT * FROM paid_payments';
//     connection.query(sql, (err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });




// app.get('/api/payments', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
//     const supplier_id = req.query.supplier_id;
    
//     // Validate pagination parameters
//     if (page < 1 || limit < 1 || limit > 100) {
//         return res.status(400).json({ 
//             error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' 
//         });
//     }
    
//     // Get total count and grand total
//     const countSql = `
//         SELECT 
//             COUNT(*) as total, 
//             COALESCE(SUM(paid_payments), 0) as grandTotal 
//         FROM paid_payments
//     `;
    
//     connection.query(countSql, (err, countResult) => {
//         if (err) {
//             console.error('Error getting count:', err);
//             return res.status(500).json({ error: 'Database error while getting count' });
//         }
        
//         const totalCount = countResult[0].total;
//         const grandTotal = parseFloat(countResult[0].grandTotal) || 0;
//         const totalPages = Math.ceil(totalCount / limit);
        
//         // If requested page is beyond available pages, return last page
//         const actualPage = page > totalPages && totalPages > 0 ? totalPages : page;
//         const actualOffset = (actualPage - 1) * limit;
        
//         // Get paginated data
//         const dataSql = `
//             SELECT paid_payments.*, suppliers.full_name  FROM paid_payments INNER JOIN suppliers ON paid_payments.supplier_id = suppliers.id
//             ORDER BY created_at DESC 
//             LIMIT ? OFFSET ?
//         `;
        
//         connection.query(dataSql, [limit, actualOffset], (err, dataResult) => {
//             if (err) {
//                 console.error('Error getting payments:', err);
//                 return res.status(500).json({ error: 'Database error while fetching payments' });
//             }
            
//             res.json({
//                 payments: dataResult,
//                 totalCount: totalCount,
//                 grandTotal: grandTotal,
//                 currentPage: actualPage,
//                 totalPages: totalPages,
//                 itemsPerPage: limit,
//                 hasNextPage: actualPage < totalPages,
//                 hasPrevPage: actualPage > 1
//             });
//         });
//     });
// });





app.get('/api/payments', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const supplier_id = req.query.supplier_id;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({ 
            error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' 
        });
    }
    
    // Get total count and grand total
    let countSql = `
        SELECT 
            COUNT(*) as total, 
            COALESCE(SUM(paid_payments), 0) as grandTotal 
        FROM paid_payments
    `;
    let countParams = [];
    
    // Add supplier_id filter to count query if provided
    if (supplier_id) {
        countSql += ` WHERE supplier_id = ?`;
        countParams.push(supplier_id);
    }
    
    connection.query(countSql, countParams, (err, countResult) => {
        if (err) {
            console.error('Error getting count:', err);
            return res.status(500).json({ error: 'Database error while getting count' });
        }
        
        const totalCount = countResult[0].total;
        const grandTotal = parseFloat(countResult[0].grandTotal) || 0;
        const totalPages = Math.ceil(totalCount / limit);
        
        // If requested page is beyond available pages, return last page
        const actualPage = page > totalPages && totalPages > 0 ? totalPages : page;
        const actualOffset = (actualPage - 1) * limit;
        
        // Get paginated data
        let dataSql = `
            SELECT paid_payments.*, suppliers.full_name 
            FROM paid_payments 
            INNER JOIN suppliers ON paid_payments.supplier_id = suppliers.id
        `;
        let dataParams = [limit, actualOffset];
        
        // Add supplier_id filter to data query if provided
        if (supplier_id) {
            dataSql += ` WHERE paid_payments.supplier_id = ?`;
            dataParams.unshift(supplier_id);
        }
        
        dataSql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        
        connection.query(dataSql, dataParams, (err, dataResult) => {
            if (err) {
                console.error('Error getting payments:', err);
                return res.status(500).json({ error: 'Database error while fetching payments' });
            }
            
            res.json({
                payments: dataResult,
                totalCount: totalCount,
                grandTotal: grandTotal,
                currentPage: actualPage,
                totalPages: totalPages,
                itemsPerPage: limit,
                hasNextPage: actualPage < totalPages,
                hasPrevPage: actualPage > 1
            });
        });
    });
});


app.get('/api/daily/expense', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const expense_head_id = req.query.expense_head_id_for_report;
    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
            error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100'
        });
    }

    // ====== COUNT QUERY ======
    let countSql = `
        SELECT COUNT(*) as total,
               COALESCE(SUM(amount), 0) as grandTotal
        FROM daily_expenses de
    `;
    let countConditions = [];
    let countParams = [];

    if (expense_head_id) {
        countConditions.push("de.expense_head_id = ?");
        countParams.push(expense_head_id);
    }
    if (from_date && to_date) {
        countConditions.push("de.expense_date BETWEEN ? AND ?");
        countParams.push(from_date, to_date);
    } else if (from_date) {
        countConditions.push("de.expense_date >= ?");
        countParams.push(from_date);
    } else if (to_date) {
        countConditions.push("de.expense_date <= ?");
        countParams.push(to_date);
    }

    if (countConditions.length > 0) {
        countSql += " WHERE " + countConditions.join(" AND ");
    }

    connection.query(countSql, countParams, (err, countResult) => {
        if (err) {
            console.error('Error getting count:', err);
            return res.status(500).json({ error: 'Database error while getting count' });
        }

        const totalCount = countResult[0].total;
        const grandTotal = parseFloat(countResult[0].grandTotal) || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // ====== DATA QUERY ======
        let dataSql = `
            SELECT de.*, h.head_name
            FROM daily_expenses de
            INNER JOIN heads h ON de.expense_head_id = h.id
        `;
        let dataConditions = [];
        let dataParams = [];

        if (expense_head_id) {
            dataConditions.push("de.expense_head_id = ?");
            dataParams.push(expense_head_id);
        }
        if (from_date && to_date) {
            dataConditions.push("de.expense_date BETWEEN ? AND ?");
            dataParams.push(from_date, to_date);
        } else if (from_date) {
            dataConditions.push("de.expense_date >= ?");
            dataParams.push(from_date);
        } else if (to_date) {
            dataConditions.push("de.expense_date <= ?");
            dataParams.push(to_date);
        }

        if (dataConditions.length > 0) {
            dataSql += " WHERE " + dataConditions.join(" AND ");
        }

        dataSql += " ORDER BY de.created_at ASC LIMIT ? OFFSET ?";
        dataParams.push(limit, offset);

        connection.query(dataSql, dataParams, (err, dataResult) => {
            if (err) {
                console.error('Error getting expenses:', err);
                return res.status(500).json({ error: 'Database error while fetching expenses' });
            }

            res.json({
                expenses: dataResult,
                totalCount,
                grandTotal,
                currentPage: page,
                totalPages,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            });
        });
    });
});




// app.get('/api/payments/bank/transactions', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
//     const bank_id = req.query.bank_id; // Fixed: use bank_id consistently
//     const date_from = req.query.date_from;
    
//     // Validate pagination parameters
//     if (page < 1 || limit < 1 || limit > 100) {
//         return res.status(400).json({ 
//             error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' 
//         });
//     }
    
//     // Get total count and current balance
//     let countSql = `
//         SELECT 
//             COUNT(bank_transactions.id) as total,
//             COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'In' THEN bank_transactions.amount ELSE 0 END), 0) -
//             COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'Out' THEN bank_transactions.amount ELSE 0 END), 0) as current_balance
//         FROM bank_accounts 
//         INNER JOIN bank_transactions ON bank_accounts.id = bank_transactions.bank_id
//     `;
    
//     let countParams = [];
    
//     // Add bank_id filter to count query if provided
//     if (bank_id) {
//         countSql += ` WHERE bank_transactions.bank_id = ?`;
//         countParams.push(bank_id);
//     }
    
//     // Group by bank details to get proper aggregation
//     countSql += ` GROUP BY bank_accounts.id`;
    
//     connection.query(countSql, countParams, (err, countResult) => {
//         if (err) {
//             console.error('Error getting count:', err);
//             return res.status(500).json({ error: 'Database error while getting count' });
//         }
        
//         const totalCount = countResult[0]?.total || 0;
//         const currentBalance = parseFloat(countResult[0]?.current_balance) || 0; // Fixed: use current_balance
//         const totalPages = Math.ceil(totalCount / limit);
        
//         // If requested page is beyond available pages, return last page
//         const actualPage = page > totalPages && totalPages > 0 ? totalPages : page;
//         const actualOffset = (actualPage - 1) * limit;
        
//         // Get paginated bank transactions data
//         let dataSql = `
//             SELECT 
//                 bank_transactions.*,
//                 bank_accounts.bank_name,
//                 bank_accounts.account_no,
//                 heads.head_name
//             FROM bank_transactions
//             INNER JOIN bank_accounts ON bank_transactions.bank_id = bank_accounts.id
//             INNER JOIN heads ON heads.id = bank_transactions.head_id
//         `;
//         let dataParams = [];
        
//         // Add bank_id filter to data query if provided
//         if (bank_id) {
//             dataSql += ` WHERE bank_transactions.bank_id = ?`;
//             dataParams.push(bank_id);
//         }
        
//         dataSql += ` ORDER BY bank_transactions.created_at ASC LIMIT ? OFFSET ?`;
//         dataParams.push(limit, actualOffset);
        
//         connection.query(dataSql, dataParams, (err, dataResult) => {
//             if (err) {
//                 console.error('Error getting bank transactions:', err);
//                 return res.status(500).json({ error: 'Database error while fetching bank transactions' });
//             }
            
//             res.json({
//                 transactions: dataResult, // Fixed: return transactions not payments
//                 totalCount: totalCount,
//                 currentBalance: currentBalance, // Fixed: return currentBalance not grandTotal
//                 currentPage: actualPage,
//                 totalPages: totalPages,
//                 itemsPerPage: limit,
//                 hasNextPage: actualPage < totalPages,
//                 hasPrevPage: actualPage > 1,
//                 bankId: bank_id // Added: include bank_id in response
//             });
//         });
//     });
// });





// app.get('/api/payments/bank/transactions', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
//     const bank_id = req.query.bank_id;
//     const date_from = req.query.date_from;
    
//     // Validate pagination parameters
//     if (page < 1 || limit < 1 || limit > 100) {
//         return res.status(400).json({ 
//             error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' 
//         });
//     }

//     // Function to calculate closing balance before date_from
//     const getClosingBalanceBeforeDate = (callback) => {
//         if (!date_from) {
//             return callback(null, 0); // No date filter, so no previous balance
//         }

//         let closingBalanceSql = `
//             SELECT 
//                 COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'In' THEN bank_transactions.amount ELSE 0 END), 0) -
//                 COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'Out' THEN bank_transactions.amount ELSE 0 END), 0) as closing_balance
//             FROM bank_accounts 
//             INNER JOIN bank_transactions ON bank_accounts.id = bank_transactions.bank_id
//             WHERE bank_transactions.dates < ?
//         `;
        
//         let closingBalanceParams = [date_from];
        
//         // Add bank_id filter if provided
//         if (bank_id) {
//             closingBalanceSql += ` AND bank_transactions.bank_id = ?`;
//             closingBalanceParams.push(bank_id);
//         }

//         connection.query(closingBalanceSql, closingBalanceParams, (err, result) => {
//             if (err) {
//                 console.error('Error getting closing balance:', err);
//                 return callback(err, null);
//             }
            
//             const closingBalance = parseFloat(result[0]?.closing_balance) || 0;
//             callback(null, closingBalance);
//         });
//     };

//     // Get closing balance before date_from
//     getClosingBalanceBeforeDate((err, closingBalance) => {
//         if (err) {
//             return res.status(500).json({ error: 'Database error while calculating closing balance' });
//         }

//         // Get total count and current balance for the filtered period
//         let countSql = `
//             SELECT 
//                 COUNT(bank_transactions.id) as total,
//                 COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'In' THEN bank_transactions.amount ELSE 0 END), 0) -
//                 COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'Out' THEN bank_transactions.amount ELSE 0 END), 0) as period_balance
//             FROM bank_accounts 
//             INNER JOIN bank_transactions ON bank_accounts.id = bank_transactions.bank_id
//         `;

//         let countParams = [];
//         let whereConditions = [];

//         // Add bank_id filter if provided
//         if (bank_id) {
//             whereConditions.push('bank_transactions.bank_id = ?');
//             countParams.push(bank_id);
//         }

//         // Add date_from filter if provided
//         if (date_from) {
//             whereConditions.push('bank_transactions.dates >= ?');
//             countParams.push(date_from);
//         }

//         // Add WHERE clause if there are conditions
//         if (whereConditions.length > 0) {
//             countSql += ` WHERE ${whereConditions.join(' AND ')}`;
//         }

//         connection.query(countSql, countParams, (err, countResult) => {
//             if (err) {
//                 console.error('Error getting count:', err);
//                 return res.status(500).json({ error: 'Database error while getting count' });
//             }

//             const totalCount = countResult[0]?.total || 0;
//             const periodBalance = parseFloat(countResult[0]?.period_balance) || 0;
//             const currentBalance = closingBalance + periodBalance; // Opening + Period transactions
//             const totalPages = Math.ceil(totalCount / limit);

//             // If requested page is beyond available pages, return last page
//             const actualPage = page > totalPages && totalPages > 0 ? totalPages : page;
//             const actualOffset = (actualPage - 1) * limit;

//             // Get paginated bank transactions data
//             let dataSql = `
//                 SELECT 
//                     bank_transactions.*,
//                     bank_accounts.bank_name,
//                     bank_accounts.account_no,
//                     heads.head_name
//                 FROM bank_transactions
//                 INNER JOIN bank_accounts ON bank_transactions.bank_id = bank_accounts.id
//                 INNER JOIN heads ON heads.id = bank_transactions.head_id
//             `;
            
//             let dataParams = [];
//             let dataWhereConditions = [];

//             // Add bank_id filter if provided
//             if (bank_id) {
//                 dataWhereConditions.push('bank_transactions.bank_id = ?');
//                 dataParams.push(bank_id);
//             }

//             // Add date_from filter if provided
//             if (date_from) {
//                 dataWhereConditions.push('bank_transactions.dates >= ?');
//                 dataParams.push(date_from);
//             }

//             // Add WHERE clause if there are conditions
//             if (dataWhereConditions.length > 0) {
//                 dataSql += ` WHERE ${dataWhereConditions.join(' AND ')}`;
//             }

//             dataSql += ` ORDER BY bank_transactions.dates ASC, bank_transactions.created_at ASC LIMIT ? OFFSET ?`;
//             dataParams.push(limit, actualOffset);

//             connection.query(dataSql, dataParams, (err, dataResult) => {
//                 if (err) {
//                     console.error('Error getting bank transactions:', err);
//                     return res.status(500).json({ error: 'Database error while fetching bank transactions' });
//                 }

//                 // Calculate running balance for each transaction starting from closing balance
//                 let runningBalance = closingBalance;
//                 const transactionsWithRunningBalance = dataResult.map(transaction => {
//                     const amount = parseFloat(transaction.amount) || 0;
                    
//                     if (transaction.transaction_status === 'In') {
//                         runningBalance += amount;
//                     } else if (transaction.transaction_status === 'Out') {
//                         runningBalance -= amount;
//                     }
                    
//                     return {
//                         ...transaction,
//                         running_balance: runningBalance
//                     };
//                 });

//                 // Calculate period totals for the current page
//                 const pageInTotal = transactionsWithRunningBalance
//                     .filter(t => t.transaction_status === 'In')
//                     .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

//                 const pageOutTotal = transactionsWithRunningBalance
//                     .filter(t => t.transaction_status === 'Out')
//                     .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

//                 res.json({
//                     transactions: transactionsWithRunningBalance,
//                     totalCount: totalCount,
//                     currentBalance: currentBalance,
//                     closingBalanceBeforeDate: date_from ? closingBalance : null, // Only include if date_from is provided
//                     periodBalance: periodBalance, // Balance for the filtered period
//                     pageInTotal: pageInTotal, // Total "In" for current page
//                     pageOutTotal: pageOutTotal, // Total "Out" for current page
//                     currentPage: actualPage,
//                     totalPages: totalPages,
//                     itemsPerPage: limit,
//                     hasNextPage: actualPage < totalPages,
//                     hasPrevPage: actualPage > 1,
//                     bankId: bank_id,
//                     dateFrom: date_from // Include the date filter in response
//                 });
//             });
//         });
//     });
// });



app.get('/api/payments/bank/transactions', (req, res) => {
    const bank_id = req.query.bank_id;
    const date_from = req.query.date_from;
    const date_to = req.query.date_to;
    const search  = req.query.search;

    // Function to calculate closing balance before date_from
    const getClosingBalanceBeforeDate = (callback) => {
        if (!date_from) {
            return callback(null, 0); // No date filter, so no previous balance
        }

        let closingBalanceSql = `
            SELECT 
                COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'In' THEN bank_transactions.amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'Out' THEN bank_transactions.amount ELSE 0 END), 0) as closing_balance
            FROM bank_accounts 
            INNER JOIN bank_transactions ON bank_accounts.id = bank_transactions.bank_id
            WHERE bank_transactions.dates < ?
        `;
        
        let closingBalanceParams = [date_from];
        
        // Add bank_id filter if provided
        if (bank_id) {
            closingBalanceSql += ` AND bank_transactions.bank_id = ?`;
            closingBalanceParams.push(bank_id);
        }

        connection.query(closingBalanceSql, closingBalanceParams, (err, result) => {
            if (err) {
                console.error('Error getting closing balance:', err);
                return callback(err, null);
            }
            
            const closingBalance = parseFloat(result[0]?.closing_balance) || 0;
            callback(null, closingBalance);
        });
    };

    // Get closing balance before date_from
    getClosingBalanceBeforeDate((err, closingBalance) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while calculating closing balance' });
        }

        // Get total count and current balance for the filtered period
        let countSql = `
            SELECT 
                COUNT(bank_transactions.id) as total,
                COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'In' THEN bank_transactions.amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN bank_transactions.transaction_status = 'Out' THEN bank_transactions.amount ELSE 0 END), 0) as period_balance
            FROM bank_accounts 
            INNER JOIN bank_transactions ON bank_accounts.id = bank_transactions.bank_id
        `;

        let countParams = [];
        let whereConditions = [];

        // Add bank_id filter if provided
        if (bank_id) {
            whereConditions.push('bank_transactions.bank_id = ?');
            countParams.push(bank_id);
        }

        // Add date_from filter if provided
        // if (date_from) {
        //     whereConditions.push('bank_transactions.dates >= ?');
        //     countParams.push(date_from);
        // }

        // if (date_to) {
        //     whereConditions.push('bank_transactions.dates <= ?');
        //     countParams.push(date_to);
        // }


        // Add WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            countSql += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        connection.query(countSql, countParams, (err, countResult) => {
            if (err) {
                console.error('Error getting count:', err);
                return res.status(500).json({ error: 'Database error while getting count' });
            }

            const totalCount = countResult[0]?.total || 0;
            const periodBalance = parseFloat(countResult[0]?.period_balance) || 0;
            const currentBalance = periodBalance; // Opening + Period transactions

            // Get all bank transactions data
            let dataSql = `
                SELECT 
                    bank_transactions.*,
                    bank_accounts.bank_name,
                    bank_accounts.account_no,
                    heads.head_name
                FROM bank_transactions
                INNER JOIN bank_accounts ON bank_transactions.bank_id = bank_accounts.id
                INNER JOIN heads ON heads.id = bank_transactions.head_id
            `;
            
            let dataParams = [];
            let dataWhereConditions = [];

            // Add bank_id filter if provided
            if (bank_id) {
                dataWhereConditions.push('bank_transactions.bank_id = ?');
                dataParams.push(bank_id);
            }

          // Add date filters if provided
            if (date_from && date_to) {
                // Range filter: between two dates
                dataWhereConditions.push('bank_transactions.dates >= ?');
                dataParams.push(date_from);
                dataWhereConditions.push('bank_transactions.dates <= ?');
                dataParams.push(date_to);
            } else if (date_from) {
                // Single date filter: from this date onwards
                dataWhereConditions.push('bank_transactions.dates = ?');
                dataParams.push(date_from);
            } else if (date_to) {
                // Single date filter: up to this date
                dataWhereConditions.push('bank_transactions.dates = ?');
                dataParams.push(date_to);
            }
            // Add WHERE clause if there are conditions
            if (dataWhereConditions.length > 0) {
                dataSql += ` WHERE ${dataWhereConditions.join(' AND ')}`;
            }

            dataSql += ` ORDER BY bank_transactions.dates ASC, bank_transactions.created_at ASC`;

            connection.query(dataSql, dataParams, (err, dataResult) => {
                if (err) {
                    console.error('Error getting bank transactions:', err);
                    return res.status(500).json({ error: 'Database error while fetching bank transactions' });
                }

                // Calculate running balance for each transaction starting from closing balance
                let runningBalance = closingBalance;
                const transactionsWithRunningBalance = dataResult.map(transaction => {
                    const amount = parseFloat(transaction.amount) || 0;
                    
                    if (transaction.transaction_status === 'In') {
                        runningBalance += amount;
                    } else if (transaction.transaction_status === 'Out') {
                        runningBalance -= amount;
                    }
                    
                    return {
                        ...transaction,
                        running_balance: runningBalance
                    };
                });

                // Calculate totals for all transactions
                const totalInAmount = transactionsWithRunningBalance
                    .filter(t => t.transaction_status === 'In')
                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

                const totalOutAmount = transactionsWithRunningBalance
                    .filter(t => t.transaction_status === 'Out')
                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

                res.json({
                    transactions: transactionsWithRunningBalance,
                    totalCount: totalCount,
                    currentBalance: currentBalance,
                    closingBalanceBeforeDate: date_from ? closingBalance : null, // Only include if date_from is provided
                    periodBalance: periodBalance, // Balance for the filtered period
                    totalInAmount: totalInAmount, // Total "In" for all transactions
                    totalOutAmount: totalOutAmount, // Total "Out" for all transactions
                    bankId: bank_id,
                    dateFrom: date_from // Include the date filter in response
                });
            });
        });
    });
});


// // Alternative version if you want to handle multiple banks without filtering:
// app.get('/api/payments/bank/transactions/all', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
    
//     // Validate pagination parameters
//     if (page < 1 || limit < 1 || limit > 100) {
//         return res.status(400).json({ 
//             error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100' 
//         });
//     }
    
//     // Get total count
//     let countSql = `SELECT COUNT(*) as total FROM bank_transactions`;
    
//     connection.query(countSql, [], (err, countResult) => {
//         if (err) {
//             console.error('Error getting count:', err);
//             return res.status(500).json({ error: 'Database error while getting count' });
//         }
        
//         const totalCount = countResult[0].total;
//         const totalPages = Math.ceil(totalCount / limit);
//         const actualPage = page > totalPages && totalPages > 0 ? totalPages : page;
//         const actualOffset = (actualPage - 1) * limit;
        
//         // Get paginated data with bank balances
//         let dataSql = `
//             SELECT 
//                 bank_transactions.*,
//                 banks.bank_name,
//                 banks.account_number,
//                 banks.opening_balance +
//                 COALESCE((
//                     SELECT SUM(CASE WHEN bt.transaction_status = 'In' THEN bt.amount ELSE 0 END) -
//                            SUM(CASE WHEN bt.transaction_status = 'Out' THEN bt.amount ELSE 0 END)
//                     FROM bank_transactions bt 
//                     WHERE bt.bank_id = banks.id 
//                     AND bt.created_at <= bank_transactions.created_at
//                 ), 0) as balance_at_transaction
//             FROM bank_transactions
//             INNER JOIN banks ON bank_transactions.bank_id = banks.id
//             ORDER BY bank_transactions.created_at DESC 
//             LIMIT ? OFFSET ?
//         `;
        
//         connection.query(dataSql, [limit, actualOffset], (err, dataResult) => {
//             if (err) {
//                 console.error('Error getting bank transactions:', err);
//                 return res.status(500).json({ error: 'Database error while fetching bank transactions' });
//             }
            
//             res.json({
//                 transactions: dataResult,
//                 totalCount: totalCount,
//                 currentPage: actualPage,
//                 totalPages: totalPages,
//                 itemsPerPage: limit,
//                 hasNextPage: actualPage < totalPages,
//                 hasPrevPage: actualPage > 1
//             });
//         });
//     });
// });


// Read one
app.get('/api/payments/:id', (req, res) => {
    const sql = 'SELECT * FROM paid_payments WHERE id = ?';
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
});

// Update
app.put('/api/payments/:id', (req, res) => {
    const { paid_payments, rebate_date,  supplier_id} = req.body;
    const sql = 'UPDATE paid_payments SET paid_payments = ?, created_at = ?, supplier_id = ? WHERE id = ?';
    connection.query(sql, [paid_payments, rebate_date, supplier_id, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ id: req.params.id, paid_payments, supplier_id });
    });
});


app.put('/api/daily/expense/:id', (req, res) => {
    const { expense_date, expense_head_id, amount} = req.body;
    const sql = 'UPDATE daily_expenses SET expense_date = ?, expense_head_id = ?, amount = ? WHERE id = ?';
    connection.query(sql, [expense_date, expense_head_id, amount, req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ id: req.params.id});
    });
});

app.put('/api/payments/bank/transaction/:id', (req, res) => {
    const { amount, dates,  bank_id, head_id, transaction_status} = req.body;
    const sql =
      "UPDATE bank_transactions SET amount = ?, dates = ?, bank_id = ?, head_id = ?, transaction_status = ? WHERE id = ?";
    connection.query(sql, [amount, dates, bank_id, head_id, transaction_status,  req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ id: req.params.id });
    });
});


// Delete
app.delete('/api/payments/:id', (req, res) => {
    const sql = 'DELETE FROM paid_payments WHERE id = ?';
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Payment deleted' });
    });
});

app.delete('/delete-employee/:employee_id_get', (req, res) => {
    const employee_id = parseInt(req.params.employee_id_get);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting employee' });
            return;
        }

        const sql = 'DELETE FROM employees WHERE id = ?';
        const values = [employee_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting category:', error);
                res.status(500).json({ error: 'Error deleting employee' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Employee deleted successfully' });
            }
        });
    });
});




// Handle form submission
app.post('/submit', upload.single('employee_image'), (req, res) => {
    console.log('File:', req.file); // Debug line
    console.log('Body:', req.body); // Debug line

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { employee_name, dob, gender, phone_no, address, employee_status, cnic, account_no } = req.body;
    const employee_image = req.file.filename;

    const query = 'INSERT INTO employees (employee_name, dob, gender, phone_no, address, employment_status, cnic, account_no, employee_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [employee_name, dob, gender, phone_no, address, employee_status, cnic, account_no, employee_image];

    connection.query(query, values, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Employee data saved successfully!' });
    });
});





app.delete('/delete-category/:category_id', (req, res) => {
    const category = parseInt(req.params.category_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting category' });
            return;
        }

        const sql = 'DELETE FROM categories WHERE id = ?';
        const values = [category];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting category:', error);
                res.status(500).json({ error: 'Error deleting category' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Category deleted successfully' });
            }
        });
    });
});




app.get('/delete-stock-item/:id', (req, res) => {
    const category = parseInt(req.params.id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting category' });
            return;
        }

        const sql = 'DELETE FROM stock WHERE id = ?';
        const values = [category];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting category:', error);
                res.status(500).json({ error: 'Error deleting category' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Category deleted successfully' });
            }
        });
    });
});




app.get('/delete-lab-test-heads/:id', (req, res) => {
    const id = parseInt(req.params.id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting' });
            return;
        }

        const sql = 'DELETE FROM lab_test_heads WHERE id = ?';
        const values = [id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting:', error);
                res.status(500).json({ error: 'Error deleting' });
            } else {
                console.log('Deleted successfully');
                res.status(200).json({ message: 'Deleted successfully' });
            }
        });
    });
});



// app.get('/delete-invoice-item/:id', (req, res) => {
//     const category = parseInt(req.params.id);

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error:', err);
//             res.status(500).json({ error: 'Error deleting category' });
//             return;
//         }
        
//         const sql = 'DELETE FROM invoice WHERE id = ?';
//         const values = [category];

//         connection.query(sql, values, (error, results) => {
//             connection.release(); // Release the connection

//             if (error) {
//                 console.error('Error deleting:', error);
//                 res.status(500).json({ error: 'Error deleting category' });
//             } else {
//                 console.log('Item deleted successfully');
//                 res.status(200).json({ message: 'Category deleted successfully' });
//             }
//         });
//     });
// });





app.get('/delete-invoice-item-pharmacy/:id', (req, res) => {
    const category = parseInt(req.params.id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting category' });
            return;
        }

        const sql = 'DELETE FROM invoice_pharmacy WHERE id = ?';
        const values = [category];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting:', error);
                res.status(500).json({ error: 'Error deleting category' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Category deleted successfully' });
            }
        });
    });
});




app.get('/delete-invoice-item/:id/:item_id', (req, res) => {
    const itemId = parseInt(req.params.id);

    const item_id = parseInt(req.params.item_id);

    console.log(itemId, item_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }
        // First, get the item type from clinic_items
        const getTypeSql = 'SELECT type FROM clinic_items WHERE id = ?';
        
        connection.query(getTypeSql, [item_id], (typeError, typeResults) => {
            if (typeError) {
                connection.release();
                console.error('Error fetching item type:', typeError);
                res.status(500).json({ error: 'Error fetching item type' });
                return;
            }

            if (typeResults.length === 0) {
                connection.release();
                res.status(404).json({ error: 'Item not found' });
                return;
            }

            const itemType = typeResults[0].type;
            
            // Delete from invoice table
            const deleteInvoiceSql = 'DELETE FROM invoice WHERE id = ?';
            
            connection.query(deleteInvoiceSql, [itemId], (invoiceError, invoiceResults) => {
                if (invoiceError) {
                    connection.release();
                    console.error('Error deleting from invoice:', invoiceError);
                    res.status(500).json({ error: 'Error deleting invoice item' });
                    return;
                }

                // Based on item type, delete from additional tables
                if (itemType === 'lab_test') {
                    const deleteLabTestSql = 'DELETE FROM lab_test_results WHERE invoice_id = ?';
                    connection.query(deleteLabTestSql, [itemId], (labError, labResults) => {
                        connection.release();
                        
                        if (labError) {
                            console.error('Error deleting from lab_test_results:', labError);
                            res.status(500).json({ error: 'Error deleting lab test results' });
                        } else {
                            console.log('Invoice item and lab test results deleted successfully');
                            res.status(200).json({ message: 'Invoice item and lab test results deleted successfully' });
                        }
                    });
                } else if (itemType === 'opd') {
                    const deletePatientHistorySql = 'DELETE FROM patient_history WHERE invoice_id = ?';
                    connection.query(deletePatientHistorySql, [itemId], (historyError, historyResults) => {
                        connection.release();
                        
                        if (historyError) {
                            console.error('Error deleting from patient_history:', historyError);
                            res.status(500).json({ error: 'Error deleting patient history' });
                        } else {
                            console.log('Invoice item and patient history deleted successfully');
                            res.status(200).json({ message: 'Invoice item and patient history deleted successfully' });
                        }
                    });
                } else {
                    connection.release();
                    console.log('Invoice item deleted successfully');
                    res.status(200).json({ message: 'Invoice item deleted successfully' });
                }
            });
        });
    });
});



app.put('/update-category/:id', (req, res) => {
    const itemId = parseInt(req.params.id); // Corrected to req.params.id
    const { category } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error updating category' });
            return;
        }

        // Build the UPDATE query with all the columns to be updated
        const sql = 'UPDATE categories SET category = ? WHERE id = ?';
        const values = [category, itemId];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error updating category:', error);
                res.status(500).json({ error: 'Error updating category' });
            } else {
                console.log('Category updated successfully');
                res.status(200).json({ message: 'Category updated successfully' });
            }
        });
    });
});



// `${process.env.REACT_APP_API_URL}/update-employee




app.put('/update-employee/:id', upload.single('employee_image'), (req, res) => {
    const employee_id = parseInt(req.params.id); // Parse the employee ID from the request parameters
    const { employee_name, dob, gender, phone_no, address, employee_status, cnic, account_no } = req.body; // Destructure updated employee data from the request body

    // Check if a file is provided
    const employee_image = req.file ? req.file.filename : null;

    console.log('File:', req.file); // Debug line
    console.log('Body:', req.body); // Debug line

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error connecting to the database' });
            return;
        }

        // Build the UPDATE query with all the columns to be updated
        let sql = 'UPDATE employees SET employee_name = ?, dob = ?, gender = ?, phone_no = ?, address = ?, employment_status = ?, cnic = ?, account_no = ?';
        const values = [employee_name, dob, gender, phone_no, address, employee_status, cnic, account_no];

        // Append the employee_image column only if a file is provided
        if (employee_image) {
            sql += ', employee_image = ?';
            values.push(employee_image);
        }

        sql += ' WHERE id = ?';
        values.push(employee_id);

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error updating employee:', error);
                res.status(500).json({ error: 'Error updating employee' });
            } else {
                console.log('Employee updated successfully');
                res.status(200).json({ message: 'Employee updated successfully' });
            }
        });
    });
});



app.get('/employee-list-for-attendance', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error connecting to the database' });
            return;
        }

        const sql = 'SELECT * FROM employees';

        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({ results });
            }
        });
    });
});







app.get('/category-get/:category', (req, res) => {
    const category = req.params.category;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT * FROM categories WHERE id = ?`;
        const values = [category];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});








app.get('/employee-get/:employee', (req, res) => {
    const employee_id = req.params.employee;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching employees' });
            return;
        }

        const sql = `SELECT * FROM employees WHERE id = ? ORDER BY employee_name DESC`;
        const values = [employee_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});







app.get('/categories', (req, res) => {



    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search_category = req.query.search;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching categories' });
            return;
        }

        // SQL query to select paginated results
        let sql = `SELECT * FROM categories`;
        if (search_category) {
            sql += ` WHERE category LIKE '%${search_category}%' `;
        }
        // sql += ` LIMIT ${limit} OFFSET ${offset}`;


        // Execute the query
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release(); // Release the connection
                return;
            }

            // Query to get total count of items
            const countSql = 'SELECT COUNT(*) as total FROM categories';

            // Execute the count query
            connection.query(countSql, (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalCategories = countResult[0].total;

                // Calculate total pages based on total count and limit
                const totalPages = Math.ceil(totalCategories / limit);

                // Send paginated results and pagination metadata as JSON
                res.json({
                    totalCategories,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});



app.post('/insert-category', (req, res) => {

    const sql = 'INSERT INTO categories (category) VALUES (?)';
    const values = [req.body.category];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error inserting data' });
            return;
        }

        connection.query(sql, values, (err, result) => {
            connection.release(); // Release the connection

            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).json({ error: 'Error inserting data' });
            } else {
                console.log('Data inserted successfully');
                res.status(200).json({ message: 'Data inserted successfully' });
            }
        });
    });
});







app.get('/item-rate-list', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching rate list' });
            return;
        }

        const sql = 'SELECT * FROM items';

        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error fetching categories' });
            } else {
                console.log('Fetch Successfully');
                res.status(200).json({ results });
            }
        });
    });
});



app.get('/excel-report', async(req, res) => {
    try {
        let from_date = req.query.from_date;
        let to_date = req.query.to_date;

        // SQL query to select data within the specified date range

        const sql = `SELECT 
    invoice.*,
    items.items 
    FROM 
      invoice 
    INNER JOIN 
      items ON invoice.item = items.id 
    WHERE 
    invoice.created_at >= '${from_date}' AND invoice.created_at <= '${to_date}'`;


        // Execute the query
        connection.query(sql, (error, results) => {

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Generate Excel file
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Report');

            // Add column headers
            worksheet.columns = [
                { header: 'Invoice', key: 'col1', width: 10 },
                { header: 'Item', key: 'col2', width: 10 },
                { header: 'Price', key: 'col3', width: 10 },
                { header: 'Quantity', key: 'col4', width: 10 },
                { header: 'Discount', key: 'col5', width: 10 },
                { header: 'Total', key: 'col6', width: 10 },
            ];

            // Add rows from the database results
            results.forEach(result => {
                worksheet.addRow({ col1: result.invoice_no, col2: result.items.items, col3: result.price, col4: result.quantity, col5: result.discount, col6: result.total });
                // Add more columns and values as needed
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

            // Write Excel file to response
            workbook.xlsx.write(res).then(() => {
                res.end();
            });
        });
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// app.get('/generate-excel-report', async (req, res) => {

//   let from_date= "2024-01-01";
//   let to_date = "2024-04-01";



//     // SQL query to select paginated results
//     const sql = `SELECT items.*, categories.category AS category_name FROM items INNER JOIN categories ON items.category = categories.id LIMIT ${limit} OFFSET ${offset}`;

//     // Execute the query
//     connection.query(sql, (error, results) => {
//       if (error) {
//         console.error('Error executing SQL query: ', error);
//         res.status(500).json({ error: 'Internal server error' });
//         connection.release(); // Release the connection
//         return;
//       }
//     });


// try {
//   // Generate Excel file
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Sheet 1');
//   worksheet.columns = [
//     { header: 'Column 1', key: 'col1', width: 10 },
//     { header: 'Column 2', key: 'col2', width: 10 },
//   ];
//   worksheet.addRow({ col1: 'Value 1', col2: 'Value 2' });

//   // Set response headers
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

//   // Write Excel file to response
//   await workbook.xlsx.write(res);
//   res.end();
// } catch (error) {
//   console.error('Error generating Excel report:', error);
//   res.status(500).send('Error generating Excel report');
// }


// });



app.get("/api", (req, res) => {
    res.send("API running");
});



app.get('/excel-report-expense', async(req, res) => {
    try {
        let from_date = req.query.from_date;
        let to_date = req.query.to_date;

        // SQL query to select data within the specified date range

        const sql = `SELECT expenses.*, expense_head.head_name,  DATE_FORMAT(expenses.created_at, '%d-%m-%Y') AS formatted_date FROM expenses INNER JOIN expense_head ON expenses.head_id = expense_head.id WHERE 
    expenses.created_at >= '${from_date}' AND expenses.created_at <= '${to_date}'`;


        // Execute the query
        connection.query(sql, (error, results) => {

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Generate Excel file
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Report');

            // Add column headers
            worksheet.columns = [
                { header: 'Receipt#', key: 'col1', width: 10 },
                { header: 'Head', key: 'col2', width: 10 },
                { header: 'Amount', key: 'col3', width: 10 },
                { header: 'Pay_Type', key: 'col4', width: 10 },
                { header: 'Remarks', key: 'col5', width: 10 },
                { header: 'Date', key: 'col6', width: 10 },
            ];


            // Add rows from the database results
            results.forEach(result => {
                worksheet.addRow({ col1: result.receipt_no, col2: result.head_name, col3: result.amount, col4: result.payment_type, col5: result.remarks, col6: result.formatted_date });
                // Add more columns and values as needed
            });

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

            // Write Excel file to response
            workbook.xlsx.write(res).then(() => {
                res.end();
            });
        });
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





app.get('/pdf-report-expense', (req, res) => {

    var from_date = req.query.from_date;
    var to_date = req.query.to_date;
    var report_type = req.query.report_type;


    connection.getConnection((err, connection) => {


        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        const sql = `SELECT expenses.*, expense_head.head_name,  DATE_FORMAT(expenses.created_at, '%d-%m-%Y') AS formatted_date FROM expenses INNER JOIN expense_head ON expenses.head_id = expense_head.id WHERE 
    expenses.created_at >= '${from_date}' AND expenses.created_at <= '${to_date}'`;

        // Execute the query
        connection.query(sql, [from_date, to_date], (error, results, fields) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error while fetching data' });
            } else {

                var sr_no = 1;
                var total_amount = 0;

                const formattedResults = results.map(expense => {

                    total_amount = total_amount + parseInt(expense.amount);

                    return [
                        sr_no++,
                        expense.receipt_no,
                        expense.head_name,
                        expense.amount,
                        expense.payment_type,
                        expense.remarks,
                        expense.formatted_date,
                    ];

                });

                const doc = new PDFDocument();
                // Pipe its output to the HTTP response
                doc.pipe(res);
                res.setHeader('Content-Type', 'application/pdf');

                // Define the table structure
                const columns = ["Id", "Receipt#", "Head", "Amount", "Pay_Type", "Remarks", "Date"];

                const data = formattedResults;



                // Calculate the width for each column
                const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                const columnWidth = pageWidth / columns.length;
                const rowHeight = 20; // height of each row

                doc.fontSize(16).text('Expense Report', doc.page.margins.left, 50, {
                    width: pageWidth,
                    align: 'center'
                });


                // Positioning variables
                let yPosition = 80; // initial Y position for the table

                // Draw table header
                columns.forEach((header, i) => {
                    doc
                        .fontSize(12)
                        .text(header, doc.page.margins.left + i * columnWidth, yPosition + (rowHeight - doc.currentLineHeight()) / 2, {
                            width: columnWidth,
                            align: 'center'
                        });
                });

                // Draw header border
                for (let i = 0; i <= columns.length; i++) {
                    doc
                        .moveTo(doc.page.margins.left + i * columnWidth, yPosition)
                        .lineTo(doc.page.margins.left + i * columnWidth, yPosition + rowHeight)
                        .stroke();
                }
                // Horizontal lines for header
                doc.moveTo(doc.page.margins.left, yPosition)
                    .lineTo(doc.page.width - doc.page.margins.right, yPosition)
                    .stroke();
                doc.moveTo(doc.page.margins.left, yPosition + rowHeight)
                    .lineTo(doc.page.width - doc.page.margins.right, yPosition + rowHeight)
                    .stroke();

                yPosition += rowHeight; // move Y to start of data rows

                // Draw rows
                data.forEach((row, j) => {
                    row.forEach((cell, i) => {
                        doc
                            .fontSize(10)
                            .text(cell, doc.page.margins.left + i * columnWidth, yPosition + j * rowHeight + (rowHeight - doc.currentLineHeight()) / 2, {
                                width: columnWidth,
                                align: 'center'
                            });
                    });

                    // Draw vertical lines
                    for (let i = 0; i <= columns.length; i++) {
                        doc
                            .moveTo(doc.page.margins.left + i * columnWidth, yPosition + j * rowHeight)
                            .lineTo(doc.page.margins.left + i * columnWidth, yPosition + (j + 1) * rowHeight)
                            .stroke();
                    }
                    // Horizontal line for each row
                    doc.moveTo(doc.page.margins.left, yPosition + j * rowHeight)
                        .lineTo(doc.page.width - doc.page.margins.right, yPosition + j * rowHeight)
                        .stroke();
                    doc.moveTo(doc.page.margins.left, yPosition + (j + 1) * rowHeight)
                        .lineTo(doc.page.width - doc.page.margins.right, yPosition + (j + 1) * rowHeight)
                        .stroke();
                });

                yPosition += data.length * rowHeight + 30;
                // Display Grand Total at the bottom
                doc.fontSize(12).text(`Grand Total Rs: ${total_amount.toFixed(2)}`, doc.page.margins.left, yPosition, { width: pageWidth, align: 'right' });
                // Finalize PDF file
                doc.end();

            }


        })
    })

});







app.get('/pdf-report', (req, res) => {

    var from_date = req.query.from_date;
    var to_date = req.query.to_date;
    var report_type = req.query.report_type;


    connection.getConnection((err, connection) => {


        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // SQL query to select paginated results
        // const sql = `
        //   SELECT invoice.*, items.*
        //   FROM invoice
        //   INNER JOIN items ON invoice.item = items.id
        //   WHERE invoice.created_at BETWEEN ? AND ?;
        // `;


        const sql = `
                SELECT 
                  invoice.invoice_no,
                  SUM(invoice.total) AS total_price,
                  DATE_FORMAT(invoice.created_at, '%d-%m-%Y %h:%i:%s') AS formatted_created_at
                FROM invoice
                WHERE invoice.created_at BETWEEN ? AND ?
                GROUP BY invoice.invoice_no;
              `;



        // Execute the query
        connection.query(sql, [from_date, to_date], (error, results, fields) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error while fetching data' });
            } else {


                var sr_no = 1;
                var total_amount = 0;

                const formattedResults = results.map(item => {

                    total_amount = total_amount + parseInt(item.total_price);

                    // return [
                    //   sr_no++, // Assuming 'invoice_no' is a field in your query results
                    //   item.invoice_no, // Assuming 'invoice_no' is a field in your query results
                    //   item.items, // Replace 'item_name' with the actual field name from your items table
                    //   item.price, // Replace 'item_name' with the actual field name from your items table
                    //   item.quantity, // Replace 'item_name' with the actual field name from your items table
                    //   item.discount, // Replace 'item_name' with the actual field name from your items table
                    //   item.price - (item.price / 100 * item.discount),
                    //   item.total // Assuming 'total' is a field in your query results
                    // ];

                    return [
                        sr_no++, // Assuming 'invoice_no' is a field in your query results
                        item.invoice_no, // Assuming 'invoice_no' is a field in your query results
                        item.formatted_created_at, // Assuming 'total' is a field in your query results
                        item.total_price // Assuming 'total' is a field in your query results
                    ];

                });


                const doc = new PDFDocument();
                // Pipe its output to the HTTP response
                doc.pipe(res);
                res.setHeader('Content-Type', 'application/pdf');

                // Define the table structure
                const columns = ["Id", "Invoice#", "created_at", "Total"];

                const data = formattedResults;



                // Calculate the width for each column
                const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                const columnWidth = pageWidth / columns.length;
                const rowHeight = 20; // height of each row

                doc.fontSize(16).text('Sale Report', doc.page.margins.left, 50, {
                    width: pageWidth,
                    align: 'center'
                });


                // Positioning variables
                let yPosition = 80; // initial Y position for the table

                // Draw table header
                columns.forEach((header, i) => {
                    doc
                        .fontSize(12)
                        .text(header, doc.page.margins.left + i * columnWidth, yPosition + (rowHeight - doc.currentLineHeight()) / 2, {
                            width: columnWidth,
                            align: 'center'
                        });
                });

                // Draw header border
                for (let i = 0; i <= columns.length; i++) {
                    doc
                        .moveTo(doc.page.margins.left + i * columnWidth, yPosition)
                        .lineTo(doc.page.margins.left + i * columnWidth, yPosition + rowHeight)
                        .stroke();
                }
                // Horizontal lines for header
                doc.moveTo(doc.page.margins.left, yPosition)
                    .lineTo(doc.page.width - doc.page.margins.right, yPosition)
                    .stroke();
                doc.moveTo(doc.page.margins.left, yPosition + rowHeight)
                    .lineTo(doc.page.width - doc.page.margins.right, yPosition + rowHeight)
                    .stroke();

                yPosition += rowHeight; // move Y to start of data rows

                // Draw rows
                data.forEach((row, j) => {
                    row.forEach((cell, i) => {
                        doc
                            .fontSize(10)
                            .text(cell, doc.page.margins.left + i * columnWidth, yPosition + j * rowHeight + (rowHeight - doc.currentLineHeight()) / 2, {
                                width: columnWidth,
                                align: 'center'
                            });
                    });

                    // Draw vertical lines
                    for (let i = 0; i <= columns.length; i++) {
                        doc
                            .moveTo(doc.page.margins.left + i * columnWidth, yPosition + j * rowHeight)
                            .lineTo(doc.page.margins.left + i * columnWidth, yPosition + (j + 1) * rowHeight)
                            .stroke();
                    }
                    // Horizontal line for each row
                    doc.moveTo(doc.page.margins.left, yPosition + j * rowHeight)
                        .lineTo(doc.page.width - doc.page.margins.right, yPosition + j * rowHeight)
                        .stroke();
                    doc.moveTo(doc.page.margins.left, yPosition + (j + 1) * rowHeight)
                        .lineTo(doc.page.width - doc.page.margins.right, yPosition + (j + 1) * rowHeight)
                        .stroke();
                });


                yPosition += data.length * rowHeight + 30;
                // Display Grand Total at the bottom
                doc.fontSize(12).text(`Grand Total Rs: ${total_amount.toFixed(2)}`, doc.page.margins.left, yPosition, { width: pageWidth, align: 'right' });


                // Finalize PDF file
                doc.end();

            }


        })
    })

});





// app.post('/insert_all_items', (req, res) => {
//     // console.log('Request body:', req.body); // Log request body

//     const checkSql = 'SELECT COUNT(*) AS count FROM items WHERE items = ? AND manufacturer = ?';
//     const insertSql = 'INSERT INTO items (items, price, discount, unit_type, manufacturer, medicine_type, alert, stock_type, barcode_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
//     const values = [req.body.item_name, req.body.price, req.body.discount, req.body.unitType, req.body.manufacturer, req.body.medicine_type, req.body.alert,  req.body.stock_type, req.body.barcode_no];

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error:', err);
//             res.status(500).json({ error: 'Database connection error' });
//             return;
//         }

//         // Check if the item already exists
//         connection.query(checkSql, [req.body.item_name, req.body.manufacturer], (err, results) => {
//             if (err) {
//                 connection.release();
//                 console.error("Error checking for duplicate item:", err);
//                 res.status(500).json({ error: "Error checking for duplicate item" });
//                 return;
//             }

//             console.log("Results:", results); // Log the results
//             if (results[0].count > 0) {
//                 // Item already exists
//                 connection.release();
//                 res.status(400).json({ error: "Item already exists" });
//                 return;
//             }

//             // Insert the new item
//             connection.query(insertSql, values, (err, result) => {
//                 connection.release(); // Release the connection

//                 if (err) {
//                     console.error("Error inserting data:", err);
//                     res.status(500).json({ error: "Error inserting data" });
//                 } else {
//                     console.log("Data inserted successfully");
//                     res.status(200).json({ message: "Data inserted successfully" });
//                 }
//             });
//         });
//     });
// });


// app.post('/insert_all_items', (req, res) => {
//     // console.log('Request body:', req.body); // Log request body
    
//     const checkItemSql = 'SELECT COUNT(*) AS count FROM items WHERE items = ? AND manufacturer = ?';
//     const checkBarcodeSql = 'SELECT COUNT(*) AS count FROM items WHERE barcode_no = ? AND barcode_no IS NOT NULL';
//     const insertSql = 'INSERT INTO items (items, price, discount, unit_type, manufacturer, medicine_type, alert, stock_type, barcode_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
//     const values = [req.body.item_name, req.body.price, req.body.discount, req.body.unitType, req.body.manufacturer, req.body.medicine_type, req.body.alert, req.body.stock_type, req.body.barcode_no];

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error:', err);
//             res.status(500).json({ error: 'Database connection error' });
//             return;
//         }

//         // Check if the item already exists
//         connection.query(checkItemSql, [req.body.item_name, req.body.manufacturer], (err, results) => {
//             if (err) {
//                 connection.release();
//                 console.error("Error checking for duplicate item:", err);
//                 res.status(500).json({ error: "Error checking for duplicate item" });
//                 return;
//             }

//             console.log("Item check results:", results); // Log the results
//             if (results[0].count > 0) {
//                 // Item already exists
//                 connection.release();
//                 res.status(400).json({ error: "Item already exists" });
//                 return;
//             }

//             // Check if barcode already exists (only if barcode is provided and not null/empty)
//             if (req.body.barcode_no && req.body.barcode_no.trim() !== '') {
//                 connection.query(checkBarcodeSql, [req.body.barcode_no], (err, barcodeResults) => {
//                     if (err) {
//                         connection.release();
//                         console.error("Error checking for duplicate barcode:", err);
//                         res.status(500).json({ error: "Error checking for duplicate barcode" });
//                         return;
//                     }

//                     console.log("Barcode check results:", barcodeResults); // Log the results
//                     if (barcodeResults[0].count > 0) {
//                         // Barcode already exists
//                         connection.release();
//                         res.status(400).json({ error: "Barcode already exists" });
//                         return;
//                     }

//                     // Both checks passed, insert the new item
//                     insertItem();
//                 });
//             } else {
//                 // No barcode provided or barcode is empty, skip barcode check
//                 insertItem();
//             }

//             // Function to insert the item
//             function insertItem() {
//                 connection.query(insertSql, values, (err, result) => {
//                     connection.release(); // Release the connection

//                     if (err) {
//                         console.error("Error inserting data:", err);
//                         res.status(500).json({ error: "Error inserting data" });
//                     } else {
//                         console.log("Data inserted successfully");
//                         res.status(200).json({ message: "Data inserted successfully" });
//                     }
//                 });
//             }
//         });
//     });
// });



app.post('/insert_all_items', (req, res) => {
    // console.log('Request body:', req.body); // Log request body
    
    const checkItemSql = 'SELECT COUNT(*) AS count FROM items WHERE items = ? AND manufacturer = ?';
    const checkBarcodeSql = 'SELECT COUNT(*) AS count FROM items WHERE barcode_no = ? AND barcode_no IS NOT NULL';
    const insertSql = 'INSERT INTO items (items, price, discount, unit_type, manufacturer, medicine_type, alert, stock_type, barcode_no, location, item_purchase_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [req.body.item_name, req.body.price, req.body.discount, req.body.unitType, req.body.manufacturer, req.body.medicine_type, req.body.alert, req.body.stock_type, req.body.barcode_no, req.body.location, req.body.item_purchase_price];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item already exists
        connection.query(checkItemSql, [req.body.item_name, req.body.manufacturer], (err, results) => {
            if (err) {
                connection.release();
                console.error("Error checking for duplicate item:", err);
                res.status(500).json({ error: "Error checking for duplicate item" });
                return;
            }

            console.log("Item check results:", results); // Log the results
            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: "Item already exists" });
                return;
            }

            // Check if barcode already exists (only if barcode is provided and not null/empty)
            if (req.body.barcode_no && req.body.barcode_no.trim() !== '') {
                connection.query(checkBarcodeSql, [req.body.barcode_no], (err, barcodeResults) => {
                    if (err) {
                        connection.release();
                        console.error("Error checking for duplicate barcode:", err);
                        res.status(500).json({ error: "Error checking for duplicate barcode" });
                        return;
                    }

                    console.log("Barcode check results:", barcodeResults); // Log the results
                    if (barcodeResults[0].count > 0) {
                        // Barcode already exists
                        connection.release();
                        res.status(400).json({ error: "Barcode already exists" });
                        return;
                    }

                    // Both checks passed, insert the new item
                    insertItem();
                });
            } else {
                // No barcode provided or barcode is empty, skip barcode check
                insertItem();
            }

            // Function to insert the item
            function insertItem() {
                connection.query(insertSql, values, (err, result) => {
                    connection.release(); // Release the connection

                    if (err) {
                        console.error("Error inserting data:", err);
                        res.status(500).json({ error: "Error inserting data" });
                    } else {
                        console.log("Data inserted successfully");
                        res.status(200).json({ message: "Data inserted successfully" });
                    }
                });
            }
        });
    });
});


app.post('/insert_department', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const checkSql = 'SELECT COUNT(*) AS count FROM departments WHERE department = ?';
    const insertSql = 'INSERT INTO departments (department) VALUES (?)';
    const values = [req.body.item_name];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item already exists
        connection.query(checkSql, [req.body.item_name, req.body.manufacturer], (err, results) => {
            if (err) {
                connection.release();
                console.error("Error checking for duplicate item:", err);
                res.status(500).json({ error: "Error checking for duplicate item" });
                return;
            }

            console.log("Results:", results); // Log the results
            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: "Item already exists" });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error("Error inserting data:", err);
                    res.status(500).json({ error: "Error inserting data" });
                } else {
                    console.log("Data inserted successfully");
                    res.status(200).json({ message: "Data inserted successfully" });
                }
            });
        });
    });
});






app.post('/insert_lab_test', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const checkSql = 'SELECT COUNT(*) AS count FROM lab_tests WHERE lab_test = ?';
    const insertSql = 'INSERT INTO lab_tests (lab_test) VALUES (?)';
    const values = [req.body.item_name];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item already exists
        connection.query(checkSql, [req.body.item_name], (err, results) => {
            if (err) {
                connection.release();
                console.error("Error checking for duplicate item:", err);
                res.status(500).json({ error: "Error checking for duplicate item" });
                return;
            }

            console.log("Results:", results); // Log the results
            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: "Item already exists" });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error("Error inserting data:", err);
                    res.status(500).json({ error: "Error inserting data" });
                } else {
                    console.log("Data inserted successfully");
                    res.status(200).json({ message: "Data inserted successfully" });
                }
            });
        });
    });
});



app.post('/insert_doctor', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const checkSql = 'SELECT COUNT(*) AS count FROM doctors WHERE doctor_name = ? AND department_id = ? AND specialization = ?';
    const insertSql = 'INSERT INTO doctors (doctor_name, department_id, specialization) VALUES (?, ?, ?)';
    
    // Corrected values array to include all three fields
    const values = [req.body.doctor_name, req.body.department_id, req.body.specialization];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }
    
        // Check if the item already exists
        connection.query(checkSql, [req.body.doctor_name, req.body.department_id, req.body.specialization], (err, results) => {
            if (err) {
                connection.release();
                console.error("Error checking for duplicate item:", err);
                res.status(500).json({ error: "Error checking for duplicate item" });
                return;
            }

            console.log("Results:", results); // Log the results
            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: "Item already exists" });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error("Error inserting data:", err);
                    res.status(500).json({ error: "Error inserting data" });
                } else {
                    console.log("Data inserted successfully");
                    res.status(200).json({ message: "Data inserted successfully" });
                }
            });
        });
    });
});







app.post('/insert-fee', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    let checkSql = '';
    let insertSql = '';
    let values = [];

    // Set checkSql and insertSql based on the type
    if (req.body.type === 'lab_test') {
        // If type is 'lab test', check for duplicate in lab_test_id
        checkSql = 'SELECT COUNT(*) AS count FROM clinic_items WHERE lab_test_id = ?';
        insertSql = 'INSERT INTO clinic_items (lab_test_id, type, price) VALUES (?, ?, ?)';
        values = [req.body.item_id, req.body.type, req.body.price];
    } else if (req.body.type === 'opd') {
        // If type is 'opd', check for duplicate in doctor_id
        checkSql = 'SELECT COUNT(*) AS count FROM clinic_items WHERE doctor_id = ?';
        insertSql = 'INSERT INTO clinic_items (doctor_id, type, price) VALUES (?, ?, ?)';
        values = [req.body.item_id, req.body.type, req.body.price];
    } else {
        // Handle other types if necessary
        res.status(400).json({ error: "Invalid type" });
        return;
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }
    
        // Check if the item already exists
        connection.query(checkSql, [req.body.item_id], (err, results) => {
            if (err) {
                connection.release();
                console.error("Error checking for duplicate item:", err);
                res.status(500).json({ error: "Error checking for duplicate item" });
                return;
            }

            console.log("Results:", results); // Log the results
            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: "Item already exists" });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error("Error inserting data:", err);
                    res.status(500).json({ error: "Error inserting data" });
                } else {
                    console.log("Data inserted successfully");
                    res.status(200).json({ message: "Data inserted successfully" });
                }
            });
        });
    });
});




app.put('/update-fee/:id', (req, res) => {

    
    const itemId = parseInt(req.params.id); // Parse the ID from the URL

    let checkSql = '';
    let updateSql = '';
    let values = [];
    let doctor_id = req.body.type === 'opd' ? req.body.item_id : 0;  // Set doctor_id to 0 if type is 'lab_test', else use item_id
    let lab_test_id = req.body.type === 'lab_test' || req.body.type === 'radiology' || req.body.type === 'other_procedure' ? req.body.item_id : 0;  // Set lab_test_id to 0 if type is 'opd', else use item_id

    // Set checkSql and updateSql based on the type
    if (req.body.type === 'lab_test' || req.body.type === 'radiology' || req.body.type === 'other_procedure') {
        // If type is 'lab test', check if the lab_test_id exists
        checkSql = 'SELECT COUNT(*) AS count FROM clinic_items WHERE lab_test_id = ? AND id != ?';
        updateSql = 'UPDATE clinic_items SET lab_test_id = ?, doctor_id = ?, type = ?, price = ? WHERE id = ?';
        values = [lab_test_id, doctor_id, req.body.type, req.body.price, itemId];
    } else if (req.body.type === 'opd') {
        // If type is 'opd', check if the doctor_id exists
        checkSql = 'SELECT COUNT(*) AS count FROM clinic_items WHERE doctor_id = ? AND id != ?';
        updateSql = 'UPDATE clinic_items SET doctor_id = ?, lab_test_id = ?, type = ?, price = ? WHERE id = ?';
        values = [doctor_id, lab_test_id, req.body.type, req.body.price, itemId];
    } else {
        // Handle other types if necessary
        res.status(400).json({ error: "Invalid type" });
        return;
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item exists (for the same type and different id)
        connection.query(checkSql, [req.body.item_id, req.body.id], (err, results) => {
            if (err) {
                connection.release();
                console.error("Error checking for duplicate item:", err);
                res.status(500).json({ error: "Error checking for duplicate item" });
                return;
            }

            console.log("Results:", results); // Log the results
            if (results[0].count > 0) {
                // Item with the same lab_test_id or doctor_id already exists
                connection.release();
                res.status(400).json({ error: "Item with the same lab test or doctor already exists" });
                return;
            }

            // Update the item
            connection.query(updateSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error("Error updating data:", err);
                    res.status(500).json({ error: "Error updating data" });
                } else {
                    console.log("Data updated successfully");
                    res.status(200).json({ message: "Data updated successfully" });
                }
            });
        });
    });
});







app.post('/insert-supplier', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const checkSql = 'SELECT COUNT(*) AS count FROM suppliers WHERE phone_no = ?';
    const insertSql = 'INSERT INTO suppliers (full_name, phone_no, account_no) VALUES (?, ?, ?)';
    const values = [req.body.full_name, req.body.phone_no, req.body.account_no];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item already exists
        connection.query(checkSql, [req.body.phone_no], (err, results) => {
            if (err) {
                connection.release();
                console.error('Error checking for duplicate supplier:', err);
                res.status(500).json({ error: 'Error checking for duplicate supplier' });
                return;
            }

            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: 'Supplier already exists' });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).json({ error: 'Error inserting data' });
                } else {
                    console.log('Data inserted successfully');
                    res.status(200).json({ message: 'Data inserted successfully' });
                }
            });
        });
    });
});



app.post('/insert-bank-accounts', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const checkSql = 'SELECT COUNT(*) AS count FROM bank_accounts WHERE bank_name = ?';
    const insertSql = 'INSERT INTO bank_accounts (bank_name, opening_balance , account_no) VALUES (?, ?, ?)';
    const values = [req.body.bank_name, req.body.opening_balance, req.body.account_no];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item already exists
        connection.query(checkSql, [req.body.bank_name], (err, results) => {
            if (err) {
                connection.release();
                console.error('Error checking for duplicate supplier:', err);
                res.status(500).json({ error: 'Error checking for duplicate supplier' });
                return;
            }

            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: 'Bank account already exists' });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).json({ error: 'Error inserting data' });
                } else {
                    console.log('Data inserted successfully');
                    res.status(200).json({ message: 'Data inserted successfully' });
                }
            });
        });
    });
});


app.post('/insert-heads', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const checkSql = 'SELECT COUNT(*) AS count FROM heads WHERE head_name = ?';
    const insertSql = 'INSERT INTO heads (head_name) VALUES (?)';
    const values = [req.body.head_name];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the item already exists
        connection.query(checkSql, [req.body.bank_name], (err, results) => {
            if (err) {
                connection.release();
                console.error('Error checking for duplicate supplier:', err);
                res.status(500).json({ error: 'Error checking for duplicate ' });
                return;
            }

            if (results[0].count > 0) {
                // Item already exists
                connection.release();
                res.status(400).json({ error: 'Head already exists' });
                return;
            }

            // Insert the new item
            connection.query(insertSql, values, (err, result) => {
                connection.release(); // Release the connection

                if (err) {
                    console.error('Error inserting data:', err);
                    res.status(500).json({ error: 'Error inserting data' });
                } else {
                    console.log('Data inserted successfully');
                    res.status(200).json({ message: 'Data inserted successfully' });
                }
            });
        });
    });
});

app.get('/items', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // Base SQL query
        let sql = `SELECT * FROM items`;
        let countSql = `SELECT COUNT(*) as total FROM items`;
        let params = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE items.items LIKE ?`; // Assuming 'name' is the column to search
            countSql += ` WHERE items.items LIKE ?`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY items.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, params.length > 1 ? [params[0]] : [], (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                // Send response with pagination metadata
                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});







app.get('/departments', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // Base SQL query
        let sql = `SELECT * FROM departments`;
        let countSql = `SELECT COUNT(*) as total FROM departments`;
        let params = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE department LIKE ?`; // Assuming 'name' is the column to search
            countSql += ` WHERE department LIKE ?`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY departments.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, params.length > 1 ? [params[0]] : [], (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                // Send response with pagination metadata
                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});






app.get('/lab_tests', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // Base SQL query
        let sql = `SELECT * FROM lab_tests`;
        let countSql = `SELECT COUNT(*) as total FROM lab_tests`;
        let params = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE lab_test LIKE ?`; // Assuming 'name' is the column to search
            countSql += ` WHERE lab_test LIKE ?`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY lab_tests.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, params.length > 1 ? [params[0]] : [], (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                // Send response with pagination metadata
                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});



app.get('/doctors', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // Base SQL query
        let sql = `SELECT doctors.*, departments.department FROM doctors INNER JOIN departments ON departments.id = doctors.department_id`;
        let countSql = `SELECT COUNT(*) as total FROM doctors`;
        let params = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE doctor LIKE ?`; // Assuming 'name' is the column to search
            countSql += ` WHERE doctor LIKE ?`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY doctors.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, params.length > 1 ? [params[0]] : [], (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                // Send response with pagination metadata
                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});




app.get('/fee', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // Base SQL query for fetching data
        let sql = `SELECT clinic_items.id, 
                          IFNULL(CONCAT(doctors.doctor_name, ' (', doctors.specialization, ')'), lab_tests.lab_test) AS item, 
                          clinic_items.price 
                   FROM clinic_items 
                   LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id 
                   LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id`;

        let countSql = `SELECT COUNT(*) as total 
                        FROM clinic_items 
                        LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id 
                        LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id`;
        
        let params = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE doctors.doctor_name LIKE ? OR lab_tests.lab_test LIKE ?`;
            countSql += ` WHERE doctors.doctor_name LIKE ? OR lab_tests.lab_test LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // Apply pagination in the main query
        sql += ` ORDER BY doctors.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the main query with pagination
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query to get the total number of filtered records (without pagination)
            connection.query(countSql, params.length > 0 ? [params[0], params[1]] : [], (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                // Send response with pagination metadata
                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});






app.get('/suppliers-list', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch ? req.query.getSearch.replace(/-/g, '') : '';

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching suppliers' });
            return;
        }

        // Base SQL query - will format phone numbers in response
        let sql = `SELECT suppliers.id, suppliers.full_name, REPLACE(suppliers.phone_no, '-', '') AS phone_no,
         COALESCE(SUM(stock.total_purchase_rate), 0) AS total_purchase_sum, 
                          COALESCE(SUM(stock.remaining_amount), 0) AS remaining_amount_sum 
        FROM suppliers 
        LEFT JOIN stock ON suppliers.id = stock.supplier_id`;
        let countSql = `SELECT COUNT(*) as total FROM suppliers`;
        let params = [];
        let countParams = [];

        // Apply search filter if provided
        if (search) {
            // Search both name and phone_no (without hyphens)
            sql += ` WHERE suppliers.full_name LIKE ? OR REPLACE(suppliers.phone_no, '-', '') LIKE ?`;
            countSql += ` WHERE suppliers.full_name LIKE ? OR REPLACE(suppliers.phone_no, '-', '') LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }

         if (search) {
            // Search both name and phone_no (without hyphens)
            sql += ` WHERE suppliers.full_name LIKE ? OR REPLACE(suppliers.phone_no, '-', '') LIKE ?`;
            countSql += ` WHERE suppliers.full_name LIKE ? OR REPLACE(suppliers.phone_no, '-', '') LIKE ?`;
            params.push(`%${search}%`, `%${search}%`);
            countParams.push(`%${search}%`, `%${search}%`);
        }
       sql += ` GROUP BY suppliers.id, suppliers.full_name, suppliers.phone_no ORDER BY suppliers.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, countParams, (countError, countResult) => {
                connection.release();

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results // phone numbers already formatted without hyphens
                });
            });
        });
    });
});



app.get('/bank-accounts-list', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch ? req.query.getSearch.replace(/-/g, '') : '';

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching bank accounts' });
            return;
        }

        // Base SQL queries
        let sql = `SELECT * FROM bank_accounts`;
        let countSql = `SELECT COUNT(*) as total FROM bank_accounts`;
        let params = [];
        let countParams = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE bank_name LIKE ?`;
            countSql += ` WHERE bank_name LIKE ?`;
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        // Add ORDER BY and LIMIT/OFFSET
        sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, countParams, (countError, countResult) => {
                connection.release();

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});






app.get('/heads-list', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.getSearch ? req.query.getSearch.replace(/-/g, '') : '';

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching bank accounts' });
            return;
        }

        // Base SQL queries
        let sql = `SELECT * FROM heads`;
        let countSql = `SELECT COUNT(*) as total FROM heads`;
        let params = [];
        let countParams = [];

        // Apply search filter if provided
        if (search) {
            sql += ` WHERE head_name LIKE ?`;
            countSql += ` WHERE head_name LIKE ?`;
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        // Add ORDER BY and LIMIT/OFFSET
        sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute the paginated query
        connection.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release();
                return;
            }

            // Execute count query
            connection.query(countSql, countParams, (countError, countResult) => {
                connection.release();

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }

                const totalItems = countResult[0].total;
                const totalPages = Math.ceil(totalItems / limit);

                res.json({
                    totalItems,
                    currentPage: page,
                    totalPages,
                    results
                });
            });
        });
    });
});



app.get('/get-all-items-for-suggestion', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Error fetching items' });
        }

        const sql = 'SELECT items.items as name  FROM items';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection regardless of success or error

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ results });
        });
    });
});





app.get('/get-all-lab-test-for-suggestion', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Error fetching items' });
        }

        const sql = 'SELECT lab_tests.lab_test as name FROM lab_tests';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection regardless of success or error

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ results });
        });
    });
});




app.get('/get-all-doctors-for-suggestion', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Error fetching items' });
        }

        const sql = 'SELECT doctors.doctor_name  FROM doctors';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection regardless of success or error

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ results });
        });
    });
});






app.get('/get-all-department-for-suggestion', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Error fetching items' });
        }

        const sql = 'SELECT department as name FROM departments';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection regardless of success or error

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ results });
        });
    });
});






app.get('/get-all-items', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // SQL query to select all items along with their category names
        const sql = `SELECT clinic_items.*, 
        IFNULL(CONCAT(doctors.doctor_name, ' (', doctors.specialization, ')', ' (', departments.department, ')', ' (', UPPER(clinic_items.type), ')'  ), lab_tests.lab_test) AS item,
        departments.department AS doctor_department
 FROM clinic_items
 LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id
 LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id
 LEFT JOIN departments ON doctors.department_id = departments.id ORDER BY clinic_items.id DESC`;


        // Execute the query
        connection.query(sql, (error, results) => {
            connection.release(); // Always release the connection after query execution
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});







app.get('/get-invoice-details/:invoice_no', async (req, res) => {
  try {
    const { invoice_no } = req.params;
    
    const query = `
      SELECT 
        i.invoice_no,
        i.grand_total,
        i.advance,
        i.phone_no,
        i.full_name,
        i.invoice_date,
        i.invoice_status,
        COALESCE(SUM(p.payment_amount), 0) as additional_payments,
        (i.grand_total - i.advance - COALESCE(SUM(p.payment_amount), 0)) as remaining_amount
      FROM invoice_pharmacy i
      LEFT JOIN invoice_payments p ON i.invoice_no = p.invoice_no
      WHERE i.invoice_no = ?
      GROUP BY i.invoice_no
    `;
    
    connection.query(query, [invoice_no], (error, results) => {
      if (error) {
        console.error('Error fetching invoice:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment history for an invoice
app.get('/get-payment-history/:invoice_no', async (req, res) => {
  try {
    const { invoice_no } = req.params;
    
    const query = `
      SELECT 
        id,
        payment_amount,
        payment_date,
        payment_method,
        notes,
        created_by,
        created_at
      FROM invoice_payments
      WHERE invoice_no = ?
      ORDER BY payment_date DESC, created_at DESC
    `;
    
    connection.query(query, [invoice_no], (error, results) => {
      if (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new payment
app.post('/add-payment', async (req, res) => {
  try {
    const { 
      invoice_no, 
      payment_amount, 
      payment_date, 
      payment_method, 
      notes,
      created_by 
    } = req.body;
    
    if (!invoice_no || !payment_amount || !payment_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First, check if payment would exceed remaining amount
    const checkQuery = `
      SELECT 
        i.grand_total,
        i.advance,
        COALESCE(SUM(p.payment_amount), 0) as paid,
        (i.grand_total - i.advance - COALESCE(SUM(p.payment_amount), 0)) as remaining
      FROM invoice_pharmacy i
      LEFT JOIN invoice_payments p ON i.invoice_no = p.invoice_no
      WHERE i.invoice_no = ?
      GROUP BY i.invoice_no
    `;
    
    connection.query(checkQuery, [invoice_no], (error, results) => {
      if (error) {
        console.error('Error checking invoice:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      const remaining = parseFloat(results[0].remaining);
      const paymentAmount = parseFloat(payment_amount);
      
      if (paymentAmount > remaining) {
        return res.status(400).json({ 
          error: `Payment amount (${paymentAmount}) exceeds remaining amount (${remaining})` 
        });
      }

      // Insert payment
      const insertQuery = `
        INSERT INTO invoice_payments 
        (invoice_no, payment_amount, payment_date, payment_method, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      connection.query(
        insertQuery,
        [invoice_no, payment_amount, payment_date, payment_method, notes, created_by],
        (insertError, insertResults) => {
          if (insertError) {
            console.error('Error inserting payment:', insertError);
            return res.status(500).json({ error: 'Failed to add payment' });
          }

          // Update invoice status to paid if fully paid
          const newRemaining = remaining - paymentAmount;
          if (newRemaining <= 0) {
            const updateStatusQuery = `
              UPDATE invoice_pharmacy 
              SET invoice_status = 'paid' 
              WHERE invoice_no = ?
            `;
            
            connection.query(updateStatusQuery, [invoice_no], (updateError) => {
              if (updateError) {
                console.error('Error updating invoice status:', updateError);
              }
            });
          }
          
          res.json({ 
            success: true, 
            message: 'Payment added successfully',
            payment_id: insertResults.insertId 
          });
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete payment
app.delete('/delete-payment/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    // Get invoice_no before deleting for status update
    const getInvoiceQuery = 'SELECT invoice_no FROM invoice_payments WHERE id = ?';
    
    connection.query(getInvoiceQuery, [payment_id], (error, results) => {
      if (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      const invoice_no = results[0].invoice_no;
      
      // Delete payment
      const deleteQuery = 'DELETE FROM invoice_payments WHERE id = ?';
      
      connection.query(deleteQuery, [payment_id], (deleteError) => {
        if (deleteError) {
          console.error('Error deleting payment:', deleteError);
          return res.status(500).json({ error: 'Failed to delete payment' });
        }

        // Check if invoice should be marked as unpaid
        const checkRemainingQuery = `
          SELECT 
            (i.grand_total - i.advance - COALESCE(SUM(p.payment_amount), 0)) as remaining
          FROM invoice_pharmacy i
          LEFT JOIN invoice_payments p ON i.invoice_no = p.invoice_no
          WHERE i.invoice_no = ?
          GROUP BY i.invoice_no
        `;
        
        connection.query(checkRemainingQuery, [invoice_no], (checkError, checkResults) => {
          if (!checkError && checkResults.length > 0) {
            const remaining = parseFloat(checkResults[0].remaining);
            
            if (remaining > 0) {
              const updateStatusQuery = `
                UPDATE invoice_pharmacy 
                SET invoice_status = 'unpaid' 
                WHERE invoice_no = ?
              `;
              
              connection.query(updateStatusQuery, [invoice_no]);
            }
          }
        });
        
        res.json({ success: true, message: 'Payment deleted successfully' });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get invoices with unpaid amounts (for reports)
app.get('/get-unpaid-invoices', async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    
    let query = `
      SELECT 
        i.invoice_no,
        i.invoice_date,
        i.phone_no,
        i.full_name,
        i.grand_total,
        i.advance,
        COALESCE(SUM(p.payment_amount), 0) as additional_payments,
        (i.grand_total - i.advance - COALESCE(SUM(p.payment_amount), 0)) as remaining_amount
      FROM invoice_pharmacy i
      LEFT JOIN invoice_payments p ON i.invoice_no = p.invoice_no
      WHERE 1=1
    `;
    
    const params = [];
    
    if (from_date) {
      query += ' AND i.invoice_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND i.invoice_date <= ?';
      params.push(to_date);
    }
    
    query += `
      GROUP BY i.invoice_no
      HAVING remaining_amount > 0
      ORDER BY i.invoice_date DESC
    `;
    
    connection.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching unpaid invoices:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment summary for income report
app.get('/get-payment-summary', async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    
    let query = `
      SELECT 
        DATE(payment_date) as payment_date,
        payment_method,
        SUM(payment_amount) as total_amount,
        COUNT(*) as payment_count
      FROM invoice_payments
      WHERE 1=1
    `;
    
    const params = [];
    
    if (from_date) {
      query += ' AND payment_date >= ?';
      params.push(from_date);
    }
    
    if (to_date) {
      query += ' AND payment_date <= ?';
      params.push(to_date);
    }
    
    query += ' GROUP BY DATE(payment_date), payment_method ORDER BY payment_date DESC';
    
    connection.query(query, params, (error, results) => {
      if (error) {
        console.error('Error fetching payment summary:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.get('/get-all-items-for-pharmacy', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // SQL query to select all items along with their category names
        const sql = `SELECT items.*, items.stock_type as category 
                 FROM items ORDER BY items.items DESC`;

        // Execute the query
        connection.query(sql, (error, results) => {
            connection.release(); // Always release the connection after query execution
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});



app.get('/get-all-departments', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // SQL query to select all items along with their category names
        const sql = `SELECT * FROM departments ORDER BY departments.id DESC`;

        // Execute the query
        connection.query(sql, (error, results) => {
            connection.release(); // Always release the connection after query execution
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                results, // Array of all items
            });
        });
    });
});




app.get('/get-all-supplier', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error fetching supplier' });
            return;
        }

        // SQL query to select all items along with their category names
        const sql = `SELECT * 
                 FROM suppliers ORDER BY suppliers.id DESC`;

        // Execute the query
        connection.query(sql, (error, results) => {
            connection.release(); // Always release the connection after query execution
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});



app.get('/get-all-banks', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error fetching supplier' });
            return;
        }

        // SQL query to select all items along with their category names
        const sql = `SELECT * FROM bank_accounts ORDER BY bank_accounts.id DESC`;

        // Execute the query
        connection.query(sql, (error, results) => {
            connection.release(); // Always release the connection after query execution
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});




app.get('/get-all-transactions-heads', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).json({ error: 'Error fetching supplier' });
            return;
        }

        // SQL query to select all items along with their category names
        const sql = `SELECT * FROM heads ORDER BY heads.id DESC`;

        // Execute the query
        connection.query(sql, (error, results) => {
            connection.release(); // Always release the connection after query execution
            if (error) {
                console.error('Error executing SQL query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});

app.get('/get-all-stock', (req, res) => {
    const item_id = req.query.item_id; // Assuming item_id is passed as a query parameter

    if (!item_id) {
        return res.status(400).json({ error: 'item_id is required' });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return res.status(500).json({ error: 'Error connecting to the database' });
        }

        // SQL query to select all items along with their category names
        const sql = `
    SELECT 
      s.id AS stock_id,
      s.invoice_no,
      s.rack_no,
      s.final_price,
      ROUND(COALESCE(SUM(i.quantity), 0), 2) AS used_quantity,
      ROUND(s.quantity - COALESCE(SUM(i.quantity), 0), 2) AS remaining_quantity,
      MIN(s.stock_date) AS earliest_expiry,
      s.item_id,
      s.discount
    FROM 
      stock s
    LEFT JOIN 
      invoice_pharmacy i ON s.id = i.stock_id
    WHERE 
      s.item_id = ?
    GROUP BY 
      s.id, s.invoice_no,  s.item_id
    ORDER BY 
      s.stock_date`;


        // Execute the query
        connection.query(sql, [item_id], (error, results) => {
            connection.release(); // Always release the connection after query execution

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});






app.get('/get-all-stock-with-barcode/:stock_invoice_no', (req, res) => {
    const stock_invoice_no = req.params.stock_invoice_no; // Get stock_id from URL parameter

    if (!stock_invoice_no) {
        return res.status(400).json({ error: 'stock_id is required' });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return res.status(500).json({ error: 'Error connecting to the database' });
        }

        // SQL query to select stock details along with item barcode
        const sql = `
            SELECT 
                s.id as id,
                s.item_id,
                it.items as name,
                s.purchase_rate_calculate_per_tablet as price,
                s.quantity as stock,
                it.barcode_no as barcode
            FROM 
                stock s
            INNER JOIN 
                items it ON s.item_id = it.id
            WHERE 
                s.invoice_no = ?
            ORDER BY 
                s.stock_date`;

        // Execute the query
        connection.query(sql, [stock_invoice_no], (error, results) => {
            connection.release(); // Always release the connection after query execution

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
                totalItems: results.length, // Total number of items
                results // Array of all items
            });
        });
    });
});






app.get('/get-all-stock-for-barcode', (req, res) => {
    const item_id = req.query.item_id;
    const stock_id = req.query.stock_id;

    if (!item_id) {
        return res.status(400).json({ error: 'item_id is required' });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return res.status(500).json({ error: 'Error connecting to the database' });
        }

        // SQL query to select all items along with their category names
        const sql = `
    SELECT 
      s.id AS stock_id,
      s.invoice_no,
      s.price,
      s.rack_no,
      s.final_price,
      s.price_after_discount,
      s.quantity AS initial_quantity,
      COALESCE(SUM(i.quantity), 0) AS used_quantity,
      s.quantity - COALESCE(SUM(i.quantity), 0) AS remaining_quantity,
      MIN(s.stock_date) AS earliest_expiry,
      s.item_id,
      s.discount
    FROM 
      stock s
    LEFT JOIN 
      invoice i ON s.id = i.stock_id
    WHERE 
      s.item_id = ?
      AND s.id = ?
    GROUP BY 
      s.id, s.invoice_no,  s.item_id
    ORDER BY 
      s.stock_date`;


        // Execute the query
        connection.query(sql, [item_id, stock_id], (error, results) => {
            connection.release(); // Always release the connection after query execution

            if (error) {
                console.error('Error executing SQL query:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
                totalItems: results.length, // Total number of items
                results, // Array of all items
            });
        });
    });
});





app.get('/item-get/:item_id', (req, res) => {
    const item_id = req.params.item_id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT * FROM items WHERE id = ?`;
        const values = [item_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});




app.get('/bank-account-get/:id', (req, res) => {
    const id = req.params.id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching' });
            return;
        }

        const sql = `SELECT * FROM bank_accounts WHERE id = ?`;
        const values = [id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});


app.get('/head-get/:id', (req, res) => {
    const id = req.params.id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching' });
            return;
        }

        const sql = `SELECT * FROM heads WHERE id = ?`;
        const values = [id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});

app.get('/item-get-for-edit/:item_id', (req, res) => {
    const item_id = req.params.item_id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        // Corrected SQL query
        const sql = `SELECT clinic_items.*, 
                            IFNULL(CONCAT(doctors.doctor_name, ' (', doctors.specialization, ')'), lab_tests.lab_test) AS item_detail
                     FROM clinic_items 
                     LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id 
                     LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id 
                     WHERE clinic_items.id = ?`;

        const values = [item_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});




app.get('/department-get/:item_id', (req, res) => {
    const item_id = req.params.item_id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching departments' });
            return;
        }

        const sql = `SELECT * FROM departments WHERE id = ?`;
        const values = [item_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});





app.get('/lab-test-get/:item_id', (req, res) => {
    const item_id = req.params.item_id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching lab_test' });
            return;
        }

        const sql = `SELECT * FROM lab_tests WHERE id = ?`;
        const values = [item_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});





app.get('/doctor-get/:doctor_id_get', (req, res) => {
    const doctor_id = req.params.doctor_id_get;


    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching departments' });
            return;
        }

        const sql = `SELECT doctors.*, departments.department 
        FROM doctors 
        INNER JOIN departments ON doctors.department_id = departments.id 
        WHERE doctors.id = ?`;

        const values = [doctor_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});






app.get('/epxense-head/:expense_head_id', (req, res) => {
    const expense_head_id = req.params.expense_head_id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT * FROM expense_head WHERE id = ?`;
        const values = [expense_head_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});




// app.put('/update-item/:id', (req, res) => {

//     const itemId = parseInt(req.params.id); // Parse the ID from the URL
//     const { category, item_name, price, discount, rack_no, formula, unitType, gst, manufacturer, medicine_type, alert, stock_type } = req.body; // Updated item data from the request body

//     connection.getConnection((err, connection) => {

//         if (err) {
//             console.error('Error:', err);
//             res.status(500).json({ error: 'Database connection error' });
//             return;
//         }

//         // Check if the new item_name is unique (if changed)
//         const checkSql = 'SELECT COUNT(*) AS count FROM items WHERE items = ? AND id != ?';
//         connection.query(checkSql, [item_name, itemId], (checkErr, results) => {
//             if (checkErr) {
//                 connection.release();
//                 console.error('Error checking for duplicate item name:', checkErr);
//                 res.status(500).json({ error: 'Error checking for duplicate item name' });
//                 return;
//             }

//             if (results[0].count > 0) {
//                 connection.release();
//                 res.status(400).json({ error: 'Item name already exists' });
//                 return;
//             }

//             // Proceed with updating the item
//             const sql = 'UPDATE items SET category = ?, items = ?, price = ?, discount = ?, unit_type = ?, gst = ?, manufacturer = ?, medicine_type = ?, alert = ?, stock_type = ? WHERE id = ?';
//             const values = [category, item_name, price, discount, unitType, gst, manufacturer, medicine_type, alert, stock_type, itemId];

//             connection.query(sql, values, (updateErr, results) => {
//                 connection.release(); // Release the connection

//                 if (updateErr) {
//                     console.error('Error updating item:', updateErr);
//                     res.status(500).json({ error: 'Error updating item' });
//                 } else if (results.affectedRows === 0) {
//                     console.log('No item found with the given ID');
//                     res.status(404).json({ error: 'No item found with the given ID' });
//                 } else {
//                     console.log('Item updated successfully');
//                     res.status(200).json({ message: 'Item updated successfully' });
//                 }
//             });
//         });
//     });
// });

// app.put('/update-item/:id', (req, res) => {
//     const itemId = parseInt(req.params.id); // Parse the ID from the URL
//     const { category, item_name, price, discount, rack_no, formula, unitType, gst, manufacturer, medicine_type, alert, stock_type, barcode_no } = req.body; // Updated item data from the request body

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error:', err);
//             res.status(500).json({ error: 'Database connection error' });
//             return;
//         }

//         // Check if the new item_name + manufacturer combination is unique (if changed)
//         const checkItemSql = 'SELECT COUNT(*) AS count FROM items WHERE items = ? AND manufacturer = ? AND id != ?';
//         connection.query(checkItemSql, [item_name, manufacturer, itemId], (checkErr, results) => {
//             if (checkErr) {
//                 connection.release();
//                 console.error('Error checking for duplicate item name:', checkErr);
//                 res.status(500).json({ error: 'Error checking for duplicate item name' });
//                 return;
//             }

//             console.log("Item check results:", results);
//             if (results[0].count > 0) {
//                 connection.release();
//                 res.status(400).json({ error: 'Item with this name and manufacturer already exists' });
//                 return;
//             }

//             // Check if barcode already exists (only if barcode is provided and not null/empty)
//             if (barcode_no && barcode_no.trim() !== '') {
//                 const checkBarcodeSql = 'SELECT COUNT(*) AS count FROM items WHERE barcode_no = ? AND barcode_no IS NOT NULL AND id != ?';
//                 connection.query(checkBarcodeSql, [barcode_no, itemId], (barcodeErr, barcodeResults) => {
//                     if (barcodeErr) {
//                         connection.release();
//                         console.error("Error checking for duplicate barcode:", barcodeErr);
//                         res.status(500).json({ error: "Error checking for duplicate barcode" });
//                         return;
//                     }

//                     console.log("Barcode check results:", barcodeResults);
//                     if (barcodeResults[0].count > 0) {
//                         // Barcode already exists
//                         connection.release();
//                         res.status(400).json({ error: "Barcode already exists" });
//                         return;
//                     }

//                     // Both checks passed, update the item
//                     updateItem();
//                 });
//             } else {
//                 // No barcode provided or barcode is empty, skip barcode check
//                 updateItem();
//             }

//             // Function to update the item
//             function updateItem() {
//                 const sql = 'UPDATE items SET category = ?, items = ?, price = ?, discount = ?, unit_type = ?, gst = ?, manufacturer = ?, medicine_type = ?, alert = ?, stock_type = ?, barcode_no = ? WHERE id = ?';
//                 const values = [category, item_name, price, discount, unitType, gst, manufacturer, medicine_type, alert, stock_type, barcode_no, itemId];

//                 connection.query(sql, values, (updateErr, results) => {
//                     connection.release(); // Release the connection

//                     if (updateErr) {
//                         console.error('Error updating item:', updateErr);
//                         res.status(500).json({ error: 'Error updating item' });
//                     } else if (results.affectedRows === 0) {
//                         console.log('No item found with the given ID');
//                         res.status(404).json({ error: 'No item found with the given ID' });
//                     } else {
//                         console.log('Item updated successfully');
//                         res.status(200).json({ message: 'Item updated successfully' });
//                     }
//                 });
//             }
//         });
//     });
// });



app.put('/update-item/:id', (req, res) => {
    const itemId = parseInt(req.params.id); // Parse the ID from the URL
    const { category, item_name, price, discount, rack_no, formula, unitType, gst, manufacturer, medicine_type, alert, stock_type, barcode_no, location, item_purchase_price } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the new item_name + manufacturer combination is unique (if changed)
        const checkItemSql = 'SELECT COUNT(*) AS count FROM items WHERE items = ? AND manufacturer = ? AND id != ?';
        connection.query(checkItemSql, [item_name, manufacturer, itemId], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate item name:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate item name' });
                return;
            }

            console.log("Item check results:", results);
            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Item with this name and manufacturer already exists' });
                return;
            }

            // Check if barcode already exists (only if barcode is provided and not null/empty)
            if (barcode_no && barcode_no.trim() !== '') {
                const checkBarcodeSql = 'SELECT COUNT(*) AS count FROM items WHERE barcode_no = ? AND barcode_no IS NOT NULL AND id != ?';
                connection.query(checkBarcodeSql, [barcode_no, itemId], (barcodeErr, barcodeResults) => {
                    if (barcodeErr) {
                        connection.release();
                        console.error("Error checking for duplicate barcode:", barcodeErr);
                        res.status(500).json({ error: "Error checking for duplicate barcode" });
                        return;
                    }

                    console.log("Barcode check results:", barcodeResults);
                    if (barcodeResults[0].count > 0) {
                        // Barcode already exists
                        connection.release();
                        res.status(400).json({ error: "Barcode already exists" });
                        return;
                    }

                    // Both checks passed, update the item
                    updateItem();
                });
            } else {
                // No barcode provided or barcode is empty, skip barcode check
                updateItem();
            }

            // Function to update the item
            function updateItem() {
                const sql = 'UPDATE items SET category = ?, items = ?, price = ?, discount = ?, unit_type = ?, gst = ?, manufacturer = ?, medicine_type = ?, alert = ?, stock_type = ?, barcode_no = ?, location = ?, item_purchase_price= ? WHERE id = ?';
                const values = [category, item_name, price, discount, unitType, gst, manufacturer, medicine_type, alert, stock_type, barcode_no, location, item_purchase_price, itemId];

                connection.query(sql, values, (updateErr, results) => {
                    connection.release(); // Release the connection

                    if (updateErr) {
                        console.error('Error updating item:', updateErr);
                        res.status(500).json({ error: 'Error updating item' });
                    } else if (results.affectedRows === 0) {
                        console.log('No item found with the given ID');
                        res.status(404).json({ error: 'No item found with the given ID' });
                    } else {
                        console.log('Item updated successfully');
                        res.status(200).json({ message: 'Item updated successfully' });
                    }
                });
            }
        });
    });
});


app.put('/update-department/:id', (req, res) => {

    const itemId = parseInt(req.params.id); // Parse the ID from the URL
    const { item_name } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {

        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the new item_name is unique (if changed)
        const checkSql = 'SELECT COUNT(*) AS count FROM departments WHERE department = ? AND id != ?';
        connection.query(checkSql, [item_name, itemId], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate item name:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate item name' });
                return;
            }

            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Item name already exists' });
                return;
            }

            // Proceed with updating the item
            const sql = 'UPDATE departments SET department = ? WHERE id = ?';
            const values = [ item_name, itemId];

            connection.query(sql, values, (updateErr, results) => {
                connection.release(); // Release the connection

                if (updateErr) {
                    console.error('Error updating item:', updateErr);
                    res.status(500).json({ error: 'Error updating item' });
                } else if (results.affectedRows === 0) {
                    console.log('No item found with the given ID');
                    res.status(404).json({ error: 'No item found with the given ID' });
                } else {
                    console.log('Item updated successfully');
                    res.status(200).json({ message: 'Item updated successfully' });
                }
            });
        });
    });
});






app.put('/update-lab-test/:id', (req, res) => {

    const itemId = parseInt(req.params.id); // Parse the ID from the URL
    const { item_name } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {

        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the new item_name is unique (if changed)
        const checkSql = 'SELECT COUNT(*) AS count FROM lab_tests WHERE lab_test = ? AND id != ?';
        connection.query(checkSql, [item_name, itemId], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate item name:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate item name' });
                return;
            }

            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Item name already exists' });
                return;
            }

            // Proceed with updating the item
            const sql = 'UPDATE lab_tests SET lab_test = ? WHERE id = ?';
            const values = [ item_name, itemId];

            connection.query(sql, values, (updateErr, results) => {
                connection.release(); // Release the connection

                if (updateErr) {
                    console.error('Error updating item:', updateErr);
                    res.status(500).json({ error: 'Error updating item' });
                } else if (results.affectedRows === 0) {
                    console.log('No item found with the given ID');
                    res.status(404).json({ error: 'No item found with the given ID' });
                } else {
                    console.log('Item updated successfully');
                    res.status(200).json({ message: 'Item updated successfully' });
                }
            });
        });
    });
});




app.put('/update-doctor/:id', (req, res) => {

    const itemId = parseInt(req.params.id); // Parse the ID from the URL
    const { doctor_name, department_id, specialization } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {

        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the new item_name is unique (if changed)
        const checkSql = 'SELECT COUNT(*) AS count FROM doctors WHERE doctor_name = ? AND id != ?';
        connection.query(checkSql, [doctor_name, itemId], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate item name:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate item name' });
                return;
            }

            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Item name already exists' });
                return;
            }

            // Proceed with updating the item
            const sql = 'UPDATE doctors SET doctor_name = ? department_id = ? specialization = ? WHERE id = ?';
            const values = [ doctor_name,department_id, specialization, itemId];

            connection.query(sql, values, (updateErr, results) => {
                connection.release(); // Release the connection

                if (updateErr) {
                    console.error('Error updating item:', updateErr);
                    res.status(500).json({ error: 'Error updating item' });
                } else if (results.affectedRows === 0) {
                    console.log('No item found with the given ID');
                    res.status(404).json({ error: 'No item found with the given ID' });
                } else {
                    console.log('Item updated successfully');
                    res.status(200).json({ message: 'Item updated successfully' });
                }
            });
        });
    });
});





app.put('/update-supplier/:id', (req, res) => {

    const supplier_id = parseInt(req.params.id); // Parse the ID from the URL
    const { full_name, phone_no, account_no } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {

        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the new item_name is unique (if changed)
        const checkSql = 'SELECT COUNT(*) AS count FROM suppliers WHERE phone_no = ? AND id != ?';
        connection.query(checkSql, [phone_no, supplier_id], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate supplier name:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate supplier name' });
                return;
            }

            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Supplier name already exists' });
                return;
            }

            // Proceed with updating the item
            const sql = "UPDATE items SET full_name = ?, phone_no = ?, account_no = ? WHERE id = ?";
            const values = [full_name, phone_no, account_no, supplier_id];

            connection.query(sql, values, (updateErr, results) => {
                connection.release(); // Release the connection

                if (updateErr) {
                    console.error('Error updating item:', updateErr);
                    res.status(500).json({ error: 'Error updating item' });
                } else if (results.affectedRows === 0) {
                    console.log('No item found with the given ID');
                    res.status(404).json({ error: 'No item found with the given ID' });
                } else {
                    console.log('Item updated successfully');
                    res.status(200).json({ message: 'Item updated successfully' });
                }
            });
        });
    });
});





app.put('/update-item-rate-datewise/:id', (req, res) => {

    // const itemId = parseInt(req.params.id); // Parse the ID from the URL
    const { price, discount, price_after_discount, item_id, from_date, to_date } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {

        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Proceed with updating the item
        const sql = 'UPDATE invoice SET price = ?, discount = ?, price_after_discount = ? WHERE item = ? AND invoice_date BETWEEN ? AND ?';
        const values = [price, discount, price_after_discount, item_id, from_date, to_date];

        connection.query(sql, values, (updateErr, results) => {
            connection.release(); // Release the connection

            if (updateErr) {
                console.error('Error updating item:', updateErr);
                res.status(500).json({ error: 'Error updating item' });
            } else if (results.affectedRows === 0) {
                console.log('No item found with the given ID');
                res.status(404).json({ error: 'No item found with the given ID' });
            } else {
                console.log('Item updated successfully');
                res.status(200).json({ message: 'Item updated successfully' });
            }
        });
    });
});





app.delete('/delete-item/:item_id', (req, res) => {
    const itemId = parseInt(req.params.item_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = 'DELETE FROM items WHERE id = ?';
        const values = [itemId];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Item deleted successfully' });
            }
        });
    });
});



app.delete('/delete-bank-account/:id', (req, res) => {
    const id = parseInt(req.params.id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting' });
            return;
        }

        const sql = 'DELETE FROM bank_accounts WHERE id = ?';
        const values = [id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting:', error);
                res.status(500).json({ error: 'Error deleting' });
            } else {
                console.log('Deleted successfully');
                res.status(200).json({ message: 'Deleted successfully' });
            }
        });
    });
});


app.delete('/delete-head/:id', (req, res) => {
    const id = parseInt(req.params.id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting' });
            return;
        }

        const sql = 'DELETE FROM heads WHERE id = ?';
        const values = [id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting:', error);
                res.status(500).json({ error: 'Error deleting' });
            } else {
                console.log('Deleted successfully');
                res.status(200).json({ message: 'Deleted successfully' });
            }
        });
    });
});



app.put('/update-bank-account/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { bank_name, opening_balance, account_no } = req.body;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the bank name already exists (excluding current record)
        const checkSql = 'SELECT COUNT(*) AS count FROM bank_accounts WHERE bank_name = ? AND id != ?';
        connection.query(checkSql, [bank_name, id], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate bank name:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate bank name' });
                return;
            }

            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Bank account with this name already exists' });
                return;
            }

            // Update the bank account
            const updateSql = 'UPDATE bank_accounts SET bank_name = ?, opening_balance = ?, account_no = ? WHERE id = ?';
            const values = [bank_name, opening_balance, account_no, id];

            connection.query(updateSql, values, (updateErr, results) => {
                connection.release();

                if (updateErr) {
                    console.error('Error updating bank account:', updateErr);
                    res.status(500).json({ error: 'Error updating bank account' });
                } else if (results.affectedRows === 0) {
                    console.log('No bank account found with the given ID');
                    res.status(404).json({ error: 'No bank account found with the given ID' });
                } else {
                    console.log('Bank account updated successfully');
                    res.status(200).json({ message: 'Bank account updated successfully' });
                }
            });
        });
    });
});


app.put('/update-head/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { head_name } = req.body;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Database connection error' });
            return;
        }

        // Check if the bank name already exists (excluding current record)
        const checkSql = 'SELECT COUNT(*) AS count FROM heads WHERE head_name = ? AND id != ?';
        connection.query(checkSql, [head_name, id], (checkErr, results) => {
            if (checkErr) {
                connection.release();
                console.error('Error checking for duplicate:', checkErr);
                res.status(500).json({ error: 'Error checking for duplicate' });
                return;
            }

            if (results[0].count > 0) {
                connection.release();
                res.status(400).json({ error: 'Head with this name already exists' });
                return;
            }

            // Update the bank account
            const updateSql = 'UPDATE heads SET head_name = ? WHERE id = ?';
            const values = [head_name, id];

            connection.query(updateSql, values, (updateErr, results) => {
                connection.release();

                if (updateErr) {
                    console.error('Error updating head:', updateErr);
                    res.status(500).json({ error: 'Error updating' });
                } else if (results.affectedRows === 0) {
                    console.log('No head found with the given ID');
                    res.status(404).json({ error: 'No Head found with the given ID' });
                } else {
                    console.log('Head updated successfully');
                    res.status(200).json({ message: 'Head updated successfully' });
                }
            });
        });
    });
});

app.delete('/delete-department/:item_id', (req, res) => {
    const itemId = parseInt(req.params.item_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = 'DELETE FROM departments WHERE id = ?';
        const values = [itemId];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Item deleted successfully' });
            }
        });
    });
});


// app.get('/categories', (req, res) => {
//   connection.getConnection((err, connection) => {
//     if (err) {
//       console.error('Error:', err);
//       res.status(500).json({ error: 'Error fetching categories' });
//       return;
//     }

//     const sql = 'SELECT * FROM categories';

//     connection.query(sql, (error, results) => {
//       connection.release(); // Release the connection

//       if (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Error fetching categories' });
//       } else {
//         console.log('Fetch Successfully');
//         res.status(200).json({ results });
//       }
//     });
//   });
// });










app.get('/stocks', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching stocks' });
            return;
        }
        const sql = 'SELECT * FROM stock';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error fetching categories' });
            } else {
                console.log('Fetch Successfully');
                res.status(200).json({ results });
            }
        });
    });
});









// Example route using the connection
app.get('/get-item-details/:item_id', (req, res) => {
    const itemId = parseInt(req.params.item_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error' });
            return;
        }

        const sql = `
      SELECT 
          items.id,
          items.items,
          items.price,
          items.discount,
           items.unit_type,
          COALESCE(stock_total.total_stock_quantity, 0) AS total_stock_quantity,
          COALESCE(invoice_total.total_invoice_quantity, 0) AS total_invoice_quantity
      FROM 
          items
      LEFT JOIN 
          (SELECT item_id, SUM(quantity) AS total_stock_quantity FROM stock GROUP BY item_id) AS stock_total 
          ON items.id = stock_total.item_id
      LEFT JOIN 
          (SELECT item, SUM(quantity) AS total_invoice_quantity FROM invoice GROUP BY item) AS invoice_total 
          ON items.id = invoice_total.item
      WHERE 
          items.id = ?`;
        const values = [itemId];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error' });
            } else {
                console.log('Fetch Successfully');
                res.status(200).json({ results });
            }
        });
    });
});





// app.post('/insert-invoice', (req, res) => {
//   const items = req.body.tableData; // Assuming the array of items is sent in the request body
//   const invoice_no_for_update = req.body.invoice_no_get;
//   console.log(items);


//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit format
//     const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit format
//     return `${year}-${month}-${day}`;
// };
//   // console.log(items);
//   // Query to retrieve the last invoice number


//   const update_values = items
//     .filter(item => item.hidden_id !== '')
//     .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount, item.total, item.invoice_no, item.phone_no, item.full_name, item.account_no, item.stock_id, item.gst, item.rate_after_discount, item.invoice_date, item.rack_no]);

//   // console.log(update_values);
//   // return false;
//   // Construct the bulk update query
//   let sql = 'UPDATE invoice SET ';
//   const values = [];

//   update_values.forEach((data, index) => {
//     const id = data[0];
//     const item = data[1];
//     const price = data[2];
//     const quantity = data[3];
//     const discount = data[4];
//     const total = data[5];
//     const invoice_no = data[6];
//     const phone_no = data[7];
//     const full_name = data[8];
//     const account_no = data[9];
//     const stock_id = data[10];
//     const gst = data[11];
//     const rate_after_discount = data[12];
//     const invoice_date = data[13];
//     const rack_no = data[14];


//     // Add SET clause for each row
//     sql += `item = CASE WHEN id = ? THEN ? ELSE item END, `;
//     sql += `price = CASE WHEN id = ? THEN ? ELSE price END, `;
//     sql += `quantity = CASE WHEN id = ? THEN ? ELSE quantity END, `;
//     sql += `discount = CASE WHEN id = ? THEN ? ELSE discount END, `;
//     sql += `phone_no = CASE WHEN id = ? THEN ? ELSE phone_no END, `;
//     sql += `full_name = CASE WHEN id = ? THEN ? ELSE full_name END, `;
//     sql += `account_no = CASE WHEN id = ? THEN ? ELSE account_no END, `;
//     sql += `stock_id = CASE WHEN id = ? THEN ? ELSE stock_id END, `;
//     // sql += `gst = CASE WHEN id = ? THEN ? ELSE gst END, `;
//     sql += `price_after_discount = CASE WHEN id = ? THEN ? ELSE price_after_discount END, `;
//     sql += `invoice_date = CASE WHEN id = ? THEN ? ELSE invoice_date END, `;
//     sql += `rack_no = CASE WHEN id = ? THEN ? ELSE rack_no END, `;

//     // Push values for price update
//     values.push(id, item);
//     values.push(id, price);
//     values.push(id, quantity);
//     values.push(id, discount);
//     values.push(id, phone_no);
//     values.push(id, full_name);
//     values.push(id, account_no);
//     values.push(id, stock_id);
//     // values.push(id, gst);
//     values.push(id, rate_after_discount);
//     values.push(id, formatDate(invoice_date));
//     values.push(id, rack_no);
//   });

//   // Remove the trailing comma and space
//   sql = sql.slice(0, -2);

//   // Add WHERE clause based on the IDs
//   sql += ' WHERE id IN (?)';

//   // Push all IDs into values array
//   const ids = update_values.map(data => data[0]);
//   values.push(ids);

//   // Execute the bulk update query
//   connection.query(sql, values, (error, results, fields) => {
//     if (error) {
//       console.error('Error updating items:', error);
//     } else {
//       // return res.status(200).json({ message: 'Invoice Update Successfully' });
//     }


//   });


//   // console.log(update_values);


//   const check_invoice_no = "SELECT invoice_no FROM invoice ORDER BY invoice_no DESC LIMIT 1";

//   connection.getConnection((error, connection) => {
//     if (error) {
//       console.error('Error:', error);
//       return res.status(500).json({ error: 'Error retrieving last invoice number' });
//     }

//     connection.query(check_invoice_no, (error, results) => {
//       if (error) {
//         connection.release(); // Release the connection
//         console.error('Error retrieving last invoice number:', error);
//         return res.status(500).json({ error: 'Error retrieving last invoice number' });
//       }

//       let nextInvoiceNo;

//       if (results == "") {
//         nextInvoiceNo = 1000;
//       } else {
//         const lastInvoiceNo = results[0].invoice_no;
//         nextInvoiceNo = lastInvoiceNo + 1;
//       }

//       console.log(invoice_no_for_update, "this is invoice no");
//       if (update_values.length > 0) {
//         nextInvoiceNo = update_values[0][6];
//         // console.log(nextInvoiceNo);
//       }else if(invoice_no_for_update !== ''){
//         nextInvoiceNo = invoice_no_for_update;
//       }

//       // Prepare values for insertion
//       // const values = items.map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total]);

//       const values = items
//         .filter(item => item.hidden_id === '')
//         .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount,  item.phone_no, item.full_name, item.account_no, item.stock_id, item.rate_after_discount, formatDate(item.invoice_date), item.rack_no]);

//       console.log(values.length);

//       if (values.length == 0) {
//         return res.status(200).json({ message: 'Invoice Update Successfully' });
//      }
//       // SQL query to insert invoice data
//       const sql = 'INSERT INTO invoice (invoice_no, item, price, quantity, discount, phone_no, full_name, account_no, stock_id, price_after_discount, invoice_date, rack_no) VALUES ?';

//       // console.log(values);

//       // Execute the insert query
//       connection.query(sql, [values], (error, result) => {
//         connection.release(); // Release the connection

//         if (error) {
//           console.error('Error inserting data:', error);
//           return res.status(500).json({ error: 'Error inserting data' });
//         }else{
//           return res.status(200).json({ data: 'Inserted' });
//         }



//       });
//     });
//   });
// });


// start from here

// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id =  req.body.doctor_id;

//     // console.log(items);

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     };

//     // Aggregate quantities for identical items
//     const itemQuantities = items.reduce((acc, item) => {
//         if (!item.stock_id || !item.item) return acc;
//         const key = `${item.item}_${item.stock_id}`; // Unique key for item_id and stock_id
//         acc[key] = acc[key] || { 
//             item_id: item.item, 
//             stock_id: item.stock_id, 
//             item_name: item.item_name, 
//             total_quantity: 0, 
//             hidden_ids: [], 
//             quantities: [] 
//         };
//         acc[key].total_quantity += parseFloat(item.quantity) || 0;
//         if (item.hidden_id) acc[key].hidden_ids.push({ id: item.hidden_id, quantity: parseFloat(item.quantity) });
//         acc[key].quantities.push(parseFloat(item.quantity));
//         return acc;
//     }, {});

//     // Convert aggregated items to array for stock checking
//     const aggregatedItems = Object.values(itemQuantities);

//     // Validate stock for aggregated items
//     const validateStock = () => {
//         const stockCheckPromises = aggregatedItems.map(aggItem => {
//             return new Promise((resolve, reject) => {
//                 const stockCheckQuery = `
//                     SELECT 
//                         s.id AS stock_id,
//                         s.invoice_no,
//                         s.rack_no,
//                         s.final_price,
//                         ROUND(COALESCE(SUM(i.quantity), 0), 2) AS used_quantity,
//                         ROUND(s.quantity - COALESCE(SUM(i.quantity), 0), 2) AS remaining_quantity,
//                         MIN(s.stock_date) AS earliest_expiry,
//                         s.item_id,
//                         s.discount
//                     FROM 
//                         stock s
//                     LEFT JOIN 
//                         invoice_pharmacy i ON s.id = i.stock_id
//                     WHERE 
//                         s.item_id = ?
//                         AND s.id = ? LIMIT 1`;

//                 connection.query(stockCheckQuery, [aggItem.item_id, aggItem.stock_id], (error, results) => {
//                     if (error) return reject(error);

//                     const stock = results[0];
//                     const requestedQty = parseFloat(aggItem.total_quantity) || 0;
//                     const remainingQty = parseFloat(stock.remaining_quantity) || 0;

//                     // Check for new items
//                     if (aggItem.hidden_ids.length === 0) {
//                         if (remainingQty - requestedQty < 0) {
//                            return res.status(404).json({ 
//                         error: `Stock not found for item ${aggItem.item_name} Available Qty: ${remainingQty}, Requested Qty: ${requestedQty}`
//                     });
//                            // return reject(new Error(`Stock not found for item ${aggItem.item_name} (ID: ${aggItem.item_id}). Available: ${remainingQty}, Requested: ${requestedQty}`));
//                         }
//                         resolve();
//                     } else {
//                         // For existing items, calculate net change
//                         connection.query(
//                             'SELECT id, quantity FROM invoice_pharmacy WHERE id IN (?)',
//                             [aggItem.hidden_ids.map(h => h.id)],
//                             (err, existing) => {
//                                 if (err) return reject(err);

//                                 const prevTotalQty = existing.reduce((sum, row) => sum + parseFloat(row.quantity || 0), 0);
//                                 const additionalQty = requestedQty - prevTotalQty;

//                                 // Only check additional quantity against remaining stock
//                                 if (additionalQty > 0 && remainingQty - additionalQty < 0) {
//                                     return reject(new Error(`Insufficient stock for ${aggItem.item_name} (ID: ${aggItem.item_id}). Available: ${remainingQty}, Needed: ${additionalQty}`));
//                                 }
//                                 resolve();
//                             }
//                         );
//                     }
//                 });
//             });
//         });

//         return Promise.all(stockCheckPromises);
//     };

//     // Update existing invoice items
//     const updateInvoiceItems = () => {
//         return new Promise((resolve, reject) => {
//             const update_values = items
//                 .filter(item => item.hidden_id !== '')
//                 .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount,
//                      item.phone_no, item.full_name, item.age, item.stock_id, 
//                     item.gst, item.rate_after_discount, item.invoice_date, item.rack_no, 
//                     item.return_unit, item.total_return_amount, patient_id, doctor_id]);

//             // console.log(update_values);

//             // return false;

//             if (update_values.length === 0) return resolve();

//             // console.log(item.stock_id);
//             let sql = 'UPDATE invoice_pharmacy SET ';
//             const values = [];

//             update_values.forEach((data) => {
//                 const id = data[0];
//                 const fields = [
//                     'item', 'price', 'quantity', 'discount',
//                     'phone_no', 'full_name', 'age', 'stock_id',
//                     'gst', 'price_after_discount', 'invoice_date',
//                     'rack_no', 'return_unit', 'total_return_amount', 'patient_id', 'doctor_invoice_id'
//                 ];

//                 fields.forEach((field, idx) => {
//                     sql += `${field} = CASE WHEN id = ? THEN ? ELSE ${field} END, `;
//                     values.push(id, data[idx + 1]); // Skip id at index 0
//                 });
//             });

//             sql = sql.slice(0, -2); // Remove trailing comma
//             sql += ' WHERE id IN (?)';
//             values.push(update_values.map(data => data[0]));

//             connection.query(sql, values, (error) => {
//                 if (error) {
//                     console.error('Error updating items:', error);
//                     return reject(new Error('Error updating items'));
//                 }
//                 resolve();
//             });
//         });
//     };

//     // Insert new invoice items
//     const insertInvoiceItems = (nextInvoiceNo) => {
//         return new Promise((resolve, reject) => {
//             const insertValues = items
//                 .filter(item => item.hidden_id === '')
//                 .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, 
//                     item.phone_no, item.full_name, item.age, item.stock_id, 
//                     item.rate_after_discount, formatDate(item.invoice_date), item.rack_no, patient_id, doctor_id]);

//             if (insertValues.length === 0) {
//                 items.forEach(item => item.invoice_no = nextInvoiceNo);
//                 return resolve();
//             }

//             const insertSql = `INSERT INTO invoice_pharmacy (
//                 invoice_no, item, price, quantity, discount, 
//                 phone_no, full_name, age, stock_id, 
//                 price_after_discount, invoice_date, rack_no, patient_id, doctor_invoice_id
//             ) VALUES ?`;

//             connection.query(insertSql, [insertValues], (error) => {
//                 if (error) {
//                     console.error('Error inserting data:', error);
//                     return reject(new Error('Error inserting data'));
//                 }

//                 items.forEach(item => {
//                     item.invoice_no = nextInvoiceNo;
//                     item.price_after_discount = item.rate_after_discount;
//                 });
//                 resolve();
//             });
//         });
//     };

//     // Main processing logic
//     validateStock()
//         .then(() => {
//             const check_invoice_no = "SELECT invoice_no FROM invoice_pharmacy ORDER BY invoice_no DESC LIMIT 1";
//             connection.getConnection((error, conn) => {
//                 if (error) {
//                     console.error('Error:', error);
//                     return res.status(500).json({ error: 'Database connection error' });
//                 }

//                 conn.query(check_invoice_no, (error, results) => {
//                     if (error) {
//                         conn.release();
//                         console.error('Error retrieving last invoice number:', error);
//                         return res.status(500).json({ error: 'Error retrieving last invoice number' });
//                     }

//                     let nextInvoiceNo = results.length ? results[0].invoice_no + 1 : 1000;
//                     if (items.some(item => item.hidden_id !== '')) {
//                         nextInvoiceNo = items.find(item => item.hidden_id !== '').invoice_no || invoice_no_for_update || nextInvoiceNo;
//                     } else if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
//                     }

//                     // Execute update and insert sequentially
//                     updateInvoiceItems()
//                         .then(() => insertInvoiceItems(nextInvoiceNo))
//                         .then(() => {
//                             conn.release();
//                             res.status(200).json({ 
//                                 message: 'Invoice processed successfully', 
//                                 items: items 
//                             });
//                         })
//                         .catch(error => {
//                             conn.release();
//                             console.error('Error processing invoice:', error);
//                             res.status(500).json({ 
//                                 error: 'Error processing invoice',
//                                 message: error.message 
//                             });
//                         });
//                 });
//             });
//         })
//         .catch(error => {
//             console.error('Stock validation error:', error);
//             res.status(400).json({ 
//                 error: 'Stock validation failed',
//                 message: error.message 
//             });
//         });
// });

// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//     };

//     // Helper function to promisify MySQL queries
//     const queryAsync = (sql, params) => {
//         return new Promise((resolve, reject) => {
//             connection.query(sql, params, (error, results) => {
//                 if (error) return reject(error);
//                 resolve(results);
//             });
//         });
//     };

//     // Aggregate quantities by item_id
//     const itemQuantities = items.reduce((acc, item) => {
//         if (!item.item) return acc;
        
//         const key = item.item;
//         acc[key] = acc[key] || { 
//             item_id: item.item, 
//             item_name: item.item_name, 
//             total_quantity: 0, 
//             hidden_ids: [], 
//             quantities: [],
//             items: []
//         };
        
//         acc[key].total_quantity += parseFloat(item.quantity) || 0;
//         if (item.hidden_id) acc[key].hidden_ids.push({ id: item.hidden_id, quantity: parseFloat(item.quantity) });
//         acc[key].quantities.push(parseFloat(item.quantity));
//         acc[key].items.push(item);
        
//         return acc;
//     }, {});

//     const aggregatedItems = Object.values(itemQuantities);

//     // Process each item to allocate stock
//     const processItems = async () => {
//         try {
//             // Allocate stock for each item
//             for (const aggItem of aggregatedItems) {
//                 if (aggItem.hidden_ids.length > 0) continue; // Skip updates

//                 // Get available stock in FIFO order
//                 const stockQuery = `
//                     SELECT 
//                         s.id AS stock_id,
//                         s.invoice_no,
//                         s.rack_no,
//                         s.final_price,
//                         s.discount,
//                         ROUND(COALESCE(SUM(i.quantity), 0), 2) AS used_quantity,
//                         ROUND(s.quantity - COALESCE(SUM(i.quantity), 0), 2) AS remaining_quantity,
//                         s.stock_date AS expiry_date,
//                         s.item_id
//                     FROM 
//                         stock s
//                     LEFT JOIN 
//                         invoice_pharmacy i ON s.id = i.stock_id
//                     WHERE 
//                         s.item_id = ?
//                     GROUP BY 
//                         s.id
//                     HAVING 
//                         remaining_quantity > 0
//                     ORDER BY 
//                         s.stock_date ASC, s.id ASC`;

//                 const stockRows = await queryAsync(stockQuery, [aggItem.item_id]);
                
//                 if (stockRows.length === 0) {
//                     throw new Error(`No available stock found for item ${aggItem.item_name} (ID: ${aggItem.item_id})`);
//                 }

//                 let remainingQtyToAllocate = aggItem.total_quantity;
//                 const allocations = [];
                
//                 // Allocate stock in FIFO order
//                 for (const stock of stockRows) {
//                     if (remainingQtyToAllocate <= 0) break;
                    
//                     const availableQty = parseFloat(stock.remaining_quantity);
//                     const allocateQty = Math.min(availableQty, remainingQtyToAllocate);
                    
//                     allocations.push({
//                         stock_id: stock.stock_id,
//                         quantity: allocateQty,
//                         stock_data: stock
//                     });
                    
//                     remainingQtyToAllocate -= allocateQty;
//                 }

//                 if (remainingQtyToAllocate > 0) {
//                     throw new Error(`Insufficient stock for item ${aggItem.item_name} (ID: ${aggItem.item_id}). Requested: ${aggItem.total_quantity}, Available: ${aggItem.total_quantity - remainingQtyToAllocate}`);
//                 }

//                 // Distribute allocations back to original items
//                 let allocationIndex = 0;
//                 let currentAllocation = allocations[allocationIndex];
//                 let remainingInAllocation = currentAllocation ? currentAllocation.quantity : 0;
                
//                 for (const item of aggItem.items) {
//                     if (item.hidden_id) continue;
                    
//                     let itemQty = parseFloat(item.quantity);
                    
//                     while (itemQty > 0 && currentAllocation) {
//                         const allocate = Math.min(remainingInAllocation, itemQty);
                        
//                         // Update the original item with stock info
//                         item.stock_id = currentAllocation.stock_id;
//                         item.rack_no = currentAllocation.stock_data.rack_no;
//                         item.price = currentAllocation.stock_data.final_price;
//                         item.discount = currentAllocation.stock_data.discount;
                        
//                         itemQty -= allocate;
//                         remainingInAllocation -= allocate;
                        
//                         if (remainingInAllocation <= 0) {
//                             allocationIndex++;
//                             currentAllocation = allocations[allocationIndex];
//                             remainingInAllocation = currentAllocation ? currentAllocation.quantity : 0;
//                         }
//                     }
//                 }
//             }

//             // Get next invoice number
//             const invoiceResults = await queryAsync(
//                 "SELECT invoice_no FROM invoice_pharmacy ORDER BY invoice_no DESC LIMIT 1"
//             );
            
//             let nextInvoiceNo = invoiceResults.length ? invoiceResults[0].invoice_no + 1 : 1000;
//             if (items.some(item => item.hidden_id !== '')) {
//                 nextInvoiceNo = items.find(item => item.hidden_id !== '').invoice_no || invoice_no_for_update || nextInvoiceNo;
//             } else if (invoice_no_for_update) {
//                 nextInvoiceNo = invoice_no_for_update;
//             }

//             // Update existing items
//             const updateValues = items
//                 .filter(item => item.hidden_id !== '')
//                 .map(item => [
//                     item.hidden_id, item.item, item.price, item.quantity, item.discount,
//                     item.phone_no, item.full_name, item.age, item.stock_id, 
//                     item.gst, item.rate_after_discount, item.invoice_date, item.rack_no, 
//                     item.return_unit, item.total_return_amount, patient_id, doctor_id
//                 ]);

//             if (updateValues.length > 0) {
//                 let sql = 'UPDATE invoice_pharmacy SET ';
//                 const values = [];

//                 updateValues.forEach((data) => {
//                     const id = data[0];
//                     const fields = [
//                         'item', 'price', 'quantity', 'discount',
//                         'phone_no', 'full_name', 'age', 'stock_id',
//                         'gst', 'price_after_discount', 'invoice_date',
//                         'rack_no', 'return_unit', 'total_return_amount', 'patient_id', 'doctor_invoice_id'
//                     ];

//                     fields.forEach((field, idx) => {
//                         sql += `${field} = CASE WHEN id = ? THEN ? ELSE ${field} END, `;
//                         values.push(id, data[idx + 1]);
//                     });
//                 });

//                 sql = sql.slice(0, -2);
//                 sql += ' WHERE id IN (?)';
//                 values.push(updateValues.map(data => data[0]));

//                 await queryAsync(sql, values);
//             }

//             // Insert new items
//             const insertValues = items
//                 .filter(item => item.hidden_id === '')
//                 .map(item => [
//                     nextInvoiceNo, item.item, item.price, item.quantity, item.discount, 
//                     item.phone_no, item.full_name, item.age, item.stock_id, 
//                     item.rate_after_discount, formatDate(item.invoice_date), item.rack_no, patient_id, doctor_id
//                 ]);

//             if (insertValues.length > 0) {
//                 const insertSql = `INSERT INTO invoice_pharmacy (
//                     invoice_no, item, price, quantity, discount, 
//                     phone_no, full_name, age, stock_id, 
//                     price_after_discount, invoice_date, rack_no, patient_id, doctor_invoice_id
//                 ) VALUES ?`;

//                 await queryAsync(insertSql, [insertValues]);
                
//                 // Update items with invoice_no for response
//                 items.forEach(item => {
//                     item.invoice_no = nextInvoiceNo;
//                     item.price_after_discount = item.rate_after_discount;
//                 });
//             }

//             res.status(200).json({ 
//                 message: 'Invoice processed successfully', 
//                 items: items 
//             });

//         } catch (error) {
//             console.error('Error processing invoice:', error);
//             res.status(500).json({ 
//                 error: 'Error processing invoice',
//                 message: error.message 
//             });
//         }
//     };

//     // Start processing
//     processItems();
// });


// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     // Format date function
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     // Get a connection from the pool
//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         // Begin a transaction
//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             // Process each item for FIFO allocation
//             const processItems = async () => {
//                 try {
//                     const processedItems = [];
                    
//                     for (const originalItem of items) {
//                         if (originalItem.hidden_id) {
//                             processedItems.push(originalItem);
//                             continue;
//                         }

//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Get available stock in FIFO order
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS available_quantity,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 s.stock_date
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0)) > 0
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(stockQuery, [originalItem.item], (err, results) => {
//                                 if (err) reject(err);
//                                 else resolve(results);
//                             });
//                         });

//                         if (availableStocks.length === 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                         }

//                         // Calculate total available quantity
//                         const totalAvailable = availableStocks.reduce((sum, stock) => 
//                             sum + parseFloat(stock.available_quantity), 0);
                        
//                         if (totalAvailable < requiredQty) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                         }

//                         // FIFO allocation logic - create separate invoice items for each stock batch
//                         console.log(`Processing item ${originalItem.item_name} (${originalItem.item}), Required: ${requiredQty}`);
//                         console.log('Available stocks:', availableStocks.map(s => 
//                             `Stock ${s.stock_id}: ${s.available_quantity} units at ${s.final_price}`
//                         ));

//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
                            
//                             console.log(`Allocating ${allocateQty} units from stock ${stock.stock_id} (${availableQty} available)`);
                            
//                             // Create separate invoice item for each stock allocation
//                             const allocatedItem = {
//                                 ...originalItem,
//                                 stock_id: stock.stock_id,
//                                 price: stock.final_price,
//                                 discount: stock.discount || 0,
//                                 rack_no: stock.rack_no,
//                                 quantity: allocateQty,
//                                 rate_after_discount: stock.final_price * (1 - ((stock.discount || 0) / 100)),
//                                 hidden_id: undefined // Ensure this is a new item
//                             };

//                             processedItems.push(allocatedItem);
//                             remainingQty -= allocateQty;
//                         }

//                         console.log(`Finished processing ${originalItem.item_name}, remaining qty: ${remainingQty}`);
//                     }

//                     // Get next invoice number
//                     let nextInvoiceNo;
//                     if (items.some(item => item.hidden_id)) {
//                         nextInvoiceNo = items.find(item => item.hidden_id).invoice_no || invoice_no_for_update;
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // Process updates for existing items
//                     const updatePromises = processedItems
//                         .filter(item => item.hidden_id)
//                         .map(item => new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE invoice_pharmacy SET 
//                                     item = ?, price = ?, quantity = ?, discount = ?,
//                                     phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                     gst = ?, price_after_discount = ?, invoice_date = ?,
//                                     rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                     patient_id = ?, doctor_invoice_id = ?
//                                 WHERE id = ?`,
//                                 [
//                                     item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                     item.rack_no, item.return_unit, item.total_return_amount,
//                                     patient_id, doctor_id, item.hidden_id
//                                 ],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         }));

//                     await Promise.all(updatePromises);

//                     // Process inserts for new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
                    
//                     // Insert new invoice items
//                     if (newItems.length > 0) {
//                         const insertValues = newItems.map(item => [
//                             nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                             item.phone_no, item.full_name, item.age, item.stock_id,
//                             item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                             patient_id, doctor_id
//                         ]);

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [insertValues],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Note: Stock allocation tracking removed as we're using separate invoice items for each stock

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ 
//                                     error: 'Transaction commit failed.',
//                                     message: err.message 
//                                 });
//                             });
//                         }

//                         // Update response with invoice numbers (no need to clean stock_allocations)
//                         const responseItems = processedItems.map(item => ({
//                             ...item,
//                             invoice_no: nextInvoiceNo
//                         }));

//                         connection.release();
//                         res.status(200).json({
//                             message: 'Invoice processed successfully with FIFO allocation',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             // Start processing items
//             processItems();
//         });
//     });
// });



// Endpoint to insert or update pharmacy invoice
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     // Format date function
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     // Get a connection from the pool
//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         // Begin a transaction
//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             // Process each item for FIFO allocation
//             const processItems = async () => {
//                 try {
//                     const processedItems = [];
//                     let totalCOGS = 0; // Track COGS for the invoice

//                     for (const originalItem of items) {
//                         if (originalItem.hidden_id) {
//                             processedItems.push(originalItem);
//                             continue;
//                         }

//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Get available stock in FIFO order
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS available_quantity,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 s.stock_date
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0)) > 0
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(stockQuery, [originalItem.item], (err, results) => {
//                                 if (err) reject(err);
//                                 else resolve(results);
//                             });
//                         });

//                         if (availableStocks.length === 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                         }

//                         // Calculate total available quantity
//                         const totalAvailable = availableStocks.reduce((sum, stock) => 
//                             sum + parseFloat(stock.available_quantity), 0);
                        
//                         if (totalAvailable < requiredQty) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                         }

//                         // Allocate stock and calculate COGS
//                         const stockUpdates = []; // Track stock updates
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
//                             const itemCost = allocateQty * stock.final_price; // Cost for this allocation
//                             totalCOGS += itemCost; // Add to total COGS

//                             const allocatedItem = {
//                                 ...originalItem,
//                                 stock_id: stock.stock_id,
//                                 price: stock.final_price,
//                                 discount: stock.discount,
//                                 rack_no: stock.rack_no,
//                                 quantity: allocateQty,
//                                 rate_after_discount: stock.final_price * (1 - (stock.discount / 100)),
//                                 hidden_id: undefined
//                             };

//                             processedItems.push(allocatedItem);
//                             remainingQty -= allocateQty;

//                             // Track stock update
//                             stockUpdates.push({
//                                 stock_id: stock.stock_id,
//                                 allocated_qty: allocateQty,
//                                 remaining_qty: availableQty - allocateQty
//                             });
//                         }

//                         // Update stock quantities
//                         for (const update of stockUpdates) {
//                             await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     `UPDATE stock SET quantity = quantity - ? WHERE id = ?`,
//                                     [update.allocated_qty, update.stock_id],
//                                     (err, result) => {
//                                         if (err) reject(err);
//                                         else resolve(result);
//                                     }
//                                 );
//                             });
//                         }
//                     }

//                     // Get next invoice number
//                     let nextInvoiceNo;
//                     if (items.some(item => item.hidden_id)) {
//                         nextInvoiceNo = items.find(item => item.hidden_id).invoice_no || invoice_no_for_update;
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // Process updates for existing items
//                     const updatePromises = processedItems
//                         .filter(item => item.hidden_id)
//                         .map(item => new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE invoice_pharmacy SET 
//                                     item = ?, price = ?, quantity = ?, discount = ?,
//                                     phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                     gst = ?, price_after_discount = ?, invoice_date = ?,
//                                     rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                     patient_id = ?, doctor_invoice_id = ?
//                                 WHERE id = ?`,
//                                 [
//                                     item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                     item.rack_no, item.return_unit, item.total_return_amount,
//                                     patient_id, doctor_id, item.hidden_id
//                                 ],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         }));

//                     await Promise.all(updatePromises);

//                     // Process inserts for new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
//                     if (newItems.length > 0) {
//                         const insertValues = newItems.map(item => [
//                             nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                             item.phone_no, item.full_name, item.age, item.stock_id,
//                             item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                             patient_id, doctor_id
//                         ]);

//                         console.log(insertValues.price, "this is insert values");

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [insertValues],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ 
//                                     error: 'Transaction commit failed.',
//                                     message: err.message 
//                                 });
//                             });
//                         }

//                         // Fetch remaining stock for response
//                         const remainingStockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.item_id,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS remaining_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?`;
                        
//                         const remainingStockPromises = [...new Set(processedItems.map(item => item.item))].map(itemId => 
//                             new Promise((resolve, reject) => {
//                                 connection.query(remainingStockQuery, [itemId], (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve({ itemId, stocks: results });
//                                 });
//                             })
//                         );

//                         Promise.all(remainingStockPromises).then(remainingStocks => {
//                             connection.release();
//                             const responseItems = processedItems.map(item => ({
//                                 ...item,
//                                 invoice_no: nextInvoiceNo
//                             }));

//                             res.status(200).json({
//                                 message: 'Invoice processed successfully',
//                                 invoice_no: nextInvoiceNo,
//                                 items: responseItems,
//                                 cogs: totalCOGS,
//                                 remaining_stock: remainingStocks
//                             });
//                         }).catch(err => {
//                             connection.release();
//                             console.error('Error fetching remaining stock:', err);
//                             res.status(500).json({
//                                 error: 'Error fetching remaining stock',
//                                 message: err.message
//                             });
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             // Start processing items
//             processItems();
//         });
//     });
// });


// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     // Format date function
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     // Get a connection from the pool
//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         // Begin a transaction
//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             // Process each item for FIFO allocation
//             const processItems = async () => {
//                 try {
//                     const processedItems = [];
//                     let totalCOGS = 0; // Track COGS for the invoice

//                     for (const originalItem of items) {
//                         if (originalItem.hidden_id) {
//                             processedItems.push(originalItem);
//                             continue;
//                         }

//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Get available stock in FIFO order (without updating stock table)
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.quantity AS total_quantity,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 s.stock_date,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS available_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0)) > 0
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(stockQuery, [originalItem.item], (err, results) => {
//                                 if (err) reject(err);
//                                 else resolve(results);
//                             });
//                         });

//                         if (availableStocks.length === 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                         }

//                         // Calculate total available quantity
//                         const totalAvailable = availableStocks.reduce((sum, stock) => 
//                             sum + parseFloat(stock.available_quantity), 0);
                        
//                         if (totalAvailable < requiredQty) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                         }

//                         // Allocate stock and calculate COGS
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
//                             const itemCost = allocateQty * stock.final_price; // Cost for this allocation
//                             totalCOGS += itemCost; // Add to total COGS

//                             const allocatedItem = {
//                                 ...originalItem,
//                                 stock_id: stock.stock_id,
//                                 price: stock.final_price,
//                                 discount: stock.discount,
//                                 rack_no: stock.rack_no,
//                                 quantity: allocateQty,
//                                 rate_after_discount: stock.final_price * (1 - (stock.discount / 100)),
//                                 hidden_id: undefined
//                             };

//                             processedItems.push(allocatedItem);
//                             remainingQty -= allocateQty;
//                         }
//                     }

//                     // Get next invoice number
//                     let nextInvoiceNo;
//                     if (items.some(item => item.hidden_id)) {
//                         nextInvoiceNo = items.find(item => item.hidden_id).invoice_no || invoice_no_for_update;
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // Process updates for existing items
//                     const updatePromises = processedItems
//                         .filter(item => item.hidden_id)
//                         .map(item => new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE invoice_pharmacy SET 
//                                     item = ?, price = ?, quantity = ?, discount = ?,
//                                     phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                     gst = ?, price_after_discount = ?, invoice_date = ?,
//                                     rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                     patient_id = ?, doctor_invoice_id = ?
//                                 WHERE id = ?`,
//                                 [
//                                     item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                     item.rack_no, item.return_unit, item.total_return_amount,
//                                     patient_id, doctor_id, item.hidden_id
//                                 ],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         }));

//                     await Promise.all(updatePromises);

//                     // Process inserts for new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
//                     if (newItems.length > 0) {
//                         const insertValues = newItems.map(item => [
//                             nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                             item.phone_no, item.full_name, item.age, item.stock_id,
//                             item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                             patient_id, doctor_id
//                         ]);

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [insertValues],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ 
//                                     error: 'Transaction commit failed.',
//                                     message: err.message 
//                                 });
//                             });
//                         }

//                         // Fetch remaining stock for response (calculated from invoice_pharmacy)
//                         const remainingStockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.item_id,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS remaining_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?`;
                        
//                         const remainingStockPromises = [...new Set(processedItems.map(item => item.item))].map(itemId => 
//                             new Promise((resolve, reject) => {
//                                 connection.query(remainingStockQuery, [itemId], (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve({ itemId, stocks: results });
//                                 });
//                             })
//                         );

//                         Promise.all(remainingStockPromises).then(remainingStocks => {
//                             connection.release();
//                             const responseItems = processedItems.map(item => ({
//                                 ...item,
//                                 invoice_no: nextInvoiceNo
//                             }));

//                             res.status(200).json({
//                                 message: 'Invoice processed successfully',
//                                 invoice_no: nextInvoiceNo,
//                                 items: responseItems,
//                                 cogs: totalCOGS,
//                                 remaining_stock: remainingStocks
//                             });
//                         }).catch(err => {
//                             connection.release();
//                             console.error('Error fetching remaining stock:', err);
//                             res.status(500).json({
//                                 error: 'Error fetching remaining stock',
//                                 message: err.message
//                             });
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             // Start processing items
//             processItems();
//         });
//     });
// });



// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     // Format date function
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     // Get a connection from the pool
//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         // Begin a transaction
//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             // Process each item for FIFO allocation
//             const processItems = async () => {
//                 try {
//                     const processedItems = [];
//                     let totalCOGS = 0; // Track COGS for the invoice

//                     // First handle updates (we need to process them first to release any allocated quantities)
//                     const updatePromises = items
//                         .filter(item => item.hidden_id)
//                         .map(async (originalItem) => {
//                             // First get the existing invoice item to check if item was changed
//                             const existingItem = await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     `SELECT * FROM invoice_pharmacy WHERE id = ?`,
//                                     [originalItem.hidden_id],
//                                     (err, results) => {
//                                         if (err) reject(err);
//                                         else resolve(results[0]);
//                                     }
//                                 );
//                             });

//                             // If the item hasn't changed, we can just update other fields
//                             if (existingItem.item == originalItem.item) {
//                                 const updatedItem = {
//                                     ...originalItem,
//                                     stock_id: existingItem.stock_id,
//                                     price: existingItem.price,
//                                     discount: existingItem.discount,
//                                     rack_no: existingItem.rack_no
//                                 };
//                                 processedItems.push(updatedItem);
//                                 return;
//                             }

//                             // Item has changed - we need to do FIFO allocation for the new item
//                             const requiredQty = parseFloat(originalItem.quantity);
//                             let remainingQty = requiredQty;

//                             // Get available stock in FIFO order for the NEW item
//                             const stockQuery = `
//                                 SELECT 
//                                     s.id AS stock_id,
//                                     s.quantity AS total_quantity,
//                                     s.final_price,
//                                     s.discount,
//                                     s.rack_no,
//                                     s.stock_date,
//                                     s.quantity - IFNULL((
//                                         SELECT SUM(quantity) 
//                                         FROM invoice_pharmacy 
//                                         WHERE stock_id = s.id AND id != ?
//                                     ), 0) AS available_quantity
//                                 FROM 
//                                     stock s
//                                 WHERE 
//                                     s.item_id = ?
//                                     AND (s.quantity - IFNULL((
//                                         SELECT SUM(quantity) 
//                                         FROM invoice_pharmacy 
//                                         WHERE stock_id = s.id AND id != ?
//                                     ), 0)) > 0
//                                 ORDER BY 
//                                     s.stock_date ASC, 
//                                     s.id ASC`;

//                             const availableStocks = await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     stockQuery, 
//                                     [originalItem.hidden_id, originalItem.item, originalItem.hidden_id], 
//                                     (err, results) => {
//                                         if (err) reject(err);
//                                         else resolve(results);
//                                     }
//                                 );
//                             });

//                             if (availableStocks.length === 0) {
//                                 throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                             }

//                             // Calculate total available quantity
//                             const totalAvailable = availableStocks.reduce((sum, stock) => 
//                                 sum + parseFloat(stock.available_quantity), 0);
                            
//                             if (totalAvailable < requiredQty) {
//                                 throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                             }

//                             // Allocate stock and calculate COGS
//                             for (const stock of availableStocks) {
//                                 if (remainingQty <= 0) break;

//                                 const availableQty = parseFloat(stock.available_quantity);
//                                 const allocateQty = Math.min(availableQty, remainingQty);
//                                 const itemCost = allocateQty * stock.final_price;
//                                 totalCOGS += itemCost;

//                                 const allocatedItem = {
//                                     ...originalItem,
//                                     stock_id: stock.stock_id,
//                                     price: stock.final_price,
//                                     discount: stock.discount,
//                                     rack_no: stock.rack_no,
//                                     quantity: allocateQty,
//                                     rate_after_discount: stock.final_price * (1 - (stock.discount / 100)),
//                                     hidden_id: originalItem.hidden_id // Keep the hidden_id for update
//                                 };

//                                 processedItems.push(allocatedItem);
//                                 remainingQty -= allocateQty;
//                             }
//                         });

//                     await Promise.all(updatePromises);

//                     // Now handle new items
//                     for (const originalItem of items.filter(item => !item.hidden_id)) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Get available stock in FIFO order
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.quantity AS total_quantity,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 s.stock_date,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS available_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0)) > 0
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(stockQuery, [originalItem.item], (err, results) => {
//                                 if (err) reject(err);
//                                 else resolve(results);
//                             });
//                         });

//                         if (availableStocks.length === 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                         }

//                         // Calculate total available quantity
//                         const totalAvailable = availableStocks.reduce((sum, stock) => 
//                             sum + parseFloat(stock.available_quantity), 0);
                        
//                         if (totalAvailable < requiredQty) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                         }

//                         // Allocate stock and calculate COGS
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
//                             const itemCost = allocateQty * stock.final_price;
//                             totalCOGS += itemCost;

//                             const allocatedItem = {
//                                 ...originalItem,
//                                 stock_id: stock.stock_id,
//                                 // price: stock.final_price,
//                                 // discount: stock.discount,
//                                 // rack_no: stock.rack_no,
//                                 // quantity: allocateQty,
//                                 // rate_after_discount: stock.final_price * (1 - (stock.discount / 100)),
//                                 hidden_id: undefined
//                             };

//                             processedItems.push(allocatedItem);
//                             remainingQty -= allocateQty;
//                         }
//                     }

//                     // Get next invoice number
//                     let nextInvoiceNo;
//                     if (items.some(item => item.hidden_id)) {
//                         nextInvoiceNo = items.find(item => item.hidden_id).invoice_no || invoice_no_for_update;
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // Process updates for existing items
//                     const finalUpdatePromises = processedItems
//                         .filter(item => item.hidden_id)
//                         .map(item => new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE invoice_pharmacy SET 
//                                     item = ?, price = ?, quantity = ?, discount = ?,
//                                     phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                     gst = ?, price_after_discount = ?, invoice_date = ?,
//                                     rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                     patient_id = ?, doctor_invoice_id = ?
//                                 WHERE id = ?`,
//                                 [
//                                     item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                     item.rack_no, item.return_unit, item.total_return_amount,
//                                     patient_id, doctor_id, item.hidden_id
//                                 ],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         }));

//                     await Promise.all(finalUpdatePromises);

//                     // Process inserts for new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
//                     if (newItems.length > 0) {

//                         newItems.forEach(item => {
//                             console.log('Item price:', item.price);
//                         });


//                         const insertValues = newItems.map(item => [
//                             nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                             item.phone_no, item.full_name, item.age, item.stock_id,
//                             item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                             patient_id, doctor_id
//                         ]);

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [insertValues],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ 
//                                     error: 'Transaction commit failed.',
//                                     message: err.message 
//                                 });
//                             });
//                         }

//                         // Fetch remaining stock for response
//                         const remainingStockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.item_id,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS remaining_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?`;
                        
//                         const remainingStockPromises = [...new Set(processedItems.map(item => item.item))].map(itemId => 
//                             new Promise((resolve, reject) => {
//                                 connection.query(remainingStockQuery, [itemId], (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve({ itemId, stocks: results });
//                                 });
//                             })
//                         );

//                         Promise.all(remainingStockPromises).then(remainingStocks => {
//                             connection.release();
//                             const responseItems = processedItems.map(item => ({
//                                 ...item,
//                                 invoice_no: nextInvoiceNo
//                             }));

//                             res.status(200).json({
//                                 message: 'Invoice processed successfully',
//                                 invoice_no: nextInvoiceNo,
//                                 items: responseItems,
//                                 cogs: totalCOGS,
//                                 remaining_stock: remainingStocks
//                             });
//                         }).catch(err => {
//                             connection.release();
//                             console.error('Error fetching remaining stock:', err);
//                             res.status(500).json({
//                                 error: 'Error fetching remaining stock',
//                                 message: err.message
//                             });
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             // Start processing items
//             processItems();
//         });
//     });
// });



//this code is correct dont delete it please..........
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     // Format date function
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     // Get a connection from the pool
//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         // Begin a transaction
//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             // Process each item for FIFO allocation
//             const processItems = async () => {
//                 try {
//                     const processedItems = [];
//                     let totalCOGS = 0; // Track COGS for the invoice

//                     // First handle updates (we need to process them first to release any allocated quantities)
//                     const updatePromises = items
//                         .filter(item => item.hidden_id)
//                         .map(async (originalItem) => {
//                             // First get the existing invoice item to check if item was changed
//                             const existingItem = await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     `SELECT * FROM invoice_pharmacy WHERE id = ?`,
//                                     [originalItem.hidden_id],
//                                     (err, results) => {
//                                         if (err) reject(err);
//                                         else resolve(results[0]);
//                                     }
//                                 );
//                             });

//                             // If the item hasn't changed, we can just update other fields
//                             if (existingItem.item == originalItem.item) {
//                                 const updatedItem = {
//                                     ...originalItem,
//                                     stock_id: existingItem.stock_id,
//                                     price: existingItem.price,
//                                     discount: existingItem.discount,
//                                     rack_no: existingItem.rack_no
//                                 };
//                                 processedItems.push(updatedItem);
//                                 return;
//                             }

//                             // Item has changed - we need to do FIFO allocation for the new item
//                             const requiredQty = parseFloat(originalItem.quantity);
//                             let remainingQty = requiredQty;

//                             // Get available stock in FIFO order for the NEW item
//                             const stockQuery = `
//                                 SELECT 
//                                     s.id AS stock_id,
//                                     s.quantity AS total_quantity,
//                                     s.final_price,
//                                     s.discount,
//                                     s.rack_no,
//                                     s.stock_date,
//                                     s.quantity - IFNULL((
//                                         SELECT SUM(quantity) 
//                                         FROM invoice_pharmacy 
//                                         WHERE stock_id = s.id AND id != ?
//                                     ), 0) AS available_quantity
//                                 FROM 
//                                     stock s
//                                 WHERE 
//                                     s.item_id = ?
//                                     AND (s.quantity - IFNULL((
//                                         SELECT SUM(quantity) 
//                                         FROM invoice_pharmacy 
//                                         WHERE stock_id = s.id AND id != ?
//                                     ), 0)) > 0
//                                 ORDER BY 
//                                     s.stock_date ASC, 
//                                     s.id ASC`;

//                             const availableStocks = await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     stockQuery, 
//                                     [originalItem.hidden_id, originalItem.item, originalItem.hidden_id], 
//                                     (err, results) => {
//                                         if (err) reject(err);
//                                         else resolve(results);
//                                     }
//                                 );
//                             });

//                             if (availableStocks.length === 0) {
//                                 throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                             }

//                             // Calculate total available quantity
//                             const totalAvailable = availableStocks.reduce((sum, stock) => 
//                                 sum + parseFloat(stock.available_quantity), 0);
                            
//                             if (totalAvailable < requiredQty) {
//                                 throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                             }

//                             // Allocate stock and calculate COGS
//                             for (const stock of availableStocks) {
//                                 if (remainingQty <= 0) break;

//                                 const availableQty = parseFloat(stock.available_quantity);
//                                 const allocateQty = Math.min(availableQty, remainingQty);
//                                 const itemCost = allocateQty * stock.final_price;
//                                 totalCOGS += itemCost;

//                                 const allocatedItem = {
//                                     ...originalItem,
//                                     stock_id: stock.stock_id,
//                                     price: stock.final_price,
//                                     discount: stock.discount,
//                                     rack_no: stock.rack_no,
//                                     quantity: allocateQty,
//                                     rate_after_discount: stock.final_price * (1 - (stock.discount / 100)),
//                                     hidden_id: originalItem.hidden_id // Keep the hidden_id for update
//                                 };

//                                 processedItems.push(allocatedItem);
//                                 remainingQty -= allocateQty;
//                             }
//                         });

//                     await Promise.all(updatePromises);

//                     // Now handle new items
//                     for (const originalItem of items.filter(item => !item.hidden_id)) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Get available stock in FIFO order
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.quantity AS total_quantity,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 s.stock_date,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS available_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0)) > 0
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(stockQuery, [originalItem.item], (err, results) => {
//                                 if (err) reject(err);
//                                 else resolve(results);
//                             });
//                         });

//                         if (availableStocks.length === 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name} (ID: ${originalItem.item})`);
//                         }

//                         // Calculate total available quantity
//                         const totalAvailable = availableStocks.reduce((sum, stock) => 
//                             sum + parseFloat(stock.available_quantity), 0);
                        
//                         if (totalAvailable < requiredQty) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name}. Needed: ${requiredQty}, Available: ${totalAvailable}`);
//                         }

//                         // Allocate stock and calculate COGS
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
//                             const itemCost = allocateQty * stock.final_price;
//                             totalCOGS += itemCost;

//                             const allocatedItem = {
//                                 ...originalItem,
//                                 stock_id: stock.stock_id,
//                                 price: stock.final_price,
//                                 discount: stock.discount,
//                                 rack_no: stock.rack_no,
//                                 quantity: allocateQty,
//                                 rate_after_discount: stock.final_price * (1 - (stock.discount / 100)),
//                                 hidden_id: undefined
//                             };

//                             processedItems.push(allocatedItem);
//                             remainingQty -= allocateQty;
//                         }
//                     }

//                     // Get next invoice number
//                     let nextInvoiceNo;
//                     if (items.some(item => item.hidden_id)) {
//                         nextInvoiceNo = items.find(item => item.hidden_id).invoice_no || invoice_no_for_update;
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // Process updates for existing items
//                     const finalUpdatePromises = processedItems
//                         .filter(item => item.hidden_id)
//                         .map(item => new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE invoice_pharmacy SET 
//                                     item = ?, price = ?, quantity = ?, discount = ?,
//                                     phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                     gst = ?, price_after_discount = ?, invoice_date = ?,
//                                     rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                     patient_id = ?, doctor_invoice_id = ?
//                                 WHERE id = ?`,
//                                 [
//                                     item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                     item.rack_no, item.return_unit, item.total_return_amount,
//                                     patient_id, doctor_id, item.hidden_id
//                                 ],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         }));

//                     await Promise.all(finalUpdatePromises);

//                     // Process inserts for new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
//                     if (newItems.length > 0) {
//                         const insertValues = newItems.map(item => [
//                             nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                             item.phone_no, item.full_name, item.age, item.stock_id,
//                             item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                             patient_id, doctor_id
//                         ]);

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [insertValues],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ 
//                                     error: 'Transaction commit failed.',
//                                     message: err.message 
//                                 });
//                             });
//                         }

//                         // Fetch remaining stock for response
//                         const remainingStockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.item_id,
//                                 s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) AS remaining_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?`;
                        
//                         const remainingStockPromises = [...new Set(processedItems.map(item => item.item))].map(itemId => 
//                             new Promise((resolve, reject) => {
//                                 connection.query(remainingStockQuery, [itemId], (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve({ itemId, stocks: results });
//                                 });
//                             })
//                         );

//                         Promise.all(remainingStockPromises).then(remainingStocks => {
//                             connection.release();
//                             const responseItems = processedItems.map(item => ({
//                                 ...item,
//                                 invoice_no: nextInvoiceNo
//                             }));

//                             res.status(200).json({
//                                 message: 'Invoice processed successfully',
//                                 invoice_no: nextInvoiceNo,
//                                 items: responseItems,
//                                 cogs: totalCOGS,
//                                 remaining_stock: remainingStocks
//                             });
//                         }).catch(err => {
//                             connection.release();
//                             console.error('Error fetching remaining stock:', err);
//                             res.status(500).json({
//                                 error: 'Error fetching remaining stock',
//                                 message: err.message
//                             });
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             // Start processing items
//             processItems();
//         });
//     });
// });


// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     const processedItems = [];
//                     let totalCOGS = 0;
                    
//                     // Track exhausted stock batches during this invoice processing
//                     const exhaustedStocks = new Set();
//                     // Track temporary allocations during processing
//                     const tempAllocations = new Map(); // {stock_id: allocatedQty}

//                     // Process items in order
//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Get available stock in FIFO order, excluding exhausted batches
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.quantity AS total_quantity,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 s.stock_date,
//                                 (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) - IFNULL(?, 0)) AS available_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND (s.quantity - IFNULL((
//                                     SELECT SUM(quantity) 
//                                     FROM invoice_pharmacy 
//                                     WHERE stock_id = s.id
//                                 ), 0) - IFNULL(?, 0)) > 0
//                                 ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 stockQuery, 
//                                 [
//                                     tempAllocations.get(originalItem.item) || 0,
//                                     originalItem.item,
//                                     tempAllocations.get(originalItem.item) || 0
//                                 ], 
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });

//                         if (availableStocks.length === 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name || originalItem.item} (ID: ${originalItem.item})`);
//                         }

//                         // Allocate stock
//                         const allocations = [];
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
                            
//                             allocations.push({
//                                 stock_id: stock.stock_id,
//                                 allocateQty: allocateQty,
//                                 price: stock.final_price,
//                                 discount: stock.discount,
//                                 rack_no: stock.rack_no
//                             });

//                             // Track temporary allocation
//                             if (!tempAllocations.has(stock.stock_id)) {
//                                 tempAllocations.set(stock.stock_id, 0);
//                             }
//                             tempAllocations.set(stock.stock_id, tempAllocations.get(stock.stock_id) + allocateQty);
                            
//                             // Mark stock as exhausted if fully allocated
//                             if (allocateQty >= availableQty) {
//                                 exhaustedStocks.add(stock.stock_id);
//                             }
                            
//                             remainingQty -= allocateQty;
//                         }

//                         if (remainingQty > 0) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Needed: ${requiredQty}, Available: ${requiredQty - remainingQty}`);
//                         }

//                         // Process allocations
//                         for (const alloc of allocations) {
//                             const itemCost = alloc.allocateQty * alloc.price;
//                             totalCOGS += itemCost;

//                             const allocatedItem = {
//                                 ...originalItem,
//                                 stock_id: alloc.stock_id,
//                                 price: alloc.price,
//                                 discount: alloc.discount,
//                                 rack_no: alloc.rack_no,
//                                 quantity: alloc.allocateQty,
//                                 rate_after_discount: alloc.price * (1 - (alloc.discount / 100)),
//                                 hidden_id: originalItem.hidden_id
//                             };

//                             processedItems.push(allocatedItem);
//                         }
//                     }

//                     // Get next invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // Process updates for existing items
//                     const updatePromises = processedItems
//                         .filter(item => item.hidden_id)
//                         .map(item => new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE invoice_pharmacy SET 
//                                     item = ?, price = ?, quantity = ?, discount = ?,
//                                     phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                     gst = ?, price_after_discount = ?, invoice_date = ?,
//                                     rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                     patient_id = ?, doctor_invoice_id = ?
//                                 WHERE id = ?`,
//                                 [
//                                     item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                     item.rack_no, item.return_unit, item.total_return_amount,
//                                     patient_id, doctor_id, item.hidden_id
//                                 ],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         }));

//                     await Promise.all(updatePromises);

//                     // Process inserts for new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
//                     if (newItems.length > 0) {
//                         const insertValues = newItems.map(item => [
//                             nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                             item.phone_no, item.full_name, item.age, item.stock_id,
//                             item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                             patient_id, doctor_id
//                         ]);

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [insertValues],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ 
//                                     error: 'Transaction commit failed.',
//                                     message: err.message 
//                                 });
//                             });
//                         }

//                         connection.release();
//                         const responseItems = processedItems.map(item => ({
//                             ...item,
//                             invoice_no: nextInvoiceNo
//                         }));

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: totalCOGS
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });


// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     if (invoice_no_for_update) {
//                         // Get current items for this invoice
//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });

//                         // Release stock from items that are being removed or modified
//                         for (const existingItem of existingItems) {
//                             const updatedItem = items.find(item => item.hidden_id == existingItem.id);
                            
//                             if (!updatedItem || updatedItem.item != existingItem.item) {
//                                 // Item removed or changed - release all allocated stock
//                                 await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                         [existingItem.quantity, existingItem.stock_id],
//                                         (err) => err ? reject(err) : resolve()
//                                     );
//                                 });
//                             } else if (parseFloat(updatedItem.quantity) < existingItem.quantity) {
//                                 // Quantity reduced - release the difference
//                                 const diff = existingItem.quantity - parseFloat(updatedItem.quantity);
//                                 await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                         [diff, existingItem.stock_id],
//                                         (err) => err ? reject(err) : resolve()
//                                     );
//                                 });
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items (both new and updated)
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         let remainingQty = requiredQty;

//                         // Check if this is an existing item that's keeping the same stock
//                         const existingItem = existingItems.find(item => item.id == originalItem.hidden_id);
//                         if (existingItem && existingItem.item == originalItem.item) {
//                             if (requiredQty <= existingItem.quantity) {
//                                 // Quantity is same or reduced (already handled stock release)
//                                 processedItems.push({
//                                     ...originalItem,
//                                     stock_id: existingItem.stock_id,
//                                     rate_after_discount: originalItem.price * (1 - (originalItem.discount / 100))
//                                 });
//                                 continue;
//                             } else {
//                                 // Quantity increased - we need more stock
//                                 remainingQty = requiredQty - existingItem.quantity;
//                             }
//                         }

//                         // Get available stock in FIFO order
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND s.stock_status = 'In Stock'
//                                 AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                 ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                             ORDER BY 
//                                 s.date_of_expiry ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 stockQuery, 
//                                 [originalItem.item], 
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });

//                         if (availableStocks.length === 0 && remainingQty > 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name || originalItem.item}`);
//                         }

//                         // Allocate stock
//                         const allocations = [];
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
                            
//                             allocations.push({
//                                 stock_id: stock.stock_id,
//                                 allocateQty: allocateQty,
//                                 price: stock.final_price,
//                                 discount: stock.discount,
//                                 rack_no: stock.rack_no
//                             });

//                             // Reserve the stock
//                             await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                     [allocateQty, stock.stock_id],
//                                     (err) => err ? reject(err) : resolve()
//                                 );
//                             });
                            
//                             if (allocateQty >= availableQty) {
//                                 exhaustedStocks.add(stock.stock_id);
//                             }
                            
//                             remainingQty -= allocateQty;
//                         }

//                         if (remainingQty > 0) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}`);
//                         }

//                         // Create invoice items
//                         for (const alloc of allocations) {
//                             const itemCost = alloc.allocateQty * alloc.price;
//                             totalCOGS += itemCost;

//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: alloc.stock_id,
//                                 // price: alloc.price,
//                                 discount: alloc.discount,
//                                 rack_no: alloc.rack_no,
//                                 quantity: alloc.allocateQty,
//                                 // rate_after_discount: alloc.price * (1 - (alloc.discount / 100))
//                             });
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete items that were removed
//                         const keptIds = items.filter(i => i.hidden_id).map(i => i.hidden_id);
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ? AND id NOT IN (?)',
//                                 [nextInvoiceNo, keptIds.length ? keptIds : ['0']],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Update existing items
//                     // const updatePromises = processedItems
//                     //     .filter(item => item.hidden_id)
//                     //     .map(item => new Promise((resolve, reject) => {
//                     //         connection.query(
//                     //             `UPDATE invoice_pharmacy SET 
//                     //                 item = ?, price = ?, quantity = ?, discount = ?,
//                     //                 phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                     //                 gst = ?, price_after_discount = ?, invoice_date = ?,
//                     //                 rack_no = ?, return_unit = ?, total_return_amount = ?,
//                     //                 patient_id = ?, doctor_invoice_id = ?
//                     //             WHERE id = ?`,
//                     //             [
//                     //                 item.item, item.price, item.quantity, item.discount,
//                     //                 item.phone_no, item.full_name, item.age, item.stock_id,
//                     //                 item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                     //                 item.rack_no, item.return_unit, item.total_return_amount,
//                     //                 patient_id, doctor_id, item.hidden_id
//                     //             ],
//                     //             (err, result) => {
//                     //                 if (err) reject(err);
//                     //                 else resolve(result);
//                     //             }
//                     //         );
//                     //     }));

//                     // await Promise.all(updatePromises);


//                                             const updatePromises = processedItems
//                             .filter(item => item.hidden_id)
//                             .map(item => {
//                                 // Find the original item to get the full quantity
//                                 const originalItem = items.find(i => i.hidden_id == item.hidden_id);
//                                 const quantityToUse = originalItem ? parseFloat(originalItem.quantity) : item.quantity;

//                                 return new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `UPDATE invoice_pharmacy SET 
//                                             item = ?, price = ?, quantity = ?, discount = ?,
//                                             phone_no = ?, full_name = ?, age = ?, stock_id = ?,
//                                             gst = ?, price_after_discount = ?, invoice_date = ?,
//                                             rack_no = ?, return_unit = ?, total_return_amount = ?,
//                                             patient_id = ?, doctor_invoice_id = ?
//                                         WHERE id = ?`,
//                                         [
//                                             item.item, item.price, quantityToUse, item.discount,
//                                             item.phone_no, item.full_name, item.age, item.stock_id,
//                                             item.gst, item.rate_after_discount, formatDate(item.invoice_date),
//                                             item.rack_no, item.return_unit, item.total_return_amount,
//                                             patient_id, doctor_id, item.hidden_id
//                                         ],
//                                         (err, result) => {
//                                             if (err) reject(err);
//                                             else resolve(result);
//                                         }
//                                     );
//                                 });
//                             });

//                         await Promise.all(updatePromises);

//                     // STEP 5: Insert new items
//                     const newItems = processedItems.filter(item => !item.hidden_id);
//                     if (newItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id
//                                 ) VALUES ?`,
//                                 [newItems.map(item => [
//                                     nextInvoiceNo, item.item, item.price, item.quantity, item.discount,
//                                     item.phone_no, item.full_name, item.age, item.stock_id,
//                                     item.rate_after_discount, formatDate(item.invoice_date), item.rack_no,
//                                     patient_id, doctor_id
//                                 ])],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     // connection.commit(err => {
//                     //     if (err) {
//                     //         return connection.rollback(() => {
//                     //             connection.release();
//                     //             console.error('Commit error:', err);
//                     //             res.status(500).send({ error: 'Transaction commit failed.' });
//                     //         });
//                     //     }

//                     //     connection.release();
//                     //     res.status(200).json({
//                     //         message: 'Invoice processed successfully',
//                     //         invoice_no: nextInvoiceNo,
//                     //         items: processedItems.map(item => ({
//                     //             ...item,
//                     //             invoice_no: nextInvoiceNo
//                     //         })),
//                     //         cogs: totalCOGS
//                     //     });
//                     // });


//                     connection.commit(err => {
//                     if (err) {
//                         return connection.rollback(() => {
//                             connection.release();
//                             console.error('Commit error:', err);
//                             res.status(500).send({ error: 'Transaction commit failed.' });
//                         });
//                     }

//                     connection.release();
                    
//                     // Map the response items to include original quantities
//                     const responseItems = items.map(requestItem => {
//                         // Find the processed item (if it exists)
//                         const processedItem = processedItems.find(pItem => 
//                             pItem.hidden_id === requestItem.hidden_id || 
//                             pItem.item === requestItem.item
//                         );
                        
//                         return {
//                             ...requestItem,  // Start with the original request item
//                             ...(processedItem || {}),  // Merge with processed item data
//                             invoice_no: nextInvoiceNo,
//                             // Ensure we use the original quantity from the request
//                             quantity: parseFloat(requestItem.quantity),
//                             // Calculate rate after discount if not already present
//                             rate_after_discount: requestItem.rate_after_discount || 
//                                             (requestItem.price * (1 - (requestItem.discount / 100)))
//                         };
//                     });

//                     res.status(200).json({
//                         message: 'Invoice processed successfully',
//                         invoice_no: nextInvoiceNo,
//                         items: responseItems,
//                         cogs: totalCOGS
//                     });
//                 });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });




//this is accurate code for invoice
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;


//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total=req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const phone_no_type = req.body.phone_no_type;


//     // console.log(items, "these are items");

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     if (invoice_no_for_update) {
//                         // Get current items for this invoice
//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });

//                         // Release ALL allocated stock from existing items
//                         for (const existingItem of existingItems) {
//                             if (existingItem.stock_id !== 0) { // Skip non-stock items
//                             await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                     [existingItem.quantity, existingItem.stock_id],
//                                     (err) => err ? reject(err) : resolve()
//                                 );
//                             });
//                         }
//                         }
//                     }

//                     // STEP 2: Process all items fresh following FIFO
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                          const isNonStockItem = originalItem.stock_type === 'Non Stock Item';

//                          //this if I created from return item if any item quantity is 0 then it should not deleted
//                          if (isNonStockItem || parseFloat(originalItem.quantity) === 0) {
//                             //this is correct If 
//                             //  if (isNonStockItem) {
//         // For non-stock items, just add to processed items with stock_id = 0
//                                 processedItems.push({
//                                     ...originalItem,
//                                     stock_id: (isNonStockItem ? 0 : originalItem.stock_id), // Set stock_id to 0 for non-stock items
//                                     rack_no: rack_no || null,
//                                     quantity: requiredQty
//                                 });
//                                 continue; // Skip stock allocation for this item
//                             }
//                         // Get available stock in strict FIFO order (by expiry date then stock ID)
//                         const stockQuery = `
//                             SELECT 
//                                 s.id AS stock_id,
//                                 s.final_price,
//                                 s.discount,
//                                 s.rack_no,
//                                 (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                             FROM 
//                                 stock s
//                             WHERE 
//                                 s.item_id = ?
//                                 AND s.stock_status = 'In Stock'
//                                 AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                 ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                             ORDER BY 
//                                 s.stock_date ASC, 
//                                 s.id ASC`;

//                         const availableStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 stockQuery, 
//                                 [originalItem.item], 
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });

//                         if (availableStocks.length === 0 && requiredQty > 0) {
//                             throw new Error(`No available stock for item ${originalItem.item_name || originalItem.item}`);
//                         }

//                         // Allocate stock following strict FIFO
//                         const allocations = [];
//                         let remainingQty = requiredQty;
                        
//                         for (const stock of availableStocks) {
//                             if (remainingQty <= 0) break;

//                             const availableQty = parseFloat(stock.available_quantity);
//                             const allocateQty = Math.min(availableQty, remainingQty);
                            
//                             allocations.push({
//                                 stock_id: stock.stock_id,
//                                 allocateQty: allocateQty,
//                                 price: stock.final_price,
//                                 discount: stock.discount,
//                                 rack_no: stock.rack_no
//                             });

//                             // Reserve the stock
//                             await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                     [allocateQty, stock.stock_id],
//                                     (err) => err ? reject(err) : resolve()
//                                 );
//                             });
                            
//                             if (allocateQty >= availableQty) {
//                                 exhaustedStocks.add(stock.stock_id);
//                             }
                            
//                             remainingQty -= allocateQty;
//                         }

//                         if (remainingQty > 0) {
//                             throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}`);
//                         }

//                         // Create invoice items
//                         for (const alloc of allocations) {
//                             const itemCost = alloc.allocateQty * alloc.price;
//                             totalCOGS += itemCost;

//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: alloc.stock_id,
//                                 // discount: alloc.discount,
//                                 rack_no: alloc.rack_no,
//                                 quantity: alloc.allocateQty,
//                                 // rate_after_discount: alloc.price * (1 - (alloc.discount / 100))
//                             });
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items (we'll recreate them fresh)
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => {
//                                     if (err) reject(err);
//                                     else resolve(results);
//                                 }
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // console.log(rack_no, "these are racks");

//                     // STEP 4: Insert all items (both new and updated)
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, grand_total, delivery_date, 
//                                     book_id, phone_no_type
//                                 ) VALUES ?`,
//                                 [processedItems.map(item => [
//                                     nextInvoiceNo, 
//                                     item.item, 
//                                     item.price, 
//                                     item.quantity, 
//                                     item.discount,
//                                     item.phone_no, 
//                                     item.full_name, 
//                                     item.age, 
//                                     item.stock_id || 0,
//                                     item.stock_type || null, // Include stock_type in the insert
//                                     item.rate_after_discount, 
//                                     formatDate(item.invoice_date), 
//                                     JSON.stringify(rack_no) || null,
//                                     patient_id, 
//                                     doctor_id,
//                                     item.gst || 0,
//                                     item.return_unit || 0,
//                                     item.total_return_amount || 0,
//                                     remaining_amount || 0,
//                                     advance || 0,
//                                     grand_total || 0,
//                                     delivery_date || null,
//                                     book_id || null,
//                                     phone_no_type || null
//                                 ])],
//                                 (err, result) => {
//                                     if (err) reject(err);
//                                     else resolve(result);
//                                 }
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response with original quantities
//                         const responseItems = items.map(requestItem => {
//                             // Find matching processed items (might be multiple if split across stock batches)
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             // If we have multiple allocations for the same item, combine them
//                             if (matchingProcessed.length > 0) {
//                                 const combined = {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: requestItem.stock_type === 'Non Stock Item' ? 0 : matchingProcessed[0].stock_id,
//                                     rack_no: rack_no,    // use first rack no
//                                     // rate_after_discount: requestItem.price * (1 - (requestItem.discount / 100)),
//                                     quantity: parseFloat(requestItem.quantity), // original quantity
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null
//                                 };
//                                 return combined;
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
                            
//                             // cogs: totalCOGS
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });



//this is accurate invoice code dont delete it (never delete it)
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type;

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     if (invoice_no_for_update) {
//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         // Release ALL allocated stock from existing items
//                         for (const existingItem of existingItems) {
//                             if (existingItem.stock_id !== 0) {
//                                 await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                         [existingItem.quantity, existingItem.stock_id],
//                                         (err) => err ? reject(err) : resolve()
//                                     );
//                                 });
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with proper stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : originalItem.stock_id,
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty
//                             });
//                             continue;
//                         }

//                         // Check if we have an existing valid stock_id
//                         const existingStockId = originalItem.stock_id;
//                         let stockAllocated = 0;

//                         if (existingStockId && existingStockId !== 0) {
//                             // Get complete stock information
//                             const stockInfo = await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     `SELECT 
//                                         id,
//                                         quantity,
//                                         IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                         (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                         final_price,
//                                         discount,
//                                         rack_no
//                                     FROM stock 
//                                     WHERE id = ? AND stock_status = 'In Stock'`,
//                                     [existingStockId],
//                                     (err, results) => err ? reject(err) : resolve(results[0])
//                                 );
//                             });

//                             if (stockInfo) {
//                                 const availableQty = stockInfo.available_quantity;
//                                 const allocateQty = Math.min(availableQty, requiredQty);

//                                 if (allocateQty > 0) {
//                                     // Reserve stock from original batch
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity + ? WHERE id = ?',
//                                             [allocateQty, existingStockId],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: existingStockId,
//                                         rack_no: stockInfo.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         // price: stockInfo.final_price,
//                                         discount: stockInfo.discount
//                                     });

//                                     stockAllocated = allocateQty;
//                                     totalCOGS += allocateQty * stockInfo.final_price;
//                                 }
//                             }
//                         }

//                         // If we still need more quantity, allocate from other batches
//                         const remainingQty = requiredQty - stockAllocated;

//                         if (remainingQty > 0) {
//                             const stockQuery = `
//                                 SELECT 
//                                     s.id AS stock_id,
//                                     s.final_price,
//                                     s.discount,
//                                     s.rack_no,
//                                     (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                 FROM 
//                                     stock s
//                                 WHERE 
//                                     s.item_id = ?
//                                     AND s.stock_status = 'In Stock'
//                                     AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                     ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                                     ${existingStockId ? `AND s.id != ${existingStockId}` : ''}
//                                 ORDER BY 
//                                     s.stock_date ASC, 
//                                     s.id ASC`;

//                             const availableStocks = await new Promise((resolve, reject) => {
//                                 connection.query(
//                                     stockQuery, 
//                                     [originalItem.item], 
//                                     (err, results) => err ? reject(err) : resolve(results)
//                                 );
//                             });

//                             if (availableStocks.length === 0) {
//                                 throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}`);
//                             }

//                             // Allocate remaining quantity from other batches
//                             let qtyToAllocate = remainingQty;
//                             for (const stock of availableStocks) {
//                                 if (qtyToAllocate <= 0) break;

//                                 const availableQty = parseFloat(stock.available_quantity);
//                                 const allocateQty = Math.min(availableQty, qtyToAllocate);
                                
//                                 // Reserve the stock
//                                 await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                         [allocateQty, stock.stock_id],
//                                         (err) => err ? reject(err) : resolve()
//                                     );
//                                 });

//                                 processedItems.push({
//                                     ...originalItem,
//                                     stock_id: stock.stock_id,
//                                     rack_no: stock.rack_no || rack_no || null,
//                                     quantity: allocateQty,
//                                     // price: stock.final_price,
//                                     discount: stock.discount
//                                 });

//                                 totalCOGS += allocateQty * stock.final_price;
//                                 qtyToAllocate -= allocateQty;

//                                 if (allocateQty >= availableQty) {
//                                     exhaustedStocks.add(stock.stock_id);
//                                 }
//                             }

//                             if (qtyToAllocate > 0) {
//                                 throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}`);
//                             }
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items (we'll recreate them with proper stock allocations)
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, grand_total, delivery_date, 
//                                     book_id, phone_no_type
//                                 ) VALUES ?`,
//                                 [processedItems.map(item => [
//                                     nextInvoiceNo, 
//                                     item.item, 
//                                     item.price, 
//                                     item.quantity, 
//                                     item.discount,
//                                     item.phone_no, 
//                                     item.full_name, 
//                                     item.age, 
//                                     item.stock_id || 0,
//                                     item.stock_type || null,
//                                     item.rate_after_discount,
//                                     formatDate(item.invoice_date || new Date()), 
//                                     JSON.stringify(item.rack_no) || null,
//                                     patient_id, 
//                                     doctor_id,
//                                     item.gst || 0,
//                                     item.return_unit || 0,
//                                     item.total_return_amount || 0,
//                                     remaining_amount || 0,
//                                     advance || 0,
//                                     grand_total || 0,
//                                     delivery_date || null,
//                                     book_id || null,
//                                     phone_no_type || null
//                                 ])],
//                                 (err, result) => err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 const combinedQty = matchingProcessed.reduce((sum, item) => sum + item.quantity, 0);
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id, // Return first stock_id
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: combinedQty,
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: totalCOGS
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });









//this code is absolutely okay I changed for barcode....so dont delete it
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const invoice_status = req.body.invoice_status;
//     const alert_date = req.body.alert_date;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type || 'sale'; // Default to 'sale' if not provided

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     let previousInvoiceType = 'sale'; // Default to 'sale' for new invoices
                    
//                     if (invoice_no_for_update) {
//                         // Get existing items and previous invoice type
//                         const existingData = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results[0])
//                             );
//                         });
                        
//                         if (existingData) {
//                             previousInvoiceType = existingData.invoice_type || 'sale';
//                         }

//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         // Release ALL allocated stock from existing items if:
//                         // 1. Previous invoice was a sale and now changing to quotation
//                         // 2. Or if it's being updated as a sale (we'll reallocate below)
//                         if (previousInvoiceType === 'sale' && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale')) {
//                             for (const existingItem of existingItems) {
//                                 if (existingItem.stock_id !== 0) {
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                             [existingItem.quantity, existingItem.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });
//                                 }
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with proper stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : originalItem.stock_id,
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type // Include invoice_type in each item
//                             });
//                             continue;
//                         }

//                         // Only allocate stock if this is a sale invoice
//                         if (invoice_type === 'sale') {
//                             // Check if we have an existing valid stock_id
//                             const existingStockId = originalItem.stock_id;
//                             let stockAllocated = 0;

//                             if (existingStockId && existingStockId !== 0) {
//                                 // Get complete stock information
//                                 const stockInfo = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `SELECT 
//                                             id,
//                                             quantity,
//                                             IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                             (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                             final_price,
//                                             discount,
//                                             rack_no
//                                         FROM stock 
//                                         WHERE id = ? AND stock_status = 'In Stock'`,
//                                         [existingStockId],
//                                         (err, results) => err ? reject(err) : resolve(results[0])
//                                     );
//                                 });

//                                 if (stockInfo) {
//                                     const availableQty = stockInfo.available_quantity;
//                                     const allocateQty = Math.min(availableQty, requiredQty);

//                                     if (allocateQty > 0) {
//                                         // Reserve stock from original batch
//                                         await new Promise((resolve, reject) => {
//                                             connection.query(
//                                                 'UPDATE stock SET allocated_quantity = allocated_quantity + ? WHERE id = ?',
//                                                 [allocateQty, existingStockId],
//                                                 (err) => err ? reject(err) : resolve()
//                                             );
//                                         });

//                                         processedItems.push({
//                                             ...originalItem,
//                                             stock_id: existingStockId,
//                                             rack_no: stockInfo.rack_no || rack_no || null,
//                                             quantity: allocateQty,
//                                             // discount: stockInfo.discount,
//                                             invoice_type: invoice_type
//                                         });

//                                         stockAllocated = allocateQty;
//                                         totalCOGS += allocateQty * stockInfo.final_price;
//                                     }
//                                 }
//                             }

//                             // If we still need more quantity, allocate from other batches
//                             const remainingQty = requiredQty - stockAllocated;

//                             if (remainingQty > 0) {
//                                 const stockQuery = `
//                                     SELECT 
//                                         s.id AS stock_id,
//                                         s.final_price,
//                                         s.discount,
//                                         s.rack_no,
//                                         (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                     FROM 
//                                         stock s
//                                     WHERE 
//                                         s.item_id = ?
//                                         AND s.stock_status = 'In Stock'
//                                         AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                         ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                                         ${existingStockId ? `AND s.id != ${existingStockId}` : ''}
//                                     ORDER BY 
//                                         s.date_of_expiry ASC,
//                                         s.id ASC`;

//                                 const availableStocks = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         stockQuery, 
//                                         [originalItem.item], 
//                                         (err, results) => err ? reject(err) : resolve(results)
//                                     );
//                                 });

//                                 if (availableStocks.length === 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}`);
//                                 }

//                                 // Allocate remaining quantity from other batches
//                                 let qtyToAllocate = remainingQty;
//                                 for (const stock of availableStocks) {
//                                     if (qtyToAllocate <= 0) break;

//                                     const availableQty = parseFloat(stock.available_quantity);
//                                     const allocateQty = Math.min(availableQty, qtyToAllocate);
                                    
//                                     // Reserve the stock
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                             [allocateQty, stock.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: stock.stock_id,
//                                         rack_no: stock.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         // discount: stock.discount,
//                                         invoice_type: invoice_type
//                                     });

//                                     totalCOGS += allocateQty * stock.final_price;
//                                     qtyToAllocate -= allocateQty;

//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(stock.stock_id);
//                                     }
//                                 }

//                                 if (qtyToAllocate > 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}`);
//                                 }
//                             }
//                         } else {
//                             // For quotations, just add the items without stock allocation
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: 0, // No stock allocation for quotations
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items (we'll recreate them with proper stock allocations)
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                               `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
//                                     book_id, phone_no_type, invoice_type, invoice_status, alert_date
//                                 ) VALUES ?`,
//                               [
//                                 processedItems.map((item) => [
//                                   nextInvoiceNo,
//                                   item.item,
//                                   item.price,
//                                   item.quantity,
//                                   item.discount,
//                                   item.phone_no,
//                                   item.full_name,
//                                   item.age,
//                                   item.stock_id || 0,
//                                   item.stock_type || null,
//                                   item.rate_after_discount,
//                                   formatDate(item.invoice_date || new Date()),
//                                   JSON.stringify(item.rack_no) || null,
//                                   patient_id,
//                                   doctor_id,
//                                   item.gst || 0,
//                                   item.return_unit || 0,
//                                   item.total_return_amount || 0,
//                                   remaining_amount || 0,
//                                   advance || 0,
//                                   item.total || 0,
//                                   grand_total || 0,
//                                   delivery_date || null,
//                                   book_id || null,
//                                   phone_no_type || null,
//                                   invoice_type,
//                                   invoice_status || "paid",
//                                   alert_date || null,
//                                 ]),
//                               ],
//                               (err, result) =>
//                                 err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 const combinedQty = matchingProcessed.reduce((sum, item) => sum + item.quantity, 0);
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id, // Return first stock_id
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: parseFloat(requestItem.quantity),
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null,
//                                     invoice_type: invoice_type,
//                                     invoice_status: invoice_status || 'paid',
//                                     alert_date: alert_date || null,
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null,
//                                 invoice_type: invoice_type,
//                                 invoice_status: invoice_status || 'paid',
//                                 alert_date: alert_date || null,
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: invoice_type === 'sale' ? totalCOGS : 0, // Only return COGS for sales
//                             invoice_type: invoice_type
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });




//this is old code 28-09-2025
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const invoice_status = req.body.invoice_status;
//     const alert_date = req.body.alert_date;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type || 'sale';

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     let previousInvoiceType = 'sale';
                    
//                     if (invoice_no_for_update) {
//                         const existingData = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results[0])
//                             );
//                         });
                        
//                         if (existingData) {
//                             previousInvoiceType = existingData.invoice_type || 'sale';
//                         }

//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         if (previousInvoiceType === 'sale' && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale')) {
//                             for (const existingItem of existingItems) {
//                                 if (existingItem.stock_id !== 0) {
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                             [existingItem.quantity, existingItem.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });
//                                 }
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with enhanced stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';
//                         const barcodeStockId = originalItem.stock_id && originalItem.stock_id !== '' && originalItem.stock_id !== '0' 
//                             ? parseInt(originalItem.stock_id) : null;

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : (barcodeStockId || 0),
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                             continue;
//                         }

//                         // Only allocate stock if this is a sale invoice
//                         if (invoice_type === 'sale') {
//                             let stockAllocated = 0;
//                             let remainingQty = requiredQty;

//                             // PRIORITY 1: Use barcode stock_id if provided
//                             if (barcodeStockId) {
//                                 console.log(`Attempting to allocate from barcode stock_id: ${barcodeStockId} for item: ${originalItem.item_name || originalItem.item}`);
                                
//                                 const barcodeStockInfo = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `SELECT 
//                                             id,
//                                             quantity,
//                                             IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                             (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                             final_price,
//                                             discount,
//                                             rack_no,
//                                             item_id
//                                         FROM stock 
//                                         WHERE id = ? AND stock_status = 'In Stock' AND item_id = ?`,
//                                         [barcodeStockId, originalItem.item],
//                                         (err, results) => err ? reject(err) : resolve(results[0])
//                                     );
//                                 });

//                                 if (barcodeStockInfo && barcodeStockInfo.available_quantity > 0) {
//                                     const availableQty = parseFloat(barcodeStockInfo.available_quantity);
//                                     const allocateQty = Math.min(availableQty, remainingQty);

//                                     // Reserve stock from barcode-specified batch
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity + ? WHERE id = ?',
//                                             [allocateQty, barcodeStockId],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: barcodeStockId,
//                                         rack_no: barcodeStockInfo.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     stockAllocated += allocateQty;
//                                     remainingQty -= allocateQty;
//                                     totalCOGS += allocateQty * barcodeStockInfo.final_price;

//                                     // console.log(`Allocated ${allocateQty} from barcode stock_id: ${barcodeStockId}. Remaining: ${remainingQty}`);

//                                     // Mark as exhausted if fully used
//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(barcodeStockId);
//                                     }
//                                 } else {
//                                     console.log(`Barcode stock_id ${barcodeStockId} not available or doesn't match item ${originalItem.item}`);
//                                     if (!barcodeStockInfo) {
//                                         console.log('Stock not found or not in stock status');
//                                     } else if (barcodeStockInfo.item_id !== originalItem.item) {
//                                         console.log(`Item mismatch: stock item_id ${barcodeStockInfo.item_id} vs requested item ${originalItem.item}`);
//                                     }
//                                 }
//                             }

//                             // PRIORITY 2: If we still need more quantity, use existing FIFO logic
//                             if (remainingQty > 0) {
//                                 // console.log(`Still need ${remainingQty} quantity for item ${originalItem.item_name || originalItem.item}, using FIFO allocation`);

//                                 const stockQuery = `
//                                     SELECT 
//                                         s.id AS stock_id,
//                                         s.final_price,
//                                         s.discount,
//                                         s.rack_no,
//                                         (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                     FROM 
//                                         stock s
//                                     WHERE 
//                                         s.item_id = ?
//                                         AND s.stock_status = 'In Stock'
//                                         AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                         ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                                         ${barcodeStockId ? `AND s.id != ${barcodeStockId}` : ''}
//                                     ORDER BY 
//                                         s.stock_date ASC,
//                                         s.id ASC`;

//                                 const availableStocks = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         stockQuery, 
//                                         [originalItem.item], 
//                                         (err, results) => err ? reject(err) : resolve(results)
//                                     );
//                                 });

//                                 if (availableStocks.length === 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Required: ${remainingQty}, Available from barcode: ${stockAllocated}`);
//                                 }

//                                 // Allocate remaining quantity using FIFO
//                                 let qtyToAllocate = remainingQty;
//                                 for (const stock of availableStocks) {
//                                     if (qtyToAllocate <= 0) break;

//                                     const availableQty = parseFloat(stock.available_quantity);
//                                     const allocateQty = Math.min(availableQty, qtyToAllocate);
                                    
//                                     // Reserve the stock
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                             [allocateQty, stock.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: stock.stock_id,
//                                         rack_no: stock.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     totalCOGS += allocateQty * stock.final_price;
//                                     qtyToAllocate -= allocateQty;

//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(stock.stock_id);
//                                     }

//                                     console.log(`FIFO allocated ${allocateQty} from stock_id: ${stock.stock_id}. Remaining to allocate: ${qtyToAllocate}`);
//                                 }

//                                 if (qtyToAllocate > 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Still need: ${qtyToAllocate}`);
//                                 }
//                             }
//                         } else {
//                             // For quotations and holds, just add the items without stock allocation
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: 0, // No stock allocation for quotations/holds
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                               `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
//                                     book_id, phone_no_type, invoice_type, invoice_status, alert_date
//                                 ) VALUES ?`,
//                               [
//                                 processedItems.map((item) => [
//                                   nextInvoiceNo,
//                                   item.item,
//                                   item.price,
//                                   item.quantity,
//                                   item.discount,
//                                   item.phone_no,
//                                   item.full_name,
//                                   item.age,
//                                   item.stock_id || 0,
//                                   item.stock_type || null,
//                                   item.rate_after_discount,
//                                   formatDate(item.invoice_date || new Date()),
//                                   JSON.stringify(item.rack_no) || null,
//                                   patient_id,
//                                   doctor_id,
//                                   item.gst || 0,
//                                   item.return_unit || 0,
//                                   item.total_return_amount || 0,
//                                   remaining_amount || 0,
//                                   advance || 0,
//                                   item.total || 0,
//                                   grand_total || 0,
//                                   delivery_date || null,
//                                   book_id || null,
//                                   phone_no_type || null,
//                                   invoice_type,
//                                   invoice_status || "paid",
//                                   alert_date || null,
//                                 ]),
//                               ],
//                               (err, result) =>
//                                 err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id,
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: parseFloat(requestItem.quantity),
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null,
//                                     invoice_type: invoice_type,
//                                     invoice_status: invoice_status || 'paid',
//                                     alert_date: alert_date || null,
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null,
//                                 invoice_type: invoice_type,
//                                 invoice_status: invoice_status || 'paid',
//                                 alert_date: alert_date || null,
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: invoice_type === 'sale' ? totalCOGS : 0,
//                             invoice_type: invoice_type
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });




// Add these routes to your Express.js backend

// Get all active staff
app.get('/api/staff', (req, res) => {
  const query = 'SELECT * FROM staff WHERE status = "active" ORDER BY name ASC';
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching staff:', err);
      return res.status(500).json({ error: 'Failed to fetch staff' });
    }
    res.json({ results });
  });
});

// Get staff by ID
app.get('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM staff WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching staff:', err);
      return res.status(500).json({ error: 'Failed to fetch staff' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ result: results[0] });
  });
});

// Create new staff
app.post('/api/staff', (req, res) => {
  const { name, age, cnic, phone_no, salary, commission_rate, date_joined } = req.body;
  
  // Validation
  if (!name || !cnic) {
    return res.status(400).json({ error: 'Name and CNIC are required' });
  }
  
  const query = `
    INSERT INTO staff (name, age, cnic, phone_no, salary, commission_rate, date_joined, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `;
  
  const values = [
    name,
    age || null,
    cnic,
    phone_no || null,
    salary || 0,
    commission_rate || 0,
    date_joined || new Date().toISOString().split('T')[0]
  ];
  
  connection.query(query, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'CNIC already exists' });
      }
      console.error('Error creating staff:', err);
      return res.status(500).json({ error: 'Failed to create staff' });
    }
    res.json({ 
      success: true, 
      message: 'Staff created successfully',
      id: result.insertId 
    });
  });
});

// Update staff
app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const { name, age, cnic, phone_no, salary, commission_rate, status, date_joined } = req.body;
  
  const query = `
    UPDATE staff 
    SET name = ?, age = ?, cnic = ?, phone_no = ?, salary = ?, 
        commission_rate = ?, status = ?, date_joined = ?
    WHERE id = ?
  `;
  
  const values = [
    name,
    age || null,
    cnic,
    phone_no || null,
    salary || 0,
    commission_rate || 0,
    status || 'active',
    date_joined || null,
    id
  ];
  
  connection.query(query, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'CNIC already exists' });
      }
      console.error('Error updating staff:', err);
      return res.status(500).json({ error: 'Failed to update staff' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ success: true, message: 'Staff updated successfully' });
  });
});

// Delete staff (soft delete - set status to inactive)
app.delete('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE staff SET status = "inactive" WHERE id = ?';
  
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting staff:', err);
      return res.status(500).json({ error: 'Failed to delete staff' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ success: true, message: 'Staff deleted successfully' });
  });
});

// Get staff commission report
app.get('/api/staff/commission-report', (req, res) => {
  const { from_date, to_date, staff_id } = req.query;
  
  let query = `
    SELECT 
      s.id as staff_id,
      s.name as staff_name,
      COUNT(DISTINCT ip.invoice_no) as total_invoices,
      SUM(ip.commission_amount) as total_commission,
      SUM(ip.total) as total_sales
    FROM staff s
    LEFT JOIN invoice_pharmacy ip ON s.id = ip.staff_id
    WHERE s.status = 'active'
  `;
  
  const params = [];
  
  if (from_date && to_date) {
    query += ' AND ip.invoice_date BETWEEN ? AND ?';
    params.push(from_date, to_date);
  }
  
  if (staff_id) {
    query += ' AND s.id = ?';
    params.push(staff_id);
  }
  
  query += ' GROUP BY s.id, s.name ORDER BY total_commission DESC';
  
  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching commission report:', err);
      return res.status(500).json({ error: 'Failed to fetch commission report' });
    }
    res.json({ results });
  });
});



// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const invoice_status = req.body.invoice_status;
//     const alert_date = req.body.alert_date;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type || 'sale';
//     const user_name = req.body.user_name || 'Unkown';

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     let previousInvoiceType = 'sale';
                    
//                     if (invoice_no_for_update) {
//                         const existingData = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results[0])
//                             );
//                         });
                        
//                         if (existingData) {
//                             previousInvoiceType = existingData.invoice_type || 'sale';
//                         }

//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         if (previousInvoiceType === 'sale' && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale')) {
//                             for (const existingItem of existingItems) {
//                                 if (existingItem.stock_id !== 0) {
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                             [existingItem.quantity, existingItem.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });
//                                 }
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with enhanced stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';
//                         const barcodeStockId = originalItem.stock_id && originalItem.stock_id !== '' && originalItem.stock_id !== '0' 
//                             ? parseInt(originalItem.stock_id) : null;

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : (barcodeStockId || 0),
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                             continue;
//                         }

//                         // Only allocate stock if this is a sale invoice
//                         if (invoice_type === 'sale') {
//                             let stockAllocated = 0;
//                             let remainingQty = requiredQty;

//                             // PRIORITY 1: Use barcode stock_id if provided
//                             if (barcodeStockId) {
//                                 console.log(`Attempting to allocate from barcode stock_id: ${barcodeStockId} for item: ${originalItem.item_name || originalItem.item}`);
                                
//                                 const barcodeStockInfo = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `SELECT 
//                                             id,
//                                             quantity,
//                                             IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                             (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                             final_price,
//                                             discount,
//                                             rack_no,
//                                             item_id
//                                         FROM stock 
//                                         WHERE id = ? AND stock_status = 'In Stock' AND item_id = ?`,
//                                         [barcodeStockId, originalItem.item],
//                                         (err, results) => err ? reject(err) : resolve(results[0])
//                                     );
//                                 });

//                                 if (barcodeStockInfo && barcodeStockInfo.available_quantity > 0) {
//                                     const availableQty = parseFloat(barcodeStockInfo.available_quantity);
//                                     const allocateQty = Math.min(availableQty, remainingQty);

//                                     // Reserve stock from barcode-specified batch
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity + ? WHERE id = ?',
//                                             [allocateQty, barcodeStockId],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: barcodeStockId,
//                                         rack_no: barcodeStockInfo.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     stockAllocated += allocateQty;
//                                     remainingQty -= allocateQty;
//                                     totalCOGS += allocateQty * barcodeStockInfo.final_price;

//                                     console.log(`Allocated ${allocateQty} from barcode stock_id: ${barcodeStockId}. Remaining: ${remainingQty}`);

//                                     // Mark as exhausted if fully used
//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(barcodeStockId);
//                                     }
//                                 } else {
//                                     console.log(`Barcode stock_id ${barcodeStockId} not available or doesn't match item ${originalItem.item}`);
//                                     if (!barcodeStockInfo) {
//                                         console.log('Stock not found or not in stock status');
//                                     } else if (barcodeStockInfo.item_id !== originalItem.item) {
//                                         console.log(`Item mismatch: stock item_id ${barcodeStockInfo.item_id} vs requested item ${originalItem.item}`);
//                                     }
//                                 }
//                             }

//                             // PRIORITY 2: If we still need more quantity, use existing FIFO logic
//                             if (remainingQty > 0) {
//                                 console.log(`Still need ${remainingQty} quantity for item ${originalItem.item_name || originalItem.item}, using FIFO allocation`);

//                                 const stockQuery = `
//                                     SELECT 
//                                         s.id AS stock_id,
//                                         s.final_price,
//                                         s.discount,
//                                         s.rack_no,
//                                         (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                     FROM 
//                                         stock s
//                                     WHERE 
//                                         s.item_id = ?
//                                         AND s.stock_status = 'In Stock'
//                                         AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                         ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                                         ${barcodeStockId ? `AND s.id != ${barcodeStockId}` : ''}
//                                     ORDER BY 
//                                         s.stock_date ASC,
//                                         s.id ASC`;

//                                 const availableStocks = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         stockQuery, 
//                                         [originalItem.item], 
//                                         (err, results) => err ? reject(err) : resolve(results)
//                                     );
//                                 });

//                                 if (availableStocks.length === 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Required: ${remainingQty}, Available from barcode: ${stockAllocated}`);
//                                 }

//                                 // Allocate remaining quantity using FIFO
//                                 let qtyToAllocate = remainingQty;
//                                 for (const stock of availableStocks) {
//                                     if (qtyToAllocate <= 0) break;

//                                     const availableQty = parseFloat(stock.available_quantity);
//                                     const allocateQty = Math.min(availableQty, qtyToAllocate);
                                    
//                                     // Reserve the stock
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                             [allocateQty, stock.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: stock.stock_id,
//                                         rack_no: stock.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     totalCOGS += allocateQty * stock.final_price;
//                                     qtyToAllocate -= allocateQty;

//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(stock.stock_id);
//                                     }

//                                     console.log(`FIFO allocated ${allocateQty} from stock_id: ${stock.stock_id}. Remaining to allocate: ${qtyToAllocate}`);
//                                 }

//                                 if (qtyToAllocate > 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Still need: ${qtyToAllocate}`);
//                                 }
//                             }
//                         } else {
//                             // For quotations and holds, just add the items without stock allocation
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: 0, // No stock allocation for quotations/holds
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                               `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
//                                     book_id, phone_no_type, invoice_type, invoice_status, alert_date, user_name, location, staff_id, commission_amount
//                                 ) VALUES ?`,
//                               [
//                                 processedItems.map((item) => [
//                                   nextInvoiceNo,
//                                   item.item,
//                                   item.price,
//                                   item.quantity,
//                                   item.discount,
//                                   item.phone_no,
//                                   item.full_name,
//                                   item.age,
//                                   item.stock_id || 0,
//                                   item.stock_type || null,
//                                   item.rate_after_discount,
//                                   formatDate(item.invoice_date || new Date()),
//                                   JSON.stringify(item.rack_no) || null,
//                                   patient_id,
//                                   doctor_id,
//                                   item.gst || 0,
//                                   item.return_unit || 0,
//                                   item.total_return_amount || 0,
//                                   remaining_amount || 0,
//                                   advance || 0,
//                                   item.total || 0,
//                                   grand_total || 0,
//                                   delivery_date || null,
//                                   book_id || null,
//                                   phone_no_type || null,
//                                   invoice_type,
//                                   invoice_status || "paid",
//                                   alert_date || null,
//                                   user_name || 'Unknown',
//                                   item.location || null,
//                                   (item.staff_id == null ? 0 : item.staff_id) || 0,
//                                   (item.commission_amount == '' ? 0 : item.commission_amount) || 0
//                                 ]),
//                               ],
//                               (err, result) =>
//                                 err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id,
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: parseFloat(requestItem.quantity),
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null,
//                                     invoice_type: invoice_type,
//                                     invoice_status: invoice_status || 'paid',
//                                     alert_date: alert_date || null,
//                                     user_name: user_name || 'Unknown'
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null,
//                                 invoice_type: invoice_type,
//                                 invoice_status: invoice_status || 'paid',
//                                 alert_date: alert_date || null,
//                                  user_name: user_name || 'Unknown'
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: invoice_type === 'sale' ? totalCOGS : 0,
//                             invoice_type: invoice_type
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });




// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const invoice_status = req.body.invoice_status;
//     const alert_date = req.body.alert_date;
//     const appointment_date = req.body.appointment_date;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type || 'sale';
//     const user_name = req.body.user_name || 'Unknown';

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     let previousInvoiceType = 'sale';
                    
//                     if (invoice_no_for_update) {
//                         const existingData = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results[0])
//                             );
//                         });
                        
//                         if (existingData) {
//                             previousInvoiceType = existingData.invoice_type || 'sale';
//                         }

//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         // ✅ OPTIMIZED: Bulk update instead of loop
//                         if (previousInvoiceType === 'sale' && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale' || invoice_type === 'appointment')) {
//                             const stocksToUpdate = existingItems.filter(item => item.stock_id !== 0);
                            
//                             if (stocksToUpdate.length > 0) {
//                                 const stockIds = stocksToUpdate.map(item => item.stock_id);
//                                 const stockQuantityMap = {};
//                                 stocksToUpdate.forEach(item => {
//                                     stockQuantityMap[item.stock_id] = (stockQuantityMap[item.stock_id] || 0) + parseFloat(item.quantity);
//                                 });

//                                 const caseStatements = Object.entries(stockQuantityMap)
//                                     .map(([stockId, qty]) => `WHEN ${stockId} THEN allocated_quantity - ${qty}`)
//                                     .join(' ');

//                                 await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `UPDATE stock 
//                                          SET allocated_quantity = CASE id ${caseStatements} ELSE allocated_quantity END
//                                          WHERE id IN (${stockIds.join(',')})`,
//                                         (err) => err ? reject(err) : resolve()
//                                     );
//                                 });
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with enhanced stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     // ✅ OPTIMIZED: Collect all item IDs and barcode stock IDs first
//                     const itemIds = [...new Set(items.map(item => item.item).filter(id => id))];
//                     const barcodeStockIds = items
//                         .map(item => item.stock_id && item.stock_id !== '' && item.stock_id !== '0' ? parseInt(item.stock_id) : null)
//                         .filter(id => id !== null);

//                     // ✅ OPTIMIZED: Fetch all barcode stocks in one query
//                     let barcodeStocksMap = {};
//                     if (barcodeStockIds.length > 0 && invoice_type === 'sale') {
//                         const barcodeStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `SELECT 
//                                     id,
//                                     quantity,
//                                     IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                     (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                     final_price,
//                                     discount,
//                                     rack_no,
//                                     item_id
//                                 FROM stock 
//                                 WHERE id IN (${barcodeStockIds.join(',')}) AND stock_status = 'In Stock'`,
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         barcodeStocks.forEach(stock => {
//                             barcodeStocksMap[stock.id] = stock;
//                         });
//                     }

//                     // ✅ OPTIMIZED: Fetch all available stocks for all items in one query
//                     let availableStocksMap = {};
//                     if (itemIds.length > 0 && invoice_type === 'sale') {
//                         const allAvailableStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `SELECT 
//                                     s.id AS stock_id,
//                                     s.item_id,
//                                     s.final_price,
//                                     s.discount,
//                                     s.rack_no,
//                                     s.stock_date,
//                                     (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                 FROM stock s
//                                 WHERE s.item_id IN (${itemIds.join(',')})
//                                     AND s.stock_status = 'In Stock'
//                                     AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                 ORDER BY s.item_id, s.stock_date ASC, s.id ASC`,
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         allAvailableStocks.forEach(stock => {
//                             if (!availableStocksMap[stock.item_id]) {
//                                 availableStocksMap[stock.item_id] = [];
//                             }
//                             availableStocksMap[stock.item_id].push(stock);
//                         });
//                     }

//                     // ✅ Collect all stock updates to do in bulk later
//                     const stockUpdatesToApply = [];

//                     // Process each item
//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';
//                         const barcodeStockId = originalItem.stock_id && originalItem.stock_id !== '' && originalItem.stock_id !== '0' 
//                             ? parseInt(originalItem.stock_id) : null;

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : (barcodeStockId || 0),
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                             continue;
//                         }

//                         // Only allocate stock if this is a sale invoice
//                         if (invoice_type === 'sale') {
//                             let stockAllocated = 0;
//                             let remainingQty = requiredQty;

//                             // PRIORITY 1: Use barcode stock_id if provided
//                             if (barcodeStockId) {
//                                 console.log(`Attempting to allocate from barcode stock_id: ${barcodeStockId} for item: ${originalItem.item_name || originalItem.item}`);
                                
//                                 const barcodeStockInfo = barcodeStocksMap[barcodeStockId];

//                                 if (barcodeStockInfo && 
//                                     barcodeStockInfo.available_quantity > 0 && 
//                                     barcodeStockInfo.item_id === originalItem.item) {
                                    
//                                     const availableQty = parseFloat(barcodeStockInfo.available_quantity);
//                                     const allocateQty = Math.min(availableQty, remainingQty);

//                                     // ✅ Collect update instead of executing immediately
//                                     stockUpdatesToApply.push({
//                                         stock_id: barcodeStockId,
//                                         quantity: allocateQty
//                                     });

//                                     // Update in-memory available quantity
//                                     barcodeStockInfo.available_quantity -= allocateQty;

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: barcodeStockId,
//                                         rack_no: barcodeStockInfo.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     stockAllocated += allocateQty;
//                                     remainingQty -= allocateQty;
//                                     totalCOGS += allocateQty * barcodeStockInfo.final_price;

//                                     console.log(`Allocated ${allocateQty} from barcode stock_id: ${barcodeStockId}. Remaining: ${remainingQty}`);

//                                     // Mark as exhausted if fully used
//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(barcodeStockId);
//                                     }
//                                 } else {
//                                     console.log(`Barcode stock_id ${barcodeStockId} not available or doesn't match item ${originalItem.item}`);
//                                 }
//                             }

//                             // PRIORITY 2: If we still need more quantity, use existing FIFO logic
//                             if (remainingQty > 0) {
//                                 console.log(`Still need ${remainingQty} quantity for item ${originalItem.item_name || originalItem.item}, using FIFO allocation`);

//                                 let availableStocks = availableStocksMap[originalItem.item] || [];
                                
//                                 // Filter out exhausted stocks and barcode stock
//                                 availableStocks = availableStocks.filter(stock => 
//                                     !exhaustedStocks.has(stock.stock_id) && 
//                                     stock.stock_id !== barcodeStockId &&
//                                     stock.available_quantity > 0
//                                 );

//                                 if (availableStocks.length === 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Required: ${remainingQty}, Available from barcode: ${stockAllocated}`);
//                                 }

//                                 // Allocate remaining quantity using FIFO
//                                 let qtyToAllocate = remainingQty;
//                                 for (const stock of availableStocks) {
//                                     if (qtyToAllocate <= 0) break;

//                                     const availableQty = parseFloat(stock.available_quantity);
//                                     const allocateQty = Math.min(availableQty, qtyToAllocate);
                                    
//                                     // ✅ Collect update instead of executing immediately
//                                     stockUpdatesToApply.push({
//                                         stock_id: stock.stock_id,
//                                         quantity: allocateQty
//                                     });

//                                     // Update in-memory available quantity
//                                     stock.available_quantity -= allocateQty;

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: stock.stock_id,
//                                         rack_no: stock.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     totalCOGS += allocateQty * stock.final_price;
//                                     qtyToAllocate -= allocateQty;

//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(stock.stock_id);
//                                     }

//                                     console.log(`FIFO allocated ${allocateQty} from stock_id: ${stock.stock_id}. Remaining to allocate: ${qtyToAllocate}`);
//                                 }

//                                 if (qtyToAllocate > 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Still need: ${qtyToAllocate}`);
//                                 }
//                             }
//                         } else {
//                             // For quotations and holds, just add the items without stock allocation
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: 0,
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                         }
//                     }

//                     // ✅ OPTIMIZED: Apply all stock updates in ONE bulk query
//                     if (stockUpdatesToApply.length > 0) {
//                         const stockUpdateMap = {};
//                         stockUpdatesToApply.forEach(update => {
//                             stockUpdateMap[update.stock_id] = (stockUpdateMap[update.stock_id] || 0) + update.quantity;
//                         });

//                         const stockIds = Object.keys(stockUpdateMap);
//                         const caseStatements = stockIds
//                             .map(stockId => `WHEN ${stockId} THEN IFNULL(allocated_quantity, 0) + ${stockUpdateMap[stockId]}`)
//                             .join(' ');

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE stock 
//                                  SET allocated_quantity = CASE id ${caseStatements} ELSE allocated_quantity END
//                                  WHERE id IN (${stockIds.join(',')})`,
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                               `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
//                                     book_id, phone_no_type, invoice_type, invoice_status, alert_date, appointment_date, user_name, location, staff_id, commission_amount, purchase_price_non_stock
//                                 ) VALUES ?`,
//                               [
//                                 processedItems.map((item) => [
//                                   nextInvoiceNo,
//                                   item.item,
//                                   item.price,
//                                   item.quantity,
//                                   item.discount,
//                                   item.phone_no,
//                                   item.full_name,
//                                   item.age,
//                                   item.stock_id || 0,
//                                   item.stock_type || null,
//                                   item.rate_after_discount,
//                                   formatDate(item.invoice_date || new Date()),
//                                   JSON.stringify(item.rack_no) || null,
//                                   patient_id,
//                                   doctor_id,
//                                   item.gst || 0,
//                                   item.return_unit || 0,
//                                   item.total_return_amount || 0,
//                                   remaining_amount || 0,
//                                   advance || 0,
//                                   item.total || 0,
//                                   grand_total || 0,
//                                   delivery_date || null,
//                                   book_id || null,
//                                   phone_no_type || null,
//                                   invoice_type,
//                                   invoice_status || "paid",
//                                   alert_date || null,
//                                   appointment_date || null,
//                                   user_name || 'Unknown',
//                                   item.location || null,
//                                  (item.staff_id == null ? 0 : item.staff_id) || 0,
//                                  (item.commission_amount == '' ? 0 : item.commission_amount) || 0,
//                                  (item.item_purchase_price == '' ? 0 : item.item_purchase_price) || 0
//                                 ]),
//                               ],
//                               (err, result) =>
//                                 err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id,
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: parseFloat(requestItem.quantity),
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null,
//                                     invoice_type: invoice_type,
//                                     invoice_status: invoice_status || 'paid',
//                                     alert_date: alert_date || null,
//                                     user_name: user_name || 'Unknown'
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null,
//                                 invoice_type: invoice_type,
//                                 invoice_status: invoice_status || 'paid',
//                                 alert_date: alert_date || null,
//                                 user_name: user_name || 'Unknown'
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: invoice_type === 'sale' ? totalCOGS : 0,
//                             invoice_type: invoice_type
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });






//this is old query only add new colums
// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const invoice_status = req.body.invoice_status;
//     const alert_date = req.body.alert_date;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type || 'sale';
//     const user_name = req.body.user_name || 'Unkown';

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     let previousInvoiceType = 'sale';
                    
//                     if (invoice_no_for_update) {
//                         const existingData = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results[0])
//                             );
//                         });
                        
//                         if (existingData) {
//                             previousInvoiceType = existingData.invoice_type || 'sale';
//                         }

//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         if (previousInvoiceType === 'sale' && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale')) {
//                             for (const existingItem of existingItems) {
//                                 if (existingItem.stock_id !== 0) {
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity - ? WHERE id = ?',
//                                             [existingItem.quantity, existingItem.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });
//                                 }
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with enhanced stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';
//                         const barcodeStockId = originalItem.stock_id && originalItem.stock_id !== '' && originalItem.stock_id !== '0' 
//                             ? parseInt(originalItem.stock_id) : null;

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : (barcodeStockId || 0),
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                             continue;
//                         }

//                         // Only allocate stock if this is a sale invoice
//                         if (invoice_type === 'sale') {
//                             let stockAllocated = 0;
//                             let remainingQty = requiredQty;

//                             // PRIORITY 1: Use barcode stock_id if provided
//                             if (barcodeStockId) {
//                                 console.log(`Attempting to allocate from barcode stock_id: ${barcodeStockId} for item: ${originalItem.item_name || originalItem.item}`);
                                
//                                 const barcodeStockInfo = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `SELECT 
//                                             id,
//                                             quantity,
//                                             IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                             (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                             final_price,
//                                             discount,
//                                             rack_no,
//                                             item_id
//                                         FROM stock 
//                                         WHERE id = ? AND stock_status = 'In Stock' AND item_id = ?`,
//                                         [barcodeStockId, originalItem.item],
//                                         (err, results) => err ? reject(err) : resolve(results[0])
//                                     );
//                                 });

//                                 if (barcodeStockInfo && barcodeStockInfo.available_quantity > 0) {
//                                     const availableQty = parseFloat(barcodeStockInfo.available_quantity);
//                                     const allocateQty = Math.min(availableQty, remainingQty);

//                                     // Reserve stock from barcode-specified batch
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = allocated_quantity + ? WHERE id = ?',
//                                             [allocateQty, barcodeStockId],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: barcodeStockId,
//                                         rack_no: barcodeStockInfo.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     stockAllocated += allocateQty;
//                                     remainingQty -= allocateQty;
//                                     totalCOGS += allocateQty * barcodeStockInfo.final_price;

//                                     // console.log(`Allocated ${allocateQty} from barcode stock_id: ${barcodeStockId}. Remaining: ${remainingQty}`);

//                                     // Mark as exhausted if fully used
//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(barcodeStockId);
//                                     }
//                                 } else {
//                                     console.log(`Barcode stock_id ${barcodeStockId} not available or doesn't match item ${originalItem.item}`);
//                                     if (!barcodeStockInfo) {
//                                         console.log('Stock not found or not in stock status');
//                                     } else if (barcodeStockInfo.item_id !== originalItem.item) {
//                                         console.log(`Item mismatch: stock item_id ${barcodeStockInfo.item_id} vs requested item ${originalItem.item}`);
//                                     }
//                                 }
//                             }

//                             // PRIORITY 2: If we still need more quantity, use existing FIFO logic
//                             if (remainingQty > 0) {
//                                 console.log(`Still need ${remainingQty} quantity for item ${originalItem.item_name || originalItem.item}, using FIFO allocation`);

//                                 const stockQuery = `
//                                     SELECT 
//                                         s.id AS stock_id,
//                                         s.final_price,
//                                         s.discount,
//                                         s.rack_no,
//                                         (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                     FROM 
//                                         stock s
//                                     WHERE 
//                                         s.item_id = ?
//                                         AND s.stock_status = 'In Stock'
//                                         AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                         ${exhaustedStocks.size > 0 ? `AND s.id NOT IN (${Array.from(exhaustedStocks).join(',')})` : ''}
//                                         ${barcodeStockId ? `AND s.id != ${barcodeStockId}` : ''}
//                                     ORDER BY 
//                                         s.stock_date ASC,
//                                         s.id ASC`;

//                                 const availableStocks = await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         stockQuery, 
//                                         [originalItem.item], 
//                                         (err, results) => err ? reject(err) : resolve(results)
//                                     );
//                                 });

//                                 if (availableStocks.length === 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Required: ${remainingQty}, Available from barcode: ${stockAllocated}`);
//                                 }

//                                 // Allocate remaining quantity using FIFO
//                                 let qtyToAllocate = remainingQty;
//                                 for (const stock of availableStocks) {
//                                     if (qtyToAllocate <= 0) break;

//                                     const availableQty = parseFloat(stock.available_quantity);
//                                     const allocateQty = Math.min(availableQty, qtyToAllocate);
                                    
//                                     // Reserve the stock
//                                     await new Promise((resolve, reject) => {
//                                         connection.query(
//                                             'UPDATE stock SET allocated_quantity = IFNULL(allocated_quantity, 0) + ? WHERE id = ?',
//                                             [allocateQty, stock.stock_id],
//                                             (err) => err ? reject(err) : resolve()
//                                         );
//                                     });

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: stock.stock_id,
//                                         rack_no: stock.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     totalCOGS += allocateQty * stock.final_price;
//                                     qtyToAllocate -= allocateQty;

//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(stock.stock_id);
//                                     }

//                                     console.log(`FIFO allocated ${allocateQty} from stock_id: ${stock.stock_id}. Remaining to allocate: ${qtyToAllocate}`);
//                                 }

//                                 if (qtyToAllocate > 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Still need: ${qtyToAllocate}`);
//                                 }
//                             }
//                         } else {
//                             // For quotations and holds, just add the items without stock allocation
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: 0, // No stock allocation for quotations/holds
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                         }
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                               `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
//                                     book_id, phone_no_type, invoice_type, invoice_status, alert_date, user_name, location, staff_id, commission_amount
//                                 ) VALUES ?`,
//                               [
//                                 processedItems.map((item) => [
//                                   nextInvoiceNo,
//                                   item.item,
//                                   item.price,
//                                   item.quantity,
//                                   item.discount,
//                                   item.phone_no,
//                                   item.full_name,
//                                   item.age,
//                                   item.stock_id || 0,
//                                   item.stock_type || null,
//                                   item.rate_after_discount,
//                                   formatDate(item.invoice_date || new Date()),
//                                   JSON.stringify(item.rack_no) || null,
//                                   patient_id,
//                                   doctor_id,
//                                   item.gst || 0,
//                                   item.return_unit || 0,
//                                   item.total_return_amount || 0,
//                                   remaining_amount || 0,
//                                   advance || 0,
//                                   item.total || 0,
//                                   grand_total || 0,
//                                   delivery_date || null,
//                                   book_id || null,
//                                   phone_no_type || null,
//                                   invoice_type,
//                                   invoice_status || "paid",
//                                   alert_date || null,
//                                   user_name || 'Unknown',
//                                   item.location || null,
//                                   (item.staff_id == null ? 0 : item.staff_id) || 0,
//                                   (item.commission_amount == '' ? 0 : item.commission_amount) || 0
//                                 ]),
//                               ],
//                               (err, result) =>
//                                 err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id,
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: parseFloat(requestItem.quantity),
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null,
//                                     invoice_type: invoice_type,
//                                     invoice_status: invoice_status || 'paid',
//                                     alert_date: alert_date || null,
//                                     user_name: user_name || 'Unknown'
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null,
//                                 invoice_type: invoice_type,
//                                 invoice_status: invoice_status || 'paid',
//                                 alert_date: alert_date || null,
//                                 user_name: user_name || 'Unknown'
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: invoice_type === 'sale' ? totalCOGS : 0,
//                             invoice_type: invoice_type
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });




// app.post('/insert-invoice-pharmacy', (req, res) => {
//     const items = req.body.tableData;
//     const invoice_no_for_update = req.body.invoice_no_get;
//     const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
//     const doctor_id = req.body.doctor_id;
//     const rack_no = req.body.rack_no;
//     const delivery_date = req.body.delivery_date;
//     const advance = req.body.advance;
//     const grand_total = req.body.grand_total;
//     const remaining_amount = req.body.remaining_amount;
//     const book_id = req.body.book_id;
//     const invoice_status = req.body.invoice_status;
//     const alert_date = req.body.alert_date;
//     const appointment_date = req.body.appointment_date;
//     const phone_no_type = req.body.phone_no_type;
//     const invoice_type = req.body.invoice_type || 'sale';
//     const user_name = req.body.user_name || 'Unknown';

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toISOString().split('T')[0];
//     };

//     connection.getConnection((err, connection) => {
//         if (err) {
//             console.error('Error getting connection:', err);
//             return res.status(500).send({ error: 'Database connection error.' });
//         }

//         connection.beginTransaction(err => {
//             if (err) {
//                 connection.release();
//                 console.error('Transaction error:', err);
//                 return res.status(500).send({ error: 'Could not start transaction.' });
//             }

//             const processItems = async () => {
//                 try {
//                     // STEP 1: Handle existing items if this is an update
//                     let existingItems = [];
//                     let previousInvoiceType = 'sale';
                    
//                     if (invoice_no_for_update) {
//                         const existingData = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results[0])
//                             );
//                         });
                        
//                         if (existingData) {
//                             previousInvoiceType = existingData.invoice_type || 'sale';
//                         }

//                         existingItems = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [invoice_no_for_update],
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         // ✅ OPTIMIZED: Bulk update instead of loop
//                         if (previousInvoiceType === 'sale' && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale' || invoice_type === 'appointment')) {
//                             const stocksToUpdate = existingItems.filter(item => item.stock_id !== 0);
                            
//                             if (stocksToUpdate.length > 0) {
//                                 const stockIds = stocksToUpdate.map(item => item.stock_id);
//                                 const stockQuantityMap = {};
//                                 stocksToUpdate.forEach(item => {
//                                     stockQuantityMap[item.stock_id] = (stockQuantityMap[item.stock_id] || 0) + parseFloat(item.quantity);
//                                 });

//                                 const caseStatements = Object.entries(stockQuantityMap)
//                                     .map(([stockId, qty]) => `WHEN ${stockId} THEN allocated_quantity - ${qty}`)
//                                     .join(' ');

//                                 await new Promise((resolve, reject) => {
//                                     connection.query(
//                                         `UPDATE stock 
//                                          SET allocated_quantity = CASE id ${caseStatements} ELSE allocated_quantity END
//                                          WHERE id IN (${stockIds.join(',')})`,
//                                         (err) => err ? reject(err) : resolve()
//                                     );
//                                 });
//                             }
//                         }
//                     }

//                     // STEP 2: Process all items with enhanced stock management
//                     const processedItems = [];
//                     let totalCOGS = 0;
//                     const exhaustedStocks = new Set();

//                     // ✅ OPTIMIZED: Collect all item IDs and barcode stock IDs first
//                     const itemIds = [...new Set(items.map(item => item.item).filter(id => id))];
//                     const barcodeStockIds = items
//                         .map(item => item.stock_id && item.stock_id !== '' && item.stock_id !== '0' ? parseInt(item.stock_id) : null)
//                         .filter(id => id !== null);

//                     // ✅ OPTIMIZED: Fetch all barcode stocks in one query
//                     let barcodeStocksMap = {};
//                     if (barcodeStockIds.length > 0 && invoice_type === 'sale') {
//                         const barcodeStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `SELECT 
//                                     id,
//                                     quantity,
//                                     IFNULL(allocated_quantity, 0) AS allocated_quantity,
//                                     (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
//                                     final_price,
//                                     discount,
//                                     rack_no,
//                                     item_id
//                                 FROM stock 
//                                 WHERE id IN (${barcodeStockIds.join(',')}) AND stock_status = 'In Stock'`,
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         barcodeStocks.forEach(stock => {
//                             barcodeStocksMap[stock.id] = stock;
//                         });
//                     }

//                     // ✅ OPTIMIZED: Fetch all available stocks for all items in one query
//                     let availableStocksMap = {};
//                     if (itemIds.length > 0 && invoice_type === 'sale') {
//                         const allAvailableStocks = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `SELECT 
//                                     s.id AS stock_id,
//                                     s.item_id,
//                                     s.final_price,
//                                     s.discount,
//                                     s.rack_no,
//                                     s.stock_date,
//                                     (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity
//                                 FROM stock s
//                                 WHERE s.item_id IN (${itemIds.join(',')})
//                                     AND s.stock_status = 'In Stock'
//                                     AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
//                                 ORDER BY s.item_id, s.stock_date ASC, s.id ASC`,
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });

//                         allAvailableStocks.forEach(stock => {
//                             if (!availableStocksMap[stock.item_id]) {
//                                 availableStocksMap[stock.item_id] = [];
//                             }
//                             availableStocksMap[stock.item_id].push(stock);
//                         });
//                     }

//                     // ✅ Collect all stock updates to do in bulk later
//                     const stockUpdatesToApply = [];

//                     // Process each item
//                     for (const originalItem of items) {
//                         const requiredQty = parseFloat(originalItem.quantity);
//                         const isNonStockItem = originalItem.stock_type === 'Non Stock Item';
//                         const barcodeStockId = originalItem.stock_id && originalItem.stock_id !== '' && originalItem.stock_id !== '0' 
//                             ? parseInt(originalItem.stock_id) : null;

//                         // Handle non-stock items and returns (quantity = 0)
//                         if (isNonStockItem || requiredQty === 0) {
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: isNonStockItem ? 0 : (barcodeStockId || 0),
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                             continue;
//                         }

//                         // Only allocate stock if this is a sale invoice
//                         if (invoice_type === 'sale') {
//                             let stockAllocated = 0;
//                             let remainingQty = requiredQty;

//                             // PRIORITY 1: Use barcode stock_id if provided
//                             if (barcodeStockId) {
//                                 console.log(`Attempting to allocate from barcode stock_id: ${barcodeStockId} for item: ${originalItem.item_name || originalItem.item}`);
                                
//                                 const barcodeStockInfo = barcodeStocksMap[barcodeStockId];

//                                 if (barcodeStockInfo && 
//                                     barcodeStockInfo.available_quantity > 0 && 
//                                     barcodeStockInfo.item_id === originalItem.item) {
                                    
//                                     const availableQty = parseFloat(barcodeStockInfo.available_quantity);
//                                     const allocateQty = Math.min(availableQty, remainingQty);

//                                     // ✅ Collect update instead of executing immediately
//                                     stockUpdatesToApply.push({
//                                         stock_id: barcodeStockId,
//                                         quantity: allocateQty
//                                     });

//                                     // Update in-memory available quantity
//                                     barcodeStockInfo.available_quantity -= allocateQty;

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: barcodeStockId,
//                                         rack_no: barcodeStockInfo.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     stockAllocated += allocateQty;
//                                     remainingQty -= allocateQty;
//                                     totalCOGS += allocateQty * barcodeStockInfo.final_price;

//                                     console.log(`Allocated ${allocateQty} from barcode stock_id: ${barcodeStockId}. Remaining: ${remainingQty}`);

//                                     // Mark as exhausted if fully used
//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(barcodeStockId);
//                                     }
//                                 } else {
//                                     console.log(`Barcode stock_id ${barcodeStockId} not available or doesn't match item ${originalItem.item}`);
//                                 }
//                             }

//                             // PRIORITY 2: If we still need more quantity, use existing FIFO logic
//                             if (remainingQty > 0) {
//                                 console.log(`Still need ${remainingQty} quantity for item ${originalItem.item_name || originalItem.item}, using FIFO allocation`);

//                                 let availableStocks = availableStocksMap[originalItem.item] || [];
                                
//                                 // Filter out exhausted stocks and barcode stock
//                                 availableStocks = availableStocks.filter(stock => 
//                                     !exhaustedStocks.has(stock.stock_id) && 
//                                     stock.stock_id !== barcodeStockId &&
//                                     stock.available_quantity > 0
//                                 );

//                                 if (availableStocks.length === 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Required: ${remainingQty}, Available from barcode: ${stockAllocated}`);
//                                 }

//                                 // Allocate remaining quantity using FIFO
//                                 let qtyToAllocate = remainingQty;
//                                 for (const stock of availableStocks) {
//                                     if (qtyToAllocate <= 0) break;

//                                     const availableQty = parseFloat(stock.available_quantity);
//                                     const allocateQty = Math.min(availableQty, qtyToAllocate);
                                    
//                                     // ✅ Collect update instead of executing immediately
//                                     stockUpdatesToApply.push({
//                                         stock_id: stock.stock_id,
//                                         quantity: allocateQty
//                                     });

//                                     // Update in-memory available quantity
//                                     stock.available_quantity -= allocateQty;

//                                     processedItems.push({
//                                         ...originalItem,
//                                         stock_id: stock.stock_id,
//                                         rack_no: stock.rack_no || rack_no || null,
//                                         quantity: allocateQty,
//                                         invoice_type: invoice_type
//                                     });

//                                     totalCOGS += allocateQty * stock.final_price;
//                                     qtyToAllocate -= allocateQty;

//                                     if (allocateQty >= availableQty) {
//                                         exhaustedStocks.add(stock.stock_id);
//                                     }

//                                     console.log(`FIFO allocated ${allocateQty} from stock_id: ${stock.stock_id}. Remaining to allocate: ${qtyToAllocate}`);
//                                 }

//                                 if (qtyToAllocate > 0) {
//                                     throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Still need: ${qtyToAllocate}`);
//                                 }
//                             }
//                         } else {
//                             // For quotations and holds, just add the items without stock allocation
//                             processedItems.push({
//                                 ...originalItem,
//                                 stock_id: 0,
//                                 rack_no: rack_no || null,
//                                 quantity: requiredQty,
//                                 invoice_type: invoice_type
//                             });
//                         }
//                     }

//                     // ✅ OPTIMIZED: Apply all stock updates in ONE bulk query
//                     if (stockUpdatesToApply.length > 0) {
//                         const stockUpdateMap = {};
//                         stockUpdatesToApply.forEach(update => {
//                             stockUpdateMap[update.stock_id] = (stockUpdateMap[update.stock_id] || 0) + update.quantity;
//                         });

//                         const stockIds = Object.keys(stockUpdateMap);
//                         const caseStatements = stockIds
//                             .map(stockId => `WHEN ${stockId} THEN IFNULL(allocated_quantity, 0) + ${stockUpdateMap[stockId]}`)
//                             .join(' ');

//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 `UPDATE stock 
//                                  SET allocated_quantity = CASE id ${caseStatements} ELSE allocated_quantity END
//                                  WHERE id IN (${stockIds.join(',')})`,
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     }

//                     // STEP 3: Determine invoice number
//                     let nextInvoiceNo;
//                     if (invoice_no_for_update) {
//                         nextInvoiceNo = invoice_no_for_update;
                        
//                         // Delete all existing items
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                                 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
//                                 [nextInvoiceNo],
//                                 (err) => err ? reject(err) : resolve()
//                             );
//                         });
//                     } else {
//                         const invoiceResults = await new Promise((resolve, reject) => {
//                             connection.query(
//                                 "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
//                                 (err, results) => err ? reject(err) : resolve(results)
//                             );
//                         });
//                         nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
//                     }

//                     // STEP 4: Insert all items
//                     if (processedItems.length > 0) {
//                         await new Promise((resolve, reject) => {
//                             connection.query(
//                               `INSERT INTO invoice_pharmacy (
//                                     invoice_no, item, price, quantity, discount,
//                                     phone_no, full_name, age, stock_id, stock_type,
//                                     price_after_discount, invoice_date, rack_no,
//                                     patient_id, doctor_invoice_id, gst,
//                                     return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
//                                     book_id, phone_no_type, invoice_type, invoice_status, alert_date, appointment_date, user_name, location, staff_id, commission_amount, purchase_price_non_stock
//                                 ) VALUES ?`,
//                               [
//                                 processedItems.map((item) => [
//                                   nextInvoiceNo,
//                                   item.item,
//                                   item.price,
//                                   item.quantity,
//                                   item.discount,
//                                   item.phone_no,
//                                   item.full_name,
//                                   item.age,
//                                   item.stock_id || 0,
//                                   item.stock_type || null,
//                                   item.rate_after_discount,
//                                   formatDate(item.invoice_date || new Date()),
//                                   JSON.stringify(item.rack_no) || null,
//                                   patient_id,
//                                   doctor_id,
//                                   item.gst || 0,
//                                   item.return_unit || 0,
//                                   item.total_return_amount || 0,
//                                   remaining_amount || 0,
//                                   advance || 0,
//                                   item.total || 0,
//                                   grand_total || 0,
//                                   delivery_date || null,
//                                   book_id || null,
//                                   phone_no_type || null,
//                                   invoice_type,
//                                   invoice_status || "paid",
//                                   alert_date || null,
//                                   appointment_date || null,
//                                   user_name || 'Unknown',
//                                   item.location || null,
//                                  (item.staff_id == null ? 0 : item.staff_id) || 0,
//                                  (item.commission_amount == '' ? 0 : item.commission_amount) || 0,
//                                  (item.item_purchase_price == '' ? 0 : item.item_purchase_price) || 0
//                                 ]),
//                               ],
//                               (err, result) =>
//                                 err ? reject(err) : resolve(result)
//                             );
//                         });
//                     }

//                     // Commit transaction
//                     connection.commit(err => {
//                         if (err) {
//                             return connection.rollback(() => {
//                                 connection.release();
//                                 console.error('Commit error:', err);
//                                 res.status(500).send({ error: 'Transaction commit failed.' });
//                             });
//                         }

//                         connection.release();
                        
//                         // Prepare response
//                         const responseItems = items.map(requestItem => {
//                             const matchingProcessed = processedItems.filter(pItem => 
//                                 (pItem.hidden_id === requestItem.hidden_id) || 
//                                 (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
//                             );
                            
//                             if (matchingProcessed.length > 0) {
//                                 return {
//                                     ...requestItem,
//                                     invoice_no: nextInvoiceNo,
//                                     stock_id: matchingProcessed[0].stock_id,
//                                     rack_no: matchingProcessed[0].rack_no || rack_no,
//                                     quantity: parseFloat(requestItem.quantity),
//                                     remaining_amount: remaining_amount || 0,
//                                     advance: advance || 0,
//                                     grand_total: grand_total || 0,
//                                     delivery_date: delivery_date || null,
//                                     book_id: book_id || null,
//                                     phone_no_type: phone_no_type || null,
//                                     invoice_type: invoice_type,
//                                     invoice_status: invoice_status || 'paid',
//                                     alert_date: alert_date || null,
//                                     user_name: user_name || 'Unknown'
//                                 };
//                             }
                            
//                             return {
//                                 ...requestItem,
//                                 invoice_no: nextInvoiceNo,
//                                 quantity: parseFloat(requestItem.quantity),
//                                 rack_no: rack_no || null,
//                                 remaining_amount: remaining_amount || 0,
//                                 advance: advance || 0,
//                                 grand_total: grand_total || 0,
//                                 delivery_date: delivery_date || null,
//                                 book_id: book_id || null,
//                                 phone_no_type: phone_no_type || null,
//                                 invoice_type: invoice_type,
//                                 invoice_status: invoice_status || 'paid',
//                                 alert_date: alert_date || null,
//                                 user_name: user_name || 'Unknown'
//                             };
//                         });

//                         res.status(200).json({
//                             message: 'Invoice processed successfully',
//                             invoice_no: nextInvoiceNo,
//                             items: responseItems,
//                             cogs: invoice_type === 'sale' ? totalCOGS : 0,
//                             invoice_type: invoice_type
//                         });
//                     });

//                 } catch (error) {
//                     connection.rollback(() => {
//                         connection.release();
//                         console.error('Error processing invoice:', error);
//                         res.status(500).json({
//                             error: 'Error processing invoice',
//                             message: error.message
//                         });
//                     });
//                 }
//             };

//             processItems();
//         });
//     });
// });



//accurate query removing loops
app.post('/insert-invoice-pharmacy', (req, res) => {
    const items = req.body.tableData;
    const invoice_no_for_update = req.body.invoice_no_get;
    const patient_id = req.body.patient_id == "" ? 0 : req.body.patient_id;
    const doctor_id = req.body.doctor_id;
    const rack_no = req.body.rack_no;
    const delivery_date = req.body.delivery_date;
    const advance = req.body.advance;
    const grand_total = req.body.grand_total;
    const remaining_amount = req.body.remaining_amount;
    const book_id = req.body.book_id;
    const invoice_status = req.body.invoice_status;
    const alert_date = req.body.alert_date;
    const phone_no_type = req.body.phone_no_type;
    const invoice_type = req.body.invoice_type || 'sale';
    const user_name = req.body.user_name || 'Unknown';

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).send({ error: 'Database connection error.' });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error('Transaction error:', err);
                return res.status(500).send({ error: 'Could not start transaction.' });
            }

            const processItems = async () => {
                try {
                    // STEP 1: Handle existing items if this is an update
                    let existingItems = [];
                    let previousInvoiceType = 'sale';
                    
                    if (invoice_no_for_update) {
                        const existingData = await new Promise((resolve, reject) => {
                            connection.query(
                                'SELECT id, item, stock_id, quantity, invoice_type FROM invoice_pharmacy WHERE invoice_no = ? LIMIT 1',
                                [invoice_no_for_update],
                                (err, results) => err ? reject(err) : resolve(results[0])
                            );
                        });
                        
                        if (existingData) {
                            previousInvoiceType = existingData.invoice_type || 'sale';
                        }

                        existingItems = await new Promise((resolve, reject) => {
                            connection.query(
                                'SELECT id, item, stock_id, quantity FROM invoice_pharmacy WHERE invoice_no = ?',
                                [invoice_no_for_update],
                                (err, results) => err ? reject(err) : resolve(results)
                            );
                        });

                        // BATCH UPDATE: Deallocate all existing stock in one query
                        if ((previousInvoiceType === 'sale' || previousInvoiceType === 'stock out') && (invoice_type === 'quotation' || invoice_type === 'hold' || invoice_type === 'sale' || invoice_type === 'stock out')) {
                            const stockUpdates = existingItems
                                .filter(item => item.stock_id !== 0)
                                .map(item => `WHEN ${item.stock_id} THEN allocated_quantity - ${item.quantity}`)
                                .join(' ');

                            if (stockUpdates) {
                                const stockIds = existingItems
                                    .filter(item => item.stock_id !== 0)
                                    .map(item => item.stock_id);

                                await new Promise((resolve, reject) => {
                                    connection.query(
                                        `UPDATE stock SET allocated_quantity = CASE id ${stockUpdates} END WHERE id IN (?)`,
                                        [stockIds],
                                        (err) => err ? reject(err) : resolve()
                                    );
                                });
                            }
                        }
                    }

                    // STEP 2: Process all items with enhanced stock management
                    const processedItems = [];
                    let totalCOGS = 0;
                    const exhaustedStocks = new Set();

                    // Collect all barcode stock IDs and item IDs for batch queries
                    const barcodeStockIds = [];
                    const itemIds = [];
                    const itemMap = new Map(); // Map to track items by index

                    items.forEach((item, index) => {
                        const requiredQty = parseFloat(item.quantity);
                        const isNonStockItem = item.stock_type === 'Non Stock Item';
                        const barcodeStockId = item.stock_id && item.stock_id !== '' && item.stock_id !== '0' 
                            ? parseInt(item.stock_id) : null;

                        itemMap.set(index, {
                            originalItem: item,
                            requiredQty,
                            isNonStockItem,
                            barcodeStockId
                        });

                        if (!isNonStockItem && requiredQty > 0 && (invoice_type === 'sale' || invoice_type === 'stock out')) {
                            if (barcodeStockId) {
                                barcodeStockIds.push(barcodeStockId);
                            }
                            itemIds.push(item.item);
                        }
                    });

                    // BATCH QUERY: Fetch all barcode stocks in one query
                    let barcodeStocksMap = new Map();
                    if (barcodeStockIds.length > 0) {
                        const barcodeStocks = await new Promise((resolve, reject) => {
                            connection.query(
                                `SELECT 
                                    id,
                                    quantity,
                                    IFNULL(allocated_quantity, 0) AS allocated_quantity,
                                    (quantity - IFNULL(allocated_quantity, 0)) AS available_quantity,
                                    final_price,
                                    discount,
                                    rack_no,
                                    item_id
                                FROM stock 
                                WHERE id IN (?) AND stock_status = 'In Stock'`,
                                [barcodeStockIds],
                                (err, results) => err ? reject(err) : resolve(results)
                            );
                        });

                        barcodeStocks.forEach(stock => {
                            barcodeStocksMap.set(stock.id, stock);
                        });
                    }

                    // BATCH QUERY: Fetch all available stocks for all items in one query
                    let availableStocksMap = new Map();
                    if (itemIds.length > 0 && (invoice_type === 'sale' || invoice_type === 'stock out')) {
                        const uniqueItemIds = [...new Set(itemIds)];
                        const availableStocks = await new Promise((resolve, reject) => {
                            connection.query(
                                `SELECT 
                                    s.id AS stock_id,
                                    s.item_id,
                                    s.final_price,
                                    s.discount,
                                    s.rack_no,
                                    (s.quantity - IFNULL(s.allocated_quantity, 0)) AS available_quantity,
                                    s.stock_date
                                FROM stock s
                                WHERE s.item_id IN (?)
                                    AND s.stock_status = 'In Stock'
                                    AND (s.quantity - IFNULL(s.allocated_quantity, 0)) > 0
                                ORDER BY s.item_id, s.stock_date ASC, s.id ASC`,
                                [uniqueItemIds],
                                (err, results) => err ? reject(err) : resolve(results)
                            );
                        });

                        availableStocks.forEach(stock => {
                            if (!availableStocksMap.has(stock.item_id)) {
                                availableStocksMap.set(stock.item_id, []);
                            }
                            availableStocksMap.get(stock.item_id).push(stock);
                        });
                    }

                    // Track real-time allocations to prevent over-allocation
                    const realTimeAllocations = new Map(); // stock_id -> total allocated quantity
                    
                    // Process each item using the batch-loaded data
                    const stockAllocations = []; // Track all stock allocations for batch update

                    for (const [index, itemData] of itemMap.entries()) {
                        const { originalItem, requiredQty, isNonStockItem, barcodeStockId } = itemData;

                        // Handle non-stock items and returns (quantity = 0)
                        if (isNonStockItem || requiredQty === 0) {
                            processedItems.push({
                                ...originalItem,
                                stock_id: isNonStockItem ? 0 : (barcodeStockId || 0),
                                rack_no: rack_no || null,
                                quantity: requiredQty,
                                invoice_type: invoice_type
                            });
                            continue;
                        }

                        // Only allocate stock if this is a sale invoice
                        // if (invoice_type === 'sale') {
                        if (invoice_type === 'sale' || invoice_type === 'stock out') {
                            let stockAllocated = 0;
                            let remainingQty = requiredQty;

                            // PRIORITY 1: Use barcode stock_id if provided
                            if (barcodeStockId && barcodeStocksMap.has(barcodeStockId)) {
                                const barcodeStockInfo = barcodeStocksMap.get(barcodeStockId);
                                
                                // Calculate truly available quantity considering real-time allocations
                                const alreadyAllocated = realTimeAllocations.get(barcodeStockId) || 0;
                                const trueAvailableQty = parseFloat(barcodeStockInfo.available_quantity) - alreadyAllocated;
                                
                                if (barcodeStockInfo.item_id === originalItem.item && trueAvailableQty > 0) {
                                    const allocateQty = Math.min(trueAvailableQty, remainingQty);

                                    // Track allocation for batch update
                                    stockAllocations.push({
                                        stock_id: barcodeStockId,
                                        quantity: allocateQty
                                    });

                                    // Update real-time allocation tracking
                                    realTimeAllocations.set(barcodeStockId, alreadyAllocated + allocateQty);

                                    processedItems.push({
                                        ...originalItem,
                                        stock_id: barcodeStockId,
                                        rack_no: barcodeStockInfo.rack_no || rack_no || null,
                                        quantity: allocateQty,
                                        invoice_type: invoice_type
                                    });

                                    stockAllocated += allocateQty;
                                    remainingQty -= allocateQty;
                                    totalCOGS += allocateQty * barcodeStockInfo.final_price;

                                    // Mark as exhausted if fully used
                                    if (trueAvailableQty <= allocateQty) {
                                        exhaustedStocks.add(barcodeStockId);
                                    }
                                } else if (barcodeStockInfo.item_id === originalItem.item && trueAvailableQty <= 0) {
                                    console.log(`Barcode stock_id ${barcodeStockId} already fully allocated in this transaction`);
                                }
                            }

                            // PRIORITY 2: If we still need more quantity, use existing FIFO logic
                            if (remainingQty > 0) {
                                const availableStocks = availableStocksMap.get(originalItem.item) || [];
                                
                                if (availableStocks.length === 0 && remainingQty > 0) {
                                    throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Required: ${remainingQty}, Available from barcode: ${stockAllocated}`);
                                }

                                // Allocate remaining quantity using FIFO
                                let qtyToAllocate = remainingQty;
                                for (const stock of availableStocks) {
                                    if (qtyToAllocate <= 0) break;
                                    
                                    // Skip exhausted stocks and barcode stock
                                    if (exhaustedStocks.has(stock.stock_id) || stock.stock_id === barcodeStockId) {
                                        continue;
                                    }

                                    // Calculate truly available quantity considering real-time allocations
                                    const alreadyAllocated = realTimeAllocations.get(stock.stock_id) || 0;
                                    const trueAvailableQty = parseFloat(stock.available_quantity) - alreadyAllocated;
                                    
                                    if (trueAvailableQty <= 0) {
                                        exhaustedStocks.add(stock.stock_id);
                                        continue;
                                    }

                                    const allocateQty = Math.min(trueAvailableQty, qtyToAllocate);
                                    
                                    // Track allocation for batch update
                                    stockAllocations.push({
                                        stock_id: stock.stock_id,
                                        quantity: allocateQty
                                    });

                                    // Update real-time allocation tracking
                                    realTimeAllocations.set(stock.stock_id, alreadyAllocated + allocateQty);

                                    processedItems.push({
                                        ...originalItem,
                                        stock_id: stock.stock_id,
                                        rack_no: stock.rack_no || rack_no || null,
                                        quantity: allocateQty,
                                        invoice_type: invoice_type
                                    });

                                    totalCOGS += allocateQty * stock.final_price;
                                    qtyToAllocate -= allocateQty;

                                    if (trueAvailableQty <= allocateQty) {
                                        exhaustedStocks.add(stock.stock_id);
                                    }
                                }

                                if (qtyToAllocate > 0) {
                                    throw new Error(`Insufficient stock for item ${originalItem.item_name || originalItem.item}. Still need: ${qtyToAllocate}`);
                                }
                            }
                        } else {
                            // For quotations and holds, just add the items without stock allocation
                            processedItems.push({
                                ...originalItem,
                                stock_id: 0,
                                rack_no: rack_no || null,
                                quantity: requiredQty,
                                invoice_type: invoice_type
                            });
                        }
                    }

                    // BATCH UPDATE: Update all stock allocations in one query
                    if (stockAllocations.length > 0) {
                        const stockUpdateMap = new Map();
                        stockAllocations.forEach(alloc => {
                            const current = stockUpdateMap.get(alloc.stock_id) || 0;
                            stockUpdateMap.set(alloc.stock_id, current + alloc.quantity);
                        });

                        const stockUpdates = Array.from(stockUpdateMap.entries())
                            .map(([stock_id, qty]) => `WHEN ${stock_id} THEN allocated_quantity + ${qty}`)
                            .join(' ');

                        const stockIds = Array.from(stockUpdateMap.keys());

                        await new Promise((resolve, reject) => {
                            connection.query(
                                `UPDATE stock SET allocated_quantity = CASE id ${stockUpdates} END WHERE id IN (?)`,
                                [stockIds],
                                (err) => err ? reject(err) : resolve()
                            );
                        });
                    }

                    // STEP 3: Determine invoice number
                    let nextInvoiceNo;
                    if (invoice_no_for_update) {
                        nextInvoiceNo = invoice_no_for_update;
                        
                        // Delete all existing items
                        await new Promise((resolve, reject) => {
                            connection.query(
                                'DELETE FROM invoice_pharmacy WHERE invoice_no = ?',
                                [nextInvoiceNo],
                                (err) => err ? reject(err) : resolve()
                            );
                        });
                    } else {
                        const invoiceResults = await new Promise((resolve, reject) => {
                            connection.query(
                                "SELECT MAX(invoice_no) as max_invoice FROM invoice_pharmacy",
                                (err, results) => err ? reject(err) : resolve(results)
                            );
                        });
                        nextInvoiceNo = (invoiceResults[0].max_invoice || 999) + 1;
                    }

                    // STEP 4: Insert all items
                    if (processedItems.length > 0) {
                        await new Promise((resolve, reject) => {
                            connection.query(
                              `INSERT INTO invoice_pharmacy (
                                    invoice_no, item, price, quantity, discount,
                                    phone_no, full_name, age, stock_id, stock_type,
                                    price_after_discount, invoice_date, rack_no,
                                    patient_id, doctor_invoice_id, gst,
                                    return_unit, total_return_amount, remaining_amount, advance, total, grand_total, delivery_date, 
                                    book_id, phone_no_type, invoice_type, invoice_status, alert_date, user_name, location, staff_id, commission_amount, purchase_price_non_stock
                                ) VALUES ?`,
                              [
                                processedItems.map((item) => [
                                  nextInvoiceNo,
                                  item.item,
                                  item.price,
                                  item.quantity,
                                  item.discount,
                                  item.phone_no,
                                  item.full_name,
                                  item.age,
                                  item.stock_id || 0,
                                  item.stock_type || null,
                                  item.rate_after_discount,
                                  formatDate(item.invoice_date || new Date()),
                                  JSON.stringify(item.rack_no) || null,
                                  patient_id,
                                  doctor_id,
                                  item.gst || 0,
                                  item.return_unit || 0,
                                  item.total_return_amount || 0,
                                  remaining_amount || 0,
                                  advance || 0,
                                  item.total || 0,
                                  grand_total || 0,
                                  delivery_date || null,
                                  book_id || null,
                                  phone_no_type || null,
                                  invoice_type,
                                  invoice_status || "paid",
                                  alert_date || null,
                                  user_name || 'Unknown',
                                  item.location || null,
                                  (item.staff_id == null ? 0 : item.staff_id) || 0,
                                  (item.commission_amount == '' ? 0 : item.commission_amount) || 0,
                                  (item.item_purchase_price == '' ? 0 : item.item_purchase_price) || 0
                                ]),
                              ],
                              (err, result) =>
                                err ? reject(err) : resolve(result)
                            );
                        });
                    }

                    // Commit transaction
                    connection.commit(err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error('Commit error:', err);
                                res.status(500).send({ error: 'Transaction commit failed.' });
                            });
                        }

                        connection.release();
                        
                        // Prepare response
                        const responseItems = items.map(requestItem => {
                            const matchingProcessed = processedItems.filter(pItem => 
                                (pItem.hidden_id === requestItem.hidden_id) || 
                                (!pItem.hidden_id && !requestItem.hidden_id && pItem.item === requestItem.item)
                            );
                            
                            if (matchingProcessed.length > 0) {
                                return {
                                    ...requestItem,
                                    invoice_no: nextInvoiceNo,
                                    stock_id: matchingProcessed[0].stock_id,
                                    rack_no: matchingProcessed[0].rack_no || rack_no,
                                    quantity: parseFloat(requestItem.quantity),
                                    remaining_amount: remaining_amount || 0,
                                    advance: advance || 0,
                                    grand_total: grand_total || 0,
                                    delivery_date: delivery_date || null,
                                    book_id: book_id || null,
                                    phone_no_type: phone_no_type || null,
                                    invoice_type: invoice_type,
                                    invoice_status: invoice_status || 'paid',
                                    alert_date: alert_date || null,
                                    user_name: user_name || 'Unknown'
                                };
                            }
                            
                            return {
                                ...requestItem,
                                invoice_no: nextInvoiceNo,
                                quantity: parseFloat(requestItem.quantity),
                                rack_no: rack_no || null,
                                remaining_amount: remaining_amount || 0,
                                advance: advance || 0,
                                grand_total: grand_total || 0,
                                delivery_date: delivery_date || null,
                                book_id: book_id || null,
                                phone_no_type: phone_no_type || null,
                                invoice_type: invoice_type,
                                invoice_status: invoice_status || 'paid',
                                alert_date: alert_date || null,
                                user_name: user_name || 'Unknown'
                            };
                        });

                        res.status(200).json({
                            message: 'Invoice processed successfully',
                            invoice_no: nextInvoiceNo,
                            items: responseItems,
                            cogs: (invoice_type === 'sale' || invoice_type === 'stock out') ? totalCOGS : 0,
                            invoice_type: invoice_type
                        });
                    });

                } catch (error) {
                    connection.rollback(() => {
                        connection.release();
                        console.error('Error processing invoice:', error);
                        res.status(500).json({
                            error: 'Error processing invoice',
                            message: error.message
                        });
                    });
                }
            };

            processItems();
        });
    });
});



app.post('/insert-invoice', (req, res) => {
    const items = req.body.tableData; // Assuming the array of items is sent in the request body
    const invoice_no_for_update = req.body.invoice_no_get;
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit format
        const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit format
        return `${year}-${month}-${day}`;
    };

    const update_values = items
        .filter(item => item.hidden_id !== '')
        .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount, item.total, item.invoice_no,
            item.phone_no, item.full_name, item.stock_id, item.gst, item.rate_after_discount,
            item.invoice_date, item.rack_no, item.return_unit, item.total_return_amount, item.age, item.weight, item.bp, item.patient_id]);

    let sql = 'UPDATE invoice SET ';
    const values = [];

    //  console.log(update_values, "this is update values");

    // return false;

    update_values.forEach((data, index) => {
        const id = data[0];
        const item = data[1];
        const price = data[2];
        const quantity = data[3];
        const discount = data[4];
        const total = data[5];
        const invoice_no = data[6];
        const phone_no = data[7];
        const full_name = data[8];
        const stock_id = data[9];
        const gst = data[10];
        const rate_after_discount = data[11];
        const invoice_date = data[12];
        const rack_no = data[13];
        const return_unit = (data[14] === null || data[14] === '') ? 0 : data[15];
        const total_return_amount = 0;
        const age = data[16];
        const weight = data[17];
        const bp = data[18];
        const patient_id = data[19];


        sql += `item = CASE WHEN id = ? THEN ? ELSE item END, `;
        sql += `price = CASE WHEN id = ? THEN ? ELSE price END, `;
        sql += `quantity = CASE WHEN id = ? THEN ? ELSE quantity END, `;
        sql += `discount = CASE WHEN id = ? THEN ? ELSE discount END, `;
        sql += `phone_no = CASE WHEN id = ? THEN ? ELSE phone_no END, `;
        sql += `full_name = CASE WHEN id = ? THEN ? ELSE full_name END, `;
        sql += `price_after_discount = CASE WHEN id = ? THEN ? ELSE price_after_discount END, `;
        sql += `invoice_date = CASE WHEN id = ? THEN ? ELSE invoice_date END, `;
        sql += `rack_no = CASE WHEN id = ? THEN ? ELSE rack_no END, `;
        sql += `return_unit = CASE WHEN id = ? THEN ? ELSE return_unit END, `;
        sql += `total_return_amount = CASE WHEN id = ? THEN ? ELSE total_return_amount END, `;
        sql += `age = CASE WHEN id = ? THEN ? ELSE age END, `;
        sql += `weight = CASE WHEN id = ? THEN ? ELSE weight END, `;
        sql += `bp = CASE WHEN id = ? THEN ? ELSE bp END, `;
        sql += `patient_id = CASE WHEN id = ? THEN ? ELSE patient_id END, `;

        values.push(id, item);
        values.push(id, price);
        values.push(id, quantity);
        values.push(id, discount);
        values.push(id, phone_no);
        values.push(id, full_name);
        values.push(id, rate_after_discount);
        values.push(id, invoice_date);
        values.push(id, rack_no);
        values.push(id, return_unit);
        values.push(id, total_return_amount);
        values.push(id, age);
        values.push(id, weight);
        values.push(id, bp);
        values.push(id, patient_id);
    });

    sql = sql.slice(0, -2); // Remove the trailing comma
    sql += ' WHERE id IN (?)';

    const ids = update_values.map(data => data[0]);
    values.push(ids);

    connection.query(sql, values, (error, results, fields) => {
        if (error) {
            console.error('Error updating items:', error);
        }
    });

    const check_invoice_no = "SELECT invoice_no FROM invoice ORDER BY invoice_no DESC LIMIT 1";

    connection.getConnection((error, connection) => {
        if (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Error retrieving last invoice number' });
        }

        connection.query(check_invoice_no, (error, results) => {
            if (error) {
                connection.release();
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

            console.log(invoice_no_for_update, "this is invoice no");
            if (update_values.length > 0) {
                nextInvoiceNo = update_values[0][6];
            } else if (invoice_no_for_update !== '') {
                nextInvoiceNo = invoice_no_for_update;
            }

            const values = items
                .filter(item => item.hidden_id === '')
                .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.phone_no, item.full_name, item.rate_after_discount, item.invoice_date, item.rack_no, item.status, item.age, item.weight, item.bp, item.patient_id]);

            console.log(values.length);

            if (values.length == 0) {
                // Add invoice_no to each item in the response
                items.forEach(item => {
                    item.invoice_no = nextInvoiceNo; // Add invoice_no to each item
                    item.price_after_discount = item.rate_after_discount;
                });
                return res.status(200).json({ message: 'Invoice Update Successfully', items: items });
            }

            const sql = 'INSERT INTO invoice (invoice_no, item, price, quantity, discount, phone_no, full_name, price_after_discount, invoice_date, rack_no, status, age, weight, bp, patient_id) VALUES ?';

            connection.query(sql, [values], (error, result) => {
                connection.release();
                if (error) {
                    console.error('Error inserting data:', error);
                    return res.status(500).json({ error: 'Error inserting data' });
                } else {
                    // Add invoice_no to each item in the response
                    items.forEach(item => {
                        item.invoice_no = nextInvoiceNo; // Add invoice_no to each item
                        item.price_after_discount = item.rate_after_discount;
                    });

                    wss.broadcast({
                        type: 'invoice_updated',
                        invoice_no: invoice_no_for_update == '' ? nextInvoiceNo : invoice_no_for_update
                      });
                      
                    return res.status(200).json({ message: 'Inserted', items: items });
                }
            });
        });
    });


    
});



function getInvoice() {

}






// app.post('/insert-stock', (req, res) => {
//   const items = req.body; // Assuming the array of items is sent in the request body


//   console.log(items);

//   const update_values = items
//     .filter(item => item.hidden_id !== '')
//     .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount, item.total, item.invoice_no, item.remarks, item.stock_date, item.priceOption, item.discountOption, item.purchase_price,
//       item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount,  item.after_discount_total, item.supplier_id, item.final_price, item.rack_no
//     ]);

//   // Construct the bulk update query
//   let sql = 'UPDATE stock SET ';
//   const values = [];

//   update_values.forEach((data, index) => {
//     const id = data[0];
//     const item = data[1];
//     const price = data[2];
//     const quantity = data[3];
//     const discount = data[4];
//     const total = data[5];
//     const invoice_no = data[6];
//     const remarks = data[7];
//     const stock_date = data[8];
//     const priceOption = data[9];
//     const discountOption = data[10];
//     const purchase_price = data[11];
//     const packet_quantity = data[12];
//     const per_packet_quantity = data[13];
//     const selling_price = data[14];
//     const price_after_discount = data[15];
//     const after_discount_total = data[16];
//     const supplier_id = data[17];
//     const final_price = data[18];
//     const rack_no = data[19];

//     // Add SET clause for each row
//     sql += `item_id = CASE WHEN id = ? THEN ? ELSE item_id END, `;
//     sql += `price = CASE WHEN id = ? THEN ? ELSE price END, `;
//     sql += `quantity = CASE WHEN id = ? THEN ? ELSE quantity END, `;
//     sql += `discount = CASE WHEN id = ? THEN ? ELSE discount END, `;
//     sql += `total = CASE WHEN id = ? THEN ? ELSE total END, `;
//     sql += `remarks = CASE WHEN id = ? THEN ? ELSE remarks END, `;
//     sql += `stock_date = CASE WHEN id = ? THEN ? ELSE stock_date END, `;
//     sql += `price_option = CASE WHEN id = ? THEN ? ELSE price_option END, `;
//     sql += `discount_option = CASE WHEN id = ? THEN ? ELSE discount_option END, `;
//     sql += `purchase_price = CASE WHEN id = ? THEN ? ELSE purchase_price END, `;
//     sql += `packet_quantity = CASE WHEN id = ? THEN ? ELSE packet_quantity END, `;
//     sql += `per_packet_quantity = CASE WHEN id = ? THEN ? ELSE per_packet_quantity END, `;
//     sql += `selling_price = CASE WHEN id = ? THEN ? ELSE selling_price END, `;
//     sql += `price_after_discount = CASE WHEN id = ? THEN ? ELSE price_after_discount END, `;
//     sql += `after_discount_total = CASE WHEN id = ? THEN ? ELSE after_discount_total END, `;
//     sql += `supplier_id = CASE WHEN id = ? THEN ? ELSE supplier_id END, `;
//     sql += `final_price = CASE WHEN id = ? THEN ? ELSE final_price END, `;
//     sql += `rack_no = CASE WHEN id = ? THEN ? ELSE rack_no END, `;
//     // Push values for price update
//     values.push(id, item);
//     values.push(id, price);
//     values.push(id, quantity);
//     values.push(id, discount);
//     values.push(id, total);
//     values.push(id, remarks);
//     values.push(id, stock_date);
//     values.push(id, priceOption);
//     values.push(id, discountOption);
//     values.push(id, purchase_price);
//     values.push(id, packet_quantity);
//     values.push(id, per_packet_quantity);
//     values.push(id, selling_price);
//     values.push(id, price_after_discount);
//     values.push(id, after_discount_total);
//     values.push(id, supplier_id);
//     values.push(id, final_price);
//     values.push(id, rack_no);
//   });

//   // Remove the trailing comma and space
//   sql = sql.slice(0, -2);

//   // Add WHERE clause based on the IDs
//   sql += ' WHERE id IN (?)';

//   // Push all IDs into values array
//   const ids = update_values.map(data => data[0]);
//   values.push(ids);

//   // Execute the bulk update query
//   connection.query(sql, values, (error, results, fields) => {
//     if (error) {
//       console.error('Error updating items:', error);
//     } else {
//       // return res.status(200).json({ message: 'Invoice Update Successfully' });
//     }

//   });



//   // Query to retrieve the last invoice number
//   const check_invoice_no = "SELECT invoice_no FROM stock ORDER BY invoice_no DESC LIMIT 1";

//   connection.getConnection((error, connection) => {
//     if (error) {
//       console.error('Error:', error);
//       return res.status(500).json({ error: 'Error retrieving last invoice number' });
//     }

//     connection.query(check_invoice_no, (error, results) => {
//       if (error) {
//         connection.release(); // Release the connection
//         console.error('Error retrieving last invoice number:', error);
//         return res.status(500).json({ error: 'Error retrieving last invoice number' });
//       }

//       let nextInvoiceNo;

//       if (results == "") {
//         nextInvoiceNo = 1000;
//       } else {
//         const lastInvoiceNo = results[0].invoice_no;
//         nextInvoiceNo = lastInvoiceNo + 1;
//       }

//       if (update_values.length > 0) {
//         nextInvoiceNo = update_values[0][6];
//         console.log(nextInvoiceNo);
//       }

//       // Prepare values for insertion
//       // const values = items.map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total, item.priceOption, item.discountOption, item.remarks, item.date_of_expiry]);

//       const values = items
//         .filter(item => item.hidden_id === '')
//         .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total, item.priceOption, item.discountOption, item.remarks, item.stock_date, item.purchase_price, item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, item.supplier_id, item.final_price, item.rack_no]);


//         if (values.length == 0) {
//            return res.status(200).json({ message: 'Stock Update Successfully' });
//         }
//       // SQL query to insert stock data
//       const sql = 'INSERT INTO stock (invoice_no, item_id, price, quantity, discount, total, price_option, discount_option, remarks, stock_date, purchase_price, packet_quantity, per_packet_quantity, selling_price, price_after_discount, after_discount_total, supplier_id, final_price, rack_no) VALUES ?';

//       // Execute the insert query
//       connection.query(sql, [values], (error, result) => {
//         if (error) {
//           connection.release(); // Release the connection
//           console.error('Error inserting data:', error);
//           return res.status(500).json({ error: 'Error inserting data' });
//         }

//         // Create a new array to store the desired objects
//         const newData = [];

//         // Iterate through data and add objects to the new array based on conditions
//         items.forEach(item => {
//           const newItem = {
//             item: item.item,
//           };

//             newItem.priceOption = "update";
//             newItem.price = item.price;
//             newItem.discountOption = "update";
//             newItem.discount = item.discount;
//             newData.push(newItem);

//         });

//         // Construct and execute update query for each object
//         newData.forEach(data => {
//             let sql = 'UPDATE items SET ';
//             const values = [];

//             sql += 'price = ?, ';
//             values.push(data.price);

//             sql += 'discount = ?, ';
//             values.push(data.discount);

//           // Remove the trailing comma and space
//             sql = sql.slice(0, -2);

//             // Add the WHERE clause
//             sql += ' WHERE id = ?';

//             // Push the item_id to values array
//             values.push(data.item);

//           // Execute the query
//           connection.query(sql, values, (err, result) => {
//             if (err) {
//               console.error('Error updating data:', err);
//               return;
//             }
//             console.log(`Data updated successfully for item ${data.item}.`);
//           });
//         });

//         connection.release(); // Release the connection

//         return res.status(200).json({ "items": newData });
//       });
//     });
//   });
// });

// app.post('/insert-stock', (req, res) => {
//     const items = req.body; // Assuming the array of items is sent in the request body

//     const update_values = items
//         .filter(item => item.hidden_id !== '')
//         .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount, item.total, item.invoice_no, item.remarks, item.stock_date, item.priceOption, item.discountOption, item.purchase_price,
//             item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, item.supplier_id, item.final_price, item.rack_no, item.total_purchase_rate
//         ]);

//     // Construct the bulk update query
//     let sql = 'UPDATE stock SET ';
//     const values = [];

//     update_values.forEach((data, index) => {
//         const id = data[0];
//         const item = data[1];
//         const price = data[2];
//         const quantity = data[3];
//         const discount = data[4];
//         const total = data[5];
//         const invoice_no = data[6];
//         const remarks = data[7];
//         const stock_date = data[8];
//         const priceOption = data[9];
//         const discountOption = data[10];
//         const purchase_price = data[11];
//         const packet_quantity = data[12];
//         const per_packet_quantity = data[13];
//         const selling_price = data[14];
//         const price_after_discount = data[15];
//         const after_discount_total = data[16];
//         const supplier_id = data[17];
//         const final_price = data[18];
//         const rack_no = data[19];
//         const total_purchase_rate = data[20];

//         // Add SET clause for each row
//         sql += `item_id = CASE WHEN id = ? THEN ? ELSE item_id END, `;
//         sql += `price = CASE WHEN id = ? THEN ? ELSE price END, `;
//         sql += `quantity = CASE WHEN id = ? THEN ? ELSE quantity END, `;
//         sql += `discount = CASE WHEN id = ? THEN ? ELSE discount END, `;
//         sql += `total = CASE WHEN id = ? THEN ? ELSE total END, `;
//         sql += `remarks = CASE WHEN id = ? THEN ? ELSE remarks END, `;
//         sql += `stock_date = CASE WHEN id = ? THEN ? ELSE stock_date END, `;
//         sql += `price_option = CASE WHEN id = ? THEN ? ELSE price_option END, `;
//         sql += `discount_option = CASE WHEN id = ? THEN ? ELSE discount_option END, `;
//         sql += `purchase_price = CASE WHEN id = ? THEN ? ELSE purchase_price END, `;
//         sql += `packet_quantity = CASE WHEN id = ? THEN ? ELSE packet_quantity END, `;
//         sql += `per_packet_quantity = CASE WHEN id = ? THEN ? ELSE per_packet_quantity END, `;
//         sql += `selling_price = CASE WHEN id = ? THEN ? ELSE selling_price END, `;
//         sql += `price_after_discount = CASE WHEN id = ? THEN ? ELSE price_after_discount END, `;
//         sql += `after_discount_total = CASE WHEN id = ? THEN ? ELSE after_discount_total END, `;
//         sql += `supplier_id = CASE WHEN id = ? THEN ? ELSE supplier_id END, `;
//         sql += `final_price = CASE WHEN id = ? THEN ? ELSE final_price END, `;
//         sql += `rack_no = CASE WHEN id = ? THEN ? ELSE rack_no END, `;
//         sql += `total_purchase_rate = CASE WHEN id = ? THEN ? ELSE total_purchase_rate END, `;

//         // Push values for each field
//         values.push(id, item);
//         values.push(id, price);
//         values.push(id, quantity);
//         values.push(id, discount);
//         values.push(id, total);
//         values.push(id, remarks);
//         values.push(id, stock_date);
//         values.push(id, priceOption);
//         values.push(id, discountOption);
//         values.push(id, purchase_price);
//         values.push(id, packet_quantity);
//         values.push(id, per_packet_quantity);
//         values.push(id, selling_price);
//         values.push(id, price_after_discount);
//         values.push(id, after_discount_total);
//         values.push(id, supplier_id);
//         values.push(id, final_price);
//         values.push(id, rack_no.join(","));
//         values.push(id, total_purchase_rate);
//     });

//     // Remove the trailing comma and space
//     sql = sql.slice(0, -2);

//     // Add WHERE clause based on the IDs
//     sql += ' WHERE id IN (?)';

//     // Push all IDs into values array
//     const ids = update_values.map(data => data[0]);
//     values.push(ids);

//     // Execute the bulk update query
//     connection.query(sql, values, (error, results, fields) => {
//         if (error) {
//             console.error('Error updating items:', error);
//         } else {
//             // Stock updated
//         }
//     });

//     // Query to retrieve the last invoice number
//     const check_invoice_no = "SELECT invoice_no FROM stock ORDER BY invoice_no DESC LIMIT 1";

//     connection.getConnection((error, connection) => {
//         if (error) {
//             console.error('Error:', error);
//             return res.status(500).json({ error: 'Error retrieving last invoice number' });
//         }

//         connection.query(check_invoice_no, (error, results) => {
//             if (error) {
//                 connection.release();
//                 console.error('Error retrieving last invoice number:', error);
//                 return res.status(500).json({ error: 'Error retrieving last invoice number' });
//             }

//             let nextInvoiceNo;

//             if (results == "") {
//                 nextInvoiceNo = 1000;
//             } else {
//                 const lastInvoiceNo = results[0].invoice_no;
//                 nextInvoiceNo = lastInvoiceNo + 1;
//             }

//             if (update_values.length > 0) {
//                 nextInvoiceNo = update_values[0][6];
//                 console.log(nextInvoiceNo);
//             }

//             const values = items
//                 .filter(item => item.hidden_id === '')
//                 .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total, item.priceOption, item.discountOption, item.remarks, item.stock_date, item.purchase_price, item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, item.supplier_id, item.final_price, (item.rack_no).join(","), item.total_purchase_rate]);

//             const newData = [];

//             items.forEach(item => {
//                 const newItem = {
//                     item: item.item,
//                 };
//                 newItem.priceOption = "update";
//                 newItem.price = item.price;
//                 newItem.discountOption = "update";
//                 newItem.discount = item.discount;
//                 newData.push(newItem);
//             });

//             newData.forEach(data => {
//                 let sql = 'UPDATE items SET ';
//                 const values = [];

//                 sql += 'price = ?, ';
//                 values.push(data.price);

//                 sql += 'discount = ?, ';
//                 values.push(data.discount);

//                 sql += 'final_price = ?, ';
//                 values.push(data.final_price);

//                 sql = sql.slice(0, -2);
//                 sql += ' WHERE id = ?';

//                 values.push(data.item);

//                 connection.query(sql, values, (err, result) => {
//                     if (err) {
//                         console.error('Error updating data:', err);
//                         return;
//                     }
//                     console.log(`Data updated successfully for item ${data.item}.`);
//                 });
//             });

//             if (values.length == 0) {
//                 connection.release();
//                 return res.status(200).json({ message: 'Stock Update Successfully' });
//             }

//             const sql = 'INSERT INTO stock (invoice_no, item_id, price, quantity, discount, total, price_option, discount_option, remarks, stock_date, purchase_price, packet_quantity, per_packet_quantity, selling_price, price_after_discount, after_discount_total, supplier_id, final_price, rack_no, total_purchase_rate) VALUES ?';

//             connection.query(sql, [values], (error, result) => {
//                 if (error) {
//                     connection.release();
//                     console.error('Error inserting data:', error);
//                     return res.status(500).json({ error: 'Error inserting data' });
//                 }

//                 connection.release();
//                 return res.status(200).json({ "items": newData });
//             });
//         });
//     });
// });




// app.post('/insert-stock', (req, res) => {
//     const items = req.body; // Assuming the array of items is sent in the request body

//     const update_values = items
//         .filter(item => item.hidden_id !== '')
//         .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount, item.total, item.invoice_no, item.remarks, item.stock_date, item.priceOption, item.discountOption, item.purchase_price,
//             item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, item.supplier_id, item.final_price, item.rack_no, item.total_purchase_rate
//         ]);

//     // Construct the bulk update query
//     let sql = 'UPDATE stock SET ';
//     const values = [];

//     update_values.forEach((data, index) => {
//         const id = data[0];
//         const item = data[1];
//         const price = data[2];
//         const quantity = data[3];
//         const discount = data[4];
//         const total = data[5];
//         const invoice_no = data[6];
//         const remarks = data[7];
//         const stock_date = data[8];
//         const priceOption = data[9];
//         const discountOption = data[10];
//         const purchase_price = data[11];
//         const packet_quantity = data[12];
//         const per_packet_quantity = data[13];
//         const selling_price = data[14];
//         const price_after_discount = data[15];
//         const after_discount_total = data[16];
//         const supplier_id = data[17];
//         const final_price = data[18];
//         const rack_no = data[19];
//         const total_purchase_rate = data[20];

//         // Add SET clause for each row
//         sql += `item_id = CASE WHEN id = ? THEN ? ELSE item_id END, `;
//         sql += `price = CASE WHEN id = ? THEN ? ELSE price END, `;
//         sql += `quantity = CASE WHEN id = ? THEN ? ELSE quantity END, `;
//         sql += `discount = CASE WHEN id = ? THEN ? ELSE discount END, `;
//         sql += `total = CASE WHEN id = ? THEN ? ELSE total END, `;
//         sql += `remarks = CASE WHEN id = ? THEN ? ELSE remarks END, `;
//         sql += `stock_date = CASE WHEN id = ? THEN ? ELSE stock_date END, `;
//         sql += `price_option = CASE WHEN id = ? THEN ? ELSE price_option END, `;
//         sql += `discount_option = CASE WHEN id = ? THEN ? ELSE discount_option END, `;
//         sql += `purchase_price = CASE WHEN id = ? THEN ? ELSE purchase_price END, `;
//         sql += `packet_quantity = CASE WHEN id = ? THEN ? ELSE packet_quantity END, `;
//         sql += `per_packet_quantity = CASE WHEN id = ? THEN ? ELSE per_packet_quantity END, `;
//         sql += `selling_price = CASE WHEN id = ? THEN ? ELSE selling_price END, `;
//         sql += `price_after_discount = CASE WHEN id = ? THEN ? ELSE price_after_discount END, `;
//         sql += `after_discount_total = CASE WHEN id = ? THEN ? ELSE after_discount_total END, `;
//         sql += `supplier_id = CASE WHEN id = ? THEN ? ELSE supplier_id END, `;
//         sql += `final_price = CASE WHEN id = ? THEN ? ELSE final_price END, `;
//         sql += `rack_no = CASE WHEN id = ? THEN ? ELSE rack_no END, `;
//         sql += `total_purchase_rate = CASE WHEN id = ? THEN ? ELSE total_purchase_rate END, `;

//         // Push values for each field
//         values.push(id, item);
//         values.push(id, price);
//         values.push(id, quantity);
//         values.push(id, discount);
//         values.push(id, total);
//         values.push(id, remarks);
//         values.push(id, stock_date);
//         values.push(id, priceOption);
//         values.push(id, discountOption);
//         values.push(id, purchase_price);
//         values.push(id, packet_quantity);
//         values.push(id, per_packet_quantity);
//         values.push(id, selling_price);
//         values.push(id, price_after_discount);
//         values.push(id, after_discount_total);
//         values.push(id, supplier_id);
//         values.push(id, final_price);
//         values.push(id, rack_no.join(","));
//         values.push(id, total_purchase_rate);
//     });

//     // Remove the trailing comma and space
//     sql = sql.slice(0, -2);

//     // Add WHERE clause based on the IDs
//     sql += ' WHERE id IN (?)';

//     // Push all IDs into values array
//     const ids = update_values.map(data => data[0]);
//     values.push(ids);

//     // Execute the bulk update query
//     connection.query(sql, values, (error, results, fields) => {
//         if (error) {
//             console.error('Error updating items:', error);
//         } else {
//             // Stock updated
//         }
//     });

//     // Query to retrieve the last invoice number
//     const check_invoice_no = "SELECT invoice_no FROM stock ORDER BY invoice_no DESC LIMIT 1";

//     connection.getConnection((error, connection) => {
//         if (error) {
//             console.error('Error:', error);
//             return res.status(500).json({ error: 'Error retrieving last invoice number' });
//         }

//         connection.query(check_invoice_no, (error, results) => {
//             if (error) {
//                 connection.release();
//                 console.error('Error retrieving last invoice number:', error);
//                 return res.status(500).json({ error: 'Error retrieving last invoice number' });
//             }

//             let nextInvoiceNo;

//             if (results == "") {
//                 nextInvoiceNo = 1000;
//             } else {
//                 const lastInvoiceNo = results[0].invoice_no;
//                 nextInvoiceNo = lastInvoiceNo + 1;
//             }

//             if (update_values.length > 0) {
//                 nextInvoiceNo = update_values[0][6];
//                 console.log(nextInvoiceNo);
//             }

//             const values = items
//                 .filter(item => item.hidden_id === '')
//                 .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total, item.priceOption, item.discountOption, item.remarks, item.stock_date, item.purchase_price, item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, item.supplier_id, item.final_price, (item.rack_no).join(","), item.total_purchase_rate]);

//             if (values.length == 0) {
//                 connection.release();
//                 return res.status(200).json({ message: 'Stock Update Successfully' });
//             }

//             const sql = 'INSERT INTO stock (invoice_no, item_id, price, quantity, discount, total, price_option, discount_option, remarks, stock_date, purchase_price, packet_quantity, per_packet_quantity, selling_price, price_after_discount, after_discount_total, supplier_id, final_price, rack_no, total_purchase_rate) VALUES ?';

//             connection.query(sql, [values], (error, result) => {
//                 if (error) {
//                     connection.release();
//                     console.error('Error inserting data:', error);
//                     return res.status(500).json({ error: 'Error inserting data' });
//                 }

//                 // Get the newly inserted stock IDs
//                 const insertedIds = result.insertId; // This is the first inserted ID
//                 const insertedCount = result.affectedRows; // Number of inserted rows
                
//                 // Create an array of all inserted IDs
//                 const allInsertedIds = [];
//                 for (let i = 0; i < insertedCount; i++) {
//                     allInsertedIds.push(insertedIds + i);
//                 }

//                 // Now update the items table only for newly inserted stock items
//                 const newData = [];

//                 items.filter(item => item.hidden_id === '').forEach((item, index) => {
//                     const newItem = {
//                         item: item.item,
//                         price: item.price,
//                         discount: item.discount,
//                         final_price: item.final_price,
//                         stock_id: allInsertedIds[index] // Use the corresponding new stock ID
//                     };
//                     newData.push(newItem);
//                 });

//                 newData.forEach(data => {
//                     let sql = 'UPDATE items SET ';
//                     const values = [];

//                     sql += 'price = ?, ';
//                     values.push(data.price);

//                     sql += 'discount = ?, ';
//                     values.push(data.discount);

//                     sql += 'final_price = ?, ';
//                     values.push(data.final_price);

//                     sql += 'stock_id = ?, ';
//                     values.push(data.stock_id);

//                     sql = sql.slice(0, -2);
//                     sql += ' WHERE id = ?';

//                     values.push(data.item);

//                     connection.query(sql, values, (err, result) => {
//                         if (err) {
//                             console.error('Error updating data:', err);
//                             return;
//                         }
//                         console.log(`Data updated successfully for item ${data.item}.`);
//                     });
//                 });

//                 connection.release();
//                 return res.status(200).json({ "items": newData });
//             });
//         });
//     });
// });



//THIS IS HUNDERED PERSENT CORRECT

app.post('/insert-stock', (req, res) => {
    const items = req.body.invoice_list; // Assuming the array of items is sent in the request body
    const advance_payment = req.body.advance_amount || 0;
    const remaining_amount = req.body.remaining_amount || 0;
    const stock_date_get = req.body.stock_date || "";
    const supplier_id_get = req.body.supplier_id || "";

    const update_values = items
        .filter(item => item.hidden_id !== '')
        .map(item => [item.hidden_id, item.item, item.price, item.quantity, item.discount, item.total, item.invoice_no, item.remarks, item.stock_date, item.priceOption, item.discountOption, item.purchase_price,
            item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, item.supplier_id, item.final_price, item.rack_no, item.total_purchase_rate, item.date_of_expiry, item.purchase_rate_calculate_per_tablet, item.payment_status
        ]);

    // Construct the bulk update query for stock table
    let sql = 'UPDATE stock SET ';
    const values = [];

    update_values.forEach((data, index) => {
        const id = data[0];
        const item = data[1];
        const price = data[2];
        const quantity = data[3];
        const discount = data[4];
        const total = data[5];
        const invoice_no = data[6];
        const remarks = data[7];
        // const stock_date = data[8];
        const priceOption = data[9];
        const discountOption = data[10];
        const purchase_price = data[11];
        const packet_quantity = data[12];
        const per_packet_quantity = data[13];
        const selling_price = data[14];
        const price_after_discount = data[15];
        const after_discount_total = data[16];
        // const supplier_id = data[17];
        const final_price = data[18];
        const rack_no = data[19] || '';
        // console.log("thi is rack", rack_no);
        const total_purchase_rate = data[20];
        const date_of_expiry = data[21];
        const purchase_rate_calculate_per_tablet = data[22];
         const payment_status = data[23];
        // Add SET clause for each row
        sql += `item_id = CASE WHEN id = ? THEN ? ELSE item_id END, `;
        sql += `price = CASE WHEN id = ? THEN ? ELSE price END, `;
        sql += `quantity = CASE WHEN id = ? THEN ? ELSE quantity END, `;
        sql += `discount = CASE WHEN id = ? THEN ? ELSE discount END, `;
        sql += `total = CASE WHEN id = ? THEN ? ELSE total END, `;
        sql += `remarks = CASE WHEN id = ? THEN ? ELSE remarks END, `;
        sql += `stock_date = CASE WHEN id = ? THEN ? ELSE stock_date END, `;
        sql += `price_option = CASE WHEN id = ? THEN ? ELSE price_option END, `;
        sql += `discount_option = CASE WHEN id = ? THEN ? ELSE discount_option END, `;
        sql += `purchase_price = CASE WHEN id = ? THEN ? ELSE purchase_price END, `;
        sql += `packet_quantity = CASE WHEN id = ? THEN ? ELSE packet_quantity END, `;
        sql += `per_packet_quantity = CASE WHEN id = ? THEN ? ELSE per_packet_quantity END, `;
        sql += `selling_price = CASE WHEN id = ? THEN ? ELSE selling_price END, `;
        sql += `price_after_discount = CASE WHEN id = ? THEN ? ELSE price_after_discount END, `;
        sql += `after_discount_total = CASE WHEN id = ? THEN ? ELSE after_discount_total END, `;
        sql += `supplier_id = CASE WHEN id = ? THEN ? ELSE supplier_id END, `;
        sql += `final_price = CASE WHEN id = ? THEN ? ELSE final_price END, `;
        sql += `rack_no = CASE WHEN id = ? THEN ? ELSE rack_no END, `;
        sql += `total_purchase_rate = CASE WHEN id = ? THEN ? ELSE total_purchase_rate END, `;
        sql += `date_of_expiry = CASE WHEN id = ? THEN ? ELSE date_of_expiry END, `;
        sql += `purchase_rate_calculate_per_tablet = CASE WHEN id = ? THEN ? ELSE purchase_rate_calculate_per_tablet END, `;
        sql += `payment_status = CASE WHEN id = ? THEN ? ELSE payment_status END, `;
         sql += `advance_payment = CASE WHEN id = ? THEN ? ELSE advance_payment END, `;
           sql += `remaining_amount = CASE WHEN id = ? THEN ? ELSE remaining_amount END, `;
        // Push values for each field
        values.push(id, item);
        values.push(id, price);
        values.push(id, quantity);
        values.push(id, discount);
        values.push(id, total);
        values.push(id, remarks);
        values.push(id, stock_date_get);
        values.push(id, priceOption);
        values.push(id, discountOption);
        values.push(id, purchase_price);
        values.push(id, packet_quantity);
        values.push(id, per_packet_quantity);
        values.push(id, selling_price);
        values.push(id, price_after_discount);
        values.push(id, after_discount_total);
        values.push(id, supplier_id_get);
        values.push(id, final_price);
        // console.log("rack no", rack_no)
        values.push(id, rack_no.join(","));
        values.push(id, total_purchase_rate);
        values.push(id, date_of_expiry);
        values.push(id, purchase_rate_calculate_per_tablet);
         values.push(id, payment_status);
          values.push(id, advance_payment);
            values.push(id, remaining_amount);
    });

    // Remove the trailing comma and space
    sql = sql.slice(0, -2);

    // Add WHERE clause based on the IDs
    sql += ' WHERE id IN (?)';

    // Push all IDs into values array
    const ids = update_values.map(data => data[0]);
    values.push(ids);

    // Execute the bulk update query for stock table
    connection.query(sql, values, (error, results, fields) => {
        if (error) {
            console.error('Error updating stock items:', error);
        } else {
            // After stock is updated, check and update items table for matching stock_ids
            const itemsToUpdate = items.filter(item => item.hidden_id !== '');
            
            if (itemsToUpdate.length > 0) {
                // First check which items have matching stock_id in items table
                const checkSql = 'SELECT id FROM items WHERE stock_id = ? AND id = ?';
                
                itemsToUpdate.forEach(item => {
                    connection.query(checkSql, [item.hidden_id, item.item], (err, results) => {
                        if (err) {
                            console.error('Error checking stock_id in items table:', err);
                            return;
                        }
                        
                        // If a match is found, update the item
                        if (results.length > 0) {
                            const updateSql = 'UPDATE items SET price = ?, discount = ?, final_price = ? WHERE id = ?';
                            connection.query(updateSql, [item.price, item.discount, item.final_price, item.item], (err, updateResult) => {
                                if (err) {
                                    console.error('Error updating item:', err);
                                    return;
                                }
                                console.log(`Item ${item.item} updated successfully`);
                            });
                        }
                    });
                });
            }
        }
    });

    // Query to retrieve the last invoice number
    const check_invoice_no = "SELECT invoice_no FROM stock ORDER BY invoice_no DESC LIMIT 1";

    connection.getConnection((error, connection) => {
        if (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Error retrieving last invoice number' });
        }

        connection.query(check_invoice_no, (error, results) => {
            if (error) {
                connection.release();
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

            if (update_values.length > 0) {
                nextInvoiceNo = update_values[0][6];
                console.log(nextInvoiceNo);
            }

            const values = items
                .filter(item => item.hidden_id === '')
                .map(item => [nextInvoiceNo, item.item, item.price, item.quantity, item.discount, item.total, item.priceOption, item.discountOption, item.remarks, stock_date_get, item.purchase_price, item.packet_quantity, item.per_packet_quantity, item.selling_price, item.price_after_discount, item.after_discount_total, supplier_id_get, item.final_price,  (item.rack_no ? item.rack_no.join(",") : ''), item.total_purchase_rate, item.date_of_expiry, item.purchase_rate_calculate_per_tablet, item.payment_status, advance_payment, remaining_amount]);

            if (values.length == 0) {
                connection.release();
                return res.status(200).json({ message: 'Stock Update Successfully' });
            }

            const sql =
              "INSERT INTO stock (invoice_no, item_id, price, quantity, discount, total, price_option, discount_option, remarks, stock_date, purchase_price, packet_quantity, per_packet_quantity, selling_price, price_after_discount, after_discount_total, supplier_id, final_price, rack_no, total_purchase_rate, date_of_expiry, purchase_rate_calculate_per_tablet, payment_status, advance_payment, remaining_amount) VALUES ?";

            connection.query(sql, [values], (error, result) => {
                if (error) {
                    connection.release();
                    console.error('Error inserting data:', error);
                    return res.status(500).json({ error: 'Error inserting data' });
                }

                // Get the newly inserted stock IDs
                const insertedIds = result.insertId; // This is the first inserted ID
                const insertedCount = result.affectedRows; // Number of inserted rows
                
                // Create an array of all inserted IDs
                const allInsertedIds = [];
                for (let i = 0; i < insertedCount; i++) {
                    allInsertedIds.push(insertedIds + i);
                }

                // Now update the items table only for newly inserted stock items
                const newData = [];

                items.filter(item => item.hidden_id === '').forEach((item, index) => {
                    const newItem = {
                        item: item.item,
                        price: item.price,
                        discount: item.discount,
                        final_price: item.final_price,
                        stock_id: allInsertedIds[index] // Use the corresponding new stock ID
                    };
                    newData.push(newItem);
                });

                newData.forEach(data => {
                    let sql = 'UPDATE items SET ';
                    const values = [];

                    sql += 'price = ?, ';
                    values.push(data.price);

                    sql += 'discount = ?, ';
                    values.push(data.discount);

                    sql += 'final_price = ?, ';
                    values.push(data.final_price);

                    sql += 'stock_id = ?, ';
                    values.push(data.stock_id);

                    sql = sql.slice(0, -2);
                    sql += ' WHERE id = ?';

                    values.push(data.item);

                    connection.query(sql, values, (err, result) => {
                        if (err) {
                            console.error('Error updating data:', err);
                            return;
                        }
                        console.log(`Data updated successfully for item ${data.item}.`);
                    });
                });

                connection.release();
                return res.status(200).json({ "items": newData });
            });
        });
    });
});










app.post('/insert-expense-head', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const sql = 'INSERT INTO expense_head (head_name, status) VALUES (?, ?)';
    const values = [req.body.head_name, req.body.status];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error inserting data' });
            return;
        }

        connection.query(sql, values, (err, result) => {
            connection.release(); // Release the connection

            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).json({ error: 'Error inserting data' });
            } else {
                console.log('Data inserted successfully');
                res.status(200).json({ message: 'Data inserted successfully' });
            }
        });
    });
});




app.get('/expense-heads', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const searchHeads = req.query.getSearch;

    console.log(searchHeads);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // let sql = `SELECT * FROM expense_head `;

        // if (searchHeads) {
        //   sql += `WHERE head_name LIKE '%${searchHeads}%' `;
        // }

        // sql += ` LIMIT ${limit} OFFSET ${offset}`; // Added space before LIMIT



        let sql = `SELECT * FROM expense_head `;

        if (searchHeads) {
            sql += `WHERE head_name LIKE '%${searchHeads}%' OR status LIKE '%${searchHeads}%'`;
        }

        sql += ` LIMIT ${limit} OFFSET ${offset}`;




        // Execute the query
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release(); // Release the connection
                return;
            }

            // Query to get total count of items
            let countSql = `SELECT COUNT(*) as total FROM expense_head `;

            if (searchHeads) {
                countSql += ` WHERE head_name LIKE '%${searchHeads}%'`;
            }



            // Execute the count query
            connection.query(countSql, (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
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
});






app.put('/update-expense-head/:id', (req, res) => {
    const expense_head_id = parseInt(req.params.id); // Corrected to req.params.id
    const { head_name, status } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error updating item' });
            return;
        }

        // Build the UPDATE query with all the columns to be updated
        const sql = 'UPDATE expense_head SET head_name = ?, status = ? WHERE id = ?';
        const values = [head_name, status, expense_head_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error updating item:', error);
                res.status(500).json({ error: 'Error updating item' });
            } else {
                console.log('Item updated successfully');
                res.status(200).json({ message: 'Item updated successfully' });
            }
        });
    });
});


app.delete('/delete-expense-head/:id', (req, res) => {
    const expense_head_id_get = parseInt(req.params.id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = 'DELETE FROM expense_head WHERE id = ?';
        const values = [expense_head_id_get];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Expense head deleted successfully');
                res.status(200).json({ message: 'expense head deleted successfully' });
            }
        });
    });
});







app.get('/expense-head-list', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching expense head' });
            return;
        }
        const sql = 'SELECT * FROM expense_head';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error fetching expense head' });
            } else {
                console.log('Fetch Successfully');
                res.status(200).json({ results });
            }
        });
    });
});




app.get('/lab-tests', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching expense head' });
            return;
        }
        const sql =
          "SELECT clinic_items.*, lab_tests.id as lab_test_table_id, lab_tests.lab_test FROM clinic_items INNER JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id WHERE clinic_items.type = 'lab_test'";
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error fetching expense head' });
            } else {
                console.log('Fetch Successfully');
                res.status(200).json({ results });
            }
        });
    });
});



// app.post('/patient-history-insert-with-test', (req, res) => {
//     const {invoice_no, history, labTestIds, full_name, phone_no, invoice_date, age, weight, bp, user_id, alreadyExit } = req.body;
  
//     // Get a connection from the pool
//     connection.getConnection((err, connection) => {
//       if (err) {
//         console.error('Error getting connection:', err);
//         return res.status(500).send({ error: 'Database connection error.' });
//       }
  
//       // Begin a transaction
//       connection.beginTransaction(err => {
//         if (err) {
//           connection.release();
//           console.error('Transaction error:', err);
//           return res.status(500).send({ error: 'Could not start transaction.' });
//         }
  
//         // 1. First, insert patient history
//         const insertHistorySql = `
//           INSERT INTO patient_history 
//           (invoice_no, patient_history, user_id) 
//           VALUES (?, ?, ?)`;
        
//         connection.query(insertHistorySql, [invoice_no, history, user_id], (err, historyResult) => {
//           if (err) {
//             return connection.rollback(() => {
//               connection.release();
//               console.error('History insert error:', err);
//               res.status(500).send({ error: 'Failed to save patient history.' });
//             });
//           }
  
//           const history_id = historyResult.insertId;
  
//           // 2. Prepare lab test items for invoice insertion
//           const invoiceItems = labTestIds.map(test => ({
//             item: test.id,
//             price: test.price,
//             quantity: 1,
//             discount: 0,
//             price_after_discount: test.price,
//             status: "unpaid"
//           }));
  
//           // Prepare values for bulk insert
//           const insertValues = invoiceItems.map(item => [
//             invoice_no,
//             full_name,
//             phone_no,
//             invoice_date,
//             item.item,
//             item.price,
//             item.quantity,
//             item.discount,
//             item.price_after_discount,
//             item.status,
//             age,
//             weight,
//             bp,
//           ]);
  
//           // Insert into invoice table
//           const insertSql = `
//             INSERT INTO invoice 
//             (invoice_no, full_name, phone_no, invoice_date, 
//              item, price, quantity, discount, price_after_discount, status, age, weight, bp)
//             VALUES ?`;
  
//           connection.query(insertSql, [insertValues], (err, result) => {
//             if (err) {
//               return connection.rollback(() => {
//                 connection.release();
//                 console.error('Invoice insert error:', err);
//                 res.status(500).send({ error: 'Failed to save lab results to invoice.' });
//               });
//             }
  
//             // Commit transaction if everything succeeds
//             connection.commit(err => {
//               if (err) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   console.error('Commit error:', err);
//                   res.status(500).send({ error: 'Transaction commit failed.' });
//                 });
//               }
//               connection.release();
//               res.send({ 
//                 message: 'Lab results saved to invoice successfully.',
//                 historyId: history_id,
//                 insertedCount: result.affectedRows
//               });
//             });
//           });
//         });
//       });
//     });


app.post('/patient-history-insert-with-test', (req, res) => {

    //here have two patient id one is invoice id of doctor and end is actual patient id
    const { patientId, invoice_no, history, labTestIds, full_name, phone_no, invoice_date, age, weight, bp, user_id, alreadyExit, patient_id } = req.body;

    // Validate labTestIds exists and is an array
    if (!Array.isArray(labTestIds)) {
        return res.status(400).send({ error: 'labTestIds must be an array' });
    }

    // Get a connection from the pool
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).send({ error: 'Database connection error.' });
        }

        // Begin a transaction
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error('Transaction error:', err);
                return res.status(500).send({ error: 'Could not start transaction.' });
            }

            // Function to handle invoice insertion (only if labTestIds has items)
            const handleInvoiceInsertion = (history_id, callback) => {
                if (labTestIds.length === 0) {
                    // Skip invoice insertion if no lab tests
                    return callback({ affectedRows: 0 });
                }

                const invoiceItems = labTestIds.map(test => ({
                    item: test.id,
                    price: test.price,
                    quantity: 1,
                    discount: 0,
                    price_after_discount: test.price,
                    status: "unpaid"
                }));

                const insertValues = invoiceItems.map(item => [
                    invoice_no,
                    full_name,
                    phone_no,
                    invoice_date,
                    item.item,
                    item.price,
                    item.quantity,
                    item.discount,
                    item.price_after_discount,
                    item.status,
                    age,
                    weight,
                    bp,
                    patient_id,
                ]);

                const insertSql = `
                    INSERT INTO invoice 
                    (invoice_no, full_name, phone_no, invoice_date, 
                     item, price, quantity, discount, price_after_discount, status, age, weight, bp, patient_id)
                    VALUES ?`;

                connection.query(insertSql, [insertValues], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error('Invoice insert error:', err);
                            res.status(500).send({ error: 'Failed to save lab results to invoice.' });
                        });
                    }
                    callback(result);
                });
            };

            if (alreadyExit) {
                // UPDATE existing patient history
                const updateHistorySql = `
                    UPDATE patient_history 
                    SET patient_history = ?
                    WHERE invoice_id = ? AND user_id = ?`;
                
                connection.query(updateHistorySql, [history, patientId, user_id], (err, updateResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error('History update error:', err);
                            res.status(500).send({ error: 'Failed to update patient history.' });
                        });
                    }

                    // Then conditionally insert invoice items
                    handleInvoiceInsertion(null, (result) => {
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Commit error:', err);
                                    res.status(500).send({ error: 'Transaction commit failed.' });
                                });
                            }
                            connection.release();
                            res.send({ 
                                message: labTestIds.length > 0 
                                    ? 'Lab results and history updated successfully.' 
                                    : 'Patient history updated successfully (no lab tests to insert).',
                                updatedHistory: true,
                                insertedCount: result.affectedRows
                            });
                        });
                    });
                });
            } else {
                // INSERT new patient history
                const insertHistorySql = `
                    INSERT INTO patient_history 
                    (invoice_id, patient_history, user_id) 
                    VALUES (?, ?, ?)`;
                
                connection.query(insertHistorySql, [patientId, history, user_id], (err, historyResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            console.error('History insert error:', err);
                            res.status(500).send({ error: 'Failed to save patient history.' });
                        });
                    }

                    const history_id = historyResult.insertId;

                    // Then conditionally insert invoice items
                    handleInvoiceInsertion(history_id, (result) => {
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Commit error:', err);
                                    res.status(500).send({ error: 'Transaction commit failed.' });
                                });
                            }
                            connection.release();
                            res.send({ 
                                message: labTestIds.length > 0 
                                    ? 'Lab results and history saved successfully.' 
                                    : 'Patient history saved successfully (no lab tests to insert).',
                                historyId: history_id,
                                insertedCount: result.affectedRows
                            });
                        });
                    });
                });
            }
        });
    });
});

app.post('/bulk-insert-lab-test-heads', (req, res) => {
  const rows = req.body;

  // Split rows into those needing updates and those needing inserts
  const rowsToUpdate = rows.filter(row => row.id !== undefined && row.id !== null && row.id !== '');
  const rowsToInsert = rows.filter(row => row.id === undefined || row.id === null ||  row.id == '');


  console.log(rowsToUpdate, "for update");
  console.log(rowsToInsert, "for insert");

  // Get a connection from the pool
  connection.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
      return res.status(500).send({ error: 'Database connection error.' });
    }

    // Begin a transaction
    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error('Transaction error:', err);
        return res.status(500).send({ error: 'Could not start transaction.' });
      }

      // Create an array of update promises using callbacks wrapped in Promises.
      const updatePromises = rowsToUpdate.map(row => {
        return new Promise((resolve, reject) => {
          const updateSql = `
            UPDATE lab_test_heads 
            SET lab_test_id = ?,
                test_description = ?,
                ref_range = ?,
                unit = ?,
                period = ?
            WHERE id = ?`;
          const updateData = [
            row.lab_test_id,
            row.test_description,
            row.ref_range,
            row.unit,
            row.period,
            row.id
          ];

          connection.query(updateSql, updateData, (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      });

      // Execute update queries
      Promise.all(updatePromises)
        .then(() => {
          // If we have rows to insert, prepare a bulk insert query
          if (rowsToInsert.length > 0) {
            // Prepare insert data
            // Note: Adjust column names/order as per your table definition.
            const insertValues = rowsToInsert.map(row => [
                row.lab_test_id,
                row.test_description,
                row.ref_range,
                row.unit,
                row.period,
            ]);
            const insertSql = `
              INSERT INTO lab_test_heads 
                (lab_test_id, test_description, ref_range, unit, period)
              VALUES ?`;

            connection.query(insertSql, [insertValues], (err, result) => {
              if (err) {
                // Rollback on error
                return connection.rollback(() => {
                  connection.release();
                  console.error('Insert error:', err);
                  res.status(500).send({ error: err.message });
                });
              }

              // Commit transaction if insert succeeds
              connection.commit(err => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Commit error:', err);
                    res.status(500).send({ error: err.message });
                  });
                }
                connection.release();
                res.send({ message: 'Timetable upserted successfully.' });
              });
            });
          } else {
            // If no inserts, just commit the transaction after updates
            connection.commit(err => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Commit error:', err);
                  res.status(500).send({ error: err.message });
                });
              }
              connection.release();
              res.send({ message: 'Timetable upserted successfully.' });
            });
          }
        })
        .catch(err => {
          // If any update fails, rollback the transaction
          connection.rollback(() => {
            connection.release();
            console.error('Update error:', err);
            res.status(500).send({ error: err.message });
          });
        });
    });
  });
});







app.get("/get-lab-test-heads/:lab_test_id", (req, res) => {
    const lab_test_id = req.params.lab_test_id;
  
    connection.getConnection((err, connection) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error fetching sections" });
        return;
      }
  
      const sql =
        "SELECT lab_test_heads.*, lab_tests.lab_test FROM lab_test_heads INNER JOIN lab_tests ON lab_test_heads.lab_test_id = lab_tests.id WHERE lab_test_id = ? ORDER BY period ASC";
  
      connection.query(sql, [lab_test_id], (error, results) => {
        connection.release(); // Release the connection
  
        if (error) {
          console.error("Error:", error);
          res.status(500).json({ error: "Error fetching sections" });
        } else {
          console.log("Fetch Successfully");
          res.status(200).json({ results });
        }
      });
    });
  });
  
  


  
app.get("/get-patient-history-already-exit/:invoiceId", (req, res) => {
    const invoice_no = req.params.invoiceId;
  
    connection.getConnection((err, connection) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error fetching sections" });
        return;
      }
  
      const sql =
        "SELECT * FROM patient_history WHERE invoice_id = ?";
  
      connection.query(sql, [invoice_no], (error, results) => {
        connection.release(); // Release the connection
  
        if (error) {
          console.error("Error:", error);
          res.status(500).json({ error: "Error fetching sections" });
        } else {
          console.log("Fetch Successfully");
          res.status(200).json({ results });
        }
      });
    });
  });



  
  
app.get("/get-medicine-of-patients/:invoiceId/:patient_id", (req, res) => {
    
    const invoice_id = req.params.invoiceId;
    const patient_id = req.params.patient_id;
  
    connection.getConnection((err, connection) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error fetching sections" });
        return;
      }
  
      const sql =
        "SELECT invoice_pharmacy.id, invoice_pharmacy.invoice_no, items.items, invoice_pharmacy.quantity FROM invoice_pharmacy INNER JOIN items ON invoice_pharmacy.item = items.id WHERE doctor_invoice_id = ? AND patient_id = ?";
  
      connection.query(sql, [invoice_id, patient_id], (error, results) => {
        connection.release(); // Release the connection
  
        if (error) {
          console.error("Error:", error);
          res.status(500).json({ error: "Error fetching sections" });
        } else {
          console.log("Fetch Successfully");
          res.status(200).json({ results });
        }
      });
    });
  });




  
// // ....employee attendance Route...........
// app.get("/lab-tests-results/:date/:campus_id/:session_id", (req, res) => {
//     const { date, campus_id, session_id } = req.params;
  
//     connection.getConnection((err, connection) => {
//       if (err) {
//         console.error("Error:", err);
//         res.status(500).json({ error: "Error connecting to the database" });
//         return;
//       }
  
//       // First query to get all attendance records
//       const sqlAllRecords =
//         "SELECT * FROM lab_test_results WHERE invoice_id = ? AND lab_test_id = ?";
  
//       // Execute both queries concurrently
//       Promise.all([
//         new Promise((resolve, reject) => {
//           connection.query(
//             sqlAllRecords,
//             [date, campus_id, session_id],
//             (error, results) => {
//               if (error) reject(error);
//               else resolve(results);
//             }
//           );
//         }),
//       ])
//         .then(([results, groupedCount]) => {
//           connection.release(); // Release the connection
//           res.json({ results, groupedCount });
//         })
//         .catch((error) => {
//           connection.release(); // Release the connection
//           console.error("Error executing queries:", error);
//           res.status(500).json({ error: "Internal server error" });
//         });
//     });
//   });
  
  

app.post('/add-lab-test-results', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const { invoice_id, lab_test_id, results } = req.body;

    // Validate required fields
    if (!invoice_id || !lab_test_id || !results) {
        console.error('Missing required fields');
        return res.status(400).json({ 
            success: false, 
            message: 'Missing invoice_id, lab_test_id, or results' 
        });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection failed' 
            });
        }

        // First check if record exists
        const checkSql = `SELECT id FROM lab_test_results WHERE invoice_id = ? AND lab_test_id = ?`;
        connection.query(checkSql, [invoice_id, lab_test_id], (checkErr, checkResults) => {
            if (checkErr) {
                connection.release();
                console.error('Check error:', checkErr);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database query failed' 
                });
            }

            const recordExists = checkResults.length > 0;
            let actionSql, actionValues;

            if (recordExists) {
                // UPDATE existing record
                actionSql = `UPDATE lab_test_results SET results = ? WHERE invoice_id = ? AND lab_test_id = ?`;
                actionValues = [results, invoice_id, lab_test_id];
            } else {
                // INSERT new record
                actionSql = `INSERT INTO lab_test_results (invoice_id, lab_test_id, results) VALUES (?, ?, ?)`;
                actionValues = [invoice_id, lab_test_id, results];
            }

            // Execute the INSERT/UPDATE
            connection.query(actionSql, actionValues, (actionErr, actionResults) => {
                connection.release(); // Always release connection

                if (actionErr) {
                    console.error('Action error:', actionErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to save results' 
                    });
                }

                console.log('Results saved successfully');
                res.status(200).json({ 
                    success: true,
                    message: recordExists ? 'Results updated' : 'Results added',
                    data: {
                        affectedRows: actionResults.affectedRows,
                        insertId: actionResults.insertId || null
                    }
                });
            });
        });
    });
});





 // GET endpoint for lab test results
app.get('/get-lab-test-results', (req, res) => {
    const { invoice_id } = req.query;
    
    connection.query(
      'SELECT * FROM lab_test_results WHERE invoice_id = ?',
      [invoice_id],
      (error, results, fields) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ 
            success: false,
            error: 'Database query failed'
          });
        }
  
        // console.log("Fetched results:", results);
        
        res.json({ 
          success: true,
          results: results || [] // Ensure we always return an array
        });
      }
    );
  });




  
 // GET endpoint for lab test results
app.get('/get-lab-test-results-for-view', (req, res) => {
  const { invoice_id } = req.query;

  console.log(invoice_id);

  if (!invoice_id) {
    return res.status(400).json({
      success: false,
      error: "invoice_id is required",
    });
  }

  const query = `
    SELECT lab_test_results.*, lab_tests.lab_test 
    FROM lab_test_results 
    INNER JOIN lab_tests ON lab_test_results.lab_test_id = lab_tests.id 
    WHERE FIND_IN_SET(invoice_id, ?)
  `;

  connection.query(
    query,
    [invoice_id],
    (error, results, fields) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          success: false,
          error: "Database query failed",
        });
      }

      res.json({
        success: true,
        results: results || [],
      });
    }
  );
});



  app.post('/update-lab-test-results', (req, res) => {
    console.log('Update request body:', req.body); // Log incoming data

    const { invoice_id, lab_test_id, results } = req.body;

    // Validate required fields
    if (!invoice_id || !lab_test_id || !results) {
        console.error('Missing required fields');
        return res.status(400).json({ 
            success: false, 
            message: 'Missing invoice_id, lab_test_id, or results' 
        });
    }

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection failed' 
            });
        }

        // First verify the record exists
        const checkSql = `SELECT id FROM lab_test_results WHERE invoice_id = ? AND lab_test_id = ?`;
        connection.query(checkSql, [invoice_id, lab_test_id], (checkErr, checkResults) => {
            if (checkErr) {
                connection.release();
                console.error('Check error:', checkErr);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database query failed' 
                });
            }

            if (checkResults.length === 0) {
                connection.release();
                return res.status(404).json({ 
                    success: false, 
                    message: 'No existing record found to update' 
                });
            }

            // Parse and validate the results JSON
            let parsedResults;
            try {
                parsedResults = typeof results === 'string' ? JSON.parse(results) : results;
                if (typeof parsedResults !== 'object' || parsedResults === null) {
                    throw new Error('Invalid results format');
                }
            } catch (parseErr) {
                connection.release();
                console.error('JSON parse error:', parseErr);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid results JSON format' 
                });
            }

            // Prepare the update
            const updateSql = `UPDATE lab_test_results SET results = ? WHERE invoice_id = ? AND lab_test_id = ?`;
            const updateValues = [JSON.stringify(parsedResults), invoice_id, lab_test_id];

            connection.query(updateSql, updateValues, (updateErr, updateResult) => {
                connection.release();

                if (updateErr) {
                    console.error('Update error:', updateErr);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to update results' 
                    });
                }

                console.log('Update successful:', updateResult);
                res.status(200).json({ 
                    success: true,
                    message: 'Results updated successfully',
                    data: {
                        affectedRows: updateResult.affectedRows,
                        updatedId: checkResults[0].id
                    }
                });
            });
        });
    });
});




app.get("/if-lab-test-already-exist/:lab_test_id", (req, res) => {
    const lab_test_id = req.params.lab_test_id;
  
    connection.getConnection((err, connection) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Error fetching sections" });
        return;
      }
  
      const sql =
        "SELECT * FROM lab_test_heads WHERE lab_test_id = ? ORDER BY period ASC";
  
      connection.query(sql, [lab_test_id], (error, results) => {
        connection.release(); // Release the connection
  
        if (error) {
          console.error("Error:", error);
          res.status(500).json({ error: "Error fetching sections" });
        } else {
          console.log("Fetch Successfully");
          res.status(200).json({ results });
        }
      });
    });
  });
  
  


app.get('/get-lab-test', (req, res) => {
    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching' });
            return;
        }
        const sql = 'SELECT * FROM lab_tests';
        connection.query(sql, (error, results) => {
            connection.release(); // Release the connection
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error fetching' });
            } else {
                console.log('Fetch Successfully');
                res.status(200).json({ results });
            }
        });
    });
});





app.post('/insert-expense', (req, res) => {
    console.log('Request body:', req.body); // Log request body

    const sql = 'INSERT INTO expenses (receipt_no, head_id, amount, remarks, payment_type) VALUES (?, ?, ?, ?, ?)';
    const values = [10000, req.body.head_id, req.body.amount, req.body.remarks, req.body.payment_type];

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error inserting data' });
            return;
        }

        connection.query(sql, values, (err, result) => {
            connection.release(); // Release the connection

            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).json({ error: 'Error inserting data' });
            } else {
                console.log('Data inserted successfully');
                res.status(200).json({ message: 'Data inserted successfully' });
            }
        });
    });
});




app.get('/expenses-list', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching items' });
            return;
        }

        // SQL query to select paginated results
        const sql = `SELECT expenses.*, expense_head.head_name FROM expenses INNER JOIN expense_head ON expenses.head_id = expense_head.id LIMIT ${limit} OFFSET ${offset}`;

        // Execute the query
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
                connection.release(); // Release the connection
                return;
            }

            // Query to get total count of items
            const countSql = 'SELECT COUNT(*) as total FROM expenses';

            // Execute the count query
            connection.query(countSql, (countError, countResult) => {
                connection.release(); // Release the connection

                if (countError) {
                    console.error('Error executing count SQL query: ', countError);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
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
});






app.get('/expense-get/:expense_id', (req, res) => {
    const expense_id_get = req.params.expense_id;

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT * FROM expenses WHERE id = ?`;
        const values = [expense_id_get];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});







app.put('/expense/:id', (req, res) => {
    const epxense_id = parseInt(req.params.id); // Corrected to req.params.id
    const { head_id, amount, remarks, payment_type, hidden_id } = req.body; // Updated item data from the request body

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error updating item' });
            return;
        }

        // Build the UPDATE query with all the columns to be updated
        const sql = 'UPDATE expenses SET head_id = ?, amount = ?, remarks = ?,  payment_type = ?  WHERE id = ?';
        const values = [head_id, amount, remarks, payment_type, epxense_id];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error updating item:', error);
                res.status(500).json({ error: 'Error updating item' });
            } else {
                console.log('Item updated successfully');
                res.status(200).json({ message: 'Updated successfully' });
            }
        });
    });
});






app.delete('/delete-expense/:expense_id', (req, res) => {
    const expense_id_get = parseInt(req.params.expense_id);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = 'DELETE FROM expenses WHERE id = ?';
        const values = [expense_id_get];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Deleted successfully' });
            }
        });
    });
});




// app.get('/get-stock-list', (req, res) => {
//     // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const offset = (page - 1) * limit;
//     const searchStock = req.query.getSearch;
//     const supplier_id = req.query.supplier_id;
//     const remaining_amount = req.query.remaining;

//     // Base SQL query for paginated results
//     let sql = `SELECT stock.invoice_no, suppliers.full_name, SUM(stock.total) AS total_sum, 
//        MAX(stock.advance_payment) AS advance_payment, MAX(stock.remaining_amount) AS remaining_amount
//        FROM stock 
//        INNER JOIN suppliers ON stock.supplier_id = suppliers.id`;
    
//     let params = [];

//     if (searchStock) {
//         sql += ` WHERE stock.invoice_no LIKE ?`;
//         params.push(`%${searchStock}%`);
//     }

//     sql += ` GROUP BY stock.invoice_no 
//            ORDER BY stock.invoice_no DESC 
//            LIMIT ? OFFSET ?`;

//     params.push(limit, offset);

//     // Execute the paginated query
//     connection.query(sql, params, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }

//         // Query to get total count of distinct invoice_no values
//         let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM stock`;
//         let countParams = [];

//         if (searchStock) {
//             countSql += ` WHERE stock.invoice_no LIKE ?`;
//             countParams.push(`%${searchStock}%`);
//         }

//         // Execute the count query
//         connection.query(countSql, countParams, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             // Ensure countResult has data before accessing it
//             const totalItems = countResult.length > 0 ? countResult[0].total_count : 0;
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and pagination metadata as JSON
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });






// app.get('/get-invoice-list', (req, res) => {
//   // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 5;
//   const offset = (page - 1) * limit;
//   const searchInvoice = req.query.getSearch;

//   console.log(page, limit, offset, searchInvoice);

//   // SQL query to select paginated results
//   //const sql = `SELECT invoice_no, SUM(total) AS total_amount, SUM(quantity) AS total_quantity FROM invoice GROUP BY invoice_no ORDER BY invoice_no DESC LIMIT ${limit} OFFSET ${offset}`;


//   let sql = `SELECT invoice_no, full_name, type, SUM(total) AS total_amount, SUM(quantity) AS total_quantity 
//     FROM invoice`;

// if (searchInvoice) {
//   sql += ` WHERE invoice_no LIKE '%${searchInvoice}%' OR full_name LIKE '%${searchInvoice}%'`;
// }

// sql += ` GROUP BY invoice_no, full_name, type
//     ORDER BY invoice_no DESC 
//     LIMIT ${limit} OFFSET ${offset}`;


//   // Execute the query
//   connection.query(sql, (error, results) => {
//     if (error) {
//       console.error('Error executing SQL query: ', error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }

//     // Query to get total count of items
//     let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count 
//     FROM invoice`;

//     if (searchInvoice) {
//       countSql += ` WHERE invoice_no LIKE '%${searchInvoice}% OR full_name LIKE '%${searchInvoice}%'`;
//     }


//     // Execute the count query
//     connection.query(countSql, (countError, countResult) => {
//       if (countError) {
//         console.error('Error executing count SQL query: ', countError);
//         return res.status(500).json({ error: 'Internal server error' });
//       }

//       const totalItems = countResult[0].total_count;

//       // Calculate total pages based on total count and limit
//       const totalPages = Math.ceil(totalItems / limit);

//       // Send paginated results and pagination metadata as JSON
//       res.json({
//         totalItems,
//         currentPage: page,
//         totalPages,
//         results
//       });
//     });
//   });
// });



// app.get('/get-invoice-list', (req, res) => {
//     // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search;
//     const user_type = req.query.user_type;
//     const user_id = req.query.user_id;

//     console.log(page, limit, offset, searchInvoice);

//     // Base SQL query to fetch invoice data
//     let sql = `SELECT invoice_no, full_name, REPLACE(phone_no, '-', '') AS phone_no, SUM(total) AS total_amount, SUM(quantity) AS total_quantity 
//     FROM invoice`;

//     // Add a WHERE clause if searchInvoice is provided
//     if (searchInvoice) {
//         sql += ` WHERE invoice_no LIKE ? OR full_name LIKE ? OR REPLACE(phone_no, '-', '') LIKE ?`;
//     }

//     // Add grouping, sorting, and pagination
//     sql += ` GROUP BY invoice_no, phone_no
//     ORDER BY invoice_no DESC 
//     LIMIT ? OFFSET ?`;

//     // Prepare values for query substitution to prevent SQL injection
//     const queryValues = searchInvoice ? [`%${searchInvoice}%`, `%${searchInvoice}%`, `%${searchInvoice}%`, limit, offset] : [limit, offset];

//     // Execute the main query
//     connection.query(sql, queryValues, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }

//         // Base SQL query to get the total count of distinct invoices
//         let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM invoice`;

//         // Add a WHERE clause if searchInvoice is provided
//         if (searchInvoice) {
//             countSql += ` WHERE invoice_no LIKE ? OR full_name LIKE ? OR REPLACE(phone_no, '-', '') LIKE ?`;
//         }

//         // Prepare values for count query
//         const countQueryValues = searchInvoice ? [`%${searchInvoice}%`, `%${searchInvoice}%`, `%${searchInvoice}%`] : [];

//         // Execute the count query
//         connection.query(countSql, countQueryValues, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             const totalItems = countResult[0].total_count;

//             // Calculate total pages based on total count and limit
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and pagination metadata as JSON
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });



// app.get('/get-invoice-list', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search;
//     const user_type = req.query.user_type;
//     const user_id = req.query.user_id;

//     let sql = `SELECT invoice_no, full_name, REPLACE(phone_no, '-', '') AS phone_no, SUM(total) AS total_amount, SUM(quantity) AS total_quantity
//     FROM invoice`;

//     let whereClause = [];
//     let queryValues = [];

//     // Conditionally add where conditions
//     if (searchInvoice) {
//         whereClause.push(`(invoice_no LIKE ? OR full_name LIKE ? OR REPLACE(phone_no, '-', '') LIKE ?)`);
//         queryValues.push(`%${searchInvoice}%`, `%${searchInvoice}%`, `%${searchInvoice}%`);
//     }

//     if (user_type === 'Doctor') {
//         whereClause.push(`doctor_id = ?`);
//         queryValues.push(user_id);
//     }

//     // Add the where clause to the SQL
//     if (whereClause.length > 0) {
//         sql += ` WHERE ` + whereClause.join(' AND ');
//     }

//     // Add GROUP BY
//     sql += ` GROUP BY invoice_no, phone_no`;

//     // Conditionally set ORDER BY based on user_type
//     let orderBy = 'DESC'; // Default order
//     if (user_type === 'Doctor' || user_type === 'Lab Assistant') {
//         orderBy = 'ASC';
//     }
//     sql += ` ORDER BY invoice_no ${orderBy}`;

//     // Add LIMIT and OFFSET
//     sql += ` LIMIT ? OFFSET ?`;

//     // Append LIMIT and OFFSET to query values
//     queryValues.push(limit, offset);

//     // Execute the main query
//     connection.query(sql, queryValues, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }

//         // Base SQL query to get the total count of distinct invoices
//         let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM invoice`;
//         let countWhereClause = [...whereClause];

//         // Execute the count query
//         connection.query(countSql + (countWhereClause.length ? ` WHERE ` + countWhereClause.join(' AND ') : ''), queryValues, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             const totalItems = countResult[0].total_count;
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and pagination metadata as JSON
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });



// app.get('/get-invoice-list', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search;
//     const user_type = req.query.user_type;
//     const user_id = req.query.user_id;

//     let sql = `SELECT invoice_no, full_name, REPLACE(phone_no, '-', '') AS phone_no, SUM(total) AS total_amount, SUM(quantity) AS total_quantity
//     FROM invoice`;

//     let whereClause = [];
//     let queryValues = [];

//     // Conditionally add where conditions
//     if (searchInvoice) {
//         whereClause.push(`(invoice_no LIKE ? OR full_name LIKE ? OR REPLACE(phone_no, '-', '') LIKE ?)`);
//         queryValues.push(`%${searchInvoice}%`, `%${searchInvoice}%`, `%${searchInvoice}%`);
//     }

//     // LEFT JOIN with clinic_item to get doctor_id
//     sql += ` LEFT JOIN clinic_items ci ON ci.id = invoice.item`;

//     // Add filter for doctor_id if user_type is 'Doctor'
//     if (user_type === 'Doctor') {
//         whereClause.push(`ci.doctor_id = ?`);
//         queryValues.push(user_id);
//         whereClause.push(`ci.type = 'opd'`);
//     }else if(user_type === 'Lab Assistant'){
//         whereClause.push(`ci.type = 'lab_test'`);
//     }

//     // Add the where clause to the SQL
//     if (whereClause.length > 0) {
//         sql += ` WHERE ` + whereClause.join(' AND ');
//     }

//     // Add GROUP BY
//     sql += ` GROUP BY invoice_no, phone_no`;

//     // Conditionally set ORDER BY based on user_type
//     let orderBy = 'DESC'; // Default order
//     if (user_type === 'Doctor' || user_type === 'Lab Assistant') {
//         orderBy = 'ASC';
//     }
//     sql += ` ORDER BY invoice_no ${orderBy}`;

//     // Add LIMIT and OFFSET
//     sql += ` LIMIT ? OFFSET ?`;

//     // Append LIMIT and OFFSET to query values
//     queryValues.push(limit, offset);

//     // Execute the main query
//     connection.query(sql, queryValues, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }

//         let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count
//                 FROM invoice
//                 LEFT JOIN clinic_items ci ON ci.id = invoice.item`;

//         // Execute the count query with the same WHERE conditions
//         connection.query(countSql + (whereClause.length ? ` WHERE ` + whereClause.join(' AND ') : ''), queryValues, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             const totalItems = countResult[0].total_count;
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and pagination metadata as JSON
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });




// app.get('/get-invoice-list', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 100;
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search;
//     const user_type = req.query.user_type;
//     const user_id = req.query.user_id;
//     const filter = req.query.filter;

//     const today = new Date().toLocaleDateString('en-CA'); // Get today's date in 'YYYY-MM-DD'

//     console.log(today);

//     // Main SELECT query
//     let baseSql = `FROM invoice 
//                    LEFT JOIN clinic_items ci ON ci.id = invoice.item
//                    LEFT JOIN patients p ON p.id = ci.patient_id`;

//     let whereClause = [];
//     let queryValues = [];

//     // Add search conditions
//     if (searchInvoice) {
//         whereClause.push(`(invoice.invoice_no LIKE ? OR p.name LIKE ? OR REPLACE(p.phone_no, '-', '') LIKE ?)`);
//         queryValues.push(`%${searchInvoice}%`, `%${searchInvoice}%`, `%${searchInvoice}%`);
//     }

  

//         // User type filters
//     if (user_type === 'Doctor') {
//         whereClause.push(`ci.doctor_id = ?`);
//         queryValues.push(user_id);
//         whereClause.push(`ci.type = 'opd'`);
//         if (filter === 'today') {
//             whereClause.push(`DATE(invoice.invoice_date) = ?`);
//             queryValues.push(today);
//         }
//     } else if (user_type === 'Lab Assistant' ) {
//         whereClause.push(`ci.type = 'lab_test'`);
//         if (filter === 'today') {
//             whereClause.push(`DATE(invoice.invoice_date) = ?`);
//             queryValues.push(today);
//         }
//     } else if (user_type === 'Receptionist') {
//         // whereClause.push(`ci.type = 'lab_test'`);
//         if (filter === 'today') {
//             whereClause.push(`DATE(invoice.invoice_date) = ?`);
//             queryValues.push(today);
//         }
//     } 



//     // Apply WHERE clause
//     const whereSQL = whereClause.length ? ` WHERE ` + whereClause.join(' AND ') : '';

//     // Final SQL for data
//     const dataSql = `
//         SELECT invoice_no, full_name, REPLACE(phone_no, '-', '') AS phone_no, 
//                SUM(total) AS total_amount, SUM(quantity) AS total_quantity
//         ${baseSql}
//         ${whereSQL}
//         GROUP BY invoice_no, phone_no
//         ORDER BY invoice_no ${['Doctor', 'Lab Assistant'].includes(user_type) ? 'DESC' : 'DESC'}
//         LIMIT ? OFFSET ?
//     `;

//     // Add LIMIT and OFFSET values to the end of query
//     const dataQueryValues = [...queryValues, limit, offset];

//     // Final SQL for count
//     const countSql = `
//         SELECT COUNT(DISTINCT invoice_no) AS total_count
//         ${baseSql}
//         ${whereSQL}
//     `;

//     // Execute data query
//     connection.query(dataSql, dataQueryValues, (error, results) => {
//         if (error) {
//             console.error('Error executing data query:', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }

//         // Execute count query (without limit/offset)
//         connection.query(countSql, queryValues, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count query:', countError);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             const totalItems = countResult[0].total_count;
//             const totalPages = Math.ceil(totalItems / limit);

//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });






// app.get('/get-invoice-list-for-pharmacy', (req, res) => {
//     // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search;

//     console.log(page, limit, offset, searchInvoice);

//     // Base SQL query to fetch invoice data
//     let sql = `SELECT invoice_no, full_name, phone_no, SUM(total) AS total_amount, SUM(quantity) AS total_quantity 
//     FROM invoice_pharmacy`;

//     // Add a WHERE clause if searchInvoice is provided
//     if (searchInvoice) {
//         sql += ` WHERE invoice_no LIKE '%${searchInvoice}%' OR phone_no LIKE '%${searchInvoice}%'`;
//     }

//     // Add grouping, sorting, and pagination
//     sql += ` GROUP BY invoice_no, full_name, phone_no
//     ORDER BY invoice_no DESC 
//     LIMIT ${limit} OFFSET ${offset}`;

//     // Execute the main query
//     connection.query(sql, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Internal server error' });
//         }

//         // Base SQL query to get the total count of distinct invoices
//         let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM invoice_pharmacy`;

//         // Add a WHERE clause if searchInvoice is provided
//         if (searchInvoice) {
//             countSql += ` WHERE invoice_no LIKE '%${searchInvoice}%' OR full_name LIKE '%${searchInvoice}%'`; // Corrected here
//         }

//         // Execute the count query
//         connection.query(countSql, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Internal server error' });
//             }

//             const totalItems = countResult[0].total_count;

//             // Calculate total pages based on total count and limit
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and pagination metadata as JSON
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });




// app.get('/get-invoice-list-for-pharmacy', (req, res) => {
//     // Extract and validate query parameters
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 5), 100); // Limit between 1 and 100
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search || '';
//     const type_get = req.query.type || 'all';
//     const alert_date = req.query.alert_date || "";
//     const invoice_status = req.query.invoice_status || "";

//     console.log(page, limit, offset, searchInvoice, type_get);

//     // Initialize base SQL query and parameters
//     let sql = `SELECT invoice_no, full_name, phone_no, invoice_type, SUM(total) AS total_amount, remaining_amount, invoice_status, alert_date, SUM(quantity) AS total_quantity 
//                FROM invoice_pharmacy`;
//     let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM invoice_pharmacy`;
//     let params = [];
//     let countParams = [];

//     // Add WHERE clause for invoice_type if not 'all'
//     if (type_get !== 'all') {
//         sql += ` WHERE invoice_type = ?`;
//         countSql += ` WHERE invoice_type = ?`;
//         params.push(type_get);
//         countParams.push(type_get);
//     }


//      if (alert_date !== '') {
//         sql += ` WHERE alert_date = ?`;
//         countSql += ` WHERE alert_date = ?`;
//         params.push(alert_date);
//         countParams.push(alert_date);
//     }

//      if (invoice_status !== '') {
//         sql += ` WHERE invoice_status = ?`;
//         countSql += ` WHERE invoice_status = ?`;
//         params.push(invoice_status);
//         countParams.push(invoice_status);
//     }

//     // Add search conditions if searchInvoice is provided
//     if (searchInvoice) {
//         const searchCondition = ` AND (invoice_no LIKE ? OR phone_no LIKE ?)`;
//         sql += (type_get === 'all' ? ' WHERE' : '') + searchCondition;
//         countSql += (type_get === 'all' ? ' WHERE' : '') + searchCondition;
//         params.push(`%${searchInvoice}%`, `%${searchInvoice}%`);
//         countParams.push(`%${searchInvoice}%`, `%${searchInvoice}%`);
//     }

    

//     // Add grouping, sorting, and pagination
//     sql += ` GROUP BY invoice_no
//              ORDER BY invoice_no DESC 
//              LIMIT ? OFFSET ?`;
//     params.push(limit, offset);

//     // Execute the main query
//     connection.query(sql, params, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Database query failed', details: error.message });
//         }

//         // Execute the count query
//         connection.query(countSql, countParams, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Database query failed', details: countError.message });
//             }

//             const totalItems = countResult[0].total_count;
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and metadata
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });





app.get('/get-stock-list', (req, res) => {
    // Extract page and limit from query parameters, default to page 1 and limit 5 if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const searchStock = req.query.getSearch;
    const supplier_id = req.query.supplier_id;
    const remaining_amount = req.query.remaining;
    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    // Base SQL query for paginated results
    let sql = `SELECT stock.invoice_no, suppliers.full_name, SUM(stock.total) AS total_sum, 
       MAX(stock.advance_payment) AS advance_payment, MAX(stock.remaining_amount) AS remaining_amount
       FROM stock 
       INNER JOIN suppliers ON stock.supplier_id = suppliers.id`;
    
    let params = [];
    let whereConditions = [];

    if (searchStock) {
        whereConditions.push(`stock.invoice_no LIKE ?`);
        params.push(`%${searchStock}%`);
    }

    if (supplier_id) {
        whereConditions.push(`stock.supplier_id = ?`);
        params.push(supplier_id);
    }

    if (remaining_amount) {
        // Assuming remaining_amount is a boolean flag to filter non-zero remaining amounts
        whereConditions.push(`stock.remaining_amount > 0`);
    }

    if (from_date && to_date) {
        whereConditions.push(`stock.stock_date BETWEEN ? AND ?`);
        params.push(from_date);
        params.push(to_date);
    }

    // Add WHERE clause if there are any conditions
    if (whereConditions.length > 0) {
        sql += ` WHERE ` + whereConditions.join(' AND ');
    }

    sql += ` GROUP BY stock.invoice_no 
           ORDER BY stock.invoice_no DESC 
           LIMIT ? OFFSET ?`;

    params.push(limit, offset);

    // Execute the paginated query
    connection.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Query to get total count of distinct invoice_no values
        let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM stock`;
        let countParams = [];
        let countWhereConditions = [];

        if (searchStock) {
            countWhereConditions.push(`invoice_no LIKE ?`);
            countParams.push(`%${searchStock}%`);
        }

        if (supplier_id) {
            countWhereConditions.push(`supplier_id = ?`);
            countParams.push(supplier_id);
        }

        if (remaining_amount) {
            countWhereConditions.push(`remaining_amount > 0`);
        }

        // Add WHERE clause if there are any conditions for count query
        if (countWhereConditions.length > 0) {
            countSql += ` WHERE ` + countWhereConditions.join(' AND ');
        }

        // Execute the count query
        connection.query(countSql, countParams, (countError, countResult) => {
            if (countError) {
                console.error('Error executing count SQL query: ', countError);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Ensure countResult has data before accessing it
            const totalItems = countResult.length > 0 ? countResult[0].total_count : 0;
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




// app.get("/get-invoice-list-for-pharmacy", (req, res) => {
//   // Extract and validate query parameters
//   const page = Math.max(1, parseInt(req.query.page) || 1);
//   const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 5), 100); // Limit between 1 and 100
//   const offset = (page - 1) * limit;
//   const searchInvoice = req.query.search || "";
//   const type_get = req.query.type || "all";
//   const alert_date = req.query.alert_date || "";
//   const invoice_date = req.query.invoice_date || "";
//   const invoice_status = req.query.invoice_status || "";
//   const invoice_to_date = req.query.invoice_to_date || "";
//   // console.log(page, limit, offset, searchInvoice, type_get);

//   // Initialize base SQL query and parameters
//   let sql = `SELECT invoice_no, full_name, phone_no, invoice_type, SUM((price * quantity) - discount) AS total_amount, 
//                       remaining_amount, invoice_status, alert_date, SUM(quantity) AS total_quantity 
//                FROM invoice_pharmacy`;
//   let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM invoice_pharmacy`;
//   let conditions = [];
//   let params = [];
//   let countParams = [];

//   // Apply filters dynamically
//   if (type_get !== "all") {
//     conditions.push(`invoice_type = ?`);
//     params.push(type_get);
//     countParams.push(type_get);
//   }

//   if (alert_date !== "") {
//     conditions.push(`alert_date = ?`);
//     params.push(alert_date);
//     countParams.push(alert_date);
//   }


//   if (invoice_date !== "" && invoice_to_date !== "") {
//     conditions.push(`invoice_date BETWEEN ? AND ?`);
//     params.push(invoice_date, invoice_to_date);
//     countParams.push(invoice_date, invoice_to_date);
//   }else if (invoice_date !== "") {
//     conditions.push(`invoice_date = ?`);
//     params.push(invoice_date);
//     countParams.push(invoice_date);
//   }else if (invoice_to_date !== "") {
//     conditions.push(`invoice_date = ?`);
//     params.push(invoice_to_date);
//     countParams.push(invoice_to_date);
//   }

  

//   if (invoice_status == "unpaid") {
//     conditions.push(`(invoice_status = ? || remaining_amount > 0)`);
//     params.push(invoice_status);
//     countParams.push(invoice_status);
//   }

//   if (invoice_status == "paid") {
//     conditions.push(`invoice_status = ?`);
//     params.push(invoice_status);
//     countParams.push(invoice_status);
//   }

//   if (searchInvoice !== "") {
//     conditions.push(
//       `(invoice_no LIKE ? OR phone_no LIKE ? OR full_name LIKE ?)`
//     );
//     // Push the same value 3 times for the 3 placeholders
//     params.push(
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`
//     );
//     countParams.push(
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`
//     );
//   }

//   // Add WHERE clause if any condition exists
//   if (conditions.length > 0) {
//     sql += ` WHERE ` + conditions.join(" AND ");
//     countSql += ` WHERE ` + conditions.join(" AND ");
//   }

//   // Add grouping, sorting, and pagination
//   sql += ` GROUP BY invoice_no
//              ORDER BY invoice_no DESC 
//              LIMIT ? OFFSET ?`;
//   params.push(limit, offset);

//   // Execute the main query
//   connection.query(sql, params, (error, results) => {
//     if (error) {
//       console.error("Error executing SQL query: ", error);
//       return res
//         .status(500)
//         .json({ error: "Database query failed", details: error.message });
//     }

//     // Execute the count query
//     connection.query(countSql, countParams, (countError, countResult) => {
//       if (countError) {
//         console.error("Error executing count SQL query: ", countError);
//         return res
//           .status(500)
//           .json({
//             error: "Database query failed",
//             details: countError.message,
//           });
//       }

//       const totalItems = countResult[0].total_count;
//       const totalPages = Math.ceil(totalItems / limit);

//       // Send paginated results and metadata
//       res.json({
//         totalItems,
//         currentPage: page,
//         totalPages,
//         results,
//       });
//     });
//   });
// });








// app.get('/get-invoice-list-for-pharmacy', (req, res) => {
//     // Extract and validate query parameters
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 5), 100); // Limit between 1 and 100
//     const offset = (page - 1) * limit;
//     const searchInvoice = req.query.search || '';
//     const type_get = req.query.type || 'all';
//     const alert_date = req.query.alert_date || "";
//     const invoice_status = req.query.invoice_status || "";

//     // console.log(page, limit, offset, searchInvoice, type_get);

//     // Initialize base SQL query and parameters
//     let sql = `SELECT invoice_no, full_name, phone_no, invoice_type, SUM(total) AS total_amount, 
//                       remaining_amount, invoice_status, alert_date, SUM(quantity) AS total_quantity 
//                FROM invoice_pharmacy`;
//     let countSql = `SELECT COUNT(DISTINCT invoice_no) AS total_count FROM invoice_pharmacy`;
//     let conditions = [];
//     let params = [];
//     let countParams = [];

//     // Apply filters dynamically
//     if (type_get !== 'all') {
//         conditions.push(`invoice_type = ?`);
//         params.push(type_get);
//         countParams.push(type_get);
//     }

//     if (alert_date !== '') {
//         conditions.push(`alert_date = ?`);
//         params.push(alert_date);
//         countParams.push(alert_date);
//     }

//     if (invoice_status == 'unpaid') {
//         conditions.push(`(invoice_status = ? || remaining_amount > 0)`);
//         params.push(invoice_status);
//         countParams.push(invoice_status);
//     }

//     if (invoice_status == 'paid') {
//         conditions.push(`invoice_status = ?`);
//         params.push(invoice_status);
//         countParams.push(invoice_status);
//     }

//     if (searchInvoice !=='') {
//         conditions.push(`(invoice_no LIKE ? OR phone_no LIKE ?)`);
//         params.push(`%${searchInvoice}%`, `%${searchInvoice}%`);
//         countParams.push(`%${searchInvoice}%`, `%${searchInvoice}%`);
//     }

//     // Add WHERE clause if any condition exists
//     if (conditions.length > 0) {
//         sql += ` WHERE ` + conditions.join(' AND ');
//         countSql += ` WHERE ` + conditions.join(' AND ');
//     }

//     // Add grouping, sorting, and pagination
//     sql += ` GROUP BY invoice_no
//              ORDER BY invoice_no DESC 
//              LIMIT ? OFFSET ?`;
//     params.push(limit, offset);

//     // Execute the main query
//     connection.query(sql, params, (error, results) => {
//         if (error) {
//             console.error('Error executing SQL query: ', error);
//             return res.status(500).json({ error: 'Database query failed', details: error.message });
//         }

//         // Execute the count query
//         connection.query(countSql, countParams, (countError, countResult) => {
//             if (countError) {
//                 console.error('Error executing count SQL query: ', countError);
//                 return res.status(500).json({ error: 'Database query failed', details: countError.message });
//             }

//             const totalItems = countResult[0].total_count;
//             const totalPages = Math.ceil(totalItems / limit);

//             // Send paginated results and metadata
//             res.json({
//                 totalItems,
//                 currentPage: page,
//                 totalPages,
//                 results
//             });
//         });
//     });
// });





// app.get("/get-invoice-list-for-pharmacy", (req, res) => {
//   // Extract and validate query parameters
//   const page = Math.max(1, parseInt(req.query.page) || 1);
//   const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 5), 100);
//   const offset = (page - 1) * limit;
//   const searchInvoice = req.query.search || "";
//   const type_get = req.query.type || "all";
//   const alert_date = req.query.alert_date || "";
//   const invoice_date = req.query.invoice_date || "";
//   const invoice_status = req.query.invoice_status || "";
//   const invoice_to_date = req.query.invoice_to_date || "";

//   // Modified SQL query with JOIN to invoice_payments
//   let sql = `SELECT 
//                 ip.invoice_no, 
//                 ip.full_name, 
//                 ip.phone_no, 
//                 ip.invoice_type, 
//                 SUM((ip.price * ip.quantity) - ip.discount) AS total_amount,
//                 ip.remaining_amount AS original_remaining_amount,
//                 COALESCE(SUM(payments.payment_amount), 0) AS total_paid,
//                 (ip.remaining_amount - COALESCE(SUM(payments.payment_amount), 0)) AS actual_remaining_amount,
//                 ip.invoice_status, 
//                 ip.alert_date, 
//                 SUM(ip.quantity) AS total_quantity
//              FROM invoice_pharmacy ip
//              LEFT JOIN invoice_payments payments ON ip.invoice_no = payments.invoice_no`;

//   let countSql = `SELECT COUNT(DISTINCT ip.invoice_no) AS total_count 
//                   FROM invoice_pharmacy ip
//                   LEFT JOIN invoice_payments payments ON ip.invoice_no = payments.invoice_no`;
  
//   let conditions = [];
//   let params = [];
//   let countParams = [];

//   // Apply filters dynamically
//   if (type_get !== "all") {
//     conditions.push(`ip.invoice_type = ?`);
//     params.push(type_get);
//     countParams.push(type_get);
//   }

//   if (alert_date !== "") {
//     conditions.push(`ip.alert_date = ?`);
//     params.push(alert_date);
//     countParams.push(alert_date);
//   }

//   if (invoice_date !== "" && invoice_to_date !== "") {
//     conditions.push(`ip.invoice_date BETWEEN ? AND ?`);
//     params.push(invoice_date, invoice_to_date);
//     countParams.push(invoice_date, invoice_to_date);
//   } else if (invoice_date !== "") {
//     conditions.push(`ip.invoice_date = ?`);
//     params.push(invoice_date);
//     countParams.push(invoice_date);
//   } else if (invoice_to_date !== "") {
//     conditions.push(`ip.invoice_date = ?`);
//     params.push(invoice_to_date);
//     countParams.push(invoice_to_date);
//   }

//   if (invoice_status == "unpaid") {
//     conditions.push(`(ip.invoice_status = ? OR ip.actual_remaining_amount > 0)`);
//     params.push(invoice_status);
//     countParams.push(invoice_status);
//   }

//   if (invoice_status == "paid") {
//     conditions.push(`ip.invoice_status = ?`);
//     params.push(invoice_status);
//     countParams.push(invoice_status);
//   }

//   if (searchInvoice !== "") {
//     conditions.push(
//       `(ip.invoice_no LIKE ? OR ip.phone_no LIKE ? OR ip.full_name LIKE ?)`
//     );
//     params.push(
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`
//     );
//     countParams.push(
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`,
//       `%${searchInvoice}%`
//     );
//   }

//   // Add WHERE clause if any condition exists
//   if (conditions.length > 0) {
//     sql += ` WHERE ` + conditions.join(" AND ");
//     countSql += ` WHERE ` + conditions.join(" AND ");
//   }

//   // Add grouping, sorting, and pagination
//   sql += ` GROUP BY ip.invoice_no
//            ORDER BY ip.invoice_no DESC 
//            LIMIT ? OFFSET ?`;
//   params.push(limit, offset);

//   // Execute the main query
//   connection.query(sql, params, (error, results) => {
//     if (error) {
//       console.error("Error executing SQL query: ", error);
//       return res
//         .status(500)
//         .json({ error: "Database query failed", details: error.message });
//     }

//     // Execute the count query
//     connection.query(countSql, countParams, (countError, countResult) => {
//       if (countError) {
//         console.error("Error executing count SQL query: ", countError);
//         return res.status(500).json({
//           error: "Database query failed",
//           details: countError.message,
//         });
//       }

//       const totalItems = countResult[0].total_count;
//       const totalPages = Math.ceil(totalItems / limit);

//       // Send paginated results and metadata
//       res.json({
//         totalItems,
//         currentPage: page,
//         totalPages,
//         results,
//       });
//     });
//   });
// });




app.get("/get-invoice-list-for-pharmacy", (req, res) => {
  // Extract and validate query parameters
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 5), 100);
  const offset = (page - 1) * limit;
  const searchInvoice = req.query.search || "";
  const type_get = req.query.type || "all";
  const alert_date = req.query.alert_date || "";
  const invoice_date = req.query.invoice_date || "";
  const invoice_status = req.query.invoice_status || "";
  const invoice_to_date = req.query.invoice_to_date || "";
  const appointment_date =  req.query.appointment_date || "";

  // Modified SQL query with JOIN to invoice_payments
  let sql = `SELECT 
                ip.invoice_no, 
                ip.full_name, 
                ip.phone_no, 
                ip.invoice_type, 
                SUM((ip.price * ip.quantity) - ip.discount) AS total_amount,
                MAX(ip.remaining_amount) AS original_remaining_amount,
                COALESCE(SUM(payments.payment_amount), 0) AS total_paid,
                (MAX(ip.remaining_amount) - COALESCE(SUM(payments.payment_amount), 0)) AS actual_remaining_amount,
                ip.invoice_status, 
                ip.alert_date, 
                SUM(ip.quantity) AS total_quantity
             FROM invoice_pharmacy ip
             LEFT JOIN invoice_payments payments ON ip.invoice_no = payments.invoice_no`;

  let countSql = `SELECT COUNT(*) AS total_count FROM (
                    SELECT ip.invoice_no
                    FROM invoice_pharmacy ip
                    LEFT JOIN invoice_payments payments ON ip.invoice_no = payments.invoice_no`;
  
  let conditions = [];
  let havingConditions = []; // For HAVING clause
  let params = [];
  let countParams = [];

  // Apply filters dynamically
  if (type_get !== "all") {
    conditions.push(`ip.invoice_type = ?`);
    params.push(type_get);
    countParams.push(type_get);
  }

  if (alert_date !== "") {
    conditions.push(`ip.alert_date = ?`);
    params.push(alert_date);
    countParams.push(alert_date);
  }

  if(type_get !== 'appointment'){
  if (invoice_date !== "" && invoice_to_date !== "") {
    conditions.push(`ip.invoice_date BETWEEN ? AND ?`);
    params.push(invoice_date, invoice_to_date);
    countParams.push(invoice_date, invoice_to_date);
  } else if (invoice_date !== "") {
    conditions.push(`ip.invoice_date = ?`);
    params.push(invoice_date);
    countParams.push(invoice_date);
  } else if (invoice_to_date !== "") {
    conditions.push(`ip.invoice_date = ?`);
    params.push(invoice_to_date);
    countParams.push(invoice_to_date);
  }
  }

  if(type_get == 'appointment' && appointment_date !=''){
    conditions.push(`ip.appointment_date = ?`);
    params.push(appointment_date);
    countParams.push(appointment_date);
  }
  
  // ✅ Updated unpaid filter using actual_remaining_amount
  if (invoice_status == "unpaid") {
    havingConditions.push(`(MAX(ip.remaining_amount) - COALESCE(SUM(payments.payment_amount), 0)) > 0`);
  }

  // ✅ Updated paid filter using actual_remaining_amount
  if (invoice_status == "paid") {
    havingConditions.push(`(MAX(ip.remaining_amount) - COALESCE(SUM(payments.payment_amount), 0)) <= 0`);
  }

  if (searchInvoice !== "") {
    conditions.push(
      `(ip.invoice_no LIKE ? OR ip.phone_no LIKE ? OR ip.full_name LIKE ?)`
    );
    params.push(
      `%${searchInvoice}%`,
      `%${searchInvoice}%`,
      `%${searchInvoice}%`
    );
    countParams.push(
      `%${searchInvoice}%`,
      `%${searchInvoice}%`,
      `%${searchInvoice}%`
    );
  }

  // Add WHERE clause if any condition exists
  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
    countSql += ` WHERE ` + conditions.join(" AND ");
  }

  // Add GROUP BY
  sql += ` GROUP BY ip.invoice_no`;
  countSql += ` GROUP BY ip.invoice_no`;

  // ✅ Add HAVING clause for both main and count queries
  if (havingConditions.length > 0) {
    sql += ` HAVING ` + havingConditions.join(" AND ");
    countSql += ` HAVING ` + havingConditions.join(" AND ");
  }

  // Close the subquery for count
  countSql += `) AS filtered_invoices`;

  // Add sorting and pagination
  sql += ` ORDER BY ip.invoice_no DESC 
           LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  // Execute the main query
  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error("Error executing SQL query: ", error);
      return res
        .status(500)
        .json({ error: "Database query failed", details: error.message });
    }

    // Execute the count query
    connection.query(countSql, countParams, (countError, countResult) => {
      if (countError) {
        console.error("Error executing count SQL query: ", countError);
        return res.status(500).json({
          error: "Database query failed",
          details: countError.message,
        });
      }

      const totalItems = countResult[0].total_count;
      const totalPages = Math.ceil(totalItems / limit);

      // Send paginated results and metadata
      res.json({
        totalItems,
        currentPage: page,
        totalPages,
        results,
      });
    });
  });
});




app.get("/get-staff-commission", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 100);
  const offset = (page - 1) * limit;
  const staff_id = req.query.staff_id;
  const from_date = req.query.from_date || "";
  const to_date = req.query.to_date || "";
  const status = req.query.status || "";
  const search = req.query.search || "";

  if (!staff_id) {
    return res.status(400).json({ error: "Staff ID is required" });
  }

  let sql = `
    SELECT 
      ip.invoice_no,
      ip.invoice_date,
      ip.full_name AS customer_name,
      ip.grand_total AS invoice_amount,
      s.commission_rate,
      (ip.commission_amount) AS commission_amount,
      COALESCE(SUM(cp.payment_amount), 0) AS paid_commission,
      ((ip.commission_amount) - COALESCE(SUM(cp.payment_amount), 0)) AS remaining_commission
    FROM invoice_pharmacy ip
    INNER JOIN staff s ON s.id = ?
    LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = s.id
    WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
  `;

  let countSql = `
    SELECT COUNT(DISTINCT ip.invoice_no) AS total_count
    FROM invoice_pharmacy ip
    INNER JOIN staff s ON s.id = ?
    LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = s.id
    WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
  `;

  let params = [staff_id, staff_id];
  let countParams = [staff_id, staff_id];

  // Date filters
  if (from_date && to_date) {
    sql += ` AND ip.invoice_date BETWEEN ? AND ?`;
    countSql += ` AND ip.invoice_date BETWEEN ? AND ?`;
    params.push(from_date, to_date);
    countParams.push(from_date, to_date);
  } else if (from_date) {
    sql += ` AND ip.invoice_date >= ?`;
    countSql += ` AND ip.invoice_date >= ?`;
    params.push(from_date);
    countParams.push(from_date);
  } else if (to_date) {
    sql += ` AND ip.invoice_date <= ?`;
    countSql += ` AND ip.invoice_date <= ?`;
    params.push(to_date);
    countParams.push(to_date);
  }

  // Search filter
  if (search) {
    sql += ` AND (ip.invoice_no LIKE ? OR ip.full_name LIKE ?)`;
    countSql += ` AND (ip.invoice_no LIKE ? OR ip.full_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  sql += ` GROUP BY ip.invoice_no, ip.invoice_date, ip.full_name, ip.grand_total, s.commission_rate`;

  // Status filter using HAVING
  if (status === "unpaid") {
    sql += ` HAVING remaining_commission > 0`;
  } else if (status === "paid") {
    sql += ` HAVING remaining_commission <= 0`;
  }

  sql += ` ORDER BY ip.invoice_date DESC, ip.invoice_no DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error("Error fetching commission data:", error);
      return res.status(500).json({ error: "Failed to fetch commission data" });
    }

    connection.query(countSql, countParams, (countError, countResult) => {
      if (countError) {
        return res.status(500).json({ error: "Failed to count records" });
      }

      const totalItems = countResult[0].total_count;
      const totalPages = Math.ceil(totalItems / limit);

      // Calculate summary
      const total_commission = results.reduce((sum, item) => sum + parseFloat(item.commission_amount || 0), 0);
      const total_paid = results.reduce((sum, item) => sum + parseFloat(item.paid_commission || 0), 0);
      const total_unpaid = results.reduce((sum, item) => sum + parseFloat(item.remaining_commission || 0), 0);

      res.json({
        results,
        totalPages,
        currentPage: page,
        totalCount: totalItems,
        summary: {
          total_commission,
          total_paid,
          total_unpaid
        }
      });
    });
  });
});





app.post("/add-commission-payment", (req, res) => {
  const { invoice_no, staff_id, payment_amount, payment_method, notes } = req.body;

  if (!invoice_no || !staff_id || !payment_amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO commission_payments 
    (invoice_no, staff_id, payment_amount, payment_method, payment_date, notes, created_by)
    VALUES (?, ?, ?, ?, NOW(), ?, ?)
  `;

  connection.query(
    sql,
    [invoice_no, staff_id, payment_amount, payment_method || 'cash', notes || null, req.body.created_by || null],
    (error, result) => {
      if (error) {
        console.error("Error adding payment:", error);
        return res.status(500).json({ error: "Failed to add payment" });
      }

      res.json({
        message: "Payment added successfully",
        payment_id: result.insertId
      });
    }
  );
});



app.get("/get-staff-list", (req, res) => {
  connection.query(
    "SELECT id, name, cnic, commission_rate FROM staff WHERE status = 'active' ORDER BY name",
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Failed to fetch staff" });
      }
      res.json(results);
    }
  );
});











// Backend API Endpoints for Salary Management

// Get staff details by ID
app.get("/get-staff-details/:id", (req, res) => {
  const staff_id = req.params.id;
  
  connection.query(
    "SELECT * FROM staff WHERE id = ?",
    [staff_id],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: "Failed to fetch staff details" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Staff not found" });
      }
      res.json(results[0]);
    }
  );
});

// Get pending commission for a staff member
// app.get("/get-pending-commission", (req, res) => {
//   const staff_id = req.query.staff_id;
  
//   if (!staff_id) {
//     return res.status(400).json({ error: "Staff ID is required" });
//   }

//   const sql = `
//     SELECT 
//       SUM((ip.commission_amount) - COALESCE(SUM(cp.payment_amount), 0)) AS pending_commission, COUNT(DISTINCT ip.invoice_no) AS unpaid_invoices
//     FROM invoice_pharmacy ip
//     LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = ip.staff_id
//     WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
//     GROUP BY ip.staff_id
//   `;

//   connection.query(sql, [staff_id], (error, results) => {
//     if (error) {
//       console.error("Error fetching pending commission:", error);
//       return res.status(500).json({ error: "Failed to fetch pending commission" });
//     }

//     const pending_commission = results.length > 0 ? parseFloat(results[0].pending_commission || 0) : 0;
//     res.json({ pending_commission });
//   });
// });

// Process staff salary
// app.post("/process-staff-salary", (req, res) => {
//   const {
//     staff_id,
//     month,
//     year,
//     base_salary,
//     allowances,
//     deductions,
//     bonuses,
//     commission_included,
//     net_salary,
//     payment_method,
//     notes
//   } = req.body;

//   if (!staff_id || !month || !year || !net_salary) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Check if salary already processed for this month/year
//   connection.query(
//     "SELECT id FROM staff_salary WHERE staff_id = ? AND month = ? AND year = ?",
//     [staff_id, month, year],
//     (error, existingRecords) => {
//       if (error) {
//         return res.status(500).json({ error: "Database error" });
//       }

//       if (existingRecords.length > 0) {
//         return res.status(400).json({ 
//           error: "Salary already processed for this month/year" 
//         });
//       }

//       // Insert salary record
//       const insertSql = `
//         INSERT INTO staff_salary 
//         (staff_id, month, year, base_salary, allowances, deductions, bonuses, 
//          commission_included, net_salary, payment_method, payment_date, notes)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
//       `;

//       connection.query(
//         insertSql,
//         [staff_id, month, year, base_salary, allowances || 0, deductions || 0, 
//          bonuses || 0, commission_included || 0, net_salary, payment_method, notes],
//         (insertError, result) => {
//           if (insertError) {
//             console.error("Error inserting salary:", insertError);
//             return res.status(500).json({ error: "Failed to process salary" });
//           }

//           // If commission is included, mark it as paid
//           if (commission_included && parseFloat(commission_included) > 0) {
//             const commissionSql = `
//               INSERT INTO commission_payments 
//               (invoice_no, staff_id, payment_amount, payment_method, payment_date, notes, created_by)
//               SELECT 
//                 ip.invoice_no,
//                 ip.staff_id,
//                 LEAST(
//                   (ip.commission_amount - COALESCE(SUM(cp.payment_amount), 0)),
//                   ?
//                 ) AS payment_amount,
//                 ? AS payment_method,
//                 NOW() AS payment_date,
//                 ? AS notes,
//                 NULL AS created_by
//               FROM invoice_pharmacy ip
//               LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = ip.staff_id
//               WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
//               GROUP BY ip.invoice_no, ip.staff_id, ip.commission_amount
//               HAVING (ip.commission_amount - COALESCE(SUM(cp.payment_amount), 0)) > 0
//               LIMIT 1
//             `;

//             connection.query(
//               commissionSql,
//               [commission_included, payment_method, 
//                `Paid with ${months[parseInt(month)-1]?.label || month} ${year} salary`, 
//                staff_id],
//               (commError) => {
//                 if (commError) {
//                   console.error("Error recording commission payment:", commError);
//                 }
//               }
//             );
//           }

//           res.json({
//             message: "Salary processed successfully",
//             salary_id: result.insertId
//           });
//         }
//       );
//     }
//   );
// });



// Get pending commission with invoice details - FIXED VERSION
// app.get("/get-pending-commission", (req, res) => {
//   const staff_id = req.query.staff_id;
  
//   if (!staff_id) {
//     return res.status(400).json({ error: "Staff ID is required" });
//   }

//   // First get the summary using subquery
//   const sql = `
//     SELECT 
//       COALESCE(SUM(remaining), 0) AS pending_commission,
//       COUNT(*) AS unpaid_invoices
//     FROM (
//       SELECT 
//         ip.invoice_no,
//         (ip.commission_amount - COALESCE(SUM(cp.payment_amount), 0)) AS remaining
//       FROM invoice_pharmacy ip
//       LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = ip.staff_id
//       WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
//       GROUP BY ip.invoice_no, ip.commission_amount
//       HAVING remaining > 0
//     ) AS unpaid
//   `;

//   connection.query(sql, [staff_id], (error, results) => {
//     if (error) {
//       console.error("Error fetching pending commission:", error);
//       return res.status(500).json({ error: "Failed to fetch pending commission" });
//     }

//     const pending_commission = results.length > 0 ? parseFloat(results[0].pending_commission || 0) : 0;
//     const unpaid_invoices = results.length > 0 ? parseInt(results[0].unpaid_invoices || 0) : 0;
    
//     res.json({ 
//       pending_commission,
//       unpaid_invoices 
//     });
//   });
// });



// app.post("/process-staff-salary", (req, res) => {
//   const {
//     staff_id,
//     month,
//     year,
//     base_salary,
//     allowances,
//     deductions,
//     bonuses,
//     commission_included,
//     net_salary,
//     payment_method,
//     notes
//   } = req.body;

//   if (!staff_id || !month || !year || !net_salary) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   // Check if salary already processed for this month/year
//   connection.query(
//     "SELECT id FROM staff_salary WHERE staff_id = ? AND month = ? AND year = ?",
//     [staff_id, month, year],
//     (error, existingRecords) => {
//       if (error) {
//         return res.status(500).json({ error: "Database error" });
//       }

//       if (existingRecords.length > 0) {
//         return res.status(400).json({ 
//           error: "Salary already processed for this month/year" 
//         });
//       }

//       // Start transaction
//       connection.beginTransaction((err) => {
//         if (err) {
//           return res.status(500).json({ error: "Transaction start failed" });
//         }

//         // Insert salary record
//         const insertSalarySql = `
//           INSERT INTO staff_salary 
//           (staff_id, month, year, base_salary, allowances, deductions, bonuses, 
//            commission_included, net_salary, payment_method, payment_date, notes)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
//         `;

//         connection.query(
//           insertSalarySql,
//           [staff_id, month, year, base_salary, allowances || 0, deductions || 0, 
//            bonuses || 0, commission_included || 0, net_salary, payment_method, notes],
//           (insertError, salaryResult) => {
//             if (insertError) {
//               return connection.rollback(() => {
//                 console.error("Error inserting salary:", insertError);
//                 res.status(500).json({ error: "Failed to process salary" });
//               });
//             }

//             const salary_id = salaryResult.insertId;

//             // If commission is included, distribute it to unpaid invoices
//             if (commission_included && parseFloat(commission_included) > 0) {
              
//               // Get unpaid commission invoices ordered by date (oldest first)
//               const getUnpaidSql = `
//                 SELECT 
//                   ip.invoice_no,
//                   ip.commission_amount,
//                   COALESCE(SUM(cp.payment_amount), 0) AS paid_commission,
//                   (ip.commission_amount - COALESCE(SUM(cp.payment_amount), 0)) AS remaining_commission
//                 FROM invoice_pharmacy ip
//                 LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = ip.staff_id
//                 WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
//                 GROUP BY ip.invoice_no, ip.commission_amount
//                 HAVING remaining_commission > 0
//                 ORDER BY ip.invoice_date ASC, ip.invoice_no ASC
//               `;

//               connection.query(getUnpaidSql, [staff_id], (getError, unpaidInvoices) => {
//                 if (getError) {
//                   return connection.rollback(() => {
//                     console.error("Error fetching unpaid invoices:", getError);
//                     res.status(500).json({ error: "Failed to fetch unpaid invoices" });
//                   });
//                 }

//                 if (unpaidInvoices.length === 0) {
//                   // No unpaid commission, just commit the salary
//                   return connection.commit((commitErr) => {
//                     if (commitErr) {
//                       return connection.rollback(() => {
//                         res.status(500).json({ error: "Failed to commit transaction" });
//                       });
//                     }
//                     res.json({
//                       message: "Salary processed successfully (no unpaid commission found)",
//                       salary_id: salary_id
//                     });
//                   });
//                 }

//                 // Distribute commission amount across unpaid invoices
//                 let remainingAmount = parseFloat(commission_included);
//                 const commissionPayments = [];

//                 for (const invoice of unpaidInvoices) {
//                   if (remainingAmount <= 0) break;

//                   const invoiceRemaining = parseFloat(invoice.remaining_commission);
//                   const paymentForThisInvoice = Math.min(remainingAmount, invoiceRemaining);

//                   commissionPayments.push({
//                     invoice_no: invoice.invoice_no,
//                     payment_amount: paymentForThisInvoice
//                   });

//                   remainingAmount -= paymentForThisInvoice;
//                 }

//                 // Insert commission payments
//                 let paymentsProcessed = 0;
//                 const totalPayments = commissionPayments.length;
//                 const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
//                                    'July', 'August', 'September', 'October', 'November', 'December'];

//                 commissionPayments.forEach((payment) => {
//                   const insertCommissionSql = `
//                     INSERT INTO commission_payments 
//                     (invoice_no, staff_id, payment_amount, payment_method, payment_date, notes, salary_id)
//                     VALUES (?, ?, ?, ?, NOW(), ?, ?)
//                   `;

//                   const paymentNotes = `Paid with ${monthNames[parseInt(month)]} ${year} salary`;

//                   connection.query(
//                     insertCommissionSql,
//                     [payment.invoice_no, staff_id, payment.payment_amount, 
//                      payment_method, paymentNotes, salary_id],
//                     (paymentError) => {
//                       if (paymentError) {
//                         return connection.rollback(() => {
//                           console.error("Error inserting commission payment:", paymentError);
//                           res.status(500).json({ error: "Failed to record commission payment" });
//                         });
//                       }

//                       paymentsProcessed++;

//                       // If all payments processed, commit transaction
//                       if (paymentsProcessed === totalPayments) {
//                         connection.commit((commitErr) => {
//                           if (commitErr) {
//                             return connection.rollback(() => {
//                               res.status(500).json({ error: "Failed to commit transaction" });
//                             });
//                           }

//                           res.json({
//                             message: "Salary and commission payments processed successfully",
//                             salary_id: salary_id,
//                             commission_payments: totalPayments,
//                             total_commission_paid: parseFloat(commission_included)
//                           });
//                         });
//                       }
//                     }
//                   );
//                 });

//               });

//             } else {
//               // No commission included, just commit salary
//               connection.commit((commitErr) => {
//                 if (commitErr) {
//                   return connection.rollback(() => {
//                     res.status(500).json({ error: "Failed to commit transaction" });
//                   });
//                 }
//                 res.json({
//                   message: "Salary processed successfully",
//                   salary_id: salary_id
//                 });
//               });
//             }
//           }
//         );
//       });
//     }
//   );
// });



// Get pending commission - FIXED
app.get("/get-pending-commission", (req, res) => {
  const staff_id = req.query.staff_id;
  
  if (!staff_id) {
    return res.status(400).json({ error: "Staff ID is required" });
  }

  const sql = `
    SELECT 
      ip.invoice_no,
      ip.commission_amount,
      COALESCE(SUM(cp.payment_amount), 0) AS paid_amount,
      (ip.commission_amount - COALESCE(SUM(cp.payment_amount), 0)) AS remaining
    FROM invoice_pharmacy ip
    LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = ip.staff_id
    WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
    GROUP BY ip.invoice_no, ip.commission_amount
    HAVING remaining > 0
  `;

  connection.query(sql, [staff_id], (error, results) => {
    if (error) {
      console.error("Error fetching pending commission:", error);
      return res.status(500).json({ error: "Failed to fetch pending commission" });
    }

    // Calculate totals in JavaScript
    const pending_commission = results.reduce((sum, row) => sum + parseFloat(row.remaining || 0), 0);
    const unpaid_invoices = results.length;
    
    res.json({ 
      pending_commission,
      unpaid_invoices 
    });
  });
});

// Process staff salary - FIXED with proper transaction handling
app.post("/process-staff-salary", (req, res) => {
  const {
    staff_id,
    month,
    year,
    base_salary,
    allowances,
    deductions,
    bonuses,
    commission_included,
    net_salary,
    payment_method,
    notes
  } = req.body;

  if (!staff_id || !month || !year || !net_salary) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if salary already processed for this month/year
  connection.query(
    "SELECT id FROM staff_salary WHERE staff_id = ? AND month = ? AND year = ?",
    [staff_id, month, year],
    (error, existingRecords) => {
      if (error) {
        return res.status(500).json({ error: "Database error" });
      }

      if (existingRecords.length > 0) {
        return res.status(400).json({ 
          error: "Salary already processed for this month/year" 
        });
      }

      // Get a connection from pool for transaction
      connection.getConnection((err, conn) => {
        if (err) {
          console.error("Error getting connection:", err);
          return res.status(500).json({ error: "Database connection error" });
        }

        // Start transaction
        conn.beginTransaction((transErr) => {
          if (transErr) {
            conn.release();
            return res.status(500).json({ error: "Transaction start failed" });
          }

          // Insert salary record
          const insertSalarySql = `
            INSERT INTO staff_salary 
            (staff_id, month, year, base_salary, allowances, deductions, bonuses, 
             commission_included, net_salary, payment_method, payment_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
          `;

          conn.query(
            insertSalarySql,
            [staff_id, month, year, base_salary, allowances || 0, deductions || 0, 
             bonuses || 0, commission_included || 0, net_salary, payment_method, notes],
            (insertError, salaryResult) => {
              if (insertError) {
                return conn.rollback(() => {
                  conn.release();
                  console.error("Error inserting salary:", insertError);
                  res.status(500).json({ error: "Failed to process salary" });
                });
              }

              const salary_id = salaryResult.insertId;

              // If commission is included, distribute it to unpaid invoices
              if (commission_included && parseFloat(commission_included) > 0) {
                
                // Get unpaid commission invoices ordered by date (oldest first)
                const getUnpaidSql = `
                  SELECT 
                    ip.invoice_no,
                    ip.commission_amount,
                    COALESCE(SUM(cp.payment_amount), 0) AS paid_commission,
                    (ip.commission_amount - COALESCE(SUM(cp.payment_amount), 0)) AS remaining_commission
                  FROM invoice_pharmacy ip
                  LEFT JOIN commission_payments cp ON cp.invoice_no = ip.invoice_no AND cp.staff_id = ip.staff_id
                  WHERE ip.staff_id = ? AND ip.invoice_type = 'sale'
                  GROUP BY ip.invoice_no, ip.commission_amount
                  HAVING remaining_commission > 0
                  ORDER BY ip.invoice_date ASC, ip.invoice_no ASC
                `;

                conn.query(getUnpaidSql, [staff_id], (getError, unpaidInvoices) => {
                  if (getError) {
                    return conn.rollback(() => {
                      conn.release();
                      console.error("Error fetching unpaid invoices:", getError);
                      res.status(500).json({ error: "Failed to fetch unpaid invoices" });
                    });
                  }

                  if (unpaidInvoices.length === 0) {
                    // No unpaid commission, just commit the salary
                    return conn.commit((commitErr) => {
                      if (commitErr) {
                        return conn.rollback(() => {
                          conn.release();
                          res.status(500).json({ error: "Failed to commit transaction" });
                        });
                      }
                      conn.release();
                      res.json({
                        message: "Salary processed successfully (no unpaid commission found)",
                        salary_id: salary_id
                      });
                    });
                  }

                  // Distribute commission amount across unpaid invoices
                  let remainingAmount = parseFloat(commission_included);
                  const commissionPayments = [];

                  for (const invoice of unpaidInvoices) {
                    if (remainingAmount <= 0) break;

                    const invoiceRemaining = parseFloat(invoice.remaining_commission);
                    const paymentForThisInvoice = Math.min(remainingAmount, invoiceRemaining);

                    commissionPayments.push({
                      invoice_no: invoice.invoice_no,
                      payment_amount: paymentForThisInvoice
                    });

                    remainingAmount -= paymentForThisInvoice;
                  }

                  // Insert commission payments
                  let paymentsProcessed = 0;
                  const totalPayments = commissionPayments.length;
                  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];

                  if (totalPayments === 0) {
                    return conn.commit((commitErr) => {
                      if (commitErr) {
                        return conn.rollback(() => {
                          conn.release();
                          res.status(500).json({ error: "Failed to commit transaction" });
                        });
                      }
                      conn.release();
                      res.json({
                        message: "Salary processed successfully",
                        salary_id: salary_id
                      });
                    });
                  }

                  commissionPayments.forEach((payment) => {
                    const insertCommissionSql = `
                      INSERT INTO commission_payments 
                      (invoice_no, staff_id, payment_amount, payment_method, payment_date, notes, salary_id)
                      VALUES (?, ?, ?, ?, NOW(), ?, ?)
                    `;

                    const paymentNotes = `Paid with ${monthNames[parseInt(month)]} ${year} salary`;

                    conn.query(
                      insertCommissionSql,
                      [payment.invoice_no, staff_id, payment.payment_amount, 
                       payment_method, paymentNotes, salary_id],
                      (paymentError) => {
                        if (paymentError) {
                          return conn.rollback(() => {
                            conn.release();
                            console.error("Error inserting commission payment:", paymentError);
                            res.status(500).json({ error: "Failed to record commission payment" });
                          });
                        }

                        paymentsProcessed++;

                        // If all payments processed, commit transaction
                        if (paymentsProcessed === totalPayments) {
                          conn.commit((commitErr) => {
                            if (commitErr) {
                              return conn.rollback(() => {
                                conn.release();
                                res.status(500).json({ error: "Failed to commit transaction" });
                              });
                            }

                            conn.release();
                            res.json({
                              message: "Salary and commission payments processed successfully",
                              salary_id: salary_id,
                              commission_payments: totalPayments,
                              total_commission_paid: parseFloat(commission_included)
                            });
                          });
                        }
                      }
                    );
                  });

                });

              } else {
                // No commission included, just commit salary
                conn.commit((commitErr) => {
                  if (commitErr) {
                    return conn.rollback(() => {
                      conn.release();
                      res.status(500).json({ error: "Failed to commit transaction" });
                    });
                  }
                  conn.release();
                  res.json({
                    message: "Salary processed successfully",
                    salary_id: salary_id
                  });
                });
              }
            }
          );
        });
      });
    }
  );
});



app.get("/get-commission-payment-history", (req, res) => {
  const invoice_no = req.query.invoice_no;
  const staff_id = req.query.staff_id;

  if (!invoice_no || !staff_id) {
    return res.status(400).json({ error: "Invoice number and staff ID required" });
  }

  const sql = `
    SELECT 
      cp.id,
      cp.payment_amount,
      cp.payment_method,
      cp.payment_date,
      cp.notes,
      ss.month,
      ss.year
    FROM commission_payments cp
    LEFT JOIN staff_salary ss ON ss.id = cp.salary_id
    WHERE cp.invoice_no = ? AND cp.staff_id = ?
    ORDER BY cp.payment_date DESC
  `;

  connection.query(sql, [invoice_no, staff_id], (error, results) => {
    if (error) {
      console.error("Error fetching payment history:", error);
      return res.status(500).json({ error: "Failed to fetch payment history" });
    }

    res.json(results);
  });
});


// Get salary history for a staff member
app.get("/get-salary-history", (req, res) => {
  const staff_id = req.query.staff_id;
  
  if (!staff_id) {
    return res.status(400).json({ error: "Staff ID is required" });
  }

  const sql = `
    SELECT 
      id, staff_id, month, year, base_salary, allowances, deductions, 
      bonuses, commission_included, net_salary, payment_method, 
      payment_date, notes
    FROM staff_salary
    WHERE staff_id = ?
    ORDER BY year DESC, month DESC
    LIMIT 12
  `;

  connection.query(sql, [staff_id], (error, results) => {
    if (error) {
      console.error("Error fetching salary history:", error);
      return res.status(500).json({ error: "Failed to fetch salary history" });
    }

    res.json(results);
  });
});




// Update staff salary
app.put("/update-staff-salary/:id", (req, res) => {
  const salary_id = req.params.id;
  const {
    staff_id,
    month,
    year,
    base_salary,
    allowances,
    deductions,
    bonuses,
    commission_included,
    net_salary,
    payment_method,
    notes
  } = req.body;

  if (!salary_id || !staff_id || !month || !year || !net_salary) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if trying to change month/year to an existing record
  const checkSql = `
    SELECT id FROM staff_salary 
    WHERE staff_id = ? AND month = ? AND year = ? AND id != ?
  `;

  connection.query(checkSql, [staff_id, month, year, salary_id], (error, existing) => {
    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: "Another salary record already exists for this month/year" 
      });
    }

    // Update the salary record
    const updateSql = `
      UPDATE staff_salary 
      SET base_salary = ?, allowances = ?, deductions = ?, bonuses = ?, 
          commission_included = ?, net_salary = ?, payment_method = ?, notes = ?
      WHERE id = ? AND staff_id = ?
    `;

    connection.query(
      updateSql,
      [base_salary, allowances || 0, deductions || 0, bonuses || 0, 
       commission_included || 0, net_salary, payment_method, notes, salary_id, staff_id],
      (updateError, result) => {
        if (updateError) {
          console.error("Error updating salary:", updateError);
          return res.status(500).json({ error: "Failed to update salary" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Salary record not found" });
        }

        res.json({ message: "Salary updated successfully" });
      }
    );
  });
});

// Delete staff salary
// app.delete("/delete-staff-salary/:id", (req, res) => {
//   const salary_id = req.params.id;

//   if (!salary_id) {
//     return res.status(400).json({ error: "Salary ID is required" });
//   }

//   const deleteSql = "DELETE FROM staff_salary commission_payments WHERE id = ?";

//   connection.query(deleteSql, [salary_id], (error, result) => {
//     if (error) {
//       console.error("Error deleting salary:", error);
//       return res.status(500).json({ error: "Failed to delete salary" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Salary record not found" });
//     }

//     res.json({ message: "Salary deleted successfully" });
//   });
// });


app.delete("/delete-staff-salary/:id", (req, res) => {
  const salary_id = req.params.id;

  if (!salary_id) {
    return res.status(400).json({ error: "Salary ID is required" });
  }

  // Single query to delete from both tables using JOIN
  const deleteSql = `
    DELETE s, c
    FROM staff_salary s
    LEFT JOIN commission_payments c ON s.id = c.salary_id
    WHERE s.id = ?
  `;

  connection.query(deleteSql, [salary_id], (error, result) => {
    if (error) {
      console.error("Error deleting salary and commissions:", error);
      return res.status(500).json({ error: "Failed to delete salary" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Salary record not found" });
    }

    res.json({ 
      message: "Salary and related commission payments deleted successfully",
      deletedSalaryId: salary_id
    });
  });
});



app.get('/get-invoice-list', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const searchInvoice = req.query.search;
    const user_type = req.query.user_type;
    const user_id = req.query.user_id;
    const filter = req.query.filter;

    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD

    // Log for debugging
    console.log('Today:', today);

    // Base SELECT query with joins
    let baseSql = `
        FROM invoice 
        LEFT JOIN clinic_items ci ON ci.id = invoice.item
        LEFT JOIN patients p ON p.id = invoice.patient_id
    `;

    let whereClause = [];
    let queryValues = [];

    // Search conditions for invoice number, patient name, or phone number
    if (searchInvoice) {
        whereClause.push(`(p.mrNo LIKE ? OR p.name LIKE ? OR REPLACE(p.contact, '-', '') LIKE ? OR invoice.invoice_no LIKE ?)`);
        queryValues.push(`%${searchInvoice}%`,`%${searchInvoice}%`,`%${searchInvoice}%`,`%${searchInvoice}%`);
    }

    // User type filters
    if (user_type === 'Doctor') {
        whereClause.push(`ci.doctor_id = ?`);
        queryValues.push(user_id);
        whereClause.push(`ci.type = 'opd'`);
    } else if (user_type === 'Lab Assistant') {
        whereClause.push(`ci.type = 'lab_test'`);
    } else if (user_type === 'Receptionist') {
        // No specific type filter for Receptionist
    }

    // Apply 'today' filter if specified
    if (filter === 'today') {
        whereClause.push(`DATE(invoice.invoice_date) = ?`);
        queryValues.push(today);
    }

    // Combine WHERE clauses
    const whereSQL = whereClause.length ? ` WHERE ${whereClause.join(' AND ')}` : '';

    // SQL query for data
    const dataSql = `
        SELECT 
            invoice.invoice_no, 
            p.name AS patient_name, 
            p.mrNo,
            REPLACE(p.contact, '-', '') AS phone_no, 
            SUM(invoice.total) AS total_amount, 
            SUM(invoice.quantity) AS total_quantity
        ${baseSql}
        ${whereSQL}
        GROUP BY invoice.invoice_no
        ORDER BY invoice.invoice_no DESC
        LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const dataQueryValues = [...queryValues, limit, offset];

    // SQL query for total count
    const countSql = `
        SELECT COUNT(DISTINCT invoice_no) AS total_count
        ${baseSql}
        ${whereSQL}
    `;

    // Execute data query
    connection.query(dataSql, dataQueryValues, (error, results) => {
        if (error) {
            console.error('Error executing data query:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Execute count query
        connection.query(countSql, queryValues, (countError, countResult) => {
            if (countError) {
                console.error('Error executing count query:', countError);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const totalItems = countResult[0].total_count;
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                totalItems,
                currentPage: page,
                totalPages,
                results
            });
        });
    });
});






app.get('/get-invoice-list-patient-history', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const searchInvoice = req.query.search;
     const patient_id = req.query.patient_id;
    const user_type = req.query.user_type;
    const user_id = req.query.user_id;
    const filter = req.query.filter;

    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD

    // console.log(today)

    // Base SELECT query with joins
    let baseSql = `
        FROM invoice 
        LEFT JOIN clinic_items ci ON ci.id = invoice.item
        LEFT JOIN patients p ON p.id = invoice.patient_id
    `;

    let whereClause = [];
    let queryValues = [];



    if (searchInvoice) {
        whereClause.push(`(invoice.invoice_no LIKE ? OR p.name LIKE ? OR REPLACE(p.contact, '-', '') LIKE ?)`);
        queryValues.push(`%${searchInvoice}%`, `%${searchInvoice}%`, `%${searchInvoice}%`);
    }

    // Search conditions for invoice number, patient name, or phone number
    if (patient_id) {
        whereClause.push(`patient_id = ?`);
        queryValues.push(patient_id);
    }

    // User type filters
    if (user_type === 'Doctor') {
        // whereClause.push(`ci.doctor_id = ?`);
        // queryValues.push(user_id);
        // whereClause.push(`ci.type = 'opd'`);
    } else if (user_type === 'Lab Assistant') {
        whereClause.push(`ci.type = 'lab_test'`);
    } else if (user_type === 'Receptionist') {
        // No specific type filter for Receptionist
    }

    // Apply 'today' filter if specified
    // if (filter === 'today') {
    //     whereClause.push(`DATE(invoice.invoice_date) = ?`);
    //     queryValues.push(today);
    // }

    // Combine WHERE clauses
    const whereSQL = whereClause.length ? ` WHERE ${whereClause.join(' AND ')}` : '';

    // SQL query for data
    const dataSql = `
        SELECT 
            invoice.invoice_no, 
            p.name AS patient_name, 
            REPLACE(p.contact, '-', '') AS phone_no, 
            SUM(invoice.total) AS total_amount, 
            SUM(invoice.quantity) AS total_quantity
        ${baseSql}
        ${whereSQL}
        GROUP BY invoice.invoice_no
        ORDER BY invoice.invoice_no DESC
        LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const dataQueryValues = [...queryValues, limit, offset];

    // SQL query for total count
    const countSql = `
        SELECT COUNT(DISTINCT invoice_no) AS total_count
        ${baseSql}
        ${whereSQL}
    `;

    // Execute data query
    connection.query(dataSql, dataQueryValues, (error, results) => {
        if (error) {
            console.error('Error executing data query:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Execute count query
        connection.query(countSql, queryValues, (countError, countResult) => {
            if (countError) {
                console.error('Error executing count query:', countError);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const totalItems = countResult[0].total_count;
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                totalItems,
                currentPage: page,
                totalPages,
                results
            });
        });
    });
});




app.get('/get-report', (req, res) => {
    const fromDate = req.query.from_date;
    const toDate = req.query.to_date;
    const searchInvoice = req.query.search;
    // Base SELECT query with conditional JOIN
    let baseSql = `FROM invoice 
                   LEFT JOIN clinic_items ci ON ci.id = invoice.item
                   LEFT JOIN doctors d ON ci.doctor_id = d.id
                   LEFT JOIN lab_tests lt ON ci.lab_test_id = lt.id`;

    let whereClause = [];
    let queryValues = [];

    // Add date range filter
    if (fromDate && toDate) {
        whereClause.push(`DATE(invoice.invoice_date) BETWEEN ? AND ?`);
        queryValues.push(fromDate, toDate);
    }


    if (searchInvoice) {
        whereClause.push(`(d.doctor_name LIKE ? OR lt.lab_test LIKE ?)`);
        queryValues.push(`%${searchInvoice}%`, `%${searchInvoice}%`);
    }

    // Apply WHERE clause
    const whereSQL = whereClause.length ? ` WHERE ` + whereClause.join(' AND ') : '';

    // Final SQL for data
    const dataSql = `
        SELECT 
            invoice.item,
            d.doctor_name AS doctor_name,
            lt.lab_test AS lab_test_name,
            ci.type,
            SUM(invoice.total) AS total_amount, 
            SUM(invoice.quantity) AS total_quantity
        ${baseSql}
        ${whereSQL}
        GROUP BY invoice.item  -- Grouping by invoice.item
        ORDER BY invoice.item
    `;

    // Execute data query
    connection.query(dataSql, queryValues, (error, results) => {
        if (error) {
            console.error('Error executing data query:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({
            results
        });
    });
});





app.get('/get-invoices-detail-list', (req, res) => {
    // Extract start and end dates from query parameters
    const startDate = req.query.from_date; // Example: '2023-01-01'
    const endDate = req.query.to_date; // Example: '2023-01-31'
    // const type = req.query.type;     // Example: '2023-01-31'
    const medicine_type = req.query.medicine_type;

    // Validate that both dates are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate query parameters.' });
    }

    // Append time components to include the full range of dates
    const fromDate = startDate;
    const toDate = endDate;
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    let sql = `SELECT invoice.*, items.items as brand, items.manufacturer, items.medicine_type,  items.unit_type FROM invoice
  INNER JOIN items ON invoice.item = items.id
  WHERE invoice.invoice_date BETWEEN ? AND ?`;

    if (medicine_type) {
        sql += ` AND items.medicine_type = ? `;
    }

    // Execute the query with placeholders for date range
    connection.query(sql, [fromDate, toDate, medicine_type], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});





app.get('/get-invoices-detail-list-of-medicine', (req, res) => {
    // Extract start and end dates from query parameters
    const startDate = req.query.from_date; // Example: '2023-01-01'
    const endDate = req.query.to_date; // Example: '2023-01-31'
    // const type = req.query.type;     // Example: '2023-01-31'
    const medicine_type = req.query.medicine_type;

    // Validate that both dates are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate query parameters.' });
    }

    // Append time components to include the full range of dates
    const fromDate = startDate;
    const toDate = endDate;
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    let sql = `
  SELECT 
    invoice.item, 
    items.id,
    items.items AS brand, 
    items.manufacturer,
    items.medicine_type,
    items.unit_type, 
   sum(invoice.quantity) as total_quantity, 
   sum(invoice.quantity * invoice.price_after_discount) as total_price
  FROM invoice
  INNER JOIN items ON invoice.item = items.id
  WHERE invoice.invoice_date BETWEEN ? AND ?`;

    if (medicine_type) {
        sql += ` AND items.medicine_type = ? `;
    }

    sql += ` GROUP BY items.id, items.manufacturer ORDER BY brand ASC`;


    // Execute the query with placeholders for date range
    connection.query(sql, [fromDate, toDate, medicine_type], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});







app.get('/get-medicine-quantity-report', (req, res) => {
    // Extract start and end dates from query parameters
    const startDate = req.query.from_date; // Example: '2023-01-01'
    const endDate = req.query.to_date; // Example: '2023-01-31'
    // const type = req.query.type;     // Example: '2023-01-31'
    const medicine_id = req.query.medicine_id;

    // Validate that both dates are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate query parameters.' });
    }

    // Append time components to include the full range of dates
    const fromDate = startDate;
    const toDate = endDate;
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    let sql = `
  SELECT
    items.items, 
    items.manufacturer, 
    items.unit_type, 
    invoice.quantity as total_quantity,
    invoice.price_after_discount as total_price,
    invoice.total
  FROM invoice
  INNER JOIN items ON invoice.item = items.id
  WHERE invoice.item = ? AND invoice.invoice_date BETWEEN ? AND ?`;

    // Execute the query with placeholders for date range
    connection.query(sql, [medicine_id, fromDate, toDate], (error, results) => {
        if (error) {
            // console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});






app.get('/get-invoices-detail-list-by-medicine', (req, res) => {
    // Extract start and end dates from query parameters
    const type = req.query.medicine_type; // Example: '2023-01-31'
    const startDate = req.query.from_date; // Example: '2023-01-01'
    const endDate = req.query.to_date; // Example: '2023-01-31'


    // Validate that both dates are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate query parameters.' });
    }

    // Append time components to include the full range of dates
    const fromDate = startDate;
    const toDate = endDate;
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    const sql = `
  SELECT 
    invoice.item, 
    items.id,
    items.items AS brand, 
    items.manufacturer, 
    items.unit_type, 
   sum(invoice.quantity) as total_quantity, 
   sum(invoice.quantity * invoice.price) as total_price
  FROM invoice
  INNER JOIN items ON invoice.item = items.id
  WHERE items.medicine_type = ? 
  AND invoice.type = "army"
  AND invoice.invoice_date BETWEEN ? AND ?
  GROUP BY items.id, items.manufacturer ORDER BY items.medicine_type DESC
`;


    // Execute the query with placeholders for date range
    connection.query(sql, [type, fromDate, toDate], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});





app.get('/get-supply-order', (req, res) => {
    // Extract start and end dates from query parameters
    const startDate = req.query.from_date; // Example: '2023-01-01'
    const endDate = req.query.to_date; // Example: '2023-01-31'
    const medicine_type = req.query.medicine_type;
    // const type = req.query.type;     // Example: '2023-01-31'

    // Validate that both dates are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate query parameters.' });
    }

    // Append time components to include the full range of dates
    const fromDate = startDate;
    const toDate = endDate;

    // SQL query to fetch invoices within the date range
    let sql = ` SELECT 
      items.items,
      SUM(invoice.quantity) AS total_quantity, 
      items.unit_type 
      FROM 
          invoice 
      INNER JOIN 
          items 
      ON 
          invoice.item = items.id 
      WHERE invoice.invoice_date BETWEEN ? AND ? `;

    if (medicine_type) {
        sql += ` AND items.medicine_type = ? `;
    }

    sql += ` GROUP BY items.id, items.manufacturer ORDER BY items.items ASC`;

    // Execute the query with placeholders for date range
    connection.query(sql, [fromDate, toDate, medicine_type], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});




app.get('/get-supply-order-for-patient', (req, res) => {
    // Extract start and end dates from query parameters

    const invoice_no = req.query.invoice_no; // Example: '2023-01-01'

    // Validate that both dates are provided
    if (!invoice_no) {
        return res.status(400).json({ error: 'Please provice invoice_no' });
    }
    // SQL query to fetch invoices within the date range
    const sql = ` SELECT 
      items.items,
      invoice.quantity AS total_quantity, 
      items.unit_type 
      FROM 
          invoice 
      INNER JOIN 
          items 
      ON 
          invoice.item = items.id 
      WHERE invoice_no = ?`;

    // Execute the query with placeholders for date range
    connection.query(sql, [invoice_no], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});






app.get('/get-crv-for-patient', (req, res) => {
    // Extract start and end dates from query parameters

    const invoice_no = req.query.invoice_no; // Example: '2023-01-01'

    // Validate that both dates are provided
    if (!invoice_no) {
        return res.status(400).json({ error: 'Please provice invoice_no' });
    }
    // SQL query to fetch invoices within the date range
    const sql = ` SELECT 
      invoice.invoice_no,
      invoice.type,
      items.items,
      invoice.quantity AS total_quantity, 
      items.unit_type 
      FROM 
          invoice 
      INNER JOIN 
          items 
      ON 
          invoice.item = items.id 
      WHERE invoice_no = ?`;

    // Execute the query with placeholders for date range
    connection.query(sql, [invoice_no], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});







app.get('/view-invoice-new', (req, res) => {
    // Extract start and end dates from query parameters
    const invoice_no = req.query.invoice_no; // Example: '2023-01-01'
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    const sql = `SELECT invoice.*, patients.name as patient_name, patients.age as patient_age,   clinic_items.lab_test_id, clinic_items.type,
    IFNULL(CONCAT(doctors.doctor_name, ' (', departments.department, ')', ' (', UPPER(clinic_items.type), ')'), lab_tests.lab_test) AS item_name
    FROM invoice
    LEFT JOIN clinic_items ON invoice.item = clinic_items.id
    LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id
    LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id
    LEFT JOIN departments ON doctors.department_id = departments.id
    LEFT JOIN patients ON invoice.patient_id = patients.id
    WHERE invoice.invoice_no = ?`;


    // Execute the query with placeholders for date range
    connection.query(sql, [invoice_no], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});






app.get('/view-previous-lab-test', (req, res) => {
    // Extract start and end dates from query parameters
    const patient_id = req.query.patient_id; // Example: '2023-01-01'
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    const sql = `SELECT invoice.*, patients.mrNo, patients.gender, patients.relation, patients.husbandOrFatherName, patients.name as patient_name, patients.age as patient_age,   clinic_items.lab_test_id, clinic_items.type,
    IFNULL(CONCAT(doctors.doctor_name, ' (', departments.department, ')', ' (', UPPER(clinic_items.type), ')'), lab_tests.lab_test) AS item_name
    FROM invoice
    LEFT JOIN clinic_items ON invoice.item = clinic_items.id
    LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id
    LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id
    LEFT JOIN departments ON doctors.department_id = departments.id
    LEFT JOIN patients ON invoice.patient_id = patients.id
    WHERE invoice.patient_id = ? AND clinic_items.type = 'lab_test' ORDER  BY invoice.invoice_no DESC`;


    // Execute the query with placeholders for date range
    connection.query(sql, [patient_id], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});





app.get('/view-expense-and-receipt-voucher', (req, res) => {
    // Extract start and end dates from query parameters
    const invoice_no = req.query.invoice_no; // Example: '2023-01-01'

    // SQL query to fetch invoices within the date range
    const sql = `SELECT invoice.*, categories.category as manufacturer, items.items as brand, items.unit_type FROM invoice
  INNER JOIN items ON invoice.item = items.id
  INNER JOIN categories ON items.category = categories.id
  WHERE invoice.invoice_no = ?`;

    // Execute the query with placeholders for date range
    connection.query(sql, [invoice_no], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});




// app.get('/get-invoice-no/:invoice_no', (req, res) => {
//     const invoice_no = req.params.invoice_no;

//     connection.getConnection((err, connection) => {
//         if (err) {

//             res.status(500).json({ error: 'Error fetching item' });
//             return;
//         }



//         const sql = `SELECT inv.*, 
//     CONCAT(itm.items, ' (', itm.manufacturer, ')') AS item_name,
//     stk.quantity as stock_quantity
//     FROM 
//     invoice AS inv
//     INNER JOIN items AS itm ON inv.item = itm.id
//     INNER JOIN stock AS stk ON stk.id = inv.stock_id
//     WHERE 
//     inv.invoice_no = ?
//     ORDER BY inv.id DESC`;

//         const values = [invoice_no];

//         connection.query(sql, values, (error, results) => {
//             connection.release(); // Release the connection

//             if (error) {
//                 console.error('Error executing SQL query: ', error);
//                 res.status(500).json({ error: 'Internal server error' });
//             } else {
//                 res.json({
//                     results
//                 });
//             }
//         });
//     });
// });




app.get('/get-invoice-no/:invoice_no', (req, res) => {
    // Extract start and end dates from query parameters
    const invoice_no = req.params.invoice_no;
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    const sql = `SELECT invoice.*, 
    IFNULL(CONCAT(doctors.doctor_name, ' (', doctors.specialization, ')', ' (', departments.department, ')', ' (', UPPER(clinic_items.type), ')'), lab_tests.lab_test) AS item_name
FROM invoice
LEFT JOIN clinic_items ON invoice.item = clinic_items.id
LEFT JOIN doctors ON clinic_items.doctor_id = doctors.id
LEFT JOIN lab_tests ON clinic_items.lab_test_id = lab_tests.id
LEFT JOIN departments ON doctors.department_id = departments.id
WHERE invoice.invoice_no = ?`;


    // Execute the query with placeholders for date range
    connection.query(sql, [invoice_no], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});







app.get('/view-invoice-new-pharmacy', (req, res) => {
    // Extract start and end dates from query parameters
    const invoice_no = req.query.invoice_no; // Example: '2023-01-01'
    // INNER JOIN categories ON items.category = categories.id
    // SQL query to fetch invoices within the date range
    const sql = `SELECT invoice_pharmacy.*, invoice_pharmacy.price_after_discount as rate_after_discount, items.items as item_name FROM invoice_pharmacy
  INNER JOIN items ON invoice_pharmacy.item = items.id
  WHERE invoice_pharmacy.invoice_no = ?`;

    // Execute the query with placeholders for date range
    connection.query(sql, [invoice_no], (error, results) => {
        if (error) {
            console.error('Error executing SQL query: ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Send the fetched results as JSON
        res.json({
            results
        });
    });
});






app.get('/get-invoice-no-pharmacy/:invoice_no', (req, res) => {
    const invoice_no = req.params.invoice_no;

    connection.getConnection((err, connection) => {
        if (err) {

            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT inv.*, 
            CONCAT(itm.items, ' (', itm.manufacturer, ')') AS item_name,
            stk.quantity as stock_quantity
            FROM 
            invoice_pharmacy AS inv
            INNER JOIN items AS itm ON inv.item = itm.id
            LEFT JOIN stock AS stk ON stk.id = inv.stock_id
            WHERE 
            inv.invoice_no = ?
            ORDER BY inv.id DESC`;

        const values = [invoice_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});



app.get('/get-invoice-no-stock/:invoice_no', (req, res) => {
    const invoice_no = req.params.invoice_no;

    connection.getConnection((err, connection) => {
        if (err) {

            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT  stock.*, stock.total_purchase_rate, suppliers.full_name, items.id as item_id, items.items as item_name, items.stock_type FROM stock INNER JOIN items ON stock.item_id = items.id INNER JOIN suppliers ON stock.supplier_id = suppliers.id WHERE invoice_no = ?`;

        const values = [invoice_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});




app.get('/fetch-customer-data/:phone_no', (req, res) => {
    const phone_no = req.params.phone_no;

    connection.getConnection((err, connection) => {
        if (err) {

            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        const sql = `SELECT  * FROM invoice WHERE phone_no = ? ORDER BY id DESC LIMIT 1`;

        const values = [phone_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error executing SQL query: ', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.json({
                    results
                });
            }
        });
    });
});




app.post('/fetch-customer-data-for-pharmacy', (req, res) => {
    const patient_id = req.body.patient_id;
    const phone_no = req.body.phone_no;

    connection.getConnection((err, connection) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching item' });
            return;
        }

        // First, try to find the patient by patient_id
        const sqlById = `SELECT * FROM patients WHERE id = ? LIMIT 1`;
        const valuesById = [patient_id];

        connection.query(sqlById, valuesById, (error, results) => {
            if (error) {
                connection.release();
                console.error('Error executing SQL query by ID: ', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // If a patient is found by patient_id, return the result
            if (results.length > 0) {
                connection.release();
                res.json({ results });
                return;
            }

            // If no patient is found by patient_id and phone_no is provided, try searching by phone_no
            if (phone_no) {
               
                const sqlByPhone = `
                SELECT 
                    full_name AS name, 
                    phone_no AS contact, 
                    age 
                FROM 
                    invoice_pharmacy 
                WHERE 
                    phone_no = ? 
                ORDER BY 
                    invoice_no DESC 
                LIMIT 1
                `;

                const valuesByPhone = [phone_no];

                connection.query(sqlByPhone, valuesByPhone, (error, results) => {
                    connection.release();
                    if (error) {
                        console.error('Error executing SQL query by phone: ', error);
                        res.status(500).json({ error: 'Internal server error' });
                    } else if (results.length > 0) {
                        res.json({ results });
                    } else {
                        res.status(200).json({ results: '' });
                    }
                });
            } else {
                // If no phone_no is provided and patient_id doesn't exist, return not found
                connection.release();
                res.status(200).json({ results : '' });
            }
        });
    });
});



app.delete('/delete-invoice-pharmacy/:invoice_no', (req, res) => {
    const invoice_no = parseInt(req.params.invoice_no);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = 'DELETE FROM invoice_pharmacy WHERE invoice_no = ?';
        const values = [invoice_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Item deleted successfully' });
            }
        });
        
    });
});




app.delete('/delete-stock/:invoice_no', (req, res) => {
    const invoice_no = parseInt(req.params.invoice_no);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = 'DELETE FROM stock WHERE invoice_no = ?';
        const values = [invoice_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ message: 'Item deleted successfully' });
            }
        });
    });
});



app.get('/view-invoice/:invoice_no', (req, res) => {
    const invoice_no = parseInt(req.params.invoice_no);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = `SELECT invoice.*, items.items as item_name FROM invoice INNER JOIN items ON invoice.item = items.id WHERE invoice.invoice_no = ?`;
        const values = [invoice_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                console.log('Item deleted successfully');
                res.status(200).json({ results });
            }
        });
    });
});



app.get('/view-invoice-stock/:invoice_no', (req, res) => {
    const invoice_no = parseInt(req.params.invoice_no);

    connection.getConnection((err, connection) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error deleting item' });
            return;
        }

        const sql = `SELECT stock.*, suppliers.full_name, items.items as item_name FROM stock INNER JOIN suppliers ON stock.supplier_id = suppliers.id INNER JOIN items ON stock.item_id = items.id WHERE stock.invoice_no = ?`;
        const values = [invoice_no];

        connection.query(sql, values, (error, results) => {
            connection.release(); // Release the connection

            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error deleting item' });
            } else {
                // console.log('Item deleted successfully');
                res.status(200).json({ results });
            }
        });
    });
});




app.post('/api/location', (req, res) => {
    const { latitude, longitude } = req.body;
    console.log(`Received location: Latitude ${latitude}, Longitude ${longitude}`);
    res.send({ status: 'Location received' });
});



// async function test() {
//   let zkInstance = new ZKLib('192.168.1.201', 4370, 5200, 5000);
//   try {
//     await zkInstance.createSocket();
//     console.log('Connected to device');
//     console.log(await zkInstance.getInfo());
//     const logs = await zkInstance.getAttendances();
//     console.log(logs);
//     await zkInstance.disconnect();
//   } catch (e) {
//     console.error('Error:', e);
//   }
// }
// test();



// // Device configuration
// const zkConfig = {
//   ip: '192.168.1.201',
//   port: 4370,
//   timeout: 5200,
//   inport: 5000
// };

// let lastCheckTime = new Date(0);
// let isProcessing = false;

// async function initialize() {
//   try {
//     const latestRecord = await getLatestAttendanceRecord();
//     if (latestRecord && isValidDate(new Date(latestRecord.record_time))) {
//       lastCheckTime = new Date(latestRecord.record_time);
//       console.log(`Resuming from last record: ${lastCheckTime}`);
//     } else {
//       console.log('No valid existing records. Starting fresh.');
//       lastCheckTime = new Date(0);
//     }

//     setInterval(checkForNewAttendances, 1000); // every 1 minute
//   } catch (error) {
//     console.error('Initialization failed:', error);
//     process.exit(1);
//   }
// }

// async function checkForNewAttendances() {
//   if (isProcessing) {
//     console.log('Previous check still in progress. Skipping...');
//     return;
//   }

//   isProcessing = true;
//   let zkInstance = null;

//   try {
//     zkInstance = new ZKLib(zkConfig.ip, zkConfig.port, zkConfig.timeout, zkConfig.inport);
//     await zkInstance.createSocket();

//     const deviceResponse = await zkInstance.getAttendances();
//     const logs = Array.isArray(deviceResponse?.data) ? deviceResponse.data : [];

//     if (logs.length === 0) {
//       console.log('No attendance records found on device');
//       return;
//     }

//     let newRecordsCount = 0;
//     let skippedRecords = 0;
//     let errorRecords = 0;

//     for (const log of logs) {
//       try {
//         if (!isValidRecord(log)) {
//           console.log('Skipping invalid record:', log);
//           skippedRecords++;
//           continue;
//         }

//         const logDate = new Date(log.recordTime);
//         if (logDate <= lastCheckTime) {
//           skippedRecords++;
//           continue;
//         }

//         const isDuplicate = await attendanceRecordExists(log.deviceUserId, logDate);
//         if (isDuplicate) {
//           console.log('Duplicate record found. Skipping...');
//           skippedRecords++;
//           continue;
//         }

//         await insertAttendanceRecord(log);
//         newRecordsCount++;
//         console.log(`Added record for user ${log.deviceUserId} at ${log.recordTime}`);

//         if (logDate > lastCheckTime) {
//           lastCheckTime = logDate;
//         }

//       } catch (error) {
//         errorRecords++;
//         console.error(`Error processing record:`, error);
//       }
//     }

//     console.log(`Processed ${logs.length} records: ${newRecordsCount} new, ${skippedRecords} skipped, ${errorRecords} errors`);
//   } catch (error) {
//     console.error('Attendance check error:', error);
//   } finally {
//     if (zkInstance) {
//       try {
//         await zkInstance.disconnect();
//       } catch (e) {
//         console.error('Disconnect error:', e);
//       }
//     }
//     isProcessing = false;
//   }
// }

// // Check if the attendance record already exists
// async function attendanceRecordExists(userId, recordTime) {
//   return new Promise((resolve, reject) => {
//     connection.query(
//       `SELECT id FROM attendance_records 
//        WHERE user_id = ? AND record_time = ? LIMIT 1`,
//       [userId, recordTime],
//       (error, results) => {
//         if (error) return reject(error);
//         resolve(results.length > 0);
//       }
//     );
//   });
// }

// function isValidRecord(record) {
//   return record &&
//     record.deviceUserId &&
//     record.recordTime &&
//     isValidDate(new Date(record.recordTime));
// }

// function isValidDate(date) {
//   return date instanceof Date && !isNaN(date.getTime());
// }

// async function insertAttendanceRecord(record) {
//   console.log('Inserting record:', record);
//   return new Promise((resolve, reject) => {
//     connection.query(
//       `INSERT INTO attendance_records 
//        (user_sn, user_id, record_time, ip_address) 
//        VALUES (?, ?, ?, ?)`,
//       [
//         record.userSn,
//         record.deviceUserId,
//         record.recordTime,
//         record.ip
//       ],
//       (error, results) => {
//         if (error) return reject(error);
//         resolve(results);
//          wss.broadcast({
//                         type: 'attendance_marked',
//                       });
                      
//       }
//     );
//   });
// }

// async function getLatestAttendanceRecord() {
//   return new Promise((resolve, reject) => {
//     connection.query(
//       `SELECT record_time FROM attendance_records 
//        ORDER BY record_time DESC LIMIT 1`,
//       (error, results) => {
//         if (error) return reject(error);
//         resolve(results[0] || null);
//       }
//     );
//   });
// }

// // Start the system
// initialize().catch(error => {
//   console.error('Fatal error:', error);
// });



// app.get('/api/attendance', (req, res) => {
//   const query = `
//     SELECT 
//       er.employee_name AS employeeName,
//       DATE_FORMAT(ar.record_time, '%Y-%m-%d') AS recordDate,
//       TIME_FORMAT(ar.record_time, '%H:%i:%s') AS recordTime
//     FROM attendance_records ar
//     JOIN employee_record er ON ar.user_id = er.id
//     ORDER BY er.employee_name, ar.record_time;
//   `;

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error('Query error:', err);
//       return res.status(500).json({ error: 'Database query failed' });
//     }

//     // Format response into: [{ employeeName, recordTime: "YYYY-MM-DD HH:mm:ss" }, ...]
//     const formatted = results.map(row => ({
//       employeeName: row.employeeName,
//       recordTime: `${row.recordDate} ${row.recordTime}`
//     }));

//     res.json(formatted);
//   });
// });


app.get('/list-printers', async (req, res) => {
    // return "yes";
  try {
    const printers = await getPrinters();
    res.json({ printers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




app.get('/api/attendance', (req, res) => {
  const { employee, month } = req.query;

  let query = `
    SELECT 
      er.employee_name AS employeeName,
      DATE_FORMAT(ar.record_time, '%Y-%m-%d') AS recordDate,
      TIME_FORMAT(ar.record_time, '%H:%i:%s') AS recordTime
    FROM attendance_records ar
    JOIN employee_record er ON ar.user_id = er.id
    WHERE 1 = 1
  `;

  const params = [];

  if (employee) {
    query += ` AND er.employee_name = ?`;
    params.push(employee);
  }

  if (month) {
    query += ` AND DATE_FORMAT(ar.record_time, '%Y-%m') = ?`; // filter by month
    params.push(month);
  }

  query += ` ORDER BY er.employee_name, ar.record_time`;

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    const formatted = results.map(row => ({
      employeeName: row.employeeName,
      recordTime: `${row.recordDate} ${row.recordTime}`
    }));

    res.json(formatted);
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

// // Log an error if an uncaught exception occurs
// process.on('uncaughtException', (err) => {
//     console.error('Uncaught exception:', err);
//     // Close all database connections before exiting due to uncaught exception
//     connection.end(() => {
//         process.exit(1);
//     });
// });

// Start the server
// app.listen(process.env.PORT, function(err) {
//     if (err) console.log(err);
//     console.log(`listening to port ${process.env.PORT}`);
// });



// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    // Close all database connections before exiting due to uncaught exception
    if (connection) {
        connection.end(() => {
            console.log('Database connections closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});



// Serve static files from React build
app.use(express.static(path.join(__dirname, 'my-react-app/build')));

// Handle React routing - send all non-API requests to React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'my-react-app/build/index.html'));
});


// server.listen(process.env.PORT, () => {
//     console.log(`Express and WebSocket server is running on port ${process.env.PORT}`);
// });


const PORT = process.env.PORT || 4000; // Use environment variable or default to 4000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Express and WebSocket server is running on port ${PORT}`);
});


// app.listen(process.env.PORT, function (err) {
//   if (err) console.log(err);
//   console.log(`listening to port ${process.env.PORT}`);
//   console.log(`listening to port ${process.env.PORT}`);
// });