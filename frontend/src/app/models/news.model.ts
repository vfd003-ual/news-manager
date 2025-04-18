export interface News {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  isSaved?: boolean;
}

export interface NewsFilter {
  category?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}
  
  