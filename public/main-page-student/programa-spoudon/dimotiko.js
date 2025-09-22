async function loadDimotikoProgram() {
  const response = await fetch('/api/dimotiko-program');
  const data = await response.json();
  const tbody = document.querySelector('.table-section table').getElementsByTagName('tbody')[0] || document.querySelector('.table-section table');

  // Καθαρίζουμε το υπάρχον περιεχόμενο (εκτός από το header)
  tbody.innerHTML = `
    <tr>
      <th>Μάθημα</th>
      <th>Ώρες</th>
    </tr>
  `;

  data.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row.subject}</td>
        <td>${row.hour}</td>
      </tr>
    `;
  });
  // Υπολογισμός και εμφάνιση συνόλου ωρών
  const totalHours = data.reduce((sum, row) => sum + Number(row.hour), 0);
  tbody.innerHTML += `
    <tr class="total-row">
      <td>Σύνολο</td>
      <td>${totalHours}</td>
    </tr>
  `;
}

window.addEventListener('DOMContentLoaded', loadDimotikoProgram);
