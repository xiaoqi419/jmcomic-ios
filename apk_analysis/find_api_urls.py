import re

with open('jmcomic-ios/apk_analysis/assets/public/static/js/main.ec54a949.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

# Find G6 function which maps API_XXX to URLs
idx = c.find('function G6')
if idx < 0:
    idx = c.find('G6=')
if idx >= 0:
    print('=== G6 function (API URL mapper) ===')
    # Get a larger context
    start = max(0, idx - 50)
    end = min(len(c), idx + 3000)
    chunk = c[start:end]
    print(chunk[:2500])
