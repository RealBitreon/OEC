# Site Configuration

This directory contains the centralized configuration for the entire application.

## Configuration File: `site.json`

All repeatable data across the site is stored in `site.json`. When you update this file, the changes will automatically reflect across the entire application.

### Configuration Structure

```json
{
  "school": {
    "name": "Full school name in Arabic",
    "shortName": "Short school name in Arabic",
    "nameEn": "Full school name in English",
    "shortNameEn": "Short school name in English"
  },
  "site": {
    "title": "Site title in Arabic",
    "titleEn": "Site title in English",
    "description": "Site description in Arabic",
    "descriptionEn": "Site description in English"
  },
  "contact": {
    "email": "Contact email",
    "phone": "Contact phone",
    "address": "Address in Arabic",
    "addressEn": "Address in English"
  },
  "social": {
    "facebook": "Facebook URL (leave empty to hide)",
    "twitter": "Twitter URL (leave empty to hide)",
    "instagram": "Instagram URL (leave empty to hide)"
  },
  "features": {
    "enableWheel": true/false,
    "enableCompetitions": true/false,
    "enableTraining": true/false,
    "enableCertificates": true/false
  }
}
```

## Usage in Components

Import the configuration in your components:

```typescript
import { config, getSchoolName, getSiteTitle } from '@/lib/config/site'

// Use directly
const schoolName = config.school.name

// Or use helper functions
const schoolName = getSchoolName('ar', false) // Arabic, full name
const schoolNameShort = getSchoolName('ar', true) // Arabic, short name
const schoolNameEn = getSchoolName('en', false) // English, full name
```

## Helper Functions

- `getSchoolName(lang, short)` - Get school name
  - `lang`: 'ar' or 'en'
  - `short`: true for short name, false for full name

- `getSiteTitle(lang)` - Get site title
  - `lang`: 'ar' or 'en'

- `getSiteDescription(lang)` - Get site description
  - `lang`: 'ar' or 'en'

## Where Configuration is Used

The configuration is currently used in:

1. **app/layout.tsx** - Page metadata and SEO
2. **components/Footer.tsx** - Contact info, social links, school credit
3. **components/HeaderClient.tsx** - Site title and school name in header
4. Any other component that imports from `@/lib/config/site`

## How to Update

1. Open `config/site.json`
2. Update the values you want to change
3. Save the file
4. The changes will automatically reflect across the entire site

## Example: Changing School Name

To change the school name everywhere on the site:

1. Open `config/site.json`
2. Update the `school.name` field
3. Save the file
4. The new name will appear in:
   - Page titles
   - Footer
   - Header
   - Any other location that uses the school name

No need to update multiple files!
