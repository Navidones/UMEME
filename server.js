const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require('firebase-admin');
const multer = require('multer');
const session = require('express-session');

const { PDFDocument, rgb, degrees, grayscale } = require("pdf-lib");
const { writeFileSync } = require("fs");


const serviceAccount = require('./umeme.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://umeme-d19d2.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();
const port = process.env.PORT || 3000;

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Apply session middleware to make req.session available throughout the application
app.use(session({
  secret: 'fbndfvu4i3u49vnlbn929JPMC3489FP93GH',
  resave: false,
  saveUninitialized: true
}));

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next(); // User is authenticated, proceed to next middleware
  } else {
    res.redirect('/'); // Redirect to login if not authenticated
  }
};

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Routes requiring authentication
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/form_one');
  } else {
    res.render('index');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query Firestore to check if the credentials are valid
  const usersRef = db.collection('users').doc('20240130');
  usersRef.get()
    .then(doc => {
      if (!doc.exists) {
        res.status(401).send('Invalid credentials');
      } else {
        const userData = doc.data();
        if (userData.username === username && userData.password === password) {
          req.session.user = username; // Start session
          res.redirect('/form_one'); // Redirect to dashboard after successful login
        } else {
          res.status(401).send('Invalid credentials');
        }
      }
    })
    .catch(error => {
      console.error('Error querying Firestore:', error);
      res.status(500).send('Internal server error');
    });
});

// Apply the isLoggedIn middleware to all routes requiring authentication
app.use(isLoggedIn);

// Define other routes...
app.get('/form_one', (req, res) => {
  res.render('form_one');
});

app.get('/form_two', (req, res) => {
  res.render('form_two');
});

app.get('/form_three', (req, res) => {
  res.render('form_three');
});

app.get('/form_four', (req, res) => {
  res.render('form_four');
});

