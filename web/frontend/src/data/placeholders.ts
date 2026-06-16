import type { Appointment, AppointmentSlot, Department, Doctor } from '../types/domain';

export const departments: Department[] = [
  { id: 1, name: 'Cardiology' },
  { id: 2, name: 'Dermatology' },
  { id: 3, name: 'Neurology' },
  { id: 4, name: 'Orthopedics' },
  { id: 5, name: 'General Medicine' },
];

export const doctors: Doctor[] = [
  {
    id: 11,
    departmentId: 1,
    name: 'Dr. Asha Mehta',
    specialization: 'Preventive cardiology',
  },
  {
    id: 12,
    departmentId: 1,
    name: 'Dr. Rohan Iyer',
    specialization: 'Interventional cardiology',
  },
  {
    id: 21,
    departmentId: 2,
    name: 'Dr. Mira Kapoor',
    specialization: 'Clinical dermatology',
  },
  {
    id: 31,
    departmentId: 3,
    name: 'Dr. Nikhil Rao',
    specialization: 'Headache medicine',
  },
  {
    id: 41,
    departmentId: 4,
    name: 'Dr. Dev Sinha',
    specialization: 'Sports injuries',
  },
  {
    id: 51,
    departmentId: 5,
    name: 'Dr. Kavya Menon',
    specialization: 'Family medicine',
  },
];

export const slots: AppointmentSlot[] = [
  {
    id: 101,
    doctorId: 11,
    startDatetime: '2026-06-17T09:00:00',
    endDatetime: '2026-06-17T09:30:00',
  },
  {
    id: 102,
    doctorId: 11,
    startDatetime: '2026-06-17T10:30:00',
    endDatetime: '2026-06-17T11:00:00',
  },
  {
    id: 103,
    doctorId: 11,
    startDatetime: '2026-06-17T14:00:00',
    endDatetime: '2026-06-17T14:30:00',
  },
  {
    id: 104,
    doctorId: 12,
    startDatetime: '2026-06-17T09:30:00',
    endDatetime: '2026-06-17T10:00:00',
  },
  {
    id: 105,
    doctorId: 12,
    startDatetime: '2026-06-18T13:00:00',
    endDatetime: '2026-06-18T13:30:00',
  },
  {
    id: 201,
    doctorId: 21,
    startDatetime: '2026-06-17T11:00:00',
    endDatetime: '2026-06-17T11:30:00',
  },
  {
    id: 301,
    doctorId: 31,
    startDatetime: '2026-06-18T10:00:00',
    endDatetime: '2026-06-18T10:30:00',
  },
  {
    id: 401,
    doctorId: 41,
    startDatetime: '2026-06-19T15:30:00',
    endDatetime: '2026-06-19T16:00:00',
  },
  {
    id: 501,
    doctorId: 51,
    startDatetime: '2026-06-18T15:00:00',
    endDatetime: '2026-06-18T15:30:00',
  },
  {
    id: 502,
    doctorId: 51,
    startDatetime: '2026-06-19T09:00:00',
    endDatetime: '2026-06-19T09:30:00',
  },
];

export const appointments: Appointment[] = [
  {
    id: 5001,
    status: 'CONFIRMED',
    slotId: 101,
    departmentName: 'Cardiology',
    doctorName: 'Dr. Asha Mehta',
    specialization: 'Preventive cardiology',
    startDatetime: '2026-06-17T09:00:00',
    endDatetime: '2026-06-17T09:30:00',
  },
  {
    id: 5002,
    status: 'PROCESSING',
    slotId: 501,
    departmentName: 'General Medicine',
    doctorName: 'Dr. Kavya Menon',
    specialization: 'Family medicine',
    startDatetime: '2026-06-18T15:00:00',
    endDatetime: '2026-06-18T15:30:00',
  },
  {
    id: 5003,
    status: 'CANCELLED',
    slotId: 201,
    departmentName: 'Dermatology',
    doctorName: 'Dr. Mira Kapoor',
    specialization: 'Clinical dermatology',
    startDatetime: '2026-06-12T12:00:00',
    endDatetime: '2026-06-12T12:30:00',
  },
];
