export interface Accommodation {
  id: string;
  user_id: string;
  creator: { first_name: string; last_name: string };
  title: string;
  description: string;
  university_id: string;
  university: { name: string };
  clubs: string[];
  mode: string;
  map_url: string;
  accepted_by: string | null;
  acceptor: { first_name: string; last_name: string };
  is_female: "Yes" | "No";
  status: "active" | "reported" | "accepted";
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface AccommodationForm {
  user_id: string;
  title: string;
  description: string;
  university_id: string;
  clubs: string[];
  mode: string;
  map_url: string;
  is_female: "Yes" | "No";
  status: "active" | "reported" | "accepted";
}
