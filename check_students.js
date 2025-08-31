import { getStudents } from './db.js';

async function checkStudents() {
  try {
    const students = await getStudents();
    console.log('Number of students:', students.length);
    if (students.length > 0) {
      console.log('First student structure:', JSON.stringify(students[0], null, 2));
      console.log('All students:');
      students.forEach((student, index) => {
        console.log(`Student ${index + 1}:`, {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentClass: student.studentClass,
          phone: student.phone
        });
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkStudents();
