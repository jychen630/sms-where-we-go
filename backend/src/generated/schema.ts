// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum StudentRole {
  Student = "student",
  Class = "class",
  Curriculum = "curriculum",
  Year = "year",
  System = "system",
}

export enum StudentVisibility {
  Private = "private",
  Class = "class",
  Curriculum = "curriculum",
  Year = "year",
  Students = "students",
}

export enum Table {
  Class = "class",
  Curriculum = "curriculum",
  RegistrationKey = "registration_key",
  Role = "role",
  School = "school",
  SchoolAlias = "school_alias",
  Student = "student",
  StudentClass = "student_class",
  StudentClassRole = "student_class_role",
  Visibility = "visibility",
}

export type Class = {
  class_number: unknown;
  grad_year: number;
  curriculum_uid: unknown | null;
};

export type Curriculum = {
  curriculum_uid: unknown;
  name: string | null;
};

export type RegistrationKey = {
  registration_key: string;
  expiration_date: Date;
  class_number: unknown;
  grad_year: number;
};

export type Role = {
  role: StudentRole;
  level: unknown | null;
  description: string | null;
};

export type School = {
  school_uid: number;
  name: string;
  position: unknown | null;
  country: string;
  state_province: string | null;
  city: string | null;
};

export type SchoolAlias = {
  school_uid: number;
  alias: string;
};

export type Student = {
  student_uid: number;
  name: string;
  phone_number: string | null;
  email: string | null;
  password_hash: string;
  wxid: string | null;
  department: string | null;
  major: string | null;
  class_number: unknown;
  grad_year: number;
  school_uid: number | null;
  visibility_type: StudentVisibility | null;
  role: StudentRole | null;
};

export type StudentClass = {
  class_number: unknown | null;
  grad_year: number | null;
  student_uid: number | null;
  name: string | null;
  phone_number: string | null;
  email: string | null;
  password_hash: string | null;
  wxid: string | null;
  department: string | null;
  major: string | null;
  school_uid: number | null;
  visibility_type: StudentVisibility | null;
  role: StudentRole | null;
  curriculum_uid: unknown | null;
};

export type StudentClassRole = {
  role: StudentRole | null;
  class_number: unknown | null;
  grad_year: number | null;
  student_uid: number | null;
  name: string | null;
  phone_number: string | null;
  email: string | null;
  password_hash: string | null;
  wxid: string | null;
  department: string | null;
  major: string | null;
  school_uid: number | null;
  visibility_type: StudentVisibility | null;
  curriculum_uid: unknown | null;
  level: unknown | null;
  description: string | null;
};

export type Visibility = {
  type: StudentVisibility;
  description: string | null;
};
