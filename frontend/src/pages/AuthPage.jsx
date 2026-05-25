import React from 'react';
import { useState } from 'react';
import api from '../api';

const emptyLogin = { email: '', password: '' };
const emptyRegister = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer'
};

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [message, setMessage] = useState('');

  const login = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await api.post('/auth/login', loginForm);
      onAuth(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await api.post('/auth/register', registerForm);
      onAuth(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-blue-700">SwiftWheels</h1>
        <p className="mt-1 text-sm text-gray-600">
          Customers reserve tickets. Fleet managers manage buses, routes and schedules.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded bg-gray-100 p-1">
          <button
            className={`rounded px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-blue-700 shadow' : 'text-gray-600'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white text-blue-700 shadow' : 'text-gray-600'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        {message && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}

        {mode === 'login' ? (
          <form className="mt-6 space-y-4" onSubmit={login}>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
            <button className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Login
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={register}>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Full name"
              value={registerForm.full_name}
              onChange={(event) => setRegisterForm({ ...registerForm, full_name: event.target.value })}
              required
            />
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
              required
            />
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Phone"
              value={registerForm.phone}
              onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
            />
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
              required
            />
            <select
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              value={registerForm.role}
              onChange={(event) => setRegisterForm({ ...registerForm, role: event.target.value })}
            >
              <option value="customer">customer</option>
              <option value="fleet manager">fleet manager</option>
            </select>
            <button className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
