
import React from 'react';
import { PortfolioData } from '../types';
import AboutPage from './AboutPage';

interface HomePageProps {
  data: PortfolioData;
}

const HomePage: React.FC<HomePageProps> = ({ data }) => {
  const { content } = data;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={content.homeBgImage} 
            alt="Background" 
            className="w-full h-full object-cover grayscale opacity-60 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center space-y-4 px-4">
          <p className="text-[10px] md:text-xs tracking-[0.5em] text-yellow-400 font-bold uppercase animate-fade-in-down">
            Film Director & Cinematographer
          </p>
          <h1 className="text-6xl md:text-9xl font-cinematic tracking-widest uppercase animate-fade-in">
            {content.name}
          </h1>
          <div className="w-12 h-[1px] bg-yellow-400/50 mx-auto my-8"></div>
          <p className="text-xs md:text-sm tracking-[0.3em] text-gray-300 italic animate-fade-in-up">
            {content.philosophy}
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-center">
          <div className="w-[1px] h-12 bg-yellow-400/30 mx-auto"></div>
          <span className="text-[8px] tracking-[0.4em] uppercase text-yellow-500 font-bold mt-2 block">Scroll</span>
        </div>
      </section>

      {/* About Section (Naturally follows Hero) */}
      <section id="about">
        <AboutPage data={data} isEmbedded={true} />
      </section>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.08); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 2s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 1.5s ease-out 0.5s forwards; opacity: 0; }
        .animate-fade-in-up { animation: fade-in-up 1.5s ease-out 1s forwards; opacity: 0; }
        .animate-pulse-slow { animation: pulse-slow 15s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default HomePage;
