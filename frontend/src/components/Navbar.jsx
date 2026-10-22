import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar with client-side navigation links (no full page reloads).
 * Shows different links depending on whether the user is logged in.
 */
export default function Navbar() {
  const { isAuthenticated, customer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        DriveEasy
      </Link>

      <div className="navbar-links">
        {isAuthenticated && (
          <>
            <NavLink
              to="/fleet"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Fleet
            </NavLink>
            <NavLink
              to="/my-bookings"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              My Bookings
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Admin
            </NavLink>
            <span style={{ color: '#e0e7ff', fontSize: '0.85rem' }}>
              Hi, {customer?.name}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
