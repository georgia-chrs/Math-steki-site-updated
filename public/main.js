async function fetchStudents() {
  const res = await fetch('/students');
  const students = await res.json();
  const container = document.getElementById('students-container');
  container.innerHTML = '';
  students.forEach(student => {
    const div = document.createElement('div');
    div.className = 'student';
    div.innerHTML = `
      <div class="student-name">${student.first_name} ${student.last_name}</div>
      <div class="student-father">Πατέρας: ${student.father_name}</div>
      <div class="student-username">Username: ${student.username}</div>
    `;
    container.appendChild(div);
  });
}

// Check if the element exists before adding event listener
const fetchStudentsBtn = document.getElementById('fetch-students-btn');
if (fetchStudentsBtn) {
  fetchStudentsBtn.addEventListener('click', fetchStudents);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) return;
    const res = await fetch('/api/student/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      const container = document.getElementById('student-session-info');
      if (container) {
        container.innerHTML = `<div>Συνδεδεμένος ως: <strong>${data.username}</strong></div>`;
      }
    } else {
      const container = document.getElementById('student-session-info');
      if (container) {
        container.innerHTML = '<div>Δεν είστε συνδεδεμένος.</div>';
      }
    }
  } catch (err) {
    console.error('Σφάλμα ανάκτησης session:', err);
  }
});






