# Quick Deployment Checklist

## Before Deploying

- [ ] Set up cloud PostgreSQL database (Supabase, Neon, Railway, etc.)
- [ ] Get database connection string
- [ ] Generate `NEXTAUTH_SECRET` (run: `openssl rand -base64 32`)
- [ ] Know your deployment URL (will be provided by platform)

## Deployment Steps

1. **Set up database** → Get connection string
2. **Run migrations** → `npx prisma migrate deploy`
3. **Deploy to platform** → Follow platform-specific guide in `DEPLOYMENT.md`
4. **Set environment variables** in deployment platform:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
5. **Test deployment** → Visit your deployed URL

## Environment Variables

Set these in your deployment platform:

```
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app-domain.com
```

## Build Commands

The project is configured with:
- `npm run build` - Builds the project (includes Prisma generation)
- `npm run postinstall` - Auto-runs Prisma generate after install

## Supported Platforms

✅ Vercel (Recommended)
✅ Netlify
✅ Railway
✅ Render
✅ Any Node.js hosting platform

See `DEPLOYMENT.md` for detailed instructions.

