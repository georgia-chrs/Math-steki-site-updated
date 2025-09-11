const dropdownBtn = document.getElementById('dropdownBtn');
          const dropdownMenu = document.getElementById('dropdownMenu');

          dropdownBtn.addEventListener('click', function() {
            dropdownMenu.classList.toggle('open');
          });

           const dropdownBtn2 = document.getElementById('dropdownBtn2');
          const dropdownMenu2 = document.getElementById('dropdownMenu2');

          dropdownBtn2.addEventListener('click', function() {
            dropdownMenu2.classList.toggle('open');
          });
      // Mobile menu toggle
      const menuToggle = document.querySelector('.menu-toggle');
      const nav = document.querySelector('nav');
      menuToggle.addEventListener('click', function() {
        nav.classList.toggle('open');
        if (nav.classList.contains('open')) {
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          // Προσθήκη overlay
          let overlay = document.createElement('div');
          overlay.id = 'menuOverlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100vw';
          overlay.style.height = '100vh';
          overlay.style.background = 'rgba(0,0,0,0.4)';
          overlay.style.zIndex = '30000';/*9998*/ 
          overlay.style.transition = 'opacity 0.2s';
          document.body.appendChild(overlay);
          // Κλείσιμο με κλικ στο overlay
          overlay.addEventListener('click', function() {
            nav.classList.remove('open');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            if (document.getElementById('menuOverlay')) {
              document.getElementById('menuOverlay').remove();
            }
          });
        } else {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
          // Αφαίρεση overlay
          if (document.getElementById('menuOverlay')) {
            document.getElementById('menuOverlay').remove();
          }
        }
      });


