import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['reserved', 'ongoing', 'completed', 'cancelled'];

/**
 * MyBookingsPage
 * Fetches the logged-in customer's bookings (populated with customer
 * name/email and vehicle model/type) and lets them update the booking status.
 */
export default function MyBookingsPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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
        const data = await apiRequest('/bookings/my', { token });
        if (active) setBookings(data.data || []);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load your bookings.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, token, navigate]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const data = await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
        token,
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? data.data : b))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading your bookings...</div></div>;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          You have no bookings yet. <a href="/fleet">Browse the fleet →</a>
        </div>
      ) : (
        bookings.map((booking) => (
          <div className="booking-item" key={booking._id}>
            <div>
              <h3>{booking.vehicle?.model || 'Vehicle removed'}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Type: {booking.vehicle?.type || '—'} · ₹{booking.vehicle?.pricePerDay || 0}/day
              </p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                Customer: {booking.customer?.name} ({booking.customer?.email})
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                Pickup: {new Date(booking.pickupDate).toLocaleDateString()} ·
                Return: {new Date(booking.returnDate).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                Total: ₹{booking.totalAmount}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`status-pill ${booking.status}`}>
                {booking.status}
              </span>
              <div style={{ marginTop: '0.8rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Update status:
                </label>
                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                  disabled={updatingId === booking._id}
                  style={{ display: 'block', marginTop: '0.3rem', padding: '0.3rem' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
