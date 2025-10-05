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
    
    console.log(' Creating student with data:', studentData);
    
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
    console.log(` PUT /api/students/${req.params.id} called`);
    console.log(' Request body:', req.body);
    
    const success = await updateStudent(req.params.id, req.body);
    console.log(' updateStudent result:', success, 'type:', typeof success);
    console.log(' !success:', !success);
    
    if (!success) {
      console.log(' Returning 404 - student not found');
      return res.status(404).json({ error: 'Student not found' });
    }
    
    console.log(' Returning success');
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error(' Error updating student:', error);
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
    
    console.log(' Grade submission data:', { studentId, subjectId, examType, grade, examDate, notes });
    
    if (!studentId || !subjectId || !grade || !examDate) {
      console.log(' Missing required fields:', { studentId: !!studentId, subjectId: !!subjectId, grade: !!grade, examDate: !!examDate });
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await pool.query(
  'INSERT INTO grades (student_id, subject_id, exam_type, grade, exam_date, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
      [studentId, subjectId, examType || 'Διαγώνισμα', grade, examDate, notes || '']
    );

    console.log(' Grade added successfully, ID:', result.rows[0].id);
    res.json({ success: true, id: result.rows[0].id, message: 'Grade added successfully' });
  } catch (error) {
    console.error('Error adding grade:', error);
    res.status(500).json({ error: 'Error adding grade' });
  }
});

