# 🚀 FailInk Development Guide

This guide explains how to set up and work on FailInk using Docker for collaborative development.

## 🐳 Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

## 🔄 How Changes Flow Between Developers

### **Real-Time Development (Current Setup)**
Your Docker setup uses volume mounting, which means:
- ✅ **Live Changes**: Backend changes are immediately available
- ✅ **No Rebuild Needed**: Changes are reflected instantly
- ✅ **Hot Reload**: Django auto-reloads when files change
- ✅ **API Documentation**: Always up-to-date at http://localhost:8000/api/docs/

### **Git Workflow (Recommended for Team Development)**
1. **Backend Developer** makes changes and pushes to Git
2. **Frontend Developer** pulls latest changes
3. **Both developers** test integration together

## 🎯 Git + Docker Workflow (Recommended)

### **For Backend Developer (You):**

**1. Make Changes:**
```bash
# Edit backend files
# Test locally at http://localhost:8000/api/docs/
```

**2. Commit and Push:**
```bash
git add backend/apps/posts/models.py
git commit -m "Add featured post functionality"
git push origin main
```

**3. Notify Frontend Developer:**
- Share the commit message
- Mention any breaking changes
- Point to new API endpoints

### **For Frontend Developer (Your Friend):**

**1. Initial Setup (One-time):**
```bash
# Clone the repository
git clone https://github.com/hrishikeshsankhla/Failink.git
cd Failink

# Set up development environment
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

**2. Daily Workflow:**
```bash
# Pull latest changes from backend developer
git pull origin main

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Check new API endpoints
curl http://localhost:8000/api/posts/
# Visit: http://localhost:8000/api/docs/
```

**3. When Backend Developer Makes Changes:**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild containers (if needed)
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d

# 3. Check new API endpoints
# Visit: http://localhost:8000/api/docs/

# 4. Update TypeScript interfaces if needed
# Edit: frontend/src/api/index.ts

# 5. Test new features
# Frontend auto-reloads at: http://localhost:5173
```

**4. Commit Frontend Changes:**
```bash
git add frontend/src/api/index.ts
git commit -m "Add featured post UI integration"
git push origin main
```

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Failink
```

### 2. Run the Development Setup Script
```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### 3. Access Your Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin

## 🎯 Quick Commands for Your Friend

### **Daily Workflow:**
```bash
# Pull latest changes from backend developer
git pull origin main

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Check if backend is running
curl http://localhost:8000/api/posts/

# View API documentation
# Open: http://localhost:8000/api/docs/
```

### **When Backend Developer Makes Changes:**
```bash
# 1. Pull latest changes
git pull origin main

# 2. Check new API endpoints
# Visit: http://localhost:8000/api/docs/

# 3. Update TypeScript interfaces if needed
# Edit: frontend/src/api/index.ts

# 4. Test new features
# Frontend auto-reloads at: http://localhost:5173
```

### **Troubleshooting:**
```bash
# If backend changes aren't showing:
docker-compose -f docker-compose.dev.yml restart backend

# If containers won't start:
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d

# View logs:
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Create Environment File
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Build and Start Services
```bash
# Build images
docker-compose -f docker-compose.dev.yml build

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

## 📁 Project Structure

```
Failink/
├── backend/                 # Django backend
│   ├── apps/               # Django applications
│   ├── config/             # Django settings
│   ├── Dockerfile          # Production Dockerfile
│   └── Dockerfile.dev      # Development Dockerfile
├── frontend/               # React frontend
│   ├── src/                # React source code
│   ├── Dockerfile          # Production Dockerfile
│   └── Dockerfile.dev      # Development Dockerfile
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
└── scripts/                # Development scripts
```

## 🎯 Development Workflow

### Frontend Development (Your Friend)
1. **Clone the repository**
2. **Run the setup script**
3. **Edit files in `frontend/src/`**
4. **Changes are automatically reflected** (hot reload)
5. **Test on http://localhost:5173**

