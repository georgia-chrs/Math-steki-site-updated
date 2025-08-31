// Get student ID from URL or session storage
function getStudentIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('studentId') || sessionStorage.getItem('currentStudentId');
}

// Get student username from session storage
function getStudentUsername() {
  return sessionStorage.getItem('username');
}

async function loadStudentInfo() {
  try {
    const username = getStudentUsername();
    if (!username) {
      document.getElementById('loadingMessage').textContent = 'Δεν βρέθηκε σύνδεση μαθητή. Παρακαλώ συνδεθείτε ξανά.';
      return null;
    }

    const response = await fetch(`/api/student/profile/${username}`);
    if (response.ok) {
      const studentData = await response.json();
      return studentData;
    } else {
      throw new Error('Δεν ήταν δυνατή η φόρτωση των στοιχείων μαθητή');
    }
  } catch (error) {
    console.error('Error loading student info:', error);
    document.getElementById('loadingMessage').textContent = 'Σφάλμα κατά τη φόρτωση των στοιχείων μαθητή.';
    return null;
  }
}

async function loadProgressNotes(studentId) {
  try {
    const response = await fetch(`/api/progress/${studentId}`);
    if (response.ok) {
      const progressNotes = await response.json();
      return progressNotes;
    } else {
      console.error('Failed to load progress notes');
      return [];
    }
  } catch (error) {
    console.error('Error loading progress notes:', error);
    return [];
  }
}

function displayStudentInfo(student) {
  const studentInfo = document.getElementById('studentInfo');
  const studentDetails = document.getElementById('studentDetails');
  
  studentDetails.innerHTML = `
    <div><strong>Όνομα:</strong> ${student.first_name} ${student.last_name}</div>
    <div><strong>Τάξη:</strong> ${student.class}</div>
    <div><strong>Τηλέφωνο:</strong> ${student.phone}</div>
  `;
  
  studentInfo.style.display = 'block';
}

function displayProgressNotes(progressNotes) {
  const progressContent = document.getElementById('progressContent');
  const progressList = document.getElementById('progressList');
  const loadingMessage = document.getElementById('loadingMessage');
  const noProgressMessage = document.getElementById('noProgressMessage');
  
  loadingMessage.style.display = 'none';
  
  if (progressNotes.length === 0) {
    noProgressMessage.style.display = 'block';
    return;
  }
  
  // Populate subject filter
  populateSubjectFilter(progressNotes);
  
  // Display progress notes
  updateProgressDisplay(progressNotes);
  
  progressContent.style.display = 'block';
}

function populateSubjectFilter(progressNotes) {
  const subjectFilter = document.getElementById('subjectFilter');
  const subjects = [...new Set(progressNotes.map(note => note.subject_name).filter(Boolean))];
  
  // Clear existing options and recreate first one with arrow
  subjectFilter.innerHTML = '';
  
  // Recreate the first option with arrow
  const firstOption = document.createElement('option');
  firstOption.value = '';
  firstOption.textContent = 'Όλα τα μαθήματα';
  subjectFilter.appendChild(firstOption);
  
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    subjectFilter.appendChild(option);
  });
  
  // Add event listener for filtering
  subjectFilter.addEventListener('change', function() {
    const selectedSubject = this.value;
    const filteredNotes = selectedSubject 
      ? progressNotes.filter(note => note.subject_name === selectedSubject)
      : progressNotes;
    updateProgressDisplay(filteredNotes);
  });
}

function updateProgressDisplay(progressNotes) {
  const progressList = document.getElementById('progressList');
  // Enable scroll if there are many notes
  progressList.style.maxHeight = "500px";
  progressList.style.overflowY = "auto";
  
  if (progressNotes.length === 0) {
    progressList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Δεν βρέθηκαν σημειώσεις για το επιλεγμένο φίλτρο.</div>';
    return;
  }
  
  const progressHtml = progressNotes
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(note => {
      const performanceClass = getPerformanceClass(note.performance_level);
      const performanceText = getPerformanceText(note.performance_level);
      
      return `
        <div class="progress-note" style="width: 80%;justify-content: center; margin-left: auto; margin-right: auto; margin-bottom: 20px; padding: 20px; border-radius: 20px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div class="progress-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div class="progress-subject" style="font-weight: bold; color:rgb(90, 38, 12);">
              ${note.subject_name || 'Γενική σημείωση'}
            </div>
            <div class="progress-date" style="color: #666; font-size: 14px;">
              ${new Date(note.note_date).toLocaleDateString('el-GR')}
            </div>
          </div>
          
          <div class="progress-content" style="margin-bottom: 15px; line-height: 1.6;">
            ${note.content}
          </div>
          
          <div class="progress-performance">
            <span class="performance-badge ${performanceClass}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              ${performanceText}
            </span>
          </div>
        </div>
      `;
    })
    .join('');
  
  progressList.innerHTML = progressHtml;
}

function getPerformanceClass(level) {
  switch(level) {
    case 'excellent': return 'performance-excellent';
    case 'good': return 'performance-good';
    case 'average': return 'performance-average';
    case 'poor': return 'performance-poor';
    default: return 'performance-average';
  }
}

function getPerformanceText(level) {
  switch(level) {
    case 'excellent': return 'Άριστα';
    case 'good': return 'Καλά';
    case 'average': return 'Μέτρια';
    case 'poor': return 'Χρειάζεται βελτίωση';
    default: return 'Μέτρια';
  }
}

function getPerformanceColor(level) {
  switch(level) {
    case 'excellent': return '#28a745';
    case 'good': return '#17a2b8';
    case 'average': return '#ffc107';
    case 'poor': return '#dc3545';
    default: return '#6c757d';
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const student = await loadStudentInfo();
    if (!student) return;
    
    displayStudentInfo(student);
    
    const progressNotes = await loadProgressNotes(student.id);
    displayProgressNotes(progressNotes);
    
  } catch (error) {
    console.error('Error initializing progress page:', error);
    document.getElementById('loadingMessage').textContent = 'Σφάλμα κατά τη φόρτωση της σελίδας.';
  }
});

// Add styles for performance badges
const style = document.createElement('style');
style.textContent = `
  .performance-excellent {
    background-color: #d4edda;
    color: #155724;
  }
  .performance-good {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  .performance-average {
    background-color: #fff3cd;
    color: #856404;
  }
  .performance-poor {
    background-color: #f8d7da;
    color: #721c24;
  }
`;
document.head.appendChild(style);