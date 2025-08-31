// Announcements management for main page and admin
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Announcements.js DOM Content Loaded!');
  
  // Check if we're on the main page (has announcements section)
  const announcementsContainer = document.querySelector('.announcements .container-2 .announcements');
  console.log('📍 Main page announcements container found:', !!announcementsContainer);
  
  if (announcementsContainer) {
    console.log('🎯 Loading announcements for main page...');
    loadAnnouncementsForMainPage();
  }

  // Check if we're on admin page (has add-announcement-form)
  const addForm = document.getElementById('add-announcement-form');
  console.log('🔧 Admin form found:', !!addForm);
  
  if (addForm) {
    console.log('⚙️ Setting up admin functions...');
    setupAdminFunctions();
  }

  // Load announcements for general use (backward compatibility)
  loadAnnouncements();
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
    }
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

// Display announcements on main page
function displayAnnouncementsOnMainPage(announcements) {
  console.log('🎨 displayAnnouncementsOnMainPage called with:', announcements.length, 'announcements');
  const container = document.querySelector('.announcements .container-2 .announcements');
  if (!container) {
    console.error('❌ Container not found!');
    return;
  }

  console.log('✅ Container found, clearing content...');
  container.innerHTML = '';

  // Reset any inline styles that might interfere
  container.style.cssText = '';
  console.log('🧹 Container styles reset');

  if (announcements.length === 0) {
    console.log('📭 No announcements found, showing empty state');
    container.innerHTML = `
      <div style="
        background: #FF7755;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        color: white;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">📢</div>
        <h3 style="margin: 0 0 10px 0; color: white;">Δεν υπάρχουν ανακοινώσεις</h3>
        <p style="margin: 0; color: rgba(255,255,255,0.9);">Δεν υπάρχουν νέες ανακοινώσεις αυτή τη στιγμή.</p>
      </div>
    `;
    return;
  }

  // For testing purposes, let's add some dummy data if there are fewer than 5 announcements
  if (announcements.length < 5) {
    console.log('🧪 Adding test announcements to demonstrate scroll...');
    for (let i = announcements.length; i < 8; i++) {
      announcements.push({
        id: 9999 + i,
        title: `Test Ανακοίνωση ${i + 1}`,
        content: `Αυτό είναι ένα test περιεχόμενο για την ανακοίνωση ${i + 1}. Περιέχει πολύ κείμενο ώστε να φαίνεται το scroll. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
        created_at: new Date().toISOString()
      });
    }
  }

  // Check if admin page
  const isAdminPage = !!document.getElementById('add-announcement-form');

  // Create main container with orange background and proper scroll
  const mainContainer = document.createElement('div');
  mainContainer.style.cssText = `
    background: #FF7755 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    height: 200px !important;
    overflow-y: scroll !important;
    position: relative !important;
    margin: 0 !important;
  `;

  // Force the container to have the proper scroll styles
  mainContainer.className = 'admin-announcements-container';

  // Add scrollbar styling with more specific selectors
  if (!document.getElementById('admin-main-scroll-styles')) {
    const style = document.createElement('style');
    style.id = 'admin-main-scroll-styles';
    style.textContent = `
      .admin-announcements-container::-webkit-scrollbar {
        width: 8px !important;
      }
      .admin-announcements-container::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1) !important;
        border-radius: 4px !important;
      }
      .admin-announcements-container::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.4) !important;
        border-radius: 4px !important;
      }
      .admin-announcements-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.6) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Force scrollbar to always show
  mainContainer.style.scrollbarWidth = 'thin';
  mainContainer.style.scrollbarColor = 'rgba(255,255,255,0.4) transparent';

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
      position: relative;
      transition: all 0.2s ease;
    `;

    // Add hover effect
    announcementDiv.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
    });

    announcementDiv.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });

    // Add delete button for admin
    const deleteButton = isAdminPage ? 
      `<button onclick="deleteAnnouncementAdmin(${announcement.id})" style="
        position: absolute; 
        top: 5px; 
        right: 5px; 
        background: #dc3545; 
        color: white; 
        border: none; 
        border-radius: 3px; 
        padding: 4px 8px; 
        font-size: 11px; 
        cursor: pointer; 
        opacity: 0.8;
        z-index: 10;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">×</button>` 
      : '';

    announcementDiv.innerHTML = `
      <div style="
        color: white;
        font-size: 13px;
        margin-right: 15px;
        min-width: 120px;
        font-weight: bold;
        text-align: left;
      ">${day}/${month}/${year}, ${time}</div>
      <div style="
        width: 2px;
        background: rgba(255,255,255,0.4);
        margin-right: 15px;
        height: 60px;
      "></div>
      <div style="
        flex: 1; 
        color: white; 
        text-align: left;
        display: flex;
        flex-direction: column;
      ">
        <h3 style="
          margin: 0 0 8px 0;
          color: white;
          font-size: 16px;
          font-weight: bold;
          text-align: left;
        ">${announcement.title}</h3>
        <div style="
          max-height: 80px;
          overflow-y: auto;
          padding-right: 5px;
        ">
          <p style="
            margin: 0;
            color: rgba(255,255,255,0.9);
            font-size: 14px;
            line-height: 1.4;
            text-align: left;
          ">${announcement.content}</p>
        </div>
      </div>
      ${deleteButton}
    `;

    // Add click event to show full content in modal
    announcementDiv.addEventListener('click', function(e) {
      // Don't trigger modal if clicking delete button
      if (e.target.tagName === 'BUTTON') return;
      showAnnouncementModal(announcement.title, announcement.content, `${day}/${month}/${year}, ${time}`);
    });

    mainContainer.appendChild(announcementDiv);
  });

  container.appendChild(mainContainer);
  console.log('Admin announcements displayed successfully with proper scroll!');
}

