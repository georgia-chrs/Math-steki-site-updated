// db.js
import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB, // εδώ βάζεις "school_db"
  port: process.env.MYSQL_PORT,
}).promise();

// Export pool for direct use in app.js
export { pool };

// ---------- ΜΑΘΗΤΕΣ ----------
export async function getStudents() {
  const [rows] = await pool.query('SELECT * FROM Students');
  return rows;
}
export async function getStudent(id) {
  const [rows] = await pool.query('SELECT * FROM Students WHERE id = ?', [id]);
  return rows[0];
}

export async function createStudent(first_name, last_name, father_name, username, password_hash) {
    const [result] = await pool.query(
        `INSERT INTO Students (first_name, last_name, father_name, username, password_hash) VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, father_name, username, password_hash]
    );
    return getStudents(result.insertId);
}

export async function deleteStudent(id) {
    const [result] = await pool.query(
        "DELETE FROM Students WHERE student_id = ?",
        [id]
    );
    return result.affectedRows > 0;
}



// ---------- ΚΑΘΗΓΗΤΕΣ (αν χρειαστεί) ----------
export async function getTeachers() {
    const [rows] = await pool.query("SELECT * FROM Teachers");
    return rows;
}

export async function getUserByUsername(username) {
  console.log(`🔍 Ψάχνω για χρήστη: "${username}"`);
  
  // Ψάχνει πρώτα στους Admins
  let [rows] = await pool.query("SELECT *, 'admin' as role FROM Admins WHERE username = ?", [username]);
  console.log(`📋 Admins rows found: ${rows.length}`);
  if (rows.length > 0) {
    console.log(`✅ Βρέθηκε admin: ${rows[0].username}`);
    return rows[0];
  }
  
  // Μετά στους Students
  [rows] = await pool.query("SELECT *, 'student' as role FROM Students WHERE username = ?", [username]);
  console.log(`📋 Students rows found: ${rows.length}`);
  if (rows.length > 0) {
    console.log(`✅ Βρέθηκε student: ${rows[0].username}`);
    return rows[0];
  }
  
  console.log(`❌ Δεν βρέθηκε χρήστης: "${username}"`);
  return null;
}

export async function getProgressNotes(student_id) {
  const [rows] = await pool.query(
    `SELECT p.id, p.student_id, p.subject_id, p.note_date, p.content, p.performance_level, p.created_at,
            s.name AS subject_name
     FROM progress_notes p
     LEFT JOIN subjects s ON p.subject_id = s.id
     WHERE p.student_id = ? ORDER BY p.created_at DESC`,
    [student_id]
  );
  return rows;
}
// Κάλεσε τη συνάρτηση με το id του μαθητή (π.χ. 1)


export async function getGradesByStudent(student_id) {
  const [rows] = await pool.query(
    `SELECT g.id, g.student_id, g.subject_id, g.exam_type, g.grade, g.exam_date, g.notes, g.created_at,
            s.name as subject_name, s.code as subject_code
     FROM grades g
     LEFT JOIN subjects s ON g.subject_id = s.id
     WHERE g.student_id = ?
     ORDER BY g.exam_date DESC`,
    [student_id]
  );
  return rows;
}


// ---------- ΑΝΑΚΟΙΝΩΣΕΙΣ ΜΕ ΦΙΛΤΡΑΡΙΣΜΑ ----------

// Επιστροφή όλων των ανακοινώσεων (για admin)
export async function getAnnouncements() {
  const [rows] = await pool.query(
    `SELECT 
      notification_id, title, content, notification_type, target_class, target_subject_id,
      start_date, end_date, priority, is_active, pdf_attachment, external_link,
      created_at, updated_at
    FROM Notifications 
    WHERE is_active = TRUE
    ORDER BY priority DESC, created_at DESC`
  );
  return rows;
}

// Επιστροφή ανακοινώσεων για συγκεκριμένο μαθητή (φιλτράρισμα)
export async function getAnnouncementsForStudent(studentId) {
  try {
    // Επιστρέφουμε όλες τις ενεργές ανακοινώσεις (απλό σύστημα)
    const [rows] = await pool.query(
      `SELECT 
        notification_id, title, content, created_at, updated_at,
        pdf_attachment, external_link, priority
      FROM Notifications 
      WHERE is_active = TRUE
      ORDER BY created_at DESC`,
      []
    );
    return rows;
  } catch (error) {
    console.error('Error in getAnnouncementsForStudent:', error);
    throw error;
  }
}

// Δημιουργία νέας ανακοίνωσης με φιλτράρισμα
export async function createAnnouncement(title, content, admin_id = 1) {
  const [result] = await pool.query(
    `INSERT INTO Notifications (title, content, created_by, is_active) 
     VALUES (?, ?, ?, TRUE)`,
    [title, content, admin_id]
  );
  return result.insertId;
}

// Ενημέρωση ανακοίνωσης
export async function updateAnnouncement(id, title, content, type = 'general', targetClass = null, targetSubjectId = null, startDate = null, endDate = null, priority = 'normal', pdfAttachment = null, externalLink = null) {
  await pool.query(
    `UPDATE Notifications SET 
      title = ?, content = ?, notification_type = ?, target_class = ?, target_subject_id = ?,
      start_date = ?, end_date = ?, priority = ?, pdf_attachment = ?, external_link = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE notification_id = ?`,
    [title, content, type, targetClass, targetSubjectId, startDate, endDate, priority, pdfAttachment, externalLink, id]
  );
}

// Διαγραφή ανακοίνωσης
export async function deleteAnnouncement(id) {
  await pool.query(
    `DELETE FROM Notifications WHERE notification_id = ?`,
    [id]
  );
}

// Απενεργοποίηση ανακοίνωσης (soft delete)
export async function deactivateAnnouncement(id) {
  await pool.query(
    `UPDATE Notifications SET is_active = FALSE WHERE notification_id = ?`,
    [id]
  );
}

// Επιστροφή όλων των τάξεων για dropdown
export async function getAllClasses() {
  const [rows] = await pool.query(
    `SELECT DISTINCT studentClass as class_name FROM Students WHERE status = 'active' ORDER BY studentClass`
  );
  return rows;
}

// ---------- ΠΑΛΙΑ ΘΕΜΑΤΑ PDF ----------
export async function getAllPDFs() {
  const [rows] = await pool.query('SELECT * FROM PalliaThemata ORDER BY upload_date DESC, created_at DESC');
  return rows;
}

export async function getPDFById(id) {
  const [rows] = await pool.query('SELECT * FROM PalliaThemata WHERE id = ?', [id]);
  return rows[0];
}

export async function getPDFByFilename(filename) {
  const [rows] = await pool.query('SELECT * FROM PalliaThemata WHERE filename = ?', [filename]);
  return rows[0];
}

export async function createPDF(pdfData) {
  const { title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date } = pdfData;
  
  const [result] = await pool.query(
    `INSERT INTO PalliaThemata (title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, lykeio, subject, year, type, filename, description, file_data, file_size, upload_date]
  );
  
  return getPDFById(result.insertId);
}

