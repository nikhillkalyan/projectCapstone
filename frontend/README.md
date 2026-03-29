# 🚀 Ed Tech LMS — Production-Grade Learning Management System

## A full-featured Learning Management System built with React + Vite + Material UI

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure Environment Variables
cp .env.example .env
# Open .env and add your VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET

# 3. Start dev server
npm run dev

# 4. Open http://localhost:5173
```

---

## ☁️ Cloudinary Configuration

To allow instructor certificate uploads locally, you need a free Cloudinary account:
1. Create an account at [Cloudinary](https://cloudinary.com).
2. Get your **Cloud Name** from the dashboard.
3. Go to Settings -> Upload -> **Upload Presets** and click "Add upload preset".
4. Set the preset strictly to **Unsigned**.
5. Save and add both your Cloud Name and Upload Preset to your `.env` file referencing the given names in `.env.example`.

---

## 🔑 Demo Credentials

### Student Account

- **Email**: `arjun@student.com`
- **Password**: `password123`

### Instructor Account

- **Email**: `ramesh@instructor.com`
- **Password**: `password123`

---

## 📁 Project Structure

```
├── README.md
├── src
│   ├── App.jsx
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── layout
│   │   │   ├── InstructorSidebar.jsx
│   │   │   └── StudentSidebar.jsx
│   │   └── shared
│   │       ├── Assessment.jsx
│   │       ├── ChatWindow.jsx
│   │       └── CourseCard.jsx
│   ├── context
│   │   ├── AppContext.jsx
│   │   └── AuthContext.jsx
│   ├── data
│   │   └── mockDatabase.js
│   ├── index.css
│   ├── lib
│   │   └── utils.js
│   ├── main.jsx
│   ├── pages
│   │   ├── auth
│   │   │   ├── InstructorLogin.jsx
│   │   │   ├── InstructorSignup.jsx
│   │   │   ├── StudentLogin.jsx
│   │   │   ├── StudentSignup.jsx
│   │   │   └── _AuthPages.jsx
│   │   ├── instructor
│   │   │   ├── CreateCourse.jsx
│   │   │   ├── InstructorChat.jsx
│   │   │   ├── InstructorCourses.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── InstructorProfile.jsx
│   │   │   ├── ManageCourse.jsx
│   │   │   └── StudentProgress.jsx
│   │   ├── LandingPage.jsx
│   │   └── student
│   │       ├── Certificate.jsx
│   │       ├── CoursePlayer.jsx
│   │       ├── EnrolledCourses.jsx
│   │       ├── ExploreCourses.jsx
│   │       ├── FavoriteCourses.jsx
│   │       ├── StudentChat.jsx
│   │       ├── StudentDashboard.jsx
│   │       └── StudentProfile.jsx
│   └── theme.js
├── tailwind.config.js
└── vite.config.js
```

---

## ✅ Features Implemented

### Student

- [x] Multi-step signup with interest selection (AIML, Cloud, DataScience, Cybersecurity)
- [x] Interest-based personalized course recommendations
- [x] Netflix-style course cards with hover effects
- [x] Course search + filter by category/level/sort
- [x] Course Player with video (YouTube embed) + text/markdown content
- [x] Per-chapter assessments with question navigator
- [x] Mark chapter as complete
- [x] Chapter-by-chapter progress tracking
- [x] Grand Assessment (final test) with pass/fail
- [x] Downloadable certificate on course completion (browser print)
- [x] Post-course rating & review
- [x] Add/remove favorites
- [x] Enroll in courses
- [x] View enrolled courses with progress
- [x] Chat with course instructor
- [x] Profile editing

### Instructor

- [x] Multi-step signup with qualifications
- [x] Dashboard with stats (students, rating, reviews)
- [x] 3-step course creator (details → chapters+assessments → grand test)
- [x] Full chapter content editor (video URL + markdown text)
- [x] Per-chapter assessment builder with correct answer marking
- [x] Grand assessment builder
- [x] Manage course: see enrolled students, progress per chapter
- [x] Student progress table with per-chapter scores
- [x] Chat with enrolled students
- [x] Read student reviews

### Shared

- [x] Glass morphism UI throughout
- [x] Smooth animations (fadeInUp, scaleIn, float, pulse-glow)
- [x] Auth context with localStorage persistence
- [x] Mock database (no backend needed — swap in real API later)

---

## 🔮 Future Work (as per spec)

- [ ] **Admin Panel**: Dashboard, complaint resolution, instructor verification
- [ ] **Instructor certificate upload**: Legitimacy verification
- [ ] **Admin approval workflow**: Before instructor can publish courses
- [ ] **Real backend**: Replace `mockDatabase.js` with actual REST/GraphQL API
- [ ] **Real database**: PostgreSQL / MongoDB / Supabase

---

## 🛠 Tech Stack

- **React 18** + Vite
- **React Router v6** (client-side routing)
- **Tailwind CSS v3** (utility classes)
- **Lucide React** (icons)
- **Google Fonts**: Syne + DM Sans
- **Unsplash** (thumbnail images)
- **YouTube embeds** (course videos)
