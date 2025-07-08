#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # If it's a static file (has extension), serve it normally
        if '.' in parsed_path.path.split('/')[-1]:
            return super().do_GET()
        
        # For all other routes, serve index.html
        self.path = '/index.html'
        return super().do_GET()

if __name__ == "__main__":
    PORT = 3002
    os.chdir('dist')
    
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Serving SPA at http://localhost:{PORT}")
        httpd.serve_forever()
