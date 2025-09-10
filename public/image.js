document.addEventListener("DOMContentLoaded", function() {
  const slides = document.querySelectorAll('.slideshow-wrapper .slide');
  let current = 0;

  function showSlide(index) {
    slides.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  showSlide(current);

  setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }, 3000);
});


// Simple responsive slideshow for mobile
// Only one image is visible at a time, centered, with fade in/out effect

document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.slideshow-wrapper .slide');
  let current = 0;

  function showSlide(index) {
    slides.forEach((img, i) => {
      if (i === index) {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.position = 'static';
        img.style.zIndex = '2';
      } else {
        img.style.opacity = '0';
        img.style.visibility = 'hidden';
        img.style.position = 'absolute';
        img.style.zIndex = '1';
      }
      img.style.transition = 'opacity 0.7s';
      img.style.maxWidth = '100vw';
      img.style.width = '100vw';
      img.style.margin = '0 auto';
      img.style.display = 'block';
      img.style.left = '0';
      img.style.right = '0';
      if (window.innerWidth <= 900) {
        img.style.height = '900px';
        img.style.maxHeight = '900px';
      } else {
        img.style.height = '';
        img.style.maxHeight = '';
      }
    });
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  // Start slideshow only on mobile


  if (window.innerWidth <= 1200) {
    // Show only the second image (i2) on mobile with high quality
    slides.forEach((img, i) => {
      if (i === 1) {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.position = 'static';
        img.style.zIndex = '2';
        img.style.transition = 'opacity 0.7s';
        img.style.maxWidth = '100vw';
        img.style.width = '100vw';
        img.style.margin = '0 auto';
        img.style.display = 'block';
        img.style.left = '0';
        img.style.right = '0';
        img.style.height = '100vh';
        img.style.maxHeight = '100vh';
        img.style.marginTop = '0'; // Αφαιρεί extra περιθώριο πάνω
        img.style.marginBottom = '0 auto';
        img.style.margin = '0 auto';
        img.style.verticalAlign = 'top'; // Προσπαθεί να φέρει την εικόνα πιο ψηλά
        img.style.objectPosition = 'top'; // Για καλύτερη στοίχιση αν είναι object-fit
        img.style.objectFit = 'cover'; // Προαιρετικά για να γεμίζει το πλαίσιο
      } else {
        img.style.opacity = '0';
        img.style.visibility = 'hidden';
        img.style.position = 'absolute';
        img.style.zIndex = '1';
        img.style.display = 'none';
      }
    });
  } else {
    showSlide(current);
    setInterval(nextSlide, 2500);
  }


});



// για 1200
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.slideshow-wrapper .slide');
  let current = 0;

  function showSlide(index) {
    slides.forEach((img, i) => {
      if (i === index) {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.position = 'static';
        img.style.zIndex = '2';
      } else {
        img.style.opacity = '0';
        img.style.visibility = 'hidden';
        img.style.position = 'absolute';
        img.style.zIndex = '1';
      }
      img.style.transition = 'opacity 0.7s';
      img.style.maxWidth = '100vw';
      img.style.width = '100vw';
      img.style.margin = '0 auto';
      img.style.display = 'block';
      img.style.left = '0';
      img.style.right = '0';
      if (window.innerWidth <= 900) {
        img.style.height = '900px';
        img.style.maxHeight = '900px';
      } else {
        img.style.height = '';
        img.style.maxHeight = '';
      }
    });
  }

  function hideAllSlides() {
    slides.forEach((img) => {
      img.style.display = 'none';
    });
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  if (window.innerWidth <= 1200 && window.innerWidth > 900) {
    hideAllSlides();
  } else if (window.innerWidth <= 900){
    slides.forEach((img, i) => {
      if (i === 1) {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.position = 'static';
        img.style.zIndex = '2';
        img.style.transition = 'opacity 0.7s';
        img.style.maxWidth = '100vw';
        img.style.width = '100vw';
        img.style.margin = '0 auto';
        img.style.display = 'block';
        img.style.left = '0';
        img.style.right = '0';
        img.style.height = '100vh';
        img.style.maxHeight = '100vh';
        img.style.marginTop = '0'; // Αφαιρεί extra περιθώριο πάνω
        img.style.marginBottom = '0 auto';
        img.style.margin = '0 auto';
        img.style.verticalAlign = 'top'; // Προσπαθεί να φέρει την εικόνα πιο ψηλά
        img.style.objectPosition = 'top'; // Για καλύτερη στοίχιση αν είναι object-fit
        img.style.objectFit = 'cover'; // Προαιρετικά για να γεμίζει το πλαίσιο
        img.style.filter = 'brightness(0.6) blur(2px)';// Προσθέτει εφέ θολώματος και μείωσης φωτεινότητας
      } else {
        img.style.opacity = '0';
        img.style.visibility = 'hidden';
        img.style.position = 'absolute';
        img.style.zIndex = '1';
        img.style.display = 'none';
      }
    });
  } else {





    showSlide(current);
    setInterval(nextSlide, 2500);
  }
});