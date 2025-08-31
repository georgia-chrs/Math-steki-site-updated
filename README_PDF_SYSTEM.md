# Οδηγίες Εγκατάστασης και Χρήσης - Σύστημα PDF (Παλιά Θέματα, Βάσεις Σχολών & Μηχανογραφικό)

## Προαπαιτούμενα

1. **Node.js** (έκδοση 16 ή νεότερη)
   - Κατεβάστε από: https://nodejs.org/
   - Εγκαταστήστε και επιβεβαιώστε με: `node --version`

2. **MySQL Database**
   - Εγκαταστήστε MySQL Server
   - Δημιουργήστε μια βάση δεδομένων για την εφαρμογή

## Εγκατάσταση

### 1. Εγκατάσταση Dependencies
```bash
npm install
```

### 2. Ρύθμιση Βάσης Δεδομένων

#### Α. Αυτοματοποιημένη Δημιουργία Πινάκων
Εκτελέστε το αρχείο `setup_database.sql` στη βάση δεδομένων σας που περιλαμβάνει όλους τους πίνακες:

```bash
mysql -u your_username -p your_database < setup_database.sql
```

Ή εκτελέστε τα SQL commands χειροκίνητα:

##### Πίνακας Παλιών Θεμάτων:
```sql
CREATE TABLE PalliaThemata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    lykeio VARCHAR(10) NOT NULL DEFAULT 'ΓΕΛ',
    subject VARCHAR(100) NOT NULL,
    year VARCHAR(4) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Θέματα',
    filename VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    file_data LONGBLOB,
    file_size VARCHAR(20),
    upload_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_lykeio CHECK (lykeio IN ('ΓΕΛ', 'ΕΠΑΛ')),
    INDEX idx_lykeio_subject_year (lykeio, subject, year),
    INDEX idx_subject (subject),
    INDEX idx_year (year)
);
```

