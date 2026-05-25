# SwiftWheels Ticket Reservation System

This is a simple React + Express + MySQL ticket reservation system for SwiftWheels. The frontend is styled with Tailwind CSS.

## Folders

```text
backend/   Express API, controllers, routes, MySQL connection and SQL schema
frontend/  React customer and manager pages styled with Tailwind CSS
```

## Run Steps

1. Open this folder in VS Code.
2. Create the MySQL database and tables by running the SQL in `backend/database.sql`.
3. In `backend`, copy `.env.example` to `.env` and enter your MySQL password.
4. Start backend:

```bash
cd backend
npm install
npm run dev
```

5. Start frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Backend URL: `http://localhost:5000`
Frontend URL: `http://localhost:5173`

Use `http://localhost:5173` instead of `http://127.0.0.1:5173` so the browser sends the session cookie correctly to `localhost:5000`.

## What The System Does

- Fleet manager can create, read, update and delete buses, routes, schedules and tickets.
- Users register and login through session-based authentication.
- Role decides the workflow: customers reserve tickets, fleet managers manage the system.
- Schedule management assigns or swaps a bus to a route at an exact departure date and time.
- Customer searches by source, destination and departure date.
- System displays available buses, available seat count and accurate route price.
- Customer selects an available seat and reserves a ticket instantly.
- A taken seat cannot be reserved again because `tickets` has a unique `(sch_id, seat_number)` rule.
- Available seats are calculated as `bus.total_seats - booked tickets`.
