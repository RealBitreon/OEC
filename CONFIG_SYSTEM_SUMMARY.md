# ✅ Centralized Configuration System - Complete

## What Was Done

A centralized configuration system has been created to manage all repeatable data across the site. Now you can change the school name, contact information, staff names, and other data from a single location!

## 📁 Files Created

### Configuration Files
1. **`config/site.json`** - Main configuration file with all data
2. **`lib/config/site.ts`** - TypeScript interface and helper functions

### Documentation Files
3. **`config/README.md`** - Full documentation (English)
4. **`config/README_AR.md`** - Full documentation (Arabic) ⭐
5. **`config/USAGE_EXAMPLES.md`** - Code examples
6. **`config/MIGRATION_GUIDE.md`** - Migration guide for other components

### Utility Files
7. **`scripts/find-hardcoded-values.js`** - Script to find hardcoded values

## ✅ Files Updated

These files now use the centralized configuration:

1. **`app/layout.tsx`** - Page metadata and SEO
2. **`components/Footer.tsx`** - Contact info, social links, school credit, staff names, developer credit
3. **`components/HeaderClient.tsx`** - Site title and school name
4. **`app/contact/page.tsx`** - Contact information and staff directory

## 🎯 Current Configuration

### School Information
- **Name:** مدرسة الإمام المهنا بن سلطان للتعليم ما بعد الاساسي(10-12) في مسقط
- **Principal:** سليمان الجابري
- **Assistant Principal:** وليد الغافري
- **LRC Teacher:** مبارك الهنائي

### Developer Credit
- **Name:** يوسف محمد صبح
- **Grade:** 10/7
- **School:** مدرسة الإمام المهنا بن سلطان

### Contact Information
- **Method:** للمشاركة في المسابقة، يرجى التوجه إلى مركز مصادر التعلم في المدرسة
- **Phone:** +968 245 058 58
- **Address:** مرتفعات بوشر، بوشر، محافظة مسقط

### Social Media
- **Instagram:** https://www.instagram.com/edugovmct1434/
- **Twitter/X:** https://x.com/edugovmct1434
- **Threads:** https://www.threads.com/@edugovmct1434

## 🚀 How to Use

### To Change School Name:

1. Open `config/site.json`
2. Find `"school"` → `"name"`
3. Change the value
4. Save the file
5. ✅ Done! The new name appears everywhere

### To Change Staff Names:

1. Open `config/site.json`
2. Find `"school"` section
3. Update `"principal"`, `"assistantPrincipal"`, or `"lrcTeacher"`
4. Save the file
5. ✅ Done! New names appear in footer and contact page

### To Change Contact Info:

1. Open `config/site.json`
2. Find `"contact"`
3. Update phone or address
4. Save the file
5. ✅ Done! New info appears in footer and contact pages

### To Update Social Media Links:

1. Open `config/site.json`
2. Find `"social"`
3. Update URLs
4. Save the file
5. ✅ Done! Links update everywhere

## 📖 Documentation

- **Quick Start (Arabic):** `config/README_AR.md` ⭐
- **Full Documentation:** `config/README.md`
- **Code Examples:** `config/USAGE_EXAMPLES.md`
- **Migration Guide:** `config/MIGRATION_GUIDE.md`

## 🔍 Find Hardcoded Values

To find other places that should use the config:

```bash
node scripts/find-hardcoded-values.js
```

## 💡 Benefits

### Before:
- School name in 10+ different files
- Staff names hardcoded
- Contact info scattered
- Change name = update 10+ files
- Easy to miss files
- Inconsistent data

### After:
- Everything in 1 file only
- Change once = updates everywhere
- Impossible to miss
- Always consistent
- Easy to maintain

## 🎨 What Can Be Configured

- ✅ School name (Arabic & English)
- ✅ School staff (Principal, Assistant Principal, LRC Teacher)
- ✅ Site title and description
- ✅ Contact information (method, phone, address)
- ✅ Social media links (Instagram, Twitter, Threads)
- ✅ Developer credit (name, grade, school)
- ✅ Feature flags (enable/disable features)

## 📝 Example Usage in Code

```typescript
import { config } from '@/lib/config/site'

// Use school name
<h1>{config.school.name}</h1>

// Use staff names
<p>مدير المدرسة: {config.school.principal}</p>

// Use contact info
<p>{config.contact.method}</p>
<p>{config.contact.phone}</p>

// Use social links
{config.social.instagram && <a href={config.social.instagram}>Instagram</a>}

// Use developer info
<p>تطوير: {config.developer.name} - الصف {config.developer.grade}</p>

// Use feature flags
{config.features.enableWheel && <WheelComponent />}
```

## 🔄 Next Steps (Optional)

You can migrate more components to use the centralized config:

1. Run the finder script:
   ```bash
   node scripts/find-hardcoded-values.js
   ```

2. Check the results for hardcoded values

3. Update components to use `config` instead

4. See `config/MIGRATION_GUIDE.md` for help

## ✅ Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check these locations:
   - Page title in browser tab
   - Header (top of page)
   - Footer (bottom of page) - staff names and developer credit
   - Contact page - staff directory
   - Any page with school name

3. Verify all information appears correctly everywhere

## 🎉 Summary

You now have a centralized configuration system! Change the school name, staff names, contact info, or any other data in `config/site.json` and it will update across the entire site automatically.

**Main file to edit:** `config/site.json`  
**Documentation (Arabic):** `config/README_AR.md`  
**Need help?** Check the documentation files in the `config/` folder

---

**Note:** After editing `config/site.json`, you may need to restart the development server to see changes:

```bash
# Stop the server (Ctrl+C)
# Then start again:
npm run dev
```
