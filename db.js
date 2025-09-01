// db.js
import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});
export default pool;

if (process.env.DB_HOST) {
  console.log("✅ PostgreSQL pool created");
} else {
  console.log("⚠️ No DB config, running in NO-DB mode");
}
if (!pool) {
  throw new Error("Database not connected");
}
// ---------- ΜΑΘΗΤΕΣ ----------
export async function getStudents() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, name: "Test Students" }];
  }
  const res = await pool.query('SELECT * FROM students');
  return res.rows;
}
export async function getStudent(id) {
   if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, name: "Test Students" }];
  }
  const res = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return res.rows[0];
}

export async function createStudent(first_name, last_name, father_name, username, password_hash) {
   if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, name: "Test Students" }];
  }
  const res = await pool.query(
        `INSERT INTO students (first_name, last_name, father_name, username, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [first_name, last_name, father_name, username, password_hash]
    );
    return getStudent(res.rows[0].id);
}

export async function deleteStudent(id) {
   if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, name: "Test Students" }];
  }
  const res = await pool.query(
    "DELETE FROM students WHERE id = $1 RETURNING id",
    [id]
  );
  return res.rowCount > 0;
}



// ---------- ΚΑΘΗΓΗΤΕΣ (αν χρειαστεί) ----------
export async function getTeachers() {
   if (!pool) {
     console.log("⚠️ No DB connection, returning dummy data");
     return [{ id: 1, name: "Test Teacher" }];
   }
  const res = await pool.query("SELECT * FROM teachers");
  return res.rows;
}

export async function getUserByUsername(username) {
  console.log(`🔍 Ψάχνω για χρήστη: "${username}"`);
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, name: "Test Students" }];
  }
  // Ψάχνει πρώτα στους Admins
  const resAdmin = await pool.query("SELECT *, 'admin' as role FROM admins WHERE username = $1", [username]);
  const adminRows = resAdmin.rows;
  console.log(`📋 Admins rows found: ${adminRows.length}`);
  if (adminRows.length > 0) {
    console.log(`✅ Βρέθηκε admin: ${adminRows[0].username}`);
    return adminRows[0];
  }
  // Μετά στους Students
  const resStudent = await pool.query("SELECT *, 'student' as role FROM students WHERE username = $1", [username]);
  const studentRows = resStudent.rows;
  console.log(`📋 Students rows found: ${studentRows.length}`);
  if (studentRows.length > 0) {
    console.log(`✅ Βρέθηκε student: ${studentRows[0].username}`);
    return studentRows[0];
  }
  console.log(`❌ Δεν βρέθηκε χρήστης: "${username}"`);
  return null;
}

export async function getProgressNotes(student_id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, student_id, subject_id: 1, note_date: new Date(), content: "Test Note", performance_level: "good", created_at: new Date() }];
  }
  const res = await pool.query(
    `SELECT p.id, p.student_id, p.subject_id, p.note_date, p.content, p.performance_level, p.created_at,
            s.name AS subject_name
     FROM progress_notes p
     LEFT JOIN subjects s ON p.subject_id = s.id
     WHERE p.student_id = $1 ORDER BY p.created_at DESC`,
    [student_id]
  );
  return res.rows;
}
// Κάλεσε τη συνάρτηση με το id του μαθητή (π.χ. 1)


export async function getGradesByStudent(student_id) {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, student_id, subject_id: 1, exam_type: "midterm", grade: 85, exam_date: new Date(), notes: "Good job", created_at: new Date() }];
  }
  const res = await pool.query(
    `SELECT g.id, g.student_id, g.subject_id, g.exam_type, g.grade, g.exam_date, g.notes, g.created_at,
            s.name as subject_name, s.code as subject_code
     FROM grades g
     LEFT JOIN subjects s ON g.subject_id = s.id
     WHERE g.student_id = $1
     ORDER BY g.exam_date DESC`,
    [student_id]
  );
  return res.rows;
}


// ---------- ΑΝΑΚΟΙΝΩΣΕΙΣ ΜΕ ΦΙΛΤΡΑΡΙΣΜΑ ----------

// Επιστροφή όλων των ανακοινώσεων (για admin)
export async function getAnnouncements() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, title: "Test Announcement", content: "This is a test announcement." }];
  }
  const res = await pool.query(
    `SELECT 
      notification_id, title, content, notification_type, target_class, target_subject_id,
      start_date, end_date, priority, is_active, pdf_attachment, external_link,
      created_at, updated_at
    FROM notifications 
    WHERE is_active = TRUE
    ORDER BY priority DESC, created_at DESC`
  );
  return res.rows;
}

// Επιστροφή ανακοινώσεων για συγκεκριμένο μαθητή (φιλτράρισμα)
export async function getAnnouncementsForStudent(studentId) {
  try {
    // Επιστρέφουμε όλες τις ενεργές ανακοινώσεις (απλό σύστημα)

   if (!pool) {
     console.log("⚠️ No DB connection, returning dummy data");
     return [{ id: 1, title: "Test Announcement", content: "This is a test announcement." }];
   }
    const res = await pool.query(
      `SELECT 
        notification_id, title, content, created_at, updated_at,
        pdf_attachment, external_link, priority
      FROM notifications 
      WHERE is_active = TRUE
      ORDER BY created_at DESC`
    );
    return res.rows;
  } catch (error) {
    console.error('Error in getAnnouncementsForStudent:', error);
    throw error;
  }
}

// Δημιουργία νέας ανακοίνωσης με φιλτράρισμα
export async function createAnnouncement(title, content, admin_id = 1) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id: 1, title, content, created_by: admin_id, is_active: true };
  }
  const res = await pool.query(
    `INSERT INTO notifications (title, content, created_by, is_active) 
     VALUES ($1, $2, $3, TRUE) RETURNING notification_id`,
    [title, content, admin_id]
  );
  return res.rows[0].notification_id;
}

// Ενημέρωση ανακοίνωσης
export async function updateAnnouncement(id, title, content, type = 'general', targetClass = null, targetSubjectId = null, startDate = null, endDate = null, priority = 'normal', pdfAttachment = null, externalLink = null) {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title, content, notification_type: type, target_class: targetClass, target_subject_id: targetSubjectId, start_date: startDate, end_date: endDate, priority, pdf_attachment: pdfAttachment, external_link: externalLink };
  }

  await pool.query(
    `UPDATE notifications SET 
      title = $1, content = $2, notification_type = $3, target_class = $4, target_subject_id = $5,
      start_date = $6, end_date = $7, priority = $8, pdf_attachment = $9, external_link = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE notification_id = $11`,
    [title, content, type, targetClass, targetSubjectId, startDate, endDate, priority, pdfAttachment, externalLink, id]
  );
}

// Διαγραφή ανακοίνωσης
export async function deleteAnnouncement(id) {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title: "Test Announcement", content: "This is a test announcement." };
  }

  await pool.query(
    `DELETE FROM notifications WHERE notification_id = $1`,
    [id]
  );
}

// Απενεργοποίηση ανακοίνωσης (soft delete)
export async function deactivateAnnouncement(id) {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title: "Test Announcement", content: "This is a test announcement." };
  }

  await pool.query(
    `UPDATE notifications SET is_active = FALSE WHERE notification_id = $1`,
    [id]
  );
}

// Επιστροφή όλων των τάξεων για dropdown
export async function getAllClasses() {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ class_name: "Test Class" }];
  }
  const res = await pool.query(
    `SELECT DISTINCT studentclass as class_name FROM students WHERE status = 'active' ORDER BY studentclass`
  );
  return res.rows;
}

// ---------- ΠΑΛΙΑ ΘΕΜΑΤΑ PDF ----------
export async function getAllPDFs() {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [{ id: 1, title: "Test PDF", description: "This is a test PDF." }];
  }
  const res = await pool.query('SELECT * FROM palliathemata ORDER BY upload_date DESC, created_at DESC');
  return res.rows;
}
export async function getPDFById(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title: "Test PDF", description: "This is a test PDF." };
  }
  const res = await pool.query('SELECT * FROM palliathemata WHERE id = $1', [id]);
  return res.rows[0];
}
export async function getPDFByFilename(filename) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id: 1, title: "Test PDF", description: "This is a test PDF." };
  }
  const res = await pool.query('SELECT * FROM palliathemata WHERE filename = $1', [filename]);
  return res.rows[0];
}

export async function createPDF(pdfData) {
  const { title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date } = pdfData;

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id: 1, title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date };
  }

  const res = await pool.query(
    `INSERT INTO palliathemata (title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date]
  );
  
  return getPDFById(res.rows[0].id);
}

