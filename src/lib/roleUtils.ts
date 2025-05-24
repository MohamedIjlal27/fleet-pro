import { useSelector } from 'react-redux';
import { RootState } from '@/redux/app/store';

export const checkRoleExists = (roleName: string): boolean => {
  const roles = useSelector((state: RootState) => state.user.roles);
  //console.log("roles",roles);

  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles.some(role => role.name === roleName);
};

export const checkPermissionExists = (permissionName: string): boolean => {
  const permissions = useSelector((state: RootState) => state.user.permissions);
  //console.log("permissions",permissions);

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.some(permission => permission.name === permissionName);
};