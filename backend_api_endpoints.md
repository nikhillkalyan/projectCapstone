# EduForge - Spring Boot Backend API Endpoints Guide

Based on the React frontend components, features, and the structure of `mockDatabase.js`, here is the comprehensive list of REST API endpoints required to build the Spring Boot + PostgreSQL backend.

All endpoints assume a base URL of `/api/v1`.

---

## 1. Authentication & Users (`/auth` and `/users`)

**Dependencies:** Spring Security, JWT (JSON Web Tokens).
*Note: In production, passwords must be hashed (Bcrypt).*

| Method | Endpoint | Description | Request Body | Path Variables/Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/student/signup` | Register a new student | `{ name, email, password, college, year, interests[] }` | None |
| `POST` | `/auth/instructor/signup` | Register a new instructor | `{ name, email, password, qualification, experience, specialization, bio }` | None |
| `POST` | `/auth/login` | Login (Student or Instructor) | `{ email, password }` | None |
| `GET` | `/users/me` | Get current logged-in user profile | None (reads JWT token from header) | None |
| `PUT` | `/users/me` | Update profile (bio, interests, etc) | `{ bio, interests[], college, etc... }` | None |

---

## 2. Courses (`/courses`)

| Method | Endpoint | Description | Request Body | Path Variables/Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/courses` | Get all courses (Explore Page) | None | `?category=AIML&level=Beginner&search=python` |
| `GET` | `/courses/{courseId}` | Get complete course details | None | `courseId` |
| `POST` | `/courses` | Create new course (Instructor only) | `{ title, category, level, description, longDescription, ... }` | None |
| `PUT` | `/courses/{courseId}` | Edit course details | `{ title, category, ... }` | `courseId` |
| `DELETE` | `/courses/{courseId}` | Delete a course | None | `courseId` |
| `GET` | `/courses/instructor/{instructorId}`| Get courses by specific instructor | None | `instructorId` |

---

## 3. Course Chapters & Assessments (`/courses/{courseId}/chapters`)

| Method | Endpoint | Description | Request Body | Path Variables/Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/courses/{courseId}/chapters` | Get all chapters for a course | None | `courseId` |
| `POST` | `/courses/{courseId}/chapters` | Add a new chapter | `{ title, duration, type, content: { videoUrl, textContent, description } }` | `courseId` |
| `PUT` | `/courses/{courseId}/chapters/{chapterId}` | Update chapter content | `{ title, content: { ... } }` | `courseId`, `chapterId` |
| `POST` | `/courses/{courseId}/chapters/{chapterId}/assessment` | Add quiz to chapter | `{ questions: [{ question, options[], correctIndex }] }` | `courseId`, `chapterId` |
| `POST` | `/courses/{courseId}/grand-assessment` | Add Grand Assessment (Final Exam) | `{ title, passingScore, questions: [...] }` | `courseId` |

---

## 4. Student Enrollments & Interactions (`/student`)

| Method | Endpoint | Description | Request Body | Path Variables/Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/student/enroll/{courseId}` | Enroll student in a course | None | `courseId` |
| `GET` | `/student/enrolled` | Get student's enrolled courses | None | None |
| `POST` | `/student/favorites/{courseId}`| Toggle course favorite status | None | `courseId` |
| `GET` | `/student/favorites` | Get student's favorite courses | None | None |
| `POST` | `/courses/{courseId}/reviews` | Submit a course review/rating | `{ rating, review }` | `courseId` |

---

## 5. Student Progress Tracking (`/progress`)

*Note: These are critical for the Course Player and Instructor Dashboard.*

| Method | Endpoint | Description | Request Body | Path Variables/Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/progress/{courseId}` | Get student's progress in course | None | `courseId` |
| `POST` | `/progress/{courseId}/chapters/{chapterId}/complete` | Mark a video/text chapter as read | None | `courseId`, `chapterId` |
| `POST` | `/progress/{courseId}/chapters/{chapterId}/assessment` | Submit chapter quiz answers | `{ answers: [1, 2, 0, ...] }` | `courseId`, `chapterId` |
| `POST` | `/progress/{courseId}/grand-assessment` | Submit Final Exam answers | `{ answers: [0, 3, 2, ...] }` | `courseId` |
| `GET` | `/progress/instructor/{courseId}` | Instructor: Get all students' progress | None | `courseId` |

---

## 6. Chat & Messaging (`/messages`)

*Note: For real-time, you would eventually upgrade this to WebSockets (Spring Boot + STOMP). For the MVP REST approach, polling is used.*

| Method | Endpoint | Description | Request Body | Path Variables/Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/messages/{courseId}` | Get chat history for a course | None | `courseId` |
| `POST` | `/messages/{courseId}` | Send a message | `{ toId, message }` | `courseId` |

---

### Key Data Structures / Entity Models (JPA Maps)

Based on this plan, you will need the following core `@Entity` classes in Spring Boot:
1. `User` (Inherited by `Student` and `Instructor`)
2. `Course`
3. `Chapter` (One-to-Many with Course)
4. `Assessment` / `Question` (One-to-One with Chapter or Course for Grand Assessment)
5. `Enrollment` (Many-to-Many Join Table with progress tracking data)
6. `Review`
7. `Message`
