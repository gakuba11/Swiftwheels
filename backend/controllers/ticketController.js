const db = require('../config/db');

// Shared reservation function used by ticket CRUD and the customer reservation page.
async function reserveTicket({ customer_name, sch_id, seat_number }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [scheduleRows] = await connection.query(
      `SELECT s.sch_id, b.total_seats
       FROM schedules s
       JOIN buses b ON s.bus_id = b.bus_id
       WHERE s.sch_id = ?
       FOR UPDATE`,
      [sch_id]
    );

    if (scheduleRows.length === 0) {
      await connection.rollback();
      return { status: 404, body: { message: 'Schedule not found' } };
    }

    const totalSeats = Number(scheduleRows[0].total_seats);
    const selectedSeat = Number(seat_number);

    if (!Number.isInteger(selectedSeat) || selectedSeat < 1 || selectedSeat > totalSeats) {
      await connection.rollback();
      return { status: 400, body: { message: `Seat must be between 1 and ${totalSeats}` } };
    }

    const [seatRows] = await connection.query(
      'SELECT ticket_id FROM tickets WHERE sch_id = ? AND seat_number = ?',
      [sch_id, selectedSeat]
    );

    if (seatRows.length > 0) {
      await connection.rollback();
      return { status: 409, body: { message: 'Seat is already taken' } };
    }

    const [result] = await connection.query(
      'INSERT INTO tickets (customer_name, sch_id, seat_number) VALUES (?, ?, ?)',
      [customer_name, sch_id, selectedSeat]
    );

    await connection.commit();
    return {
      status: 201,
      body: { ticket_id: result.insertId, customer_name, sch_id, seat_number: selectedSeat }
    };
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return { status: 409, body: { message: 'Seat is already taken' } };
    }

    return { status: 500, body: { error: error.message } };
  } finally {
    connection.release();
  }
}

// Create a ticket. Availability drops because booked tickets are counted against total seats.
exports.createTicket = async (req, res) => {
  const result = await reserveTicket(req.body);
  res.status(result.status).json(result.body);
};

// Read all tickets with bus, route and price information.
exports.getTickets = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        t.ticket_id,
        t.customer_name,
        t.sch_id,
        t.seat_number,
        DATE_FORMAT(s.departure_time, '%Y-%m-%dT%H:%i') AS departure_time,
        b.plate_number,
        r.source,
        r.destination,
        r.price
      FROM tickets t
      JOIN schedules s ON t.sch_id = s.sch_id
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN routes r ON s.r_id = r.r_id
      ORDER BY t.ticket_id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read one ticket by primary key.
exports.getTicketById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE ticket_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a ticket while protecting against duplicate or invalid seat numbers.
exports.updateTicket = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { customer_name, sch_id, seat_number } = req.body;
    await connection.beginTransaction();

    const [ticketRows] = await connection.query(
      'SELECT ticket_id FROM tickets WHERE ticket_id = ? FOR UPDATE',
      [req.params.id]
    );

    if (ticketRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const [scheduleRows] = await connection.query(
      `SELECT s.sch_id, b.total_seats
       FROM schedules s
       JOIN buses b ON s.bus_id = b.bus_id
       WHERE s.sch_id = ?
       FOR UPDATE`,
      [sch_id]
    );

    if (scheduleRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const totalSeats = Number(scheduleRows[0].total_seats);
    const selectedSeat = Number(seat_number);

    if (!Number.isInteger(selectedSeat) || selectedSeat < 1 || selectedSeat > totalSeats) {
      await connection.rollback();
      return res.status(400).json({ message: `Seat must be between 1 and ${totalSeats}` });
    }

    const [seatRows] = await connection.query(
      'SELECT ticket_id FROM tickets WHERE sch_id = ? AND seat_number = ? AND ticket_id <> ?',
      [sch_id, selectedSeat, req.params.id]
    );

    if (seatRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'Seat is already taken' });
    }

    await connection.query(
      'UPDATE tickets SET customer_name = ?, sch_id = ?, seat_number = ? WHERE ticket_id = ?',
      [customer_name, sch_id, selectedSeat, req.params.id]
    );

    await connection.commit();
    res.json({ ticket_id: Number(req.params.id), customer_name, sch_id, seat_number: selectedSeat });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// Delete a ticket. This releases its seat because availability is calculated from tickets.
exports.deleteTicket = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tickets WHERE ticket_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reserveTicket = reserveTicket;
