# 🔧 Quick Fix: Linux Database Issue

## Problem
Your friend on Linux is not seeing the saved data in the application database.

## Root Cause
This is typically caused by file permission issues on Linux systems where the Docker container can't read/write to the SQLite database file.

## Quick Solutions

### Solution 1: Use the Linux Setup Script (Recommended)

```bash
# Make scripts executable
chmod +x scripts/dev-setup-linux.sh
chmod +x scripts/share-database.sh

# Run the Linux-specific setup
./scripts/dev-setup-linux.sh
```

### Solution 2: Manual Permission Fix

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Get your user ID and group ID
export UID=$(id -u)
export GID=$(id -g)

# Fix ownership and permissions
sudo chown -R $UID:$GID shared_data/
chmod 755 shared_data/
chmod 644 shared_data/db.sqlite3 2>/dev/null || true

# Restart containers
docker-compose -f docker-compose.dev.yml up --build
```

### Solution 3: Share Your Database Data

If the above doesn't work, share your database data with your friend:

#### On Your Machine (Windows/Mac):
```bash
# Export your database
./scripts/share-database.sh export
```

This creates a file in `shared_data/exports/` - share this file with your friend.

#### On Your Friend's Machine (Linux):
```bash
# Make script executable
chmod +x scripts/share-database.sh

# Import your database
./scripts/share-database.sh import
```

### Solution 4: Fresh Start with Proper Permissions

```bash
# Stop everything
docker-compose -f docker-compose.dev.yml down

# Remove database
rm -f shared_data/db.sqlite3

# Set proper permissions
sudo chown -R $USER:$USER shared_data/
chmod 755 shared_data/

# Start fresh
docker-compose -f docker-compose.dev.yml up --build
```

## Verification

Check if the fix worked:

```bash
# Check database status
./scripts/share-database.sh status

# Or manually check
ls -la shared_data/
docker-compose -f docker-compose.dev.yml exec backend python manage.py shell -c "
from django.contrib.auth.models import User
print(f'Users in database: {User.objects.count()}')
"
```

## Common Issues

### Permission Denied
```bash
sudo chown -R $USER:$USER shared_data/
```

### Database Locked
```bash
docker-compose -f docker-compose.dev.yml down
rm -f shared_data/db.sqlite3
docker-compose -f docker-compose.dev.yml up --build
```

### Container Can't Write
```bash
# Check if SELinux is blocking
sudo setsebool -P container_manage_cgroup 1
```

## Still Having Issues?

1. **Check Docker logs**:
   ```bash
   docker-compose -f docker-compose.dev.yml logs backend
   ```

2. **Verify file permissions**:
   ```bash
   ls -la shared_data/
   ```

3. **Check if database exists**:
   ```bash
   file shared_data/db.sqlite3
   ```

4. **Try with different user**:
   ```bash
   # Run as root (temporary fix)
   docker-compose -f docker-compose.dev.yml down
   sudo chown -R root:root shared_data/
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Prevention

To avoid this issue in the future:

1. Always use the Linux setup script: `./scripts/dev-setup-linux.sh`
2. Set proper permissions before starting containers
3. Use the database sharing script for cross-platform collaboration
4. Consider using PostgreSQL for production-like development

## Need Help?

If none of these solutions work, please share:
1. Your Linux distribution and version
2. Docker version
3. Output of `ls -la shared_data/`
4. Docker logs: `docker-compose -f docker-compose.dev.yml logs backend` 