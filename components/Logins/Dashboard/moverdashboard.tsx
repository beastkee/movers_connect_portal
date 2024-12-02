import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ClientRequest {
  id: string;
  name: string;
  address: string;
  contact: string;
  description: string;
  date: string;
}

const MoverDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/client-requests');
        setRequests(response.data);
      } catch (err) {
        setError('Failed to load client requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mover Dashboard</h1>
      {requests.length === 0 ? (
        <p>No client requests available at the moment.</p>
      ) : (
        <div>
          <h2>Available Client Requests</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {requests.map((request) => (
              <li
                key={request.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                }}
              >
                <h3>{request.name}</h3>
                <p>
                  <strong>Address:</strong> {request.address}
                </p>
                <p>
                  <strong>Contact:</strong> {request.contact}
                </p>
                <p>
                  <strong>Description:</strong> {request.description}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(request.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MoverDashboard;
