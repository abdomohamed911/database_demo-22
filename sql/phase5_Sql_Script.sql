-- VIEW 1: StudentView
CREATE OR REPLACE VIEW StudentView AS
SELECT 
    s.student_id,
    u.name AS full_name,
    u.email,
    e.final_grade AS grade,
    i.company_name,
    m.position AS mentor_position,
    m.type AS mentor_type
FROM Student s
JOIN User u ON s.ssn = u.ssn
JOIN Evaluation e ON s.student_id = e.s_id
JOIN Internship i ON s.student_id = i.s_id
JOIN Mentor m ON s.m_id = m.m_id;


-- VIEW 2: CoordinatorView
CREATE OR REPLACE VIEW CoordinatorView AS
SELECT 
    ic.name AS coordinator_name,
    u.name AS student_name,
    e.final_grade AS report_grade
FROM InternshipCoordinator ic
JOIN Internship i ON ic.ic_id = i.ic_id
JOIN Student s ON i.s_id = s.student_id
JOIN Evaluation e ON s.student_id = e.s_id
JOIN User u ON s.ssn = u.ssn;


-- VIEW 3: AdminView
CREATE OR REPLACE VIEW AdminView AS
SELECT 
    s.student_id,
    u.name AS student_name,
    u.email,
    e.final_grade AS grade,
    m.position AS mentor_position,
    i.company_name,
    i.start_date,
    i.end_date,
    e.comments AS evaluation_comments
FROM Student s
JOIN User u ON s.ssn = u.ssn
JOIN Evaluation e ON s.student_id = e.s_id
JOIN Internship i ON s.student_id = i.s_id
JOIN Mentor m ON s.m_id = m.m_id;


-- BUSINESS QUERIES

-- 1. Internship with highest grade
SELECT i.company_name, MAX(e.final_grade) AS highest_grade
FROM Evaluation e
JOIN Internship i ON e.s_id = i.s_id
GROUP BY i.company_name
ORDER BY highest_grade DESC
LIMIT 1;

-- 2. Most selected mentor by high-score students
SELECT m.position, COUNT(*) AS count
FROM Mentor m
JOIN Student s ON m.m_id = s.m_id
JOIN Evaluation e ON s.student_id = e.s_id
WHERE e.final_grade IN ('A', 'A+')
GROUP BY m.position
ORDER BY count DESC;

-- 3. Number of students per internship coordinator
SELECT ic.name AS coordinator_name, COUNT(DISTINCT s.student_id) AS total_students
FROM InternshipCoordinator ic
JOIN Internship i ON ic.ic_id = i.ic_id
JOIN Student s ON i.s_id = s.student_id
GROUP BY ic.name;

-- 4. External evaluations and internal mentor guidance
SELECT s.student_id, e.comments AS evaluation, m.position AS mentor_position
FROM Student s
JOIN Evaluation e ON s.student_id = e.s_id
JOIN Mentor m ON s.m_id = m.m_id;

-- 5. Internship duration and reports per company
SELECT i.company_name, DATEDIFF(i.end_date, i.start_date) AS duration, COUNT(e.final_grade) AS reports
FROM Internship i
JOIN Evaluation e ON i.s_id = e.s_id
GROUP BY i.company_name;

-- 6. Students with low grades to be warned
SELECT s.student_id, u.name, e.final_grade
FROM Student s
JOIN Evaluation e ON s.student_id = e.s_id
JOIN User u ON s.ssn = u.ssn
WHERE e.final_grade IN ('D', 'F');

DELIMITER $$

CREATE PROCEDURE CountFailingStudents(OUT fail_count INT)
BEGIN
    SELECT COUNT(*) INTO fail_count
    FROM Evaluation
    WHERE final_grade = 'F';
END $$

DELIMITER ;
