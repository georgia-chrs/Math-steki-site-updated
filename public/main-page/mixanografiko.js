    // Δυναμική φόρτωση PDF αρχείων μηχανογραφικού
    let allPDFs = [];
    let isBackendAvailable = false;
    
    // Φόρτωση αρχείων PDF από το backend
    async function loadPDFs() {
      const loadingDiv = document.querySelector('.loading');
      if (loadingDiv) loadingDiv.style.display = 'block';
      
      try {
        const response = await fetch('/api/mixanografiko');
        if (response.ok) {
          allPDFs = await response.json();
          isBackendAvailable = true;
          displayPDFs(allPDFs);
          updateFilesInfo(allPDFs.length);
          showBackendStatus();
        } else {
          throw new Error('Σφάλμα στη λήψη δεδομένων από το backend');
        }
      } catch (error) {
        console.warn('Backend δεν είναι διαθέσιμο, χρήση sample δεδομένων:', error);
        // Fallback σε sample data αν το backend δεν είναι διαθέσιμο
        isBackendAvailable = false;
        loadSampleData();
      } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
      }
    }
    
    // Αρχικό load sample δεδομένων αν δεν υπάρχει backend
    allPDFs = [
      {
        id: 1,
        title: "Οδηγός Μηχανογραφικού ΓΕΛ Θετικές Επιστήμες",
        lykeio: "ΓΕΛ",
        field: "Θετικές Επιστήμες",
        specialty: "",
        description: "Πλήρης οδηγός για τη συμπλήρωση του μηχανογραφικού για υποψηφίους θετικών επιστημών",
        filename: "odigos_mixanografikoy_gel_thetikes.pdf",
        file_size: "2.1 MB",
        upload_date: "2024-02-15"
      },
      {
        id: 2,
        title: "Πίνακας Αντιστοιχίας Σχολών Καλών Τεχνών",
        lykeio: "ΓΕΛ",
        field: "Καλές Τέχνες", 
        specialty: "Εικαστικά",
        description: "Αναλυτικός πίνακας με τις σχολές καλών τεχνών και τα μαθήματα που εξετάζουν",
        filename: "pinakas_antistixias_kales_texnes.pdf",
        file_size: "1.8 MB",
        upload_date: "2024-02-10"
      },
      {
        id: 3,
        title: "Μηχανογραφικό ΕΠΑΛ Τεχνολογικών Σπουδών",
        lykeio: "ΕΠΑΛ",
        field: "Τεχνολογικές Επιστήμες",
        specialty: "Τεχνολογικά",
        description: "Οδηγός για απόφοιτους ΕΠΑΛ που θέλουν να συνεχίσουν σε τεχνολογικές σχολές",
        filename: "mixanografiko_epal_texnologikes.pdf",
        file_size: "1.5 MB",
        upload_date: "2024-02-05"
      },
      {
        id: 4,
        title: "Ειδικά Μαθήματα Μουσικής - Οδηγίες",
        lykeio: "ΓΕΛ",
        field: "Καλές Τέχνες",
        specialty: "Μουσική",
        description: "Οδηγίες για τις εξετάσεις ειδικών μαθημάτων μουσικής και επιλογή σχολών",
        filename: "eidika_mathimata_mousiki.pdf",
        file_size: "1.2 MB",
        upload_date: "2024-01-30"
      },
      {
        id: 5,
        title: "Σχολές Φυσικής Αγωγής - Μηχανογραφικό",
        lykeio: "ΓΕΛ",
        field: "Αθλητισμός",
        specialty: "Φυσική Αγωγή",
        description: "Πληροφορίες για τις σχολές φυσικής αγωγής και αθλητισμού",
        filename: "scholes_fysikis_agogis.pdf",
        file_size: "1.7 MB",
        upload_date: "2024-01-25"
      },
      {
        id: 6,
        title: "Ανθρωπιστικές Σπουδές - Πλήρης Οδηγός",
        lykeio: "ΓΕΛ",
        field: "Ανθρωπιστικές Επιστήμες",
        specialty: "",
        description: "Αναλυτικός οδηγός για τις ανθρωπιστικές σπουδές και τις επιλογές σχολών",
        filename: "anthropistikes_spoydes_odigos.pdf",
        file_size: "2.3 MB",
        upload_date: "2024-01-20"
      }
    ];
    
    document.addEventListener('DOMContentLoaded', function() {
      displayPDFs(allPDFs);
      updateFilesInfo(allPDFs.length);
      filterPDFs();
    });
    
    // Fallback function με sample data
    function loadSampleData() {
      allPDFs = [
      {
        id: 1,
        title: "Οδηγός Μηχανογραφικού ΓΕΛ Θετικές Επιστήμες",
        lykeio: "ΓΕΛ",
        field: "Θετικές Επιστήμες",
        specialty: "",
        description: "Πλήρης οδηγός για τη συμπλήρωση του μηχανογραφικού για υποψηφίους θετικών επιστημών",
        filename: "odigos_mixanografikoy_gel_thetikes.pdf",
        file_size: "2.1 MB",
        upload_date: "2024-02-15"
      },
      {
        id: 2,
        title: "Πίνακας Αντιστοιχίας Σχολών Καλών Τεχνών",
        lykeio: "ΓΕΛ",
        field: "Καλές Τέχνες", 
        specialty: "Εικαστικά",
        description: "Αναλυτικός πίνακας με τις σχολές καλών τεχνών και τα μαθήματα που εξετάζουν",
        filename: "pinakas_antistixias_kales_texnes.pdf",
        file_size: "1.8 MB",
        upload_date: "2024-02-10"
      },
      {
        id: 3,
        title: "Μηχανογραφικό ΕΠΑΛ Τεχνολογικών Σπουδών",
        lykeio: "ΕΠΑΛ",
        field: "Τεχνολογικές Επιστήμες",
        specialty: "Τεχνολογικά",
        description: "Οδηγός για απόφοιτους ΕΠΑΛ που θέλουν να συνεχίσουν σε τεχνολογικές σχολές",
        filename: "mixanografiko_epal_texnologikes.pdf",
        file_size: "1.5 MB",
        upload_date: "2024-02-05"
      },
      {
        id: 4,
        title: "Ειδικά Μαθήματα Μουσικής - Οδηγίες",
        lykeio: "ΓΕΛ",
        field: "Καλές Τέχνες",
        specialty: "Μουσική",
        description: "Οδηγίες για τις εξετάσεις ειδικών μαθημάτων μουσικής και επιλογή σχολών",
        filename: "eidika_mathimata_mousiki.pdf",
        file_size: "1.2 MB",
        upload_date: "2024-01-30"
      },
      {
        id: 5,
        title: "Σχολές Φυσικής Αγωγής - Μηχανογραφικό",
        lykeio: "ΓΕΛ",
        field: "Αθλητισμός",
        specialty: "Φυσική Αγωγή",
        description: "Πληροφορίες για τις σχολές φυσικής αγωγής και αθλητισμού",
        filename: "scholes_fysikis_agogis.pdf",
        file_size: "1.7 MB",
        upload_date: "2024-01-25"
      },
      {
        id: 6,
        title: "Ανθρωπιστικές Σπουδές - Πλήρης Οδηγός",
        lykeio: "ΓΕΛ",
        field: "Ανθρωπιστικές Επιστήμες",
        specialty: "",
        description: "Αναλυτικός οδηγός για τις ανθρωπιστικές σπουδές και τις επιλογές σχολών",
        filename: "anthropistikes_spoydes_odigos.pdf",
        file_size: "2.3 MB",
        upload_date: "2024-01-20"
      }
    ];
    
    displayPDFs(allPDFs);
    updateFilesInfo(allPDFs.length);
    showBackendStatus();
    }
    
    // Εμφάνιση PDF αρχείων
    function displayPDFs(pdfs) {
      const container = document.getElementById('pdf-container');
      const noFilesMessage = document.getElementById('no-files-message');
      
      if (pdfs.length === 0) {
        container.style.display = 'none';
        noFilesMessage.style.display = 'block';
        return;
      }
      
      container.style.display = 'grid';
      noFilesMessage.style.display = 'none';
      
      container.innerHTML = pdfs.map(pdf => `
        <div class="pdf-item">
          <div class="pdf-header">
            <svg class="pdf-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <h3 class="pdf-title">${pdf.title}</h3>
          </div>
          
          <div class="pdf-info">
            <div class="pdf-meta">
              <span><strong>Λύκειο:</strong> ${pdf.lykeio}</span>
              <span><strong>Μέγεθος:</strong> ${pdf.file_size}</span>
            </div>
            <div class="pdf-meta">
              <span><strong>Πεδίο:</strong> ${pdf.field}</span>
              ${pdf.specialty ? `<span class="specialty-badge">${pdf.specialty}</span>` : ''}
            </div>
            <div class="pdf-description">
              ${pdf.description || 'Οδηγός μηχανογραφικού'}
            </div>
          </div>
          
          <div class="pdf-actions">
            ${isBackendAvailable && pdf.id ? `
              <a href="/api/mixanografiko/view/${pdf.id}" target="_blank" class="btn-view"
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
                    transition: all 0.2s;">Προβολή
              </a>
              <a href="/api/mixanografiko/download/${pdf.id}" download class="btn-download">
                 Λήψη
              </a>
            ` : `
              <button class="btn-view" onclick="showSampleAlert()"
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
                    transition: all 0.2s;">Προβολή
              </button>
              <button class="btn-download" onclick="showSampleAlert()"
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
                    transition: all 0.2s;">Λήψη
              </button>
            `}
          </div>
        </div>
      `).join('');
    }
    
    // Ειδοποίηση για sample data
    function showSampleAlert() {
      alert('Αυτό είναι δείγμα δεδομένων για επίδειξη.\n\nΓια πραγματική λειτουργία λήψης και προβολής αρχείων, παρακαλώ:\n1. Ενεργοποιήστε το backend server\n2. Ανεβάστε πραγματικά PDF αρχεία μέσω του admin panel');
    }
    
    // Εμφάνιση κατάστασης backend
    function showBackendStatus() {
      const backendStatus = document.getElementById('backend-status');
      const backendStatusText = document.getElementById('backend-status-text');
      
      if (!isBackendAvailable) {
        backendStatusText.textContent = 'Χρησιμοποιούνται δεδομένα επίδειξης. Για πλήρη λειτουργία ενεργοποιήστε το backend server.';
        backendStatus.style.display = 'block';
      } else {
        backendStatus.style.display = 'none';
      }
    }
    
    // Ενημέρωση πληροφοριών αρχείων
    function updateFilesInfo(count) {
      const filesInfo = document.getElementById('files-info');
      const filesCountText = document.getElementById('files-count-text');
      
      if (count > 0) {
        filesInfo.style.display = 'block';
        filesCountText.textContent = `Βρέθηκαν ${count} οδηγοί μηχανογραφικού`;
      } else {
        filesInfo.style.display = 'none';
      }
    }
    
    // --- ΝΕΟ JAVASCRIPT ΓΙΑ DROPDOWN ΦΙΛΤΡΑ ---