// Update a grade
app.put('/api/grades/:id', async (req, res) => {
  try {
    const { subjectId, examType, grade, examDate, notes } = req.body;
    
    const result = await pool.query(
      'UPDATE grades SET subject_id = $1, exam_type = $2, grade = $3, exam_date = $4, notes = $5, updated_at = NOW() WHERE id = $6',
      [subjectId, examType, grade, examDate, notes || '', req.params.id]
    );
    
    if (result.rowCount === 0) {
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
    const result = await pool.query('DELETE FROM grades WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
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
    
    console.log(' Progress submission data:', { 
      finalStudentId, 
      finalSubjectId, 
      finalDate, 
      finalContent, 
      finalRating 
    });
    
    if (!finalStudentId || !finalContent || !finalDate) {
      console.log(' Missing required fields:', { 
        studentId: !!finalStudentId, 
        content: !!finalContent, 
        date: !!finalDate 
      });
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validation για το subject_id
    if (!finalSubjectId) {
      console.log(' Invalid subject_id:', finalSubjectId);
      return res.status(400).json({ error: 'Πρέπει να επιλέξετε ένα συγκεκριμένο μάθημα' });
    }

    const result = await pool.query(
      'INSERT INTO progress_notes (student_id, subject_id, note_date, content, performance_level, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [finalStudentId, finalSubjectId, finalDate, finalContent, finalRating || 'average']
    );
    
    console.log(' Progress note added successfully, ID:', result.rows[0].id);
    res.json({ success: true, id: result.rows[0].id, message: 'Progress note added successfully' });
  } catch (error) {
    console.error('Error adding progress note:', error);
    res.status(500).json({ error: 'Error adding progress note' });
  }
});

// Update a progress note
app.put('/api/progress/:id', async (req, res) => {
  try {
    const { subjectId, noteDate, content, performanceLevel } = req.body;
    
    const result = await pool.query(
      'UPDATE progress_notes SET subject_id = $1, note_date = $2, content = $3, performance_level = $4, updated_at = NOW() WHERE id = $5',
      [subjectId || null, noteDate, content, performanceLevel, req.params.id]
    );

    if (result.rowCount === 0) {
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
    const result = await pool.query('DELETE FROM progress_notes WHERE id = $1', [req.params.id]);
    
    if (result.rowCount === 0) {
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
    const result = await pool.query(
      `SELECT c.*, s.name as subject_name, st.class as student_class 
       FROM CalendarEvents c 
       LEFT JOIN subjects s ON c.subject_id = s.id 
       LEFT JOIN Students st ON c.student_id = st.id
       WHERE c.student_id = $1 
       ORDER BY c.event_date DESC`,
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching calendar entries:', error);
    res.status(500).json({ error: 'Error fetching calendar entries' });
  }
});

// Add a new calendar entry
app.post('/api/calendar', async (req, res) => {
  try {
    const { studentId, subjectId, eventDate, eventType, title, description } = req.body;
    if (!studentId || !eventDate || !title || !subjectId) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    const result = await pool.query(
      'INSERT INTO CalendarEvents (student_id, subject_id, event_date, event_type, title, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
      [studentId, subjectId, eventDate, eventType || 'Ενημέρωση', title, description || '']
    );
    res.json({ success: true, id: result.rows[0].id, message: 'Calendar entry added successfully' });
  } catch (error) {
    console.error('Error adding calendar entry:', error);
    res.status(500).json({ error: 'Error adding calendar entry' });
  }
});

// Update a calendar entry
app.put('/api/calendar/:id', async (req, res) => {
  try {
    const { subjectId, eventDate, eventType, title, description } = req.body;
    const result = await pool.query(
      'UPDATE CalendarEvents SET subject_id = $1, event_date = $2, event_type = $3, title = $4, description = $5, updated_at = NOW() WHERE id = $6',
      [subjectId || null, eventDate, eventType, title, description || '', req.params.id]
    );
    if (result.rowCount === 0) {
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
    const result = await pool.query('DELETE FROM CalendarEvents WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Calendar entry not found' });
    }
    res.json({ success: true, message: 'Calendar entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar entry:', error);
    res.status(500).json({ error: 'Error deleting calendar entry' });
  }
});

// Add a new event (alias for calendar)
app.post('/api/events', async (req, res) => {
  try {
    const { studentId, subjectId, eventDate, eventType, title, description, time } = req.body;
    if (!studentId || !eventDate || !title) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    let fullDescription = description || '';
    if (time) {
      fullDescription = time + (fullDescription ? ': ' + fullDescription : '');
    }
    const result = await pool.query(
      'INSERT INTO CalendarEvents (student_id, subject_id, event_date, event_type, title, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
      [studentId, subjectId || null, eventDate, eventType || 'Ενημέρωση', title, fullDescription]
    );
    res.json({ success: true, id: result.rows[0].id, message: 'Event added successfully' });
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
    const { studentId, classId } = req.body;
    
    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Student ID and Class ID are required' });
    }
    
    // Χρησιμοποίηση του classId ως subjectId (στη βάση τα subjects είναι τα τμήματα)
    const enrollmentId = await createEnrollment(studentId, classId);
    
    res.json({ success: true, id: enrollmentId, message: 'Enrollment created successfully' });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Ο μαθητής είναι ήδη εγγεγραμμένος σε αυτό το τμήμα' });
    } else {
      res.status(500).json({ error: 'Error creating enrollment' });
    }
  }
});

// Update enrollment
app.put('/api/enrollments/:id', async (req, res) => {
  try {
    const success = await updateEnrollment(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json({ success: true, message: 'Enrollment updated successfully' });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ error: 'Error updating enrollment' });
  }
});

// Delete enrollment
app.delete('/api/enrollments/:id', async (req, res) => {
  try {
    const success = await deleteEnrollment(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json({ success: true, message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ error: 'Error deleting enrollment' });
  }
});

// ========== STUDENT CODES API ==========

// Get all student codes
app.get('/api/student-codes', async (req, res) => {
  try {
    const { search, status } = req.query;
    let codes;
    
    if (search || status) {
      codes = await searchStudentCodes(search, status);
    } else {
      codes = await getAllStudentCodes();
    }
    
    res.json(codes);
  } catch (error) {
    console.error('Error fetching student codes:', error);
    res.status(500).json({ error: 'Error fetching student codes' });
  }
});

// Get student code by ID
app.get('/api/student-codes/:id', async (req, res) => {
  try {
    const code = await getStudentCodeById(req.params.id);
    if (!code) {
      return res.status(404).json({ error: 'Student code not found' });
    }
    res.json(code);
  } catch (error) {
    console.error('Error fetching student code:', error);
    res.status(500).json({ error: 'Error fetching student code' });
  }
});

// Get student code by student ID
app.get('/api/student-codes/student/:studentId', async (req, res) => {
  try {
    const code = await getStudentCodeByStudentId(req.params.studentId);
    if (!code) {
      return res.status(404).json({ error: 'Student code not found' });
    }
    res.json(code);
  } catch (error) {
    console.error('Error fetching student code:', error);
    res.status(500).json({ error: 'Error fetching student code' });
  }
});

// Create new student code
app.post('/api/student-codes', async (req, res) => {
  try {
    const { studentId, username, password, status, expiryDate, maxSessions } = req.body;
    
    if (!studentId || !username || !password) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const codeData = {
      studentId,
      username,
      password,
      status: status || 'active',
      createdDate: new Date().toISOString().split('T')[0],
      expiryDate,
      maxSessions: maxSessions || 5,
      currentSessions: 0
    };
    
    const codeId = await createStudentCode(codeData);
    res.json({ success: true, id: codeId, message: 'Student code created successfully' });
  } catch (error) {
    console.error('Error creating student code:', error);
    res.status(500).json({ error: 'Error creating student code' });
  }
});

// Update student code
app.put('/api/student-codes/:id', async (req, res) => {
  try {
    const success = await updateStudentCode(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Student code not found' });
    }
    res.json({ success: true, message: 'Student code updated successfully' });
  } catch (error) {
    console.error('Error updating student code:', error);
    res.status(500).json({ error: 'Error updating student code' });
  }
});

// Delete student code
app.delete('/api/student-codes/:id', async (req, res) => {
  try {
    const success = await deleteStudentCode(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Student code not found' });
    }
    res.json({ success: true, message: 'Student code deleted successfully' });
  } catch (error) {
    console.error('Error deleting student code:', error);
    res.status(500).json({ error: 'Error deleting student code' });
  }
});

// Create bulk student codes
app.post('/api/student-codes/bulk', async (req, res) => {
  try {
    const { studentClass, expiryDate, maxSessions } = req.body;
    
    if (!studentClass) {
      return res.status(400).json({ error: 'Student class is required' });
    }
    
    const createdCodes = await createBulkStudentCodes(studentClass, expiryDate, maxSessions || 5);
    
    res.json({ 
      success: true, 
      message: `Created ${createdCodes.length} student codes successfully`,
      codes: createdCodes 
    });
  } catch (error) {
    console.error('Error creating bulk student codes:', error);
    res.status(500).json({ error: 'Error creating bulk student codes' });
  }
});

// Reset student code password
app.post('/api/student-codes/:id/reset', async (req, res) => {
  try {
    const newPassword = `Reset${Date.now().toString().slice(-4)}!`;
    const success = await updateStudentCode(req.params.id, { 
      password: newPassword,
      currentSessions: 0,
      status: 'active'
    });
    
    if (!success) {
      return res.status(404).json({ error: 'Student code not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      newPassword: newPassword 
    });
  } catch (error) {
    console.error('Error resetting student code password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// ==================== PASSWORD MANAGEMENT ENDPOINTS ====================

// API για να πάρει ο μαθητής τα στοιχεία του
app.get('/api/student/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(` Αναζήτηση προφίλ για χρήστη: ${username}`);
    
    // Παίρνουμε τα βασικά στοιχεία του μαθητή
    const student = await getStudentByUsername(username);
    console.log(` Στοιχεία μαθητή:`, student);
    
    if (!student) {
      console.log(` Μαθητής ${username} δεν βρέθηκε`);
      return res.status(404).json({ error: 'Ο μαθητής δεν βρέθηκε' });
    }
    
    console.log(` Αναζήτηση μαθημάτων για μαθητή ID: ${student.id}`);
    // Παίρνουμε τις εγγραφές του μαθητή σε μαθήματα
    const enrollments = await getEnrollmentsByStudent(student.id);
    console.log(` Μαθήματα:`, enrollments);
    
    // Συνδυάζουμε τα δεδομένα
    const studentProfile = {
      ...student,
      enrollments: enrollments
    };
    
    console.log(` Επιστροφή προφίλ μαθητή: ${username}`);
    res.json(studentProfile);
  } catch (error) {
    console.error(' Error fetching student profile:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη λήψη στοιχείων μαθητή' });
  }
});

// Endpoint για να πάρει ο admin όλους τους κωδικούς
app.get('/api/users/passwords', async (req, res) => {
  try {
    const usersWithPasswords = await getAllUsersWithPasswords();
    res.json(usersWithPasswords);
  } catch (error) {
    console.error('Error fetching users with passwords:', error);
    res.status(500).json({ error: 'Error fetching user passwords' });
  }
});

// Endpoint για ενημέρωση κωδικού χρήστη
app.put('/api/users/:username/password', async (req, res) => {
  try {
    const { username } = req.params;
    const { newPassword, userType } = req.body;
    
    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ error: 'Ο κωδικός πρέπει να έχει τουλάχιστον 3 χαρακτήρες' });
    }
    
    const result = await updateUserPassword(username, newPassword, userType);
    res.json(result);
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ error: 'Error updating password' });
  }
});

// ==================== LOGIN ENDPOINT ====================

const JWT_SECRET = 'math_steki_jwt_secret'; // άλλαξέ το σε κάτι πιο ασφαλές

// Νέο endpoint για login με JWT
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Συμπληρώστε όλα τα πεδία!" });
    }
    const user = await getUserByUsername(username);
    if (!user) {
      console.log(`[LOGIN] User not found: ${username}`);
      return res.status(401).json({ error: "Λάθος στοιχεία!" });
    }
    console.log(`[LOGIN] Found user:`, user);
    if (!user.password_hash) {
      console.log(`[LOGIN] No password_hash for user: ${username}`);
      return res.status(401).json({ error: "Λάθος στοιχεία!" });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`[LOGIN] bcrypt.compare result:`, isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: "Λάθος στοιχεία!" });
    }
    // Δημιουργία JWT token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware για έλεγχο JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Παράδειγμα προστατευμένου endpoint
