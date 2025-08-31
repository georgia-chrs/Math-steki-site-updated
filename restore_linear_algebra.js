import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function restoreLinearAlgebraRecords() {
  try {
    console.log('🔄 Restoring "Γραμμική" (Linear Algebra) records...');
    
    // First, let's see what records were created today that might be "Γραμμική" wrongly converted to "Μαθηματικά"
    console.log('\n1. Checking recent calendar entries that might be "Γραμμική"...');
    const [recentCalendar] = await pool.query(`
      SELECT c.id, c.title, c.description, c.entry_date, c.student_id, c.subject_id, s.name as current_subject
      FROM calendar_entries c
      JOIN subjects s ON c.subject_id = s.id
      WHERE DATE(c.created_at) = CURDATE() 
      AND c.subject_id = 1
      ORDER BY c.created_at DESC
    `);
    
    console.log('Recent calendar entries (today) using subject_id=1:');
    recentCalendar.forEach(entry => {
      console.log(`  ID: ${entry.id}, Title: "${entry.title}", Description: "${entry.description}", Subject: ${entry.current_subject}`);
    });
    
    // Based on the titles mentioned ("ananananκκκ", "meeting"), let's find those specific entries
    const [suspiciousEntries] = await pool.query(`
      SELECT c.id, c.title, c.description, c.entry_date, c.student_id, c.subject_id, s.name as current_subject
      FROM calendar_entries c
      JOIN subjects s ON c.subject_id = s.id
      WHERE (c.title LIKE '%ananananκκκ%' OR c.title LIKE '%meeting%' OR c.title LIKE '%Αναπληρωση%')
      AND c.subject_id = 1
    `);
    
    console.log('\nSuspicious entries that might need to be changed to "Γραμμική":');
    suspiciousEntries.forEach(entry => {
      console.log(`  ID: ${entry.id}, Title: "${entry.title}", Student: ${entry.student_id}`);
    });
    
    // For now, let's not auto-change anything. Let's just report what we found.
    console.log('\n⚠️  Manual intervention needed:');
    console.log('   - Found entries that might belong to "Γραμμική" subject');
    console.log('   - These were incorrectly changed from subject_id=10 to subject_id=1');
    console.log('   - Admin should verify which entries should be "Γραμμική" vs "Μαθηματικά"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

restoreLinearAlgebraRecords();
