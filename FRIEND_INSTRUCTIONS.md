# 🚀 Instructions for Your Friend

## Quick Setup (2 Steps)

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/hrishikeshsankhla/Failink.git
cd Failink

# Run the setup script (works on Linux/macOS/Windows)
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Access Your App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Docs**: http://localhost:8000/api/docs/
- **Admin**: http://localhost:8000/admin

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## Daily Workflow

### Start Development
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d
```

### When I Make Changes
```bash
# Pull latest changes
git pull origin main

# Rebuild if needed
docker-compose -f docker-compose.dev.yml up --build -d
```

### Stop Development
```bash
# Stop services
docker-compose -f docker-compose.dev.yml down
```

## If You Can't See My Data

### Option 1: I'll Share My Database
```bash
# I'll run this and send you the file
./scripts/share-database.sh export

# You run this to import my data
./scripts/share-database.sh import
```

### Option 2: Fresh Start
```bash
# Reset to fresh database
./scripts/share-database.sh reset
```

## Troubleshooting

### Permission Error (chmod: Operation not permitted)
If you see this error, run the permission fix script:

```bash
# Make the fix script executable
chmod +x scripts/fix-permissions.sh

# Run the fix
./scripts/fix-permissions.sh
```

### Permission Issues (Linux)
```bash
sudo chown -R $USER:$USER shared_data/
```

### Database Locked
```bash
docker-compose -f docker-compose.dev.yml down
rm shared_data/db.sqlite3
docker-compose -f docker-compose.dev.yml up --build
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

## Need Help?

1. Check the [Complete Setup Guide](SETUP.md)
2. View logs: `docker-compose -f docker-compose.dev.yml logs -f`
3. Ask me for help! 😊

---

**That's it! Happy coding! 🎉** 