app.get('/api/student/profile/me', authenticateJWT, async (req, res) => {
  try {
    const student = await getStudentByUsername(req.user.username);
    if (!student) {
      return res.status(404).json({ error: 'Ο μαθητής δεν βρέθηκε' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Σφάλμα ανάκτησης προφίλ' });
  }
});

// ==================== ANNOUNCEMENTS ENDPOINTS ====================

// Test endpoint to check if API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Get all announcements
app.get('/announcements', async (req, res) => {
  try {
    console.log(' GET /announcements called');
    const announcements = await getAnnouncements();
    console.log(' Found announcements:', announcements.length);
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Error fetching announcements' });
  }
});

// Create new announcement
app.post('/api/announcements', async (req, res) => {
  try {
    console.log(' POST /api/announcements called with body:', req.body);
    const { title, content } = req.body;
    
    if (!title || !content) {
      console.log(' Missing title or content');
      return res.status(400).json({ error: 'Title and content are required' });
    }

    console.log(' Creating announcement:', { title, content });
    const announcementId = await createAnnouncement(title, content, 1); // admin_id = 1
    console.log(' Created announcement with ID:', announcementId);
    
    res.status(201).json({ 
      id: announcementId, 
      message: 'Announcement created successfully' 
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Error creating announcement' });
  }
});

// Update announcement
app.put('/api/announcements/:id', async (req, res) => {
  try {
    console.log('📡 PUT /api/announcements/:id called with params:', req.params, 'body:', req.body);
    const { id } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    await updateAnnouncement(id, title, content);
    res.json({ message: 'Announcement updated successfully' });
  } catch (err) {
    console.error('Error updating announcement:', err);
    res.status(500).json({ error: 'Error updating announcement' });
  }
});

// Delete announcement
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    console.log('📡 DELETE /api/announcements/:id called with ID:', req.params.id);
    const { id } = req.params;
    
    // First check if announcement exists
    const existing = await pool.query(
      'SELECT notification_id FROM Notifications WHERE notification_id = $1',
      [id]
    );
    console.log(' Existing announcement check:', existing.rows);
    if (existing.rows.length === 0) {
      console.log(' Announcement not found in database');
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    // Delete the announcement
    const result = await pool.query(
      'DELETE FROM Notifications WHERE notification_id = $1',
      [id]
    );
    
    console.log(` Deleted announcement ${id}, affected rows:`, result[0].affectedRows);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Announcement not found or already deleted' });
    }
    res.json({ 
      message: 'Announcement deleted successfully',
      deletedId: id,
      affectedRows: result.rowCount
    });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    if (err && err.stack) {
      console.error('Stack trace:', err.stack);
    }
    res.status(500).json({ error: 'Error deleting announcement', details: err && err.message ? err.message : err });
  }
});


// app.js
app.get('/api/dimotiko-program', async (req, res) => {
  try {
    const result = await pool.query("SELECT subject, hour FROM programms WHERE type = 'dimotiko'");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dimotiko program:', err);
    res.status(500).json({ error: 'Error fetching dimotiko program' });
  }
});



// ==================== FOOTER LINKS ENDPOINT ====================

app.get('/footer-links', async (req, res) => {
  try {
    // For now, return empty object or default footer links
    // You can extend this to read from a database or file if needed
    const footerLinks = {
      'home-link': 'Αρχική',
      'about-link': 'Σχετικά',
      'contact-link': 'Επικοινωνία',
      'privacy-link': 'Πολιτική Απορρήτου'
    };
    res.json(footerLinks);
  } catch (err) {
    console.error('Error fetching footer links:', err);
    res.status(500).json({ error: 'Error fetching footer links' });
  }
});

// Save edited footer links
app.post('/save-edit', async (req, res) => {
  try {
    const { id, content } = req.body;
    // For now, just acknowledge the save
    // You can extend this to save to database or file if needed
    console.log(`Saving footer link ${id}: ${content}`);
    res.json({ success: true, message: 'Footer link saved successfully' });
  } catch (err) {
    console.error('Error saving footer link:', err);
    res.status(500).json({ error: 'Error saving footer link' });
  }
});

// =================== SCHOOLS DATA API (CSV MANAGEMENT) ===================

// API endpoint to get schools data
app.get('/api/schools-data', async (req, res) => {
  try {
    console.log('API: Getting schools data from database...');
    
    // Get data from database first (preferred)
    const schoolsData = await getSchoolsDataForCalculator();
    
    if (schoolsData && schoolsData.length > 0) {
      console.log(`API: Returning ${schoolsData.length} schools from database`);
      res.json(schoolsData);
      return;
    }
    
    // Fallback to file if database is empty
    if (fs.existsSync(SCHOOLS_DATA_FILE)) {
      console.log('API: Database empty, falling back to file...');
      const data = await fsPromises.readFile(SCHOOLS_DATA_FILE, 'utf8');
      const fileData = JSON.parse(data);
      res.json(fileData);
    } else {
      console.log('API: No data in database or file, returning empty array');
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading schools data:', error);
    res.status(500).json({ error: 'Failed to load schools data' });
  }
});

// API endpoint to upload/save schools CSV data
app.post('/api/upload-schools-csv', async (req, res) => {
  try {
    const schoolsData = req.body;
    
    // Validate data structure
    if (!Array.isArray(schoolsData)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }
    
    // Function to determine field based on school name
    function determineField(schoolName) {
      const name = schoolName.toLowerCase();
      
      // Θετικές επιστήμες
      if (name.includes('ιατρικ') || name.includes('οδοντιατρικ') || 
          name.includes('φαρμακευτικ') || name.includes('μαθηματικ') || 
          name.includes('φυσικ') || name.includes('χημεί') || 
          name.includes('βιολογί') || name.includes('γεωλογί')) {
        return 'thetiko';
      }
      
      // Τεχνολογικές
      if (name.includes('πολυτεχνείο') || name.includes('μηχανολογ') || 
          name.includes('πληροφορικ') || name.includes('ηλεκτρολογ') || 
          name.includes('αρχιτεκτ') || name.includes('πολιτικ') ||
          name.includes('τεχνολογ')) {
        return 'technologiko';
      }
      
      // Οικονομικές
      if (name.includes('οικονομικ') || name.includes('διοίκηση') || 
          name.includes('επιχειρήσ') || name.includes('λογιστικ') || 
          name.includes('μάρκετινγκ') || name.includes('χρηματοοικονομικ')) {
        return 'oikonomiko';
      }
      
      // Θεωρητικές
      if (name.includes('νομικ') || name.includes('φιλοσοφ') || 
          name.includes('ιστορί') || name.includes('αρχαιολογ') || 
          name.includes('γλώσσ') || name.includes('λογοτεχνί') ||
          name.includes('ψυχολογ') || name.includes('κοινωνιολογ')) {
        return 'theoretiko';
      }
      
      // ΕΠΑΛ Πληροφορική
      if ( name.includes('εφαρμοσμένη πληροφορικ') || name.includes('τει')) {
       
        return 'pliroforiki';
      }
 }
    
    // Function to determine school type
    function determineSchoolType(schoolName, university) {
      const name = schoolName.toLowerCase();
      const uni = university.toLowerCase();
      
      if (uni.includes('τει') || name.includes('εφαρμοσμένη πληροφορική')) {
        return 'TEI';
      }
      
      if (uni.includes('πανεπιστήμιο') || name.includes('πολυτεχνείο')) {
        return 'Πανεπιστήμιο';
      }
      
      return 'Άγνωστο';
    }
    
    // Επεξεργασία και εμπλουτισμός των δεδομένων σχολών
    const enhancedSchools = schoolsData.map(school => {
      const enhanced = {
        ...school,
        type: determineSchoolType(school.name, school.university),
        positionType: school.positionType || 'ΓΕΛ',
        scientificField: school.scientificField || school.field || determineField(school.name)
      };
      
      console.log('Enhanced school:', enhanced);
      return enhanced;
    });
    
    // Ensure data directory exists
    const dataDir = './public/data';
    if (!fs.existsSync(dataDir)) {
      await fsPromises.mkdir(dataDir, { recursive: true });
    }
    
    // Save to file (for backwards compatibility)
    await fsPromises.writeFile(SCHOOLS_DATA_FILE, JSON.stringify(enhancedSchools, null, 2), 'utf8');
    
    // Save to database
    console.log('About to save to database. Sample enhanced school:', enhancedSchools[0]);
    await replaceAllSchoolsData(enhancedSchools, 'admin', 'upload');
    console.log('Successfully saved to database');
    
    console.log(`Saved ${enhancedSchools.length} schools with enhanced data`);
    
    res.json({ 
      success: true, 
      message: `Successfully saved ${enhancedSchools.length} schools with enhanced data`,
      count: enhancedSchools.length,
      preview: enhancedSchools.slice(0, 3) // Show first 3 for preview
    });
  } catch (error) {
    console.error('Error saving schools data:', error);
    res.status(500).json({ error: 'Failed to save schools data: ' + error.message });
  }
});

// Debug endpoint to check database contents
app.get('/api/debug/schools-count', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM SchoolsData');
    const count = rows[0].count;
    
    if (count > 0) {
      const [sampleRows] = await pool.query('SELECT * FROM SchoolsData LIMIT 3');
      res.json({
        count: count,
        sample: sampleRows
      });
    } else {
      res.json({
        count: 0,
        message: 'No data in SchoolsData table'
      });
    }
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get schools data statistics
app.get('/api/schools-stats', async (req, res) => {
  try {
    if (fs.existsSync(SCHOOLS_DATA_FILE)) {
      const data = await fsPromises.readFile(SCHOOLS_DATA_FILE, 'utf8');
      const schoolsData = JSON.parse(data);
      
      const universities = [...new Set(schoolsData.map(s => s.university))];
      const avgMoriaRange = {
        min: Math.min(...schoolsData.map(s => s.minMoria || 0)),
        max: Math.max(...schoolsData.map(s => s.maxMoria || 0))
      };
      
      res.json({
        totalSchools: schoolsData.length,
        universities: universities.length,
        universityList: universities,
        moriaRange: avgMoriaRange,
        lastUpdated: fs.statSync(SCHOOLS_DATA_FILE).mtime
      });
    } else {
      res.json({
        totalSchools: 0,
        universities: 0,
        universityList: [],
        moriaRange: { min: 0, max: 0 },
        lastUpdated: null
      });
    }
  } catch (error) {
    console.error('Error reading schools stats:', error);
    res.status(500).json({ error: 'Failed to load schools statistics' });
  }
});

// Delete teacher
app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const success = await deleteTeacher(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Error deleting teacher' });
  }
});

//post teacher
app.post('/api/teachers', async (req, res) => {
  try {
    const teacherData = req.body;
    const result = await createTeacher(teacherData);
    res.json({ success: true, teacher: result });
  } catch (err) {
    console.error('Error creating teacher:', err);
    res.status(500).json({ error: 'Error creating teacher' });
  }
});

// ========== PHOTOS API ==========

// Get all photos
app.get('/api/photos', async (req, res) => {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    
    // Check if photos directory exists
    try {
      await fsPromises.access(photosDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fsPromises.mkdir(photosDir, { recursive: true });
      return res.json([]);
    }
    
    const files = await fsPromises.readdir(photosDir);
    
    // Filter only image files and get their details
    const imageFiles = [];
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
        try {
          const filePath = path.join(photosDir, file);
          const stats = await fsPromises.stat(filePath);
          imageFiles.push({
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        } catch (error) {
          console.error(`Error getting stats for ${file}:`, error);
          // Include file even if we can't get stats
          imageFiles.push({
            filename: file,
            size: 0,
            created: new Date(),
            modified: new Date()
          });
        }
      }
    }
    
    // Sort by creation date (newest first)
    imageFiles.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json(imageFiles);
  } catch (error) {
    console.error('Error reading photos directory:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη φόρτωση των φωτογραφιών' });
  }
});

// Upload photos
app.post('/api/photos/upload', photoUpload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Δεν επιλέχθηκαν αρχεία' });
    }

    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size
    }));

    console.log(` Uploaded ${uploadedFiles.length} photos:`, uploadedFiles);

    res.json({ 
      success: true, 
      uploaded: uploadedFiles.length,
      files: uploadedFiles,
      message: `${uploadedFiles.length} φωτογραφία(ες) ανέβηκαν επιτυχώς!`
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: 'Σφάλμα κατά το ανέβασμα των φωτογραφιών' });
  }
});

