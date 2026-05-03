# EduForge Project Report

## Cover Page Template

**Project Title:** EduForge - AI-Enabled Learning Management and University Academic Workflow Platform  
**Project Type:** Capstone Project Report  
**Submitted By:** [Add student names, roll numbers, branch, and section]  
**Submitted To:** [Add guide name, department, and institution]  
**Academic Year:** [Add academic year]  
**Institution:** [Add college / university name]

Suggested figure:
`Add the official college logo and department logo on the cover page.`

---

## Abstract

EduForge is a full-stack academic platform built to serve two learning environments in one system. The first is a public learning portal where students can explore courses, enroll, learn at their own pace, rate courses, and communicate with instructors. The second is a controlled university environment called University Space, where institutional workflows such as branch and section management, course approval, course allocation, live tests, internal marks calculation, project monitoring, and certificate release are handled in a structured way.

The project uses a monorepo architecture with separate applications for the main web portal, the platform admin panel, the university admin panel, and the Spring Boot backend. Role-based access is enforced for students, instructors, EduForge platform admins, and university admins. The system also integrates AI support for course drafting, quiz generation, class performance analysis, and project progress summaries. These AI outputs are not treated as final academic decisions. Instead, they assist the instructor or admin with faster review and planning.

The platform was designed to solve a practical problem: most learning systems handle only content delivery, while institutional academic workflows are managed elsewhere or manually. EduForge brings these activities together. It covers onboarding, approvals, teaching, student progress, project supervision, live evaluation, final marks submission, review, approval, and certificate verification in one connected workflow.

Suggested figure:
`Add one full-system screenshot collage showing the student portal, instructor university space, uni-admin dashboard, and admin panel.`

---

## 1. Introduction

Digital learning systems are widely used for content delivery, but many of them stop at video lessons, quizzes, and simple completion tracking. In a real academic environment, this is not enough. Universities need controlled onboarding, faculty verification, branch-wise course assignment, section-level allocation, project supervision, internal marks handling, approval workflows, and certificate generation. When these processes are split across spreadsheets, chat groups, manual records, and disconnected tools, the result is delay, duplication, and weak traceability.

EduForge was developed to address that gap. The platform combines an open learning portal with an institutional workflow layer. A student can use EduForge as a normal learner, but the same account can also become part of a university-managed environment through a join-code based onboarding flow. An instructor can publish public courses for all users, and the same instructor can also create university courses that go through approval, allocation, evaluation, and certification workflows. Platform admins manage the top-level system, while university admins manage their own academic structure without affecting other universities.

What makes the system stronger is that the workflows are connected end to end. A university course does not stop after content creation. It moves through approval, allocation, automatic enrollment, chapter deadlines, live tests, marks computation, project review, final marks submission, admin approval, and finally certificate release. This complete academic loop is the core contribution of the project.

---

## 2. Problem Statement

The problem addressed in this project is the absence of a single platform that can support both general e-learning activity and university-specific academic operations in a controlled, role-aware manner.

Existing systems usually suffer from one or more of the following issues:

- They support content delivery but not institutional approval workflows.
- They do not separate responsibilities clearly across admin, university admin, instructor, and student roles.
- They handle marks manually outside the platform.
- They do not provide a clean project-monitoring workflow for student groups.
- They generate little traceable data for faculty review and academic auditing.
- They do not connect live assessments, marks sheets, and certificate issuance into one continuous flow.

EduForge was built as a direct response to these limitations.

---

## 3. Objectives

The main objectives of the project are:

1. To build a multi-role academic platform that supports public learning and university-managed learning in the same system.
2. To provide separate interfaces for platform admin, university admin, instructor, and student users.
3. To support instructor approval and university onboarding through controlled workflows.
4. To allow instructors to create both public courses and university courses.
5. To enable university admins to approve courses and allocate them to sections with deadlines.
6. To automatically enroll eligible students when a university course is allocated.
7. To support chapter-wise learning, assessments, live tests, and progress tracking.
8. To calculate student marks using a live marks engine with penalties, weightages, and manual evaluation inputs.
9. To provide a project-space workflow with group formation, proposal review, GitHub repository linkage, and individual report submission.
10. To integrate AI features that assist academic work without replacing instructor or admin judgment.
11. To release certificates only after the final academic approval process is complete.

---

## 4. Scope of the Project

The scope of EduForge includes:

- Public course discovery and self-paced learning.
- Instructor course publishing for the general portal.
- Platform-level instructor verification.
- University creation and university admin account setup.
- University join-code based onboarding for students and instructors.
- Branch and section management.
- University course submission, approval, and allocation.
- Auto-enrollment of section students into allocated courses.
- Chapter-wise content delivery with deadlines and penalties.
- Live test scheduling, launch, closure, scoring, analytics, and notification flow.
- Project group formation and project monitoring with GitHub integration.
- Final marks sheet drafting, submission, review, approval, return, and certificate release.
- Public certificate verification using certificate ID.

The current scope does not include full live classroom delivery, advanced plagiarism detection inside the system, or automated proctoring for exams. These can be treated as future extensions.

---

## 5. User Roles and Responsibilities

### 5.1 End User / Public Learner

A public learner can:

- Create a student account.
- Log in to the public portal.
- Explore available public courses.
- View course details before enrollment.
- Enroll in public courses.
- Continue learning through the course player.
- Track chapter completion and progress.
- Add courses to favorites.
- Rate and review courses.
- Access completed-course history.
- Open the certificate screen where applicable.
- Chat with instructors through the messaging interface once course relationships exist.

Suggested figure:
`Add screenshots of the landing page, explore courses page, course details page, and student dashboard.`

### 5.2 Instructor

An instructor can:

