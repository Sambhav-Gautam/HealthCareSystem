import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', fullScreen = false, text = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