// Delete photo
app.delete('/api/photos/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'public', 'photos', filename);
    
    // Check if file exists
    try {
      await fsPromises.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Η φωτογραφία δεν βρέθηκε' });
    }
    
    // Delete the file
    await fsPromises.unlink(filePath);
    
    console.log(` Deleted photo: ${filename}`);
    res.json({ success: true, message: 'Η φωτογραφία διαγράφηκε επιτυχώς' });
  } catch (error) {
    console.error('Σφάλμα διαγραφής φωτογραφίας:', error);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή της φωτογραφίας' });
  }
});

// ========== CALCULATOR EXCEL TEMPLATES API ==========

// Upload Excel Template for Calculator
app.post('/api/upload-calculator-template', templateUpload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Δεν βρέθηκε αρχείο template' });
    }
    
    const { templateType } = req.body;
    if (!templateType) {
      return res.status(400).json({ error: 'Απαιτείται το πεδίο templateType' });
    }
    
    // Διάβασμα του αρχείου σε buffer
    const fileData = await fsPromises.readFile(req.file.path);
    
    // Δημιουργία δεδομένων για αποθήκευση στη βάση
    const templateData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      templateType: templateType,
      fileData: fileData,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      createdBy: 'admin'
    };
    
    // Αποθήκευση στη βάση δεδομένων
    const templateId = await saveCalculatorTemplate(templateData);
    
    // Διαγραφή του προσωρινού αρχείου
    try {
      await fsPromises.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Warning: Could not delete temporary file:', unlinkError.message);
    }
    
    console.log(` Uploaded calculator template: ${req.file.filename} (${templateType}) with ID: ${templateId}`);
    
    res.json({
      success: true,
      message: 'Template ανέβηκε επιτυχώς και αποθηκεύτηκε στη βάση δεδομένων!',
      templateInfo: {
        id: templateId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        templateType: templateType,
        uploadDate: new Date().toISOString(),
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
    
  } catch (error) {
    // Διαγραφή του προσωρινού αρχείου σε περίπτωση σφάλματος
    if (req.file && req.file.path) {
      try {
        await fsPromises.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('Warning: Could not delete temporary file after error:', unlinkError.message);
      }
    }
    
    console.error('Error uploading calculator template:', error);
    res.status(500).json({ error: 'Σφάλμα ανεβάσματος template: ' + error.message });
  }
});

