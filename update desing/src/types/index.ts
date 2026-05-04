export type UserRole = 'user' | 'moderator' | 'admin';

export type ListingStatus = 'active' | 'sold' | 'archived';

export type DealStatus = 'open' | 'sent' | 'completed';

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  rating: number;
  deals_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  attributes: CategoryAttribute[];
}

export interface CategoryAttribute {
  name: string;
  type: 'select' | 'number' | 'text';
  options?: string[];
  required: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  is_free: boolean;
  category_id: string;
  category_name: string;
  location: string;
  user_id: string;
  status: ListingStatus;
  images: string[];
  attributes: Record<string, string | number>;
  has_delivery: boolean;
  show_phone: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  deal_status: DealStatus;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  buyer?: Profile;
  seller?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  seller_id: string;
  conversation_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Favorite {
  listing_id: string;
  added_at: string;
}
