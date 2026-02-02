# Quick Reference Guide - Recent Changes

## For Teachers/Administrators

### 1. Evidence Fields Changed
**Before**: Students had to enter المجلد (volume), الصفحة (page), and السطر (line)
**Now**: Students only enter المجلد (volume) and الصفحة (page)

**Why**: This prevents students from using ChatGPT to generate fake line numbers and makes verification easier.

### 2. Wheel Changed to Scrolling Names
**Before**: Traditional spinning wheel animation
**Now**: Names scroll vertically in a container until stopping on the winner

**Why**: More modern, accessible, and easier to see on all devices.

### 3. Submission Review Simplified
**Before**: "Accept" or "Reject" buttons
**Now**: Simple "Pass" (نجح) or "Fail" (لم ينجح) status

**Why**: Clearer terminology that better fits the educational context.

## For Students

### What You Need to Know:

1. **When Answering Questions**:
   - You must provide evidence from the Omani Encyclopedia
   - Enter only: المجلد (volume number) and الصفحة (page number)
   - No need to enter line numbers anymore

2. **After Submitting**:
   - Your name enters the draw if you answer correctly
   - The draw uses a scrolling name system (not a wheel)
   - More correct answers = more chances to win

3. **Viewing Results**:
   - Check the "السحب" (Draw) page to see winners
   - Watch the live draw when it happens

## Technical Details

### Files Changed:
- Evidence forms: Removed line field, kept volume and page
- Wheel component: New scrolling animation
- API endpoints: Updated to use pass/fail logic
- UI text: Changed "wheel" references to "draw"

### Database Changes:
- Added `is_winner` column to submissions table
- Run migration: `Docs/SQL/add_is_winner_to_submissions.sql`

### New Components:
- `app/wheel/ScrollingWheel.tsx` - Modern scrolling draw animation

## Common Questions

**Q: Will old submissions still work?**
A: Yes, existing submissions are compatible. The migration script handles data conversion.

**Q: Do I need to update the database?**
A: Yes, run the SQL migration file before deploying the new code.

**Q: What happens to submissions with line numbers?**
A: They remain in the database but the line field is no longer displayed or required for new submissions.

**Q: Can students still cheat?**
A: The removal of the line field makes it harder to use AI tools, but teachers should still verify the volume and page references.

## Deployment Checklist

- [ ] Run database migration: `add_is_winner_to_submissions.sql`
- [ ] Deploy new code to production
- [ ] Clear browser cache
- [ ] Test evidence submission (volume and page only)
- [ ] Test scrolling draw animation
- [ ] Verify pass/fail marking works
- [ ] Check all navigation links work

## Support

If you encounter any issues:
1. Check that the database migration ran successfully
2. Clear browser cache and reload
3. Verify all environment variables are set correctly
4. Check browser console for any errors