// Get all Calculator Templates
app.get('/api/calculator-templates', async (req, res) => {
  try {
    const templates = await getAllCalculatorTemplates();
    
    // Μετατροπή της ημερομηνίας σε ISO string για συμβατότητα με το frontend
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      fileName: template.filename,
      originalName: template.original_name,
      templateType: template.template_type,
      uploadDate: template.upload_date.toISOString(),
      size: template.file_size,
      mimetype: template.mimetype,
      createdBy: template.created_by
    }));
    
    res.json(formattedTemplates);
  } catch (error) {
    console.error('Error getting calculator templates:', error);
    res.status(500).json({ error: 'Σφάλμα φόρτωσης templates: ' + error.message });
  }
});

// Get specific Calculator Template
app.get('/api/calculator-templates/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Λήψη template από τη βάση δεδομένων
    const template = await getCalculatorTemplate(fileName);
    
    if (!template) {
      return res.status(404).json({ error: 'Template δεν βρέθηκε' });
    }
    
    // Set appropriate headers
    res.set({
      'Content-Type': template.mimetype,
      'Content-Disposition': `attachment; filename="${template.original_name}"`
    });
    
    // Αποστολή των δεδομένων του αρχείου
    res.send(template.file_data);
    
  } catch (error) {
    console.error('Error getting calculator template:', error);
    res.status(500).json({ error: 'Σφάλμα φόρτωσης template: ' + error.message });
  }
});

