
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

  useEffect(() => {
    const loadServerData = async () => {
      setLoading(true);
      try {
        const serverData = await storageService.getPortfolio();
        if (serverData && serverData.content) {
          setData(serverData);
        } else {
          setData(INITIAL_DATA);
        }
      } catch (err: any) {
        console.error("Critical Load Error:", err);
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
        setData(INITIAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadServerData();
  }, []);

  const handleUpdate = (newData: PortfolioData) => {
    setData(newData);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="font-cinematic text-3xl tracking-[0.8em] animate-pulse text-white">PORTFOLIO</div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-yellow-500 animate-[loading_1.5s_infinite] w-24"></div>
            </div>
            <p className="text-[9px] tracking-[0.4em] text-yellow-500/50 uppercase font-bold">Synchronizing Cloud...</p>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black font-sans">
        {error && (
          <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-[10px] tracking-widest uppercase py-3 text-center z-[300] font-bold shadow-2xl flex items-center justify-center gap-4">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="bg-black/20 px-2 py-1 hover:bg-black/40">Close</button>
          </div>
        )}
        
        <Navigation />
        
        <main className="animate-fade-in-quick">
          <Routes>
            <Route path="/" element={<HomePage data={data!} />} />
            <Route path="/about" element={<AboutPage data={data!} />} />
            <Route path="/directing" element={<CategoryPage title="DIRECTING" projects={data!.projects.filter(p => p.category === 'DIRECTING')} />} />
            <Route path="/ai-film" element={<CategoryPage title="AI FILM" projects={data!.projects.filter(p => p.category === 'AI_FILM')} />} />
            <Route path="/cinematography" element={<CategoryPage title="CINEMATOGRAPHY" projects={data!.projects.filter(p => p.category === 'CINEMATOGRAPHY')} />} />
            <Route path="/project/:id" element={<ProjectDetailPage projects={data!.projects} />} />
            <Route path="/staff" element={<StaffPage staff={data!.staff} />} />
            <Route path="/contact" element={<ContactPage contact={data!.content.contact} contactTitle={data!.content.contactTitle} />} />
            <Route path="/admin" element={<AdminPage data={data!} onUpdate={handleUpdate} />} />
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
          <NavLink to="/admin" className="text-zinc-600 opacity-50 hover:opacity-100">Admin</NavLink>
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
          <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-zinc-600">Admin</Link>
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
