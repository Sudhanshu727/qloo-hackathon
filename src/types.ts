export interface UserProfile {
  style_preference: string;
  color_preference: string[];
  occasion_focus: string[];
  personality: string;
}

export interface FashionItem {
  id: string;
  original_id: string;
  image_url: string;
  clothing_type: string;
  dominant_color: string;
  secondary_color?: string;
  pattern_type?: string;
  occasion_suitability: string[];
  pattern_description?: string;
  remarks?: string;
  description?: string; // For cultural fusion items
}

export interface TwinResponse {
  message: string;
  style_profile: UserProfile;
  twin_items: FashionItem[];
  note: string;
}

export interface ChoiceApprovalResponse {
  approval: string;
  affinity_score: number;
  message: string;
  style_analysis?: string;
  user_profile?: UserProfile;
}

export interface FashionPlace {
  id: string;
  name: string;
  location: string;
  description?: string;
  style_focus: string;
  rating?: number;
}
