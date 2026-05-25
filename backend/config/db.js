const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'swiftwheels',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database: swiftwheels');
    connection.release();
  })
  .catch((error) => {
    console.error('Database Connection Error:', error.message);
  });

module.exports = db;
