import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

async function debugTables() {
  try {
    console.log('=== DEBUG JOIN PROBLEM ===\n');
    
    // Πρώτα δες τα enrollments
    console.log('📋 ENROLLMENTS:');
    const [enrollments] = await pool.execute('SELECT * FROM Enrollments WHERE student_id = 1');
    console.log(enrollments);
    
    console.log('\n📋 CLASSES:');
    const [classes] = await pool.execute('SELECT * FROM Classes');
    console.log(classes);
    
    console.log('\n📋 TEACHERS:');
    const [teachers] = await pool.execute('SELECT * FROM Teachers');
    console.log(teachers);
    
    console.log('\n📋 MANUAL JOIN TEST:');
    const [joinTest] = await pool.execute(`
      SELECT e.enrollment_id,
             e.student_id,
             e.class_id,
             c.class_id as c_class_id,
             c.class_name,
             c.teacher_id,
             t.id as teacher_id,
             t.name as teacher_name
      FROM Enrollments e
      LEFT JOIN Classes c ON e.class_id = c.class_id
      LEFT JOIN Teachers t ON c.teacher_id = t.id
      WHERE e.student_id = 1
    `);
    console.log('Manual JOIN result:', joinTest);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugTables();
