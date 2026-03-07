# Video Content Storage Architecture

This document provides a guide on how we handle video persistence and retrieval for the EduForge Learning Management System (LMS). It outlines two approaches: an initial Minimum Viable Product (MVP) approach suited for getting the project off the ground, and a Production-level approach suited for scaling.

## Phase 1: MVP Approach (Current Strategy)

In the initial version, we avoid storing or streaming physical video files directly on our backend to keep costs low and system resources free for computation.

### How it works:
1. **Hosting:** Instructors upload their course videos to a free, third-party hosting site like YouTube (setting the visibility to 'Unlisted' so they don't appear in public YouTube searches).
2. **Database Storage:** During course creation, the instructor simply pastes the YouTube URL into our frontend form.
3. **Backend Action:** Our Spring Boot backend receives this URL string (e.g., `https://www.youtube.com/watch?v=...`) and saves it directly into the PostgreSQL database under the `chapters` or `lessons` table.
4. **Retrieval & Playback:** When a student opens a course chapter, the backend sends the stored URL to the React frontend. The frontend uses an embedded iframe (or a react-player component) to stream the video seamlessly.

**Pros:** 100% free, zero server load, global CDN scaling handled by YouTube, instant setup.

---

## Phase 2: Production & Scale Approach

As EduForge grows and requires stricter content privacy and direct file uploads (where the instructor uploads raw `.mp4` files from their machine), the architecture must evolve. Storing physical files in a PostgreSQL database is highly discouraged due to extreme database bloat, slow backups, and terrible streaming performance.

### How it works (AWS S3 Example):
1. **Upload:** The Instructor selects a video file (`.mp4`) on the React frontend.
2. **Backend Processing:** 
    - The file is securely transmitted to the Spring Boot backend via a Multipart API request.
    - The Spring Boot backend acts as a bridge. It instantly uploads this file to a dedicated Cloud Object Storage service like **Amazon S3** (or Google Cloud Storage).
    - Upon successful upload, S3 returns a unique, permanent URL tracking where that specific file lives (e.g., `https://eduforge-bucket.s3.amazonaws.com/courses/101/chapter-1.mp4`).
3. **Database Storage:** The Spring Boot backend takes this plain text S3 URL and saves it into the PostgreSQL database. The heavy `.mp4` file is safely housed in the cloud storage bucket; the database only holds the reference URL.
4. **Retrieval & Playback:** 
    - When a student requests a video lesson, the backend queries PostgreSQL for the S3 URL.
    - The backend can optionally generate a "Pre-signed URL" (a temporary, secure link that expires after a few hours) to ensure extreme privacy.
    - This secure URL is sent to the frontend.
    - The frontend (`<video>` tag) streams the huge `.mp4` file directly from the S3 bucket to the student's browser.

**Pros:** Total data ownership, complete privacy (no YouTube branding), scalable storage designed explicitly for heavy files, fast streaming via CDN, while keeping the primary PostgreSQL database extremely lightweight and fast.
