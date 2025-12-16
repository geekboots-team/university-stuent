export interface Groups {
  id: string;
  name: string;
  university_id: string;
  course_id?: string;
  courses?: {
    name: string;
  };
  university?: {
    name: string;
  };
  club_id?: string;
  clubs?: {
    name: string;
  };
  group_for: "mentor" | "student" | "all";
  created_at: string;
  updated_at: string;
}

export interface GroupParticipants {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender?: { first_name: string; last_name: string } | null;
  sender_type: "admin" | "moderator" | "student" | "club";
  admin_id?: string;
  moderator_id?: string;
  club_id?: string;
  message: string;
  created_at: string;
  read_at: string | null;
}
