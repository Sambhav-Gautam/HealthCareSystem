import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Home
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Go back
            </button>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  )
}

