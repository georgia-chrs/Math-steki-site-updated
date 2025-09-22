
let filterType = '';
let filterClass = '';
let filterField = '';
document.getElementById('filterBtn').addEventListener('click', () => {
  filterType = document.getElementById('filterType').value;
  filterClass = document.getElementById('filterClass').value;
  console.log("filter type:", filterType,"filter class:", filterClass)// Debug
  loadProgrammsPublic();


});

// Απόκρυψη φίλτρου πεδίου αρχικά
document.getElementById('fieldFilterDiv').style.display = 'none';

document.getElementById('filterType').addEventListener('change', function() {
  if (this.value === 'lykeio') {
    document.getElementById('fieldFilterDiv').style.display = '';
  } else {
    document.getElementById('fieldFilterDiv').style.display = 'none';
    filterField = '';
    document.getElementById('filterField').value = '';
  }
});

document.getElementById('filterField').addEventListener('change', function() {
  filterField = this.value;
});

async function loadProgrammsPublic() {
  try {
    const res = await fetch('/api/programms');
    if (!res.ok) {
      console.error('API error:', res.status, await res.text());
      document.getElementById('programms-tbody-lykeio').innerHTML = '<tr><td colspan="3">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';

      document.getElementById('programms-tbody-lykeio-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio-anthrop').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio-thetikes').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio-ygeias').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio-oikplirof').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      return;
    }
    const data = await res.json();
    const tbodyLykeio = document.getElementById('programms-tbody-lykeio');
    const tbodyEpal = document.getElementById('programms-tbody-epal');
    const tbodyEpalA = document.getElementById('programms-tbody-epal-a');
    const tbodyEpalB = document.getElementById('programms-tbody-epal-b');
    const tbodyEpalG = document.getElementById('programms-tbody-epal-g');
    const tbodyLykeioA = document.getElementById('programms-tbody-lykeio-a');
    const tbodyLykeioB = document.getElementById('programms-tbody-lykeio-b');
    const tbodyLykeioG = document.getElementById('programms-tbody-lykeio-g');
    const tbodyAnthrop = document.getElementById('programms-tbody-lykeio-anthrop');
    const tbodyThetikes = document.getElementById('programms-tbody-lykeio-thetikes');
    const tbodyYgeias = document.getElementById('programms-tbody-lykeio-ygeias');
    const tbodyOikPlirof = document.getElementById('programms-tbody-lykeio-oikplirof');
    tbodyLykeio.innerHTML = '';
    tbodyEpal.innerHTML = '';
    tbodyEpalA.innerHTML = '';
    tbodyEpalB.innerHTML = '';
    tbodyEpalG.innerHTML = '';
    tbodyLykeioA.innerHTML = '';
    tbodyLykeioB.innerHTML = '';
    tbodyLykeioG.innerHTML = '';
    tbodyAnthrop.innerHTML = '';
    tbodyThetikes.innerHTML = '';
    tbodyYgeias.innerHTML = '';
    tbodyOikPlirof.innerHTML = '';
    // Φιλτράρισμα δεδομένων πριν την εμφάνιση
    let filteredData = data.filter(row => {
      let typeMatch = !filterType || row.type === filterType;
      let classMatch = !filterClass || row.section === filterClass;
      let fieldMatch = true;
      if (filterType === 'lykeio' && filterField) {
        fieldMatch = row.field === filterField;
      }
      return typeMatch && classMatch && fieldMatch;
    });
    // Χρησιμοποίησε filteredData για να γεμίσεις τους πίνακες
    let foundLykeio = false, foundEpal = false;
    let foundA = false, foundB = false, foundG = false;
    let foundEA = false, foundEB = false, foundEG = false;
    let foundAnthrop = false, foundThetikes = false, foundYgeias = false, foundOikPlirof = false;
    let sumLykeio = 0, sumEpal = 0;
    let sumA = 0, sumB = 0, sumG = 0;
    let sumEA = 0, sumEB = 0, sumEG = 0;
    let sumAnthrop = 0, sumThetikes = 0, sumYgeias = 0, sumOikPlirof = 0;
    tbodyLykeio.innerHTML = '';
    tbodyEpal.innerHTML = '';
    tbodyEpalA.innerHTML = '';
    tbodyEpalB.innerHTML = '';
    tbodyEpalG.innerHTML = '';
    tbodyLykeioA.innerHTML = '';
    tbodyLykeioB.innerHTML = '';
    tbodyLykeioG.innerHTML = '';
    tbodyAnthrop.innerHTML = '';
    tbodyThetikes.innerHTML = '';
    tbodyYgeias.innerHTML = '';
    tbodyOikPlirof.innerHTML = '';
    filteredData.forEach(row => {
      if (row.type === 'lykeio') {
        foundLykeio = true;
        tbodyLykeio.innerHTML += `
          <tr>
            <td>${row.subject}</td>
            <td>${row.hour}</td>
            <td>${row.field || ''}</td>
          </tr>
        `;
        sumLykeio += Number(row.hour) || 0;
      } else if (row.type === 'epal') {
        foundEpal = true;
        tbodyEpal.innerHTML += `
          <tr>
            <td>${row.subject}</td>
            <td>${row.hour}</td>
          </tr>
        `;
        sumEpal += Number(row.hour) || 0;
      } 
      // --- ΕΠΑΛ ανά τάξη ---
      if (row.type === 'epal' && row.section[0] === 'Α') {
        foundA = true;
        tbodyEpalA.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumEA += Number(row.hour) || 0;
      } else if (row.type === 'epal' && row.section[0] === 'Β') {
        foundB = true;
        tbodyEpalB.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumEB += Number(row.hour) || 0;
      } else if (row.type === 'epal' && row.section[0] === 'Γ') {
        foundG = true;
        tbodyEpalG.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumEG += Number(row.hour) || 0;
      }
     
      // --- Λύκειο ανά τάξη ---
      if (row.type === 'lykeio' && row.section[0] === 'Α') {
        foundA = true;
        tbodyLykeioA.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumA += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.section[0] === 'Β') {
        foundB = true;
        tbodyLykeioB.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumB += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.section[0] === 'Γ') {
        foundG = true;
        tbodyLykeioG.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumG += Number(row.hour) || 0;
      } 
      
      if (row.type === 'lykeio' && row.field === 'Ανθρωπιστικές Επιστήμες') {
        foundAnthrop = true;
        tbodyAnthrop.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumAnthrop += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.field === 'Θετικές Επιστήμες') {
        foundThetikes = true;
        tbodyThetikes.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumThetikes += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.field === 'Σπουδές Υγείας') {
        foundYgeias = true;
        tbodyYgeias.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumYgeias += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.field === 'Οικονομία Και Πληροφορική') {
        foundOikPlirof = true;
        tbodyOikPlirof.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumOikPlirof += Number(row.hour) || 0;
      }
    });
    if (!foundLykeio) tbodyLykeio.innerHTML = '<tr><td colspan="3">Δεν υπάρχουν μαθήματα Λυκείου!</td></tr>';
    if (!foundEpal) tbodyEpal.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα ΕΠΑΛ!</td></tr>';
    if (!foundA) tbodyLykeioA.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Α Λυκείου!</td></tr>';
    if (!foundB) tbodyLykeioB.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Β Λυκείου!</td></tr>';
    if (!foundG) tbodyLykeioG.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Γ Λυκείου!</td></tr>';
    if (!foundAnthrop) tbodyAnthrop.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Ανθρωπιστικών!</td></tr>';
    if (!foundThetikes) tbodyThetikes.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Θετικών!</td></tr>';
    if (!foundYgeias) tbodyYgeias.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Υγείας!</td></tr>';
    if (!foundOikPlirof) tbodyOikPlirof.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Οικονομίας/Πληροφορικής!</td></tr>';
   
    if (foundLykeio) tbodyLykeio.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumLykeio}</td><td></td></tr>`;
    if (foundEpal) tbodyEpal.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumEpal}</td></tr>`;
    if (foundA) tbodyLykeioA.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumA}</td></tr>`;
    if (foundB) tbodyLykeioB.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumB}</td></tr>`;
    if (foundG) tbodyLykeioG.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumG}</td></tr>`;
    if (foundA) tbodyEpalA.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumEA}</td></tr>`;
  if (foundB) tbodyEpalB.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumEB}</td></tr>`;
  if (foundG) tbodyEpalG.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumEG}</td></tr>`;
    if (foundAnthrop) tbodyAnthrop.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumAnthrop}</td></tr>`;
    if (foundThetikes) tbodyThetikes.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumThetikes}</td></tr>`;
    if (foundYgeias) tbodyYgeias.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumYgeias}</td></tr>`;
    if (foundOikPlirof) tbodyOikPlirof.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumOikPlirof}</td></tr>`;
    // --- Ενημέρωση εμφάνισης sections μετά το φιλτράρισμα ---
    showHideSections();
  } catch (err) {
    console.error('JS error:', err);
    document.getElementById('programms-tbody-lykeio').innerHTML = '<tr><td colspan="3">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-epal').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-anthrop').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-thetikes').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-ygeias').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio-oikplirof').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
  }
}
// --- Απόκρυψη/Εμφάνιση sections ανάλογα με τα φίλτρα ---
function showHideSections() {
  console.log("show Hiding section:sss"); // Debug

  // Όλα τα section IDs
  const sections = [
    'programms-lykeiou-gel',
    'programms-lykeiou-gel-a',
    'programms-lykeiou-gel-b',
    'programms-lykeiou-gel-g',
    'programms-lykeiou-gel-anthrop',
    'programms-lykeiou-gel-thetikes',
    'programms-lykeiou-gel-ygeias',
    'programms-lykeiou-gel-oikplirof',
    'programms-lykeiou-epal',
    'programms-lykeiou-epal-a',
    'programms-lykeiou-epal-b',
    'programms-lykeiou-epal-g'
  ];
  // Κρύψε όλα τα divs με !important
  sections.forEach(id => {
    console.log("Hiding section:", id); // Debug
    const el = document.getElementById(id);
    if (el) el.style.setProperty('display', 'none', 'important');
    if (el) el.style.opacity = 0;
  });
  // Εμφάνισε μόνο το section που πρέπει με fade-in
  function showOnly(ids) {
    console.log("Showing sections:", ids); // Debug
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty('display', 'block', 'important'); // <-- ΕΔΩ η αλλαγή
        el.style.transition = 'opacity 0.5s';
        setTimeout(() => { el.style.opacity = 1; }, 50);
      }
    });
  }
  if (!filterType) {
    console.log("No filter type selected"); // Debug
    showOnly(sections);
    return;
  }
 
  
  if (filterType === 'epal') {
    let ids = ['programms-lykeiou-epal'];
    if (!filterClass) {
      ids.push('programms-lykeiou-epal-a','programms-lykeiou-epal-b','programms-lykeiou-epal-g');
    } else {
      if (filterClass === 'Α') ids.push('programms-lykeiou-epal-a');
      if (filterClass === 'Β') ids.push('programms-lykeiou-epal-b');
      if (filterClass === 'Γ') ids.push('programms-lykeiou-epal-g');
    }
    showOnly(ids);
  }
  if (filterType === 'lykeio') {
    let ids = ['programms-lykeiou-gel'];
    if (!filterClass) {
      ids.push('programms-lykeiou-gel-a','programms-lykeiou-gel-b','programms-lykeiou-gel-g');
    } else {
      if (filterClass === 'Α') ids.push('programms-lykeiou-gel-a');
      if (filterClass === 'Β') ids.push('programms-lykeiou-gel-b');
      if (filterClass === 'Γ') ids.push('programms-lykeiou-gel-g');
    }
    // Πεδίο ΓΕΛ
    if (filterField) {
      if (filterField === 'Ανθρωπιστικές Επιστήμες') ids.push('programms-lykeiou-gel-anthrop');
      if (filterField === 'Θετικές Επιστήμες') ids.push('programms-lykeiou-gel-thetikes');
      if (filterField === 'Σπουδές Υγείας') ids.push('programms-lykeiou-gel-ygeias');
      if (filterField === 'Οικονομία Και Πληροφορική') ids.push('programms-lykeiou-gel-oikplirof');
      // Κρύψε τα lykeioA/B/G όταν έχει επιλεγεί πεδίο
      ids = ids.filter(id => !['programms-lykeiou-gel-a','programms-lykeiou-gel-b','programms-lykeiou-gel-g'].includes(id));
    }
    showOnly(ids);
  }
}
    showHideSections();
window.addEventListener('DOMContentLoaded', loadProgrammsPublic);



