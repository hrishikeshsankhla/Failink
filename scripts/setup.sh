#!/bin/bash

# FailInk Development Setup Script
# Works on Linux, macOS, and Windows (WSL)

set -e

echo "🚀 FailInk Development Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
print_status "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi
print_success "Docker is running"

# Detect operating system
print_status "Detecting operating system..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    print_success "Detected: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    print_success "Detected: macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
    print_success "Detected: Windows (WSL)"
else
    OS="unknown"
    print_warning "Unknown OS: $OSTYPE"
fi

# Set up environment variables for Linux
if [[ "$OS" == "linux" ]]; then
    export UID=$(id -u)
    export GID=$(id -g)
    print_status "Set user ID: $UID, group ID: $GID"
fi

# Create shared_data directory
print_status "Setting up shared data directory..."
if [ ! -d "shared_data" ]; then
    mkdir shared_data
    print_success "Created shared_data directory"
else
    print_success "shared_data directory already exists"
fi

# Set proper permissions on the host side (especially important for Linux)
if [[ "$OS" == "linux" ]]; then
    print_status "Setting proper permissions for Linux..."
    chmod 755 shared_data
    chown $UID:$GID shared_data 2>/dev/null || true
    
    if [ -f "shared_data/db.sqlite3" ]; then
        chmod 644 shared_data/db.sqlite3
        chown $UID:$GID shared_data/db.sqlite3 2>/dev/null || true
        print_success "Set permissions for existing database"
    fi
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Build and start the development environment
print_status "Building and starting development environment..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Check if database needs to be initialized
print_status "Checking database status..."
if [ ! -f "shared_data/db.sqlite3" ]; then
    print_status "Database file not found, running migrations..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate
    
    # Create superuser if database is fresh
    print_status "Creating superuser..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@failink.com
    print_success "Default superuser created:"
    echo "   Username: admin"
    echo "   Email: admin@failink.com"
    echo "   Password: admin123"
    print_warning "Please change the password after first login!"
else
    print_status "Database file found, checking if migrations are needed..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate
fi

# Set final permissions after container startup (Linux only)
if [[ "$OS" == "linux" ]]; then
    print_status "Setting final permissions..."
    chmod 755 shared_data
    chown $UID:$GID shared_data 2>/dev/null || true
    if [ -f "shared_data/db.sqlite3" ]; then
        chmod 644 shared_data/db.sqlite3
        chown $UID:$GID shared_data/db.sqlite3 2>/dev/null || true
    fi
fi

# Check if services are running
print_status "Verifying services..."
if docker-compose -f docker-compose.dev.yml ps | grep -q "backend.*Up"; then
    print_success "Backend service is running"
else
    print_error "Backend service failed to start"
    exit 1
fi

if docker-compose -f docker-compose.dev.yml ps | grep -q "frontend.*Up"; then
    print_success "Frontend service is running"
else
    print_error "Frontend service failed to start"
    exit 1
fi

echo ""
print_success "Development environment is ready!"
echo ""
echo "🌐 Services:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/api"
echo "   API Documentation: http://localhost:8000/api/docs/"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🔧 Troubleshooting:"
if [[ "$OS" == "linux" ]]; then
    echo "   If you have permission issues: sudo chown -R $USER:$USER shared_data/"
fi
echo "   If database is locked: docker-compose -f docker-compose.dev.yml down && rm -f shared_data/db.sqlite3"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f backend"
echo ""
echo "🎉 Happy coding!" 