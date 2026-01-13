import http.server
import socketserver
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler
import re

class TodoAPIHandler(BaseHTTPRequestHandler):
    def add_cors_headers(self):
        # Check if Origin header is present in the request
        origin = self.headers.get('Origin')
        if origin:
            self.send_header('Access-Control-Allow-Origin', origin)
        else:
            # Fallback to localhost:3000 if no origin specified
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_GET(self):
        self.add_cors_headers()
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
        self.add_cors_headers()
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        # Parse the request body
        try:
            request_body = json.loads(post_data.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
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
        self.add_cors_headers()
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Suppress logging to keep console clean
        pass

PORT = 8000

if __name__ == "__main__":
    print(f"Starting Todo API Mock Server at http://localhost:{PORT}")
    print("Ready to handle requests for:")
    print("- GET / (root)")
    print("- POST /auth/login")
    print("- POST /auth/refresh")
    print("- POST /auth/check-email")

    with socketserver.TCPServer(("", PORT), TodoAPIHandler) as httpd:
        print(f"Todo API Mock Server running at port {PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down the server...")
            httpd.shutdown()