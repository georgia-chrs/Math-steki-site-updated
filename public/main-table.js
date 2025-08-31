async function loadStudent(id) {
  const res = await fetch(`/student/${id}`);
  const student = await res.json();
  document.getElementById('student-info').innerHTML = `
    <div>Όνομα: ${student.first_name} ${student.last_name}</div>
    <div>Πατέρας: ${student.father_name}</div>
    <div>Username: ${student.username}</div>
    <!-- κλπ -->
  `;
}
loadStudent(1);



