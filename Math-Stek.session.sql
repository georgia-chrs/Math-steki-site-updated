CREATE TABLE `AdminUsers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Username διαχειριστή',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Κωδικός πρόσβασης (hashed)',    
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Πλήρες όνομα διαχειριστή',      
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email διαχειριστή',
  `role` enum('admin','teacher','super_admin') COLLATE utf8mb4_unicode_ci DEFAULT 'admin' COMMENT 'Ρόλος χρήστη',
  `isActive` tinyint(1) DEFAULT '1' COMMENT 'Αν ο λογαριασμός είναι ενεργός',
  `lastLogin` timestamp NULL DEFAULT NULL COMMENT 'Τελευταία σύνδεση',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_active` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας διαχειριστών συστήματος';

CREATE TABLE `Admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `CalculatorTemplates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Όνομα αρχείου που αποθηκεύεται',
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Αρχικό όνομα αρχείου',     
  `template_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τύπος template (π.χ. anthropistikes, thetikes, κλπ)',
  `file_data` longblob NOT NULL COMMENT 'Δεδομένα του Excel αρχείου',
  `file_size` int NOT NULL COMMENT 'Μέγεθος αρχείου σε bytes',
  `mimetype` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'MIME type του αρχείου',
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ημερομηνία ανεβάσματος',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ημερομηνία δημιουργίας',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ημερομηνία τελευταίας ενημέρωσης',
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'admin' COMMENT 'Χρήστης που ανέβασε το αρχείο',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_filename` (`filename`),
  KEY `idx_template_type` (`template_type`),
  KEY `idx_upload_date` (`upload_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας για αποθήκευση Excel templates του calculator';

CREATE TABLE `CalendarEvents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `event_text` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `event_title` varchar(255) DEFAULT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `event_time` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `CalendarEvents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Students` (`id`),
  CONSTRAINT `CalendarEvents_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `Subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  PRIMARY KEY (`class_id`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `Classes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `Courses` (`course_id`),
  CONSTRAINT `Classes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `OldTeachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Enrollments` (
  `enrollment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  PRIMARY KEY (`enrollment_id`),
  KEY `Enrollments_ibfk_2` (`class_id`),
  KEY `Enrollments_ibfk_1` (`student_id`),
  CONSTRAINT `Enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Enrollments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `Subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Files` (
  `file_id` int NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `Files_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `Admins` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Grades` (
  `grade_id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int DEFAULT NULL,
  `grade` float DEFAULT NULL,
  `comments` text,
  `date_recorded` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`grade_id`),
  KEY `enrollment_id` (`enrollment_id`),
  CONSTRAINT `Grades_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `Enrollments` (`enrollment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Mixanografiko` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `lykeio` enum('ΓΕΛ','ΕΠΑΛ') NOT NULL,
  `field` varchar(255) NOT NULL,
  `specialty` varchar(255) DEFAULT '',
  `description` text,
  `filename` varchar(255) NOT NULL,
  `file_data` longblob NOT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `upload_date` date DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_lykeio` (`lykeio`),
  KEY `idx_field` (`field`),
  KEY `idx_specialty` (`specialty`),
  KEY `idx_upload_date` (`upload_date`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `NewStudents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Όνομα μαθητή',
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Επώνυμο μαθητή',
  `father_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Όνομα πατέρα',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Username για login',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Κρυπτογραφημένος κωδικός',
  `class` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τάξη μαθητή',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τηλέφωνο μαθητή',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email μαθητή',
  `parentName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Όνομα γονέα',
  `parentPhone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Τηλέφωνο γονέα',
  `address` text COLLATE utf8mb4_unicode_ci COMMENT 'Διεύθυνση κατοικίας',
  `birthDate` date DEFAULT NULL COMMENT 'Ημερομηνία γέννησης',
  `enrollmentDate` date NOT NULL COMMENT 'Ημερομηνία εγγραφής',
  `status` enum('active','inactive','graduated') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'Κατάσταση μαθητή',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Σημειώσεις για τον μαθητή',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_phone` (`phone`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `unique_username` (`username`),
  KEY `idx_class` (`class`),
  KEY `idx_status` (`status`),
  KEY `idx_enrollment_date` (`enrollmentDate`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας μαθητών';

CREATE TABLE `NewTeachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Πλήρες όνομα καθηγητή',
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ειδικότητα/Μάθημα',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Τηλέφωνο επικοινωνίας',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email επικοινωνίας',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_subject` (`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας καθηγητών';

CREATE TABLE `Notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `content` text,
  `notification_type` enum('general','class','subject') DEFAULT 'general' COMMENT 'Τύπος ανακοίνωσης', 
  `target_class` varchar(50) DEFAULT NULL COMMENT 'Στόχος τάξη (αν είναι class type)',
  `target_subject_id` int DEFAULT NULL COMMENT 'Στόχος τμήμα/μάθημα (αν είναι subject type)',
  `start_date` date DEFAULT NULL COMMENT 'Ημερομηνία έναρξης εμφάνισης',
  `end_date` date DEFAULT NULL COMMENT 'Ημερομηνία λήξης εμφάνισης',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal' COMMENT 'Προτεραιότητα ανακοίνωσης',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Ενεργή ανακοίνωση',
  `pdf_attachment` varchar(255) DEFAULT NULL COMMENT 'Διαδρομή αρχείου PDF',
  `external_link` varchar(500) DEFAULT NULL COMMENT 'Εξωτερικός σύνδεσμος',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ημερομηνία τελευταίας ενημέρωσης',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_target_class` (`target_class`),
  KEY `idx_target_subject` (`target_subject_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `Admins` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `OldStudents` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `father_name` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `OldTeachers` (
  `teacher_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PalliaThemata` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `lykeio` enum('ΓΕΛ','ΕΠΑΛ') NOT NULL DEFAULT 'ΓΕΛ',
  `subject` varchar(100) NOT NULL,
  `year` varchar(4) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'Θέματα',
  `filename` varchar(255) NOT NULL,
  `description` text,
  `file_data` longblob,
  `file_size` varchar(20) DEFAULT NULL,
  `upload_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `filename` (`filename`),
  KEY `idx_lykeio_subject_year` (`lykeio`,`subject`,`year`),
  KEY `idx_subject` (`subject`),
  KEY `idx_year` (`year`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ProgressNotes` (
  `note_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `class_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `note` text NOT NULL,
  `date_recorded` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`note_id`),
  KEY `student_id` (`student_id`),
  KEY `class_id` (`class_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `ProgressNotes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `OldStudents` (`student_id`),
  CONSTRAINT `ProgressNotes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `Classes` (`class_id`),        
  CONSTRAINT `ProgressNotes_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `OldTeachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `SchoolsData` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `school_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `university` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scientific_field` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_moria` int DEFAULT '0',
  `max_moria` int DEFAULT '0',
  `field_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `school_type` enum('gel','epal') COLLATE utf8mb4_unicode_ci NOT NULL,
  `avg_score` int DEFAULT '0',
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uploaded_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `file_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'unknown',
  `batch_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_school_id` (`school_id`),
  KEY `idx_school_type` (`school_type`),
  KEY `idx_field_code` (`field_code`),
  KEY `idx_scientific_field` (`scientific_field`),
  KEY `idx_position_type` (`position_type`),
  KEY `idx_upload_date` (`upload_date`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_moria_range` (`min_moria`,`max_moria`),
  KEY `idx_search_combo` (`school_type`,`field_code`,`min_moria`)
) ENGINE=InnoDB AUTO_INCREMENT=3472 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `StudentCalendar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL COMMENT 'ID μαθητή',
  `eventType` enum('makeup_class','exam','meeting','absence','extra_class','other') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τύπος γεγονότος',
  `subjectId` int DEFAULT NULL COMMENT 'ID μαθήματος (προαιρετικό)',
  `eventTitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τίτλος γεγονότος',
  `eventDescription` text COLLATE utf8mb4_unicode_ci COMMENT 'Περιγραφή γεγονότος',
  `eventDate` date NOT NULL COMMENT 'Ημερομηνία γεγονότος',
  `eventTime` time DEFAULT NULL COMMENT 'Ώρα γεγονότος',
  `teacherId` int DEFAULT NULL COMMENT 'ID καθηγητή που δημιούργησε το γεγονός',
  `isVisible` tinyint(1) DEFAULT '1' COMMENT 'Αν είναι ορατό στον μαθητή',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacherId` (`teacherId`),
  KEY `idx_student` (`studentId`),
  KEY `idx_event_date` (`eventDate`),
  KEY `idx_event_type` (`eventType`),
  KEY `idx_subject` (`subjectId`),
  CONSTRAINT `StudentCalendar_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `Students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `StudentCalendar_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `Subjects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `StudentCalendar_ibfk_3` FOREIGN KEY (`teacherId`) REFERENCES `Teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας ημερολογίου μαθητών';

CREATE TABLE `StudentCodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL COMMENT 'ID μαθητή',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Username για σύνδεση',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Κωδικός πρόσβασης (hashed)',    
  `status` enum('active','inactive','expired') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'Κατάσταση κωδικού',
  `lastLogin` timestamp NULL DEFAULT NULL COMMENT 'Τελευταία σύνδεση',
  `createdDate` date NOT NULL COMMENT 'Ημερομηνία δημιουργίας',
  `expiryDate` date DEFAULT NULL COMMENT 'Ημερομηνία λήξης',
  `maxSessions` int DEFAULT '5' COMMENT 'Μέγιστος αριθμός συνεδριών',
  `currentSessions` int DEFAULT '0' COMMENT 'Τρέχουσες ενεργές συνεδρίες',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_student` (`studentId`),
  KEY `idx_status` (`status`),
  KEY `idx_expiry` (`expiryDate`),
  CONSTRAINT `StudentCodes_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `NewStudents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας κωδικών πρόσβασης μαθητών';

CREATE TABLE `StudentProgress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL COMMENT 'ID μαθητή',
  `subjectId` int NOT NULL COMMENT 'ID μαθήματος',
  `progressDate` date NOT NULL COMMENT 'Ημερομηνία καταγραφής προόδου',
  `progressNote` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Σημείωση προόδου',
  `progressRating` enum('excellent','good','average','needs_improvement') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Αξιολόγηση προόδου',
  `teacherId` int DEFAULT NULL COMMENT 'ID καθηγητή που έκανε την καταγραφή',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `teacherId` (`teacherId`),
  KEY `idx_student` (`studentId`),
  KEY `idx_subject` (`subjectId`),
  KEY `idx_progress_date` (`progressDate`),
  KEY `idx_progress_rating` (`progressRating`),
  CONSTRAINT `StudentProgress_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `Students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `StudentProgress_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `Subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `StudentProgress_ibfk_3` FOREIGN KEY (`teacherId`) REFERENCES `Teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας προόδου μαθητών';

CREATE TABLE `Students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Όνομα μαθητή',
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Επώνυμο μαθητή',
  `father_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Όνομα πατέρα',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Username για login',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Κρυπτογραφημένος κωδικός',
  `class` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τάξη μαθητή',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τηλέφωνο μαθητή',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email μαθητή',
  `parentName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Όνομα γονέα',
  `parentPhone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Τηλέφωνο γονέα',
  `address` text COLLATE utf8mb4_unicode_ci COMMENT 'Διεύθυνση κατοικίας',
  `birthDate` date DEFAULT NULL COMMENT 'Ημερομηνία γέννησης',
  `enrollmentDate` date NOT NULL COMMENT 'Ημερομηνία εγγραφής',
  `status` enum('active','inactive','graduated') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT 'Κατάσταση μαθητή',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Σημειώσεις για τον μαθητή',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_phone` (`phone`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `unique_username` (`username`),
  KEY `idx_class` (`class`),
  KEY `idx_status` (`status`),
  KEY `idx_enrollment_date` (`enrollmentDate`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας μαθητών';

CREATE TABLE `Subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Όνομα μαθήματος',
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Κωδικός τμήματος',
  `class` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τάξη που αφορά',
  `teacherId` int DEFAULT NULL COMMENT 'ID καθηγητή που διδάσκει',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_class` (`class`),
  KEY `idx_teacher` (`teacherId`),
  CONSTRAINT `Subjects_ibfk_1` FOREIGN KEY (`teacherId`) REFERENCES `Teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας τμημάτων/μαθημάτων';

CREATE TABLE `Teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Πλήρες όνομα καθηγητή',
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ειδικότητα/Μάθημα',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Τηλέφωνο επικοινωνίας',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email επικοινωνίας',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_subject` (`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας καθηγητών';

CREATE TABLE `UserPasswordsView` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plain_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('admin','student') COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_user_type` (`user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας plain text κωδικών για admin view';

CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') DEFAULT 'student',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `VaseisScholon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τίτλος του αρχείου',
  `year` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Έτος (π.χ. 2024)',
  `lykeio` enum('ΓΕΛ','ΕΠΑΛ') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Τύπος λυκείου',
  `field` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Πεδίο σπουδών',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Περιγραφή του αρχείου',
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Όνομα αρχείου',
  `file_data` longblob NOT NULL COMMENT 'Δεδομένα PDF αρχείου',
  `file_size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Μέγεθος αρχείου (π.χ. 1.2 MB)',
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ημερομηνία ανεβάσματος',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ημερομηνία τελευταίας ενημέρωσης',
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'admin' COMMENT 'Χρήστης που ανέβασε το αρχείο',
  PRIMARY KEY (`id`),
  KEY `idx_year` (`year`),
  KEY `idx_lykeio` (`lykeio`),
  KEY `idx_field` (`field`),
  KEY `idx_upload_date` (`upload_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Πίνακας για αποθήκευση PDF αρχείων βάσεων σχολών';

CREATE TABLE `calendar_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `subject_id` int DEFAULT NULL,
  `entry_date` date NOT NULL,
  `event_type` varchar(100) DEFAULT 'Ενημέρωση',
  `title` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `subject_id` int DEFAULT NULL,
  `exam_type` varchar(100) DEFAULT 'Διαγώνισμα',
  `grade` decimal(4,2) NOT NULL,
  `exam_date` date NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `programms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section` varchar(100) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `hour` int NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `field` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `progress_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `subject_id` int DEFAULT NULL,
  `note_date` date NOT NULL,
  `content` text NOT NULL,
  `performance_level` enum('excellent','good','average','poor') DEFAULT 'average',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `class` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



