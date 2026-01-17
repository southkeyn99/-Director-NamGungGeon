
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { PortfolioData } from './types';
import { INITIAL_DATA } from './constants';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CategoryPage from './pages/CategoryPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import StaffPage from './pages/StaffPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(() => {
    try {
      const saved = localStorage.getItem('portfolio_data');
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      return INITIAL_DATA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_data', JSON.stringify(data));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("Storage is full. Please use smaller images or delete old ones.");
      }
      console.error("Failed to save data to localStorage", e);
    }
  }, [data]);

  const updateData = (newData: PortfolioData) => setData(newData);

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

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[100] flex items-center justify-between px-6 md:px-8 py-6 transition-all duration-500 ${isHome && !isMenuOpen ? 'bg-transparent' : 'bg-black/90 backdrop-blur-md border-b border-white/5'}`}>
        <Link to="/" className="font-cinematic text-lg md:text-xl tracking-[0.3em] font-bold hover:text-yellow-400 transition-colors">
          PORTFOLIO
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-[11px] font-medium tracking-[0.2em] uppercase">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/directing">Directing</NavLink>
          <NavLink to="/ai-film">AI Film</NavLink>
          <NavLink to="/cinematography">Cinematography</NavLink>
          <NavLink to="/staff">Staff</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/admin" className="text-gray-500">Admin</NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none z-[110]"
          aria-label="Toggle Menu"
        >
          <span className={`w-6 h-[1px] bg-white transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2 !bg-yellow-400' : ''}`}></span>
          <span className={`w-6 h-[1px] bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-[1px] bg-white transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2 !bg-yellow-400' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        <div className="flex flex-col items-center gap-10 text-sm tracking-[0.4em] uppercase font-light">
          <Link to="/about" onClick={() => setIsMenuOpen(false)} className={location.pathname === '/about' ? 'text-yellow-400 font-bold' : ''}>About</Link>
          <Link to="/directing" onClick={() => setIsMenuOpen(false)} className={location.pathname === '/directing' ? 'text-yellow-400 font-bold' : ''}>Directing</Link>
          <Link to="/ai-film" onClick={() => setIsMenuOpen(false)} className={location.pathname === '/ai-film' ? 'text-yellow-400 font-bold' : ''}>AI Film</Link>
          <Link to="/cinematography" onClick={() => setIsMenuOpen(false)} className={location.pathname === '/cinematography' ? 'text-yellow-400 font-bold' : ''}>Cinematography</Link>
          <Link to="/staff" onClick={() => setIsMenuOpen(false)} className={location.pathname === '/staff' ? 'text-yellow-400 font-bold' : ''}>Staff</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className={location.pathname === '/contact' ? 'text-yellow-400 font-bold' : ''}>Contact</Link>
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
