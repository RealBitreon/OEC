# Emoji to Icon Replacement Guide

## Common Emoji Mappings

| Emoji | Lucide Icon | Usage |
|-------|-------------|-------|
| 📞 | Phone | Contact, phone numbers |
| 📱 | Smartphone | Mobile contact |
| 📍 | MapPin | Location, address |
| 📧 | Mail | Email |
| 💬 | MessageCircle | Chat, messages |
| 🏫 | School | School building |
| 👨‍💼 | Briefcase | Principal, admin |
| 👨‍🏫 | GraduationCap | Teacher |
| 💻 | Code | Developer |
| 📚 | BookOpen | Books, library |
| 📝 | FileText | Writing, forms |
| ✅ | CheckCircle2 | Success, correct |
| ❌ | XCircle | Error, wrong |
| ⚠️ | AlertTriangle | Warning |
| 💡 | Lightbulb | Idea, tip |
| 🎯 | Target | Goal, target |
| 🏆 | Trophy | Winner, prize |
| 🎓 | GraduationCap | Education |
| ⏳ | Clock | Waiting, time |
| 🔒 | Lock | Locked, secure |
| 📅 | Calendar | Date, schedule |
| 🎲 | Dices | Random, wheel |
| ▶️ | Play | Play button |
| ⏸️ | Pause | Pause button |
| 🎩 | Sparkles | Magic, special |
| 📌 | Pin | Important, pinned |
| 🎁 | Gift | Prize, reward |
| ❓ | HelpCircle | Question, help |
| 🔍 | Search | Search |
| 📊 | BarChart3 | Statistics |
| ⚖️ | Scale | Justice, balance |
| 🌟 | Star | Featured, favorite |
| ⚡ | Zap | Fast, energy |

## Icon Component Usage

```tsx
import Icons from '@/components/icons'

// Basic usage
<Icons.phone className="w-6 h-6 text-primary" />

// With custom size
<Icons.trophy className="w-12 h-12" size={48} />

// With custom stroke
<Icons.check className="w-5 h-5" strokeWidth={2.5} />
```

## Replacement Pattern

### Before (Emoji):
```tsx
<span className="text-4xl">📞</span>
```

### After (Icon):
```tsx
<Icons.phone className="w-10 h-10 text-primary" />
```

## Size Mapping

| Emoji Size | Icon Size Class | Pixels |
|------------|-----------------|--------|
| text-xl | w-5 h-5 | 20px |
| text-2xl | w-6 h-6 | 24px |
| text-3xl | w-8 h-8 | 32px |
| text-4xl | w-10 h-10 | 40px |
| text-5xl | w-12 h-12 | 48px |
| text-6xl | w-16 h-16 | 64px |
| text-7xl | w-20 h-20 | 80px |
| text-8xl | w-24 h-24 | 96px |
