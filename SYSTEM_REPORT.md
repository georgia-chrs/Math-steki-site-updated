# 📊 ΠΛΗΡΗΣ ΑΝΑΦΟΡΑ ΣΥΣΤΗΜΑΤΟΣ MATH-STEKI

## 📝 Περιγραφή Συστήματος
Το **Math-Steki** είναι ένα ολοκληρωμένο σύστημα διαχείρισης μαθητικού φροντιστηριου που αναπτύχθηκε με Node.js, Express.js και MySQL. Το σύστημα υποστηρίζει τρεις κύριους ρόλους χρηστών: **Admin**, **Μαθητές** και **Καθηγητές**.

---

## 🔐 ΣΥΣΤΗΜΑ ΑΥΘΕΝΤΙΚΟΠΟΙΗΣΗΣ

### Είσοδος στο Σύστημα
- ✅ **Login Endpoint**: `/login` (POST)
- ✅ **Υποστήριξη bcrypt** για κρυπτογράφηση κωδικών
- ✅ **Διαχείριση Session** με localStorage/sessionStorage
- ✅ **Επαλήθευση χρηστών** από βάση δεδομένων

### Ρόλοι Χρηστών
- 🔹 **Admin**: Πλήρη διαχείριση συστήματος
- 🔹 **Student**: Πρόσβαση σε προσωπικά δεδομένα και μαθήματα
- 🔹 **Teacher**: Διαχείριση μαθημάτων (μερικώς υλοποιημένο)

---

## 👨‍💼 ΔΙΑΧΕΙΡΙΣΤΙΚΕΣ ΛΕΙΤΟΥΡΓΙΕΣ (ADMIN)

### 👥 Διαχείριση Μαθητών
#### Λειτουργίες:
- ✅ **Προσθήκη νέου μαθητή** (`POST /api/students`)
- ✅ **Επεξεργασία στοιχείων μαθητή** (`PUT /api/students/:id`)
- ✅ **Διαγραφή μαθητή** (`DELETE /api/students/:id`)
- ✅ **Αναζήτηση μαθητών** (`GET /api/students?search=...`)
- ✅ **Φιλτράρισμα ανά τάξη** (`GET /api/students?studentClass=...`)
- ✅ **Προβολή λεπτομερειών μαθητή**

#### Πεδία Μαθητή:
- 📝 Προσωπικά στοιχεία (όνομα, επώνυμο, πατρώνυμο)
- 📞 Στοιχεία επικοινωνίας (τηλέφωνο, email, διεύθυνση)
- 👨‍👩‍👧‍👦 Στοιχεία γονέων (όνομα, τηλέφωνο)
- 🎓 Εκπαιδευτικά στοιχεία (τάξη, ημερομηνία εγγραφής)
- 🔐 Στοιχεία σύνδεσης (username, password)
- 📝 Σημειώσεις και κατάσταση

### 👨‍🏫 Διαχείριση Καθηγητών
#### Λειτουργίες:
- ✅ **Προσθήκη νέου καθηγητή** (`POST /api/teachers`)
- ✅ **Επεξεργασία στοιχείων καθηγητή** (`PUT /api/teachers/:id`)
- ✅ **Διαγραφή καθηγητή** (`DELETE /api/teachers/:id`)
- ✅ **Αναζήτηση καθηγητών** (`GET /api/teachers?search=...`)
- ✅ **Ανάθεση μαθημάτων σε καθηγητές**

#### Πεδία Καθηγητή:
- 👤 Προσωπικά στοιχεία (όνομα)
- 📚 Ειδικότητα/Μάθημα
- 📞 Στοιχεία επικοινωνίας (τηλέφωνο, email)

### 📚 Διαχείριση Μαθημάτων/Τμημάτων
#### Λειτουργίες:
- ✅ **Δημιουργία νέου μαθήματος** (`POST /api/subjects`)
- ✅ **Επεξεργασία μαθήματος** (`PUT /api/subjects/:id`)
- ✅ **Διαγραφή μαθήματος** (`DELETE /api/subjects/:id`)
- ✅ **Ανάθεση καθηγητή σε μάθημα**
- ✅ **Προβολή όλων των μαθημάτων** (`GET /api/subjects`)

