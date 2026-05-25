# SwiftWheels Code Guide

This guide shows where each block of code is written and what it does.

## Backend

### `backend/database.sql`

Write the database creation code here. It creates:

- `buses`
- `routes`
- `schedules`
- `tickets`
- `users`

Important rule: `tickets` has `UNIQUE (sch_id, seat_number)`, so one seat cannot be booked twice for the same schedule.

### `backend/config/db.js`

Write the MySQL connection code here. Controllers import this connection pool to run SQL queries.

### `backend/server.js`

Write the main Express server code here. It starts the API and connects route files to URLs:

- `/api/buses`
- `/api/routes`
- `/api/schedules`
- `/api/tickets`
- `/api/reservations`
- `/api/auth`

### `backend/controllers/busController.js`

Write bus CRUD logic here:

- create bus
- get all buses
- get one bus
- update bus
- delete bus

### `backend/controllers/routeController.js`

Write route CRUD logic here:

- create route
- get all routes
- get one route
- update route
- delete route

### `backend/controllers/scheduleController.js`

Write schedule CRUD logic here. This is where a fleet manager assigns or swaps a bus for a route and exact departure time.

The read queries also calculate:

```sql
available_seats = bus total seats - booked tickets
```

### `backend/controllers/ticketController.js`

Write ticket CRUD logic here.

The `reserveTicket` function checks:

- schedule exists
- selected seat is inside the bus seat range
- selected seat is not already taken

If the seat is taken, the API returns an error and does not create the ticket.

### `backend/controllers/reservationController.js`

Write customer reservation logic here:

- search schedules by source, destination and day
- show available seats for one schedule
- reserve a selected seat

### `backend/routes/*.js`

Write route URL mappings here. Each route file connects a URL and HTTP method to a controller function.

Example:

```js
router.post('/', busController.createBus);
```

This means `POST /api/buses` creates a bus.

### `backend/controllers/authController.js`

Write register, login, current session and logout logic here.

The `users` table is used for authentication only. It stores the user profile, role and hashed password.

The app uses session-based auth:

- Login/register creates a server-side session id.
- The session id is stored in an HttpOnly cookie named `swiftwheels_session`.
- `/api/auth/me` checks whether the browser still has a valid session.
- `/api/auth/logout` clears the session cookie.

## Frontend

### `frontend/src/api.js`

Write the Axios backend connection here. All pages use it to call the backend API.

### `frontend/src/App.jsx`

Write the main navigation here. It checks `/api/auth/me`, stores the logged-in user in React state and shows the correct pages for the user's role.

Customers see only the reservation page.
Fleet managers see only bus, route, schedule and ticket record management pages.

### `frontend/src/pages/AuthPage.jsx`

Write the login and register forms here.

After successful login/register, the backend creates the session cookie and the frontend stores the returned user object in state.

### `frontend/src/pages/ReservationPage.jsx`

Write the customer reservation page here.

Customer flow:

1. Enter source, destination and departure date.
2. Select an available schedule.
3. Select an available seat.
4. Enter customer name.
5. Reserve ticket.

### `frontend/src/pages/BusPage.jsx`

Write the bus CRUD page here.

### `frontend/src/pages/RoutePage.jsx`

Write the route CRUD page here.

### `frontend/src/pages/SchedulePage.jsx`

Write the schedule CRUD page here. This page is used by the fleet manager to assign or swap buses on routes.

### `frontend/src/pages/TicketPage.jsx`

Write the ticket CRUD page here. It also protects against duplicate seat reservation through the backend.

### Tailwind CSS

Tailwind is configured in `frontend/tailwind.config.js`, loaded through `frontend/src/index.css` and used through `className` values in the React pages.

There is no user management page because the `users` table is only for register/login.
