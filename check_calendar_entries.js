import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCalendarEntries() {
  try {
    console.log('=== CHECKING CALENDAR ENTRIES WITH SUBJECT_ID 10 ===');
    
    const [rows] = await pool.query(`
      SELECT c.id, c.student_id, c.subject_id, s.name as subject_name, c.entry_date, c.event_type, c.title, c.description
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      WHERE c.subject_id = 10
      ORDER BY c.entry_date DESC
    `);
    
    console.log('Calendar entries with subject_id 10 (Γενικό Μάθημα):');
    console.log(rows);
    
    if (rows.length > 0) {
      console.log('\n=== UPDATING CALENDAR ENTRIES ===');
      
      // Update calendar entries to use subject_id = 1 (Μαθηματικά) instead of 10
      const [updateResult] = await pool.query(`
        UPDATE calendar_entries 
        SET subject_id = 1 
        WHERE subject_id = 10
      `);
      
      console.log(`Updated ${updateResult.affectedRows} calendar entries.`);
      
      // Verify the update
      const [verifyRows] = await pool.query(`
        SELECT c.id, c.student_id, c.subject_id, s.name as subject_name, c.entry_date, c.event_type, c.title, c.description
        FROM calendar_entries c 
        LEFT JOIN subjects s ON c.subject_id = s.id 
        WHERE c.student_id IN (${rows.map(r => r.student_id).join(',')})
        ORDER BY c.entry_date DESC
      `);
      
      console.log('\nVerification - Updated calendar entries:');
      console.log(verifyRows);
    } else {
      console.log('No calendar entries found with subject_id 10.');
      
      // Check all calendar entries to see current state
      const [allRows] = await pool.query(`
        SELECT c.id, c.student_id, c.subject_id, s.name as subject_name, c.entry_date, c.event_type, c.title, c.description
        FROM calendar_entries c 
        LEFT JOIN subjects s ON c.subject_id = s.id 
        ORDER BY c.entry_date DESC
        LIMIT 10
      `);
      
      console.log('\nRecent calendar entries:');
      console.log(allRows);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCalendarEntries();
