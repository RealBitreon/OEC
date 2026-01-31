# Omani Encyclopedia Competition Platform

A Next.js application for managing educational competitions with questions, submissions, and prize wheel functionality.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Cookie-based auth with Supabase
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Project Structure

```
app/
├── dashboard/          # Admin dashboard
│   ├── actions/       # Server actions
│   ├── components/    # Dashboard UI components
│   ├── core/          # Types, validation, permissions
│   ├── data/          # Data layer (DB queries)
│   └── lib/           # Dashboard utilities
├── competition/       # Competition pages
├── questions/         # Question browsing
├── login/            # Authentication
└── signup/           # User registration

components/           # Shared UI components
lib/                 # Core utilities
├── auth/            # Auth helpers
├── supabase/        # Supabase clients
└── ui/              # Design tokens
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`)

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Database Setup

Run the SQL setup file in your Supabase project:
```bash
supabase_complete_setup.sql
```

## Key Features

- Role-based dashboard (CEO, LRC_MANAGER)
- Competition management
- Question bank with training mode
- Submission review system
- Ticket allocation
- Prize wheel
- Arabic RTL support

## Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clear Next.js cache
