# LRC Manager Implementation Plan

## Overview
This document outlines the complete implementation plan for the LRC Manager workflow as specified in the requirements. The system allows LRC Managers to create competitions, manage questions with source proofs, review student submissions, manage tickets, and run the prize wheel.

## Current Status

### ✅ Completed Features
1. **Authentication System**
   - Supabase auth integration
   - Role-based access control (CEO, LRC_MANAGER, STUDENT)
   - Dashboard access restrictions

2. **Competition Management (Partial)**
   - Create/Edit/Delete competitions
   - Set dates (start, end, wheel draw)
   - Activate competitions (auto-archives previous)
   - Draft/Active/Archived status

3. **Questions Management (Partial)**
   - Create questions (MCQ, True/False, Text)
   - Source proof fields (volume, page, line from/to)
   - Training vs Competition questions
   - Duplicate questions
   - Move to training

4. **Submissions Review (Partial)**
   - View submissions list
   - Filter by competition/status
   - Basic review modal
   - Bulk review actions

### ❌ Missing Features

#### 1. Competition Rules Configuration
**Status:** Not Implemented  
**Priority:** HIGH  
**Description:** LRC Manager needs to configure eligibility rules for each competition

**Requirements:**
- Option A: Strict Rule (all questions correct)
- Option B: Flexible Rule (minimum X questions correct)
- Tickets per correct answer
- Early submission bonus tiers

**Implementation:**
```typescript
// Add to CompetitionsManagement.tsx
interface CompetitionRules {
  eligibilityMode: 'all_correct' | 'min_correct'
  minCorrectAnswers?: number
  ticketsPerCorrect: number
  earlyBonusTiers: Array<{
    cutoffDate: string
    bonusTickets: number
  }>
}
```

**Files to Modify:**
- `app/dashboard/components/sections/CompetitionsManagement.tsx` - Add rules form
- `app/dashboard/actions/competitions.ts` - Save rules
- `app/dashboard/core/types.ts` - Update Competition type

---

#### 2. Student Participation (No Login)
**Status:** Not Implemented  
**Priority:** HIGH  
**Description:** Students participate without login by entering name and class

**Requirements:**
- Public competition page
- Name + Class input
- Questions appear in shuffled order
- Source proof required for each answer
- Submit answers

**Implementation:**
```typescript
// Create new page
// app/competition/[slug]/participate/page.tsx

interface StudentSubmission {
  studentName: string
  studentClass: string
  answers: Array<{
    questionId: string
    answer: string
    sourceRef: {
      volume: string
      page: string
      lineFrom: string
      lineTo: string
    }
  }>
}
```

**Files to Create:**
- `app/competition/[slug]/participate/page.tsx` - Participation form
- `app/api/competition/submit/route.ts` - Submit answers API
- `components/CompetitionParticipation.tsx` - Participation UI

---

#### 3. Enhanced Submission Review
**Status:** Partially Implemented  
**Priority:** HIGH  
**Description:** Full-screen review mode with all details

**Missing Features:**
- Side-by-side comparison of student vs correct answer
- Source proof comparison
- Correction reason field
- Auto-grading status display
- Better visual indicators

**Files to Modify:**
- `app/dashboard/components/sections/SubmissionsReview.tsx` - Enhanced modal

---

#### 4. Tickets Management
**Status:** Not Implemented  
**Priority:** MEDIUM  
**Description:** View and manage student tickets

**Requirements:**
- View total tickets per student
- Filter by class/competition
- See how each ticket was earned
- Recalculate tickets button
- Export tickets list

**Implementation:**
```typescript
// app/dashboard/components/sections/TicketsManagement.tsx

interface TicketSummary {
  studentId: string
  studentName: string
  studentClass: string
  totalTickets: number
  breakdown: Array<{
    reason: string
    count: number
    earnedAt: string
  }>
}
```

**Files to Create:**
- `app/dashboard/components/sections/TicketsManagement.tsx` - Full implementation
- `app/dashboard/actions/tickets.ts` - Tickets actions
- `app/dashboard/data/tickets.ts` - Tickets data layer

---

#### 5. Wheel Management
**Status:** Not Implemented  
**Priority:** MEDIUM  
**Description:** Manage wheel draw process

**Requirements:**
- Preview eligible students
- Lock candidates list
- Run the draw (weighted random)
- Publish result
- Control winner visibility (show/hide/alias)

**Implementation:**
```typescript
// app/dashboard/components/sections/WheelManagement.tsx

interface WheelSnapshot {
  competitionId: string
  lockedAt: string
  candidates: Array<{
    studentId: string
    studentName: string
    tickets: number
  }>
  totalTickets: number
}

interface WheelResult {
  winnerId: string
  winnerName: string
  runAt: string
  isPublic: boolean
  displayName?: string
}
```

