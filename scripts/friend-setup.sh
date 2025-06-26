#!/bin/bash

# FailInk Frontend Developer Setup Script
echo "🚀 Setting up FailInk for Frontend Developer..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ All prerequisites are installed!"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Development Environment Variables
DEBUG=True
DJANGO_SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///db.sqlite3

# Frontend Environment
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Email Configuration (optional for development)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@failink.com
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ .env file created. Please update it with your actual values."
fi

# Build and start the development environment
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Run Django migrations
echo "🗄️ Running Django migrations..."
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

echo "✅ Setup complete! Your development environment is ready!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000/api"
echo "📚 API Documentation: http://localhost:8000/api/docs/"
echo "📊 Django Admin: http://localhost:8000/admin"
echo ""
echo "📝 Daily workflow commands:"
echo "  - Pull latest changes: git pull origin main"
echo "  - Start services: docker-compose -f docker-compose.dev.yml up -d"
echo "  - Stop services: docker-compose -f docker-compose.dev.yml down"
echo "  - View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🎯 When backend developer makes changes:"
echo "  1. git pull origin main"
echo "  2. docker-compose -f docker-compose.dev.yml up --build -d"
echo "  3. Visit http://localhost:8000/api/docs/ to see new endpoints"
echo "  4. Update frontend/src/api/index.ts if needed"
echo "  5. Test at http://localhost:5173" 