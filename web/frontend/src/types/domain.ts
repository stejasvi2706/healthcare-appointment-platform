export type AppointmentStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'FAILED';

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
  departmentName: string;
  doctorName: string;
  specialization: string;
  startDatetime: string;
  endDatetime: string;
}

export interface CreateAppointmentRequest {
  slotId: number;
}
