#!/bin/bash

# FailInk Development Setup Script
echo "🚀 Setting up FailInk development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

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

# Create superuser (optional)
echo "👤 Would you like to create a superuser? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
fi

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000/api"
echo "📊 Django Admin: http://localhost:8000/admin"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.dev.yml down"
echo "  - Restart services: docker-compose -f docker-compose.dev.yml restart"
echo "  - Access backend shell: docker-compose -f docker-compose.dev.yml exec backend python manage.py shell"
echo "  - Access frontend container: docker-compose -f docker-compose.dev.yml exec frontend sh" 