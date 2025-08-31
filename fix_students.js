import { pool } from './db.js';

(async () => {
  try {
    console.log('=== FIXING STUDENTS FOREIGN KEY CONSTRAINT ===');
    
    // Check current constraints
    console.log('\n=== Checking Enrollments table constraints ===');
    const [constraints] = await pool.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'Enrollments' 
      AND TABLE_SCHEMA = 'school_db'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('Enrollments constraints:', constraints);
    
    // Check OldStudents structure
    console.log('\n=== Checking OldStudents structure ===');
    try {
      const [oldStudentsDesc] = await pool.query('DESCRIBE OldStudents');
      console.log('OldStudents columns:', oldStudentsDesc.map(col => col.Field));
      
      const [oldStudentsData] = await pool.query('SELECT * FROM OldStudents LIMIT 3');
      console.log('OldStudents data:', oldStudentsData);
    } catch (e) {
      console.log('OldStudents table error:', e.message);
    }
    
    // Check Students data
    const [studentsData] = await pool.query('SELECT * FROM Students');
    console.log('\nStudents data:', studentsData);
    
    // Step 1: Sync Students data to OldStudents
    console.log('\n=== Syncing Students with OldStudents ===');
    for (const student of studentsData) {
      try {
        await pool.query(`
          INSERT IGNORE INTO OldStudents (student_id, first_name, last_name, username, password_hash)
          VALUES (?, ?, ?, ?, ?)
        `, [
          student.id, 
          student.first_name || 'Student',
          student.last_name || `${student.id}`,
          student.username || `student${student.id}`,
          student.password_hash || 'temppass123'
        ]);
        console.log(`✅ Synced student ${student.id}: ${student.first_name} ${student.last_name}`);
      } catch (studentError) {
        console.log(`❌ Could not sync student ${student.id}:`, studentError.message);
      }
    }
    
    // Step 2: Test enrollment creation
    console.log('\n=== Testing enrollment creation ===');
    try {
      const [testResult] = await pool.query(
        'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
        [1, 4] // Student 1, Class 4
      );
      console.log('✅ Test enrollment successful!', testResult.insertId);
      
      // Clean up test data
      await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [testResult.insertId]);
      console.log('🧹 Cleaned up test enrollment');
    } catch (enrollError) {
      console.log('❌ Test enrollment failed:', enrollError.message);
    }
    
    // Final status check
    const [finalOldStudents] = await pool.query('SELECT * FROM OldStudents ORDER BY student_id');
    console.log('\n=== Final OldStudents data ===');
    console.log('OldStudents:', finalOldStudents);
    
    console.log('\n✅ Students synchronization completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
      );
      console.log('✅ Test enrollment επιτυχής!', testResult.insertId);
      
      // Καθαρισμός test data
      await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [testResult.insertId]);
      console.log('🧹 Καθάρισα το test enrollment');
    } catch (enrollError) {
      console.log('❌ Test enrollment απέτυχε:', enrollError.message);
    }
    
    // Step 5: Τεστάρω enrollment με student_id 2 και class_id 4
    console.log('\n=== Τεστάρω enrollment με student_id 2 και class_id 4 ===');
    try {
      const [testResult2] = await pool.query(
        'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
        [2, 4] // Student 2, Subject/Class 4
      );
      console.log('✅ Test enrollment 2 επιτυχής!', testResult2.insertId);
      
      // Καθαρισμός test data
      await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [testResult2.insertId]);
      console.log('🧹 Καθάρισα το test enrollment 2');
    } catch (enrollError2) {
      console.log('❌ Test enrollment 2 απέτυχε:', enrollError2.message);
    }
    
    // Step 6: Τελικός έλεγχος - Δείχνω τα τρέχοντα enrollments
    console.log('\n=== Τρέχοντα Enrollments ===');
    const [currentEnrollments] = await pool.query(`
      SELECT e.*, 
             CONCAT(s.first_name, ' ', s.last_name) as student_name,
             subj.name as subject_name
      FROM Enrollments e
      LEFT JOIN Students s ON e.student_id = s.id
      LEFT JOIN Subjects subj ON e.class_id = subj.id
      ORDER BY e.enrollment_id
    `);
    console.log('Current enrollments:', currentEnrollments);
    
    console.log('\n✅ Συγχρονισμός ολοκληρώθηκε! Τώρα πρέπει να λειτουργούν τα enrollments.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
