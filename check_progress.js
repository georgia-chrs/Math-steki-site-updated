import { pool } from './db.js';

(async () => {
  try {
    console.log('=== CHECKING PROGRESS NOTES WITH SUBJECT_ID 10 ===');
    
    // Check progress_notes with subject_id = 10
    const [progressNotes] = await pool.query(`
      SELECT p.id, p.student_id, p.subject_id, s.name as subject_name, p.note_date, p.content, p.rating
      FROM progress_notes p 
      LEFT JOIN subjects s ON p.subject_id = s.id 
      WHERE p.subject_id = 10
    `);
    
    console.log('Progress notes with subject_id = 10 (Γενικό Μάθημα):');
    console.log(progressNotes);
    
    if (progressNotes.length > 0) {
      console.log('\n=== UPDATING PROGRESS NOTES TO USE SUBJECT_ID 1 (Μαθηματικά) ===');
      
      // Update progress notes to use subject_id = 1 (Μαθηματικά)
      const [updateResult] = await pool.query(`
        UPDATE progress_notes 
        SET subject_id = 1 
        WHERE subject_id = 10
      `);
      
      console.log(`Updated ${updateResult.affectedRows} progress notes from subject_id 10 to 1`);
      
      // Verify the changes
      const [updatedNotes] = await pool.query(`
        SELECT p.id, p.student_id, p.subject_id, s.name as subject_name, p.note_date, p.content, p.rating
        FROM progress_notes p 
        LEFT JOIN subjects s ON p.subject_id = s.id 
        WHERE p.student_id IN (SELECT student_id FROM progress_notes WHERE id IN (${progressNotes.map(n => n.id).join(',')}))
      `);
      
      console.log('\nUpdated progress notes:');
      console.log(updatedNotes);
    } else {
      console.log('No progress notes found with subject_id = 10');
    }
    
    // Check all progress notes to see their subject distribution
    console.log('\n=== ALL PROGRESS NOTES DISTRIBUTION BY SUBJECT ===');
    const [distribution] = await pool.query(`
      SELECT p.subject_id, s.name as subject_name, COUNT(*) as count
      FROM progress_notes p 
      LEFT JOIN subjects s ON p.subject_id = s.id 
      GROUP BY p.subject_id, s.name
      ORDER BY p.subject_id
    `);
    
    console.log('Progress notes distribution by subject:');
    console.log(distribution);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
})();
