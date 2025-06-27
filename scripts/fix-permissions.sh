#!/bin/bash

# Quick Fix for Docker Permission Issues
echo "🔧 Fixing Docker Permission Issues..."

# Get user ID and group ID
export UID=$(id -u)
export GID=$(id -g)

echo "👤 User ID: $UID, Group ID: $GID"

# Stop containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.dev.yml down

# Fix permissions on host side
echo "🔐 Fixing permissions..."
sudo chown -R $UID:$GID shared_data/ 2>/dev/null || true
chmod 755 shared_data/
chmod 644 shared_data/db.sqlite3 2>/dev/null || true

# Start containers with proper user mapping
echo "🚀 Starting containers..."
docker-compose -f docker-compose.dev.yml up -d

echo "✅ Permission fix complete!"
echo "🌐 Your app should now be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:8000" 