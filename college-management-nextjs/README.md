# College Management System - Next.js

A professional college management system built with Next.js, Tailwind CSS, and PostgreSQL. This system provides separate dashboards for teachers and students with comprehensive features for course management, marks, attendance, content, and queries.

## Features

### Teacher Dashboard
- ✅ Course Management (Create, View, Delete)
- ✅ Student Marks Management
- ✅ Progress Reports
- ✅ Content Upload
- ✅ Attendance Management
- ✅ Student Query Management

### Student Dashboard
- ✅ Dashboard Overview with Statistics
- ✅ View Marks and Grades
- ✅ Progress Tracking
- ✅ Attendance Records
- ✅ Course Content Access
- ✅ Query Submission to Teachers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd college-management-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and update:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate a random secret (you can use `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your application URL (http://localhost:3000 for development)

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

### PostgreSQL Connection String Format
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
```

Example:
```
postgresql://postgres:password@localhost:5432/college_management?schema=public
```

### Running Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

## Project Structure

```
college-management-nextjs/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── courses/      # Course management
│   │   ├── marks/        # Marks management
│   │   ├── attendance/   # Attendance management
│   │   ├── content/      # Content management
│   │   └── queries/      # Query management
│   ├── teacher/          # Teacher dashboard pages
│   ├── student/          # Student dashboard pages
│   ├── login/            # Login page
│   └── register/         # Registration page
├── components/          # React components
├── lib/                  # Utility functions
│   ├── db.ts            # Prisma client
│   └── auth.ts          # NextAuth configuration
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript type definitions
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `DELETE /api/courses/[id]` - Delete course

### Marks
- `GET /api/marks` - Get marks (filtered by course/student)
- `POST /api/marks` - Add new mark
- `DELETE /api/marks/[id]` - Delete mark

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance records
- `DELETE /api/attendance/[id]` - Delete attendance record

### Content
- `GET /api/content` - Get course content
- `POST /api/content` - Upload content
- `DELETE /api/content/[id]` - Delete content

### Queries
- `GET /api/queries` - Get queries
- `POST /api/queries` - Submit query (students)
- `PATCH /api/queries/[id]` - Answer query (teachers)

### Progress
- `GET /api/progress` - Get progress reports

## Usage

### For Teachers

1. **Register/Login** as a teacher
2. **Create Courses** - Add courses you teach
3. **Manage Marks** - Add marks for student assessments
4. **Track Progress** - View student progress reports
5. **Upload Content** - Share course materials
6. **Manage Attendance** - Mark student attendance
7. **Answer Queries** - Respond to student questions

### For Students

1. **Register/Login** as a student
2. **View Dashboard** - See overview statistics
3. **Check Marks** - View all your marks and grades
4. **Track Progress** - Monitor your academic progress
5. **View Attendance** - Check your attendance records
6. **Access Content** - Download course materials
7. **Submit Queries** - Ask questions to teachers

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Application URL

## Security Notes

- Passwords are hashed using bcrypt
- Authentication is handled via NextAuth.js with JWT
- API routes are protected with session validation
- Middleware protects dashboard routes

## Future Enhancements

- [ ] File upload functionality for course content
- [ ] Email notifications
- [ ] Real-time updates
- [ ] Advanced reporting and analytics
- [ ] Mobile responsive improvements
- [ ] Course enrollment system
- [ ] Grade calculation automation
- [ ] Export functionality (PDF, Excel)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Check network/firewall settings

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies/session storage

### Build Errors
- Run `npx prisma generate` after schema changes
- Delete `.next` folder and rebuild
- Check TypeScript errors with `npm run type-check`

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the documentation or create an issue in the repository.
