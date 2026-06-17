# Frontend

React/Vite UI for the healthcare appointment platform.

## Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React icons

## Responsibilities

- Register and login users
- Store the backend JWT in `localStorage`
- Fetch departments, doctors, and slots
- Book appointments
- Hide slots that overlap with active appointments
- List appointments and statuses
- Poll appointments so worker-driven status changes appear automatically
- Show backend/worker processing timeline
- Cancel active appointments
- Clear expired sessions when protected APIs return `401` or `403`

## Screens

| Route | Purpose |
| --- | --- |
| `/` | Booking workspace |
| `/appointments` | Appointment history and processing timeline |
| `/auth` | Register, login, and sign out |

## API Integration

The frontend calls the backend through `/api`, proxied by Nginx in Docker Compose.

Implemented API wrappers live in:

```text
src/api/appointments.ts
```

Wrapped endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/departments`
- `GET /api/departments/{departmentId}/doctors`
- `GET /api/doctors/{doctorId}/slots?date=YYYY-MM-DD`
- `GET /api/appointments`
- `POST /api/appointments`
- `DELETE /api/appointments/{appointmentId}`
- `GET /api/appointments/{appointmentId}/events`

## Project Structure

```text
web/frontend/
  src/
    api/
      appointments.ts
      client.ts
    data/
      placeholders.ts
    types/
      domain.ts
    views/
      AppointmentsView.tsx
      AuthView.tsx
      BookingView.tsx
    App.tsx
    main.tsx
    styles.css
  index.html
  package.json
  vite.config.ts
```

## Important Files

| File | Purpose |
| --- | --- |
| `src/App.tsx` | Owns app state, polling, auth session, and view wiring |
| `src/views/BookingView.tsx` | Department/doctor/date/slot selection and booking |
| `src/views/AppointmentsView.tsx` | Appointment list, cancellation, and processing timeline |
| `src/views/AuthView.tsx` | Login/register/sign-out UI |
| `src/api/client.ts` | Axios client and bearer-token attachment |
| `src/types/domain.ts` | Frontend domain types matching backend payloads |

## Run Locally

```bash
npm install
npm run dev
```

Common Vite URL:

```text
http://localhost:5173
```

Run through Docker Compose from the repository root:

```bash
docker compose up --build frontend
```

## Verify

```bash
npm run build
npm run lint
```

## Interview Notes

- The frontend is intentionally thin. Backend and worker own business rules and state transitions.
- `App.tsx` centralizes state because the app is small; a store or query library would be premature for this assignment.
- Appointment status is refreshed through polling because the backend/worker workflow is asynchronous.
- The processing timeline reads backend audit events. The UI does not need to know Kafka internals.
- Session-expiry handling is at the protected API boundary: `401/403` clears local auth and asks the user to sign in again.

## Known Limitations

- No refresh-token flow.
- Appointment refresh uses fixed-interval polling, not server push.
- No automated frontend tests yet.
- npm audit reports dependency findings from the generated dependency tree; dependency remediation should be handled separately.
