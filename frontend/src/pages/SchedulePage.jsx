import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { bus_id: '', r_id: '', departure_time: '' };

function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [scheduleResponse, busResponse, routeResponse] = await Promise.all([
      api.get('/schedules'),
      api.get('/buses'),
      api.get('/routes')
    ]);
    setSchedules(scheduleResponse.data);
    setBuses(busResponse.data);
    setRoutes(routeResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toMysqlDateTime = (value) => `${value.replace('T', ' ')}:00`;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      bus_id: Number(form.bus_id),
      r_id: Number(form.r_id),
      departure_time: toMysqlDateTime(form.departure_time)
    };

    if (editingId) {
      await api.put(`/schedules/${editingId}`, payload);
      setMessage('Schedule updated');
    } else {
      await api.post('/schedules', payload);
      setMessage('Schedule created');
    }

    setForm(emptyForm);
    setEditingId(null);
    loadData();
  };

  const editSchedule = (schedule) => {
    setEditingId(schedule.sch_id);
    setForm({
      bus_id: schedule.bus_id,
      r_id: schedule.r_id,
      departure_time: schedule.departure_time
    });
  };

  const deleteSchedule = async (id) => {
    await api.delete(`/schedules/${id}`);
    setMessage('Schedule deleted');
    loadData();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Manage Schedules</h2>
      {message && <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

      <form className="mt-5 grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={form.bus_id}
          onChange={(event) => setForm({ ...form, bus_id: event.target.value })}
          required
        >
          <option value="">Select bus</option>
          {buses.map((bus) => (
            <option key={bus.bus_id} value={bus.bus_id}>
              {bus.plate_number} ({bus.total_seats} seats)
            </option>
          ))}
        </select>

        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={form.r_id}
          onChange={(event) => setForm({ ...form, r_id: event.target.value })}
          required
        >
          <option value="">Select route</option>
          {routes.map((route) => (
            <option key={route.r_id} value={route.r_id}>
              {route.source} to {route.destination} - {route.price}
            </option>
          ))}
        </select>

        <input
          className="rounded border border-slate-300 px-3 py-2"
          type="datetime-local"
          value={form.departure_time}
          onChange={(event) => setForm({ ...form, departure_time: event.target.value })}
          required
        />

        <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700" type="submit">
          {editingId ? 'Update Schedule' : 'Create Schedule'}
        </button>
        <button className="rounded border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50" type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
          Clear
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Bus</th>
            <th className="border px-3 py-2">Route</th>
            <th className="border px-3 py-2">Departure</th>
            <th className="border px-3 py-2">Price</th>
            <th className="border px-3 py-2">Booked Seats</th>
            <th className="border px-3 py-2">Available Seats</th>
            <th className="border px-3 py-2">Actions</th>
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
              <td className="border px-3 py-2">{schedule.booked_seats}</td>
              <td className="border px-3 py-2">{schedule.available_seats}</td>
              <td className="space-x-2 border px-3 py-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500" onClick={() => editSchedule(schedule)}>Edit</button>
                <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500" onClick={() => deleteSchedule(schedule.sch_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default SchedulePage;
