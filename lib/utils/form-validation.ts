/**
 * Custom HTML5 form validation messages in Arabic
 * Replaces browser default messages like "Please fill out this field"
 */

export const ValidationMessages = {
  // Required field
  valueMissing: 'هذا الحقل مطلوب',
  
  // Type mismatch
  typeMismatchEmail: 'يرجى إدخال بريد إلكتروني صحيح',
  typeMismatchUrl: 'يرجى إدخال رابط صحيح',
  
  // Pattern mismatch
  patternMismatch: 'التنسيق غير صحيح',
  
  // Too short
  tooShort: (minLength: number) => `يجب أن يكون ${minLength} أحرف على الأقل`,
  
  // Too long
  tooLong: (maxLength: number) => `يجب ألا يتجاوز ${maxLength} حرف`,
  
  // Range underflow
  rangeUnderflow: (min: number) => `القيمة يجب أن تكون ${min} أو أكثر`,
  
  // Range overflow
  rangeOverflow: (max: number) => `القيمة يجب أن تكون ${max} أو أقل`,
  
  // Step mismatch
  stepMismatch: 'القيمة غير صحيحة',
  
  // Bad input
  badInput: 'الإدخال غير صحيح',
} as const

/**
 * Get field label from input element
 */
function getFieldLabel(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const label = input.labels?.[0]?.textContent?.trim() || 
                ('placeholder' in input ? input.placeholder : '') || 
                input.name
  return label
}

/**
 * Get validation error message for an input element
 */
export function getValidationMessage(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const validity = input.validity
  
  if (validity.valid) {
    return ''
  }
  
  const fieldLabel = getFieldLabel(input)
  
  // Check each validation state and return appropriate message
  if (validity.valueMissing) {
    return `${fieldLabel}: ${ValidationMessages.valueMissing}`
  } else if (validity.typeMismatch) {
    if (input.type === 'email') {
      return `${fieldLabel}: ${ValidationMessages.typeMismatchEmail}`
    } else if (input.type === 'url') {
      return `${fieldLabel}: ${ValidationMessages.typeMismatchUrl}`
    }
  } else if (validity.patternMismatch) {
    return `${fieldLabel}: ${ValidationMessages.patternMismatch}`
  } else if (validity.tooShort) {
    const minLength = parseInt(input.getAttribute('minlength') || '0')
    return `${fieldLabel}: ${ValidationMessages.tooShort(minLength)}`
  } else if (validity.tooLong) {
    const maxLength = parseInt(input.getAttribute('maxlength') || '0')
    return `${fieldLabel}: ${ValidationMessages.tooLong(maxLength)}`
  } else if (validity.rangeUnderflow) {
    const min = parseFloat(input.getAttribute('min') || '0')
    return `${fieldLabel}: ${ValidationMessages.rangeUnderflow(min)}`
  } else if (validity.rangeOverflow) {
    const max = parseFloat(input.getAttribute('max') || '0')
    return `${fieldLabel}: ${ValidationMessages.rangeOverflow(max)}`
  } else if (validity.stepMismatch) {
    return `${fieldLabel}: ${ValidationMessages.stepMismatch}`
  } else if (validity.badInput) {
    return `${fieldLabel}: ${ValidationMessages.badInput}`
  }
  
  return `${fieldLabel}: خطأ في التحقق`
}

/**
 * Set custom validation message for an input element
 */
export function setCustomValidity(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const message = getValidationMessage(input)
  input.setCustomValidity(message)
}

/**
 * Apply custom validation to all form inputs with toast notifications
 * Call this in useEffect or on form mount
 */
export function applyCustomValidation(
  formElement: HTMLFormElement,
  showToast?: (message: string, type: 'error' | 'warning') => void
) {
  const inputs = formElement.querySelectorAll('input, textarea, select')
  
  inputs.forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    
    // Prevent default browser validation popup
    element.addEventListener('invalid', (e) => {
      e.preventDefault()
      
      const message = getValidationMessage(element)
      
      // Show toast notification if callback provided
      if (showToast && message) {
        showToast(message, 'error')
      }
      
      // Add error styling to input
      element.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20')
      element.classList.remove('border-emerald-200', 'focus:border-emerald-500', 'focus:ring-emerald-500/20')
    })
    
    // Clear error styling on input
    element.addEventListener('input', () => {
      element.setCustomValidity('')
      element.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20')
      element.classList.add('border-emerald-200', 'focus:border-emerald-500', 'focus:ring-emerald-500/20')
    })
    
    // Clear error styling on change
    element.addEventListener('change', () => {
      element.setCustomValidity('')
      element.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20')
      element.classList.add('border-emerald-200', 'focus:border-emerald-500', 'focus:ring-emerald-500/20')
    })
  })
}

/**
 * Hook to apply custom validation to a form
 * Usage: const formRef = useCustomValidation()
 */
export function useCustomValidation() {
  const formRef = (node: HTMLFormElement | null) => {
    if (node) {
      applyCustomValidation(node)
    }
  }
  
  return formRef
}
