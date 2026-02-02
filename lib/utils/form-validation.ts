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
 * Set custom validation message for an input element
 */
export function setCustomValidity(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
  const validity = input.validity
  
  if (validity.valid) {
    input.setCustomValidity('')
    return
  }
  
  // Check each validation state and set appropriate message
  if (validity.valueMissing) {
    input.setCustomValidity(ValidationMessages.valueMissing)
  } else if (validity.typeMismatch) {
    if (input.type === 'email') {
      input.setCustomValidity(ValidationMessages.typeMismatchEmail)
    } else if (input.type === 'url') {
      input.setCustomValidity(ValidationMessages.typeMismatchUrl)
    }
  } else if (validity.patternMismatch) {
    input.setCustomValidity(ValidationMessages.patternMismatch)
  } else if (validity.tooShort) {
    const minLength = parseInt(input.getAttribute('minlength') || '0')
    input.setCustomValidity(ValidationMessages.tooShort(minLength))
  } else if (validity.tooLong) {
    const maxLength = parseInt(input.getAttribute('maxlength') || '0')
    input.setCustomValidity(ValidationMessages.tooLong(maxLength))
  } else if (validity.rangeUnderflow) {
    const min = parseFloat(input.getAttribute('min') || '0')
    input.setCustomValidity(ValidationMessages.rangeUnderflow(min))
  } else if (validity.rangeOverflow) {
    const max = parseFloat(input.getAttribute('max') || '0')
    input.setCustomValidity(ValidationMessages.rangeOverflow(max))
  } else if (validity.stepMismatch) {
    input.setCustomValidity(ValidationMessages.stepMismatch)
  } else if (validity.badInput) {
    input.setCustomValidity(ValidationMessages.badInput)
  }
}

/**
 * Apply custom validation to all form inputs
 * Call this in useEffect or on form mount
 */
export function applyCustomValidation(formElement: HTMLFormElement) {
  const inputs = formElement.querySelectorAll('input, textarea, select')
  
  inputs.forEach((input) => {
    const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    
    // Set custom message on invalid event
    element.addEventListener('invalid', (e) => {
      e.preventDefault()
      setCustomValidity(element)
    })
    
    // Clear custom message on input
    element.addEventListener('input', () => {
      element.setCustomValidity('')
    })
    
    // Clear custom message on change
    element.addEventListener('change', () => {
      element.setCustomValidity('')
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
