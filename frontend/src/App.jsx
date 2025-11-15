import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import PatientDashboard from './pages/patient/Dashboard'
import PatientAppointments from './pages/patient/Appointments'
import PatientTestResults from './pages/patient/TestResults'
import PatientProfile from './pages/patient/Profile'
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorPatients from './pages/doctor/Patients'
import DoctorProfile from './pages/doctor/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" text="Loading..." />
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Patient Routes */}
        <Route 
          path="/patient/dashboard" 
          element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/patient/appointments" 
          element={<ProtectedRoute roles={['patient']}><PatientAppointments /></ProtectedRoute>} 
        />
        <Route 
          path="/patient/test-results" 
          element={<ProtectedRoute roles={['patient']}><PatientTestResults /></ProtectedRoute>} 
        />
        <Route 
          path="/patient/profile" 
          element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} 
        />

        {/* Doctor Routes */}
        <Route 
          path="/doctor/dashboard" 
          element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/doctor/appointments" 
          element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} 
        />
        <Route 
          path="/doctor/patients" 
          element={<ProtectedRoute roles={['doctor']}><DoctorPatients /></ProtectedRoute>} 
        />
        <Route 
          path="/doctor/profile" 
          element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin/users" 
          element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} 
        />

        {/* Default redirect based on role */}
        <Route 
          path="/" 
          element={
            <Navigate 
              to={
                user?.role === 'patient' ? '/patient/dashboard' :
                user?.role === 'doctor' ? '/doctor/dashboard' :
                user?.role === 'admin' ? '/admin/dashboard' :
                '/login'
              } 
            />
          } 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
