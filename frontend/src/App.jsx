import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import FleetPage from './pages/FleetPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Lazy-load the AdminPanel so it is split into a separate chunk and only
// fetched when the user navigates to /admin.
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

/**
 * Fallback shown while a lazy-loaded page is downloading.
 */
function PageLoader() {
  return <div className="loading">Loading page...</div>;
}

/**
 * App defines the route table:
 *  /            -> LoginPage (also the redirect target for unauthenticated users)
 *  /fleet       -> FleetPage (protected)
 *  /my-bookings -> MyBookingsPage (protected)
 *  /admin       -> AdminPanel (protected, lazy-loaded)
 *  *            -> redirect to /
 */
export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/fleet"
            element={
              <ProtectedRoute>
                <FleetPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
