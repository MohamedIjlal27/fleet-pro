import React, { useEffect, useState, useCallback, Suspense } from 'react';
//import { RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
//import router from "./router";
import { useAppDispatch, useAppSelector } from '@/redux/app/store';
import { clearUser } from '@/redux/features/user';
import axiosInstance from './utils/axiosConfig';
import '@fontsource/dm-sans';
import '@fontsource/dm-sans/200.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/raleway';
import '@fontsource/raleway/200.css';
import '@fontsource/raleway/300.css';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/100.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import NotFound from './pages/OtherPage/NotFound';
import UserProfiles from './pages/UserProfiles';
import Videos from './pages/UiElements/Videos';
import Images from './pages/UiElements/Images';
import Alerts from './pages/UiElements/Alerts';
import Badges from './pages/UiElements/Badges';
import Avatars from './pages/UiElements/Avatars';
import Buttons from './pages/UiElements/Buttons';
import LineChart from './pages/Charts/LineChart';
import BarChart from './pages/Charts/BarChart';
import Calendar from './pages/Calendar';
import BasicTables from './pages/Tables/BasicTables';
import FormElements from './pages/Forms/FormElements';
import Blank from './pages/Blank';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import Home from './pages/Dashboard/Home';
import PrivateRoute from '@/layout/PrivateRoute.tsx';
//import { Dashboard } from './modules/Dashboard/pages/Dashboard.tsx';
import { DashboardDND as Dashboard } from './modules/Dashboard/pages/DashboardDND.tsx';
import Login from './modules/auth/pages/Login.tsx';
import ForgotPassword from './modules/auth/pages/ForgotPassword.tsx';
import { OrganizationPage } from './modules/SuperAdmin/Organization/pages/OrganizationPage.tsx';
import FleetPage from './modules/Fleet/pages/FleetPage.tsx';
import { UserPage as OperationUserPage } from './modules/Operations/Users/pages/UserPage.tsx';
import { ReportPage as OperationReportPage } from './modules/Operations/Reports/pages/ReportPage.tsx';
import { UserPage as SuperAdminUserPage } from './modules/SuperAdmin/User/pages/UserPage.tsx';
import VehicleDetailsPage from './modules/Fleet/components/VehicleDetailsPage.tsx';
import { GaragePage as OperationGaragePage } from './modules/Operations/Garage/pages/GaragePage.tsx';
import { DriverPage } from './modules/Operations/Drivers/pages/DriverPage.tsx';
import { PlansPage } from './modules/Operations/Plans/pages/PlansPage.tsx';
import { AddGaragePage } from './modules/Operations/Garage/pages/AddGaragePage.tsx';
import { MapPage } from './modules/Map/pages/MapPage.tsx';
import GeotabStatPage from './modules/Map/components/GeotabStatPage.tsx';
import { CustomerPage } from './modules/Customer/pages/CustomerPage.tsx';
import { CustomerDetailsPage } from './modules/Customer/pages/CustomerDetailsPage.tsx';
import { DispatchPage } from '@/modules/Dispatch/pages/DispatchPage.tsx';
import { OrdersPage } from './modules/Orders/pages/OrdersPage.tsx';
import { OrderDetails } from './modules/Orders/pages/OrderDetails.tsx';
import { RequestsPage } from './modules/Requests/pages/RequestsPage.tsx';
import { BillsPage } from './modules/Bills/pages/BillsPage.tsx';
import { ScreeningLogsPage } from './modules/Operations/ScreeningLogs/pages/ScreeningLogsPage.tsx';
import { DriverDetailsPage } from './modules/Operations/Drivers/pages/DriverDetailsPage.tsx';
import TelemetryDevicePage from './modules/Settings/TelemetryDevice/pages/TelemetryDevicePage.tsx';
import { MaintenancePage } from './modules/Maintenance/MaintenanceRecord/pages/MaintenancePage.tsx';
import { AiMaintenancePage } from './modules/Maintenance/AiMaintenance/pages/AiMaintenancePage.tsx';
import { InsurancePage } from './modules/Settings/Insurance/pages/InsurancePage.tsx';
import { LeadsPage } from './modules/Leads/pages/LeadsPage.tsx';
import PreferencePage from './modules/Settings/Preference/pages/PreferencePage.tsx';
import BusinessInfoPage from './modules/Settings/BusinessInfo/pages/BusinessInfoPage.tsx';
import CustomerAgreementPage from './modules/Settings/CustomerAgreement/pages/CustomerAgreementPage.tsx';
import SmsEmailTemplatePage from './modules/Settings/SmsEmailTemplate/pages/SmsEmailTemplatePage.tsx';
import CustomerAgreementPreviewPage from './modules/Settings/CustomerAgreement/components/CustomerAgreementPreviewPage.tsx';
import CustomerAgreementSignaturePage from './modules/Settings/CustomerAgreement/components/CustomerAgreementSignaturePage.tsx';
import APIKeysPage from './modules/Settings/APIKeys/pages/APIKeysPage.tsx';
import ProfilePage from './modules/Operations/Users/pages/UserProfilePage.tsx';
import TaxRatePage from './modules/Settings/TaxRate/pages/TaxRatePage.tsx';
import InspectionReportPage from './modules/Public/InspectionReportPage.tsx';
import ResetPasswordPage from './modules/Public/ResetPasswordPage.tsx';
import InvitationNewPassword from './modules/Public/InvitationNewPassword.tsx';
import GeofencePage from './modules/Settings/Geofences/GeofencePage.tsx';
import EventsFlagPage from './modules/Settings/EventsFlag/EventsFlagPage.tsx';
import { OperatorLogPage } from './modules/Settings/OperatorLog/pages/OperatorLogPage.tsx';
import { TemplateTablePage } from './modules/Templates/TemplateTablePage.tsx';
import QuestionnairePage from './modules/Register/components/questionnaire-form.tsx';
import { OnboardingFormWithContext } from './modules/Questionnaire/onboarding-form.tsx';
import RegistrationWrap from './modules/Registration/RegisrationWrap.tsx';
import './i18n.ts';
import FleetManagementApp from './modules/SuperAdmin/CustomPlans/pages/custom-plan.tsx';
import SuperAdminLayout from './layout/SuperAdminLayout.tsx';

