export type UserRole = 'client' | 'business' | 'admin';

export type BusinessStatus = 'pending' | 'active' | 'suspended';

export type OfferStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'available' 
  | 'sold_out' 
  | 'expired' 
  | 'disabled';

export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  logo_url?: string | null;
  phone: string;
  address: string;
  wilaya: string;
  latitude: number;
  longitude: number;
  status: BusinessStatus;
  opening_hours?: string | null;
  created_at: string;
  updated_at: string;
  // Joins optionnels
  category?: Category | null;
}

export interface Subscription {
  id: string;
  business_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  plan: string;
  created_at: string;
}

export interface Offer {
  id: string;
  business_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  price: number;
  estimated_value: number;
  initial_quantity: number;
  available_quantity: number;
  start_at: string;
  end_at: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  // Joins optionnels
  business?: Business | null;
}

export interface Sale {
  id: string;
  offer_id: string;
  business_id: string;
  client_id?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Joins optionnels
  offer?: Offer | null;
  business?: Business | null;
  client?: Profile | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  business_id: string;
  created_at: string;
  business?: Business | null;
}

export interface Review {
  id: string;
  user_id: string;
  business_id: string;
  sale_id?: string | null;
  rating: number; // 1 to 5
  comment?: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read_at?: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'business' | 'offer' | 'user';
  target_id: string;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at?: string | null;
}