export async function updatePDF(id, pdfData) {
  const { title, lykeio, subject, year, description, filename } = pdfData;

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title, lykeio, subject, year, description, filename };
  }

  const res = await pool.query(
    `UPDATE palliathemata 
     SET title = $1, lykeio = $2, subject = $3, year = $4, description = $5, filename = $6, updated_at = CURRENT_TIMESTAMP
     WHERE id = $7`,
    [title, lykeio, subject, year, description, filename, id]
  );
  
  return res.rowCount > 0;
}

export async function deletePDF(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return false;
  }

  const res = await pool.query('DELETE FROM palliathemata WHERE id = $1', [id]);
  return res.rowCount > 0;
}

export async function filterPDFs(filters = {}) {
  let query = 'SELECT * FROM palliathemata WHERE 1=1';
  const params = [];
  
  if (filters.lykeio) {
    query += ' AND lykeio = $1';
    params.push(filters.lykeio);
  }
  
  if (filters.subject) {
    query += ' AND subject = $2';
    params.push(filters.subject);
  }
  
  if (filters.year) {
    query += ' AND year = $3';
    params.push(filters.year);
  }
  
  query += ' ORDER BY upload_date DESC, created_at DESC';

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }

  const res = await pool.query(query, params);
  return res.rows;
}

// ==================== VASEIS SCHOLON FUNCTIONS ====================

export async function getAllVaseisScholon() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }

  const res = await pool.query(`
    SELECT id, title, year, lykeio, field, description, filename, file_size, upload_date, updated_at, created_by
    FROM vaseisscholon 
    ORDER BY upload_date DESC, updated_at DESC
  `);

  return res.rows.map(row => ({
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  }));
}

export async function getVaseisScholonById(id) {

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title: "Test Announcement", content: "This is a test announcement." };
  }

  const res = await pool.query('SELECT * FROM vaseisscholon WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  };
}

export async function createVaseisScholon(vaseisData) {
  const { title, year, lykeio, field, description, filename, file_data, file_size } = vaseisData;

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id: 1, title, year, lykeio, field, description, filename, file_data, file_size };
  }

  const res = await pool.query(`
    INSERT INTO vaseisscholon (title, year, lykeio, field, description, filename, file_data, file_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
  `, [title, year, lykeio, field, description, filename, file_data, file_size]);
  
  return res.rows[0].id;
}

export async function updateVaseisScholon(id, updateData) {
  const fields = [];
  const values = [];
  
  // Δυναμική δημιουργία του UPDATE query
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });
  
  if (fields.length === 0) return false;
  
  values.push(id);

  if (!pool) {
    console.log("⚠️ No DB connection, skipping update");
    return false;
  }

  const res = await pool.query(`
    UPDATE vaseisscholon 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return res.rowCount > 0;
}

export async function deleteVaseisScholon(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping delete");
    return false;
  }

  const res = await pool.query('DELETE FROM vaseisscholon WHERE id = $1', [id]);
  return res.rowCount > 0;
}

// ==================== MIXANOGRAFIKO FUNCTIONS ====================

export async function getAllMixanografiko() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }

  const res = await pool.query(`
    SELECT id, title, lykeio, field, specialty, description, filename, file_size, upload_date, updated_at, created_by
    FROM mixanografiko 
    ORDER BY upload_date DESC, updated_at DESC
  `);
  
  return res.rows.map(row => ({
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  }));
}

export async function getMixanografikoById(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, title: "Test Mixanografiko", description: "This is a test Mixanografiko." };
  }

  const res = await pool.query('SELECT * FROM mixanografiko WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;

  const row = res.rows[0];
  return {
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  };
}

export async function createMixanografiko(mixanografikoData) {
  const { title, lykeio, field, specialty, description, filename, file_data, file_size } = mixanografikoData;

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id: 1, title, lykeio, field, specialty, description, filename, file_data, file_size };
  }

  const res = await pool.query(`
    INSERT INTO mixanografiko (title, lykeio, field, specialty, description, filename, file_data, file_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
  `, [title, lykeio, field, specialty || '', description, filename, file_data, file_size]);
  
  return res.rows[0].id;
}

export async function updateMixanografiko(id, updateData) {
  const fields = [];
  const values = [];
  
  // Δυναμική δημιουργία του UPDATE query
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });
  
  if (fields.length === 0) return false;
  
  values.push(id);

  if (!pool) {
    console.log("⚠️ No DB connection, skipping update");
    return false;
  }

  const res = await pool.query(`
    UPDATE mixanografiko 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return res.rowCount > 0;
}

export async function deleteMixanografiko(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping delete");
    return false;
  }

  const res = await pool.query('DELETE FROM mixanografiko WHERE id = $1', [id]);
  return res.rowCount > 0;
}

