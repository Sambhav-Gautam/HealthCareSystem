import LoadingSpinner from './LoadingSpinner'
import { AlertCircle, Inbox } from 'lucide-react'

export default function Table({ 
  columns, 
  data, 
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  onRetry = null,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="md" text="Loading data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-gray-700 mb-2">Failed to load data</p>
        <p className="text-sm text-gray-500 mb-4">{error.message || 'An error occurred'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Inbox className="h-12 w-12 mb-3 text-gray-400" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


