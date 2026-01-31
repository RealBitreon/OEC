# Question Library & Training Questions System

## Overview
This document explains the refined Question Library and Training Questions flow implemented in the system.

## Core Principles

### 1. NO Auto-Assignment to Competitions
- Questions are NEVER automatically assigned to competitions
- No background logic sets `competition_id` automatically
- No "current competition" auto-selection
- Questions can only be added to competitions through explicit "Add to Competition" action

### 2. Three Question States

#### A) Question Library (Draft/Stored)
- **Purpose**: Store questions as drafts before publishing
- **Database State**:
  - `status = 'DRAFT'`
  - `is_training = false`
  - `competition_id = NULL`
- **Visibility**: Only visible to teachers/managers
- **Route**: `/dashboard/question-bank`

#### B) Training Questions (Published Pool)
- **Purpose**: Questions available for all students to practice
- **Database State**:
  - `status = 'PUBLISHED'`
  - `is_training = true`
  - `competition_id = NULL`
- **Visibility**: Public to all students
- **Route**: `/dashboard/training-questions`

#### C) Competition Questions
- **Purpose**: Questions assigned to a specific competition
- **Database State**:
  - `competition_id = <competition uuid>`
  - `is_training = false`
  - `status = 'PUBLISHED'` (typically)
- **Visibility**: Only for competition participants
- **Route**: `/dashboard/competitions/[id]/questions`

## User Flows

### Adding a New Question

1. Teacher clicks "Add Question" on Question Library or Training Questions page
2. **Destination Modal appears** (REQUIRED STEP):
   - Option 1: "Save to Library (Draft)" ✅ default
   - Option 2: "Publish as Training Question"
   - NO competition selection available
3. Teacher fills in question details
4. On submit:
   - Library: Creates question with `status='DRAFT'`, `is_training=false`, `competition_id=NULL`
   - Training: Creates question with `status='PUBLISHED'`, `is_training=true`, `competition_id=NULL`
5. Success message in Arabic:
   - "تم حفظ السؤال في المكتبة" (Saved to library)
   - "تم نشر السؤال كسؤال تدريبي" (Published as training question)

### Importing Questions

When importing questions (CSV/bulk/copy-paste):
- **Default destination**: Training Questions
- **Required toggle** during import:
  - "Training Questions (default)"
  - "Library Draft"
- All imported questions go to the selected destination
- NEVER to a competition

### Moving Questions Between States

#### From Library to Training
- Button: "نشر للتدريب" (Publish to Training)
- Updates: `status='PUBLISHED'`, `is_training=true`, `competition_id=NULL`

#### From Training to Library
- Button: "نقل للمكتبة" (Move to Library)
- Updates: `status='DRAFT'`, `is_training=false`, `competition_id=NULL`

### Adding Questions to Competition (EXPLICIT ONLY)

**Route**: `/dashboard/competitions/[id]/questions`

**Process**:
1. Teacher navigates to specific competition's questions page
2. Clicks "Add Questions" button
3. Chooses source:
   - "من التدريب" (From Training)
   - "من المكتبة" (From Library)
4. Selects questions from modal
5. Confirms: "Add selected questions to this competition?"
6. System **COPIES** questions to competition (preserves originals)
7. New questions created with:
   - `competition_id = <competition id>`
   - `is_training = false`
   - `status = 'PUBLISHED'`

**Important**: Uses COPY approach to keep library/training pools intact

## Database Schema

```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    is_training BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    type TEXT NOT NULL CHECK (type IN ('mcq', 'true_false', 'text')),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    volume TEXT NOT NULL,
    page TEXT NOT NULL,
    line_from TEXT NOT NULL,
    line_to TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questions_competition_id ON questions(competition_id);
CREATE INDEX idx_questions_is_training ON questions(is_training);
CREATE INDEX idx_questions_status ON questions(status);
```

## Server-Side Guards

### Question Creation
```typescript
export async function createQuestion(data: QuestionFormData) {
  // ENFORCE: Questions from library/training pages must have competition_id = NULL
  if (data.competition_id !== null) {
    throw new Error('Questions cannot be directly assigned to competitions. Use addToCompetition instead.')
  }
  // ... create logic
}
```

### Question Update
```typescript
export async function updateQuestion(id: string, data: Partial<QuestionFormData>) {
  // ENFORCE: Cannot set competition_id through update
  if (data.competition_id !== undefined && data.competition_id !== null) {
    throw new Error('Cannot assign questions to competitions through update. Use addToCompetition instead.')
  }
  // ... update logic
}
```

### Add to Competition
```typescript
export async function addQuestionsToCompetition(questionIds: string[], competitionId: string) {
  // Verify competition exists
  const competition = await competitionsRepo.getById(competitionId)
  if (!competition) {
    throw new Error('Competition not found')
  }

  // Copy each question to the competition
  for (const questionId of questionIds) {
    await questionsRepo.copyToCompetition(questionId, competitionId)
  }
}
```

## API Actions

### Available Actions
- `createQuestion(data)` - Create new question (library/training only)
- `updateQuestion(id, data)` - Update existing question
- `deleteQuestion(id)` - Delete question
- `duplicateQuestion(id)` - Duplicate question
- `moveToTraining(id)` - Publish library question to training
- `moveToLibrary(id)` - Move training question to library
- `getLibraryQuestions()` - Get all library questions
- `addQuestionsToCompetition(questionIds, competitionId)` - Copy questions to competition
- `bulkImportQuestions(questions, destination)` - Import multiple questions

## UI Components

### QuestionsManagement Component
- **Props**: `profile`, `mode: 'training' | 'bank'`
- **Features**:
  - Destination modal for new questions
  - Filter by type and search
  - Move between library/training
  - Duplicate questions
  - Delete questions

### CompetitionQuestions Component
- **Props**: `competitionId`, `competitionTitle`
- **Features**:
  - Add from Training Questions
  - Add from Library
  - Multi-select questions
  - Copy to competition
  - Delete from competition

## Migration

Run the migration SQL file to add the `status` column:
```bash
# Execute: Docs/SQL/question_library_migration.sql
```

This will:
1. Add `status` column with CHECK constraint
2. Update existing questions to proper status
3. Create indexes
4. Add RLS policies
5. Create helper functions

## Testing Checklist

- [ ] Create question → Choose Library → Verify saved as DRAFT
- [ ] Create question → Choose Training → Verify saved as PUBLISHED
- [ ] Import questions → Verify go to Training by default
- [ ] Move question from Library to Training → Verify status changes
- [ ] Move question from Training to Library → Verify status changes
- [ ] Add questions to competition → Verify copied (originals unchanged)
- [ ] Delete competition question → Verify original remains in library/training
- [ ] Try to create question with competition_id → Verify error thrown
- [ ] Try to update question with competition_id → Verify error thrown

## Success Messages (Arabic)

- Library save: "تم حفظ السؤال في المكتبة"
- Training publish: "تم نشر السؤال كسؤال تدريبي"
- Move to training: "تم نشر السؤال للتدريب"
- Move to library: "تم نقل السؤال إلى المكتبة"
- Add to competition: "تم إضافة X سؤال بنجاح"

## Key Benefits

1. **Clear Separation**: Library (drafts) vs Training (published) vs Competition (assigned)
2. **No Accidents**: Questions never auto-assigned to competitions
3. **Flexibility**: Easy to move questions between states
4. **Preservation**: Copying to competitions keeps originals intact
5. **Control**: Teachers have full control over question lifecycle
