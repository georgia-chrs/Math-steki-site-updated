import { pool } from './db.js';

(async () => {
  try {
    console.log('🔧 Διόρθωση των υπολειπόμενων calendar entries με "Γενικό Μάθημα"...');
    
    // Ελέγχω πρώτα τι entries υπάρχουν με subject_id = 10
    const [currentEntries] = await pool.query(`
      SELECT c.id, c.title, c.subject_id, s.name as subject_name, c.created_at
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      WHERE c.subject_id = 10
      ORDER BY c.created_at DESC
    `);
    
    console.log('🔍 Βρέθηκαν οι παρακάτω entries με subject_id = 10:');
    currentEntries.forEach(entry => {
      console.log(`  - ID: ${entry.id}, Title: "${entry.title}", Subject: ${entry.subject_name}, Created: ${entry.created_at}`);
    });
    
    if (currentEntries.length === 0) {
      console.log('✅ Δεν υπάρχουν entries με subject_id = 10.');
      return;
    }
    
    // Ενημερώνω όλες τις entries με subject_id = 10 σε subject_id = 1 (Μαθηματικά)
    const [updateResult] = await pool.query(`
      UPDATE calendar_entries 
      SET subject_id = 1 
      WHERE subject_id = 10
    `);
    
    console.log(`✅ Ενημερώθηκαν ${updateResult.affectedRows} calendar entries από "Γενικό Μάθημα" σε "Μαθηματικά"`);
    
    // Επαλήθευση
    const [verifyEntries] = await pool.query(`
      SELECT c.id, c.title, c.subject_id, s.name as subject_name
      FROM calendar_entries c 
      LEFT JOIN subjects s ON c.subject_id = s.id 
      WHERE c.id IN (${currentEntries.map(e => e.id).join(',')})
      ORDER BY c.id
    `);
    
    console.log('\n📋 Επαλήθευση - Οι entries μετά την ενημέρωση:');
    verifyEntries.forEach(entry => {
      console.log(`  - ID: ${entry.id}, Title: "${entry.title}", Subject: ${entry.subject_name}`);
    });
    
    // Τελικός έλεγχος για entries με subject_id = 10
    const [remainingEntries] = await pool.query(`
      SELECT COUNT(*) as count FROM calendar_entries WHERE subject_id = 10
    `);
    
    if (remainingEntries[0].count === 0) {
      console.log('\n✅ Επιτυχία! Δεν υπάρχουν πλέον calendar entries με "Γενικό Μάθημα".');
    } else {
      console.log(`\n⚠️ Προσοχή! Υπάρχουν ακόμα ${remainingEntries[0].count} entries με subject_id = 10.`);
    }
    
  } catch (error) {
    console.error('❌ Σφάλμα:', error);
  } finally {
    process.exit();
  }
})();
