import { apiClient } from './client';
import type {
  Appointment,
  AppointmentEventLog,
  AppointmentSlot,
  CreateAppointmentRequest,
  Department,
  Doctor,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/domain';

export async function register(payload: RegisterRequest) {
  const response = await apiClient.post<void>('/auth/register', payload);
  return response.data;
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload);
  return response.data;
}

export async function fetchDepartments() {
  const response = await apiClient.get<Department[]>('/departments');
  return response.data;
}

export async function fetchDoctorsByDepartment(departmentId: number) {
  const response = await apiClient.get<Doctor[]>(
    `/departments/${departmentId}/doctors`,
  );
  return response.data;
}

export async function fetchAvailableSlots(doctorId: number, date: string) {
  const response = await apiClient.get<AppointmentSlot[]>(
    `/doctors/${doctorId}/slots`,
    { params: { date } },
  );
  return response.data;
}

export async function createAppointment(payload: CreateAppointmentRequest) {
  const response = await apiClient.post<Appointment>('/appointments', payload);
  return response.data;
}

export async function cancelAppointment(appointmentId: number) {
  const response = await apiClient.delete<void>(`/appointments/${appointmentId}`);
  return response.data;
}

export async function fetchAppointments() {
  const response = await apiClient.get<Appointment[]>('/appointments');
  return response.data;
}

export async function fetchAppointmentEvents(appointmentId: number) {
  const response = await apiClient.get<AppointmentEventLog[]>(
    `/appointments/${appointmentId}/events`,
  );
  return response.data;
}
