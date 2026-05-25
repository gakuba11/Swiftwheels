const db = require('../config/db');

// Create a schedule. This assigns a bus to a route at an exact departure time.
exports.createSchedule = async (req, res) => {
  try {
    const { bus_id, r_id, departure_time } = req.body;
    const [result] = await db.query(
      'INSERT INTO schedules (bus_id, r_id, departure_time) VALUES (?, ?, ?)',
      [bus_id, r_id, departure_time]
    );
    res.status(201).json({ sch_id: result.insertId, bus_id, r_id, departure_time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read all schedules with route price and calculated available seats.
exports.getSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.sch_id,
        s.bus_id,
        s.r_id,
        DATE_FORMAT(s.departure_time, '%Y-%m-%dT%H:%i') AS departure_time,
        b.plate_number,
        b.total_seats,
        r.source,
        r.destination,
        r.price,
        COUNT(t.ticket_id) AS booked_seats,
        (b.total_seats - COUNT(t.ticket_id)) AS available_seats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN routes r ON s.r_id = r.r_id
      LEFT JOIN tickets t ON s.sch_id = t.sch_id
      GROUP BY s.sch_id, s.bus_id, s.r_id, s.departure_time, b.plate_number, b.total_seats, r.source, r.destination, r.price
      ORDER BY s.departure_time DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read one schedule by primary key.
exports.getScheduleById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.sch_id,
        s.bus_id,
        s.r_id,
        DATE_FORMAT(s.departure_time, '%Y-%m-%dT%H:%i') AS departure_time,
        b.plate_number,
        b.total_seats,
        r.source,
        r.destination,
        r.price,
        COUNT(t.ticket_id) AS booked_seats,
        (b.total_seats - COUNT(t.ticket_id)) AS available_seats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.bus_id
      JOIN routes r ON s.r_id = r.r_id
      LEFT JOIN tickets t ON s.sch_id = t.sch_id
      WHERE s.sch_id = ?
      GROUP BY s.sch_id, s.bus_id, s.r_id, s.departure_time, b.plate_number, b.total_seats, r.source, r.destination, r.price
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Schedule not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a schedule. Changing bus_id swaps the available bus for the route/time.
exports.updateSchedule = async (req, res) => {
  try {
    const { bus_id, r_id, departure_time } = req.body;
    const [result] = await db.query(
      'UPDATE schedules SET bus_id = ?, r_id = ?, departure_time = ? WHERE sch_id = ?',
      [bus_id, r_id, departure_time, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ sch_id: Number(req.params.id), bus_id, r_id, departure_time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a schedule.
exports.deleteSchedule = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM schedules WHERE sch_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
