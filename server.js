const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require('firebase-admin');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');
const serviceAccount = require('./umeme.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/submit-form', async (req, res) => {
  try {
    const formData = req.body;

    // Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Create the document ID using the specified format
    const docId = `${year}${month}${day}${hours}${minutes}`;

    // Add the form data to Firestore with the custom document ID
    const docRef = await db.collection('form_one').doc(docId).set(formData);

    console.log('Document added with ID:', docId);

    res.json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// New route for displaying data
app.get('/display-data', async (req, res) => {
  try {
    const dataSnapshot = await db.collection('form_one').get();
    const formDataArray = [];

    dataSnapshot.forEach((doc) => {
      // Include the document ID along with the form data
      const formDataWithId = { id: doc.id, ...doc.data() };
      formDataArray.push(formDataWithId);
    });

    res.render('data_display', { formDataArray });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// New route for deleting a record
app.delete('/delete-record/:id', async (req, res) => {
  try {
    const recordId = req.params.id;

    // Delete the document from Firestore
    await db.collection('form_one').doc(recordId).delete();

    res.json({ message: 'Record deleted successfully!' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// New route for exporting PDF

app.get('/export-pdf/:id', async (req, res) => {
  try {
    const recordId = req.params.id;

    const recordRef = await db.collection('form_one').doc(recordId).get();
    const record = { id: recordRef.id, ...recordRef.data() };

    console.log('Retrieved record:', record);

    if (record) {
      const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>UMEME LIMITED Technical Report</title>
          <style>
          @page {
            size: A4;
            margin: 20mm 10mm;
          }
    
          body {
            font-family: 'Arial, sans-serif';
            margin: 0;
            padding: 0;
          }
    
          header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background-color: #3498db;
            color: white;
            text-align: center;
            line-height: 50px;
          }
    
          footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            background-color: #3498db;
            color: white;
            text-align: center;
            line-height: 30px;
          }
      
              section {
                  margin-bottom: 20px;
              }
      
              h4 {
                  color: #333;
              }
      
              table {
                  border-collapse: collapse;
                  width: 100%;
                  margin-top: 10px;
                  border: none;
              } 
      
              th, td {
                  padding: 10px;
                  text-align: left;
              }
          </style>
      </head>
      <body>
          <p style="text-align: right;">ID: ${record.id}</p>
      
          <section>
              <center><h4><b>UMEME LIMITED</b></h4></center>
              <table>
                  <tr>
                      <th>DISTRICT:</th>
                      <td>${record.district}</td>
                      <th>REGION:</th>
                      <td>KAMPALA CENTRAL</td>
                  </tr>
                  <tr>
                      <th>FROM:</th>
                      <td>${record.from}</td>
                      <th>DATE:</th>
                      <td>${record.reportdate}</td>
                  </tr>
                  <tr>
                      <th>TO:</th>
                      <td>${record.recipient}</td>
                      <th>GPS:</th>
                      <td>X- ${record.gpsx} Y- ${record.gpsy}</td>
                  </tr>
                  <tr>
                      <th>INCIDENCE NO:</th>
                      <td>${record.incidencenumber}</td>
                  </tr>
              </table>
          </section>
      
          <section>
              
              <h4><u>SUBJECT: TECHNICAL REPORT ON FAULTY TRANSFORMER</u></h4>
              <table>
                  <tr>
                      <th>FAULT DATE:</th>
                      <td>${record.faultdate}</td>
                      <th>LOCATION:</th>
                      <td>${record.location}</td>
                  </tr>
                  <tr>
                      <th>SUBSTATION NAME:</th>
                      <td>${record.substationname}</td>
                      <th>SUBSTATION NUMBER:</th>
                      <td>${record.substationnumber}</td>
                  </tr>
                  <tr>
                      <th>FEEDER NAME:</th>
                      <td>${record.feedername}</td>
                      <th>SOURCE SUBSTATION:</th>
                      <td>${record.soucesubstation}</td>
                  </tr>
              </table>
          </section>
      
          <section>
              <h4>TRANSFORMER DETAILS</h4>
              <table>
                  <tr>
                      <th>MAKE:</th>
                      <td>${record.make}</td>
                      <th>SERIAL NO:</th>
                      <td>${record.serialno}</td>
                  </tr>
                  <tr>
                      <th>KVA RATING:</th>
                      <td>${record.kvarating}</td>
                      <th>VOLTAGE RATING:</th>
                      <td>${record.voltagerating}</td>
                  </tr>
                  <tr>
                      <th>NUMBER OF PHASES:</th>
                      <td>${record.numberofphases}</td>
                      <th>UMEME NO:</th>
                      <td>${record.umemeno}</td>
                  </tr>
                  <tr>
                      <th>YEAR OF MANUFACTURE:</th>
                      <td>${record.yearofmanufacture}</td>
                      <th>DATE INSTALLED:</th>
                      <td>${record.installationdate}</td>
                  </tr>
              </table>
          </section>
      
          <section>
              <h4>TESTS / OBSERVATIONS CARRIED OUT</h4>
              <table>
                  <tr>
                      <th>WINDING INSULATION:</th>
                      <td>HV - HV ${record.hvtohv} Ohm | HV - LV ${record.hvtolv} Ohm | LV - E ${record.lvtoe} Ohm | LV - E ${record.hvtoe} Ohm</td>
                  </tr>
                  <tr>
                      <th>SURGE ARRESTORS:</th>
                      <td>Present/Not Present/Defective/N/A</td>
                  </tr>
                  <tr>
                      <th>CONDITION OF SILICA GEL:</th>
                      <td>${record.sicalgelcondition}</td>
                  </tr>
                  <tr>
                      <th>EARTHING:</th>
                      <td>HT: Present/cut/Not Present If Present Value is: <b><u>${record.htearth}</u></b><br>
                          LV: Present/cut/Not Present If Present Value is: <b><u>${record.lvearth}</u></b></td>
                  </tr>
                  <tr>
                      <th>FUSE RATINGS:</th>
                      <td>HT: Present/Links/Direct If Present Red: Yellow: Blue: ${record.fuserating}<br>
                          LV: Present/Links/Direct If Present 
                          Circuit A: Red: Yellow: ${record.circuita}<br>
                          Circuit B: Red: Yellow: ${record.yellow}<br>
                          Circuit C: Red: Yellow: ${record.red}<br>
                          Circuit D: Red: Yellow: ${record.blue}</td>
                  </tr>
                  <tr>
                      <th>NUMBER OF LV CIRCUITS:</th>
                      <td>${record.numberoflvcircuits}</td>
                      
                  </tr>
                  <tr>
                      <th>RADIUS OF LV NETWORK:</th>
                      <td>${record.radiusoflvnetwork} M</td>
                  </tr>
                  </table>
              </section>
      
                  <section>
                      
                      <table>
                          <tr>
                              <th>GENERAL CONDITION OF TRANSFORMER AND WIRING:</th>
                      <td>${record.transformercondition}</td>
                          </tr>
      
                           <tr>
                              <th>Transformer Structure:</th>
                      <td>${record.transformerstructure}</td>
                          </tr>
                  
                  <tr>
                      <th>PROBABLE CAUSE OF FAULT:</th>
                      <td>${record.faultcause}</td>
                  </tr>
                  <tr>
                      <th>REMEDY TO AVOID FUTURE OCCURRENCE:</th>
                      <td>${record.actiontaken}</td>
                  </tr> 
                      </table>
                  </section>
      
              <section>
                  <table>
                  <tr>
                      <th>Report Compiled</th>
                      <td>By:     ${record.operatorname}</td>
                  </tr>
                  <tr>
                      <th></th>
                      <td>Sign:   ${record.sign}</td>
                  </tr>
                  <tr>
                      <th></th>
                      <td>Date:   ${record.operationdate}</td>
                  </tr>
              </table>
          </section>
      
      </body>
      </html>
      
      `;

      const browser = await puppeteer.launch({
        headless: "new",
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      });
      const page = await browser.newPage();
      await page.setContent(htmlTemplate);

      const pdfBuffer = await page.pdf({ format: 'Letter', printBackground: true });

      await browser.close();

      res.setHeader('Content-Disposition', `attachment; filename=record_${recordId}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.status(200).send(pdfBuffer);
    } else {
      res.status(404).send('Record not found');
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${port}`);
});
