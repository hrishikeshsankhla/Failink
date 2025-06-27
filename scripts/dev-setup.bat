@echo off
REM FailInk Development Setup Script for Windows

echo 🐳 Setting up FailInk development environment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Create shared_data directory if it doesn't exist
if not exist "shared_data" (
    echo 📁 Creating shared_data directory...
    mkdir shared_data
)

REM Build and start the development environment
echo 🚀 Building and starting development environment...
docker-compose -f docker-compose.dev.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Run migrations
echo 🗄️ Running database migrations...
docker-compose -f docker-compose.dev.yml exec -T backend python manage.py migrate

REM Check if superuser exists, if not create one
echo 👤 Checking for superuser...
docker-compose -f docker-compose.dev.yml exec -T backend python manage.py shell -c "from django.contrib.auth.models import User; print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser found')" 2>nul | findstr "Superuser exists" >nul
if errorlevel 1 (
    echo 👤 Creating superuser...
    docker-compose -f docker-compose.dev.yml exec -T backend python manage.py createsuperuser --noinput --username admin --email admin@failink.com
    echo 🔑 Default superuser credentials:
    echo    Username: admin
    echo    Email: admin@failink.com
    echo    Password: admin123
    echo    Please change the password after first login!
)

echo ✅ Development environment is ready!
echo.
echo 🌐 Services:
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:5173
echo    Admin: http://localhost:8000/admin
echo.
echo 📝 Useful commands:
echo    View logs: docker-compose -f docker-compose.dev.yml logs -f
echo    Stop services: docker-compose -f docker-compose.dev.yml down
echo    Restart: docker-compose -f docker-compose.dev.yml restart
echo.
echo 🎉 Happy coding!
pause 