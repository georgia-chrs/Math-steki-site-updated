// --- Οι παρακάτω συναρτήσεις πρέπει να είναι global για να δουλεύουν τα κουμπιά στο HTML ---
window.editProgressNote = async function(progressId, studentId) {
  // Βρες το αντικείμενο progress από το τελευταίο fetch
  const student = allStudents.find(s => s.id === studentId || s.id === selectedStudent?.id);
  if (!student || !window._lastProgressList) return;
  const progressObj = window._lastProgressList.find(p => p.id === progressId);
  if (!progressObj) return;
  const noteSpan = document.getElementById(`note-${progressId}`);
  if (!noteSpan) return;
  const oldNote = noteSpan.textContent;
  const newNote = prompt('Επεξεργασία σημείωσης:', oldNote);
  if (newNote === null || newNote === oldNote) return;
  // Ετοιμάζουμε όλα τα πεδία που θέλει το backend
  const body = {
    subjectId: progressObj.subject_id || progressObj.subjectId,
    noteDate: progressObj.note_date || progressObj.date,
    content: newNote,
    performanceLevel: progressObj.performance_level || progressObj.rating || null
  };
  try {
    const res = await fetch(`/api/progress/${progressId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      noteSpan.textContent = newNote;
      showNotification('Η σημείωση ενημερώθηκε!', 'success');
    } else {
      showNotification('Σφάλμα κατά την ενημέρωση σημείωσης', 'error');
    }
  } catch {
    showNotification('Σφάλμα σύνδεσης με το server', 'error');
  }
}

window.deleteProgressNote = async function(progressId, studentId) {
  if (!confirm('Θέλετε σίγουρα να διαγράψετε αυτή τη σημείωση;')) return;
  try {
    const res = await fetch(`/api/progress/${progressId}`, { method: 'DELETE' });
    if (res.ok) {
      showNotification('Η σημείωση διαγράφηκε!', 'success');
      viewStudentProgress(studentId);
    } else {
      showNotification('Σφάλμα κατά τη διαγραφή σημείωσης', 'error');
    }
  } catch {
    showNotification('Σφάλμα σύνδεσης με το server', 'error');
  }
}

// Global variables
    let selectedStudent = null;
    // Global arrays
    window.allSubjects = [];
    window.allStudents = [];
    window.allEnrollments = [];

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      initializePage();
    });
    
    async function initializePage() {
      try {
        await loadSubjects();
        await loadEnrollments();
        await loadStudents();
        populateSubjectFilters();
        setDefaultDates();
      } catch (error) {
        console.error('Error initializing page:', error);
        showNotification('Σφάλμα κατά τη φόρτωση της σελίδας', 'error');
      }
    }
    
    // Load subjects from database
    async function loadSubjects() {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const subjects = await response.json();
          allSubjects = subjects; // <-- Ενημέρωση του global array
          console.log('Loaded subjects:', allSubjects); // DEBUG: Δες τι επιστρέφει το API
        } else {
          console.error('Failed to load subjects');
          allSubjects = [];
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
        allSubjects = [];
      }
    }

    // Load students from database
    async function loadStudents() {
      try {
        console.log('Attempting to load students from server...');
        const response = await fetch('/api/students');
        if (response.ok) {
          const rawStudents = await response.json();
          console.log('Raw students data:', rawStudents);
          
          // Map database fields to frontend expected fields
          allStudents = rawStudents.map(student => ({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            studentClass: student.class,
            phone: student.phone,
            email: student.email,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            address: student.address,
            birthDate: student.birthDate,
            enrollmentDate: student.enrollmentDate,
            status: student.status,
            notes: student.notes
          }));
          
          console.log('Students loaded from server:', allStudents.length);
          console.log('Mapped first student:', allStudents[0]);
          displayStudents(allStudents);
          updateSearchResults(allStudents.length);
        } else {
          console.error('Failed to load students, status:', response.status);
          throw new Error('Server responded with error');
        }
      } catch (error) {
        console.error('Error loading students:', error);
        // Fallback to demo data
        loadDemoData();
      }
    }
    
    // Load enrollments from database
    async function loadEnrollments() {
      try {
        const response = await fetch('/api/enrollments');
        if (response.ok) {
          allEnrollments = await response.json();
          // Build subject to student mapping
          subjectToStudentMap = {};
          allEnrollments.forEach(enr => {
            if (!subjectToStudentMap[enr.class_id]) subjectToStudentMap[enr.class_id] = new Set();
            subjectToStudentMap[enr.class_id].add(enr.student_id);
          });
        } else {
          console.error('Failed to load enrollments');
          allEnrollments = [];
          subjectToStudentMap = {};
        }
      } catch (error) {
        console.error('Error loading enrollments:', error);
        allEnrollments = [];
        subjectToStudentMap = {};
      }
    }
    
    // Demo data fallback
    function loadDemoData() {
      console.log('Loading demo data...');
      allStudents = [
        {
          id: 1,
          firstName: 'Γιάννης',
          lastName: 'Παπαδόπουλος',
          studentClass: 'Β\' Λυκείου',
          phone: '6901234567',
          email: 'giannis@example.com',
          parentName: 'Κώστας Παπαδόπουλος',
          parentPhone: '6907654321',
          enrollmentDate: '2023-09-01',
          status: 'active'
        },
        {
          id: 2,
          firstName: 'Μαρία',
          lastName: 'Γεωργίου',
          studentClass: 'Γ\' Λυκείου',
          phone: '6902345678',
          email: 'maria@example.com',
          parentName: 'Ελένη Γεωργίου',
          parentPhone: '6908765432',
          enrollmentDate: '2022-09-01',
          status: 'active'
        },
        {
          id: 3,
          firstName: 'Κώστας',
          lastName: 'Δημητρίου',
          studentClass: 'Α\' Λυκείου',
          phone: '6903456789',
          email: 'kostas@example.com',
          parentName: 'Νίκος Δημητρίου',
          parentPhone: '6909876543',
          enrollmentDate: '2024-09-01',
          status: 'active'
        }
      ];
      
      allSubjects = [
        { id: 1, name: 'Μαθηματικά', code: 'Μγ4', class: 'Γ\' Λυκείου' },
        { id: 2, name: 'Χημεία', code: 'Χγ2', class: 'Γ\' Λυκείου' },
        { id: 3, name: 'Φυσική', code: 'Φβ1', class: 'Β\' Λυκείου' },
        { id: 4, name: 'Αρχαία', code: 'Αρα3', class: 'Α\' Λυκείου' },
        { id: 5, name: 'Νέα Ελληνικά', code: 'Νεγ1', class: 'Γ\' Γυμνασίου' }
      ];
      
      displayStudents(allStudents);
      populateSubjectFilters();
      updateSearchResults(allStudents.length);
      console.log('Demo data loaded, students count:', allStudents.length);
    }
    
    // Populate subject filter dropdowns
    function populateSubjectFilters() {
      const filterSelects = ['studentSubjectFilter', 'gradeSubject', 'progressSubject', 'calendarSubject'];
      filterSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
          select.innerHTML = '';
          const defaultText = selectId === 'studentSubjectFilter' ? 'Όλα τα μαθήματα' : 'Επιλέξτε μάθημα';
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = defaultText;
          select.appendChild(defaultOption);
          // Εμφάνιση όλων των subjects, χωρίς διπλότυπα, με όνομα και τάξη
          const seen = new Set();
          allSubjects.forEach(subject => {
            if (subject.name !== 'Γενικό Μάθημα' && !seen.has(subject.id)) {
              const option = document.createElement('option');
              option.value = subject.id;
              option.textContent = `${subject.name} (${subject.class})`;
              select.appendChild(option);
              seen.add(subject.id);
            }
          });
        }
      });
    }

    // Set default dates
    function setDefaultDates() {
      const today = new Date().toISOString().split('T')[0];
      const dateInputs = ['gradeDate', 'progressDate', 'calendarDate'];
      
      dateInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
          input.value = today;
        }
      });
    }
    
    // Search students functionality
    // Βελτιωμένο mapping: filtering μαθητών με βάση enrollments και subject_class
    function searchStudents() {
      if (!allStudents || allStudents.length === 0) return;
      const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase();
      const classFilter = document.getElementById('studentClassFilter').value;
      const subjectFilter = document.getElementById('studentSubjectFilter').value;

      let filteredStudents = allStudents.filter(student => {
        const matchesSearch =
          (student.firstName && student.firstName.toLowerCase().includes(searchTerm)) ||
          (student.lastName && student.lastName.toLowerCase().includes(searchTerm)) ||
          (student.phone && student.phone.includes(searchTerm)) ||
          (student.email && student.email.toLowerCase().includes(searchTerm));
        const matchesClass = !classFilter || student.studentClass === classFilter;
        let matchesSubject = true;
        if (subjectFilter) {
          matchesSubject = subjectToStudentMap[subjectFilter] && subjectToStudentMap[subjectFilter].has(student.id);
        }
        return matchesSearch && matchesClass && matchesSubject;
      });
      displayStudents(filteredStudents);
      updateSearchResults(filteredStudents.length);
    }
    
    // Display students in grid
    function displayStudents(students) {
      console.log('displayStudents called with:', students.length, 'students');
      const grid = document.getElementById('studentsGrid');
      grid.innerHTML = '';
      
      if (students.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Δεν βρέθηκαν μαθητές</div>';
        return;
      }
      
      students.forEach(student => {
        console.log('Processing student:', student);
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        studentCard.dataset.studentId = student.id;
        
        studentCard.innerHTML = `
          <h4>${student.firstName || 'Άγνωστο'} ${student.lastName || 'Όνομα'}</h4>
          <p><strong>Τάξη:</strong> ${student.studentClass || 'Δεν έχει οριστεί'}</p>
          <p><strong>Τηλέφωνο:</strong> ${student.phone || 'Δεν έχει καταχωρηθεί'}</p>
          <p><strong>Γονέας:</strong> ${student.parentName || 'Δεν έχει καταχωρηθεί'}</p>
          <p><strong>Κατάσταση:</strong> <span class="status-${student.status}">${getStatusText(student.status)}</span></p>
          <div class="actions" >
            <button class="btn btn-mini btn-success" onclick="selectStudent(${student.id})" style="background : #dc5935; color:white;">
               Επιλογή
            </button>
            <button class="btn btn-mini btn-info" onclick="viewStudentDetails(${student.id})"style="background : #a4360b; color:white;">
               Στοιχεία
            </button>
            <button class="btn btn-mini btn-warning" onclick="viewStudentGrades(${student.id})"style="background : #532a05; color:white;">
               Βαθμοί
            </button>
            <button class="btn btn-mini btn-primary" onclick="viewStudentProgress(${student.id})" style="background: #0b3ca4; color:white;">
               Πρόοδος
            </button>
          </div>
        `;
        
        grid.appendChild(studentCard);
      });
    }
    
    // Get status text
    function getStatusText(status) {
      const statusMap = {
        'active': 'Ενεργός',
        'inactive': 'Ανενεργός',
        'graduated': 'Απόφοιτος'
      };
      return statusMap[status] || status;
    }
    
    // Update search results count
    function updateSearchResults(count) {
      const countElement = document.getElementById('searchResultsCount');
      countElement.textContent = `Βρέθηκαν ${count} μαθητές`;
    }
    
    // Select a student
    async function selectStudent(studentId) {
      const student = allStudents.find(s => s.id === studentId);
      if (!student) return;
      
      selectedStudent = student;
      
      // Update UI
      document.querySelectorAll('.student-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      const selectedCard = document.querySelector(`[data-student-id="${studentId}"]`);
      if (selectedCard) {
        selectedCard.classList.add('selected');
      }
      
      // Show selected student info
      const display = document.getElementById('selectedStudentDisplay');
      const info = document.getElementById('selectedStudentInfo');
      
      info.innerHTML = `
        <div><strong>Όνομα:</strong> ${student.firstName} ${student.lastName}</div>
        <div><strong>Τάξη:</strong> ${student.studentClass}</div>
        <div><strong>Τηλέφωνο:</strong> ${student.phone}</div>
        <div><strong>Email:</strong> ${student.email || 'Δεν υπάρχει'}</div>
        <div><strong>Γονέας:</strong> ${student.parentName || 'Δεν έχει καταχωρηθεί'}</div>
        <div><strong>Τηλ. Γονέα:</strong> ${student.parentPhone || 'Δεν έχει καταχωρηθεί'}</div>
      `;
      
      display.style.display = 'block';
      
      // Load student's enrolled subjects
      await loadStudentSubjects(studentId);
      
      // Update modal forms
      updateModalForms(student);
      
      showNotification(`Επιλέχθηκε ο/η μαθητής/τρια: ${student.firstName} ${student.lastName}`, 'success');
    }
    
    // Load subjects that the student is enrolled in
    async function loadStudentSubjects(studentId) {
      try {
        const response = await fetch(`/api/enrollments?studentId=${studentId}`);
        if (response.ok) {
          const enrollments = await response.json();
          console.log('Student enrollments:', enrollments);
          
          // Extract subject information from enrollments
          selectedStudentSubjects = enrollments.map(enrollment => ({
            id: enrollment.class_id, // This is actually the subject_id from Subjects table
            name: enrollment.subject_name,
            code: enrollment.subject_code,
            class: enrollment.subject_class,
            teacher: enrollment.teacher_name
          }));
          
          console.log('Student subjects:', selectedStudentSubjects);
          
          // Update subject dropdowns in modals
          updateSubjectDropdowns();
          
        } else {
          console.error('Failed to load student subjects');
          selectedStudentSubjects = [];
        }
      } catch (error) {
        console.error('Error loading student subjects:', error);
        selectedStudentSubjects = [];
      }
    }
    
    // Update subject dropdowns to show only enrolled subjects
    function updateSubjectDropdowns() {
      const subjectSelects = ['gradeSubject', 'progressSubject', 'calendarSubject'];
      subjectSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
          select.innerHTML = '';
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Επιλέξτε μάθημα';
          select.appendChild(defaultOption);
          if (selectId === 'calendarSubject') {
            if (window.allSubjects && Array.isArray(window.allSubjects)) {
              window.allSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.code;
                option.textContent = `${subject.code} - ${subject.name}`;
                select.appendChild(option);
              });
            }
          } else {
            if (window.selectedStudentSubjects && Array.isArray(window.selectedStudentSubjects)) {
              window.selectedStudentSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = `${subject.name} (${subject.code})`;
                select.appendChild(option);
              });
            }
          }
        }
      });
    }

    // Update modal forms with selected student
    function updateModalForms(student) {
      const studentInfo = `${student.firstName} ${student.lastName} - ${student.studentClass}`;
      
      const infoElements = [
        'gradeStudentInfo',
        'progressStudentInfo', 
        'calendarStudentInfo'
      ];
      
      infoElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = `
            <strong>Μαθητής:</strong> ${studentInfo}<br>
            <strong>Τηλέφωνο:</strong> ${student.phone}
          `;
        }
      });
    }
    
    // Clear selected student
    function clearSelectedStudent() {
      selectedStudent = null;
      
      document.querySelectorAll('.student-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      document.getElementById('selectedStudentDisplay').style.display = 'none';
      
      showNotification('Η επιλογή μαθητή καθαρίστηκε', 'info');
    }
    
    // Refresh student list
    function refreshStudentList() {
      document.getElementById('studentSearchInput').value = '';
      document.getElementById('studentClassFilter').value = '';
      document.getElementById('studentSubjectFilter').value = '';
      loadStudents();
    }
    
    // Modal functions
    function openGradesModal() {
      if (!selectedStudent) {
        showNotification('Παρακαλώ επιλέξτε πρώτα έναν μαθητή', 'warning');
        return;
      }
      document.getElementById('gradesModal').style.display = 'block';
    }
    
    function closeGradesModal() {
      document.getElementById('gradesModal').style.display = 'none';
      document.getElementById('gradesForm').reset();
      setDefaultDates();
    }
    
    function openProgressModal() {
      if (!selectedStudent) {
        showNotification('Παρακαλώ επιλέξτε πρώτα έναν μαθητή', 'warning');
        return;
      }
      document.getElementById('progressModal').style.display = 'block';
    }
    
    function closeProgressModal() {
      document.getElementById('progressModal').style.display = 'none';
      document.getElementById('progressForm').reset();
      setDefaultDates();
    }
    
    // Φόρτωση subject.code στο dropdown του calendar modal
    async function loadCalendarSubjects() {
      const select = document.getElementById('subjectSelect');
      console.log('loadCalendarSubjects called, select:', select);
      if (select) {
        select.innerHTML = '<option value="">Επιλέξτε κωδικό μαθήματος...</option>';
        if (window.allSubjects && Array.isArray(window.allSubjects)) {
          console.log('Populating dropdown with subjects:', window.allSubjects.length);
          window.allSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = `${subject.code} - ${subject.name} (${subject.class})`;
            select.appendChild(option);
          });
          console.log('Dropdown options count:', select.options.length);
        } else {
          console.log('No subjects found to populate dropdown.');
        }
      } else {
        console.log('Dropdown element with id subjectSelect not found!');
      }
    }
    
async function openCalendarModal() {
  document.getElementById('calendarModal').style.display = 'flex';
  await loadSubjects();
  console.log('openCalendarModal: window.allSubjects after loadSubjects:', window.allSubjects);
  if (window.allSubjects && Array.isArray(window.allSubjects) && window.allSubjects.length > 0) {
    loadCalendarSubjects();
  } else {
    console.log('openCalendarModal: No subjects available to populate dropdown!');
  }
}
    
    function closeCalendarModal() {
      document.getElementById('calendarModal').style.display = 'none';
    }
    
    async function postCalendarEvent() {
      const eventType = document.getElementById('eventType').value;
      const subjectId = document.getElementById('subjectSelect').value;
      const eventDate = document.getElementById('eventDate').value;
      const eventTime = document.getElementById('eventTime').value;
      const eventTitle = document.getElementById('eventTitle').value.trim();
      const eventText = document.getElementById('eventText').value.trim();
      // Δεν απαιτείται πλέον classId, αρκεί το subjectId
      if (!eventType || !subjectId || !eventDate || !eventTitle) {
        alert('Συμπληρώστε όλα τα υποχρεωτικά πεδία!');
        return;
      }
      const res = await fetch('/api/calendar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, eventType, eventDate, eventTime, eventTitle, eventText })
      });
      if (res.ok) {
        alert('Το γεγονός αναρτήθηκε!');
        closeCalendarModal();
      } else {
        alert('Σφάλμα ανάρτησης γεγονότος!');
      }
    }
    
    // Functions για καθαρισμό forms χωρίς κλείσιμο των modals
    function clearGradesForm() {
      document.getElementById('gradeSubject').value = '';
      document.getElementById('gradeType').value = '';
      document.getElementById('gradeValue').value = '';
      document.getElementById('gradeDate').value = '';
      document.getElementById('gradeComments').value = '';
      setDefaultDates();
      showNotification('Τα πεδία καθαρίστηκαν', 'info');
    }
    
    function clearProgressForm() {
      document.getElementById('progressSubject').value = '';
      document.getElementById('progressNote').value = '';
      document.getElementById('progressDate').value = '';
      document.getElementById('progressRating').value = '';
      setDefaultDates();
      showNotification('Τα πεδία καθαρίστηκαν', 'info');
    }
    
    function clearCalendarForm() {
      document.getElementById('calendarTitle').value = '';
      document.getElementById('calendarDescription').value = '';
      document.getElementById('calendarDate').value = '';
      document.getElementById('calendarTime').value = '';
      document.getElementById('calendarEventType').value = '';
      document.getElementById('calendarSubject').value = '';
      setDefaultDates();
      showNotification('Τα πεδία καθαρίστηκαν', 'info');
    }
    
    // Form submission handlers
    document.getElementById('gradesForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!selectedStudent) {
        showNotification('Δεν έχει επιλεγεί μαθητής', 'error');
        return;
      }
      
      const formData = new FormData(this);
      const gradeData = {
        studentId: selectedStudent.id,
        subjectId: document.getElementById('gradeSubject').value,
        examType: document.getElementById('gradeType').value,
        grade: parseFloat(document.getElementById('gradeValue').value),
        examDate: document.getElementById('gradeDate').value,
        notes: document.getElementById('gradeComments').value
      };
      
      console.log(' Sending grade data:', gradeData);
      console.log(' Selected student subjects:', selectedStudentSubjects);
      
      try {
        const response = await fetch('/api/grades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gradeData)
        });
        
        if (response.ok) {
          showNotification(' Ο βαθμός αποθηκεύτηκε επιτυχώς! Μπορείτε να προσθέσετε άλλον βαθμό ή να κλείσετε το παράθυρο.', 'success');
          const result = await response.json();
          console.log('Grade saved response:', result);
          
          // Optionally, you can keep the modal open and just clear the form
          // closeGradesModal();
          // clearGradesForm();
        } else {
          const errorText = await response.text();
          console.error('Failed to save grade, status:', response.status, 'Response:', errorText);
          showNotification('Σφάλμα κατά την αποθήκευση του βαθμού: ' + errorText, 'error');
        }
      } catch (error) {
        console.error('Error saving grade:', error);
        showNotification('Σφάλμα κατά την αποθήκευση του βαθμού', 'error');
      }
    });
    
    const progressForm = document.getElementById('progressForm');
if (progressForm) {
  progressForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!selectedStudent) {
      showNotification('Δεν έχει επιλεγεί μαθητής', 'error');
      return;
    }
    
    const formData = new FormData(this);
    const progressData = {
      studentId: selectedStudent.id,
      subjectId: document.getElementById('progressSubject').value,
      date: document.getElementById('progressDate').value,
      note: document.getElementById('progressNote').value,
      rating: document.getElementById('progressRating').value
    };
    
    console.log(' Sending progress data:', progressData);
    
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        showNotification(' Η πρόοδος αποθηκεύτηκε επιτυχώς! Μπορείτε να προσθέσετε άλλη καταχώρηση ή να κλείσετε το παράθυρο.', 'success');
        const result = await response.json();
        console.log('Progress saved response:', result);
      } else {
        const errorText = await response.text();
        console.error('Failed to save progress, status:', response.status, 'Response:', errorText);
        showNotification('Σφάλμα κατά την αποθήκευση της πρόοδου: ' + errorText, 'error');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      showNotification('Σφάλμα κατά την αποθήκευση της πρόοδου', 'error');
    }
  });
}
    
    document.getElementById('calendarForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!selectedStudent) {
        showNotification('Δεν έχει επιλεγεί μαθητής', 'error');
        return;
      }
      
      const formData = new FormData(this);
      const eventData = {
        studentId: selectedStudent.id,
        title: document.getElementById('calendarTitle').value,
        description: document.getElementById('calendarDescription').value,
        entryDate: document.getElementById('calendarDate').value,
        eventType: document.getElementById('calendarEventType').value,
        subjectId: document.getElementById('calendarSubject').value,
        time: document.getElementById('calendarTime').value
      };
      
      console.log(' Sending event data:', eventData);
      
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Event saved response:', result);
          
          showNotification('Το γεγονός αποθηκεύτηκε επιτυχώς!', 'success');
          // Καθαρισμός φόρμας χωρίς κλείσιμο του modal
          clearCalendarForm();
        } else {
          const errorText = await response.text();
          console.error('Failed to save event, status:', response.status, 'Response:', errorText);
          showNotification('Σφάλμα κατά την αποθήκευση του γεγονότος: ' + errorText, 'error');
        }
      } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Σφάλμα κατά την αποθήκευση του γεγονότος', 'error');
      }
    });

    // Function to show notifications
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
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        pointer-events: auto;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; margin-right: 10px;">${message}</div>
          <button onclick="this.parentElement.parentElement.remove()" style=""
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
            padding: 0;
            line-height: 1;
          ">&times;</button>
        </div>
      `;

      container.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
      }, 10);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.transform = 'translateX(100%)';
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove();
            }
          }, 400);
        }
      }, 5000);
    }

    function viewStudentDetails(studentId) {
      // Εμφάνιση modal ή alert με τα στοιχεία του μαθητή
      const student = allStudents.find(s => s.id === studentId || s.id === selectedStudent?.id);
      if (!student) {
        alert('Δεν βρέθηκε ο μαθητής.');
        return;
      }
      alert(`Όνομα: ${student.firstName} ${student.lastName}\nΤάξη: ${student.studentClass}\nΤηλέφωνο: ${student.phone}\nEmail: ${student.email || 'Δεν υπάρχει'}\nΓονέας: ${student.parentName || 'Δεν έχει καταχωρηθεί'}\nΤηλ. Γονέα: ${student.parentPhone || 'Δεν έχει καταχωρηθεί'}`);
    }

    window.viewStudentProgress = async function viewStudentProgress(studentId) {
      const student = allStudents.find(s => s.id === studentId || s.id === selectedStudent?.id);
      console.log('viewStudentProgress called', studentId); 
      if (!student) {
        showPopupCard('Δεν βρέθηκε ο μαθητής.', 'error');
        return;
      }
      try {
        const response = await fetch(`/api/progress/${student.id}`);
        if (response.ok) {
          const progressNotes = await response.json();
          if (!progressNotes || progressNotes.length === 0) {
            showPopupCard(`Δεν υπάρχουν σημειώσεις προόδου για τον/την ${student.firstName} ${student.lastName}`, 'info');
            return;
          }
          let msg = `<strong>Σημειώσεις προόδου για τον/την ${student.firstName} ${student.lastName}:</strong><br>`;
          progressNotes.forEach(note => {
            // Βρες το όνομα μαθήματος
            const subj = allSubjects.find(s => s.id === note.subjectId);
            const subjectName = subj ? subj.name : note.subjectId;
            // Αφαίρεση ώρας από noteDate (ISO format)
            let dateOnly = '';
            if (note.noteDate) {
              if (note.noteDate.includes('T')) {
                dateOnly = note.noteDate.split('T')[0];
              } else if (note.noteDate.includes(' ')) {
                dateOnly = note.noteDate.split(' ')[0];
              } else {
                dateOnly = note.noteDate;
              }
            }
            msg += `Μάθημα: <b>${subjectName}</b> | Ημ/νία: ${dateOnly} | Επίπεδο: ${note.performanceLevel || '-'}<br>Σχόλιο: ${note.content || '-'}<br>`;
            msg += `<button onclick="editProgressNote('${note.id}')">Επεξεργασία</button> <button onclick="deleteProgressNote('${note.id}')">Διαγραφή</button><hr>`;
          });
          showPopupCard(msg, 'info', true);
        } else {
          showPopupCard('Σφάλμα κατά την ανάκτηση σημειώσεων προόδου', 'error');
        }
      } catch (error) {
        showPopupCard('Σφάλμα σύνδεσης με το server', 'error');
      }
    }

    // Popup καρτέλα για βαθμούς
    function showPopupCard(message, type = 'info', html = false) {
      let card = document.createElement('div');
      card.className = `popup-card ${type}`;
      card.style.position = 'fixed';
      card.style.top = '60px';
      card.style.right = '40px';
      card.style.zIndex = 9999;
      card.style.background = type === 'error' ? '#ffdddd' : '#f7faff';
      card.style.color = '#333';
      card.style.padding = '22px 28px';
      card.style.borderRadius = '15px';
      card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
      card.style.fontSize = '17px';
      card.style.maxWidth = '420px';
      card.style.minWidth = '220px';
      card.style.textAlign = 'left';
      card.style.border = type === 'error' ? '2px solid #d33' : '2px solid #3c3';
      card.style.transition = 'opacity 0.3s';
      card.innerHTML = html ? message : message.replace(/\n/g, '<br>');
      // Κουμπί κλεισίματος
      let closeBtn = document.createElement('span');
      closeBtn.textContent = '×';
      closeBtn.style.float = 'right';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.fontSize = '22px';
      closeBtn.style.marginLeft = '12px';
      closeBtn.onclick = () => card.remove();
      card.prepend(closeBtn);
      document.body.appendChild(card);
      setTimeout(() => { card.style.opacity = '0'; setTimeout(() => card.remove(), 400); }, 9000);
    }

    // Φόρτωση τάξεων για το calendar modal
    async function loadClasses() {
      // Φόρτωση codes από τα subjects αντί για τάξεις
      try {
          const response = await fetch('/api/subjects');
          if (response.ok) {
              const subjects = await response.json();
              // Γέμισε το dropdown του calendar modal
              const select = document.getElementById('calendarSubject');
              if (select) {
                  select.innerHTML = '<option value="">Επιλέξτε κωδικό μαθήματος...</option>';
                  subjects.forEach(subj => {
                      select.innerHTML += `<option value="${subj.code}">${subj.code} - ${subj.name}</option>`;
                  });
              }
          }
      } catch (error) {
          console.error('Error loading subjects:', error);
      }
    }
