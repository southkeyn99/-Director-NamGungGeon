
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PortfolioData } from './types';
import { INITIAL_DATA } from './constants';
import { supabase } from './supabase';

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

  // Fetch data from Supabase on load
  useEffect(() => {
    const fetchData = async () => {
      // If Supabase is not configured, fall back to initial data immediately
      if (!supabase) {
        console.warn("Supabase is not configured. Using initial constants.");
        setData(INITIAL_DATA);
        setLoading(false);
        return;
      }

      try {
        const { data: dbData, error } = await supabase
          .from('portfolio')
          .select('data')
          .eq('id', 1)
          .single();

        if (error || !dbData) {
          console.warn("Data record not found in Supabase. Using defaults.");
          setData(INITIAL_DATA);
        } else {
          setData(dbData.data);
        }
      } catch (err) {
        console.error("Supabase fetch failed:", err);
        setData(INITIAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (newData: PortfolioData) => {
    setData(newData);
    
    if (!supabase) {
      alert("Cloud sync is disabled because Supabase is not configured.");
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolio')
        .update({ data: newData })
        .eq('id', 1);
      
      if (error) {
        console.error("Failed to save to database:", error);
        alert("Database sync failed. Check your Supabase table permissions (RLS).");
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="font-cinematic text-2xl tracking-[0.5em] animate-pulse">PORTFOLIO</div>
          <p className="text-[10px] tracking-widest text-yellow-500/50 uppercase">Loading Experience...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white selection:bg-yellow-400 selection:text-black">
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
            <Route path="/admin" element={<AdminPage data={data} onUpdate={updateData} />} />
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
      <nav className={`fixed top-0 left-0 w-full z-[100] flex items-center justify-between px-6 md:px-8 py-6 transition-all duration-500 ${isHome && !isMenuOpen ? 'bg-transparent' : 'bg-black/90 backdrop-blur-md border-b border-white/5'}`}>
        <Link to="/" className="font-cinematic text-lg md:text-xl tracking-[0.3em] font-bold hover:text-yellow-400 transition-colors">
          PORTFOLIO
        </Link>
        <div className="hidden md:flex gap-8 text-[11px] font-medium tracking-[0.2em] uppercase">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/directing">Directing</NavLink>
          <NavLink to="/ai-film">AI Film</NavLink>
          <NavLink to="/cinematography">Cinematography</NavLink>
          <NavLink to="/staff">Staff</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/admin" className="text-gray-500">Admin</NavLink>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none z-[110]">
          <span className={`w-6 h-[1px] bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2 !bg-yellow-400' : ''}`}></span>
          <span className={`w-6 h-[1px] bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-[1px] bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2 !bg-yellow-400' : ''}`}></span>
        </button>
      </nav>
      <div className={`fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        <div className="flex flex-col items-center gap-10 text-sm tracking-[0.4em] uppercase font-light">
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
    <Link to={to} className={`hover:text-yellow-400 transition-colors relative ${isActive ? 'text-yellow-400' : ''} ${className}`}>
      {children}
      {isActive && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-yellow-400"></span>}
    </Link>
  );
};

export default App;
