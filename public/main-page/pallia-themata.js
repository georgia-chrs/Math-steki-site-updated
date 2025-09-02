 // Μεταβλητές για τα φίλτρα
    let currentFilters = {
      lykeio: '',
      year: '',
      subject: '',
      date: ''
    };
    
    // Dropdown functionality
    document.addEventListener('DOMContentLoaded', function() {
      initializeDropdowns();
      loadPDFs();
    });
    
    function initializeDropdowns() {
      // Διαχείριση όλων των dropdown buttons
      const dropdownButtons = document.querySelectorAll('.filter-button');
      
      dropdownButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.stopPropagation();
          const dropdownId = this.id.replace('-btn', '-options');
          const dropdown = document.getElementById(dropdownId);
          const isOpen = dropdown.classList.contains('show');
          
          // Κλείσιμο όλων των άλλων dropdowns
          document.querySelectorAll('.filter-options').forEach(opt => {
            opt.classList.remove('show');
          });
          document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Toggle του τρέχοντος dropdown
          if (!isOpen) {
            dropdown.classList.add('show');
            this.classList.add('active');
          }
        });
      });
      
      // Χρήση event delegation για τις επιλογές (δουλεύει και με δυναμικό περιεχόμενο)
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-option')) {
          handleFilterOptionClick(e.target);
        }
      });
      
      // Κλείσιμο dropdowns όταν κάνουμε click έξω
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.filter-dropdown')) {
          document.querySelectorAll('.filter-options').forEach(opt => {
            opt.classList.remove('show');
          });
          document.querySelectorAll('.filter-button').forEach(btn => {
            btn.classList.remove('active');
          });
        }
      });
      
      // Clear filters button
      document.getElementById('clear-filters').addEventListener('click', function() {
        clearAllFilters();
      });
    }
    
    function handleFilterOptionClick(option) {
      const dropdown = option.parentElement;
      const dropdownId = dropdown.id;
      const buttonId = dropdownId.replace('-options', '-btn');
      const button = document.getElementById(buttonId);
      const value = option.dataset.value;
      const text = option.textContent;
      
      // Ενημέρωση του button text (εκτός από το "Όλα τα μαθήματα")
      if (value === '' && dropdownId === 'subject-options') {
        button.textContent = 'Μάθημα';
      } else if (value === '' && dropdownId === 'lykeio-options') {
        button.textContent = 'Λύκειο';
      } else if (value === '' && dropdownId === 'year-options') {
        button.textContent = 'Έτος';
      } else if (value === '' && dropdownId === 'date-options') {
        button.textContent = 'Ημερομηνία';
      } else {
        button.textContent = text;
      }
      
      // Ενημέρωση των φίλτρων
      const filterType = dropdownId.replace('-options', '');
      currentFilters[filterType] = value;
      
      // Εφαρμογή φίλτρων
      applyFilters();
      
      // Κλείσιμο dropdown
      dropdown.classList.remove('show');
      button.classList.remove('active');
      
      // Ενημέρωση selected state
      dropdown.querySelectorAll('.filter-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      option.classList.add('selected');
      
      // Ενημέρωση μαθημάτων όταν αλλάζει το λύκειο
      if (filterType === 'lykeio') {
        updateSubjectOptions(value);
      }
    }
    
    function updateSubjectOptions(lykeioType) {
      const subjectOptions = document.getElementById('subject-options');
      const subjectButton = document.getElementById('subject-btn');
      
      // Καθαρισμός υπαρχόντων επιλογών
      subjectOptions.innerHTML = '<div class="filter-option selected" data-value="">Όλα τα μαθήματα</div>';
      
      // Προσθήκη μαθημάτων ανάλογα με τον τύπο λυκείου
      if (lykeioType && subjectsByLykeio[lykeioType]) {
        subjectsByLykeio[lykeioType].forEach(subject => {
          const option = document.createElement('div');
          option.className = 'filter-option';
          option.dataset.value = subject;
          option.textContent = subject;
          subjectOptions.appendChild(option);
        });
      }
      
      // Reset subject filter και button text
      currentFilters.subject = '';
      subjectButton.textContent = 'Μάθημα';
    }
    
    function clearAllFilters() {
      // Reset όλων των φίλτρων
      currentFilters = {
        lykeio: '',
        year: '',
        subject: '',
        date: ''
      };
      
      // Reset button texts
      document.getElementById('lykeio-btn').textContent = 'Λύκειο';
      document.getElementById('year-btn').textContent = 'Έτος';
      document.getElementById('subject-btn').textContent = 'Μάθημα';
      document.getElementById('date-btn').textContent = 'Ημερομηνία';
      
      // Reset selected states
      document.querySelectorAll('.filter-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      document.querySelectorAll('.filter-option[data-value=""]').forEach(opt => {
        opt.classList.add('selected');
      });
      
      // Reset subject options
      updateSubjectOptions('');
      
      // Εφαρμογή φίλτρων (δηλαδή εμφάνιση όλων)
      applyFilters();
    }
    
    function applyFilters() {
      console.log('Applying filters:', currentFilters);
      
      const filteredPDFs = allPDFs.filter(pdf => {
        const matchesLykeio = !currentFilters.lykeio || pdf.lykeio === currentFilters.lykeio;
        const matchesYear = !currentFilters.year || pdf.year === currentFilters.year;
        const matchesSubject = !currentFilters.subject || pdf.subject === currentFilters.subject;
        
        return matchesLykeio && matchesYear && matchesSubject;
      });
      
      console.log(`Filtered ${filteredPDFs.length} PDFs from ${allPDFs.length} total`);
      displayPDFs(filteredPDFs);
      updateFilesInfo(filteredPDFs.length);
    }
    
    function updateFilesInfo(count) {
      const infoDiv = document.getElementById('files-info');
      const countText = document.getElementById('files-count-text');
      
      if (count > 0) {
        countText.textContent = `Βρέθηκαν ${count} αρχεία`;
        infoDiv.style.display = 'block';
      } else {
        infoDiv.style.display = 'none';
      }
    }

    // Δυναμική φόρτωση PDF αρχείων
    let allPDFs = [];
    
    // Μαθήματα ανά τύπο λυκείου
    const subjectsByLykeio = {
      'ΓΕΛ': [
        'Μαθηματικά Προσανατολισμού',
        'Μαθηματικά Γενικής Παιδείας',
        'Φυσική Προσανατολισμού',
        'Χημεία Προσανατολισμού',
        'Βιολογία Προσανατολισμού',
        'Νεοελληνική Γλώσσα και Λογοτεχνία',
        'Αρχαία Ελληνική Γλώσσα και Γραμματεία',
        'Ιστορία Γενικής Παιδείας',
        'Ιστορία Προσανατολισμού',
        'Λατινικά',
        'Άλγεβρα',
        'Γεωμετρία',
        'Εικαστικά',
        'Μουσική',
        'Κοινωνιολογία',
        'Οικονομία',
        'Ψυχολογία',
        'Φιλοσοφία',
        'Πολιτική Παιδεία',
        'Πληροφορική',
        'Γεωγραφία',
        'Αγγλικά',
        'Γαλλικά',
        'Γερμανικά',
        'Ιταλικά',
        'Ισπανικά',
        'Ρωσικά'
      ],
      'ΕΠΑΛ': [
        'Μαθηματικά και Στοιχεία Στατιστικής',
        'Νεοελληνική Γλώσσα και Λογοτεχνία',
        'Ιστορία',
        'Φυσικές Επιστήμες',
        'Αγγλικά',
        'Οικονομία',
        'Πληροφορική',
        'Αρχές Οικονομικής Θεωρίας',
        'Αρχές Οργάνωσης και Διοίκησης Επιχειρήσεων',
        'Στοιχεία Ηλεκτρολογίας',
        'Στοιχεία Μηχανολογίας',
        'Αρχές Μηχανικής - Αντοχή Υλικών',
        'Τεχνολογία Επικοινωνιών',
        'Προγραμματισμός Υπολογιστών',
        'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον',
        'Δίκτυα Υπολογιστών',
        'Σχεδίαση και Ανάπτυξη Ψηφιακών Εφαρμογών',
        'Συστήματα Διαχείρισης Βάσεων Δεδομένων',
        'Τουρισμός - Γεωγραφία Τουρισμού',
        'Τουριστικές Επιχειρήσεις και Επαγγέλματα',
        'Διοίκηση Τουριστικών Επιχειρήσεων',
        'Τουριστικό Μάρκετινγκ',
        'Ιστορία Τέχνης',
        'Εικαστικά',
        'Μουσική',
        'Θεατρικό Εργαστήριο',
        'Χορός',
        'Σχέδιο',
        'Τεχνολογία Υφασμάτων',
        'Τεχνολογία Τροφίμων',
        'Περιβάλλον και Φυσικοί Πόροι',
        'Γεωπονία - Κτηνοτροφία',
        'Φυτική Παραγωγή',
        'Ζωική Παραγωγή',
        'Αρχιτεκτονικό Σχέδιο',
        'Στοιχεία Αρχιτεκτονικής',
        'Τοπογραφία',
        'Οικοδομική',
        'Υδραυλικά - Υγειονομικά',
        'Ηλεκτρικές Εγκαταστάσεις',
        'Στοιχεία Ιατρικής',
        'Στοιχεία Νοσηλευτικής',
        'Ανατομία - Φυσιολογία',
        'Παθολογία',
        'Φαρμακολογία',
        'Διατροφή - Διαιτολογία',
        'Ψυχολογία - Κοινωνιολογία',
        'Εργοθεραπεία - Φυσιοθεραπεία'
      ]
    };
    
    // Φόρτωση PDF αρχείων από το API
    async function loadPDFs() {
      try {
        const response = await fetch('/api/pallia-themata');
        if (response.ok) {
          allPDFs = await response.json();
        } else {
          console.warn('Σφάλμα φόρτωσης από API, χρήση δείγματος');
          allPDFs = getSamplePDFs();
        }
        displayPDFs(allPDFs);
      } catch (error) {
        console.error('Σφάλμα φόρτωσης PDFs:', error);
        allPDFs = getSamplePDFs();
        displayPDFs(allPDFs);
      }
    }
    
    // Δείγμα δεδομένων (μόνο θέματα)
    function getSamplePDFs() {
      return [
        {
          id: 1,
          title: "Μαθηματικά Προσανατολισμού 2024",
          subject: "Μαθηματικά",
          year: "2024",
          type: "Θέματα",
          lykeio: "ΓΕΛ",
          filename: "mathimatika_2024_themata.pdf",
          description: "Θέματα Μαθηματικών Προσανατολισμού Πανελλαδικών Εξετάσεων 2024",
          uploadDate: "2024-07-15",
          fileSize: "2.3 MB"
        },
        {
          id: 2,
          title: "Φυσική Προσανατολισμού 2024",
          subject: "Φυσική",
          year: "2024",
          type: "Θέματα",
          lykeio: "ΓΕΛ",
          filename: "fysiki_2024_themata.pdf",
          description: "Θέματα Φυσικής Προσανατολισμού Πανελλαδικών Εξετάσεων 2024",
          uploadDate: "2024-07-15",
          fileSize: "1.8 MB"
        },
        {
          id: 3,
          title: "Νεοελληνική Γλώσσα 2024",
          subject: "Νεοελληνική Γλώσσα",
          year: "2024",
          type: "Θέματα",
          lykeio: "ΓΕΛ",
          filename: "neoeliniki_2024_themata.pdf",
          description: "Θέματα Νεοελληνικής Γλώσσας Πανελλαδικών Εξετάσεων 2024",
          uploadDate: "2024-07-15",
          fileSize: "1.5 MB"
        },
        {
          id: 4,
          title: "Μαθηματικά ΕΠΑΛ 2024",
          subject: "Μαθηματικά",
          year: "2024",
          type: "Θέματα",
          lykeio: "ΕΠΑΛ",
          filename: "mathimatika_epal_2024_themata.pdf",
          description: "Θέματα Μαθηματικών ΕΠΑΛ Πανελλαδικών Εξετάσεων 2024",
          uploadDate: "2024-07-15",
          fileSize: "2.0 MB"
        },
        {
          id: 5,
          title: "Οικονομικά ΕΠΑΛ 2024",
          subject: "Οικονομικά",
          year: "2024",
          type: "Θέματα",
          lykeio: "ΕΠΑΛ",
          filename: "oikonomika_epal_2024_themata.pdf",
          description: "Θέματα Οικονομικών ΕΠΑΛ Πανελλαδικών Εξετάσεων 2024",
          uploadDate: "2024-07-15",
          fileSize: "1.7 MB"
        },
        {
          id: 6,
          title: "Μαθηματικά Προσανατολισμού 2023",
          subject: "Μαθηματικά",
          year: "2023",
          type: "Θέματα",
          lykeio: "ΓΕΛ",
          filename: "mathimatika_2023_themata.pdf",
          description: "Θέματα Μαθηματικών Προσανατολισμού Πανελλαδικών Εξετάσεων 2023",
          uploadDate: "2023-07-15",
          fileSize: "2.1 MB"
        }
      ];
    }
    
    // Ενημέρωση μαθημάτων βάσει τύπου λυκείου
    function updateSubjects() {
      const lykeioFilter = document.getElementById('lykeio-filter').value;
      const subjectFilter = document.getElementById('subject-filter');
      
      // Καθαρισμός υπαρχουσών επιλογών
      subjectFilter.innerHTML = '<option value="">Όλα τα μαθήματα</option>';
      
      let subjects = [];
      if (lykeioFilter) {
        subjects = subjectsByLykeio[lykeioFilter] || [];
      } else {
        // Αν δεν έχει επιλεγεί λύκειο, εμφάνισε όλα τα μαθήματα
        subjects = [...new Set([...subjectsByLykeio['ΓΕΛ'], ...subjectsByLykeio['ΕΠΑΛ']])].sort();
      }
      
      subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
      });
    }
    
    // Εμφάνιση PDF αρχείων
    function displayPDFs(pdfs) {
      const container = document.getElementById('pdf-container');
      const noFilesMessage = document.getElementById('no-files-message');
      const filesInfo = document.getElementById('files-info');
      const filesCountText = document.getElementById('files-count-text');
      
      // Ενημέρωση πληροφοριών αρχείων
      if (pdfs.length > 0) {
        let infoText = `Συνολικά ${pdfs.length} αρχείο/α διαθέσιμο/α από τη βάση δεδομένων`;
        filesCountText.textContent = infoText;
        filesInfo.style.display = 'block';
      } else {
        filesInfo.style.display = 'none';
      }
      
      if (pdfs.length === 0) {
        container.innerHTML = '';
        noFilesMessage.style.display = 'block';
        return;
      }
      
      noFilesMessage.style.display = 'none';
      
      container.innerHTML = pdfs.map(pdf => `
        <div class="pdf-item" data-year="${pdf.year}" data-subject="${pdf.subject}" data-lykeio="${pdf.lykeio || 'ΓΕΛ'}">
          <div class="pdf-header">
            <svg class="pdf-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <div>
              <h3 class="pdf-title">${pdf.title}</h3>
              <span class="pdf-badge">${pdf.lykeio || 'ΓΕΛ'}</span>
            </div>
          </div>
          
          <div class="pdf-info">
            <div class="pdf-meta">
              <span><strong>Μάθημα:</strong> ${pdf.subject}</span>
              <span><strong>Έτος:</strong> ${pdf.year}</span>
            </div>
            <div class="pdf-meta">
              <span><strong>Λύκειο:</strong> ${pdf.lykeio || 'ΓΕΛ'}</span>
              <span><strong>Μέγεθος:</strong> ${pdf.file_size || pdf.fileSize}</span>
            </div>
            <div class="pdf-meta">
              <span><strong>Ημερομηνία:</strong> ${formatDate(pdf.upload_date || pdf.uploadDate)}</span>
            </div>
            <p class="pdf-description">${pdf.description}</p>
          </div>
          
          <div class="pdf-actions">
            <a href="javascript:void(0)" onclick="viewPDF('${pdf.filename}')" class="btn-view" 
                  onmouseover="this.style.background='#F7C19C'; this.style.color='#BC5E29'; this.style.boxShadow='0 0 0 2px rgba(183, 54, 22, 0.495)'"
                  onmouseout="this.style.background='#4d2c1e'; this.style.color='#fff'; this.style.boxShadow='none'"
                  style="background: #4d2c1e;
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 0.5rem 1.5rem;
                    font-weight: 700;
                    font-size:small;
                    cursor: pointer;
                    transition: all 0.2s;">
              Προβολή
            </a>
            <a href="javascript:void(0)" onclick="downloadPDF('${pdf.filename}', '${pdf.title}')" class="btn-download" 
                   onmouseover="this.style.background='#FFC76C'; this.style.color='#C95A1F'; this.style.boxShadow='0 0 0 2px rgba(183, 54, 22, 0.495)'"
                  onmouseout="this.style.background='#ff7c4ce0'; this.style.color='#fff'; this.style.boxShadow='none'"
                  style="background: #ff7c4ce0;
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 0.5rem 1.5rem;
                    font-weight: 700;
                    font-size:small;
                    cursor: pointer;
                    transition: all 0.2s;">
               Λήψη
            </a>
          </div>
        </div>
      `).join('');
    }
    
    // Μορφοποίηση ημερομηνίας
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('el-GR');
    }
    
    // Προβολή PDF
    function viewPDF(filename) {
      // Αναζήτηση του PDF στη λίστα για να πάρουμε το ID
      const pdf = allPDFs.find(p => p.filename === filename);
      
      if (pdf) {
        // Άνοιγμα του PDF μέσω API για προβολή
        const pdfUrl = `/api/pallia-themata/${pdf.id}/view`;
        window.open(pdfUrl, '_blank');
      } else {
        alert('Το αρχείο δεν βρέθηκε');
      }
    }
    
    // Λήψη PDF
    function downloadPDF(filename, title) {
      // Αναζήτηση του PDF στη λίστα για να πάρουμε το ID
      const pdf = allPDFs.find(p => p.filename === filename);
      
      if (pdf) {
        // Λήψη του PDF μέσω API για download
        const pdfUrl = `/api/pallia-themata/${pdf.id}/download`;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Το αρχείο δεν βρέθηκε');
      }
    }
    
    // Φιλτράρισμα αρχείων
    function filterPDFs() {
      const lykeioFilter = document.getElementById('lykeio-filter').value;
      const yearFilter = document.getElementById('year-filter').value;
      const subjectFilter = document.getElementById('subject-filter').value;
      
      const filteredPDFs = allPDFs.filter(pdf => {
        const lykeioMatch = !lykeioFilter || (pdf.lykeio || 'ΓΕΛ') === lykeioFilter;
        const yearMatch = !yearFilter || pdf.year === yearFilter;
        const subjectMatch = !subjectFilter || pdf.subject === subjectFilter;
        
        return lykeioMatch && yearMatch && subjectMatch;
      });
      
      displayPDFs(filteredPDFs);
    }
    
    // Καθαρισμός φίλτρων
    function clearFilters() {
      document.getElementById('lykeio-filter').value = '';
      document.getElementById('year-filter').value = '';
      document.getElementById('subject-filter').value = '';
      updateSubjects(); // Επαναφορά όλων των μαθημάτων
      displayPDFs(allPDFs);
    }
    
    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
      loadPDFs();
      updateSubjects(); // Αρχική φόρτωση μαθημάτων
      
      document.getElementById('lykeio-filter').addEventListener('change', function() {
        updateSubjects();
        filterPDFs();
      });
      document.getElementById('year-filter').addEventListener('change', filterPDFs);
      document.getElementById('subject-filter').addEventListener('change', filterPDFs);
      document.getElementById('clear-filters').addEventListener('click', clearFilters);
    });