-- Create Database
CREATE DATABASE IF NOT EXISTS FieldTrainingManagement;
USE FieldTrainingManagement;

-- Table: User
CREATE TABLE User (
    ssn VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    address VARCHAR(255),
    date_of_birth DATE
);

-- Table: Phone
CREATE TABLE Phone (
    phone_id INT PRIMARY KEY,
    phone_number VARCHAR(20),
    ssn VARCHAR(20),
    FOREIGN KEY (ssn) REFERENCES User(ssn) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Mentor
CREATE TABLE Mentor (
    m_id INT PRIMARY KEY,
    ssn VARCHAR(20),
    type VARCHAR(20),
    position VARCHAR(50),
    company_name VARCHAR(100),
    FOREIGN KEY (ssn) REFERENCES User(ssn)
);

-- Table: InternshipEvaluator
CREATE TABLE InternshipEvaluator (
    ie_id INT PRIMARY KEY,
    ssn VARCHAR(20),
    name VARCHAR(100),
    email VARCHAR(100),
    FOREIGN KEY (ssn) REFERENCES User(ssn)
);

-- Table: InternshipCoordinator
CREATE TABLE InternshipCoordinator (
    ic_id INT PRIMARY KEY,
    ssn VARCHAR(20),
    name VARCHAR(100),
    email VARCHAR(100),
    FOREIGN KEY (ssn) REFERENCES User(ssn)
);

-- Table: Student
CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    ssn VARCHAR(20),
    level INT,
    ie_id INT,
    m_id INT,
    ic_id INT,
    FOREIGN KEY (ssn) REFERENCES User(ssn),
    FOREIGN KEY (ie_id) REFERENCES InternshipEvaluator(ie_id),
    FOREIGN KEY (m_id) REFERENCES Mentor(m_id),
    FOREIGN KEY (ic_id) REFERENCES InternshipCoordinator(ic_id)
);

-- Table: Admin
CREATE TABLE Admin (
    a_id INT PRIMARY KEY,
    ssn VARCHAR(20),
    FOREIGN KEY (ssn) REFERENCES User(ssn)
);

-- Modified Table: Internship
CREATE TABLE Internship (
    int_number INT PRIMARY KEY,
    status ENUM('Pending', 'Approved', 'Rejected'),
    start_date DATE,
    end_date DATE,
    duration INT,
    s_id INT,
    ie_id INT,
    ic_id INT,
    company_name VARCHAR(255),  -- added column
    FOREIGN KEY (s_id) REFERENCES Student(student_id),
    FOREIGN KEY (ie_id) REFERENCES InternshipEvaluator(ie_id),
    FOREIGN KEY (ic_id) REFERENCES InternshipCoordinator(ic_id)
);

-- Table: StudentInternship
CREATE TABLE StudentInternship (
    si_id INT PRIMARY KEY,
    s_id INT,
    int_number INT,
    ie_id INT,
    ic_id INT,
    FOREIGN KEY (s_id) REFERENCES Student(student_id),
    FOREIGN KEY (int_number) REFERENCES Internship(int_number),
    FOREIGN KEY (ie_id) REFERENCES InternshipEvaluator(ie_id),
    FOREIGN KEY (ic_id) REFERENCES InternshipCoordinator(ic_id)
);

-- Table: Evaluation
CREATE TABLE Evaluation (
    ev_id INT PRIMARY KEY,
    final_grade VARCHAR(5),
    comments TEXT,
    performance_score INT,
    ie_id INT,
    ic_id INT,
    s_id INT,
    FOREIGN KEY (ie_id) REFERENCES InternshipEvaluator(ie_id),
    FOREIGN KEY (ic_id) REFERENCES InternshipCoordinator(ic_id),
    FOREIGN KEY (s_id) REFERENCES Student(student_id)
);
