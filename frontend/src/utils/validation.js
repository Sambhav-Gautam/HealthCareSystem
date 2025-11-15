// Form validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export const validatePhone = (phone) => {
  // Basic phone validation (10-15 digits)
  const phoneRegex = /^\+?[\d\s-]{10,15}$/
  return phoneRegex.test(phone)
}

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

export const getPasswordStrength = (password) => {
  let strength = 0
  
  if (!password) return { score: 0, text: 'Too weak', color: 'red' }
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  
  if (strength <= 2) return { score: strength, text: 'Weak', color: 'red' }
  if (strength <= 3) return { score: strength, text: 'Fair', color: 'yellow' }
  if (strength <= 4) return { score: strength, text: 'Good', color: 'blue' }
  return { score: strength, text: 'Strong', color: 'green' }
}

export const validateForm = (fields, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const value = fields[field]
    const fieldRules = rules[field]
    
    // Required validation
    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = fieldRules.message || `${field} is required`
      return
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) return
    
    // Email validation
    if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address'
      return
    }
    
    // Password validation
    if (fieldRules.password && !validatePassword(value)) {
      errors[field] = 'Password must be at least 8 characters with uppercase, lowercase, and number'
      return
    }
    
    // Phone validation
    if (fieldRules.phone && !validatePhone(value)) {
      errors[field] = 'Please enter a valid phone number'
      return
    }
    
    // Min length
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Minimum ${fieldRules.minLength} characters required`
      return
    }
    
    // Max length
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Maximum ${fieldRules.maxLength} characters allowed`
      return
    }
    
    // Custom validation
    if (fieldRules.validate && !fieldRules.validate(value)) {
      errors[field] = fieldRules.message || 'Invalid value'
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Example usage:
// const { isValid, errors } = validateForm(
//   { email: 'test@example.com', password: 'Test123' },
//   {
//     email: { required: true, email: true },
//     password: { required: true, password: true }
//   }
// )

