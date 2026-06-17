export type AppointmentStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'FAILED';

export type AppointmentEventType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CANCELLED'
  | 'STATUS_UPDATED'
  | 'NOTIFICATION_PROCESSED';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthSession {
  name: string;
  email: string;
  token: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Doctor {
  id: number;
  departmentId: number;
  name: string;
  specialization: string;
}

export interface AppointmentSlot {
  id: number;
  doctorId: number;
  startDatetime: string;
  endDatetime: string;
}

export interface Appointment {
  id: number;
  status: AppointmentStatus;
  slotId?: number;
  departmentName: string;
  doctorName: string;
  specialization: string;
  startDatetime: string;
  endDatetime: string;
}

export interface AppointmentEventLog {
  id: number;
  eventType: AppointmentEventType;
  eventId?: string | null;
  correlationId?: string | null;
  oldStatus?: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  message?: string | null;
  createdAt: string;
}

export interface CreateAppointmentRequest {
  slotId: number;
}
