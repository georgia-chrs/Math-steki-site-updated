import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


///////////////
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
/////////////



import fsPromises from 'fs/promises'; //για το text
import session from 'express-session';
import jwt from 'jsonwebtoken';
import { 
  // Basic students and general functions
  getStudents, getAnnouncementsForStudent, getAllAnnouncements, updateAnnouncement, deactivateAnnouncement, getAllClasses, createAnnouncement,deleteAnnouncement, createStudent, createStudentComplete, deleteStudent, getTeachers,getAnnouncements, getUserByUsername, getStudent, getProgressNotes, getGradesByStudent, getAllPDFs, getPDFById, getPDFByFilename, createPDF, updatePDF, deletePDF, filterPDFs, getAllVaseisScholon, getVaseisScholonById, createVaseisScholon, updateVaseisScholon, deleteVaseisScholon, getAllMixanografiko, getMixanografikoById, createMixanografiko, updateMixanografiko, deleteMixanografiko, filterMixanografiko,
  // Students extended
  updateStudent, searchStudents, getStudentsByClass,
  // Teachers  
  createTeacher, updateTeacher, deleteTeacher, searchTeachers,
  // Subjects
  getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject, searchSubjects,
  // Enrollments
  getAllEnrollments, getEnrollmentsByStudent, getEnrollmentsBySubject, 
  createEnrollment, updateEnrollment, deleteEnrollment, searchEnrollments,
  // Student Codes
  getAllStudentCodes, getStudentCodeById, getStudentCodeByStudentId,
  createStudentCode, updateStudentCode, deleteStudentCode, 
  searchStudentCodes, createBulkStudentCodes,
  // Password Management
  getAllUsersWithPasswords, updateUserPassword,
  // Student profile
  getStudentByUsername,
  // Schools Data Management
  getAllSchoolsData, getSchoolsDataByType, replaceAllSchoolsData, 
  getSchoolsDataForCalculator, clearAllSchoolsData, getSchoolsDataStats,
  // Calculator Templates Management
  saveCalculatorTemplate, getAllCalculatorTemplates, getCalculatorTemplate, 
  getCalculatorTemplateMetadata, deleteCalculatorTemplate, getCalculatorTemplatesStats,
  // Database connection
  pool,
  addCalendarEventForStudent
} from './db.js';

const app = express();



//////////
const MYSQL_PORT = process.env.MYSQL_PORT || 3000; // ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ για Render
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.listen(MYSQL_PORT, () => {
  console.log(`Server running on port ${MYSQL_PORT}`);
});
//////////////



app.use(express.json({ limit: '100mb' })); // Αύξηση ορίου για PDF uploads
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'math_steki_secret_key', // αλλάξτε το σε κάτι πιο ασφαλές
  resave: false,
  saveUninitialized: false,
}));


///////
app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});
// Root (αν δεν έχεις public/index.html):
app.get("/", (req, res) => {
  res.send("Hello from Render (Node + Express)!");
});
////////////





// File to store schools CSV data
const SCHOOLS_DATA_FILE = './public/data/schools-data.json';

// Excel Templates Configuration
const TEMPLATES_DIR = './public/data/calculator-templates';

// Multer configuration για Excel templates
const templateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure templates directory exists
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }
    cb(null, TEMPLATES_DIR);
  },
  filename: function (req, file, cb) {
    // Keep original filename but ensure it's safe
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, safeFilename);
  }
});

const templateUpload = multer({ 
  storage: templateStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for Excel files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Μόνο Excel αρχεία (.xlsx, .xls) επιτρέπονται'), false);
    }
  }
});

// Multer configuration για photo uploads
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/photos/'); // Photos will be saved in public/photos/
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp_originalname
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

const photoUpload = multer({ 
  storage: photoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per photo
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Μόνο εικόνες επιτρέπονται (JPG, PNG, GIF, κ.λπ.)'), false);
    }
  }
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// ---------- ΠΑΛΙΑ ΘΕΜΑΤΑ PDF ENDPOINTS ----------

// Λήψη όλων των PDF
app.get('/api/pallia-themata', async (req, res) => {
  try {
    const { lykeio, subject, year } = req.query;
    
    if (lykeio || subject || year) {
      const pdfs = await filterPDFs({ lykeio, subject, year });
      res.json(pdfs);
    } else {
      const pdfs = await getAllPDFs();
      res.json(pdfs);
    }
  } catch (error) {
    console.error('Σφάλμα λήψης PDF:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείων PDF' });
  }
});

