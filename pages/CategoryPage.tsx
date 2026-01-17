
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';

interface CategoryPageProps {
  title: string;
  projects: Project[];
}

const CategoryPage: React.FC<CategoryPageProps> = ({ title, projects }) => {
  return (
    <div className="pt-40 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h2 className="text-3xl font-cinematic tracking-[0.2em]">{title}</h2>
          <div className="w-12 h-[1px] bg-yellow-400/50 mt-4"></div>
        </header>

        {projects.length === 0 ? (
          <div className="py-20 text-center text-gray-600 tracking-widest uppercase text-xs">
            No projects found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                to={`/project/${project.id}`}
                className="group relative block overflow-hidden"
              >
                <div className="aspect-[2/3] overflow-hidden bg-zinc-900 shadow-xl border border-white/5">
                  <img 
                    src={project.mainImage} 
                    alt={project.titleEn} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  />
                </div>
                <div className="mt-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-serif-display group-hover:text-yellow-400 transition-colors">
                      {project.titleKr}
                    </h3>
                    <p className="text-[10px] tracking-widest text-gray-500 uppercase mt-1">
                      {project.titleEn}
                    </p>
                  </div>
                  <span className="text-[10px] tracking-widest text-yellow-500 font-bold">
                    {project.year}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
