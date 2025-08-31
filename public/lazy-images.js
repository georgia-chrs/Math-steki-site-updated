// Lazy loading for background images using Intersection Observer
document.addEventListener('DOMContentLoaded', function() {
    // Detect if we're in a subfolder by checking the current path
    const isInSubfolder = window.location.pathname.includes('/main-page/');
    const imageBasePath = isInSubfolder ? '../photos-site/' : 'photos-site/';

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers - load all images immediately
        const cards = document.querySelectorAll('.calculator-card, .pallia-card, .trapeza-card, .vaseis-card, .mixano-card');
        cards.forEach(card => {
            loadCardImage(card, imageBasePath);
        });
        return;
    }

    // Intersection Observer options
    const options = {
        root: null, // viewport
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    // Function to load background image for a card
    function loadCardImage(card, basePath) {
        let imageUrl = '';
        
        if (card.classList.contains('calculator-card')) {
            imageUrl = basePath + 'vathmol.jpg';
        } else if (card.classList.contains('pallia-card')) {
            imageUrl = basePath + 'pallia-them.jpg';
        } else if (card.classList.contains('trapeza-card')) {
            imageUrl = basePath + 'trap-them.jpg';
        } else if (card.classList.contains('vaseis-card')) {
            imageUrl = basePath + 'mathimata.jpg';
        } else if (card.classList.contains('mixano-card')) {
            imageUrl = basePath + 'mixanogr.jpg';
        }
        
        if (imageUrl) {
            card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${imageUrl}')`;
            card.classList.add('loaded');
        }
    }

    // Callback function when intersection occurs
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Load background image with correct path
                loadCardImage(entry.target, imageBasePath);
                
                // Stop observing this element
                observer.unobserve(entry.target);
            }
        });
    };

    // Create observer
    const observer = new IntersectionObserver(handleIntersection, options);

    // Observe all cards
    const cards = document.querySelectorAll('.calculator-card, .pallia-card, .trapeza-card, .vaseis-card, .mixano-card');
    cards.forEach(card => {
        observer.observe(card);
    });

    // Preload images for better UX (optional - since we already have preload in HTML)
    const imageUrls = [
        imageBasePath + 'vathmol.jpg',
        imageBasePath + 'pallia-them.jpg', 
        imageBasePath + 'trap-them.jpg',
        imageBasePath + 'mathimata.jpg',
        imageBasePath + 'mixanogr.jpg'
    ];

    // Only preload if we're not on a slow connection
    if (navigator.connection && navigator.connection.effectiveType !== 'slow-2g') {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
});
