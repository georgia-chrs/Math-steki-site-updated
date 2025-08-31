import dotenv from 'dotenv';
import { updateStudent } from './db.js';

dotenv.config();

async function testUpdateStudent() {
  try {
    console.log('=== TESTING updateStudent FUNCTION ===\n');
    
    const testData = {
      first_name: "Test Update",
      last_name: "Original Last Name"
    };
    
    console.log('🔄 Testing updateStudent with ID 2 and data:', testData);
    
    const result = await updateStudent(2, testData);
    
    console.log('📊 updateStudent result:', result);
    console.log('📊 Result type:', typeof result);
    
    if (result) {
      console.log('✅ updateStudent returned true - success');
    } else {
      console.log('❌ updateStudent returned false - student not found or update failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing updateStudent:', error);
  } finally {
    process.exit(0);
  }
}

testUpdateStudent();
