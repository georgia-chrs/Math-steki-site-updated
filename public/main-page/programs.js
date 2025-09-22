let filterType = '';
let filterClass = '';
let filterField = '';
document.getElementById('filterBtn').addEventListener('click', () => {
  filterType = document.getElementById('filterType').value;
  filterClass = document.getElementById('filterClass').value;
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
      document.getElementById('programms-tbody-dimotiko').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-gymnasio').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-lykeio').innerHTML = '<tr><td colspan="3">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-epal-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';

      document.getElementById('programms-tbody-gymnasio-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-gymnasio-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
      document.getElementById('programms-tbody-gymnasio-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
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
    console.log('Fetched programms:', data); // Debug
    const tbodyDimotiko = document.getElementById('programms-tbody-dimotiko');
    const tbodyGymnasio = document.getElementById('programms-tbody-gymnasio');
    const tbodyLykeio = document.getElementById('programms-tbody-lykeio');
    const tbodyEpal = document.getElementById('programms-tbody-epal');
    const tbodyEpalA = document.getElementById('programms-tbody-epal-a');
    const tbodyEpalB = document.getElementById('programms-tbody-epal-b');
    const tbodyEpalG = document.getElementById('programms-tbody-epal-g');
    const tbodyA = document.getElementById('programms-tbody-gymnasio-a');
    const tbodyB = document.getElementById('programms-tbody-gymnasio-b');
    const tbodyG = document.getElementById('programms-tbody-gymnasio-g');

    const tbodyLykeioA = document.getElementById('programms-tbody-lykeio-a');
    const tbodyLykeioB = document.getElementById('programms-tbody-lykeio-b');

    const tbodyLykeioBAnthrop = document.getElementById('programms-tbody-lykeio-b-anthrop');
    const tbodyLykeioBThetikes = document.getElementById('programms-tbody-lykeio-b-thetikes');
    const tbodyLykeioBYgeias = document.getElementById('programms-tbody-lykeio-b-ygeias');
    const tbodyLykeioBOikPlirof = document.getElementById('programms-tbody-lykeio-b-oikplirof');

    const tbodyLykeioG = document.getElementById('programms-tbody-lykeio-g');
    const tbodyAnthrop = document.getElementById('programms-tbody-lykeio-anthrop');
    const tbodyThetikes = document.getElementById('programms-tbody-lykeio-thetikes');
    const tbodyYgeias = document.getElementById('programms-tbody-lykeio-ygeias');
    const tbodyOikPlirof = document.getElementById('programms-tbody-lykeio-oikplirof');


    tbodyDimotiko.innerHTML = '';
    tbodyGymnasio.innerHTML = '';
    tbodyLykeio.innerHTML = '';
    tbodyEpal.innerHTML = '';
    tbodyEpalA.innerHTML = '';
    tbodyEpalB.innerHTML = '';
    tbodyEpalG.innerHTML = '';
    tbodyA.innerHTML = '';
    tbodyB.innerHTML = '';
    tbodyG.innerHTML = '';
    tbodyLykeioA.innerHTML = '';
    tbodyLykeioB.innerHTML = '';
    tbodyLykeioBOikPlirof.innerHTML = '';
    tbodyLykeioBAnthrop.innerHTML = '';
    tbodyLykeioBThetikes.innerHTML = '';
    tbodyLykeioBYgeias.innerHTML = '';
    tbodyLykeioG.innerHTML = '';
    tbodyAnthrop.innerHTML = '';
    tbodyThetikes.innerHTML = '';
    tbodyYgeias.innerHTML = '';
    tbodyOikPlirof.innerHTML = '';
    // Φιλτράρισμα δεδομένων πριν την εμφάνιση
    let filteredData = data.filter(row => {
      // Ειδική περίπτωση: ΜΟΝΟ ΓΕΛ χωρίς τάξη/πεδίο -> όλα τα μαθήματα λυκείου
      if (filterType === 'lykeio' && !filterClass && !filterField) {
        return row.type === 'lykeio';
      }
      let typeMatch = !filterType || row.type === filterType;
      let classMatch = !filterClass || (row.section && row.section[0] === filterClass);
      let fieldMatch = true;
      // Ειδική περίπτωση: Β' Λυκείου χωρίς πεδίο -> να εμφανίζονται όλα (και γενικής και κατευθύνσεων)
      if (filterType === 'lykeio' && filterClass === 'Β' && !filterField) {
        fieldMatch = true;
      } else if (filterType === 'lykeio' && filterClass === 'Γ' && !filterField) {
        fieldMatch = true;
      } else if (filterType === 'lykeio' && filterField) {
        fieldMatch = row.field === filterField;
      }
      return typeMatch && classMatch && fieldMatch;
    });
    // Χρησιμοποίησε filteredData για να γεμίσεις τους πίνακες
    let foundDimotiko = false, foundGymnasio = false, foundLykeio = false, foundEpal = false;
    let foundA = false, foundB = false, foundG = false;
    let foundEA = false, foundEB = false, foundEG = false;
    let foundAnthrop = false, foundThetikes = false, foundYgeias = false, foundOikPlirof = false;
    let sumDimotiko = 0,  sumLykeio = 0, sumEpal = 0;
    let sumGymnasioA = 0, sumGymnasioB = 0, sumGymnasioG = 0 , sumGymnasio = 0;
    let sumA = 0, sumB = 0, sumG = 0;
    let sumEA = 0, sumEB = 0, sumEG = 0;
    let sumAnthrop = 0, sumThetikes = 0, sumYgeias = 0, sumOikPlirof = 0;
    let sumAnthropB=0, sumThetikesB=0, sumYgeiasB=0, sumOikPlirofB=0;
    tbodyDimotiko.innerHTML = '';
    tbodyGymnasio.innerHTML = '';
    tbodyLykeio.innerHTML = '';
    tbodyEpal.innerHTML = '';
    tbodyEpalA.innerHTML = '';
    tbodyEpalB.innerHTML = '';
    tbodyEpalG.innerHTML = '';
    tbodyA.innerHTML = '';
    tbodyB.innerHTML = '';
    tbodyG.innerHTML = '';
    tbodyLykeioA.innerHTML = '';
    tbodyLykeioB.innerHTML = '';
    tbodyLykeioG.innerHTML = '';
    tbodyAnthrop.innerHTML = '';
    tbodyThetikes.innerHTML = '';
    tbodyYgeias.innerHTML = '';
    tbodyOikPlirof.innerHTML = '';
    filteredData.forEach(row => {
      if (row.type === 'dimotiko') {
        foundDimotiko = true;
        tbodyDimotiko.innerHTML += `
          <tr>
            <td>${row.subject}</td>
            <td>${row.hour}</td>
          </tr>
        `;
        sumDimotiko += Number(row.hour) || 0;
      } else if (row.type === 'gymnasio') {
        foundGymnasio = true;
        tbodyGymnasio.innerHTML += `
          <tr>
            <td>${row.subject}</td>
            <td>${row.hour}</td>
          </tr>
        `;
        sumGymnasio += Number(row.hour) || 0;
      } else if (row.type === 'lykeio') {
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
      if (row.type === 'gymnasio' && row.section[0] === 'Α') {
        foundA = true;
        tbodyA.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumGymnasioA += Number(row.hour) || 0;
      } else if (row.type === 'gymnasio' && row.section[0] === 'Β') {
        foundB = true;
        tbodyB.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumGymnasioB += Number(row.hour) || 0;
      } else if (row.type === 'gymnasio' && row.section[0] === 'Γ') {
        foundG = true;
        tbodyG.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumGymnasioG += Number(row.hour) || 0;
      } 
      // --- Λύκειο ανά τάξη ---
      if (row.type === 'lykeio' && row.section[0] === 'Α') {
        foundA = true;
        tbodyLykeioA.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumA += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.section[0] === 'Β' && (!row.field ||  row.field === 'Καμία')) {
        foundB = true;
        tbodyLykeioB.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumB += Number(row.hour) || 0;                                  //row.field === '' --- IGNORE ---
      } else if (row.type === 'lykeio' && row.section[0] === 'Γ' && (!row.field || row.field === 'Καμία')) {
        foundG = true;
        tbodyLykeioG.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumG += Number(row.hour) || 0;
      } 
      
      if (row.type === 'lykeio' && row.section[0] === 'Γ' && row.field === 'Ανθρωπιστικές Επιστήμες') {
        foundAnthrop = true;
        tbodyAnthrop.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumAnthrop += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.section[0] === 'Γ' && row.field === 'Θετικές Επιστήμες') {
        foundThetikes = true;
        tbodyThetikes.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumThetikes += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.section[0] === 'Γ' && row.field === 'Σπουδές Υγείας') {
        foundYgeias = true;
        tbodyYgeias.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumYgeias += Number(row.hour) || 0;
      } else if (row.type === 'lykeio' && row.section[0] === 'Γ' && row.field === 'Οικονομία Και Πληροφορική') {
        foundOikPlirof = true;
        tbodyOikPlirof.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
        sumOikPlirof += Number(row.hour) || 0;
      }
      // --- Β' Λυκείου ανά κατεύθυνση ---
      if (row.type === 'lykeio' && row.section[0] === 'Β' && row.field) {
       


        if (row.field === 'Ανθρωπιστικές Επιστήμες') {
          foundAnthrop = true;
          if (typeof sumAnthropB === 'undefined') sumAnthropB = 0;
          if (!window.tbodyLykeioBAnthrop) window.tbodyLykeioBAnthrop = document.getElementById('programms-tbody-lykeio-b-anthrop');
          window.tbodyLykeioBAnthrop.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumAnthropB += Number(row.hour) || 0;
        } else if (row.field === 'Θετικές Επιστήμες') {
          foundThetikes = true;
          if (typeof sumThetikesB === 'undefined') sumThetikesB = 0;
          if (!window.tbodyLykeioBThetikes) window.tbodyLykeioBThetikes = document.getElementById('programms-tbody-lykeio-b-thetikes');
          window.tbodyLykeioBThetikes.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumThetikesB += Number(row.hour) || 0;
        } else if (row.field === 'Σπουδές Υγείας') {
          foundYgeias = true;
          if (typeof sumYgeiasB === 'undefined') sumYgeiasB = 0;
          if (!window.tbodyLykeioBYgeias) window.tbodyLykeioBYgeias = document.getElementById('programms-tbody-lykeio-b-ygeias');
          window.tbodyLykeioBYgeias.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumYgeiasB += Number(row.hour) || 0;
        } else if (row.field === 'Οικονομία Και Πληροφορική') {
          foundOikPlirof = true;
          if (typeof sumOikPlirofB === 'undefined') sumOikPlirofB = 0;
          if (!window.tbodyLykeioBOikPlirof) window.tbodyLykeioBOikPlirof = document.getElementById('programms-tbody-lykeio-b-oikplirof');
          window.tbodyLykeioBOikPlirof.innerHTML += `<tr><td>${row.subject}</td><td>${row.hour}</td></tr>`;
          sumOikPlirofB += Number(row.hour) || 0;
        }
      }
    });
    if (!foundDimotiko) tbodyDimotiko.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Δημοτικού!</td></tr>';
    if (!foundGymnasio) tbodyGymnasio.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Γυμνασίου!</td></tr>';
    if (!foundLykeio) tbodyLykeio.innerHTML = '<tr><td colspan="3">Δεν υπάρχουν μαθήματα Λυκείου!</td></tr>';
    if (!foundEpal) tbodyEpal.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα ΕΠΑΛ!</td></tr>';
    if (!foundA) tbodyA.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Α Γυμνασίου!</td></tr>';
    if (!foundB) tbodyB.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Β Γυμνασίου!</td></tr>';
    if (!foundG) tbodyG.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Γ Γυμνασίου!</td></tr>';
    if (!foundA) tbodyLykeioA.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Α Λυκείου!</td></tr>';
    if (!foundB) tbodyLykeioB.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Β Λυκείου!</td></tr>';
    if (!foundG) tbodyLykeioG.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Γ Λυκείου!</td></tr>';
    if (!foundAnthrop) tbodyAnthrop.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Ανθρωπιστικών!</td></tr>';
    if (!foundThetikes) tbodyThetikes.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Θετικών!</td></tr>';
    if (!foundYgeias) tbodyYgeias.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Υγείας!</td></tr>';
    if (!foundOikPlirof) tbodyOikPlirof.innerHTML = '<tr><td colspan="2">Δεν υπάρχουν μαθήματα Οικονομίας/Πληροφορικής!</td></tr>';
    if (foundDimotiko) tbodyDimotiko.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumDimotiko}</td></tr>`;
    if (foundGymnasio) {
      sumGymnasio = sumGymnasioA + sumGymnasioB + sumGymnasioG;
      tbodyGymnasio.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasio}</td></tr>`;
    }
    if (foundLykeio) tbodyLykeio.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumLykeio}</td><td></td></tr>`;
    if (foundEpal) tbodyEpal.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumEpal}</td></tr>`;
    if (foundA) tbodyA.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasioA}</td></tr>`;
    if (foundB) tbodyB.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasioB}</td></tr>`;
    if (foundG) tbodyG.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumGymnasioG}</td></tr>`;
    if (foundA) tbodyLykeioA.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumA}</td></tr>`;
    if (foundB) tbodyLykeioB.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumB}</td></tr>`;
    if (foundG) tbodyLykeioG.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumG}</td></tr>`;
    if (sumAnthropB) tbodyLykeioBAnthrop.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumAnthropB}</td></tr>`;
    if (sumThetikesB) tbodyLykeioBThetikes.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumThetikesB}</td></tr>`;
    if (sumYgeiasB) tbodyLykeioBYgeias.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumYgeiasB}</td></tr>`;
    if (sumOikPlirof) tbodyLykeioBOikPlirof.innerHTML += `<tr class='total-row'><td>Σύνολο</td><td>${sumOikPlirof}</td></tr>`;
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
    document.getElementById('programms-tbody-dimotiko').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-lykeio').innerHTML = '<tr><td colspan="3">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-epal').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio-a').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio-b').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
    document.getElementById('programms-tbody-gymnasio-g').innerHTML = '<tr><td colspan="2">Σφάλμα φόρτωσης δεδομένων!</td></tr>';
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
  const sections = [
    'programms-dimotiko',
    'programms-gymnasiou',
    'programms-gymnasiou-a',
    'programms-gymnasiou-b',
    'programms-gymnasiou-g',
    'programms-lykeiou-gel',
    'programms-lykeiou-gel-a',
    'programms-lykeiou-gel-b',
    'programms-lykeiou-gel-b-anthrop',
    'programms-lykeiou-gel-b-thetikes',
    'programms-lykeiou-gel-b-ygeias',
    'programms-lykeiou-gel-b-oikplirof',
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
  if (filterType === 'dimotiko') {
    showOnly(['programms-dimotiko']);
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
    // Ειδική περίπτωση: μόνο ΓΕΛ χωρίς τάξη/πεδίο -> όλα τα sections του λυκείου
    if (!filterClass && !filterField) {
      showOnly([
        'programms-lykeiou-gel',
        'programms-lykeiou-gel-a',
        'programms-lykeiou-gel-b',
        'programms-lykeiou-gel-b-anthrop',
        'programms-lykeiou-gel-b-thetikes',
        'programms-lykeiou-gel-b-ygeias',
        'programms-lykeiou-gel-b-oikplirof',
        'programms-lykeiou-gel-g',
        'programms-lykeiou-gel-anthrop',
        'programms-lykeiou-gel-thetikes',
        'programms-lykeiou-gel-ygeias',
        'programms-lykeiou-gel-oikplirof'
      ]);
      return;
    }
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








