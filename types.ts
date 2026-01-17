
export type Category = 'DIRECTING' | 'AI_FILM' | 'CINEMATOGRAPHY';

export interface Project {
  id: string;
  category: Category;
  year: string;
  titleKr: string;
  titleEn: string;
  genre: string;
  runtime: string;
  role: string;
  synopsis: string;
  awards: string[];
  mainImage: string;
  stills: string[];
}

export interface StaffHistory {
  id: string;
  year: string;
  project: string;
  role: string;
  awards: string[];
}

export interface SiteContent {
  aboutText: string;
  contact: {
    email: string;
    phone: string;
    instagram: string;
    youtube: string;
  };
  contactTitle: string;
  philosophy: string;
  name: string;
  homeBgImage: string;
  profileImage: string;
}

export interface PortfolioData {
  projects: Project[];
  staff: StaffHistory[];
  content: SiteContent;
}
