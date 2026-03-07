# Spring Boot + PostgreSQL Backend Approach

## Overview
This document outlines the technical approach for building the Capstone Project backend using **Spring Boot 3.x** and **PostgreSQL**. The backend will replace the current React frontend's mock database (`mockDatabase.js`), providing a robust, scalable, and secure RESTful API.

## 1. Tech Stack
- **Framework**: Spring Boot (Java 17+)
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT (JSON Web Tokens)
- **Validation**: Spring Boot Validation (Hibernate Validator)
- **API Documentation**: Springdoc OpenAPI (Swagger UI)
- **Build Tool**: Maven or Gradle
- **Migration**: Flyway or Liquibase (for reliable DB schema management)

---

## 2. Architecture Pattern
We will use the standard N-Tier architecture:
1. **Controller Layer (`@RestController`)**: Handles HTTP requests, enforces security/roles, and maps DTOs to responses.
2. **Service Layer (`@Service`)**: Contains core business logic.
3. **Repository Layer (`@Repository`)**: Spring Data JPA interfaces for database operations.
4. **Entity Layer (`@Entity`)**: JPA Entities mapping exactly to PostgreSQL tables.
5. **DTO Layer**: Data Transfer Objects to prevent exposing internal entity structures.

---

## 3. Database Schema Mapping (PostgreSQL)

Based on the frontend requirements, here is the relational schema design:

### `users` table
Use Single Table Strategy or Joined Strategy for inheritance, or standard relational separation mapping `students` and `instructors` referencing `users`.
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, BCrypt encoded)
- `role` (VARCHAR) - Enum: `STUDENT`, `INSTRUCTOR`
- `avatar_url` (VARCHAR)
- `joined_at` (TIMESTAMP)

### `students` table (extends users or 1:1 relation)
- `user_id` (UUID, PK, FK to `users.id`)
- `college` (VARCHAR)
- `year_of_study` (VARCHAR)
- `bio` (TEXT)

### `instructors` table (extends users or 1:1 relation)
- `user_id` (UUID, PK, FK to `users.id`)
- `qualification` (VARCHAR)
- `experience` (VARCHAR)
- `specialization` (VARCHAR)
- `bio` (TEXT)
- `rating` (FLOAT)

### `courses` table
- `id` (UUID, PK)
- `title` (VARCHAR)
- `instructor_id` (UUID, FK to `instructors.user_id`)
- `category` (VARCHAR)
- `level` (VARCHAR)
- `duration` (VARCHAR)
- `thumbnail` (VARCHAR)
- `preview_video` (VARCHAR)
- `description` (TEXT)
- `long_description` (TEXT)
- `price` (DECIMAL or VARCHAR)
- `rating` (FLOAT)
- `created_at` (TIMESTAMP)

### `chapters` table
- `id` (UUID, PK)
- `course_id` (UUID, FK to `courses.id`)
- `title` (VARCHAR)
- `duration` (VARCHAR)
- `type` (VARCHAR) - Enum: `video`, `text`
- `video_url` (VARCHAR)
- `text_content` (TEXT)
- `chapter_order` (INT)

### `assessments` table
- `id` (UUID, PK)
- `chapter_id` (UUID, nullable, FK to `chapters.id`)
- `course_id` (UUID, nullable, FK to `courses.id`) - for Grand Assessments
- `title` (VARCHAR)
- `passing_score` (INT)

### `questions` table
- `id` (UUID, PK)
- `assessment_id` (UUID, FK to `assessments.id`)
- `question_text` (TEXT)
- `correct_option_index` (INT)

### `options` table
- `id` (UUID, PK)
- `question_id` (UUID, FK to `questions.id`)
- `option_text` (VARCHAR)
- `option_index` (INT)

### Relationships & Joins tables
- `student_enrolled_courses`: (`student_id`, `course_id`)
- `student_favorite_courses`: (`student_id`, `course_id`)
- `student_progress`: Tracks chapter completion and scores (`student_id`, `chapter_id`, `completed`, `assessment_score`, `completed_at`)
- `course_reviews`: (`id`, `course_id`, `student_id`, `rating`, `review_text`, `created_at`)
- `messages`: (`id`, `from_id`, `to_id`, `course_id`, `message_text`, `timestamp`, `is_read`)

---

## 4. API Endpoints Contract

### Auth API (`/api/auth`)
- `POST /login`: Authenticates user, returns JWT and user profile.
- `POST /register`: Registers a new Student or Instructor.

### Student API (`/api/students`)
- `GET /me`: Returns logged-in student profile.
- `PUT /me`: Updates profile (bio, interests).
- `GET /me/enrolled`: Returns enrolled courses.
- `POST /me/enroll/{courseId}`: Enrolls student in a course.
- `GET /me/favorites`: Returns favorite courses.
- `POST /me/favorites/{courseId}`: Adds/Removes from favorites.
- `POST /progress/{courseId}/{chapterId}`: Updates chapter progress / assessment score.

### Instructor API (`/api/instructors`)
- `GET /me`: Returns instructor profile and stats.
- `GET /courses`: Returns courses created by the instructor.
- `POST /courses`: Creates a new course.
- `PUT /courses/{courseId}`: Updates a course.
- `GET /courses/{courseId}/students`: Returns student progress for a course.

### Course API (`/api/courses`)
- `GET /`: Lists all courses (with filters: category, search).
- `GET /{courseId}`: Returns detailed course data including chapters.
- `POST /{courseId}/reviews`: Submits a review.

### Messaging API (`/api/messages`)
- `GET /{courseId}/{userId}`: Gets chat history between two users for a specific course.
- `POST /`: Sends a new message.

---

## 5. Security & Implementation Details
- **JWT Authentication**: A filter sitting before the controllers will validate the `Bearer` token in the `Authorization` header.
- **Role-Based Access Control**:
  - `@PreAuthorize("hasRole('STUDENT')")` for student-only endpoints.
  - `@PreAuthorize("hasRole('INSTRUCTOR')")` for instructor functionalities.
- **Exception Handling**: Use `@ControllerAdvice` to handle global and custom exceptions returning standard JSON error payloads `{"error": "...", "status": 400}`.
- **CORS Configuration**: Enable CORS mappings for the React development server (usually `http://localhost:5173`).

## 6. Development Workflow Plan
1. Initialize Spring Boot project via **Spring Initializr**.
2. Setup `application.yml` with PostgreSQL connection strings.
3. Create JPA Entities matching the schemas.
4. Implement Spring Security and JWT Utilities.
5. Create REST Controllers & Services incrementally matching Frontend needs.
6. Test using Postman before hooking completely to React `Axios/fetch` calls.
