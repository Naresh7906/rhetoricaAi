import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/user-context';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: 'employee' | 'hr';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    // You could return a loading spinner here
    return null;
  }

  if (!user) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    // Redirect to appropriate dashboard if user has wrong role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
} 