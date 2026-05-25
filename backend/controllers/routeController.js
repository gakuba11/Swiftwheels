const db = require('../config/db');

// Create a new source-to-destination route.
exports.createRoute = async (req, res) => {
  try {
    const { source, destination, price } = req.body;
    const [result] = await db.query(
      'INSERT INTO routes (source, destination, price) VALUES (?, ?, ?)',
      [source, destination, price]
    );
    res.status(201).json({ r_id: result.insertId, source, destination, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read all routes.
exports.getRoutes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM routes ORDER BY r_id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read one route by primary key.
exports.getRouteById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM routes WHERE r_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Route not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a route price or route endpoints.
exports.updateRoute = async (req, res) => {
  try {
    const { source, destination, price } = req.body;
    const [result] = await db.query(
      'UPDATE routes SET source = ?, destination = ?, price = ? WHERE r_id = ?',
      [source, destination, price, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Route not found' });
    res.json({ r_id: Number(req.params.id), source, destination, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a route.
exports.deleteRoute = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM routes WHERE r_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
