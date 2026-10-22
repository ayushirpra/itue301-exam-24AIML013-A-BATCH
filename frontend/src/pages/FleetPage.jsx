import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';

/**
 * FleetPage
 * 1. Fetches /api/v1/vehicles on mount with useEffect.
 * 2. Manages loading, error, and vehicle states.
 * 3. Provides client-side filters: All, Hatchback, Sedan, SUV.
 * 4. Renders each vehicle through VehicleCard (model, type, price/day, Book Now / Not Available).
 * 5. Opens a booking form (modal) using useState for selected vehicle + dates.
 */
const FILTERS = ['All', 'Hatchback', 'Sedan', 'SUV'];

export default function FleetPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  // Booking form state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch vehicles on mount
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest('/vehicles');
        if (active) setVehicles(data.data || []);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load vehicles.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // Client-side filtering
  const filteredVehicles =
    filter === 'All'
      ? vehicles
      : vehicles.filter((v) => v.type === filter);

  const handleBook = (vehicle) => {
    setSelectedVehicle(vehicle);
    setPickupDate('');
    setReturnDate('');
    setBookingMsg('');
    setBookingError('');
  };

  const closeBooking = () => {
    setSelectedVehicle(null);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    setBookingError('');

    if (!pickupDate || !returnDate) {
      setBookingError('Please select both pickup and return dates.');
      return;
    }
    if (new Date(returnDate) <= new Date(pickupDate)) {
      setBookingError('Return date must be after the pickup date.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: {
          vehicle: selectedVehicle._id,
          pickupDate,
          returnDate,
        },
        token,
      });
      setBookingMsg('Booking confirmed! View it in My Bookings.');
      // Optimistically mark the vehicle unavailable in the local list
      setVehicles((prev) =>
        prev.map((v) =>
          v._id === selectedVehicle._id ? { ...v, available: false } : v
        )
      );
    } catch (err) {
      setBookingError(err.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Our Fleet</h1>

      {/* Filters */}
      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* States: loading / error / empty / grid */}
      {loading && <div className="loading">Loading vehicles...</div>}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && filteredVehicles.length === 0 && (
        <div className="empty-state">No vehicles found for "{filter}".</div>
      )}

      {!loading && !error && filteredVehicles.length > 0 && (
        <div className="vehicle-grid">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle._id}
              vehicle={vehicle}
              onBook={handleBook}
            />
          ))}
        </div>
      )}

      {/* Booking modal form */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={closeBooking}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Book {selectedVehicle.model}</h3>
            <div className="selected-vehicle">
              <strong>{selectedVehicle.model}</strong> ({selectedVehicle.type}) —
              ₹{selectedVehicle.pricePerDay}/day
            </div>

            {bookingMsg && <div className="alert alert-success">{bookingMsg}</div>}
            {bookingError && <div className="alert alert-error">{bookingError}</div>}

            <form onSubmit={submitBooking}>
              <div className="form-group">
                <label htmlFor="pickup">Pickup Date</label>
                <input
                  id="pickup"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="return">Return Date</label>
                <input
                  id="return"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button type="button" className="btn btn-danger" onClick={closeBooking}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
