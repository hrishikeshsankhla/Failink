# 📊 Data Sharing Guide

## Overview
Both you and your friend use **SQLite** databases in Docker, making data sharing simple and straightforward.

## 🗄️ Database Setup
- **Your Local**: SQLite (`shared_data/db.sqlite3`)
- **Your Docker**: SQLite (`shared_data/db.sqlite3`)
- **Friend's Docker**: SQLite (`shared_data/db.sqlite3`)

## 🔄 Sharing Methods

### Method 1: Direct File Sharing (Easiest)

#### You (Export Your Data):
```bash
# Stop containers to avoid database locks
docker-compose -f docker-compose.dev.yml down

# Create a backup of your database
cp shared_data/db.sqlite3 shared_data/db.sqlite3.backup

# Share the file with your friend
# Options: Git, email, cloud storage, etc.
```

#### Your Friend (Import Your Data):
```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Replace their database with yours
cp /path/to/your/db.sqlite3 shared_data/db.sqlite3

# Start containers
docker-compose -f docker-compose.dev.yml up -d
```

### Method 2: JSON Export/Import (Recommended)

#### You (Export):
```bash
# Export your database to JSON
./scripts/share-database.sh export

# This creates: shared_data/exports/database_YYYYMMDD_HHMMSS.json
# Share this file with your friend
```

#### Your Friend (Import):
```bash
# Import your database
./scripts/share-database.sh import

# Follow the prompts to select your export file
```

### Method 3: Git Sharing (For Small Data)

#### You:
```bash
# Add database to Git (temporarily)
git add shared_data/db.sqlite3
git commit -m "Share database with friend"
git push origin main
```

#### Your Friend:
```bash
# Pull the database
git pull origin main
```

#### Clean Up:
```bash
# Remove database from Git tracking
git rm --cached shared_data/db.sqlite3
git commit -m "Remove database from tracking"
git push origin main
```

## 🎯 Recommended Workflow

### For Regular Development:
1. **Use Method 2 (JSON Export/Import)** - Most reliable
2. **Share exports via cloud storage** (Google Drive, Dropbox, etc.)
3. **Keep exports in `shared_data/exports/`** for easy access

### For Quick Sharing:
1. **Use Method 1 (Direct File)** - Fastest
2. **Share via messaging apps** or email
3. **Good for small databases**

## 🔧 Troubleshooting

### Database Locked:
```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Wait a moment, then start again
docker-compose -f docker-compose.dev.yml up -d
```

### Import Failed:
```bash
# Check if the file exists
ls -la shared_data/exports/

# Try manual import
docker-compose -f docker-compose.dev.yml exec backend python manage.py loaddata /app/shared_data/exports/your_file.json
```

### Permission Issues:
```bash
# Fix permissions (Linux)
sudo chown -R $USER:$USER shared_data/
chmod 644 shared_data/db.sqlite3
```

## 📋 Quick Commands

### Export Your Data:
```bash
./scripts/share-database.sh export
```

### Import Friend's Data:
```bash
./scripts/share-database.sh import
```

### Check Database Status:
```bash
./scripts/share-database.sh status
```

### Reset to Fresh Database:
```bash
./scripts/share-database.sh reset
```

## 🚨 Important Notes

1. **Always stop containers** before copying database files
2. **Backup your data** before importing someone else's
3. **Use JSON export** for cross-platform compatibility
4. **Don't commit database files** to Git (they're in `.gitignore`)

## 🎉 That's It!

Your friend will have the exact same data as you, and both of you can continue developing with the same database state! 