  // Global variables
  let currentStudent = null;
  
  // Check if student is already logged in (check localStorage)
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Student tablet loading...');
    console.log('Checking localStorage for logged in student...');
    
    // Ελέγχουμε αν υπάρχει συνδεδεμένος μαθητής
    const loggedInStudent = getLoggedInStudent();
    
    if (loggedInStudent && loggedInStudent.username) {
      console.log('Found logged in student:', loggedInStudent.username);
      // Αυτόματη φόρτωση των στοιχείων του συνδεδεμένου μαθητή
      loadStudentProfile(loggedInStudent.username);
    } else {
      console.log('No logged in student found');
      console.log('Current localStorage state:', localStorage.getItem('loggedInStudent'));
      // Αν δεν υπάρχει συνδεδεμένος μαθητής, ανακατεύθυνση στη σελίδα login
      showLoginRequired();
    }
  });
  
  // Function to get logged in student from localStorage
  function getLoggedInStudent() {
    try {
      const loggedInData = localStorage.getItem('loggedInStudent');
      console.log('Raw localStorage data:', loggedInData);
      
      if (loggedInData) {
        const student = JSON.parse(loggedInData);
        console.log('Parsed student data:', student);
        
        // Έλεγχος αν υπάρχει username (βασικό κριτήριο)
        if (student.username) {
          // Έλεγχος χρόνου login (αν υπάρχει)
          if (student.loginTime) {
            const loginTime = new Date(student.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            console.log('Hours since login:', hoursDiff);
            
            // Αν έχουν περάσει πάνω από 24 ώρες, σβήνουμε τα δεδομένα
            if (hoursDiff > 24) {
              console.log('Login expired, clearing localStorage');
              localStorage.removeItem('loggedInStudent');
              return null;
            }
          }
          
          // Έλεγχος ρόλου (αν υπάρχει)
          if (student.role && student.role !== 'student') {
            console.log('Wrong role:', student.role);
            return null;
          }
          
          console.log('Valid student found:', student.username);
          return student;
        }
      }
    } catch (e) {
      console.error('Error parsing logged in student:', e);
      localStorage.removeItem('loggedInStudent'); // Καθαρίζουμε corrupted data
    }

    console.log('No valid student found');
    return null;
  }
  
  // Function to show login required message
  function showLoginRequired() {
    document.getElementById('login-prompt').innerHTML = `
      <div style="text-align: center; padding: 40px; background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 10px;">
        <h3>Απαιτείται Σύνδεση</h3>
        <p>Πρέπει να συνδεθείτε για να δείτε τα στοιχεία σας.</p>
        <button onclick="window.location.href='/index2.html'" style="padding: 10px 20px; background: #2C5F4F; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
          Μετάβαση στη Σύνδεση
        </button>
      </div>
    `;
    document.getElementById('login-prompt').style.display = 'block';
  }
  
  // Function to get current student username from various sources
  function getCurrentStudentUsername() {
    // 1. Ελέγχουμε URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('username');
    if (urlUsername) {
      return urlUsername;
    }
    
    // 2. Ελέγχουμε localStorage (από προηγούμενη σύνδεση)
    const loggedInStudent = localStorage.getItem('loggedInStudent');
    if (loggedInStudent) {
      try {
        const student = JSON.parse(loggedInStudent);
        return student.username;
      } catch (e) {
        console.error('Error parsing logged in student:', e);
      }
    }
    
    // 3. Ελέγχουμε sessionStorage 
    const sessionUsername = sessionStorage.getItem('currentUsername');
    if (sessionUsername) {
      return sessionUsername;
    }
    
    // 4. Fallback - δεν βρέθηκε username
    return null;
  }
  
  // Function to show username selector if no username found
  // Load student profile data
  async function loadStudentProfile(username) {
    console.log('Loading profile for username:', username);
    
    // Καθαρίζουμε όλα τα προηγούμενα cached δεδομένα πρώτα
    localStorage.removeItem('loggedInStudent');
    sessionStorage.removeItem('currentUsername');
    clearPreviousData();
    
    try {
      const response = await fetch(`/api/student/profile/${username}?_t=${Date.now()}`);
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ο μαθητής με username "${username}" δεν βρέθηκε`);
        }
        throw new Error('Failed to fetch student profile');
      }
      
      const studentData = await response.json();
      console.log('Student data received:', studentData);
      
      // Αποθηκεύουμε τα ΝΕΑ στοιχεία
      sessionStorage.setItem('currentUsername', username);
      localStorage.setItem('loggedInStudent', JSON.stringify({ username: username, role: 'student' }));
      
      displayStudentProfile(studentData);
      
    } catch (error) {
      console.error('Error loading student profile:', error);
      showError(error.message || 'Σφάλμα φόρτωσης των στοιχείων σας');
    }
  }
  
  // Clear previous data to avoid showing wrong student info
  function clearPreviousData() {
    console.log('Clearing previous student data...');
    
    // Clear all profile fields
    document.getElementById('student-username').textContent = '';
    document.getElementById('student-firstname').textContent = '';
    document.getElementById('student-lastname').textContent = '';
    document.getElementById('student-email').textContent = '';
    document.getElementById('student-phone').textContent = '';
    document.getElementById('student-class').textContent = '';
    
    // Clear subjects section
    document.getElementById('student-subjects').innerHTML = '';
  }
  
  // Display student profile data
  function displayStudentProfile(student) {
    console.log('Displaying student profile:', student);
    
    // Show logout button
    document.getElementById('logout-btn').style.display = 'block';
    
    console.log('Setting student details...');
    
    // Fill personal information (using correct field names from database)
    document.getElementById('student-username').textContent = student.username || '-';
    document.getElementById('student-firstname').textContent = student.first_name || '-';
    document.getElementById('student-lastname').textContent = student.last_name || '-';
    document.getElementById('student-email').textContent = student.email || '-';
    document.getElementById('student-phone').textContent = student.phone || '-';
    document.getElementById('student-class').textContent = student.class || '-';
    
    console.log('Setting student enrollments...');
    console.log('Enrollments data:', student.enrollments);
    
    // Display enrollments (subjects)
    displayStudentSubjects(student.enrollments || []);

    console.log('Profile display completed for:', student.username);
  }
  
  // Display student subjects/enrollments
  function displayStudentSubjects(enrollments) {
    const subjectsContainer = document.getElementById('student-subjects');
    
    console.log('Displaying subjects:', enrollments);
    
    if (enrollments.length === 0) {
      subjectsContainer.innerHTML = '<p style="text-align: center; color: #666;">Δεν είστε εγγεγραμμένοι σε κανένα μάθημα ακόμα.</p>';
      return;
    }
    
    const subjectsHTML = enrollments.map(enrollment => `
      <div class="subject-card" style="background: #f8f9fa;  border-bottom: 2px solid #f5c6cb;  padding: 15px; margin: 10px 0; ">
        <h4 style="margin: 0 0 10px 0; color: #5f3d2c;  margin-bottom: 20px;">${enrollment.subject_name || 'Άγνωστο Μάθημα'}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 14px;">
          <div><strong>Κωδικός:</strong> ${enrollment.subject_code || '-'}</div>
          <div><strong>Τάξη:</strong> ${enrollment.subject_class || '-'}</div>
          <div><strong>Καθηγητής:</strong> ${enrollment.teacher_name || 'Δεν έχει οριστεί'}</div>
          <div><strong>Κατάσταση:</strong> <span style="color: ${enrollment.status === 'active' ? 'green' : 'red'};">${getStatusText(enrollment.status)}</span></div>
        </div>
      </div>
    `).join('');
    
    subjectsContainer.innerHTML = subjectsHTML;
  }
  
  // Helper functions
  function formatDate(dateString) {
    if (!dateString) return 'Δεν έχει οριστεί';
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR');
  }
  
  function getStatusText(status) {
    switch(status) {
      case 'active': return 'Ενεργή';
      case 'inactive': return 'Ανενεργή';
      case 'completed': return 'Ολοκληρωμένη';
      default: return status || 'Άγνωστη';
    }
  }
  
  // Function to show error messages
  function showError(message) {
    document.getElementById('login-prompt').innerHTML = `
      <div style="text-align: center; padding: 40px; background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; border-radius: 10px;">
        <h3>Σφάλμα</h3>
        <p>${message}</p>
        <button onclick="window.location.href='/index2.html'" style="padding: 10px 20px; background: #2C5F4F; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
          Μετάβαση στη Σύνδεση
        </button>
      </div>
    `;
    document.getElementById('login-prompt').style.display = 'block';
  }

  // Logout function
  function studentLogout() {
    // Clear any stored session
    localStorage.removeItem('loggedInStudent');
    sessionStorage.removeItem('currentUsername');
    currentStudent = null;
    
    // Ανακατεύθυνση στη σελίδα login
    window.location.href = '/index2.html';
  }
  
  // Optional: Add some keyboard shortcuts or other functionality here
  // document.addEventListener('keypress', function(e) {
  //   if (e.key === 'F5') {
  //     location.reload();
  //   }
  // });
  
  const toggleBtn = document.getElementById('toggle-subjects');
  const dropdown = document.getElementById('student-subjects');
  const arrow = document.getElementById('arrow');
  toggleBtn.addEventListener('click', function() {
    if (dropdown.style.display === 'none') {
      dropdown.style.display = 'block';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      dropdown.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  });
