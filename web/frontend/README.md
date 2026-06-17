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

It now integrates with the backend APIs for authentication, catalogue loading, appointment booking, appointment history, and cancellation.

## What Works Today

The app supports three main views:

- Booking workspace
  - Load departments and doctors from the backend.
  - Select a department.
  - Select a doctor.
  - Select a date.
  - Load available slots from the backend.
  - Request an appointment through `POST /api/appointments`.

- Appointment history
  - Fetch appointments from `GET /api/appointments`.
  - See status badges for `CREATED`, `PROCESSING`, `CONFIRMED`, `CANCELLED`, and `FAILED`.
  - Cancel active appointments through `DELETE /api/appointments/{appointmentId}`.

- Account access
  - Register through `POST /api/auth/register`.
  - Sign in through `POST /api/auth/login`.
  - Store the returned backend token in `localStorage`.
  - Sign out.

## Design Intent

The frontend is intentionally minimal but functional. It gives a usable product surface before the backend APIs are fully implemented, while keeping future backend integration low-risk.

The key idea is to keep domain behavior and API expectations explicit:

- Domain types live in `src/types/domain.ts`.
- Placeholder data lives in `src/data/placeholders.ts`.
- HTTP client setup lives in `src/api/client.ts`.
- Documented API wrapper functions live in `src/api/appointments.ts`.
- Views receive state through props instead of importing backend details directly.

This means the UI can use the backend now without depending on Kafka, worker, or database implementation details.

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

Defines wrapper functions for the backend API paths:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/departments`
- `GET /api/departments/{departmentId}/doctors`
- `GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD`
- `POST /api/appointments`
- `DELETE /api/appointments/{appointmentId}`
- `GET /api/appointments`

These wrappers are now used by the views through `App.tsx`.

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

From the repository root with Docker Compose:

```bash
docker compose up --build frontend
```

The container serves the built React app through Nginx on:

```text
http://localhost:5173
```

Nginx proxies `/api/*` to the backend service inside the Compose network.

This Docker integration serves the frontend and routes `/api/*` to the backend container.

## Backend Integration Plan

The first backend integration pass is complete. The next frontend/backend improvements should be:

1. Add richer field-level validation and backend error messages.
2. Refresh appointment status through polling or server push instead of a one-time delayed refresh after booking.
3. Add automated frontend tests around auth, booking, and cancellation flows.
4. Replace the development mock-token backend auth with real JWT handling once the backend auth branch is implemented.

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

- The UI now calls backend APIs while preserving the original product workflow.
- React state is centralized in `App.tsx` for now because the app is still small.
- The API layer mirrors the documented backend endpoints.
- Views consume props and domain types, which keeps them easier to adapt later.
- Appointment status handling is intentionally simple; the backend and worker own state transitions.
- The design avoids coupling the frontend to Kafka or worker internals.

As the app grows, state management can be extracted into hooks or a dedicated store, but adding that abstraction now would be premature.

## Known Limitations

- Auth still depends on the backend's development mock-token implementation.
- Appointment status refresh after booking is a delayed refresh, not live polling.
- Error handling is intentionally basic.
- No automated frontend tests yet.
- npm audit currently reports dependency findings from the generated dependency tree; dependency remediation should be handled separately and carefully.
