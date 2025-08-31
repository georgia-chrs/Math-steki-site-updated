// Διαχείριση Παλιών Θεμάτων - Admin Panel
let allPDFs = [];
let currentEditId = null;

// Μαθήματα ανά τύπο λυκείου
const subjectsByLykeio = {
    'ΓΕΛ': [
        'Μαθηματικά',
        'Φυσική', 
        'Χημεία',
        'Βιολογία',
        'Νεοελληνική Γλώσσα',
        'Αρχαία Ελληνικά',
        'Ιστορία',
        'Λατινικά',
        'Αγγλικά',
        'Γαλλικά',
        'Γερμανικά'
    ],
    'ΕΠΑΛ': [
        'Μαθηματικά',
        'Φυσική',
        'Νεοελληνική Γλώσσα',
        'Αγγλικά',
        'Ιστορία',
        'Οικονομικά',
        'Πληροφορική',
        'Τεχνολογία',
        'Τουρισμός'
    ]
};

// Ρυθμίσεις για validation
const MAX_FILE_SIZE_MB = 50; // Μέγιστο μέγεθος αρχείου σε MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Φόρτωση των PDF από το API
async function loadPDFs() {
    try {
        const response = await fetch('/api/pallia-themata');
        if (response.ok) {
            allPDFs = await response.json();
            console.log('Loaded PDFs:', allPDFs); // Debug logging
        } else {
            throw new Error('Σφάλμα φόρτωσης από server');
        }
        displayPDFs();
    } catch (error) {
        console.error('Σφάλμα φόρτωσης PDFs:', error);
        showMessage('Σφάλμα φόρτωσης αρχείων PDF από τη βάση δεδομένων', 'danger');
        allPDFs = [];
        displayPDFs();
    }
}

// Ενημέρωση μαθημάτων βάσει τύπου λυκείου
function updateSubjects(selectId = 'pdf-subject') {
    const lykeioId = selectId === 'pdf-subject' ? 'pdf-lykeio' : 'edit-lykeio';
    const lykeioValue = document.getElementById(lykeioId).value;
    const subjectSelect = document.getElementById(selectId);
    
    // Καθαρισμός υπαρχουσών επιλογών
    subjectSelect.innerHTML = '<option value="">Επιλέξτε μάθημα</option>';
    
    if (lykeioValue && subjectsByLykeio[lykeioValue]) {
        subjectsByLykeio[lykeioValue].forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }
}

