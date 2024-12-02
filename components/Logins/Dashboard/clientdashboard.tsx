import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Mover {
  id: string;
  name: string;
  contact: string;
  status: 'available' | 'accepted' | 'declined';
}

const ClientDashboard: React.FC = () => {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const response = await axios.get('/api/movers');
        setMovers(response.data);
      } catch (err) {
        setError('Failed to load movers');
      } finally {
        setLoading(false);
      }
    };

    fetchMovers();
  }, []);

  const renderMovers = (status: Mover['status']) => {
    const filteredMovers = movers.filter((mover) => mover.status === status);

    if (filteredMovers.length === 0) {
      return <p>No movers in this category.</p>;
    }

    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredMovers.map((mover) => (
          <li
            key={mover.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px',
            }}
          >
            <h3>{mover.name}</h3>
            <p>
              <strong>Contact:</strong> {mover.contact}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Client Dashboard</h1>

      <div>
        <h2>Available Movers</h2>
        {renderMovers('available')}
      </div>

      <div>
        <h2>Movers Who Accepted Requests</h2>
        {renderMovers('accepted')}
      </div>

      <div>
        <h2>Movers Who Declined Requests</h2>
        {renderMovers('declined')}
      </div>
    </div>
  );
};

export default ClientDashboard;
