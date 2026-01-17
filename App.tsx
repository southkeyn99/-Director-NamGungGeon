
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PortfolioData } from './types';
import { INITIAL_DATA } from './constants';
import { storageService } from './storage';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CategoryPage from './pages/CategoryPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import StaffPage from './pages/StaffPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 앱 로드 시 서버에서 데이터 가져오기 (단 한 번)
  useEffect(() => {
    const loadServerData = async () => {
      setLoading(true);
      const serverData = await storageService.getPortfolio();
      
      if (serverData) {
        setData(serverData);
      } else {
        // 서버에 데이터가 없으면 초기값 세팅 (첫 배포 시)
        setData(INITIAL_DATA);
        console.log("Using initial default data");
      }
      setLoading(false);
    };

    loadServerData();
  }, []);

  // 데이터 업데이트 함수 (서버 동기화 포함)
  const handleUpdate = async (newData: PortfolioData) => {
    setData(newData); // UI 즉시 반영
    
    try {
      await storageService.savePortfolio(newData);
    } catch (err) {
      console.error("Server Sync Error:", err);
      setError("데이터 서버 저장에 실패했습니다.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="font-cinematic text-2xl tracking-[0.5em] animate-pulse">PORTFOLIO</div>
          <p className="text-[10px] tracking-widest text-yellow-500/50 uppercase font-bold">Server Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black font-sans">
        {error && (
          <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-[10px] tracking-widest uppercase py-2 text-center z-[300] font-bold">
            {error}
          </div>
        )}
        
        <Navigation />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage data={data} />} />
            <Route path="/about" element={<AboutPage data={data} />} />
            <Route path="/directing" element={<CategoryPage title="DIRECTING" projects={data.projects.filter(p => p.category === 'DIRECTING')} />} />
            <Route path="/ai-film" element={<CategoryPage title="AI FILM" projects={data.projects.filter(p => p.category === 'AI_FILM')} />} />
            <Route path="/cinematography" element={<CategoryPage title="CINEMATOGRAPHY" projects={data.projects.filter(p => p.category === 'CINEMATOGRAPHY')} />} />
            <Route path="/project/:id" element={<ProjectDetailPage projects={data.projects} />} />
            <Route path="/staff" element={<StaffPage staff={data.staff} />} />
            <Route path="/contact" element={<ContactPage contact={data.content.contact} contactTitle={data.content.contactTitle} />} />
            <Route path="/admin" element={<AdminPage data={data} onUpdate={handleUpdate} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] flex items-center justify-between px-6 md:px-12 py-8 transition-all duration-700 ${isHome && !isMenuOpen ? 'bg-transparent' : 'bg-black/95 backdrop-blur-xl border-b border-white/5'}`}>
        <Link to="/" className="font-cinematic text-xl md:text-2xl tracking-[0.4em] font-bold hover:text-yellow-400 transition-all duration-300">
          PORTFOLIO
        </Link>
        <div className="hidden md:flex gap-10 text-[10px] font-bold tracking-[0.3em] uppercase">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/directing">Directing</NavLink>
          <NavLink to="/ai-film">AI Film</NavLink>
          <NavLink to="/cinematography">Cinematography</NavLink>
          <NavLink to="/staff">Staff</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/admin" className="text-gray-600 opacity-50 hover:opacity-100">Admin</NavLink>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden flex flex-col gap-2 p-2 focus:outline-none z-[110]">
          <span className={`w-8 h-[1px] bg-white transition-all duration-500 ${isMenuOpen ? 'rotate-45 translate-y-2.5 !bg-yellow-400' : ''}`}></span>
          <span className={`w-8 h-[1px] bg-white transition-all duration-500 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-8 h-[1px] bg-white transition-all duration-500 ${isMenuOpen ? '-rotate-45 -translate-y-2.5 !bg-yellow-400' : ''}`}></span>
        </button>
      </nav>
      <div className={`fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center gap-10 transition-all duration-700 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-10'}`}>
        <div className="flex flex-col items-center gap-12 text-lg tracking-[0.5em] uppercase font-light">
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/directing" onClick={() => setIsMenuOpen(false)}>Directing</Link>
          <Link to="/ai-film" onClick={() => setIsMenuOpen(false)}>AI Film</Link>
          <Link to="/cinematography" onClick={() => setIsMenuOpen(false)}>Cinematography</Link>
          <Link to="/staff" onClick={() => setIsMenuOpen(false)}>Staff</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-gray-600">Admin</Link>
        </div>
      </div>
    </>
  );
};

const NavLink: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({ to, children, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`hover:text-yellow-400 transition-colors relative group ${isActive ? 'text-yellow-400' : ''} ${className}`}>
      {children}
      <span className={`absolute -bottom-2 left-0 h-[1px] bg-yellow-400 transition-all duration-500 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
    </Link>
  );
};

export default App;