// Λήψη συγκεκριμένου PDF
app.get('/api/pallia-themata/:id', async (req, res) => {
  try {
    const pdf = await getPDFById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'Το PDF δεν βρέθηκε' });
    }
    res.json(pdf);
  } catch (error) {
    console.error('Σφάλμα λήψης PDF:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης PDF' });
  }
});

// Προβολή PDF αρχείου (inline viewing)
app.get('/api/pallia-themata/:id/view', async (req, res) => {
  try {
    const pdf = await getPDFById(req.params.id);
    if (!pdf || !pdf.file_data) {
      return res.status(404).json({ error: 'Το αρχείο δεν βρέθηκε' });
    }
    
    // Encode filename για να αποφύγουμε προβλήματα με ελληνικά χαρακτήρες
    const encodedFilename = encodeURIComponent(pdf.filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(pdf.file_data);
  } catch (error) {
    console.error('Σφάλμα προβολής PDF:', error);
    res.status(500).json({ error: 'Σφάλμα προβολής αρχείου' });
  }
});

// Download PDF αρχείου
app.get('/api/pallia-themata/:id/download', async (req, res) => {
  try {
    const pdf = await getPDFById(req.params.id);
    if (!pdf || !pdf.file_data) {
      return res.status(404).json({ error: 'Το αρχείο δεν βρέθηκε' });
    }
    
    // Encode filename για να αποφύγουμε προβλήματα με ελληνικά χαρακτήρες
    const encodedFilename = encodeURIComponent(pdf.filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(pdf.file_data);
  } catch (error) {
    console.error('Σφάλμα λήψης PDF:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείου' });
  }
});

// Προβολή/Download PDF αρχείου (παλιό endpoint - διατηρείται για συμβατότητα)
app.get('/api/pallia-themata/:id/file', async (req, res) => {
  try {
    const pdf = await getPDFById(req.params.id);
    if (!pdf || !pdf.file_data) {
      return res.status(404).json({ error: 'Το αρχείο δεν βρέθηκε' });
    }
    
    // Encode filename για να αποφύγουμε προβλήματα με ελληνικά χαρακτήρες
    const encodedFilename = encodeURIComponent(pdf.filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(pdf.file_data);
  } catch (error) {
    console.error('Σφάλμα προβολής PDF:', error);
    res.status(500).json({ error: 'Σφάλμα προβολής αρχείου' });
  }
});

// Δημιουργία νέου PDF (με base64 data - προσωρινή λύση)
app.post('/api/pallia-themata', async (req, res) => {
  try {
    const { title, lykeio, subject, year, description, fileData, fileName, fileSize } = req.body;
    
    // Validation
    if (!title || !lykeio || !subject || !year || !fileData) {
      return res.status(400).json({ error: 'Συμπληρώστε όλα τα υποχρεωτικά πεδία και επιλέξτε αρχείο' });
    }
    
    // Δημιουργία filename
    const subjectMap = {
      'Μαθηματικά': 'mathimatika',
      'Φυσική': 'fysiki',
      'Χημεία': 'ximeia',
      'Βιολογία': 'biologia',
      'Νεοελληνική Γλώσσα': 'neoeliniki',
      'Αρχαία Ελληνικά': 'arxaia',
      'Ιστορία': 'istoria',
      'Λατινικά': 'latinika',
      'Αγγλικά': 'agglika',
      'Γαλλικά': 'gallika',
      'Γερμανικά': 'germanika',
      'Οικονομικά': 'oikonomika',
      'Πληροφορική': 'plirofiriki',
      'Τεχνολογία': 'texnologia',
      'Τουρισμός': 'tourismou'
    };
    
    const lykeioCode = lykeio.toLowerCase();
    const subjectCode = subjectMap[subject] || subject.toLowerCase();
    const filename = `${subjectCode}_${lykeioCode}_${year}_themata.pdf`;
    
    // Έλεγχος για διπλό filename
    const existingPDF = await getPDFByFilename(filename);
    if (existingPDF) {
      return res.status(400).json({ error: 'Υπάρχει ήδη αρχείο με τα ίδια στοιχεία' });
    }
    
    // Μετατροπή base64 σε Buffer
    const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    const pdfData = {
      title,
      lykeio,
      subject,
      year,
      type: 'Θέματα',
      filename,
      description: description || `Θέματα ${subject} ${lykeio} ${year}`,
      file_data: fileBuffer,
      file_size: fileSize || `${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB`,
      upload_date: new Date().toISOString().split('T')[0]
    };
    
    const newPDF = await createPDF(pdfData);
    res.status(201).json({ success: true, pdf: newPDF });
    
  } catch (error) {
    console.error('Σφάλμα δημιουργίας PDF:', error);
    res.status(500).json({ error: 'Σφάλμα δημιουργίας PDF' });
  }
});

// Ενημέρωση PDF (χωρίς αλλαγή αρχείου)
app.put('/api/pallia-themata/:id', async (req, res) => {
  try {
    const { title, lykeio, subject, year, description } = req.body;
    
    // Validation
    if (!title || !lykeio || !subject || !year) {
      return res.status(400).json({ error: 'Συμπληρώστε όλα τα υποχρεωτικά πεδία' });
    }
    
    // Δημιουργία νέου filename
    const subjectMap = {
      'Μαθηματικά': 'mathimatika',
      'Φυσική': 'fysiki',
      'Χημεία': 'ximeia',
      'Βιολογία': 'biologia',
      'Νεοελληνική Γλώσσα': 'neoeliniki',
      'Αρχαία Ελληνικά': 'arxaia',
      'Ιστορία': 'istoria',
      'Λατινικά': 'latinika',
      'Αγγλικά': 'agglika',
      'Γαλλικά': 'gallika',
      'Γερμανικά': 'germanika',
      'Οικονομικά': 'oikonomika',
      'Πληροφορική': 'plirofiriki',
      'Τεχνολογία': 'texnologia',
      'Τουρισμός': 'tourismou'
    };
    
    const lykeioCode = lykeio.toLowerCase();
    const subjectCode = subjectMap[subject] || subject.toLowerCase();
    const filename = `${subjectCode}_${lykeioCode}_${year}_themata.pdf`;
    
    const success = await updatePDF(req.params.id, {
      title, lykeio, subject, year, description, filename
    });
    
    if (!success) {
      return res.status(404).json({ error: 'Το PDF δεν βρέθηκε' });
    }
    
    res.json({ success: true, message: 'Το PDF ενημερώθηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα ενημέρωσης PDF:', error);
    res.status(500).json({ error: 'Σφάλμα ενημέρωσης PDF' });
  }
});

// Διαγραφή PDF
app.delete('/api/pallia-themata/:id', async (req, res) => {
  try {
    const success = await deletePDF(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Το PDF δεν βρέθηκε' });
    }
    
    res.json({ success: true, message: 'Το PDF διαγράφηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα διαγραφής PDF:', error);
    res.status(500).json({ error: 'Σφάλμα διαγραφής PDF' });
  }
});

// ==================== VASEIS SCHOLON API ENDPOINTS ====================

// Λήψη όλων των βάσεων σχολών
app.get('/api/vaseis-scholon', async (req, res) => {
  try {
    const vaseis = await getAllVaseisScholon();
    res.json(vaseis);
  } catch (error) {
    console.error('Σφάλμα λήψης βάσεων σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης βάσεων σχολών' });
  }
});

// Λήψη συγκεκριμένης βάσης σχολών
app.get('/api/vaseis-scholon/:id', async (req, res) => {
  try {
    const vaseis = await getVaseisScholonById(req.params.id);
    if (!vaseis) {
      return res.status(404).json({ error: 'Η βάση σχολών δεν βρέθηκε' });
    }
    res.json(vaseis);
  } catch (error) {
    console.error('Σφάλμα λήψης βάσης σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης βάσης σχολών' });
  }
});

// Προβολή αρχείου βάσης σχολών (inline viewing)
app.get('/api/vaseis-scholon/:id/view', async (req, res) => {
  try {
    const vaseis = await getVaseisScholonById(req.params.id);
    if (!vaseis) {
      return res.status(404).json({ error: 'Η βάση σχολών δεν βρέθηκε' });
    }

    // Encoding του filename για σωστή εμφάνιση των ελληνικών χαρακτήρων
    const encodedFilename = encodeURIComponent(vaseis.filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`);
    res.send(vaseis.file_data);
  } catch (error) {
    console.error('Σφάλμα λήψης αρχείου βάσης σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείου' });
  }
});

// Λήψη αρχείου βάσης σχολών (download)
app.get('/api/vaseis-scholon/:id/download', async (req, res) => {
  try {
    const vaseis = await getVaseisScholonById(req.params.id);
    if (!vaseis) {
      return res.status(404).json({ error: 'Η βάση σχολών δεν βρέθηκε' });
    }

    // Encoding του filename για σωστή εμφάνιση των ελληνικών χαρακτήρων
    const encodedFilename = encodeURIComponent(vaseis.filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.send(vaseis.file_data);
  } catch (error) {
    console.error('Σφάλμα λήψης αρχείου βάσης σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείου' });
  }
});

// Δημιουργία νέας βάσης σχολών
app.post('/api/vaseis-scholon', async (req, res) => {
  try {
    console.log('Λήψη δεδομένων για νέα βάση σχολών:', req.body);
    
    const { title, year, lykeio, field, description, filename, fileData } = req.body;
    
    // Validation
    if (!title || !year || !lykeio || !field || !filename || !fileData) {
      return res.status(400).json({ 
        error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' 
      });
    }

    // Μετατροπή base64 σε Buffer
    let fileBuffer;
    try {
      const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return res.status(400).json({ error: 'Μη έγκυρα δεδομένα αρχείου' });
    }

    // Υπολογισμός μεγέθους αρχείου
    const fileSizeBytes = fileBuffer.length;
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
    const fileSize = fileSizeMB > 1 ? `${fileSizeMB} MB` : `${(fileSizeBytes / 1024).toFixed(0)} KB`;

    const vaseisData = {
      title,
      year,
      lykeio,
      field,
      description: description || '',
      filename,
      file_data: fileBuffer,
      file_size: fileSize
    };

    console.log('Δημιουργία βάσης σχολών με δεδομένα:', { ...vaseisData, file_data: '[BINARY_DATA]' });
    
    const result = await createVaseisScholon(vaseisData);
    
    res.json({ 
      success: true, 
      message: 'Η βάση σχολών δημιουργήθηκε επιτυχώς',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Σφάλμα δημιουργίας βάσης σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα δημιουργίας βάσης σχολών' });
  }
});

// Ενημέρωση βάσης σχολών
app.put('/api/vaseis-scholon/:id', async (req, res) => {
  try {
    const { title, year, lykeio, field, description, filename, fileData } = req.body;
    
    // Validation
    if (!title || !year || !lykeio || !field || !filename) {
      return res.status(400).json({ 
        error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' 
      });
    }

    const updateData = {
      title,
      year,
      lykeio,
      field,
      description: description || '',
      filename
    };

    // Αν υπάρχει νέο αρχείο, επεξεργαστείτε το
    if (fileData) {
      try {
        const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        const fileSizeBytes = fileBuffer.length;
        const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
        const fileSize = fileSizeMB > 1 ? `${fileSizeMB} MB` : `${(fileSizeBytes / 1024).toFixed(0)} KB`;
        
        updateData.file_data = fileBuffer;
        updateData.file_size = fileSize;
      } catch (error) {
        return res.status(400).json({ error: 'Μη έγκυρα δεδομένα αρχείου' });
      }
    }

    const success = await updateVaseisScholon(req.params.id, updateData);
    if (!success) {
      return res.status(404).json({ error: 'Η βάση σχολών δεν βρέθηκε' });
    }
    
    res.json({ success: true, message: 'Η βάση σχολών ενημερώθηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα ενημέρωσης βάσης σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα ενημέρωσης βάσης σχολών' });
  }
});

// Διαγραφή βάσης σχολών
app.delete('/api/vaseis-scholon/:id', async (req, res) => {
  try {
    const success = await deleteVaseisScholon(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Η βάση σχολών δεν βρέθηκε' });
    }
    
    res.json({ success: true, message: 'Η βάση σχολών διαγράφηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα διαγραφής βάσης σχολών:', error);
    res.status(500).json({ error: 'Σφάλμα διαγραφής βάσης σχολών' });
  }
});


// ==================== MIXANOGRAFIKO API ENDPOINTS ====================

// Λήψη όλων των αρχείων μηχανογραφικού
app.get('/api/mixanografiko', async (req, res) => {
  try {
    const { lykeio, field, specialty } = req.query;
    
    let mixanografika;
    if (lykeio || field || specialty) {
      mixanografika = await filterMixanografiko({ lykeio, field, specialty });
    } else {
      mixanografika = await getAllMixanografiko();
    }
    
    res.json(mixanografika);
  } catch (error) {
    console.error('Σφάλμα λήψης αρχείων μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείων μηχανογραφικού' });
  }
});

// Λήψη συγκεκριμένου αρχείου μηχανογραφικού
app.get('/api/mixanografiko/:id', async (req, res) => {
  try {
    const mixanografiko = await getMixanografikoById(req.params.id);
    if (!mixanografiko) {
      return res.status(404).json({ error: 'Το αρχείο μηχανογραφικού δεν βρέθηκε' });
    }
    res.json(mixanografiko);
  } catch (error) {
    console.error('Σφάλμα λήψης αρχείου μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείου μηχανογραφικού' });
  }
});

// Προβολή αρχείου μηχανογραφικού (inline viewing)
app.get('/api/mixanografiko/view/:id', async (req, res) => {
  try {
    const mixanografiko = await getMixanografikoById(req.params.id);
    if (!mixanografiko) {
      return res.status(404).json({ error: 'Το αρχείο μηχανογραφικού δεν βρέθηκε' });
    }
    
    if (!mixanografiko.file_data) {
      return res.status(404).json({ error: 'Δεν βρέθηκαν δεδομένα αρχείου' });
    }
    
    // Ορισμός headers για PDF inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(mixanografiko.filename)}"`);
    
    // Αποστολή του αρχείου
    res.send(mixanografiko.file_data);
  } catch (error) {
    console.error('Σφάλμα προβολής αρχείου μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα προβολής αρχείου' });
  }
});

// Download αρχείου μηχανογραφικού
app.get('/api/mixanografiko/download/:id', async (req, res) => {
  try {
    const mixanografiko = await getMixanografikoById(req.params.id);
    if (!mixanografiko) {
      return res.status(404).json({ error: 'Το αρχείο μηχανογραφικού δεν βρέθηκε' });
    }
    
    if (!mixanografiko.file_data) {
      return res.status(404).json({ error: 'Δεν βρέθηκαν δεδομένα αρχείου' });
    }
    
    // Ορισμός headers για PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(mixanografiko.filename)}"`);
    
    // Αποστολή του αρχείου
    res.send(mixanografiko.file_data);
  } catch (error) {
    console.error('Σφάλμα λήψης αρχείου μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης αρχείου' });
  }
});

