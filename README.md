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
* **Node.js** (LTS v18+ or v20+)
* **Java Development Kit** (JDK 17 or higher)

### Setup & Installation

**CRITICAL:** This project uses an **NPM Workspaces** monorepo structure. You must install dependencies **only from the root directory**. Do not navigate into `apps/web` or `apps/admin` to run `npm install`.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CapstoneProject
   ```

2. **Clean up old modules (Optional, if you had failed installs)**
   If you previously tried to install and got errors, clear your node modules first:
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force node_modules
   
   # Mac/Linux
   rm -rf node_modules
   ```

3. **Install Dependencies**
   Run the following command at the root directory. We use the `--legacy-peer-deps` flag to bypass strict version conflicts commonly caused by MUI and Framer Motion:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running the Services

**Terminal 1: Run the Backend API**
Open a terminal and navigate to the backend service:
```bash
cd apps/backend
./mvnw spring-boot:run
```

**Terminal 2: Run the Frontends**
Stay in the **root directory** (`CapstoneProject/`) in a new terminal, and use our workspace scripts:

* To start the **Main Web App**:
  ```bash
  npm run dev:web
  ```
* To start the **Admin Panel**:
  ```bash
  npm run dev:admin
  ```

*(Local servers will hot-reload automatically upon code changes).*

---

## 🛡️ License & Contributing

Proprietary Software - Developed exclusively for the Capstone requirements. All Rights Reserved.
