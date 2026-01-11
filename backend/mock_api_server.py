import http.server
import socketserver
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler
import re

class TodoAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"message": "Todo API is running!"}
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "healthy"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Not Found"}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        # Parse the request body
        try:
            request_body = json.loads(post_data.decode('utf-8'))
        except:
            request_body = {}

        if self.path.endswith('/auth/login'):
            # Handle login request
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "access_token": "mock_access_token_for_testing",
                "refresh_token": "mock_refresh_token_for_testing",
                "token_type": "bearer"
            }
            self.wfile.write(json.dumps(response).encode())
        elif self.path.endswith('/auth/refresh'):
            # Handle token refresh
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "access_token": "mock_access_token_for_testing",
                "refresh_token": "mock_refresh_token_for_testing",
                "token_type": "bearer"
            }
            self.wfile.write(json.dumps(response).encode())
        elif self.path.endswith('/auth/check-email'):
            # Handle email check
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"exists": False}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Not Found"}
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        # Handle preflight requests for CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

# Set up the server to handle CORS
def enable_cors(self):
    self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

# Monkey patch to add CORS headers
original_end_headers = BaseHTTPRequestHandler.end_headers
def end_headers_with_cors(self):
    if not self.headers.get('Origin'):
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
    else:
        self.send_header('Access-Control-Allow-Origin', self.headers.get('Origin'))
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    original_end_headers(self)

BaseHTTPRequestHandler.end_headers = end_headers_with_cors

PORT = 8003

print(f"Starting Todo API Mock Server at http://localhost:{PORT}")
print("Ready to handle requests for:")
print("- GET / (root)")
print("- POST /auth/login")
print("- POST /auth/refresh")
print("- POST /auth/check-email")

with socketserver.TCPServer(("", PORT), TodoAPIHandler) as httpd:
    print(f"Todo API Mock Server running at port {PORT}")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()