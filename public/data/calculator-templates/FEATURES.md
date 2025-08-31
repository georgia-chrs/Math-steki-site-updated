# Νέες Λειτουργίες Excel Templates - Admin Calculator

## Περίληψη

Προστέθηκαν νέες λειτουργίες στο admin-calculator.html για τη διαχείριση Excel templates που χρησιμοποιούνται από τον υπολογιστή μορίων.

## Νέες Λειτουργίες

### 1. Ανέβασμα Excel Templates
- Υποστήριξη .xlsx και .xls αρχείων
- 5 διαφορετικοί τύποι templates
- Validation δομής template
- Προεπισκόπηση πριν την αποθήκευση

### 2. Διαχείριση Templates
- Λίστα όλων των διαθέσιμων templates
- Προεπισκόπηση template
- Λήψη template
- Διαγραφή template
- Στατιστικά templates

### 3. Sample Templates
- Δημιουργία δειγμάτων για κάθε τύπο
- Προκαθορισμένη δομή με placeholders
- Φόρμουλες Excel για αυτόματους υπολογισμούς

## Τύποι Templates

1. **Calculation Template** - Υπολογισμοί μορίων
2. **Results Template** - Εμφάνιση αποτελεσμάτων  
3. **Statistics Template** - Στατιστικές αναφορές
4. **Schools Comparison Template** - Σύγκριση σχολών
5. **Student Report Template** - Αναλυτική αναφορά μαθητή

## API Endpoints

### POST /api/upload-calculator-template
Ανέβασμα νέου template
- Multer upload με validation
- Αποθήκευση metadata
- Έλεγχος δομής

### GET /api/calculator-templates
Λίστα όλων των templates
- Επιστρέφει metadata για κάθε template
- Ελέγχει ύπαρξη αρχείων

### GET /api/calculator-templates/:fileName
Λήψη συγκεκριμένου template
- Download ως attachment
- Proper headers για Excel files

### DELETE /api/calculator-templates/:fileName
Διαγραφή template
- Διαγράφει και το αρχείο και τα metadata
- Logging της ενέργειας

### GET /api/calculator-templates-stats
Στατιστικά templates
- Συνολικός αριθμός
- Κατανομή ανά τύπο
- Μέγεθος αρχείων
- Ημερομηνία τελευταίας ενημέρωσης

### POST /api/create-sample-templates
Δημιουργία sample templates
- Αυτόματη δημιουργία βασικών templates
- Metadata και περιγραφές

## Τεχνικές Λεπτομέρειες

### Frontend (admin-calculator.html)
- Νέο section για Excel templates
- JavaScript functions για upload/preview
- XLSX library για επεξεργασία Excel
- Validation δομής template
- Error handling και messages

### Backend (app.js)
- Multer configuration για Excel files
- Storage στο ./public/data/calculator-templates/
- Metadata system με .meta.json αρχεία
- Error handling και logging
- File size limits (10MB)

### Validation
- Έλεγχος file type (.xlsx, .xls)
- Validation δομής φύλλων Excel
- Έλεγχος απαιτούμενων φύλλων
- File size validation

### Security
- File type validation
- Sanitized filenames
- Size limits
- Directory restrictions

## Δομή Αρχείων

```
public/data/calculator-templates/
├── README.md                    # Documentation
├── config.json                 # Configuration
├── sample-calculation.xlsx     # Sample templates
├── sample-results.xlsx
├── ...
├── template1.xlsx              # User uploaded templates
├── template1.xlsx.meta.json    # Metadata για template1
└── ...
```

## Placeholders System

Τα templates χρησιμοποιούν placeholders σε μορφή `{VARIABLE_NAME}` που αντικαθίστανται δυναμικά:

- `{STUDENT_NAME}` - Όνομα μαθητή
- `{STUDENT_MORIA}` - Μόρια μαθητή
- `{SCHOOL_1}` - Όνομα σχολής
- `{BASE_1}` - Βάση εισαγωγής
- κλπ.

## Usage

1. Πηγαίνετε στο admin-calculator.html
2. Scroll στο section "Excel Templates για Υπολογιστή Μορίων"
3. Επιλέξτε τύπο template
4. Ανεβάστε Excel αρχείο
5. Ελέγξτε την προεπισκόπηση
6. Επιβεβαιώστε την αποθήκευση

Εναλλακτικά, κατεβάστε sample templates για να δείτε τη σωστή δομή.

## Συντήρηση

- Τα templates αποθηκεύονται με metadata για εύκολη διαχείριση
- Backup system για ασφάλεια
- Logs για troubleshooting
- Configuration αρχείο για settings

## Troubleshooting

1. **Σφάλμα ανεβάσματος**: Ελέγξτε file type και μέγεθος
2. **Validation error**: Βεβαιωθείτε ότι το template έχει τη σωστή δομή
3. **Preview δεν λειτουργεί**: Ελέγξτε τα permissions του φακέλου
4. **Template δεν βρίσκεται**: Ελέγξτε τα logs για σφάλματα

Για περισσότερες πληροφορίες, δείτε το README.md στον φάκελο templates.
