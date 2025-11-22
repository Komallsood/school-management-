# Deployment Guide

This guide will help you deploy the College Management System to various platforms.

## Prerequisites

1. **Cloud PostgreSQL Database** - You need a cloud-hosted PostgreSQL database. Options:
   - [Supabase](https://supabase.com) - Free tier available
   - [Neon](https://neon.tech) - Free tier available
   - [Railway](https://railway.app) - Free tier available
   - [Render](https://render.com) - Free tier available
   - [ElephantSQL](https://www.elephantsql.com) - Free tier available

2. **Environment Variables** - You'll need to set these in your deployment platform:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your deployed app URL (e.g., `https://your-app.netlify.app`)

## Step 1: Set Up Cloud Database

1. Create an account on one of the database providers above
2. Create a new PostgreSQL database
3. Copy the connection string (it will look like: `postgresql://user:password@host:port/database?sslmode=require`)

## Step 2: Run Database Migrations

Before deploying, run migrations on your cloud database:

```bash
# Set your cloud DATABASE_URL temporarily
export DATABASE_URL="your_cloud_database_url"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

Or update your `.env` file with the cloud database URL and run:
```bash
npx prisma migrate deploy
```

## Step 3: Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is built by the Next.js team and offers the best Next.js experience.

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New Project"
   - Import your repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (will be auto-filled after first deploy)
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel login
   vercel
   vercel --prod
   ```

4. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables

5. **Run Migrations**:
   After first deployment, run migrations:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Option 2: Deploy to Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy via Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables in Site settings → Environment variables

3. **Deploy via CLI**:
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### Option 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL service:
   - Click "+ New" → "Database" → "PostgreSQL"
6. Add environment variables to your app service
7. Railway will auto-deploy on git push

### Option 4: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up/Login
3. Click "New" → "Web Service"
4. Connect your repository
5. Build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
6. Add PostgreSQL database:
   - Click "New" → "PostgreSQL"
7. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

## Post-Deployment Steps

1. **Run Database Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Verify Environment Variables**:
   - Check that all variables are set correctly
   - Ensure `NEXTAUTH_URL` matches your deployed URL

3. **Test the Application**:
   - Visit your deployed URL
   - Test registration
   - Test login
   - Test all features

## Troubleshooting

### Build Fails
- Check that `DATABASE_URL` is set correctly
- Ensure Prisma Client is generated (runs automatically via `postinstall`)
- Check build logs for specific errors

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if database allows connections from your deployment platform
- Some providers require SSL: add `?sslmode=require` to connection string

### NextAuth Errors
- Ensure `NEXTAUTH_URL` matches your deployed domain exactly
- Verify `NEXTAUTH_SECRET` is set and is a secure random string
- Check that cookies are allowed in browser

### Prisma Errors
- Run `npx prisma generate` before building
- Ensure migrations are run: `npx prisma migrate deploy`
- Check Prisma version compatibility

## Environment Variables Reference

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public&sslmode=require"

# NextAuth (REQUIRED)
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://your-app-domain.com"
```

## Notes

- Never commit `.env.local` or `.env` files to Git
- Always use environment variables in your deployment platform
- Update `NEXTAUTH_URL` after first deployment to match your actual domain
- Run database migrations after setting up the cloud database
- Some platforms may require additional configuration for serverless functions

