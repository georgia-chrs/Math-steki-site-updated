import dotenv from 'dotenv';
import { getStudentByUsername, getEnrollmentsByStudent } from './db.js';

dotenv.config();

async function debugStudentProfiles() {
  try {
    console.log('=== DEBUG STUDENT PROFILES ===\n');
    
    const usernames = ['mariaio', 'giannisp', 'kostasd'];
    
    for (const username of usernames) {
      console.log(`🔍 Testing username: ${username}`);
      console.log('='.repeat(50));
      
      // Get student by username
      const student = await getStudentByUsername(username);
      console.log('Student from getStudentByUsername:', {
        id: student?.id,
        username: student?.username,
        first_name: student?.first_name,
        last_name: student?.last_name,
        class: student?.class
      });
      
      if (student) {
        // Get enrollments
        const enrollments = await getEnrollmentsByStudent(student.id);
        console.log(`Enrollments for student ID ${student.id}:`, enrollments.map(e => ({
          enrollment_id: e.enrollment_id,
          class_name: e.class_name,
          teacher_name: e.teacher_name
        })));
        
        // Combined profile
        const profile = {
          ...student,
          enrollments: enrollments
        };
        
        console.log('Final profile preview:', {
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          enrollments_count: profile.enrollments.length
        });
      }
      
      console.log('\n');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugStudentProfiles();
