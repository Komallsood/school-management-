# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd college-management-nextjs
npm install
```

### 2. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE college_management;
   ```

#### Option B: Use a Cloud Database (Recommended for testing)
- Use services like:
  - [Supabase](https://supabase.com) (Free tier available)
  - [Neon](https://neon.tech) (Free tier available)
  - [Railway](https://railway.app) (Free tier available)

### 3. Configure Environment Variables

Create `.env.local` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/college_management?schema=public"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init
```

### 5. (Optional) Seed Database with Sample Data

You can use Prisma Studio to manually add data, or create a seed script.

### 6. Start Development Server

```bash
npm run dev
```

### 7. Access the Application

- Open [http://localhost:3000](http://localhost:3000)
- You'll be redirected to the login page
- Register a new account (Teacher or Student)
- Start using the system!

## First Steps After Setup

1. **Register as a Teacher**
   - Go to `/register`
   - Select "Teacher" as user type
   - Fill in your details
   - Login with your credentials

2. **Create Your First Course**
   - After logging in, you'll see the Courses page
   - Click "Add Course"
   - Fill in course details
   - Save

3. **Register Students** (Optional)
   - Logout
   - Register new accounts as "Student"
   - Students can now enroll in courses (enrollment feature can be added)

4. **Start Managing**
   - Add marks for students
   - Upload course content
   - Mark attendance
   - Answer student queries

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready` or check service status
- Check DATABASE_URL format
- Ensure database exists
- Verify username/password are correct

### Migration Errors
- If migrations fail, try: `npx prisma migrate reset` (WARNING: This deletes all data)
- Check Prisma schema for syntax errors
- Ensure database user has CREATE TABLE permissions

### Authentication Issues
- Verify NEXTAUTH_SECRET is set in `.env.local`
- Check NEXTAUTH_URL matches your current URL
- Clear browser cookies if login fails

### Build Errors
- Run `npx prisma generate` after any schema changes
- Delete `.next` folder: `rm -rf .next` (Linux/Mac) or `rmdir /s .next` (Windows)
- Check TypeScript errors: `npm run type-check`

## Production Deployment

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Build for Production
```bash
npm run build
npm start
```

### Database Migrations in Production
```bash
npx prisma migrate deploy
```

## Need Help?

- Check the main README.md for detailed documentation
- Review Prisma documentation: https://www.prisma.io/docs
- Check Next.js documentation: https://nextjs.org/docs

