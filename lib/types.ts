/** Shared domain + API types — mirror FixItNowPro Prisma models exactly. */

export type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type PaymentProvider = "STRIPE" | "SSLCOMMERZ";

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFieldIssue {
  field: string | number;
  message: string;
}

export interface ApiErrorDetails {
  issues?: ApiFieldIssue[];
  reason?: string;
  statusCode?: number;
  code?: string;
  name?: string;
  fields?: string[];
  message?: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorDetails?: ApiErrorDetails;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  skills: string[];
  experience: number;
  hourlyRate: number;
  bio: string | null;
  location: string | null;
  availability: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  technicianProfile?: TechnicianProfile | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  technicianId: string;
  category: Category;
  technician?: {
    id: string;
    email: string;
    technicianProfile: TechnicianProfile | null;
    averageRating: number;
    reviewCount: number;
  };
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  transactionId: string | null;
  amount: number;
  method: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledTime: string;
  createdAt: string;
  updatedAt: string;
  technician?: {
    id: string;
    email: string;
    technicianProfile: TechnicianProfile | null;
  };
  customer?: { id: string; email: string };
  service?: Service;
  payment?: Payment | null;
  review?: Review | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
}
