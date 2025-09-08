// Announcements management system
let announcements = [];

// Load announcements on page load
document.addEventListener('DOMContentLoaded', function() {
  loadAnnouncements();
});

// Load announcements from database
async function loadAnnouncements() {
  // Show loading state
  const container = document.getElementById('announcements-container');
  container.innerHTML = `
    <div style="padding: 40px; text-align: center; color: #666;">
      <h4>🔄 Φόρτωση ανακοινώσεων...</h4>
      <p>Παρακαλώ περιμένετε...</p>
    </div>
  `;

  try {
    console.log('🔍 Loading announcements from database...');
    
    // Add cache-busting parameter to prevent browser caching
    const timestamp = new Date().getTime();
    const response = await fetch(`/announcements?_t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Announcements data:', data);
    console.log('📋 Available IDs:', data.map(a => a.notification_id));
    
    // Convert database format to our format
    announcements = data.map(announcement => ({
      id: announcement.notification_id,
      title: announcement.title,
      content: announcement.content,
      created_at: new Date(announcement.created_at)
    }));
    
    console.log('✅ Converted announcements:', announcements.map(a => ({ id: a.id, title: a.title })));
    
    displayAnnouncements();
    
  } catch (error) {
    console.error(' Error loading announcements:', error);
    container.innerHTML = `
      <div style="padding: 20px; background: #ffebee; margin: 10px 0; border-radius: 5px; text-align: center;">
        <h4 style="margin: 0 0 10px 0; color: #c62828;"> Σφάλμα φόρτωσης</h4>
        <p style="margin: 0; color: #666;">Δεν μπορώ να συνδεθώ στη βάση δεδομένων.</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Error: ${error.message}</p>
        <button onclick="loadAnnouncements()" style="margin-top: 15px; padding: 8px 16px; background: #E39C50; color: white; border: none; border-radius: 4px; cursor: pointer;">
           Δοκιμάστε ξανά
        </button>
      </div>
    `;
  }
}

// Display announcements in container
function displayAnnouncements() {
  const container = document.getElementById('announcements-container');
  
  if (announcements.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666;">
        <h4> Δεν υπάρχουν ανακοινώσεις</h4>
        <p>Προσθέστε την πρώτη ανακοίνωση χρησιμοποιώντας τη φόρμα παραπάνω.</p>
      </div>
    `;
    return;
  }

  // Sort announcements by date (newest first)
  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  console.log(' Displaying announcements with IDs:', sortedAnnouncements.map(a => a.id));
  
  container.innerHTML = sortedAnnouncements.map(announcement => `
    <div style="padding: 20px; background: #fff; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #E39C50; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
        <h4 style="margin: 0; color: #2C5F4F; flex-grow: 1;">${announcement.title}</h4>
        <div style="display: flex; gap: 8px; margin-left: 15px;">
          <!-- Τύλιγμα των κουμπιών σε container με responsive flex -->
          <div class="announcement-actions" style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button onclick="editAnnouncement(${announcement.id})" 
                    onmouseover="this.style.background='#F7C19C'; this.style.color='#BC5E29'; this.style.boxShadow='0 0 0 2px rgba(183, 54, 22, 0.495)'"
                    onmouseout="this.style.background='#4d2c1e'; this.style.color='#fff'; this.style.boxShadow='none'"
                    style="background: #4d2c1e;
                      color: #fff;
                      border: none;
                      border-radius: 20px;
                      padding: 0.5rem 1.5rem;
                      font-weight: 700;
                      font-size:small;
                      cursor: pointer;
                      transition: all 0.2s;
                      flex: 1 1 200px;">
              Επεξεργασία
            </button>
            <button onclick="deleteAnnouncement(${announcement.id})" 
                     onmouseover="this.style.background='#F79C9C'; this.style.color='#D63838'; this.style.boxShadow='0 0 0 2px rgba(200, 0, 0, 0.495)'"
                    onmouseout="this.style.background='#dc3545'; this.style.color='#fff'; this.style.boxShadow='none'"
                    style="background: #dc3545;
                      color: white;
                      border: none;
                      border-radius: 20px;
                      padding: 0.5rem 1.5rem;
                      font-weight: 700;
                      font-size:small;
                      cursor: pointer;
                      transition: all 0.2s;
                      flex: 1 1 200px;">
              Διαγραφή
            </button>
          </div>
        </div>
      </div>
      <p style="margin: 0 0 10px 0; color: #555; line-height: 1.5;">${announcement.content}</p>
      <small style="color: #999;"> ${new Date(announcement.created_at).toLocaleString('el-GR')}</small>
    </div>
  `).join('');
}

// Add announcement form submission
document.getElementById('add-announcement-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const title = document.getElementById('announcement-title').value.trim();
  const content = document.getElementById('announcement-content').value.trim();
  const submitButton = this.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  
  if (!title || !content) {
    showAnnouncementAlert('Παρακαλώ συμπληρώστε όλα τα πεδία!', 'error');
    return;
  }

  // Show loading state
  submitButton.disabled = true;
  submitButton.textContent = ' Προσθήκη...';

  try {
    const response = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log(' Announcement created:', result);
    
    // Clear form
    this.reset();
    
    // Reload announcements from database
    await loadAnnouncements();
    
    showAnnouncementAlert('Η ανακοίνωση προστέθηκε επιτυχώς!', 'success');
    
  } catch (error) {
    console.error(' Error creating announcement:', error);
    
    if (error.message.includes('Failed to fetch')) {
      showAnnouncementAlert('Πρόβλημα σύνδεσης με τον server!', 'error');
    } else {
      showAnnouncementAlert(`Σφάλμα κατά την προσθήκη: ${error.message}`, 'error');
    }
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

// Edit announcement
function editAnnouncement(id) {
  const announcement = announcements.find(a => a.id === id);
  if (!announcement) {
    showAnnouncementAlert('Η ανακοίνωση δεν βρέθηκε!', 'error');
    // Reload announcements to sync with database
    loadAnnouncements();
    return;
  }

  document.getElementById('editAnnouncementId').value = announcement.id;
  document.getElementById('editAnnouncementTitle').value = announcement.title;
  document.getElementById('editAnnouncementContent').value = announcement.content;
  
  document.getElementById('editAnnouncementModal').style.display = 'block';
}

function closeEditAnnouncementModal() {
  document.getElementById('editAnnouncementModal').style.display = 'none';
}

// Edit announcement form submission
document.getElementById('editAnnouncementForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const announcementId = parseInt(document.getElementById('editAnnouncementId').value);
  const title = document.getElementById('editAnnouncementTitle').value.trim();
  const content = document.getElementById('editAnnouncementContent').value.trim();
  
  if (!title || !content) {
    showAnnouncementAlert('Παρακαλώ συμπληρώστε όλα τα πεδία!', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/announcements/${announcementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content })
    });

    if (response.status === 404) {
      showAnnouncementAlert('Η ανακοίνωση δεν βρέθηκε ή έχει διαγραφεί!', 'error');
      closeEditAnnouncementModal();
      await loadAnnouncements();
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('✅ Announcement updated:', result);
    
    closeEditAnnouncementModal();
    
    // Reload announcements from database
    await loadAnnouncements();
    
    showAnnouncementAlert('Η ανακοίνωση ενημερώθηκε επιτυχώς!', 'success');
    
  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    
    if (error.message.includes('Failed to fetch')) {
      showAnnouncementAlert('Πρόβλημα σύνδεσης με τον server!', 'error');
    } else {
      showAnnouncementAlert(`Σφάλμα κατά την ενημέρωση: ${error.message}`, 'error');
    }
  }
});

// Delete announcement
async function deleteAnnouncement(id) {
  console.log('🗑️ Attempting to delete announcement with ID:', id);
  
  // First, refresh data from database to make sure we have the latest state
  await loadAnnouncements();
  
  console.log('📋 Current announcements after refresh:', announcements.map(a => ({ id: a.id, title: a.title })));
  
  const announcement = announcements.find(a => a.id === id);
  if (!announcement) {
    console.warn('⚠️ Announcement not found in local array after refresh!');
    showAnnouncementAlert('Η ανακοίνωση δεν βρέθηκε ή έχει ήδη διαγραφεί!', 'error');
    return;
  }

  console.log('✅ Found announcement to delete:', announcement);

  if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε την ανακοίνωση "${announcement.title}";`)) {
    try {
      console.log('🚀 Sending DELETE request to:', `/api/announcements/${id}`);
      
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      });

      console.log('📡 Delete response status:', response.status);

      if (response.status === 404) {
        console.warn('⚠️ Server returned 404 - announcement not found in database');
        showAnnouncementAlert('Η ανακοίνωση έχει ήδη διαγραφεί ή δεν υπάρχει στη βάση δεδομένων!', 'error');
        // Reload announcements to sync with database
        await loadAnnouncements();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Announcement deleted successfully:', result);
      
      // Reload announcements from database
      await loadAnnouncements();
      
      showAnnouncementAlert('Η ανακοίνωση διαγράφηκε επιτυχώς!', 'success');
      
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      
      // Check if it's a network error
      if (error.message.includes('Failed to fetch')) {
        showAnnouncementAlert('Πρόβλημα σύνδεσης με τον server!', 'error');
      } else {
        showAnnouncementAlert(`Σφάλμα κατά τη διαγραφή: ${error.message}`, 'error');
      }
      
      // Reload announcements to ensure we have the latest data
      await loadAnnouncements();
    }
  }
}

// Show alert function for announcements
function showAnnouncementAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  const backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
  const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
  const textColor = type === 'success' ? '#155724' : '#721c24';
  
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
    color: ${textColor};
    padding: 15px 20px;
    border-radius: 5px;
    border: 1px solid ${borderColor};
    z-index: 2000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    max-width: 400px;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    if (document.body.contains(alertDiv)) {
      document.body.removeChild(alertDiv);
    }
  }, 4000);
}

// Debug function to check database state
async function debugAnnouncements() {
  try {
    console.log('🔍 DEBUG: Fetching fresh data from database...');
    
    const timestamp = new Date().getTime();
    const response = await fetch(`/announcements?debug=true&_t=${timestamp}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('=== DEBUG ANNOUNCEMENTS ===');
    console.log('📊 Total announcements in database:', data.length);
    console.log('📋 Database announcements:', data);
    console.log('🔢 IDs in database:', data.map(a => a.notification_id));
    console.log('📝 Current frontend announcements:', announcements);
    console.log('🔢 IDs in frontend:', announcements.map(a => a.id));
    console.log('===========================');
    
    // Show detailed info in an alert
    const dbIds = data.map(a => a.notification_id).sort((a,b) => a-b);
    const frontendIds = announcements.map(a => a.id).sort((a,b) => a-b);
    
    const message = `
DATABASE: ${data.length} ανακοινώσεις
IDs στη βάση: [${dbIds.join(', ')}]

FRONTEND: ${announcements.length} ανακοινώσεις  
IDs στο frontend: [${frontendIds.join(', ')}]

Sync: ${JSON.stringify(dbIds) === JSON.stringify(frontendIds) ? '✅ ΟΚ' : '❌ ΟΧΙ ΣΥΓΧΡΟΝΙΣΜΕΝΑ'}
    `.trim();
    
    alert(message);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    alert(`Debug σφάλμα: ${error.message}`);
  }
}

