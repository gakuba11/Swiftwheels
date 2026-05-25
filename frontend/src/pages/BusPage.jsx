import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { plate_number: '', total_seats: '' };

function BusPage() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadBuses = async () => {
    const response = await api.get('/buses');
    setBuses(response.data);
  };

  useEffect(() => {
    loadBuses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      plate_number: form.plate_number,
      total_seats: Number(form.total_seats)
    };

    if (editingId) {
      await api.put(`/buses/${editingId}`, payload);
      setMessage('Bus updated');
    } else {
      await api.post('/buses', payload);
      setMessage('Bus created');
    }

    setForm(emptyForm);
    setEditingId(null);
    loadBuses();
  };

  const editBus = (bus) => {
    setEditingId(bus.bus_id);
    setForm({ plate_number: bus.plate_number, total_seats: bus.total_seats });
  };

  const deleteBus = async (id) => {
    await api.delete(`/buses/${id}`);
    setMessage('Bus deleted');
    loadBuses();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Manage Buses</h2>
      {message && <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

      <form className="mt-5 grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
        <input
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Plate number"
          value={form.plate_number}
          onChange={(event) => setForm({ ...form, plate_number: event.target.value })}
          required
        />
        <input
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          type="number"
          placeholder="Total seats"
          value={form.total_seats}
          onChange={(event) => setForm({ ...form, total_seats: event.target.value })}
          required
        />
        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700" type="submit">
          {editingId ? 'Update Bus' : 'Create Bus'}
        </button>
        <button className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50" type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
          Clear
        </button>
      </form>

      <table className="mt-6 w-full border-collapse overflow-hidden text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Plate Number</th>
            <th className="border px-3 py-2">Total Seats</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus.bus_id}>
              <td className="border px-3 py-2">{bus.bus_id}</td>
              <td className="border px-3 py-2">{bus.plate_number}</td>
              <td className="border px-3 py-2">{bus.total_seats}</td>
              <td className="space-x-2 border px-3 py-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" onClick={() => editBus(bus)}>Edit</button>
                <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500" onClick={() => deleteBus(bus.bus_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BusPage;