#### Πεδία Μαθήματος:
- 📖 Όνομα μαθήματος
- 🔢 Κωδικός μαθήματος
- 🎓 Τάξη
- 👨‍🏫 Καθηγητής

### 📝 Διαχείριση Εγγραφών
#### Λειτουργίες:
- ✅ **Εγγραφή μαθητή σε μάθημα** (`POST /api/enrollments`)
- ✅ **Κατάργηση εγγραφής** (`DELETE /api/enrollments/:id`)
- ✅ **Προβολή εγγραφών ανά μαθητή** (`GET /api/enrollments?studentId=...`)
- ✅ **Προβολή εγγραφών ανά μάθημα** (`GET /api/enrollments?subjectId=...`)
- ✅ **Αναζήτηση εγγραφών** (`GET /api/enrollments?search=...`)

### 🔢 Διαχείριση Βαθμολογιών
#### Λειτουργίες:
- ✅ **Καταχώρηση βαθμού** (`POST /api/grades`)
- ✅ **Επεξεργασία βαθμού** (`PUT /api/grades/:id`)
- ✅ **Διαγραφή βαθμού** (`DELETE /api/grades/:id`)
- ✅ **Προβολή βαθμών μαθητή** (`GET /api/grades/:studentId`)

#### Πεδία Βαθμού:
- 👤 Μαθητής
- 📚 Μάθημα
- 🔢 Βαθμός
- 📋 Τύπος εξέτασης (διαγώνισμα, τεστ, κ.λπ.)
- 📅 Ημερομηνία
- 📝 Σχόλια

### 📈 Διαχείριση Προόδου
#### Λειτουργίες:
- ✅ **Καταχώρηση σημείωσης προόδου** (`POST /api/progress`)
- ✅ **Επεξεργασία σημείωσης** (`PUT /api/progress/:id`)
- ✅ **Διαγραφή σημείωσης** (`DELETE /api/progress/:id`)
- ✅ **Προβολή προόδου μαθητή** (`GET /api/progress/:studentId`)

### 📅 Διαχείριση Ημερολογίου
#### Λειτουργίες:
- ✅ **Προσθήκη εκδήλωσης** (`POST /api/calendar`)
- ✅ **Επεξεργασία εκδήλωσης** (`PUT /api/calendar/:id`)
- ✅ **Διαγραφή εκδήλωσης** (`DELETE /api/calendar/:id`)
- ✅ **Προβολή ημερολογίου μαθητή** (`GET /api/calendar/:studentId`)

### 🔐 Διαχείριση Κωδικών Πρόσβασης
#### Λειτουργίες:
- ✅ **Προβολή όλων των κωδικών** (`GET /api/users/passwords`)
- ✅ **Αλλαγή κωδικού χρήστη** (`PUT /api/users/:username/password`)
- ✅ **Δημιουργία κωδικών μαθητών** (`POST /api/student-codes`)
- ✅ **Μαζική δημιουργία κωδικών** (`POST /api/student-codes/bulk`)
- ✅ **Επαναφορά κωδικού** (`POST /api/student-codes/:id/reset`)

---

## 📚 ΕΚΠΑΙΔΕΥΤΙΚΟ ΥΛΙΚΟ

### 📄 Παλιά Θέματα (PDF)
#### Λειτουργίες:
- ✅ **Μεταφόρτωση αρχείων** (`POST /api/pallia-themata`)
- ✅ **Κατηγοριοποίηση** (Λύκειο, Μάθημα, Έτος)
- ✅ **Αναζήτηση και φιλτράρισμα** (`GET /api/pallia-themata?lykeio=...&subject=...&year=...`)
- ✅ **Προβολή και κατέβασμα** (`GET /api/pallia-themata/:id/download`)
- ✅ **Διαγραφή αρχείων** (`DELETE /api/pallia-themata/:id`)

### 🏫 Βάσεις Σχολών
#### Λειτουργίες:
- ✅ **Μεταφόρτωση βάσεων** (`POST /api/vaseis-scholon`)
- ✅ **Κατηγοριοποίηση** (Λύκειο, Έτος, Κατεύθυνση)
- ✅ **Φιλτράρισμα και αναζήτηση** (`GET /api/vaseis-scholon`)
- ✅ **Προβολή και κατέβασμα** (`GET /api/vaseis-scholon/:id/download`)
- ✅ **Διαχείριση αρχείων** (επεξεργασία, διαγραφή)

