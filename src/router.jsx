// import { createBrowserRouter } from "react-router-dom";
// import { lazy, Suspense } from "react";

// import Layout from "./layout/Layout.jsx";
// import MonthlyRentManagement from "./pages/users/MonthlyRentManagement.jsx";
// import DailyRentManagement from "./pages/users/DailyRentManagement.jsx";
// import MessOnlyRentManagement from "./pages/users/MessOnlyRentManagement.jsx";
// import ResidentDetails from "./pages/users/ResidentDetails.jsx";
// import OnboardingApprovalPage from "./pages/users/OnboardingApprovalPage.jsx";
// import AdminRegistration from "./pages/auth/AdminRegistration.jsx";
// import AdminLogin from "./pages/auth/AdminLogin.jsx";
// import OrderDetails from "./pages/mess/OrderDetails.jsx";
// import LoadingSpinner from "./ui/loadingSpinner/LoadingSpinner.jsx";
// import AuthRouteValidator from "./utils/AuthRouteValidator.jsx";
// import AddonOrderDetailsPage from "./pages/mess/AddonOrderDetailsPage.jsx";
// import AddonPage from "./pages/mess/AddonPage.jsx";
// import AddProperty from "./pages/property/AddProperty.jsx";
// import PropertyDetails from "./pages/property/PropertyDetails.jsx";
// import ProtectedRoute from "./utils/ProtectedRoute.jsx";
// import RoomAllocation from "./pages/property/room/RoomAllocation.jsx";
// import MaintenanceDashboard from "./pages/maintenance/MaintenanceDashboard.jsx";
// import MessMenuPage from "./pages/mess/MessMenuPage.jsx";
// import InventoryDetailPage from "./pages/mess/inventory/InventoryDetailPage.jsx";
// import KitchenPage from "./pages/mess/kitchen/KitchenPage.jsx";
// import KitchenDetailPage from "./pages/mess/kitchen/KitchenDetailPage.jsx";
// import DeadStockLogPage from "./pages/mess/inventory/DeadStockLogPage.jsx";
// import AddMessMenuPage from "./components/mess/AddMessMenuForm.jsx";
// import EditMessMenuPage from "./components/mess/EditMessMenuForm.jsx";
// import RecipePage from "./pages/mess/recipe/RecipePage.jsx";
// import EditResident from "./pages/users/EditResident.jsx";
// import PushNotificationPage from "./pages/notification/PushNotificationPage.jsx";
// import OffboardingPage from "./pages/Offboarding/OffboardingPage.jsx";
// import LogsPage from "./pages/activity-logs/LogsPage.jsx";
// import AlertNotification from "./pages/notification/AlertNotificationPage.jsx";
// import AlertNotificationPage from "./pages/notification/AlertNotificationPage.jsx";
// import NotificationLogsPage from "./pages/notification/NotificationLogsPage.jsx";
// import OnboardingPage from "./pages/Onboarding/OnboardingPage.jsx";
// import TodaysCheckoutPage from "./pages/todaysCheckout/TodaysCheckoutPage.jsx";
// import EmployeeDetail from "./pages/employee/EmployeeDetail.jsx";
// import EmployeePage from "./pages/employee/EmployeePage.jsx";

