CREATE TABLE AdminUsers (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) DEFAULT 'admin',
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Admins (
  admin_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE CalculatorTemplates (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL,
  file_data BYTEA NOT NULL,
  file_size INT NOT NULL,
  mimetype VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'admin'
);

CREATE TABLE CalendarEvents (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  event_text VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  event_title VARCHAR(255),
  event_type VARCHAR(100),
  event_time VARCHAR(10),
  FOREIGN KEY (student_id) REFERENCES Students(id),
  FOREIGN KEY (subject_id) REFERENCES Subjects(id)
);

CREATE TABLE Classes (
  class_id SERIAL PRIMARY KEY,
  class_name VARCHAR(50),
  course_id INT,
  teacher_id INT,
  FOREIGN KEY (course_id) REFERENCES Courses(course_id),
  FOREIGN KEY (teacher_id) REFERENCES OldTeachers(teacher_id)
);

CREATE TABLE Courses (
  course_id SERIAL PRIMARY KEY,
  course_name VARCHAR(100),
  description TEXT
);

CREATE TABLE Enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  student_id INT,
  class_id INT,
  FOREIGN KEY (student_id) REFERENCES Students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES Subjects(id) ON DELETE CASCADE 
);

CREATE TABLE Files (
  file_id SERIAL PRIMARY KEY,
  file_name VARCHAR(255),
  file_path VARCHAR(255),
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT
);

CREATE TABLE Grades (
  grade_id SERIAL PRIMARY KEY,
  enrollment_id INT,
  grade FLOAT,
  comments TEXT,
  date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES Enrollments(enrollment_id)
);

CREATE TABLE Mixanografiko (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  lykeio VARCHAR(10) NOT NULL,
  field VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) DEFAULT '',
  description TEXT,
  filename VARCHAR(255) NOT NULL,
  file_data BYTEA NOT NULL,
  file_size VARCHAR(50) DEFAULT NULL,
  upload_date DATE DEFAULT (curdate()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT DEFAULT '1'
);

CREATE TABLE NewStudents (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100) DEFAULT NULL,
  username VARCHAR(50) DEFAULT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  class VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  parentName VARCHAR(255) DEFAULT NULL,
  parentPhone VARCHAR(20) DEFAULT NULL,
  address TEXT,
  birthDate DATE DEFAULT NULL,
  enrollmentDate DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE NewTeachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
  notification_id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  content TEXT,
  notification_type VARCHAR(20) DEFAULT 'general',
  target_class VARCHAR(50) DEFAULT NULL,
  target_subject_id INT DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  is_active BOOLEAN DEFAULT TRUE,
  pdf_attachment VARCHAR(255) DEFAULT NULL,
  external_link VARCHAR(500) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT DEFAULT NULL
);

CREATE TABLE OldStudents (
  student_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) DEFAULT NULL,
  last_name VARCHAR(50) DEFAULT NULL,
  father_name VARCHAR(50) DEFAULT NULL,
  username VARCHAR(50) DEFAULT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE OldTeachers (
  teacher_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) DEFAULT NULL,
  last_name VARCHAR(50) DEFAULT NULL,
  username VARCHAR(50) DEFAULT NULL,
  password_hash VARCHAR(255) DEFAULT NULL
);

CREATE TABLE PalliaThemata (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  lykeio VARCHAR(10) NOT NULL DEFAULT 'ΓΕΛ',
  subject VARCHAR(100) NOT NULL,
  year VARCHAR(4) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Θέματα',
  filename VARCHAR(255) NOT NULL,
  description TEXT,
  file_data BYTEA,
  file_size VARCHAR(20) DEFAULT NULL,
  upload_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ProgressNotes (
  note_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  note TEXT NOT NULL,
  date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES OldStudents(student_id),
  FOREIGN KEY (class_id) REFERENCES Classes(class_id),
  FOREIGN KEY (teacher_id) REFERENCES OldTeachers(teacher_id)
);

CREATE TABLE SchoolsData (
  id SERIAL PRIMARY KEY,
  school_id VARCHAR(20) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  university VARCHAR(255) NOT NULL,
  position_type VARCHAR(100) NOT NULL,
  scientific_field VARCHAR(255) NOT NULL,
  min_moria INT DEFAULT '0',
  max_moria INT DEFAULT '0',
  field_code VARCHAR(50) NOT NULL,
  school_type VARCHAR(10) NOT NULL,
  avg_score INT DEFAULT '0',
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(100) DEFAULT 'admin',
  file_type VARCHAR(20) DEFAULT 'unknown',
  batch_id VARCHAR(100) DEFAULT NULL
);

CREATE TABLE StudentCalendar (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL,
  eventType VARCHAR(20) NOT NULL,
  subjectId INT DEFAULT NULL,
  eventTitle VARCHAR(255) NOT NULL,
  eventDescription TEXT,
  eventDate DATE NOT NULL,
  eventTime TIME DEFAULT NULL,
  teacherId INT DEFAULT NULL,
  isVisible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE StudentCodes (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  lastLogin TIMESTAMP DEFAULT NULL,
  createdDate DATE NOT NULL,
  expiryDate DATE DEFAULT NULL,
  maxSessions INT DEFAULT '5',
  currentSessions INT DEFAULT '0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE StudentProgress (
  id SERIAL PRIMARY KEY,
  studentId INT NOT NULL,
  subjectId INT NOT NULL,
  progressDate DATE NOT NULL,
  progressNote TEXT NOT NULL,
  progressRating VARCHAR(20) DEFAULT NULL,
  teacherId INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100) DEFAULT NULL,
  username VARCHAR(50) DEFAULT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  class VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  parentName VARCHAR(255) DEFAULT NULL,
  parentPhone VARCHAR(20) DEFAULT NULL,
  address TEXT,
  birthDate DATE DEFAULT NULL,
  enrollmentDate DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL,
  class VARCHAR(50) NOT NULL,
  teacherId INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserPasswordsView (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  plain_password VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) DEFAULT NULL,
  last_name VARCHAR(50) DEFAULT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student'
);

CREATE TABLE VaseisScholon (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  year VARCHAR(4) NOT NULL,
  lykeio VARCHAR(10) NOT NULL,
  field VARCHAR(100) NOT NULL,
  description TEXT,
  filename VARCHAR(255) NOT NULL,
  file_data BYTEA NOT NULL,
  file_size VARCHAR(20) DEFAULT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) DEFAULT 'admin'
);

CREATE TABLE calendar_entries (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT DEFAULT NULL,
  entry_date DATE NOT NULL,
  event_type VARCHAR(100) DEFAULT 'Ενημέρωση',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT DEFAULT NULL,
  exam_type VARCHAR(100) DEFAULT 'Διαγώνισμα',
  grade DECIMAL(4,2) NOT NULL,
  exam_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programms (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  hour INT NOT NULL,
  type VARCHAR(50) DEFAULT NULL,
  field VARCHAR(64) DEFAULT NULL
);

CREATE TABLE progress_notes (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT DEFAULT NULL,
  note_date DATE NOT NULL,
  content TEXT NOT NULL,
  performance_level VARCHAR(20) DEFAULT 'average',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) DEFAULT NULL,
  class VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



