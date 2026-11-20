import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmptyState from './EmptyState';
import Loader from './Loader';

/**
 * Wrap routes that need a login:
 *   <Route element={<ProtectedRoute />}>...</Route>
 * Add `staffOnly` for the delivery dashboard.
 */
export default function ProtectedRoute({ staffOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (staffOnly && !user.is_delivery_staff) {
    return (
      <EmptyState icon="shield-lock" title="Access denied" actionTo="/" actionLabel="Back to Home">
        Only delivery staff can open this page.
      </EmptyState>
    );
  }
  return <Outlet />;
}
