import { useSelector } from 'react-redux';
import { RootState } from '@/redux/app/store';
import Error404Page from '@/modules/core/pages/Error404Page';

/**
 * Protected layout component for SuperAdmin pages
 * Only renders children if user has super admin role, otherwise redirects to 404
 */
const SuperAdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const roles = useSelector((state: RootState) => state.user.roles);

  // Check if any role has the slug 'super_admin'
  const hasSuperAdminRole = roles.some((role) => role.slug === 'super_admin');
  return hasSuperAdminRole ? <>{children}</> : <Error404Page />;
};

export default SuperAdminLayout;
