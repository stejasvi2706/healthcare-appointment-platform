# Frontend

React frontend for the Healthcare Appointment Platform.

## Current Scope

This frontend is a functional shell built with:

- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React icons

It currently runs in mock mode. The UI is interactive, but it does not require the backend APIs to be implemented yet.

## What Works Today

The app supports three main views:

- Booking workspace
  - Select a department.
  - Select a doctor.
  - Select a date.
  - Select an available slot.
  - Request an appointment.

- Appointment history
  - View local mock appointments.
  - See status badges for `CREATED`, `PROCESSING`, `CONFIRMED`, `CANCELLED`, and `FAILED`.
  - Cancel active appointments in local state.

- Account access
  - Switch between sign in and register.
  - Create a mock authenticated session.
  - Store a mock token in `localStorage`.
  - Sign out.

## Design Intent

The frontend is intentionally minimal but functional. It gives a usable product surface before the backend APIs are fully implemented, while keeping future backend integration low-risk.

The key idea is to keep domain behavior and API expectations explicit:

- Domain types live in `src/types/domain.ts`.
- Placeholder data lives in `src/data/placeholders.ts`.
- HTTP client setup lives in `src/api/client.ts`.
- Documented API wrapper functions live in `src/api/appointments.ts`.
- Views receive state through props instead of importing backend details directly.

This means the UI can be built and reviewed now, and later the mock data can be replaced with real API calls without rewriting the visual workflow.

## Folder Structure

```text
web/frontend/
├── src/
│   ├── api/
│   │   ├── appointments.ts
│   │   └── client.ts
│   ├── data/
│   │   └── placeholders.ts
│   ├── types/
│   │   └── domain.ts
│   ├── views/
│   │   ├── AppointmentsView.tsx
│   │   ├── AuthView.tsx
│   │   └── BookingView.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

## Important Files

`src/App.tsx`

Owns the current mock application state. It stores:

- appointments
- mock auth session
- summary counts

It wires the main views together through React Router.

`src/views/BookingView.tsx`

Implements the booking workflow. It filters doctors by department, filters available slots by selected doctor/date, hides already-active slots, and sends selected slot IDs back to the app state.

`src/views/AppointmentsView.tsx`

Shows appointment history and allows local cancellation of active appointments.

`src/views/AuthView.tsx`

Implements controlled login/register forms in mock mode. This is intentionally not a real JWT auth implementation yet.

`src/api/client.ts`

Creates the shared Axios client using `/api` as the base URL. It attaches `localStorage.authToken` as a bearer token when present.

`src/api/appointments.ts`

Defines wrapper functions for the backend API paths from the project design docs:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/departments`
- `GET /api/departments/{departmentId}/doctors`
- `GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD`
- `POST /api/appointments`
- `DELETE /api/appointments/{appointmentId}`
- `GET /api/appointments`

These wrappers are not fully used by the views yet because the backend endpoints are not implemented.

## How To Run

From `web/frontend`:

```bash
npm install
npm run dev
```

The Vite dev server will print the local URL. Commonly:

```text
http://localhost:5173
```

To build and verify:

```bash
npm run build
npm run lint
```

## Mock Mode

The current implementation uses mock data from `src/data/placeholders.ts`.

This is deliberate. The frontend can be demonstrated and reviewed before backend auth, appointment APIs, Kafka events, and worker processing are complete.

Mock mode keeps the frontend independent from backend design decisions that are still evolving, such as worker idempotency and Kafka `eventId` handling.

## Backend Integration Plan

When backend APIs are ready, the frontend should be integrated in this order:

1. Replace mock department and doctor reads with `fetchDepartments` and `fetchDoctorsByDepartment`.
2. Replace mock slot reads with `fetchAvailableSlots`.
3. Replace mock appointment creation with `createAppointment`.
4. Replace local cancellation with `cancelAppointment`.
5. Replace mock auth session with real `register` and `login`.
6. Add loading, error, and retry handling around each API call.

The views should stay mostly the same. The data source should change, not the user workflow.

## Architecture Notes

The frontend does not know about Kafka, the Python worker, or internal database tables. It only models the public user-facing workflow.

This separation is important because backend architecture may change without requiring the frontend to change. For example, adding `eventId` idempotency to the worker should not affect the frontend unless the public appointment API changes.

The frontend currently treats appointment statuses as display values:

- `CREATED`
- `PROCESSING`
- `CONFIRMED`
- `CANCELLED`
- `FAILED`

It does not encode complex business rules around status transitions. Those rules belong in the backend and worker.

## Interview Explanation

This frontend was built as an incremental product shell.

The goal was not to build every integration immediately. The goal was to create a usable workflow while keeping clear boundaries between UI, domain types, mock data, and future API calls.

Important points to explain:

- The UI is functional in mock mode so product behavior can be reviewed early.
- React state is centralized in `App.tsx` for now because the app is still small.
- The API layer already mirrors the documented backend endpoints.
- Views consume props and domain types, which keeps them easier to adapt later.
- Appointment status handling is intentionally simple because backend and worker lifecycle rules are still being finalized.
- The design avoids coupling the frontend to Kafka or worker internals.

As the app grows, state management can be extracted into hooks or a dedicated store, but adding that abstraction now would be premature.

## Known Limitations

- No real backend API calls are wired into the views yet.
- Auth uses a mock token.
- Appointment data resets on page reload except for the mock auth token.
- No production-grade error handling yet.
- No automated frontend tests yet.
- npm audit currently reports dependency findings from the generated dependency tree; dependency remediation should be handled separately and carefully.
