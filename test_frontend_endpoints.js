import fetch from 'node-fetch';

async function testFrontendEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Frontend Endpoints...');
  
  try {
    // Test 1: Get student profile
    console.log('\n1. Testing student profile endpoint...');
    const profileResponse = await fetch(`${baseUrl}/api/student/profile/student1`);
    console.log('Status:', profileResponse.status);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile data:', {
        id: profileData.id,
        username: profileData.username,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        enrollments_count: profileData.enrollments?.length || 0
      });
      
      if (profileData.id) {
        const studentId = profileData.id;
        
        // Test 2: Get grades
        console.log('\n2. Testing grades endpoint...');
        const gradesResponse = await fetch(`${baseUrl}/api/grades/${studentId}`);
        console.log('Grades Status:', gradesResponse.status);
        
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          console.log('✅ Grades count:', gradesData.length);
          if (gradesData.length > 0) {
            console.log('Sample grade:', {
              subject_name: gradesData[0].subject_name,
              grade: gradesData[0].grade,
              exam_type: gradesData[0].exam_type,
              grade_date: gradesData[0].grade_date
            });
          }
        } else {
          console.log('❌ Grades fetch failed');
        }
        
        // Test 3: Get progress notes
        console.log('\n3. Testing progress endpoint...');
        const progressResponse = await fetch(`${baseUrl}/api/progress/${studentId}`);
        console.log('Progress Status:', progressResponse.status);
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('✅ Progress notes count:', progressData.length);
          if (progressData.length > 0) {
            console.log('Sample progress note:', {
              subject_name: progressData[0].subject_name,
              content: progressData[0].content.substring(0, 50) + '...',
              performance_level: progressData[0].performance_level,
              note_date: progressData[0].note_date
            });
          }
        } else {
          console.log('❌ Progress fetch failed');
        }
        
        // Test 4: Get calendar entries
        console.log('\n4. Testing calendar endpoint...');
        const calendarResponse = await fetch(`${baseUrl}/api/calendar/${studentId}`);
        console.log('Calendar Status:', calendarResponse.status);
        
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          console.log('✅ Calendar entries count:', calendarData.length);
          if (calendarData.length > 0) {
            console.log('Sample calendar entry:', {
              title: calendarData[0].title,
              entry_date: calendarData[0].entry_date,
              entry_type: calendarData[0].entry_type,
              subject_name: calendarData[0].subject_name
            });
          }
        } else {
          console.log('❌ Calendar fetch failed');
        }
      }
    } else {
      console.log('❌ Profile fetch failed');
    }
    
  } catch (error) {
    console.error('🚨 Error during testing:', error.message);
  }
}

// Run the test
testFrontendEndpoints();
