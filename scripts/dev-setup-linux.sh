#!/bin/bash

# FailInk Development Setup Script for Linux
echo "🐳 Setting up FailInk development environment on Linux..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Get current user ID and group ID
export UID=$(id -u)
export GID=$(id -g)

echo "👤 Using user ID: $UID, group ID: $GID"

# Create shared_data directory if it doesn't exist
if [ ! -d "shared_data" ]; then
    echo "📁 Creating shared_data directory..."
    mkdir shared_data
fi

# Set proper permissions for shared_data directory
echo "🔐 Setting proper permissions for shared_data directory..."
chmod 755 shared_data
chown $UID:$GID shared_data

# Check if database file exists and set permissions
if [ -f "shared_data/db.sqlite3" ]; then
    echo "🗄️ Database file found, setting permissions..."
    chmod 644 shared_data/db.sqlite3
    chown $UID:$GID shared_data/db.sqlite3
fi

# Build and start the development environment
echo "🚀 Building and starting development environment..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if database needs to be initialized
echo "🗄️ Checking database status..."
if [ ! -f "shared_data/db.sqlite3" ]; then
    echo "📊 Database file not found, running migrations..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate
    
    # Create superuser if database is fresh
    echo "👤 Creating superuser..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@failink.com
    echo "🔑 Default superuser credentials:"
    echo "   Username: admin"
    echo "   Email: admin@failink.com"
    echo "   Password: admin123"
    echo "   Please change the password after first login!"
else
    echo "📊 Database file found, checking if migrations are needed..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate
fi

# Set final permissions after container startup
echo "🔐 Setting final permissions..."
chmod 755 shared_data
chown $UID:$GID shared_data
if [ -f "shared_data/db.sqlite3" ]; then
    chmod 644 shared_data/db.sqlite3
    chown $UID:$GID shared_data/db.sqlite3
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
echo "🔧 Troubleshooting:"
echo "   If you have permission issues, run: sudo chown -R $USER:$USER shared_data/"
echo "   If database is locked, run: docker-compose -f docker-compose.dev.yml down && rm -f shared_data/db.sqlite3"
echo ""
echo "🎉 Happy coding!" 