import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import type { User, AdvisorType } from './types';
import { getUser, clearToken, setUser as saveUser } from './utils/auth';
import { getMe } from './api/auth';
import { updateUser } from './api/users';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import TasksPage from './pages/TasksPage';
import MatchesPage from './pages/MatchesPage';
import ProgressPage from './pages/ProgressPage';
import ImpressumPage from './pages/ImpressumPage';
import DatenschutzPage from './pages/DatenschutzPage';
import AGBPage from './pages/AGBPage';
import KontaktPage from './pages/KontaktPage';
import LandingPage from './pages/LandingPage';
import AdvisorSelectionPage from './pages/AdvisorSelectionPage';
import ChatPage from './pages/ChatPage';
import ReportPage from './pages/ReportPage';
import OnboardingWizard from './pages/Onboarding/OnboardingWizard';
import AppointmentCalendar from './pages/Appointments/AppointmentCalendar';
import CertificateOverview from './pages/Certificates/CertificateOverview';
import InstitutionDashboard from './pages/InstitutionDashboard/InstitutionDashboard';
import UIShowcase from './pages/UIShowcase';

function AppRoutes() {
  const [user, setUser] = useState<User | null>(getUser());
  const navigate = useNavigate();

  useEffect(() => {
    async function initAuth() {
      try {
        const { user: freshUser } = await getMe();
        setUser(freshUser as User);
        saveUser(freshUser);
      } catch {
        clearToken();
        setUser(null);
      }
    }
    initAuth();
  }, []);

  function handleAuth(userObj: User) {
    setUser(userObj);
    saveUser(userObj);
    navigate('/');
  }

  function handleLogout() {
    setUser(null);
  }

  function handleUserUpdate(updatedUser: User) {
    setUser(updatedUser);
    saveUser(updatedUser);
  }

  async function handleSelectAdvisor(advisorType: AdvisorType) {
    if (!user) return;
    try {
      const updated = await updateUser(user.user_id, { selected_advisor: advisorType } as any);
      const newUser = { ...user, ...updated, selected_advisor: advisorType };
      setUser(newUser);
      saveUser(newUser);
    } catch {
      // Still update locally even if API fails
      const newUser = { ...user, selected_advisor: advisorType };
      setUser(newUser);
      saveUser(newUser);
    }
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={handleLogout} />}>
        {/* Public routes */}
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
        <Route path="/register" element={<Register onAuth={handleAuth} />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/agb" element={<AGBPage />} />
        <Route path="/kontakt" element={<KontaktPage />} />
        <Route path="/ui-showcase" element={<UIShowcase />} />
        
        {/* Landing page for non-logged-in users */}
        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} />
            ) : (
              <LandingPage />
            )
          }
        />
        
        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user!} onUpdate={handleUserUpdate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute user={user}>
              <TasksPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute user={user}>
              <MatchesPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute user={user}>
              <ProgressPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advisor"
          element={
            <ProtectedRoute user={user}>
              <AdvisorSelectionPage user={user!} onSelectAdvisor={handleSelectAdvisor} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <ChatPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute user={user}>
              <ReportPage user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute user={user}>
              <OnboardingWizard user={user!} onComplete={() => navigate('/')} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute user={user}>
              <AppointmentCalendar user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute user={user}>
              <CertificateOverview user={user!} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution"
          element={
            <ProtectedRoute user={user}>
              {user?.role === 'INSTITUTION' || user?.role === 'ADMIN' ? (
                <InstitutionDashboard user={user!} />
              ) : (
                <Dashboard user={user!} />
              )}
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  // Support GitHub Pages deployment with base path
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
