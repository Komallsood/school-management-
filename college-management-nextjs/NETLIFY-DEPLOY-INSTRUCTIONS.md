# Netlify Deployment - Step by Step Instructions

Follow these steps **one by one** to deploy your app to Netlify.

---

## STEP 1: Set Up Cloud PostgreSQL Database

You need a cloud database because Netlify can't use your local PostgreSQL.

### Option A: Supabase (Recommended - Free)

1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub/Email
4. Click **"New Project"**
5. Fill in:
   - **Name**: `college-management` (or any name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
6. Click **"Create new project"**
7. Wait 1-2 minutes for project to be ready
8. Once ready, go to **Settings** (gear icon) → **Database**
9. Scroll down to **"Connection string"**
10. Click on **"URI"** tab
11. Copy the connection string
    - It looks like: `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
    - Replace `[YOUR-PASSWORD]` with the password you created
    - Add `?sslmode=require` at the end
    - **Example**: `postgresql://postgres.abc123:MyPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`
12. **SAVE THIS CONNECTION STRING** - You'll need it in Step 5

### Option B: Neon (Alternative - Free)

1. Go to **https://neon.tech**
2. Sign up with GitHub
3. Click **"Create a project"**
4. Choose name and region
5. Click **"Create project"**
6. Copy the connection string from dashboard
7. Add `?sslmode=require` at the end

---

## STEP 2: Run Database Migrations on Cloud Database

You need to create the tables in your cloud database.

1. **Open PowerShell** in your project folder
2. **Temporarily update your `.env.local`** with cloud database:
   - Open `.env.local`
   - Replace `DATABASE_URL` with your cloud connection string from Step 1
   - Save the file

3. **Run migrations**:
   ```powershell
   npx prisma migrate deploy
   ```

4. **Verify it worked**:
   - You should see: "All migrations have been successfully applied"
   - If you see errors, check your connection string

5. **Revert `.env.local`** back to localhost (for local development):
   - Change `DATABASE_URL` back to: `postgresql://postgres:komalsood@localhost:5432/college_db?schema=public`

---

## STEP 3: Generate NextAuth Secret

You need a secure secret for production.

1. **Open PowerShell**
2. **Run this command**:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
3. **Copy the output** - This is your `NEXTAUTH_SECRET`
   - Example output: `aBc123XyZ456...` (long string)
   - **SAVE THIS** - You'll need it in Step 5

---

## STEP 4: Push Code to GitHub

Netlify needs your code on GitHub.

### If you don't have Git initialized:

1. **Open PowerShell** in your project folder
2. **Initialize Git**:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for Netlify deployment"
   ```

3. **Create GitHub repository**:
   - Go to **https://github.com**
   - Sign up/Login
   - Click **"+"** → **"New repository"**
   - Name: `college-management` (or any name)
   - **Don't** check "Initialize with README"
   - Click **"Create repository"**

4. **Push your code**:
   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git branch -M main
   git push -u origin main
   ```
   - Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual values

### If you already have Git:

1. **Make sure all changes are committed**:
   ```powershell
   git add .
   git commit -m "Ready for Netlify deployment"
   git push
   ```

---

## STEP 5: Deploy to Netlify

### 5.1: Create Netlify Account

1. Go to **https://app.netlify.com**
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (easiest)
4. Authorize Netlify to access your GitHub

### 5.2: Import Your Project

1. In Netlify dashboard, click **"Add new site"**
2. Click **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. If asked, authorize Netlify to access your repositories
5. **Select your repository** from the list
   - Look for: `college-management` (or your repo name)
6. Click on your repository

### 5.3: Configure Build Settings

1. **Build command**: Should show `npm run build` (leave it)
2. **Publish directory**: **IMPORTANT - Leave this EMPTY!**
   - Don't type anything in this field
   - The Netlify plugin will handle it automatically

3. **Before clicking "Deploy"**, click **"Show advanced"**

### 5.4: Add Environment Variables

Click **"New variable"** and add these **3 variables**:

**Variable 1: DATABASE_URL**
- **Key**: `DATABASE_URL`
- **Value**: Your cloud database connection string from Step 1
- **Scopes**: Check all three (Production, Preview, Development)
- Click **"Add variable"**

**Variable 2: NEXTAUTH_SECRET**
- **Key**: `NEXTAUTH_SECRET`
- **Value**: The secret you generated in Step 3
- **Scopes**: Check all three (Production, Preview, Development)
- Click **"Add variable"**

**Variable 3: NEXTAUTH_URL**
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://placeholder.netlify.app` (we'll update this later)
- **Scopes**: Check all three (Production, Preview, Development)
- Click **"Add variable"**

### 5.5: Deploy

1. Click **"Deploy site"** button
2. **Wait for build** (5-10 minutes on first deploy)
3. You'll see build progress in real-time
4. When done, you'll see **"Site is live"**

---

## STEP 6: Update NEXTAUTH_URL

After deployment, Netlify gives you a URL.

1. **Copy your Netlify URL**:
   - It looks like: `https://college-management-12345.netlify.app`
   - Or: `https://random-name-123.netlify.app`

2. **Update environment variable**:
   - Go to **Site settings** (gear icon) → **Environment variables**
   - Find `NEXTAUTH_URL`
   - Click **"Edit"**
   - Change value to your actual Netlify URL
   - Example: `https://college-management-12345.netlify.app`
   - Click **"Save"**

3. **Redeploy**:
   - Go to **Deployments** tab
   - Click the **three dots (⋯)** on the latest deployment
   - Click **"Redeploy site"**
   - Wait for redeploy to complete

---

## STEP 7: Test Your Deployment

1. **Visit your Netlify URL**
   - Should redirect to `/login`

2. **Test Registration**:
   - Click "Register here"
   - Create a new account
   - Should work without errors

3. **Test Login**:
   - Log in with your credentials
   - Should redirect to dashboard

4. **If you see errors**:
   - Go to **Deployments** → Click latest deploy → **"Runtime Logs"**
   - Check for error messages
   - Common issues:
     - Database connection error → Check `DATABASE_URL`
     - NextAuth error → Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

---

## Troubleshooting

### Build Fails

**Check Build Logs**:
1. Go to **Deployments** tab
2. Click on failed deployment
3. Click **"Build logs"**
4. Look for error messages

**Common fixes**:
- "Prisma Client not found" → Make sure `postinstall` script is in package.json
- "Module not found" → Check all dependencies are in package.json

### 404 Errors

**If all pages show 404**:
1. Check **Runtime Logs** for errors
2. Verify all 3 environment variables are set
3. Make sure `NEXTAUTH_URL` matches your domain exactly

### Database Errors

**"Can't reach database server"**:
1. Verify `DATABASE_URL` is correct
2. Check database is running (not paused)
3. Some free tiers pause after inactivity - wake it up

**"Authentication failed"**:
1. Check username and password in connection string
2. Verify connection string format is correct

---

## Quick Checklist

Before deploying:
- [ ] Cloud PostgreSQL database created
- [ ] Database connection string copied
- [ ] Migrations run on cloud database (`npx prisma migrate deploy`)
- [ ] NextAuth secret generated
- [ ] Code pushed to GitHub

During deployment:
- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build command: `npm run build`
- [ ] Publish directory: **EMPTY**
- [ ] All 3 environment variables added
- [ ] Deploy started

After deployment:
- [ ] `NEXTAUTH_URL` updated to actual domain
- [ ] Site redeployed
- [ ] Tested registration
- [ ] Tested login
- [ ] Checked logs for errors

---

## Your Site URL

After successful deployment:
- **Production URL**: `https://your-site-name.netlify.app`
- You can add a custom domain in **Site settings** → **Domain management**

**Congratulations! Your app is now live on Netlify! 🎉**

