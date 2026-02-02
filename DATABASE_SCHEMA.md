# Database Schema Documentation

## Overview
- **Total Tables**: 11
- **Total Views**: 0
- **Total Functions**: 18
- **Total Indexes**: 62
- **Total Triggers**: 7

---

## Tables

### 1. users
User accounts and profiles
- `id` (uuid) - Primary key
- `username` (text)
- `email` (text)
- `role` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `auth_id` (uuid)
- `phone` (text)
- `bio` (text)
- `display_name` (text)
- `avatar_url` (text)
- `theme` (text)
- `language` (text)
- `font_size` (text)
- `compact_mode` (bool)
- `notification_settings` (jsonb)
- `last_password_change` (timestamptz)

### 2. user_sessions
Active user sessions for tracking
- `id` (uuid) - Primary key
- `user_id` (uuid)
- `device_info` (jsonb)
- `ip_address` (text)
- `user_agent` (text)
- `last_active` (timestamptz)
- `created_at` (timestamptz)
- `expires_at` (timestamptz)

### 3. competitions
Competition/contest definitions
- `id` (uuid) - Primary key
- `title` (text)
- `slug` (text)
- `description` (text)
- `status` (text)
- `start_at` (date)
- `end_at` (date)
- `wheel_at` (date)
- `rules` (jsonb)
- `created_by` (uuid)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `max_attempts` (int4)
- `winner_count` (int4)

### 4. questions
Questions for competitions
- `id` (uuid) - Primary key
- `competition_id` (uuid)
- `is_training` (bool)
- `type` (text)
- `category` (text)
- `difficulty` (text)
- `question_text` (text)
- `options` (jsonb)
- `correct_answer` (text)
- `volume` (text)
- `page` (text)
- `line_from` (text)
- `line_to` (text)
- `is_active` (bool)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `status` (text)

### 5. submissions
User competition submissions
- `id` (uuid) - Primary key
- `competition_id` (uuid)
- `participant_name` (text)
- `participant_email` (text)
- `first_name` (text)
- `father_name` (text)
- `family_name` (text)
- `grade` (text)
- `answers` (jsonb)
- `proofs` (jsonb)
- `score` (int4)
- `total_questions` (int4)
- `tickets_earned` (int4)
- `status` (text)
- `submitted_at` (timestamptz)
- `reviewed_at` (timestamptz)
- `reviewed_by` (uuid)
- `review_notes` (text)
- `retry_allowed` (bool)
- `is_retry` (bool)
- `previous_submission_id` (uuid)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `is_winner` (bool)
- `is_correct` (bool)

### 6. attempt_tracking
Track user attempts per competition
- `id` (uuid) - Primary key
- `competition_id` (uuid)
- `device_fingerprint` (text)
- `user_id` (uuid)
- `attempt_count` (int4)
- `last_attempt_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 7. wheel_runs
Wheel spin sessions/runs
- `id` (uuid) - Primary key
- `competition_id` (uuid)
- `winner_count` (int4)
- `status` (text)
- `candidates_snapshot` (jsonb)
- `locked_snapshot` (jsonb)
- `total_tickets` (int4)
- `winners` (jsonb)
- `draw_metadata` (jsonb)
- `announcement_message` (text)
- `is_published` (bool)
- `show_winner_names` (bool)
- `locked_at` (timestamptz)
- `run_at` (timestamptz)
- `published_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 8. wheel_spins
Individual wheel spin results
- `id` (uuid) - Primary key
- `competition_id` (uuid)
- `submission_id` (uuid)
- `participant_name` (text)
- `prize_id` (uuid)
- `prize_name` (text)
- `spun_at` (timestamptz)
- `created_at` (timestamptz)

### 9. wheel_prizes
Available prizes for wheel
- `id` (uuid) - Primary key
- `competition_id` (uuid)
- `name` (text)
- `description` (text)
- `quantity` (int4)
- `remaining` (int4)
- `probability` (numeric)
- `color` (text)
- `is_active` (bool)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 10. audit_logs
System audit trail
- `id` (uuid) - Primary key
- `user_id` (uuid)
- `action` (text)
- `entity_type` (text)
- `entity_id` (uuid)
- `details` (jsonb)
- `ip_address` (text)
- `user_agent` (text)
- `created_at` (timestamptz)

### 11. system_settings
Application configuration
- `id` (uuid) - Primary key
- `key` (text)
- `value` (jsonb)
- `updated_by` (uuid)
- `updated_at` (timestamptz)

---

## Key Relationships

### User Management
- `users` ← `user_sessions` (user_id)
- `users` ← `audit_logs` (user_id)
- `users` ← `competitions` (created_by)
- `users` ← `submissions` (reviewed_by)

### Competition Flow
- `competitions` ← `questions` (competition_id)
- `competitions` ← `submissions` (competition_id)
- `competitions` ← `attempt_tracking` (competition_id)
- `competitions` ← `wheel_runs` (competition_id)
- `competitions` ← `wheel_spins` (competition_id)
- `competitions` ← `wheel_prizes` (competition_id)

### Submission & Wheel
- `submissions` ← `wheel_spins` (submission_id)
- `wheel_prizes` ← `wheel_spins` (prize_id)

### Retry Logic
- `submissions` ← `submissions` (previous_submission_id) - Self-referencing for retries

---

## Notable Features

### Authentication & Sessions
- Uses Supabase Auth (`auth_id` in users table)
- Session tracking with device fingerprinting
- IP address and user agent logging

### Competition System
- Support for training questions (`is_training` flag)
- Attempt limiting per device/user
- Winner selection with configurable count
- Retry mechanism for submissions

### Wheel System
- Prize probability management
- Snapshot-based winner selection (locked candidates)
- Publishing workflow for results
- Configurable winner name visibility

### Audit & Security
- Comprehensive audit logging
- Device fingerprinting for attempt tracking
- Session expiration management
- Role-based access control

### Data Types
- JSONB for flexible data (answers, proofs, settings, metadata)
- Timestamptz for timezone-aware timestamps
- UUID for all primary keys
- Numeric for precise probability calculations

---

## Status Values

### Competitions
- Status field tracks competition lifecycle

### Submissions
- `status` field for review workflow
- `is_winner` flag for winner marking
- `retry_allowed` for retry eligibility

### Wheel Runs
- `status` field for run state
- `is_published` for public visibility

---

## Indexes & Performance
- 62 total indexes across all tables
- Likely indexed on foreign keys, status fields, and timestamp columns

## Functions & Triggers
- 18 database functions
- 7 triggers (likely for updated_at timestamps and audit logging)
