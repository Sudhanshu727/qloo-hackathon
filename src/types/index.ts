export interface FashionItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  style: string;
  price?: number;
  brand?: string;
}

export interface UserProfile {
  id: string;
  preferences: {
    styles: string[];
    sizes: string[];
    priceRange: {
      min: number;
      max: number;
    };
    brands: string[];
  };
  history: {
    recentSearches: string[];
    recentViews: FashionItem[];
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