const App: React.FC = () => {
  const inactivityTimeLimit = 21600000; // 6 hours in milliseconds
  let inactivityTimer: NodeJS.Timeout;
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user);

  const logoutUserCallback = useCallback(async () => {
    try {
      // Demo mode logout
      localStorage.removeItem('demoUser');
      console.log('Logged out due to inactivity (demo mode)');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
      window.location.href = '/login';
      alert("You've been logged out due to inactivity.");
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      clearTimeout(inactivityTimer);
      return;
    }

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logoutUserCallback, inactivityTimeLimit);
    };

    resetInactivityTimer();

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearTimeout(inactivityTimer);
    };
  }, [inactivityTimeLimit, logoutUserCallback, isLoggedIn]);

  return (
    <>
      {/* <RouterProvider router={router} /> */}
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              {/* Dashboard Layout */}
              {/* <Route index path="/" element={<Home />} /> */}
              <Route
                index
                path="/"
                element={
                  <Suspense fallback={<>Loading...</>}>
                    <Dashboard />
                  </Suspense>
                }
              />

              <Route path="/profile" element={<UserProfiles />} />

              <Route
                index
                path="/dashboard"
                element={
                  <Suspense fallback={<>Loading...</>}>
                    <Dashboard />
                  </Suspense>
                }
              />

              <Route index path="/leads" element={<LeadsPage />} />

              <Route index path="/map" element={<MapPage />} />
              <Route index path="/map/:alertId" element={<MapPage />} />

              <Route index path="/fleet-management" element={<FleetPage />} />
              <Route
                index
                path="/vehicle/:id"
                element={<VehicleDetailsPage />}
              />
              <Route
                index
                path="/geotab-stat/:deviceID/:vehicleID"
                element={<GeotabStatPage />}
              />

              <Route
                index
                path="/operations/garages"
                element={<OperationGaragePage />}
              />
              <Route
                index
                path="/operations/garages/add"
                element={<AddGaragePage />}
              />
              <Route
                index
                path="/operations/garages/edit/:id"
                element={<AddGaragePage />}
              />
              <Route
                index
                path="/operations/users"
                element={
                  <Suspense fallback={<>Loading....</>}>
                    <OperationUserPage />
                  </Suspense>
                }
              />
              <Route
                index
                path="/operations/drivers"
                element={<DriverPage />}
              />
              <Route index path="/operations/plans" element={<PlansPage />} />
              <Route
                index
                path="/operations/drivers/:id"
                element={<DriverDetailsPage />}
              />
              <Route
                index
                path="/operations/screening-logs"
                element={<ScreeningLogsPage />}
              />
              <Route
                index
                path="/operations/reports"
                element={<OperationReportPage />}
              />

              <Route index path="/customer" element={<CustomerPage />} />
              <Route
                index
                path="/customer/:id"
                element={<CustomerDetailsPage />}
              />

              <Route
                index
                path="/maintenance/work-order"
                element={<MaintenancePage />}
              />
              <Route
                index
                path="/maintenance/ai-recommendation"
                element={<AiMaintenancePage />}
              />

              <Route index path="/dispatch" element={<DispatchPage />} />

              <Route index path="/orders" element={<OrdersPage />} />
              <Route
                index
                path="/orderDetails/:id"
                element={<OrderDetails />}
              />

              <Route index path="/requests" element={<RequestsPage />} />

              <Route index path="/bills" element={<BillsPage />} />

              <Route
                index
                path="/settings/preference"
                element={<PreferencePage />}
              />
              <Route
                index
                path="/settings/business-information"
                element={<BusinessInfoPage />}
              />
              <Route
                index
                path="/settings/customer-agreement"
                element={<CustomerAgreementPage />}
              />
              <Route
                index
                path="/settings/api-keys"
                element={<APIKeysPage />}
              />
              <Route
                index
                path="/settings/telemetry-devices"
                element={<TelemetryDevicePage />}
              />
              <Route
                index
                path="/settings/insurance"
                element={<InsurancePage />}
              />
              <Route
                index
                path="/settings/tax-rate"
                element={<TaxRatePage />}
              />
              <Route
                index
                path="/settings/geofences"
                element={<GeofencePage />}
              />
              <Route
                index
                path="/settings/operator-log"
                element={<OperatorLogPage />}
              />
              <Route
                index
                path="/settings/notification"
                element={<EventsFlagPage />}
              />
              <Route
                index
                path="/settings/sms-email-template"
                element={<SmsEmailTemplatePage />}
              />

              <Route
                path="/template/template-table-page"
                element={<TemplateTablePage />}
              />

              {/* Super Admin routes should go here 
                and make sure to wrap the component with <SuperAdminLayout>*/}
              <Route path="/super-admin">
                <Route
                  path="custom-plan"
                  element={
                    <SuperAdminLayout>
                      <FleetManagementApp />
                    </SuperAdminLayout>
                  }
                />
                <Route
                  index
                  path="organizations"
                  element={
                    <SuperAdminLayout>
                      <OrganizationPage />
                    </SuperAdminLayout>
                  }
                />
                <Route
                  index
                  path="users"
                  element={
                    <SuperAdminLayout>
                      <SuperAdminUserPage />
                    </SuperAdminLayout>
                  }
                />
              </Route>

              {/* Others Page */}
              {/* <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} /> */}

              {/* Forms */}
              {/* <Route path="/form-elements" element={<FormElements />} /> */}

              {/* Tables */}
              {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

              {/* Ui Elements */}
              {/* <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} /> */}

              {/* Charts */}
              {/* <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} /> */}
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<PrivateRoute />}>
            <Route
              path="/preview/customer-agreement"
              element={<CustomerAgreementSignaturePage />}
            />
            <Route
              path="/preview/customer-agreement-signature/:id"
              element={<CustomerAgreementSignaturePage />}
            />
          </Route>

          <Route
            path="/public/customer-agreement-signature"
            element={<CustomerAgreementSignaturePage />}
          />
          <Route
            path="/public/inspection-report"
            element={<InspectionReportPage />}
          />

          <Route
            path="/forgot/reset-password"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/invitation/new-password"
            element={<InvitationNewPassword />}
          />
          <Route path="/pricing" element={<QuestionnairePage />} />
          <Route path="/registration" element={<RegistrationWrap />} />
          <Route
            path="/questionnaire"
            element={<OnboardingFormWithContext />}
          />

          {/* Auth Layout */}
          {/* <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer style={{ zIndex: 100_000, top: '80px' }} />
    </>
  );
};

export default App;