- Register on the platform.
- Upload academic certificates during signup.
- Enter the waiting-hall flow until platform approval is completed.
- Maintain profile information such as specialization, employee ID, and GitHub username.
- Create and manage public courses.
- Add chapters, descriptions, and assessments to public courses.
- Monitor public-course students and reviews.
- Join a university using a university join code.
- Wait for university admin approval after joining the university layer.
- Create university courses targeted to a branch and year.
- Define internal marks weightages for attendance, tests, live tests, and project.
- Use AI to generate course drafts and suggested weightages.
- Submit university courses for university-admin review.
- Open the university course studio after approval.
- Add, edit, and delete chapters.
- Configure chapter deadlines and penalty rules.
- Create and manage live tests.
- Use AI to generate quiz questions.
- View student progress and marks summaries.
- Create project spaces for university courses.
- Form groups randomly or manually.
- Review or reject project proposals.
- Assign projects directly if required.
- Link GitHub repositories and monitor repository activity.
- Review group reports and collaboration progress.
- Use AI to summarize group status.
- Prepare, save, and submit final marks sheets.
- Use AI to analyze class performance before final submission.

Suggested figure:
`Add screenshots of the instructor waiting hall, create public course page, create university course page, course studio, live tests panel, project space, and final marks sheet panel.`

### 5.3 Student

A university student can:

- Register directly or register using a university join code.
- Join a university later from the University Space screen if not linked at signup.
- Provide roll number, branch-section mapping, and profile details.
- Access the University Space dashboard after joining.
- View university-specific allocated courses.
- Open a university course player with chapter list, progress ring, deadlines, and marks breakdown.
- Mark chapters complete and attempt chapter assessments.
- Receive live test notifications in real time.
- Attempt live tests when they are launched.
- Track current marks through the My Marks view.
- Participate in project groups.
- Submit project proposals through the group workflow.
- Access group chat and project updates.
- Upload individual contribution reports.
- Track result progression and issued certificates through History.
- Download and share approved certificates.
- Verify certificates through the public verification URL.

Suggested figure:
`Add screenshots of University Space for students, the university course player, live test screen, marks view, student project view, history page, and certificate page.`

### 5.4 University Admin

A university admin can:

- Log in to a dedicated university-admin portal.
- View university-level dashboard statistics.
- Create and delete branches.
- Create and delete sections under branches and years.
- View student records with branch and year filters.
- View instructor records with branch filters.
- Approve, reject, or remove university instructors.
- Review all university-course submissions in the course pool.
- Approve or reject proposed university courses.
- Allocate approved courses to one or more sections.
- Set a final completion deadline during allocation.
- Remove allocations from selected sections.
- Review submitted final marks sheets.
- Approve sheets or return them to instructors with correction reasons.
- View certificates released after approval.
- View permanent history of approved final marks records.

Suggested figure:
`Add screenshots of the uni-admin dashboard, branches and sections page, instructors page, course pool, allocations page, marks review page, certificates page, and history page.`

### 5.5 Platform Admin / Normal Admin

The EduForge platform admin operates at the highest level and can:

- Log in to the separate admin panel.
- View overall instructor statistics.
- Review instructor applications individually.
- Preview uploaded academic certificates.
- Approve instructors.
- Reject instructors with reasons.
- Flag instructors when more information or clearer documents are needed.
- Remove instructors from the platform if necessary.
- Reinstate previously removed instructors.
- Create universities.
- Generate university join codes.
- Create initial university admin credentials.
- Activate or deactivate universities.

Suggested figure:
`Add screenshots of the admin dashboard, instructor review page, and university registration page with generated join code.`

---

## 6. System Architecture

EduForge follows a monorepo-based architecture. The repository is divided into four major applications:

1. `apps/web` - main React portal for students and instructors.
2. `apps/admin` - React-based platform admin application.
3. `apps/uni-admin` - React-based university-admin application.
4. `apps/backend` - Spring Boot backend that powers all three frontends.

This separation is useful because each role gets an interface designed for its own tasks, while the backend maintains the shared business rules, data consistency, and security.

### 6.1 Frontend Architecture

The frontend is built using React and Vite. The main web portal uses component-based layouts for students and instructors. Shared UI building blocks such as cards, modals, badges, notifications, tabs, and loaders are reused across modules. Route protection is applied at the application level so that a user only reaches pages that match the authenticated role and approval status.

### 6.2 Backend Architecture

The backend is developed with Spring Boot. It uses controllers, services, repositories, DTOs, entities, and configuration classes in a layered structure. This keeps HTTP handling, business logic, and data access clearly separated. Key business areas include authentication, course management, university management, live tests, project space, marks processing, notifications, and AI integration.

### 6.3 Database and Persistence

The backend uses JPA-based entities for persistent storage. Core entities include:

- User
- Student
- Instructor
- University
- Branch
- Section
- Course
- Chapter
- Enrollment
- Progress
- LiveTest
- LiveTestSubmission
- ProjectSpace
- ProjectGroup
- ProjectProposal
- ProjectRepo
- IndividualReport
- MarksSheet
- Notification
- Message

These entities allow the system to model both ordinary learning and university-grade evaluation workflows.

Suggested figure:
`Add a high-level architecture diagram showing Web Portal, Admin Panel, Uni-Admin Panel, Backend API, Database, Gemini AI service, WebSocket notifications, and GitHub API integration.`

---

## 7. Technology Stack

### 7.1 Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons

### 7.2 Backend

- Spring Boot
- Spring Security
- Spring Data JPA
- Spring Web MVC
- Spring Validation
- Spring WebSocket
- Flyway

### 7.3 Database

- PostgreSQL

### 7.4 Authentication and Security

- JWT-based authentication
- Role-based authorization
- Protected routes on frontend

### 7.5 AI and External Integration

- Gemini 2.5 Flash for AI content generation and academic insights
- GitHub API for project repository activity
- Cloudinary-based media workflow for uploaded assets
- WebSocket-based live notifications

---

## 8. Detailed Workflow of the Entire System

This section describes the complete working flow of EduForge from onboarding to certificate generation.

### 8.1 Platform-Level Onboarding Workflow

1. A user opens the EduForge landing page.
2. The user chooses to sign up either as a student or as an instructor.
3. During signup, the user may optionally enter a university join code.
4. If the join code is valid, the account is linked to the corresponding university.
5. A student can continue with account creation and profile details.
6. An instructor also submits academic qualification details and document links during signup.
7. After signup, student accounts can use the public portal immediately.
8. Instructor accounts first enter the waiting-hall process until the platform admin approves them.