// const Dashboard = lazy(() => import("./pages/home/Dashboard.jsx"));
// const AccountsDashboard = lazy(() =>
//   import("./pages/accounts/AccountsDashboard.jsx")
// );
// const PropertyDashboard = lazy(() =>
//   import("./pages/property/PropertyDashboard.jsx")
// );

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       <ProtectedRoute>
//         <AuthRouteValidator>
//           <Suspense fallback={<LoadingSpinner fullPage />}>
//             <Layout />
//           </Suspense>
//         </AuthRouteValidator>
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Dashboard /> },
//       { path: "onboarding/:id", element: <OnboardingApprovalPage /> },
//       { path: "onboarding/rejoin/:id", element: <OnboardingApprovalPage /> },
//       { path: "accounts", element: <AccountsDashboard /> },
//       { path: "monthlyRent", element: <MonthlyRentManagement /> },
//       { path: "resident/:id", element: <ResidentDetails /> },
//       { path: "resident/:id/edit", element: <EditResident /> },
//       { path: "dailyRent", element: <DailyRentManagement /> },
//       { path: "food-only", element: <MessOnlyRentManagement /> },
//       { path: "property", element: <PropertyDashboard /> },
//       { path: "rooms", element: <RoomAllocation /> },
//       { path: "maintenance", element: <MaintenanceDashboard /> },
//       { path: "employees", element: <EmployeePage /> },
//       { path: "employees/:id", element: <EmployeeDetail /> },
//       { path: "add-property", element: <AddProperty /> },
//       { path: "property/edit/:id", element: <AddProperty isEdit /> },
//       {
//         path: "mess",
//         children: [
//           {
//             index: true,
//             element: <OrderDetails />,
//           },
//           {
//             path: "create",
//             element: <MessMenuPage />,
//           },
//           {
//             path: "create/menu",
//             element: <AddMessMenuPage />,
//           },
//           {
//             path: "edit",
//             element: <EditMessMenuPage />,
//           },
//         ],
//       },
//       {
//         path: "addons",
//         children: [
//           {
//             index: true,
//             element: <AddonOrderDetailsPage />,
//           },
//           {
//             path: "create",
//             element: <AddonPage />,
//           },
//         ],
//       },
//       {
//         path: "inventory",
//         children: [
//           {
//             index: true,
//             element: <InventoryDetailPage />,
//           },
//         ],
//       },
//       {
//         path: "kitchen",
//         children: [
//           {
//             index: true,
//             element: <KitchenPage />,
//           },
//           {
//             path: ":kitchenId",
//             element: <KitchenDetailPage />,
//           },
//           {
//             path: "dead-stock",
//             element: <DeadStockLogPage />,
//           },
//           {
//             path: "recipe/:recipeCategoryId",
//             element: <RecipePage />,
//           },
//         ],
//       },
//       { path: "add-property", element: <AddProperty /> },
//       { path: "property/:id", element: <PropertyDetails /> },
//       {
//         path: "notification",
//         children: [
//           {
//             path: "push-notification",
//             element: <PushNotificationPage />,
//           },
//           {
//             path: "alert-notification",
//             element: <AlertNotificationPage />,
//           },
//           {
//             path: "notification-logs",
//             element: <NotificationLogsPage />,
//           },
//         ],
//       },
//       { path: "offboarding", element: <OffboardingPage /> },
//       { path: "activity-logs", element: <LogsPage /> },
//       { path: "property-detail", element: <PropertyDetails /> },
//       { path: "offboarding", element: <OffboardingPage /> },
//       { path: "onboarding", element: <OnboardingPage /> },
//       { path: "todays-checkout", element: <TodaysCheckoutPage /> },
//       { path: "activity-logs", element: <LogsPage /> },
//     ],
//   },
//   {
//     path: "/register",
//     element: <AdminRegistration />,
//   },
//   {
//     path: "/login",
//     element: <AdminLogin />,
//   },
//   {
//     path: "*",
//     element: <div>404 Not Found</div>,
//   },
// ]);

// export default router;
import {createBrowserRouter, Outlet, Navigate} from "react-router-dom";
import {lazy, Suspense} from "react";

