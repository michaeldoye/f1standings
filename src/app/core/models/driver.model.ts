export interface Driver {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
  country_code: string | null;
}

export interface Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_type: string;
  meeting_key: number;
  location: string;
  country_name: string;
  circuit_short_name: string;
  year: number;
}

export interface SessionResult {
  session_key: number;
  driver_number: number;
  position: number;
  points?: number;
}
