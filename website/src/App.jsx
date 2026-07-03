import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@heroui/react';
import AuroraCanvas from './components/AuroraCanvas';
import ParticleField from './components/ParticleField';

const APP_VERSION = '1.0.0';

const FEATURES = [
  { icon: 'books', title: '海量漫画', desc: '聚合 JMComic + Pica 双源，百万漫画任你翻阅' },
  { icon: 'shuffle', title: '智能去混淆', desc: '自动还原百叶窗加密图片，原生级阅读体验' },
  { icon: 'read', title: '双模式阅读', desc: '竖滑无限滚动 + 分页翻页随心切换' },
  { icon: 'download', title: '离线下载', desc: '一键下载整本漫画，没网也能看' },
  { icon: 'folder', title: '文件夹管理', desc: '创建收藏夹，分类整理你的最爱' },
  { icon: 'search', title: '双源搜索', desc: '同时搜索 JMComic 与 Pica，找到最多资源' },
  { icon: 'media', title: '影视 & 小说', desc: '内置影视播放与小说阅读，一站式娱乐' },
  { icon: 'moon', title: '深色主题', desc: 'Material 3 设计，护眼暗色模式' },
];

const CHANGELOG = [
  { version: '1.1.0', date: '2025-07', items: ['收藏夹系统：新建/管理文件夹', '评论无限滚动加载', '详情页封面比例优化', '继续阅读跳转详情页', '阅读进度实时记录', '预加载页数可配置', '阅读器分页模式', 'Pica 分类接入'] },
  { version: '1.0.0', date: '2025-06', items: ['🎉 首个正式版发布', 'JMComic + Pica 双源聚合', '漫画阅读器（竖滑+分页）', '搜索、分类、周榜', '用户登录系统', '下载管理器', '图片智能去混淆', '签到 / 成就系统'] },
];

