import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorService } from '../../services/doctor'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import toast from 'react-hot-toast'
import { Calendar, Clock } from 'lucide-react'

export default function DoctorAppointments() {
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    followUpDate: '',
  })
  const queryClient = useQueryClient()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const response = await doctorService.getAppointments()
      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => doctorService.updateAppointment(id, data),
    onSuccess: () => {
      toast.success('Appointment updated successfully!')
      setIsModalOpen(false)
      setSelectedAppointment(null)
      setConsultationData({ diagnosis: '', prescription: '', notes: '', followUpDate: '' })
      queryClient.invalidateQueries(['doctor-appointments'])
    },
  })

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => {
        if (!row?.date) return '—'
        const parsed = new Date(row.date)
        return Number.isNaN(parsed.valueOf()) ? '—' : parsed.toLocaleDateString()
      },
    },
    {
      header: 'Time',
      accessor: 'startTime',
      render: (row) => row.startTime || '—',
    },
    {
      header: 'Patient',
      accessor: 'patientId',
      render: (row) => {
        const first = row.patientId?.firstName?.trim?.() || ''
        const last = row.patientId?.lastName?.trim?.() || ''
        const fullName = `${first} ${last}`.trim()
        const fallback = row.patientId?.email || row.patientId?.phone || 'N/A'
        return fullName || fallback
      },
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <span className="truncate max-w-xs block" title={row.reason}>
          {row.reason || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          row.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedAppointment(row)
            setIsModalOpen(true)
          }}
        >
          {row.status === 'completed' ? 'View' : 'Update'}
        </Button>
      ),
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedAppointment) {
      updateMutation.mutate({
        id: selectedAppointment._id,
        data: {
          ...consultationData,
          status: 'completed',
        },
      })
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your patient appointments and consultations
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          data={appointments?.data || []}
          loading={isLoading}
          emptyMessage="No appointments found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAppointment(null)
        }}
        title="Consultation Details"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm"><strong>Patient:</strong> {selectedAppointment?.patientId?.firstName} {selectedAppointment?.patientId?.lastName}</p>
            <p className="text-sm"><strong>Reason:</strong> {selectedAppointment?.reason}</p>
          </div>
          
          <Input
            label="Diagnosis"
            type="text"
            value={consultationData.diagnosis}
            onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
            required
            disabled={selectedAppointment?.status === 'completed'}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescription
            </label>
            <textarea
              value={consultationData.prescription}
              onChange={(e) => setConsultationData({ ...consultationData, prescription: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows="3"
              required
              disabled={selectedAppointment?.status === 'completed'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={consultationData.notes}
              onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows="2"
              disabled={selectedAppointment?.status === 'completed'}
            />
          </div>
          
          <Input
            label="Follow-up Date"
            type="date"
            value={consultationData.followUpDate}
            onChange={(e) => setConsultationData({ ...consultationData, followUpDate: e.target.value })}
            disabled={selectedAppointment?.status === 'completed'}
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setSelectedAppointment(null)
              }}
            >
              Close
            </Button>
            {selectedAppointment?.status !== 'completed' && (
              <Button
                type="submit"
                loading={updateMutation.isLoading}
              >
                Complete Consultation
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  )
}


