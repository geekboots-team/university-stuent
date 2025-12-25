export interface Support {
  id: string;
  ticket_id: string;
  user_id: string;
  students: { first_name: string; last_name: string; email: string };
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  subject: string;
  category:
    | "technical"
    | "account"
    | "billing"
    | "feature_request"
    | "bug_report"
    | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "pending_user" | "resolved" | "closed";
  request_to: "admin" | "university" | "club";
  university_id?: string;
  club_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SupportForm {
  request_to: "admin" | "university" | "club";
  university_id?: string;
  club_id?: string;
  subject: string;
  category:
    | "technical"
    | "account"
    | "billing"
    | "feature_request"
    | "bug_report"
    | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "pending_user" | "resolved" | "closed";
  message: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "student" | "admin" | "moderator" | "club";
  message: string;
  created_at: Date;
  updated_at: Date;
}
