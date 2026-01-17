
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Project } from '../types';

interface ProjectDetailPageProps {
  projects: Project[];
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projects }) => {
  const { id } = useParams<{ id: string }>();
  const project = projects.find(p => p.id === id);

  if (!project) return <Navigate to="/" />;

  return (
    <div className="pt-40 pb-20 px-8 md:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Top Info Section - Split Layout */}
        <div className="flex flex-col lg:flex-row gap-16 mb-24 items-start">
          {/* Left: Main Visual (Vertical Poster) */}
          <div className="lg:w-1/3 w-full">
            <div className="sticky top-40">
              <img 
                src={project.mainImage} 
                alt={project.titleEn} 
                className="w-full aspect-[2/3] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 brightness-90 transition-all duration-500"
              />
            </div>
          </div>

          {/* Right: Text Information */}
          <div className="lg:w-2/3 space-y-12">
            <div>
              <p className="text-xs tracking-widest text-yellow-500 font-bold mb-2">{project.year}</p>
              <h1 className="text-4xl md:text-7xl font-serif-display leading-tight mb-2">
                {project.titleKr}
              </h1>
              <h2 className="text-sm tracking-[0.3em] uppercase text-gray-400">
                {project.titleEn}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs tracking-widest uppercase border-y border-white/5 py-10">
              <div>
                <span className="block text-yellow-500/70 font-bold mb-1">Genre</span>
                <span className="text-white">{project.genre}</span>
              </div>
              <div>
                <span className="block text-yellow-500/70 font-bold mb-1">Runtime</span>
                <span className="text-white">{project.runtime}</span>
              </div>
              <div>
                <span className="block text-yellow-500/70 font-bold mb-1">Role</span>
                <span className="text-white">{project.role}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] tracking-[0.4em] uppercase text-yellow-500 font-bold">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed font-light text-base md:text-lg italic border-l border-yellow-400/40 pl-6 whitespace-pre-wrap">
                {project.synopsis}
              </p>
            </div>

            {project.awards.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] tracking-[0.4em] uppercase text-yellow-500 font-bold">Selected Awards & Screenings</h3>
                <ul className="space-y-3">
                  {project.awards.map((award, idx) => (
                    <li key={idx} className="text-sm text-yellow-100/80 font-medium tracking-wide">
                      <span className="text-yellow-500 mr-2">•</span> {award}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Section */}
        {project.stills.length > 0 && (
          <div className="space-y-12 border-t border-white/5 pt-20">
            <h2 className="font-cinematic tracking-[0.5em] text-xs text-center text-yellow-600 uppercase font-bold">Film Stills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {project.stills.map((still, idx) => (
                <img 
                  key={idx} 
                  src={still} 
                  alt={`Still ${idx}`} 
                  className="w-full h-auto object-cover shadow-2xl border border-white/5 grayscale-0 hover:scale-[1.01] transition-transform duration-500"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
