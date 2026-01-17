
import React, { useState } from 'react';
import { PortfolioData, Project, Category } from '../types';
import { storageService } from '../storage';
import { supabase } from '../supabase';

interface AdminPageProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ data, onUpdate }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1228') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Key');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <form onSubmit={handleLogin} className="space-y-6 text-center max-w-xs w-full px-6">
          <h1 className="font-cinematic tracking-widest text-xl mb-8 text-yellow-500">ADMIN ACCESS</h1>
          <input 
            type="password" 
            placeholder="ACCESS KEY"
            className="w-full bg-transparent border-b border-yellow-500/50 py-2 text-center focus:border-yellow-400 outline-none transition-colors tracking-[1em]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-500 text-[10px] uppercase tracking-widest animate-pulse">{error}</p>}
        </form>
      </div>
    );
  }

  return <AdminDashboard data={data} onUpdate={onUpdate} />;
};

const AdminDashboard: React.FC<AdminPageProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'PROJECTS' | 'SYSTEM'>('CONTENT');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (urls: string[]) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => storageService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      callback(urls);
    } catch (err: any) {
      alert("업로드 실패: " + (err.message || "서버 설정을 확인하세요."));
    } finally {
      setIsProcessing(false);
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      category: 'DIRECTING',
      year: new Date().getFullYear().toString(),
      titleKr: '새 작품',
      titleEn: 'NEW PROJECT',
      genre: 'Drama',
      runtime: '0min',
      role: 'Director',
      synopsis: '',
      awards: [],
      mainImage: 'https://picsum.photos/id/1/800/1200',
      stills: []
    };
    onUpdate({ ...data, projects: [newProject, ...data.projects] });
  };

  return (
    <div className="pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-white/10 pb-4">
          <div className="flex gap-8 overflow-x-auto pb-2 md:pb-0">
            <TabButton active={activeTab === 'CONTENT'} onClick={() => setActiveTab('CONTENT')}>Identity</TabButton>
            <TabButton active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Projects</TabButton>
            <TabButton active={activeTab === 'SYSTEM'} onClick={() => setActiveTab('SYSTEM')}>Server Config</TabButton>
          </div>
          <div className="text-[10px] tracking-widest uppercase flex items-center gap-3">
            {isProcessing ? (
              <span className="text-yellow-500 animate-pulse font-bold">● CLOUD SYNCING...</span>
            ) : (
              <span className={supabase ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                {supabase ? "● LIVE SYNC ACTIVE" : "● OFFLINE MODE"}
              </span>
            )}
          </div>
        </div>

        {activeTab === 'CONTENT' && (
          <div className="space-y-12">
            <Section title="Profile Information">
              <Input label="Name" value={data.content.name} onChange={(v) => onUpdate({...data, content: {...data.content, name: v}})} />
              <Input label="Philosophy" value={data.content.philosophy} onChange={(v) => onUpdate({...data, content: {...data.content, philosophy: v}})} />
              <div className="col-span-2">
                <Textarea label="About Biography" value={data.content.aboutText} onChange={(v) => onUpdate({...data, content: {...data.content, aboutText: v}})} />
              </div>
              <div className="col-span-2 space-y-4 pt-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-yellow-500/70 font-bold">Profile Photo</label>
                <div className="flex items-center gap-8 p-4 bg-zinc-900/50 border border-white/5">
                  <img src={data.content.profileImage} className="w-20 h-20 rounded-full object-cover grayscale border border-yellow-500/30" />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (urls) => onUpdate({...data, content: {...data.content, profileImage: urls[0]}}))} className="text-[10px] uppercase text-gray-500" />
                </div>
              </div>
            </Section>

            <Section title="Contact Channels">
              <Input label="Email" value={data.content.contact.email} onChange={(v) => onUpdate({...data, content: {...data.content, contact: {...data.content.contact, email: v}}})} />
              <Input label="Phone" value={data.content.contact.phone} onChange={(v) => onUpdate({...data, content: {...data.content, contact: {...data.content.contact, phone: v}}})} />
              <Input label="Instagram URL" value={data.content.contact.instagram} onChange={(v) => onUpdate({...data, content: {...data.content, contact: {...data.content.contact, instagram: v}}})} />
              <Input label="YouTube URL" value={data.content.contact.youtube} onChange={(v) => onUpdate({...data, content: {...data.content, contact: {...data.content.contact, youtube: v}}})} />
            </Section>
          </div>
        )}

        {activeTab === 'PROJECTS' && (
          <div className="space-y-8">
            <button onClick={addProject} className="w-full py-6 border border-dashed border-yellow-500/20 hover:border-yellow-400/50 hover:bg-yellow-400/5 text-xs tracking-[0.3em] uppercase transition-all font-bold">
              + Register New Film Project
            </button>
            <div className="space-y-16">
              {data.projects.map((p) => (
                <div key={p.id} className="p-8 bg-zinc-900/40 border border-white/5 space-y-8 relative group">
                  <button 
                    onClick={() => onUpdate({...data, projects: data.projects.filter(x => x.id !== p.id)})}
                    className="absolute top-4 right-4 text-[10px] text-red-500/50 hover:text-red-500 uppercase tracking-widest font-bold transition-colors"
                  >
                    Delete Project
                  </button>
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                       <label className="block text-[10px] uppercase tracking-widest text-yellow-500 font-bold">Poster</label>
                       <img src={p.mainImage} className="w-full aspect-[2/3] object-cover bg-black border border-white/10" />
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (urls) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, mainImage: urls[0]} : x)}))} className="text-[8px] uppercase text-gray-500" />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-6">
                      <Input label="Title (KR)" value={p.titleKr} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, titleKr: v} : x)})} />
                      <Input label="Title (EN)" value={p.titleEn} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, titleEn: v} : x)})} />
                      <Input label="Year" value={p.year} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, year: v} : x)})} />
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">Category</label>
                        <select 
                          className="bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-white focus:border-yellow-400 outline-none"
                          value={p.category}
                          onChange={(e) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, category: e.target.value as Category} : x)})}
                        >
                          <option value="DIRECTING">Directing</option>
                          <option value="AI_FILM">AI Film</option>
                          <option value="CINEMATOGRAPHY">Cinematography</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="space-y-10">
            <div className="p-8 bg-zinc-900/50 border border-white/5 space-y-6">
              <h3 className="text-xs tracking-[0.3em] uppercase text-yellow-500 font-bold">Server Synchronized Architecture</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                이 포트폴리오는 더 이상 브라우저의 <strong>localStorage</strong>를 사용하지 않습니다. 모든 수정사항은 실시간으로 Supabase 클라우드 데이터베이스에 저장되어 전 세계 어디서든 동일하게 노출됩니다.
              </p>
              
              <div className="space-y-6 pt-4">
                <div className="p-5 border border-yellow-500/20 bg-yellow-500/5">
                  <h4 className="text-[10px] tracking-widest uppercase text-yellow-500 mb-3 font-bold">Step 1: SQL Setup (Supabase Dashboard)</h4>
                  <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">Supabase의 'SQL Editor'에서 아래 코드를 실행하여 데이터를 저장할 테이블을 생성하세요.</p>
                  <pre className="bg-black p-4 text-[10px] font-mono text-yellow-500/80 overflow-x-auto border border-white/10">
{`CREATE TABLE portfolio (
  id int8 PRIMARY KEY,
  data jsonb,
  updated_at timestamptz DEFAULT now()
);

-- 초기 데이터 삽입
INSERT INTO portfolio (id, data) VALUES (1, '{}');`}
                  </pre>
                </div>

                <div className="p-5 border border-blue-500/20 bg-blue-500/5">
                  <h4 className="text-[10px] tracking-widest uppercase text-blue-400 mb-3 font-bold">Step 2: Environment Variables (Vercel)</h4>
                  <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">Vercel 프로젝트 설정에서 아래 환경 변수를 추가하세요.</p>
                  <ul className="text-[10px] font-mono text-blue-200/70 space-y-1">
                    <li>SUPABASE_URL: (Project URL)</li>
                    <li>SUPABASE_ANON_KEY: (Anon Public Key)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`text-[10px] tracking-[0.2em] uppercase py-2 px-1 border-b-2 transition-all whitespace-nowrap font-bold ${active ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
    {children}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-cinematic tracking-[0.4em] text-yellow-600 font-bold uppercase border-l-2 border-yellow-600 pl-4">{title}</h3>
    <div className="grid md:grid-cols-2 gap-8 p-8 bg-zinc-900/30 border border-white/5">{children}</div>
  </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">{label}</label>
    <input className="w-full bg-zinc-800 border border-white/10 px-4 py-3 text-sm focus:border-yellow-400 outline-none transition-colors text-white" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Textarea: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">{label}</label>
    <textarea className="w-full bg-zinc-800 border border-white/10 px-4 py-3 text-sm focus:border-yellow-400 outline-none transition-colors min-h-[160px] text-white leading-relaxed" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AdminPage;
