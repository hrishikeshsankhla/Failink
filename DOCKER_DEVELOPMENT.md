# 🐳 Docker Development Setup

## Overview
This project uses Docker for development with SQLite database sharing among team members.

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### First Time Setup
1. Clone the repository
2. Create the shared data directory:
   ```bash
   mkdir shared_data
   ```
3. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Daily Development
```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

## Database Management

### SQLite Database Location
- **Host**: `./shared_data/db.sqlite3`
- **Container**: `/app/shared_data/db.sqlite3`

### Database Operations
```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser

# Load sample data
docker-compose -f docker-compose.dev.yml exec backend python manage.py loaddata sample_data

# Reset database (⚠️ WARNING: This deletes all data)
docker-compose -f docker-compose.dev.yml down
rm shared_data/db.sqlite3
docker-compose -f docker-compose.dev.yml up --build
```

## Team Collaboration

### Database Sharing
- The SQLite database is stored in `./shared_data/db.sqlite3`
- This file is **NOT** committed to Git (see `.gitignore`)
- Team members can share database dumps or start fresh

### Sharing Database State
```bash
# Export database
docker-compose -f docker-compose.dev.yml exec backend python manage.py dumpdata > shared_data/dump.json

# Import database
docker-compose -f docker-compose.dev.yml exec backend python manage.py loaddata shared_data/dump.json
```

### Fresh Start for New Team Members
1. Clone the repository
2. Create `shared_data` directory
3. Run migrations to create fresh database:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
   docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
   ```

## Linux-Specific Setup

### File Permissions Issue
If you're on Linux and not seeing saved data, it's likely a file permissions issue. Use the Linux-specific setup script:

```bash
# Make the script executable
chmod +x scripts/dev-setup-linux.sh

# Run the Linux setup
./scripts/dev-setup-linux.sh
```

### Manual Permission Fix
If the script doesn't work, manually fix permissions:

```bash
# Get your user ID and group ID
export UID=$(id -u)
export GID=$(id -g)

# Set proper permissions
sudo chown -R $UID:$GID shared_data/
chmod 755 shared_data/
chmod 644 shared_data/db.sqlite3 2>/dev/null || true

# Restart containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Database Sharing Between Team Members

#### Using the Database Sharing Script
```bash
# Make the script executable
chmod +x scripts/share-database.sh

# Export your database for sharing
./scripts/share-database.sh export

# Import a shared database
./scripts/share-database.sh import

# Check database status
./scripts/share-database.sh status

# Reset to fresh database
./scripts/share-database.sh reset
```

#### Manual Database Sharing
1. **Export your database**:
   ```bash
   # Stop containers to avoid locks
   docker-compose -f docker-compose.dev.yml down
   
   # Create exports directory
   mkdir -p shared_data/exports
   
   # Export to JSON (portable across platforms)
   docker-compose -f docker-compose.dev.yml up -d
   docker-compose -f docker-compose.dev.yml exec backend python manage.py dumpdata \
     --exclude auth.permission \
     --exclude contenttypes \
     --indent 2 > shared_data/exports/my_database.json
   ```

2. **Share the export file** with your team member (via Git, email, etc.)

3. **Import the database** (for your friend):
   ```bash
   # Stop containers
   docker-compose -f docker-compose.dev.yml down
   
   # Backup current database (optional)
   cp shared_data/db.sqlite3 shared_data/db.sqlite3.backup
   
   # Start containers
   docker-compose -f docker-compose.dev.yml up -d
   
   # Import the shared data
   docker-compose -f docker-compose.dev.yml exec backend python manage.py loaddata shared_data/exports/my_database.json
   ```

## Services

### Backend (Django)
- **URL**: http://localhost:8000
- **API**: http://localhost:8000/api
- **Admin**: http://localhost:8000/admin

### Frontend (React)
- **URL**: http://localhost:5173
- **Hot Reload**: Enabled

### Database (PostgreSQL - Optional)
- **Host**: localhost:5432
- **Database**: failink_dev
- **User**: failink_user
- **Password**: failink_password

## Troubleshooting

### Common Issues

#### Database Locked
```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Remove database file
rm shared_data/db.sqlite3

# Restart
docker-compose -f docker-compose.dev.yml up --build
```

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :8000

# Kill the process or change ports in docker-compose.dev.yml
```

#### Permission Issues (Linux)
```bash
# Fix ownership
sudo chown -R $USER:$USER shared_data/

# Fix permissions
chmod 755 shared_data/
chmod 644 shared_data/db.sqlite3 2>/dev/null || true

# Restart containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

#### No Data Visible (Cross-Platform Issue)
If your friend on Linux can't see your data:

1. **Export your database**:
   ```bash
   ./scripts/share-database.sh export
   ```

2. **Share the export file** from `shared_data/exports/`

3. **Your friend imports it**:
   ```bash
   ./scripts/share-database.sh import
   ```

### Reset Everything
```bash
# Stop and remove all containers, volumes, and images
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up --build
```

## Production vs Development

### Development (Current Setup)
- SQLite database in `shared_data/`
- Django development server
- React dev server with hot reload
- Volume mounts for live code changes

### Production
- Use `docker-compose.yml` (PostgreSQL + Nginx)
- Gunicorn for Django
- Built React app served by Nginx
- Proper SSL and security settings

## Environment Variables

### Development (.env file in backend/)
```env
DEBUG=True
DJANGO_SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///shared_data/db.sqlite3
```

### Production
```env
DEBUG=False
DJANGO_SECRET_KEY=your-secure-secret-key
DATABASE_URL=postgres://user:password@db:5432/database
``` 