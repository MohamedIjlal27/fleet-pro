// Demo data for local development without backend

export const demoUsers = [
  {
    id: 1,
    email: 'admin@demo.com',
    password: 'demo123',
    username: 'admin_demo',
    picture: 'https://ui-avatars.com/api/?name=Admin+Demo&background=3b82f6&color=fff&size=150',
    organizationId: 1,
    firstName: 'Admin',
    lastName: 'Demo',
    roles: [
      { name: 'Admin', slug: 'admin' },
      { name: 'Fleet Manager', slug: 'fleet_manager' }
    ],
    permissions: [
      { name: 'Dashboard Access', slug: 'dashboard_access' },
      { name: 'Fleet Management', slug: 'fleet_management' },
      { name: 'User Management', slug: 'user_management' }
    ],
    subscribedPlans: [
      'free-trial',
      'fleet_management',
      'subscription-rental',
      'dispatch-centre'
    ],
    modules: {
      'dashboard': 'basic',
      'leads': 'premium',
      'map': 'basic',
      'map_ai-dashcam': 'premium',
      'fleet': 'basic',
      'fleet_schedules': 'basic',
      'fleet_schedules_vehicle-assignment': 'basic',
      'fleet_schedules_maintenance': 'basic',
      'fleet_maintenance': 'basic',
      'fleet_inspection': 'basic',
      'fleet_pictures': 'basic',
      'fleet_documents': 'basic',
      'fleet_logs': 'basic',
      'fleet_notes': 'basic',
      'operations': 'basic',
      'operations_garages': 'basic',
      'operations_users': 'basic',
      'operations_plans': 'basic',
      'operations_drivers': 'basic',
      'operations_drivers_general': 'basic',
      'operations_drivers_vehicle-assignment': 'basic',
      'operations_drivers_behaviour-and-analytics': 'premium',
      'operations_drivers_keys': 'basic',
      'operations_screening-logs': 'basic',
      'operations_reports': 'basic',
      'customer': 'basic',
      'maintenance': 'basic',
      'maintenance_work-order': 'basic',
      'maintenance_ai-recommendations': 'premium',
      'dispatch': 'basic',
      'orders': 'basic',
      'requests': 'basic',
      'bills': 'basic',
      'settings': 'basic',
      'settings_preference': 'basic',
      'settings_business-information': 'basic',
      'settings_customer-agreement': 'basic',
      'settings_insurance': 'basic',
      'settings_api-keys': 'basic',
      'settings_telemetry-device': 'basic',
      'settings_tax-rate': 'basic',
      'settings_geofences': 'basic',
      'settings_operator-log': 'basic',
      'settings_events-flag': 'basic',
      'settings_sms-email-template': 'basic',
      'settings_sms-email-template_general': 'basic',
      'settings_sms-email-template_fleet-management': 'basic',
      'settings_sms-email-template_subscription-rental': 'basic',
      'settings_sms-email-template_dispatch-centre': 'basic',
      'agent-app': 'basic',
      'driver-app': 'basic',
      'driver-app_Synopss': 'basic',
      'driver-app_inspection': 'basic',
      'asset-care-app': 'basic'
    }
  },
  {
    id: 2,
    email: 'manager@demo.com',
    password: 'demo123',
    username: 'manager_demo',
    picture: 'https://ui-avatars.com/api/?name=Manager+Demo&background=10b981&color=fff&size=150',
    organizationId: 1,
    firstName: 'Manager',
    lastName: 'Demo',
    roles: [
      { name: 'Fleet Manager', slug: 'fleet_manager' }
    ],
    permissions: [
      { name: 'Dashboard Access', slug: 'dashboard_access' },
      { name: 'Fleet Management', slug: 'fleet_management' }
    ],
    subscribedPlans: [
      'free-trial',
      'fleet_management'
    ],
    modules: {
      'dashboard': 'basic',
      'fleet': 'basic',
      'fleet_schedules': 'basic',
      'fleet_maintenance': 'basic',
      'fleet_inspection': 'basic',
      'operations': 'basic',
      'operations_garages': 'basic',
      'operations_drivers': 'basic',
      'settings': 'basic',
      'settings_preference': 'basic'
    }
  },
  {
    id: 3,
    email: 'dispatcher@demo.com',
    password: 'demo123',
    username: 'dispatcher_demo',
    picture: 'https://ui-avatars.com/api/?name=Dispatcher+Demo&background=f59e0b&color=fff&size=150',
    organizationId: 1,
    firstName: 'Dispatcher',
    lastName: 'Demo',
    roles: [
      { name: 'Dispatcher', slug: 'dispatcher' }
    ],
    permissions: [
      { name: 'Dashboard Access', slug: 'dashboard_access' },
      { name: 'Dispatch Access', slug: 'dispatch_access' }
    ],
    subscribedPlans: [
      'free-trial',
      'dispatch-centre'
    ],
    modules: {
      'dashboard': 'basic',
      'map': 'basic',
      'dispatch': 'basic',
      'orders': 'basic',
      'customer': 'basic',
      'settings': 'basic'
    }
  }
];

export const demoSystemPlans = {
  subscribedPlans: [
    'free-trial',
    'fleet_management',
    'subscription-rental',
    'dispatch-centre'
  ],
  modules: {
    'dashboard': 'basic',
    'leads': 'premium',
    'map': 'basic',
    'fleet': 'basic',
    'operations': 'basic',
    'customer': 'basic',
    'maintenance': 'basic',
    'dispatch': 'basic',
    'orders': 'basic',
    'settings': 'basic'
  }
};

// Demo authentication function
export const authenticateUser = (email: string, password: string) => {
  const user = demoUsers.find(u => u.email === email && u.password === password);
  if (user) {
    // Return user without password and ensure modules is a proper Record<string, string>
    const { password: _, modules, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      modules: modules as Record<string, string>
    };
  }
  return null;
};

// Demo system plans fetch
export const getDemoSystemPlans = () => {
  return demoSystemPlans;
}; 