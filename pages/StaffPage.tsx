
import React from 'react';
import { StaffHistory } from '../types';

interface StaffPageProps {
  staff: StaffHistory[];
}

const StaffPage: React.FC<StaffPageProps> = ({ staff }) => {
  const sortedStaff = [...staff].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <div className="pt-40 pb-20 px-8 md:px-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <h2 className="text-2xl font-cinematic tracking-[0.3em]">STAFF CREDITS</h2>
          <div className="w-12 h-[1px] bg-yellow-400/50 mt-4"></div>
        </header>

        <div className="divide-y divide-white/5">
          {sortedStaff.map((item) => (
            <div key={item.id} className="py-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-white/[0.02] transition-colors px-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                <span className="text-xs text-yellow-500 font-bold tracking-widest">{item.year}</span>
                <span className="text-lg font-light tracking-wide group-hover:text-white transition-colors">{item.project}</span>
              </div>
              <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-yellow-400/80 font-medium md:mt-0 mt-2">
                {item.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
