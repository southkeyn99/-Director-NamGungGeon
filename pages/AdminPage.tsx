
import React, { useState, useEffect } from 'react';
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
          <h1 className="font-cinematic tracking-[0.8em] text-2xl text-yellow-500">MANAGEMENT</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(password === '1228') setIsAuthenticated(true); }} className="space-y-6">
            <input 
              type="password" 
              placeholder="PASSCODE: 1228"
              className="w-full bg-transparent border-b border-yellow-500/30 py-4 text-center text-xl focus:border-yellow-400 outline-none transition-all tracking-[0.5em] placeholder:text-zinc-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard data={data} onUpdate={onUpdate} />;
};

const AdminDashboard: React.FC<AdminPageProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'PROJECTS' | 'CLOUD'>('CONTENT');
  const [cloudSettings, setCloudSettings] = useState({
    binId: localStorage.getItem('CLOUDSYNC_BIN_ID') || '',
    apiKey: localStorage.getItem('CLOUDSYNC_API_KEY') || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const saveCloudSettings = () => {
    localStorage.setItem('CLOUDSYNC_BIN_ID', cloudSettings.binId);
    localStorage.setItem('CLOUDSYNC_API_KEY', cloudSettings.apiKey);
    alert("클라우드 설정이 저장되었습니다. 이제부터 모든 변경사항이 동기화됩니다.");
    window.location.reload();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    const url = await storageService.uploadImage(file);
    onComplete(url);
    setIsSaving(false);
  };

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8 mb-12 gap-6">
          <div className="flex gap-8">
            <TabBtn active={activeTab === 'CONTENT'} onClick={() => setActiveTab('CONTENT')}>Identity</TabBtn>
            <TabBtn active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Projects</TabBtn>
            <TabBtn active={activeTab === 'CLOUD'} onClick={() => setActiveTab('CLOUD')}>Cloud Link</TabBtn>
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-500">
            {cloudSettings.binId ? '✅ Cloud Sync Active' : '⚠️ Offline Mode (Local Only)'}
          </div>
        </div>

        {activeTab === 'CONTENT' && (
          <div className="space-y-12 animate-fade-in">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] tracking-widest uppercase text-yellow-500 font-bold">Profile Photo</label>
                <div className="aspect-square bg-zinc-900 border border-white/10 relative group overflow-hidden">
                  <img src={data.content.profileImage} className="w-full h-full object-cover grayscale transition-all group-hover:scale-110" />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] tracking-[0.2em] font-bold uppercase transition-all">
                    Replace
                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, (url) => onUpdate({...data, content: {...data.content, profileImage: url}}))} />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 space-y-8">
                <AdminInput label="Director Name" value={data.content.name} onChange={(v) => onUpdate({...data, content: {...data.content, name: v}})} />
                <AdminInput label="Philosophy" value={data.content.philosophy} onChange={(v) => onUpdate({...data, content: {...data.content, philosophy: v}})} />
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">About Text</label>
                  <textarea className="w-full bg-zinc-900 border border-white/5 p-4 text-sm outline-none focus:border-yellow-500 min-h-[150px] leading-relaxed" value={data.content.aboutText} onChange={(e) => onUpdate({...data, content: {...data.content, aboutText: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROJECTS' && (
          <div className="space-y-12 animate-fade-in">
            <button onClick={() => onUpdate({...data, projects: [{id: Date.now().toString(), category: 'DIRECTING', year: '2024', titleKr: 'New Project', titleEn: 'NEW PROJECT', genre: 'Drama', runtime: '0min', role: 'Director', synopsis: '', awards: [], mainImage: 'https://picsum.photos/1200/800', stills: []}, ...data.projects]})} className="w-full py-10 border border-dashed border-white/20 hover:border-yellow-500 transition-all text-[10px] tracking-[0.4em] font-bold uppercase">
              + New Film Project
            </button>
            <div className="space-y-16">
              {data.projects.map((p) => (
                <div key={p.id} className="grid md:grid-cols-4 gap-10 border-t border-white/5 pt-12 relative group">
                  <button onClick={() => onUpdate({...data, projects: data.projects.filter(x => x.id !== p.id)})} className="absolute top-12 right-0 text-[9px] text-zinc-700 hover:text-red-500 font-bold uppercase tracking-widest">Remove</button>
                  <div className="aspect-[2/3] bg-zinc-900 border border-white/10 relative overflow-hidden group/img">
                    <img src={p.mainImage} className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" />
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer text-[9px] tracking-[0.2em] font-bold uppercase">
                      Change Poster
                      <input type="file" className="hidden" onChange={(e) => handleUpload(e, (url) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, mainImage: url} : x)}))} />
                    </label>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-2 gap-6">
                    <AdminInput label="Title KR" value={p.titleKr} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, titleKr: v} : x)})} />
                    <AdminInput label="Title EN" value={p.titleEn} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, titleEn: v} : x)})} />
                    <AdminInput label="Year" value={p.year} onChange={(v) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, year: v} : x)})} />
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">Category</label>
                      <select className="w-full bg-zinc-900 border border-white/5 p-3 text-xs outline-none focus:border-yellow-500 text-white" value={p.category} onChange={(e) => onUpdate({...data, projects: data.projects.map(x => x.id === p.id ? {...x, category: e.target.value as Category} : x)})}>
                        <option value="DIRECTING">Directing</option>
                        <option value="AI_FILM">AI Film</option>
                        <option value="CINEMATOGRAPHY">Cinematography</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CLOUD' && (
          <div className="max-w-2xl space-y-12 animate-fade-in">
            <div className="p-8 bg-zinc-900/50 border border-yellow-500/10 space-y-6">
              <h3 className="text-sm tracking-[0.3em] font-bold text-yellow-500 uppercase">Step 1: Get Your Free Storage</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <a href="https://jsonbin.io" target="_blank" className="text-yellow-500 underline">JSONbin.io</a>에 접속하여 회원가입 후, <br/>
                1. <strong>API Keys</strong> 탭에서 'Master Key'를 복사하세요. <br/>
                2. <strong>Bins</strong> 탭에서 빈 데이터로 'Create Bin'을 누른 후 생성된 'Bin ID'를 복사하세요.
              </p>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-sm tracking-[0.3em] font-bold text-yellow-500 uppercase">Step 2: Connect Your Portfolio</h3>
              <AdminInput label="Bin ID" value={cloudSettings.binId} onChange={(v) => setCloudSettings(prev => ({...prev, binId: v}))} />
              <AdminInput label="Master API Key" value={cloudSettings.apiKey} onChange={(v) => setCloudSettings(prev => ({...prev, apiKey: v}))} />
              <button 
                onClick={saveCloudSettings}
                className="w-full py-4 bg-yellow-500 text-black font-bold uppercase text-[10px] tracking-[0.4em] hover:bg-yellow-400 transition-all"
              >
                Connect & Sync Now
              </button>
            </div>

            <p className="text-[10px] text-zinc-600 tracking-widest leading-loose">
              * 설정 후 모든 편집 내용은 클라우드에 즉시 저장되며, 전 세계 어디서든 동일한 내용을 확인할 수 있습니다. <br/>
              * 이미지는 현재 브라우저 최적화를 위해 Base64 방식으로 저장됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`text-[10px] tracking-[0.3em] uppercase py-2 border-b-2 font-bold transition-all ${active ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
    {children}
  </button>
);

const AdminInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">{label}</label>
    <input className="w-full bg-zinc-900 border border-white/5 p-3 text-sm outline-none focus:border-yellow-500 transition-all" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AdminPage;
