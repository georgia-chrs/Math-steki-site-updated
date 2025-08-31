import { pool } from './db.js';

(async () => {
  try {
    console.log('=== CHECKING DATABASE STRUCTURE AND CONSTRAINTS ===');
    
    // Check teacher tables
    console.log('\n=== Checking teacher tables ===');
    try {
      const [oldTeachers] = await pool.query('SELECT * FROM OldTeachers LIMIT 3');
      console.log('OldTeachers data:', oldTeachers);
    } catch (e) {
      console.log('OldTeachers table error:', e.message);
    }
    
    try {
      const [teachers] = await pool.query('SELECT * FROM Teachers LIMIT 3');
      console.log('Teachers data:', teachers);
    } catch (e) {
      console.log('Teachers table error:', e.message);
    }
    
    // Check Classes foreign key constraints
    console.log('\n=== Checking Classes table constraints ===');
    const [constraints] = await pool.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'Classes' 
      AND TABLE_SCHEMA = 'school_db'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('Classes constraints:', constraints);
    
    // Let's see what's currently in Classes and Subjects
    const [subjects] = await pool.query('SELECT * FROM Subjects ORDER BY id');
    const [classes] = await pool.query('SELECT * FROM Classes ORDER BY class_id');
    
    console.log('\nCurrent Subjects:', subjects);
    console.log('Current Classes:', classes);
    
    // Step 1: Check OldTeachers structure and sync properly
    console.log('\n=== Checking OldTeachers structure ===');
    const [oldTeachersDesc] = await pool.query('DESCRIBE OldTeachers');
    console.log('OldTeachers columns:', oldTeachersDesc.map(col => col.Field));
    
    console.log('\n=== Syncing OldTeachers with Teachers ===');
    const [teachersData] = await pool.query('SELECT * FROM Teachers');
    
    for (const teacher of teachersData) {
      try {
        // Split the name into first and last name
        const nameParts = teacher.name.split(' ');
        const firstName = nameParts[0] || teacher.name;
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await pool.query(`
          INSERT INTO OldTeachers (teacher_id, first_name, last_name, username, password_hash)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          username = VALUES(username)
        `, [
          teacher.id,
          firstName,
          lastName,
          `teacher${teacher.id}`,
          'temppass123'
        ]);
        console.log(`✅ Synced teacher ${teacher.id}: ${teacher.name}`);
      } catch (teacherError) {
        console.log(`❌ Could not sync teacher ${teacher.id}:`, teacherError.message);
      }
    }
    
    // Step 2: Now try to update Classes
    console.log('\n=== Updating Classes to match Subjects ===');
    for (const subject of subjects) {
      const className = `${subject.code} - ${subject.name}`;
      
      // Check if class_id already exists
      const [existingClass] = await pool.query('SELECT * FROM Classes WHERE class_id = ?', [subject.id]);
      
      if (existingClass.length > 0) {
        // Update existing class
        try {
          await pool.query(`
            UPDATE Classes 
            SET class_name = ?, teacher_id = ?
            WHERE class_id = ?
          `, [className, subject.teacherId, subject.id]);
          console.log(`✅ Updated class ${subject.id}: ${className}`);
        } catch (updateError) {
          console.log(`❌ Could not update class ${subject.id}:`, updateError.message);
        }
      } else {
        // Insert new class
        try {
          await pool.query(`
            INSERT INTO Classes (class_id, class_name, teacher_id) 
            VALUES (?, ?, ?)
          `, [subject.id, className, subject.teacherId]);
          console.log(`✅ Created class ${subject.id}: ${className}`);
        } catch (insertError) {
          console.log(`❌ Could not create class ${subject.id}:`, insertError.message);
        }
      }
    }
    
    // Step 3: Test enrollment
    console.log('\n=== Testing enrollment with subject ID 3 ===');
    try {
      const [testResult] = await pool.query(
        'INSERT INTO Enrollments (student_id, class_id) VALUES (?, ?)',
        [1, 3] // Student 1, Subject/Class 3
      );
      console.log('✅ Test enrollment successful!', testResult.insertId);
      
      // Clean up test data
      await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [testResult.insertId]);
      console.log('🧹 Cleaned up test enrollment');
    } catch (enrollError) {
      console.log('❌ Test enrollment failed:', enrollError.message);
    }
    
    // Final status check
    const [finalClasses] = await pool.query('SELECT * FROM Classes ORDER BY class_id');
    console.log('\n=== Final Classes data ===');
    console.log('Classes:', finalClasses);
    
    const [finalOldTeachers] = await pool.query('SELECT * FROM OldTeachers ORDER BY teacher_id');
    console.log('\n=== Final OldTeachers data ===');
    console.log('OldTeachers:', finalOldTeachers);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
