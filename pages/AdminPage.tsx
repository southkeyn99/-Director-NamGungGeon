
import React, { useState } from 'react';
import { PortfolioData, Project, Category } from '../types';
import { storageService } from '../storage';

interface AdminPageProps {
  data: PortfolioData;
  onUpdate: (data: PortfolioData) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ data, onUpdate }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black px-6">
        <div className="w-full max-w-sm space-y-10 text-center">
          <h1 className="font-cinematic tracking-[0.8em] text-2xl text-yellow-500 animate-fade-in">MANAGEMENT</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(password === '1228') setIsAuthenticated(true); }} className="space-y-6">
            <input 
              type="password" 
              placeholder="ENTER PASSCODE"
              className="w-full bg-transparent border-b border-yellow-500/30 py-4 text-center text-xl focus:border-yellow-400 outline-none transition-all tracking-[0.5em] placeholder:text-zinc-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </form>
          <p className="text-[10px] tracking-widest text-zinc-600 uppercase">Authorized Personnel Only</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard data={data} onUpdate={onUpdate} />;
};

const AdminDashboard: React.FC<AdminPageProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PROJECTS' | 'SETUP'>('IDENTITY');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const url = await storageService.uploadImage(file);
      onComplete(url);
    } catch (err) {
      alert("업로드에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      category: 'DIRECTING',
      year: new Date().getFullYear().toString(),
      titleKr: '새 프로젝트',
      titleEn: 'NEW PROJECT',
      genre: 'Drama',
      runtime: '0min',
      role: 'Director',
      synopsis: '',
      awards: [],
      mainImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80',
      stills: []
    };
    onUpdate({ ...data, projects: [newProject, ...data.projects] });
  };

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8 mb-12 gap-6">
          <div className="flex gap-10 overflow-x-auto no-scrollbar w-full md:w-auto">
            <TabBtn active={activeTab === 'IDENTITY'} onClick={() => setActiveTab('IDENTITY')}>Site Identity</TabBtn>
            <TabBtn active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Filmography</TabBtn>
            <TabBtn active={activeTab === 'SETUP'} onClick={() => setActiveTab('SETUP')}>Cloud Setup</TabBtn>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></div>
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-500">
              {isSaving ? 'Syncing with Server...' : 'All Changes Saved to Cloud'}
            </span>
          </div>
        </div>

        {/* Identity Tab */}
        {activeTab === 'IDENTITY' && (
          <div className="grid md:grid-cols-3 gap-16">
            <div className="md:col-span-1 space-y-8">
              <h3 className="text-xs font-cinematic tracking-widest text-yellow-600 uppercase font-bold">Main Visual</h3>
              <div className="relative group aspect-square bg-zinc-900 border border-white/5 overflow-hidden">
                <img src={data.content.profileImage} className="w-full h-full object-cover grayscale transition-all group-hover:scale-110" />
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] tracking-widest uppercase font-bold">
                  Change Photo
                  <input type="file" className="hidden" onChange={(e) => handleUpload(e, (url) => onUpdate({...data, content: {...data.content, profileImage: url}}))} />
                </label>
              </div>
            </div>
            <div className="md:col-span-2 space-y-10">
              <Section title="Basic Info">
                <AdminInput label="Name" value={data.content.name} onChange={(v) => onUpdate({...data, content: {...data.content, name: v}})} />
                <AdminInput label="Philosophy" value={data.content.philosophy} onChange={(v) => onUpdate({...data, content: {...data.content, philosophy: v}})} />
                <div className="md:col-span-2">
                  <AdminTextarea label="Biography" value={data.content.aboutText} onChange={(v) => onUpdate({...data, content: {...data.content, aboutText: v}})} />
                </div>
              </Section>
              <Section title="Contacts">
                <AdminInput label="Email" value={data.content.contact.email} onChange={(v) => onUpdate({...data, content: {...data.content, contact: {...data.content.contact, email: v}}})} />
                <AdminInput label="Instagram" value={data.content.contact.instagram} onChange={(v) => onUpdate({...data, content: {...data.content, contact: {...data.content.contact, instagram: v}}})} />
              </Section>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'PROJECTS' && (
          <div className="space-y-12">
            <button onClick={addProject} className="w-full py-10 border border-dashed border-white/10 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all text-xs tracking-[0.4em] uppercase font-bold">
              + New Film Entry
            </button>
            <div className="grid grid-cols-1 gap-20">
              {data.projects.map((p) => (
                <div key={p.id} className="grid md:grid-cols-4 gap-10 group relative">
                  <button onClick={() => onUpdate({...data, projects: data.projects.filter(x => x.id !== p.id)})} className="absolute -top-6 right-0 text-[10px] text-zinc-700 hover:text-red-500 tracking-widest font-bold uppercase transition-colors">Delete Project</button>
                  <div className="md:col-span-1 space-y-4">
                    <div className="aspect-[2/3] bg-zinc-900 border border-white/5 relative overflow-hidden group/img">
                       <img src={p.mainImage} className="w-full h-full object-cover" />
                       <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer text-[9px] tracking-widest uppercase font-bold">
                         Replace Poster
                         <input type="file" className="hidden" onChange={(e) => handleUpload(e, (url) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, mainImage: url} : x)}))} />
                       </label>
                    </div>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-2 gap-6">
                    <AdminInput label="KR Title" value={p.titleKr} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, titleKr: v} : x)})} />
                    <AdminInput label="EN Title" value={p.titleEn} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, titleEn: v} : x)})} />
                    <AdminInput label="Year" value={p.year} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, year: v} : x)})} />
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-yellow-500/60 font-bold">Category</label>
                      <select 
                        value={p.category} 
                        onChange={(e) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, category: e.target.value as Category} : x)})}
                        className="w-full bg-zinc-900 border border-white/5 px-4 py-3 text-xs outline-none focus:border-yellow-500 transition-all text-white"
                      >
                        <option value="DIRECTING">Directing</option>
                        <option value="AI_FILM">AI Film</option>
                        <option value="CINEMATOGRAPHY">Cinematography</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <AdminTextarea label="Synopsis" value={p.synopsis} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, synopsis: v} : x)})} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === 'SETUP' && (
          <div className="max-w-3xl space-y-10">
            <div className="p-10 bg-zinc-900/40 border border-white/5 space-y-8">
              <h3 className="text-sm tracking-[0.4em] uppercase text-yellow-500 font-bold">Vercel Serverless Integration</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                이 사이트는 브라우저의 로컬 스토리지를 일절 사용하지 않습니다. 모든 데이터는 Vercel 서버에 JSON 형태로 저장됩니다. 이를 위해 Vercel Dashboard에서 다음 단계를 완료하세요.
              </p>
              <ol className="space-y-4 text-xs tracking-widest text-zinc-500 uppercase list-decimal list-inside">
                <li>Create a <strong>Vercel Postgres</strong> or <strong>Vercel KV</strong> instance.</li>
                <li>Connect the database to this project in Vercel settings.</li>
                <li>Deploy the <code>/api/portfolio</code> and <code>/api/upload</code> serverless functions.</li>
                <li>Set <code>BLOB_READ_WRITE_TOKEN</code> for image storage.</li>
              </ol>
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-yellow-500 font-bold tracking-[0.2em] mb-4">API ENDPOINT STATUS</p>
                <div className="flex gap-4">
                  <StatusBadge label="DB_SYNC" active={true} />
                  <StatusBadge label="BLOB_STORAGE" active={true} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`text-[10px] tracking-[0.4em] uppercase py-3 border-b-2 transition-all font-bold whitespace-nowrap ${active ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
    {children}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h4 className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 border-l border-yellow-500 pl-4 mb-6">{title}</h4>
    <div className="grid md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const AdminInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] tracking-widest uppercase text-yellow-500/60 font-bold">{label}</label>
    <input className="w-full bg-zinc-900 border border-white/5 px-4 py-3 text-xs outline-none focus:border-yellow-500 transition-all text-white font-medium" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const AdminTextarea: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] tracking-widest uppercase text-yellow-500/60 font-bold">{label}</label>
    <textarea className="w-full bg-zinc-900 border border-white/5 px-4 py-4 text-xs outline-none focus:border-yellow-500 transition-all text-white font-medium min-h-[120px] leading-relaxed" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const StatusBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className={`px-3 py-1 rounded-full text-[8px] tracking-[0.2em] font-bold border ${active ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
    {label}: {active ? 'ONLINE' : 'OFFLINE'}
  </div>
);

export default AdminPage;
