// announcements-mobile.js
// Εμφάνιση ανακοινώσεων σε μορφή λίστας για κινητά

document.addEventListener('DOMContentLoaded', function() {
  if (window.innerWidth <= 600) { // Ενεργοποίηση μόνο σε κινητό
    const container = document.querySelector('.announcements .container-2 .announcements');
    if (!container) return;
    fetch('/announcements')
      .then(res => res.json())
      .then(announcements => {
        container.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'announcement-list-mobile';
        announcements.forEach(announcement => {
          const li = document.createElement('li');
          li.className = 'announcement-mobile-item';
          li.innerHTML = `
            <div class="announcement-mobile-title">${announcement.title}</div>
            <div class="announcement-mobile-date">${new Date(announcement.created_at).toLocaleDateString('el-GR')}</div>
            <div class="announcement-mobile-content" style="display:none;">${announcement.content}</div>
          `;
          li.addEventListener('click', function() {
            const content = this.querySelector('.announcement-mobile-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
          });
          ul.appendChild(li);
        });
        container.appendChild(ul);
      });
  }
});
