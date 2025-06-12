# 💥 FailInk — A Social Network for Glorious Fails

FailInk is LinkedIn's hilarious evil twin — a social storytelling platform where users share their real-life mess-ups, corporate disasters, startup faceplants, and everything in between.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Backend Setup
1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
cd backend
python manage.py migrate
```

5. Start development server:
```bash
python manage.py runserver
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## 🛠️ Development

### Running Tests
```bash
# Backend
python manage.py test

# Frontend
npm test
```

### Docker Setup
```bash
docker-compose up --build
```

## 📝 License
MIT License - See LICENSE file for details 

# FailInk

FailInk is a social platform where users can share their failure stories, learn from others' experiences, and build a supportive community around embracing and learning from failures.

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
- PostgreSQL
- JWT Authentication
- Google OAuth Integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/failink.git
cd failink
```

2. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

4. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

5. Create a `.env` file in the backend directory:
```
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/failink
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

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