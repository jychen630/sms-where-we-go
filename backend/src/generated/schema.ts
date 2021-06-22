// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum FeedbackStatus {
  Resolved = "resolved",
  Pending = "pending",
  Closed = "closed",
}

export enum StudentField {
  PhoneNumber = "phone_number",
  Email = "email",
  Wxid = "wxid",
  Department = "department",
  Major = "major",
  SchoolUid = "school_uid",
}

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
  AdditionalInfo = "additional_info",
  City = "city",
  Class = "class",
  Comment = "comment",
  Curriculum = "curriculum",
  Feedback = "feedback",
  RegistrationKey = "registration_key",
  Role = "role",
  School = "school",
  SchoolAlias = "school_alias",
  Student = "student",
  StudentClass = "student_class",
  StudentClassRole = "student_class_role",
  StudentFieldVisibility = "student_field_visibility",
  Visibility = "visibility",
}

export type AdditionalInfo = {
  student_uid: number;
  key_name: string;
  value: string;
};

export type City = {
  city_uid: number;
  city: string | null;
  state_province: string | null;
  country: string;
};

export type Class = {
  class_number: unknown;
  grad_year: number;
  curriculum_name: string;
};

export type Comment = {
  comment_uid: number;
  feedback_uid: string | null;
  sender_name: string | null;
  content: string | null;
  posted_at: Date | null;
};

export type Curriculum = {
  curriculum_name: string;
};

export type Feedback = {
  feedback_uid: string;
  status: FeedbackStatus;
  title: string | null;
  content: string | null;
  reason: string | null;
  phone_number: string | null;
  email: string | null;
  name: string | null;
  class_number: number | null;
  grad_year: number | null;
  posted_at: Date | null;
  sender_uid: number | null;
};

export type RegistrationKey = {
  registration_key: string;
  expiration_date: Date;
  class_number: unknown;
  grad_year: number;
  activated: boolean;
};

export type Role = {
  role: StudentRole;
  level: unknown | null;
  description: string | null;
};

export type School = {
  school_uid: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  city_uid: number;
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
  curriculum_name: string | null;
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
  curriculum_name: string | null;
  level: unknown | null;
  description: string | null;
};

export type StudentFieldVisibility = {
  student_uid: number;
  field: StudentField;
  hidden: boolean | null;
};

export type Visibility = {
  type: StudentVisibility;
  description: string | null;
};

