import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function restoreLinearAlgebraEntries() {
  try {
    console.log('🔄 Restoring specific entries to "Γραμμική" subject...');
    
    // Update the recent suspicious entries back to subject_id = 10 (Γραμμική)
    // Based on the analysis, these seem to be the ones that were incorrectly changed
    const entriesToRestore = [13, 14, 15]; // The most recent entries that are likely "Γραμμική"
    
    if (entriesToRestore.length > 0) {
      const placeholders = entriesToRestore.map(() => '?').join(',');
      const [result] = await pool.query(`
        UPDATE calendar_entries 
        SET subject_id = 10 
        WHERE id IN (${placeholders})
      `, entriesToRestore);
      
      console.log(`✅ Restored ${result.affectedRows} calendar entries to "Γραμμική"`);
      
      // Verify the changes
      const [verifyRows] = await pool.query(`
        SELECT c.id, c.title, c.description, c.entry_date, s.name as subject_name
        FROM calendar_entries c 
        LEFT JOIN subjects s ON c.subject_id = s.id 
        WHERE c.id IN (${placeholders})
        ORDER BY c.id DESC
      `, entriesToRestore);
      
      console.log('\nVerification - Restored entries:');
      verifyRows.forEach(row => {
        console.log(`  ID: ${row.id}, Title: "${row.title}", Subject: ${row.subject_name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

restoreLinearAlgebraEntries();