Suggested figure:
`Add a workflow diagram: Landing Page -> Signup -> Optional Join Code -> Student Path / Instructor Path -> Waiting Hall for Instructor.`

### 8.2 Platform Admin Workflow

1. The platform admin logs into the admin panel.
2. The admin dashboard shows instructor statistics.
3. The admin opens an instructor profile for detailed review.
4. Uploaded verification documents can be previewed directly.
5. The admin may approve, reject, flag, remove, or reinstate the instructor.
6. The admin can create a university entry.
7. When a university is created, a unique join code and university-admin credentials are generated.
8. The admin can later activate or deactivate that university.

This workflow controls the top-most governance layer of the platform.

### 8.3 University Setup Workflow

1. The platform admin registers a university.
2. The generated join code is shared with the institution.
3. The university admin logs into the dedicated uni-admin portal.
4. The university admin creates branches.
5. Under each branch, the admin creates sections and maps them to academic years.
6. Students and instructors who sign up using the join code become visible under this university scope.

Suggested figure:
`Add screenshots of university creation, join code display, and branch-section creation.`

### 8.4 Public Learning Workflow

1. A student logs into the public student portal.
2. The student explores available public courses.
3. The student opens a course details page.
4. The student enrolls in a course.
5. The course player loads chapters and progress information.
6. The student marks chapters complete and attempts assessments.
7. The student can add the course to favorites and submit a review.
8. Course progress appears in the dashboard and history.

This part of the platform supports open learning without requiring university approval.

### 8.5 University Membership Workflow

1. A student or instructor enters the university join code either during signup or later from University Space.
2. The system verifies the join code through university lookup.
3. The student selects section details and provides roll number.
4. The instructor selects branch details and may provide employee ID.
5. The system links the account to the chosen university.
6. Student access to university learning can begin immediately after successful joining.
7. Instructor university membership still remains subject to university-admin approval.

### 8.6 University Course Lifecycle Workflow

1. An approved instructor opens the University Space.
2. The instructor creates a university course.
3. The instructor chooses target branch and target year.
4. The instructor defines internal marks weightages that must total 100%.
5. The instructor may use the AI assistant to suggest title, description, and weightages.
6. The course is submitted to the course pool with pending status.
7. The university admin reviews the course in the Course Pool.
8. The admin either approves or rejects the course.
9. Once approved, the course becomes available for allocation.

Suggested figure:
`Add screenshots of Create University Course and the Course Pool approval screen.`

### 8.7 Course Allocation and Auto-Enrollment Workflow

1. The university admin opens the Allocations page.
2. The admin selects an approved course.
3. The admin selects one or more target sections.
4. The admin sets the final course deadline.
5. The allocation is saved.
6. The backend checks students belonging to those sections.
7. Enrollment records are created automatically for all eligible students.
8. The allocated course becomes visible in the student University Space.

This is an important workflow because enrollment is not handled manually course by course.

### 8.8 University Learning Workflow

1. A student opens a university course from the University Space.
2. The course player loads chapters, progress, marks weightages, and deadlines.
3. The student studies video or text content.
4. The student marks chapters complete.
5. If a chapter quiz exists, the student attempts it.
6. Progress, quiz score, and completion state are stored.
7. If deadlines are missed, the marks engine later considers penalty deductions.

Suggested figure:
`Add a screenshot of the university course player showing sidebar, progress ring, chapter list, and marks breakdown panel.`

### 8.9 Live Test Workflow

1. The instructor creates a live test for a university course.
2. The instructor defines title, duration, passing score, schedule, and questions.
3. Questions can be entered manually or generated with AI.
4. The instructor may launch the test manually or schedule it.
5. The scheduler checks every 30 seconds for due live tests.
6. When a test starts, students receive WebSocket and bell-notification alerts.
7. Students open the live test attempt screen and submit answers.
8. Duplicate submission protection is enforced at the backend.
9. The scheduler automatically closes expired tests.
10. The instructor can inspect ranked submissions, pass rate, score distribution, and export CSV.
11. The student's average live-test score is pushed into the marks workflow.

Suggested figure:
`Add screenshots of the live test creation panel, student live test interface, and instructor analytics screen.`

### 8.10 Project Space Workflow

1. The instructor creates a project space for a university course.
2. The instructor defines group size, proposal deadline, project deadline, and project description.
3. Groups are formed either randomly or manually.
4. Students can view their own group.
5. A group submits a project proposal.
6. The instructor approves or rejects the proposal.
7. If needed, the instructor can assign a project directly to a group.
8. A GitHub repository can be linked to the group.
9. The system pulls branch, pull request, and commit activity using the instructor's GitHub PAT.
10. Group chat and unread-message tracking support collaboration.
11. Each student can upload an individual contribution report.
12. The instructor uses AI insights to quickly understand whether the group is progressing or blocked.

Suggested figure:
`Add screenshots of project-space creation, group formation, instructor group card, GitHub activity view, group chat, and AI group insights drawer.`

### 8.11 Final Marks and Certificate Workflow

1. The instructor opens the Final Marks Sheet panel for a university course.
2. The system loads all enrolled students and computes automatic components.
3. Automatic components include attendance, chapter test average, live test average, and late penalty.
4. The instructor enters manual components such as project work, viva, internal moderation, and adjustment.
5. The project bucket is computed and weighted according to the course rule.
6. The system calculates the final score and grade for each student.
7. The instructor can save draft sheets any number of times before submission.
8. The instructor may open AI-based class performance analysis before final submission.
9. Once submitted, the marks sheet becomes locked.
10. The university admin reviews the submitted sheet.
11. The admin may approve it or return it with correction remarks.
12. If returned, the instructor edits and resubmits it.
13. Once approved, the certificate record becomes available to students.
14. Students can open, download, and share the certificate.
15. Public certificate verification is supported through certificate ID.

Suggested figure:
`Add screenshots of the instructor final marks sheet panel, AI analysis drawer, uni-admin marks review modal, certificate page, and public certificate verification page.`

---

