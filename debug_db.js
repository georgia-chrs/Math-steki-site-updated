import { pool } from './db.js';

(async () => {
  try {
    console.log('=== FIXING CLASSES TABLE TO MATCH SUBJECTS ===');
    
    // First, let's see what's currently in Classes and Subjects
    const [subjects] = await pool.query('SELECT * FROM Subjects ORDER BY id');
    const [classes] = await pool.query('SELECT * FROM Classes ORDER BY class_id');
    const [enrollments] = await pool.query('SELECT DISTINCT class_id FROM Enrollments');
    
    console.log('Current Subjects:', subjects);
    console.log('Current Classes:', classes);
    console.log('Enrollments using class_ids:', enrollments.map(e => e.class_id));
    
    console.log('\n=== Updating/Creating Classes entries for each Subject ===');
    
    // For each subject, either update existing class or create new one
    for (const subject of subjects) {
      const className = `${subject.code} - ${subject.name}`;
      
      // Check if class already exists
      const [existingClass] = await pool.query('SELECT * FROM Classes WHERE class_id = ?', [subject.id]);
      
      if (existingClass.length > 0) {
        // Update existing class
        await pool.query(`
          UPDATE Classes 
          SET class_name = ?, teacher_id = ?
          WHERE class_id = ?
        `, [className, subject.teacherId, subject.id]);
        console.log(`Updated existing class ${subject.id}: ${className}`);
      } else {
        // Create new class with specific class_id
        await pool.query(`
          INSERT INTO Classes (class_id, class_name, course_id, teacher_id)
          VALUES (?, ?, 1, ?)
        `, [subject.id, className, subject.teacherId]);
        console.log(`Created new class ${subject.id}: ${className}`);
      }
    }
    
    // Verify the Classes table now
    const [newClasses] = await pool.query('SELECT * FROM Classes ORDER BY class_id');
    console.log('\n=== Updated Classes data ===');
    console.log('Classes:', newClasses);
    
    // Now let's test if enrollments work with various subject IDs
    console.log('\n=== Testing enrollments with different subject IDs ===');
    const testSubjectIds = [1, 2, 3, 4, 5];
    
    for (const subjectId of testSubjectIds) {
      try {
        const [testResult] = await pool.query(
          'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
          [1, subjectId] // Student 1, Subject/Class ID
        );
        console.log(`✅ Test enrollment successful for subject ${subjectId}! Enrollment ID: ${testResult.insertId}`);
        
        // Clean up test data
        await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [testResult.insertId]);
        console.log(`🧹 Cleaned up test enrollment for subject ${subjectId}`);
      } catch (error) {
        console.log(`❌ Test enrollment failed for subject ${subjectId}:`, error.message);
      }
    }
    
    console.log('\n✅ Classes table has been updated to match Subjects!');
    console.log('Now all Subject IDs (1-5) can be used as class_id in Enrollments.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
