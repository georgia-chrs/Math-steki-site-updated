// Main announcements script for student and index pages
document.addEventListener('DOMContentLoaded', function() {
  loadAnnouncementsForMainPage();
});

// Load announcements for main page display
async function loadAnnouncementsForMainPage() {
  try {
    const response = await fetch('/announcements');
    if (response.ok) {
      const announcements = await response.json();
      displayAnnouncementsOnMainPage(announcements);
    } else {
      console.error('Failed to load announcements');
      displayErrorMessage();
    }
  } catch (error) {
    console.error('Error loading announcements:', error);
    displayErrorMessage();
  }
}

// Display announcements on main page
function displayAnnouncementsOnMainPage(announcements) {
  const container = document.querySelector('.announcements .container-2 .announcements');
  if (!container) return;

  container.innerHTML = '';

  if (announcements.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #666; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 20px;">📢</div>
        <h3 style="margin: 0 0 10px 0; color: #2C5F4F;">Δεν υπάρχουν ανακοινώσεις</h3>
        <p style="margin: 0;">Δεν υπάρχουν νέες ανακοινώσεις αυτή τη στιγμή.</p>
      </div>
    `;
    return;
  }

  // Create main container with orange background like admin
  const mainContainer = document.createElement('div');
  mainContainer.style.cssText = `
   
    border-radius: 8px;
    padding: 20px;
    height: 350px;
    overflow-y: scroll;
  `;

  // Add custom scrollbar styling
  mainContainer.style.setProperty('scrollbar-width', 'thin');
  mainContainer.style.setProperty('scrollbar-color', '#333 transparent');
  
  // Add webkit scrollbar styles for better browser support
  const style = document.createElement('style');
  style.textContent = `
    .announcements .container-2 .announcements > div::-webkit-scrollbar {
      width: 8px;
    }
    .announcements .container-2 .announcements > div::-webkit-scrollbar-track {
      background: transparent;
    }
    .announcements .container-2 .announcements > div::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 4px;
    }
    .announcements .container-2 .announcements > div::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    /* Scrollbar for announcement content */
    .announcement-content-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .announcement-content-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .announcement-content-scroll::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
    }
    .announcement-content-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.5);
    }
  `;
  document.head.appendChild(style);

  announcements.forEach((announcement, index) => {
    const date = new Date(announcement.created_at);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

    const announcementDiv = document.createElement('div');
    announcementDiv.style.cssText = `
      display: flex;
      align-items: flex-start;
      margin-bottom: ${index < announcements.length - 1 ? '15px' : '0'};
      padding-bottom: ${index < announcements.length - 1 ? '15px' : '0'};
      border-bottom: ${index < announcements.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none'};
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    // Add hover effect
    announcementDiv.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
    });

    announcementDiv.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });

    announcementDiv.innerHTML = `
      <div style="
        font-size: 13px;
        margin-right: 15px;
        min-width: 120px;
        font-weight: bold;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        color:rgba(95, 26, 15, 0.47);
      ">
        <span>${day}/${month}/${year}</span>
        <span style="font-size: 12px; margin-top: 2px;">${time}</span>
      </div>
      <div style="
        width: 2px;
        background: rgba(255,255,255,0.4);
        margin-right: 15px;
        align-self: stretch;
      "></div>
      <div style="
        flex: 1; 
        color: white; 
        text-align: left;
        display: flex;
        flex-direction: column;
        max-height: 100px;
        overflow-y: auto;
      ">
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          flex-shrink: 0;
          color:rgba(212, 79, 34, 0.82);
        ">${announcement.title}</h3>
        <div style="
          flex: 1;
          overflow-y: auto;
          padding-right: 5px;
        " class="announcement-content-scroll">
          <p style="
            margin: 0;
            color:rgba(95, 26, 15, 0.64);
            font-size: 14px;
            line-height: 1.4;
            text-align: left;
          ">${announcement.content}</p>
        </div>
      </div>
    `;

    // Add click event to show full content in modal
    announcementDiv.addEventListener('click', function() {
      showAnnouncementModal(announcement.title, announcement.content, `${day}/${month}/${year}, ${time}`);
    });

    mainContainer.appendChild(announcementDiv);
  });

  container.appendChild(mainContainer);
}

// Display error message
function displayErrorMessage() {
  const container = document.querySelector('.announcements .container-2 .announcements');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; color: #666; padding: 40px 20px;">
      <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
      <h3 style="margin: 0 0 10px 0; color: #dc3545;">Σφάλμα φόρτωσης</h3>
      <p style="margin: 0;">Δεν ήταν δυνατή η φόρτωση των ανακοινώσεων. Παρακαλώ δοκιμάστε ξανά αργότερα.</p>
    </div>
  `;
}

// Show announcement modal with full content
function showAnnouncementModal(title, content, date) {
  // Remove existing modal if any
  const existingModal = document.getElementById('announcement-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modal = document.createElement('div');
  modal.id = 'announcement-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      margin: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
    ">
      <button onclick="closeAnnouncementModal()" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">×</button>
      
      <div style="margin-bottom: 15px;">
        <h2 style="margin: 0 0 10px 0; color: #2C5F4F; font-size: 22px; line-height: 1.3;">${title}</h2>
        <p style="margin: 0; color: #666; font-size: 14px;">${date}</p>
      </div>
      
      <div style="border-top: 2px solid #E39C50; padding-top: 20px;">
        <p style="margin: 0; color: #333; line-height: 1.6; font-size: 16px; white-space: pre-wrap;">${content}</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fade in animation
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);

  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeAnnouncementModal();
    }
  });

  // Close modal with Escape key
  const escapeHandler = function(e) {
    if (e.key === 'Escape') {
      closeAnnouncementModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

// Close announcement modal
function closeAnnouncementModal() {
  const modal = document.getElementById('announcement-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Make the function globally available
window.closeAnnouncementModal = closeAnnouncementModal;