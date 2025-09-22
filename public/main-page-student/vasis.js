// Μεταβλητές για τα φίλτρα
let currentFilters = {
  lykeio: '',
  year: '',
  field: ''
};

// Dropdown functionality
function initializeDropdowns() {
  const dropdownButtons = document.querySelectorAll('.filter-button');
  dropdownButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdownId = this.id.replace('-btn', '-options');
      const dropdown = document.getElementById(dropdownId);
      const isOpen = dropdown.classList.contains('show');
      document.querySelectorAll('.filter-options').forEach(opt => {
        opt.classList.remove('show');
      });
      document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
      });
      if (!isOpen) {
        dropdown.classList.add('show');
        this.classList.add('active');
      }
    });
  });
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-option')) {
      handleFilterOptionClick(e.target);
    }
  });
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
  // Διόρθωση: χρήση του σωστού id για το κουμπί καθαρισμού φίλτρων με έλεγχο ύπαρξης
  var clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      clearAllFilters();
    });
  }
}
function handleFilterOptionClick(option) {
  const dropdown = option.parentElement;
  const dropdownId = dropdown.id;
  const buttonId = dropdownId.replace('-options', '-btn');
  const button = document.getElementById(buttonId);
  const value = option.dataset.value;
  const text = option.textContent;
  if (value === '' && dropdownId === 'field-options') {
    button.textContent = 'Πεδίο Σπουδών';
  } else if (value === '' && dropdownId === 'lykeio-options') {
    button.textContent = 'Λύκειο';
  } else if (value === '' && dropdownId === 'year-options') {
    button.textContent = 'Έτος';
  } else {
    button.textContent = text;
  }
  const filterType = dropdownId.replace('-options', '');
  currentFilters[filterType] = value;
  filterPDFs();
}
function clearAllFilters() {
  currentFilters = { lykeio: '', year: '', field: '' };
  document.getElementById('lykeio-btn').textContent = 'Λύκειο';
  document.getElementById('year-btn').textContent = 'Έτος';
  document.getElementById('field-btn').textContent = 'Πεδίο Σπουδών';
  filterPDFs();
}
document.addEventListener('DOMContentLoaded', function() {
  initializeDropdowns();
  loadPDFs();
});

    // Δυναμική φόρτωση PDF αρχείων βάσεων σχολών
    let allPDFs = [];
    
    // Εικονικά δεδομένα για επίδειξη - θα αντικατασταθούν με πραγματικά από backend
    const samplePDFs = [
      {
        id: 1,
        title: "Βάσεις Θετικών Επιστημών 2024",
        year: "2024",
        lykeio: "ΓΕΛ",
        field: "Θετικές Επιστήμες",
        description: "Βάσεις εισαγωγής για τις σχολές θετικών επιστημών",
        filename: "vaseis_thetikes_2024.pdf",
        file_size: "1.2 MB",
        upload_date: "2024-01-15"
      },
      {
        id: 2,
        title: "Βάσεις Ανθρωπιστικών Σπουδών 2024",
        year: "2024",
        lykeio: "ΓΕΛ", 
        field: "Ανθρωπιστικές Επιστήμες",
        description: "Βάσεις εισαγωγής για τις σχολές ανθρωπιστικών επιστημών",
        filename: "vaseis_anthropistikes_2024.pdf",
        file_size: "950 KB",
        upload_date: "2024-01-15"
      },
      {
        id: 3,
        title: "Βάσεις ΕΠΑΛ Τεχνολογικών 2024",
        year: "2024",
        lykeio: "ΕΠΑΛ",
        field: "Τεχνολογικές Επιστήμες",
        description: "Βάσεις εισαγωγής για τις τεχνολογικές σχολές από ΕΠΑΛ",
        filename: "vaseis_epal_tech_2024.pdf",
        file_size: "850 KB",
        upload_date: "2024-01-10"
      },
      {
        id: 4,
        title: "Βάσεις Οικονομικών Σπουδών 2023",
        year: "2023",
        lykeio: "ΓΕΛ",
        field: "Οικονομικές Επιστήμες",
        description: "Βάσεις εισαγωγής για τις σχολές οικονομικών επιστημών",
        filename: "vaseis_oikonomikes_2023.pdf",
        file_size: "1.1 MB",
        upload_date: "2023-07-20"
      },
      {
        id: 5,
        title: "Βάσεις Επιστημών Υγείας 2024",
        year: "2024",
        lykeio: "ΓΕΛ",
        field: "Επιστήμες Υγείας",
        description: "Βάσεις εισαγωγής για τις σχολές επιστημών υγείας",
        filename: "vaseis_ygeias_2024.pdf",
        file_size: "1.4 MB",
        upload_date: "2024-01-20"
      }
    ];
    
    // Φόρτωση αρχείων από backend ή fallback σε sample data
    async function loadPDFs() {
      try {
        // Προσπάθεια φόρτωσης από backend API
        const response = await fetch('/api/vaseis-scholon');
        if (response.ok) {
          const data = await response.json();
          allPDFs = data;
        } else {
          // Fallback σε sample data
          allPDFs = samplePDFs;
        }
      } catch (error) {
        console.log('Backend not available, using sample data');
        allPDFs = samplePDFs;
      }
      
      displayPDFs(allPDFs);
      updateFilesInfo(allPDFs.length);
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
              <span><strong>Έτος:</strong> ${pdf.year}</span>
              <span><strong>Λύκειο:</strong> ${pdf.lykeio}</span>
            </div>
            <div class="pdf-meta">
              <span><strong>Πεδίο:</strong> ${pdf.field}</span>
              <span><strong>Μέγεθος:</strong> ${pdf.file_size}</span>
            </div>
            <div class="pdf-description">
              ${pdf.description || 'Πληροφορίες βάσεων σχολών'}
            </div>
          </div>
          
          <div class="pdf-actions">
            <a href="/api/vaseis-scholon/${pdf.id}/view" target="_blank" class="btn-view"                  
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
            <a href="/api/vaseis-scholon/${pdf.id}/download" download class="btn-download"
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
            </a>
          </div>
        </div>
      `).join('');
    }
    
    // Ενημέρωση πληροφοριών αρχείων
    function updateFilesInfo(count) {
      const filesInfo = document.getElementById('files-info');
      const filesCountText = document.getElementById('files-count-text');
      
      if (count > 0) {
        filesInfo.style.display = 'block';
        filesCountText.textContent = `Βρέθηκαν ${count} αρχεία βάσεων σχολών`;
      } else {
        filesInfo.style.display = 'none';
      }
    }
    
    // Φιλτράρισμα αρχείων
    function filterPDFs() {
      // Χρησιμοποιούμε τα φίλτρα από το αντικείμενο currentFilters
      const yearFilter = currentFilters.year;
      const lykeioFilter = currentFilters.lykeio;
      const fieldFilter = currentFilters.field;

      let filteredPDFs = allPDFs.filter(pdf => {
        const matchesYear = !yearFilter || pdf.year === yearFilter;
        const matchesLykeio = !lykeioFilter || pdf.lykeio === lykeioFilter;
        const matchesField = !fieldFilter || pdf.field === fieldFilter;
        return matchesYear && matchesLykeio && matchesField;
      });
      
      displayPDFs(filteredPDFs);
      updateFilesInfo(filteredPDFs.length);
    }
    
    // Καθαρισμός φίλτρων
    function clearFilters() {
      document.getElementById('year-filter').value = '';
      document.getElementById('lykeio-filter').value = '';
      document.getElementById('field-filter').value = '';
      
      displayPDFs(allPDFs);
      updateFilesInfo(allPDFs.length);
    }
    
    // Event listeners
    document.getElementById('year-filter').addEventListener('change', filterPDFs);
    document.getElementById('lykeio-filter').addEventListener('change', filterPDFs);
    document.getElementById('field-filter').addEventListener('change', filterPDFs);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Φόρτωση αρχείων κατά την εκκίνηση
    document.addEventListener('DOMContentLoaded', function() {
      loadPDFs();
    });
    
    // Επιλογή φίλτρων από dropdown
    document.querySelectorAll('.filter-button').forEach(button => {
      button.addEventListener('click', function() {
        const options = this.nextElementSibling;
        const isActive = this.classList.toggle('active');
        
        // Εμφάνιση ή απόκρυψη επιλογών
        options.classList.toggle('show', isActive);
        
        // Κλείσιμο άλλων dropdowns
        if (isActive) {
          document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
            if (dropdown !== this.parentElement) {
              dropdown.querySelector('.filter-button').classList.remove('active');
              dropdown.querySelector('.filter-options').classList.remove('show');
            }
          });
        }
      });
    });
    
    // Επιλογή φίλτρου
    document.querySelectorAll('.filter-option').forEach(option => {
      option.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        const group = this.closest('.filter-dropdown');
        
        // Ενημέρωση επιλεγμένου φίλτρου
        group.querySelector('.filter-button').textContent = this.textContent;
        group.querySelector('.filter-option.selected')?.classList.remove('selected');
        this.classList.add('selected');
        
        // Φιλτράρισμα αρχείων
        if (group.querySelector('.filter-button').id === 'lykeio-btn') {
          const lykeioValue = value;
          const yearValue = document.getElementById('year-options').querySelector('.filter-option.selected')?.getAttribute('data-value') || '';
          const fieldValue = document.getElementById('field-options').querySelector('.filter-option.selected')?.getAttribute('data-value') || '';
          
          let filteredPDFs = allPDFs.filter(pdf => {
            const matchesYear = !yearValue || pdf.year === yearValue;
            const matchesLykeio = !lykeioValue || pdf.lykeio === lykeioValue;
            const matchesField = !fieldValue || pdf.field === fieldValue;
            
            return matchesYear && matchesLykeio && matchesField;
          });
          
          displayPDFs(filteredPDFs);
          updateFilesInfo(filteredPDFs.length);
        }
      });
    });