### Backend Development (You)
1. **Edit files in `backend/apps/`**
2. **Changes are automatically reflected**
3. **Test API on http://localhost:8000/api**
4. **Access Django admin on http://localhost:8000/admin**

## 🛠️ Common Commands

### Start/Stop Services
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Restart services
docker-compose -f docker-compose.dev.yml restart
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Database Operations
```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser

# Access Django shell
docker-compose -f docker-compose.dev.yml exec backend python manage.py shell
```

### Container Access
```bash
# Access frontend container
docker-compose -f docker-compose.dev.yml exec frontend sh

# Access backend container
docker-compose -f docker-compose.dev.yml exec backend bash
```

## 🔄 Hot Reload & Live Development

### Frontend (React + Vite)
- **Hot reload enabled** - Changes in `frontend/src/` are instantly reflected
- **Port**: 5173
- **Volume mounted**: `./frontend:/app`

### Backend (Django)
- **Auto-reload enabled** - Changes in `backend/` are automatically detected
- **Port**: 8000
- **Volume mounted**: `./backend:/app`

## 🌐 Network Configuration

### Service Communication
- **Frontend → Backend**: `http://localhost:8000/api`
- **Backend → Database**: Internal Docker network
- **External Access**: All services exposed on localhost

### Environment Variables
```bash
# Frontend
VITE_API_URL=http://localhost:8000/api

# Backend
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :8000  # Backend

# Kill the process or change ports in docker-compose.dev.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs

# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Database Issues
```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

## 🔒 Security Notes

### Development vs Production
- **Development**: Uses SQLite, debug enabled, no SSL
- **Production**: Use PostgreSQL, debug disabled, SSL required

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Keep secrets secure

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Collaborative Development Tips

1. **Use Git branches** for features
2. **Communicate API changes** between frontend/backend
3. **Test on both environments** before merging
4. **Keep dependencies updated** in both projects
5. **Use consistent code formatting** (ESLint, Prettier, Black)

## 🚀 FailInk Development Workflow

## 🔄 How Backend Changes Reach Frontend

### **Real-Time Development Process**

1. **Backend Developer (You) makes changes:**
   - Modify models in `backend/apps/*/models.py`
   - Update serializers in `backend/apps/*/serializers.py`
   - Add new views in `backend/apps/*/views.py`
   - Create new endpoints in `backend/apps/*/urls.py`

2. **Changes are immediately available:**
   - Django automatically generates REST API endpoints
   - Frontend developer can test new endpoints immediately
   - No deployment needed for development

3. **Frontend Developer (Your Friend) sees changes:**
   - API endpoints are available at `http://localhost:8000/api/`
   - Can test endpoints using API documentation at `http://localhost:8000/api/docs/`
   - Updates TypeScript interfaces in `frontend/src/api/index.ts`

## 📚 API Documentation

### **Available Documentation URLs:**
- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **Raw Schema:** http://localhost:8000/api/schema/

### **How to Use API Documentation:**
1. Start the backend: `docker-compose -f docker-compose.dev.yml up`
2. Visit http://localhost:8000/api/docs/
3. Test endpoints directly in the browser
4. See request/response schemas automatically

## 🔧 Development Workflow

### **For Backend Developer:**

**1. Start Development Environment:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**2. Make Changes:**
```bash
# Example: Add new field to Post model
# Edit backend/apps/posts/models.py
# Edit backend/apps/posts/serializers.py
```

**3. Apply Database Changes:**
```bash
docker exec -it failink-backend-1 python manage.py makemigrations
docker exec -it failink-backend-1 python manage.py migrate
```

**4. Test Your Changes:**
```bash
# Visit http://localhost:8000/api/docs/
# Test new endpoints
```

### **For Frontend Developer:**

**1. Start Development Environment:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**2. Check API Changes:**
```bash
# Visit http://localhost:8000/api/docs/
# See new endpoints and schemas
```

