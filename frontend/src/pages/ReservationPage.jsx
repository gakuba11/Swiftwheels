import React from 'react';
import { useState } from 'react';
import api from '../api';

function ReservationPage() {
  const [search, setSearch] = useState({ source: '', destination: '', departure_date: '' });
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seats, setSeats] = useState([]);
  const [reservation, setReservation] = useState({ customer_name: '', seat_number: '' });
  const [message, setMessage] = useState('');

  const loadAvailableSchedules = async () => {
    const response = await api.get('/reservations/search', { params: search });
    setSchedules(response.data);

    if (response.data.length === 0) {
      setMessage('No available buses found for this route and date');
    }
  };

  const searchSchedules = async (event) => {
    event.preventDefault();
    setSelectedSchedule(null);
    setSeats([]);
    setMessage('');
    await loadAvailableSchedules();
  };

  const chooseSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setReservation({ customer_name: '', seat_number: '' });
    setMessage('');

    const response = await api.get(`/reservations/schedules/${schedule.sch_id}/seats`);
    setSeats(response.data);
  };

  const reserveSeat = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await api.post('/reservations', {
        customer_name: reservation.customer_name,
        sch_id: selectedSchedule.sch_id,
        seat_number: Number(reservation.seat_number)
      });

      await chooseSchedule(selectedSchedule);
      await loadAvailableSchedules();
      setMessage(`Ticket reserved. Ticket ID: ${response.data.ticket_id}`);
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || 'Reservation failed');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Customer Reservation</h2>
      {message && <p className="mt-3 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>}

      <form className="mt-5 grid gap-3 md:grid-cols-4" onSubmit={searchSchedules}>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Source"
          value={search.source}
          onChange={(event) => setSearch({ ...search, source: event.target.value })}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Destination"
          value={search.destination}
          onChange={(event) => setSearch({ ...search, destination: event.target.value })}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          type="date"
          value={search.departure_date}
          onChange={(event) => setSearch({ ...search, departure_date: event.target.value })}
          required
        />
        <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700" type="submit">
          Search Available Buses
        </button>
      </form>

      <h3 className="mt-8 text-lg font-semibold">Available Schedules</h3>
      <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-3 py-2">Schedule ID</th>
            <th className="border px-3 py-2">Bus</th>
            <th className="border px-3 py-2">Route</th>
            <th className="border px-3 py-2">Departure</th>
            <th className="border px-3 py-2">Price</th>
            <th className="border px-3 py-2">Available Seats</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr key={schedule.sch_id}>
              <td className="border px-3 py-2">{schedule.sch_id}</td>
              <td className="border px-3 py-2">{schedule.plate_number}</td>
              <td className="border px-3 py-2">{schedule.source} to {schedule.destination}</td>
              <td className="border px-3 py-2">{schedule.departure_time}</td>
              <td className="border px-3 py-2">{schedule.price}</td>
              <td className="border px-3 py-2">{schedule.available_seats}</td>
              <td className="border px-3 py-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500" onClick={() => chooseSchedule(schedule)}>Select</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {selectedSchedule && (
        <div className="mt-8 rounded border border-slate-200 p-5">
          <h3 className="text-lg font-semibold">Reserve Seat</h3>
          <p className="mt-1 text-sm text-slate-600">
            Selected: {selectedSchedule.source} to {selectedSchedule.destination},
            Bus {selectedSchedule.plate_number},
            Price {selectedSchedule.price}
          </p>

          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={reserveSeat}>
            <input
              className="rounded border border-slate-300 px-3 py-2"
              placeholder="Customer name"
              value={reservation.customer_name}
              onChange={(event) => setReservation({ ...reservation, customer_name: event.target.value })}
              required
            />

            <select
              className="rounded border border-slate-300 px-3 py-2"
              value={reservation.seat_number}
              onChange={(event) => setReservation({ ...reservation, seat_number: event.target.value })}
              required
            >
              <option value="">Select available seat</option>
              {seats.map((seat) => (
                <option
                  key={seat.seat_number}
                  value={seat.seat_number}
                  disabled={!seat.is_available}
                >
                  Seat {seat.seat_number} {seat.is_available ? 'available' : 'taken'}
                </option>
              ))}
            </select>

            <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700" type="submit">
              Reserve Ticket
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReservationPage;
