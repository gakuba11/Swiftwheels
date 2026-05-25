const crypto = require('crypto');
const db = require('../config/db');

const sessions = new Map();
const SESSION_COOKIE = 'swiftwheels_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

function publicUser(user) {
  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role
  };
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  if (!cookie) return null;

  return decodeURIComponent(cookie.split('=')[1]);
}

function createSession(res, user) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    user: publicUser(user),
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  });

  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`
  );
}

function clearSession(req, res) {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (sessionId) sessions.delete(sessionId);

  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
}

function getSessionUser(req) {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (!sessionId) return null;

  const session = sessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session.user;
}

exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role = 'customer' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }

    const hashedPassword = hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone, hashedPassword, role]
    );

    const user = { user_id: result.insertId, full_name, email, phone, role };
    createSession(res, user);

    res.status(201).json({
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0 || !verifyPassword(password, rows[0].password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    createSession(res, user);

    res.json({
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ message: 'Not logged in' });
  res.json({ user });
};

exports.logout = (req, res) => {
  clearSession(req, res);
  res.json({ message: 'Logged out' });
};

exports.hashPassword = hashPassword;
