  const blob1 = document.getElementById('blob1');
  const blob2 = document.getElementById('blob2');
  const statsSection = document.getElementById('stats');
  const statsContent = document.getElementById('statsContent');

  let blobsShown = false;
  blob1.style.display = 'none';
  blob2.style.display = 'none';

  function showBlobsAnimated() {
    if (blobsShown) return;
    blobsShown = true;
    blob1.style.display = 'block';
    blob2.style.display = 'block';
    blob1.classList.add('visible');
    blob2.classList.add('visible');
    setTimeout(() => {
      blob1.classList.add('animate');
      blob2.classList.add('animate');
      if (statsContent) statsContent.classList.add('animate');
    }, 50);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        showBlobsAnimated();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(statsSection);

  statsSection.addEventListener('mouseenter', showBlobsAnimated);
