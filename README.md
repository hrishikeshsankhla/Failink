# 💥 FailInk — A Social Network for Glorious Fails

FailInk is LinkedIn's hilarious evil twin — a social storytelling platform where users share their real-life mess-ups, corporate disasters, startup faceplants, and everything in between.

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** (version 20.10+)
- **Git**

### Setup (All Platforms)
```bash
# Clone the repository
git clone https://github.com/hrishikeshsankhla/Failink.git
cd Failink

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**That's it!** The script automatically handles:
- ✅ Cross-platform compatibility (Linux/macOS/Windows)
- ✅ File permissions (especially for Linux)
- ✅ Database initialization
- ✅ Docker container setup

## 🌐 Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin

### Default Admin Credentials
- **Username**: admin
- **Email**: admin@failink.com
- **Password**: admin123

⚠️ **Important**: Change the password after first login!

## 📝 Daily Development

### Start/Stop Services
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Team Collaboration
```bash
# Pull latest changes
git pull origin main

# Rebuild if needed
docker-compose -f docker-compose.dev.yml up --build -d

# Share database data
./scripts/share-database.sh export
./scripts/share-database.sh import
```

## 🔧 Troubleshooting

### Common Issues
```bash
# Permission issues (Linux)
sudo chown -R $USER:$USER shared_data/

# Database locked
docker-compose -f docker-compose.dev.yml down
rm shared_data/db.sqlite3
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 📚 Documentation

- **[Complete Setup Guide](SETUP.md)** - Detailed setup and troubleshooting
- **[API Documentation](http://localhost:8000/api/docs/)** - When running locally

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
- PostgreSQL (Production) / SQLite (Development)
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

# FailInk - Share Your Failure Stories

A social platform where developers and professionals can share their failure stories, learn from each other's mistakes, and build a supportive community around embracing failure as a learning opportunity.

## Features

### 🔐 Authentication
- Email/password registration and login
- Google OAuth integration
- JWT-based authentication with refresh tokens
- Password reset functionality

### 📝 Posts & Content
- Create and share failure stories
- Tag posts with relevant categories
- Rich text content with markdown support
- Post reactions (likes, hugs, relates, emoji reactions)
- Nested comments with replies

### 👤 User Profiles
- **Comprehensive Profile Pages**: View detailed user profiles with statistics and activity
- **User Statistics**: Track posts created, reactions received/given, and engagement metrics
- **Post History**: View all posts created by a user with pagination
- **Reaction History**: See all posts a user has reacted to
- **Profile Navigation**: Tabbed interface for easy navigation between stats, posts, and reactions
- **Cross-User Profiles**: View other users' profiles (with appropriate privacy controls)

### 🏷️ Content Discovery
- Trending tags and topics
- Feed with personalized content
- Search and filtering capabilities
- Suggested users to follow

### 💬 Community Features
- Comment system with nested replies
- Emoji reactions (😂, 🔥, ✅)
- User following system
- Community-based content organization

### 🤖 AI Integration
- Chat with "Aunt Karen" - an AI assistant for support and advice
- AI-powered content moderation
- Smart content recommendations

## Tech Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **JWT Authentication** - Secure token-based auth
- **Django AllAuth** - Social authentication
- **Celery** - Background task processing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **Zustand** - State management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/failink.git
   cd failink
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin panel: http://localhost:8000/admin

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Documentation

### User Profile Endpoints

#### Get User Statistics
```
GET /api/users/{user_id}/stats/
```
Returns comprehensive user statistics including:
- Posts created count
- Reactions received (likes, hugs, relates, emoji)
- Reactions given
- Total engagement metrics

#### Get User Posts
```
GET /api/users/{user_id}/posts/
```
Returns paginated list of posts created by the user.

#### Get User Reactions
```
GET /api/users/{user_id}/reactions/?type={reaction_type}
```
Returns posts the user has reacted to, optionally filtered by reaction type:
- `type=like` - Posts user has liked
- `type=hug` - Posts user has hugged
- `type=relate` - Posts user has related to
- `type=emoji` - Posts user has emoji-reacted to
- `type=all` (default) - All posts user has reacted to

### Authentication Endpoints

#### Register User
```
POST /api/users/register/
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "password2": "password"
}
```

#### Login
```
POST /api/users/login/
{
  "email": "user@example.com",
  "password": "password",
  "remember_me": false
}
```

#### Google OAuth
```
POST /api/users/google/
{
  "access_token": "google_access_token"
}
```

## Profile Page Features

The profile page provides a comprehensive view of user activity and engagement:

### 📊 Statistics Tab
- **Posts Created**: Total number of failure stories shared
- **Reactions Received**: Total engagement from the community
- **Reactions Given**: User's engagement with other posts
- **Average Reactions per Post**: Engagement rate metric
- **Detailed Breakdown**: Separate counts for likes, hugs, relates, and emoji reactions

### 📝 Posts Tab
- **User's Posts**: All posts created by the user
- **Pagination**: Load more posts as needed
- **Full Post Display**: Complete post cards with reactions and comments
- **Empty State**: Encouraging message for users with no posts yet

### ❤️ Reactions Tab
- **Reacted Posts**: All posts the user has engaged with
- **Reaction Types**: Filter by specific reaction types
- **Community Activity**: See what content resonates with the user
- **Empty State**: Encouraging message for users with no reactions yet

### 🔄 Cross-User Profiles
- **View Other Users**: Navigate to `/profile/{user_id}` to view other users' profiles
- **Privacy Controls**: Appropriate content visibility based on user relationships
- **Navigation**: Easy switching between own profile and other users' profiles

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Join our community discussions
- Check our documentation

---

Built with ❤️ by the FailInk team. Remember, every failure is a step toward success! 🚀 

## Recent Updates

### Post Edit & Delete Feature (Latest)
- Users can now edit and delete their own posts
- Edit functionality includes title, content, and tags
- Delete functionality with confirmation dialog
- Permission-based access (users can only modify their own posts)
- Comprehensive error handling for all scenarios
- Real-time UI updates after changes

#### Testing the Edit & Delete Feature:
1. **Create a post**: Go to the main feed and create a new post
2. **Edit a post**: 
   - Go to your profile (`/profile`)
   - Click "Edit" on any of your posts
   - Modify title, content, or tags
   - Click "Update Post"
3. **Delete a post**:
   - Click "Delete" on any of your posts
   - Confirm the deletion
   - Post will be removed from all views
4. **Test error handling**:
   - Try to edit a post that was deleted (should show 404 error)
   - Try to edit someone else's post (should show permission error)

### Previous Features 