// --- Actual Component Imports ---
import Layout from "./layout/Layout.jsx";
import MonthlyRentManagement from "./pages/users/MonthlyRentManagement.jsx";
import DailyRentManagement from "./pages/users/DailyRentManagement.jsx";
import MessOnlyRentManagement from "./pages/users/MessOnlyRentManagement.jsx";
import ResidentDetails from "./pages/users/ResidentDetails.jsx";
import OnboardingApprovalPage from "./pages/users/OnboardingApprovalPage.jsx";
import AdminRegistration from "./pages/auth/AdminRegistration.jsx";
import AdminLogin from "./pages/auth/AdminLogin.jsx";
import OrderDetails from "./pages/mess/OrderDetails.jsx";
import LoadingSpinner from "./ui/loadingSpinner/LoadingSpinner.jsx";
import AuthRouteValidator from "./utils/AuthRouteValidator.jsx";
import AddonOrderDetailsPage from "./pages/mess/AddonOrderDetailsPage.jsx";
import AddonPage from "./pages/mess/AddonPage.jsx";
import AddProperty from "./pages/property/AddProperty.jsx";
import PropertyDetails from "./pages/property/PropertyDetails.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import RoomAllocation from "./pages/property/room/RoomAllocation.jsx";
import MaintenanceDashboard from "./pages/maintenance/MaintenanceDashboard.jsx";
import MessMenuPage from "./pages/mess/MessMenuPage.jsx";
import InventoryDetailPage from "./pages/mess/inventory/InventoryDetailPage.jsx";
import KitchenPage from "./pages/mess/kitchen/KitchenPage.jsx";
import KitchenDetailPage from "./pages/mess/kitchen/KitchenDetailPage.jsx";
import DeadStockLogPage from "./pages/mess/inventory/DeadStockLogPage.jsx";
import AddMessMenuPage from "./components/mess/AddMessMenuForm.jsx";
import EditMessMenuPage from "./components/mess/EditMessMenuForm.jsx";
import RecipePage from "./pages/mess/recipe/RecipePage.jsx";
import EditResident from "./pages/users/EditResident.jsx";
import PushNotificationPage from "./pages/notification/PushNotificationPage.jsx";
import OffboardingPage from "./pages/Offboarding/OffboardingPage.jsx";
import LogsPage from "./pages/activity-logs/LogsPage.jsx";
import AlertNotificationPage from "./pages/notification/AlertNotificationPage.jsx";
import NotificationLogsPage from "./pages/notification/NotificationLogsPage.jsx";
import OnboardingPage from "./pages/Onboarding/OnboardingPage.jsx";
import TodaysCheckoutPage from "./pages/todaysCheckout/TodaysCheckoutPage.jsx";
import EmployeeDetail from "./pages/employee/EmployeeDetail.jsx";
import EmployeePage from "./pages/employee/EmployeePage.jsx";
import ProtectedRouteWithPermission from "./utils/ProtectedRouteWithPermission.jsx";
import FinancialDetailsPage from "./pages/accounts/FinancialDetailsPage.jsx";
import ExpenseDetailsPage from "./pages/accounts/ExpenseDetailsPage.jsx";
import AllTransactionsPage from "./pages/accounts/AllTransactionsPage.jsx";
import DepositDetailsPage from "./pages/accounts/DepositDetailsPage.jsx";
import ReminderNotes from "./pages/reminderNotes/ReminderNotes.jsx";
import CookingRequirements from "./pages/mess/CookingRequirements.jsx";
import Assets from "./pages/assets/Assets.jsx";
import FloorManagement from "./pages/property/floor/FloorManagement.jsx";
import FloorRoomsPage from "./pages/property/floor/FloorRoomPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import WebsiteManagement from "./pages/home/website/WebsiteManagement.jsx";
import AccountingDashboard from "./pages/accounts/AccountingDashboard.jsx";
import GeneralLedger from "./pages/accounts/GeneralLedger.jsx";

const Dashboard = lazy(() => import("./pages/home/Dashboard.jsx"));
const AccountsDashboard = lazy(() =>
  import("./pages/accounts/AccountsDashboard.jsx")
);
const PropertyDashboard = lazy(() =>
  import("./pages/property/PropertyDashboard.jsx")
);

