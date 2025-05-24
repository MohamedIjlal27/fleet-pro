import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Dashboard,
  Person,
  Build,
  Receipt,
  Settings,
  Flag,
  Forum,
  AttachMoney,
  CarRental,
  Map,
  Route,
} from "@mui/icons-material";
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import FavoriteIcon from "@mui/icons-material/Favorite";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import BugReportIcon from "@mui/icons-material/BugReport";
import { getBusinessInfo } from "@/utils/api";
import defaultLogo from "/src/assets/logo-dark.svg";

const isLocal = import.meta.env.VITE_ENV === "local";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}


const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [open, setOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [logo, setLogo] = useState<string>("");
  const [smLogo, setSmLogo] = useState<string>("");

  //const sidebarLogo = import.meta.env.VITE_ENV === "local" ? (isCollapsed ? s_aclogo : l_aclogo) : (isCollapsed ? sm_logo : logo);

  useEffect(() => {
    getBusinessInfo().then((data) => {
      setLogo(data.metadata?.biz_icon);
      setSmLogo(data.metadata?.biz_icon_small);
    });

    // Update activeItem based on the current URL path
    const pathSegments = location.pathname.split("/").slice(1, 3);
    const currentPath = `/${pathSegments.join("/")}`;
    setActiveItem(currentPath);

    // Check if the first segment is 'operations'
    const firstSegment = pathSegments[0];
    if (firstSegment === "operations") {
      // Find the index of the item that matches the first segment
      const index = sidebarItems.findIndex((item) =>
        item.link.startsWith(`/${firstSegment}`)
      );
      setOpen(index);
    } else {
      setOpen(null);
    }
  }, []);

  const sidebarItems = [
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Dashboard)) && {
      text: "Dashboard",
      icon: <Dashboard />,
      link: "/dashboard",
    },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Leads)) && {
      text: "Leads",
      icon: <FavoriteIcon />,
      link: "/leads",
    },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Map)) && {
      text: "Map",
      icon: <Map />,
      link: "/map",
    },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Fleet)) && {
      text: "Fleet",
      icon: <CarRental />,
      link: "/fleet-management",
    },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Operations)) && {
      text: "Operations",
      icon: <Flag />,
      link: "/operations",
      subItems: [
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.OperationsGarages)) && { text: "Garages", link: "/operations/garages" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.OperationsUsers)) && { text: "Users", link: "/operations/users" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.OperationsPlans)) && { text: "Plans", link: "/operations/plans" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.OperationsDrivers)) && { text: "Drivers", link: "/operations/drivers" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.OperationsScreeningLogs)) && { text: "Screening Logs", link: "/operations/screening-logs" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.OperationsReports)) && { text: "Reports", link: "/operations/reports" },
      ].filter(Boolean),
    },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Customer)) && { text: "Customer", icon: <Person />, link: "/customer" },
    // { text: 'Maintenance', icon: <Build />, link: '/maintenance' },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Maintenance)) && {
      text: "Maintenance",
      icon: <Build />,
      link: "/maintenance",
      subItems: [
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.MaintenanceWorkOrder)) && { text: "Work Order", link: "/maintenance/work-order" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.MaintenanceAIRecommendations)) && { text: "AI Recommendation", link: "/maintenance/ai-recommendation" },
      ].filter(Boolean),
    },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Dispatch)) && { text: "Dispatch", icon: <Route />, link: "/dispatch" },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Orders)) && { text: "Orders", icon: <Receipt />, link: "/orders" },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Requests)) && { text: "Requests", icon: <Forum />, link: "/requests" },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Bills)) && { text: "Bills", icon: <AttachMoney />, link: "/bills" },
    (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.Settings)) && {
      text: "Settings",
      icon: <Settings />,
      link: "/settings",
      subItems: [
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsPreference)) && { text: "Preference", link: "/settings/preference" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsBusinessInformation)) && {
          text: "Business Information",
          link: "/settings/business-information",
        },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsCustomerAgreement)) && { text: "Customer Agreement", link: "/settings/customer-agreement" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsInsurance)) && { text: "Insurance", link: "/settings/insurance" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsAPIKeys)) && { text: "API Keys", link: "/settings/api-keys" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsTelemetryDevice)) && { text: "Telemetry Device", link: "/settings/telemetry-devices" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsTaxRate)) && { text: "Tax Rate", link: "/settings/tax-rate" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsGeofences)) && { text: "Geofences", link: "/settings/geofences" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsOperatorLog)) && { text: "Operator Log", link: "/settings/operator-log" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsEventsFlag)) && { text: "Notification", link: "/settings/notification" },
        (checkPlanExists(systemPlan.FreeTrial) || checkModuleExists(systemModule.SettingsSmsEmailTemplate)) && { text: "SMS / Email Template", link: "/settings/sms-email-template" },
      ].filter(Boolean),
    },
    ...(isLocal
      ? [
          {
            text: "Template",
            icon: <BugReportIcon />, // Change this to a relevant icon
            link: "/template",

            subItems: [
              {
                text: "template-table-page",
                link: "/template/template-table-page",
              },
            ],
          },
        ]
      : []),
  ].filter(Boolean);

  const handleItemClick = (link: string, text: string) => {
    setActiveItem(text);
    navigate(link);
  };

  const handleAccordionToggle = (index: number) => {
    setIsCollapsed(false);
    setOpen(open === index ? null : index);
  };
  const sidebarLogo = isCollapsed ? smLogo : logo;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{ width: isCollapsed ? 80 : 240, flexShrink: 0, zIndex: 0 }}
      classes={{
        paper: `transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-60"
        } bg-white text-gray-900 border-r border-gray-300`,
      }}
    >
      {/* Logo Container */}
      <Box
        sx={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "white",
          minHeight: "80px",
        }}
      >
        {sidebarLogo ? (
          <img
            draggable="false"
            src={sidebarLogo}
            alt="Synops Logo"
            className={`w-full object-contain ${isCollapsed ? "h-5" : "h-12"}`}
          />
        ) : (
          <img
            draggable="false"
            src={defaultLogo}
            alt="Synops Logo"
            className={`w-full object-contain ${isCollapsed ? "h-5" : "h-12"}`}
          />
        )}
      </Box>

      <Divider className="mx-4 my-2" />
      {/* Regular Sidebar Section */}
      <div className="sidebar-items-container mt-4">
        <List>
          {sidebarItems.map((item, index) => (
            <React.Fragment key={index}>
              <Tooltip title={isCollapsed ? item.text : ""} placement="right">
                <ListItem
                  className={`p-0 cursor-pointer hover:bg-gray-100 transition-all duration-150 transform hover:scale-105 hover:shadow-md rounded-lg mx-2 ${
                    activeItem === item.link ? "bg-gray-200" : ""
                  }`}
                  onClick={() =>
                    item.subItems
                      ? handleAccordionToggle(index)
                      : handleItemClick(item.link, item.text)
                  }
                >
                  <ListItemIcon className="text-blue-600">
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.text}
                      className={`mr-auto font-medium ${
                        activeItem === item.text
                          ? "text-black"
                          : "text-gray-700"
                      }`}
                    />
                  )}
                  {item.subItems && !isCollapsed && (
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${
                        open === index ? "rotate-180" : ""
                      } text-gray-700`}
                    />
                  )}
                </ListItem>
              </Tooltip>
              {item.subItems && open === index && !isCollapsed && (
                <List
                  component="div"
                  disablePadding
                  className="pl-6 bg-gray-50"
                >
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem
                      key={subIndex}
                      className="cursor-pointer hover:bg-gray-200 transition-all duration-150 rounded-md"
                      onClick={() =>
                        handleItemClick(subItem.link, subItem.text)
                      }
                    >
                      <ListItemIcon className="text-gray-500">
                        <div className="h-4 w-4" />
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        className="text-gray-600"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))}
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;
