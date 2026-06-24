import re

with open('jmcomic-ios/apk_analysis/assets/public/static/js/main.ec54a949.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

# Find apiUrl definition or similar
for m in re.finditer(r'apiUrl\s*[=:]\s*([^;,}]+)', c):
    print('apiUrl:', m.group(1)[:200])

# Find any URL assignments
for m in re.finditer(r'["\'](https?://[^"\']+\.(?:vip|one|life|xyz|com)[^"\']*)["\']', c):
    print('URL:', m.group(1))

# Find Token/Tokenparam generation
for m in re.finditer(r'Token[^}]{0,500}Tokenparam', c):
    print('\nToken generation context:')
    print(m.group()[:500])
    break

# Find the crypto-js usage for token
for m in re.finditer(r'\.MD5\([^)]+\)', c):
    ctx = c[max(0, m.start()-100):m.end()+100]
    if 'Token' in ctx or 'token' in ctx or 'param' in ctx:
        print('\nMD5 for token:', ctx[:300])
