# Dashboard Restructure - Competition-Centric Flow

## ✅ COMPLETED

The dashboard has been successfully restructured to be competition-centric with a clearer information architecture.

## 📋 Changes Summary

### 1. Database Migration
**File:** `Docs/SQL/dashboard_restructure_migration.sql`
- Added `status` column to questions table ('DRAFT' | 'PUBLISHED')
- Created index for status field
- Updated existing questions with proper status values

### 2. Updated Types
**File:** `app/dashboard/core/types.ts`
- Added `QuestionStatus` type
- Updated `Question` interface to include `status` field
- Updated `DashboardSection` type to remove old sections and add new ones:
  - Removed: `current-competition`, `questions`, `submissions`, `tickets`, `wheel`
  - Added: `training-questions`, `question-bank`

### 3. Updated Sidebar Navigation
**File:** `app/dashboard/components/Sidebar.tsx`
- New sidebar items:
  - نظرة عامة (Overview)
  - إدارة المسابقات (Competitions)
  - الأسئلة التدريبية (Training Questions)
  - مكتبة الأسئلة (Question Bank)
  - الإصدارات السابقة (Archives)
  - الإعدادات (Settings)
  - المستخدمون (Users - CEO only)
  - سجل التدقيق (Audit - CEO only)
- Removed: التذاكر (Tickets)

### 4. Updated Dashboard Shell
**File:** `app/dashboard/components/DashboardShell.tsx`
- Updated section rendering to support new modes
- Removed imports for SubmissionsReview, TicketsManagement, WheelManagement from main shell
- Added mode support for QuestionsManagement ('training' | 'bank')

### 5. Updated Questions Management
**File:** `app/dashboard/components/sections/QuestionsManagement.tsx`
- Added `mode` prop ('training' | 'bank')
- Updated filters to support status field
- Different headers and descriptions based on mode
- Training mode: shows only training questions (is_training=true)
- Bank mode: shows only draft questions (status='DRAFT', is_training=false, competition_id=null)

### 6. New Route Structure

#### Competition Routes
- `/dashboard/competitions` - List all competitions
- `/dashboard/competitions/[id]` - Competition Hub (main page)
- `/dashboard/competitions/[id]/manage` - Edit competition details
- `/dashboard/competitions/[id]/questions` - Manage competition questions
- `/dashboard/competitions/[id]/submissions` - Review student answers
- `/dashboard/competitions/[id]/wheel` - Wheel controls

#### Question Routes
- `/dashboard/training-questions` - Training questions only
- `/dashboard/question-bank` - Draft/stored questions

#### Other Routes
- `/dashboard/archives` - Archived competitions
- `/dashboard` - Overview (existing)

### 7. New Components Created

#### Competition Hub
**File:** `app/dashboard/competitions/[id]/CompetitionHub.tsx`
- Main landing page for a competition
- Shows competition details, status, dates, rules
- Four big action cards:
  1. إدارة المسابقة (Manage)
  2. الأسئلة (Questions)
  3. إجابات الطلاب (Submissions)
  4. عجلة الحظ (Wheel)

#### Competition Questions
**File:** `app/dashboard/competitions/[id]/questions/CompetitionQuestions.tsx`
- Manage questions for specific competition
- Create new questions directly for competition
- Add questions from library (training or bank) via modal
- Modal with tabs: "الأسئلة التدريبية" and "مكتبة الأسئلة"
- Select multiple questions and add to competition

#### Competition Submissions
**File:** `app/dashboard/competitions/[id]/submissions/CompetitionSubmissions.tsx`
- Wrapper for SubmissionsReview component
- Filters submissions by competition
- Back button to competition hub

#### Competition Wheel
**File:** `app/dashboard/competitions/[id]/wheel/CompetitionWheel.tsx`
- Wrapper for WheelManagement component
- Filters wheel actions by competition
- Back button to competition hub

#### Manage Competition
**File:** `app/dashboard/competitions/[id]/manage/ManageCompetition.tsx`
- Edit competition details
- Update title, description, status
- Modify dates (start, end, wheel)
- Configure eligibility rules
- Archive competition option

### 8. Updated Existing Components

