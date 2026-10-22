import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

/**
 * AdminPanel (lazy-loaded via React.lazy in App.jsx)
 * Shows fleet statistics and a full booking list for administration.
 * This page is protected — only logged-in users can access it.
 */
export default function AdminPanel() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const vData = await apiRequest('/vehicles', { token });
        const bData = await apiRequest('/bookings/my', { token });
        if (active) {
          setVehicles(vData.data || []);
          setBookings(bData.data || []);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load admin data.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, token, navigate]);

  if (loading) return <div className="container"><div className="loading">Loading admin panel...</div></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  const totalVehicles = vehicles.length;
  const available = vehicles.filter((v) => v.available).length;
  const booked = totalVehicles - available;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Panel</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{totalVehicles}</div>
          <div className="stat-label">Total Vehicles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{available}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{booked}</div>
          <div className="stat-label">Booked</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">My Bookings</div>
        </div>
      </div>

      <div className="admin-section">
        <h2 style={{ marginBottom: '1rem' }}>Fleet Overview</h2>
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Type</th>
              <th>Price/Day</th>
              <th>Reg. No.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id}>
                <td>{v.model}</td>
                <td>{v.type}</td>
                <td>₹{v.pricePerDay}</td>
                <td>{v.registrationNumber}</td>
                <td>
                  <span className={`status-pill ${v.available ? 'completed' : 'cancelled'}`}>
                    {v.available ? 'Available' : 'Booked'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-section">
        <h2 style={{ marginBottom: '1rem' }}>My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="empty-state">No bookings to show.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Pickup</th>
                <th>Return</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.vehicle?.model || '—'}</td>
                  <td>{b.vehicle?.type || '—'}</td>
                  <td>{new Date(b.pickupDate).toLocaleDateString()}</td>
                  <td>{new Date(b.returnDate).toLocaleDateString()}</td>
                  <td>₹{b.totalAmount}</td>
                  <td>
                    <span className={`status-pill ${b.status}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
