export interface University {
  id: string;
  name: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  university_id: string;
  university: { name: string };
  name: string;
  created_at: string;
  updated_at: string;
}