let currentFilters = {
  lykeio: '',
  field: '',
  specialty: ''
};

function filterPDFs() {
  let filteredPDFs = allPDFs.filter(pdf => {
    const matchesLykeio = !currentFilters.lykeio || pdf.lykeio === currentFilters.lykeio;
    const matchesField = !currentFilters.field || pdf.field === currentFilters.field;
    const matchesSpecialty = !currentFilters.specialty || pdf.specialty === currentFilters.specialty;
    return matchesLykeio && matchesField && matchesSpecialty;
  });
  displayPDFs(filteredPDFs);
  updateFilesInfo(filteredPDFs.length);
}

function clearAllFilters() {
  currentFilters = { lykeio: '', field: '', specialty: '' };
  document.getElementById('lykeio-btn').textContent = 'Τύπος Λυκείου';
  document.getElementById('field-btn').textContent = 'Πεδίο Σπουδών';
  document.getElementById('specialty-btn').textContent = 'Ειδικά Μαθήματα';
  filterPDFs();
}

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', function(e) {
    e.stopPropagation();
    const options = document.getElementById(button.id.replace('-btn', '-options'));
    const isOpen = options.classList.contains('show');
    document.querySelectorAll('.filter-options').forEach(opt => opt.classList.remove('show'));
    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
    if (!isOpen) {
      options.classList.add('show');
      button.classList.add('active');
    }
  });
});

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('filter-option')) {
    const value = e.target.getAttribute('data-value');
    const filterType = e.target.closest('.filter-dropdown').querySelector('.filter-button').id.replace('-btn', '');
    currentFilters[filterType] = value;
    // Ενημέρωση button text
    if (value === '') {
      if (filterType === 'lykeio') document.getElementById('lykeio-btn').textContent = 'Τύπος Λυκείου';
      if (filterType === 'field') document.getElementById('field-btn').textContent = 'Πεδίο Σπουδών';
      if (filterType === 'specialty') document.getElementById('specialty-btn').textContent = 'Ειδικά Μαθήματα';
    } else {
      document.getElementById(filterType + '-btn').textContent = e.target.textContent;
    }
    filterPDFs();
    document.querySelectorAll('.filter-options').forEach(opt => opt.classList.remove('show'));
    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
  }
  // Κλείσιμο dropdown όταν κάνεις click έξω
  if (!e.target.closest('.filter-dropdown')) {
    document.querySelectorAll('.filter-options').forEach(opt => opt.classList.remove('show'));
    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
  }
});

document.getElementById('clear-filters-btn').addEventListener('click', clearAllFilters);

document.addEventListener('DOMContentLoaded', function() {
  filterPDFs();
});
