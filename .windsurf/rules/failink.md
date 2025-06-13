---
trigger: always_on
---

✅ FailInk – Project Rules & AI Coding Guidelines
🔐 1. Security First
🔒 Never hardcode secrets or credentials — must use .env + environment variables.

🔐 Use HTTPS-only cookies and secure JWT storage (e.g., HttpOnly cookies or secure local storage).

🔄 Implement token refresh with JWT for session continuity.

✅ Input validation required on both frontend & backend (no trust from frontend).

🚫 Do not expose internal server logic or debug traces in error messages.

🎨 2. Frontend Rules
🧱 Use Tailwind CSS for all styling. Avoid inline styles and large custom CSS unless necessary.

🧠 Components must be modular, reusable, and live in /components/ (e.g., PostCard.jsx, Sidebar.jsx)

🌐 Pages must use React Router for routing. Dynamic routing must be URL-safe.

🔁 All API calls must be abstracted into an api/ service layer using Axios (no raw fetch).

💾 Use Zustand or Redux for global state (e.g., auth state, user info, post likes).

🚀 Animations should use Framer Motion (smooth, but lightweight).

📱 Fully responsive layout for mobile, tablet, and desktop.

⚙️ 3. Backend Rules (Django)
📦 Apps must follow Django modular app structure: users, posts, feed, chatbot, badges, etc.

🧪 Every endpoint must have unit tests using pytest-django.

✅ Use Django REST Framework for all APIs.

🧑‍💻 Auth must be via Google OAuth + JWT using django-allauth or social-auth-app-django.

⏱️ Rate limiting should be enabled on public endpoints using django-ratelimit.

🚫 Don’t expose internal model names or IDs directly — use UUIDs or slugs.

🔁 API pagination required on all list views.

🔒 Secure file uploads with validation and optional virus scanning for media content.

🤖 4. AI/LLM Integration Rules
💬 All LLM calls (e.g., Aunt Karen, Roast Me) should use prompt templates and temperature tuning.

🚦 Use request throttling and fallback responses to prevent overloading LLM APIs.

🛡️ Never store user messages without anonymization (GDPR-aware AI logging).

🧠 Add a sanity checker middleware to AI responses — no offensive, hateful, or NSFW content.

🛠️ 5. Code Quality & Best Practices
✅ All code must be typed (TypeScript for frontend, Python type hints for backend).

🧹 Auto-format code using Prettier (frontend) and Black (backend).

⛔ No commented-out legacy code — clean up before merging.

🧪 Every major feature requires test coverage (unit + integration).

📝 Every component and API must have meaningful docstrings / comments.

🚀 6. Deployment Standards
🐳 Must use Docker + docker-compose for both frontend and backend in dev/staging.

☁️ Must support deploy to platforms like Vercel (frontend) and Railway/DigitalOcean/AWS (backend).

🔄 Must have separate environments: development, staging, production

✅ CI/CD pipeline (GitHub Actions) must lint, test, and deploy the app.

🔐 SSL must be enabled on production with automatic cert renewal (Let’s Encrypt or platform-provided).

👥 7. User Experience (UX) Principles
🧠 App must be intuitive — don’t overload users with controls. Use humor and clarity.

🤡 Error messages should follow brand tone (fun, not dry).

📱 Mobile-first design — test on iOS/Android breakpoints.

🧭 Always show feedback for loading, posting, and errors (spinners, toasts).

🎯 8. AI Agent Rules of Engagement
If an AI agent is generating code, it must:

Validate input and sanitize all user content.

Ask before overwriting or deleting existing files.

Ensure all backend APIs are tested before frontend consumption.

Write code with clear naming conventions and separation of concerns.

Avoid generating bloated or unused components.

Follow the latest LTS versions of all libraries (e.g., React 18+, Django 4+).

Do not skip error handling unless explicitly told.

Respect the structure defined in /components/, /pages/, /api/, /apps/.