### 📊 Μηχανογραφικό
#### Λειτουργίες:
- ✅ **Μεταφόρτωση αρχείων** (`POST /api/mixanografiko`)
- ✅ **Κατηγοριοποίηση** (Λύκειο, Τομέας, Ειδικότητα)
- ✅ **Φιλτράρισμα** (`GET /api/mixanografiko?lykeio=...&field=...&specialty=...`)
- ✅ **Διαχείριση αρχείων** (προβολή, κατέβασμα, διαγραφή)

---

## 🎯 ΥΠΟΛΟΓΙΣΤΗΣ ΜΟΡΙΩΝ

### Λειτουργίες:
- ✅ **Φόρτωση δεδομένων σχολών** (`GET /api/schools-data`)
- ✅ **Μεταφόρτωση CSV** (`POST /api/upload-schools-csv`)
- ✅ **Στατιστικά σχολών** (`GET /api/schools-stats`)
- ✅ **Καθαρισμός δεδομένων** (`DELETE /api/schools-data`)
- ✅ **Αποθήκευση υπολογισμών**

### Πρότυπα Excel:
- ✅ **Μεταφόρτωση προτύπων** (`POST /api/upload-calculator-template`)
- ✅ **Διαχείριση προτύπων** (`GET /api/calculator-templates`)
- ✅ **Δημιουργία δειγμάτων** (`POST /api/create-sample-templates`)

---

## 📷 ΔΙΑΧΕΙΡΙΣΗ ΦΩΤΟΓΡΑΦΙΩΝ

### Λειτουργίες:
- ✅ **Μεταφόρτωση φωτογραφιών** (`POST /api/photos/upload`)
- ✅ **Προβολή όλων των φωτογραφιών** (`GET /api/photos`)
- ✅ **Διαγραφή φωτογραφιών** (`DELETE /api/photos/:filename`)
- ✅ **Οργάνωση σε γκαλερί**

---

## 👨‍🎓 ΛΕΙΤΟΥΡΓΙΕΣ ΜΑΘΗΤΩΝ

### Προφίλ Μαθητή:
- ✅ **Πρόσβαση σε προσωπικά στοιχεία** (`GET /api/student/profile/:username`)
- ✅ **Προβολή εγγραφών σε μαθήματα**
- ✅ **Ιστορικό βαθμολογιών** (`GET /api/grades/:studentId`)
- ✅ **Σημειώσεις προόδου** (`GET /api/progress/:studentId`)

### Ημερολόγιο & Εκδηλώσεις:
- ✅ **Προσωπικό ημερολόγιο** (`GET /api/calendar/:studentId`)
- ✅ **Προβολή ανακοινώσεων** (`GET /announcements`)
- ✅ **Φιλτράρισμα εκδηλώσεων**

### Πρόσβαση σε Υλικό:
- ✅ **Παλιά θέματα των μαθημάτων τους**
- ✅ **Βάσεις σχολών**
- ✅ **Υπολογιστής μορίων**

---

## 📢 ΣΥΣΤΗΜΑ ΑΝΑΚΟΙΝΩΣΕΩΝ

### Λειτουργίες:
- ✅ **Δημιουργία ανακοινώσεων** (admin)
- ✅ **Προβολή ανακοινώσεων** (`GET /announcements`)
- ✅ **Φιλτράρισμα ανά μαθητή**
- ✅ **Διαχείριση προτεραιότητας**
- ✅ **Ημερομηνίες λήξης**

---

## 🗄️ ΒΑΣΗ ΔΕΔΟΜΕΝΩΝ

