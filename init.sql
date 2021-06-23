\encoding 'UTF8';
DROP SCHEMA IF EXISTS wwg;
CREATE SCHEMA wwg;

CREATE EXTENSION fuzzystrmatch
    SCHEMA wwg
    VERSION "1.1";

CREATE EXTENSION pg_trgm
    SCHEMA wwg
    VERSION "1.5";

CREATE TABLE wwg.city (
    city_uid SERIAL PRIMARY KEY,
    city VARCHAR(40),
    state_province VARCHAR(40),
    country VARCHAR(40) NOT NULL,
    UNIQUE(city, state_province, country)
);

CREATE TABLE wwg.school (
    school_uid SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    latitude float,
    longitude float,
    city_uid INT NOT NULL,
    UNIQUE (name, city_uid),
    FOREIGN KEY (city_uid) REFERENCES wwg.city(city_uid)
);

CREATE TABLE wwg.school_alias (
    school_uid INT,
    alias VARCHAR(60),
    PRIMARY KEY (school_uid, alias),
    FOREIGN KEY (school_uid) REFERENCES wwg.school(school_uid)
);

CREATE TABLE wwg.curriculum (
    curriculum_name VARCHAR(20) PRIMARY KEY
);

CREATE TABLE wwg.class (
    class_number SMALLINT,
    grad_year INT,
    curriculum_name VARCHAR(20) NOT NULL,
    PRIMARY KEY (class_number, grad_year),
    FOREIGN KEY (curriculum_name) REFERENCES wwg.curriculum(curriculum_name)
);

CREATE TABLE wwg.registration_key (
    registration_key VARCHAR(14),
    expiration_date TIMESTAMP,
    class_number SMALLINT NOT NULL,
    grad_year INT NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (registration_key, expiration_date),
    FOREIGN KEY (class_number, grad_year) REFERENCES wwg.class(class_number, grad_year)
);

CREATE TYPE student_visibility AS ENUM ('private', 'class', 'curriculum', 'year', 'students');

CREATE TABLE wwg.visibility (
    type student_visibility PRIMARY KEY,
    description TEXT
);

INSERT INTO wwg.visibility VALUES
    ('private', 'Visible only to the student themself'),
    ('class', 'Visible only to the students in the same class'),
    ('curriculum', 'Visible only to the students within the same curriculum'),
    ('year', 'Visible only to the students who graduate in the same year'),
    ('students', 'Visible only to any registered users (including past and future students)');

CREATE TYPE student_role AS ENUM ('student', 'class', 'curriculum', 'year', 'system');

CREATE TABLE wwg.role (
    role student_role NOT NULL PRIMARY KEY,
    level SMALLINT,
    description TEXT
);

INSERT INTO wwg.role VALUES
    ('student', 0, 'Limited write access to the user itself'),
    ('class', 2, 'Write access to the students within a class'),
    ('curriculum', 4, 'Write access to the student within a curriculum'),
    ('year', 8, 'Write access to the students who graduate in the same year'),
    ('system', 16,'Write access to the all students including admin students');

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
    visibility_type student_visibility DEFAULT 'year',
    role student_role DEFAULT 'student',
    FOREIGN KEY (class_number, grad_year) REFERENCES wwg.class(class_number, grad_year),
    FOREIGN KEY (school_uid) REFERENCES wwg.school(school_uid),
    FOREIGN KEY (role) REFERENCES wwg.role(role),
    FOREIGN KEY (visibility_type) REFERENCES wwg.visibility(type)
);

CREATE TYPE FEEDBACK_STATUS as ENUM ('resolved', 'pending', 'closed');

CREATE TABLE wwg.feedback (
    feedback_uid CHAR(22) NOT NULL PRIMARY KEY,
    status FEEDBACK_STATUS NOT NULL DEFAULT 'pending',
    title VARCHAR(120),
    content TEXT,
    reason VARCHAR(120),
    phone_number VARCHAR(120),
    email VARCHAR(120),
    sender_uid INT,
    name VARCHAR(120),
    class_number INT,
    grad_year INT,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wwg.comment (
    comment_uid SERIAL PRIMARY KEY,
    feedback_uid CHAR(22) NOT NULL,
    sender_name VARCHAR(120),
    content TEXT,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_uid) REFERENCES wwg.feedback(feedback_uid)
);

CREATE TYPE STUDENT_FIELD as ENUM ('phone_number', 'email', 'wxid', 'department', 'major', 'school_uid');

CREATE TABLE wwg.student_field_visibility (
    student_uid INT NOT NULL,
    field STUDENT_FIELD NOT NULL,
    hidden BOOLEAN DEFAULT false,
    PRIMARY KEY (student_uid, field),
    FOREIGN KEY (student_uid) REFERENCES wwg.student(student_uid)
);

CREATE TABLE wwg.additional_info (
    student_uid INT PRIMARY KEY,
    key_name VARCHAR(30) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL,
    FOREIGN KEY (student_uid) REFERENCES wwg.student(student_uid)
);

CREATE VIEW wwg.student_class AS 
    SELECT * FROM wwg.student
    NATURAL JOIN wwg.class;

CREATE VIEW wwg.student_class_role AS
    SELECT * FROM wwg.student_class
    NATURAL JOIN wwg.role;

CREATE FUNCTION add_alias() RETURNS trigger AS $$
    BEGIN
        INSERT INTO wwg.school_alias VALUES (
            NEW.school_uid,
            NEW.name
        );
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

CREATE TRIGGER school_insert
    AFTER INSERT ON wwg.school
    FOR EACH ROW
    EXECUTE FUNCTION add_alias();
