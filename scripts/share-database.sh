#!/bin/bash

# FailInk Database Sharing Script
# This script helps team members share database data

set -e

echo "🗄️ FailInk Database Sharing Tool"
echo "================================"

# Function to export database
export_database() {
    echo "📤 Exporting database..."
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.dev.yml ps | grep -q "backend.*Up"; then
        echo "❌ Backend container is not running. Please start the development environment first."
        exit 1
    fi
    
    # Create exports directory if it doesn't exist
    mkdir -p shared_data/exports
    
    # Export database to JSON
    echo "📊 Exporting data to JSON..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py dumpdata \
        --exclude auth.permission \
        --exclude contenttypes \
        --indent 2 > shared_data/exports/database_$(date +%Y%m%d_%H%M%S).json
    
    # Create a compressed backup
    echo "🗜️ Creating compressed backup..."
    tar -czf shared_data/exports/database_backup_$(date +%Y%m%d_%H%M%S).tar.gz shared_data/db.sqlite3 2>/dev/null || true
    
    echo "✅ Database exported successfully!"
    echo "📁 Files created in shared_data/exports/:"
    ls -la shared_data/exports/
}

# Function to import database
import_database() {
    echo "📥 Importing database..."
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.dev.yml ps | grep -q "backend.*Up"; then
        echo "❌ Backend container is not running. Please start the development environment first."
        exit 1
    fi
    
    # List available exports
    if [ ! -d "shared_data/exports" ] || [ -z "$(ls -A shared_data/exports 2>/dev/null)" ]; then
        echo "❌ No exports found in shared_data/exports/"
        echo "   Please export a database first or ask your team member to share their export."
        exit 1
    fi
    
    echo "📁 Available exports:"
    ls -la shared_data/exports/
    
    # Ask user which file to import
    echo ""
    read -p "Enter the filename to import (or press Enter for the latest JSON file): " import_file
    
    if [ -z "$import_file" ]; then
        # Find the latest JSON file
        import_file=$(ls -t shared_data/exports/*.json 2>/dev/null | head -1)
        if [ -z "$import_file" ]; then
            echo "❌ No JSON export files found."
            exit 1
        fi
    fi
    
    if [ ! -f "$import_file" ]; then
        echo "❌ File not found: $import_file"
        exit 1
    fi
    
    echo "⚠️  WARNING: This will replace your current database!"
    read -p "Are you sure you want to continue? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ Import cancelled."
        exit 0
    fi
    
    # Stop containers to avoid database locks
    echo "🛑 Stopping containers..."
    docker-compose -f docker-compose.dev.yml down
    
    # Backup current database
    if [ -f "shared_data/db.sqlite3" ]; then
        echo "💾 Backing up current database..."
        cp shared_data/db.sqlite3 shared_data/db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Start containers
    echo "🚀 Starting containers..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for backend to be ready
    echo "⏳ Waiting for backend to be ready..."
    sleep 10
    
    # Import the data
    echo "📥 Importing data from $import_file..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py loaddata "$import_file"
    
    echo "✅ Database imported successfully!"
}

# Function to reset database
reset_database() {
    echo "🔄 Resetting database..."
    
    echo "⚠️  WARNING: This will delete all data in your database!"
    read -p "Are you sure you want to continue? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ Reset cancelled."
        exit 0
    fi
    
    # Stop containers
    echo "🛑 Stopping containers..."
    docker-compose -f docker-compose.dev.yml down
    
    # Remove database file
    if [ -f "shared_data/db.sqlite3" ]; then
        echo "🗑️ Removing database file..."
        rm shared_data/db.sqlite3
    fi
    
    # Start containers and run migrations
    echo "🚀 Starting containers..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for backend to be ready
    echo "⏳ Waiting for backend to be ready..."
    sleep 10
    
    # Run migrations
    echo "📊 Running migrations..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate
    
    # Create superuser
    echo "👤 Creating superuser..."
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@failink.com
    
    echo "✅ Database reset successfully!"
    echo "🔑 Default superuser credentials:"
    echo "   Username: admin"
    echo "   Email: admin@failink.com"
    echo "   Password: admin123"
}

# Function to show database status
show_status() {
    echo "📊 Database Status"
    echo "=================="
    
    if [ -f "shared_data/db.sqlite3" ]; then
        echo "✅ Database file exists"
        echo "📁 Size: $(du -h shared_data/db.sqlite3 | cut -f1)"
        echo "📅 Modified: $(stat -c %y shared_data/db.sqlite3)"
        
        # Check if containers are running
        if docker-compose -f docker-compose.dev.yml ps | grep -q "backend.*Up"; then
            echo "🟢 Backend container is running"
            
            # Try to get table count
            echo "📋 Database tables:"
            docker-compose -f docker-compose.dev.yml exec -T backend python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute(\"SELECT name FROM sqlite_master WHERE type='table';\")
tables = cursor.fetchall()
for table in tables:
    if table[0] != 'sqlite_sequence':
        cursor.execute(f\"SELECT COUNT(*) FROM {table[0]};\")
        count = cursor.fetchone()[0]
        print(f'  - {table[0]}: {count} records')
" 2>/dev/null || echo "  Unable to read table information"
        else
            echo "🔴 Backend container is not running"
        fi
    else
        echo "❌ Database file does not exist"
    fi
    
    # Show exports
    if [ -d "shared_data/exports" ] && [ -n "$(ls -A shared_data/exports 2>/dev/null)" ]; then
        echo ""
        echo "📤 Available exports:"
        ls -la shared_data/exports/
    fi
}

# Main menu
case "${1:-}" in
    "export")
        export_database
        ;;
    "import")
        import_database
        ;;
    "reset")
        reset_database
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 {export|import|reset|status}"
        echo ""
        echo "Commands:"
        echo "  export  - Export current database to JSON and create backup"
        echo "  import  - Import database from JSON file"
        echo "  reset   - Reset database to fresh state"
        echo "  status  - Show database status and information"
        echo ""
        echo "Examples:"
        echo "  $0 export    # Export your database for sharing"
        echo "  $0 import    # Import a shared database"
        echo "  $0 reset     # Start with a fresh database"
        echo "  $0 status    # Check database status"
        ;;
esac
