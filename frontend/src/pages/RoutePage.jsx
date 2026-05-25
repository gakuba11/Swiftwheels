import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { source: '', destination: '', price: '' };

function RoutePage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadRoutes = async () => {
    const response = await api.get('/routes');
    setRoutes(response.data);
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      source: form.source,
      destination: form.destination,
      price: Number(form.price)
    };

    if (editingId) {
      await api.put(`/routes/${editingId}`, payload);
      setMessage('Route updated');
    } else {
      await api.post('/routes', payload);
      setMessage('Route created');
    }

    setForm(emptyForm);
    setEditingId(null);
    loadRoutes();
  };

  const editRoute = (route) => {
    setEditingId(route.r_id);
    setForm({ source: route.source, destination: route.destination, price: route.price });
  };

  const deleteRoute = async (id) => {
    await api.delete(`/routes/${id}`);
    setMessage('Route deleted');
    loadRoutes();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Manage Routes</h2>
      {message && <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

      <form className="mt-5 grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Source"
          value={form.source}
          onChange={(event) => setForm({ ...form, source: event.target.value })}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          placeholder="Destination"
          value={form.destination}
          onChange={(event) => setForm({ ...form, destination: event.target.value })}
          required
        />
        <input
          className="rounded border border-slate-300 px-3 py-2"
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          required
        />
        <button className="rounded bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700" type="submit">
          {editingId ? 'Update Route' : 'Create Route'}
        </button>
        <button className="rounded border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50" type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
          Clear
        </button>
      </form>

      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Source</th>
            <th className="border px-3 py-2">Destination</th>
            <th className="border px-3 py-2">Price</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <tr key={route.r_id}>
              <td className="border px-3 py-2">{route.r_id}</td>
              <td className="border px-3 py-2">{route.source}</td>
              <td className="border px-3 py-2">{route.destination}</td>
              <td className="border px-3 py-2">{route.price}</td>
              <td className="space-x-2 border px-3 py-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500" onClick={() => editRoute(route)}>Edit</button>
                <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500" onClick={() => deleteRoute(route.r_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoutePage;
