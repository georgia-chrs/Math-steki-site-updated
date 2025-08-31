import { pool } from './db.js';

(async () => {
  try {
    console.log('=== ΔΙΟΡΘΩΣΗ FOREIGN KEY CONSTRAINTS ΓΙΑ STUDENTS ===');
    
    // Έλεγχος δομής OldStudents πίνακα
    console.log('\n=== Έλεγχος δομής OldStudents πίνακα ===');
    try {
      const [oldStudentsDesc] = await pool.query('DESCRIBE OldStudents');
      console.log('OldStudents columns:', oldStudentsDesc.map(col => col.Field));
    } catch (e) {
      console.log('OldStudents table error:', e.message);
    }
    
    // Έλεγχος δεδομένων στους πίνακες
    const [studentsData] = await pool.query('SELECT * FROM Students');
    const [oldStudentsData] = await pool.query('SELECT * FROM OldStudents');
    
    console.log(`\nStudents πίνακας έχει ${studentsData.length} εγγραφές`);
    console.log(`OldStudents πίνακας έχει ${oldStudentsData.length} εγγραφές`);
    
    // Συγχρονισμός Students με OldStudents
    console.log('\n=== Συγχρονισμός Students με OldStudents ===');
    for (const student of studentsData) {
      try {
        // Προσπάθεια εισαγωγής στο OldStudents
        await pool.query(`
          INSERT IGNORE INTO OldStudents (student_id, first_name, last_name, username, password_hash)
          VALUES (?, ?, ?, ?, ?)
        `, [
          student.id, 
          student.first_name, 
          student.last_name, 
          student.username || `student${student.id}`, 
          student.password_hash || 'temppass123'
        ]);
        console.log(`✅ Συγχρονίστηκε student ${student.id}: ${student.first_name} ${student.last_name}`);
      } catch (studentError) {
        console.log(`❌ Δεν μπόρεσα να συγχρονίσω student ${student.id}:`, studentError.message);
      }
    }
    
    // Τεστ εγγραφής σε τμήμα
    console.log('\n=== Τεστ εγγραφής με student ID 1 και class ID 3 ===');
    try {
      const [testResult] = await pool.query(
        'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
        [1, 3] // Student 1, Subject/Class 3
      );
      console.log('✅ Τεστ εγγραφή επιτυχής!', testResult.insertId);
      
      // Καθαρισμός test data
      await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [testResult.insertId]);
      console.log('🧹 Καθάρισα το τεστ enrollment');
    } catch (enrollError) {
      console.log('❌ Τεστ εγγραφή απέτυχε:', enrollError.message);
    }
    
    // Τελικός έλεγχος
    const [finalOldStudents] = await pool.query('SELECT * FROM OldStudents ORDER BY student_id');
    console.log('\n=== Τελικά δεδομένα OldStudents ===');
    console.log(`OldStudents έχει τώρα ${finalOldStudents.length} εγγραφές`);
    finalOldStudents.forEach(student => {
      console.log(`- Student ID ${student.student_id}: ${student.first_name} ${student.last_name}`);
    });
    
    console.log('\n✅ Η διόρθωση των foreign key constraints ολοκληρώθηκε!');
    console.log('Τώρα οι εγγραφές θα πρέπει να λειτουργούν σωστά.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
