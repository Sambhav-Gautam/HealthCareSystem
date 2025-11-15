import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await adminService.getDashboardStats()
      return response.data
    },
  })

  const stats = [
    { 
      name: 'Total Users', 
      value: dashboardData?.data?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      sub: `${dashboardData?.data?.totalPatients || 0} Patients, ${dashboardData?.data?.totalDoctors || 0} Doctors`
    },
    { 
      name: 'Total Appointments', 
      value: dashboardData?.data?.totalAppointments || 0, 
      icon: Calendar, 
      color: 'bg-green-500',
      sub: `${dashboardData?.data?.todayAppointments || 0} Today`
    },
    { 
      name: 'Pending Appointments', 
      value: dashboardData?.data?.pendingAppointments || 0, 
      icon: Activity, 
      color: 'bg-yellow-500',
      sub: `${dashboardData?.data?.completedAppointments || 0} Completed`
    },
    { 
      name: 'Test Results', 
      value: dashboardData?.data?.totalTestResults || 0, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      sub: 'Total Reports'
    },
  ]

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Loading dashboard..." />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          System Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of the healthcare portal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex flex-col">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      {stat.sub && (
                        <div className="text-xs text-gray-500 mt-1">
                          {stat.sub}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Stats
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Patients</span>
              <span className="text-sm font-semibold">{dashboardData?.data?.totalPatients || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Doctors</span>
              <span className="text-sm font-semibold">{dashboardData?.data?.totalDoctors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Appointments</span>
              <span className="text-sm font-semibold">{dashboardData?.data?.todayAppointments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-sm font-semibold text-green-600">{dashboardData?.data?.completedAppointments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-semibold text-yellow-600">{dashboardData?.data?.pendingAppointments || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Backend API</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Gateway</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
