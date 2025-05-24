import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { systemPlan, systemModule } from '@/utils/constants';
import {
  checkModuleExists,
  checkPlanExists,
  checkIsSuperAdmin,
} from '@/lib/moduleUtils';

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon,
} from '../icons';
import { useSidebar } from '../context/SidebarContext';
import SidebarWidget from './SidebarWidget';
import {
  LayoutDashboard,
  Heart,
  Map,
  CarFront,
  Flag,
  Wrench,
  MessagesSquare,
  Receipt,
  Settings,
  Package,
  NotepadText,
  User,
  Shield,
} from 'lucide-react';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

interface AppSidebarProps {
  sidebarLogo: string;
  sidebarLogoDark: string;
  sidebarLogoSmall: string;
}
const AppSidebar: React.FC<AppSidebarProps> = ({
  sidebarLogo,
  sidebarLogoDark,
  sidebarLogoSmall,
}) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const navItems: NavItem[] = [
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Dashboard)
      ? [
          {
            icon: <LayoutDashboard />,
            name: 'Dashboard',
            path: '/dashboard',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Leads)
      ? [
          {
            icon: <Heart />,
            name: 'Leads',
            path: '/leads',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Map)
      ? [
          {
            icon: <Map />,
            name: 'Map',
            path: '/map',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Fleet)
      ? [
          {
            icon: <CarFront />,
            name: 'Fleet',
            path: '/fleet-management',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Operations)
      ? [
          {
            name: 'Operations',
            icon: <Flag />,
            subItems: [
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.OperationsGarages)
                ? [{ name: 'Garages', path: '/operations/garages', pro: false }]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.OperationsUsers)
                ? [{ name: 'Users', path: '/operations/users', pro: false }]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.OperationsPlans)
                ? [{ name: 'Plans', path: '/operations/plans', pro: false }]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.OperationsDrivers)
                ? [{ name: 'Drivers', path: '/operations/drivers', pro: false }]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.OperationsScreeningLogs)
                ? [
                    {
                      name: 'Screening Logs',
                      path: '/operations/screening-logs',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.OperationsReports)
                ? [{ name: 'Reports', path: '/operations/reports', pro: false }]
                : []),
            ],
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Customer)
      ? [
          {
            icon: <User />,
            name: 'Customer',
            path: '/customer',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Maintenance)
      ? [
          {
            name: 'Maintenance',
            icon: <Wrench />,
            subItems: [
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.MaintenanceWorkOrder)
                ? [
                    {
                      name: 'Work Order',
                      path: '/maintenance/work-order',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.MaintenanceAIRecommendations)
                ? [
                    {
                      name: 'AI Recommendation',
                      path: '/maintenance/ai-recommendation',
                      pro: false,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Dispatch)
      ? [
          {
            icon: <Package />,
            name: 'Dispatch',
            path: '/dispatch',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Orders)
      ? [
          {
            icon: <NotepadText />,
            name: 'Orders',
            path: '/orders',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Requests)
      ? [
          {
            icon: <MessagesSquare />,
            name: 'Requests',
            path: '/requests',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Bills)
      ? [
          {
            icon: <Receipt />,
            name: 'Bills',
            path: '/bills',
          },
        ]
      : []),
    ...(checkPlanExists(systemPlan.FreeTrial) ||
    checkModuleExists(systemModule.Settings)
      ? [
          {
            name: 'Settings',
            icon: <Settings />,
            subItems: [
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsPreference)
                ? [
                    {
                      name: 'Preference',
                      path: '/settings/preference',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsBusinessInformation)
                ? [
                    {
                      name: 'Business Information',
                      path: '/settings/business-information',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsCustomerAgreement)
                ? [
                    {
                      name: 'Customer Agreement',
                      path: '/settings/customer-agreement',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsInsurance)
                ? [
                    {
                      name: 'Insurance',
                      path: '/settings/insurance',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsAPIKeys)
                ? [{ name: 'API Keys', path: '/settings/api-keys', pro: false }]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsTelemetryDevice)
                ? [
                    {
                      name: 'Telemetry Device',
                      path: '/settings/telemetry-devices',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsTaxRate)
                ? [{ name: 'Tax Rate', path: '/settings/tax-rate', pro: false }]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsGeofences)
                ? [
                    {
                      name: 'Geofences',
                      path: '/settings/geofences',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsOperatorLog)
                ? [
                    {
                      name: 'Operator Log',
                      path: '/settings/operator-log',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsEventsFlag)
                ? [
                    {
                      name: 'Notification',
                      path: '/settings/notification',
                      pro: false,
                    },
                  ]
                : []),
              ...(checkPlanExists(systemPlan.FreeTrial) ||
              checkModuleExists(systemModule.SettingsSmsEmailTemplate)
                ? [
                    {
                      name: 'SMS / Email Template',
                      path: '/settings/sms-email-template',
                      pro: false,
                    },
                  ]
                : []),
              // ...(checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsSuperAdmin)) ? [{ name: "Super Admin", path: "/settings/super-admin", pro: false }] : [],
            ],
          },
        ]
      : []),
    ...(checkIsSuperAdmin()
      ? [
          {
            name: 'Super Admin',
            icon: <Shield />,
            subItems: [
              ...(checkIsSuperAdmin()
                ? [
                    {
                      name: 'Custom Plan',
                      path: '/super-admin/custom-plan',
                      pro: false,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  const othersItems: NavItem[] = [
    {
      icon: <PieChartIcon />,
      name: 'Charts',
      subItems: [
        { name: 'Line Chart', path: '/line-chart', pro: false },
        { name: 'Bar Chart', path: '/bar-chart', pro: false },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: 'UI Elements',
      subItems: [
        { name: 'Alerts', path: '/alerts', pro: false },
        { name: 'Avatar', path: '/avatars', pro: false },
        { name: 'Badge', path: '/badge', pro: false },
        { name: 'Buttons', path: '/buttons', pro: false },
        { name: 'Images', path: '/images', pro: false },
        { name: 'Videos', path: '/videos', pro: false },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: 'Authentication',
      subItems: [
        { name: 'Sign In', path: '/signin', pro: false },
        { name: 'Sign Up', path: '/signup', pro: false },
      ],
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ['main', 'others'].forEach((menuType) => {
      const items = menuType === 'main' ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as 'main' | 'others',
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: 'main' | 'others') => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'menu-item-active'
                  : 'menu-item-inactive'
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'lg:justify-start'
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? 'menu-item-icon-active'
                    : 'menu-item-icon-inactive'
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? 'rotate-180 text-brand-500'
                      : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive'
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : '0px',
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? 'menu-dropdown-item-active'
                          : 'menu-dropdown-item-inactive'
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? 'menu-dropdown-badge-active'
                                : 'menu-dropdown-badge-inactive'
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
            ? 'w-[290px]'
            : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={sidebarLogoDark}
                alt="Logo"
                width={200}
                height={60}
              />
              <img
                className="hidden dark:block"
                src={sidebarLogo}
                alt="Logo"
                width={200}
                height={60}
              />
            </>
          ) : (
            <img src={sidebarLogo} alt="Logo" width={48} height={48} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  ''
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, 'main')}
            </div>
            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
