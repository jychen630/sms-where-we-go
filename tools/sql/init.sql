\encoding 'UTF8';
DROP SCHEMA IF EXISTS wwg;
CREATE SCHEMA wwg;

CREATE TABLE wwg.school (
    school_uid SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    position point,
    country VARCHAR(40) NOT NULL,
    state_province VARCHAR(40),
    city VARCHAR(40)
);

CREATE TABLE wwg.school_alias (
    school_uid SERIAL,
    alias VARCHAR(60),
    PRIMARY KEY (school_uid, alias),
    FOREIGN KEY (school_uid) REFERENCES wwg.school(school_uid)
);

CREATE TABLE wwg.curriculum (
    curriculum_uid SMALLSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE
);

CREATE TABLE wwg.class (
    class_number SMALLINT,
    grad_year INT,
    curriculum_uid SMALLINT,
    PRIMARY KEY (class_number, grad_year),
    FOREIGN KEY (curriculum_uid) REFERENCES wwg.curriculum(curriculum_uid)
);

CREATE TABLE wwg.registration_key (
    registration_key CHAR(8),
    expiration_date TIMESTAMP,
    class_number SMALLINT NOT NULL,
    grad_year INT NOT NULL,
    PRIMARY KEY (registration_key, expiration_date),
    FOREIGN KEY (class_number, grad_year) REFERENCES wwg.class(class_number, grad_year)
);

CREATE TABLE wwg.visibility (
    type VARCHAR(20) PRIMARY KEY,
    description TEXT
);

INSERT INTO wwg.visibility VALUES
    ('private', 'Visible only to the student themself'),
    ('class', 'Visible only to the students in the same class'),
    ('curriculum', 'Visible only to the students within the same curriculum'),
    ('year', 'Visible only to the students who graduate in the same year'),
    ('students', 'Visible only to any registered users (including past and future students)');

CREATE TABLE wwg.student (
    student_uid SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    phone_number VARCHAR(21) UNIQUE,
    email VARCHAR(120) UNIQUE,
    password_hash CHAR(60) NOT NULL,
    wxid VARCHAR(20),
    department VARCHAR(40),
    major VARCHAR(40),
    class_number SMALLINT NOT NULL,
    grad_year INT NOT NULL,
    school_uid INT,
    visibility_type VARCHAR(20) DEFAULT 'year',
    FOREIGN KEY (class_number, grad_year) REFERENCES wwg.class(class_number, grad_year),
    FOREIGN KEY (school_uid) REFERENCES wwg.school(school_uid),
    FOREIGN KEY (visibility_type) REFERENCES wwg.visibility(type)
);

CREATE VIEW student_class AS 
    SELECT * FROM wwg.student
    NATURAL JOIN wwg.class;

CREATE TABLE wwg.role (
    role_name VARCHAR(20) NOT NULL PRIMARY KEY
);

CREATE TABLE wwg.student_role (
    role_name VARCHAR(20),
    student_uid INT,
    PRIMARY KEY (role_name, student_uid),
    FOREIGN KEY (role_name) REFERENCES wwg.role(role_name),
    FOREIGN KEY (student_uid) REFERENCES wwg.student(student_uid)
);
