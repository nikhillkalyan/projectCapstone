# EduForge 🚀

> A modern, comprehensive Learning Management System (LMS) designed to bridge the gap between instructors and students through an intuitive, interactive, and seamless educational experience.

![EduForge Tech Stack](https://img.shields.io/badge/Tech_Stack-Monorepo-blue) ![Spring Boot Backend](https://img.shields.io/badge/Backend-Spring_Boot-green) ![Vite Frontend](https://img.shields.io/badge/Frontend-React_+_Vite-61dafb) ![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_v4-38bdf8)

EduForge is a scalable, cloud-ready e-learning platform structured as an NPM Workspace Monorepo. It empowers educators to seamlessly create courses and track analytics, while providing students with an engaging interface to consume content and track their learning progress.

---

## ✨ Features

### For Instructors
* **Course Management Studio**: Create, edit, and organize dynamic course curriculum.
* **Student Tracking & Analytics**: Monitor overall progress and chapter-by-chapter quiz assessments in real time.
* **Instructor Chat & Communication**: Directly interface with enrolled students.

### For Students
* **Sleek Course Player**: A distraction-free environment to consume video and textual content natively.
* **Progress Gamification**: Real-time progress updates matching assessments and completed modules.
* **Smart Dashboards**: Manage enrolled, favorite, and completed courses at a glance.

### Platform Admins (Internal)
* **Comprehensive Backoffice**: An isolated Admin terminal (`apps/admin`) to oversee users, enforce system verification, and manage global settings.

---

## 🏗 Architecture & Stack 

This project uses **NPM Workspaces** to easily manage multiple interconnected applications from a single root directory.

| Component | Path | Architecture | Port |
| :--- | :--- | :--- | :--- |
| **Web Client** | `apps/web` | React.js (Vite), Tailwind CSS v4, Context API | `:5173` |
| **Admin Panel** | `apps/admin` | React.js (Vite), Tailwind CSS v4 | `:5174` |
| **Core API** | `apps/backend` | Java 21, Spring Boot, Spring Security, Maven | `:8080` |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v20+)
* **Java Development Kit** (JDK 17 or higher)
* **Maven** (optional, comes with `mvnw` wrapper)

### Installation

1. **Clone the repository and install root dependencies**
   ```bash
   git clone <repository-url>
   cd CapstoneProject
   
   # Using NPM workspaces, this will cleanly install dependencies for all frontend apps
   npm install
   ```

2. **Run the Backend API**
   Open a terminal and navigate to the backend service:
   ```bash
   cd apps/backend
   ./mvnw spring-boot:run
   ```

3. **Run the Student/Instructor Frontend**
   Open a second terminal:
   ```bash
   cd apps/web
   npm run dev
   ```

4. **Run the Admin Panel**
   Open a third terminal:
   ```bash
   cd apps/admin
   npm run dev
   ```

*(Local servers will hot-reload automatically upon code changes).*

---

## 🛡️ License & Contributing

Proprietary Software - Developed exclusively for the Capstone requirements. All Rights Reserved.
