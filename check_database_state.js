import { pool } from './db.js';

(async () => {
  try {
    // Check all subjects
    const [subjects] = await pool.query('SELECT * FROM subjects ORDER BY id');
    console.log('=== ALL SUBJECTS ===');
    subjects.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}`));
    
    console.log('\n=== CALENDAR ENTRIES WITH SUBJECTS ===');
    const [calendar] = await pool.query(`
      SELECT c.*, s.name as subject_name 
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      ORDER BY c.created_at DESC 
      LIMIT 20
    `);
    
    calendar.forEach(row => {
      console.log(`Title: "${row.title}", Subject ID: ${row.subject_id}, Subject: ${row.subject_name || 'NULL'}, Date: ${row.event_date}`);
    });

    console.log('\n=== CHECKING FOR ΓΡΑΜΜΙΚΗ ENTRIES ===');
    const [linearEntries] = await pool.query(`
      SELECT c.*, s.name as subject_name 
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      WHERE c.title LIKE '%γραμμικ%' OR c.title LIKE '%Γραμμικ%' OR c.title LIKE '%Linear%'
      ORDER BY c.created_at DESC
    `);
    
    if (linearEntries.length > 0) {
      console.log('Found entries that might belong to Linear Algebra:');
      linearEntries.forEach(row => {
        console.log(`  - Title: "${row.title}", Subject ID: ${row.subject_id}, Subject: ${row.subject_name || 'NULL'}, Date: ${row.event_date}`);
      });
    } else {
      console.log('No calendar entries found with "γραμμικ" or "Linear" in title');
    }

    console.log('\n=== ENTRIES WITH SUBJECT_ID = 10 ===');
    const [id10Entries] = await pool.query(`
      SELECT c.*, s.name as subject_name 
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      WHERE c.subject_id = 10
      ORDER BY c.created_at DESC
    `);
    
    if (id10Entries.length > 0) {
      console.log('Found entries with subject_id = 10:');
      id10Entries.forEach(row => {
        console.log(`  - Title: "${row.title}", Subject: ${row.subject_name || 'NULL'}, Date: ${row.event_date}`);
      });
    } else {
      console.log('No calendar entries found with subject_id = 10');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
