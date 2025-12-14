# Quickstart Guide: Todo Full-Stack Web Application

## Prerequisites

- Node.js 18+ (for frontend development)
- Python 3.13+ (for backend development)
- Docker and Docker Compose
- pnpm package manager (recommended) or npm
- Git

## Environment Setup

### 1. Clone and Initialize Repository
```bash
git clone <repository-url>
cd todo-full-stack-web-application
```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
# or
pnpm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# or using uv (recommended per constitution)
uv pip install -r requirements.txt
```

### 3. Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env):**
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-jwt-token-with-minimum-length
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
BETTER_AUTH_SECRET=your-super-secret-jwt-token-with-minimum-length
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRES_DAYS=7
```

## Running the Application

### Option 1: Using Docker Compose (Recommended)
```bash
# From repository root
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Database: localhost:5432 (for development)

### Option 2: Running Separately

**Backend:**
```bash
cd backend
# Run database migrations
alembic upgrade head
# Start the server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# or
pnpm dev
```

## Database Setup

### Using Alembic for Migrations
```bash
# From backend directory
cd backend

# Create new migration
alembic revision --autogenerate -m "description of changes"

# Apply migrations
alembic upgrade head

# Check current revision
alembic current
```

### Initial Database Setup
The application will automatically create required tables if they don't exist on first run. For production, ensure migrations are run before deployment.

## API Endpoints

All API endpoints follow the pattern: `http://localhost:3000/api/{user_id}/...` (when using Next.js proxy) or `http://localhost:8000/api/{user_id}/...` (direct backend access).

### Available Endpoints:
1. `GET /api/{user_id}/tasks` - List user's tasks
2. `POST /api/{user_id}/tasks` - Create new task
3. `GET /api/{user_id}/tasks/{id}` - Get specific task
4. `PUT /api/{user_id}/tasks/{id}` - Update task
5. `DELETE /api/{user_id}/tasks/{id}` - Delete task
6. `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion status

## Authentication Flow

1. User registers/signs in via Better Auth UI components
2. Better Auth sets secure cookies with JWT tokens
3. Frontend automatically includes tokens in API requests
4. Backend validates JWT and extracts user_id for authorization
5. All API requests verify that user_id matches authenticated user

## Testing

### Backend Tests
```bash
cd backend
# Run all tests
pytest
# Run with coverage
pytest --cov=src --cov-report=html
# Run specific test file
pytest tests/test_tasks.py
```

### Frontend Tests
```bash
cd frontend
# Run component tests
npm run test
# Run E2E tests
npm run test:e2e
```

## Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Spec First**: Update specifications before implementation
3. **Code**: Implement according to specs
4. **Test**: Write and run tests
5. **Commit**: Follow conventional commits
6. **PR**: Submit pull request with spec references

## Deployment

### Environment Variables for Production
```env
# Backend
DATABASE_URL=your_production_database_url
BETTER_AUTH_SECRET=your_production_secret
BETTER_AUTH_URL=your_production_domain
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRES_DAYS=7

# Frontend
NEXT_PUBLIC_BETTER_AUTH_URL=your_production_domain
NEXT_PUBLIC_APP_URL=your_production_domain
```

### Build and Deploy
```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
# Run the application

# Frontend
cd frontend
npm run build
# Serve the built application
```

## Troubleshooting

### Common Issues

1. **JWT Validation Errors**: Ensure `BETTER_AUTH_SECRET` is identical in both frontend and backend
2. **Database Connection**: Verify `DATABASE_URL` is correct and database is running
3. **CORS Issues**: Make sure frontend and backend domains match in configuration
4. **Migration Errors**: Run `alembic upgrade head` to ensure database schema is up to date

### Development Tips

- Use `console.log` in frontend and `print` in backend for debugging during development
- Enable FastAPI's automatic documentation at `/docs` for API exploration
- Use the Next.js development server's hot reload for rapid UI iteration