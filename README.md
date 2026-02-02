# Competition Platform

## About This Project

This project was created by **Youssef Mohamed Sobh** as a school-grade project and first published in **2026**.

### The Story Behind This Project

This competition platform was developed as an educational initiative to demonstrate modern web development practices while creating a real-world application that engages students through interactive quizzes and competitions. The project showcases the integration of contemporary technologies and best practices in building a full-stack web application.

The platform was designed to make learning more engaging by gamifying the educational experience through timed competitions, instant feedback, and a reward system that motivates participants to improve their knowledge.

---

## For Developers

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

### Project Structure

```
├── app/                    # Next.js app directory (routes & pages)
│   ├── api/               # API routes
│   ├── competition/       # Competition pages
│   ├── questions/         # Question management
│   ├── wheel/             # Prize wheel feature
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                   # Core libraries
│   ├── auth/             # Authentication logic
│   ├── repos/            # Data repositories
│   ├── supabase/         # Supabase client setup
│   └── utils/            # Utility functions
├── config/               # Configuration files
└── public/               # Static assets
```

### Getting Started

#### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

#### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Set up the database:
   - Run the SQL schema from `Docs/SQL/COMPLETE_DATABASE_SCHEMA.sql` in your Supabase SQL editor
   - This will create all necessary tables and relationships

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Key Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Competition System**: Timed quizzes with multiple-choice questions
- **Training Mode**: Practice questions without time limits
- **Prize Wheel**: Gamified reward system for winners
- **Admin Panel**: Competition management and winner selection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live competition stats and countdowns
- **Attempt Tracking**: Device fingerprinting to prevent abuse

### Database Schema

The application uses the following main tables:

- `users` - User accounts and profiles
- `competitions` - Competition definitions and settings
- `questions` - Question bank with answers
- `submissions` - User answers and scores
- `tickets` - Prize wheel entries
- `audit_logs` - System activity tracking

See `Docs/SQL/COMPLETE_DATABASE_SCHEMA.sql` for the complete schema.

### API Routes

#### Public Routes
- `GET /api/competitions/active` - Get active competitions
- `GET /api/competitions/archived` - Get past competitions
- `POST /api/training/submit` - Submit training answers
- `GET /api/wheel/public` - Get wheel configuration

#### Protected Routes
- `POST /api/competition/submit` - Submit competition answers
- `POST /api/attempts/increment` - Track participation attempts
- `GET /api/session` - Get current user session
- `POST /api/submissions/mark-winner` - Admin: Select winners

### Development Guidelines

#### Code Style
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use server components by default, client components when needed
- Keep components small and focused
- Use the repository pattern for data access

#### Component Organization
- Place reusable UI components in `components/ui/`
- Keep page-specific components in the same directory as the page
- Export components from index files for cleaner imports

#### State Management
- Use React hooks for local state
- Use Supabase real-time subscriptions for live data
- Implement optimistic updates where appropriate

#### Error Handling
- Use try-catch blocks in API routes
- Return appropriate HTTP status codes
- Log errors for debugging
- Show user-friendly error messages

### Environment Variables

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Your site URL (for redirects)

Optional variables:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret key

### Building for Production

```bash
npm run build
npm start
```

### Deployment

The application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Testing

Run the development server and test features:
- User registration and login
- Competition participation
- Question answering
- Prize wheel spinning
- Admin functions

### Troubleshooting

**Database Connection Issues**
- Verify Supabase credentials in `.env.local`
- Check if database schema is properly set up
- Ensure RLS policies are configured correctly

**Authentication Problems**
- Clear browser cookies and local storage
- Verify Supabase Auth is enabled
- Check redirect URLs in Supabase dashboard

**Build Errors**
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check for TypeScript errors with `npm run build`

### Contributing

This is an educational project. If you'd like to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### License

This project is created for educational purposes.

### Contact

Created by Youssef Mohamed Sobh - 2026

---

**Note**: This is a school project demonstrating full-stack web development capabilities with modern technologies.