## 9. Module-Wise Feature Description

### 9.1 Landing and Authentication Module

- Student signup and login
- Instructor signup and login
- Optional university join-code verification at signup
- Instructor waiting-hall flow before approval
- Profile and settings management

### 9.2 Public Course Module

- Explore courses
- View course details
- Enroll in courses
- Track course progress
- Add favorites
- Submit ratings and reviews
- View enrolled and completed courses

### 9.3 Messaging and Notification Module

- Student-instructor chat
- Contact list support
- Persisted notification records
- Bell notification dropdown
- Mark single or all notifications as read
- Live test start and close notifications

### 9.4 University Structure Module

- University creation by platform admin
- Join-code based university discovery
- Branch management
- Section management
- Student and instructor listing at university level

### 9.5 University Course Module

- Course creation targeted to branch and year
- Weightage builder for internal marks
- Course approval and rejection workflow
- Section allocation
- Auto-enrollment of section students
- Course studio for chapter management
- Deadline and penalty management

### 9.6 Live Test Module

- Manual question builder
- AI-assisted question generation
- Launch now or schedule later
- Auto-launch and auto-close by scheduler
- Active-test detection on student side
- Submission storage and scoring
- Pass-rate and score-distribution analytics
- CSV export of attempts

### 9.7 Project Space Module

- Create project space
- Random group formation
- Manual group formation
- Group reset and reformation
- Proposal submission
- Proposal approval and rejection
- Instructor direct project assignment
- GitHub repository linkage
- Commit, branch, and PR inspection
- Group chat
- Activity timeline
- Individual report submission

### 9.8 Marks and Certificate Module

- Live marks calculation
- Penalty computation
- Manual evaluation inputs
- Draft save
- Submit to uni-admin
- Approve or return
- Locked final scores and grades
- Certificate generation and download
- Public verification support

### 9.9 AI Assistance Module

- AI course generation
- AI quiz generation
- AI group progress summary
- AI class performance analysis

---

## 10. AI Integration and What the System Considers

The AI features in EduForge are integrated as assistive tools. They reduce repetitive work for instructors and help surface patterns in academic data, but they do not replace manual review.

### 10.1 AI Course Generation

Purpose:
To help instructors create a structured course draft quickly.

Inputs considered:

- The instructor's prompt or topic description
- The course context type, such as public course or university-level course

Expected output:

- Suggested course title
- Short course description
- Suggested chapter outline
- Suggested weightages for attendance, tests, live tests, and project

Why this matters:
This feature saves time during course design and gives the instructor a starting structure that can be edited before submission.

### 10.2 AI Quiz Generation

Purpose:
To generate multiple-choice questions for live tests.

Inputs considered:

- The instructor's prompt
- Topic name or chapter content pasted into the input
- Optional request for number of questions

Expected output:

- Question text
- Four answer options
- Correct answer index

Why this matters:
It speeds up live-test creation, especially when the instructor already has chapter content and wants a quick question set.

### 10.3 AI Group Progress Summary

Purpose:
To give the instructor a quick summary of project-group health.

Inputs considered:

- Group name
- Member names
- Project title
- Proposal status
- Whether a repository is linked
- Number of submitted individual reports
- Number of missing reports
- Most recent group message

Expected output:

- Short summary
- Highlights
- Risks or blockers
- Recommended next steps

Why this matters:
The instructor gets a fast operational snapshot instead of manually checking every field before deciding where intervention is needed.

### 10.4 AI Class Performance Analysis

Purpose:
To summarize class-level patterns before the marks sheet is finalized.

Inputs considered:

- Total student count
- Class average
- Pass and fail counts
- Per-student attendance score
- Per-student tests score
- Per-student live-test score
- Per-student project score
- Final score
- Grade

Expected output:

- Overall summary
- Positive patterns
- Risks
- Recommendations
- Grade distribution
- Top performers
- Students needing attention

Why this matters:
It helps the instructor or university admin understand whether poor outcomes come from attendance, tests, live assessments, or project performance.

### 10.5 AI Usage Boundaries

The system intentionally keeps AI within advisory boundaries:

- AI does not directly approve students or instructors.
- AI does not publish final marks automatically.
- AI does not release certificates.
- AI output is reviewed by a human before being used in academic decisions.
- Final evaluation still depends on instructor and admin actions.

Suggested figure:
`Add a diagram titled "AI Assistance Points in EduForge" showing Course Generation, Quiz Generation, Group Insights, and Performance Analysis.`

---

## 11. Internal Marks Calculation Logic

The marks engine is one of the most important academic components in the system.

### 11.1 Automatic Components

For each student in a university course, the backend computes:

- **Attendance score** = `(completed chapters / total chapters) * 100`
- **Tests score** = average of chapter assessment scores
- **Live tests score** = average of live-test submission scores
- **Late penalty** = penalty-per-day multiplied by the number of overdue days for incomplete chapters

### 11.2 Manual Components Entered by Instructor

The instructor enters:

- Project work score
- Viva score
- Internal moderation score
- Adjustment score
- Optional remarks

### 11.3 Project Bucket

The project bucket is computed as the average of:

- Project work
- Viva
- Internal moderation

If only some values are provided, the average is taken from the values that exist.

### 11.4 Weighted Final Score

The weighted score is built using the course-defined marks policy:

- Attendance weighted by `weightAttendance`
- Tests weighted by `weightTests`
- Live tests weighted by `weightLiveTests`
- Project bucket weighted by `weightProject`

After that:

`Final Score = Weighted Total - Late Penalty + Adjustment`

The score is clamped between 0 and 100.

### 11.5 Grade Mapping

The project uses the following grade mapping:

- `S` for score 90 and above
- `A` for score 80 to 89.99
- `B` for score 70 to 79.99
- `C` for score 60 to 69.99
- `D` for score 50 to 59.99
- `F` for score below 50

This design makes the marks system transparent and traceable.

Suggested figure:
`Add a marks-calculation flowchart from chapter progress and live tests to weighted score, penalty, final score, grade, and certificate approval.`

---

## 12. Security and Access Control

EduForge uses layered access control.

