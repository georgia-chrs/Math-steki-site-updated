import dotenv from 'dotenv';
import { updateStudent } from './db.js';

dotenv.config();

async function testDirectEndpoint() {
  try {
    console.log('=== TESTING ENDPOINT DIRECTLY ===\n');
    
    // Test 1: Call updateStudent directly
    console.log('1️⃣ Testing updateStudent directly:');
    const testData = { first_name: 'Direct Test' };
    console.log('Test data:', testData);
    
    const result = await updateStudent(2, testData);
    console.log('Direct result:', result);
    console.log('Result type:', typeof result);
    console.log('Is truthy?', !!result);
    console.log('!result:', !result);
    
    // Test 2: Simulate the endpoint logic
    console.log('\n2️⃣ Simulating endpoint logic:');
    const success = await updateStudent(2, { first_name: 'Endpoint Simulation' });
    console.log('success:', success);
    console.log('typeof success:', typeof success);
    console.log('!success:', !success);
    
    if (!success) {
      console.log('❌ Would return "Student not found"');
    } else {
      console.log('✅ Would return success');
    }
    
    // Test 3: Check if the function is actually being called
    console.log('\n3️⃣ Testing with non-existent student:');
    const nonExistentResult = await updateStudent(999, { first_name: 'Non-existent' });
    console.log('Non-existent result:', nonExistentResult);
    console.log('Non-existent type:', typeof nonExistentResult);
    console.log('!nonExistentResult:', !nonExistentResult);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testDirectEndpoint();
