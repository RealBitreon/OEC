# JSON-Based Auth System

## Overview
Simple authentication system using JSON files - no database required!

## Features
- Username + Password only (no email)
- Role-based access (CEO, Admin, Manager)
- Role codes for signup
- Session management with cookies
- Dashboard access control

## Setup

1. **Set Role Codes** in `.env`:
```env
CEO_ROLE_CODE=CEO2024
ADMIN_ROLE_CODE=ADMIN2024
MANAGER_ROLE_CODE=MANAGER2024
```

2. **Data Files** (auto-created):
- `data/users.json` - User accounts
- `data/sessions.json` - Active sessions
- `data/competitions.json` - Competitions
- `data/questions.json` - Questions
- `data/submissions.json` - Submissions

## Usage

### Signup
1. Go to `/signup`
2. Enter username (3-30 chars)
3. Enter password (6+ chars)
4. Enter role code (get from admin)
5. Click signup → redirects to `/login`

### Login
1. Go to `/login`
2. Enter username
3. Enter password
4. Click login → redirects to `/dashboard`

### Dashboard Access
Only users with roles: `manager`, `admin`, `ceo` can access dashboard.

## API Routes

- `POST /api/logout` - Logout user
- `GET /api/session` - Get current user session

## File Structure

```
lib/auth/
  json-auth.ts          # Auth functions

data/
  users.json            # User accounts
  sessions.json         # Active sessions
  competitions.json     # Competitions data
  questions.json        # Questions data
  submissions.json      # Submissions data

app/
  login/
    actions.ts          # Login action
  signup/
    actions.ts          # Signup action
  dashboard/
    page.tsx            # Dashboard (protected)
  api/
    logout/route.ts     # Logout endpoint
    session/route.ts    # Session endpoint
```

## Security

- Passwords hashed with SHA-256
- Sessions expire after 7 days
- HTTP-only cookies
- Role-based access control
- Middleware protects dashboard routes

## Default Role Codes

Change these in `.env`:
- CEO: `CEO2024`
- Admin: `ADMIN2024`
- Manager: `MANAGER2024`
