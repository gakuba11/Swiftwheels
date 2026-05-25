import React from 'react';
import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { customer_name: '', sch_id: '', seat_number: '' };

function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [ticketResponse, scheduleResponse] = await Promise.all([
      api.get('/tickets'),
      api.get('/schedules')
    ]);
    setTickets(ticketResponse.data);
    setSchedules(scheduleResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const payload = {
      customer_name: form.customer_name,
      sch_id: Number(form.sch_id),
      seat_number: Number(form.seat_number)
    };

    try {
      if (editingId) {
        await api.put(`/tickets/${editingId}`, payload);
        setMessage('Ticket updated');
      } else {
        await api.post('/tickets', payload);
        setMessage('Ticket created');
      }

      setForm(emptyForm);
      setEditingId(null);
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || 'Ticket action failed');
    }
  };

  const editTicket = (ticket) => {
    setEditingId(ticket.ticket_id);
    setForm({
      customer_name: ticket.customer_name,
      sch_id: ticket.sch_id,
      seat_number: ticket.seat_number
    });
  };

  const deleteTicket = async (id) => {
    await api.delete(`/tickets/${id}`);
    setMessage('Ticket deleted');
    loadData();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Manage Tickets</h2>
      {message && <p className="mt-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

      <form className="mt-5 grid gap-3 md:grid-cols-5" onSubmit={handleSubmit}>
        <input
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Customer name"
          value={form.customer_name}
          onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
          required
        />

        <select
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none md:col-span-2"
          value={form.sch_id}
          onChange={(event) => setForm({ ...form, sch_id: event.target.value })}
          required
        >
          <option value="">Select schedule</option>
          {schedules.map((schedule) => (
            <option key={schedule.sch_id} value={schedule.sch_id}>
              {schedule.source} to {schedule.destination}, {schedule.departure_time}, Bus {schedule.plate_number}
            </option>
          ))}
        </select>

        <input
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          type="number"
          placeholder="Seat number"
          value={form.seat_number}
          onChange={(event) => setForm({ ...form, seat_number: event.target.value })}
          required
        />

        <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700" type="submit">
          {editingId ? 'Update Ticket' : 'Create Ticket'}
        </button>
        <button className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50" type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }}>
          Clear
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Customer</th>
            <th className="border px-3 py-2">Route</th>
            <th className="border px-3 py-2">Departure</th>
            <th className="border px-3 py-2">Bus</th>
            <th className="border px-3 py-2">Seat</th>
            <th className="border px-3 py-2">Price</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id}>
              <td className="border px-3 py-2">{ticket.ticket_id}</td>
              <td className="border px-3 py-2">{ticket.customer_name}</td>
              <td className="border px-3 py-2">{ticket.source} to {ticket.destination}</td>
              <td className="border px-3 py-2">{ticket.departure_time}</td>
              <td className="border px-3 py-2">{ticket.plate_number}</td>
              <td className="border px-3 py-2">{ticket.seat_number}</td>
              <td className="border px-3 py-2">{ticket.price}</td>
              <td className="space-x-2 border px-3 py-2">
                <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" onClick={() => editTicket(ticket)}>Edit</button>
                <button className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500" onClick={() => deleteTicket(ticket.ticket_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default TicketPage;
