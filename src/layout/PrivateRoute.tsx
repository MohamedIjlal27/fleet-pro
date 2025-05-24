// PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAppSelector } from '@/redux/app/store';

const PrivateRoute = () => {
  const user = useAppSelector((state) => state.user);
    const location = useLocation();

  if (!user || !user.id || user.id == 0) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;