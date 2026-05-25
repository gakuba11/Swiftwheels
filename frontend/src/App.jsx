import React from 'react';
import { useEffect, useState } from 'react';
import api from './api';
import AuthPage from './pages/AuthPage.jsx';
import BusPage from './pages/BusPage.jsx';
import ReservationPage from './pages/ReservationPage.jsx';
import RoutePage from './pages/RoutePage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import TicketPage from './pages/TicketPage.jsx';

const pages = {
  buses: <BusPage />,
  routes: <RoutePage />,
  schedules: <SchedulePage />,
  tickets: <TicketPage />,
  reserve: <ReservationPage />
};

function App() {
  const [page, setPage] = useState('reserve');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
        setPage(response.data.user.role === 'fleet manager' ? 'buses' : 'reserve');
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (loggedInUser) => {
    setUser(loggedInUser);
    setPage(loggedInUser.role === 'fleet manager' ? 'buses' : 'reserve');
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setPage('reserve');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 p-8">Loading...</div>;
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const isFleetManager = user.role === 'fleet manager';
  const visiblePage = isFleetManager ? page : 'reserve';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">SwiftWheels Ticket Reservation System</h1>
            <p className="text-sm text-slate-600">
              Logged in as {user.full_name} ({user.role})
            </p>
          </div>
          <button
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {isFleetManager ? (
            <>
              <button className="rounded bg-white px-4 py-2 shadow-sm hover:bg-slate-50" onClick={() => setPage('buses')}>
                Register Buses
              </button>
              <button className="rounded bg-white px-4 py-2 shadow-sm hover:bg-slate-50" onClick={() => setPage('routes')}>
                Setup Routes
              </button>
              <button className="rounded bg-white px-4 py-2 shadow-sm hover:bg-slate-50" onClick={() => setPage('schedules')}>
                Assign Buses To Routes
              </button>
              <button className="rounded bg-white px-4 py-2 shadow-sm hover:bg-slate-50" onClick={() => setPage('tickets')}>
                Ticket Records
              </button>
            </>
          ) : (
            <span className="rounded bg-white px-4 py-2 text-sm font-semibold shadow-sm">
              Customer Ticket Reservation
            </span>
          )}
        </nav>

        {pages[visiblePage]}
      </main>
    </div>
  );
}

export default App;
