import re, os

js_dir = 'jmcomic-ios/apk_analysis/assets/public/static/js/'
files = [f for f in os.listdir(js_dir) if f.endswith('.js')]

for fname in sorted(files):
    path = js_dir + fname
    content = open(path, 'r', encoding='utf-8', errors='ignore').read()
    urls = re.findall(r'["\'](https?://[^"\'\s,)]+)["\']', content)
    for u in urls:
        if any(x in u for x in ['.vip', '.one', '.life', '.xyz', 'comic', 'jm', 'api', 'cdn', 'token', 'secret']):
            print(f'{fname}: {u}')
