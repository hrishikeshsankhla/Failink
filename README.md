# 💥 FailInk — A Social Network for Glorious Fails

FailInk is LinkedIn's hilarious evil twin — a social storytelling platform where users share their real-life mess-ups, corporate disasters, startup faceplants, and everything in between.

## 🚀 Quick Start

### Option 1: Docker (Recommended for Development)

The easiest way to get started is using Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/failink.git
cd failink

# Run the setup script
# On Windows:
scripts\dev-setup.bat

# On Linux/Mac:
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

Or manually:
```bash
# Create shared data directory
mkdir shared_data

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# In another terminal, run migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

**Services will be available at:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

### Option 2: Local Development

#### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or SQLite for development)

#### Backend Setup
1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
cd backend
python manage.py migrate
```

5. Start development server:
```bash
python manage.py runserver
```

#### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## 🐳 Docker Development

### Database Sharing with SQLite

The development setup uses SQLite stored in `./shared_data/db.sqlite3` which is:
- **Persistent** across container restarts
- **Shared** among team members via Git (directory structure)
- **Not committed** to version control (see `.gitignore`)

### Team Collaboration

**For new team members:**
1. Clone the repository
2. Run the setup script or manually create `shared_data` directory
3. Start containers and run migrations

**Sharing database state:**
```bash
# Export current database
docker-compose -f docker-compose.dev.yml exec backend python manage.py dumpdata > shared_data/dump.json

# Import database (for other team members)
docker-compose -f docker-compose.dev.yml exec backend python manage.py loaddata shared_data/dump.json
```

**Reset database:**
```bash
docker-compose -f docker-compose.dev.yml down
rm shared_data/db.sqlite3
docker-compose -f docker-compose.dev.yml up --build
```

### Useful Docker Commands

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run Django commands
docker-compose -f docker-compose.dev.yml exec backend python manage.py shell

# Access container shell
docker-compose -f docker-compose.dev.yml exec backend bash
```

For detailed Docker documentation, see [DOCKER_DEVELOPMENT.md](DOCKER_DEVELOPMENT.md).

## 🛠️ Development

### Running Tests
```bash
# Backend
python manage.py test

# Frontend
npm test
```

### Production Deployment
```bash
# Use production Docker setup
docker-compose up --build
```

## 📝 License
MIT License - See LICENSE file for details

# FailInk

FailInk is a social platform where users can share their failure stories, learn from others' experiences, and build a supportive community around embracing and learning from failures.

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
- PostgreSQL
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