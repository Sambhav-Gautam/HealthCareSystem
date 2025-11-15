import { AlertCircle } from 'lucide-react'

export default function FormError({ message }) {
  if (!message) return null
  
  return (
    <div className="flex items-center mt-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

