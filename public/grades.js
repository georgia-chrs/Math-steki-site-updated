// Get student username from session storage
function getStudentUsername() {
  return sessionStorage.getItem('username');
}

async function loadStudentInfo() {
  try {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      document.getElementById('loadingMessage').textContent = 'Δεν βρέθηκε σύνδεση μαθητή. Παρακαλώ συνδεθείτε ξανά.';
      return null;
    }

    const username = sessionStorage.getItem('username') || localStorage.getItem('username');
    let response;
    if (username) {
      response = await fetch(`/api/student/profile/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  
    if (response && response.ok) {
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

async function loadGrades(studentId) {
  try {
    const response = await fetch(`/api/grades/${studentId}`);
    if (response.ok) {
      const grades = await response.json();
      return grades;
    } else {
      console.error('Failed to load grades');
      return [];
    }
  } catch (error) {
    console.error('Error loading grades:', error);
    return [];
  }
}

function displayStudentInfo(student) {
  const studentInfo = document.getElementById('studentInfo');
  const studentDetails = document.getElementById('studentDetails');
  /*
  studentDetails.innerHTML = `
    <div><strong>Όνομα:</strong> ${student.first_name} ${student.last_name}</div>
    <div><strong>Τάξη:</strong> ${student.class}</div>
    <div><strong>Τηλέφωνο:</strong> ${student.phone}</div>
  `;*/
  
  studentInfo.style.display = 'block';
}

function displayGrades(grades) {
  const gradesContent = document.getElementById('gradesContent');
  const loadingMessage = document.getElementById('loadingMessage');
  const noGradesMessage = document.getElementById('noGradesMessage');
  
  loadingMessage.style.display = 'none';
  
  if (grades.length === 0) {
    noGradesMessage.style.display = 'block';
    return;
  }
  
  // Populate filters
  populateFilters(grades);
  
  // Display grade statistics
  displayGradeStatistics(grades);
  
  // Display grades
  updateGradesDisplay(grades);
  
  gradesContent.style.display = 'block';
}

function populateFilters(grades) {
  const subjectFilter = document.getElementById('subjectFilter');
  const examTypeFilter = document.getElementById('examTypeFilter');
  
  // Subjects
  const subjects = [...new Set(grades.map(grade => grade.subject_name).filter(Boolean))];
  subjectFilter.innerHTML = '';
  
  // Recreate the first option with arrow
  const firstSubjectOption = document.createElement('option');
  firstSubjectOption.value = '';
  firstSubjectOption.textContent = 'Όλα τα μαθήματα';
  subjectFilter.appendChild(firstSubjectOption);
  
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = subject;
    subjectFilter.appendChild(option);
  });
  
  // Exam types
  const examTypes = [...new Set(grades.map(grade => grade.exam_type).filter(Boolean))];
  examTypeFilter.innerHTML = '';
  
  // Recreate the first option with arrow
  const firstExamOption = document.createElement('option');
  firstExamOption.value = '';
  firstExamOption.textContent = 'Όλοι οι τύποι';
  examTypeFilter.appendChild(firstExamOption);
  
  examTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    examTypeFilter.appendChild(option);
  });
  
  // Add event listeners for filtering
  subjectFilter.addEventListener('change', () => filterGrades(grades));
  examTypeFilter.addEventListener('change', () => filterGrades(grades));
}

function filterGrades(allGrades) {
  const subjectFilter = document.getElementById('subjectFilter').value;
  const examTypeFilter = document.getElementById('examTypeFilter').value;
  
  let filteredGrades = allGrades;
  
  if (subjectFilter) {
    filteredGrades = filteredGrades.filter(grade => grade.subject_name === subjectFilter);
  }
  
  if (examTypeFilter) {
    filteredGrades = filteredGrades.filter(grade => grade.exam_type === examTypeFilter);
  }
  
  updateGradesDisplay(filteredGrades);
  displayGradeStatistics(filteredGrades);
}

function displayGradeStatistics(grades) {
  const gradesStats = document.getElementById('gradesStats');
  
  if (grades.length === 0) {
    gradesStats.innerHTML = '';
    return;
  }
  
  // Calculate statistics
  const gradeValues = grades.map(g => parseFloat(g.grade)).filter(g => !isNaN(g));
  const average = gradeValues.length > 0 ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(2) : 0;
  const highest = gradeValues.length > 0 ? Math.max(...gradeValues) : 0;
  const lowest = gradeValues.length > 0 ? Math.min(...gradeValues) : 0;
  
  // Count by subject
  const subjectStats = {};
  grades.forEach(grade => {
    if (grade.subject_name) {
      if (!subjectStats[grade.subject_name]) {
        subjectStats[grade.subject_name] = [];
      }
      const gradeValue = parseFloat(grade.grade);
      if (!isNaN(gradeValue)) {
        subjectStats[grade.subject_name].push(gradeValue);
      }
    }
  });
  
  let subjectAverages = '';
  Object.keys(subjectStats).forEach(subject => {
    const subjectGrades = subjectStats[subject];
    const subjectAvg = (subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length).toFixed(2);
    subjectAverages += `<span style="margin-right: 15px;"><strong>${subject}:</strong> ${subjectAvg}</span>`;
  });
  
  gradesStats.innerHTML = `
    <div style="color: white; background:rgb(255, 135, 75); border-radius: 20px; box-shadow: 0 2px 10px  rgba(0, 0, 0, 0.667); margin-bottom: 20px; border: 2px solid rgb(232, 93, 6); width:80%; justify-content: center; margin-left: auto; margin-right: auto; padding: 20px;">
      <h3 style="margin-top: 0; text-align: center;">Στατιστικά Βαθμολογίας</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
        <div><strong>Συνολικά:</strong> ${grades.length} βαθμοί</div>
      </div>
      ${Object.keys(subjectStats).length > 0 ? `
        <div style="border-top: 1px solid #eee; padding-top: 15px;">
          <strong>Μέσοι όροι ανά μάθημα:</strong><br>
          <div style="margin-top: 8px;">${subjectAverages}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function updateGradesDisplay(grades) {
  const gradesList = document.getElementById('gradesList');
  
  if (grades.length === 0) {
    gradesList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Δεν βρέθηκαν βαθμοί για το επιλεγμένο φίλτρο.</div>';
    return;
  }
  
  // Group grades by subject
  const gradesBySubject = {};
  grades.forEach(grade => {
    const subject = grade.subject_name || 'Άγνωστο μάθημα';
    if (!gradesBySubject[subject]) {
      gradesBySubject[subject] = [];
    }
    gradesBySubject[subject].push(grade);
  });
  
  let gradesHtml = '';
  Object.keys(gradesBySubject).sort().forEach(subject => {
    const subjectGrades = gradesBySubject[subject].sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
    
    gradesHtml += `
      <div class="subject-grades" style="margin-bottom: 30px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width:80%; justify-content: center; margin-left: auto; margin-right: auto;">
        <div class="subject-header" style="background:rgb(255, 135, 75); color: white; padding: 15px; font-weight: bold;">
          ${subject}
        </div>
        <div class="grades-table-container" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background:rgba(252, 195, 164, 0.32);">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Τύπος</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Βαθμός</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Ημερομηνία</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Σημειώσεις</th>
              </tr>
            </thead>
            <tbody>
              ${subjectGrades.map(grade => `
                <tr style="border-bottom: 1px solid #f1f3f4;">
                  <td style="padding: 12px;">${grade.exam_type || 'Διαγώνισμα'}</td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="
                      color: rgb(255, 85, 0); 
                      padding: 4px 8px; 
                      border-radius: 4px; 
                      font-weight: bold;
                    ">
                      ${grade.grade}
                    </span>
                  </td>
                  <td style="padding: 12px;">${new Date(grade.exam_date).toLocaleDateString('el-GR')}</td>
                  <td style="padding: 12px;">${grade.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
  
  gradesList.innerHTML = gradesHtml;
}
/*
function getGradeColor(grade) {
  const gradeValue = parseFloat(grade);
  if (gradeValue >= 18) return '#28a745'; // Green
  if (gradeValue >= 15) return '#17a2b8'; // Blue
  if (gradeValue >= 10) return '#ffc107'; // Yellow
  return '#dc3545'; // Red
}*/





















// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const student = await loadStudentInfo();
    if (!student) return;
    
    displayStudentInfo(student);
    
    const grades = await loadGrades(student.id);
    displayGrades(grades);
    
  } catch (error) {
    console.error('Error initializing grades page:', error);
    document.getElementById('loadingMessage').textContent = 'Σφάλμα κατά τη φόρτωση της σελίδας.';
  }
});

// Add responsive styles
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .grades-table-container {
      font-size: 14px;
    }
    
    .grades-table-container th,
    .grades-table-container td {
      padding: 8px !important;
    }
  }
`;
document.head.appendChild(style);