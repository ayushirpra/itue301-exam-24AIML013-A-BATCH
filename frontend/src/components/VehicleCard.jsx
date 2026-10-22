import { useAuth } from '../context/AuthContext';

/**
 * Reusable VehicleCard component.
 * Shows model, type, price/day, and either a "Book Now" button (if the
 * vehicle is available and the user is logged in) or a "Not Available" badge.
 *
 * Props:
 *  - vehicle: { _id, model, type, pricePerDay, available }
 *  - onBook: function called with the vehicle when "Book Now" is clicked
 */
export default function VehicleCard({ vehicle, onBook }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="vehicle-card">
      <h3>{vehicle.model}</h3>
      <span className="type-badge">{vehicle.type}</span>
      <p className="price">
        ₹{vehicle.pricePerDay} <small>/ day</small>
      </p>

      {vehicle.description && (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {vehicle.description}
        </p>
      )}

      {vehicle.available ? (
        <button
          className="btn btn-block"
          onClick={() => onBook && onBook(vehicle)}
          disabled={!isAuthenticated}
          title={!isAuthenticated ? 'Please log in to book' : 'Book this vehicle'}
        >
          {isAuthenticated ? 'Book Now' : 'Log in to Book'}
        </button>
      ) : (
        <span className="badge-unavailable">Not Available</span>
      )}
    </div>
  );
}