// Δημιουργία νέου αρχείου μηχανογραφικού
app.post('/api/mixanografiko', async (req, res) => {
  try {
    const { title, lykeio, field, specialty, description, filename, fileData } = req.body;
    
    // Validation
    if (!title || !lykeio || !field || !filename || !fileData) {
      return res.status(400).json({ 
        error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' 
      });
    }

    // Επεξεργασία του base64 αρχείου
    let fileBuffer, fileSize;
    try {
      const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
      
      // Υπολογισμός μεγέθους αρχείου
      const fileSizeBytes = fileBuffer.length;
      const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
      fileSize = fileSizeMB > 1 ? `${fileSizeMB} MB` : `${(fileSizeBytes / 1024).toFixed(0)} KB`;
    } catch (error) {
      return res.status(400).json({ error: 'Μη έγκυρα δεδομένα αρχείου' });
    }

    const mixanografikoData = {
      title,
      lykeio,
      field,
      specialty: specialty || '',
      description: description || '',
      filename,
      file_data: fileBuffer,
      file_size: fileSize
    };

    console.log('Δημιουργία μηχανογραφικού με δεδομένα:', { ...mixanografikoData, file_data: '[BINARY_DATA]' });
    
    const result = await createMixanografiko(mixanografikoData);
    
    res.json({ 
      success: true, 
      message: 'Το αρχείο μηχανογραφικού δημιουργήθηκε επιτυχώς',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Σφάλμα δημιουργίας αρχείου μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα δημιουργίας αρχείου μηχανογραφικού' });
  }
});

// Ενημέρωση αρχείου μηχανογραφικού
app.put('/api/mixanografiko/:id', async (req, res) => {
  try {
    const { title, lykeio, field, specialty, description, filename, fileData } = req.body;
    
    // Validation
    if (!title || !lykeio || !field || !filename) {
      return res.status(400).json({ 
        error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' 
      });
    }

    const updateData = {
      title,
      lykeio,
      field,
      specialty: specialty || '',
      description: description || '',
      filename
    };

    // Αν υπάρχει νέο αρχείο, επεξεργαστείτε το
    if (fileData) {
      try {
        const base64Data = fileData.replace(/^data:application\/pdf;base64,/, '');
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        const fileSizeBytes = fileBuffer.length;
        const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
        const fileSize = fileSizeMB > 1 ? `${fileSizeMB} MB` : `${(fileSizeBytes / 1024).toFixed(0)} KB`;
        
        updateData.file_data = fileBuffer;
        updateData.file_size = fileSize;
      } catch (error) {
        return res.status(400).json({ error: 'Μη έγκυρα δεδομένα αρχείου' });
      }
    }

    const success = await updateMixanografiko(req.params.id, updateData);
    if (!success) {
      return res.status(404).json({ error: 'Το αρχείο μηχανογραφικού δεν βρέθηκε' });
    }
    
    res.json({ success: true, message: 'Το αρχείο μηχανογραφικού ενημερώθηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα ενημέρωσης αρχείου μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα ενημέρωσης αρχείου μηχανογραφικού' });
  }
});

// Διαγραφή αρχείου μηχανογραφικού
app.delete('/api/mixanografiko/:id', async (req, res) => {
  try {
    const success = await deleteMixanografiko(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Το αρχείο μηχανογραφικού δεν βρέθηκε' });
    }
    
    res.json({ success: true, message: 'Το αρχείο μηχανογραφικού διαγράφηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα διαγραφής αρχείου μηχανογραφικού:', error);
    res.status(500).json({ error: 'Σφάλμα διαγραφής αρχείου μηχανογραφικού' });
  }
});

// ========== STUDENTS API ==========

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const { search, studentClass } = req.query;
    let students;
    
    if (search) {
      students = await searchStudents(search);
    } else if (studentClass) {
      students = await getStudentsByClass(studentClass);
    } else {
      students = await getStudents();
    }
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Error fetching students' });
  }
});

