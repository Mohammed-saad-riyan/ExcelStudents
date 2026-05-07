# Excel Academy - Project Wiki

> **Last Updated:** May 7, 2026
> **Version:** 1.2.0
> **Maintainer:** Excel Academy Development Team

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication System](#5-authentication-system)
6. [API Reference](#6-api-reference)
7. [Features](#7-features)
8. [UI Components](#8-ui-components)
9. [Environment Variables](#9-environment-variables)
10. [Deployment](#10-deployment)
11. [Changelog](#11-changelog)

---

## 1. Project Overview

**Excel Academy** is a comprehensive Student Learning Management System (LMS) built for teacher training institutes. It provides a digital platform for managing students, courses, exams, assignments, and learning materials.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| Student Portal | Dashboard, exams, assignments, notes, progress tracking |
| Admin Panel | Student approval, exam/assignment management, analytics |
| Course Management | Multiple teacher training programs |
| Assessment System | On-platform timed exams (90 min) + Google Forms quizzes |
| Progress Tracking | Attendance, grades, completion statistics |

### Supported Courses

1. **PPTTC** - Pre & Primary Teachers Training
2. **Montessori** - Montessori Teacher Training
3. **ECCE** - Early Childhood Care & Education
4. **D.El.Ed** - Diploma in Elementary Education
5. **DSEN** - Diploma in Special Educational Needs
6. **Communicative English** - English Communication Program

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.1 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.38.0 | Animations |
| Lucide React | 1.6.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | - | Serverless API endpoints |
| NextAuth.js | 4.24.13 | Authentication |
| Supabase | - | PostgreSQL database + file storage |
| bcryptjs | 3.0.3 | Password hashing |

### Development
| Tool | Purpose |
|------|---------|
| ESLint 9 | Code linting |
| PostCSS | CSS processing |
| TypeScript | Type checking |

---

## 3. Project Structure

```
excel_academy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   │   ├── register/             # Student registration
│   │   │   ├── exams/                # Exam endpoints
│   │   │   ├── assignments/          # Assignment endpoints
│   │   │   ├── notes/                # Class notes endpoints
│   │   │   ├── materials/            # Course materials
│   │   │   ├── progress/             # Progress data
│   │   │   ├── feedback/             # Feedback submission
│   │   │   ├── upload/               # File uploads
│   │   │   ├── admin/                # Admin-only endpoints
│   │   │   │   ├── students/         # Student management
│   │   │   │   ├── exams/            # Exam management
│   │   │   │   ├── assignments/      # Assignment management
│   │   │   │   ├── notes/            # Notes management
│   │   │   │   └── enrollments/      # Enrollment management
│   │   │   ├── seed/                 # Database seeding
│   │   │   └── setup/                # Initial setup
│   │   │
│   │   ├── (auth)/                   # Auth pages group
│   │   │   ├── login/                # Login page
│   │   │   └── register/             # Registration page
│   │   │
│   │   ├── (student)/                # Student pages
│   │   │   ├── dashboard/            # Student dashboard
│   │   │   ├── exams/                # Exam list & taking
│   │   │   ├── assignments/          # Assignment submission
│   │   │   ├── notes/                # Class notes viewer
│   │   │   ├── materials/            # Course materials
│   │   │   ├── progress/             # Progress tracking
│   │   │   └── feedback/             # Feedback form
│   │   │
│   │   ├── admin/                    # Admin pages
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── students/             # Student management
│   │   │   ├── exams/                # Exam management
│   │   │   ├── assignments/          # Assignment management
│   │   │   └── notes/                # Notes management
│   │   │
│   │   ├── home/                     # Landing page content
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Welcome/landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # Shared components
│   │   ├── SessionProvider.tsx       # NextAuth session wrapper
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   ├── Footer.tsx                # Footer component
│   │   └── LayoutWrapper.tsx         # Conditional layout
│   │
│   └── lib/                          # Utilities
│       ├── auth.ts                   # NextAuth configuration
│       └── supabase.ts               # Supabase client & types
│
├── public/                           # Static assets
├── supabase-schema.sql               # Database schema
├── package.json                      # Dependencies
├── next.config.ts                    # Next.js config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── CLAUDE.md                         # AI assistant instructions
├── AGENTS.md                         # Agent rules
└── WIKI.md                           # This file
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │────<│ enrollments │>────│   courses   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │     ┌──────────────────────────────────┤
      │     │                                  │
      ▼     ▼                                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│exam_attempts│────>│    exams    │<────│ class_notes │
└─────────────┘     └─────────────┘     └─────────────┘
      │
      │
┌─────────────┐     ┌─────────────────────┐
│ attendance  │────>│   class_sessions    │
└─────────────┘     └─────────────────────┘
      │
      │
┌─────────────┐     ┌─────────────────────┐
│  feedback   │     │assignment_submissions│
└─────────────┘     └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │    assignments      │
                    └─────────────────────┘
```

### Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Hashed password |
| role | VARCHAR(50) | 'student' or 'admin' |
| phone | VARCHAR(20) | Contact number |
| avatar | TEXT | Profile image URL |
| course_interested | VARCHAR(100) | Selected course |
| approved | BOOLEAN | Admin approval status |
| created_at | TIMESTAMP | Registration date |
| updated_at | TIMESTAMP | Last update |

#### `courses`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Course name |
| description | TEXT | Course details |
| duration | VARCHAR(50) | Course length |
| price | DECIMAL(10,2) | Course fee |
| image | TEXT | Course image URL |
| features | JSONB | Course features array |
| created_at | TIMESTAMP | Creation date |

#### `exams`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Exam name |
| description | TEXT | Exam details |
| course_id | UUID | FK to courses |
| type | VARCHAR(20) | 'mcq', 'final', or 'on_platform' |
| exam_type | VARCHAR(20) | 'google_form' or 'on_platform' |
| duration | INTEGER | Duration in minutes (90 for finals) |
| total_marks | INTEGER | Maximum marks |
| passing_marks | INTEGER | Minimum to pass |
| questions | JSONB | MCQ questions array |
| sections | JSONB | Exam sections (MCQ, Fill-blanks, Short, Long) |
| instructions | TEXT | Exam instructions |
| form_url | TEXT | Google Forms URL |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Creation date |

#### `exam_access` (NEW)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| exam_id | UUID | FK to exams |
| user_id | UUID | FK to users |
| granted_at | TIMESTAMP | Access grant date |
| granted_by | UUID | FK to admin user |

#### `exam_attempts`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| exam_id | UUID | FK to exams |
| answers | JSONB | Student answers |
| score | INTEGER | Achieved score |
| total_marks | INTEGER | Maximum marks |
| passed | BOOLEAN | Pass/fail status |
| status | VARCHAR(20) | 'in_progress', 'submitted', 'graded' |
| section_scores | JSONB | Per-section scores |
| feedback | TEXT | Admin feedback |
| graded_at | TIMESTAMP | Grading timestamp |
| graded_by | UUID | FK to admin user |
| started_at | TIMESTAMP | Start time |
| completed_at | TIMESTAMP | Completion time |

#### `assignments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Assignment name |
| description | TEXT | Instructions |
| course_id | UUID | FK to courses |
| due_date | TIMESTAMP | Deadline |
| total_marks | INTEGER | Maximum marks |
| attachments | JSONB | File attachments |
| created_at | TIMESTAMP | Creation date |

#### `assignment_submissions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| assignment_id | UUID | FK to assignments |
| content | TEXT | Submission text |
| attachments | JSONB | Uploaded files |
| marks | INTEGER | Awarded marks |
| feedback | TEXT | Instructor comments |
| status | VARCHAR(20) | pending/submitted/graded |
| submitted_at | TIMESTAMP | Submission time |

#### `class_sessions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| course_id | UUID | FK to courses |
| title | VARCHAR(255) | Session name |
| date | DATE | Session date |
| duration | INTEGER | Duration in minutes |
| created_at | TIMESTAMP | Creation date |

#### `attendance`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| session_id | UUID | FK to class_sessions |
| present | BOOLEAN | Attendance status |
| created_at | TIMESTAMP | Record date |

#### `enrollments`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| course_id | UUID | FK to courses |
| enrolled_at | TIMESTAMP | Enrollment date |

#### `class_notes`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| course_id | UUID | FK to courses |
| title | VARCHAR(255) | Note title |
| content | TEXT | Note content |
| pdf_url | TEXT | PDF download URL |
| pdf_name | VARCHAR(255) | PDF filename |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

#### `feedback`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| subject | VARCHAR(255) | Feedback subject |
| message | TEXT | Feedback content |
| rating | INTEGER | 1-5 stars |
| category | VARCHAR(50) | Feedback type |
| created_at | TIMESTAMP | Submission date |

---

## 5. Authentication System

### Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Register   │────>│   Pending   │────>│  Approved   │
│   Student   │     │   Approval  │     │   Student   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │                    ▼
                          │            ┌─────────────┐
                          │            │    Login    │
                          │            └─────────────┘
                          │                    │
                          ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Rejected   │     │   Session   │
                    └─────────────┘     │  (JWT)      │
                                        └─────────────┘
```

### Configuration

- **Provider:** Credentials (email/password)
- **Session Strategy:** JWT tokens
- **Password Hashing:** bcryptjs (12 salt rounds)
- **Approval Workflow:** Required for students
- **Role-based Access:** `student` | `admin`

### Protected Routes

| Route Pattern | Required Role |
|---------------|---------------|
| `/dashboard/*` | student |
| `/exams/*` | student |
| `/assignments/*` | student |
| `/notes/*` | student |
| `/admin/*` | admin |
| `/api/admin/*` | admin |

---

## 6. API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/register` | Register new student |

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List available exams (with access status) |
| POST | `/api/exams` | Submit exam answers |
| GET | `/api/exam/[examId]` | Get exam details & check access |
| POST | `/api/exam/[examId]` | Start exam, save progress, or submit |
| GET | `/api/assignments` | List student assignments |
| POST | `/api/assignments` | Submit assignment |
| GET | `/api/notes` | Get class notes (supports `?course=` filter) |
| GET | `/api/materials` | Get course materials |
| GET | `/api/progress` | Get progress statistics |
| POST | `/api/feedback` | Submit feedback |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/students` | List students (`?filter=pending\|approved\|all`) |
| PATCH | `/api/admin/students` | Approve/reject student |
| DELETE | `/api/admin/students` | Remove student (`?id=`) |
| GET | `/api/admin/exams` | List all exams |
| GET | `/api/admin/exams/[examId]` | Get single exam details (for editing) |
| POST | `/api/admin/exams` | Create exam (Google Form or on-platform) |
| PATCH | `/api/admin/exams` | Update exam (settings, questions, sections) |
| DELETE | `/api/admin/exams` | Delete exam |
| GET | `/api/admin/exam-access` | List students & access for exam |
| POST | `/api/admin/exam-access` | Grant exam access to students |
| DELETE | `/api/admin/exam-access` | Revoke exam access |
| GET | `/api/admin/exam-submissions` | List exam submissions |
| PATCH | `/api/admin/exam-submissions` | Grade submission |
| GET | `/api/admin/assignments` | List assignments |
| POST | `/api/admin/assignments` | Create assignment |
| PATCH | `/api/admin/assignments` | Update/grade assignment |
| GET | `/api/admin/notes` | List class notes |
| POST | `/api/admin/notes` | Create note |
| PATCH | `/api/admin/notes` | Update note |
| DELETE | `/api/admin/notes` | Delete note (`?id=`) |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF (admin only) |
| GET | `/api/seed` | Seed database |
| POST | `/api/seed-exams` | Seed Pre-Primary & Elementary exams |
| GET | `/api/setup` | Initial admin setup |

---

## 7. Features

### Student Features

#### Dashboard
- Personalized welcome message
- Progress statistics cards (attendance, exams, assignments)
- Quick action navigation
- Course completion progress bar
- Study tips and goals

#### Exams (Enhanced v1.1)
- **On-Platform Final Exams** (NEW)
  - 90-minute timed examinations
  - 4 sections: MCQ, Fill-in-Blanks, Short Answer, Long Answer
  - Auto-save every 30 seconds
  - Auto-submit when time expires
  - View results after grading
- **Google Form Quizzes**
  - Quick assessments via Google Forms
- Course-specific exam visibility
- Access controlled by admin
- View past attempts and scores

#### Assignments
- View all course assignments
- Filter by status (pending/submitted/graded)
- Submit text-based assignments
- View instructor feedback and marks
- Track due dates and overdue items

#### Class Notes
- Browse course-specific notes
- Filter by course
- Download PDF attachments
- Expandable note sections
- View creation dates

#### Progress Tracking
- Attendance percentage
- Exam performance history
- Assignment completion rate
- Visual progress charts

#### Feedback
- Submit course feedback
- Rate courses (1-5 stars)
- Categorize feedback type

### Admin Features

#### Dashboard
- Total student count
- Pending approvals count
- Active students count
- Quick management links

#### Student Management
- View pending registrations
- Approve/reject applications
- Auto-enroll on approval
- Remove students
- View student details

#### Exam Management (Enhanced v1.2)
- **Exam Builder** (NEW in v1.2)
  - Google Forms-like exam creation interface
  - Add questions dynamically (MCQ, Fill-in-Blanks, Short, Long Answer)
  - MCQ: Multiple options with correct answer marking
  - Set marks per question
  - Preview mode before publishing
  - Save as draft or publish immediately
  - Edit existing exams with full question modification
  - Duplicate questions for faster creation
- **On-Platform Timed Exams**
  - Configurable duration (default 90 minutes)
  - Auto-save every 30 seconds
  - Auto-submit when time expires
  - Grant/revoke exam access per enrolled student
  - View all submissions with status
  - Grade submissions with per-question scoring
  - Quick score buttons (0, half, full marks)
  - Provide written feedback to students
- **Google Form Quizzes**
  - Create quizzes with external Google Forms
  - Link/update form URLs
- Toggle exam active/inactive status
- Course-specific exam visibility

#### Assignment Management
- Create assignments with descriptions
- Set due dates and marks
- View all submissions
- Grade with marks and feedback
- Track submission status

#### Notes Management
- Create class notes
- Upload PDF attachments
- Assign to courses
- Edit existing notes
- Delete notes and files

---

## 8. UI Components

### Shared Components

| Component | File | Description |
|-----------|------|-------------|
| SessionProvider | `components/SessionProvider.tsx` | NextAuth session wrapper |
| Sidebar | `components/Sidebar.tsx` | Navigation sidebar (role-aware) |
| Footer | `components/Footer.tsx` | Page footer |
| LayoutWrapper | `components/LayoutWrapper.tsx` | Conditional layout wrapper |

### Design System

- **Primary Color:** `#075aae` (Blue)
- **Secondary Color:** `#0ea5e9` (Sky Blue)
- **Font:** System default
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Responsive:** Mobile, Tablet, Desktop

### UI Patterns

- Loading spinners for async operations
- Skeleton loading states
- Toast-like error messages
- Form validation feedback
- Modal dialogs for confirmations
- Expandable/collapsible sections

---

## 9. Environment Variables

Create a `.env.local` file with:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_ANON_KEY | Yes | Supabase public key |
| SUPABASE_SERVICE_KEY | Yes | Supabase service role key |
| NEXTAUTH_SECRET | Yes | JWT signing secret |
| NEXTAUTH_URL | Yes | Application base URL |

---

## 10. Deployment

### Prerequisites

1. Supabase project with schema applied
2. Environment variables configured
3. Node.js 18+ installed

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Production Deployment

**Vercel (Recommended):**
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

**Manual:**
```bash
npm run build
npm start
```

---

## 11. Changelog

### v1.2.0 (May 7, 2026)
**Major: Exam Builder System**

- **New Admin Features:**
  - **Exam Builder UI** - Google Forms-like exam creation interface
  - Create exams with dynamic question addition
  - 4 question types: MCQ, Fill-in-Blanks, Short Answer, Long Answer
  - MCQ with multiple options and correct answer selection
  - Set marks per question
  - Preview mode before publishing
  - Save as draft or publish immediately
  - Edit existing exams with full question modification
  - Duplicate questions for faster creation

- **New Pages:**
  - `/admin/exams/create` - Exam creation interface
  - `/admin/exams/[examId]/edit` - Edit existing exam

- **New API Endpoints:**
  - `GET /api/admin/exams/[examId]` - Get single exam with full details for editing

- **Updated API:**
  - `POST /api/admin/exams` - Now supports `on_platform` type with sections
  - `PATCH /api/admin/exams` - Now supports updating title, description, duration, sections, instructions

- **UI Improvements:**
  - "Create Exam" button in admin exams page
  - "Edit" and "Access" buttons for on-platform exams
  - Collapsible question cards in builder
  - Question type color coding
  - Live total marks calculation

### v1.1.0 (May 7, 2026)
**Major: On-Platform Exam System**

- **New Database Tables/Columns:**
  - `exam_access` table for admin-controlled exam access grants
  - `exam_attempts` extended with status, graded_at, graded_by, section_scores, feedback
  - `exams` extended with exam_type, sections, instructions

- **New API Endpoints:**
  - `GET/POST/DELETE /api/admin/exam-access` - Admin exam access management
  - `GET/POST /api/exam/[examId]` - Student exam taking (start, save, submit)
  - `GET/PATCH /api/admin/exam-submissions` - Admin grading interface
  - `POST /api/seed-exams` - Seed exam questions from PDFs

- **New Student Features:**
  - On-platform timed exams (90 minutes)
  - Section-based question types: MCQ, Fill-in-Blanks, Short Answer, Long Answer
  - Auto-save every 30 seconds
  - Auto-submit on timer expiry
  - Results view after grading

- **New Admin Features:**
  - Grant/revoke exam access to enrolled students
  - View all exam submissions with status
  - Full grading interface with per-question scoring
  - Quick score buttons (0, half, full marks)
  - Feedback comments for students
  - Seed exams button for initial setup

- **Seeded Exams:**
  - PRE-PRIMARY TEACHER TRAINING (100 marks)
  - ELEMENTARY TEACHER TRAINING (100 marks)

### v1.0.0 (May 7, 2026)
- Initial release
- Student portal with dashboard, exams, assignments, notes
- Admin panel for student/exam/assignment/notes management
- NextAuth authentication with approval workflow
- Supabase database integration
- Responsive design with Tailwind CSS
- PDF upload and download functionality

### Previous Updates
- **f5a323b** - Made website fully responsive
- **464e519** - Fix PDF upload & add course filtering for notes
- **985895d** - Fix: Add explicit NEXTAUTH_SECRET to auth config
- **0ca4f23** - Fix: Handle missing env vars during Vercel build
- **83af9eb** - Excel Academy Student Portal - Initial commit

---

## Contributing

When adding new features, please update this wiki:

1. Add feature to relevant section
2. Update API reference if endpoints added
3. Update database schema if tables modified
4. Add to changelog with date and description
5. Update version number if significant

---

## Support

For issues or questions:
- Check the codebase at `/Users/mohammedriyan/Downloads/excel_academy`
- Review API routes in `src/app/api/`
- Check database schema in `supabase-schema.sql`