**Files to Create:**
- `app/dashboard/components/sections/WheelManagement.tsx` - Full implementation
- `app/dashboard/actions/wheel.ts` - Wheel actions
- `app/wheel/page.tsx` - Public wheel results page
- `components/WheelSpinner.tsx` - Animated wheel component

---

#### 6. Archives Management
**Status:** Not Implemented  
**Priority:** LOW  
**Description:** View archived competitions

**Requirements:**
- List archived competitions
- View competition details (read-only)
- View winners
- Export competition data

**Files to Create:**
- `app/dashboard/components/sections/Archives.tsx` - Archives view

---

#### 7. Current Competition Dashboard
**Status:** Not Implemented  
**Priority:** MEDIUM  
**Description:** Overview of active competition

**Requirements:**
- Competition details
- Participation stats
- Submission stats
- Quick actions

**Files to Create:**
- `app/dashboard/components/sections/CurrentCompetition.tsx` - Competition overview

---

## Database Schema Updates Needed

### 1. Add student_participants table
```sql
CREATE TABLE student_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Update submissions table
```sql
ALTER TABLE submissions 
ADD COLUMN student_participant_id UUID REFERENCES student_participants(id),
ADD COLUMN correction_reason TEXT;
```

### 3. Add wheel_snapshots table
```sql
CREATE TABLE wheel_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id),
  locked_at TIMESTAMPTZ NOT NULL,
  candidates JSONB NOT NULL,
  winner_id UUID,
  winner_display_name TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  run_at TIMESTAMPTZ
);
```

---

## Implementation Priority

### Phase 1: Core Functionality (Week 1)
1. ✅ Fix SubmissionsReview.tsx (DONE)
2. Competition Rules Configuration
3. Student Participation (No Login)
4. Enhanced Submission Review

### Phase 2: Tickets & Eligibility (Week 2)
1. Tickets Management
2. Eligibility Calculation
3. Recalculate Tickets Function

### Phase 3: Wheel System (Week 3)
1. Wheel Management
2. Lock Candidates
3. Run Draw
4. Public Wheel Page

### Phase 4: Polish & Archives (Week 4)
1. Current Competition Dashboard
2. Archives Management
3. Export Features
4. UI/UX Improvements

---

## API Endpoints Needed

### Public Endpoints
- `GET /api/competition/[slug]` - Get competition details
- `POST /api/competition/[slug]/submit` - Submit answers
- `GET /api/wheel/[competitionId]` - Get wheel results

### Protected Endpoints (LRC Manager)
- `POST /api/dashboard/competition/rules` - Update rules
- `POST /api/dashboard/tickets/recalculate` - Recalculate tickets
- `POST /api/dashboard/wheel/lock` - Lock candidates
- `POST /api/dashboard/wheel/run` - Run draw
- `POST /api/dashboard/wheel/publish` - Publish results

---

## Testing Checklist

### Competition Management
- [ ] Create competition with all fields
- [ ] Edit competition dates
- [ ] Activate competition (archives previous)
- [ ] Configure rules (strict/flexible)
- [ ] Delete competition (CEO only)

### Questions Management
- [ ] Create MCQ with source proof
- [ ] Create True/False with source proof
- [ ] Create Text question with source proof
- [ ] Set correct answer later
- [ ] Duplicate question
- [ ] Move to training

### Student Participation
- [ ] Access competition without login
- [ ] Enter name and class
- [ ] See shuffled questions
- [ ] Submit answers with source proof
- [ ] Prevent duplicate submissions

### Submissions Review
- [ ] View all submissions
- [ ] Filter by competition/status
- [ ] Review individual submission
- [ ] Compare student vs correct answer
- [ ] Mark as correct/incorrect
- [ ] Bulk review
- [ ] Add correction reason

### Tickets Management
- [ ] View tickets per student
- [ ] Filter by class/competition
- [ ] See ticket breakdown
- [ ] Recalculate tickets
- [ ] Export tickets list

### Wheel Management
- [ ] Preview eligible students
- [ ] Lock candidates list
- [ ] Run weighted random draw
- [ ] Publish result
- [ ] Control winner visibility
- [ ] View on public page

---

## Next Steps

1. **Immediate:** Implement Competition Rules Configuration
2. **Next:** Create Student Participation Flow
3. **Then:** Complete Tickets Management
4. **Finally:** Implement Wheel System

---

## Notes

- All source proof fields are mandatory to prevent AI usage
- Students don't need accounts - just name and class
- Questions are shuffled per student
- Tickets are auto-calculated based on rules
- Wheel uses weighted random selection
- Winner visibility is controlled by LRC Manager
- All actions are logged in audit_log table

---

## Questions for Clarification

1. Should students be able to see their own results?
2. Can students submit multiple times or only once?
3. Should there be a time limit per question?
4. How should ties be handled in the wheel?
5. Should there be email notifications for winners?

---

**Last Updated:** January 28, 2026  
**Status:** In Progress  
**Next Review:** After Phase 1 completion
