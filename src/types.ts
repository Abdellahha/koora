export interface Channel {
  name: string;
  sub: string;
  logo?: string;
  url: string;
  code?: string;
  quality: "4K" | "HD" | "SD";
}

export interface Match {
  home: string;
  away: string;
  slugA: string | null;
  slugB: string | null;
  scoreA: string;
  scoreB: string;
  time: string;
  status: "live" | "upcoming" | "ended";
}

export interface CineFastItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  media_type?: "movie" | "tv";
}

export interface CineFastSeason {
  season_number: number;
  episode_count: number;
  name: string;
}

export interface CineFastEpisode {
  episode_number: number;
  name: string;
}
