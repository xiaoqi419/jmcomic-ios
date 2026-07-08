const fs = require('fs');
let e = fs.readFileSync('E:/code/jmcomic-ios/src/api/endpoints.ts', 'utf8').replace(/\r\n/g, '\n');

const oldFn = `export async function fetchSetting(): Promise<SettingData> {
  try { return await encryptedGet<SettingData>('setting'); } catch {}
  const res = await apiClient.getWeb('setting');
  return JSON.parse(res).data;
}`;

const newFn = `export async function fetchSetting(customUrl?: string): Promise<SettingData> {
  // 自定义 CDN 优先
  if (customUrl) {
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch(customUrl, { signal: ctrl.signal });
      if (res.ok) return (await res.json()).data;
    } catch {}
  }
  try { return await encryptedGet<SettingData>('setting'); } catch {}
  const res = await apiClient.getWeb('setting');
  return JSON.parse(res).data;
}`;

e = e.replace(oldFn, newFn);
fs.writeFileSync('E:/code/jmcomic-ios/src/api/endpoints.ts', e);
console.log('{}:', e.split('{').length === e.split('}').length ? 'OK' : 'FAIL');
