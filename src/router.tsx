import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "./modules/core/layouts/MainLayout.tsx";
import EmptyLayout from "./modules/core/layouts/EmptyLayout.tsx";
//import { Dashboard } from './modules/Dashboard/pages/Dashboard.tsx';
import { DashboardDND as Dashboard } from "./modules/Dashboard/pages/DashboardDND.tsx";
import Login from "./modules/auth/pages/Login.tsx";
import Error404Page from "./modules/core/pages/Error404Page.tsx";
import FleetPage from "./modules/Fleet/pages/FleetPage.tsx";
import PrivateRoute from "./modules/auth/components/PrivateRoute.tsx";
import { useAppSelector } from "./redux/app/store.ts";
import { Navigate } from "react-router-dom";
import { OrganizationPage } from "./modules/SuperAdmin/Organization/pages/OrganizationPage.tsx";
import { UserPage as OperationUserPage } from "./modules/Operations/Users/pages/UserPage.tsx";
import { ReportPage as OperationReportPage } from "./modules/Operations/Reports/pages/ReportPage.tsx";
import { UserPage as SuperAdminUserPage } from "./modules/SuperAdmin/User/pages/UserPage.tsx";
import VehicleDetailsPage from "./modules/Fleet/components/VehicleDetailsPage.tsx";
import { GaragePage as OperationGaragePage } from "./modules/Operations/Garage/pages/GaragePage.tsx";
import { DriverPage } from "./modules/Operations/Drivers/pages/DriverPage.tsx";
import { PlansPage } from "./modules/Operations/Plans/pages/PlansPage.tsx";
import { AddGaragePage } from "./modules/Operations/Garage/pages/AddGaragePage.tsx";
import { MapPage } from "./modules/Map/pages/MapPage.tsx";
import GeotabStatPage from "./modules/Map/components/GeotabStatPage.tsx";
import { CustomerPage } from "./modules/Customer/pages/CustomerPage.tsx";
import { CustomerDetailsPage } from "./modules/Customer/pages/CustomerDetailsPage.tsx";
import { DispatchPage } from "@/modules/Dispatch/pages/DispatchPage.tsx";
import { OrdersPage } from "./modules/Orders/pages/OrdersPage.tsx";
import { OrderDetails } from "./modules/Orders/pages/OrderDetails.tsx";
import { RequestsPage } from "./modules/Requests/pages/RequestsPage.tsx";
import { BillsPage } from "./modules/Bills/pages/BillsPage.tsx";
import { ScreeningLogsPage } from "./modules/Operations/ScreeningLogs/pages/ScreeningLogsPage.tsx";
import { DriverDetailsPage } from "./modules/Operations/Drivers/pages/DriverDetailsPage.tsx";
import TelemetryDevicePage from "./modules/Settings/TelemetryDevice/pages/TelemetryDevicePage.tsx";
import { MaintenancePage } from "./modules/Maintenance/MaintenanceRecord/pages/MaintenancePage.tsx";
import { AiMaintenancePage } from "./modules/Maintenance/AiMaintenance/pages/AiMaintenancePage.tsx";
import { InsurancePage } from "./modules/Settings/Insurance/pages/InsurancePage.tsx";
import { LeadsPage } from "./modules/Leads/pages/LeadsPage.tsx";
import PreferencePage from "./modules/Settings/Preference/pages/PreferencePage.tsx";
import BusinessInfoPage from "./modules/Settings/BusinessInfo/pages/BusinessInfoPage.tsx";
import CustomerAgreementPage from "./modules/Settings/CustomerAgreement/pages/CustomerAgreementPage.tsx";
import  SmsEmailTemplatePage from "./modules/Settings/SmsEmailTemplate/pages/SmsEmailTemplatePage.tsx";
import CustomerAgreementPreviewPage from "./modules/Settings/CustomerAgreement/components/CustomerAgreementPreviewPage.tsx";
import CustomerAgreementSignaturePage from "./modules/Settings/CustomerAgreement/components/CustomerAgreementSignaturePage.tsx";
import APIKeysPage from "./modules/Settings/APIKeys/pages/APIKeysPage.tsx";
import ProfilePage from "./modules/Operations/Users/pages/UserProfilePage.tsx";
import TaxRatePage from "./modules/Settings/TaxRate/pages/TaxRatePage.tsx";
import InspectionReportPage from "./modules/Public/InspectionReportPage.tsx";
import ResetPasswordPage from "./modules/Public/ResetPasswordPage.tsx";
import InvitationNewPassword from "./modules/Public/InvitationNewPassword.tsx";
import GeofencePage from "./modules/Settings/Geofences/GeofencePage.tsx";
import EventsFlagPage from "./modules/Settings/EventsFlag/EventsFlagPage.tsx";
import { OperatorLogPage } from "./modules/Settings/OperatorLog/pages/OperatorLogPage.tsx";
import { TemplateTablePage } from "./modules/Templates/TemplateTablePage.tsx";
import QuestionnairePage from "./modules/Register/components/questionnaire-form.tsx";
import AddOnsPage from "./modules/Registration/add-ons-page.tsx";
import RegistrationLayout from "./modules/Registration/RegistrationLayout.tsx";
////import OnboardingForm from "./modules/Questionnaire/onboarding-form.tsx";
import RegistrationWrap from "./modules/Registration/RegisrationWrap.tsx";
import AppLayout from "./layout/AppLayout";
import { Suspense } from "react";
import FleetManagementApp from "./modules/SuperAdmin/CustomPlans/pages/custom-plan.tsx";

