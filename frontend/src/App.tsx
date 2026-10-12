import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';

// Main Pages
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

export function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary fallbackTitle="EVORA Platform Error">
        <BrowserRouter>
          <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* First-time Onboarding Route */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Authenticated Application Routes with EVORA AppLayout */}
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
</ThemeProvider>
  );
}

export default App;
