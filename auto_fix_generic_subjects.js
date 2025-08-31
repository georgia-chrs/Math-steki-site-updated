import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

// Function to automatically fix any new "Γενικό Μάθημα" entries
async function autoFixGenericSubjects() {
  try {
    console.log('🔍 Auto-checking for "Γενικό Μάθημα" entries...');
    
    // Check and fix grades (only if subject name is "Γενικό Μάθημα")
    const [gradeResults] = await pool.query(`
      UPDATE grades g
      JOIN subjects s ON g.subject_id = s.id
      SET g.subject_id = 1 
      WHERE s.name = 'Γενικό Μάθημα'
    `);
    
    // Check and fix progress notes (only if subject name is "Γενικό Μάθημα")
    const [progressResults] = await pool.query(`
      UPDATE progress_notes p
      JOIN subjects s ON p.subject_id = s.id
      SET p.subject_id = 1 
      WHERE s.name = 'Γενικό Μάθημα'
    `);
    
    // Check and fix calendar entries (only if subject name is "Γενικό Μάθημα")
    const [calendarResults] = await pool.query(`
      UPDATE calendar_entries c
      JOIN subjects s ON c.subject_id = s.id
      SET c.subject_id = 1 
      WHERE s.name = 'Γενικό Μάθημα'
    `);
    
    const totalFixed = gradeResults.affectedRows + progressResults.affectedRows + calendarResults.affectedRows;
    
    if (totalFixed > 0) {
      console.log(`✅ Auto-fixed ${totalFixed} records:`);
      console.log(`   - Grades: ${gradeResults.affectedRows}`);
      console.log(`   - Progress Notes: ${progressResults.affectedRows}`);
      console.log(`   - Calendar Entries: ${calendarResults.affectedRows}`);
    } else {
      console.log('✨ No "Γενικό Μάθημα" entries found - all clean!');
    }
    
    return totalFixed;
    
  } catch (error) {
    console.error('❌ Error during auto-fix:', error);
    return 0;
  }
}

// Run the auto-fix
autoFixGenericSubjects()
  .then(fixedCount => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
