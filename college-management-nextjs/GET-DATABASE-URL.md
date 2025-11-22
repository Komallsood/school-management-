# How to Get Your PostgreSQL Connection String from pgAdmin

## Step 1: Open pgAdmin
1. Launch pgAdmin from your applications
2. Enter your master password if prompted

## Step 2: Find Your Server Connection Details
1. In the left sidebar, expand **Servers**
2. Right-click on your PostgreSQL server (usually named "PostgreSQL" or similar)
3. Select **Properties**
4. Go to the **Connection** tab
5. Note down:
   - **Host name/address**: Usually `localhost` or `127.0.0.1`
   - **Port**: Usually `5432`
   - **Maintenance database**: Usually `postgres`
   - **Username**: Usually `postgres` (or the username you set during installation)
   - **Password**: The password you set for PostgreSQL

## Step 3: Check/Create the Database
1. In pgAdmin, expand your server
2. Expand **Databases**
3. Check if `college_management` database exists
4. If it doesn't exist:
   - Right-click on **Databases**
   - Select **Create** → **Database**
   - Name: `college_management`
   - Click **Save**

## Step 4: Construct Your Connection String
Format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public`

Example:
```
postgresql://postgres:mypassword@localhost:5432/college_management?schema=public
```

## Step 5: Update .env.local
Replace the DATABASE_URL in `.env.local` with your actual connection string.

**Important**: 
- Replace `USERNAME` with your PostgreSQL username
- Replace `PASSWORD` with your PostgreSQL password
- Replace `HOST` with your host (usually `localhost`)
- Replace `PORT` with your port (usually `5432`)
- Replace `DATABASE_NAME` with `college_management`

