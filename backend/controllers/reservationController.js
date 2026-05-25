const db = require('../config/db');
const { reserveTicket } = require('./ticketController');

// Customer search: source + destination + departure day.
exports.searchSchedules = async (req, res) => {
  try {
    const { source, destination, departure_date } = req.query;

    const [rows] = await db.query(`
      SELECT
        s.sch_id,
        DATE_FORMAT(s.departure_time, '%Y-%m-%dT%H:%i') AS departure_time,
        b.bus_id,
        b.plate_number,
        b.total_seats,
        r.r_id,
        r.source,
        r.destination,
        r.price,
        COUNT(t.ticket_id) AS booked_seats,
        (b.total_seats - COUNT(t.ticket_id)) AS available_seats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN routes r ON s.r_id = r.r_id
      LEFT JOIN tickets t ON s.sch_id = t.sch_id
      WHERE r.source = ?
        AND r.destination = ?
        AND DATE(s.departure_time) = ?
      GROUP BY s.sch_id, s.departure_time, b.bus_id, b.plate_number, b.total_seats, r.r_id, r.source, r.destination, r.price
      HAVING available_seats > 0
      ORDER BY s.departure_time ASC
    `, [source, destination, departure_date]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seat list for one schedule, marking taken seats as unavailable.
exports.getSeatsForSchedule = async (req, res) => {
  try {
    const [scheduleRows] = await db.query(`
      SELECT s.sch_id, b.total_seats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.bus_id
      WHERE s.sch_id = ?
    `, [req.params.scheduleId]);

    if (scheduleRows.length === 0) return res.status(404).json({ message: 'Schedule not found' });

    const [ticketRows] = await db.query(
      'SELECT seat_number FROM tickets WHERE sch_id = ?',
      [req.params.scheduleId]
    );

    const takenSeats = new Set(ticketRows.map((ticket) => ticket.seat_number));
    const seats = [];

    for (let seatNumber = 1; seatNumber <= scheduleRows[0].total_seats; seatNumber += 1) {
      seats.push({
        seat_number: seatNumber,
        is_available: !takenSeats.has(seatNumber)
      });
    }

    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer reservation endpoint.
exports.reserve = async (req, res) => {
  const result = await reserveTicket(req.body);
  res.status(result.status).json(result.body);
};