// Εμφάνιση PDFs στον πίνακα
function displayPDFs(filteredPDFs = null) {
    const pdfsToShow = filteredPDFs || allPDFs;
    const tbody = document.getElementById('pdf-table-body');
    
    if (pdfsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">Δεν υπάρχουν διαθέσιμα PDF αρχεία</td></tr>';
        return;
    }
    
    tbody.innerHTML = pdfsToShow.map((pdf, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${pdf.title}</td>
            <td><span class="badge">${pdf.lykeio || 'ΓΕΛ'}</span></td>
            <td>${pdf.subject}</td>
            <td>${pdf.year}</td>
            <td>${pdf.file_size || pdf.fileSize || 'N/A'}</td>
            <td>${formatDate(pdf.upload_date || pdf.uploadDate)}</td>
            <td class="actions">
                <button class="btn btn-primary" onclick="viewPDF('${pdf.filename}')" title="Προβολή">Προβολή</button>
                <button class="btn btn-warning" onclick="editPDF(${pdf.id})" title="Επεξεργασία">Επεξεργασία</button>
                <button class="btn btn-danger" onclick="deletePDF(${pdf.id})" title="Διαγραφή">Διαγραφή</button>
            </td>
        </tr>
    `).join('');
}

// Μορφοποίηση ημερομηνίας
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        // Έλεγχος αν η ημερομηνία είναι έγκυρη
        if (isNaN(date.getTime())) return 'N/A';
        
        return date.toLocaleDateString('el-GR');
    } catch (error) {
        return 'N/A';
    }
}

// Εμφάνιση μηνύματος
function showMessage(message, type = 'info') {
    const statusDiv = document.getElementById('status-messages');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    statusDiv.innerHTML = '';
    statusDiv.appendChild(alertDiv);
    
    // Αυτόματη απόκρυψη μετά από 5 δευτερόλεπτα
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Προβολή PDF
function viewPDF(filename) {
    // Αναζήτηση του PDF στη λίστα για να πάρουμε το ID
    const pdf = allPDFs.find(p => p.filename === filename);
    if (pdf) {
        // Άνοιγμα του PDF μέσω API
        const pdfUrl = `/api/pallia-themata/${pdf.id}/file`;
        window.open(pdfUrl, '_blank');
    } else {
        showMessage('Το αρχείο δεν βρέθηκε', 'danger');
    }
}

// Επεξεργασία PDF
function editPDF(id) {
    const pdf = allPDFs.find(p => p.id === id);
    if (!pdf) {
        showMessage('Δεν βρέθηκε το PDF για επεξεργασία', 'danger');
        return;
    }
    
    currentEditId = id;
    
    // Συμπλήρωση φόρμας επεξεργασίας
    document.getElementById('edit-lykeio').value = pdf.lykeio || 'ΓΕΛ';
    updateSubjects('edit-subject'); // Ενημέρωση μαθημάτων
    
    // Περιμένουμε λίγο για να ενημερωθούν τα μαθήματα
    setTimeout(() => {
        document.getElementById('edit-subject').value = pdf.subject;
        document.getElementById('edit-year').value = pdf.year;
        document.getElementById('edit-title').value = pdf.title;
        document.getElementById('edit-description').value = pdf.description;
    }, 100);
    
    // Εμφάνιση modal
    document.getElementById('edit-modal').style.display = 'block';
}

// Κλείσιμο modal επεξεργασίας
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditId = null;
}

// Διαγραφή PDF
async function deletePDF(id) {
    const pdf = allPDFs.find(p => p.id === id);
    if (!pdf) {
        showMessage('Δεν βρέθηκε το PDF για διαγραφή', 'danger');
        return;
    }
    
    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το PDF "${pdf.title}";`)) {
        try {
            const response = await fetch(`/api/pallia-themata/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Αφαίρεση από τον τοπικό πίνακα
                allPDFs = allPDFs.filter(p => p.id !== id);
                
                // Ενημέρωση εμφάνισης
                displayPDFs();
                
                showMessage('Το PDF διαγράφηκε επιτυχώς', 'success');
            } else {
                const error = await response.json();
                showMessage(error.error || 'Σφάλμα διαγραφής PDF', 'danger');
            }
        } catch (error) {
            console.error('Σφάλμα διαγραφής:', error);
            showMessage('Σφάλμα διαγραφής PDF', 'danger');
        }
    }
}

// Αποθήκευση PDFs στη βάση δεδομένων (API call)
async function savePDFsToDatabase() {
    try {
        showMessage('Τα δεδομένα αποθηκεύτηκαν επιτυχώς στη βάση δεδομένων', 'success');
    } catch (error) {
        console.error('Σφάλμα αποθήκευσης:', error);
        showMessage('Σφάλμα αποθήκευσης δεδομένων στη βάση', 'danger');
    }
}

// Δημιουργία filename από τα δεδομένα
function generateFilename(lykeio, subject, year) {
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
    
    return `${subjectCode}_${lykeioCode}_${year}_themata.pdf`;
}

// Υπολογισμός μεγέθους αρχείου
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Καθαρισμός φόρμας
function clearForm() {
    document.getElementById('upload-form').reset();
    document.getElementById('file-selected').style.display = 'none';
    
    // Αυτόματη συμπλήρωση τίτλου
    updateTitle();
}

// Αυτόματη ενημέρωση τίτλου βάσει επιλογών
function updateTitle() {
    const lykeio = document.getElementById('pdf-lykeio').value;
    const subject = document.getElementById('pdf-subject').value;
    const year = document.getElementById('pdf-year').value;
    
    if (lykeio && subject && year) {
        let title = `${subject}`;
        if (lykeio === 'ΓΕΛ' && (subject === 'Μαθηματικά' || subject === 'Φυσική' || subject === 'Χημεία' || subject === 'Βιολογία')) {
            title += ' Προσανατολισμού';
        }
        if (lykeio === 'ΕΠΑΛ') {
            title += ' ΕΠΑΛ';
        }
        title += ` ${year}`;
        
        document.getElementById('pdf-title').value = title;
    }
}

// Φιλτράρισμα PDFs
function filterPDFs() {
    const filterLykeio = document.getElementById('filter-lykeio').value;
    
    let filtered = allPDFs;
    if (filterLykeio) {
        filtered = allPDFs.filter(pdf => (pdf.lykeio || 'ΓΕΛ') === filterLykeio);
    }
    
    displayPDFs(filtered);
}

// Εργαλεία διαχείρισης
async function clearAllData() {
    if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε όλα τα αποθηκευμένα αρχεία από τη βάση δεδομένων;\n\nΗ ενέργεια αυτή δεν μπορεί να αναιρεθεί.')) {
        try {
            // Διαγραφή όλων των PDF ένα προς ένα (θα μπορούσαμε να φτιάξουμε ένα batch delete endpoint)
            for (const pdf of allPDFs) {
                await fetch(`/api/pallia-themata/${pdf.id}`, {
                    method: 'DELETE'
                });
            }
            
            allPDFs = [];
            displayPDFs();
            showMessage('Όλα τα αρχεία διαγράφηκαν επιτυχώς από τη βάση δεδομένων', 'success');
        } catch (error) {
            console.error('Σφάλμα διαγραφής:', error);
            showMessage('Σφάλμα κατά τη διαγραφή των αρχείων από τη βάση δεδομένων', 'danger');
        }
    }
}

function exportData() {
    try {
        // Εξαγωγή μόνο των μεταδεδομένων (χωρίς τα file_data)
        const exportData = allPDFs.map(pdf => ({
            id: pdf.id,
            title: pdf.title,
            lykeio: pdf.lykeio,
            subject: pdf.subject,
            year: pdf.year,
            type: pdf.type,
            filename: pdf.filename,
            description: pdf.description,
            file_size: pdf.file_size,
            upload_date: pdf.upload_date,
            created_at: pdf.created_at
        }));
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `pallia-themata-metadata-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showMessage('Τα μεταδεδομένα εξάχθηκαν επιτυχώς', 'success');
    } catch (error) {
        showMessage('Σφάλμα κατά την εξαγωγή των δεδομένων', 'danger');
    }
}

function showStorageInfo() {
    try {
        const totalFiles = allPDFs.length;
        const totalSizeText = allPDFs.reduce((sum, pdf) => {
            const sizeMatch = pdf.file_size?.match(/(\d+\.?\d*)\s*(KB|MB|GB)/);
            if (sizeMatch) {
                const size = parseFloat(sizeMatch[1]);
                const unit = sizeMatch[2];
                const sizeInMB = unit === 'KB' ? size / 1024 : 
                               unit === 'GB' ? size * 1024 : size;
                return sum + sizeInMB;
            }
            return sum;
        }, 0);
        
        let storageInfo = `Πληροφορίες Αποθήκευσης:\n\n`;
        storageInfo += `• Αρχεία στη βάση δεδομένων: ${totalFiles}\n`;
        storageInfo += `• Συνολικό μέγεθος: ${totalSizeText.toFixed(2)} MB\n`;
        storageInfo += ` Τα αρχεία αποθηκεύονται μόνιμα στη βάση δεδομένων`;
        
        alert(storageInfo);
    } catch (error) {
        showMessage('Σφάλμα κατά την ανάκτηση πληροφοριών αποθήκευσης', 'danger');
    }
}

// Βοηθητικές συναρτήσεις για file handling
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function base64ToBlob(base64, contentType) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type: contentType});
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadPDFs();
    
    // Ενημέρωση μαθημάτων όταν αλλάζει το λύκειο
    document.getElementById('pdf-lykeio').addEventListener('change', function() {
        updateSubjects('pdf-subject');
        updateTitle();
    });
    
    document.getElementById('edit-lykeio').addEventListener('change', function() {
        updateSubjects('edit-subject');
    });
    
    // File input change
    document.getElementById('pdf-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const fileSelectedDiv = document.getElementById('file-selected');
        
        if (file) {
            // Έλεγχος μεγέθους αρχείου
            if (file.size > MAX_FILE_SIZE_BYTES) {
                showMessage(`Το αρχείο είναι πολύ μεγάλο. Μέγιστο επιτρεπτό μέγεθος: ${MAX_FILE_SIZE_MB}MB`, 'danger');
                e.target.value = ''; // Καθαρισμός του input
                fileSelectedDiv.style.display = 'none';
                return;
            }
            
            // Έλεγχος τύπου αρχείου
            if (file.type !== 'application/pdf') {
                showMessage('Παρακαλώ επιλέξτε μόνο PDF αρχεία', 'danger');
                e.target.value = ''; // Καθαρισμός του input
                fileSelectedDiv.style.display = 'none';
                return;
            }
            
            fileSelectedDiv.textContent = `Επιλέχθηκε: ${file.name} (${formatFileSize(file.size)})`;
            fileSelectedDiv.style.display = 'block';
            fileSelectedDiv.style.color = '#28a745';
        } else {
            fileSelectedDiv.style.display = 'none';
        }
    });
    
    // Auto-update title
    document.getElementById('pdf-subject').addEventListener('change', updateTitle);
    document.getElementById('pdf-year').addEventListener('change', updateTitle);
    
    // Filter
    document.getElementById('filter-lykeio').addEventListener('change', filterPDFs);
    
    // Upload form submit
    document.getElementById('upload-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const file = document.getElementById('pdf-file').files[0];
        
        if (!file) {
            showMessage('Παρακαλώ επιλέξτε ένα PDF αρχείο', 'danger');
            return;
        }
        
        if (file.type !== 'application/pdf') {
            showMessage('Παρακαλώ επιλέξτε μόνο PDF αρχεία', 'danger');
            return;
        }
        
        if (file.size > MAX_FILE_SIZE_BYTES) {
            showMessage(`Το αρχείο είναι πολύ μεγάλο. Μέγιστο επιτρεπόμενο μέγεθος: ${MAX_FILE_SIZE_MB} MB`, 'danger');
            return;
        }
        
        // Επιπλέον validation για τα πεδία
        const lykeio = document.getElementById('pdf-lykeio').value;
        const subject = document.getElementById('pdf-subject').value;
        const year = document.getElementById('pdf-year').value;
        const title = document.getElementById('pdf-title').value.trim();
        
        if (!lykeio || !subject || !year || !title) {
            showMessage('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία', 'danger');
            return;
        }
        
        // Έλεγχος για διπλό filename
        const newFilename = generateFilename(lykeio, subject, year);
        if (allPDFs.some(pdf => pdf.filename === newFilename)) {
            showMessage('Υπάρχει ήδη αρχείο με τα ίδια στοιχεία (Λύκειο, Μάθημα, Έτος)', 'danger');
            return;
        }
        
        // Εμφάνιση loading message
        showMessage('Επεξεργασία και αποστολή αρχείου... Παρακαλώ περιμένετε.', 'info');
        
        try {
            // Μετατροπή αρχείου σε base64
            const fileData = await fileToBase64(file);
            
            // Προετοιμασία δεδομένων για API call
            const requestData = {
                title: title,
                lykeio: lykeio,
                subject: subject,
                year: year,
                description: document.getElementById('pdf-description').value.trim(),
                fileData: fileData, // base64 string
                fileName: file.name,
                fileSize: formatFileSize(file.size)
            };
            
            // API call για αποστολή στη βάση
            const response = await fetch('/api/pallia-themata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Προσθήκη του νέου PDF στον τοπικό πίνακα
                allPDFs.unshift(result.pdf);
                
                // Ενημέρωση εμφάνισης
                displayPDFs();
                
                // Καθαρισμός φόρμας
                clearForm();
                
                showMessage(`Το PDF "${result.pdf.title}" προστέθηκε επιτυχώς στη βάση δεδομένων`, 'success');
            } else {
                const error = await response.json();
                showMessage(error.error || 'Σφάλμα κατά την αποστολή του αρχείου', 'danger');
            }
            
        } catch (error) {
            console.error('Σφάλμα αποστολής αρχείου:', error);
            showMessage('Σφάλμα κατά την αποστολή του αρχείου. Παρακαλώ δοκιμάστε ξανά.', 'danger');
        }
    });
    
    // Edit form submit
    document.getElementById('edit-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const pdfIndex = allPDFs.findIndex(p => p.id === currentEditId);
        if (pdfIndex === -1) {
            showMessage('Σφάλμα: Δεν βρέθηκε το PDF για επεξεργασία', 'danger');
            return;
        }
        
        try {
            const updatedData = {
                title: document.getElementById('edit-title').value,
                lykeio: document.getElementById('edit-lykeio').value,
                subject: document.getElementById('edit-subject').value,
                year: document.getElementById('edit-year').value,
                description: document.getElementById('edit-description').value
            };
            
            const response = await fetch(`/api/pallia-themata/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            
            if (response.ok) {
                // Ενημέρωση τοπικού πίνακα
                allPDFs[pdfIndex] = {
                    ...allPDFs[pdfIndex],
                    ...updatedData,
                    filename: generateFilename(updatedData.lykeio, updatedData.subject, updatedData.year)
                };
                
                // Ενημέρωση εμφάνισης
                displayPDFs();
                
                // Κλείσιμο modal
                closeEditModal();
                
                showMessage('Οι αλλαγές αποθηκεύτηκαν επιτυχώς στη βάση δεδομένων', 'success');
            } else {
                const error = await response.json();
                showMessage(error.error || 'Σφάλμα ενημέρωσης PDF', 'danger');
            }
        } catch (error) {
            console.error('Σφάλμα ενημέρωσης:', error);
            showMessage('Σφάλμα ενημέρωσης PDF', 'danger');
        }
    });
    
    // Modal close on outside click
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('edit-modal');
        if (e.target === modal) {
            closeEditModal();
        }
    });
});
