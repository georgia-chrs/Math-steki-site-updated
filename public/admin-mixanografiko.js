    let currentFile = null;
    let allFiles = [];

    // Initialization
    document.addEventListener('DOMContentLoaded', function() {
      loadFiles();
      setupFileUpload();
      setupForm();
    });

    // Setup file upload
    function setupFileUpload() {
      const fileUpload = document.getElementById('file-upload');
      const fileInput = document.getElementById('pdf-file');
      const fileInfo = document.getElementById('file-info');

      fileUpload.addEventListener('click', () => fileInput.click());
      
      fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('dragover');
      });
      
      fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('dragover');
      });
      
      fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleFileSelect(files[0]);
        }
      });
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          handleFileSelect(e.target.files[0]);
        }
      });
    }

    // Handle file selection
    function handleFileSelect(file) {
      if (file.type !== 'application/pdf') {
        showAlert('Παρακαλώ επιλέξτε μόνο PDF αρχεία.', 'error');
        return;
      }

      currentFile = file;
      const fileInfo = document.getElementById('file-info');
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      
      fileInfo.innerHTML = `
        <strong>📁 ${file.name}</strong><br>
        <span>Μέγεθος: ${fileSize} MB</span>
      `;
      
      // Auto-fill filename if empty
      const filenameInput = document.getElementById('filename');
      if (!filenameInput.value) {
        filenameInput.value = file.name;
      }
    }

    // Setup form submission
    function setupForm() {
      const form = document.getElementById('mixanografiko-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
      });
    }

    // Submit form
    async function submitForm() {
      const editId = document.getElementById('edit-id').value;
      const isEdit = !!editId;
      
      const formData = {
        title: document.getElementById('title').value,
        lykeio: document.getElementById('lykeio').value,
        field: document.getElementById('field').value,
        specialty: document.getElementById('specialty').value || '',
        description: document.getElementById('description').value || '',
        filename: document.getElementById('filename').value
      };

      // Validation
      if (!formData.title || !formData.lykeio || !formData.field || !formData.filename) {
        showAlert('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.', 'error');
        return;
      }

      if (!isEdit && !currentFile) {
        showAlert('Παρακαλώ επιλέξτε αρχείο PDF.', 'error');
        return;
      }

      // Add file data if new file selected
      if (currentFile) {
        try {
          const fileData = await fileToBase64(currentFile);
          formData.fileData = fileData;
        } catch (error) {
          showAlert('Σφάλμα επεξεργασίας αρχείου.', 'error');
          return;
        }
      }

      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = isEdit ? 'Ενημέρωση...' : 'Αποθήκευση...';

      try {
        const url = isEdit ? `/api/mixanografiko/${editId}` : '/api/mixanografiko';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          showAlert(
            isEdit ? 'Το αρχείο ενημερώθηκε επιτυχώς!' : 'Το αρχείο προστέθηκε επιτυχώς!', 
            'success'
          );
          resetForm();
          loadFiles();
          if (isEdit) {
            closeEditModal();
          }
        } else {
          showAlert(result.error || 'Προέκυψε σφάλμα.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showAlert('Σφάλμα επικοινωνίας με τον server.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? ' Ενημέρωση' : ' Αποθήκευση Αρχείου';
      }
    }

    // Convert file to base64
    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }

    // Load files from server
    async function loadFiles() {
      const loading = document.getElementById('loading');
      const tableContainer = document.getElementById('table-container');
      
      loading.style.display = 'block';
      tableContainer.style.display = 'none';

      try {
        const response = await fetch('/api/mixanografiko');
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        
        allFiles = await response.json();
        displayFiles(allFiles);
        
        loading.style.display = 'none';
        tableContainer.style.display = 'block';
      } catch (error) {
        console.error('Error loading files:', error);
        loading.innerHTML = '<div style="color: red;">Σφάλμα φόρτωσης αρχείων. Βεβαιωθείτε ότι ο server είναι ενεργός.</div>';
      }
    }

    // Display files in table
    function displayFiles(files) {
      const tbody = document.getElementById('files-table-body');
      
      if (files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">Δεν υπάρχουν αρχεία</td></tr>';
        return;
      }

      tbody.innerHTML = files.map(file => `
        <tr>
          <td>${file.id}</td>
          <td>${file.title}</td>
          <td>${file.lykeio}</td>
          <td>${file.field}</td>
          <td>${file.specialty || '-'}</td>
          <td>${file.filename}</td>
          <td>${file.file_size || '-'}</td>
          <td>${file.upload_date || '-'}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-small" onclick="downloadFile(${file.id})">
                 Λήψη
              </button>
              <button class="btn btn-secondary btn-small" onclick="editFile(${file.id})">
                 Επεξεργασία
              </button>
              <button class="btn btn-danger btn-small" onclick="deleteFile(${file.id}, '${file.title}')">
                 Διαγραφή
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Download file
    function downloadFile(id) {
      window.open(`/api/mixanografiko/download/${id}`, '_blank');
    }

    // Edit file
    function editFile(id) {
      const file = allFiles.find(f => f.id === id);
      if (!file) return;

      // Fill form with file data
      document.getElementById('edit-id').value = file.id;
      document.getElementById('title').value = file.title;
      document.getElementById('lykeio').value = file.lykeio;
      document.getElementById('field').value = file.field;
      document.getElementById('specialty').value = file.specialty || '';
      document.getElementById('filename').value = file.filename;
      document.getElementById('description').value = file.description || '';

      // Update form title
      document.getElementById('form-title').textContent = ' Επεξεργασία Αρχείου Μηχανογραφικού';
      document.getElementById('submit-btn').textContent = ' Ενημέρωση';

      // Clear file selection
      currentFile = null;
      document.getElementById('file-info').innerHTML = '<em>Δεν επιλέχθηκε νέο αρχείο (θα διατηρηθεί το υπάρχον)</em>';

      // Scroll to form
      document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete file
    async function deleteFile(id, title) {
      if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το αρχείο "${title}";`)) {
        return;
      }

      try {
        const response = await fetch(`/api/mixanografiko/${id}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
          showAlert('Το αρχείο διαγράφηκε επιτυχώς!', 'success');
          loadFiles();
        } else {
          showAlert(result.error || 'Σφάλμα διαγραφής αρχείου.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showAlert('Σφάλμα επικοινωνίας με τον server.', 'error');
      }
    }

    // Reset form
    function resetForm() {
      document.getElementById('mixanografiko-form').reset();
      document.getElementById('edit-id').value = '';
      document.getElementById('form-title').textContent = ' Προσθήκη Νέου Αρχείου Μηχανογραφικού';
      document.getElementById('submit-btn').textContent = ' Αποθήκευση Αρχείου';
      document.getElementById('file-info').innerHTML = '';
      currentFile = null;
    }

    // Show alert
    function showAlert(message, type) {
      const alertContainer = document.getElementById('alert-container');
      const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
      
      alertContainer.innerHTML = `
        <div class="alert ${alertClass}">
          ${message}
        </div>
      `;
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        alertContainer.innerHTML = '';
      }, 5000);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Modal functions
    function closeEditModal() {
      document.getElementById('edit-modal').style.display = 'none';
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
      const modal = document.getElementById('edit-modal');
      if (event.target === modal) {
        closeEditModal();
      }
    }
