# 💥 FailInk — A Social Network for Glorious Fails

FailInk is LinkedIn's hilarious evil twin — a social storytelling platform where users share their real-life mess-ups, corporate disasters, startup faceplants, and everything in between.

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** (version 20.10+)
- **Git**

### Setup (All Platforms)
```bash
# Clone the repository
git clone https://github.com/hrishikeshsankhla/Failink.git
cd Failink

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**That's it!** The script automatically handles:
- ✅ Cross-platform compatibility (Linux/macOS/Windows)
- ✅ File permissions (especially for Linux)
- ✅ Database initialization
- ✅ Docker container setup

## 🌐 Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin

### Default Admin Credentials
- **Username**: admin
- **Email**: admin@failink.com
- **Password**: admin123

⚠️ **Important**: Change the password after first login!

## 📝 Daily Development

### Start/Stop Services
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Team Collaboration
```bash
# Pull latest changes
git pull origin main

# Rebuild if needed
docker-compose -f docker-compose.dev.yml up --build -d

# Share database data
./scripts/share-database.sh export
./scripts/share-database.sh import
```

## 🔧 Troubleshooting

### Common Issues
```bash
# Permission issues (Linux)
sudo chown -R $USER:$USER shared_data/

# Database locked
docker-compose -f docker-compose.dev.yml down
rm shared_data/db.sqlite3
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 📚 Documentation

- **[Complete Setup Guide](SETUP.md)** - Detailed setup and troubleshooting
- **[API Documentation](http://localhost:8000/api/docs/)** - When running locally

## Features

- 🔐 Secure authentication with JWT
- 👤 User profiles and customization
- 📝 Create and share failure stories
- 🏷️ Tag-based content organization
- ❤️ Like, Hug, and Relate reactions
- 🔍 Trending tags and suggested users
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State Management)
- Axios (API Client)

### Backend
- Django
- Django REST Framework
- PostgreSQL (Production) / SQLite (Development)
- JWT Authentication
- Google OAuth Integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by the need for a more open discussion about failures in tech and entrepreneurship 