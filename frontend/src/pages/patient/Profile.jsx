import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientService } from '../../services/patient'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import toast from 'react-hot-toast'

export default function PatientProfile() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: async () => {
      const response = await patientService.getProfile()
      return response.data
    },
  })

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    height: '',
    weight: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  })

  const updateMutation = useMutation({
    mutationFn: patientService.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      queryClient.invalidateQueries(['patient-profile'])
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

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
          <Card title="Personal Information">
            <div className="space-y-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={!isEditing}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  disabled={!isEditing}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Blood Group"
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                disabled={!isEditing}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </Card>

          <Card title="Medical Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  disabled={!isEditing}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <Input
                label="Allergies"
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Penicillin, Peanuts"
              />
              <Input
                label="Current Medications"
                type="text"
                value={formData.currentMedications}
                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Aspirin 100mg daily"
              />
            </div>
          </Card>

          <Card title="Emergency Contact" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Contact Name"
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Contact Phone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Relation"
                type="text"
                value={formData.emergencyContactRelation}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Spouse, Parent"
              />
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


