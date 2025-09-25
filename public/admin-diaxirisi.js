    // Data variables - will be loaded from API
    let students = [];
    let filteredStudents = [];
    let subjects = []; // Will be loaded from Classes table
    let enrollments = []; // Will be loaded from Enrollments table
    let teachers = []; // Will be loaded from Teachers API
    let enrollmentFormSubmitting = false; // Flag to prevent double submission

    // Load all data from API
    async function loadAllData() {
      try {
        // Φόρτωσε enrollments πρώτα, μετά students, μετά τα υπόλοιπα
        await loadEnrollmentsFromAPI();
        await loadStudentsFromAPI();
        await Promise.all([
          loadClassesFromAPI(),
          loadTeachersFromAPI()
        ]);
        console.log('All data loaded successfully');
        
        // Initialize displays after data is loaded
        initializeSubjectsDisplay();
        initializeTeachersDisplay();
        loadTeachersDropdown(); // Load teachers into dropdown after data is loaded
        
      } catch (error) {
        console.error('Error loading data:', error);
        showAlert('Σφάλμα φόρτωσης δεδομένων: ' + error.message, 'error');
      }
    }

    // Load teachers from API
    async function loadTeachersFromAPI() {
      try {
        const response = await fetch('/api/teachers');
        if (!response.ok) {
          throw new Error('Failed to fetch teachers');
        }
        const teachersData = await response.json();
        
        // Convert API data to match the expected format
        teachers = teachersData.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          subject: teacher.subject,
          phone: teacher.phone,
          email: teacher.email
        }));
        
        console.log('Loaded teachers from API:', teachers);
      } catch (error) {
        console.error('Error loading teachers from API:', error);
        // Fallback to hardcoded data
        teachers = [
          { id: 1, name: "Δρ. Μαρία Αντωνίου", subject: "Μαθηματικά", phone: "6901234567", email: "maria.antoniou@mathsteki.gr" },
          { id: 2, name: "Κώστας Γεωργίου", subject: "Φυσική", phone: "6902345678", email: "kostas.georgiou@mathsteki.gr" },
          { id: 3, name: "Ελένη Παπαδάκη", subject: "Χημεία", phone: "6903456789", email: "eleni.papadaki@mathsteki.gr" },
          { id: 4, name: "Γιάννης Νικολάου", subject: "Αρχαία", phone: "6904567890", email: "giannis.nikolaou@mathsteki.gr" },
          { id: 5, name: "Άννα Κωνσταντίνου", subject: "Νέα Ελληνικά", phone: "6905678901", email: "anna.konstantinou@mathsteki.gr" }
        ];
      }
    }

    // Load classes from API (these are our "subjects")
    async function loadClassesFromAPI() {
      console.log(' loadClassesFromAPI() called');
      try {
        console.log(' Fetching /api/subjects...');
        const response = await fetch('/api/subjects');
        console.log(' Response received:', response.status, response.ok);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const subjectsData = await response.json();
        
        console.log('Raw subjects data from API:', subjectsData);
        console.log('First subject data:', subjectsData[0]);
        
        // Convert API data to match expected format
        subjects = subjectsData.map(subj => {
          console.log('Processing subject:', subj);
          const mappedSubject = {
            id: subj.id,
            name: subj.name,
            code: subj.code,
            class: subj.class,
            teacherId: subj.teacherId,
            teacherName: subj.teacherName
          };
          console.log('Mapped subject:', mappedSubject);
          return mappedSubject;
        });
        
        console.log('Final subjects array:', subjects);
      } catch (error) {
        console.error(' Error loading subjects:', error);
        // Fallback to hardcoded data
        subjects = [
          { id: 1, name: "Μαθηματικά", code: "Μγ4", class: "Γ' Λυκείου", teacherId: 1, teacherName: "Δρ. Μαρία Αντωνίου" },
          { id: 2, name: "Χημεία", code: "Χγ2", class: "Γ' Λυκείου", teacherId: 3, teacherName: "Ελένη Παπαδάκη" }
        ];
        console.log('Using fallback subjects:', subjects);
      }
    }

    // Load enrollments from API
    async function loadEnrollmentsFromAPI() {
      try {
        console.log(' Loading enrollments from API...');
        const response = await fetch('/api/enrollments');
        if (!response.ok) {
          throw new Error('Failed to fetch enrollments');
        }
        const enrollmentsData = await response.json();
        
        console.log('Raw enrollments data from API:', enrollmentsData);
        
        // Convert enrollments format - use the correct field names from the API response
        enrollments = enrollmentsData.map(enr => ({
          enrollment_id: enr.enrollment_id,
          student_id: enr.student_id,
          class_id: enr.class_id, // This is the subject ID for our purposes
          student_name: enr.student_name,
          student_class: enr.student_class,
          subject_name: enr.subject_name,
          subject_code: enr.subject_code,
          teacher_name: enr.teacher_name,
          enrollment_date: new Date().toISOString().split('T')[0] // Default date since not in API response
        }));
        console.log('Enrollments student_id:', enrollments.map(e => e.student_id));
        // ...existing code...
      } catch (error) {
        console.error(' Error loading enrollments:', error);
        // Keep existing enrollments on error
        console.log('Using existing enrollments:', enrollments);
      }
    }

    // Load students from API
    async function loadStudentsFromAPI() {
      try {
        const response = await fetch('/api/students');
        const studentsData = await response.json();
        
        // Convert API data to match the expected format
        students = studentsData.map(student => ({
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          username: student.username, // Important for linking to profile
          studentClass: student.class,
          phone: student.phone,
          email: student.email,
          parentPhone: student.parentPhone,
          address: student.address,
          birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
          enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
          status: student.status,
          notes: student.notes || ''
        }));
        
        filteredStudents = [...students];
        loadStudents(); // Refresh the table
        
        console.log('Loaded students from API:', students);
      } catch (error) {
        console.error('Error loading students from API:', error);
        // Fallback to mock data if API fails
        students = [
          {
            id: 1,
            firstName: "Γιάννης",
            lastName: "Παπαδόπουλος",
            username: "giannisp",
            studentClass: "Β' Λυκείου",
            phone: "6901234567",
            email: "giannis@example.com",
            parentName: "Κώστας Παπαδόπουλος",
            parentPhone: "6907654321",
            address: "Λεωφ. Κηφισίας 123, Αθήνα",
            birthDate: "2007-03-15",
            enrollmentDate: "2023-09-01",
            status: "active",
            notes: "Πολύ καλός μαθητής, ενδιαφέρεται για τα μαθηματικά"
          }
        ];
        filteredStudents = [...students];
        loadStudents();
      }
    }

    // Load students on page load
    document.addEventListener('DOMContentLoaded', function() {
      console.log(' DOM Content Loaded - Starting data loading...');
      loadAllData(); // Load all data from API
      
      // Set today's date as default for enrollment date
      document.getElementById('enrollmentDate').value = new Date().toISOString().split('T')[0];
    });

    // Load teachers into dropdown
    function loadTeachersDropdown() {
      const select = document.getElementById('subjectTeacher');
      select.innerHTML = '<option value="">Επιλέξτε καθηγητή</option>';
      
      teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.subject})`;
        select.appendChild(option);
      });
    }

    // Search functionality
    function searchStudents() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const classFilter = document.getElementById('classFilter').value;

      filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm || 
          student.firstName.toLowerCase().includes(searchTerm) ||
          student.lastName.toLowerCase().includes(searchTerm) ||
          student.phone.includes(searchTerm) ||
          (student.email && student.email.toLowerCase().includes(searchTerm));

        const matchesClass = !classFilter || student.studentClass === classFilter;

        return matchesSearch && matchesClass;
      });

      loadStudents();
    }

    // Load students into table
    function loadStudents() {
      const tbody = document.getElementById('studentsTableBody');
      tbody.innerHTML = '';

      if (filteredStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Δεν βρέθηκαν μαθητές</td></tr>';
        return;
      }

      filteredStudents.forEach(student => {
        // Get student's enrollments (string/number safe)
        const studentEnrollments = enrollments.filter(e => e.student_id == student.id);        // Debug: Print enrollments for each student
        console.log('Student:', student.id, student.firstName, student.lastName, 'Enrollments:', studentEnrollments);
        // Debug: Print all enrollments
        if (studentEnrollments.length === 0) {
          console.warn('No enrollments found for student:', student.id, student.firstName, student.lastName);
        }
        // Get student's enrollments
        const enrollmentTexts = studentEnrollments.map(enrollment => {
          // Use enrollment.subject_name, enrollment.subject_code, enrollment.teacher_name directly from API if available
          if (enrollment.subject_name && enrollment.subject_code) {
            const teacherInfo = enrollment.teacher_name ? ` - ${enrollment.teacher_name}` : ' - Δεν έχει καθηγητή';
            return `${enrollment.subject_name} ${enrollment.subject_code}${teacherInfo}`;
          }
          // Fallback to subjects array if needed
          const subject = subjects.find(s => s.id === enrollment.class_id);
          const teacher = teachers.find(t => t.id === (subject ? subject.teacherId : null));
          if (subject) {
            const teacherInfo = teacher ? ` - ${teacher.name}` : ' - Δεν έχει καθηγητή';
            return `${subject.name} ${subject.code}${teacherInfo}`;
          }
          return '';
        }).filter(text => text);
        
        const enrollmentsDisplay = enrollmentTexts.length > 0 ? 
          enrollmentTexts.join('<br>') : 
          '<span style="color: #888;">Χωρίς εγγραφές</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.firstName}</td>
          <td>${student.lastName}</td>
          <td>${student.studentClass}</td>
          <td>${enrollmentsDisplay}</td>
          <td>${student.phone}</td>
          <td>${student.email || '-'}</td>
          <td>${formatDate(student.enrollmentDate)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-small" onclick="viewStudent(${student.id})">Προβολή</button>
              <button class="btn btn-info btn-small" onclick="viewStudentProfile(${student.id})" title="Δες την καρτέλα μαθητή">Καρτέλα</button>
              <button class="btn btn-primary btn-small" onclick="editStudent(${student.id})">Επεξεργασία</button>
              <button class="btn btn-success btn-small" onclick="manageEnrollments(${student.id})">Τμήματα</button>
              <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id})">Διαγραφή</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Format date for display
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR');
  }

    // Modal functions
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Προσθήκη Νέου Μαθητή';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  document.getElementById('enrollmentDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('status').value = 'active';
  
  // Clear username and password fields
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  
  document.getElementById('studentModal').style.display = 'block';
}

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  document.getElementById('modalTitle').textContent = 'Επεξεργασία Μαθητή';
  document.getElementById('studentId').value = student.id;
  document.getElementById('firstName').value = student.firstName;
  document.getElementById('lastName').value = student.lastName;
  document.getElementById('studentClass').value = student.studentClass;
  document.getElementById('phone').value = student.phone;
  document.getElementById('email').value = student.email || '';
  document.getElementById('parentName').value = student.parentName || '';
  document.getElementById('parentPhone').value = student.parentPhone || '';
  document.getElementById('address').value = student.address || '';
  document.getElementById('birthDate').value = student.birthDate || '';
  document.getElementById('enrollmentDate').value = student.enrollmentDate || '';
  document.getElementById('status').value = student.status || 'active';
  document.getElementById('notes').value = student.notes || '';
  
  document.getElementById('studentModal').style.display = 'block';
}
   
function viewStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  const content = document.getElementById('studentDetailsContent');
  content.innerHTML = `
    <div class="student-details">
      <h3>${student.firstName} ${student.lastName}</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
        <div><strong>Τάξη:</strong> ${student.studentClass}</div>
        <div><strong>Κατάσταση:</strong> ${getStatusText(student.status)}</div>
        <div><strong>Τηλέφωνο:</strong> ${student.phone}</div>
        <div><strong>Email:</strong> ${student.email || '-'}</div>
        <div><strong>Ημ. Γέννησης:</strong> ${formatDate(student.birthDate)}</div>
        <div><strong>Ημ. Εγγραφής:</strong> ${formatDate(student.enrollmentDate)}</div>
        <div><strong>Γονέας:</strong> ${student.parentName || '-'}</div>
        <div><strong>Τηλ. Γονέα:</strong> ${student.parentPhone || '-'}</div>
      </div>
      ${student.address ? `<div style="margin-top: 15px;"><strong>Διεύθυνση:</strong><br>${student.address}</div>` : ''}
      ${student.notes ? `<div style="margin-top: 15px;"><strong>Σημειώσεις:</strong><br>${student.notes}</div>` : ''}
      <div style="margin-top: 20px; text-align: center;">
        ${student.username ? 
          `<button class="btn btn-info" onclick="viewStudentProfile(${student.id})" style="margin-right: 10px;">
              Δες Καρτέλα Μαθητή
           </button>` : 
          `<span style="color: #888; font-style: italic;">Δεν είναι διαθέσιμη καρτέλα (χωρίς username)</span>`
        }
        <button class="btn btn-primary" onclick="editStudent(${student.id})">
           Επεξεργασία
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('viewStudentModal').style.display = 'block';
}
    