### Πίνακες:
- 👥 **Students**: Στοιχεία μαθητών
- 👨‍🏫 **Teachers**: Στοιχεία καθηγητών  
- 📚 **Subjects**: Μαθήματα/Τμήματα
- 📝 **Enrollments**: Εγγραφές μαθητών σε μαθήματα
- 🔢 **Grades**: Βαθμολογίες
- 📈 **ProgressNotes**: Σημειώσεις προόδου
- 📅 **CalendarEntries**: Εκδηλώσεις ημερολογίου
- 📢 **Announcements**: Ανακοινώσεις
- 🔐 **Admins**: Διαχειριστές
- 🔐 **StudentCodes**: Κωδικοί πρόσβασης μαθητών
- 📄 **PalliaThemata**: Παλιά θέματα
- 🏫 **VaseisScholon**: Βάσεις σχολών
- 📊 **Mixanografiko**: Μηχανογραφικό
- 🎯 **SchoolsData**: Δεδομένα υπολογιστή μορίων

---

## 🔧 ΤΕΧΝΙΚΕΣ ΛΕΠΤΟΜΕΡΕΙΕΣ

### Τεχνολογίες:
- **Backend**: Node.js, Express.js
- **Database**: MySQL με mysql2
- **Authentication**: bcrypt για κρυπτογράφηση
- **File Upload**: Multer
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

### API Structure:
- **RESTful APIs** με JSON responses
- **Error handling** σε όλα τα endpoints
- **Input validation** και sanitization
- **File upload** με size και type validation

### Security:
- ✅ **Password hashing** με bcrypt
- ✅ **Input validation**
- ✅ **File type validation**
- ✅ **SQL injection protection** (parameterized queries)

---

## 📊 ΣΤΑΤΙΣΤΙΚΑ ΥΛΟΠΟΙΗΣΗΣ

### API Endpoints: **~80+ endpoints**
- Students API: 15+ endpoints
- Teachers API: 10+ endpoints  
- Subjects API: 10+ endpoints
- Enrollments API: 10+ endpoints
- Grades API: 8+ endpoints
- Progress API: 8+ endpoints
- Calendar API: 8+ endpoints
- PDF Management: 15+ endpoints
- Photos API: 5+ endpoints
- Authentication: 5+ endpoints

### Σελίδες Frontend: **~15 σελίδες**
- Admin Dashboard: 8 σελίδες
- Student Interface: 4 σελίδες
- Authentication: 2 σελίδες
- Landing Page: 1 σελίδα

---

## ✅ ΟΛΟΚΛΗΡΩΜΕΝΕΣ ΛΕΙΤΟΥΡΓΙΕΣ

### Πλήρως Υλοποιημένες:
- 🟢 **Διαχείριση Μαθητών** (CRUD + Search + Profile)
- 🟢 **Διαχείριση Καθηγητών** (CRUD + Assignment)
- 🟢 **Διαχείριση Μαθημάτων** (CRUD + Teacher Assignment)
- 🟢 **Σύστημα Εγγραφών** (CRUD + Validation)
- 🟢 **Βαθμολογίες** (CRUD + Analytics)
- 🟢 **Σημειώσεις Προόδου** (CRUD + Timeline)
- 🟢 **Ημερολόγιο** (CRUD + Events)
- 🟢 **Διαχείριση PDF** (Upload + Categorization + Download)
- 🟢 **Φωτογραφίες** (Upload + Gallery + Delete)
- 🟢 **Υπολογιστής Μορίων** (Data Management + Templates)
- 🟢 **Authentication System** (Login + Password Management)

### Μερικώς Υλοποιημένες:
- 🟡 **Teacher Dashboard** (βασική υλοποίηση)
- 🟡 **Advanced Analytics** (βασικά στατιστικά)
- 🟡 **Email Notifications** (δομή υπάρχει)

---

## 🎯 ΣΥΜΠΕΡΑΣΜΑ

Το σύστημα **Math-Steki** είναι ένα **ολοκληρωμένο ERP για φροντιστήριο** με:

- ✅ **Πλήρη διαχείριση μαθητών, καθηγητών και μαθημάτων**
- ✅ **Σύστημα βαθμολογιών και παρακολούθησης προόδου**
- ✅ **Διαχείριση εκπαιδευτικού υλικού (PDF, φωτογραφίες)**
- ✅ **Υπολογιστής μορίων για Πανελλήνιες**
- ✅ **Ασφαλές σύστημα αυθεντικοποίησης**
- ✅ **Modern web interface** με responsive design

Το σύστημα είναι **παραγωγικό** και μπορεί να χρησιμοποιηθεί άμεσα σε πραγματικό περιβάλλον φροντιστηρίου.
