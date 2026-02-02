// Validation utilities - reusable validation logic

interface SourceReference {
  volume: string
  page: string
  lineFrom: string
  lineTo: string
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateDates(start: string, end: string, wheel: string): void {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const wheelDate = new Date(wheel)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(wheelDate.getTime())) {
    throw new ValidationError('التواريخ غير صحيحة')
  }

  if (startDate >= endDate) {
    throw new ValidationError('تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء')
  }

  if (endDate >= wheelDate) {
    throw new ValidationError('تاريخ الانتهاء يجب أن يكون قبل موعد السحب')
  }
}

export function validateSourceReference(ref: SourceReference): void {
  if (!ref.volume?.trim()) {
    throw new ValidationError('رقم المجلد مطلوب')
  }

  const page = parseInt(ref.page)
  const lineFrom = parseInt(ref.lineFrom)
  const lineTo = parseInt(ref.lineTo)

  if (isNaN(page) || page <= 0) {
    throw new ValidationError('رقم الصفحة غير صحيح')
  }

  if (isNaN(lineFrom) || lineFrom <= 0) {
    throw new ValidationError('رقم السطر الأول غير صحيح')
  }

  if (isNaN(lineTo) || lineTo < lineFrom) {
    throw new ValidationError('رقم السطر الأخير غير صحيح')
  }
}

export function validateMCQOptions(options: string[]): void {
  if (!options || options.length < 2) {
    throw new ValidationError('يجب إضافة خيارين على الأقل')
  }

  const trimmed = options.map(o => o.trim()).filter(o => o)
  if (trimmed.length < 2) {
    throw new ValidationError('يجب إضافة خيارين صحيحين على الأقل')
  }

  const unique = new Set(trimmed.map(o => o.toLowerCase()))
  if (unique.size !== trimmed.length) {
    throw new ValidationError('لا يمكن تكرار الخيارات')
  }
}

export function validateCorrectAnswer(
  type: 'mcq' | 'true_false' | 'text',
  answer: string | null,
  options?: string[]
): void {
  if (!answer) return // Allow null for "set later"

  if (type === 'mcq') {
    if (!options || !options.includes(answer)) {
      throw new ValidationError('الإجابة الصحيحة يجب أن تكون من ضمن الخيارات')
    }
  }

  if (type === 'true_false') {
    if (answer !== 'true' && answer !== 'false') {
      throw new ValidationError('الإجابة يجب أن تكون صح أو خطأ')
    }
  }
}