export async function filterMixanografiko(filters = {}) {
  let query = `
    SELECT id, title, lykeio, field, specialty, description, filename, file_size, upload_date, updated_at, created_by
    FROM mixanografiko WHERE 1=1
  `;
  const params = [];
  
  if (filters.lykeio) {
    query += ' AND lykeio = $1';
    params.push(filters.lykeio);
  }
  
  if (filters.field) {
    query += ' AND field = $2';
    params.push(filters.field);
  }
  
  if (filters.specialty) {
    query += ' AND specialty = $3';
    params.push(filters.specialty);
  }
  
  query += ' ORDER BY upload_date DESC, updated_at DESC';

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }

  const res = await pool.query(query, params);
  
  return res.rows.map(row => ({
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  }));
}

// ========== STUDENTS MANAGEMENT ==========

export async function getAllStudents() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }
  const res = await pool.query(`
    SELECT s.*, 
           GROUP_CONCAT(CONCAT(sub.name, ' ', sub.code) SEPARATOR '<br>') as subjects
    FROM students s
    LEFT JOIN Enrollments e ON s.id = e.student_id
    LEFT JOIN Subjects sub ON e.class_id = sub.id
    GROUP BY s.id
    ORDER BY s.last_name, s.first_name
  `);
  return res.rows;
}

export async function getStudentById(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, firstName: "Test", lastName: "Student" };
  }
  const res = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return res.rows[0];
}

export async function createNewStudent(studentData) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return false;
  }
  const [result] = await pool.query(`
    INSERT INTO students (firstName, lastName, studentClass, phone, email, parentName, parentPhone, address, birthDate, enrollmentDate, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [
    studentData.firstName,
    studentData.lastName,
    studentData.studentClass,
    studentData.phone,
    studentData.email,
    studentData.parentName,
    studentData.parentPhone,
    studentData.address,
    studentData.birthDate,
    studentData.enrollmentDate,
    studentData.status,
    studentData.notes
  ]);
  return result.insertId;
}

export async function updateStudent(id, studentData) {
  try {
    console.log('🔧 updateStudent called with ID:', id, 'data:', studentData);
    
    const fields = [];
    const values = [];
    
    // Handle both old and new field names for compatibility
    if (studentData.first_name !== undefined || studentData.firstName !== undefined) { 
      fields.push('first_name = $1'); 
      values.push(studentData.first_name || studentData.firstName); 
    }
    if (studentData.last_name !== undefined || studentData.lastName !== undefined) { 
      fields.push('last_name = $2'); 
      values.push(studentData.last_name || studentData.lastName); 
    }
    if (studentData.father_name !== undefined || studentData.fatherName !== undefined) { 
      fields.push('father_name = $3'); 
      values.push(studentData.father_name || studentData.fatherName); 
    }
    if (studentData.username !== undefined) { 
      fields.push('username = $4'); 
      values.push(studentData.username); 
    }
    if (studentData.class !== undefined || studentData.studentClass !== undefined) { 
      fields.push('class = $5'); 
      values.push(studentData.class || studentData.studentClass); 
    }
    if (studentData.phone !== undefined) { 
      fields.push('phone = $6'); 
      values.push(studentData.phone); 
    }
    if (studentData.email !== undefined) { 
      fields.push('email = $7'); 
      values.push(studentData.email); 
    }
    if (studentData.parentName !== undefined) { 
      fields.push('parentName = $8'); 
      values.push(studentData.parentName); 
    }
    if (studentData.parentPhone !== undefined) { 
      fields.push('parentPhone = $9'); 
      values.push(studentData.parentPhone); 
    }
    if (studentData.address !== undefined) { 
      fields.push('address = $10'); 
      values.push(studentData.address); 
    }
    if (studentData.birthDate !== undefined) { 
      fields.push('birthDate = $11'); 
      values.push(studentData.birthDate); 
    }
    if (studentData.enrollmentDate !== undefined) { 
      fields.push('enrollmentDate = $12'); 
      values.push(studentData.enrollmentDate); 
    }
    if (studentData.status !== undefined) { 
      fields.push('status = $13'); 
      values.push(studentData.status); 
    }
    if (studentData.notes !== undefined) { 
      fields.push('notes = $14'); 
      values.push(studentData.notes); 
    }
    
    console.log('📝 Fields to update:', fields.length, fields);
    console.log('📊 Values:', values);
    
    if (fields.length === 0) {
      console.log('❌ No fields to update');
      return false;
    }
    
    values.push(id);
    
    const query = `UPDATE students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $15`;
    console.log('🔍 Query:', query);
    console.log('🔍 Values:', values);

    if (!pool) {
      console.log("⚠️ No DB connection, skipping update");
      return false;
    }

    const res = await pool.query(query, values);
    console.log('📊 Update result:', res);
    console.log('✅ Affected rows:', res.rowCount);
    
    return res.rowCount > 0;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
}

export async function deleteStudentById(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping delete");
    return false;
  }
  const res = await pool.query('DELETE FROM students WHERE id = $1', [id]);
  return res.rowCount > 0;
}

export async function searchStudents(searchTerm, classFilter) {
  let query = `
    SELECT s.*, 
           GROUP_CONCAT(CONCAT(sub.name, ' ', sub.code) SEPARATOR '<br>') as subjects
    FROM students s
    LEFT JOIN Enrollments e ON s.id = e.student_id
    LEFT JOIN Subjects sub ON e.class_id = sub.id
    WHERE 1=1
  `;
  const params = [];
  
  if (searchTerm) {
    query += ` AND (s.first_name LIKE $1 OR s.last_name LIKE $2 OR s.phone LIKE $3 OR s.email LIKE $4)`;
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  if (classFilter) {
    query += ` AND s.studentClass = $5`;
    params.push(classFilter);
  }
  
  query += ` GROUP BY s.id ORDER BY s.last_name, s.first_name`;

  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }

  const res = await pool.query(query, params);
  return res.rows;
}

export async function getStudentsByClass(className) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(
      'SELECT * FROM students WHERE class = $1',
      [className]
    );
    return res.rows;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
}

// ========== TEACHERS MANAGEMENT ==========

export async function getAllTeachers() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }
  const res = await pool.query(`
    SELECT t.*, 
           GROUP_CONCAT(CONCAT(s.name, ' ', s.code) SEPARATOR '<br>') as subjects
    FROM teachers t
    LEFT JOIN Subjects s ON t.id = s.teacherId
    GROUP BY t.id
    ORDER BY t.name
  `);
  return res.rows;
}

export async function getTeacherById(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, name: "Test Teacher", subject: "Math", phone: "1234567890", email: "test@example.com" };
  }
  const res = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);
  return res.rows[0];
}

export async function createTeacher(teacherData) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping create");
    return false;
  }
  const res = await pool.query(
    `INSERT INTO teachers (name, subject, phone, email)
    VALUES ($1, $2, $3, $4) RETURNING id`,
    [teacherData.name, teacherData.subject, teacherData.phone, teacherData.email]
  );
  return res.rows[0].id;
}

export async function updateTeacher(id, teacherData) {
  const fields = [];
  const values = [];
  
  if (teacherData.name !== undefined) { fields.push('name = $1'); values.push(teacherData.name); }
  if (teacherData.subject !== undefined) { fields.push('subject = $2'); values.push(teacherData.subject); }
  if (teacherData.phone !== undefined) { fields.push('phone = $3'); values.push(teacherData.phone); }
  if (teacherData.email !== undefined) { fields.push('email = $4'); values.push(teacherData.email); }
  
  if (fields.length === 0) return false;
  
  values.push(id);

  if (!pool) {
    console.log("⚠️ No DB connection, skipping update");
    return false;
  }

  const res = await pool.query(`
    UPDATE teachers 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return res.rowCount > 0;
}

