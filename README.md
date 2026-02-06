# 🏆 Omani Encyclopedia Competition Platform

A modern, accessible, and production-ready competition management platform built with Next.js 14, TypeScript, and Supabase. Designed for educational institutions to run knowledge-based competitions with automated scoring, wheel-of-fortune prize draws, and comprehensive admin dashboards.

## ✨ Features

### For Participants
- 📝 **Interactive Question Forms** - Multiple choice, true/false, and text-based questions
- 🎯 **Real-time Validation** - Instant feedback on answers with source verification
- 🎡 **Prize Wheel System** - Automated winner selection with fair distribution
- 📱 **Mobile-First Design** - Optimized for all devices and screen sizes
- ♿ **Fully Accessible** - WCAG AA compliant with screen reader support
- 🌙 **Dark Mode** - Complete dark theme support
- 💾 **Auto-Save** - Never lose your progress with automatic draft saving

### For Administrators
- 📊 **Comprehensive Dashboard** - Real-time statistics and analytics
- 🏅 **Competition Management** - Create, edit, and manage competitions
- ❓ **Question Bank** - Organize questions by competition or training mode
- 👥 **User Management** - Role-based access control (CEO, LRC Manager)
- 📋 **Submission Review** - Manual review and scoring system
- 🎲 **Wheel Configuration** - Customize prize distributions and probabilities
- 📈 **Performance Monitoring** - Track engagement and completion rates
- 🔍 **Audit Logging** - Complete activity tracking for compliance