### 12.1 Authentication

- JWT tokens are used for authenticated requests.
- User identity is maintained across frontend and backend.

### 12.2 Authorization

Access is separated by role:

- Student
- Instructor
- Admin
- University Admin

### 12.3 Approval Gates

- Instructors cannot use the full instructor surface until platform approval is completed.
- University instructors remain subject to university-admin approval before they can fully participate in the university workflow.
- Submitted final marks sheets become read-only until uni-admin action is taken.

### 12.4 Data Separation

- University admins operate only within their own university.
- A student sees only courses assigned to the student's academic context.
- Project group views are restricted to authorized instructor or participating students.

---

## 13. Notable Strengths of the System

The project has several strengths:

- It supports both general learning and university-specific control in one platform.
- It separates responsibilities cleanly across four major roles.
- It uses a dedicated university workflow rather than forcing public-course logic to handle institutional tasks.
- It combines academic content delivery with operational workflows such as approvals, allocations, evaluations, and certification.
- It introduces AI carefully as a helper, not as the final authority.
- It makes project supervision more practical by combining group structure, GitHub activity, reports, and messaging.
- It generates a real audit trail through statuses, timestamps, approvals, returns, and history screens.

---

## 14. Limitations and Future Scope

The current implementation is strong, but there is room to extend it further.

Possible future improvements include:

- Live class or virtual classroom support
- Rubric-based project evaluation rather than flat project bucket scoring
- Advanced analytics dashboards for institutions
- Public certificate registry search
- In-app plagiarism checks for reports and proposals
- Exam proctoring and browser lockdown support
- Attendance sync from live class sessions
- Semester-wise export and report generation
- Mobile-first companion app

---

## 15. Suggested Screenshots and Figures Checklist

To make the final report look professional, add screenshots in the following order:

1. Cover page logos
2. Overall system architecture diagram
3. Landing page
4. Student signup with join-code step
5. Instructor waiting-hall page
6. Admin instructor review page
7. University registration page with join code
8. Uni-admin dashboard
9. Branch and section management page
10. Uni-admin instructor management page
11. Student management page
12. Create university course page
13. Course pool approval page
14. Course allocation page
15. Student University Space overview
16. University course player
17. Live test creation panel
18. Student live test screen
19. Project space overview
20. Instructor group card with GitHub activity
21. AI group insights drawer
22. Final marks sheet panel
23. AI class performance analysis drawer
24. Uni-admin marks review modal
25. Student history page
26. Approved certificate page
27. Public certificate verification page

If space is limited, the most important figures are numbers 2, 6, 8, 12, 14, 16, 18, 20, 22, 24, and 26.

---

## 16. Conclusion

EduForge is not just a learning portal. It is a connected academic workflow system. The project demonstrates how a platform can move beyond simple content delivery and support the full journey of institutional learning: onboarding, approval, structured teaching, live evaluation, project supervision, marks processing, administrative review, and certificate issuance.

The system is especially meaningful because its modules are not isolated demos. The public portal, university layer, live tests, project space, marks engine, and certificate workflow are tied together through common entities, role-based routes, and backend business logic. That makes the project suitable for real academic operations, not only for presentation.

The addition of AI features gives the platform practical value without weakening academic control. Course drafting, quiz generation, group insight generation, and performance analysis reduce repetitive work, but final authority remains with the instructor and admin. This balance makes the solution both modern and responsible.

In its current form, EduForge already covers the core lifecycle of a university-managed digital learning environment. With future work in live classes, stronger analytics, public verification polish, and richer assessment tools, it can grow into an even more complete academic management platform.

---

## 17. Appendix: Short Role Summary Table

| Role | Main Responsibilities |
| :--- | :--- |
| Public Student / End User | Explore courses, enroll, learn, review, favorite, track history |
| Instructor | Create courses, manage chapters, run live tests, supervise projects, submit marks |
| Student (University) | Attend university courses, take assessments, join project groups, track marks, receive certificates |
| University Admin | Manage branches/sections, approve instructors, approve courses, allocate sections, review marks, release certificates |
| Platform Admin | Verify instructors, manage universities, control top-level access |

---

## 18. Final Formatting Notes

Before submitting the report:

1. Replace all placeholder fields on the cover page.
2. Convert this draft into your college report template in Word or Google Docs.
3. Insert screenshots where indicated.
4. Add page numbers, table of contents, and list of figures.
5. If your department requires certificate, declaration, or acknowledgement pages, add them before the abstract.
6. Keep figure captions simple and specific.
7. If required, add team-member contribution details as a separate appendix.

---

## 19. Appendix: Entity Relationship and Data Model Documentation

Adding entity relationships to the report is a strong idea because it makes the backend design easier to evaluate academically. It shows that the system was not built as disconnected screens, but as a structured domain model with controlled relationships between users, courses, progress, projects, marks, and certification.

### 19.1 High-Level Entity Relationship Overview

The EduForge backend revolves around five major clusters:

1. Identity and institution entities
2. Course and learning entities
3. Assessment and marks entities
4. Project collaboration entities
5. Communication and notification entities

Suggested figure:
`Add an ER diagram generated from the following relationship summary. This should be one full-page figure in the final report.`

### 19.2 Core Relationship Summary

- One `University` can have many `User` records linked to it.
- One `University` can have many `Branch` records.
- One `Branch` can have many `Section` records.
- One `Branch` can have many `Instructor` records.
- One `Section` can have many `Student` records.
- One `User` is extended by either one `Student` or one `Instructor`, depending on role.
- One `Instructor` can create many `Course` records.
- One `Course` can belong to one `University` when it is a university course.
- One `Course` can target one `Branch` and one academic year in the university flow.
- One `Course` can have many `Chapter` records.
- One `Course` can have many `Enrollment` records.
- One `Enrollment` connects one `Student` and one `Course`.
- One `Student` can have many `Progress` records, one per chapter.
- One `Chapter` can have one `Assessment`.
- One `Assessment` can have many `Question` records.
- One `Question` can have many `Option` records.
- One `Course` can have many `LiveTest` records.
- One `LiveTest` can have many `LiveTestSubmission` records.
- One `Course` can have one `ProjectSpace`.
- One `ProjectSpace` can have many `ProjectGroup` records.
- One `ProjectGroup` can have many `Student` members through the `group_students` join table.
- One `ProjectGroup` can have one `ProjectProposal`.
- One `ProjectGroup` can have one `ProjectRepo`.
- One `ProjectGroup` can have many `IndividualReport` records.
- One `ProjectGroup` can have many `ProjectGroupMessage` records.
- One `ProjectGroup` can have many `ProjectActivityEvent` records.
- One `Course` and one `Student` can produce one or more `MarksSheet` records through the evaluation workflow.
- One `Course` and one `Student` can also produce one `Review` record in the public-course flow.
- One `User` can receive many `Notification` records.
- One `User` can send and receive many `Message` records.

