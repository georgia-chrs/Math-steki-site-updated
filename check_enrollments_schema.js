import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

async function checkEnrollmentsSchema() {
  try {
    console.log('=== ΕΛΕΓΧΟΣ ΔΟΜΗΣ ΠΙΝΑΚΑ ENROLLMENTS ===\n');
    
    // Ελέγχουμε τη δομή του πίνακα Enrollments
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'math_steki' AND TABLE_NAME = 'Enrollments'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Στήλες του πίνακα Enrollments:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    console.log('\n=== ΔΕΙΓΜΑ ΔΕΔΟΜΕΝΩΝ ===');
    const [enrollments] = await pool.execute('SELECT * FROM Enrollments LIMIT 5');
    console.log('Enrollments δεδομένα:', enrollments);
    
    console.log('\n=== ΕΛΕΓΧΟΣ CLASSES ΠΙΝΑΚΑ ===');
    const [classesColumns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'math_steki' AND TABLE_NAME = 'Classes'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Στήλες του πίνακα Classes:');
    classesColumns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    const [classes] = await pool.execute('SELECT * FROM Classes LIMIT 5');
    console.log('Classes δεδομένα:', classes);
    
  } catch (error) {
    console.error('❌ Σφάλμα:', error);
  } finally {
    process.exit(0);
  }
}

checkEnrollmentsSchema();
