# Answer Details Modal - Usage Guide

## For Developers

### Importing the Component

```typescript
import { AnswerDetailsModal } from '../AnswerDetailsModal'
```

### Basic Usage

```typescript
const [reviewModal, setReviewModal] = useState<{
  open: boolean
  submission: Submission | null
  questions?: Question[]
}>({
  open: false,
  submission: null,
  questions: []
})

// Open modal
const handleOpenReview = async (submission: Submission) => {
  // Load questions for the competition
  const result = await getQuestions({ competition_id: submission.competition_id })
  const questions = result.questions || []
  
  setReviewModal({ open: true, submission, questions })
}

// Render modal
<AnswerDetailsModal
  isOpen={reviewModal.open}
  onClose={() => setReviewModal({ open: false, submission: null })}
  submission={reviewModal.submission!}
  questions={reviewModal.questions || []}
  onComplete={() => {
    setReviewModal({ open: false, submission: null })
    loadData() // Refresh your data
  }}
/>
```

### Props Interface

```typescript
interface Props {
  isOpen: boolean              // Controls modal visibility
  onClose: () => void          // Called when modal closes
  submission: Submission       // The submission being reviewed
  questions: Question[]        // Questions for the competition
  onComplete: () => void       // Called after successful save
}
```

### Required Data Structures

```typescript
interface Submission {
  id: string
  participant_name: string
  participant_email?: string
  grade?: string
  competition_id: string
  answers: Record<string, string>      // { questionId: answer }
  proofs?: Record<string, string>      // { questionId: proof }
  score: number
  total_questions: number
  submitted_at: string
  is_winner?: boolean | null
  competition?: {
    id: string
    title: string
  }
}

interface Question {
  id: string
  question_text: string
  correct_answer: string
  type?: string
  options?: string[]
  volume?: string              // Source reference
  page?: string                // Source reference
  line_from?: string           // Source reference
  line_to?: string             // Source reference
}
```

## For End Users (Admins/Reviewers)

### Opening the Modal

1. Navigate to Dashboard → Submissions Review
2. Click the "عرض" (View) button on any submission
3. The Answer Details modal opens

### TAB A: Current Student Review

#### Student Information Section
- Shows: Name, Email, Grade, Submission Date, Competition
- Status badge: Winner/Loser/Under Review

#### Review Progress
- **Green box:** Number of correct answers
- **Red box:** Number of wrong answers
- **Gray box:** Number of pending (not reviewed yet)

#### Question-by-Question Review

For each question, you'll see:

1. **Question Text:** The actual question
2. **Warning (if applicable):** Missing answer or proof alert
3. **Student's Proof:** The evidence/reference they provided
4. **Source Reference:** Correct location (volume, page, lines)
5. **Answer Comparison:**
   - Left (green): Correct answer
   - Right (blue/red): Student's answer
6. **Review Buttons:**
   - Click "✓ صحيحة" (Correct) if answer is right
   - Click "✗ خاطئة" (Wrong) if answer is incorrect

#### Final Decision

After reviewing all questions:

1. Choose one:
   - **🏆 فائز (Winner):** Student qualifies for the draw
   - **❌ خاسر (Loser):** Student does not qualify

2. Click "💾 حفظ القرار النهائي" (Save Final Decision)

3. Confirm your choice in the popup

### TAB B: Approved Winners

#### Viewing Winners
- Click the "🏆 الفائزون المعتمدون" tab
- See all students already marked as winners for this competition
- Information shown:
  - Name and email
  - Grade and score
  - Number of tickets earned
  - Date when marked as winner

#### Revoking a Winner (CEO/Manager Only)

If you need to remove someone from winners:

1. Find the student in the winners list
2. Click "❌ إلغاء" (Revoke) button
3. Confirm the action
4. Student status returns to "Under Review"

**Note:** Only CEO and Manager roles can revoke winners.

### Unsaved Changes Protection

If you switch from TAB A to TAB B without saving:

1. A warning dialog appears
2. Options:
   - **متابعة بدون حفظ:** Continue without saving (loses changes)
   - **إلغاء:** Cancel and stay on current tab

### Tips & Best Practices

1. **Review Systematically:** Go through questions in order
2. **Check Proofs:** Verify student's evidence matches source
3. **Use Source Reference:** Compare with volume/page/line info
4. **Double-Check Before Saving:** Final decision cannot be easily undone
5. **Verify Winners List:** Check TAB B to avoid duplicate winners
6. **Missing Data:** Pay attention to red warning boxes

### Common Scenarios

#### Scenario 1: Student has correct answers but missing proofs
- Mark answers as correct if they match
- Note: Missing proofs might affect eligibility (check competition rules)

#### Scenario 2: Need to verify if student is already a winner
- Switch to TAB B
- Search for student name in winners list
- If found, they're already marked as winner

#### Scenario 3: Accidentally marked wrong decision
- Before saving: Just change your selection
- After saving: Use the main table buttons to change status
- Or: CEO/Manager can revoke from TAB B and re-review

#### Scenario 4: Network error during save
- Modal shows error message
- Your review is NOT lost (saved locally)
- Click save again when connection restored

### Keyboard Shortcuts (Future)

Currently not implemented, but planned:
- `Ctrl+1`: Switch to TAB A
- `Ctrl+2`: Switch to TAB B
- `Ctrl+S`: Save (when on TAB A)
- `Esc`: Close modal (with unsaved changes warning)

### Troubleshooting

#### "صلاحيات غير كافية" (Insufficient Permissions)
- You don't have admin access
- Contact your system administrator

#### Winners list not loading
- Check internet connection
- Click the retry button
- Refresh the page if problem persists

#### Can't revoke winner
- Only CEO/Manager roles can revoke
- Check your role with administrator

#### Changes not saving
- Ensure you clicked "حفظ القرار النهائي"
- Check for error messages
- Verify internet connection

### Support

For technical issues or questions:
- Check the error message displayed
- Contact your system administrator
- Refer to the main documentation

## API Reference (For Developers)

### Fetch Winners
```typescript
GET /api/competitions/{competitionId}/winners

Response:
{
  ok: true,
  data: Winner[],
  meta: { duration: number, count: number }
}
```

### Revoke Winner
```typescript
POST /api/winners/{submissionId}/revoke

Response:
{
  ok: true,
  success: true,
  message: "تم إلغاء الفوز بنجاح"
}
```

### Review Final
```typescript
POST /api/submissions/{submissionId}/review-final

Body:
{
  corrections: Record<string, { isCorrect: boolean, notes?: string }>,
  finalDecision: 'accepted' | 'rejected'
}

Response:
{
  submission: Submission,
  message: string
}
```

### Mark Winner
```typescript
POST /api/submissions/mark-winner

Body:
{
  submissionId: string,
  isWinner: boolean
}

Response:
{
  success: true,
  message: string,
  submission: Submission
}
```
