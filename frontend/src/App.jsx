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
    return <div className="min-h-screen bg-gray-50 p-8 text-gray-900">Loading...</div>;
  }

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const isFleetManager = user.role === 'fleet manager';
  const visiblePage = isFleetManager ? page : 'reserve';
  const navClass = (name) =>
    `rounded px-4 py-2 text-sm font-semibold shadow-sm ${
      page === name
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">SwiftWheels Ticket Reservation System</h1>
            <p className="text-sm text-gray-600">
              Logged in as {user.full_name} ({user.role})
            </p>
          </div>
          <button
            className="rounded bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
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
              <button className={navClass('buses')} onClick={() => setPage('buses')}>
                Register Buses
              </button>
              <button className={navClass('routes')} onClick={() => setPage('routes')}>
                Setup Routes
              </button>
              <button className={navClass('schedules')} onClick={() => setPage('schedules')}>
                Assign Buses To Routes
              </button>
              <button className={navClass('tickets')} onClick={() => setPage('tickets')}>
                Ticket Records
              </button>
            </>
          ) : (
            <span className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
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