app.get('/form_five', (req, res) => {
  res.render('form_five');
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


// New route for displaying data
app.get('/display-form-two', async (req, res) => {
  try {
    const dataSnapshot = await db.collection('form_two').get();
    const formDataArray = [];

    dataSnapshot.forEach((doc) => {
      // Include the document ID along with the form data
      const formDataWithId = { id: doc.id, ...doc.data() };
      formDataArray.push(formDataWithId);
    });

    res.render('display_form_two', { formDataArray });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// New route for displaying data
app.get('/display-form-three', async (req, res) => {
  try {
    const dataSnapshot = await db.collection('form_three').get();
    const formDataArray = [];

    dataSnapshot.forEach((doc) => {
      // Include the document ID along with the form data
      const formDataWithId = { id: doc.id, ...doc.data() };
      formDataArray.push(formDataWithId);
    });

    res.render('display_form_three', { formDataArray });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// New route for displaying data
app.get('/display-form-four', async (req, res) => {
  try {
    const dataSnapshot = await db.collection('form_four').get();
    const formDataArray = [];

    dataSnapshot.forEach((doc) => {
      // Include the document ID along with the form data
      const formDataWithId = { id: doc.id, ...doc.data() };
      formDataArray.push(formDataWithId);
    });

    res.render('display_form_four', { formDataArray });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// New route for displaying data
app.get('/display-form-five', async (req, res) => {
  try {
    const dataSnapshot = await db.collection('form_five').get();
    const formDataArray = [];

    dataSnapshot.forEach((doc) => {
      // Include the document ID along with the form data
      const formDataWithId = { id: doc.id, ...doc.data() };
      formDataArray.push(formDataWithId);
    });

    res.render('display_form_five', { formDataArray });
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

    if (record) {
      const document = await PDFDocument.create();
      const page = document.addPage([595, 842]); // A4 size in points (1 point = 1/72 inch)

      // Add content to the PDF using the retrieved record data
      const { width, height } = page.getSize();

      const fontSize = 12;
      const font = await document.embedFont('Helvetica');
      const subject = "SUBJECT: TECHNICAL REPORT ON FAULTY TRANSFORMER";
      const title = "UMEME LIMITED";

      const drawText = (text, x, y, color = rgb(0, 0, 0)) => {
        page.drawText(text, {
          x,
          y: height - y,
          size: fontSize,
          font,
          color,
        });
      };

      const drawLine = (startX, startY, endX, endY) => {
        const thickness = 1;
        const color = rgb(0, 0, 0);
        const opacity = 0.75;

        page.drawLine({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          thickness,
          color,
          opacity,
        });
      };

      const drawRectangle = (x, y, width, height) => {
        const borderColor = rgb(0, 0, 0);
        const borderWidth = 0.5;

        page.drawRectangle({
          x,
          y,
          width,
          height,
          borderColor,
          borderWidth,
        });
      };


      let startY = 50;
      drawRectangle(4, 4, 588, 835);
      drawText(`ID: ${record.id}`, 490, startY-30);
      drawText(`${title}`, 250, startY - 30, rgb(0, 1, 0), fontSize + 2);

      drawText(`District: ${record.district}`, 50, startY);
      drawText(`Region: ${record.region}`, 300, startY);

      drawText(`From: ${record.from}`, 300, startY + 20);
      drawText(`To: ${record.recipient}`, 50, startY + 20);

      drawText(`Report Date: ${record.reportdate}`, 250, startY + 40);
      drawText(`GPS: X:   ${record.gpsx} Y:   ${record.gpsy}`, 50, startY + 40);

      drawText(`Incidence No: ${record.incidencenumber}`, 400, startY + 40);
      drawText(`${subject}`, 120, startY + 60, rgb(0, 0, 0), fontSize + 2);
      drawLine(117, 730, 470, 730);

      drawText(`Fault Date: ${record.faultdate}`, 50, startY + 80);
      drawText(`Location: ${record.location}`, 300, startY + 80);
      drawText(`Substation Name: ${record.substationname}`, 50, startY + 100);
      drawText(`Substation Number: ${record.substationnumber}`, 300, startY + 100);
      drawText(`Feeder Name: ${record.feedername}`, 50, startY + 120);
      drawText(`Source Substation: ${record.soucesubstation}`, 300, startY + 120);
      drawLine(50, 665, 538, 665);

      drawText(`Transformer Make: ${record.make}`, 50, startY + 140);
      drawText(`Transformer Serial No: ${record.serialno}`, 300, startY + 140);
      drawText(`Transformer KVA Rating: ${record.kvarating}`, 50, startY + 160);
      drawText(`Transformer Voltage Rating: ${record.voltagerating}`, 300, startY + 160);
      drawText(`Transformer Number of Phases: ${record.numberofphases}`, 50, startY + 180);
      drawText(`UMEME No: ${record.umemeno}`, 300, startY + 180);
      drawText(`Year of Manufacture: ${record.yearofmanufacture}`, 50, startY + 200);
      drawText(`Date Installed: ${record.installationdate}`, 300, startY + 200);
      drawLine(50, 588, 540, 590);

      drawText(`TESTS/OBSERVATIONS CARRIED OUT`, 50, startY + 220);
      drawText(`Winding Insulation:`, 50, startY + 240);
      drawText(`HV-HV: ${record.hvtohv} Ohm         HV-LV: ${record.hvtolv} Ohm          LV-E: ${record.lvtoe} Ohm          HV-E: ${record.hvtoe} Ohm`, 50, startY + 260);
      drawText(`Surge Arrestors: Present/Not Present/Defective/N/A`, 50, startY + 280);
      drawText(`Condition of Silica Gel: ${record.sicalgelcondition}`, 50, startY + 300);
      drawLine(50, 485, 538, 485);

      drawText(`Earthing HT: ${record.htearth} LV: ${record.lvearth}`, 50, startY + 320);
      drawText(`Fuse Ratings: HT: Present/Links/Direct If Present`, 50, startY + 340);
      drawText(`Red:            12          Yellow:        12         Blue:         ${record.fuserating}`, 50, startY + 360);
      drawText(`LV: ${record.circuita}    If Present: 5 ohms`, 50, startY + 380);

      drawText(`Circuit A:      Red:  ${record.red}       Yellow:  ${record.yellow}       Blue:    ${record.blue}`, 150, startY + 420);
      drawText(`Circuit B:      Red:  12       Yellow:  12       Blue:    12`, 150, startY + 440);
      drawText(`Circuit C:      Red:  12       Yellow:  12       Blue:    12`, 150, startY + 460);
      drawText(`Circuit D:      Red:  12       Yellow:  12       Blue:    12`, 150, startY + 480);
      drawRectangle(48, 305, 500, 85);

      drawText(`Number of LV Circuits: ${record.numberoflvcircuits}`, 50, startY + 520);
      drawText(`Radius of LV Network: ${record.radiusoflvnetwork} M`, 300, startY + 520);
      drawText(`General Condition of Transformer and Wiring: ${record.transformercondition}`, 50, startY + 565);
      drawText(`Transformer Structure: ${record.transformerstructure}`, 50, startY + 540);
      drawText(`Probable Cause of Fault: ${record.faultcause}`, 300, startY + 540);

      drawText(`Remedy to Avoid Future Occurrence:\n ${record.actiontaken}`, 50, startY + 600);
      drawRectangle(48, 100, 500, 80);

      drawText(`Report Compiled`, 50, startY + 740);
      drawText(`By:       ${record.operatorname}`, 290, startY + 730);
      drawLine(320, 60, 488, 60);
      drawText(`Sign:     ${record.sign}`, 290, startY + 750);
      drawLine(320, 40, 488, 40);
      drawText(`Date:     ${record.operationdate}`, 290, startY + 770);
      drawLine(320, 20, 488, 20);

      // Save the PDF
      const pdfBytes = await document.save();

      // Send the PDF as a response
      res.setHeader('Content-Disposition', `attachment; filename=record_${recordId}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.end(pdfBytes);

    } else {
      res.status(404).send('Record not found');
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submit-form-two', async (req, res) => {
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

    // Add the form two data to Firestore with the custom document ID
    const docRef = await db.collection('form_two').doc(docId).set(formData);

    console.log('Form two data added with ID:', docId);

    res.json({ message: 'Form two submitted successfully!' });
  } catch (error) {
    console.error('Error submitting form two:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/submit-form-three', async (req, res) => {
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

    // Add the form two data to Firestore with the custom document ID
    const docRef = await db.collection('form_three').doc(docId).set(formData);

    console.log('Form two data added with ID:', docId);

    res.json({ message: 'Form two submitted successfully!' });
  } catch (error) {
    console.error('Error submitting form two:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Handle form four submission
app.post('/submit-form-four', upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 }
]), async (req, res) => {
  try {
    const bucket = admin.storage().bucket();

    // Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Create the document ID using the specified format
    const docId = `${year}${month}${day}${hours}${minutes}`;

    // Extract form data and file paths
    const formData = req.body;
    const photoPaths = ['photo1', 'photo2', 'photo3'];

    // Upload images to Firebase Storage and get download URLs
    const uploadPromises = photoPaths.map(async (photoPath) => {
      const photo = req.files[photoPath][0];
      const photoBuffer = photo.buffer;
      const photoName = photo.originalname;

      const file = bucket.file(`photos/${photoName}`);
      await file.save(photoBuffer, { contentType: photo.mimetype });
      const [downloadUrl] = await file.getSignedUrl({ action: 'read', expires: '01-01-2100' });

      // Add image URL to the form data
      formData[`${photoPath}Url`] = downloadUrl;
    });

    await Promise.all(uploadPromises);

    // Add the form data to Firestore with the custom document ID
    const docRef = await db.collection('form_four').doc(docId).set(formData);
    console.log('Document added with ID:', docRef);

    res.json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Handle form five submission
app.post('/submit-form-five', upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 }
]), async (req, res) => {
  try {
    const bucket = admin.storage().bucket();

    // Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Create the document ID using the specified format
    const docId = `${year}${month}${day}${hours}${minutes}`;

    // Extract form data and file paths
    const formData = req.body;
    const photoPaths = ['photo1', 'photo2', 'photo3'];

    // Upload images to Firebase Storage and get download URLs
    const uploadPromises = photoPaths.map(async (photoPath) => {
      const photo = req.files[photoPath][0];
      const photoBuffer = photo.buffer;
      const photoName = photo.originalname;

      const file = bucket.file(`photos/${photoName}`);
      await file.save(photoBuffer, { contentType: photo.mimetype });
      const [downloadUrl] = await file.getSignedUrl({ action: 'read', expires: '01-01-2100' });

      // Add image URL to the form data
      formData[`${photoPath}Url`] = downloadUrl;
    });

    await Promise.all(uploadPromises);

    // Add the form data to Firestore with the custom document ID
    const docRef = await db.collection('form_five').doc(docId).set(formData);
    console.log('Document added with ID:', docRef);

    res.json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Redirect the user to the login page
      res.redirect('/');
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${port}`);
});
