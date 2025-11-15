import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { patientService } from '../../services/patient'
import { Calendar, FileText, Activity, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function PatientDashboard() {
  const { user } = useAuth()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['patient-dashboard'],
    queryFn: async () => {
      const response = await patientService.getDashboardStats()
      return response.data
    },
  })

  const stats = [
    { 
      name: 'Upcoming Appointments', 
      value: dashboardData?.data?.stats?.upcomingAppointments || 0, 
      icon: Calendar, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Test Results', 
      value: dashboardData?.data?.stats?.testResults || 0, 
      icon: FileText, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Active Referrals', 
      value: dashboardData?.data?.stats?.activeReferrals || 0, 
      icon: Activity, 
      color: 'bg-purple-500' 
    },
    { 
      name: 'Pending Tests', 
      value: dashboardData?.data?.stats?.pendingTests || 0, 
      icon: Clock, 
      color: 'bg-orange-500' 
    },
  ]

  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" text="Loading dashboard..." />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's your health overview
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
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
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
            Upcoming Appointments
          </h2>
          {dashboardData?.data?.recentAppointments?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.data.recentAppointments.map((apt) => (
                <div key={apt._id} className="border-b pb-2 last:border-b-0">
                  <p className="font-medium">
                    Dr. {apt.doctorId?.firstName} {apt.doctorId?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{apt.doctorId?.specialty}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(apt.date).toLocaleDateString()} at {apt.startTime}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No upcoming appointments</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Test Results
          </h2>
          {dashboardData?.data?.recentTestResults?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.data.recentTestResults.map((test) => (
                <div key={test._id} className="border-b pb-2 last:border-b-0">
                  <p className="font-medium">{test.testName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(test.testDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No test results yet</p>
          )}
        </div>
      </div>
    </div>
  )
}


