# Missing Features Implementation Guide

## Overview
This guide provides step-by-step implementation instructions for the 4 critical missing features in the LRC Manager dashboard.

---

## Feature 1: Competition Rules Configuration

### Location
`app/dashboard/components/sections/CompetitionsManagement.tsx`

### What to Add
Add a "Configure Rules" button and modal in the competition form that allows:
1. Eligibility mode selection (all_correct, min_correct, per_correct)
2. Minimum correct answers (if min_correct mode)
3. Base tickets configuration
4. Early submission bonus tiers
5. Manual adjustments toggle

### Implementation Steps


1. Add rules state to CompetitionForm component
2. Create RulesConfigModal component
3. Add rules fields to the form
4. Update createCompetition/updateCompetition actions to save rules
5. Display current rules in competition list

### Backend Changes Needed
Update `app/dashboard/actions/competitions.ts`:
- Modify createCompetition to accept rules parameter
- Modify updateCompetition to accept rules parameter
- Add validation for rules configuration

---

## Feature 2: Wheel Management (CRITICAL)

### Location
`app/dashboard/components/sections/WheelManagement.tsx`

### What to Implement
Complete wheel management with 4 main sections:
1. **Preview Eligible Students** - Show who qualifies and their ticket counts
2. **Lock Snapshot** - Create immutable candidate list
3. **Run Draw** - Execute weighted random selection
4. **Publish Results** - Control winner visibility

### Implementation Steps


1. Create state management for wheel status
2. Build PreviewEligibleStudents component
3. Build LockSnapshot functionality
4. Implement weighted random draw algorithm
5. Create PublishResults controls
6. Add winner privacy settings

### Backend Actions Needed
Create `app/dashboard/actions/wheel.ts`:
- getEligibleStudents(competitionId)
- lockSnapshot(competitionId)
- runDraw(competitionId)
- publishResults(competitionId, settings)
- updateWinnerVisibility(competitionId, settings)

---

## Feature 3: Tickets Management UI

### Location
`app/dashboard/components/sections/TicketsManagement.tsx`

### What to Implement
Complete tickets management interface with:
1. Tickets summary table (student, class, total, breakdown)
2. Filter by competition and class
3. Recalculate all tickets button
4. Add manual tickets functionality
5. View ticket history per student

### Implementation Steps


1. Create tickets state and filters
2. Build tickets summary table
3. Add competition filter dropdown
4. Implement recalculate all button
5. Create manual tickets modal
6. Add ticket breakdown display

### Backend Actions Available
Already implemented in `app/dashboard/actions/tickets.ts`:
- getTicketsSummary(competitionId) ✓
- recalculateAllTickets(competitionId) ✓
- addManualTickets(userId, competitionId, count, reason) ✓

---

## Feature 4: Current Competition Monitoring

### Location
`app/dashboard/components/sections/CurrentCompetition.tsx`

### What to Implement
Real-time competition monitoring with:
1. Active competition details
2. Participation statistics
3. Auto-grading distribution chart
4. Recent submissions feed
5. Quick action buttons

### Implementation Steps


1. Fetch active competition data
2. Build stats cards (participants, submissions, grading)
3. Create distribution visualization
4. Add recent activity feed
5. Implement quick navigation buttons

### Backend Actions Needed
Create `app/dashboard/actions/monitoring.ts`:
- getActiveCompetition()
- getParticipationStats(competitionId)
- getGradingDistribution(competitionId)
- getRecentActivity(competitionId, limit)

---

## Priority Order

### Week 1: Rules Configuration
- Implement rules UI in competition form
- Test eligibility calculations
- Verify ticket calculations work with different rules

### Week 2: Wheel Management
- Build preview and lock functionality
- Implement draw algorithm
- Add result publishing controls
- Test end-to-end wheel workflow

### Week 3: Tickets & Monitoring
- Complete tickets management UI
- Implement current competition monitoring
- Add reporting and analytics

---

## Testing Checklist

### Rules Configuration
- [ ] Can create competition with all rule types
- [ ] Can edit rules for draft competitions
- [ ] Rules are locked when competition activates
- [ ] Ticket calculations respect configured rules

### Wheel Management
- [ ] Preview shows correct eligible students
- [ ] Lock creates immutable snapshot
- [ ] Draw selects winner with proper weighting
- [ ] Winner visibility controls work
- [ ] Cannot run draw twice

### Tickets Management
- [ ] Summary shows all students with tickets
- [ ] Recalculate updates all tickets correctly
- [ ] Manual tickets can be added with reason
- [ ] Filters work properly

### Current Competition
- [ ] Shows active competition details
- [ ] Stats update in real-time
- [ ] Distribution chart displays correctly
- [ ] Recent activity feed works

---

## Additional Resources

See `DASHBOARD_LRC_WORKFLOW_ANALYSIS.md` for detailed analysis of current implementation.
