import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doctorService } from '../../services/doctor'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import { Users, Eye } from 'lucide-react'

export default function DoctorPatients() {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [patientDetails, setPatientDetails] = useState(null)

  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-patients'],
    queryFn: async () => {
      const response = await doctorService.getPatients()
      return response.data
    },
  })

  const handleViewDetails = async (patientId) => {
    try {
      const response = await doctorService.getPatientDetails(patientId)
      setPatientDetails(response.data?.data)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error fetching patient details:', error)
    }
  }

  const columns = [
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => {
        const first = row.firstName?.trim?.() || ''
        const last = row.lastName?.trim?.() || ''
        const fullName = `${first} ${last}`.trim()
        return fullName || row.email || row.phone || 'N/A'
      },
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => row.email || '—',
    },
    {
      header: 'Last Visit',
      accessor: 'lastVisit',
      render: (row) => {
        const date = row.lastAppointmentDate || row.updatedAt || row.createdAt
        if (!date) return '—'
        const parsed = new Date(date)
        return Number.isNaN(parsed.valueOf()) ? '—' : parsed.toLocaleDateString()
      },
    },
    {
      header: 'Diagnosis',
      accessor: 'diagnosis',
      render: (row) => row.lastDiagnosis || 'N/A',
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(row._id || row.userId)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View History
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <Users className="inline h-6 w-6 mr-2" />
          My Patients
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your patient records
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          data={patients?.data || []}
          loading={isLoading}
          emptyMessage="No patients found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setPatientDetails(null)
        }}
        title="Patient Medical History"
        size="lg"
      >
        {patientDetails && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Patient Information</h4>
              <p className="text-sm">
                <strong>Name:</strong>{' '}
                {`${patientDetails.patient?.firstName || ''} ${patientDetails.patient?.lastName || ''}`.trim() || 'N/A'}
              </p>
              <p className="text-sm"><strong>Email:</strong> {patientDetails.patient?.email || '—'}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Medical History</h4>
              <div className="space-y-2">
                {patientDetails.appointments?.length ? patientDetails.appointments.map((apt, index) => (
                  <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">
                      {new Date(apt.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm"><strong>Diagnosis:</strong> {apt.diagnosis || '—'}</p>
                    <p className="text-sm"><strong>Prescription:</strong> {
                      Array.isArray(apt.prescription)
                        ? apt.prescription.map((med) => med.medication || med).join(', ')
                        : (apt.prescription || '—')
                    }</p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No appointment history available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}