#### CompetitionsManagement
**File:** `app/dashboard/components/sections/CompetitionsManagement.tsx`
- Added router import
- Added "عرض المسابقة" button to navigate to competition hub
- Button navigates to `/dashboard/competitions/[id]`

#### SubmissionsReview
**File:** `app/dashboard/components/sections/SubmissionsReview.tsx`
- Added optional `competitionId` prop
- Can filter submissions by competition when used in competition context

#### WheelManagement
**File:** `app/dashboard/components/sections/WheelManagement.tsx`
- Added optional `competitionId` prop
- Can filter wheel actions by competition when used in competition context

## 🎯 Question Types Logic

### 1. Training Question
```typescript
{
  is_training: true,
  competition_id: null,
  status: 'PUBLISHED'
}
```
- Accessible from sidebar "الأسئلة التدريبية"
- Not linked to any competition
- Available for students to practice

### 2. Draft/Stored Question (Bank)
```typescript
{
  status: 'DRAFT',
  is_training: false,
  competition_id: null
}
```
- Accessible from sidebar "مكتبة الأسئلة"
- Stored for future use
- Can be added to competitions later

### 3. Competition Question
```typescript
{
  competition_id: '<competition.id>',
  is_training: false,
  status: 'DRAFT' | 'PUBLISHED'
}
```
- Linked to specific competition
- DRAFT: saved but not active yet
- PUBLISHED: active in competition

## 🔄 User Flow

### Teacher wants to create a competition:
1. Go to "إدارة المسابقات" in sidebar
2. Click "إنشاء مسابقة"
3. Fill details and save
4. Click "عرض المسابقة" on the competition card
5. Lands on Competition Hub with 4 action cards

### Teacher wants to add questions to competition:
1. From Competition Hub, click "الأسئلة"
2. Two options:
   - "إنشاء سؤال جديد" - Create directly for this competition
   - "إضافة من المكتبة" - Add from existing questions
3. In library modal, choose tab:
   - "الأسئلة التدريبية" - Training questions
   - "مكتبة الأسئلة" - Draft/stored questions
4. Select questions and click "إضافة الأسئلة"

### Teacher wants to create training questions:
1. Go to "الأسئلة التدريبية" in sidebar
2. Click "إضافة سؤال"
3. Check "سؤال تدريبي" checkbox
4. Fill details and save

### Teacher wants to store questions for later:
1. Go to "مكتبة الأسئلة" in sidebar
2. Click "إضافة سؤال"
3. Don't check "سؤال تدريبي"
4. Don't select a competition
5. Question saved as DRAFT in bank

## 🚫 Removed Features
- Tickets section from sidebar (completely removed)
- Global submissions page (now competition-specific)
- Global wheel page (now competition-specific)
- "المسابقة الحالية" section (replaced by competition hub)

## 📝 Next Steps (API Implementation Needed)

The following API endpoints need to be created/updated:

1. `GET /api/dashboard/competitions/[id]/questions` - Get questions for competition
2. `POST /api/dashboard/competitions/[id]/questions/add` - Add questions to competition
3. `GET /api/dashboard/questions?status=DRAFT&is_training=false` - Get bank questions
4. `GET /api/dashboard/questions?is_training=true` - Get training questions
5. `PATCH /api/dashboard/competitions/[id]` - Update competition
6. `POST /api/dashboard/competitions/[id]/archive` - Archive competition

## ✅ Security
- All competition pages require CEO or LRC_MANAGER role
- Server-side role checks in page components
- Students cannot access dashboard routes
- RLS policies need to support new question status field

## 🎨 UI/UX
- Arabic RTL throughout
- Premium design with clear hierarchy
- Empty states for all sections
- Back buttons for navigation
- Consistent color coding:
  - Blue: Primary actions
  - Green: Success/Add actions
  - Red: Delete/Danger actions
  - Yellow: Draft/Warning states

## 📊 Benefits of New Structure
1. **Clearer hierarchy**: Competition → Actions
2. **Better organization**: Questions separated by purpose
3. **Reduced clutter**: Removed tickets, moved submissions/wheel to competition context
4. **Easier navigation**: Hub page as central point
5. **Flexible question management**: Training, Bank, and Competition questions clearly separated
