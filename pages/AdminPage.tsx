
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
  const [localData, setLocalData] = useState<PortfolioData>(data);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [cloudSettings, setCloudSettings] = useState({
    binId: localStorage.getItem('CLOUDSYNC_BIN_ID') || '',
    apiKey: localStorage.getItem('CLOUDSYNC_API_KEY') || ''
  });

  const handleLocalUpdate = (newData: PortfolioData) => {
    setLocalData(newData);
  };

  const handleFinalSave = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      await storageService.savePortfolio(localData);
      onUpdate(localData);
      alert("✅ 변경사항이 저장되었습니다.");
    } catch (err: any) {
      setSyncError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveCloudSettings = () => {
    localStorage.setItem('CLOUDSYNC_BIN_ID', cloudSettings.binId.trim());
    localStorage.setItem('CLOUDSYNC_API_KEY', cloudSettings.apiKey.trim());
    alert("설정 저장됨. 재시작합니다.");
    window.location.reload();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await storageService.uploadImage(file);
      onComplete(url);
    } catch (err) {
      alert("업로드 실패: " + err);
    }
  };

  return (
    <div className="pt-32 pb-40 px-6 md:px-12 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Sync Status Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4">
          <div className="bg-zinc-900 border border-white/10 p-4 shadow-2xl flex items-center justify-between gap-4 rounded-lg">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Cloud Sync</span>
              <span className="text-[11px] text-white">
                {isSyncing ? '⏳ Syncing...' : syncError ? '❌ Error' : '🟢 Up to date'}
              </span>
            </div>
            <button 
              onClick={handleFinalSave}
              disabled={isSyncing}
              className={`px-8 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-all rounded ${isSyncing ? 'bg-zinc-800 text-zinc-500' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
            >
              {isSyncing ? 'Saving...' : 'Deploy Now'}
            </button>
          </div>
          {syncError && <p className="mt-2 text-red-500 text-[10px] text-center font-bold tracking-tight bg-black/50 p-2 rounded">{syncError}</p>}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8 mb-12 gap-6">
          <div className="flex gap-8">
            <TabBtn active={activeTab === 'CONTENT'} onClick={() => setActiveTab('CONTENT')}>Identity</TabBtn>
            <TabBtn active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Projects</TabBtn>
            <TabBtn active={activeTab === 'CLOUD'} onClick={() => setActiveTab('CLOUD')}>Cloud Setup</TabBtn>
          </div>
        </div>

        {activeTab === 'CONTENT' && (
          <div className="space-y-12 animate-fade-in mb-20">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <label className="text-[10px] tracking-widest uppercase text-yellow-500 font-bold">Profile Visual</label>
                <div className="aspect-square bg-zinc-900 border border-white/10 relative group overflow-hidden rounded-lg">
                  <img src={localData.content.profileImage} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" alt="Profile Preview" />
                  <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] tracking-[0.2em] font-bold uppercase transition-all">
                    Upload File
                    <input type="file" className="hidden" onChange={(e) => handleUpload(e, (url) => handleLocalUpdate({...localData, content: {...localData.content, profileImage: url}}))} />
                  </label>
                </div>
                <AdminInput 
                  label="Profile Image URL (Best for Size)" 
                  value={localData.content.profileImage} 
                  onChange={(v) => handleLocalUpdate({...localData, content: {...localData.content, profileImage: v}})} 
                />
                <AdminInput 
                  label="Home Background URL" 
                  value={localData.content.homeBgImage} 
                  onChange={(v) => handleLocalUpdate({...localData, content: {...localData.content, homeBgImage: v}})} 
                />
              </div>
              <div className="md:col-span-2 space-y-8">
                <AdminInput label="Director Name" value={localData.content.name} onChange={(v) => handleLocalUpdate({...localData, content: {...localData.content, name: v}})} />
                <AdminInput label="Philosophy" value={localData.content.philosophy} onChange={(v) => handleLocalUpdate({...localData, content: {...localData.content, philosophy: v}})} />
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">About Text</label>
                  <textarea className="w-full bg-zinc-900 border border-white/5 p-4 text-sm outline-none focus:border-yellow-500 min-h-[150px] leading-relaxed rounded" value={localData.content.aboutText} onChange={(e) => handleLocalUpdate({...localData, content: {...localData.content, aboutText: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PROJECTS' && (
          <div className="space-y-12 animate-fade-in mb-20">
            <button onClick={() => handleLocalUpdate({...localData, projects: [{id: Date.now().toString(), category: 'DIRECTING', year: '2024', titleKr: 'New Project', titleEn: 'NEW PROJECT', genre: 'Drama', runtime: '0min', role: 'Director', synopsis: '', awards: [], mainImage: 'https://picsum.photos/1200/800', stills: []}, ...localData.projects]})} className="w-full py-8 border border-dashed border-white/20 hover:border-yellow-500 transition-all text-[10px] tracking-[0.4em] font-bold uppercase rounded-lg">
              + Add New Film
            </button>
            <div className="space-y-16">
              {localData.projects.map((p) => (
                <div key={p.id} className="grid md:grid-cols-4 gap-10 border-t border-white/5 pt-12 relative group">
                  <button onClick={() => handleLocalUpdate({...localData, projects: localData.projects.filter(x => x.id !== p.id)})} className="absolute top-12 right-0 text-[9px] text-zinc-700 hover:text-red-500 font-bold uppercase tracking-widest">Remove Project</button>
                  
                  <div className="space-y-4">
                    <div className="aspect-[2/3] bg-zinc-900 border border-white/10 relative overflow-hidden group/img rounded">
                      <img src={p.mainImage} className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" alt="Poster" />
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer text-[9px] tracking-[0.2em] font-bold uppercase">
                        Upload Poster
                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, (url) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, mainImage: url} : x)}))} />
                      </label>
                    </div>
                    <AdminInput 
                      label="Poster URL" 
                      value={p.mainImage} 
                      onChange={(v) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, mainImage: v} : x)})} 
                    />
                  </div>

                  <div className="md:col-span-3 grid grid-cols-2 gap-6">
                    <AdminInput label="Title KR" value={p.titleKr} onChange={(v) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, titleKr: v} : x)})} />
                    <AdminInput label="Title EN" value={p.titleEn} onChange={(v) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, titleEn: v} : x)})} />
                    <AdminInput label="Year" value={p.year} onChange={(v) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, year: v} : x)})} />
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">Category</label>
                      <select className="w-full bg-zinc-900 border border-white/5 p-3 text-xs outline-none focus:border-yellow-500 text-white rounded" value={p.category} onChange={(e) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, category: e.target.value as Category} : x)})}>
                        <option value="DIRECTING">Directing</option>
                        <option value="AI_FILM">AI Film</option>
                        <option value="CINEMATOGRAPHY">Cinematography</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] tracking-widest uppercase text-zinc-500 font-bold">Synopsis</label>
                      <textarea className="w-full bg-zinc-900 border border-white/5 p-3 text-sm outline-none focus:border-yellow-500 min-h-[80px] rounded" value={p.synopsis} onChange={(e) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, synopsis: e.target.value} : x)})} />
                    </div>
                    <div className="col-span-2 space-y-4 pt-4">
                      <label className="text-[10px] tracking-widest uppercase text-yellow-500 font-bold">Film Stills (Enter URLs, one per line)</label>
                      <textarea 
                        className="w-full bg-zinc-900 border border-white/5 p-3 text-xs font-mono outline-none focus:border-yellow-500 min-h-[120px] rounded" 
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        value={p.stills.join('\n')} 
                        onChange={(e) => handleLocalUpdate({...localData, projects: localData.projects.map(x => x.id === p.id ? {...x, stills: e.target.value.split('\n').filter(url => url.trim() !== '')} : x)})} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CLOUD' && (
          <div className="max-w-2xl space-y-12 animate-fade-in mb-20">
            <div className="p-8 bg-zinc-900/50 border border-yellow-500/10 space-y-6 rounded-lg">
              <h3 className="text-sm tracking-[0.3em] font-bold text-yellow-500 uppercase">Sync Config</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                JSONbin.io에서 Bin ID와 Master Key를 발급받아 입력하세요.<br/>
                사진을 직접 업로드하는 것보다 <strong>구글 드라이브나 이미지 호스팅 서비스의 링크(URL)</strong>를 사용하는 것을 적극 권장합니다.
              </p>
            </div>
            
            <div className="space-y-6">
              <AdminInput label="Bin ID" value={cloudSettings.binId} onChange={(v) => setCloudSettings(prev => ({...prev, binId: v}))} />
              <AdminInput label="Master API Key" value={cloudSettings.apiKey} onChange={(v) => setCloudSettings(prev => ({...prev, apiKey: v}))} />
              <button onClick={saveCloudSettings} className="w-full py-4 bg-yellow-500 text-black font-bold uppercase text-[10px] tracking-[0.4em] rounded hover:bg-yellow-400 transition-colors">Apply & Reload</button>
            </div>
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
    <input className="w-full bg-zinc-900 border border-white/5 p-3 text-sm outline-none focus:border-yellow-500 transition-all rounded" value={value || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AdminPage;
