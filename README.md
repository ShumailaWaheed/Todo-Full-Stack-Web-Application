# Todo Full-Stack Web Application

A secure todo application with user authentication, built with Next.js 16+, FastAPI, SQLModel, and Better Auth integration.

## Features

- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Task Management**: Create, read, update, delete, and toggle completion status of tasks
- **User Isolation**: Strict enforcement that users can only access their own tasks
- **Responsive Design**: Mobile-first responsive UI using Tailwind CSS
- **Type Safety**: Full TypeScript support on both frontend and backend
- **Security**: Input validation, user enumeration prevention, secure token handling

## Tech Stack

- **Frontend**: Next.js 16+, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.13+, SQLModel, Pydantic v2
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT tokens with Better Auth integration
- **ORM**: SQLModel (combines SQLAlchemy and Pydantic)

## Prerequisites

- Node.js 18+
- Python 3.13+
- PostgreSQL (or Neon account for serverless)
- Docker (optional, for containerized development)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   python -m src.main
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
BETTER_AUTH_SECRET=your-super-secret-jwt-key-change-in-production
ALEMBIC_DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Documentation

The API documentation is automatically available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Migrations

To create a new migration:
```bash
cd backend
alembic revision --autogenerate -m "Description of migration"
```

To apply migrations:
```bash
alembic upgrade head
```

To downgrade:
```bash
alembic downgrade -1
```

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Docker Setup

A `docker-compose.yml` file is provided for containerized development:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Deployment

### Backend Deployment

1. Ensure environment variables are properly set
2. Run database migrations in production
3. Start the application server

### Frontend Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Tasks
- `GET /api/users/{user_id}/tasks` - List user's tasks
- `POST /api/users/{user_id}/tasks` - Create a new task
- `GET /api/users/{user_id}/tasks/{id}` - Get a specific task
- `PUT /api/users/{user_id}/tasks/{id}` - Update a task
- `PATCH /api/users/{user_id}/tasks/{id}/complete` - Toggle task completion
- `DELETE /api/users/{user_id}/tasks/{id}` - Delete a task

## Security Features

- JWT tokens with short-lived access tokens (15 minutes) and longer-lived refresh tokens (7 days)
- User enumeration prevention (return 404 instead of 403 for unauthorized access)
- Input validation with character limits (title: 200 chars, description: 2000 chars)
- User isolation at the API level
- Secure token storage and refresh mechanisms

## Development

### Adding New Features

1. Update the data models in `backend/src/models/`
2. Create/update Pydantic schemas in `backend/src/schemas/`
3. Implement API endpoints in `backend/src/routers/`
4. Create/update frontend components in `frontend/components/`
5. Add type definitions in `frontend/lib/types/`
6. Update API service in `frontend/lib/api/`

### Code Standards

- Follow TypeScript strict mode
- Use consistent naming conventions
- Include proper error handling
- Add JSDoc comments for public functions
- Write tests for new functionality

## Troubleshooting

### Common Issues

1. **Database Connection Issues**: Ensure PostgreSQL is running and credentials are correct
2. **Authentication Issues**: Check JWT secret is consistent between frontend and backend
3. **CORS Issues**: Ensure API URL is properly configured

### Development Commands

- Start backend: `python -m src.main`
- Start frontend: `npm run dev`
- Run backend tests: `pytest`
- Run frontend tests: `npm test`
- Format backend code: `black . && isort .`
- Format frontend code: `npm run format`

## Architecture

This application follows a monorepo structure with clear separation between frontend and backend:

```
├── backend/              # FastAPI application
│   ├── src/
│   │   ├── main.py      # Application entry point
│   │   ├── models/      # SQLModel definitions
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routers/     # API routes
│   │   └── middleware/  # Authentication middleware
│   ├── alembic/         # Database migrations
│   └── tests/           # Backend tests
├── frontend/            # Next.js application
│   ├── app/            # App Router pages
│   ├── components/     # Reusable UI components
│   ├── lib/           # Shared utilities and types
│   └── styles/        # Global styles
└── docker-compose.yml  # Container configuration
```

## License

This project is licensed under the MIT License.