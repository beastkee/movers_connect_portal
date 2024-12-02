import React, { useState } from 'react';
import axios from 'axios';

const LoginRegister: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client', // Default role for registration
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isRegister ? '/api/register' : '/api/login';
      const response = await axios.post(url, formData);
      alert(response.data.message || (isRegister ? 'Registration successful!' : 'Login successful!'));
    } catch (error: any) {
      alert(error.response?.data?.message || 'An error occurred!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
      <h1>{isRegister ? 'Sign Up' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          style={{ display: 'block', margin: '10px auto', padding: '10px', width: '100%' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          style={{ display: 'block', margin: '10px auto', padding: '10px', width: '100%' }}
        />
        {isRegister && (
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            style={{ display: 'block', margin: '10px auto', padding: '10px', width: '100%' }}
          >
            <option value="client">Client</option>
            <option value="mover">Mover</option>
          </select>
        )}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isRegister ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        {isRegister ? (
          <>
            Already have an account?{' '}
            <button onClick={() => setIsRegister(false)} style={{ color: '#007bff', cursor: 'pointer', background: 'none', border: 'none' }}>
              Login
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button onClick={() => setIsRegister(true)} style={{ color: '#007bff', cursor: 'pointer', background: 'none', border: 'none' }}>
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default LoginRegister;