// Get student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await getStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Error fetching student' });
  }
});

// Create new student
app.post('/api/students', async (req, res) => {
  try {
    const { 
      firstName, lastName, fatherName, motherName, birthDate, 
      address, phone, email, studentClass, registrationDate,
      username, password, parentName, parentPhone, status, notes
    } = req.body;
    
    if (!firstName || !lastName || !username || !password) {
      return res.status(400).json({ error: 'Required fields missing: firstName, lastName, username, password' });
    }
    
    // Hash the password
    const bcrypt = await import('bcrypt');
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create comprehensive student data
    const studentData = {
      first_name: firstName,
      last_name: lastName,
      father_name: fatherName || '',
      username: username,
      password_hash: password_hash,
      class: studentClass || '',
      phone: phone || '',
      email: email || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      address: address || '',
      birthDate: birthDate || null,
      enrollmentDate: registrationDate || new Date().toISOString().split('T')[0],
      status: status || 'active',
      notes: notes || ''
    };
    
    console.log('📝 Creating student with data:', studentData);
    
    const studentId = await createStudentComplete(studentData);
    res.json({ success: true, id: studentId, message: 'Student created successfully' });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists. Please choose a different username.' });
    } else {
      res.status(500).json({ error: 'Error creating student' });
    }
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    console.log(`🔧 PUT /api/students/${req.params.id} called`);
    console.log('📊 Request body:', req.body);
    
    const success = await updateStudent(req.params.id, req.body);
    console.log('📊 updateStudent result:', success, 'type:', typeof success);
    console.log('📊 !success:', !success);
    
    if (!success) {
      console.log('❌ Returning 404 - student not found');
      return res.status(404).json({ error: 'Student not found' });
    }
    
    console.log('✅ Returning success');
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('❌ Error updating student:', error);
    res.status(500).json({ error: 'Error updating student' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const success = await deleteStudent(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Error deleting student' });
  }
});

// ========== GRADES API ==========

// Get grades for a student
app.get('/api/grades/:studentId', async (req, res) => {
  try {
    const grades = await getGradesByStudent(req.params.studentId);
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Error fetching grades' });
  }
});

// Add a new grade
app.post('/api/grades', async (req, res) => {
  try {
    const { studentId, subjectId, examType, grade, examDate, notes } = req.body;
    
    console.log('📊 Grade submission data:', { studentId, subjectId, examType, grade, examDate, notes });
    
    if (!studentId || !subjectId || !grade || !examDate) {
      console.log('❌ Missing required fields:', { studentId: !!studentId, subjectId: !!subjectId, grade: !!grade, examDate: !!examDate });
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await pool.execute(
      'INSERT INTO grades (student_id, subject_id, exam_type, grade, exam_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [studentId, subjectId, examType || 'Διαγώνισμα', grade, examDate, notes || '']
    );
    
    console.log('✅ Grade added successfully, ID:', result[0].insertId);
    res.json({ success: true, id: result[0].insertId, message: 'Grade added successfully' });
  } catch (error) {
    console.error('Error adding grade:', error);
    res.status(500).json({ error: 'Error adding grade' });
  }
});

// Update a grade
app.put('/api/grades/:id', async (req, res) => {
  try {
    const { subjectId, examType, grade, examDate, notes } = req.body;
    
    const result = await pool.execute(
      'UPDATE grades SET subject_id = ?, exam_type = ?, grade = ?, exam_date = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [subjectId, examType, grade, examDate, notes || '', req.params.id]
    );
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    
    res.json({ success: true, message: 'Grade updated successfully' });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ error: 'Error updating grade' });
  }
});

// Delete a grade
app.delete('/api/grades/:id', async (req, res) => {
  try {
    const result = await pool.execute('DELETE FROM grades WHERE id = ?', [req.params.id]);
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    
    res.json({ success: true, message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ error: 'Error deleting grade' });
  }
});

// ========== PROGRESS NOTES API ==========

// Get progress notes for a student
app.get('/api/progress/:studentId', async (req, res) => {
  try {
    const notes = await getProgressNotes(req.params.studentId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching progress notes:', error);
    res.status(500).json({ error: 'Error fetching progress notes' });
  }
});

// Add a new progress note
app.post('/api/progress', async (req, res) => {
  try {
    // Support both old and new field names
    const { 
      studentId, 
      subjectId, 
      noteDate, 
      date,
      content, 
      note,
      performanceLevel,
      rating 
    } = req.body;
    
    // Use new field names if available, otherwise fallback to old ones
    const finalStudentId = studentId;
    const finalSubjectId = subjectId;
    const finalDate = date || noteDate;
    const finalContent = note || content;
    const finalRating = rating || performanceLevel;
    
    console.log('📈 Progress submission data:', { 
      finalStudentId, 
      finalSubjectId, 
      finalDate, 
      finalContent, 
      finalRating 
    });
    
    if (!finalStudentId || !finalContent || !finalDate) {
      console.log('❌ Missing required fields:', { 
        studentId: !!finalStudentId, 
        content: !!finalContent, 
        date: !!finalDate 
      });
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validation για το subject_id
    if (!finalSubjectId) {
      console.log('❌ Invalid subject_id:', finalSubjectId);
      return res.status(400).json({ error: 'Πρέπει να επιλέξετε ένα συγκεκριμένο μάθημα' });
    }

    const result = await pool.execute(
      'INSERT INTO progress_notes (student_id, subject_id, note_date, content, performance_level, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [finalStudentId, finalSubjectId, finalDate, finalContent, finalRating || 'average']
    );
    
    console.log('✅ Progress note added successfully, ID:', result[0].insertId);
    res.json({ success: true, id: result[0].insertId, message: 'Progress note added successfully' });
  } catch (error) {
    console.error('Error adding progress note:', error);
    res.status(500).json({ error: 'Error adding progress note' });
  }
});

// Update a progress note
app.put('/api/progress/:id', async (req, res) => {
  try {
    const { subjectId, noteDate, content, performanceLevel } = req.body;
    
    const result = await pool.execute(
      'UPDATE progress_notes SET subject_id = ?, note_date = ?, content = ?, performance_level = ?, updated_at = NOW() WHERE id = ?',
      [subjectId || null, noteDate, content, performanceLevel, req.params.id]
    );
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Progress note not found' });
    }
    
    res.json({ success: true, message: 'Progress note updated successfully' });
  } catch (error) {
    console.error('Error updating progress note:', error);
    res.status(500).json({ error: 'Error updating progress note' });
  }
});

// Delete a progress note
app.delete('/api/progress/:id', async (req, res) => {
  try {
    const result = await pool.execute('DELETE FROM progress_notes WHERE id = ?', [req.params.id]);
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Progress note not found' });
    }
    
    res.json({ success: true, message: 'Progress note deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress note:', error);
    res.status(500).json({ error: 'Error deleting progress note' });
  }
});

// ========== CALENDAR API ==========

// Get calendar entries for a student
app.get('/api/calendar/:studentId', async (req, res) => {
  try {
    const result = await pool.execute(
      `SELECT c.*, s.name as subject_name, st.class as student_class 
       FROM calendar_entries c 
       LEFT JOIN subjects s ON c.subject_id = s.id 
       LEFT JOIN Students st ON c.student_id = st.id
       WHERE c.student_id = ? 
       ORDER BY c.entry_date DESC`,
      [req.params.studentId]
    );
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching calendar entries:', error);
    res.status(500).json({ error: 'Error fetching calendar entries' });
  }
});

// Add a new calendar entry
app.post('/api/calendar', async (req, res) => {
  try {
    const { studentId, subjectId, entryDate, eventType, title, description } = req.body;
    
    console.log('📅 Calendar submission data:', { studentId, subjectId, entryDate, eventType, title, description });
    
    if (!studentId || !entryDate || !title) {
      console.log('❌ Missing required fields:', { studentId: !!studentId, entryDate: !!entryDate, title: !!title });
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validation για το subject_id
    if (!subjectId) {
      console.log('❌ Invalid subject_id:', subjectId);
      return res.status(400).json({ error: 'Πρέπει να επιλέξετε ένα συγκεκριμένο μάθημα' });
    }

    const result = await pool.execute(
      'INSERT INTO calendar_entries (student_id, subject_id, entry_date, event_type, title, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [studentId, subjectId, entryDate, eventType || 'Ενημέρωση', title, description || '']
    );
    
    console.log('✅ Calendar entry added successfully, ID:', result[0].insertId);
    res.json({ success: true, id: result[0].insertId, message: 'Calendar entry added successfully' });
  } catch (error) {
    console.error('Error adding calendar entry:', error);
    res.status(500).json({ error: 'Error adding calendar entry' });
  }
});

// Update a calendar entry
app.put('/api/calendar/:id', async (req, res) => {
  try {
    const { subjectId, entryDate, eventType, title, description } = req.body;
    
    const result = await pool.execute(
      'UPDATE calendar_entries SET subject_id = ?, entry_date = ?, event_type = ?, title = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [subjectId || null, entryDate, eventType, title, description || '', req.params.id]
    );
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }
    
    res.json({ success: true, message: 'Calendar entry updated successfully' });
  } catch (error) {
    console.error('Error updating calendar entry:', error);
    res.status(500).json({ error: 'Error updating calendar entry' });
  }
});

// Delete a calendar entry
app.delete('/api/calendar/:id', async (req, res) => {
  try {
    const result = await pool.execute('DELETE FROM calendar_entries WHERE id = ?', [req.params.id]);
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }
    
    res.json({ success: true, message: 'Calendar entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar entry:', error);
    res.status(500).json({ error: 'Error deleting calendar entry' });
  }
});

// ========== EVENTS API (Alias for Calendar) ==========

// Add a new event (alias for calendar)
app.post('/api/events', async (req, res) => {
  try {
    const { studentId, subjectId, entryDate, eventType, title, description, time } = req.body;
    
    console.log('📅 Event submission data:', { studentId, subjectId, entryDate, eventType, title, description, time });
    
    if (!studentId || !entryDate || !title) {
      console.log('❌ Missing required fields:', { studentId: !!studentId, entryDate: !!entryDate, title: !!title });
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Combine description and time if time is provided
    let fullDescription = description || '';
    if (time) {
      fullDescription = time + (fullDescription ? ': ' + fullDescription : '');
    }

    const result = await pool.execute(
      'INSERT INTO calendar_entries (student_id, subject_id, entry_date, event_type, title, description, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [studentId, subjectId || null, entryDate, eventType || 'Ενημέρωση', title, fullDescription]
    );
    
    console.log('✅ Event added successfully, ID:', result[0].insertId);
    res.json({ success: true, id: result[0].insertId, message: 'Event added successfully' });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Error adding event' });
  }
});

// ========== SUBJECTS API ==========

// Get all subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await getAllSubjects();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Error fetching subjects' });
  }
});

