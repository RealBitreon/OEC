'use client'

import { useState, useEffect } from 'react'
import type { Question } from '@/lib/store/types'

interface QuestionFormModalProps {
  onClose: () => void
  onSubmit: (data: any, isDraft: boolean) => Promise<void>
  competitionId: string
  editingQuestion?: Question | null
}

export default function QuestionFormModal({ 
  onClose, 
  onSubmit, 
  competitionId,
  editingQuestion 
}: QuestionFormModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    type: 'mcq' as 'text' | 'true_false' | 'mcq',
    title: '',
    body: '',
    options: ['', '', '', ''],
    correctAnswerIndex: -1,
    correctAnswerBool: null as boolean | null,
    correctAnswerVariants: [''],
    sourceRef: {
      volume: '',
      page: '',
      lineFrom: 0,
      lineTo: 0
    }
  })

  // Load editing data
  useEffect(() => {
    if (editingQuestion) {
      const data: any = {
        type: editingQuestion.type,
        title: editingQuestion.title,
        body: editingQuestion.body,
        options: editingQuestion.options || ['', '', '', ''],
        correctAnswerIndex: -1,
        correctAnswerBool: null,
        correctAnswerVariants: [''],
        sourceRef: editingQuestion.sourceRef || { volume: '', page: '', lineFrom: 0, lineTo: 0 }
      }

      // Parse correctAnswer based on type
      if (editingQuestion.type === 'mcq') {
        if (typeof editingQuestion.correctAnswer === 'number') {
          data.correctAnswerIndex = editingQuestion.correctAnswer
        } else if (editingQuestion.options) {
          data.correctAnswerIndex = editingQuestion.options.indexOf(editingQuestion.correctAnswer)
        }
      } else if (editingQuestion.type === 'true_false') {
        data.correctAnswerBool = editingQuestion.correctAnswer === true
      } else if (editingQuestion.type === 'text') {
        data.correctAnswerVariants = Array.isArray(editingQuestion.correctAnswer)
          ? editingQuestion.correctAnswer
          : [editingQuestion.correctAnswer]
      }

      setFormData(data)
    }
  }, [editingQuestion])

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNum === 1) {
      if (!formData.title.trim()) newErrors.title = 'عنوان السؤال مطلوب'
      if (!formData.body.trim()) newErrors.body = 'نص السؤال مطلوب'
    }

    if (stepNum === 2) {
      if (formData.type === 'mcq') {
        const validOptions = formData.options.filter(o => o.trim())
        if (validOptions.length < 2) {
          newErrors.options = 'يجب إضافة خيارين على الأقل'
        }
        if (formData.correctAnswerIndex === -1) {
          newErrors.correctAnswer = 'يجب اختيار الإجابة الصحيحة'
        }
      } else if (formData.type === 'true_false') {
        if (formData.correctAnswerBool === null) {
          newErrors.correctAnswer = 'يجب اختيار الإجابة الصحيحة (صح أو خطأ)'
        }
      } else if (formData.type === 'text') {
        const validVariants = formData.correctAnswerVariants.filter(v => v.trim())
        if (validVariants.length === 0) {
          newErrors.correctAnswer = 'يجب إضافة إجابة مقبولة واحدة على الأقل'
        }
      }
    }

    if (stepNum === 3) {
      if (!formData.sourceRef.volume.trim()) {
        newErrors.volume = 'المجلد مطلوب'
      }
      if (!formData.sourceRef.page.trim()) {
        newErrors.page = 'رقم الصفحة مطلوب'
      }
      if (formData.sourceRef.lineFrom > 0 && formData.sourceRef.lineTo > 0) {
        if (formData.sourceRef.lineTo < formData.sourceRef.lineFrom) {
          newErrors.lineTo = 'السطر "إلى" يجب أن يكون أكبر من أو يساوي السطر "من"'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateStep(3)) return

    setLoading(true)
    try {
      const data: any = {
        competitionId,
        type: formData.type,
        title: formData.title.trim(),
        body: formData.body.trim(),
        sourceRef: {
          volume: formData.sourceRef.volume.trim(),
          page: formData.sourceRef.page.trim(),
          lineFrom: formData.sourceRef.lineFrom || 0,
          lineTo: formData.sourceRef.lineTo || 0
        }
      }

      // Set correct answer based on type
      if (formData.type === 'mcq') {
        data.options = formData.options.filter(o => o.trim()).map(o => o.trim())
        data.correctAnswer = formData.correctAnswerIndex
      } else if (formData.type === 'true_false') {
        data.correctAnswer = formData.correctAnswerBool
      } else if (formData.type === 'text') {
        data.correctAnswer = formData.correctAnswerVariants
          .filter(v => v.trim())
          .map(v => v.trim())
      }

      await onSubmit(data, isDraft)
      onClose()
    } catch (error) {
      setErrors({ submit: 'حدث خطأ في الحفظ' })
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ ...formData, options: [...formData.options, ''] })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ 
        ...formData, 
        options: newOptions,
        correctAnswerIndex: formData.correctAnswerIndex === index ? -1 : formData.correctAnswerIndex
      })
    }
  }

  const addAnswerVariant = () => {
    setFormData({
      ...formData,
      correctAnswerVariants: [...formData.correctAnswerVariants, '']
    })
  }

  const removeAnswerVariant = (index: number) => {
    if (formData.correctAnswerVariants.length > 1) {
      setFormData({
        ...formData,
        correctAnswerVariants: formData.correctAnswerVariants.filter((_, i) => i !== index)
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-900">
              {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
            </h2>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 text-2xl">
              ×
            </button>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= s ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-600 font-medium">
            <span>معلومات السؤال</span>
            <span>النوع والإجابات</span>
            <span>المرجع الرسمي</span>
            <span>المعاينة</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Question Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  عنوان/نص مختصر للسؤال <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.title ? 'border-red-500' : 'border-neutral-200'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none`}
                  placeholder="مثال: ما معنى المها في اللغة العربية؟"
                />
                <p className="text-xs text-neutral-500 mt-1">اكتب السؤال بشكل واضح ومباشر</p>
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  وصف/تفاصيل السؤال <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${
                    errors.body ? 'border-red-500' : 'border-neutral-200'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none`}
                  placeholder="مثال: اختر المعنى الصحيح حسب الموسوعة العُمانية..."
                />
                <p className="text-xs text-neutral-500 mt-1">اكتب السؤال بالتفصيل مع أي معلومات إضافية</p>
                {errors.body && <p className="text-xs text-red-600 mt-1">{errors.body}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Type and Answers */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">نوع السؤال</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as any,
                    correctAnswerIndex: -1,
                    correctAnswerBool: null
                  })}
                  disabled={!!editingQuestion}
                  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-neutral-100"
                >
                  <option value="mcq">اختيار من متعدد (MCQ)</option>
                  <option value="true_false">صح / خطأ</option>
                  <option value="text">إجابة نصية</option>
                </select>
                {editingQuestion && (
                  <p className="text-xs text-amber-600 mt-1">لا يمكن تغيير نوع السؤال عند التعديل</p>
                )}
              </div>

              {/* MCQ Type */}
              {formData.type === 'mcq' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-3">
                      الخيارات (2-6 خيارات) <span className="text-red-600">*</span>
                    </label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options]
                              newOptions[index] = e.target.value
                              setFormData({ ...formData, options: newOptions })
                            }}
                            className="flex-1 px-4 py-2 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none"
                            placeholder={`الخيار ${index + 1}: مثال - الظبي الأبيض`}
                          />
                          {formData.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.options.length < 6 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 text-primary font-semibold text-sm hover:underline"
                      >
                        + إضافة خيار
                      </button>
                    )}
                    {errors.options && <p className="text-xs text-red-600 mt-1">{errors.options}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-3">
                      الإجابة الصحيحة <span className="text-red-600">*</span>
                    </label>
                    <div className="space-y-2">
                      {formData.options.filter(o => o.trim()).map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                            formData.correctAnswerIndex === index
                              ? 'border-green-500 bg-green-50'
                              : 'border-neutral-200 hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswerIndex === index}
                            onChange={() => setFormData({ ...formData, correctAnswerIndex: index })}
                            className="w-5 h-5 text-primary"
                          />
                          <span className="font-medium text-neutral-800">{option}</span>
                          {formData.correctAnswerIndex === index && (
                            <span className="mr-auto text-green-600 font-bold">✓</span>
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.correctAnswer && <p className="text-xs text-red-600 mt-1">{errors.correctAnswer}</p>}
                  </div>
                </div>
              )}

              {/* True/False Type */}
              {formData.type === 'true_false' && (
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-3">
                    الإجابة الصحيحة <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, correctAnswerBool: true })}
                      className={`py-6 rounded-xl font-bold text-xl transition-all ${
                        formData.correctAnswerBool === true
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      ✓ صح
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, correctAnswerBool: false })}
                      className={`py-6 rounded-xl font-bold text-xl transition-all ${
                        formData.correctAnswerBool === false
                          ? 'bg-red-600 text-white shadow-lg scale-105'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      ✗ خطأ
                    </button>
                  </div>
                  {errors.correctAnswer && <p className="text-xs text-red-600 mt-2">{errors.correctAnswer}</p>}
                </div>
              )}

              {/* Text Type */}
              {formData.type === 'text' && (
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    الإجابات المقبولة <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-neutral-500 mb-3">
                    يمكنك إضافة عدة صيغ مقبولة للإجابة (سيتم تطبيع المسافات والحروف تلقائياً)
                  </p>
                  <div className="space-y-2">
                    {formData.correctAnswerVariants.map((variant, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={variant}
                          onChange={(e) => {
                            const newVariants = [...formData.correctAnswerVariants]
                            newVariants[index] = e.target.value
                            setFormData({ ...formData, correctAnswerVariants: newVariants })
                          }}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none"
                          placeholder={`مثال ${index + 1}: الظبي الأبيض`}
                        />
                        {formData.correctAnswerVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAnswerVariant(index)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addAnswerVariant}
                    className="mt-2 text-primary font-semibold text-sm hover:underline"
                  >
                    + إضافة صيغة أخرى
                  </button>
                  {errors.correctAnswer && <p className="text-xs text-red-600 mt-1">{errors.correctAnswer}</p>}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Source Reference */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5">
                <h4 className="font-bold text-amber-900 mb-2 text-lg">📚 مرجع الموسوعة الرسمي (إلزامي)</h4>
                <p className="text-sm text-amber-800">
                  هذا المرجع سيظهر للطلاب كمرجع رسمي للإجابة من الموسوعة العُمانية
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    المجلد <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sourceRef.volume}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, volume: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.volume ? 'border-red-500' : 'border-neutral-200'
                    } focus:border-primary outline-none`}
                    placeholder="مثال: المجلد الثاني"
                  />
                  {errors.volume && <p className="text-xs text-red-600 mt-1">{errors.volume}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    رقم الصفحة <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sourceRef.page}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, page: e.target.value }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.page ? 'border-red-500' : 'border-neutral-200'
                    } focus:border-primary outline-none`}
                    placeholder="مثال: 145 أو 145-146"
                  />
                  {errors.page && <p className="text-xs text-red-600 mt-1">{errors.page}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    السطر من (اختياري)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sourceRef.lineFrom || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, lineFrom: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary outline-none"
                    placeholder="مثال: 12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    السطر إلى (اختياري)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sourceRef.lineTo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, lineTo: parseInt(e.target.value) || 0 }
                    })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      errors.lineTo ? 'border-red-500' : 'border-neutral-200'
                    } focus:border-primary outline-none`}
                    placeholder="مثال: 15"
                  />
                  {errors.lineTo && <p className="text-xs text-red-600 mt-1">{errors.lineTo}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">👁️ معاينة السؤال</h3>
                
                <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      formData.type === 'text' ? 'bg-blue-100 text-blue-700' :
                      formData.type === 'true_false' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {formData.type === 'text' ? 'نصي' : formData.type === 'true_false' ? 'صح/خطأ' : 'اختيار متعدد'}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-neutral-900 text-lg mb-2">{formData.title}</h4>
                  <p className="text-neutral-700 mb-4 whitespace-pre-wrap">{formData.body}</p>
                  
                  {formData.type === 'mcq' && (
                    <div className="space-y-2">
                      {formData.options.filter(o => o.trim()).map((option, i) => (
                        <div key={i} className={`p-3 rounded-lg border-2 ${
                          i === formData.correctAnswerIndex 
                            ? 'border-green-500 bg-green-50 font-semibold' 
                            : 'border-neutral-200'
                        }`}>
                          {option} {i === formData.correctAnswerIndex && <span className="text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.type === 'true_false' && (
                    <div className="text-green-600 font-bold text-lg">
                      الإجابة الصحيحة: {formData.correctAnswerBool ? 'صح ✓' : 'خطأ ✗'}
                    </div>
                  )}
                  
                  {formData.type === 'text' && (
                    <div>
                      <div className="text-sm font-bold text-neutral-700 mb-2">الإجابات المقبولة:</div>
                      <div className="space-y-1">
                        {formData.correctAnswerVariants.filter(v => v.trim()).map((v, i) => (
                          <div key={i} className="text-green-600 font-medium">• {v}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                  <h5 className="font-bold text-amber-900 mb-2">📖 المرجع الرسمي للموسوعة:</h5>
                  <p className="text-amber-800 font-medium">
                    المجلد: <span className="font-bold">{formData.sourceRef.volume}</span> | 
                    الصفحة: <span className="font-bold">{formData.sourceRef.page}</span>
                    {formData.sourceRef.lineFrom > 0 && (
                      <> | السطر: <span className="font-bold">{formData.sourceRef.lineFrom}</span> إلى <span className="font-bold">{formData.sourceRef.lineTo}</span></>
                    )}
                  </p>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700 font-medium">
                  {errors.submit}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg transition-all"
            >
              السابق
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all"
            >
              التالي
            </button>
          ) : (
            <>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 bg-neutral-600 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ كمسودة'}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'جاري النشر...' : 'نشر السؤال'}
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
