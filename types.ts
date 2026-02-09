export type Category = 'Trust & Impact' | 'MOC Update' | 'Policy to People';

export type Status = 'Backlog' | 'In Production' | 'Reviewing' | 'Published';

export type ContentType = 'Video' | 'Banner' | 'PR Press' | 'Photo Album';

export interface NewsItem {
  id: string;
  originalText: string;
  summary: string;
  contentType: ContentType;
  category: Category;
  status: Status;
  isHighlight: boolean;
  timestamp: string;
  date: string; // YYYY-MM-DD format for Calendar
  publishedLink?: string;
}

export interface MonthPlan {
  month: string;
  theme: string;
  highlights: string[];
}

export interface Milestone {
  id: string;
  name: string;
  deadlineDay: number; // e.g., 80, 160, 240
  targetKPI: number;
  currentValue: number;
  description: string;
}

export const CATEGORIES: Category[] = ['Trust & Impact', 'MOC Update', 'Policy to People'];
export const STATUSES: Status[] = ['Backlog', 'In Production', 'Reviewing', 'Published'];
export const CONTENT_TYPES: ContentType[] = ['Video', 'Banner', 'PR Press', 'Photo Album'];