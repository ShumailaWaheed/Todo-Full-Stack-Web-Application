# API Contract: Todo Full-Stack Web Application

## Base URL
All endpoints are under `/api/` as required by the constitution.

## Authentication
All endpoints require JWT authentication using the Authorization header:
`Authorization: Bearer <token>`

## Endpoints

### 1. List User's Tasks
- **Method**: GET
- **Endpoint**: `/api/{user_id}/tasks`
- **Authentication**: Required
- **Authorization**: URL user_id must match authenticated user
- **Request Parameters**:
  - `user_id` (path): User ID from JWT must match this value
  - `completed` (query, optional): Filter by completion status (true/false)
  - `limit` (query, optional): Number of tasks to return (default: 50, max: 100)
  - `offset` (query, optional): Offset for pagination (default: 0)
- **Response**: 200 OK with array of task objects
- **Response Schema**:
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "string (max 200)",
      "description": "string (max 2000)",
      "completed": true,
      "user_id": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "total": 0,
  "offset": 0,
  "limit": 50
}
```
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: URL user_id does not match authenticated user
  - 404 Not Found: User_id does not exist or no access to tasks

### 2. Create New Task
- **Method**: POST
- **Endpoint**: `/api/{user_id}/tasks`
- **Authentication**: Required
- **Authorization**: URL user_id must match authenticated user
- **Request Parameters**:
  - `user_id` (path): User ID from JWT must match this value
- **Request Body**:
```json
{
  "title": "string (max 200)",
  "description": "string (max 2000, optional)",
  "completed": "boolean (optional, default: false)"
}
```
- **Response**: 201 Created with created task object
- **Response Schema**:
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "completed": false,
  "user_id": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
- **Error Responses**:
  - 400 Bad Request: Invalid request body or validation errors
  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: URL user_id does not match authenticated user
  - 404 Not Found: User_id does not exist

### 3. Get Specific Task
- **Method**: GET
- **Endpoint**: `/api/{user_id}/tasks/{id}`
- **Authentication**: Required
- **Authorization**: URL user_id must match authenticated user AND task belongs to user
- **Request Parameters**:
  - `user_id` (path): User ID from JWT must match this value
  - `id` (path): Task ID to retrieve
- **Response**: 200 OK with task object
- **Response Schema**:
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "completed": true,
  "user_id": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: URL user_id does not match authenticated user
  - 404 Not Found: Task does not exist or no access to task

### 4. Update Task
- **Method**: PUT
- **Endpoint**: `/api/{user_id}/tasks/{id}`
- **Authentication**: Required
- **Authorization**: URL user_id must match authenticated user AND task belongs to user
- **Request Parameters**:
  - `user_id` (path): User ID from JWT must match this value
  - `id` (path): Task ID to update
- **Request Body**:
```json
{
  "title": "string (max 200)",
  "description": "string (max 2000, optional)",
  "completed": "boolean"
}
```
- **Response**: 200 OK with updated task object
- **Response Schema**:
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "completed": false,
  "user_id": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
- **Error Responses**:
  - 400 Bad Request: Invalid request body or validation errors
  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: URL user_id does not match authenticated user
  - 404 Not Found: Task does not exist or no access to task

### 5. Delete Task
- **Method**: DELETE
- **Endpoint**: `/api/{user_id}/tasks/{id}`
- **Authentication**: Required
- **Authorization**: URL user_id must match authenticated user AND task belongs to user
- **Request Parameters**:
  - `user_id` (path): User ID from JWT must match this value
  - `id` (path): Task ID to delete
- **Response**: 204 No Content
- **Error Responses**:
  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: URL user_id does not match authenticated user
  - 404 Not Found: Task does not exist or no access to task

### 6. Toggle Task Completion
- **Method**: PATCH
- **Endpoint**: `/api/{user_id}/tasks/{id}/complete`
- **Authentication**: Required
- **Authorization**: URL user_id must match authenticated user AND task belongs to user
- **Request Parameters**:
  - `user_id` (path): User ID from JWT must match this value
  - `id` (path): Task ID to toggle
- **Request Body**:
```json
{
  "completed": "boolean"
}
```
- **Response**: 200 OK with updated task object
- **Response Schema**:
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "completed": true,
  "user_id": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
- **Error Responses**:
  - 400 Bad Request: Invalid request body
  - 401 Unauthorized: Missing or invalid JWT token
  - 403 Forbidden: URL user_id does not match authenticated user
  - 404 Not Found: Task does not exist or no access to task

## Common Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Access forbidden"
}
```

### 404 Not Found
```json
{
  "detail": "Item not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

## Security Considerations
- All endpoints require JWT authentication
- User isolation enforced: user_id in URL must match authenticated user
- No cross-user data access allowed
- Invalid access attempts return 404 (not 403) to prevent user enumeration