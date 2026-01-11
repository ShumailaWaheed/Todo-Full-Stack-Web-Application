import http.server
import socketserver
from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
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
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {"message": "Request received", "path": self.path}
        self.wfile.write(json.dumps(response).encode())

PORT = 8001

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Simple Todo API server running at port {PORT}")
    httpd.serve_forever()