// --- Define all application routes in a single array ---
const appRoutes = [
  {index: true, element: <Dashboard />, path: "/"},
  {path: "onboarding/:id", element: <OnboardingApprovalPage />},
  {path: "onboarding/rejoin/:id", element: <OnboardingApprovalPage />},
  {path: "accounts", element: <AccountsDashboard />},
  {path: "accounting", element: <AccountingDashboard />},
  {
    path: "accounting/generalLedger",
    element: <GeneralLedger />,
  },
  {
    path: "accounts/transactions/deposits",
    element: <DepositDetailsPage />,
  },
  {path: "accounts/transactions/:type", element: <FinancialDetailsPage />},
  {path: "accounts/transactions/expenses", element: <ExpenseDetailsPage />},
  {path: "monthlyRent", element: <MonthlyRentManagement />},
  {path: "resident/:id", element: <ResidentDetails />},
  {path: "resident/:id/edit", element: <EditResident />},
  {path: "dailyRent", element: <DailyRentManagement />},
  {path: "food-only", element: <MessOnlyRentManagement />},
  {path: "property", element: <PropertyDashboard />},
  {path: "rooms", element: <RoomAllocation />},
  {path: "maintenance", element: <MaintenanceDashboard />},
  {path: "employees", element: <EmployeePage />},
  {path: "employees/:id", element: <EmployeeDetail />},
  {path: "add-property", element: <AddProperty />},
  {path: "property/edit/:id", element: <AddProperty isEdit />},
  {path: "mess", element: <OrderDetails />},
  {path: "mess/create", element: <MessMenuPage />},
  {path: "mess/create/menu", element: <AddMessMenuPage />},
  {path: "mess/edit", element: <EditMessMenuPage />},
  {path: "addons", element: <AddonOrderDetailsPage />},
  {path: "addons/create", element: <AddonPage />},
  {path: "inventory", element: <InventoryDetailPage />},
  {path: "kitchen", element: <KitchenPage />},
  {path: "kitchen/:kitchenId", element: <KitchenDetailPage />},
  {path: "kitchen/dead-stock", element: <DeadStockLogPage />},
  {path: "kitchen/recipe/:recipeCategoryId", element: <RecipePage />},
  {path: "property/:id", element: <PropertyDetails />},
  {path: "/notification/push-notification", element: <PushNotificationPage />},
  {
    path: "notification/alert-notification",
    element: <AlertNotificationPage />,
  },
  {path: "notification/notification-logs", element: <NotificationLogsPage />},
  {path: "offboarding", element: <OffboardingPage />},
  {path: "assets", element: <Assets />},
  {path: "activity-logs", element: <LogsPage />},
  {path: "onboarding", element: <OnboardingPage />},
  {path: "todays-checkout", element: <TodaysCheckoutPage />},
  {path: "active-reminders", element: <ReminderNotes />},
  {path: "/stock-usage", element: <CookingRequirements />},
  {path: "/floor", element: <FloorManagement />},
  {path: "/floors/:floorId/rooms", element: <FloorRoomsPage />},
  {path: "/website-management", element: <WebsiteManagement />},
  {
    path: "unauthorized",
    element: (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center">
        <svg
          className="w-24 h-24 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
        <h1 className="text-4xl font-bold text-gray-800">
          403 - Access Denied
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Sorry, you do not have the necessary permissions to view this page.
        </p>
        <a
          href="/"
          className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    ),
  },
  {path: "accounts/recent-transactions", element: <AllTransactionsPage />},
];

// --- Helper component to protect individual routes based on permissions ---

// --- The main router configuration ---
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AuthRouteValidator>
          <Layout>
            <Suspense fallback={<LoadingSpinner fullPage />}>
              <Outlet />
            </Suspense>
          </Layout>
        </AuthRouteValidator>
      </ProtectedRoute>
    ),
    // Map over appRoutes to wrap each one with the permission checker
    children: appRoutes.map((route) => ({
      ...route,
      element: (
        <ProtectedRouteWithPermission path={route.path}>
          {route.element}
        </ProtectedRouteWithPermission>
      ),
    })),
  },
  {path: "/register", element: <AdminRegistration />},
  {path: "/login", element: <AdminLogin />},
  {path: "/reset-password", element: <ResetPasswordPage />},
  {path: "*", element: <div>404 Not Found</div>},
]);

export default router;
