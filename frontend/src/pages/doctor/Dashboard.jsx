import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { doctorService } from '../../services/doctor'
import { Calendar, Users, Activity, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function DoctorDashboard() {
  const { user } = useAuth()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: async () => {
      const response = await doctorService.getDashboardStats()
      return response.data
    },
  })

  const stats = [
    { 
      name: 'Today\'s Appointments', 
      value: dashboardData?.data?.stats?.todayAppointments || 0, 
      icon: Calendar, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Total Patients', 
      value: dashboardData?.data?.stats?.totalPatients || 0, 
      icon: Users, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Pending Referrals', 
      value: dashboardData?.data?.stats?.pendingReferrals || 0, 
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
          Good Morning, Dr. {user?.lastName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's your schedule for today
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

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Today's Schedule
          </h2>
          {dashboardData?.data?.todaySchedule?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.data.todaySchedule.map((apt) => (
                <div key={apt._id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                  <div>
                    <p className="font-medium">
                      {apt.patientId?.firstName} {apt.patientId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{apt.reason || 'General Consultation'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.startTime}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No appointments scheduled for today</p>
          )}
        </div>
      </div>
    </div>
  )
}