export async function updatePDF(id, pdfData) {
  const { title, lykeio, subject, year, description, filename } = pdfData;
  
  const [result] = await pool.query(
    `UPDATE PalliaThemata 
     SET title = ?, lykeio = ?, subject = ?, year = ?, description = ?, filename = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, lykeio, subject, year, description, filename, id]
  );
  
  return result.affectedRows > 0;
}

export async function deletePDF(id) {
  const [result] = await pool.query('DELETE FROM PalliaThemata WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function filterPDFs(filters = {}) {
  let query = 'SELECT * FROM PalliaThemata WHERE 1=1';
  const params = [];
  
  if (filters.lykeio) {
    query += ' AND lykeio = ?';
    params.push(filters.lykeio);
  }
  
  if (filters.subject) {
    query += ' AND subject = ?';
    params.push(filters.subject);
  }
  
  if (filters.year) {
    query += ' AND year = ?';
    params.push(filters.year);
  }
  
  query += ' ORDER BY upload_date DESC, created_at DESC';
  
  const [rows] = await pool.query(query, params);
  return rows;
}

// ==================== VASEIS SCHOLON FUNCTIONS ====================

export async function getAllVaseisScholon() {
  const [rows] = await pool.query(`
    SELECT id, title, year, lykeio, field, description, filename, file_size, upload_date, updated_at, created_by
    FROM VaseisScholon 
    ORDER BY upload_date DESC, updated_at DESC
  `);
  
  return rows.map(row => ({
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  }));
}

export async function getVaseisScholonById(id) {
  const [rows] = await pool.query('SELECT * FROM VaseisScholon WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  };
}

export async function createVaseisScholon(vaseisData) {
  const { title, year, lykeio, field, description, filename, file_data, file_size } = vaseisData;
  
  const [result] = await pool.query(`
    INSERT INTO VaseisScholon (title, year, lykeio, field, description, filename, file_data, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, year, lykeio, field, description, filename, file_data, file_size]);
  
  return result;
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
  
  const [result] = await pool.query(`
    UPDATE VaseisScholon 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return result.affectedRows > 0;
}

export async function deleteVaseisScholon(id) {
  const [result] = await pool.query('DELETE FROM VaseisScholon WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// ==================== MIXANOGRAFIKO FUNCTIONS ====================

export async function getAllMixanografiko() {
  const [rows] = await pool.query(`
    SELECT id, title, lykeio, field, specialty, description, filename, file_size, upload_date, updated_at, created_by
    FROM Mixanografiko 
    ORDER BY upload_date DESC, updated_at DESC
  `);
  
  return rows.map(row => ({
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  }));
}

export async function getMixanografikoById(id) {
  const [rows] = await pool.query('SELECT * FROM Mixanografiko WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  
  const row = rows[0];
  return {
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  };
}

export async function createMixanografiko(mixanografikoData) {
  const { title, lykeio, field, specialty, description, filename, file_data, file_size } = mixanografikoData;
  
  const [result] = await pool.query(`
    INSERT INTO Mixanografiko (title, lykeio, field, specialty, description, filename, file_data, file_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, lykeio, field, specialty || '', description, filename, file_data, file_size]);
  
  return result;
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
  
  const [result] = await pool.query(`
    UPDATE Mixanografiko 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return result.affectedRows > 0;
}

export async function deleteMixanografiko(id) {
  const [result] = await pool.query('DELETE FROM Mixanografiko WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function filterMixanografiko(filters = {}) {
  let query = `
    SELECT id, title, lykeio, field, specialty, description, filename, file_size, upload_date, updated_at, created_by
    FROM Mixanografiko WHERE 1=1
  `;
  const params = [];
  
  if (filters.lykeio) {
    query += ' AND lykeio = ?';
    params.push(filters.lykeio);
  }
  
  if (filters.field) {
    query += ' AND field = ?';
    params.push(filters.field);
  }
  
  if (filters.specialty) {
    query += ' AND specialty = ?';
    params.push(filters.specialty);
  }
  
  query += ' ORDER BY upload_date DESC, updated_at DESC';
  
  const [rows] = await pool.query(query, params);
  
  return rows.map(row => ({
    ...row,
    upload_date: row.upload_date ? new Date(row.upload_date).toLocaleDateString('el-GR') : 'Άγνωστη',
    updated_at: row.updated_at ? new Date(row.updated_at).toLocaleDateString('el-GR') : 'Άγνωστη'
  }));
}

// ========== STUDENTS MANAGEMENT ==========

export async function getAllStudents() {
  const [rows] = await pool.query(`
    SELECT s.*, 
           GROUP_CONCAT(CONCAT(sub.name, ' ', sub.code) SEPARATOR '<br>') as subjects
    FROM Students s
    LEFT JOIN Enrollments e ON s.id = e.student_id
    LEFT JOIN Subjects sub ON e.class_id = sub.id
    GROUP BY s.id
    ORDER BY s.last_name, s.first_name
  `);
  return rows;
}

export async function getStudentById(id) {
  const [rows] = await pool.query('SELECT * FROM Students WHERE id = ?', [id]);
  return rows[0];
}

export async function createNewStudent(studentData) {
  const [result] = await pool.query(`
    INSERT INTO Students (firstName, lastName, studentClass, phone, email, parentName, parentPhone, address, birthDate, enrollmentDate, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      fields.push('first_name = ?'); 
      values.push(studentData.first_name || studentData.firstName); 
    }
    if (studentData.last_name !== undefined || studentData.lastName !== undefined) { 
      fields.push('last_name = ?'); 
      values.push(studentData.last_name || studentData.lastName); 
    }
    if (studentData.father_name !== undefined || studentData.fatherName !== undefined) { 
      fields.push('father_name = ?'); 
      values.push(studentData.father_name || studentData.fatherName); 
    }
    if (studentData.username !== undefined) { 
      fields.push('username = ?'); 
      values.push(studentData.username); 
    }
    if (studentData.class !== undefined || studentData.studentClass !== undefined) { 
      fields.push('class = ?'); 
      values.push(studentData.class || studentData.studentClass); 
    }
    if (studentData.phone !== undefined) { 
      fields.push('phone = ?'); 
      values.push(studentData.phone); 
    }
    if (studentData.email !== undefined) { 
      fields.push('email = ?'); 
      values.push(studentData.email); 
    }
    if (studentData.parentName !== undefined) { 
      fields.push('parentName = ?'); 
      values.push(studentData.parentName); 
    }
    if (studentData.parentPhone !== undefined) { 
      fields.push('parentPhone = ?'); 
      values.push(studentData.parentPhone); 
    }
    if (studentData.address !== undefined) { 
      fields.push('address = ?'); 
      values.push(studentData.address); 
    }
    if (studentData.birthDate !== undefined) { 
      fields.push('birthDate = ?'); 
      values.push(studentData.birthDate); 
    }
    if (studentData.enrollmentDate !== undefined) { 
      fields.push('enrollmentDate = ?'); 
      values.push(studentData.enrollmentDate); 
    }
    if (studentData.status !== undefined) { 
      fields.push('status = ?'); 
      values.push(studentData.status); 
    }
    if (studentData.notes !== undefined) { 
      fields.push('notes = ?'); 
      values.push(studentData.notes); 
    }
    
    console.log('📝 Fields to update:', fields.length, fields);
    console.log('📊 Values:', values);
    
    if (fields.length === 0) {
      console.log('❌ No fields to update');
      return false;
    }
    
    values.push(id);
    
    const query = `UPDATE Students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    console.log('🔍 Query:', query);
    console.log('🔍 Values:', values);
    
    const [result] = await pool.execute(query, values);
    console.log('📊 Update result:', result);
    console.log('✅ Affected rows:', result.affectedRows);
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
}

export async function deleteStudentById(id) {
  const [result] = await pool.query('DELETE FROM Students WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function searchStudents(searchTerm, classFilter) {
  let query = `
    SELECT s.*, 
           GROUP_CONCAT(CONCAT(sub.name, ' ', sub.code) SEPARATOR '<br>') as subjects
    FROM Students s
    LEFT JOIN Enrollments e ON s.id = e.student_id
    LEFT JOIN Subjects sub ON e.class_id = sub.id
    WHERE 1=1
  `;
  const params = [];
  
  if (searchTerm) {
    query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.phone LIKE ? OR s.email LIKE ?)`;
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  if (classFilter) {
    query += ` AND s.studentClass = ?`;
    params.push(classFilter);
  }
  
  query += ` GROUP BY s.id ORDER BY s.last_name, s.first_name`;
  
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function getStudentsByClass(className) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Students WHERE class = ?',
      [className]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
}

// ========== TEACHERS MANAGEMENT ==========

export async function getAllTeachers() {
  const [rows] = await pool.query(`
    SELECT t.*, 
           GROUP_CONCAT(CONCAT(s.name, ' ', s.code) SEPARATOR '<br>') as subjects
    FROM Teachers t
    LEFT JOIN Subjects s ON t.id = s.teacherId
    GROUP BY t.id
    ORDER BY t.name
  `);
  return rows;
}

export async function getTeacherById(id) {
  const [rows] = await pool.query('SELECT * FROM Teachers WHERE id = ?', [id]);
  return rows[0];
}

export async function createTeacher(teacherData) {
  const [result] = await pool.query(`
    INSERT INTO Teachers (name, subject, phone, email)
    VALUES (?, ?, ?, ?)
  `, [teacherData.name, teacherData.subject, teacherData.phone, teacherData.email]);
  return result.insertId;
}

export async function updateTeacher(id, teacherData) {
  const fields = [];
  const values = [];
  
  if (teacherData.name !== undefined) { fields.push('name = ?'); values.push(teacherData.name); }
  if (teacherData.subject !== undefined) { fields.push('subject = ?'); values.push(teacherData.subject); }
  if (teacherData.phone !== undefined) { fields.push('phone = ?'); values.push(teacherData.phone); }
  if (teacherData.email !== undefined) { fields.push('email = ?'); values.push(teacherData.email); }
  
  if (fields.length === 0) return false;
  
  values.push(id);
  
  const [result] = await pool.query(`
    UPDATE Teachers 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return result.affectedRows > 0;
}

export async function deleteTeacher(id) {
  const [result] = await pool.query('DELETE FROM Teachers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function searchTeachers(searchTerm) {
  try {
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await pool.execute(
      `SELECT t.*, 
              GROUP_CONCAT(s.name SEPARATOR ', ') as subjects
       FROM Teachers t
       LEFT JOIN Subjects s ON t.id = s.teacher_id
       WHERE t.first_name LIKE ? OR t.last_name LIKE ? OR t.phone LIKE ? OR t.email LIKE ?
       GROUP BY t.id
       ORDER BY t.first_name, t.last_name`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );
    return rows;
  } catch (error) {
    console.error('Error searching teachers:', error);
    throw error;
  }
}

// ========== SUBJECTS MANAGEMENT ==========

export async function getAllSubjects() {
  const [rows] = await pool.query(`
    SELECT * FROM Subjects
    ORDER BY class, name
  `);
  return rows;
}

export async function getSubjectById(id) {
  const [rows] = await pool.query('SELECT * FROM Subjects WHERE id = ?', [id]);
  return rows[0];
}

export async function createSubject(subjectData) {
  const [result] = await pool.query(`
    INSERT INTO Subjects (name, code, class, teacherId)
    VALUES (?, ?, ?, ?)
  `, [subjectData.name, subjectData.code, subjectData.class, subjectData.teacherId]);
  return result.insertId;
}

export async function updateSubject(id, subjectData) {
  const fields = [];
  const values = [];
  
  if (subjectData.name !== undefined) { fields.push('name = ?'); values.push(subjectData.name); }
  if (subjectData.code !== undefined) { fields.push('code = ?'); values.push(subjectData.code); }
  if (subjectData.class !== undefined) { fields.push('class = ?'); values.push(subjectData.class); }
  if (subjectData.teacherId !== undefined) { fields.push('teacherId = ?'); values.push(subjectData.teacherId); }
  
  if (fields.length === 0) return false;
  
  values.push(id);
  
  const [result] = await pool.query(`
    UPDATE Subjects 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, values);
  
  return result.affectedRows > 0;
}

export async function deleteSubject(id) {
  const [result] = await pool.query('DELETE FROM Subjects WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function searchSubjects(searchTerm) {
  try {
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await pool.execute(
      `SELECT s.*, 
              t.first_name as teacher_first_name,
              t.last_name as teacher_last_name,
              CONCAT(t.first_name, ' ', t.last_name) as teacher_name
       FROM Subjects s
       LEFT JOIN Teachers t ON s.teacher_id = t.id
       WHERE s.name LIKE ? OR s.class LIKE ? OR s.schedule LIKE ?
       ORDER BY s.name`,
      [searchPattern, searchPattern, searchPattern]
    );
    return rows;
  } catch (error) {
    console.error('Error searching subjects:', error);
    throw error;
  }
}

// ========== ENROLLMENTS MANAGEMENT ==========

export async function getStudentEnrollments(studentId) {
  const [rows] = await pool.query(`
    SELECT e.*, s.name as subjectName, s.code as subjectCode, s.class as subjectClass
    FROM Enrollments e
    JOIN Subjects s ON e.class_id = s.id
    WHERE e.student_id = ?
    ORDER BY s.name
  `, [studentId]);
  return rows;
}

export async function createEnrollment(studentId, classId) {
  try {
    const [result] = await pool.execute(`
      INSERT INTO Enrollments (student_id, class_id)
      VALUES (?, ?)
    `, [studentId, classId]);
    return result.insertId;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}

export async function deleteEnrollment(id) {
  try {
    const [result] = await pool.query('DELETE FROM Enrollments WHERE enrollment_id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    throw error;
  }
}

export async function getSubjectsNotEnrolledByStudent(studentId) {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, t.name as teacherName
      FROM Subjects s
      LEFT JOIN NewTeachers t ON s.teacherId = t.id
      WHERE s.id NOT IN (
        SELECT class_id FROM Enrollments WHERE student_id = ?
      )
      ORDER BY s.name
    `, [studentId]);
    return rows;
  } catch (error) {
    console.error('Error fetching subjects not enrolled by student:', error);
    throw error;
  }
}

export async function getAllEnrollments() {
  try {
    const [rows] = await pool.execute(
      `SELECT e.enrollment_id,
              e.student_id,
              e.class_id,
              CONCAT(st.first_name, ' ', st.last_name) as student_name,
              st.class as student_class,
              s.name as subject_name,
              s.code as subject_code,
              t.name as teacher_name
       FROM Enrollments e
       JOIN Students st ON e.student_id = st.id
       JOIN Subjects s ON e.class_id = s.id
       LEFT JOIN Teachers t ON s.teacherId = t.id
       ORDER BY st.last_name, st.first_name, s.name`
    );
    return rows;
  } catch (error) {
    console.error('Error fetching all enrollments:', error);
    throw error;
  }
}

export async function getEnrollmentsByStudent(studentId) {
  try {
    const [rows] = await pool.execute(
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
       WHERE e.student_id = ?
       ORDER BY s.name`,
      [studentId]
    );
    
    console.log(`📊 Raw query result for student ${studentId}:`, rows);
    
    // Μετατρέπουμε τα δεδομένα για συμβατότητα με το frontend
    return rows.map(row => ({
      enrollment_id: row.enrollment_id,
      student_id: row.student_id,
      class_id: row.class_id,
      subject_name: row.subject_name,
      subject_code: row.subject_code,
      subject_class: row.subject_class,
      teacher_name: row.teacher_name || 'Δεν έχει οριστεί',
      enrollment_date: null, // Δεν υπάρχει στη βάση
      status: 'active' // Default status
    }));
  } catch (error) {
    console.error('Error fetching enrollments by student:', error);
    throw error;
  }
}

export async function getEnrollmentsBySubject(subjectId) {
  try {
    const [rows] = await pool.execute(
      `SELECT e.enrollment_id,
              e.student_id,
              e.class_id as subject_id,
              CONCAT(st.first_name, ' ', st.last_name) as student_name,
              st.class as student_class,
              st.phone as student_phone
       FROM Enrollments e
       JOIN Students st ON e.student_id = st.id
       WHERE e.class_id = ?
       ORDER BY st.last_name, st.first_name`,
      [subjectId]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching enrollments by subject:', error);
    throw error;
  }
}

export async function updateEnrollment(id, enrollmentData) {
  try {
    const { studentId, classId, status, notes } = enrollmentData;
    
    const [result] = await pool.execute(
      `UPDATE Enrollments 
       SET student_id = ?, class_id = ?
       WHERE enrollment_id = ?`,
      [studentId, classId, id]
    );
    
    if (result.affectedRows === 0) {
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
        st.first_name LIKE ? OR 
        st.last_name LIKE ? OR 
        s.name LIKE ? OR 
        CONCAT(st.first_name, ' ', st.last_name) LIKE ?
      )`);
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (statusFilter && statusFilter !== 'all') {
      conditions.push('e.status = ?');
      params.push(statusFilter);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY st.last_name, st.first_name, s.name';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error searching enrollments:', error);
    throw error;
  }
}

// ==================== STUDENT CODES FUNCTIONS ====================

export async function getAllStudentCodes() {
  try {
    const [rows] = await pool.execute(
      `SELECT sc.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              s.class as student_class
       FROM StudentCodes sc
       LEFT JOIN Students s ON sc.student_id = s.id
       ORDER BY sc.created_at DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error fetching all student codes:', error);
    throw error;
  }
}

export async function getStudentCodeById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT sc.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              s.class as student_class
       FROM StudentCodes sc
       LEFT JOIN Students s ON sc.student_id = s.id
       WHERE sc.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching student code by ID:', error);
    throw error;
  }
}

export async function getStudentCodeByStudentId(studentId) {
  try {
    const [rows] = await pool.execute(
      `SELECT sc.*,
              CONCAT(s.first_name, ' ', s.last_name) as student_name,
              s.class as student_class
       FROM StudentCodes sc
       LEFT JOIN Students s ON sc.student_id = s.id
       WHERE sc.student_id = ?`,
      [studentId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching student code by student ID:', error);
    throw error;
  }
}

export async function createStudentCode(studentCodeData) {
  try {
    const { student_id, code, password_hash, status } = studentCodeData;
    
    const [result] = await pool.execute(
      `INSERT INTO StudentCodes (student_id, code, password_hash, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [student_id, code, password_hash, status || 'active']
    );
    
    return { id: result.insertId, ...studentCodeData };
  } catch (error) {
    console.error('Error creating student code:', error);
    throw error;
  }
}

export async function updateStudentCode(id, studentCodeData) {
  try {
    const { student_id, code, password_hash, status } = studentCodeData;
    
    const [result] = await pool.execute(
      `UPDATE StudentCodes 
       SET student_id = ?, code = ?, password_hash = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [student_id, code, password_hash, status, id]
    );
    
    if (result.affectedRows === 0) {
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
    const [result] = await pool.execute('DELETE FROM StudentCodes WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
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
        s.first_name LIKE ? OR 
        s.last_name LIKE ? OR 
        sc.code LIKE ? OR 
        CONCAT(s.first_name, ' ', s.last_name) LIKE ?
      )`);
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (statusFilter && statusFilter !== 'all') {
      conditions.push('sc.status = ?');
      params.push(statusFilter);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY sc.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
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
      
      const [result] = await pool.execute(
        `INSERT INTO StudentCodes (student_id, code, password_hash, status, created_at, updated_at)
         VALUES (?, ?, ?, 'active', NOW(), NOW())`,
        [studentId, code, password_hash]
      );
      
      createdCodes.push({
        id: result.insertId,
        student_id: studentId,
        code: code,
        password: password, // Return plain password for initial setup
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
      [adminRows] = await pool.execute(
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
      [studentRows] = await pool.execute(
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
      [result] = await pool.execute(
        'UPDATE Admins SET password_hash = ? WHERE username = ?',
        [password_hash, username]
      );
    } else {
      [result] = await pool.execute(
        'UPDATE Students SET password_hash = ? WHERE username = ?',
        [password_hash, username]
      );
    }
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
    
    // Ενημερώνουμε τον πίνακα με τους plain text κωδικούς για admin view
    await pool.execute(
      `INSERT INTO UserPasswordsView (username, plain_password, user_type) 
       VALUES (?, ?, ?) 
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
    const [rows] = await pool.execute(
      'SELECT * FROM Students WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting student by username:', error);
    throw error;
  }
}

// ---------- CREATE STUDENT COMPLETE FUNCTION ----------

// Enhanced function to create student with all fields
export async function createStudentComplete(studentData) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert into Students table
    const [result] = await connection.execute(
      `INSERT INTO Students (
        first_name, last_name, father_name, username, password_hash,
        class, phone, email, parentName, parentPhone, address,
        birthDate, enrollmentDate, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    
    const studentId = result.insertId;
    
    // Also insert into OldStudents for foreign key compatibility
    await connection.execute(
      `INSERT INTO OldStudents (student_id, first_name, last_name, father_name, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        studentData.first_name,
        studentData.last_name,
        studentData.father_name,
        studentData.username,
        studentData.password_hash
      ]
    );
    
    await connection.commit();
    console.log(`✅ Student created with ID: ${studentId}`);
    
    return studentId;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error creating student:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// ==================== PASSWORD MANAGEMENT ====================

// Απλή συνάρτηση για όλες τις ανακοινώσεις (για αρχική σελίδα)
export async function getAllAnnouncements() {
  try {
    const [rows] = await pool.query(
      `SELECT 
        notification_id, title, content, created_at, updated_at,
        pdf_attachment, external_link, priority
      FROM Notifications 
      WHERE is_active = TRUE
      ORDER BY created_at DESC`,
      []
    );
    return rows;
  } catch (error) {
    console.error('Error in getAllAnnouncements:', error);
    throw error;
  }
}

// Δημιουργία νέας ανακοίνωσης (απλοποιημένη)
export async function createAnnouncementSimple(title, content, admin_id) {
  try {
    const [result] = await pool.query(
      `INSERT INTO Notifications (title, content, created_by, is_active, created_at)
       VALUES (?, ?, ?, TRUE, NOW())`,
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
    const [rows] = await pool.query(`
      SELECT 
        id, school_id, school_name, university, position_type, scientific_field,
        min_moria, max_moria, field_code, school_type, avg_score,
        upload_date, updated_at, uploaded_by, file_type, batch_id
      FROM SchoolsData 
      ORDER BY upload_date DESC, school_name ASC
    `);
    return rows;
  } catch (error) {
    console.error('Error getting all schools data:', error);
    throw error;
  }
}

// Get schools data by school type (gel/epal)
export async function getSchoolsDataByType(schoolType) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, school_id, school_name, university, position_type, scientific_field,
        min_moria, max_moria, field_code, school_type, avg_score,
        upload_date, updated_at, uploaded_by, file_type, batch_id
      FROM SchoolsData 
      WHERE school_type = ?
      ORDER BY school_name ASC
    `, [schoolType]);
    return rows;
  } catch (error) {
    console.error('Error getting schools data by type:', error);
    throw error;
  }
}

// Clear all existing schools data and insert new batch
export async function replaceAllSchoolsData(schoolsArray, uploadedBy = 'admin', fileType = 'unknown') {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Generate unique batch ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear existing data
    await connection.query('DELETE FROM SchoolsData');
    console.log('Cleared existing schools data');
    
    // Insert new data
    if (schoolsArray && schoolsArray.length > 0) {
      const insertQuery = `
        INSERT INTO SchoolsData (
          school_id, school_name, university, position_type, scientific_field,
          min_moria, max_moria, field_code, school_type, avg_score,
          uploaded_by, file_type, batch_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      for (const school of schoolsArray) {
        await connection.query(insertQuery, [
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
    
    await connection.commit();
    return { success: true, batchId, count: schoolsArray.length };
    
  } catch (error) {
    await connection.rollback();
    console.error('Error replacing schools data:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Get schools data formatted for moria calculator
export async function getSchoolsDataForCalculator() {
  try {
    const [rows] = await pool.query(`
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
    return rows;
  } catch (error) {
    console.error('Error getting schools data for calculator:', error);
    throw error;
  }
}

// Delete all schools data
export async function clearAllSchoolsData() {
  try {
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
    const [result] = await pool.query(
      `INSERT INTO CalculatorTemplates 
       (filename, original_name, template_type, file_data, file_size, mimetype, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    const [rows] = await pool.query(
      `SELECT id, filename, original_name, template_type, file_size, mimetype, 
              upload_date, created_by 
       FROM CalculatorTemplates 
       ORDER BY upload_date DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error getting calculator templates:', error);
    throw error;
  }
}

// Λήψη συγκεκριμένου calculator template με τα δεδομένα του αρχείου
export async function getCalculatorTemplate(filename) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM CalculatorTemplates WHERE filename = ?`,
      [filename]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting calculator template:', error);
    throw error;
  }
}

// Λήψη calculator template μόνο με metadata (χωρίς τα δεδομένα του αρχείου)
export async function getCalculatorTemplateMetadata(filename) {
  try {
    const [rows] = await pool.query(
      `SELECT id, filename, original_name, template_type, file_size, mimetype, 
              upload_date, created_by 
       FROM CalculatorTemplates 
       WHERE filename = ?`,
      [filename]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting calculator template metadata:', error);
    throw error;
  }
}

// Διαγραφή calculator template
export async function deleteCalculatorTemplate(filename) {
  try {
    const [result] = await pool.query(
      `DELETE FROM CalculatorTemplates WHERE filename = ?`,
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
  await pool.query(
    `INSERT INTO CalendarEvents (student_id, subject_id, event_title, event_type, event_date, event_time, event_text)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [student_id, subject_id, event_title, event_type, event_date, event_time, event_text]
  );
}