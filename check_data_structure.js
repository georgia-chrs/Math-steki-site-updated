import dotenv from 'dotenv';
import { getAllSubjects, getAllTeachers, getAllEnrollments, getAllStudents } from './db.js';

dotenv.config();

async function checkDataStructure() {
  try {
    console.log('=== CHECKING DATA STRUCTURE ===\n');
    
    console.log('📋 SUBJECTS (τμήματα/classes):');
    const subjects = await getAllSubjects();
    console.log('Sample subjects:', subjects.slice(0, 2));
    
    console.log('\n📋 TEACHERS (καθηγητές):');
    const teachers = await getAllTeachers();
    console.log('Sample teachers:', teachers.slice(0, 2));
    
    console.log('\n📋 ENROLLMENTS (εγγραφές):');
    const enrollments = await getAllEnrollments();
    console.log('Sample enrollments:', enrollments.slice(0, 3));
    
    console.log('\n📋 STUDENTS (μαθητές):');
    const students = await getAllStudents();
    console.log('Sample students:', students.slice(0, 2));
    
    console.log('\n=== RELATIONSHIP ANALYSIS ===');
    
    // Αναλύουμε τη σχέση μεταξύ Subjects και Teachers
    if (subjects.length > 0 && teachers.length > 0) {
      console.log('\n🔍 Subject structure:', Object.keys(subjects[0]));
      console.log('🔍 Teacher structure:', Object.keys(teachers[0]));
    }
    
    if (enrollments.length > 0) {
      console.log('🔍 Enrollment structure:', Object.keys(enrollments[0]));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkDataStructure();
