import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

async function debugStudent2() {
  try {
    console.log('=== DEBUG STUDENT ID 2 ===\n');
    
    // Ελέγχουμε αν υπάρχει στον Students πίνακα
    console.log('📋 Checking Students table:');
    const [students] = await pool.execute('SELECT * FROM Students WHERE id = 2');
    console.log('Students result:', students);
    
    // Ελέγχουμε όλους τους Students
    console.log('\n📋 All Students:');
    const [allStudents] = await pool.execute('SELECT id, first_name, last_name, username FROM Students');
    console.log('All students:', allStudents);
    
    // Δοκιμάζουμε ένα απλό UPDATE
    console.log('\n🔄 Testing UPDATE:');
    const [updateResult] = await pool.execute(
      'UPDATE Students SET notes = ? WHERE id = ?',
      ['Test update from debug', 2]
    );
    console.log('Update result:', updateResult);
    
    if (updateResult.affectedRows === 0) {
      console.log('❌ No rows affected - student with ID 2 does not exist');
    } else {
      console.log('✅ Update successful');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugStudent2();
