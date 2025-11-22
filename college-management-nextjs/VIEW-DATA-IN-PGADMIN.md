# How to View Data in pgAdmin

## Step-by-Step Instructions

### 1. Open pgAdmin and Connect
- Open pgAdmin
- Expand **Servers** in the left sidebar
- Expand **PostgreSQL 18** (or your server name)
- Make sure it's connected (should show a green icon)

### 2. Navigate to Your Database
- Expand **Databases**
- Expand **college_db** (this is your database name)
- Expand **Schemas**
- Expand **public**
- Expand **Tables**

### 3. View the User Table
- Right-click on **User** table
- Select **View/Edit Data** → **All Rows**
- You should see your registered users!

### 4. View Other Tables
- **Course** - Contains all courses
- **Mark** - Contains all student marks
- **Enrollment** - Contains course enrollments
- **Attendance** - Contains attendance records
- **Content** - Contains course content
- **Query** - Contains student queries

## Quick Check - Run This Query

1. Right-click on **college_db** database
2. Select **Query Tool**
3. Run this query:
```sql
SELECT * FROM "User";
```

You should see all registered users!

## If You Still Don't See Data

1. **Refresh pgAdmin:**
   - Right-click on **college_db** → **Refresh**
   - Or press F5

2. **Check you're in the right database:**
   - Make sure you're looking at **college_db** (not postgres or another database)

3. **Check the connection:**
   - In pgAdmin, the connection string shows: `host=localhost port=5432 dbname=college_db`
   - Make sure this matches your `.env` file

## Current Data in Database

Based on the test, you have:
- **2 Users** (komal - STUDENT, kajal - TEACHER)
- **1 Course**
- **0 Marks** (no marks added yet)
- **0 Enrollments** (no enrollments yet)