async function viewStudentProgress(studentId) {
  const student = allStudents.find(s => s.id === studentId || s.id === selectedStudent?.id);
  if (!student) {
    showPopupCard('Δεν βρέθηκε ο μαθητής.', 'error');
    return;
  }
  try {
    const response = await fetch(`/api/progress/${student.id}`);
    if (response.ok) {
      const progressList = await response.json();
      window._lastProgressList = progressList; // αποθηκεύουμε για edit
      if (!progressList || progressList.length === 0) {
        /*
        showPopupCard(`Δεν υπάρχουν σημειώσεις προόδου για τον/την ${student.firstName} ${student.lastName}`, 'info');
        */
        showPopupCard(`Δεν υπάρχουν σημειώσεις προόδου για τον/την ${student.firstName} ${student.lastName}`, 'info');

       
       
        return;
      }
      let msg = `<strong>Σημειώσεις προόδου για τον/την ${student.firstName} ${student.lastName}:</strong><br>`;
      progressList.forEach(p => {
        // Αντιστοίχιση backend -> frontend
        const subj = allSubjects.find(s => s.id === p.subject_id);
        const subjectName = subj ? subj.name : p.subject_name || p.subject_id;
        let dateOnly = p.note_date ? (p.note_date.split('T')[0] || p.note_date) : '';
        const note = p.content || p.note || '';
        const rating = p.performance_level || p.rating || '-';
        msg += `<div style='border-bottom:1px solid #eee;margin-bottom:8px;padding-bottom:6px;'>` +
          `<b>Μάθημα:</b> ${subjectName} | <b>Ημ/νία:</b> ${dateOnly}<br>` +
          `<b>Σημείωση:</b> <span id='note-${p.id}'>${note}</span><br>` +
          `<b>Αξιολόγηση:</b> ${rating}<br>` +
          `<button onclick='editProgressNote(${p.id}, ${student.id})' style='margin-right:8px;'>Επεξεργασία</button>` +
          `<button onclick='deleteProgressNote(${p.id}, ${student.id})' style='color:#b00;'>Διαγραφή</button>` +
          `</div>`;
      });
      showProgressViewModal(msg, student);
    } else {
      showPopupCard('Σφάλμα κατά την ανάκτηση σημειώσεων προόδου', 'error');
    }
  } catch (error) {
    showPopupCard('Σφάλμα σύνδεσης με το server', 'error');
  }
}

