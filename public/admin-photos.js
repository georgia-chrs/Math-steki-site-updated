    class PhotoManager {
      constructor() {
        this.photos = [];
        this.init();
      }

      init() {
        this.setupEventListeners();
        this.loadPhotos();
      }

      setupEventListeners() {
        const photoInput = document.getElementById('photoInput');
        photoInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Prevent default drag behaviors
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) {
            this.handleFileUpload({ target: { files: e.dataTransfer.files } });
          }
        });
      }

      async loadPhotos() {
        try {
          const response = await fetch('/api/photos');
          if (response.ok) {
            this.photos = await response.json();
            this.renderPhotos();
            this.updateStats();
          } else {
            this.showAlert('Σφάλμα κατά τη φόρτωση των φωτογραφιών', 'error');
          }
        } catch (error) {
          console.error('Error loading photos:', error);
          this.showAlert('Σφάλμα δικτύου', 'error');
        }
      }

      async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => {
          if (!file.type.startsWith('image/')) {
            this.showAlert(`Το αρχείο ${file.name} δεν είναι εικόνα`, 'error');
            return false;
          }
          if (file.size > 10 * 1024 * 1024) { // 10MB
            this.showAlert(`Το αρχείο ${file.name} είναι πολύ μεγάλο (μέγιστο 10MB)`, 'error');
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) return;

        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressContainer.style.display = 'block';
        progressText.textContent = `Ανεβάζοντας ${validFiles.length} φωτογραφίες...`;

        // Upload all files at once
        const formData = new FormData();
        validFiles.forEach(file => {
          formData.append('photos', file);
        });

        try {
          const response = await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData
          });

          progressFill.style.width = '100%';

          if (response.ok) {
            const result = await response.json();
            this.showAlert(`Επιτυχής ανέβασμα ${result.files.length} φωτογραφιών!`, 'success');
          } else {
            const error = await response.json();
            this.showAlert(`Σφάλμα ανεβάσματος: ${error.error || 'Άγνωστο σφάλμα'}`, 'error');
          }
        } catch (error) {
          console.error('Upload error:', error);
          this.showAlert(`Σφάλμα δικτύου: ${error.message}`, 'error');
        }

        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
        
        // Reload photos
        await this.loadPhotos();
        
        // Clear file input
        event.target.value = '';
      }

      async deletePhoto(filename) {
        if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τη φωτογραφία "${filename}";`)) {
          return;
        }

        try {
          const response = await fetch(`/api/photos/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            this.showAlert('Η φωτογραφία διαγράφηκε επιτυχώς', 'success');
            await this.loadPhotos();
          } else {
            const error = await response.json();
            this.showAlert(`Σφάλμα διαγραφής: ${error.error}`, 'error');
          }
        } catch (error) {
          console.error('Delete error:', error);
          this.showAlert('Σφάλμα δικτύου', 'error');
        }
      }

      renderPhotos() {
        const grid = document.getElementById('photosGrid');
        
        if (this.photos.length === 0) {
          grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6c757d;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">📷</div>
              <h3>Δεν υπάρχουν φωτογραφίες</h3>
              <p>Ανεβάστε την πρώτη σας φωτογραφία για να ξεκινήσετε!</p>
            </div>
          `;
          return;
        }

        grid.innerHTML = this.photos.map(photo => `
          <div class="photo-card">
            <img src="/photos/${photo.filename}" alt="${photo.filename}" 
                 onclick="openModal('/photos/${photo.filename}')">
            <div class="delete-overlay" onclick="photoManager.deletePhoto('${photo.filename}')" title="Διαγραφή">
              X
            </div>
            <div class="photo-info">
              <div class="photo-name">${photo.filename}</div>
              <div class="photo-size">${this.formatFileSize(photo.size || 0)}</div>
              <div class="photo-actions">
                <button class="btn btn-view" onclick="openModal('/photos/${photo.filename}')">
                  Προβολή
                </button>
                <button class="btn btn-delete" onclick="photoManager.deletePhoto('${photo.filename}')">
                  Διαγραφή
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }

      updateStats() {
        const totalPhotos = this.photos.length;
        const totalSize = this.photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
        const lastUpload = this.photos.length > 0 ? 
          new Date().toLocaleDateString('el-GR') : '-';

        document.getElementById('totalPhotos').textContent = totalPhotos;
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
        document.getElementById('lastUpload').textContent = lastUpload;
      }

      formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }

      showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertContainer.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          alert.remove();
        }, 5000);
      }
    }

    // Global functions
    function openModal(imageSrc) {
      const modal = document.getElementById('imageModal');
      const modalImage = document.getElementById('modalImage');
      modalImage.src = imageSrc;
      modal.style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('imageModal').style.display = 'none';
    }

    // Close modal when clicking outside the image
    document.getElementById('imageModal').addEventListener('click', (e) => {
      if (e.target.id === 'imageModal') {
        closeModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Initialize the photo manager
    let photoManager;
    document.addEventListener('DOMContentLoaded', () => {
      photoManager = new PhotoManager();
    });