// Get subject by ID
app.get('/api/subjects/:id', async (req, res) => {
  try {
    const subject = await getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Error fetching subject' });
  }
});

// Create new subject
app.post('/api/subjects', async (req, res) => {
  try {
    const { name, code, class: subjectClass, teacherId } = req.body;
    
    if (!name || !code || !subjectClass) {
      return res.status(400).json({ error: 'Required fields missing: name, code, and class are required' });
    }
    
    const subjectData = { name, code, class: subjectClass, teacherId };
    const subjectId = await createSubject(subjectData);
    
    res.json({ success: true, id: subjectId, message: 'Subject created successfully' });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Error creating subject' });
  }
});

// Update subject
app.put('/api/subjects/:id', async (req, res) => {
  try {
    const success = await updateSubject(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Error updating subject' });
  }
});

// Delete subject
app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const success = await deleteSubject(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Error deleting subject' });
  }
});

// ========== ENROLLMENTS API ==========

// Get all enrollments
app.get('/api/enrollments', async (req, res) => {
  try {
    const { search, studentId, classId } = req.query;
    let enrollments;
    
    if (search) {
      enrollments = await searchEnrollments(search);
    } else if (studentId) {
      enrollments = await getEnrollmentsByStudent(studentId);
    } else if (classId) {
      enrollments = await getEnrollmentsBySubject(classId);
    } else {
      enrollments = await getAllEnrollments();
    }
    
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Error fetching enrollments' });
  }
});

// Create new enrollment
app.post('/api/enrollments', async (req, res) => {
  try {
    console.log('Enrollment POST body:', req.body); // Logging incoming data
    const { studentId, classId } = req.body;
    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Student ID and Class ID are required' });
    }
    const enrollmentId = await createEnrollment(studentId, classId);
    res.json({ success: true, id: enrollmentId, message: 'Enrollment created successfully' });
  } catch

