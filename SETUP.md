# 🚀 FailInk Development Setup Guide

A complete guide for setting up FailInk development environment with Docker.

## 📋 Prerequisites

- **Docker Desktop** (version 20.10+)
- **Git**
- **Terminal/Command Prompt**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/hrishikeshsankhla/Failink.git
cd Failink
```

### 2. Run the Setup Script
```bash
# Make the script executable
chmod +x scripts/setup.sh

# Run the setup
./scripts/setup.sh
```

**That's it!** The script will automatically:
- ✅ Detect your operating system (Linux/macOS/Windows)
- ✅ Set up proper file permissions (especially for Linux)
- ✅ Build and start Docker containers
- ✅ Initialize the database
- ✅ Create a default admin user

## 🌐 Access Your Application

After setup, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin

### Default Admin Credentials
- **Username**: admin
- **Email**: admin@failink.com
- **Password**: admin123

⚠️ **Important**: Change the password after first login!

## 📝 Daily Development Commands

### Start/Stop Services
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# Restart services
docker-compose -f docker-compose.dev.yml restart
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Database Operations
```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser

# Access Django shell
docker-compose -f docker-compose.dev.yml exec backend python manage.py shell
```

## 🔄 Team Collaboration

### When Backend Developer Makes Changes
```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild containers (if needed)
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d

# 3. Check new API endpoints
# Visit: http://localhost:8000/api/docs/

# 4. Update frontend if needed
# Edit: frontend/src/api/index.ts
```

### Sharing Database Data
```bash
# Export your database
./scripts/share-database.sh export

# Import shared database
./scripts/share-database.sh import

# Check database status
./scripts/share-database.sh status
```

## 🔧 Troubleshooting

### Common Issues

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

#### Database Locked
```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Remove database file
rm shared_data/db.sqlite3

# Restart
docker-compose -f docker-compose.dev.yml up --build
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :8000  # Backend

# Kill the process or change ports in docker-compose.dev.yml
```

#### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs

# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Reset Everything
```bash
# Stop and remove all containers, volumes, and images
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up --build
```

## 🏗️ Project Structure

```
Failink/
├── backend/                 # Django backend
│   ├── apps/               # Django applications
│   ├── config/             # Django settings
│   └── Dockerfile.dev      # Development Dockerfile
├── frontend/               # React frontend
│   ├── src/                # React source code
│   └── Dockerfile.dev      # Development Dockerfile
├── shared_data/            # Shared database and exports
├── scripts/                # Development scripts
│   ├── setup.sh           # Main setup script
│   └── share-database.sh  # Database sharing tool
├── docker-compose.dev.yml  # Development compose
└── SETUP.md               # This file
```

## 🔄 Development Workflow

### Frontend Development
1. **Edit files** in `frontend/src/`
2. **Changes are automatically reflected** (hot reload)
3. **Test on** http://localhost:5173

### Backend Development
1. **Edit files** in `backend/apps/`
2. **Changes are automatically reflected**
3. **Test API on** http://localhost:8000/api
4. **Access Django admin on** http://localhost:8000/admin

## 🔒 Security Notes

### Development vs Production
- **Development**: Uses SQLite, debug enabled, no SSL
- **Production**: Use PostgreSQL, debug disabled, SSL required

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Keep secrets secure

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [API Documentation](http://localhost:8000/api/docs/) (when running)

## 🤝 Need Help?

If you encounter issues:

1. **Check the troubleshooting section above**
2. **View logs**: `docker-compose -f docker-compose.dev.yml logs -f`
3. **Check if services are running**: `docker-compose -f docker-compose.dev.yml ps`
4. **Verify file permissions** (Linux): `ls -la shared_data/`

---

**Happy coding! 🎉** 