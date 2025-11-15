import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorService } from '../../services/doctor'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import toast from 'react-hot-toast'

export default function DoctorProfile() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await doctorService.getProfile()
      return response.data
    },
  })

  const [formData, setFormData] = useState({
    specialty: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    availableDays: [],
    availableStartTime: '',
    availableEndTime: '',
    licenseNumber: '',
    hospitalAffiliation: '',
  })

  const updateMutation = useMutation({
    mutationFn: doctorService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      queryClient.invalidateQueries(['doctor-profile'])
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'secondary' : 'primary'}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Professional Information">
            <div className="space-y-4">
              <Input
                label="Specialty"
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Cardiology, Dermatology"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualifications
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  disabled={!isEditing}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows="3"
                  placeholder="MBBS, MD, etc."
                />
              </div>
              <Input
                label="Years of Experience"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="License Number"
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Hospital Affiliation"
                type="text"
                value={formData.hospitalAffiliation}
                onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </Card>

          <Card title="Consultation Details">
            <div className="space-y-4">
              <Input
                label="Consultation Fee ($)"
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                disabled={!isEditing}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <div className="space-y-2">
                  {daysOfWeek.map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        value={day}
                        checked={formData.availableDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              availableDays: [...formData.availableDays, day],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              availableDays: formData.availableDays.filter((d) => d !== day),
                            })
                          }
                        }}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.availableStartTime}
                  onChange={(e) => setFormData({ ...formData, availableStartTime: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="End Time"
                  type="time"
                  value={formData.availableEndTime}
                  onChange={(e) => setFormData({ ...formData, availableEndTime: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              loading={updateMutation.isLoading}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

