/**
 * Form Helper Utilities
 * 
 * These utilities solve a common React problem: controlled inputs require
 * string values, but data from APIs often contains null values.
 * 
 * React will throw a warning if you pass null to an input's value prop:
 * "Warning: `value` prop on `input` should not be null"
 * 
 * This happens because React distinguishes between:
 * - Controlled components (value is a string)
 * - Uncontrolled components (value is undefined)
 * - Invalid state (value is null)
 * 
 * These helpers ensure all form values are properly initialized as strings.
 */

/**
 * Safely convert a potentially null/undefined value to a string
 * 
 * Use this when initializing form state from API data that might contain nulls.
 * 
 * @example
 * const [formData, setFormData] = useState({
 *   name: safeString(user.name),
 *   email: safeString(user.email),
 *   phone: safeString(user.phone)
 * })
 */
export function safeString(value: string | null | undefined): string {
  return value ?? ''
}

/**
 * Safely initialize form data from an object with potentially null values
 * 
 * This is useful when you have an entire object from an API and want to
 * ensure all string fields are safe for controlled inputs.
 * 
 * @example
 * const [formData, setFormData] = useState(
 *   safeFormData(user, ['name', 'email', 'phone', 'bio'])
 * )
 */
export function safeFormData<T extends Record<string, any>>(
  data: T,
  stringFields: (keyof T)[]
): T {
  const result = { ...data }
  
  for (const field of stringFields) {
    if (typeof result[field] === 'string' || result[field] === null || result[field] === undefined) {
      result[field] = safeString(result[field] as string | null | undefined) as any
    }
  }
  
  return result
}

/**
 * Convert empty strings back to null for API submission
 * 
 * Some APIs expect null for empty optional fields rather than empty strings.
 * Use this before sending form data to the API.
 * 
 * @example
 * const apiData = emptyToNull(formData, ['phone', 'bio'])
 * await updateUser(apiData)
 */
export function emptyToNull<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data }
  
  for (const field of fields) {
    if (result[field] === '') {
      result[field] = null as any
    }
  }
  
  return result
}

/**
 * Trim all string fields in an object
 * 
 * Useful for cleaning up form data before validation or submission.
 * Removes leading/trailing whitespace from all string fields.
 * 
 * @example
 * const cleanData = trimStrings(formData)
 */
export function trimStrings<T extends Record<string, any>>(data: T): T {
  const result = { ...data }
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = result[key].trim()
    }
  }
  
  return result
}