### 19.3 Suggested ER Diagram Draft

```text
University
  -> Branch
    -> Section
      -> Student
        -> Enrollment -> Course -> Chapter -> Assessment -> Question -> Option
        -> Progress -> Chapter
        -> LiveTestSubmission -> LiveTest -> Course
        -> MarksSheet -> Course
        -> Review -> Course

User
  -> Student
  -> Instructor

Instructor
  -> Course
  -> LiveTest
  -> ProjectSpace -> ProjectGroup -> ProjectProposal
                                 -> ProjectRepo
                                 -> IndividualReport
                                 -> ProjectGroupMessage
                                 -> ProjectActivityEvent

User
  -> Notification
  -> Message
```

### 19.4 Entity Catalog

The following table can be added directly to the report as the formal backend data dictionary summary.

| Entity | Purpose in System | Important Relationships |
| :--- | :--- | :--- |
| `User` | Base identity record for every authenticated user | Many-to-one with `University`; one-to-one extension through `Student` or `Instructor` |
| `Student` | Academic student profile | One-to-one with `User`; many-to-one with `Section`; many-to-many favorite courses |
| `Instructor` | Instructor profile and verification record | One-to-one with `User`; many-to-one with `Branch`; one-to-many implicit ownership of `Course` and `LiveTest` |
| `University` | Institutional root entity | One-to-many implicit relationship with `Branch`, `User`, and university courses |
| `Branch` | Department or academic branch | Many-to-one with `University`; one-to-many implicit relationship with `Section`, `Instructor`, and target courses |
| `Section` | Section within branch and year | Many-to-one with `Branch`; one-to-many implicit relationship with `Student` and `CourseAllocation` |
| `Course` | Main course entity for both public and university courses | Many-to-one with `Instructor`; optional many-to-one with `University` and `Branch`; one-to-many with `Chapter`; one-to-one with project space and grand assessment |
| `Chapter` | Chapter-level learning unit | Many-to-one with `Course`; one-to-one with `Assessment` |
| `Assessment` | Quiz/assessment definition | One-to-one with `Chapter`; optional one-to-one with `Course` for grand assessment; one-to-many with `Question` |
| `Question` | Assessment question | Many-to-one with `Assessment`; one-to-many with `Option` |
| `Option` | MCQ answer option | Many-to-one with `Question` |
| `Enrollment` | Student-course enrollment record | Many-to-one with `Student`; many-to-one with `Course` |
| `Progress` | Chapter-level progress record | Many-to-one with `Student`; many-to-one with `Chapter` |
| `Review` | Student review on a public course | Many-to-one with `Student`; many-to-one with `Course` |
| `LiveTest` | Scheduled or manually launched synchronous test | Many-to-one with `Course`; many-to-one with `Instructor` |
| `LiveTestSubmission` | Student attempt for a live test | Many-to-one with `LiveTest`; many-to-one with `Student` |
| `CourseAllocation` | University-admin mapping of approved courses to sections | Many-to-one with `Course`; many-to-one with `Section` |
| `MarksSheet` | Final academic marks workflow record | Many-to-one with `Course`; many-to-one with `Student`; many-to-one approver link to `User` |
| `ProjectSpace` | Project workspace for a university course | One-to-one with `Course`; many-to-one with `Instructor`; one-to-many with `ProjectGroup` |
| `ProjectGroup` | Student project team | Many-to-one with `Course`; many-to-one with `ProjectSpace`; many-to-many with `Student`; one-to-one with `ProjectProposal` and `ProjectRepo` |
| `ProjectProposal` | Proposed project topic and description | One-to-one with `ProjectGroup` |
| `ProjectRepo` | Linked GitHub repository metadata | One-to-one with `ProjectGroup`; many-to-one with `Instructor` as repo owner |
| `IndividualReport` | Student contribution/report upload for group work | Many-to-one with `Student`; many-to-one with `ProjectGroup` |
| `ProjectActivityEvent` | Timeline record for project actions | Many-to-one with `Course`, `ProjectSpace`, optional `ProjectGroup`, and optional actor `User` |
| `ProjectGroupMessage` | Group chat message | Many-to-one with `Course`, `ProjectSpace`, `ProjectGroup`, and sender `User` |
| `ProjectGroupChatRead` | Read-state tracker for group chat | Many-to-one with `ProjectGroup`; many-to-one with `User` |
| `GitHubBranchSnapshot` | Cached GitHub branch snapshot | Many-to-one with `ProjectGroup`; many-to-one with `ProjectRepo` |
| `GitHubPullRequestSnapshot` | Cached GitHub pull request snapshot | Many-to-one with `ProjectGroup`; many-to-one with `ProjectRepo` |
| `GitHubCommitSnapshot` | Cached GitHub commit snapshot | Many-to-one with `ProjectGroup`; many-to-one with `ProjectRepo` |
| `Message` | Direct course-context messaging entity | Many-to-one with sender `User`, receiver `User`, and `Course`; optional self-reference for reply |
| `Notification` | Persisted notification entity | Many-to-one with `User`; stores optional `courseId` and `referenceId` |

### 19.5 Notes for the Final Report

For the final PDF or DOC version, it is better to include:

- one simplified ER diagram in the main report body
- one full entity catalog table in the appendix

