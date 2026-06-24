import re

with open('jmcomic-ios/apk_analysis/assets/public/static/js/main.ec54a949.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

# Extract all API endpoints
api = set(re.findall(r'API_(\w+)', c))
print(f'=== API Endpoints ({len(api)} items) ===')
for a in sorted(api):
    print(f'  API_{a}')

# Extract Redux slices (feature modules)
slices = set(re.findall(r'"([^"]+)/fetch"', c))
print(f'\n=== Feature Slices ({len(slices)} items) ===')
for s in sorted(slices):
    print(f'  {s}')

# Extract all React Router paths
routes = set(re.findall(r'path:\s*"([^"]+)"', c))
print(f'\n=== Routes ({len(routes)} items) ===')
for r in sorted(routes):
    print(f'  {r}')

# Extract settings keys
settings = set(re.findall(r'appdata\.settings\[(\d+)\]', c))
print(f'\n=== Settings Keys ({len(settings)} items) ===')
for s in sorted(settings, key=int):
    print(f'  settings[{s}]')

# Extract localStorage keys
storage = set(re.findall(r'localStorage\.(?:get|set)Item\("([^"]+)"', c))
print(f'\n=== localStorage Keys ({len(storage)} items) ===')
for s in sorted(storage):
    print(f'  {s}')