export async function deleteTeacher(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping delete");
    return false;
  }
  const res = await pool.query('DELETE FROM teachers WHERE id = $1', [id]);
  return res.rowCount > 0;
}

export async function searchTeachers(searchTerm) {
  try {
    const searchPattern = `%${searchTerm}%`;
    
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }

    const res = await pool.query(
      `SELECT t.*, 
              GROUP_CONCAT(s.name SEPARATOR ', ') as subjects
       FROM teachers t
       LEFT JOIN Subjects s ON t.id = s.teacher_id
       WHERE t.first_name LIKE $1 OR t.last_name LIKE $2 OR t.phone LIKE $3 OR t.email LIKE $4
       GROUP BY t.id
       ORDER BY t.first_name, t.last_name`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );
    return res.rows;
  } catch (error) {
    console.error('Error searching teachers:', error);
    throw error;
  }
}

// ========== SUBJECTS MANAGEMENT ==========

export async function getAllSubjects() {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }
  const res = await pool.query(`
    SELECT * FROM subjects
    ORDER BY class, name
  `);
  return res.rows;
}

export async function getSubjectById(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return { id, name: "Test Subject", code: "MATH101", class: "Math", teacherId: 1 };
  }
  const res = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
  return res.rows[0];
}

export async function createSubject(subjectData) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping create");
    return false;
  }
  const res = await pool.query(`
    INSERT INTO subjects (name, code, class, teacherId)
    VALUES ($1, $2, $3, $4) RETURNING id
  `, [subjectData.name, subjectData.code, subjectData.class, subjectData.teacherId]);
  return res.rows[0]?.id;
}

export async function updateSubject(id, subjectData) {
  const fields = [];
  const values = [];
  if (subjectData.name !== undefined) { fields.push(`name = $${fields.length + 1}`); values.push(subjectData.name); }
  if (subjectData.code !== undefined) { fields.push(`code = $${fields.length + 1}`); values.push(subjectData.code); }
  if (subjectData.class !== undefined) { fields.push(`class = $${fields.length + 1}`); values.push(subjectData.class); }
  if (subjectData.teacherId !== undefined) { fields.push(`teacherId = $${fields.length + 1}`); values.push(subjectData.teacherId); }
  if (fields.length === 0) return false;
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  if (!pool) {
    console.log("⚠️ No DB connection, skipping update");
    return false;
  }
  const res = await pool.query(
    `UPDATE subjects SET ${fields.join(', ')} WHERE id = $${values.length}`,
    values
  );
  return res.rowCount > 0;
}

export async function deleteSubject(id) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping delete");
    return false;
  }
  const res = await pool.query(
    `DELETE FROM subjects WHERE id = $1`,
    [id]
  );
  return res.rowCount > 0;
}

export async function searchSubjects(searchTerm) {
  try {
    const searchPattern = `%${searchTerm}%`;

    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }

    const res = await pool.query(
      `SELECT s.*, 
              t.first_name as teacher_first_name,
              t.last_name as teacher_last_name,
              CONCAT(t.first_name, ' ', t.last_name) as teacher_name
       FROM subjects s
       LEFT JOIN teachers t ON s.teacher_id = t.id
       WHERE s.name LIKE $1 OR s.class LIKE $2 OR s.schedule LIKE $3
       ORDER BY s.name`,
      [searchPattern, searchPattern, searchPattern]
    );
    return res.rows;
  } catch (error) {
    console.error('Error searching subjects:', error);
    throw error;
  }
}

// ========== ENROLLMENTS MANAGEMENT ==========

export async function getStudentEnrollments(studentId) {
  if (!pool) {
    console.log("⚠️ No DB connection, returning dummy data");
    return [];
  }

  const res = await pool.query(`
    SELECT e.*, s.name as subjectName, s.code as subjectCode, s.class as subjectClass
    FROM Enrollments e
    JOIN Subjects s ON e.class_id = s.id
    WHERE e.student_id = $1
    ORDER BY s.name
  `, [studentId]);
  return res.rows;
}

export async function createEnrollment(studentId, classId) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, skipping create");
      return false;
    }
    const res = await pool.query(`
      INSERT INTO Enrollments (student_id, class_id)
      VALUES ($1, $2) RETURNING id
    `, [studentId, classId]);
    return res.rows[0]?.id;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}

export async function deleteEnrollment(id) {
  try {

    if (!pool) {
      console.log("⚠️ No DB connection, skipping delete");
      return false;
    }
    const res = await pool.query('DELETE FROM Enrollments WHERE enrollment_id = $1', [id]);
    return res.rowCount > 0;
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    throw error;
  }
}

export async function getSubjectsNotEnrolledByStudent(studentId) {
  try {

    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }

    const res = await pool.query(`
      SELECT s.*, t.name as teacherName
      FROM Subjects s
      LEFT JOIN NewTeachers t ON s.teacherId = t.id
      WHERE s.id NOT IN (
        SELECT class_id FROM Enrollments WHERE student_id = $1
      )
      ORDER BY s.name
    `, [studentId]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching subjects not enrolled by student:', error);
    throw error;
  }
}