// Test API connectivity
async function testAPI() {
  console.log('🧪 Testing API connectivity...');
  
  try {
    // Test basic API endpoint
    const testResponse = await fetch('/api/test');
    console.log('🔌 API Test Response Status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ API Test Success:', testData);
      alert(`✅ API Test Success!\n\nMessage: ${testData.message}\nTime: ${testData.timestamp}`);
    } else {
      console.log('❌ API Test Failed:', testResponse.status);
      alert(`❌ API Test Failed!\n\nStatus: ${testResponse.status}`);
    }
    
    // Test announcements endpoint
    const announcementsResponse = await fetch('/announcements');
    console.log('📢 Announcements Test Status:', announcementsResponse.status);
    
    if (announcementsResponse.ok) {
      const announcementsData = await announcementsResponse.json();
      console.log('✅ Announcements Test Success:', announcementsData.length, 'announcements');
    } else {
      console.log('❌ Announcements Test Failed:', announcementsResponse.status);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
    alert(`❌ API Test Error!\n\n${error.message}`);
  }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  const modal = document.getElementById('editAnnouncementModal');
  if (event.target === modal) {
    closeEditAnnouncementModal();
  }
});




const blob1 = document.getElementById('blob1');
const blob2 = document.getElementById('blob2');
const statsContent = document.getElementById('statsContent');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Βάζουμε display: block
      blob1.classList.add('visible');
      blob2.classList.add('visible');

      // Περιμένουμε 50ms για να γίνει reflow ώστε να λειτουργήσει το transition
      setTimeout(() => {
        blob1.classList.add('animate');
        blob2.classList.add('animate');
        statsContent.classList.add('animate');
      }, 50);
    }
  });
}, { threshold: 0.4 });

observer.observe(document.getElementById('stats'));
