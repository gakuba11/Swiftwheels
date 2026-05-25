const db = require('../config/db');

// Create a new bus record.
exports.createBus = async (req, res) => {
  try {
    const { plate_number, total_seats } = req.body;
    const [result] = await db.query(
      'INSERT INTO buses (plate_number, total_seats) VALUES (?, ?)',
      [plate_number, total_seats]
    );
    res.status(201).json({ bus_id: result.insertId, plate_number, total_seats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read all buses.
exports.getBuses = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM buses ORDER BY bus_id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read one bus by primary key.
exports.getBusById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM buses WHERE bus_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a bus.
exports.updateBus = async (req, res) => {
  try {
    const { plate_number, total_seats } = req.body;
    const [result] = await db.query(
      'UPDATE buses SET plate_number = ?, total_seats = ? WHERE bus_id = ?',
      [plate_number, total_seats, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json({ bus_id: Number(req.params.id), plate_number, total_seats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a bus.
exports.deleteBus = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM buses WHERE bus_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json({ message: 'Bus deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