##### Πίνακας Βάσεων Σχολών:
```sql
CREATE TABLE VaseisScholon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Τίτλος του αρχείου',
    year VARCHAR(4) NOT NULL COMMENT 'Έτος (π.χ. 2024)',
    lykeio ENUM('ΓΕΛ', 'ΕΠΑΛ') NOT NULL COMMENT 'Τύπος λυκείου',
    field VARCHAR(100) NOT NULL COMMENT 'Πεδίο σπουδών',
    description TEXT COMMENT 'Περιγραφή',
    filename VARCHAR(255) NOT NULL COMMENT 'Όνομα αρχείου',
    file_data LONGBLOB NOT NULL COMMENT 'Δεδομένα PDF αρχείου',
    file_size VARCHAR(20) COMMENT 'Μέγεθος αρχείου (π.χ. 1.2 MB)',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ημερομηνία ανεβάσματος',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'admin' COMMENT 'Χρήστης που ανέβασε το αρχείο',
    
    INDEX idx_year (year),
    INDEX idx_lykeio (lykeio),
    INDEX idx_field (field),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

##### Πίνακας Μηχανογραφικού:
```sql
CREATE TABLE Mixanografiko (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Τίτλος του αρχείου',
    lykeio ENUM('ΓΕΛ', 'ΕΠΑΛ') NOT NULL COMMENT 'Τύπος λυκείου',
    field VARCHAR(255) NOT NULL COMMENT 'Πεδίο σπουδών',
    specialty VARCHAR(255) DEFAULT '' COMMENT 'Ειδικά μαθήματα/ειδίκευση',
    description TEXT COMMENT 'Περιγραφή του αρχείου',
    filename VARCHAR(255) NOT NULL COMMENT 'Όνομα αρχείου',
    file_data LONGBLOB NOT NULL COMMENT 'Δεδομένα PDF αρχείου',
    file_size VARCHAR(50) COMMENT 'Μέγεθος αρχείου (π.χ. 1.2 MB)',
    upload_date DATE DEFAULT (CURRENT_DATE) COMMENT 'Ημερομηνία ανεβάσματος',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ημερομηνία δημιουργίας',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT DEFAULT 1 COMMENT 'ID διαχειριστή που ανέβασε το αρχείο',
    
    INDEX idx_lykeio (lykeio),
    INDEX idx_field (field),
    INDEX idx_specialty (specialty),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Β. Ρύθμιση Environment Variables
Δημιουργήστε αρχείο `.env` στο root directory:

```env
MYSQL_HOST=localhost
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DB=your_database_name
MYSQL_PORT=3306
```

### 3. Εκκίνηση Εφαρμογής

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
node app.js
```

Η εφαρμογή θα είναι διαθέσιμη στο: http://localhost:8080

## Χρήση

### Για Administrators

#### 1. Παλιά Θέματα
1. **Πρόσβαση στο Admin Panel:**
   - Πηγαίνετε στο: http://localhost:8080/admin-pallia-themata.html

2. **Ανέβασμα PDF:**
   - Συμπληρώστε τα υποχρεωτικά πεδία (Λύκειο, Μάθημα, Έτος, Τίτλος)
   - Επιλέξτε το PDF αρχείο (μέγιστο 50MB)
   - Κλικ "Προσθήκη PDF"

#### 2. Βάσεις Σχολών
1. **Πρόσβαση στο Admin Panel:**
   - Πηγαίνετε στο: http://localhost:8080/admin-vaseis-scholon.html

2. **Ανέβασμα PDF:**
   - Συμπληρώστε τα υποχρεωτικά πεδία (Έτος, Λύκειο, Πεδίο, Τίτλος)
   - Επιλέξτε το PDF αρχείο (μέγιστο 10MB)
   - Κλικ "Αποθήκευση"

#### 3. Διαχείριση Αρχείων (και για τα δύο συστήματα)
   - **Προβολή:** Κλικ στο εικονίδιο μάτι (👁️)
   - **Επεξεργασία:** Κλικ στο εικονίδιο μολύβι (✏️)
   - **Διαγραφή:** Κλικ στο εικονίδιο κάδου (🗑️)

### Για Μαθητές

#### 1. Παλιά Θέματα
1. **Πρόσβαση:**
   - Πηγαίνετε στο: http://localhost:8080/main-page/pallia-themata.html

2. **Φιλτράρισμα:**
   - Επιλέξτε Τύπο Λυκείου (ΓΕΛ/ΕΠΑΛ)
   - Επιλέξτε Έτος
   - Επιλέξτε Μάθημα (προσαρμόζεται ανά λύκειο)

#### 2. Βάσεις Σχολών
1. **Πρόσβαση:**
   - Πηγαίνετε στο: http://localhost:8080/main-page/vasis-sholon.html

2. **Φιλτράρισμα:**
   - Επιλέξτε Έτος
   - Επιλέξτε Τύπο Λυκείου (ΓΕΛ/ΕΠΑΛ)
   - Επιλέξτε Πεδίο Σπουδών

#### 3. Προβολή/Λήψη (και για τα δύο συστήματα)
   - **Προβολή:** Κλικ "👁️ Προβολή" για άνοιγμα σε νέα καρτέλα
   - **Λήψη:** Κλικ "📥 Λήψη" για κατέβασμα του αρχείου

## API Endpoints

### Παλιά Θέματα
#### Λήψη Αρχείων
- `GET /api/pallia-themata` - Όλα τα PDF
- `GET /api/pallia-themata?lykeio=ΓΕΛ&subject=Μαθηματικά&year=2024` - Φιλτραρισμένα
- `GET /api/pallia-themata/:id` - Συγκεκριμένο PDF
- `GET /api/pallia-themata/:id/view` - Προβολή αρχείου (inline)
- `GET /api/pallia-themata/:id/download` - Κατέβασμα αρχείου
- `GET /api/pallia-themata/:id/file` - Παλιό endpoint (συμβατότητα)

#### Διαχείριση Αρχείων  
- `POST /api/pallia-themata` - Ανέβασμα νέου PDF
- `PUT /api/pallia-themata/:id` - Ενημέρωση metadata
- `DELETE /api/pallia-themata/:id` - Διαγραφή PDF

### Βάσεις Σχολών
#### Λήψη Αρχείων
- `GET /api/vaseis-scholon` - Όλα τα PDF βάσεων
- `GET /api/vaseis-scholon/:id` - Συγκεκριμένο PDF
- `GET /api/vaseis-scholon/:id/view` - Προβολή αρχείου (inline)
- `GET /api/vaseis-scholon/:id/download` - Κατέβασμα αρχείου

#### Διαχείριση Αρχείων  
- `POST /api/vaseis-scholon` - Ανέβασμα νέου PDF
- `PUT /api/vaseis-scholon/:id` - Ενημέρωση metadata
- `DELETE /api/vaseis-scholon/:id` - Διαγραφή PDF

### Μηχανογραφικό
#### Λήψη Αρχείων
- `GET /api/mixanografiko` - Όλα τα PDF μηχανογραφικού
- `GET /api/mixanografiko?lykeio=ΓΕΛ&field=Θετικές%20Επιστήμες&specialty=Μουσική` - Φιλτραρισμένα
- `GET /api/mixanografiko/:id` - Συγκεκριμένο PDF
- `GET /api/mixanografiko/:id/view` - Προβολή αρχείου (inline)
- `GET /api/mixanografiko/:id/download` - Κατέβασμα αρχείου

#### Διαχείριση Αρχείων  
- `POST /api/mixanografiko` - Ανέβασμα νέου PDF
- `PUT /api/mixanografiko/:id` - Ενημέρωση metadata
- `DELETE /api/mixanografiko/:id` - Διαγραφή PDF
- `DELETE /api/vaseis-scholon/:id` - Διαγραφή PDF

## Δομή Βάσης Δεδομένων

### Πίνακας: PalliaThemata
| Πεδίο | Τύπος | Περιγραφή |
|-------|-------|-----------|
| id | INT AUTO_INCREMENT | Primary Key |
| title | VARCHAR(255) | Τίτλος αρχείου |
| lykeio | VARCHAR(10) | ΓΕΛ ή ΕΠΑΛ |
| subject | VARCHAR(100) | Μάθημα |
| year | VARCHAR(4) | Έτος εξετάσεων |
| type | VARCHAR(50) | Τύπος (πάντα 'Θέματα') |
| filename | VARCHAR(255) | Unique filename |
| description | TEXT | Περιγραφή |
| file_data | LONGBLOB | PDF δεδομένα |
| file_size | VARCHAR(20) | Μέγεθος αρχείου |
| upload_date | DATE | Ημερομηνία ανεβάσματος |
| created_at | TIMESTAMP | Ημερομηνία δημιουργίας |
| updated_at | TIMESTAMP | Ημερομηνία τελευταίας ενημέρωσης |

### Πίνακας: VaseisScholon
| Πεδίο | Τύπος | Περιγραφή |
|-------|-------|-----------|
| id | INT AUTO_INCREMENT | Primary Key |
| title | VARCHAR(255) | Τίτλος αρχείου |
| year | VARCHAR(4) | Έτος |
| lykeio | ENUM('ΓΕΛ', 'ΕΠΑΛ') | Τύπος λυκείου |
| field | VARCHAR(100) | Πεδίο σπουδών |
| description | TEXT | Περιγραφή |
| filename | VARCHAR(255) | Όνομα αρχείου |
| file_data | LONGBLOB | PDF δεδομένα |
| file_size | VARCHAR(20) | Μέγεθος αρχείου |
| upload_date | TIMESTAMP | Ημερομηνία ανεβάσματος |
| updated_at | TIMESTAMP | Ημερομηνία τελευταίας ενημέρωσης |
| created_by | VARCHAR(100) | Χρήστης που ανέβασε το αρχείο |

### Πίνακας Μηχανογραφικού (Mixanografiko)

| Πεδίο | Τύπος | Περιγραφή |
|-------|-------|-----------|
| id | INT AUTO_INCREMENT | Primary Key |
| title | VARCHAR(255) | Τίτλος αρχείου |
| lykeio | ENUM('ΓΕΛ', 'ΕΠΑΛ') | Τύπος λυκείου |
| field | VARCHAR(255) | Πεδίο σπουδών |
| specialty | VARCHAR(255) | Ειδικά μαθήματα/ειδίκευση |
| description | TEXT | Περιγραφή |
| filename | VARCHAR(255) | Όνομα αρχείου |
| file_data | LONGBLOB | PDF δεδομένα |
| file_size | VARCHAR(50) | Μέγεθος αρχείου |
| upload_date | DATE | Ημερομηνία ανεβάσματος |
| created_at | TIMESTAMP | Ημερομηνία δημιουργίας |
| updated_at | TIMESTAMP | Ημερομηνία τελευταίας ενημέρωσης |
| created_by | INT | ID διαχειριστή που ανέβασε το αρχείο |

## Αντιμετώπιση Προβλημάτων

### Σφάλματα Βάσης Δεδομένων
- Επιβεβαιώστε τις ρυθμίσεις σύνδεσης στο `.env`
- Ελέγξτε ότι η βάση δεδομένων είναι ενεργή
- Επιβεβαιώστε ότι ο πίνακας έχει δημιουργηθεί

### Σφάλματα Upload
- Ελέγξτε το μέγεθος αρχείου (max 50MB)
- Επιβεβαιώστε ότι το αρχείο είναι PDF
- Ελέγξτε τον διαθέσιμο χώρο στη βάση

### Σφάλματα API
- Ελέγξτε τα network requests στο Developer Tools
- Επιβεβαιώστε ότι ο server τρέχει
- Ελέγξτε τα logs του server για λεπτομέρειες

## Χαρακτηριστικά

### Παλιά Θέματα
✅ **Μόνιμη αποθήκευση στη βάση δεδομένων**  
✅ **Real-time συγχρονισμός μεταξύ admin και μαθητών**  
✅ **Φιλτράρισμα ανά λύκειο, μάθημα, έτος**  
✅ **Δυναμικά μαθήματα ανά τύπο λυκείου**  
✅ **Upload validation (τύπος, μέγεθος αρχείου - max 50MB)**  

### Βάσεις Σχολών  
✅ **Απλούστερη δομή από τα παλιά θέματα**  
✅ **Φιλτράρισμα ανά έτος, λύκειο, πεδίο σπουδών**  
✅ **Πεδία σπουδών: Θετικές, Ανθρωπιστικές, Οικονομικές, Τεχνολογικές, Υγείας, Τουρισμός**  
✅ **Upload validation (τύπος, μέγεθος αρχείου - max 10MB)**  

### Μηχανογραφικό  
✅ **Φιλτράρισμα ανά λύκειο, πεδίο σπουδών, ειδικά μαθήματα**  
✅ **Υποστήριξη ειδικών μαθημάτων: Εικαστικά, Μουσική, Φυσική Αγωγή, Τεχνολογικά κ.ά.**  
✅ **Πεδία σπουδών: Θετικές, Ανθρωπιστικές, Οικονομικές, Καλές Τέχνες, Τεχνολογικές, Αθλητισμός, Υγείας, Τουρισμός**  
✅ **Upload validation (τύπος, μέγεθος αρχείου - max 20MB)**  

### Γενικά Χαρακτηριστικά
✅ **Responsive design**  
✅ **API για μελλοντικές επεκτάσεις**  
✅ **Εργαλεία διαχείρισης και στατιστικά**  
✅ **Τρία ξεχωριστά admin panels**  
✅ **Ασφαλής διαχείριση PDF αρχείων**  
✅ **Υποστήριξη ελληνικών χαρακτήρων σε ονόματα αρχείων**

## Δομή Αρχείων Έργου

```
site-Math_Steki/
├── app.js                          # Κύριος server
├── db.js                           # Συναρτήσεις βάσης δεδομένων
├── setup_database.sql              # SQL για δημιουργία όλων των πινάκων
├── vaseis-scholon-schema.sql       # SQL μόνο για βάσεις σχολών
├── pallia-themata-schema.sql       # SQL μόνο για παλιά θέματα
├── mixanografiko-schema.sql        # SQL μόνο για μηχανογραφικό
├── README_PDF_SYSTEM.md            # Αυτό το αρχείο
├── package.json                    # Dependencies
└── public/
    ├── admin-pallia-themata.html    # Admin panel παλιών θεμάτων
    ├── admin-pallia-themata.js      # JavaScript παλιών θεμάτων
    ├── admin-vaseis-scholon.html    # Admin panel βάσεων σχολών
    ├── admin-vaseis-scholon.js      # JavaScript βάσεων σχολών
    ├── admin-mixanografiko.html     # Admin panel μηχανογραφικού
    ├── style.css                   # Γενικά styles
    └── main-page/
        ├── pallia-themata.html      # Μαθητική σελίδα παλιών θεμάτων
        ├── vasis-sholon.html        # Μαθητική σελίδα βάσεων σχολών
        └── mixanografiko.html       # Μαθητική σελίδα μηχανογραφικού
```
