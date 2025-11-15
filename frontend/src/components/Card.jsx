export default function Card({ 
  children, 
  title,
  subtitle,
  className = '',
  headerAction,
  ...props 
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}


