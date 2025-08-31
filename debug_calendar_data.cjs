const mysql = require('mysql2/promise');

async function debugCalendar() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'school_db'
    });
    
    console.log('=== Calendar entries for student 8 ===');
    const [calendar] = await connection.execute(
      `SELECT c.*, s.name as subject_name, st.class as student_class 
       FROM calendar_entries c 
       LEFT JOIN subjects s ON c.subject_id = s.id 
       LEFT JOIN Students st ON c.student_id = st.id
       WHERE c.student_id = 8 
       ORDER BY c.entry_date DESC`
    );
    console.table(calendar);
    
    console.log('\n=== All subjects ===');
    const [subjects] = await connection.execute('SELECT * FROM subjects');
    console.table(subjects);
    
    console.log('\n=== Calendar entries raw ===');
    const [calendarRaw] = await connection.execute('SELECT * FROM calendar_entries WHERE student_id = 8');
    console.table(calendarRaw);
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugCalendar();
