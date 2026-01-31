# Migration Guide: Using Centralized Configuration

## Quick Start

To use the centralized configuration in any component:

```typescript
import { config } from '@/lib/config/site'
```

## Common Replacements

### Replace Hardcoded School Name

**Before:**
```typescript
<h1>مدرسة الإمام المهنا بن سلطان</h1>
```

**After:**
```typescript
import { config } from '@/lib/config/site'

<h1>{config.school.name}</h1>
```

### Replace Hardcoded Contact Info

**Before:**
```typescript
<p>البريد الإلكتروني: info@school.edu.om</p>
<p>الهاتف: +968 1234 5678</p>
```

**After:**
```typescript
import { config } from '@/lib/config/site'

<p>البريد الإلكتروني: {config.contact.email}</p>
<p>الهاتف: {config.contact.phone}</p>
```

### Replace Hardcoded Site Title

**Before:**
```typescript
export const metadata = {
  title: 'منصة المسابقات التعليمية',
  description: 'منصة المسابقات...'
}
```

**After:**
```typescript
import { config } from '@/lib/config/site'

export const metadata = {
  title: config.site.title,
  description: config.site.description
}
```

## Files Already Updated

✅ `app/layout.tsx`  
✅ `components/Footer.tsx`  
✅ `components/HeaderClient.tsx`

## Files That May Need Updates

Check these files for hardcoded values:

- [ ] `app/about/page.tsx`
- [ ] `app/contact/page.tsx`
- [ ] `app/dashboard/components/Header.tsx`
- [ ] `components/Hero.tsx`
- [ ] Any other component with school name or contact info

## Search and Replace Tips

### Find Hardcoded School Names

Search for these patterns in your codebase:
- "مدرسة"
- "المدرسة"
- "school"

### Find Hardcoded Contact Info

Search for:
- Email patterns: `@`
- Phone patterns: `+968`
- "info@"
- "contact@"

### Find Hardcoded Site Titles

Search for:
- "مسابقة"
- "الموسوعة"
- "منصة"

## Testing After Migration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check these pages:
   - Home page (/)
   - About page (/about)
   - Contact page (/contact)
   - Footer on any page
   - Header on any page

3. Verify:
   - School name appears correctly
   - Contact information is correct
   - Social media links work (if added)
   - Page titles are correct

## Rollback Plan

If something goes wrong:

1. The original hardcoded values are still in git history
2. You can revert specific files:
   ```bash
   git checkout HEAD -- path/to/file.tsx
   ```

3. Or revert all changes:
   ```bash
   git reset --hard HEAD
   ```

## Need Help?

- Check `config/README.md` for full documentation
- Check `config/USAGE_EXAMPLES.md` for code examples
- Check `config/README_AR.md` for Arabic documentation
