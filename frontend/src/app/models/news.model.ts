export interface NewsApiResponse {
  articles: News[];
  status: string;
  totalResults: number;
}

export interface News {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  isSaved?: boolean;
  isLocal?: boolean;
}

export interface NewsFilter {
  source?: string;
  searchTerm?: string;
}
  
  