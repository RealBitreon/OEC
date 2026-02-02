# Quick Start Guide

## 🚀 What's New

1. **Evidence Simplified**: Students now only enter المجلد (volume) and الصفحة (page) - no more السطر (line)
2. **Modern Draw**: Scrolling names instead of spinning wheel
3. **Pass/Fail**: Simple status instead of accept/reject
4. **Multiple Winners**: Select 1-10 winners per competition
5. **Winner Simulator**: Test and execute draws with preview

## 📋 Deployment Steps

### 1. Run Database Migrations (Required)

Open Supabase SQL Editor and run these files **in order**:

```sql
-- Step 1: Add pass/fail tracking
-- File: Docs/SQL/add_is_winner_to_submissions.sql
-- Copy and paste entire file, then click "Run"

-- Step 2: Add winner count configuration
-- File: Docs/SQL/add_winner_count_to_competitions.sql
-- Copy and paste entire file, then click "Run"
```

### 2. Deploy Code

```bash
# Build and deploy
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

### 3. Test

1. **Test Evidence Submission**:
   - Go to a question page
   - Submit answer with only volume and page
   - Verify line field is not visible

2. **Test Winner Simulator**:
   - Navigate to `/admin/simulator`
   - Select a competition
   - Click "محاكاة السحب (تجريبي)" to test
   - Click "تنفيذ السحب وحفظ النتائج" to save

3. **Test Scrolling Draw**:
   - Go to `/wheel` page
   - Verify names scroll instead of spin

## 🎯 Using the Winner Simulator

### Access
Navigate to: `/admin/simulator`

### Steps
1. **Select Competition**: Choose from dropdown
2. **Set Winner Count**: Enter 1-10 (default from competition)
3. **View Candidates**: See all eligible participants with probabilities
4. **Test (Dry Run)**: Click blue button to simulate without saving
5. **Execute**: Click green button to save winners to database

### What Happens
- Fair weighted random selection based on tickets
- No duplicate winners
- Winners ranked by position (1st, 2nd, 3rd)
- Results saved to `wheel_runs` table
- Submissions marked with `is_winner = true`

## 📊 Database Schema Changes

### New Columns
```sql
-- competitions table
winner_count INTEGER DEFAULT 1 CHECK (winner_count >= 1 AND winner_count <= 10)

-- submissions table
is_winner BOOLEAN DEFAULT NULL
```

### New Table
```sql
-- wheel_runs table
CREATE TABLE wheel_runs (
    id UUID PRIMARY KEY,
    competition_id UUID,
    winner_count INTEGER,
    winners JSONB, -- Array of winner objects
    status TEXT,
    -- ... other fields
);
```

## 🔍 Checking Your Database

Run this to see your current schema:
```sql
-- File: CHECK_CURRENT_SCHEMA.sql
-- Shows all tables, columns, indexes, etc.
```

## 🎨 UI Changes

### For Students
- Evidence form now has 2 fields instead of 3
- Modern scrolling draw visualization
- Clear pass/fail status

### For Admins
- New simulator page at `/admin/simulator`
- Configure winner count per competition
- Test draws before executing

### Text Changes
- "عجلة الحظ" → "السحب"
- "Accept/Reject" → "Pass/Fail"
- All navigation updated

## 📱 Pages Updated

- `/competition/[slug]/participate` - Evidence fields
- `/questions/[id]` - Evidence fields
- `/wheel` - Scrolling component
- `/admin/simulator` - NEW: Winner simulator

## 🔧 API Endpoints

### New Endpoints
```
GET  /api/wheel/simulate?competitionId={id}
POST /api/wheel/simulate
```

### Usage
```javascript
// Preview candidates
const response = await fetch('/api/wheel/simulate?competitionId=xxx')
const data = await response.json()
// Shows: candidates, probabilities, statistics

// Execute draw
const response = await fetch('/api/wheel/simulate', {
  method: 'POST',
  body: JSON.stringify({
    competitionId: 'xxx',
    winnerCount: 3,
    dryRun: false // true = test only
  })
})
```

## ⚠️ Important Notes

1. **Run migrations BEFORE deploying code**
2. **Test with dry run first**
3. **Clear browser cache after deployment**
4. **Backup database before migrations**

## 🐛 Troubleshooting

### Migration Fails
- Check if tables already exist
- Run CHECK_CURRENT_SCHEMA.sql to see current state
- Check Supabase logs for errors

### No Candidates in Simulator
- Verify submissions exist for competition
- Check that submissions have `tickets_earned > 0`
- Ensure competition ID is correct

### Winners Not Saving
- Verify `wheel_runs` table exists
- Check RLS policies
- Ensure service role has permissions

## 📚 Documentation

- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full details
- `WINNER_SELECTION_GUIDE.md` - Winner system guide
- `CHANGES_SUMMARY.md` - All changes made
- `QUICK_REFERENCE.md` - User reference

## ✅ Success Checklist

- [ ] Database migrations completed
- [ ] Code deployed successfully
- [ ] Evidence submission works (2 fields only)
- [ ] Scrolling draw displays correctly
- [ ] Winner simulator accessible
- [ ] Can select multiple winners
- [ ] Dry run works
- [ ] Execute saves to database
- [ ] All pages load without errors
- [ ] Mobile responsive

## 🎉 You're Done!

The system is now ready with:
- ✅ Simplified evidence submission
- ✅ Modern scrolling draw
- ✅ Pass/fail status
- ✅ Multiple winner support
- ✅ Winner selection simulator

Need help? Check the documentation files or review Supabase logs.
