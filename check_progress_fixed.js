import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProgressNotes() {
  try {
    console.log('=== CHECKING PROGRESS NOTES WITH SUBJECT_ID 10 ===');
    
    const [rows] = await pool.query(`
      SELECT p.id, p.student_id, p.subject_id, s.name as subject_name, p.note_date, p.content, p.performance_level
      FROM progress_notes p 
      LEFT JOIN subjects s ON p.subject_id = s.id 
      WHERE p.subject_id = 10
    `);
    
    console.log('Progress notes with subject_id 10 (Γενικό Μάθημα):');
    console.log(rows);
    
    if (rows.length > 0) {
      console.log('\n=== UPDATING PROGRESS NOTES ===');
      
      // Update progress notes to use subject_id = 1 (Μαθηματικά) instead of 10
      const [updateResult] = await pool.query(`
        UPDATE progress_notes 
        SET subject_id = 1 
        WHERE subject_id = 10
      `);
      
      console.log(`Updated ${updateResult.affectedRows} progress notes.`);
      
      // Verify the update
      const [verifyRows] = await pool.query(`
        SELECT p.id, p.student_id, p.subject_id, s.name as subject_name, p.note_date, p.content, p.performance_level
        FROM progress_notes p 
        LEFT JOIN subjects s ON p.subject_id = s.id 
        WHERE p.student_id IN (${rows.map(r => r.student_id).join(',')})
      `);
      
      console.log('\nVerification - Updated progress notes:');
      console.log(verifyRows);
    } else {
      console.log('No progress notes found with subject_id 10.');
      
      // Check all progress notes to see current state
      const [allRows] = await pool.query(`
        SELECT p.id, p.student_id, p.subject_id, s.name as subject_name, p.note_date, p.content, p.performance_level
        FROM progress_notes p 
        LEFT JOIN subjects s ON p.subject_id = s.id 
        ORDER BY p.note_date DESC
      `);
      
      console.log('\nAll progress notes:');
      console.log(allRows);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkProgressNotes();
