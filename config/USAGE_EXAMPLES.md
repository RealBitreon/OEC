# Configuration Usage Examples

## Example 1: Using in a Page Component

```typescript
import { config } from '@/lib/config/site'

export default function AboutPage() {
  return (
    <div>
      <h1>عن {config.school.name}</h1>
      <p>{config.site.description}</p>
      <p>للتواصل: {config.contact.email}</p>
    </div>
  )
}
```

## Example 2: Using Helper Functions

```typescript
import { getSchoolName, getSiteTitle } from '@/lib/config/site'

export default function ContactPage() {
  const schoolName = getSchoolName('ar', false) // Full Arabic name
  const siteTitle = getSiteTitle('ar')
  
  return (
    <div>
      <h1>{siteTitle}</h1>
      <p>مرحباً بكم في {schoolName}</p>
    </div>
  )
}
```

## Example 3: Conditional Features

```typescript
import { config } from '@/lib/config/site'

export default function HomePage() {
  return (
    <div>
      {config.features.enableWheel && (
        <section>
          <h2>عجلة الحظ</h2>
          {/* Wheel component */}
        </section>
      )}
      
      {config.features.enableCompetitions && (
        <section>
          <h2>المسابقات</h2>
          {/* Competitions component */}
        </section>
      )}
    </div>
  )
}
```

## Example 4: Dynamic Metadata

```typescript
import { Metadata } from 'next'
import { config, getSiteTitle, getSiteDescription } from '@/lib/config/site'

export const metadata: Metadata = {
  title: getSiteTitle('ar'),
  description: getSiteDescription('ar'),
  openGraph: {
    title: `${getSiteTitle('ar')} - ${config.school.name}`,
    description: getSiteDescription('ar'),
  }
}
```

## Example 5: Social Media Links

```typescript
import { config } from '@/lib/config/site'

export default function SocialLinks() {
  return (
    <div className="flex gap-4">
      {config.social.facebook && (
        <a href={config.social.facebook}>Facebook</a>
      )}
      {config.social.twitter && (
        <a href={config.social.twitter}>Twitter</a>
      )}
      {config.social.instagram && (
        <a href={config.social.instagram}>Instagram</a>
      )}
    </div>
  )
}
```

## Example 6: Contact Information

```typescript
import { config } from '@/lib/config/site'

export default function ContactInfo() {
  return (
    <div>
      <h2>تواصل معنا</h2>
      <p>البريد الإلكتروني: {config.contact.email}</p>
      <p>الهاتف: {config.contact.phone}</p>
      <p>العنوان: {config.contact.address}</p>
    </div>
  )
}
```

## Example 7: Bilingual Support

```typescript
'use client'

import { useState } from 'react'
import { getSchoolName, getSiteTitle } from '@/lib/config/site'

export default function BilingualHeader() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  
  return (
    <header>
      <h1>{getSiteTitle(lang)}</h1>
      <p>{getSchoolName(lang, false)}</p>
      <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
        {lang === 'ar' ? 'English' : 'العربية'}
      </button>
    </header>
  )
}
```

## Quick Reference

### Available Config Objects

- `config.school` - School information
- `config.site` - Site information
- `config.contact` - Contact details
- `config.social` - Social media links
- `config.features` - Feature flags

### Available Helper Functions

- `getSchoolName(lang, short)` - Get school name
- `getSiteTitle(lang)` - Get site title
- `getSiteDescription(lang)` - Get site description

### Language Options

- `'ar'` - Arabic (default)
- `'en'` - English
