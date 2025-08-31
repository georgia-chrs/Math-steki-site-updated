import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixAllGenericSubjects() {
  try {
    console.log('=== COMPREHENSIVE FIX FOR GENERIC SUBJECTS ===');
    
    // Check all tables for subject_id = 10
    console.log('\n1. CHECKING GRADES...');
    const [grades] = await pool.query(`
      SELECT g.id, g.student_id, g.subject_id, s.name as subject_name, g.exam_date, g.grade
      FROM grades g 
      LEFT JOIN subjects s ON g.subject_id = s.id 
      WHERE g.subject_id = 10
    `);
    console.log(`Found ${grades.length} grades with "Γενικό Μάθημα"`);
    
    console.log('\n2. CHECKING PROGRESS NOTES...');
    const [progress] = await pool.query(`
      SELECT p.id, p.student_id, p.subject_id, s.name as subject_name, p.note_date
      FROM progress_notes p 
      LEFT JOIN subjects s ON p.subject_id = s.id 
      WHERE p.subject_id = 10
    `);
    console.log(`Found ${progress.length} progress notes with "Γενικό Μάθημα"`);
    
    console.log('\n3. CHECKING CALENDAR ENTRIES...');
    const [calendar] = await pool.query(`
      SELECT c.id, c.student_id, c.subject_id, s.name as subject_name, c.entry_date, c.title
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      WHERE c.subject_id = 10
    `);
    console.log(`Found ${calendar.length} calendar entries with "Γενικό Μάθημα"`);
    
    // Show all records found
    if (grades.length > 0) {
      console.log('\nGrades with Γενικό Μάθημα:');
      grades.forEach(g => console.log(`  ID: ${g.id}, Student: ${g.student_id}, Date: ${g.exam_date}, Grade: ${g.grade}`));
    }
    
    if (progress.length > 0) {
      console.log('\nProgress notes with Γενικό Μάθημα:');
      progress.forEach(p => console.log(`  ID: ${p.id}, Student: ${p.student_id}, Date: ${p.note_date}`));
    }
    
    if (calendar.length > 0) {
      console.log('\nCalendar entries with Γενικό Μάθημα:');
      calendar.forEach(c => console.log(`  ID: ${c.id}, Student: ${c.student_id}, Date: ${c.entry_date}, Title: ${c.title}`));
    }
    
    // Update all records to use subject_id = 1 (Μαθηματικά)
    console.log('\n=== UPDATING ALL RECORDS ===');
    
    if (grades.length > 0) {
      const [gradeUpdate] = await pool.query(`UPDATE grades SET subject_id = 1 WHERE subject_id = 10`);
      console.log(`✅ Updated ${gradeUpdate.affectedRows} grades`);
    }
    
    if (progress.length > 0) {
      const [progressUpdate] = await pool.query(`UPDATE progress_notes SET subject_id = 1 WHERE subject_id = 10`);
      console.log(`✅ Updated ${progressUpdate.affectedRows} progress notes`);
    }
    
    if (calendar.length > 0) {
      const [calendarUpdate] = await pool.query(`UPDATE calendar_entries SET subject_id = 1 WHERE subject_id = 10`);
      console.log(`✅ Updated ${calendarUpdate.affectedRows} calendar entries`);
    }
    
    // Verification
    console.log('\n=== VERIFICATION ===');
    const [verify] = await pool.query(`
      SELECT 'grades' as table_name, COUNT(*) as count FROM grades WHERE subject_id = 10
      UNION ALL
      SELECT 'progress_notes' as table_name, COUNT(*) as count FROM progress_notes WHERE subject_id = 10
      UNION ALL  
      SELECT 'calendar_entries' as table_name, COUNT(*) as count FROM calendar_entries WHERE subject_id = 10
    `);
    
    console.log('Records still using subject_id = 10:');
    verify.forEach(v => console.log(`  ${v.table_name}: ${v.count}`));
    
    console.log('\n✅ ALL GENERIC SUBJECTS FIXED!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixAllGenericSubjects();
