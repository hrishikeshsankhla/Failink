#!/bin/bash

# FailInk Development Setup Script
echo "🐳 Setting up FailInk development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create shared_data directory if it doesn't exist
if [ ! -d "shared_data" ]; then
    echo "📁 Creating shared_data directory..."
    mkdir shared_data
fi

# Build and start the development environment
echo "🚀 Building and starting development environment..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate

# Check if superuser exists, if not create one
echo "👤 Checking for superuser..."
if ! docker-compose -f docker-compose.dev.yml exec -T backend python manage.py shell -c "from django.contrib.auth.models import User; print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser found')" 2>/dev/null | grep -q "Superuser exists"; then
    echo "👤 Creating superuser..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@failink.com
    echo "🔑 Default superuser credentials:"
    echo "   Username: admin"
    echo "   Email: admin@failink.com"
    echo "   Password: admin123"
    echo "   Please change the password after first login!"
fi

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Services:"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   Admin: http://localhost:8000/admin"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🎉 Happy coding!" 