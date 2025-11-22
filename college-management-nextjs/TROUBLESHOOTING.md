# Troubleshooting Guide - Localhost Not Showing Anything

## Common Issues and Solutions

### 1. Server Not Running

**Check if server is running:**
```powershell
# Check if Node.js process is running
Get-Process -Name node -ErrorAction SilentlyContinue

# Start the server
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 2. Missing Environment Variables

**Check if .env.local exists:**
```powershell
Test-Path .env.local
```

**If missing, create it:**
```powershell
# Copy from example
Copy-Item .env.example .env.local

# Or create manually with:
DATABASE_URL="postgresql://user:password@localhost:5432/college_management?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Prisma Client Not Generated

**Generate Prisma Client:**
```powershell
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

### 4. Database Connection Issues

**If you don't have PostgreSQL set up yet, you can:**

**Option A: Use a temporary SQLite database (for testing)**

1. Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Run migrations:
   ```powershell
   npx prisma migrate dev --name init
   ```

**Option B: Use a cloud database (Recommended)**

1. Sign up for free at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Get your connection string
3. Update `.env.local` with the connection string

### 5. Port Already in Use

**Check if port 3000 is in use:**
```powershell
netstat -ano | findstr :3000
```

**Kill the process or use a different port:**
```powershell
# Use port 3001 instead
npm run dev -- -p 3001
```

### 6. Browser Cache Issues

**Clear browser cache or try:**
- Incognito/Private mode
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Different browser

### 7. Check for Compilation Errors

**Look for errors in terminal:**
- Red error messages
- TypeScript errors
- Missing dependencies

**Fix missing dependencies:**
```powershell
npm install
```

### 8. Check Browser Console

**Open browser developer tools (F12) and check:**
- Console tab for JavaScript errors
- Network tab for failed requests
- Any error messages

### 9. Verify File Structure

**Ensure these files exist:**
- `app/page.tsx` - Home page (redirects to /login)
- `app/login/page.tsx` - Login page
- `app/layout.tsx` - Root layout
- `app/providers.tsx` - Session provider

### 10. Quick Test - Minimal Setup

**If nothing works, try this minimal test:**

1. Create a simple test page:
   ```typescript
   // app/test/page.tsx
   export default function Test() {
     return <h1>It Works!</h1>
   }
   ```

2. Visit: http://localhost:3000/test

3. If this works, the issue is with the main pages

## Step-by-Step Debugging

1. **Check server is running:**
   ```powershell
   npm run dev
   ```
   Should see: "Ready in X.Xs"

2. **Check browser:**
   - Go to http://localhost:3000
   - Should redirect to /login
   - Check browser console (F12) for errors

3. **Check terminal output:**
   - Look for compilation errors
   - Look for runtime errors
   - Check if pages are compiling

4. **Check database:**
   ```powershell
   npx prisma studio
   ```
   Should open Prisma Studio (even if database is empty)

5. **Check environment:**
   ```powershell
   # In Node.js REPL
   node
   > process.env.DATABASE_URL
   ```

## Still Not Working?

1. **Delete and rebuild:**
   ```powershell
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules
   npm install
   npx prisma generate
   npm run dev
   ```

2. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be 18 or higher

3. **Check Next.js installation:**
   ```powershell
   npx next --version
   ```

## Getting Help

If none of these work, check:
- Terminal output for specific error messages
- Browser console for JavaScript errors
- Network tab for failed API calls
- Verify all files are in the correct locations

