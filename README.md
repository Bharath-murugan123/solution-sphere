
# Solution Sphere — Local Full-Stack Project

A local development version of the Solution Sphere innovation platform.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)
- Authentication: JWT + bcrypt password hashing

## Requirements
Install Node.js 20 or newer (LTS recommended). Check with:
```bash
node -v
npm -v
```

## Setup (Windows PowerShell)
1. Extract the ZIP file.
2. Open a terminal in the extracted `solutionsphere-local` folder.
3. Install all dependencies:
   ```bash
   npm run install:all
   ```
4. Create the local environment file:
   ```powershell
   Copy-Item server/.env.example server/.env
   ```
   If using Command Prompt instead:
   ```cmd
   copy server\.env.example server\.env
   ```
5. Start both frontend and backend:
   ```bash
   npm run dev
   ```
6. Open http://localhost:5173

The API runs at http://localhost:4000 and the SQLite database is created automatically at `server/data/solutionsphere.db`.

## Demo flow
- Create an account using Sign Up.
- Sign in with that account.
- Browse, search and filter challenges.
- Save challenges and apply to challenges.
- View dashboard statistics, profile and achievements.

## Useful commands
Run frontend and backend together:
```bash
npm run dev
```
Run only frontend:
```bash
npm run dev:client
```
Run only backend:
```bash
npm run dev:server
```
Build frontend:
```bash
npm run build
```

## Notes
- This is a local development starter, not production-hardened.
- Change `JWT_SECRET` in `server/.env` before any deployment.
- Seeded challenge deadlines and leaderboard examples are sample/demo data.
- Team management, messaging, recruiter workflows, file uploads, email verification, password reset and AI recommendations are not implemented as live services in this starter.


## Content and product notes
- The interface deliberately avoids unverified platform-wide user, reward, or impact claims.
- Challenge listings and application counts are seeded demonstration data, not live opportunities or real platform metrics.
- The current build is a prototype foundation; review challenge owners, deadlines, privacy copy, and operating policies before public launch.