const isLocal = import.meta.env.VITE_ENV === "local";

const ProtectedLoginRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.user);

  if (user && user.id && user.id > 0) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    errorElement: <Error404Page />,
    children: [
      {
        path: "super-admin/",
        element: (
          <>
            <Outlet />
          </>
        ),
        children: [
          {
            path: "organizations",
            element: <OrganizationPage />,
          },
          {
            path: "users",
            element: <SuperAdminUserPage />,
          },
          {
            path: "custom-plan",
            element: <FleetManagementApp />, // You need to create and import this component
          },
        ],
      },
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "leads",
        element: <LeadsPage />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "map/:alertId",
        element: <MapPage />,
      },
      {
        path: "fleet-management",
        element: <FleetPage />,
      },
      {
        path: "vehicle/:id",
        element: <VehicleDetailsPage />,
      },
      {
        path: "geotab-stat/:deviceID/:vehicleID",
        element: <GeotabStatPage />,
      },
      {
        path: "operations/",
        element: (
          <>
            <Outlet />
          </>
        ),
        children: [
          {
            path: "garages",
            element: <OperationGaragePage />,
          },
          {
            path: "garages/add",
            element: <AddGaragePage />,
          },
          {
            path: "garages/edit/:id",
            element: <AddGaragePage />,
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<>Loading....</>}>
                <OperationUserPage />
              </Suspense>
            ),
          },
          {
            path: "drivers",
            element: <DriverPage />,
          },
          {
            path: "plans",
            element: <PlansPage />,
          },

          {
            path: "drivers/:id",
            element: <DriverDetailsPage />,
          },
          {
            path: "screening-logs",
            element: <ScreeningLogsPage />,
          },
          // {
          //   path: "screening-logs/download-report/:id",
          //   element: <ScreeningLogsPage />,
          // },
          {
            path: "reports",
            element: <OperationReportPage />,
          },
        ],
      },
      {
        path: "customer",
        element: <CustomerPage />,
      },
      {
        path: "customer/:id",
        element: <CustomerDetailsPage />,
      },
      {
        path: "maintenance",
        element: (
          <>
            <Outlet />
          </>
        ),
        children: [
          {
            path: "work-order",
            element: <MaintenancePage />,
          },
          {
            path: "ai-recommendation",
            element: <AiMaintenancePage />,
          },
        ],
      },
      {
        path: "dispatch",
        element: <DispatchPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "orderDetails/:id",
        element: <OrderDetails />,
      },
      {
        path: "requests",
        element: <RequestsPage />,
      },
      {
        path: "bills",
        element: <BillsPage />,
      },
      {
        path: "settings",
        element: (
          <>
            <Outlet />
          </>
        ),
        children: [
          {
            path: "preference",
            element: <PreferencePage />,
          },
          {
            path: "business-information",
            element: <BusinessInfoPage />,
          },
          {
            path: "customer-agreement",
            element: <CustomerAgreementPage />,
          },
          /*{
            path: 'customer-agreement/preview',
            element: <CustomerAgreementPreviewPage />,
          },*/
          {
            path: "api-keys",
            element: <APIKeysPage />,
          },
          {
            path: "telemetry-devices",
            element: <TelemetryDevicePage />,
          },
          {
            path: "insurance",
            element: <InsurancePage />,
          },
          {
            path: "tax-rate",
            element: <TaxRatePage />,
          },
          {
            path: "geofences",
            element: <GeofencePage />,
          },
          {
            path: "operator-log",
            element: <OperatorLogPage />,
          },
          {
            path: "notification",
            element: <EventsFlagPage />,
          },
          {
            path: "sms-email-template",
            element: <SmsEmailTemplatePage />,
          },
        ],
      },
      ...(isLocal
        ? [
            {
              path: "template",
              element: <Outlet />,
              children: [
                {
                  path: "template-table-page",
                  element: <TemplateTablePage />,
                },
              ],
            },
          ]
        : []),
    ],
  },
  {
    path: "login",
    element: (
      <ProtectedLoginRoute>
        <Login />
      </ProtectedLoginRoute>
    ),
  },
  {
    path: "preview",
    element: (
      <PrivateRoute>
        <EmptyLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "customer-agreement",
        element: <CustomerAgreementSignaturePage />,
      },
      {
        path: "customer-agreement-signature/:id",
        element: <CustomerAgreementSignaturePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Error404Page />,
  },
  // {
  //   path: 'public/customer-agreement-signature',
  //   element: <CustomerAgreementSignaturePage/>, // Public route accessible to everyone
  // },
  {
    path: "public",
    element: (
      <>
        <Outlet />
      </>
    ),
    children: [
      {
        path: "customer-agreement-signature",
        element: <CustomerAgreementSignaturePage />,
      },
      {
        path: "inspection-report",
        element: <InspectionReportPage />,
      },
    ],
  },
  {
    path: "forgot",
    element: (
      <>
        <Outlet />
      </>
    ),
    children: [
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: "invitation",
    element: (
      <>
        <Outlet />
      </>
    ),
    children: [
      {
        path: "new-password",
        element: <InvitationNewPassword />,
      },
    ],
  },
  {
    path: "pricing",
    element: (
      <>
        <QuestionnairePage />;
      </>
    ),
  },
  {
    path: "registration",
    element: <RegistrationWrap />,
  },
  // {
  //   path: "questionnaire",
  //   element: <OnboardingForm />,
  // },
  // {
  //   path: "registration",
  //   element: (
  //     <>
  //       <RegistrationFlow />;
  //     </>
  //   ),
  // },
]);

export default router;