// Delete Calculator Template
app.delete('/api/calculator-templates/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    // Διαγραφή template από τη βάση δεδομένων
    const deleted = await deleteCalculatorTemplate(fileName);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Template δεν βρέθηκε' });
    }
    
    console.log(` Deleted calculator template: ${fileName}`);
    
    res.json({
      success: true,
      message: 'Template διαγράφηκε επιτυχώς!'
    });
  } catch (error) {
    console.error('Error deleting calculator template:', error);
    res.status(500).json({ error: 'Σφάλμα φόρτωσης στατιστικών templates: ' + error.message });
  }
});

// Get Calculator Templates Statistics
app.get('/api/calculator-templates-stats', async (req, res) => {
  try {
    const stats = await getCalculatorTemplatesStats();
    
    // Μετατροπή των στατιστικών σε μορφή συμβατή με το frontend
    const templateTypes = {};
    stats.typeStats.forEach(stat => {
      templateTypes[stat.template_type] = stat.count;
    });
    
    res.json({
      totalTemplates: stats.totalCount,
      templateTypes: templateTypes,
      totalSize: stats.totalSize,
      lastUpdated: stats.lastUpload ? stats.lastUpload.upload_date : null
    });
    
  } catch (error) {
    console.error('Error getting calculator templates stats:', error);
    res.status(500).json({ error: 'Σφάλμα φόρτωσης στατιστικών templates: ' + error.message });
  }
});