export async function getAllEnrollments() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(
      `SELECT e.enrollment_id,
              e.student_id,
              e.class_id,
              CONCAT(st.first_name, ' ', st.last_name) as student_name,
              st.class as student_class,
              s.name as subject_name,
              s.code as subject_code,
              t.name as teacher_name
       FROM enrollments e
       JOIN students st ON e.student_id = st.id
       JOIN subjects s ON e.class_id = s.id
       LEFT JOIN teachers t ON s.teacherid = t.id
       ORDER BY st.last_name, st.first_name, s.name`
    );
    return res.rows;
  } catch (error) {
    console.error('Error fetching all enrollments:', error);
    throw error;
  }
}

export async function getEnrollmentsByStudent(studentId) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(
      `SELECT e.enrollment_id,
              e.student_id,
              e.class_id,
              s.name as subject_name,
              s.code as subject_code,
              s.class as subject_class,
              t.name as teacher_name,
              'active' as status
       FROM Enrollments e
       JOIN Subjects s ON e.class_id = s.id
       LEFT JOIN Teachers t ON s.teacherId = t.id
       WHERE e.student_id = $1
       ORDER BY s.name`,
      [studentId]
    );
    
    console.log(`📊 Raw query result for student ${studentId}:`, res.rows);
    
    // Μετατρέπουμε τα δεδομένα για συμβατότητα με το frontend
    return res.rows.map(row => ({
      enrollment_id: row.enrollment_id,
      student_id: row.student_id,
      class_id: row.class_id,
      subject_name: row.subject_name,
      subject_code: row.subject_code,
      subject_class: row.subject_class,
      teacher_name: row.teacher_name || 'Δεν έχει οριστεί',
      enrollment_date: null, // Δεν υπάρχει στη βάση
      status: 'active', // Default status
      subject: {
        name: row.subject_name,
        code: row.subject_code,
        class: row.subject_class,
        teacher: row.teacher_name || 'Δεν έχει οριστεί'
      }
    }));
  } catch (error) {
    console.error('Error fetching enrollments by student:', error);
    throw error;
  }
}

export async function getEnrollmentsBySubject(subjectId) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(
      `SELECT e.enrollment_id,
              e.student_id,
              e.class_id as subject_id,
              CONCAT(st.first_name, ' ', st.last_name) as student_name,
              st.class as student_class,
              st.phone as student_phone
       FROM Enrollments e
       JOIN Students st ON e.student_id = st.id
       WHERE e.class_id = $1
       ORDER BY st.last_name, st.first_name`,
      [subjectId]
    );
    return res.rows;
  } catch (error) {
    console.error('Error fetching enrollments by subject:', error);
    throw error;
  }
}

export async function updateEnrollment(id, enrollmentData) {
  try {
    const { studentId, classId, status, notes } = enrollmentData;
    if (!pool) {
      console.log("⚠️ No DB connection, skipping update");
      return false;
    }
    const res = await pool.query(
      `UPDATE Enrollments 
       SET student_id = $1, class_id = $2
       WHERE enrollment_id = $3`,
      [studentId, classId, id]
    );
    if (res.rowCount === 0) {
      throw new Error('Enrollment not found');
    }
    return { id, ...enrollmentData };
  } catch (error) {
    console.error('Error updating enrollment:', error);
    throw error;
  }
}

export async function searchEnrollments(searchTerm, statusFilter) {
  try {
    let query = `
      SELECT e.enrollment_id,
             e.student_id,
             e.class_id,
             CONCAT(st.first_name, ' ', st.last_name) as student_name,
             st.class as student_class,
             s.name as subject_name,
             s.code as subject_code,
             t.name as teacher_name
      FROM Enrollments e
      JOIN NewStudents st ON e.student_id = st.id
      JOIN Subjects s ON e.class_id = s.id
      LEFT JOIN NewTeachers t ON s.teacherId = t.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      conditions.push(`(
        st.first_name LIKE $1 OR 
        st.last_name LIKE $2 OR 
        s.name LIKE $3 OR 
        CONCAT(st.first_name, ' ', st.last_name) LIKE $4
      )`);
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (statusFilter && statusFilter !== 'all') {
      conditions.push(`e.status = $${params.length + 1}`);
      params.push(statusFilter);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY st.last_name, st.first_name, s.name';

    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error('Error searching enrollments:', error);
    throw error;
  }
}

// ==================== STUDENT CODES FUNCTIONS ====================

export async function getAllStudentCodes() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res= await pool.query(
      `SELECT sc.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              s.class as student_class
       FROM StudentCodes sc
       LEFT JOIN Students s ON sc.student_id = s.id
       ORDER BY sc.created_at DESC`
    );
    return res.rows;
  } catch (error) {
    console.error('Error fetching all student codes:', error);
    throw error;
  }
}

export async function getStudentCodeById(id) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning null");
      return { id, code: "TESTCODE", student_id: 1, status: "active" };
    }
    const res = await pool.query(
      `SELECT sc.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              s.class as student_class
       FROM StudentCodes sc
       LEFT JOIN Students s ON sc.student_id = s.id
       WHERE sc.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error('Error fetching student code by ID:', error);
    throw error;
  }
}

export async function getStudentCodeByStudentId(studentId) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning null");
      return { id: 1, code: "TESTCODE", student_id: studentId, status: "active" };
    }
    const res = await pool.query(
      `SELECT sc.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              s.class as student_class
       FROM StudentCodes sc
       LEFT JOIN Students s ON sc.student_id = s.id
       WHERE sc.student_id = $1`,
      [studentId]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error('Error fetching student code by student ID:', error);
    throw error;
  }
}

