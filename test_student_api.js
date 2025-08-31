import dotenv from 'dotenv';
dotenv.config();

import { getStudentByUsername, getEnrollmentsByStudent } from './db.js';

async function testStudentAPI() {
  console.log('=== ΤΕΣΤ STUDENT API ===\n');
  
  const usernames = ['mariaio', 'giannisp', 'kostasd'];
  
  for (const username of usernames) {
    console.log(`🔍 Τεστ για χρήστη: ${username}`);
    console.log('=' .repeat(50));
    
    try {
      // Παίρνουμε τα βασικά στοιχεία του μαθητή
      const student = await getStudentByUsername(username);
      console.log('📋 Στοιχεία μαθητή:', {
        id: student?.id,
        username: student?.username,
        first_name: student?.first_name,
        last_name: student?.last_name,
        class: student?.class
      });
      
      if (!student) {
        console.log(`❌ Μαθητής ${username} δεν βρέθηκε\n`);
        continue;
      }
      
      // Παίρνουμε τις εγγραφές του μαθητή
      const enrollments = await getEnrollmentsByStudent(student.id);
      console.log(`📚 Εγγραφές σε μαθήματα (${enrollments.length}):`);
      
      if (enrollments.length === 0) {
        console.log('   Δεν υπάρχουν εγγραφές σε μαθήματα');
      } else {
        enrollments.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ${enrollment.subject_name} - ${enrollment.teacher_name || 'Χωρίς καθηγητή'}`);
          console.log(`      Enrollment ID: ${enrollment.enrollment_id}, Class ID: ${enrollment.class_id}`);
          console.log(`      Status: ${enrollment.status || 'N/A'}, Date: ${enrollment.enrollment_date || 'N/A'}`);
        });
      }
      
      // Προσομοίωση του API response
      const studentProfile = {
        ...student,
        enrollments: enrollments
      };
      
      console.log(`✅ Profile για ${username} έτοιμο με ${enrollments.length} μαθήματα\n`);
      
    } catch (error) {
      console.error(`❌ Σφάλμα για χρήστη ${username}:`, error.message);
      console.log('');
    }
  }
}

testStudentAPI().catch(console.error);
