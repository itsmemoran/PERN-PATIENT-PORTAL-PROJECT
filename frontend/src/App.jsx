import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import MainLayout from '@/components/layout/MainLayout'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import AuthCallback from '@/pages/AuthCallback'
import Dashboard from '@/pages/Dashboard'
import Appointments from '@/pages/Appointments'
import TestResults from '@/pages/TestResults'
import Prescriptions from '@/pages/Prescriptions'
import MedicalRecords from '@/pages/MedicalRecords'
import Chatbot from '@/pages/Chatbot'
import Contacts from '@/pages/Contacts'
import ProfilePage from '@/pages/ProfilePage'
import NotFound from '@/pages/NotFound'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin-slow" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="test-results" element={<TestResults />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