That combination looks more professional than placing every entity box directly inside the main chapters.

---

## 20. Appendix: Backend API Documentation and Swagger-Style Endpoint Summary

This addition is also valuable. In a professional report, a backend API section shows how the frontend, admin panels, and external integrations communicate with the service layer.

### 20.1 OpenAPI / Swagger Availability

The backend includes the `springdoc-openapi-starter-webmvc-ui` dependency. Since no custom Swagger path configuration was found in the backend properties, the default documentation URLs are expected to be:

- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8080/v3/api-docs`

Important note:
This is inferred from the existing SpringDoc dependency and the absence of an override in `application.properties`.

Suggested figure:
`If Swagger UI is available while the backend is running, add a screenshot of the Swagger UI home page showing the grouped endpoints.`

### 20.2 API Grouping Strategy for the Report

The backend endpoints can be documented module-wise instead of listing every single URL in one flat table. That makes the report easier to read.

Recommended groups:

1. Authentication APIs
2. User and profile APIs
3. Public course APIs
4. Student activity APIs
5. University admin APIs
6. University course APIs
7. Live test APIs
8. Project space APIs
9. Marks and certificate APIs
10. AI APIs
11. Messaging and notification APIs

### 20.3 Important Backend URL Summary

#### Authentication APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/student/signup` | Register student |
| `POST` | `/api/v1/auth/instructor/signup` | Register instructor |
| `POST` | `/api/v1/auth/login` | Login for all supported roles |
| `GET` | `/api/v1/auth/university/lookup` | Validate join code and fetch university context |

#### User and Profile APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | Get logged-in user profile |
| `PUT` | `/api/v1/users/me` | Update profile details |
| `PUT` | `/api/v1/users/me/university/join` | Join a university after account creation |

#### Public Course APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/courses` | List public courses |
| `GET` | `/api/v1/courses/{courseId}` | Get course details |
| `POST` | `/api/v1/courses` | Create public course |
| `PUT` | `/api/v1/courses/{courseId}` | Update public course |
| `DELETE` | `/api/v1/courses/{courseId}` | Delete public course |
| `GET` | `/api/v1/courses/instructor/{instructorId}` | Get courses created by instructor |

#### Chapter and Assessment APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/courses/{courseId}/chapters` | List chapters of a course |
| `POST` | `/api/v1/courses/{courseId}/chapters` | Create chapter |
| `PUT` | `/api/v1/courses/{courseId}/chapters/{chapterId}` | Update chapter |
| `DELETE` | `/api/v1/courses/{courseId}/chapters/{chapterId}` | Delete chapter |
| `POST` | `/api/v1/courses/{courseId}/chapters/{chapterId}/assessment` | Create chapter assessment |
| `POST` | `/api/v1/courses/{courseId}/chapters/grand-assessment` | Create final/grand assessment |

#### Student Activity APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/student/enroll/{courseId}` | Enroll in public course |
| `GET` | `/api/v1/student/enrolled` | Get enrolled public courses |
| `POST` | `/api/v1/student/favorites/{courseId}` | Add or remove favorite |
| `GET` | `/api/v1/student/favorites` | Get favorite courses |
| `POST` | `/api/v1/courses/{courseId}/reviews` | Submit public course review |

#### Progress APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/progress/{courseId}` | Get student progress in a course |
| `POST` | `/api/v1/progress/{courseId}/chapters/{chapterId}/complete` | Mark chapter complete |
| `POST` | `/api/v1/progress/{courseId}/chapters/{chapterId}/assessment` | Submit chapter quiz |
| `POST` | `/api/v1/progress/{courseId}/grand-assessment` | Submit grand assessment |
| `GET` | `/api/v1/progress/instructor/{courseId}` | Instructor view of class progress |

#### Platform Admin APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/stats` | Platform-level dashboard statistics |
| `GET` | `/api/v1/admin/instructors` | List instructor applications |
| `GET` | `/api/v1/admin/instructors/{id}` | Get single instructor details |
| `PUT` | `/api/v1/admin/instructors/{id}/approve` | Approve instructor |
| `PUT` | `/api/v1/admin/instructors/{id}/reject` | Reject instructor |
| `PUT` | `/api/v1/admin/instructors/{id}/flag` | Flag instructor for more details |
| `PUT` | `/api/v1/admin/instructors/{id}/remove` | Remove instructor |
| `PUT` | `/api/v1/admin/instructors/{id}/reinstate` | Reinstate instructor |

#### University Management APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/admin/universities` | Create university |
| `GET` | `/api/v1/admin/universities` | List universities |
| `PUT` | `/api/v1/admin/universities/{id}/toggle-status` | Activate or deactivate university |
| `PUT` | `/api/v1/admin/universities/{id}/reset-password` | Reset university-admin password |

#### University Context APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/uni-admin/context/branches` | List branches |
| `POST` | `/api/v1/uni-admin/context/branches` | Create branch |
| `DELETE` | `/api/v1/uni-admin/context/branches/{id}` | Delete branch |
| `POST` | `/api/v1/uni-admin/context/sections` | Create section |
| `DELETE` | `/api/v1/uni-admin/context/sections/{id}` | Delete section |

#### University User APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/uni-admin/users/instructors` | List university instructors |
| `PUT` | `/api/v1/uni-admin/users/instructors/{id}/approve` | Approve university instructor |
| `PUT` | `/api/v1/uni-admin/users/instructors/{id}/reject` | Reject university instructor |
| `PUT` | `/api/v1/uni-admin/users/instructors/{id}/remove` | Remove university instructor |
| `GET` | `/api/v1/uni-admin/users/students` | List university students |
| `GET` | `/api/v1/uni-admin/users/dashboard` | University dashboard data |

