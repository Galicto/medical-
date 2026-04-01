# Deployment Guide

## Docker Deployment (Production)

1. **Build Images**:
   ```bash
   docker build -t medlife-backend ./backend
   docker build -t medlife-frontend ./frontend
   ```

2. **Run Containers**:
   Use the provided `docker-compose.yml` (update environment variables for production).

   ```bash
   docker-compose up -d
   ```

## render.com (Alternative)

### Backend
1. Create a new Web Service.
2. Connect Git repo.
3. Root Directory: `backend`
4. Build Command: `npm install && npx prisma generate && npm run build`
5. Start Command: `npm start`
6. Add Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).

### Frontend
1. Create a new Static Site.
2. Connect Git repo.
3. Root Directory: `frontend`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`

## Database (Supabase/Neon/Railway)
1. Provision a PostgreSQL database.
2. Get the connection string.
3. Update `DATABASE_URL` in backend env vars.
4. Run migrations: `npx prisma migrate deploy` (from local or via CI/CD).