// Original loadAnnouncements function for backward compatibility
async function loadAnnouncements() {
  try {
    const res = await fetch('/announcements');
    const announcements = await res.json();
    const container = document.querySelector('.announcements');
    
    // If we have the old-style container, use old display logic
    if (container && !container.closest('.container-2')) {
      let html = '';
      announcements.forEach(a => {
        html += `
          <div class="announcement">
            <div class="date-time">${new Date(a.created_at).toLocaleString('el-GR')}</div>
            <div class="title">${a.title}</div>
            <div class="content-1">${a.content}</div>
            <button class="delete-btn" data-id="${a.notification_id || a.id}">Διαγραφή</button>
          </div>
        `;
      });
      container.innerHTML = html;

      // Διαγραφή ανακοίνωσης
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.getAttribute('data-id');
          if (confirm('Σίγουρα θέλετε να διαγράψετε;')) {
            await fetch(`/announcements/${id}`, { method: 'DELETE' });
            loadAnnouncements();
          }
        });
      });
    }
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

// Setup admin functions (if on admin page)
function setupAdminFunctions() {
  let announcements = [];

  // Load announcements for admin table
  loadAdminAnnouncements();

  async function loadAdminAnnouncements() {
    try {
      const response = await fetch('/announcements');
      if (response.ok) {
        announcements = await response.json();
        displayAdminAnnouncements();
      } else {
        console.error('Failed to load announcements');
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  }

  function displayAdminAnnouncements() {
    const tbody = document.getElementById('announcements-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    announcements.forEach(announcement => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #ddd';
      row.innerHTML = `
        <td style="padding: 12px;">${announcement.id}</td>
        <td style="padding: 12px;">${announcement.title}</td>
        <td style="padding: 12px;">${announcement.content}</td>
        <td style="padding: 12px;">${new Date(announcement.created_at).toLocaleDateString('el-GR')}</td>
        <td style="padding: 12px;">
          <button onclick="deleteAnnouncement(${announcement.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
            Διαγραφή
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Add announcement form submission
  const addForm = document.getElementById('add-announcement-form');
  if (addForm) {
    addForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const title = document.getElementById('announcement-title').value;
      const content = document.getElementById('announcement-content').value;

      try {
        const response = await fetch('/announcements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, content })
        });

        if (response.ok) {
          showNotification('✅ Η ανακοίνωση προστέθηκε επιτυχώς!', 'success');
          this.reset();
          loadAdminAnnouncements(); // Reload the list
          // Also reload for main page if the container exists
          loadAnnouncementsForMainPage();
        } else {
          const errorData = await response.json();
          console.error('Failed to add announcement:', errorData);
          showNotification('Σφάλμα κατά την προσθήκη της ανακοίνωσης: ' + (errorData.error || 'Άγνωστο σφάλμα'), 'error');
        }
      } catch (error) {
        console.error('Error adding announcement:', error);
        showNotification('Σφάλμα κατά την προσθήκη της ανακοίνωσης', 'error');
      }
    });
  }

  // Make deleteAnnouncement globally available
  window.deleteAnnouncement = async function(id) {
    if (!confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την ανακοίνωση;')) {
      return;
    }

    try {
      const response = await fetch(`/announcements/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('✅ Η ανακοίνωση διαγράφηκε επιτυχώς!', 'success');
        loadAdminAnnouncements(); // Reload the list
        // Also reload for main page if the container exists
        loadAnnouncementsForMainPage();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete announcement:', errorData);
        showNotification('Σφάλμα κατά τη διαγραφή της ανακοίνωσης: ' + (errorData.error || 'Άγνωστο σφάλμα'), 'error');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showNotification('Σφάλμα κατά τη διαγραφή της ανακοίνωσης', 'error');
    }
  };

  // Simple notification function for admin pages
  function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notificationContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationContainer';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
      padding: 15px 20px;
      border-radius: 5px;
      margin-bottom: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      pointer-events: auto;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }
}

// Delete announcement for admin (different from regular delete)
async function deleteAnnouncementAdmin(id) {
  if (!confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την ανακοίνωση;')) {
    return;
  }

  try {
    const response = await fetch(`/announcements/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showNotification('✅ Η ανακοίνωση διαγράφηκε επιτυχώς!', 'success');
      loadAnnouncementsForMainPage(); // Reload the list
    } else {
      const errorData = await response.json();
      console.error('Failed to delete announcement:', errorData);
      showNotification('Σφάλμα κατά τη διαγραφή της ανακοίνωσης: ' + (errorData.error || 'Άγνωστο σφάλμα'), 'error');
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    showNotification('Σφάλμα κατά τη διαγραφή της ανακοίνωσης', 'error');
  }
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

// Make functions globally available
window.deleteAnnouncementAdmin = deleteAnnouncementAdmin;
window.showAnnouncementModal = showAnnouncementModal;
window.closeAnnouncementModal = closeAnnouncementModal;

// Footer editing functionality (keep existing)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.footer-links').forEach(el => {
    el.addEventListener('blur', async () => {
      const id = el.getAttribute('data-id');
      const content = el.innerText;
      await fetch('/save-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content })
      });
    });
  });
});