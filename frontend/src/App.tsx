import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages (Member)
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';

// Admin Auth & Protected Routes
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AccessDeniedPage } from './pages/admin/AccessDeniedPage';

// Admin Operations Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminStationsPage } from './pages/admin/AdminStationsPage';
import { AdminLiveMonitorPage } from './pages/admin/AdminLiveMonitorPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminMaintenancePage } from './pages/admin/AdminMaintenancePage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Main Pages (Member)
import { DashboardPage } from './pages/DashboardPage';
import { MyEVPage } from './pages/MyEVPage';

// AI & Predictions
import { BatteryHealthPage } from './pages/BatteryHealthPage';
import { RangePredictionPage } from './pages/RangePredictionPage';
import { RangeAnxietyPage } from './pages/RangeAnxietyPage';
import { AIAssistantPage } from './pages/AIAssistantPage';

// Charging
import { FindChargersPage } from './pages/FindChargersPage';
import { ChargerDetailPage } from './pages/ChargerDetailPage';
import { SmartRoutePage } from './pages/SmartRoutePage';
import { ChargingPage } from './pages/ChargingPage';
import { ChargingHistoryPage } from './pages/ChargingHistoryPage';
import { ChargingCostPage } from './pages/ChargingCostPage';
import { BookingsPage } from './pages/BookingsPage';

// Insights
import { CarbonFootprintPage } from './pages/CarbonFootprintPage';
import { EVAnalyticsPage } from './pages/EVAnalyticsPage';

// Account
import { WalletPage } from './pages/WalletPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

export function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <ErrorBoundary fallbackTitle="EVORA Platform Error">
          <BrowserRouter>
            <Routes>
              {/* Member Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Dedicated Admin Login & Access Denied Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/access-denied" element={<AccessDeniedPage />} />

              {/* First-time Onboarding Route */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Dedicated Protected Admin Portal Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="stations" element={<AdminStationsPage />} />
                <Route path="live-monitor" element={<AdminLiveMonitorPage />} />
                <Route path="members" element={<AdminMembersPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="history" element={<AdminHistoryPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="maintenance" element={<AdminMaintenancePage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Authenticated Member Application Routes with EVORA AppLayout */}
              <Route element={<AppLayout />}>
                {/* Default redirect to /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* MAIN */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/my-ev" element={<MyEVPage />} />

                {/* AI & PREDICTIONS */}
                <Route path="/battery-health" element={<BatteryHealthPage />} />
                <Route path="/range-prediction" element={<RangePredictionPage />} />
                <Route path="/range-anxiety" element={<RangeAnxietyPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />

                {/* CHARGING */}
                <Route path="/chargers" element={<FindChargersPage />} />
                <Route path="/chargers/:id" element={<ChargerDetailPage />} />
                <Route path="/route" element={<SmartRoutePage />} />
                <Route path="/charging" element={<ChargingPage />} />
                <Route path="/charging-history" element={<ChargingHistoryPage />} />
                <Route path="/charging-cost" element={<ChargingCostPage />} />
                <Route path="/bookings" element={<BookingsPage />} />

                {/* INSIGHTS */}
                <Route path="/carbon" element={<CarbonFootprintPage />} />
                <Route path="/analytics" element={<EVAnalyticsPage />} />

                {/* ACCOUNT */}
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
