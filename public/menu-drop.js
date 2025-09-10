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
          document.documentElement.style.overflow = 'hidden'; // <-- πρόσθεσε αυτό
          document.body.style.position = 'fixed'; // <-- και αυτό βοηθάει σε mobile
          document.body.style.width = '100%';
        } else {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
        }

      });


      