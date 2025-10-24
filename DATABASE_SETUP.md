# PostgreSQL Database Setup

This application supports PostgreSQL for persistent storage. Follow these steps to set up the database.

## Prerequisites

- PostgreSQL installed and running (version 12 or higher recommended)
- Database created for the application

## Setup Steps

### 1. Create a PostgreSQL Database

```sql
CREATE DATABASE diagram_generator;
```

Or use any existing PostgreSQL database.

### 2. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit the `.env` file and set your database connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/diagram_generator
```

Replace:
- `username` - your PostgreSQL username
- `password` - your PostgreSQL password
- `localhost` - your database host (use `localhost` for local development)
- `5432` - your PostgreSQL port (default is 5432)
- `diagram_generator` - your database name

### 3. Push Database Schema

Run the following command to create the required tables:

```bash
npm run db:push
```

This will create the following tables:
- `users` - User accounts
- `projects` - Diagram projects
- `diagrams` - Saved diagrams with code and images

### 4. Start the Application

```bash
npm run dev
```

You should see:
```
✓ Using PostgreSQL database storage
```

If the DATABASE_URL is not set, the app will fall back to in-memory storage:
```
⚠ Using in-memory storage (data will be lost on restart)
```

## Database Schema

### Projects Table
- `id` (serial) - Auto-incrementing primary key
- `name` (text) - Project name
- `description` (text) - Optional project description
- `created_at` (timestamp) - Creation timestamp

### Diagrams Table
- `id` (serial) - Auto-incrementing primary key
- `project_id` (integer) - Foreign key to projects table
- `name` (text) - Diagram name
- `diagram_type` (text) - Type: mermaid, graphviz, bpmn, excalidraw
- `format` (text) - Output format: svg or png
- `code` (text) - Diagram source code
- `image_data` (text) - Base64 encoded generated image
- `created_at` (timestamp) - Creation timestamp

## Troubleshooting

### Connection Issues

If you see connection errors:
1. Verify PostgreSQL is running
2. Check your DATABASE_URL format
3. Ensure the database exists
4. Verify your username/password
5. Check firewall settings if connecting to remote database

### Permission Errors

Make sure your PostgreSQL user has:
- CREATE permission on the database
- INSERT, SELECT, UPDATE, DELETE permissions on tables

### Resetting the Database

To reset all data:

```sql
DROP TABLE IF EXISTS diagrams CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then run `npm run db:push` again to recreate the tables.

## Migrating from In-Memory Storage

Since in-memory storage doesn't persist data, you cannot migrate existing data. Simply:
1. Set up the DATABASE_URL
2. Run `npm run db:push`
3. Restart the application
4. All new data will be saved to PostgreSQL

Existing in-memory data will be lost when switching to database storage.
