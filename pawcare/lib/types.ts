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

export interface Booking {
  id: string;
  user_id: string;
  pet_id: string;
  service: BookingService;
  booking_date: string;
  status: BookingStatus;
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
