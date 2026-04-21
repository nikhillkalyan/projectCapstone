# EduForge

EduForge is a monorepo-based learning platform with separate apps for the main web portal, admin surfaces, and backend services.

## Monorepo Structure

This repository uses `npm` workspaces.

| App              | Path             | Stack                       | Default Port     |
| :--------------- | :--------------- | :-------------------------- | :--------------- |
| Web Portal       | `apps/web`       | React + Vite + Tailwind CSS | `5173`           |
| Admin Panel      | `apps/admin`     | React + Vite                | `5174`           |
| University Admin | `apps/uni-admin` | React + Vite                | workspace script |
| Backend API      | `apps/backend`   | Spring Boot + Maven         | `8080`           |

## Important

Install frontend dependencies from the **root of the repository only**.

Do not run `npm install` inside `apps/web`, `apps/admin`, or `apps/uni-admin`.

## Prerequisites

- Node.js 18+
- npm 9+
- Java 17+ for the backend

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd CapstoneProject
```

2. Install workspace dependencies from the root:

```bash
npm install
```

Run the following command at the root directory. We use the `--legacy-peer-deps` flag to bypass strict version conflicts commonly caused by MUI and Framer Motion:

```bash
npm install --legacy-peer-deps
```

3. If you are using features that depend on frontend environment variables, create the web app env file:

```bash
cp apps/web/.env.example apps/web/.env
```

Then fill in the required values in `apps/web/.env`.

## Run the Apps

From the repository root:

```bash
npm run dev:web
```

```bash
npm run dev:admin
```

```bash
npm run dev:uni
```

## Run the Backend

From `apps/backend`:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

## Notes for New Contributors

- The frontend refactor inside `apps/web` does not change the workspace setup.
- New users should be fine as long as they install from the root and use the root scripts.
- If something behaves oddly after an interrupted install, delete the root `node_modules` and run `npm install` again.

## License

Proprietary software. All rights reserved.
