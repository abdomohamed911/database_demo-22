-- User table (must be first since other tables reference it)
INSERT INTO `User` (`ssn`, `name`, `email`, `address`, `date_of_birth`) 
VALUES ('U001', 'Abdelrahman Ibrahim', 'abdelrahman@aiu.edu.eg', 'Alamein', '2002-03-15');
INSERT INTO `User` (`ssn`, `name`, `email`, `address`, `date_of_birth`) 
VALUES ('U002', 'Ahmed Abouzied', 'ahmed@aiu.edu.eg', 'Alexandria', '2001-07-11');
INSERT INTO `User` (`ssn`, `name`, `email`, `address`, `date_of_birth`) 
VALUES ('U003', 'Youssef Said', 'youssef@aiu.edu.eg', 'Cairo', '2002-01-20');
INSERT INTO `User` (`ssn`, `name`, `email`, `address`, `date_of_birth`) 
VALUES ('U004', 'Laila Ashraf', 'laila@aiu.edu.eg', 'Mansoura', '2003-05-25');
INSERT INTO `User` (`ssn`, `name`, `email`, `address`, `date_of_birth`) 
VALUES ('U005', 'Omar Tarek', 'omar@aiu.edu.eg', 'Tanta', '2001-12-05');
INSERT INTO `User` (`ssn`, `name`, `email`, `address`, `date_of_birth`) 
VALUES ('U006', 'Nourhan Ali', 'nourhan@aiu.edu.eg', 'Assiut', '2002-09-17');

-- Phone table (references User)
INSERT INTO `Phone` (`phone_id`, `phone_number`, `ssn`) VALUES (1, 1012345601, 'U001');
INSERT INTO `Phone` (`phone_id`, `phone_number`, `ssn`) VALUES (2, 1012345602, 'U002');
INSERT INTO `Phone` (`phone_id`, `phone_number`, `ssn`) VALUES (3, 1012345603, 'U003');
INSERT INTO `Phone` (`phone_id`, `phone_number`, `ssn`) VALUES (4, 1012345604, 'U004');
INSERT INTO `Phone` (`phone_id`, `phone_number`, `ssn`) VALUES (5, 1012345605, 'U005');
INSERT INTO `Phone` (`phone_id`, `phone_number`, `ssn`) VALUES (6, 1012345606, 'U006');

-- Admin table (references User)
INSERT INTO `Admin` (`a_id`, `ssn`) VALUES (1, 'U005');
INSERT INTO `Admin` (`a_id`, `ssn`) VALUES (2, 'U006');

-- InternshipCoordinator table (references User)
INSERT INTO `InternshipCoordinator` (`ic_id`, `ssn`, `name`, `email`) 
VALUES (1, 'U005', 'Omar Tarek', 'omar@aiu.edu.eg');
INSERT INTO `InternshipCoordinator` (`ic_id`, `ssn`, `name`, `email`) 
VALUES (2, 'U006', 'Nourhan Ali', 'nourhan@aiu.edu.eg');

-- InternshipEvaluator table (references User)
INSERT INTO `InternshipEvaluator` (`ie_id`, `ssn`, `name`, `email`) 
VALUES (1, 'U001', 'Dr. Abdelrahman', 'abdelrahman@aiu.edu.eg');
INSERT INTO `InternshipEvaluator` (`ie_id`, `ssn`, `name`, `email`) 
VALUES (2, 'U002', 'Dr. Ahmed', 'ahmed@aiu.edu.eg');

-- Mentor table (references User)
INSERT INTO `Mentor` (`m_id`, `ssn`, `type`, `position`, `company_name`) 
VALUES (1, 'U003', 'Academic', 'Lecturer', 'AIU');
INSERT INTO `Mentor` (`m_id`, `ssn`, `type`, `position`, `company_name`) 
VALUES (2, 'U004', 'External', 'Supervisor', 'Vodafone Egypt');

-- Student table (references User, InternshipEvaluator, Mentor, InternshipCoordinator)
INSERT INTO `Student` (`student_id`, `ssn`, `level`, `ie_id`, `m_id`, `ic_id`) 
VALUES (23101417, 'U001', 4, 1, 1, 1);
INSERT INTO `Student` (`student_id`, `ssn`, `level`, `ie_id`, `m_id`, `ic_id`) 
VALUES (23101548, 'U002', 4, 2, 2, 2);

-- Internship table (references Student, InternshipEvaluator, InternshipCoordinator)
INSERT INTO `Internship` (`int_number`, `status`, `start_date`, `end_date`, `duration`, `s_id`, `ie_id`, `ic_id`, `company_name`) 
VALUES (1001, 'Approved', '2025-02-01', '2025-05-01', 90, 23101417, 1, 1, 'AIU');
INSERT INTO `Internship` (`int_number`, `status`, `start_date`, `end_date`, `duration`, `s_id`, `ie_id`, `ic_id`, `company_name`) 
VALUES (1002, 'Pending', '2025-03-01', '2025-06-01', 92, 23101548, 2, 2, 'Vodafone Egypt');

-- StudentInternship table (references Student, Internship, InternshipEvaluator, InternshipCoordinator)
INSERT INTO `StudentInternship` (`si_id`, `s_id`, `int_number`, `ie_id`, `ic_id`) 
VALUES (1, 23101417, 1001, 1, 1);
INSERT INTO `StudentInternship` (`si_id`, `s_id`, `int_number`, `ie_id`, `ic_id`) 
VALUES (2, 23101548, 1002, 2, 2);

-- Evaluation table (references InternshipEvaluator, InternshipCoordinator, Student)
INSERT INTO `Evaluation` (`ev_id`, `final_grade`, `comments`, `performance_score`, `ie_id`, `ic_id`, `s_id`) 
VALUES (1, 'A', 'Outstanding contribution at internship site.', 97, 1, 1, 23101417);
INSERT INTO `Evaluation` (`ev_id`, `final_grade`, `comments`, `performance_score`, `ie_id`, `ic_id`, `s_id`) 
VALUES (2, 'B+', 'Good performance but needs to improve punctuality.', 85, 2, 2, 23101548);
