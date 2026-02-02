# Winner Selection System - Complete Guide

## Overview
This system allows CEO/LRC Manager to configure how many winners to select per competition and provides a simulator to test and execute the draw.

## Features

### 1. Configurable Winner Count
- Each competition can have 1-10 winners
- Default: 1 winner
- Set during competition creation or edit

### 2. Winner Selection Simulator
- Test draw without saving results (dry run)
- Execute draw and save winners to database
- View all candidates with their probabilities
- Fair weighted random selection based on tickets

### 3. Multiple Winners Support
- Winners are ranked by position (1st, 2nd, 3rd, etc.)
- No duplicate winners (same person can't win twice)
- Each winner's ticket index is recorded

## Database Schema

### Competitions Table
```sql
ALTER TABLE competitions 
ADD COLUMN winner_count INTEGER NOT NULL DEFAULT 1
CHECK (winner_count >= 1 AND winner_count <= 10);
```

### Wheel Runs Table
```sql
CREATE TABLE wheel_runs (
    id UUID PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id),
    winner_count INTEGER NOT NULL,
    status TEXT CHECK (status IN ('ready', 'running', 'completed', 'cancelled')),
    candidates_snapshot JSONB,
    winners JSONB, -- Array of winner objects
    draw_metadata JSONB,
    is_published BOOLEAN DEFAULT false,
    locked_at TIMESTAMPTZ,
    run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## How to Use

### Step 1: Run Database Migrations

```bash
# In Supabase SQL Editor, run these files in order:
1. Docs/SQL/add_is_winner_to_submissions.sql
2. Docs/SQL/add_winner_count_to_competitions.sql
```

### Step 2: Set Winner Count for Competition

When creating or editing a competition, set the `winner_count` field:

```typescript
const competition = {
  title: "مسابقة الموسوعة العُمانية",
  winnerCount: 3, // Select 3 winners
  // ... other fields
}
```

### Step 3: Access the Simulator

Navigate to: `/admin/simulator`

### Step 4: Run Simulation

1. **Select Competition**: Choose from active competitions
2. **Set Winner Count**: Adjust if needed (1-10)
3. **View Candidates**: See all eligible participants with their ticket counts
4. **Test Draw**: Click "محاكاة السحب (تجريبي)" to simulate without saving
5. **Execute Draw**: Click "تنفيذ السحب وحفظ النتائج" to save winners

## API Endpoints

### GET /api/wheel/simulate?competitionId={id}
Preview candidates and statistics without executing draw.

**Response:**
```json
{
  "competition": {
    "id": "uuid",
    "title": "Competition Name",
    "winnerCount": 3
  },
  "statistics": {
    "totalCandidates": 25,
    "totalTickets": 150,
    "averageTicketsPerCandidate": "6.00"
  },
  "candidates": [
    {
      "username": "أحمد محمد",
      "tickets": 10,
      "probability": "6.67%"
    }
  ]
}
```

### POST /api/wheel/simulate
Execute winner selection.

**Request:**
```json
{
  "competitionId": "uuid",
  "winnerCount": 3,
  "dryRun": true // false to save to database
}
```

**Response:**
```json
{
  "success": true,
  "simulation": {
    "competitionId": "uuid",
    "competitionTitle": "Competition Name",
    "winnerCount": 3,
    "totalCandidates": 25,
    "totalTickets": 150,
    "winners": [
      {
        "username": "أحمد محمد",
        "displayName": "أحمد محمد",
        "ticketIndex": 42,
        "position": 1
      },
      {
        "username": "فاطمة علي",
        "displayName": "فاطمة علي",
        "ticketIndex": 87,
        "position": 2
      },
      {
        "username": "محمد سالم",
        "displayName": "محمد سالم",
        "ticketIndex": 123,
        "position": 3
      }
    ],
    "dryRun": true
  }
}
```

## Selection Algorithm

### Weighted Random Selection
1. Build ticket pool: Each ticket represents one entry
2. Random selection: Pick random ticket from pool
3. No replacement: Remove winner from pool for next selection
4. Repeat: Continue until desired winner count reached

### Example:
```
Candidates:
- أحمد: 10 tickets → 10 entries in pool
- فاطمة: 5 tickets → 5 entries in pool
- محمد: 15 tickets → 15 entries in pool

Total pool: 30 tickets

Probabilities:
- أحمد: 10/30 = 33.33%
- فاطمة: 5/30 = 16.67%
- محمد: 15/30 = 50.00%

Selection:
1. Random pick → محمد (ticket #23)
2. Remove محمد from pool (now 15 tickets)
3. Random pick → أحمد (ticket #7)
4. Remove أحمد from pool (now 5 tickets)
5. Random pick → فاطمة (ticket #2)
```

## UI Components

### Simulator Page (`/admin/simulator`)
- Competition selection dropdown
- Winner count input (1-10)
- Candidates table with probabilities
- Dry run button (test only)
- Execute button (save results)
- Results display with winner rankings

### Scrolling Wheel Display
- Shows names scrolling vertically
- Stops on winner
- Supports multiple winners (shows one at a time)
- Modern, accessible design

## Security & Fairness

### Randomness
- Uses JavaScript `Math.random()` for selection
- Each ticket has equal probability
- No bias towards any candidate

### Transparency
- All candidates and ticket counts visible before draw
- Probabilities calculated and displayed
- Draw metadata saved (timestamp, correlation ID)
- Audit trail in database

### Validation
- Winner count must be 1-10
- Cannot select more winners than candidates
- No duplicate winners
- All winners must have tickets > 0

## Troubleshooting

### No Candidates Found
**Problem**: "No eligible candidates found"
**Solution**: 
- Check that submissions exist for the competition
- Verify submissions have `tickets_earned > 0`
- Ensure competition ID is correct

### Simulation Fails
**Problem**: API returns error
**Solution**:
- Check browser console for details
- Verify database migrations ran successfully
- Check Supabase logs for errors

### Winners Not Saving
**Problem**: Dry run works but execute fails
**Solution**:
- Verify `wheel_runs` table exists
- Check RLS policies allow inserts
- Ensure service role has permissions

## Future Enhancements

1. **Prize Assignment**: Link winners to specific prizes
2. **Email Notifications**: Auto-send winner notifications
3. **Certificate Generation**: Create winner certificates
4. **Draw History**: View past draws and winners
5. **Live Draw**: Real-time draw with audience view
6. **Replay Feature**: Replay past draws with animation

## Support

For issues or questions:
1. Check database schema with `CHECK_CURRENT_SCHEMA.sql`
2. Review Supabase logs
3. Test with dry run first
4. Verify all migrations completed successfully
