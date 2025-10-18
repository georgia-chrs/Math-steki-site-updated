// Data variables
    let studentCodes = [];
    let filteredStudentCodes = [];

    // Pagination variables
    let currentCodesPage = 1;
    const codesPerPage = 8;

    // Load all user passwords from API
    async function loadAllUserPasswords() {
      try {
        const response = await fetch('/api/users/passwords');
        const users = await response.json();
        
        // Μετατροπή των δεδομένων για να ταιριάζουν με το interface
        studentCodes = users.map((user, index) => ({
          id: user.id,
          studentId: user.id,
          studentName: user.name,
          username: user.username,
          password: user.password,
          status: 'active',
          type: user.type, // Admin ή Μαθητής
          role: user.role,
          lastLogin: 'Ποτέ',
          createdDate: new Date().toISOString().split('T')[0],
          expiryDate: '2025-06-30',
          maxSessions: 5,
          currentSessions: 0
        }));
        
        filteredStudentCodes = [...studentCodes];
        loadFilteredCodes();
        
        console.log('Φορτώθηκαν κωδικοί χρηστών:', studentCodes);
      } catch (error) {
        console.error('Σφάλμα φόρτωσης κωδικών:', error);
        // Fallback στα sample δεδομένα αν αποτύχει
        studentCodes = [
          {
            id: 1,
            studentName: "Γιάννης Παπαδόπουλος",
            username: "jpapado",
            password: "St2025!A1",
            status: "active",
            type: "Μαθητής",
            lastLogin: "2024-10-15",
            createdDate: "2024-09-01",
            expiryDate: "2025-06-30"
          },
          {
            id: 2,
            studentName: "Μαρία Κωνσταντίνου",
            username: "mkonstant",
            password: "St2025!B2",
            status: "active",
            type: "Μαθητής",
            lastLogin: "2024-10-16",
            createdDate: "2024-09-01",
            expiryDate: "2025-06-30"
          }
        ];
        filteredStudentCodes = [...studentCodes];
        loadFilteredCodes();
      }
    }

    // Load student codes on page load
    document.addEventListener('DOMContentLoaded', function() {
      loadAllUserPasswords();
      
      // Set default expiry date (6 months from now)
      const defaultExpiry = new Date();
      defaultExpiry.setMonth(defaultExpiry.getMonth() + 6);
      document.getElementById('expiryDate').value = defaultExpiry.toISOString().split('T')[0];
      document.getElementById('bulkExpiryDate').value = defaultExpiry.toISOString().split('T')[0];
    });

    // Search functionality
    function searchStudentCodes() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const statusFilter = document.getElementById('statusFilter').value;

      filteredStudentCodes = studentCodes.filter(code => {
        const matchesSearch = !searchTerm || 
          code.studentName.toLowerCase().includes(searchTerm) ||
          code.username.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || code.status === statusFilter;

        return matchesSearch && matchesStatus;
      });

      currentCodesPage = 1; // Reset to first page on new search
      loadFilteredCodes();
    }

    // Load student codes into table
    function loadStudentCodes() {
      const tbody = document.getElementById('studentCodesTableBody');
      tbody.innerHTML = '';

      if (filteredStudentCodes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Δεν βρέθηκαν κωδικοί</td></tr>';
        return;
      }

      filteredStudentCodes.forEach(code => {
        const row = document.createElement('tr');
        const statusClass = `status-${code.status}`;
        
        row.innerHTML = `
          <td>${code.id}</td>
          <td>
            ${code.studentName}
            <br><small style="color: #666;">${code.type || 'Μαθητής'}</small>
          </td>
          <td><span class="code-display">${code.username}</span></td>
          <td>
            <span class="code-display" style="font-weight: bold; color: #2C5F4F; font-family: monospace;">${code.password}</span>
            <br><small style="color: #888;">Προσοχή: Ευαίσθητη πληροφορία</small>
          </td>
          <td><span class="status-badge ${statusClass}">${getStatusText(code.status)}</span></td>
          <td>${formatDate(code.lastLogin)}</td>
          <td>${formatDate(code.createdDate)}</td>
          <td>${formatDate(code.expiryDate)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-small" onclick="editUserPassword('${code.username}', '${code.role}')">Αλλαγή Κωδικού</button>
              <button class="btn btn-success btn-small" onclick="resetPassword(${code.id})">Reset Password</button>
              <button class="btn btn-danger btn-small" onclick="deactivateCode(${code.id})">Απενεργοποίηση</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Load codes with pagination
    function loadFilteredCodes() {
      displayCodesWithPagination();
    }

    // Display codes with pagination
    function displayCodesWithPagination() {
      const startIndex = (currentCodesPage - 1) * codesPerPage;
      const endIndex = startIndex + codesPerPage;
      const codesToShow = filteredStudentCodes.slice(startIndex, endIndex);
      
      loadStudentCodesTable(codesToShow);
      createCodesPaginationControls(filteredStudentCodes.length);
    }

    // Load student codes into table (updated to work with pagination)
    function loadStudentCodesTable(codesToShow) {
      const tbody = document.getElementById('studentCodesTableBody');
      tbody.innerHTML = '';

      if (codesToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 30px;">Δεν βρέθηκαν κωδικοί</td></tr>';
        return;
      }

      codesToShow.forEach(code => {
        const row = document.createElement('tr');
        const statusClass = `status-${code.status}`;
        
        row.innerHTML = `
          <td>${code.id}</td>
          <td>
            ${code.studentName}
            <br><small style="color: #666;">${code.type || 'Μαθητής'}</small>
          </td>
          <td><span class="code-display">${code.username}</span></td>
          <td>
            <span class="code-display" style="font-weight: bold; color: #2C5F4F; font-family: monospace;">${code.password}</span>
            <br><small style="color: #888;">Προσοχή: Ευαίσθητη πληροφορία</small>
          </td>
          <td><span class="status-badge ${statusClass}">${getStatusText(code.status)}</span></td>
          <td>${formatDate(code.lastLogin)}</td>
          <td>${formatDate(code.createdDate)}</td>
          <td>${formatDate(code.expiryDate)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-small" onclick="editUserPassword('${code.username}', '${code.role}')">Αλλαγή Κωδικού</button>
              <button class="btn btn-success btn-small" onclick="resetPassword(${code.id})">Reset Password</button>
              <button class="btn btn-danger btn-small" onclick="deactivateCode(${code.id})">Απενεργοποίηση</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // Create pagination controls for codes
    function createCodesPaginationControls(totalCodes) {
      const totalPages = Math.ceil(totalCodes / codesPerPage);
      
      // Find or create pagination container
      let paginationContainer = document.getElementById('codesPaginationContainer');
      if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'codesPaginationContainer';
        paginationContainer.style.cssText = `
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin: 20px 0;
          padding: 15px 10px;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex-wrap: wrap;
        `;
        
        const tbody = document.getElementById('studentCodesTableBody');
        const table = tbody ? tbody.closest('table') : null;
        if (table && table.parentElement) {
          table.parentElement.appendChild(paginationContainer);
        }
      }
      
      paginationContainer.innerHTML = '';
      
      if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
      }
      
      paginationContainer.style.display = 'flex';
      
      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '← Προηγούμενη';
      prevBtn.className = 'pagination-btn';
      prevBtn.style.cssText = `
        padding: 8px 16px;
        background: ${currentCodesPage === 1 ? '#ccc' : '#dc5935'};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: ${currentCodesPage === 1 ? 'not-allowed' : 'pointer'};
        transition: background 0.3s;
      `;
      prevBtn.disabled = currentCodesPage === 1;
      prevBtn.onclick = () => goToCodesPage(currentCodesPage - 1);
      paginationContainer.appendChild(prevBtn);
      
      // Page info
      const pageInfo = document.createElement('span');
      pageInfo.innerHTML = `Σελίδα ${currentCodesPage} από ${totalPages} (Σύνολο: ${totalCodes} κωδικοί)`;
      pageInfo.style.cssText = `
        padding: 8px 16px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-weight: 500;
        color: #333;
      `;
      paginationContainer.appendChild(pageInfo);
      
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = 'Επόμενη →';
      nextBtn.className = 'pagination-btn';
      nextBtn.style.cssText = `
        padding: 8px 16px;
        background: ${currentCodesPage === totalPages ? '#ccc' : '#dc5935'};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: ${currentCodesPage === totalPages ? 'not-allowed' : 'pointer'};
        transition: background 0.3s;
      `;
      nextBtn.disabled = currentCodesPage === totalPages;
      nextBtn.onclick = () => goToCodesPage(currentCodesPage + 1);
      paginationContainer.appendChild(nextBtn);
      
      // Add page number buttons for small number of pages
      if (totalPages <= 10) {
        const separator = document.createElement('span');
        separator.innerHTML = '|';
        separator.style.margin = '0 10px';
        paginationContainer.appendChild(separator);
        
        for (let i = 1; i <= totalPages; i++) {
          const pageBtn = document.createElement('button');
          pageBtn.innerHTML = i;
          pageBtn.style.cssText = `
            padding: 6px 10px;
            background: ${i === currentCodesPage ? '#dc5935' : 'white'};
            color: ${i === currentCodesPage ? 'white' : '#333'};
            border: 1px solid ${i === currentCodesPage ? '#dc5935' : '#ddd'};
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            min-width: 35px;
          `;
          pageBtn.onclick = () => goToCodesPage(i);
          paginationContainer.appendChild(pageBtn);
        }
      }
    }
    
    // Navigate to specific codes page
    function goToCodesPage(pageNumber) {
      const totalPages = Math.ceil(filteredStudentCodes.length / codesPerPage);
      
      if (pageNumber < 1 || pageNumber > totalPages) {
        return;
      }
      
      currentCodesPage = pageNumber;
      displayCodesWithPagination();
      
      // Scroll to top of codes table
      const tbody = document.getElementById('studentCodesTableBody');
      const table = tbody ? tbody.closest('table') : null;
      if (table) {
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function getStatusText(status) {
      switch(status) {
        case 'active': return 'Ενεργός';
        case 'inactive': return 'Ανενεργός';
        case 'expired': return 'Ληγμένος';
        default: return status;
      }
    }

    function formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('el-GR');
    }

    function editStudentCode(id) {
      const code = studentCodes.find(c => c.id === id);
      if (!code) return;

      document.getElementById('modalTitle').textContent = `Επεξεργασία Κωδικού - ${code.studentName}`;
      document.getElementById('studentCodeId').value = code.id;
      document.getElementById('studentName').value = code.studentName;
      document.getElementById('username').value = code.username;
      document.getElementById('codeStatus').value = code.status;
      document.getElementById('password').value = '';
      document.getElementById('expiryDate').value = code.expiryDate || '';
      document.getElementById('maxSessions').value = code.maxSessions || 5;
      
      document.getElementById('editCodeModal').style.display = 'block';
    }

    function closeEditModal() {
      document.getElementById('editCodeModal').style.display = 'none';
    }

    function resetPassword(id) {
      const code = studentCodes.find(c => c.id === id);
      if (!code) return;

      if (confirm(`Είστε βέβαιοι ότι θέλετε να επαναφέρετε τον κωδικό για τον μαθητή ${code.studentName};`)) {
        const newPassword = generateRandomPassword();
        code.password = newPassword;
        code.status = 'active';
        
        loadFilteredCodes();
        showAlert(`Νέος κωδικός για ${code.studentName}: ${newPassword}`, 'success');
      }
    }

    function deactivateCode(id) {
      const code = studentCodes.find(c => c.id === id);
      if (!code) return;

      if (confirm(`Είστε βέβαιοι ότι θέλετε να απενεργοποιήσετε τον κωδικό για τον μαθητή ${code.studentName};`)) {
        code.status = 'inactive';
        loadFilteredCodes();
        showAlert(`Ο κωδικός για τον ${code.studentName} απενεργοποιήθηκε!`, 'success');
      }
    }

    function generateRandomPassword() {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
      let password = 'St2025!';
      for (let i = 0; i < 4; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    }

    function generateNewPassword() {
      const newPassword = generateRandomPassword();
      document.getElementById('password').value = newPassword;
    }

    function togglePassword(fieldId) {
      const field = document.getElementById(fieldId);
      const toggle = field.nextElementSibling;
      
      if (field.type === 'password') {
        field.type = 'text';
        toggle.textContent = '🙈';
      } else {
        field.type = 'password';
        toggle.textContent = '👁️';
      }
    }

    // Bulk code generation
    function generateBulkCodes() {
      document.getElementById('bulkCodeModal').style.display = 'block';
    }

    function closeBulkModal() {
      document.getElementById('bulkCodeModal').style.display = 'none';
      document.getElementById('bulkPreview').style.display = 'none';
    }

    function previewBulkGeneration() {
      const selectedClass = document.getElementById('bulkClass').value;
      if (!selectedClass) {
        showAlert('Παρακαλώ επιλέξτε τάξη!', 'error');
        return;
      }

      // Simulate students from selected class
      const studentsInClass = [
        { id: 4, name: "Αννα Κώστου" },
        { id: 5, name: "Πέτρος Σάββας" },
        { id: 6, name: "Ελένη Μιχαήλ" }
      ]; // This should come from actual database

      const preview = document.getElementById('bulkPreviewContent');
      preview.innerHTML = `
        <p><strong>Τάξη:</strong> ${selectedClass}</p>
        <p><strong>Μαθητές που θα λάβουν κωδικούς:</strong> ${studentsInClass.length}</p>
        <ul>
          ${studentsInClass.map(s => `<li>${s.name}</li>`).join('')}
        </ul>
      `;
      
      document.getElementById('bulkPreview').style.display = 'block';
    }

    function executeBulkGeneration() {
      const selectedClass = document.getElementById('bulkClass').value;
      const expiryDate = document.getElementById('bulkExpiryDate').value;
      const maxSessions = document.getElementById('bulkMaxSessions').value;

      if (!selectedClass) {
        showAlert('Παρακαλώ επιλέξτε τάξη!', 'error');
        return;
      }

      // Simulate bulk generation
      const newCodes = [
        { studentName: "Αννα Κώστου", username: "anna.k", password: generateRandomPassword() },
        { studentName: "Πέτρος Σάββας", username: "petros.s", password: generateRandomPassword() },
        { studentName: "Ελένη Μιχαήλ", username: "eleni.m", password: generateRandomPassword() }
      ];

      newCodes.forEach((newCode, index) => {
        const id = Math.max(...studentCodes.map(c => c.id)) + index + 1;
        studentCodes.push({
          id: id,
          studentId: id + 10,
          studentName: newCode.studentName,
          username: newCode.username,
          password: newCode.password,
          status: 'active',
          lastLogin: null,
          createdDate: new Date().toISOString().split('T')[0],
          expiryDate: expiryDate,
          maxSessions: parseInt(maxSessions),
          currentSessions: 0
        });
      });

      filteredStudentCodes = [...studentCodes];
      loadFilteredCodes();
      closeBulkModal();

      const codesList = newCodes.map(c => `${c.studentName}: ${c.username} / ${c.password}`).join('<br>');
      showAlert(`Δημιουργήθηκαν ${newCodes.length} κωδικοί:<br>${codesList}`, 'success');
    }

    // Form submission
    document.getElementById('studentCodeForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const codeId = parseInt(document.getElementById('studentCodeId').value);
      const code = studentCodes.find(c => c.id === codeId);
      
      if (!code) return;

      // Update code data
      code.username = document.getElementById('username').value;
      code.status = document.getElementById('codeStatus').value;
      code.expiryDate = document.getElementById('expiryDate').value;
      code.maxSessions = parseInt(document.getElementById('maxSessions').value);

      const newPassword = document.getElementById('password').value;
      if (newPassword) {
        code.password = newPassword;
      }

      closeEditModal();
      loadFilteredCodes();
      showAlert('Οι αλλαγές αποθηκεύτηκαν επιτυχώς!', 'success');
    });

    // Show alert messages
    function showAlert(message, type) {
      const alertElement = type === 'success' ? 
        document.getElementById('alertSuccess') : 
        document.getElementById('alertError');
      
      alertElement.innerHTML = message;
      alertElement.style.display = 'block';
      
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 8000);
    }

    // Auto search on input change
    document.getElementById('searchInput').addEventListener('input', searchStudentCodes);
    document.getElementById('statusFilter').addEventListener('change', searchStudentCodes);

    // Function to edit user password
    async function editUserPassword(username, userType) {
      const newPassword = prompt(`Εισάγετε νέο κωδικό για τον χρήστη "${username}":`, '');
      
      if (newPassword === null || newPassword.trim() === '') {
        return; // User cancelled or empty password
      }
      
      if (newPassword.length < 3) {
        showAlert('error', 'Ο κωδικός πρέπει να έχει τουλάχιστον 3 χαρακτήρες');
        return;
      }
      
      try {
        const response = await fetch(`/api/users/${username}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            newPassword: newPassword,
            userType: userType
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showAlert('success', `Κωδικός ενημερώθηκε επιτυχώς για τον χρήστη "${username}"`);
          // Ανανεώνουμε τα δεδομένα
          loadAllUserPasswords();
        } else {
          showAlert('error', result.error || 'Σφάλμα κατά την ενημέρωση του κωδικού');
        }
      } catch (error) {
        showAlert('error', 'Σφάλμα σύνδεσης με τον server');
        console.error('Error updating password:', error);
      }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
      const editModal = document.getElementById('editCodeModal');
      const bulkModal = document.getElementById('bulkCodeModal');
      
      if (event.target === editModal) {
        closeEditModal();
      }
      if (event.target === bulkModal) {
        closeBulkModal();
      }
    }

    // Make pagination functions globally accessible
    window.goToCodesPage = goToCodesPage;
    window.displayCodesWithPagination = displayCodesWithPagination;