### Technical Highlights
- ⚡ **Next.js 14 App Router** - Server components and streaming
- 🔒 **Secure Authentication** - Supabase Auth with RLS policies
- 🎨 **Modern UI/UX** - Following Meta and Microsoft design principles
- 📦 **Component Library** - Reusable, accessible components
- 🚀 **Performance Optimized** - Code splitting and lazy loading
- 🧪 **Type Safe** - Full TypeScript coverage
- 📱 **PWA Ready** - Offline support and installable

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account ([sign up free](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/oec-platform.git
cd oec-platform
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Role Codes (CHANGE THESE!)
CEO_ROLE_CODE=your_secure_ceo_code
MANAGER_ROLE_CODE=your_secure_manager_code

# Optional: ReCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

4. **Set up the database**

**📖 See [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) for detailed instructions**

Quick setup:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your dashboard
3. Copy and paste the entire `SUPABASE_SETUP.sql` file
4. Click "Run" and wait 10-30 seconds
5. Done! Your database is production-ready ✅

The setup script includes:
- ✅ All tables with relationships
- ✅ 60+ performance indexes
- ✅ Row Level Security policies
- ✅ Helper functions
- ✅ Triggers and views
- ✅ Initial data

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
oec-platform/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── attempts/             # Attempt tracking
│   │   ├── competition/          # Competition endpoints
│   │   ├── submissions/          # Submission management
│   │   └── wheel/                # Wheel system
│   ├── dashboard/                # Admin dashboard
│   │   ├── components/           # Dashboard components
│   │   ├── actions/              # Server actions
│   │   └── competitions/         # Competition management
│   ├── competition/              # Public competition pages
│   ├── questions/                # Question pages
│   ├── login/                    # Authentication
│   └── signup/                   # User registration
├── components/                   # Shared components
│   ├── ui/                       # UI component library
│   │   ├── Input.tsx             # Form input component
│   │   ├── Button.tsx            # Button component
│   │   ├── Modal.tsx             # Modal component
│   │   ├── Table.tsx             # Table component
│   │   ├── Breadcrumb.tsx        # Navigation breadcrumb
│   │   ├── ConfirmDialog.tsx     # Confirmation dialog
│   │   ├── Pagination.tsx        # Pagination component
│   │   ├── LoadingState.tsx      # Loading indicator
│   │   └── ErrorState.tsx        # Error display
│   └── icons/                    # Icon components
├── lib/                          # Utilities and helpers
│   ├── auth/                     # Authentication utilities
│   ├── hooks/                    # Custom React hooks
│   ├── repos/                    # Data repositories
│   ├── supabase/                 # Supabase clients
│   └── utils/                    # Helper functions
├── Docs/                         # Documentation
│   └── SQL/                      # Database scripts
├── public/                       # Static assets
└── certificates/                 # SSL certificates (local dev)
```

---

## 🔐 Security & Environment Variables

### Critical Security Notes

⚠️ **NEVER commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys or secrets

✅ **Always commit:**
- `.env.example` (with placeholder values)
- `.gitignore` (properly configured)

### Environment Variables Explained

#### Required Variables

```env
# Supabase - Get from https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (KEEP SECRET!)

# App Configuration
NEXT_PUBLIC_APP_URL=               # Your app URL (production domain)

# Admin Access Codes (CHANGE THESE!)
CEO_ROLE_CODE=                     # Code for CEO role signup
MANAGER_ROLE_CODE=                 # Code for Manager role signup
```

#### Optional Variables

```env
# ReCAPTCHA (recommended for production)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=    # Google ReCAPTCHA site key
```

### Generating Secure Role Codes

```bash
# Generate random secure codes
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🗄️ Database Setup

**📖 Complete guide: [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)**

### Quick Setup (5 Minutes)

1. Create Supabase project
2. Run `SUPABASE_SETUP.sql` in SQL Editor
3. Get your API credentials
4. Update `.env` file
5. Create admin user
6. Done! 🎉

### Schema Overview

The platform uses PostgreSQL (via Supabase) with 11 tables:

- **users** - User accounts and roles
- **user_sessions** - Active sessions
- **competitions** - Competition definitions
- **questions** - Question bank (with training mode)
- **submissions** - Participant submissions
- **wheel_runs** - Prize wheel draws
- **wheel_spins** - Individual spins
- **wheel_prizes** - Prize configuration
- **attempt_tracking** - Attempt limits per device
- **audit_logs** - System activity logs
- **system_settings** - Application settings

### Security Features

✅ **Row Level Security (RLS)** on all tables
✅ **Role-based access** (CEO, LRC_MANAGER, user)
✅ **Secure functions** with proper permissions
✅ **Device fingerprinting** for attempt tracking
✅ **Audit logging** for compliance

### Performance Features

⚡ **60+ optimized indexes** for fast queries
⚡ **Automatic timestamp updates**
⚡ **Query statistics** pre-analyzed
⚡ **Connection pooling** via Supabase

---

## 🎨 UI/UX Components

### Component Library

All components follow Meta and Microsoft design principles:

#### Form Components
- **Input** - Text inputs with validation, icons, and error states
- **Button** - Multiple variants (primary, outline, danger, ghost)
- **Select** - Dropdown selections
- **Checkbox** - Checkboxes with labels
- **Textarea** - Multi-line text input

#### Feedback Components
- **LoadingState** - Consistent loading indicators
- **ErrorState** - Error displays with retry
- **Toast** - Notification system
- **ConfirmDialog** - Confirmation dialogs

#### Navigation Components
- **Breadcrumb** - Navigation context
- **Pagination** - Page navigation
- **Tabs** - Tab navigation

#### Data Display
- **Table** - Responsive data tables
- **Card** - Content cards
- **Badge** - Status badges
- **Modal** - Dialog modals

### Accessibility Features

- ✅ WCAG AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus management
- ✅ Color contrast ratios

### Responsive Design

- 📱 Mobile-first approach
- 💻 Tablet optimized
- 🖥️ Desktop enhanced
- 🎯 Touch-friendly (44px minimum targets)

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Add environment variables
- Deploy

3. **Configure Environment Variables**

Add all variables from `.env.example` in Vercel dashboard.

### Other Platforms

The app can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted (Docker)

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### Manual Testing Checklist

- [ ] User signup with role code
- [ ] User login
- [ ] Competition participation
- [ ] Question answering
- [ ] Submission review
- [ ] Wheel spinning
- [ ] Mobile responsiveness
- [ ] Dark mode
- [ ] Accessibility (keyboard navigation)

---

## 📊 Performance

### Optimization Features

- ⚡ Server-side rendering (SSR)
- 🔄 Incremental static regeneration (ISR)
- 📦 Code splitting
- 🖼️ Image optimization
- 💾 React Query caching
- 🎯 Lazy loading

### Performance Metrics

Target metrics:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(dashboard): add competition analytics

- Add charts for submission trends
- Add export functionality
- Improve loading states

Closes #123
```

---

## 📝 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License** with additional commercial use restrictions.

### Key Points:

✅ **You CAN:**
- Use for personal, educational, or non-profit purposes
- Modify and distribute the code
- Use for your school or organization (free)
- Learn from and contribute to the project

❌ **You CANNOT:**
- Sell the software without substantial modifications (40%+ changes)
- Offer as a paid service without substantial modifications
- Remove attribution or copyright notices
- Use commercially without making significant changes

### Commercial Use

If you want to use this software commercially, you must either:
1. Make **substantial modifications** (40%+ of codebase) and provide attribution
2. Contact us for a commercial license

See the [LICENSE](LICENSE) file for complete terms and conditions.

### Why This License?

This license protects the open-source nature of the project while preventing direct commercial exploitation. It encourages:
- Learning and education
- Community contributions
- Innovation through substantial modifications
- Fair use of open-source work

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Design principles from Meta and Microsoft

---

## 📞 Support

### Documentation

- Check the code comments for inline documentation
- Review component examples in the codebase
- See SQL scripts in `Docs/SQL/` for database setup

### Issues

If you encounter any issues:
1. Check existing GitHub issues
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details

### Community

- GitHub Discussions for questions
- GitHub Issues for bugs
- Pull Requests for contributions

---

## 🗺️ Roadmap

### Planned Features

- [ ] Multi-language support (Arabic, English)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] SMS integration
- [ ] Certificate generation
- [ ] Leaderboard system
- [ ] Team competitions
- [ ] API documentation
- [ ] Mobile app (React Native)

---

## 📈 Project Status

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Last Updated**: February 6, 2026

---

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

### Security Features

- ✅ Row Level Security (RLS)
- ✅ Environment variable protection
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection prevention
- ✅ Rate limiting
- ✅ Secure authentication

---

## 💡 Tips & Best Practices

### For Developers

1. **Always use TypeScript** - Type safety prevents bugs
2. **Follow component patterns** - Reuse existing components
3. **Test accessibility** - Use keyboard navigation
4. **Optimize images** - Use Next.js Image component
5. **Cache wisely** - Use React Query for data fetching

### For Administrators

1. **Change default role codes** - Use secure random strings
2. **Regular backups** - Export database regularly
3. **Monitor performance** - Check Vercel analytics
4. **Review submissions** - Ensure fair competition
5. **Update dependencies** - Keep packages up to date

---

## 🎯 Quick Links

- [Documentation](https://github.com/yourusername/oec-platform/wiki)
- [Issue Tracker](https://github.com/yourusername/oec-platform/issues)
- [Changelog](https://github.com/yourusername/oec-platform/releases)

---

**Made with ❤️ for educational institutions**

**Built by developers, for developers**

**Open source and proud** 🚀
