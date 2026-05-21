export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  pet_name: string;
  pet_type: string;
  age: number;
  notes?: string;
  created_at: string;
}

export type BookingService = 'Grooming' | 'Vet Consultation' | 'Boarding' | 'Training';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'rejected';

export type BookingPaymentStatus = 'pending' | 'verification_pending' | 'paid' | 'failed' | 'rejected';

export interface Booking {
  id: string;
  user_id: string;
  pet_id: string;
  service: BookingService;
  booking_date: string;
  status: BookingStatus;
  payment_status: BookingPaymentStatus;
  payment_method?: string;
  payment_amount?: number;
  transaction_id?: string;
  paid_at?: string;
  utr_number?: string;
  screenshot_url?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  // Joined data
  pet?: Pet;
  user?: User;
}

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  // Joined data
  user?: User;
}

export interface Stats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalPets: number;
  totalCustomers?: number;
}
