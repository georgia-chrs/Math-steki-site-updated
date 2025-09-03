document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  let current = 0;

  setInterval(() => {
    slides[current].classList.remove('active');

    current = (current + 1) % slides.length;

    slides[current].classList.add('active');
  }, 3000); // κάθε 3 δευτερόλεπτα
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
        img.style.height = '800px';
        img.style.zIndex = '2';
      } else {
        img.style.opacity = '0';
        img.style.visibility = 'hidden';
        img.style.position = 'absolute';
        img.style.height = '800px';
        img.style.zIndex = '1';
      }
      img.style.transition = 'opacity 0.7s';
      img.style.maxWidth = '100%';
      img.style.width = '100%';
      img.style.height = '800px';
      img.style.margin = '0 auto';
      img.style.display = 'block';
      img.style.left = '0';
      img.style.right = '0';
    });
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  // Start slideshow only on mobile
  if (window.innerWidth <= 900) {
    showSlide(current);
    setInterval(nextSlide, 2500);
  }
}); 