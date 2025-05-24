import { useSelector } from 'react-redux';
import { RootState } from '@/redux/app/store';

export const checkPlanExists = (planName: string): boolean => {
  const subscribedPlans = useSelector(
    (state: RootState) => state.user.subscribedPlans
  );
  //console.log("subscribedPlans",subscribedPlans);

  if (!Array.isArray(subscribedPlans)) {
    return false;
  }

  return subscribedPlans.includes(planName);
};

export const checkModuleExists = (moduleName: string): boolean => {
  const modules = useSelector((state: RootState) => {
    const modules = state.user.modules;
    return modules;
  });
  if (typeof modules !== 'object' || modules === null) {
    return false;
  }

  return moduleName in modules;
};

export const checkIsSuperAdmin = (): boolean => {
  const isSuperAdmin = useSelector((state: RootState) =>
    state.user.roles.some((role) => role.slug === 'super_admin')
  );
  return isSuperAdmin;
};
