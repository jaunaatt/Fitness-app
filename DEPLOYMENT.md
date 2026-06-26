# ForgeFit — Deployment Guide

This guide covers how to deploy the ForgeFit application to production using **Render** for the Spring Boot backend and PostgreSQL database, and **Netlify** for the React Vite frontend.

## 1. Database Provisioning (Neon or Render)

You can use either Render's managed PostgreSQL or a serverless provider like Neon.

1. Create a PostgreSQL database.
2. Obtain the connection string (it will look like `postgresql://user:password@host/dbname`).
3. Note: Spring Boot's Hibernate configuration (`ddl-auto=update`) will automatically create the tables on the first run.

## 2. Backend Deployment (Render)

The backend is containerized using Docker, making it easy to deploy as a Web Service on Render.

1. In Render, create a new **Web Service**.
2. Connect your GitHub repository.
3. **Build Filter / Root Directory**: Set the root directory to `fitness-backend/` (or leave blank if deploying from the root with a custom build command, but using Docker is recommended).
4. **Environment**: Select `Docker`. Render will automatically detect the `Dockerfile` inside `fitness-backend/`.
5. **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A long, secure random string (at least 256 bits/32 characters).
   - `CORS_ALLOWED_ORIGIN`: The URL of your frontend (e.g., `https://forgefit-app.netlify.app`). Do not use a trailing slash.
   - `PORT`: (Optional) Render sets this automatically, but you can explicitly set it to `8080`.
   - `SPRING_PROFILES_ACTIVE`: `prod`

### Cold Starts
> **Note on Free Tier:** Render spins down free Web Services after 15 minutes of inactivity. When the frontend wakes the backend up, the first request may take up to 50 seconds. To mitigate this, you can configure a free service like UptimeRobot to ping the `/api/auth/login` (or a dedicated health endpoint) every 14 minutes.

## 3. Frontend Deployment (Netlify)

The React SPA is configured to be easily deployed to Netlify.

1. In Netlify, select **Add new site** -> **Import an existing project**.
2. Connect your GitHub repository.
3. The `netlify.toml` file in `fitness-frontend/` will automatically configure the base directory, build command (`npm run build`), and publish directory (`dist`), as well as the SPA routing rules.
4. **Environment Variables**:
   - Navigate to Site Settings -> Environment Variables.
   - Add `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://forgefit-backend.onrender.com/api`).

## 4. Local Development

To run the application locally in a production-like environment (with PostgreSQL):

1. Ensure Docker Desktop is running.
2. From the `fitness-backend/` directory, run:
   ```bash
   docker compose up -d
   ```
   This spins up the local Postgres container.
3. Start the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
4. In a separate terminal, start the frontend:
   ```bash
   cd fitness-frontend
   npm run dev
   ```
