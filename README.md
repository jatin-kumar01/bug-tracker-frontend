# BugFlow — React + Tailwind CSS Frontend

Frontend client for the Spring Boot 3 Bug & Issue Tracker backend.

## Tech Stack
- **React 18** + **Vite 6**
- **Tailwind CSS 3** + **Lucide Icons**
- **React Router v7** (Protected & Role-Guarded Routes)
- **Axios** (Automatic JWT Bearer injection + silent Refresh Token rotation on `401`)

## Setup & Run (Windows 11 + PowerShell)

1. Make sure the Spring Boot backend is running on `http://localhost:8080`.
2. Open PowerShell inside `bug-tracker-frontend`:
   ```powershell
   npm install
   npm run dev
   ```
3. Open **`http://localhost:5173`** in your browser.
