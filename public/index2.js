  document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('error-message');

    if (!username || !password) {
      errorDiv.textContent = "Συμπληρώστε όλα τα πεδία!";
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Αποθήκευση JWT token στο sessionStorage
        if (data.token) {
          sessionStorage.setItem('jwtToken', data.token);
        }
        // Αποθήκευση στοιχείων χρήστη
        if (data.user) {
          localStorage.setItem('loggedInStudent', JSON.stringify({
            username: data.user.username,
            role: data.user.role,
            loginTime: new Date().toISOString()
          }));
          sessionStorage.setItem('username', data.user.username);
        }
        // Έλεγχος τύπου χρήστη
        if (data.user && data.user.role === 'admin') {
          window.location.href = '/admin.html';
        } else if (data.user && data.user.role === 'student') {
          window.location.href = '/students.html';
        } else {
          window.location.href = '/students.html'; // default
        }
      } else {
        errorDiv.textContent = data.error || "Λάθος στοιχεία!";
      }
    } catch (err) {
      errorDiv.textContent = "Σφάλμα σύνδεσης με τον server!";
    }
  });
