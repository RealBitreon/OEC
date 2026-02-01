# CODE PATCHES - Apply These Changes

## PATCH 1: Fix Competition Submit API

**File:** `app/api/competition/submit/route.ts`

**Action:** Replace entire file with the fixed version

```bash
# Backup original
cp app/api/competition/submit/route.ts app/api/competition/submit/route.BACKUP.ts

# Apply fix
cp app/api/competition/submit/route.FIXED.ts app/api/competition/submit/route.ts
```

---

## PATCH 2: Fix ParticipationForm - Add Server Eligibility Check

**File:** `app/competition/[slug]/participate/ParticipationForm.tsx`

**Location:** Line 180-220 (handleSubmit function)

**REPLACE THIS:**
```typescript
setResult({
  success: true,
  correctCount,
  totalQuestions: questions.length
})
setStep('complete')
```

**WITH THIS:**
```typescript
// Check actual eligibility from server
try {
  const eligibilityResponse = await fetch('/api/eligibility/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participant_name: participantName,
      competition_id: competition.id
    })
  })
  
  const eligibilityData = await eligibilityResponse.json()
  
  setResult({
    success: true,
    correctCount,
    totalQuestions: questions.length,
    isEligible: eligibilityData.isEligible || false,
    ticketCount: eligibilityData.ticketCount || 0
  })
} catch (error) {
  console.error('Failed to check eligibility:', error)
  setResult({
    success: true,
    correctCount,
    totalQuestions: questions.length,
    isEligible: false,
    ticketCount: 0
  })
}
setStep('complete')
```

---

## PATCH 3: Update Result State Type

**File:** `app/competition/[slug]/participate/ParticipationForm.tsx`

**Location:** Line 40 (state declaration)

**REPLACE THIS:**
```typescript
const [result, setResult] = useState<{ success: boolean; correctCount: number; totalQuestions: number } | null>(null)
```

**WITH THIS:**
```typescript
const [result, setResult] = useState<{ 
  success: boolean; 
  correctCount: number; 
  totalQuestions: number;
  isEligible?: boolean;
  ticketCount?: number;
} | null>(null)
```

---

## PATCH 4: Update Success Message Display

**File:** `app/competition/[slug]/participate/ParticipationForm.tsx`

**Location:** Line 450-470 (Step 3: Complete)

**REPLACE THIS:**
```typescript
{allCorrect ? (
  <>
    🌟 رائع! أجبت على جميع الأسئلة بشكل صحيح!<br/>
    ✨ اسمك الآن في عجلة الحظ! 🎡<br/>
    🍀 بالتوفيق في السحب على الجوائز!
  </>
) : someCorrect ? (
  <>
    أجبت على {result.correctCount} من {result.totalQuestions} أسئلة بشكل صحيح<br/>
    اسمك في عجلة الحظ! 🎡<br/>
    بالتوفيق! 🍀
  </>
) : (
  <>
    لا بأس، الأخطاء جزء من التعلم! 💪<br/>
    يمكنك المحاولة مرة أخرى<br/>
    استمر في التعلم وستنجح بإذن الله! 📚
  </>
)}
```

**WITH THIS:**
```typescript
{allCorrect ? (
  <>
    🌟 رائع! أجبت على جميع الأسئلة بشكل صحيح!<br/>
    {result.isEligible ? (
      <>
        ✨ اسمك الآن في عجلة الحظ! 🎡<br/>
        لديك {result.ticketCount || 0} تذكرة 🎟️<br/>
        🍀 بالتوفيق في السحب على الجوائز!
      </>
    ) : (
      <>
        ⏳ إجابتك قيد المراجعة من قبل الإدارة<br/>
        سيتم إعلامك بالنتيجة قريباً
      </>
    )}
  </>
) : someCorrect ? (
  <>
    أجبت على {result.correctCount} من {result.totalQuestions} أسئلة بشكل صحيح<br/>
    {result.isEligible ? (
      <>
        اسمك في عجلة الحظ! 🎡<br/>
        لديك {result.ticketCount || 0} تذكرة 🎟️<br/>
        بالتوفيق! 🍀
      </>
    ) : (
      <>
        ⏳ إجابتك قيد المراجعة من قبل الإدارة
      </>
    )}
  </>
) : (
  <>
    لا بأس، الأخطاء جزء من التعلم! 💪<br/>
    يمكنك المحاولة مرة أخرى<br/>
    استمر في التعلم وستنجح بإذن الله! 📚
  </>
)}
```

