let filterType = '';
let filterClass = '';
document.getElementById('filterBtn').addEventListener('click', () => {
  filterType ="gymnasio";
  filterClass = document.getElementById('filterClass').value;
  loadProgrammsPublic();
});




async function loadProgrammsPublic() {
  try {
    const res = await fetch('/api/programms');
    if (!res.ok) {
      console.error('API error:', res.status, await res.text());
      document.getElementById('programms-tbody-gymnasio').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
     

      document.getElementById('programms-tbody-gymnasio-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-gymnasio-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-gymnasio-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      
      return;
    }
    const data = await res.json();
    console.log('Fetched programms:', data); // Debug
    const tbodyGymnasio = document.getElementById('programms-tbody-gymnasio');
    const tbodyA = document.getElementById('programms-tbody-gymnasio-a');
    const tbodyB = document.getElementById('programms-tbody-gymnasio-b');
    const tbodyG = document.getElementById('programms-tbody-gymnasio-g');
    
    tbodyGymnasio.innerHTML = '';
    tbodyA.innerHTML = '';
    tbodyB.innerHTML = '';
    tbodyG.innerHTML = '';

    // ΝΕΑ ΛΟΓΙΚΗ: γεμίζουμε κάθε πίνακα με τα σωστά δεδομένα
    let filtered = data.filter(row => row.type === 'gymnasio');
    let foundGymnasio = false, foundA = false, foundB = false, foundG = false;
    let sumGymnasioA = 0, sumGymnasioB = 0, sumGymnasioG = 0, sumGymnasio = 0;

    // Αν δεν έχει επιλεγεί τάξη, γέμισε όλους τους πίνακες
    if (!filterClass) {
      filtered.forEach(row => {
        foundGymnasio = true;
        tbodyGymnasio.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumGymnasio += Number(row.hour) || 0;
        if (row.section[0] === 'Α') {
          foundA = true;
          tbodyA.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumGymnasioA += Number(row.hour) || 0;
        } else if (row.section[0] === 'Β') {
          foundB = true;
          tbodyB.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumGymnasioB += Number(row.hour) || 0;
        } else if (row.section[0] === 'Γ') {
          foundG = true;
          tbodyG.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumGymnasioG += Number(row.hour) || 0;
        }
      });
    } else {
      // Αν έχει επιλεγεί τάξη, γέμισε μόνο τον αντίστοιχο πίνακα
      filtered.forEach(row => {
        if (row.section[0] === filterClass) {
          if (filterClass === 'Α') {
            foundA = true;
            tbodyA.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
            sumGymnasioA += Number(row.hour) || 0;
          } else if (filterClass === 'Β') {
            foundB = true;
            tbodyB.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
            sumGymnasioB += Number(row.hour) || 0;
          } else if (filterClass === 'Γ') {
            foundG = true;
            tbodyG.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
            sumGymnasioG += Number(row.hour) || 0;
          }
        }
      });
    }

    if (!foundGymnasio && !filterClass) tbodyGymnasio.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Γυμνασίου!</td></tr>';
    if (!foundA && (!filterClass || filterClass === 'Α')) tbodyA.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Α Γυμνασίου!</td></tr>';
    if (!foundB && (!filterClass || filterClass === 'Β')) tbodyB.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Β Γυμνασίου!</td></tr>';
    if (!foundG && (!filterClass || filterClass === 'Γ')) tbodyG.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Γ Γυμνασίου!</td></tr>';

    if (foundGymnasio && !filterClass) tbodyGymnasio.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasio}</td></tr>`;
    if (foundA && (!filterClass || filterClass === 'Α')) tbodyA.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasioA}</td></tr>`;
    if (foundB && (!filterClass || filterClass === 'Β')) tbodyB.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasioB}</td></tr>`;
    if (foundG && (!filterClass || filterClass === 'Γ')) tbodyG.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasioG}</td></tr>`;

    showHideSections();
  } catch (err) {
    console.error('JS error:', err);
    document.getElementById('programms-tbody-gymnasio').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
  
  }
}
// --- Απόκρυψη/Εμφάνιση sections ανάλογα με τα φίλτρα ---
function showHideSections() {
  const sections = [
    'programms-gymnasiou',
    'programms-gymnasiou-a',
    'programms-gymnasiou-b',
    'programms-gymnasiou-g',
   
  ];
  // Κρύψε όλα τα divs με !important
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.setProperty('display', 'none', 'important');
    if (el) el.style.opacity = 0;
  });
  // Εμφάνισε μόνο το section που πρέπει με fade-in
  function showOnly(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty('display', 'block', 'important');
        el.style.transition = 'opacity 0.5s';
        setTimeout(() => { el.style.opacity = 1; }, 50);
      }
    });
  }
  if (!filterType) {
    showOnly(sections);
    return;
  }
  
  if (filterType === 'gymnasio') {
    let ids = ['programms-gymnasiou'];
    if (!filterClass) {
      ids.push('programms-gymnasiou-a','programms-gymnasiou-b','programms-gymnasiou-g');
    } else {
      if (filterClass === 'Α') ids.push('programms-gymnasiou-a');
      if (filterClass === 'Β') ids.push('programms-gymnasiou-b');
      if (filterClass === 'Γ') ids.push('programms-gymnasiou-g');
    }
    showOnly(ids);
  }
 
}
    showHideSections();
window.addEventListener('DOMContentLoaded', loadProgrammsPublic);