function showProgressViewModal(html, student) {
  document.getElementById('progressViewModalTitle').innerHTML = `Σημειώσεις προόδου για τον/την ${student.firstName} ${student.lastName}`;
  document.getElementById('progressViewModalBody').innerHTML = html;
  document.getElementById('progressViewModal').style.display = 'block';
}
function closeProgressViewModal() {
  document.getElementById('progressViewModal').style.display = 'none';
}

// Προσθήκη modal για εμφάνιση σημειώσεων προόδου αν δεν υπάρχει ήδη
(function addProgressViewModalToDOM() {
  if (!document.getElementById('progressViewModal')) {
    const modal = document.createElement('div');
    modal.id = 'progressViewModal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 650px; background: #fff8e8; border: 2px solid #ff7e5f; border-radius: 15px; box-shadow: 0 10px 30px rgba(77, 44, 30, 0.15);">
        <span class="close" onclick="closeProgressViewModal()" style="color: #4d2c1e; font-size: 28px; font-weight: bold;">&times;</span>
        <h2 id="progressViewModalTitle" style="color: #4d2c1e; text-align: center; margin-bottom: 25px; font-size: 24px; border-bottom: 3px solid #ff7e5f; padding-bottom: 15px;"></h2>
        <div id="progressViewModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
})();

window.viewStudentGrades = async function viewStudentGrades(studentId) {
  const student = allStudents.find(s => s.id === studentId || s.id === selectedStudent?.id);
  if (!student) {
    showPopupCard('Δεν βρέθηκε ο μαθητής.', 'error');
    return;
  }
  try {
    const response = await fetch(`/api/grades/${student.id}`);
    if (response.ok) {
      const grades = await response.json();
      if (!grades || grades.length === 0) {
        showPopupCard(`Δεν υπάρχουν βαθμολογίες για τον/την ${student.firstName} ${student.lastName}`, 'info');
        return;
      }
      let msg = `<strong>Βαθμολογίες για τον/την ${student.firstName} ${student.lastName}:</strong><br>`;
      grades.forEach(grade => {
        const subj = allSubjects.find(s => s.id === grade.subject_id || s.id === grade.subjectId);
        const subjectName = subj ? subj.name : grade.subject_name || grade.subjectId || grade.subject_id;
        let dateOnly = grade.grade_date ? (grade.grade_date.split('T')[0] || grade.grade_date) : '';
        msg += `<div style='border-bottom:1px solid #eee;margin-bottom:8px;padding-bottom:6px;'>` +
          `<b>Μάθημα:</b> ${subjectName} | <b>Ημ/νία:</b> ${dateOnly}<br>` +
          `<b>Βαθμός:</b> ${grade.grade || '-'}<br>` +
          `<b>Σχόλιο:</b> ${grade.comment || '-'}<br>` +
          `</div>`;
      });
      showPopupCard(msg, 'info', true);
    } else {
      showPopupCard('Σφάλμα κατά την ανάκτηση βαθμολογιών', 'error');
    }
  } catch (error) {
    showPopupCard('Σφάλμα σύνδεσης με το server', 'error');
  }
}