#### University Course APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/uni-courses` | Create university course |
| `GET` | `/api/v1/uni-courses/my` | Get university courses in instructor scope |
| `GET` | `/api/v1/uni-courses/my-courses` | Get instructor's university courses |
| `DELETE` | `/api/v1/uni-courses/{courseId}` | Delete university course |
| `PATCH` | `/api/v1/uni-courses/{id}/settings` | Update course penalty/settings |
| `GET` | `/api/v1/uni-courses/branches` | Get branch options for course creation |
| `GET` | `/api/v1/uni-courses/pool` | Get course pool for approval workflow |
| `PUT` | `/api/v1/uni-courses/{id}/approve` | Approve university course |
| `PUT` | `/api/v1/uni-courses/{id}/reject` | Reject university course |
| `GET` | `/api/v1/uni-courses/allocations` | Get current allocations |
| `POST` | `/api/v1/uni-courses/allocations` | Allocate course to sections |
| `DELETE` | `/api/v1/uni-courses/allocations/{allocationId}` | Remove allocation |
| `GET` | `/api/v1/uni-courses/sections` | Get available sections |
| `GET` | `/api/v1/uni-courses/student/allocated` | Get allocated courses for student scope |
| `GET` | `/api/v1/uni-courses/student/my-enrollments` | Get university-course enrollments |

#### Live Test APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/live-tests/course/{courseId}` | Create live test |
| `GET` | `/api/v1/live-tests/course/{courseId}` | List live tests for a course |
| `GET` | `/api/v1/live-tests/{liveTestId}/stats` | Get submission statistics |
| `POST` | `/api/v1/live-tests/{liveTestId}/launch` | Launch test manually |
| `POST` | `/api/v1/live-tests/{liveTestId}/close` | Close test manually |
| `DELETE` | `/api/v1/live-tests/{liveTestId}` | Delete live test |
| `GET` | `/api/v1/live-tests/course/{courseId}/active` | Get active live test for students |
| `POST` | `/api/v1/live-tests/{liveTestId}/submit` | Submit live test attempt |

#### Marks and Certificate APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/marks/student/course/{courseId}` | Get student marks breakdown |
| `GET` | `/api/v1/marks/instructor/course/{courseId}/students` | Get instructor class marks view |
| `GET` | `/api/v1/marks/student/course/{courseId}/final-sheet/approved` | Get approved final result for student |
| `GET` | `/api/v1/marks/public/certificates/{certificateId}` | Public certificate verification |
| `GET` | `/api/v1/marks/instructor/course/{courseId}/final-sheet` | Get instructor final marks sheet |
| `PUT` | `/api/v1/marks/instructor/course/{courseId}/final-sheet` | Save marks-sheet draft |
| `POST` | `/api/v1/marks/instructor/course/{courseId}/final-sheet/submit` | Submit final marks sheet |
| `GET` | `/api/v1/marks/uni-admin/final-sheets` | List final sheets for review |
| `GET` | `/api/v1/marks/uni-admin/final-sheets/history` | List approved marks history |
| `GET` | `/api/v1/marks/uni-admin/certificates` | List issued certificates |
| `GET` | `/api/v1/marks/uni-admin/course/{courseId}/final-sheet` | Get single reviewed sheet |
| `POST` | `/api/v1/marks/uni-admin/course/{courseId}/final-sheet/approve` | Approve final sheet |
| `POST` | `/api/v1/marks/uni-admin/course/{courseId}/final-sheet/return` | Return sheet for correction |

#### Project Space APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/project-space/{courseId}` | Create project space |
| `GET` | `/api/v1/project-space/{courseId}` | Get full project space |
| `GET` | `/api/v1/project-space/{courseId}/my-group` | Get student's own group |
| `POST` | `/api/v1/project-space/{courseId}/groups/random` | Form groups randomly |
| `POST` | `/api/v1/project-space/{courseId}/groups/manual` | Form groups manually |
| `DELETE` | `/api/v1/project-space/{courseId}/groups` | Reset groups |
| `POST` | `/api/v1/project-space/{courseId}/proposal` | Submit proposal |
| `PUT` | `/api/v1/project-space/{courseId}/groups/{groupId}/proposal/review` | Review proposal |
| `PUT` | `/api/v1/project-space/{courseId}/groups/{groupId}/assign` | Assign project directly |
| `PUT` | `/api/v1/project-space/{courseId}/groups/{groupId}/repo` | Link GitHub repo |
| `GET` | `/api/v1/project-space/{courseId}/groups/{groupId}/github` | Fetch GitHub activity |
| `GET` | `/api/v1/project-space/{courseId}/groups/{groupId}/messages` | Get group messages |
| `POST` | `/api/v1/project-space/{courseId}/groups/{groupId}/messages` | Send group message |
| `POST` | `/api/v1/project-space/{courseId}/report` | Submit individual report |
| `PUT` | `/api/v1/project-space/github-pat` | Save instructor GitHub PAT |

#### Messaging and Notification APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/messages/{courseId}/{otherUserId}` | Get course-context direct messages |
| `GET` | `/api/v1/messages/contacts` | Get available chat contacts |
| `PUT` | `/api/v1/messages/{messageId}` | Edit message |
| `DELETE` | `/api/v1/messages/{messageId}` | Delete message |
| `POST` | `/api/v1/messages` | Send direct message |
| `GET` | `/api/v1/notifications/my` | Get notifications |
| `GET` | `/api/v1/notifications/unread-count` | Get unread count |
| `PATCH` | `/api/v1/notifications/mark-all-read` | Mark all notifications as read |
| `PATCH` | `/api/v1/notifications/{notificationId}/read` | Mark one notification as read |

#### AI APIs

| Method | URL | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/ai/generate-course` | Generate course draft with AI |
| `POST` | `/api/v1/ai/generate-quiz` | Generate quiz questions with AI |
| `POST` | `/api/v1/ai/summarize-project` | Generate group progress summary |
| `POST` | `/api/v1/ai/analyze-performance` | Generate class performance analysis |

### 20.4 Best Way to Present This in the Final Report

To keep the report professional, do not dump every endpoint into the main body. Use this structure:

- In the main report:
  brief paragraph explaining that the backend is documented through REST APIs and can be exposed through Swagger UI.
- In the appendix:
  grouped endpoint tables like the ones above.
- In viva or demo:
  show the actual Swagger UI screen if the backend is running.

This combination looks much stronger than just saying "backend APIs were used."