export async function createStudentCode(studentCodeData) {
  try {
    const { student_id, code, password_hash, status } = studentCodeData;
    if (!pool) {
      console.log("⚠️ No DB connection, skipping create");
      return false;
    }
    const res = await pool.query(
      `INSERT INTO StudentCodes (student_id, code, password_hash, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
      [student_id, code, password_hash, status || 'active']
    );
    return { id: res.rows[0]?.id, ...studentCodeData };
  } catch (error) {
    console.error('Error creating student code:', error);
    throw error;
  }
}

export async function updateStudentCode(id, studentCodeData) {
  try {
    const { student_id, code, password_hash, status } = studentCodeData;
    if (!pool) {
      console.log("⚠️ No DB connection, skipping update");
      return false;
    }
    const res = await pool.query(
      `UPDATE StudentCodes 
       SET student_id = $1, code = $2, password_hash = $3, status = $4, updated_at = NOW()
       WHERE id = $5`,
      [student_id, code, password_hash, status, id]
    );
    if (res.rowCount === 0) {
      throw new Error('Student code not found');
    }
    return { id, ...studentCodeData };
  } catch (error) {
    console.error('Error updating student code:', error);
    throw error;
  }
}

export async function deleteStudentCode(id) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, skipping delete");
      return false;
    }
    const res = await pool.query('DELETE FROM StudentCodes WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      throw new Error('Student code not found');
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting student code:', error);
    throw error;
  }
}

export async function searchStudentCodes(searchTerm, statusFilter) {
  try {
    let query = `
      SELECT sc.*,
             CONCAT(s.first_name, ' ', s.last_name) as student_name,
             s.class as student_class
      FROM StudentCodes sc
      LEFT JOIN Students s ON sc.student_id = s.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      conditions.push(`(
        s.first_name LIKE $1 OR 
        s.last_name LIKE $2 OR 
        sc.code LIKE $3 OR 
        CONCAT(s.first_name, ' ', s.last_name) LIKE $4
      )`);
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    if (statusFilter && statusFilter !== 'all') {
      conditions.push(`sc.status = $${params.length + 1}`);
      params.push(statusFilter);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sc.created_at DESC';

    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }

    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error('Error searching student codes:', error);
    throw error;
  }
}

export async function createBulkStudentCodes(studentIds, codePrefix = 'STU') {
  try {
    const createdCodes = [];
    
    for (const studentId of studentIds) {
      // Generate unique code
      const timestamp = Date.now().toString().slice(-6);
      const code = `${codePrefix}${studentId.toString().padStart(3, '0')}${timestamp}`;
      
      // Generate random password
      const password = Math.random().toString(36).slice(-8);
      const bcrypt = await import('bcryptjs');
      const password_hash = await bcrypt.hash(password, 10);

      if (!pool) {
        console.log("⚠️ No DB connection, skipping create");
        return false;
      }
      const res = await pool.query(
        `INSERT INTO StudentCodes (student_id, code, password_hash, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'active', NOW(), NOW()) RETURNING id`,
        [studentId, code, password_hash]
      );

      createdCodes.push({
        id: res.rows[0]?.id,
        student_id: studentId,
        code: code,
        password: password,
        status: 'active'
      });
    }
    
    return createdCodes;
  } catch (error) {
    console.error('Error creating bulk student codes:', error);
    throw error;
  }
}

(async () => {
    const teacher = await getTeachers(); // Only get the note with id=2
    console.log(teacher);
})();

(async () => {
    const student = await getStudents(); // Only get the note with id=2
    console.log(student);
})();

// ==================== PASSWORD MANAGEMENT FUNCTIONS ====================

// In-memory tracking των τελευταίων κωδικών που δημιουργήθηκαν
let lastGeneratedPasswords = new Map();

// Αρχικοποίηση των default κωδικών
function initializeDefaultPasswords() {
  lastGeneratedPasswords.set('admin', '123');
  lastGeneratedPasswords.set('mariaio', '123');
  lastGeneratedPasswords.set('giannisp', '123');
  lastGeneratedPasswords.set('kostasd', '123');
  console.log('🔑 Αρχικοποιήθηκαν default κωδικοί');
}

// Καλούμε την αρχικοποίηση
initializeDefaultPasswords();

export async function getAllUsersWithPasswords() {
  try {
    let adminRows = [];
    let studentRows = [];

    // Προσπαθούμε να πάρουμε τους admins - αν υπάρχει ο πίνακας
    try {
      if (!pool) {
        console.log("⚠️ No DB connection, returning dummy data");
        return [];
      }
      [adminRows] = await pool.query(
        `SELECT a.admin_id as id, a.username, a.username as name, '' as email, 'admin' as role,
                COALESCE(p.plain_password, '123') as password
         FROM Admins a 
         LEFT JOIN UserPasswordsView p ON a.username = p.username AND p.user_type = 'admin'`
      );
      console.log('✅ Φορτώθηκαν Admins:', adminRows.length);
    } catch (error) {
      console.log('❌ Πίνακας Admins δεν βρέθηκε ή έχει διαφορετική δομή:', error.message);
      // Fallback
      adminRows = [
        { id: 1, username: 'admin', name: 'Διαχειριστής Συστήματος', email: 'admin@mathsteki.gr', role: 'admin', password: '123' }
      ];
    }
    
    // Παίρνουμε όλους τους students
    try {
      if (!pool) {
        console.log("⚠️ No DB connection, returning dummy data");
        return [];
      }
      [studentRows] = await pool.query(
        `SELECT s.id, s.username, CONCAT(s.first_name, ' ', s.last_name) as name, s.email, 'student' as role,
                COALESCE(p.plain_password, '123') as password
         FROM Students s 
         LEFT JOIN UserPasswordsView p ON s.username = p.username AND p.user_type = 'student'`
      );
      console.log('✅ Φορτώθηκαν Students:', studentRows.length);
    } catch (error) {
      console.error('❌ Σφάλμα φόρτωσης Students:', error);
      studentRows = [];
    }

    // Συνδυάζουμε τα αποτελέσματα
    const allUsers = [
      ...adminRows.map(user => ({
        ...user,
        type: 'Admin'
      })),
      ...studentRows.map(user => ({
        ...user,
        type: 'Μαθητής'
      }))
    ];

    console.log('📊 Σύνολο χρηστών:', allUsers.length, '(Admins:', adminRows.length, ', Students:', studentRows.length, ')');
    return allUsers;
  } catch (error) {
    console.error('Error fetching users with passwords:', error);
    
    // Fallback data αν όλα αποτύχουν
    return [
      { id: 1, username: 'admin', name: 'Διαχειριστής', email: 'admin@mathsteki.gr', password: '123', type: 'Admin', role: 'admin' },
      { id: 2, username: 'mariaio', name: 'Μαρία Ιωάννου', email: 'maria@example.com', password: '123', type: 'Μαθητής', role: 'student' },
      { id: 3, username: 'giannisp', name: 'Γιάννης Παπαδόπουλος', email: 'giannis@example.com', password: '123', type: 'Μαθητής', role: 'student' },
      { id: 4, username: 'kostasd', name: 'Κώστας Δημητρίου', email: 'kostas@example.com', password: '123', type: 'Μαθητής', role: 'student' }
    ];
  }
}

// Συνάρτηση για να πάρει τον τελευταίο κωδικό ενός χρήστη
function getPasswordForUser(username) {
  // Αν έχουμε stored έναν νέο κωδικό, επιστρέφουμε αυτόν
  if (lastGeneratedPasswords.has(username)) {
    return lastGeneratedPasswords.get(username);
  }
  
  // Αλλιώς επιστρέφουμε τον default κωδικό "123"
  return '123';
}

export async function updateUserPassword(username, newPassword, userType = 'student') {
  try {
    const bcrypt = await import('bcryptjs');
    const password_hash = await bcrypt.hash(newPassword, 10);
    
    let result;
    if (userType === 'admin') {
      if (!pool) {
        console.log("⚠️ No DB connection, skipping update");
        return false;
      }
      [result] = await pool.query(
        'UPDATE Admins SET password_hash = $1 WHERE username = $2',
        [password_hash, username]
      );
    } else {
      if (!pool) {
        console.log("⚠️ No DB connection, skipping update");
        return false;
      }
      [result] = await pool.query(
        'UPDATE Students SET password_hash = $1 WHERE username = $2',
        [password_hash, username]
      );
    }
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
    
    // Ενημερώνουμε τον πίνακα με τους plain text κωδικούς για admin view
   if (!pool) {
     console.log("⚠️ No DB connection, skipping update");
     return false;
   }
   await pool.query(
      `INSERT INTO UserPasswordsView (username, plain_password, user_type) 
       VALUES ($1, $2, $3) 
       ON DUPLICATE KEY UPDATE 
       plain_password = VALUES(plain_password), 
       last_updated = NOW()`,
      [username, newPassword, userType]
    );
    
    console.log(`🔐 Ενημερώθηκε κωδικός για χρήστη: ${username} -> ${newPassword}`);
    
    return { success: true, message: 'Κωδικός ενημερώθηκε επιτυχώς' };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

// Get student by username
export async function getStudentByUsername(username) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning null");
      return null;
    }
    const res = await pool.query(
      'SELECT * FROM students WHERE username = $1',
      [username]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error('Error getting student by username:', error);
    throw error;
  }
}

// ---------- CREATE STUDENT COMPLETE FUNCTION ----------

// Enhanced function to create student with all fields
export async function createStudentComplete(studentData) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping create");
    return false;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(
      `INSERT INTO students (
        first_name, last_name, father_name, username, password_hash,
        class, phone, email, parentname, parentphone, address,
        birthdate, enrollmentdate, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
      [
        studentData.first_name,
        studentData.last_name,
        studentData.father_name,
        studentData.username,
        studentData.password_hash,
        studentData.class,
        studentData.phone,
        studentData.email,
        studentData.parentName,
        studentData.parentPhone,
        studentData.address,
        studentData.birthDate,
        studentData.enrollmentDate,
        studentData.status,
        studentData.notes
      ]
    );
    const studentId = res.rows[0].id;
    await client.query(
      `INSERT INTO oldstudents (student_id, first_name, last_name, father_name, username, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        studentId,
        studentData.first_name,
        studentData.last_name,
        studentData.father_name,
        studentData.username,
        studentData.password_hash
      ]
    );
    await client.query('COMMIT');
    console.log(`✅ Student created with ID: ${studentId}`);
    return studentId;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating student:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ==================== PASSWORD MANAGEMENT ====================

// Απλή συνάρτηση για όλες τις ανακοινώσεις (για αρχική σελίδα)
export async function getAllAnnouncements() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(
      `SELECT 
        notification_id, title, content, created_at, updated_at,
        pdf_attachment, external_link, priority
      FROM notifications 
      WHERE is_active = TRUE
      ORDER BY created_at DESC`,
      []
    );
    return res.rows;
  } catch (error) {
    console.error('Error in getAllAnnouncements:', error);
    throw error;
  }
}