// Create Sample Calculator Templates
app.post('/api/create-sample-templates', async (req, res) => {
  try {
    // Ensure templates directory exists
    if (!fs.existsSync(TEMPLATES_DIR)) {
      await fsPromises.mkdir(TEMPLATES_DIR, { recursive: true });
    }
    
    const sampleTemplates = [
      {
        name: 'sample-calculation-template.xlsx',
        type: 'calculation-template',
        description: 'Sample calculation template with formulas'
      },
      {
        name: 'sample-results-template.xlsx', 
        type: 'results-template',
        description: 'Sample results display template'
      },
      {
        name: 'sample-statistics-template.xlsx',
        type: 'statistics-template', 
        description: 'Sample statistics report template'
      }
    ];
    
    const createdTemplates = [];
    
    for (const template of sampleTemplates) {
      const templatePath = path.join(TEMPLATES_DIR, template.name);
      
      if (!fs.existsSync(templatePath)) {
        // Create basic Excel file with sample structure
        const sampleData = [
          ['Sample Template: ' + template.type, '', '', ''],
          ['', '', '', ''],
          ['Template Type:', template.type, '', ''],
          ['Description:', template.description, '', ''],
          ['', '', '', ''],
          ['Sample Data:', '', '', ''],
          ['Field 1', 'Field 2', 'Field 3', 'Field 4'],
          ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
          ['', '', '', ''],
          ['This is a sample template.', '', '', ''],
          ['Replace with your actual template content.', '', '', '']
        ];
        
        // Create a simple Excel file (this would need actual Excel generation library)
        // For now, we'll create a placeholder
        await fsPromises.writeFile(templatePath, 'Sample Excel Template Content');
        
        // Create metadata
        const templateInfo = {
          fileName: template.name,
          originalName: template.name,
          templateType: template.type,
          uploadDate: new Date().toISOString(),
          size: 1024, // placeholder size
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          isSample: true
        };
        
        const metadataFile = path.join(TEMPLATES_DIR, template.name + '.meta.json');
        await fsPromises.writeFile(metadataFile, JSON.stringify(templateInfo, null, 2));
        
        createdTemplates.push(templateInfo);
      }
    }
    
    res.json({
      success: true,
      message: `Δημιουργήθηκαν ${createdTemplates.length} sample templates`,
      templates: createdTemplates
    });
    
  } catch (error) {
    console.error('Error creating sample templates:', error);
    res.status(500).json({ error: 'Σφάλμα δημιουργίας sample templates' });
  }
});

// ========== END CALCULATOR TEMPLATES API ==========

app.get('/api/student/session', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Δεν υπάρχει συνδεδεμένος χρήστης.' });
  }
});

// Endpoint για επιστροφή όλων των τμημάτων
app.get('/api/classes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT class_id, class_name FROM Classes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching classes' });
  }
});

