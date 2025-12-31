export interface AppliedUniversity {
  id?: string;
  user_id: string;
  students?: Student;
  university_id: string;
  university?: { name: string };
  course_id: string;
  courses?: { name: string };
  status: "active" | "rejected" | "pending";
}

export interface AppliedClubs {
  id?: string;
  user_id: string;
  students?: Student;
  club_id: string;
  clubs?: { name: string };
  status: "active" | "rejected" | "pending";
}

export interface StudentReg {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  university: string;
  agreeToTerms: boolean;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  role: string;
  applied_universities: AppliedUniversity[];
  language: string;
  city: string;
  state: string;
  country: string;
  college_name: string;
  native_course: string;
  native_city: string;
  native_state: string;
  native_country: string;
  bio: string;
  profile_pic: string;
  sponsored: string[];
  applied_clubs: AppliedClubs[];
  status: "active" | "approved" | "suspended" | "pending";
  created_at: string;
  expo_push_token?: string; // Add this line
}

export interface StudentLogin {
  email: string;
  password: string;
}

export interface MyFriends {
  mentorId: string;
  mentorNm: string;
  mentorImg: string;
  studentId: string;
  studentNm: string;
  studentImg: string;
  status: string;
}
