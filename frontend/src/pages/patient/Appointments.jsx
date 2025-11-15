import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientService } from '../../services/patient'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import toast from 'react-hot-toast'
import { Calendar, Clock, X, Search, Eye } from 'lucide-react'

export default function PatientAppointments() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [searchDoctor, setSearchDoctor] = useState('')
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '',
    reason: '',
  })
  const queryClient = useQueryClient()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => {
      const response = await patientService.getAppointments()
      return response.data
    },
  })

  const { data: doctors, isLoading: isDoctorsLoading } = useQuery({
    queryKey: ['available-doctors', searchDoctor],
    queryFn: async () => {
      const response = await patientService.getAvailableDoctors({ search: searchDoctor })
      return response.data
    },
    enabled: isModalOpen,
  })

  const bookMutation = useMutation({
    mutationFn: patientService.bookAppointment,
    onSuccess: () => {
      toast.success('Appointment booked successfully!')
      setIsModalOpen(false)
      setSearchDoctor('')
      setFormData({ doctorId: '', date: '', startTime: '', reason: '' })
      queryClient.invalidateQueries(['patient-appointments'])
    },
  })

  const cancelMutation = useMutation({
    mutationFn: patientService.cancelAppointment,
    onSuccess: () => {
      toast.success('Appointment cancelled')
      queryClient.invalidateQueries(['patient-appointments'])
    },
  })

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsOpen(true)
  }

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
      header: 'Follow-up',
      accessor: 'followUp',
      render: (row) => {
        if (!row?.followUp?.required) return '—'
        const parsed = row.followUp?.date ? new Date(row.followUp.date) : null
        const dateLabel = parsed && !Number.isNaN(parsed.valueOf())
          ? parsed.toLocaleDateString()
          : 'Scheduled'
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary-700">{dateLabel}</span>
            {row.followUp?.notes && (
              <span className="text-xs text-gray-500 truncate" title={row.followUp.notes}>
                {row.followUp.notes}
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => row.reason || '—',
    },
    {
      header: 'Doctor',
      accessor: 'doctorId',
      render: (row) => {
        const first = row.doctorId?.firstName || ''
        const last = row.doctorId?.lastName || ''
        const fullName = `${first} ${last}`.trim()
        return fullName || 'N/A'
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          row.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(row)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {row.status === 'scheduled' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => cancelMutation.mutate(row._id)}
              disabled={cancelMutation.isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    bookMutation.mutate(formData)
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Calendar className="h-4 w-4 mr-2 inline" />
          Book Appointment
        </Button>
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
        onClose={() => setIsModalOpen(false)}
        title="Book Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Doctor
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                placeholder="Search by name or specialty..."
                className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            {isDoctorsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading doctors...</div>
            ) : doctors?.data?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No doctors found</div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                {doctors?.data?.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => setFormData({ ...formData, doctorId: doctor._id })}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 ${
                      formData.doctorId === doctor._id ? 'bg-primary-50 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {doctor.experience} years experience • {doctor.department || 'General'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${doctor.consultationFee}</p>
                        {doctor.rating?.average > 0 && (
                          <p className="text-xs text-yellow-600">
                            ⭐ {doctor.rating.average.toFixed(1)} ({doctor.rating.count})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {formData.doctorId && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Doctor selected
              </p>
            )}
          </div>

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            label="Time"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows="3"
              placeholder="Brief description of your health concern..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setSearchDoctor('')
                setFormData({ doctorId: '', date: '', startTime: '', reason: '' })
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={bookMutation.isLoading}
              disabled={!formData.doctorId}
            >
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedAppointment(null)
        }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment ? (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="font-medium text-gray-600">Doctor:</span>{' '}
                  {`${selectedAppointment.doctorId?.firstName || ''} ${selectedAppointment.doctorId?.lastName || ''}`.trim() || 'N/A'}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Date & Time:</span>{' '}
                  {new Date(selectedAppointment.date).toLocaleDateString()} • {selectedAppointment.startTime}
                </p>
                <p className="md:col-span-2">
                  <span className="font-medium text-gray-600">Reason:</span>{' '}
                  {selectedAppointment.reason || '—'}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Diagnosis</h4>
              <p className="text-sm text-gray-700">
                {selectedAppointment.diagnosis || 'No diagnosis recorded yet.'}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Prescription</h4>
              {Array.isArray(selectedAppointment.prescription) && selectedAppointment.prescription.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {selectedAppointment.prescription.map((item, index) => (
                    <li key={index}>
                      <span className="font-medium">{item.medication || item.name || 'Medication'}</span>
                      {item.dosage && ` — ${item.dosage}`}
                      {item.frequency && ` • ${item.frequency}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No prescriptions added.</p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
              <p className="text-sm text-gray-700">
                {selectedAppointment.notes || 'No additional notes.'}
              </p>
            </div>

            {selectedAppointment.followUp?.required && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Follow-up</h4>
                <p className="text-sm text-blue-800">
                  {selectedAppointment.followUp?.date
                    ? new Date(selectedAppointment.followUp.date).toLocaleDateString()
                    : 'Scheduled'}
                </p>
                {selectedAppointment.followUp?.notes && (
                  <p className="text-sm text-blue-800 mt-1">{selectedAppointment.followUp.notes}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">Select an appointment to view details.</p>
        )}
      </Modal>
    </div>
  )
}


