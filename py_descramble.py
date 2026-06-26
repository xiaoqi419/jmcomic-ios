# Python descramble proxy - uses verified jmcomic library
import http.server
import urllib.request
import tempfile
import os
import json
import sys
import hashlib

from jmcomic import JmImageTool
from PIL import Image

def get_num(scramble_id, aid, filename):
    aidNum = int(aid)
    sc = int(scramble_id)
    if aidNum < sc:
        return 0
    if aidNum < 268850:
        return 10
    x = 10 if aidNum < 421926 else 8
    s = aid + filename
    h = hashlib.md5(s.encode()).hexdigest()
    return (ord(h[-1]) % x) * 2 + 2

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, parse_qs
        qs = parse_qs(urlparse(self.path).query)
        
        img_url = qs.get('url', [None])[0]
        sc = qs.get('sc', ['0'])[0]
        aid = qs.get('aid', ['0'])[0]
        fn = qs.get('fn', ['00001.webp'])[0]
        
        if not img_url:
            self.send_error(400, 'Missing url param')
            return
        
        try:
            proxy = urllib.request.ProxyHandler({
                'http': 'http://127.0.0.1:7897',
                'https': 'http://127.0.0.1:7897'
            })
            opener = urllib.request.build_opener(proxy)
            req = urllib.request.Request(
                img_url,
                headers={'User-Agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile'}
            )
            resp = opener.open(req, timeout=30)
            img_data = resp.read()
            
            num = get_num(sc, aid, fn)
            
            if num > 0:
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.webp')
                tmp.write(img_data)
                tmp.close()
                
                pil = Image.open(tmp.name)
                decoded = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                decoded.close()
                JmImageTool.decode_and_save(num, pil, decoded.name)
                os.unlink(tmp.name)
                
                with open(decoded.name, 'rb') as f:
                    result = f.read()
                os.unlink(decoded.name)
            else:
                result = img_data
            
            self.send_response(200)
            self.send_header('Content-Type', 'image/jpeg')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(result)))
            self.end_headers()
            self.wfile.write(result)
            
        except Exception as e:
            self.send_error(500, str(e))
    
    def log_message(self, format, *args):
        print(f'[py-descramble] {args[0]}')

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = http.server.HTTPServer(('0.0.0.0', port), Handler)
    print(f'Python descramble proxy on :{port}')
    server.serve_forever()
