'use client'

import { useState } from 'react'

interface QuestionCreateModalProps {
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  competitionId: string
}

export default function QuestionCreateModal({ onClose, onSubmit, competitionId }: QuestionCreateModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'text' as 'text' | 'true_false' | 'mcq',
    title: '',
    body: '',
    correctAnswer: '',
    options: ['', '', '', ''],
    correctAnswerVariants: [''],
    sourceRef: {
      volume: '',
      page: '',
      lineFrom: 0,
      lineTo: 0
    }
  })

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.body) {
      alert('يرجى ملء عنوان السؤال ونصه')
      return
    }

    if (!formData.sourceRef.volume || !formData.sourceRef.page) {
      alert('يرجى ملء مرجع الموسوعة (المجلد والصفحة على الأقل)')
      return
    }

    if (formData.type === 'mcq') {
      const validOptions = formData.options.filter(o => o.trim())
      if (validOptions.length < 2) {
        alert('يرجى إضافة خيارين على الأقل')
        return
      }
      if (!formData.correctAnswer) {
        alert('يرجى اختيار الإجابة الصحيحة')
        return
      }
    }

    setLoading(true)
    try {
      const data: any = {
        competitionId,
        type: formData.type,
        title: formData.title,
        body: formData.body,
        sourceRef: {
          volume: formData.sourceRef.volume,
          page: formData.sourceRef.page,
          lineFrom: formData.sourceRef.lineFrom || 0,
          lineTo: formData.sourceRef.lineTo || 0
        }
      }

      if (formData.type === 'mcq') {
        data.options = formData.options.filter(o => o.trim())
        data.correctAnswer = formData.correctAnswer
      } else if (formData.type === 'true_false') {
        data.correctAnswer = formData.correctAnswer === 'true'
      } else {
        // TEXT type - support multiple variants
        data.correctAnswer = formData.correctAnswerVariants.filter(v => v.trim())
      }

      await onSubmit(data)
      onClose()
    } catch (error) {
      alert('حدث خطأ في الإضافة')
    } finally {
      setLoading(false)
    }
  }

  const addAnswerVariant = () => {
    setFormData({
      ...formData,
      correctAnswerVariants: [...formData.correctAnswerVariants, '']
    })
  }

  const updateAnswerVariant = (index: number, value: string) => {
    const variants = [...formData.correctAnswerVariants]
    variants[index] = value
    setFormData({ ...formData, correctAnswerVariants: variants })
  }

  const removeAnswerVariant = (index: number) => {
    const variants = formData.correctAnswerVariants.filter((_, i) => i !== index)
    setFormData({ ...formData, correctAnswerVariants: variants })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-900">إضافة سؤال جديد</h2>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-600">
            <span>السؤال</span>
            <span>النوع والإجابات</span>
            <span>المرجع</span>
            <span>معاينة</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Question */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">عنوان السؤال *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="مثال: ما معنى المها في اللغة العربية؟"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">نص السؤال *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="اكتب السؤال بالتفصيل..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Type and Answers */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">نوع السؤال</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="text">نصي</option>
                  <option value="true_false">صح/خطأ</option>
                  <option value="mcq">اختيار متعدد</option>
                </select>
              </div>

              {formData.type === 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">الإجابات المقبولة *</label>
                  <p className="text-xs text-neutral-500 mb-2">يمكنك إضافة عدة صيغ مقبولة للإجابة</p>
                  {formData.correctAnswerVariants.map((variant, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={variant}
                        onChange={(e) => updateAnswerVariant(index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 outline-none"
                        placeholder={`مثال ${index + 1}: الظبي الأبيض`}
                      />
                      {formData.correctAnswerVariants.length > 1 && (
                        <button
                          onClick={() => removeAnswerVariant(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addAnswerVariant}
                    className="text-primary font-semibold text-sm hover:underline"
                  >
                    + إضافة صيغة أخرى
                  </button>
                </div>
              )}

              {formData.type === 'true_false' && (
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">الإجابة الصحيحة *</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, correctAnswer: 'true' })}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        formData.correctAnswer === 'true'
                          ? 'bg-green-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      صح ✓
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, correctAnswer: 'false' })}
                      className={`flex-1 py-3 rounded-lg font-semibold transition ${
                        formData.correctAnswer === 'false'
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      خطأ ✗
                    </button>
                  </div>
                </div>
              )}

              {formData.type === 'mcq' && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">الخيارات *</label>
                  {formData.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const options = [...formData.options]
                        options[index] = e.target.value
                        setFormData({ ...formData, options })
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none"
                      placeholder={`الخيار ${index + 1}: مثال - الظبي الأبيض`}
                    />
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2 mt-4">الإجابة الصحيحة *</label>
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary outline-none"
                    >
                      <option value="">اختر الإجابة الصحيحة</option>
                      {formData.options.filter(o => o.trim()).map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Source Reference */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-amber-900 mb-2">مرجع الموسوعة الرسمي</h4>
                <p className="text-sm text-amber-800">هذا المرجع سيظهر للطلاب كمرجع رسمي للإجابة</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">المجلد *</label>
                  <input
                    type="text"
                    value={formData.sourceRef.volume}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, volume: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary outline-none"
                    placeholder="مثال: المجلد الثاني"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">رقم الصفحة *</label>
                  <input
                    type="text"
                    value={formData.sourceRef.page}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, page: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary outline-none"
                    placeholder="مثال: 145"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">السطر من</label>
                  <input
                    type="number"
                    value={formData.sourceRef.lineFrom || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, lineFrom: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary outline-none"
                    placeholder="مثال: 12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">السطر إلى</label>
                  <input
                    type="number"
                    value={formData.sourceRef.lineTo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sourceRef: { ...formData.sourceRef, lineTo: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary outline-none"
                    placeholder="مثال: 15"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">معاينة السؤال</h3>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      formData.type === 'text' ? 'bg-blue-100 text-blue-700' :
                      formData.type === 'true_false' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {formData.type === 'text' ? 'نصي' : formData.type === 'true_false' ? 'صح/خطأ' : 'اختيار متعدد'}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">{formData.title}</h4>
                  <p className="text-neutral-700 mb-3">{formData.body}</p>
                  
                  {formData.type === 'mcq' && (
                    <div className="space-y-2">
                      {formData.options.filter(o => o.trim()).map((option, i) => (
                        <div key={i} className={`p-2 rounded border ${
                          option === formData.correctAnswer ? 'border-green-500 bg-green-50' : 'border-neutral-200'
                        }`}>
                          {option} {option === formData.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {formData.type === 'true_false' && (
                    <div className="text-green-600 font-semibold">
                      الإجابة: {formData.correctAnswer === 'true' ? 'صح ✓' : 'خطأ ✗'}
                    </div>
                  )}
                  
                  {formData.type === 'text' && (
                    <div>
                      <div className="text-sm font-semibold text-neutral-700 mb-1">الإجابات المقبولة:</div>
                      {formData.correctAnswerVariants.filter(v => v.trim()).map((v, i) => (
                        <div key={i} className="text-green-600">• {v}</div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h5 className="font-bold text-amber-900 mb-2">المرجع الرسمي:</h5>
                  <p className="text-amber-800 text-sm">
                    المجلد: {formData.sourceRef.volume} | الصفحة: {formData.sourceRef.page}
                    {formData.sourceRef.lineFrom > 0 && ` | السطر: ${formData.sourceRef.lineFrom} إلى ${formData.sourceRef.lineTo}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all"
            >
              السابق
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الإضافة...' : 'إضافة السؤال'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
