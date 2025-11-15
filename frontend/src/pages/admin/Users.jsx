import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/admin'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import toast from 'react-hot-toast'
import { UserPlus, Trash2, Edit } from 'lucide-react'

export default function AdminUsers() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient',
  })
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await adminService.getUsers()
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      toast.success('User created successfully!')
      setIsModalOpen(false)
      resetForm()
      queryClient.invalidateQueries(['admin-users'])
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updateUser(id, data),
    onSuccess: () => {
      toast.success('User updated successfully!')
      setIsModalOpen(false)
      resetForm()
      queryClient.invalidateQueries(['admin-users'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully!')
      queryClient.invalidateQueries(['admin-users'])
    },
  })

  const resetForm = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'patient' })
    setIsEditMode(false)
    setSelectedUser(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isEditMode && selectedUser) {
      updateMutation.mutate({ id: selectedUser._id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
    })
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId)
    }
  }

  const columns = [
    {
      header: 'Name',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
          row.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          row.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Verified',
      accessor: 'isVerified',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.isVerified ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Registered',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
        >
          <UserPlus className="h-4 w-4 mr-2 inline" />
          Add User
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={users?.data || []}
          loading={isLoading}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={isEditMode ? 'Edit User' : 'Create New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isEditMode}
          />
          {!isEditMode && (
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEditMode}
              placeholder={isEditMode ? 'Leave blank to keep current password' : ''}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {isEditMode ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


