    class PhotoGallery {
      constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.photo-slide');
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.totalSlides = this.slides.length;
        this.autoSlideInterval = null;
        
        this.init();
      }
      
      init() {
        // Refresh slides and thumbnails (in case they were loaded dynamically)
        this.slides = document.querySelectorAll('.photo-slide');
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.totalSlides = this.slides.length;
        
        if (this.totalSlides === 0) return; // No photos to display
        
        // Ensure first slide is visible
        if (this.slides[0]) this.slides[0].classList.add('active');
        if (this.thumbnails[0]) this.thumbnails[0].classList.add('active');
        
        // Event listeners for navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Event listeners for thumbnails
        this.thumbnails.forEach((thumb, index) => {
          thumb.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') this.prevSlide();
          if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Touch/swipe support
        this.addTouchSupport();
        
        // Auto-slide functionality
        this.startAutoSlide();
        
        // Pause auto-slide on hover
        const gallery = document.querySelector('.gallery-container');
        gallery.addEventListener('mouseenter', () => this.stopAutoSlide());
        gallery.addEventListener('mouseleave', () => this.startAutoSlide());
        
        // Update counter
        this.updateCounter();
      }
      
      goToSlide(slideIndex, direction = null) {
        // Remove active classes
        this.slides[this.currentSlide].classList.remove('active');
        this.thumbnails[this.currentSlide].classList.remove('active');
        this.slides[this.currentSlide].classList.remove('from-right', 'from-left');
        this.slides[slideIndex].classList.remove('from-right', 'from-left');

        // Add animation direction
        if (direction === 'right') {
          this.slides[slideIndex].classList.add('from-right');
          setTimeout(() => {
            this.slides[slideIndex].classList.remove('from-right');
          }, 10);
        } else if (direction === 'left') {
          this.slides[slideIndex].classList.add('from-left');
          setTimeout(() => {
            this.slides[slideIndex].classList.remove('from-left');
          }, 10);
        }

        // Update current slide
        this.currentSlide = slideIndex;

        // Add active classes
        this.slides[this.currentSlide].classList.add('active');
        this.thumbnails[this.currentSlide].classList.add('active');

        this.updateCounter();
      }
      
      nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex, 'right');
      }
      
      prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex, 'left');
      }
      
      updateCounter() {
        const currentPhotoEl = document.getElementById('currentPhoto');
        const totalPhotosEl = document.getElementById('totalPhotos');
        
        if (currentPhotoEl) currentPhotoEl.textContent = this.currentSlide + 1;
        if (totalPhotosEl) totalPhotosEl.textContent = this.totalSlides;
      }
      
      startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
          this.nextSlide();
        }, 5000); // Change slide every 5 seconds
      }
      
      stopAutoSlide() {
        if (this.autoSlideInterval) {
          clearInterval(this.autoSlideInterval);
          this.autoSlideInterval = null;
        }
      }
      
      addTouchSupport() {
        const gallery = document.querySelector('.photos-wrapper');
        let startX = 0;
        let endX = 0;
        
        gallery.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
        });
        
        gallery.addEventListener('touchmove', (e) => {
          e.preventDefault(); // Prevent scrolling
        });
        
        gallery.addEventListener('touchend', (e) => {
          endX = e.changedTouches[0].clientX;
          const difference = startX - endX;
          
          if (Math.abs(difference) > 50) { // Minimum swipe distance
            if (difference > 0) {
              this.nextSlide(); // Swipe left - next slide
            } else {
              this.prevSlide(); // Swipe right - previous slide
            }
          }
        });
      }
    }
    
    // Initialize gallery when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Load photos from API and initialize gallery
      loadPhotosFromAPI();
      
      // Set up auto-refresh every 30 seconds to check for new photos
      setInterval(loadPhotosFromAPI, 30000);
    });

    // Function to load photos from API
    async function loadPhotosFromAPI() {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error('Failed to load photos');
        }

        const photos = await response.json();
        
        if (photos.length === 0) {
          showNoPhotosMessage();
          return;
        }

        renderPhotosGallery(photos);
        initializePhotoGallery(photos);
      } catch (error) {
        console.error('Error loading photos:', error);
        showErrorMessage();
      }
    }

    // Function to render photos gallery HTML
    function renderPhotosGallery(photos) {
      const photosWrapper = document.getElementById('photosWrapper');
      const photoThumbnails = document.getElementById('photoThumbnails');
      
      // Render main slides
      const slidesHTML = photos.map((photo, index) => `
        <div class="photo-slide ${index === 0 ? 'active' : ''}">
          <img src="/photos/${photo.filename}" alt="${photo.filename}">
        </div>
      `).join('');
      
      photosWrapper.innerHTML = slidesHTML;
      
      // Render thumbnails
      const thumbnailsHTML = photos.map((photo, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-slide="${index}">
          <img src="/photos/${photo.filename}" alt="Thumbnail ${index + 1}">
        </div>
      `).join('');
      
      photoThumbnails.innerHTML = thumbnailsHTML;
      
      // Update counter
      document.getElementById('totalPhotos').textContent = photos.length;
      document.getElementById('currentPhoto').textContent = photos.length > 0 ? '1' : '0';
    }

    // Function to get caption for photos


    // Function to initialize photo gallery after photos are loaded
    function initializePhotoGallery(photos) {
      if (photos.length === 0) return;
      
      // Simple image loading handler
      const images = document.querySelectorAll('.photo-slide img, .thumbnail img');
      images.forEach((img, index) => {
        img.addEventListener('error', function() {
          console.error(`Image failed to load: ${this.src}`);
          const placeholder = document.createElement('div');
          placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 14px;
          `;
          placeholder.textContent = `Εικόνα ${index + 1} - Δεν βρέθηκε`;
          this.parentNode.replaceChild(placeholder, this);
        });
        
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
      });
      
      new PhotoGallery();
    }

    // Function to show no photos message
    function showNoPhotosMessage() {
      const photosWrapper = document.getElementById('photosWrapper');
      photosWrapper.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem;"></div>
            <h3>Δεν υπάρχουν φωτογραφίες</h3>
            <p>Δεν έχουν ανέβει φωτογραφίες ακόμη.</p>
          </div>
        </div>
      `;
      
      document.getElementById('photoThumbnails').innerHTML = '';
      document.getElementById('totalPhotos').textContent = '0';
      document.getElementById('currentPhoto').textContent = '0';
    }

    // Function to show error message
    function showErrorMessage() {
      const photosWrapper = document.getElementById('photosWrapper');
      photosWrapper.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #e74c3c; text-align: center;">
          <div>
            <div style="font-size: 3rem; margin-bottom: 1rem;"></div>
            <h3>Σφάλμα φόρτωσης</h3>
            <p>Δεν ήταν δυνατή η φόρτωση των φωτογραφιών.</p>
            <button onclick="loadPhotosFromAPI()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Δοκιμή ξανά
            </button>
          </div>
        </div>
      `;
    }
    
    // Image loading with error handling
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.querySelectorAll('.photo-slide img, .thumbnail img');
      images.forEach((img, index) => {
        console.log(`Image ${index + 1}: ${img.src}`);
      });
    });