---

## PATCH 5: Create Eligibility Check API

**File:** `app/api/eligibility/check/route.ts` (NEW FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { participant_name, competition_id } = await request.json()
    
    if (!participant_name || !competition_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Use the eligibility function we created in migration 003
    const { data, error } = await supabase
      .rpc('get_user_eligibility_info', {
        p_user_identifier: participant_name,
        p_competition_id: competition_id
      })
    
    if (error) {
      console.error('Eligibility check error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    const info = data && data.length > 0 ? data[0] : {
      is_eligible: false,
      ticket_count: 0,
      submission_count: 0,
      approved_submissions: 0,
      latest_submission_status: null,
      latest_submission_score: null
    }
    
    return NextResponse.json({
      isEligible: info.is_eligible || false,
      ticketCount: info.ticket_count || 0,
      submissionCount: info.submission_count || 0,
      approvedSubmissions: info.approved_submissions || 0,
      latestSubmissionStatus: info.latest_submission_status,
      latestSubmissionScore: info.latest_submission_score
    })
    
  } catch (error: any) {
    console.error('Eligibility check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## PATCH 6: Make Evidence Fields Optional for Admin (COMPLETED ✅)

**File:** `app/dashboard/competitions/[id]/questions/[questionId]/page.tsx`

**Status:** FIXED - Evidence fields are now optional for admin when creating/editing questions

**Changes Made:**
- Removed `required` attribute from all evidence input fields (volume, page, line_from, line_to)
- Updated labels to show "(اختياري)" = "(optional)"
- Updated help text to clarify: "الدليل اختياري للمعلم عند إنشاء السؤال، لكنه إلزامي للطلاب عند الإجابة"
- Browser validation ("this field must be...") is now removed

**Note:** Student forms still require evidence fields as intended.

---

## PATCH 7: Add Question Creation Button

**File:** `app/dashboard/competitions/[id]/questions/CompetitionQuestions.tsx`

**Location:** Line 60 (header buttons section)

**ADD THIS BUTTON BEFORE EXISTING BUTTONS:**
```typescript
<button
  onClick={() => setShowCreateModal(true)}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
>
  + سؤال جديد
</button>
```

**ADD THESE STATE VARIABLES (after existing useState declarations):**
```typescript
const [showCreateModal, setShowCreateModal] = useState(false)
const [creating, setCreating] = useState(false)
const [newQuestion, setNewQuestion] = useState({
  question_text: '',
  type: 'mcq' as 'mcq' | 'true_false' | 'text',
  correct_answer: '',
  options: ['', '', '', ''],
  volume: '',
  page: '',
  line_from: '',
  line_to: '',
  attachToCompetition: true
})
```

**ADD THIS FUNCTION (after existing functions):**
```typescript
const handleCreateQuestion = async () => {
  // Validation
  if (!newQuestion.question_text.trim()) {
    alert('يرجى إدخال نص السؤال')
    return
  }
  
  if (!newQuestion.correct_answer.trim()) {
    alert('يرجى إدخال الإجابة الصحيحة')
    return
  }
  
  // Evidence is now optional - no validation needed
  
  setCreating(true)
  try {
    const response = await fetch('/api/questions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_text: newQuestion.question_text,
        type: newQuestion.type,
        correct_answer: newQuestion.correct_answer,
        options: newQuestion.type === 'mcq' ? newQuestion.options.filter(o => o.trim()) : null,
        competition_id: newQuestion.attachToCompetition ? competitionId : null,
        status: newQuestion.attachToCompetition ? 'PUBLISHED' : 'DRAFT',
        is_training: false,
        volume: newQuestion.volume,
        page: newQuestion.page,
        line_from: newQuestion.line_from,
        line_to: newQuestion.line_to,
        is_active: true
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create question')
    }
    
    setShowCreateModal(false)
    setNewQuestion({
      question_text: '',
      type: 'mcq',
      correct_answer: '',
      options: ['', '', '', ''],
      volume: '',
      page: '',
      line_from: '',
      line_to: '',
      attachToCompetition: true
    })
    await loadData()
    alert('تم إنشاء السؤال بنجاح')
  } catch (error: any) {
    console.error('Failed to create question:', error)
    alert(error.message || 'فشل إنشاء السؤال')
  } finally {
    setCreating(false)
  }
}
```

**ADD THIS MODAL (before the closing </div> of the component):**
```typescript
{/* Create Question Modal */}
<Modal
  isOpen={showCreateModal}
  onClose={() => !creating && setShowCreateModal(false)}
  title="إنشاء سؤال جديد"
  size="lg"
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        نص السؤال *
      </label>
      <textarea
        value={newQuestion.question_text}
        onChange={e => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="اكتب السؤال هنا..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        نوع السؤال *
      </label>
      <select
        value={newQuestion.type}
        onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="mcq">اختيار من متعدد</option>
        <option value="true_false">صح/خطأ</option>
        <option value="text">نص</option>
      </select>
    </div>

    {newQuestion.type === 'mcq' && (
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          الخيارات (4 خيارات)
        </label>
        {newQuestion.options.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={e => {
              const newOptions = [...newQuestion.options]
              newOptions[index] = e.target.value
              setNewQuestion({ ...newQuestion, options: newOptions })
            }}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            placeholder={`الخيار ${index + 1}`}
          />
        ))}
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        الإجابة الصحيحة *
      </label>
      {newQuestion.type === 'true_false' ? (
        <select
          value={newQuestion.correct_answer}
          onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر...</option>
          <option value="true">صح</option>
          <option value="false">خطأ</option>
        </select>
      ) : (
        <input
          type="text"
          value={newQuestion.correct_answer}
          onChange={e => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="الإجابة الصحيحة"
        />
      )}
    </div>

    <div className="grid grid-cols-4 gap-3">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          المجلد <span className="text-neutral-400">(اختياري)</span>
        </label>
        <input
          type="text"
          value={newQuestion.volume}
          onChange={e => setNewQuestion({ ...newQuestion, volume: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="رقم المجلد"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          الصفحة <span className="text-neutral-400">(اختياري)</span>
        </label>
        <input
          type="text"
          value={newQuestion.page}
          onChange={e => setNewQuestion({ ...newQuestion, page: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="رقم الصفحة"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          من سطر <span className="text-neutral-400">(اختياري)</span>
        </label>
        <input
          type="text"
          value={newQuestion.line_from}
          onChange={e => setNewQuestion({ ...newQuestion, line_from: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="من"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          إلى سطر <span className="text-neutral-400">(اختياري)</span>
        </label>
        <input
          type="text"
          value={newQuestion.line_to}
          onChange={e => setNewQuestion({ ...newQuestion, line_to: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="إلى"
        />
      </div>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={newQuestion.attachToCompetition}
        onChange={e => setNewQuestion({ ...newQuestion, attachToCompetition: e.target.checked })}
        className="w-4 h-4"
      />
      <label className="text-sm text-neutral-700">
        إضافة السؤال إلى هذه المسابقة مباشرة
      </label>
    </div>

    <div className="flex items-center gap-3 pt-4 border-t">
      <button
        onClick={handleCreateQuestion}
        disabled={creating}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {creating ? 'جاري الإنشاء...' : 'إنشاء السؤال'}
      </button>
      <button
        onClick={() => setShowCreateModal(false)}
        disabled={creating}
        className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        إلغاء
      </button>
    </div>
  </div>
</Modal>
```

---

## SUMMARY OF CHANGES

**Database:**
- 3 SQL migrations to run in Supabase

**API Routes:**
- 1 file to replace: `app/api/competition/submit/route.ts`
- 1 new file to create: `app/api/eligibility/check/route.ts`

**Frontend:**
- 2 files to patch: `ParticipationForm.tsx`, `CompetitionQuestions.tsx`

**Total Lines Changed:** ~500 lines
**Estimated Time:** 30 minutes
**Risk:** Low (backward compatible)
