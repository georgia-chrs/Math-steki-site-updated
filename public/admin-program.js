  async function fetchAndRenderProgramms(section, containerId, type = null, field = null) {
    const res = await fetch('/api/programms'); // Καλεί όλα τα δεδομένα
    const data = await res.json();
    const container = document.getElementById(containerId);
    if (!container) return;
    let filtered;
    if (type === 'dimotiko') {
      // Για το Δημοτικό, εμφάνισε όλα τα μαθήματα με type dimotiko ανεξάρτητα από section
      filtered = data.filter(row => row.type === 'dimotiko');
    } else {
      // Για τα υπόλοιπα, φιλτράρισμα με βάση section/type/field
      filtered = data.filter(row => row.section === section);
      if (type) filtered = filtered.filter(row => row.type === type);
      if (field) filtered = filtered.filter(row => row.field === field);
    }
    let html = `<table><tr><th>Τμήμα</th><th>Μάθημα</th><th>Ώρες</th><th>Ενέργεια</th></tr>`;
    for (const row of filtered) {
      html += `<tr>
        <td>${row.section}</td>
        <td>${row.subject}</td>
        <td>${row.hour}</td>
        <td><button class="delete-btn" onclick="deleteProgramm('${row.id}', '${containerId}')">Διαγραφή</button></td>
      </tr>`;
    }
    html += `</table>`;
    container.innerHTML = html;
  }

  async function deleteProgramm(id, containerId) {
    if (!confirm('Σίγουρα θέλετε να διαγράψετε αυτή την εγγραφή;')) return;
    await fetch(`/api/programms/${id}`, { method: 'DELETE' });
    // Επαναφόρτωση του πίνακα
    const sectionMap = {
      'table-section-dimotiko': 'Δημοτικό',
      'table-section-gymnasio': 'Γυμνάσιο',
      'table-section-lykeio': "Λύκειο - ΓΕΛ",
      'table-section-epal': "Λύκειο - ΕΠΑΛ",
    };
    fetchAndRenderProgramms(sectionMap[containerId], containerId);
  }

  async function renderAdminTable(tableId, filterFn) {
    const res = await fetch('/api/programms');
    const data = await res.json();
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';
    const filtered = data.filter(filterFn);
    for (const row of filtered) {
      console.log(row);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.section}</td>
        <td>${row.subject}</td>
        <td>${row.hour}</td>
        ${row.type === 'lykeio' ? `<td>${row.field !== undefined && row.field !== '' ? row.field : 'null'}</td>` : ''}
        <td><button class="delete-btn" onclick="deleteAdminProgramm('${row.id}', '${tableId}')">Διαγραφή</button></td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function deleteAdminProgramm(id, tableId) {
    if (!confirm('Σίγουρα θέλετε να διαγράψετε αυτή την εγγραφή;')) return;
    await fetch(`/api/programms/${id}`, { method: 'DELETE' });
    // Επαναφόρτωση του πίνακα
    loadAllAdminTables();
  }

  function loadAllAdminTables() {
    renderAdminTable('admin-programms-table-dimotiko', row => row.type === 'dimotiko');
    renderAdminTable('admin-programms-table-gymnasio', row => row.type === 'gymnasio' && row.section && (
      row.section.includes('Γυμνάσιο') ||
      row.section.includes("Α' Γυμνασίου") || row.section === 'Α' ||
      row.section.includes("Β' Γυμνασίου") || row.section === 'Β' ||
      row.section.includes("Γ' Γυμνασίου") || row.section === 'Γ'
    ));
    renderAdminTable('admin-programms-table-lykeio', row => row.type === 'lykeio' && (
      row.section.includes('ΓΕΛ') ||
      row.section.includes("Α' Λυκείου") || row.section === 'Α' ||
      row.section.includes("Β' Λυκείου") || row.section === 'Β' ||
      row.section.includes("Γ' Λυκείου") || row.section === 'Γ'
    ));
    renderAdminTable('admin-programms-table-epal', row => row.type === 'epal' && (
      row.section.includes('ΕΠΑΛ') ||
      row.section.includes("Α' Λυκείου") || row.section === 'Α' ||
      row.section.includes("Β' Λυκείου") || row.section === 'Β' ||
      row.section.includes("Γ' Λυκείου") || row.section === 'Γ'
    ));
    // Ταξινόμηση με προτεραιότητα Α, Β, Γ
    const lykeioTable = document.querySelector('#admin-programms-table-lykeio tbody');
    if (lykeioTable) {
      const rows = Array.from(lykeioTable.querySelectorAll('tr'));
      const order = ["Α' Λυκείου", 'Α', "Β' Λυκείου", 'Β', "Γ' Λυκείου", 'Γ'];
      rows.sort((a, b) => {
        const aSection = a.children[0].textContent;
        const bSection = b.children[0].textContent;
        const aIdx = order.findIndex(o => aSection === o || aSection.includes(o));
        const bIdx = order.findIndex(o => bSection === o || bSection.includes(o));
        return aIdx - bIdx;
      });
      rows.forEach(row => lykeioTable.appendChild(row));
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProgramms('Δημοτικό', 'table-section-dimotiko', 'dimotiko');
    fetchAndRenderProgramms('Γυμνάσιο', 'table-section-gymnasio', 'gymnasio');
    fetchAndRenderProgramms("Λύκειο - ΕΠΑΛ", 'table-section-epal', 'epal');
    fetchAndRenderProgramms("Λύκειο - ΓΕΛ", 'table-section-lykeio', 'lykeio');
    loadAllAdminTables();
    // Ταξινόμηση με προτεραιότητα Α, Β, Γ μετά το render
    setTimeout(() => {
      const lykeioTable = document.querySelector('#admin-programms-table-lykeio tbody');
      if (lykeioTable) {
        const rows = Array.from(lykeioTable.querySelectorAll('tr'));
        const order = ["Α' Λυκείου", 'Α', "Β' Λυκείου", 'Β', "Γ' Λυκείου", 'Γ'];
        rows.sort((a, b) => {
          const aSection = a.children[0].textContent;
          const bSection = b.children[0].textContent;
          const aIdx = order.findIndex(o => aSection === o || aSection.includes(o));
          const bIdx = order.findIndex(o => bSection === o || bSection.includes(o));
          if (aIdx !== bIdx) return aIdx - bIdx;
          return a.children[1].textContent.localeCompare(b.children[1].textContent, 'el', { sensitivity: 'base' });
        });
        rows.forEach(row => lykeioTable.appendChild(row));
      }
    }, 300);
    // Ταξινόμηση με προτεραιότητα Α, Β, Γ μετά το render
    setTimeout(() => {
      const epalTable = document.querySelector('#admin-programms-table-epal tbody');
      if (epalTable) {
        const rows = Array.from(epalTable.querySelectorAll('tr'));
        const order = ["Α' Λυκείου", 'Α', "Β' Λυκείου", 'Β', "Γ' Λυκείου", 'Γ'];
        rows.sort((a, b) => {
          const aSection = a.children[0].textContent;
          const bSection = b.children[0].textContent;
          const aIdx = order.findIndex(o => aSection === o || aSection.includes(o));
          const bIdx = order.findIndex(o => bSection === o || bSection.includes(o));
          if (aIdx !== bIdx) return aIdx - bIdx;
          return a.children[1].textContent.localeCompare(b.children[1].textContent, 'el', { sensitivity: 'base' });
        });
        rows.forEach(row => epalTable.appendChild(row));
      }
    }, 300);
    // Ταξινόμηση με προτεραιότητα Α, Β, Γ μετά το render
    setTimeout(() => {
      const gymnasioTable = document.querySelector('#admin-programms-table-gymnasio tbody');
      if (gymnasioTable) {
        const rows = Array.from(gymnasioTable.querySelectorAll('tr'));
        const order = ["Α' Γυμνασίου", 'Α', "Β' Γυμνασίου", 'Β', "Γ' Γυμνασίου", 'Γ'];
        rows.sort((a, b) => {
          const aSection = a.children[0].textContent;
          const bSection = b.children[0].textContent;
          const aIdx = order.findIndex(o => aSection === o || aSection.includes(o));
          const bIdx = order.findIndex(o => bSection === o || bSection.includes(o));
          if (aIdx !== bIdx) return aIdx - bIdx;
          return a.children[1].textContent.localeCompare(b.children[1].textContent, 'el', { sensitivity: 'base' });
        });
        rows.forEach(row => gymnasioTable.appendChild(row));
      }
    }, 300);
  });



      function toggleClassField(type) {
        const classLabel = document.getElementById('class-label');
        const classSelect = classLabel.querySelector('select[name="class"]');
        if (type === 'dimotiko') {
          classLabel.style.display = 'none';
          classSelect.removeAttribute('required');
        } else {
          classLabel.style.display = '';
          classSelect.setAttribute('required', '');
        }
      }
      window.addEventListener('DOMContentLoaded', function() {
        const typeSelect = document.querySelector('select[name="type"]');
        if (typeSelect) toggleClassField(typeSelect.value);
        // Προσθήκη handler για submit
        const form = document.getElementById('add-programm-form');
        if (form) {
          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const type = form.querySelector('select[name="type"]').value;
            const subject = form.querySelector('input[name="subject"]').value;
            const hour = form.querySelector('input[name="hour"]').value;
            const field = form.querySelector('select[name="field"]').value;
            let section = '';
            let classValue = '';
            if (type === 'dimotiko') {
              section = 'Δημοτικό';
            } else if (type === 'gymnasio') {
              classValue = form.querySelector('select[name="class"]').value;
              if (classValue === 'Α') section = "Α' Γυμνασίου";
              else if (classValue === 'Β') section = "Β' Γυμνασίου";
              else if (classValue === 'Γ') section = "Γ' Γυμνασίου";
              else section = 'Γυμνάσιο';
            } else if (type === 'lykeio') {
              classValue = form.querySelector('select[name="class"]').value;
              if (classValue === 'Α') section = "Α' ΓΕΛ";
              else if (classValue === 'Β') section = "Β' ΓΕΛ";
              else if (classValue === 'Γ') section = "Γ' ΓΕΛ";
              else section = 'Λύκειο - ΓΕΛ';
            } else if (type === 'epal') {
              classValue = form.querySelector('select[name="class"]').value;
              if (classValue === 'Α') section = "Α' ΕΠΑΛ";
              else if (classValue === 'Β') section = "Β' ΕΠΑΛ";
              else if (classValue === 'Γ') section = "Γ' ΕΠΑΛ";
              else section = 'Λύκειο - ΕΠΑΛ';
            }
            const payload = {
              section,
              subject,
              hour,
              type,
              field,
              class: classValue
            };
            const res = await fetch('/api/programms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const msgDiv = document.getElementById('add-programm-message');
            if (res.ok) {
              msgDiv.textContent = 'Το μάθημα προστέθηκε!';
              form.reset();
              toggleClassField('');
              fetchAndRenderProgramms('Δημοτικό', 'table-section-dimotiko', 'dimotiko');
            } else {
              msgDiv.textContent = 'Σφάλμα κατά την προσθήκη.';
            }
          });
        }
      });