// Endpoint για ανάρτηση γεγονότος σε όλους τους μαθητές ενός μαθήματος
app.post('/api/calendar/event', async (req, res) => {
  try {
    const { subjectId, eventType, eventDate, eventTime, eventTitle, eventText } = req.body;
    if (!subjectId || !eventType || !eventDate || !eventTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Βρες όλους τους μαθητές που είναι εγγεγραμμένοι στο τμήμα
    const enrollments = await getEnrollmentsBySubject(subjectId);
    const studentIds = enrollments.map(e => e.student_id);
    for (const studentId of studentIds) {
      await addCalendarEventForStudent(studentId, subjectId, eventTitle, eventType, eventDate, eventTime, eventText);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Σφάλμα ανάρτησης γεγονότος:', err);
    res.status(500).json({ error: 'Σφάλμα ανάρτησης γεγονότος' });
  }
});

// Επιστροφή όλων των γεγονότων ημερολογίου για έναν μαθητή
app.get('/api/calendar/events/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Βρίσκουμε όλα τα subjectId (ή classId) στα οποία είναι εγγεγραμμένος ο μαθητής
    const [enrollments] = await pool.query(
      `SELECT class_id FROM Enrollments WHERE student_id = ?`,
      [studentId]
    );
    const classIds = enrollments.map(e => e.class_id);
    if (classIds.length === 0) {
      return res.json([]); // Ο μαθητής δεν έχει εγγραφές
    }
    // Επιστρέφουμε όλα τα γεγονότα που αφορούν αυτά τα μαθήματα/τμήματα
    // Διορθώνουμε το IN (?) ώστε να λειτουργεί σωστά με array
    const placeholders = classIds.map(() => '?').join(',');
    const [events] = await pool.query(
      `SELECT * FROM CalendarEvents WHERE subject_id IN (${placeholders}) ORDER BY event_date DESC, event_time DESC`,
      classIds
    );
    res.json(events);
  } catch (err) {
    console.error('Σφάλμα ανάκτησης γεγονότων:', err);
    res.status(500).json({ error: 'Σφάλμα ανάκτησης γεγονότων' });
  }
});

// Επιστροφή enrollments με subject_name για έναν μαθητή
app.get('/api/student/enrollments/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Υποθέτουμε ότι το subject_name είναι στον πίνακα Classes και το Enrollments έχει class_id
    const [rows] = await pool.query(
      `SELECT e.enrollment_id, e.student_id, e.class_id, c.class_name, c.course_id, c.teacher_id
      FROM Enrollments e
      JOIN Classes c ON e.class_id = c.class_id
      WHERE e.student_id = ?`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Σφάλμα ανάκτησης enrollments:', err);
    res.status(500).json({ error: 'Σφάλμα ανάκτησης enrollments' });
  }
});

// GET /api/teachers - επιστρέφει όλους τους καθηγητές
app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await getTeachers();
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Νέος πίνακας για προγράμματα
app.post('/api/programms', async (req, res) => {
  try {
    // Αν δεν υπάρχει section, ορίζουμε section ανάλογα με τον type
    let { section, subject, hour, type, field } = req.body;
    if (!section) {
      if (type === 'dimotiko') section = 'Δημοτικό';
      else if (type === 'gymnasio') section = 'Γυμνάσιο';
      else if (type === 'lykeio') section = 'Λύκειο - ΓΕΛ';
      else if (type === 'epal') section = 'Λύκειο - ΕΠΑΛ';
    }
    if (!section || !subject || !hour) {
      return res.status(400).json({ error: 'Συμπληρώστε όλα τα πεδία' });
    }
    // Αποθήκευση στη βάση
    const result = await pool.query(
      'INSERT INTO programms (section, subject, hour, type, field) VALUES ($1, $2, $3, $4, $5)',
      [section, subject, hour, type, field || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Σφάλμα αποθήκευσης προγράμματος:', error);
    res.status(500).json({ error: 'Σφάλμα αποθήκευσης' });
  }
});

// Επιστροφή όλων των προγραμμάτων
app.get('/api/programms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM programms');
    res.json(result.rows);
  } catch (error) {
    console.error('Σφάλμα λήψης προγραμμάτων:', error);
    res.status(500).json({ error: 'Σφάλμα λήψης προγραμμάτων' });
  }
});

// Ενημέρωση προγράμματος
app.put('/api/programms/:id', async (req, res) => {
  try {
    const { section, subject, hour, type, field } = req.body;
    const { id } = req.params;
    if (!section || !subject || !hour) {
      return res.status(400).json({ error: 'Συμπληρώστε όλα τα πεδία' });
    }
    const result = await pool.query(
      'UPDATE programms SET section=$1, subject=$2, hour=$3, type=$4, field=$5 WHERE id=$6',
      [section, subject, hour, type, field || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Σφάλμα ενημέρωσης προγράμματος:', error);
    res.status(500).json({ error: 'Σφάλμα ενημέρωσης' });
  }
});

// Διαγραφή προγράμματος
app.delete('/api/programms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM programms WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Σφάλμα διαγραφής προγράμματος:', error);
    res.status(500).json({ error: 'Σφάλμα διαγραφής' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

