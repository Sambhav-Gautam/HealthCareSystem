import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getNavigation = () => {
    if (user?.role === 'patient') {
      return [
        { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { name: 'Test Results', href: '/patient/test-results', icon: FileText },
        { name: 'Profile', href: '/patient/profile', icon: User },
      ]
    }
    if (user?.role === 'doctor') {
      return [
        { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
        { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
        { name: 'Patients', href: '/doctor/patients', icon: Users },
        { name: 'Profile', href: '/doctor/profile', icon: User },
      ]
    }
    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
      ]
    }
    return []
  }

  const navigation = getNavigation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <span className="text-xl font-bold text-primary-600">Healthcare Portal</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4 border-b">
            <span className="text-xl font-bold text-primary-600">Healthcare Portal</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-gray-500">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow lg:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <span className="text-lg font-semibold">Healthcare Portal</span>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
