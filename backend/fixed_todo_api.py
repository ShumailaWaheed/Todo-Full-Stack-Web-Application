from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime, timedelta
import secrets
import sqlite3
import os

# Initialize database
DB_PATH = "todo_api.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')

    # Create tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            due_date TEXT,
            priority TEXT DEFAULT 'medium',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Create projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            due_date TEXT,
            priority TEXT DEFAULT 'medium',
            completed BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

# Initialize database
init_db()

class TodoAPIHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.set_headers()
        self.end_headers()

    def set_headers(self):
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def log_request(self, code='-', size='-'):
        """Override to prevent logging every request"""
        pass

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        if self.path == '/auth/login':
            self.handle_login(post_data)
        elif self.path == '/auth/refresh':
            self.handle_refresh(post_data)
        elif self.path.startswith('/api/') and (self.path.count('/') == 2 or self.path.count('/') == 3):
            # Handle task creation: /api/{user_id} or /api/{user_id}/ (without 'tasks' in path)
            path_parts = self.path.split('/')
            # For /api/user_id: ['', 'api', 'user_id'] (length 3)
            # For /api/user_id/: ['', 'api', 'user_id', ''] (length 4)
            if len(path_parts) >= 3:
                user_id = path_parts[2]
                if user_id:  # Make sure user_id is not empty
                    self.handle_create_task(user_id, json.loads(post_data.decode()))
                else:
                    self.send_response(404)
                    self.set_headers()
                    self.end_headers()
        elif self.path.startswith('/api/') and self.path.count('/') == 3 and '/projects' in self.path:
            # Handle project creation: /api/{user_id}/projects
            path_parts = self.path.split('/')
            if len(path_parts) >= 4 and path_parts[3] == 'projects':
                user_id = path_parts[2]
                self.handle_create_project(user_id, json.loads(post_data.decode()))
        else:
            self.send_response(404)
            self.set_headers()
            self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.handle_root()
        elif self.path.startswith('/api/') and '/analytics/' in self.path:
            # Handle analytics endpoints
            self.handle_analytics()
        elif self.path.startswith('/api/') and self.path.count('/') == 3 and '?' in self.path:
            # Handle getting tasks for user with query parameters: /api/{user_id}?limit=10&offset=0
            path_parts = self.path.split('/')
            if len(path_parts) >= 3:
                user_id = path_parts[2].split('?')[0]  # Remove query parameters from user_id
                # Extract query parameters
                query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
                limit = int(query_params.get('limit', ['10'])[0])
                offset = int(query_params.get('offset', ['0'])[0])
                self.handle_get_tasks(user_id, limit, offset)
        elif self.path.startswith('/api/') and (self.path.count('/') == 2 or self.path.count('/') == 3) and '?' in self.path:
            # Handle getting tasks for user with query parameters: /api/{user_id}?limit=10&offset=0
            path_parts = self.path.split('/')
            if len(path_parts) >= 3:
                user_id = path_parts[2].split('?')[0]  # Remove query parameters from user_id
                # Extract query parameters
                query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
                limit = int(query_params.get('limit', ['10'])[0])
                offset = int(query_params.get('offset', ['0'])[0])
                self.handle_get_tasks(user_id, limit, offset)
        elif self.path.startswith('/api/') and self.path.count('/') == 3:
            # Handle getting specific resource: /api/{user_id}/{task_id} or /api/{user_id}/projects/{project_id}
            path_parts = self.path.split('/')
            if len(path_parts) >= 4:
                user_id = path_parts[2]
                potential_resource_type = path_parts[3]  # Could be task_id or 'projects'

                # Check if this is a project request
                if potential_resource_type == 'projects':
                    # This is a project request: /api/{user_id}/projects/{project_id}
                    if len(path_parts) >= 5:
                        project_id = path_parts[4]
                        self.handle_get_project(user_id, project_id)
                    else:
                        self.send_response(404)
                        self.set_headers()
                        self.end_headers()
                else:
                    # This is a task request: /api/{user_id}/{task_id}
                    task_id = potential_resource_type
                    self.handle_get_task(user_id, task_id)
        elif self.path.startswith('/api/') and (self.path.count('/') == 2 or self.path.count('/') == 3):
            # Handle getting tasks for user: /api/{user_id}/ (without 'tasks' in path)
            path_parts = self.path.split('/')
            if len(path_parts) >= 3:
                user_id = path_parts[2]
                if user_id:  # Make sure user_id is not empty
                    self.handle_get_tasks(user_id)
                else:
                    self.send_response(404)
                    self.set_headers()
                    self.end_headers()
            else:
                self.send_response(404)
                self.set_headers()
                self.end_headers()
        else:
            self.send_response(404)
            self.set_headers()
            self.end_headers()

    def do_PUT(self):
        content_length = int(self.headers['Content-Length'])
        put_data = self.rfile.read(content_length)

        if self.path.startswith('/api/') and self.path.count('/') == 3:
            # Handle updating resource: /api/{user_id}/{task_id} or /api/{user_id}/projects/{project_id}
            path_parts = self.path.split('/')
            if len(path_parts) >= 4:
                user_id = path_parts[2]
                potential_resource_type = path_parts[3]  # Could be task_id or 'projects'

                # Check if this is a project update
                if potential_resource_type == 'projects':
                    # This is a project update: /api/{user_id}/projects/{project_id}
                    if len(path_parts) >= 5:
                        project_id = path_parts[4]
                        data = json.loads(put_data.decode())
                        self.handle_update_project(user_id, project_id, data)
                    else:
                        self.send_response(404)
                        self.set_headers()
                        self.end_headers()
                else:
                    # This is a task update: /api/{user_id}/{task_id}
                    task_id = potential_resource_type
                    data = json.loads(put_data.decode())
                    self.handle_update_task(user_id, task_id, data)
            else:
                self.send_response(404)
                self.set_headers()
                self.end_headers()
        else:
            self.send_response(404)
            self.set_headers()
            self.end_headers()

    def do_DELETE(self):
        if self.path.startswith('/api/') and self.path.count('/') == 3:
            # Handle deleting resource: /api/{user_id}/{task_id} or /api/{user_id}/projects/{project_id}
            path_parts = self.path.split('/')
            if len(path_parts) >= 4:
                user_id = path_parts[2]
                potential_resource_type = path_parts[3]  # Could be task_id or 'projects'

                # Check if this is a project deletion
                if potential_resource_type == 'projects':
                    # This is a project deletion: /api/{user_id}/projects/{project_id}
                    if len(path_parts) >= 5:
                        project_id = path_parts[4]
                        self.handle_delete_project(user_id, project_id)
                    else:
                        self.send_response(404)
                        self.set_headers()
                        self.end_headers()
                else:
                    # This is a task deletion: /api/{user_id}/{task_id}
                    task_id = potential_resource_type
                    self.handle_delete_task(user_id, task_id)
            else:
                self.send_response(404)
                self.set_headers()
                self.end_headers()
        else:
            self.send_response(404)
            self.set_headers()
            self.end_headers()

    def do_PATCH(self):
        content_length = int(self.headers['Content-Length'])
        patch_data = self.rfile.read(content_length)

        if self.path.startswith('/api/') and '/complete' in self.path and self.path.count('/') == 4:
            # Handle toggling task completion: /api/{user_id}/{task_id}/complete
            path_parts = self.path.split('/')
            if len(path_parts) >= 5 and path_parts[4] == 'complete':
                user_id = path_parts[2]
                task_id = path_parts[3]
                data = json.loads(patch_data.decode())
                self.handle_toggle_task_completion(user_id, task_id, data)
            else:
                self.send_response(404)
                self.set_headers()
                self.end_headers()
        else:
            self.send_response(404)
            self.set_headers()
            self.end_headers()

    def handle_root(self):
        self.send_response(200)
        self.set_headers()
        self.end_headers()
        response = {"message": "Simple Todo API is running!", "version": "2.0.0"}
        self.wfile.write(json.dumps(response).encode())

    def handle_login(self, post_data):
        try:
            data = json.loads(post_data.decode())
            email = data.get('email', '')

            if not email or '@' not in email:
                self.send_response(400)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Invalid email format"}
                self.wfile.write(json.dumps(response).encode())
                return

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check if user exists
            cursor.execute("SELECT id, email FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()

            if user:
                user_id = user[0]
            else:
                # Create new user
                user_id = f"user_{secrets.token_hex(8)}"
                created_at = datetime.now().isoformat()
                cursor.execute("""
                    INSERT INTO users (id, email, created_at, updated_at)
                    VALUES (?, ?, ?, ?)
                """, (user_id, email, created_at, created_at))
                conn.commit()

            conn.close()

            # Generate mock tokens
            access_token = f"mock_access_token_{secrets.token_urlsafe(16)}"
            refresh_token = f"mock_refresh_token_{secrets.token_urlsafe(16)}"

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            response = {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "email": email
                }
            }
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_refresh(self, post_data):
        try:
            # Generate new tokens
            access_token = f"mock_access_token_{secrets.token_urlsafe(16)}"
            refresh_token = f"mock_refresh_token_{secrets.token_urlsafe(16)}"

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            response = {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_create_task(self, user_id, data):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            task_id = f"task_{secrets.token_hex(8)}"
            title = data.get("title", "")
            description = data.get("description", "")
            completed = bool(data.get("completed", False))
            due_date = data.get("due_date")
            priority = data.get("priority", "medium")
            created_at = datetime.now().isoformat()

            cursor.execute("""
                INSERT INTO tasks (id, user_id, title, description, completed, due_date, priority, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (task_id, user_id, title, description, completed, due_date, priority, created_at, created_at))

            conn.commit()

            # Retrieve the created task
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task_row = cursor.fetchone()

            conn.close()

            if task_row:
                task = {
                    "id": task_row[0],
                    "user_id": task_row[1],
                    "title": task_row[2],
                    "description": task_row[3],
                    "completed": bool(task_row[4]),
                    "due_date": task_row[5],
                    "priority": task_row[6],
                    "created_at": task_row[7],
                    "updated_at": task_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(task).encode())
            else:
                self.send_response(500)
                self.set_headers()
                self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_create_project(self, user_id, data):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            project_id = f"proj_{secrets.token_hex(8)}"
            name = data.get("name", "")
            description = data.get("description", "")
            due_date = data.get("due_date")
            priority = data.get("priority", "medium")
            completed = bool(data.get("completed", False))
            created_at = datetime.now().isoformat()

            cursor.execute("""
                INSERT INTO projects (id, user_id, name, description, due_date, priority, completed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (project_id, user_id, name, description, due_date, priority, completed, created_at, created_at))

            conn.commit()

            # Retrieve the created project
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            proj_row = cursor.fetchone()

            conn.close()

            if proj_row:
                project = {
                    "id": proj_row[0],
                    "user_id": proj_row[1],
                    "name": proj_row[2],
                    "description": proj_row[3],
                    "due_date": proj_row[4],
                    "priority": proj_row[5],
                    "completed": bool(proj_row[6]),
                    "created_at": proj_row[7],
                    "updated_at": proj_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(project).encode())
            else:
                self.send_response(500)
                self.set_headers()
                self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_get_tasks(self, user_id, limit=10, offset=0):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Query with LIMIT and OFFSET for pagination
            cursor.execute("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", (user_id, limit, offset))
            task_rows = cursor.fetchall()

            # Also get total count for pagination metadata
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE user_id = ?", (user_id,))
            total_count = cursor.fetchone()[0]

            conn.close()

            tasks = []
            for row in task_rows:
                task = {
                    "id": row[0],
                    "user_id": row[1],
                    "title": row[2],
                    "description": row[3],
                    "completed": bool(row[4]),
                    "due_date": row[5],
                    "priority": row[6],
                    "created_at": row[7],
                    "updated_at": row[8]
                }
                tasks.append(task)

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            response = {
                "tasks": tasks,
                "total": total_count,
                "limit": limit,
                "offset": offset
            }
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_get_task(self, user_id, task_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Use a more explicit query to ensure we're getting the right record
            cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            task_row = cursor.fetchone()

            conn.close()

            if task_row:
                task = {
                    "id": task_row[0],
                    "user_id": task_row[1],
                    "title": task_row[2],
                    "description": task_row[3],
                    "completed": bool(task_row[4]),
                    "due_date": task_row[5],
                    "priority": task_row[6],
                    "created_at": task_row[7],
                    "updated_at": task_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(task).encode())
            else:
                print(f"DEBUG: Task not found - ID: {task_id}, User: {user_id}")  # Debug print
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Task not found"}
                self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            print(f"DEBUG: Error in handle_get_task: {str(e)}")  # Debug print
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_get_projects(self, user_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM projects WHERE user_id = ?", (user_id,))
            proj_rows = cursor.fetchall()

            conn.close()

            projects = []
            for row in proj_rows:
                project = {
                    "id": row[0],
                    "user_id": row[1],
                    "name": row[2],
                    "description": row[3],
                    "due_date": row[4],
                    "priority": row[5],
                    "completed": bool(row[6]),
                    "created_at": row[7],
                    "updated_at": row[8]
                }
                projects.append(project)

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            self.wfile.write(json.dumps(projects).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_get_project(self, user_id, project_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
            proj_row = cursor.fetchone()

            conn.close()

            if proj_row:
                project = {
                    "id": proj_row[0],
                    "user_id": proj_row[1],
                    "name": proj_row[2],
                    "description": proj_row[3],
                    "due_date": proj_row[4],
                    "priority": proj_row[5],
                    "completed": bool(proj_row[6]),
                    "created_at": proj_row[7],
                    "updated_at": proj_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(project).encode())
            else:
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Project not found"}
                self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_update_task(self, user_id, task_id, data):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check if task exists and belongs to user
            cursor.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            if not cursor.fetchone():
                conn.close()
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Task not found"}
                self.wfile.write(json.dumps(response).encode())
                return

            # Update the task
            updated_at = datetime.now().isoformat()
            cursor.execute("""
                UPDATE tasks
                SET title = COALESCE(?, title),
                    description = COALESCE(?, description),
                    completed = COALESCE(?, completed),
                    due_date = COALESCE(?, due_date),
                    priority = COALESCE(?, priority),
                    updated_at = ?
                WHERE id = ?
            """, (
                data.get('title'), data.get('description'), data.get('completed'),
                data.get('due_date'), data.get('priority'), updated_at, task_id
            ))

            conn.commit()

            # Retrieve the updated task
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task_row = cursor.fetchone()

            conn.close()

            if task_row:
                task = {
                    "id": task_row[0],
                    "user_id": task_row[1],
                    "title": task_row[2],
                    "description": task_row[3],
                    "completed": bool(task_row[4]),
                    "due_date": task_row[5],
                    "priority": task_row[6],
                    "created_at": task_row[7],
                    "updated_at": task_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(task).encode())
            else:
                self.send_response(500)
                self.set_headers()
                self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_update_project(self, user_id, project_id, data):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check if project exists and belongs to user
            cursor.execute("SELECT id FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
            if not cursor.fetchone():
                conn.close()
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Project not found"}
                self.wfile.write(json.dumps(response).encode())
                return

            # Update the project
            updated_at = datetime.now().isoformat()
            cursor.execute("""
                UPDATE projects
                SET name = COALESCE(?, name),
                    description = COALESCE(?, description),
                    due_date = COALESCE(?, due_date),
                    priority = COALESCE(?, priority),
                    completed = COALESCE(?, completed),
                    updated_at = ?
                WHERE id = ?
            """, (
                data.get('name'), data.get('description'), data.get('due_date'),
                data.get('priority'), data.get('completed'), updated_at, project_id
            ))

            conn.commit()

            # Retrieve the updated project
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            proj_row = cursor.fetchone()

            conn.close()

            if proj_row:
                project = {
                    "id": proj_row[0],
                    "user_id": proj_row[1],
                    "name": proj_row[2],
                    "description": proj_row[3],
                    "due_date": proj_row[4],
                    "priority": proj_row[5],
                    "completed": bool(proj_row[6]),
                    "created_at": proj_row[7],
                    "updated_at": proj_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(project).encode())
            else:
                self.send_response(500)
                self.set_headers()
                self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_delete_task(self, user_id, task_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check if task exists and belongs to user
            cursor.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            if not cursor.fetchone():
                conn.close()
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Task not found"}
                self.wfile.write(json.dumps(response).encode())
                return

            cursor.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            conn.commit()
            conn.close()

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            response = {"message": "Task deleted successfully"}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_delete_project(self, user_id, project_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check if project exists and belongs to user
            cursor.execute("SELECT id FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
            if not cursor.fetchone():
                conn.close()
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Project not found"}
                self.wfile.write(json.dumps(response).encode())
                return

            cursor.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
            conn.commit()
            conn.close()

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            response = {"message": "Project deleted successfully"}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_toggle_task_completion(self, user_id, task_id, patch_data):
        try:
            data = json.loads(patch_data.decode())
            new_completed_state = data.get('completed', True)

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            # Check if task exists and belongs to user
            cursor.execute("SELECT id FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
            if not cursor.fetchone():
                conn.close()
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                response = {"detail": "Task not found"}
                self.wfile.write(json.dumps(response).encode())
                return

            # Update the task completion status
            updated_at = datetime.now().isoformat()
            cursor.execute("""
                UPDATE tasks
                SET completed = ?, updated_at = ?
                WHERE id = ? AND user_id = ?
            """, (new_completed_state, updated_at, task_id, user_id))

            conn.commit()

            # Retrieve the updated task
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task_row = cursor.fetchone()

            conn.close()

            if task_row:
                task = {
                    "id": task_row[0],
                    "user_id": task_row[1],
                    "title": task_row[2],
                    "description": task_row[3],
                    "completed": bool(task_row[4]),
                    "due_date": task_row[5],
                    "priority": task_row[6],
                    "created_at": task_row[7],
                    "updated_at": task_row[8]
                }

                self.send_response(200)
                self.set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(task).encode())
            else:
                self.send_response(500)
                self.set_headers()
                self.end_headers()
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

    def handle_analytics(self):
        try:
            # Return mock analytics data
            path_parts = self.path.split('/')
            if len(path_parts) < 4:
                self.send_response(404)
                self.set_headers()
                self.end_headers()
                return

            user_id = path_parts[2]

            # Check if the analytics endpoint has specific parameters
            if 'completion-trends' in self.path:
                # Handle completion trends analytics
                response = {
                    "user_id": user_id,
                    "data": [
                        {"date": "2024-01-01", "completed": 5},
                        {"date": "2024-01-02", "completed": 3},
                        {"date": "2024-01-03", "completed": 8}
                    ]
                }
            elif 'weekly-activity' in self.path:
                # Handle weekly activity analytics
                response = {
                    "user_id": user_id,
                    "data": [
                        {"day": "Monday", "tasks": 5},
                        {"day": "Tuesday", "tasks": 3},
                        {"day": "Wednesday", "tasks": 7}
                    ]
                }
            elif 'summary' in self.path:
                # Handle summary analytics
                response = {
                    "user_id": user_id,
                    "completed_tasks": 15,
                    "pending_tasks": 5,
                    "total_tasks": 20,
                    "completion_rate": 75
                }
            else:
                # Default analytics response
                response = {
                    "user_id": user_id,
                    "analytics": {}
                }

            self.send_response(200)
            self.set_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.set_headers()
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode())

def run_server(port=8003):
    server_address = ('', port)
    httpd = HTTPServer(server_address, TodoAPIHandler)
    print(f'Simple Todo API v2.0 running on port {port}...')
    print(f'Available endpoints:')
    print(f'  GET / - Health check')
    print(f'  POST /auth/login - User login')
    print(f'  POST /auth/refresh - Token refresh')
    print(f'  GET /api/{{user_id}}/tasks - Get user tasks')
    print(f'  POST /api/{{user_id}}/tasks - Create task')
    print(f'  GET /api/{{user_id}}/tasks/{{id}} - Get specific task')
    print(f'  PUT /api/{{user_id}}/tasks/{{id}} - Update task')
    print(f'  DELETE /api/{{user_id}}/tasks/{{id}} - Delete task')
    print(f'  PATCH /api/{{user_id}}/tasks/{{id}}/complete - Toggle task completion')
    print(f'  GET /api/{{user_id}}/analytics/* - Analytics endpoints')
    print(f'  GET /api/{{user_id}}/projects - Get user projects')
    print(f'  POST /api/{{user_id}}/projects - Create project')
    print(f'  GET /api/{{user_id}}/projects/{{id}} - Get specific project')
    print(f'  PUT /api/{{user_id}}/projects/{{id}} - Update project')
    print(f'  DELETE /api/{{user_id}}/projects/{{id}} - Delete project')
    httpd.serve_forever()

if __name__ == "__main__":
    run_server(8003)