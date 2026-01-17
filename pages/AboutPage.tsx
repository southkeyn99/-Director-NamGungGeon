
import React from 'react';
import { PortfolioData } from '../types';

interface AboutPageProps {
  data: PortfolioData;
  isEmbedded?: boolean;
}

const AboutPage: React.FC<AboutPageProps> = ({ data, isEmbedded = false }) => {
  const { content, projects, staff } = data;

  // Merge projects and staff credits into a single chronological list
  const combinedFilmography = [
    ...projects.map(p => ({
      year: p.year,
      title: p.titleKr,
      role: p.role,
      type: 'DIRECTED',
      awards: p.awards
    })),
    ...staff.map(s => ({
      year: s.year,
      title: s.project,
      role: s.role,
      type: 'STAFF',
      awards: s.awards
    }))
  ].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <div className={`${isEmbedded ? 'pt-20' : 'pt-40'} pb-20 px-8 md:px-24 flex flex-col items-center`}>
      <div className="max-w-4xl w-full">
        <section className="mb-32">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12">
            {/* Small Profile Image */}
            {content.profileImage && (
              <div className="shrink-0">
                <img 
                  src={content.profileImage} 
                  alt={content.name} 
                  className="w-24 h-24 md:w-32 md:h-32 object-cover grayscale rounded-full border border-yellow-400/30 shadow-lg"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-xs tracking-[0.4em] uppercase text-yellow-500 font-bold mb-8 border-b border-white/10 pb-4 w-full text-center md:text-left">
                Identity / Direction
              </h2>
              <div className="space-y-6 leading-relaxed text-lg md:text-xl font-light text-gray-200 text-center md:text-left">
                {content.aboutText.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-20 grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="font-cinematic text-sm tracking-widest uppercase text-yellow-400">Visual Style</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                자연광의 변주와 절제된 카메라 워크를 통해 인공적인 미학이 아닌, 날것 그대로의 정서를 포착하는 것에 집중합니다.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-cinematic text-sm tracking-widest uppercase text-yellow-400">Focus</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                대사로 설명되지 않는 여백의 시간, 그 침묵 속에서 발생하는 영화적 긴장감을 중요하게 생각합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Chronological Filmography Section */}
        <section className="w-full">
          <h2 className="text-xs tracking-[0.4em] uppercase text-yellow-500 font-bold mb-12 border-b border-white/10 pb-4">
            Filmography
          </h2>
          <div className="space-y-0 border-l border-yellow-400/20 ml-4">
            {combinedFilmography.map((item, idx) => (
              <div key={idx} className="relative pl-12 pb-16 last:pb-0">
                {/* Timeline dot */}
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-yellow-400 ring-4 ring-black"></div>
                
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-widest text-yellow-500/70 font-bold uppercase block">{item.year}</span>
                    <h3 className="text-xl font-light tracking-wide text-white">
                      {item.title}
                      {item.type === 'DIRECTED' && <span className="ml-3 text-[9px] border border-yellow-400/50 px-1.5 py-0.5 rounded text-yellow-400 font-bold align-middle">DIRECTED</span>}
                    </h3>
                    <p className="text-xs tracking-widest text-gray-500 uppercase">{item.role}</p>
                  </div>
                  
                  {item.awards && item.awards.length > 0 && (
                    <div className="md:text-right space-y-1 max-w-xs">
                      {item.awards.map((award, aIdx) => (
                        <p key={aIdx} className="text-[10px] text-yellow-200/60 font-medium tracking-tight italic">
                          {award}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