// Δημιουργία νέας ανακοίνωσης (απλοποιημένη)
export async function createAnnouncementSimple(title, content, admin_id) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, skipping create");
      return false;
    }
    const [result] = await pool.query(
      `INSERT INTO notifications (title, content, created_by, is_active, created_at)
       VALUES ($1, $2, $3, TRUE, NOW()) RETURNING id`,
      [title, content, admin_id]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

// =================== SCHOOLS DATA MANAGEMENT ===================

// Get all schools data
export async function getAllSchoolsData() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(`
      SELECT 
        id, school_id, school_name, university, position_type, scientific_field,
        min_moria, max_moria, field_code, school_type, avg_score,
        upload_date, updated_at, uploaded_by, file_type, batch_id
      FROM SchoolsData 
      ORDER BY upload_date DESC, school_name ASC
    `);
    return res.rows;
  } catch (error) {
    console.error('Error getting all schools data:', error);
    throw error;
  }
}

// Get schools data by school type (gel/epal)
export async function getSchoolsDataByType(schoolType) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(`
      SELECT 
        id, school_id, school_name, university, position_type, scientific_field,
        min_moria, max_moria, field_code, school_type, avg_score,
        upload_date, updated_at, uploaded_by, file_type, batch_id
      FROM SchoolsData 
      WHERE school_type = $1
      ORDER BY school_name ASC
    `, [schoolType]);
    return res.rows;
  } catch (error) {
    console.error('Error getting schools data by type:', error);
    throw error;
  }
}