function getStatusText(status) {
  switch(status) {
    case 'active': return 'Ενεργός';
    case 'inactive': return 'Ανενεργός';
    case 'graduated': return 'Απόφοιτος';
    default: return status;
  }
}

function closeModal() {
  document.getElementById('studentModal').style.display = 'none';
}

function closeViewModal() {
  document.getElementById('viewStudentModal').style.display = 'none';
}
/*
 function deleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε τον μαθητή ${student.firstName} ${student.lastName};`)) {
    students = students.filter(s => s.id !== id);
    filteredStudents = filteredStudents.filter(s => s.id !== id);
    loadStudents();
    showAlert('Ο μαθητής διαγράφηκε επιτυχώς!', 'success');
  }
}
    */

async function deleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε τον μαθητή ${student.firstName} ${student.lastName};`)) {
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (response.ok) {
        students = students.filter(s => s.id !== id);
        filteredStudents = filteredStudents.filter(s => s.id !== id);
        loadStudents();
        showAlert('Ο μαθητής διαγράφηκε επιτυχώς!', 'success');
      } else {
        showAlert('Σφάλμα κατά τη διαγραφή του μαθητή.', 'danger');
      }
    } catch (error) {
      showAlert('Σφάλμα σύνδεσης με τον διακομιστή.', 'danger');
    }
  }
}


// Function to view student profile in student-tablet.html
    function viewStudentProfile(studentId) {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        alert('Μαθητής δεν βρέθηκε');
        return;
      }
      
      // Check if student has username
      if (!student.username) {
        alert('Ο μαθητής δεν έχει username. Παρακαλώ ορίστε username πρώτα.');
        return;
      }
      
      // Open student profile in new tab/window
      const studentProfileUrl = `student-tablet.html?username=${encodeURIComponent(student.username)}`;
      window.open(studentProfileUrl, '_blank');
    }

    // Form submission
    document.getElementById('studentForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const studentData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        studentClass: document.getElementById('studentClass').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        parentName: document.getElementById('parentName').value,
        parentPhone: document.getElementById('parentPhone').value,
        address: document.getElementById('address').value,
        birthDate: document.getElementById('birthDate').value,
        registrationDate: document.getElementById('enrollmentDate').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value
      };

      const studentId = document.getElementById('studentId').value;

      try {
        if (studentId) {
          // Edit existing student
          const response = await fetch(`/api/students/${studentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
          });
          
          if (response.ok) {
            showAlert('Τα στοιχεία του μαθητή ενημερώθηκαν επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            showAlert(error.error || 'Σφάλμα κατά την ενημέρωση', 'error');
          }
        } else {
          // Add new student
          console.log(' Sending student data:', studentData);
          
          const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(' Student created:', result);
            showAlert('Ο νέος μαθητής προστέθηκε επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            console.error(' Error creating student:', error);
            showAlert(error.error || 'Σφάλμα κατά την προσθήκη μαθητή', 'error');
          }
        }

        closeModal();
        await loadStudentsFromAPI(); // Refresh the list from server
      } catch (error) {
        console.error(' Network error:', error);
        showAlert('Σφάλμα δικτύου. Παρακαλώ δοκιμάστε ξανά.', 'error');
      }
    });

    // Show alert messages
    function showAlert(message, type) {
      const alertElement = type === 'success' ? 
        document.getElementById('alertSuccess') : 
        document.getElementById('alertError');
      
      alertElement.textContent = message;
      alertElement.style.display = 'block';
      
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 5000);
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
      const modal = document.getElementById('studentModal');
      const viewModal = document.getElementById('viewStudentModal');
      if (event.target === modal) {
        closeModal();
      }
      if (event.target === viewModal) {
        closeViewModal();
      }
    }

    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchStudents();
      }
    });

    // Auto search on input change
    document.getElementById('searchInput').addEventListener('input', searchStudents);
    document.getElementById('classFilter').addEventListener('change', searchStudents);

    // ===== SUBJECTS SEARCH AND DISPLAY =====
    
    let filteredSubjects = [];

    // Search functionality for subjects
    function searchSubjects() {
      const searchTerm = document.getElementById('subjectSearchInput').value.toLowerCase();
      const classFilter = document.getElementById('subjectClassFilter').value;

      filteredSubjects = subjects.filter(subject => {
        const teacher = teachers.find(t => t.id === subject.teacherId);
        const teacherName = teacher ? teacher.name.toLowerCase() : '';
        const teacherSubject = teacher ? teacher.subject.toLowerCase() : '';
        
        const matchesSearch = !searchTerm || 
          subject.name.toLowerCase().includes(searchTerm) ||
          subject.code.toLowerCase().includes(searchTerm) ||
          teacherName.includes(searchTerm) ||
          teacherSubject.includes(searchTerm);

        const matchesClass = !classFilter || subject.class === classFilter;

        return matchesSearch && matchesClass;
      });

      loadFilteredSubjects();
    }

    // Load filtered subjects into table
    function loadFilteredSubjects() {
      const tbody = document.getElementById('subjectsTableBody');
      tbody.innerHTML = '';

      if (filteredSubjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">Δεν βρέθηκαν τμήματα</td></tr>';
        return;
      }

      filteredSubjects.forEach(subject => {
        // Αφαιρέθηκε ο έλεγχος για το πεδίο subject
        const enrolledCount = enrollments.filter (e => e.class_id === subject.id).length;
        const teacher = teachers.find(t => t.id === subject.teacherId);
        const teacherName = teacher ? teacher.name : 'Δεν έχει ανατεθεί';
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${subject.id}</td>
          <td>${subject.name}</td>
          <td>${subject.code}</td>
          <td>${subject.class}</td>
          <td>${teacherName}</td>
          <td>${teacher ? teacher.subject : '-'}</td>
          <td>${enrolledCount}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-small" onclick="editSubject(${subject.id})">Επεξεργασία</button>
              <button class="btn btn-danger btn-small" onclick="deleteSubject(${subject.id})">Διαγραφή</button>
              <button class="btn btn-info btn-small" onclick="viewSubjectDetails(${subject.id})">Λεπτομέρειες</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Initialize subjects display when data is loaded
    function initializeSubjectsDisplay() {
      filteredSubjects = [...subjects];
      loadFilteredSubjects();
    }

    // Add event listeners for subjects search
    document.addEventListener('DOMContentLoaded', function() {
      // ...existing code...
      
      // Subjects search functionality
      document.getElementById('subjectSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchSubjects();
        }
      });

      document.getElementById('subjectSearchInput').addEventListener('input', searchSubjects);
      document.getElementById('subjectClassFilter').addEventListener('change', searchSubjects);
    });

    // Open add subject modal
    function openAddSubjectModal() {
      loadSubjectTeachersDropdown();
      initializeSubjectsDisplay();
      document.getElementById('subjectsModal').style.display = 'block';
      // Scroll στο κουμπί "Νέο Τμήμα" όταν ανοίγει η modal
      const btn = document.querySelector('button.btn-success[onclick="openAddSubjectModal()"]');
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Open subjects modal (general)
    function openSubjectsModal() {
      loadSubjectTeachersDropdown();
      initializeSubjectsDisplay();
      document.getElementById('subjectsModal').style.display = 'block';
    }

    // Close subjects modal
    function closeSubjectsModal() {
      document.getElementById('subjectsModal').style.display = 'none';
    }

    // Load teachers dropdown for subject creation
    function loadSubjectTeachersDropdown() {
      const select = document.getElementById('subjectTeacher');
      select.innerHTML = '<option value="">Επιλέξτε καθηγητή</option>';
      
      teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.subject})`;
        select.appendChild(option);
      });
    }

    // View subject details
    function viewSubjectDetails(subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      const teacher = teachers.find(t => t.id === subject.teacherId);
      const enrolledStudents = enrollments.filter(e => e.class_id === subjectId);
      
      let studentsList = '';
      if (enrolledStudents.length > 0) {
        enrolledStudents.forEach(enrollment => {
          const student = students.find(s => s.id === enrollment.student_id);
          if (student) {
            studentsList += `<li>${student.firstName} ${student.lastName} (${student.studentClass})</li>`;
          }
        });
      } else {
        studentsList = '<li>Δεν υπάρχουν εγγεγραμμένοι μαθητές</li>';
      }

      const detailsHtml = `
        <h3>Λεπτομέρειες Τμήματος</h3>
        <p><strong>Μάθημα:</strong> ${subject.name}</p>
        <p><strong>Κωδικός:</strong> ${subject.code}</p>
        <p><strong>Τάξη:</strong> ${subject.class}</p>
        <p><strong>Καθηγητής:</strong> ${teacher ? teacher.name : 'Δεν έχει ανατεθεί'}</p>
        <p><strong>Ειδικότητα:</strong> ${teacher ? teacher.subject : '-'}</p>
        <p><strong>Αριθμός Μαθητών:</strong> ${enrolledStudents.length}</p>
        <h4>Εγγεγραμμένοι Μαθητές:</h4>
        <ul>${studentsList}</ul>
      `;

      // Show in a simple alert for now - could be enhanced with a proper modal
      alert(detailsHtml.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n'));
    }

    // ===== ENROLLMENTS MANAGEMENT =====
    
    function manageEnrollments(studentId) {
      console.log(' Managing enrollments for student:', studentId);
      const student = students.find(s => s.id === studentId);
      if (!student) {
        console.error('Student not found:', studentId);
        return;
      }

      console.log('Found student:', student);
      console.log('Current subjects array:', subjects);
      console.log('Current enrollments array:', enrollments);

      document.getElementById('enrollmentsTitle').textContent = `Εγγραφές - ${student.firstName} ${student.lastName}`;
      document.getElementById('enrollmentStudentId').value = studentId;
      
      loadEnrollmentSubjects();
      loadStudentEnrollments(studentId);
      
      document.getElementById('enrollmentsModal').style.display = 'block';
    }

    function closeEnrollmentsModal() {
      document.getElementById('enrollmentsModal').style.display = 'none';
    }

    function loadEnrollmentSubjects() {
      const select = document.getElementById('enrollmentSubject');
      const studentId = parseInt(document.getElementById('enrollmentStudentId').value);
      
      console.log('Loading enrollment subjects for student:', studentId);
      console.log('Available subjects:', subjects);
      console.log('Current enrollments:', enrollments);
      
      // Get subjects student is already enrolled in
      const enrolledSubjectIds = enrollments
        .filter(e => e.student_id === studentId)
        .map(e => e.class_id); // Use class_id from enrollments (this is the subject ID)
      
      console.log('Enrolled subject IDs:', enrolledSubjectIds);
      
      const availableSubjects = subjects.filter(s => !enrolledSubjectIds.includes(s.id));
      
      
      console.log('Available subjects for enrollment:', availableSubjects);
      
      select.innerHTML = '<option value="">Επιλέξτε τμήμα</option>';
      availableSubjects.forEach(subject => {
        console.log('Creating option for subject:', subject);
        const teacher = teachers.find(t => t.id === subject.teacherId);
        const teacherInfo = teacher ? ` - ${teacher.name}` : ' - Δεν έχει καθηγητή';
        
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = `${subject.name} ${subject.code} (${subject.class})${teacherInfo}`;
        select.appendChild(option);
        console.log('Added option with value:', option.value, 'text:', option.textContent);
      });
      
      console.log('Dropdown populated with', availableSubjects.length, 'options');
      console.log('Final dropdown HTML:', select.innerHTML);
    }

    function loadStudentEnrollments(studentId) {
      const tbody = document.getElementById('enrollmentsTableBody');
      tbody.innerHTML = '';

      console.log('Loading enrollments for student:', studentId);
      console.log('All enrollments:', enrollments);

      const studentEnrollments = enrollments.filter(e => e.student_id === studentId);
      
      console.log('Filtered student enrollments:', studentEnrollments);
      
      if (studentEnrollments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Δεν υπάρχουν εγγραφές</td></tr>';
        return;
      }

      studentEnrollments.forEach(enrollment => {
        const subject = subjects.find(s => s.id === enrollment.class_id); // Use class_id
        const teacher = teachers.find(t => t.id === (subject ? subject.teacherId : null));
        
        if (!subject) {
          console.warn('Subject not found for class_id:', enrollment.class_id);
          return;
        }

        const teacherName = teacher ? teacher.name : 'Δεν έχει οριστεί καθηγητής';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${subject.name}</td>
          <td>${subject.code}</td>
          <td>${subject.class}</td>
          <td>${teacherName}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-danger btn-small" onclick="removeEnrollment(${enrollment.enrollment_id})">Αφαίρεση</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    async function removeEnrollment(enrollmentId) {
      const enrollment = enrollments.find(e => e.enrollment_id === enrollmentId);
      if (!enrollment) {
        console.error('Enrollment not found:', enrollmentId);
        return;
      }

      const subject = subjects.find(s => s.id === enrollment.class_id);
      const student = students.find(s => s.id === enrollment.student_id);

      if (confirm(`Είστε βέβαιοι ότι θέλετε να αφαιρέσετε τον μαθητή από το τμήμα "${subject?.name} ${subject?.code}";`)) {
        try {
          // API call to delete enrollment
          const response = await fetch(`/api/enrollments/${enrollmentId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Update local data
            enrollments = enrollments.filter(e => e.enrollment_id !== enrollmentId);
            
            loadStudentEnrollments(enrollment.student_id);
            loadEnrollmentSubjects();
            loadStudents(); // Refresh main table
            
            showAlert('Η εγγραφή αφαιρέθηκε επιτυχώς από τη βάση!', 'success');
          } else {
            const result = await response.json();
            throw new Error(result.error || 'Σφάλμα κατά την αφαίρεση εγγραφής');
          }
        } catch (error) {
          console.error('Error removing enrollment:', error);
          showAlert('Σφάλμα κατά την αφαίρεση: ' + error.message, 'error');
        }
      }
    }

    // Enrollment form submission
    document.getElementById('enrollmentForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (enrollmentFormSubmitting) {
        console.log('Form already submitting, ignoring...');
        return;
      }
      
      enrollmentFormSubmitting = true;
      
      const studentId = parseInt(document.getElementById('enrollmentStudentId').value);
      const subjectId = parseInt(document.getElementById('enrollmentSubject').value);
      
      console.log('Submitting enrollment:', { studentId, subjectId });
      
      if (!subjectId || isNaN(subjectId)) {
        showAlert('Παρακαλώ επιλέξτε τμήμα!', 'error');
        enrollmentFormSubmitting = false;
        return;
      }

      try {
        // API call to create enrollment
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            classId: subjectId, // Note: using classId as per database structure
            studentId: studentId,
            status: 'active'
          })
        });

        const result = await response.json();
        console.log('Enrollment creation result:', result);

        if (response.ok) {
          // Reload enrollments from API to get the updated data

          await loadEnrollmentsFromAPI();
          
          loadStudentEnrollments(studentId);
          loadEnrollmentSubjects();
          loadStudents(); // Refresh main table
          
          this.reset();
          document.getElementById('enrollmentSubject').innerHTML = '<option value="">Επιλέξτε τμήμα</option>';
          
          showAlert('Η εγγραφή προστέθηκε επιτυχώς και αποθηκεύτηκε στη βάση!', 'success');
        } else {
          throw new Error(result.error || 'Σφάλμα κατά την προσθήκη εγγραφής');
        }
      } catch (error) {
        console.error('Error creating enrollment:', error);
        showAlert('Σφάλμα κατά την αποθήκευση: ' + error.message, 'error');
      } finally {
        enrollmentFormSubmitting = false; // Reset flag
      }
    });

    // ===== SUBJECT MANAGEMENT FUNCTIONS =====
    
    // Edit subject function
    function editSubject(subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        console.error('Subject not found:', subjectId);
        return;
      }

      console.log('Editing subject:', subject);
      
      // Populate the form
      document.getElementById('editSubjectId').value = subject.id;
      document.getElementById('editSubjectName').value = subject.name;
      document.getElementById('editSubjectCode').value = subject.code;
      document.getElementById('editSubjectClass').value = subject.class;
      
      // Load teachers into dropdown
      loadEditSubjectTeachersDropdown();
      
      // Set selected teacher
      setTimeout(() => {
        document.getElementById('editSubjectTeacher').value = subject.teacherId || '';
      }, 100);
      
      // Show the modal
      document.getElementById('editSubjectModal').style.display = 'block';
    }

    // Load teachers dropdown for edit subject modal
    function loadEditSubjectTeachersDropdown() {
      const select = document.getElementById('editSubjectTeacher');
      select.innerHTML = '<option value="">Επιλέξτε καθηγητή</option>';
      
      teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.subject})`;
        select.appendChild(option);
      });
    }

    // Close edit subject modal
    function closeEditSubjectModal() {
      document.getElementById('editSubjectModal').style.display = 'none';
    }

    // Delete subject function

    async function deleteSubject(subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        console.error('Subject not found:', subjectId);
        return;
      }

      // Check if subject has enrolled students
      const enrolledStudents = enrollments.filter(e => e.class_id === subjectId);
      if (enrolledStudents.length > 0) {
        alert(`Δεν μπορείτε να διαγράψετε το τμήμα "${subject.name}" γιατί έχει ${enrolledStudents.length} εγγεγραμμένους μαθητές.`);
        return;
      }

      if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε το τμήμα "${subject.name} ${subject.code}";`)) {
        try {
          const response = await fetch(`/api/subjects/${subjectId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Remove from local array
            subjects = subjects.filter(s => s.id !== subjectId);
            filteredSubjects = filteredSubjects.filter(s => s.id !== subjectId);
            
            // Refresh displays
            loadFilteredSubjects();
            loadStudents(); // Refresh students table to update enrollments display
            
            showAlert('Το τμήμα διαγράφηκε επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Σφάλμα κατά τη διαγραφή');
          }
        } catch (error) {
          console.error('Error deleting subject:', error);
          showAlert('Σφάλμα κατά τη διαγραφή: ' + error.message, 'error');
        }
      }
    }

    // Handle edit subject form submission
    document.addEventListener('DOMContentLoaded', function() {
      // ...existing code...
      
      // Edit subject form submission
      document.getElementById('editSubjectForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const subjectId = document.getElementById('editSubjectId').value;
        const subjectData = {
          name: document.getElementById('editSubjectName').value,
          code: document.getElementById('editSubjectCode').value,
          class: document.getElementById('editSubjectClass').value,
          teacherId: document.getElementById('editSubjectTeacher').value || null
        };

        try {
          const response = await fetch(`/api/subjects/${subjectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subjectData)
          });

          if (response.ok) {
            // Reload classes from API to get fresh data
            await loadClassesFromAPI();
            
            // Reload enrollments to get updated teacher names
            await loadEnrollmentsFromAPI();
            
            // Refresh displays
            initializeSubjectsDisplay();
            loadStudents(); // Refresh students table to update enrollments display
            
            closeEditSubjectModal();
            showAlert('Το τμήμα ενημερώθηκε επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Σφάλμα κατά την ενημέρωση');
          }
        } catch (error) {
          console.error('Error updating subject:', error);
          showAlert('Σφάλμα κατά την ενημέρωση: ' + error.message, 'error');
        }
      });

      // Add subject form submission
      document.getElementById('subjectForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const subjectData = {
          name: document.getElementById('subjectName').value,
          code: document.getElementById('subjectCode').value,
          class: document.getElementById('subjectClass').value,
          teacherId: document.getElementById('subjectTeacher').value || null
        };

        console.log(' Sending subject data:', subjectData);
        console.log(' Form values:');
        console.log('  name:', document.getElementById('subjectName').value);
        console.log('  code:', document.getElementById('subjectCode').value);
        console.log('  class:', document.getElementById('subjectClass').value);
        console.log('  teacherId:', document.getElementById('subjectTeacher').value);

        try {
          const response = await fetch('/api/subjects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subjectData)
          });

          if (response.ok) {
            const result = await response.json();
            
            // Add to local subjects array
            const teacher = teachers.find(t => t.id == subjectData.teacherId);
            const newSubject = {
              id: result.id,
              ...subjectData,
              teacherName: teacher ? teacher.name : null,
              enrolledCount: 0
            };
            
            subjects.push(newSubject);
            
            // Refresh displays
            initializeSubjectsDisplay();
            loadStudents(); // Refresh students table
            
            // Reset form
            this.reset();
            loadSubjectTeachersDropdown(); // Reload dropdown after reset
            
            showAlert('Το τμήμα δημιουργήθηκε επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Σφάλμα κατά τη δημιουργία');
          }
        } catch (error) {
          console.error('Error creating subject:', error);
          showAlert('Σφάλμα κατά τη δημιουργία: ' + error.message, 'error');
        }
      });
    });

    // ===== TEACHERS MANAGEMENT =====
    
    let filteredTeachers = [];

    // Search functionality for teachers
    function searchTeachers() {
      const searchTerm = document.getElementById('teacherSearchInput').value.toLowerCase();
      const subjectFilter = document.getElementById('teacherSubjectFilter').value;

      filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = !searchTerm || 
          teacher.name.toLowerCase().includes(searchTerm) ||
          teacher.subject.toLowerCase().includes(searchTerm) ||
          (teacher.email && teacher.email.toLowerCase().includes(searchTerm)) ||
          (teacher.phone && teacher.phone.includes(searchTerm));

        const matchesSubject = !subjectFilter || teacher.subject === subjectFilter;

        return matchesSearch && matchesSubject;
      });

      loadFilteredTeachers();
    }

    // Load filtered teachers into table
    function loadFilteredTeachers() {
      const tbody = document.getElementById('teachersTableBody');
      tbody.innerHTML = '';

      if (filteredTeachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">Δεν βρέθηκαν καθηγητές</td></tr>';
        return;
      }

      filteredTeachers.forEach(teacher => {
        // Find subjects taught by this teacher
        const teacherSubjects = subjects.filter(s => s.teacherId === teacher.id);
        const subjectsText = teacherSubjects.length > 0 ? 
          teacherSubjects.map(s => `${s.name} (${s.code})`).join('<br>') : 
          '<span style="color: #888;">Δεν διδάσκει κάποιο τμήμα</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${teacher.id}</td>
          <td>${teacher.name}</td>
          <td>${teacher.subject}</td>
          <td>${teacher.phone || '-'}</td>
          <td>${teacher.email || '-'}</td>
          <td>${subjectsText}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-small" onclick="editTeacher(${teacher.id})">Επεξεργασία</button>
              <button class="btn btn-danger btn-small" onclick="deleteTeacher(${teacher.id})">Διαγραφή</button>
              <button class="btn btn-info btn-small" onclick="viewTeacherDetails(${teacher.id})">Λεπτομέρειες</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Initialize teachers display when data is loaded
    function initializeTeachersDisplay() {
      filteredTeachers = [...teachers];
      loadFilteredTeachers();
    }

    // Open add teacher modal
    function openAddTeacherModal() {
      document.getElementById('teacherModalTitle').textContent = 'Προσθήκη Νέου Καθηγητή';
      document.getElementById('teacherForm').reset();
      document.getElementById('teacherId').value = '';
      document.getElementById('teacherModal').style.display = 'block';
    }

    // Edit teacher
    function editTeacher(teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) {
        console.error('Teacher not found:', teacherId);
        return;
      }
      
      document.getElementById('teacherModalTitle').textContent = 'Επεξεργασία Καθηγητή';
      document.getElementById('teacherId').value = teacher.id;
      document.getElementById('teacherName').value = teacher.name;
      document.getElementById('teacherSubject').value = teacher.subject;
      document.getElementById('teacherPhone').value = teacher.phone || '';
      document.getElementById('teacherEmail').value = teacher.email || '';
      
      document.getElementById('teacherModal').style.display = 'block';
    }

    // Close teacher modal
    function closeTeacherModal() {
      document.getElementById('teacherModal').style.display = 'none';
    }

    // Delete teacher
    async function deleteTeacher(teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) return;

      // Check if teacher has assigned subjects
      const assignedSubjects = subjects.filter(s => s.teacherId === teacherId);
      if (assignedSubjects.length > 0) {
        alert(`Δεν μπορείτε να διαγράψετε τον καθηγητή "${teacher.name}" γιατί διδάσκει ${assignedSubjects.length} τμήματα.\n\nΠρώτα πρέπει να ανταθέσετε αυτά τα τμήματα σε άλλους καθηγητές.`);
        return;
      }

      if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε τον καθηγητή "${teacher.name}";`)) {
        try {
          const response = await fetch(`/api/teachers/${teacherId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Remove from local arrays
            teachers = teachers.filter(t => t.id !== teacherId);
            filteredTeachers = filteredTeachers.filter(t => t.id !== teacherId);
            
            // Refresh displays
            loadFilteredTeachers();
            loadTeachersDropdown(); // Refresh teacher dropdowns
            loadSubjectTeachersDropdown(); // Refresh subject teacher dropdown
            loadEditSubjectTeachersDropdown(); // Refresh edit subject teacher dropdown
            
            showAlert('Ο καθηγητής διαγράφηκε επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Σφάλμα κατά τη διαγραφή');
          }
        } catch (error) {
          console.error('Error deleting teacher:', error);
          showAlert('Σφάλμα κατά τη διαγραφή: ' + error.message, 'error');
        }
      }
    }

    // View teacher details
    function viewTeacherDetails(teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) return;

      const teacherSubjects = subjects.filter(s => s.teacherId === teacherId);
      let subjectsList = '';
      
      if (teacherSubjects.length > 0) {
        teacherSubjects.forEach(subject => {
          const enrolledCount = enrollments.filter(e => e.class_id === subject.id).length;
          subjectsList += `<li>${subject.name} (${subject.code}) - ${subject.class} - ${enrolledCount} μαθητές</li>`;
        });
      } else {
        subjectsList = '<li>Δεν διδάσκει κάποιο τμήμα</li>';
      }

      const detailsHtml = `
        <h3>Λεπτομέρειες Καθηγητή</h3>
        <p><strong>Όνομα:</strong> ${teacher.name}</p>
        <p><strong>Ειδικότητα:</strong> ${teacher.subject}</p>
        <p><strong>Τηλέφωνο:</strong> ${teacher.phone || 'Δεν έχει καταχωρηθεί'}</p>
        <p><strong>Email:</strong> ${teacher.email || 'Δεν έχει καταχωρηθεί'}</p>
        <p><strong>Αριθμός Τμημάτων:</strong> ${teacherSubjects.length}</p>
        <h4>Τμήματα που διδάσκει:</h4>
        <ul>${subjectsList}</ul>
      `;

      // Show in a simple alert for now - could be enhanced with a proper modal
      alert(detailsHtml.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n'));
    }

    // Add event listeners for teachers search
    document.addEventListener('DOMContentLoaded', function() {
      // ...existing code...
      
      // Teachers search functionality
      document.getElementById('teacherSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchTeachers();
        }
      });

      document.getElementById('teacherSearchInput').addEventListener('input', searchTeachers);
      document.getElementById('teacherSubjectFilter').addEventListener('change', searchTeachers);
      
      // Teacher form submission
      document.getElementById('teacherForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const teacherId = document.getElementById('teacherId').value;
        const teacherData = {
          name: document.getElementById('teacherName').value,
          subject: document.getElementById('teacherSubject').value,
          phone: document.getElementById('teacherPhone').value || null,
          email: document.getElementById('teacherEmail').value || null
        };

        try {
          let response;
          if (teacherId) {
            // Update existing teacher
            response = await fetch(`/api/teachers/${teacherId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(teacherData)
            });
          } else {
            // Create new teacher
            response = await fetch('/api/teachers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(teacherData)
            });
          }

          if (response.ok) {
            const result = await response.json();
            
            if (teacherId) {
              // Update existing teacher in local array
              const teacherIndex = teachers.findIndex(t => t.id == teacherId);
              if (teacherIndex !== -1) {
                teachers[teacherIndex] = { ...teachers[teacherIndex], ...teacherData };
              }
            } else {
              // Add new teacher to local array
              const newTeacher = {
                id: result.id,
                ...teacherData
              };
              teachers.push(newTeacher);
            }
            
            // Refresh displays
            initializeTeachersDisplay();
            loadTeachersDropdown(); // Refresh teacher dropdowns
            loadSubjectTeachersDropdown(); // Refresh subject teacher dropdown
            loadEditSubjectTeachersDropdown(); // Refresh edit subject teacher dropdown
            
            closeTeacherModal();
            showAlert(teacherId ? 'Ο καθηγητής ενημερώθηκε επιτυχώς!' : 'Ο καθηγητής δημιουργήθηκε επιτυχώς!', 'success');
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Σφάλμα κατά την αποθήκευση');
          }
        } catch (error) {
          console.error('Error saving teacher:', error);
          showAlert('Σφάλμα κατά την αποθήκευση: ' + error.message, 'error');
        }
      });
    });
