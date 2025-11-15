import { useQuery } from '@tanstack/react-query'
import { patientService } from '../../services/patient'
import Card from '../../components/Card'
import Table from '../../components/Table'
import { FileText, Download } from 'lucide-react'

export default function PatientTestResults() {
  const { data: testResults, isLoading } = useQuery({
    queryKey: ['patient-test-results'],
    queryFn: async () => {
      const response = await patientService.getTestResults()
      return response.data
    },
  })

  const columns = [
    {
      header: 'Test Name',
      accessor: 'testName',
    },
    {
      header: 'Date',
      accessor: 'testDate',
      render: (row) => new Date(row.testDate).toLocaleDateString(),
    },
    {
      header: 'Doctor',
      accessor: 'doctorId',
      render: (row) => row.doctorId?.firstName + ' ' + row.doctorId?.lastName || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'completed' ? 'bg-green-100 text-green-800' :
          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        row.resultFile && (
          <button
            className="text-primary-600 hover:text-primary-700"
            onClick={() => window.open(row.resultFile, '_blank')}
          >
            <Download className="h-4 w-4" />
          </button>
        )
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and download your medical test results
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          data={testResults?.data || []}
          loading={isLoading}
          emptyMessage="No test results found"
        />
      </Card>
    </div>
  )
}