// Clear all existing schools data and insert new batch
export async function replaceAllSchoolsData(schoolsArray, uploadedBy = 'admin', fileType = 'unknown') {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping replace");
    return false;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Generate unique batch ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear existing data
    await client.query('DELETE FROM SchoolsData');
    console.log('Cleared existing schools data');
    
    // Insert new data
    if (schoolsArray && schoolsArray.length > 0) {
      const insertQuery = `
        INSERT INTO SchoolsData (
          school_id, school_name, university, position_type, scientific_field,
          min_moria, max_moria, field_code, school_type, avg_score,
          uploaded_by, file_type, batch_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      
      for (const school of schoolsArray) {
        await client.query(insertQuery, [
          school.id || school.school_id,
          school.name || school.school_name,
          school.university,
          school.positionType || school.position_type,
          school.scientificField || school.scientific_field,
          school.minMoria || school.min_moria || 0,
          school.maxMoria || school.max_moria || 0,
          school.field || school.field_code,
          school.schoolType || school.school_type,
          school.avgScore || school.avg_score || 0,
          uploadedBy,
          fileType,
          batchId
        ]);
      }
      console.log(`Inserted ${schoolsArray.length} schools with batch ID: ${batchId}`);
    }
    
    await client.query('COMMIT');
    return { success: true, batchId, count: schoolsArray.length };
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error replacing schools data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get schools data formatted for moria calculator
export async function getSchoolsDataForCalculator() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(`
      SELECT 
        school_id as id,
        school_name as name,
        university,
        field_code as field,
        school_type as schoolType,
        avg_score as avgScore,
        min_moria as minMoria,
        max_moria as maxMoria,
        position_type as positionType,
        scientific_field as scientificField
      FROM SchoolsData 
      ORDER BY school_name ASC
    `);
    return res.rows;
  } catch (error) {
    console.error('Error getting schools data for calculator:', error);
    throw error;
  }
}

// Delete all schools data
export async function clearAllSchoolsData() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, skipping delete");
      return false;
    }
    const [result] = await pool.query('DELETE FROM SchoolsData');
    console.log(`Deleted ${result.affectedRows} schools data records`);
    return { success: true, deletedCount: result.affectedRows };
  } catch (error) {
    console.error('Error clearing schools data:', error);
    throw error;
  }
}

// Get schools data statistics
export async function getSchoolsDataStats() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return {
        total: 0,
        gelCount: 0,
        epalCount: 0,
        lastUpload: null
      };
    }
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM SchoolsData');
    const [gelRows] = await pool.query('SELECT COUNT(*) as gel_count FROM SchoolsData WHERE school_type = "gel"');
    const [epalRows] = await pool.query('SELECT COUNT(*) as epal_count FROM SchoolsData WHERE school_type = "epal"');
    const [latestRows] = await pool.query('SELECT upload_date, uploaded_by, file_type FROM SchoolsData ORDER BY upload_date DESC LIMIT 1');
    
    return {
      total: totalRows[0].total,
      gelCount: gelRows[0].gel_count,
      epalCount: epalRows[0].epal_count,
      lastUpload: latestRows[0] || null
    };
  } catch (error) {
    console.error('Error getting schools data stats:', error);
    throw error;
  }
}

// ---------- CALCULATOR TEMPLATES ----------

// Αποθήκευση calculator template στη βάση δεδομένων
export async function saveCalculatorTemplate(templateData) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, skipping create");
      return false;
    }
    const [result] = await pool.query(
      `INSERT INTO CalculatorTemplates 
       (filename, original_name, template_type, file_data, file_size, mimetype, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        templateData.filename,
        templateData.originalName,
        templateData.templateType,
        templateData.fileData,
        templateData.fileSize,
        templateData.mimetype,
        templateData.createdBy || 'admin'
      ]
    );
    
    console.log(`✅ Αποθηκεύτηκε calculator template: ${templateData.filename}`);
    return result.insertId;
  } catch (error) {
    console.error('Error saving calculator template:', error);
    throw error;
  }
}

// Λήψη όλων των calculator templates
export async function getAllCalculatorTemplates() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return [];
    }
    const res = await pool.query(
      `SELECT id, filename, original_name, template_type, file_size, mimetype, 
              upload_date, created_by 
       FROM CalculatorTemplates 
       ORDER BY upload_date DESC`
    );
    return res.rows;
  } catch (error) {
    console.error('Error getting calculator templates:', error);
    throw error;
  }
}

// Λήψη συγκεκριμένου calculator template με τα δεδομένα του αρχείου
export async function getCalculatorTemplate(filename) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning null");
      return null;
    }
    const res = await pool.query(
      `SELECT * FROM CalculatorTemplates WHERE filename = $1`,
      [filename]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error('Error getting calculator template:', error);
    throw error;
  }
}

// Λήψη calculator template μόνο με metadata (χωρίς τα δεδομένα του αρχείου)
export async function getCalculatorTemplateMetadata(filename) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning null");
      return null;
    }
    const res = await pool.query(
      `SELECT id, filename, original_name, template_type, file_size, mimetype, 
              upload_date, created_by 
       FROM CalculatorTemplates 
       WHERE filename = $1`,
      [filename]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error('Error getting calculator template metadata:', error);
    throw error;
  }
}

// Διαγραφή calculator template
export async function deleteCalculatorTemplate(filename) {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, skipping delete");
      return false;
    }
    const [result] = await pool.query(
      `DELETE FROM CalculatorTemplates WHERE filename = $1`,
      [filename]
    );
    
    if (result.affectedRows > 0) {
      console.log(`🗑️ Διαγράφηκε calculator template: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting calculator template:', error);
    throw error;
  }
}

// Στατιστικά calculator templates
export async function getCalculatorTemplatesStats() {
  try {
    if (!pool) {
      console.log("⚠️ No DB connection, returning dummy data");
      return {
        totalCount: 0,
        typeStats: [],
        totalSize: 0,
        lastUpload: null
      };
    }
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total_count FROM CalculatorTemplates`
    );
    
    const [typeRows] = await pool.query(
      `SELECT template_type, COUNT(*) as count 
       FROM CalculatorTemplates 
       GROUP BY template_type 
       ORDER BY count DESC`
    );
    
    const [sizeRows] = await pool.query(
      `SELECT SUM(file_size) as total_size FROM CalculatorTemplates`
    );
    
    const [latestRows] = await pool.query(
      `SELECT filename, original_name, template_type, upload_date 
       FROM CalculatorTemplates 
       ORDER BY upload_date DESC 
       LIMIT 1`
    );
    
    return {
      totalCount: countRows[0].total_count,
      typeStats: typeRows,
      totalSize: sizeRows[0].total_size || 0,
      lastUpload: latestRows[0] || null
    };
  } catch (error) {
    console.error('Error getting calculator templates stats:', error);
    throw error;
  }
}

// Προσθήκη γεγονότος στο ημερολόγιο μαθητή
export async function addCalendarEventForStudent(student_id, subject_id, event_title, event_type, event_date, event_time, event_text) {
  if (!pool) {
    console.log("⚠️ No DB connection, skipping create");
    return false;
  }
  await pool.query(
    `INSERT INTO CalendarEvents (student_id, subject_id, event_title, event_type, event_date, event_time, event_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [student_id, subject_id, event_title, event_type, event_date, event_time, event_text]
  );
}

// Όλα τα queries πρέπει να χρησιμοποιούν τα ονόματα πινάκων όπως είναι στη βάση: όλα lowercase

// Παράδειγμα:
// 'SELECT * FROM Students' -> 'SELECT * FROM students'
// 'SELECT * FROM Teachers' -> 'SELECT * FROM teachers'
// 'SELECT * FROM PalliaThemata' -> 'SELECT * FROM palliathemata'
// 'SELECT * FROM Mixanografiko' -> 'SELECT * FROM mixanografiko'
// 'SELECT * FROM VaseisScholon' -> 'SELECT * FROM vaseisscholon'
// 'SELECT * FROM Subjects' -> 'SELECT * FROM subjects'
// 'SELECT * FROM Notifications' -> 'SELECT * FROM notifications'
// ...και για όλα τα queries