const MOCKUPS = [
  { img: '/hero-bg.png', label: '首页推荐' },
  { img: '/hero-app.png', label: '搜索页面' },
];

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="app relative min-h-screen overflow-x-hidden bg-[#07070D] text-[#F0EDE8]">
      {/* 全局背景层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuroraCanvas colorStops={['#E85D3A', '#FF8C5A', '#07070D', '#0D0D16']} amplitude={0.6} speed={0.4} blend={0.25} />
        <ParticleField count={80} colors={['#E85D3A', '#FF8C5A', '#ffffff']} speed={0.3} />
      </div>

      <Nav onNavigate={setPage} currentPage={page} />
      <div className="relative z-10">
        {page === 'home' && <HomePage />}
        {page === 'history' && <HistoryPage />}
      </div>
    </div>
  );
}

function Nav({ onNavigate, currentPage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
    scrolled ? 'bg-[rgba(7,7,13,0.82)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.05)]' : ''
  }`;

  return (
    <nav className={navClass}>
      <div className="max-w-[1100px] mx-auto px-6 py-[18px] flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="text-[22px] font-extrabold bg-gradient-to-r from-[#E85D3A] to-[#FF8C5A] bg-clip-text text-transparent tracking-tight border-none cursor-pointer">
          JOYComic
        </button>
        <div className="flex gap-7 items-center">
          <button onClick={() => onNavigate('home')} className={`bg-none border-none text-sm font-medium cursor-pointer transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-[#E85D3A] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform ${currentPage === 'home' ? 'text-[#F0EDE8] font-semibold after:scale-x-100' : 'text-[#9895A0]'}`}>
            首页
          </button>
          <button onClick={() => onNavigate('history')} className={`bg-none border-none text-sm font-medium cursor-pointer transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-[#E85D3A] after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform ${currentPage === 'history' ? 'text-[#F0EDE8] font-semibold after:scale-x-100' : 'text-[#9895A0]'}`}>
            Git 历史
          </button>
          <a href="https://github.com/xiaoqi419/jmcomic-ios" target="_blank" rel="noreferrer" className="text-[#9895A0] text-sm hover:text-[#F0EDE8] transition-colors no-underline">
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const downloadRef = useRef(null);
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[140px] pb-20 relative overflow-hidden">
        <div className="relative z-10 max-w-[720px]">
          <span className="inline-flex items-center px-4 py-[5px] rounded-full bg-[rgba(232,93,58,0.1)] text-[#E85D3A] text-[11px] font-bold tracking-[1.2px] border border-[rgba(232,93,58,0.15)] mb-7">
            v{APP_VERSION}
          </span>
          <h1 className="text-[clamp(44px,9vw,76px)] font-black leading-[1.1] mb-5 bg-gradient-to-r from-[#E85D3A] via-[#FF8C5A] via-[#FFB088] to-[#F0EDE8] bg-clip-text text-transparent animate-[fadeUp_0.8s_cubic-bezier(0.22,1,0.36,1)_0.1s_both]">
            JOYComic
          </h1>
          <p className="text-[clamp(15px,2vw,20px)] text-[#9895A0] font-medium max-w-[540px] mx-auto mb-9 leading-relaxed animate-[fadeUp_0.8s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]">
            聚合双源 · 畅享漫画 · 全功能 iOS 客户端。<br />
            基于 Expo/React Native，Material 3 设计，JMComic + Pica 双源聚合。
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap animate-[fadeUp_0.8s_cubic-bezier(0.22,1,0.36,1)_0.3s_both]">
            <Button
              variant="primary"
              size="lg"
              onPress={() => scrollTo(downloadRef)}
              style={{ backgroundColor: '#E85D3A', color: '#fff', padding: '16px 34px', fontSize: 15, fontWeight: 600, borderRadius: 14, boxShadow: '0 4px 24px rgba(232,93,58,0.25)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              下载 App
            </Button>
            <a href="https://github.com/xiaoqi419/jmcomic-ios" target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 34px', borderRadius:14, fontSize:15, fontWeight:600, backgroundColor:'rgba(255,255,255,0.04)', color:'#F0EDE8', border:'1px solid rgba(255,255,255,0.08)', textDecoration:'none', cursor:'pointer' }}
              className="hover:bg-[rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-[bob_2.5s_ease-in-out_infinite]">
          <div className="w-[2px] h-6 bg-gradient-to-b from-[#6B6873] to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-[120px]">
        <div className="text-center mb-16">
          <span className="inline-flex px-[14px] py-[5px] rounded-full bg-[rgba(232,93,58,0.08)] text-[#E85D3A] text-[11px] font-bold tracking-[1.5px] uppercase border border-[rgba(232,93,58,0.12)] mb-4">功能</span>
          <h2 className="text-[clamp(30px,3.5vw,42px)] font-extrabold mb-3">强大而优雅</h2>
          <p className="text-[#9895A0] text-base max-w-[500px] mx-auto">专为漫画爱好者打造的全能阅读工具</p>
        </div>
        <div className="max-w-[1100px] mx-auto grid grid-cols-[1.5fr_1fr_1fr] gap-3.5 max-md:grid-cols-2 max-sm:grid-cols-1">
          {FEATURES.map((f, i) => (
            <Card key={i} variant="default" className="bg-[#12121E] border-[rgba(255,255,255,0.05)] p-7 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-[rgba(232,93,58,0.15)] animate-[fadeUp_0.6s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{ animationDelay: `${i * 0.06}s`, gridColumn: i === 0 ? 'span 1 / span 2' : undefined, gridRow: i === 0 ? 'span 2' : undefined }}>
              {f.icon === 'books' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>}
              {f.icon === 'shuffle' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/></svg>}
              {f.icon === 'read' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
              {f.icon === 'download' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
              {f.icon === 'folder' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
              {f.icon === 'search' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
              {f.icon === 'media' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
              {f.icon === 'moon' && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
              <CardTitle className="text-[17px] font-bold text-[#F0EDE8] mt-4 mb-2">{f.title}</CardTitle>
              <CardDescription className="text-[13px] text-[#9895A0] leading-relaxed">{f.desc}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Screenshots */}
      <section className="px-6 py-[120px]">
        <div className="text-center mb-16">
          <span className="inline-flex px-[14px] py-[5px] rounded-full bg-[rgba(232,93,58,0.08)] text-[#E85D3A] text-[11px] font-bold tracking-[1.5px] uppercase border border-[rgba(232,93,58,0.12)] mb-4">预览</span>
          <h2 className="text-[clamp(30px,3.5vw,42px)] font-extrabold mb-3">一睹为快</h2>
          <p className="text-[#9895A0] text-base max-w-[500px] mx-auto">简洁沉浸的阅读体验</p>
        </div>
        <div className="max-w-[1100px] mx-auto flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          {MOCKUPS.map((m, i) => (
            <div key={i} className="snap-start shrink-0">
              <div className="w-[240px] h-[480px] bg-[#111120] rounded-[32px] border-2 border-[rgba(255,255,255,0.06)] p-3.5 relative transition-transform duration-300 hover:-translate-y-2 hover:border-[rgba(232,93,58,0.2)]">
                <div className="w-[100px] h-[22px] bg-[#111120] rounded-b-[14px] absolute top-0 left-1/2 -translate-x-1/2 z-10" />
                <div className="w-full h-full bg-[#0A0A14] rounded-[22px] overflow-hidden p-3.5">
                  <img src={m.img} alt={m.label} className="w-full h-full object-cover rounded-2xl" />
                </div>
              </div>
              <p className="text-center mt-2.5 text-[13px] text-[#9895A0] font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Download */}
      <section className="px-6 py-[120px]" ref={downloadRef}>
        <div className="text-center mb-16">
          <span className="inline-flex px-[14px] py-[5px] rounded-full bg-[rgba(232,93,58,0.08)] text-[#E85D3A] text-[11px] font-bold tracking-[1.5px] uppercase border border-[rgba(232,93,58,0.12)] mb-4">下载</span>
          <h2 className="text-[clamp(30px,3.5vw,42px)] font-extrabold mb-3">立即获取</h2>
          <p className="text-[#9895A0] text-base max-w-[500px] mx-auto">选择你的平台，开始畅快阅读</p>
        </div>
        <div className="max-w-[1100px] mx-auto flex justify-center gap-6 flex-wrap">
          <Card variant="default" className="bg-[rgba(18,18,30,0.8)] border-[rgba(232,93,58,0.2)] p-10 text-center flex-1 max-w-[340px] backdrop-blur-[10px] relative transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-[#E85D3A] text-white text-[11px] font-bold px-4 py-1 rounded-full tracking-[0.5px]">推荐</span>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.5" className="mx-auto mb-[18px]"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
            <CardTitle className="text-[19px] font-bold text-[#F0EDE8] mb-1.5">iOS 版本</CardTitle>
            <CardDescription className="text-[13px] text-[#9895A0] mb-[18px]">iOS 15.0+ · IPA 安装</CardDescription>
            <div className="flex justify-center gap-4 mb-[22px] text-[12px] text-[#6B6873]">
              <span>v{APP_VERSION}</span>
              <span>~30 MB</span>
            </div>
            <a href="https://github.com/xiaoqi419/jmcomic-ios/releases" target="_blank" rel="noreferrer" style={{ display:'block', textAlign:'center', backgroundColor:'#E85D3A', color:'#fff', padding:'16px 34px', borderRadius:14, fontSize:15, fontWeight:600, textDecoration:'none', boxShadow:'0 4px 24px rgba(232,93,58,0.25)' }}
              className="hover:bg-[#D44D2E] hover:-translate-y-0.5 transition-all">
              下载 IPA
            </a>
          </Card>
          <Card variant="default" className="bg-[#12121E] border-[rgba(255,255,255,0.05)] p-10 text-center flex-1 max-w-[340px] transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#E85D3A" strokeWidth="1.5" className="mx-auto mb-[18px]"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <CardTitle className="text-[19px] font-bold text-[#F0EDE8] mb-1.5">源代码</CardTitle>
            <CardDescription className="text-[13px] text-[#9895A0] mb-[18px]">MIT 协议 · 开源</CardDescription>
            <div className="flex justify-center gap-4 mb-[22px] text-[12px] text-[#6B6873]">
              <span>React Native</span>
              <span>Expo SDK 54</span>
            </div>
            <a href="https://github.com/xiaoqi419/jmcomic-ios" target="_blank" rel="noreferrer" style={{ display:'block', textAlign:'center', backgroundColor:'rgba(255,255,255,0.04)', color:'#F0EDE8', padding:'16px 34px', borderRadius:14, fontSize:15, fontWeight:600, textDecoration:'none', border:'1px solid rgba(255,255,255,0.08)' }}
              className="hover:bg-[rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all">
              查看源码
            </a>
          </Card>
        </div>
        <p className="max-w-[540px] mx-auto mt-8 text-[12px] text-[#6B6873] text-center leading-relaxed">⚠️ 本应用仅供学习研究使用，请于 24 小时内删除。所有内容来自第三方 API，与开发者无关。</p>
      </section>

      {/* Changelog */}
      <section className="max-w-[600px] mx-auto px-6 py-[120px]">
        <div className="text-center mb-16">
          <span className="inline-flex px-[14px] py-[5px] rounded-full bg-[rgba(232,93,58,0.08)] text-[#E85D3A] text-[11px] font-bold tracking-[1.5px] uppercase border border-[rgba(232,93,58,0.12)] mb-4">更新</span>
          <h2 className="text-[clamp(30px,3.5vw,42px)] font-extrabold mb-3">版本历史</h2>
          <p className="text-[#9895A0] text-base max-w-[500px] mx-auto">持续迭代，不断进步</p>
        </div>
        <div className="relative pl-8 before:content-[''] before:absolute before:left-[10px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-[rgba(232,93,58,0.3)] before:to-transparent">
          {CHANGELOG.map((log, i) => (
            <div key={i} className="relative mb-10 animate-[fadeUp_0.6s_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="absolute -left-[26px] top-[5px] w-[14px] h-[14px] rounded-full bg-[#E85D3A] border-3 border-[#07070D] shadow-[0_0_0_3px_rgba(232,93,58,0.2),0_0_20px_rgba(232,93,58,0.15)]" />
              <div className="flex items-baseline gap-3.5 mb-2.5">
                <span className="text-[20px] font-extrabold text-[#E85D3A]">v{log.version}</span>
                <span className="text-[12px] text-[#6B6873]">{log.date}</span>
              </div>
              <ul className="list-none">
                {log.items.map((item, j) => (
                  <li key={j} className="text-[14px] text-[#9895A0] py-1 leading-relaxed before:content-['›'] before:text-[#E85D3A] before:font-bold before:mr-2">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] px-6 pt-[60px] pb-8">
        <div className="max-w-[1100px] mx-auto text-center">
          <span className="text-[22px] font-extrabold bg-gradient-to-r from-[#E85D3A] to-[#FF8C5A] bg-clip-text text-transparent">JOYComic</span>
          <p className="text-[#9895A0] text-[14px] mt-1.5">聚合双源 · 畅享漫画</p>
          <div className="flex justify-center gap-7 my-6">
            <a href="https://github.com/xiaoqi419/jmcomic-ios" target="_blank" rel="noreferrer" className="text-[#9895A0] text-[13px] hover:text-[#E85D3A] transition-colors no-underline">GitHub</a>
            <a href="https://18comic.vip" target="_blank" rel="noreferrer" className="text-[#9895A0] text-[13px] hover:text-[#E85D3A] transition-colors no-underline">JMComic</a>
          </div>
          <p className="text-[11px] text-[#6B6873]">© 2025 JOYComic. 仅供学习研究使用。</p>
        </div>
      </footer>
    </>
  );
}

function HistoryPage() {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommits = useCallback(async () => {
    setLoading(true); setError(null);
    const PROXIES = [
      `https://api.github.com/repos/xiaoqi419/jmcomic-ios/commits?per_page=50`,
      `https://ghproxy.net/https://api.github.com/repos/xiaoqi419/jmcomic-ios/commits?per_page=50`,
    ];
    for (const url of PROXIES) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, {
          headers: { 'User-Agent': 'JOYComic-Site/1.0', 'Accept': 'application/vnd.github.v3+json' },
          signal: ctrl.signal,
        });
        clearTimeout(tid);
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) { setCommits(data); setLoading(false); return; }
      } catch {
        console.warn('fetch failed');
      }
    }
    setError('无法连接到 GitHub'); setLoading(false);
  }, []);

  useEffect(() => { fetchCommits(); }, [fetchCommits]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <section className="pt-[120px] min-h-[80vh] max-w-[720px] mx-auto px-6">
      <div className="text-center mb-16">
        <span className="inline-flex px-[14px] py-[5px] rounded-full bg-[rgba(232,93,58,0.08)] text-[#E85D3A] text-[11px] font-bold tracking-[1.5px] uppercase border border-[rgba(232,93,58,0.12)] mb-4">Git 历史</span>
        <h2 className="text-[clamp(30px,3.5vw,42px)] font-extrabold mb-3">提交记录</h2>
        <p className="text-[#9895A0] text-base max-w-[500px] mx-auto">从 GitHub API 实时获取</p>
      </div>
      {loading && (
        <div className="text-center py-[60px] text-[#9895A0]">
          <div className="w-9 h-9 border-3 border-[rgba(232,93,58,0.15)] border-t-[#E85D3A] rounded-full mx-auto mb-4 animate-spin" />
          <p>正在获取提交记录…</p>
        </div>
      )}
      {error && (
        <div className="text-center py-[60px] text-[#9895A0]">
          <p>{error}</p>
          <button onClick={fetchCommits} className="mt-4 inline-flex items-center gap-2 px-[34px] py-4 bg-[#E85D3A] text-white rounded-[14px] text-[15px] font-semibold border-none cursor-pointer shadow-[0_4px_24px_rgba(232,93,58,0.25)] hover:bg-[#D44D2E] transition-all">
            重试
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="relative pl-[34px] before:content-[''] before:absolute before:left-[12px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-[rgba(232,93,58,0.2)] before:to-transparent">
          {commits.map((c, i) => (
            <div key={c.sha} className="relative mb-5 animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]" style={{ animationDelay: `${i * 0.03}s`, '--i': i }}>
              <div className="absolute -left-[28px] top-[6px] w-3 h-3 rounded-full bg-[#07070D] border-2 border-[#E85D3A]" />
              <div className="bg-[#12121E] rounded-[12px] p-[18px_22px] border border-[rgba(255,255,255,0.05)] transition-all duration-250 hover:border-[rgba(232,93,58,0.15)] hover:translate-x-1">
                <div className="flex items-center gap-3.5 mb-1.5">
                  <a href={c.html_url} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-[#E85D3A] no-underline hover:underline font-mono">#{c.sha.slice(0, 7)}</a>
                  <span className="text-[11px] text-[#6B6873]">{formatDate(c.commit.committer.date)}</span>
                </div>
                <p className="text-[14px] text-[#F0EDE8] leading-relaxed break-words">{c.commit.message.split('\n')[0]}</p>
                <div className="flex items-center gap-2 mt-2.5 text-[12px] text-[#9895A0]">
                  <img src={c.author?.avatar_url || ''} alt="" className="w-5 h-5 rounded-full" />
                  <span>{c.commit.author.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default App;
