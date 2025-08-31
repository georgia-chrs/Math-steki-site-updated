const mysql = require('mysql2/promise');

async function updateCalendarEntry() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'school_db'
    });
    
    // Ενημέρωση του calendar entry για τον μαθητή 8
    // Αλλάζω το subject_id από 10 (Γενικό Μάθημα) σε 1 (Μαθηματικά)
    const [result] = await connection.execute(
      'UPDATE calendar_entries SET subject_id = ? WHERE id = ? AND student_id = ?',
      [1, 8, 8] // subject_id = 1 (Μαθηματικά), calendar entry id = 8, student_id = 8
    );
    
    console.log('✅ Calendar entry updated:', result.affectedRows, 'row(s)');
    
    // Επαλήθευση της αλλαγής
    const [updated] = await connection.execute(
      `SELECT c.*, s.name as subject_name, st.class as student_class 
       FROM calendar_entries c 
       LEFT JOIN subjects s ON c.subject_id = s.id 
       LEFT JOIN Students st ON c.student_id = st.id
       WHERE c.id = 8 AND c.student_id = 8`
    );
    
    console.log('📋 Updated calendar entry:');
    console.table(updated);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateCalendarEntry();
