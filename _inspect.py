import asyncio
from cloakbrowser import launch_async

async def main():
    browser = await launch_async()
    page = await browser.new_page()
    
    await page.goto('https://18comic.vip/album/286368/read/287529/', timeout=30000)
    await page.wait_for_timeout(8000)
    
    # Fetch key JS files and search for canvas/scramble/decode
    for key in ['style_phone', 'header', 'jquery.avs-0.2', 'jquery.lazyload-2.0', 'search-img', 'jquery.voting-album-0.1', 'jquery.forum']:
        print(f'\n=== {key} ===')
        found = await page.evaluate(f"""async () => {{
            const scripts = Array.from(document.scripts);
            for (const s of scripts) {{
                if (s.src && s.src.includes('{key}')) {{
                    try {{
                        const resp = await fetch(s.src);
                        const text = await resp.text();
                        const lines = text.split(String.fromCharCode(10));
                        const results = [];
                        for (let i = 0; i < lines.length; i++) {{
                            var l = lines[i];
                            if (l.includes('drawImage') || l.includes('canvas') || 
                                l.includes('scramble') || l.includes('tile') ||
                                l.includes('decode') || l.includes('restore') ||
                                l.includes('putImageData') || l.includes('createImageBitmap')) {{
                                results.push({{line: i+1, content: l.substring(0, 300)}});
                            }}
                        }}
                        return {{file: s.src.split('/').pop(), matches: results}};
                    }} catch(e) {{ return {{file: 'err: ' + e.message, matches: []}}; }}
                }}
            }}
            return null;
        }}""")
        
        if found and found.get('matches'):
            print(f'  File: {found["file"]}')
            for m in found['matches']:
                print(f'  L{m["line"]}: {m["content"]}')
        elif found:
            print(f'  File: {found["file"]} - no matches')
        else:
            print('  Not found')
    
    # Check all script tags for inline canvas code
    print('\n=== Inline scripts with keywords ===')
    inline = await page.evaluate("""() => {
        const scripts = Array.from(document.scripts).filter(s => !s.src);
        const results = [];
        for (const s of scripts) {
            const t = s.textContent;
            if (t.includes('drawImage') || t.includes('scramble') || t.includes('canvas')) {
                results.push(t.substring(0, 500));
            }
        }
        return results;
    }""")
    for s in inline:
        print(s[:300])
    
    await browser.close()
    print('\nDone')

asyncio.run(main())
