export interface User {
  _id: string;
  name: string;
  email: string;
  preferences: {
    favoriteCategories: string[];
    favoriteSources: string[];
    savedNews: string[];
  };
  createdAt: Date;
}