import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import EventsPage from './pages/EventsPage';
import NewEventPage from './pages/NewEventPage';
import WastePredictionPage from './pages/WastePredictionPage';
import AIAssistantPage from './pages/AIAssistantPage';
import PartnerMatchingPage from './pages/PartnerMatchingPage';
import PickupRequestsPage from './pages/PickupRequestsPage';
import ImpactPage from './pages/ImpactPage';
import EventDetailPage from './pages/EventDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Onboarding — protected but no role check */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          } />

          {/* Protected app routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><OrganizerDashboard /></ProtectedRoute>
          } />
          <Route path="/partner-dashboard" element={
            <ProtectedRoute><PartnerDashboard /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute><EventsPage /></ProtectedRoute>
          } />
          <Route path="/events/new" element={
            <ProtectedRoute><NewEventPage /></ProtectedRoute>
          } />
          <Route path="/events/:id" element={
            <ProtectedRoute><EventDetailPage /></ProtectedRoute>
          } />
          <Route path="/predict" element={
            <ProtectedRoute><WastePredictionPage /></ProtectedRoute>
          } />
          <Route path="/partners" element={
            <ProtectedRoute><PartnerMatchingPage /></ProtectedRoute>
          } />
          <Route path="/pickups" element={
            <ProtectedRoute><PickupRequestsPage /></ProtectedRoute>
          } />
          <Route path="/partner-pickups" element={
            <ProtectedRoute><PickupRequestsPage /></ProtectedRoute>
          } />
          <Route path="/assistant" element={
            <ProtectedRoute><AIAssistantPage /></ProtectedRoute>
          } />
          <Route path="/impact" element={
            <ProtectedRoute><ImpactPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
