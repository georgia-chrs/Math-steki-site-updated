import dotenv from 'dotenv';
import { pool, updateStudent } from './db.js';

dotenv.config();

async function debugUpdateIssue() {
  try {
    console.log('=== DEBUGGING UPDATE ISSUE ===\n');
    
    // 1. Ελέγχουμε αν υπάρχει ο μαθητής
    console.log('1️⃣ Checking if student exists:');
    const [existingStudent] = await pool.execute('SELECT * FROM Students WHERE id = 2');
    console.log('Student exists:', existingStudent.length > 0);
    if (existingStudent.length > 0) {
      console.log('Student data:', existingStudent[0]);
    }
    
    // 2. Δοκιμάζουμε την updateStudent function
    console.log('\n2️⃣ Testing updateStudent function:');
    const updateData = { first_name: 'Debug Test' };
    console.log('Update data:', updateData);
    
    try {
      const result = await updateStudent(2, updateData);
      console.log('updateStudent result:', result);
      console.log('Result type:', typeof result);
    } catch (error) {
      console.error('updateStudent error:', error);
    }
    
    // 3. Ελέγχουμε αν έγινε το update
    console.log('\n3️⃣ Checking if update happened:');
    const [updatedStudent] = await pool.execute('SELECT * FROM Students WHERE id = 2');
    if (updatedStudent.length > 0) {
      console.log('Updated student data:', updatedStudent[0]);
    }
    
    // 4. Δοκιμάζουμε με διαφορετικά δεδομένα
    console.log('\n4️⃣ Testing with different data:');
    const updateData2 = { last_name: 'Debug Last Name' };
    console.log('Update data 2:', updateData2);
    
    try {
      const result2 = await updateStudent(2, updateData2);
      console.log('updateStudent result 2:', result2);
    } catch (error) {
      console.error('updateStudent error 2:', error);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugUpdateIssue();