**3. Update TypeScript Interfaces:**
```typescript
// Edit frontend/src/api/index.ts
// Add new fields to interfaces
// Add new API methods
```

**4. Test Frontend Changes:**
```bash
# Frontend auto-reloads at http://localhost:5173
# Changes are reflected immediately
```

## 📡 Real-Time Communication

### **When You Add New Features:**

**1. Backend Changes:**
```python
# backend/apps/posts/models.py
class Post(models.Model):
    # ... existing fields ...
    is_featured = models.BooleanField(default=False)  # NEW
    featured_at = models.DateTimeField(null=True)     # NEW
```

**2. Serializer Updates:**
```python
# backend/apps/posts/serializers.py
class PostSerializer(serializers.ModelSerializer):
    # ... existing fields ...
    is_featured = serializers.BooleanField(read_only=True)
    featured_at = serializers.DateTimeField(read_only=True)
```

**3. Frontend Developer Sees:**
```typescript
// frontend/src/api/index.ts
export interface Post {
  // ... existing fields ...
  is_featured: boolean;    // NEW - automatically available
  featured_at: string;     // NEW - automatically available
}
```

**4. Frontend Implementation:**
```typescript
// frontend/src/components/Feed/PostCard.tsx
{post.is_featured && (
  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
    ⭐ Featured Post
  </div>
)}
```

## 🐛 Debugging & Testing

### **Backend Debugging:**
```bash
# View backend logs
docker-compose logs -f backend

# Access backend shell
docker exec -it failink-backend-1 bash

# Run Django shell
docker exec -it failink-backend-1 python manage.py shell
```

### **Frontend Debugging:**
```bash
# View frontend logs
docker-compose logs -f frontend

# Access frontend shell
docker exec -it failink-frontend-1 sh
```

### **API Testing:**
```bash
# Test endpoints with curl
curl -X GET http://localhost:8000/api/posts/
curl -X POST http://localhost:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'
```

## 🔄 Git Workflow

### **Best Practices:**
1. **Backend Developer:** Commit model changes first
2. **Frontend Developer:** Wait for backend changes to be pushed
3. **Pull latest changes:** `git pull origin main`
4. **Test integration:** Ensure frontend works with new backend changes
5. **Commit frontend changes:** After testing

### **Example Workflow:**
```bash
# Backend Developer
git add backend/apps/posts/models.py
git commit -m "Add featured post functionality"
git push origin main

# Frontend Developer
git pull origin main
# Update frontend to use new featured post fields
git add frontend/src/api/index.ts
git commit -m "Add featured post UI"
git push origin main
```

## 🚨 Common Issues & Solutions

### **Backend Changes Not Reflecting:**
```bash
# Restart backend container
docker-compose restart backend

# Check if migrations are applied
docker exec -it failink-backend-1 python manage.py showmigrations
```

### **Frontend Not Connecting to Backend:**
```bash
# Check if backend is running
docker ps

# Check backend logs
docker-compose logs backend

# Verify API is accessible
curl http://localhost:8000/api/posts/
```

### **Database Issues:**
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up --build
```

## 📞 Communication Tips

### **When Making Breaking Changes:**
1. **Notify your teammate** before making breaking changes
2. **Update API documentation** with clear descriptions
3. **Provide migration steps** if needed
4. **Test integration** before pushing

### **Daily Standup:**
- Share what you're working on
- Mention any new API endpoints
- Discuss any breaking changes
- Coordinate testing sessions

## 🎯 Quick Reference

### **Backend URLs:**
- **API Base:** http://localhost:8000/api/
- **Admin:** http://localhost:8000/admin/
- **Docs:** http://localhost:8000/api/docs/

### **Frontend URLs:**
- **App:** http://localhost:5173/
- **Login:** http://localhost:5173/login
- **Register:** http://localhost:5173/register

### **Useful Commands:**
```bash
# Start development
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after major changes
docker-compose up --build
```

---

**Happy coding! 🎉** 