DROP SCHEMA IF EXISTS wwg;
CREATE SCHEMA wwg;

CREATE TABLE wwg.school (
    school_UID SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    position point,
    country VARCHAR(40) NOT NULL,
    state_province VARCHAR(40),
    city VARCHAR(40)
);

CREATE TABLE wwg.school_alias (
    school_UID SERIAL,
    alias VARCHAR(60),
    PRIMARY KEY (school_UID, alias),
    FOREIGN KEY (school_UID) REFERENCES wwg.school(school_UID)
);

CREATE TABLE wwg.curriculum (
    curriculum_UID SMALLSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE
);

CREATE TABLE wwg.class (
    class_number SMALLINT,
    grad_year INT,
    curriculum_UID SMALLINT,
    PRIMARY KEY (class_number, grad_year, curriculum_UID),
    FOREIGN KEY (curriculum_UID) REFERENCES wwg.curriculum(curriculum_UID)
);

CREATE TABLE wwg.registration_key (
    registration_key CHAR(8),
    expiration_date DATE,
    class_number SMALLINT NOT NULL,
    grad_year INT NOT NULL,
    curriculum_UID SMALLINT NOT NULL,
    PRIMARY KEY (registration_key, expiration_date),
    FOREIGN KEY (class_number, grad_year, curriculum_UID) REFERENCES wwg.class(class_number, grad_year, curriculum_UID)
);

CREATE TABLE wwg.student (
    student_UID SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    phone_number VARCHAR(21) UNIQUE,
    email VARCHAR(120) UNIQUE,
    password_hash CHAR(60) NOT NULL,
    salt CHAR(32) NOT NULL,
    wxid VARCHAR(20),
    department VARCHAR(40),
    major VARCHAR(40),
    class_number SMALLINT NOT NULL,
    grad_year INT NOT NULL,
    curriculum_UID SMALLSERIAL NOT NULL,
    school_UID SERIAL,
    FOREIGN KEY (class_number, grad_year, curriculum_UID) REFERENCES wwg.class(class_number, grad_year, curriculum_UID),
    FOREIGN KEY (school_UID) REFERENCES wwg.school(school_UID)
);
