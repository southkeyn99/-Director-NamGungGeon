
import React, { useState } from 'react';
import { PortfolioData, Project, StaffHistory, Category } from '../types';
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
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'PROJECTS' | 'STAFF' | 'SYSTEM'>('CONTENT');
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadToSupabase = async (file: File): Promise<string> => {
    if (!supabase) {
      throw new Error("서버 연결 정보가 없습니다. Vercel 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)를 확인해주세요.");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data: uploadData, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`저장소 에러: ${error.message}. (버킷 이름이 'media'인지, Public 설정이 되어있는지 확인하세요.)`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(uploadData.path);

    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (urls: string[]) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!supabase) {
      alert("클라우드 연결이 설정되지 않았습니다. SYSTEM 탭의 안내를 따라주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => uploadToSupabase(file));
      const urls = await Promise.all(uploadPromises);
      callback(urls);
    } catch (err: any) {
      console.error("Cloud upload failed", err);
      alert(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateContent = (field: string, value: any) => {
    onUpdate({
      ...data,
      content: { ...data.content, [field]: value }
    });
  };

  const updateContact = (field: string, value: string) => {
    onUpdate({
      ...data,
      content: {
        ...data.content,
        contact: { ...data.content.contact, [field]: value }
      }
    });
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      category: 'DIRECTING',
      year: new Date().getFullYear().toString(),
      titleKr: '새 작품',
      titleEn: 'NEW PROJECT',
      genre: 'Drama',
      runtime: '00min',
      role: 'Director',
      synopsis: '',
      awards: [],
      mainImage: 'https://picsum.photos/id/10/800/1200',
      stills: []
    };
    onUpdate({ ...data, projects: [newProject, ...data.projects] });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    onUpdate({
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const addStaff = () => {
    const newItem: StaffHistory = {
      id: Date.now().toString(),
      year: new Date().getFullYear().toString(),
      project: 'Project Name',
      role: 'Staff Role',
      awards: []
    };
    onUpdate({ ...data, staff: [newItem, ...data.staff] });
  };

  return (
    <div className="pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Connection Status Banner */}
        {!supabase && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-red-500 animate-pulse text-lg">⚠️</span>
              <p className="text-xs text-red-200 tracking-wide">
                <strong>서버 연결 설정이 필요합니다.</strong> 환경 변수가 설정되지 않아 이미지 업로드가 불가능합니다.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('SYSTEM')}
              className="px-4 py-2 bg-red-500 text-white text-[10px] tracking-widest uppercase font-bold hover:bg-red-600 transition-colors"
            >
              How to fix
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-white/10 pb-4">
          <div className="flex gap-8 overflow-x-auto pb-2 md:pb-0">
            <TabButton active={activeTab === 'CONTENT'} onClick={() => setActiveTab('CONTENT')}>Global Content</TabButton>
            <TabButton active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Projects</TabButton>
            <TabButton active={activeTab === 'STAFF'} onClick={() => setActiveTab('STAFF')}>Staff</TabButton>
            <TabButton active={activeTab === 'SYSTEM'} onClick={() => setActiveTab('SYSTEM')}>Server Sync</TabButton>
          </div>
          <div className="text-[10px] tracking-widest uppercase flex items-center gap-2">
            {isProcessing ? (
              <span className="text-yellow-500 animate-pulse">Uploading to Storage...</span>
            ) : (
              <span className={supabase ? "text-green-500" : "text-gray-500"}>
                {supabase ? "Cloud Synced" : "Offline Mode"}
              </span>
            )}
          </div>
        </div>

        {activeTab === 'CONTENT' && (
          <div className="space-y-12">
            <Section title="Identity">
              <Input label="Name" value={data.content.name} onChange={(v) => updateContent('name', v)} />
              <Input label="Philosophy" value={data.content.philosophy} onChange={(v) => updateContent('philosophy', v)} />
              <div className="col-span-2 space-y-4">
                <label className="block text-[10px] uppercase tracking-widest text-yellow-500 font-bold">Profile Image</label>
                <div className="flex items-center gap-6">
                  <img src={data.content.profileImage} className="w-20 h-20 rounded-full object-cover grayscale border border-yellow-400/30" />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (urls) => updateContent('profileImage', urls[0]))} className="text-xs text-gray-500" />
                </div>
              </div>
              <div className="col-span-2">
                <Textarea label="About Me Text" value={data.content.aboutText} onChange={(v) => updateContent('aboutText', v)} />
              </div>
            </Section>

            <Section title="Contact Info">
              <Input label="Heading" value={data.content.contactTitle} onChange={(v) => updateContent('contactTitle', v)} />
              <Input label="Email" value={data.content.contact.email} onChange={(v) => updateContact('email', v)} />
              <Input label="Phone" value={data.content.contact.phone} onChange={(v) => updateContact('phone', v)} />
              <Input label="Instagram" value={data.content.contact.instagram} onChange={(v) => updateContact('instagram', v)} />
            </Section>

            <Section title="Visuals">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-yellow-500 mb-2 font-bold">Hero Background</label>
                <div className="flex items-center gap-6">
                  <img src={data.content.homeBgImage} className="w-32 aspect-video object-cover bg-zinc-900 border border-white/10" />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (urls) => updateContent('homeBgImage', urls[0]))} className="text-xs text-gray-500" />
                </div>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'PROJECTS' && (
          <div className="space-y-8">
            <button onClick={addProject} className="w-full py-4 border border-dashed border-yellow-500/20 hover:border-yellow-400/50 text-xs tracking-widest uppercase">
              + New Project
            </button>
            <div className="space-y-16">
              {data.projects.map((project) => (
                <div key={project.id} className="p-8 bg-zinc-900/50 border border-white/5 space-y-8">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-4">
                       <label className="block text-[10px] uppercase tracking-widest text-yellow-500 font-bold">Main Visual</label>
                       <img src={project.mainImage} className="w-full aspect-[2/3] object-cover bg-black border border-white/10" />
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (urls) => updateProject(project.id, { mainImage: urls[0] }))} className="text-xs text-gray-500" />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                      <Input label="Title (KR)" value={project.titleKr} onChange={(v) => updateProject(project.id, { titleKr: v })} />
                      <Input label="Title (EN)" value={project.titleEn} onChange={(v) => updateProject(project.id, { titleEn: v })} />
                      <Input label="Year" value={project.year} onChange={(v) => updateProject(project.id, { year: v })} />
                      <Input label="Genre" value={project.genre} onChange={(v) => updateProject(project.id, { genre: v })} />
                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 mb-1 font-bold">Category</label>
                        <select 
                          className="w-full bg-zinc-800 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none"
                          value={project.category}
                          onChange={(e) => updateProject(project.id, { category: e.target.value as Category })}
                        >
                          <option value="DIRECTING">Directing</option>
                          <option value="AI_FILM">AI Film</option>
                          <option value="CINEMATOGRAPHY">Cinematography</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Textarea label="Synopsis" value={project.synopsis} onChange={(v) => updateProject(project.id, { synopsis: v })} />
                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-widest text-yellow-500 font-bold">Film Stills</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, (urls) => updateProject(project.id, { stills: [...project.stills, ...urls] }))} className="text-xs text-gray-500" />
                    <div className="grid grid-cols-6 gap-2 mt-4">
                      {project.stills.map((s, idx) => (
                        <div key={idx} className="relative group">
                          <img src={s} className="w-full aspect-square object-cover opacity-60 hover:opacity-100" />
                          <button onClick={() => updateProject(project.id, { stills: project.stills.filter((_, i) => i !== idx) })} className="absolute top-1 right-1 bg-black/80 text-[8px] p-1">X</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'STAFF' && (
          <div className="space-y-6">
             <button onClick={addStaff} className="w-full py-4 border border-dashed border-yellow-500/20 hover:border-yellow-400/50 text-xs tracking-widest uppercase">+ Add Credit</button>
             {data.staff.map((s) => (
                <div key={s.id} className="p-6 bg-zinc-900/40 border border-white/5 flex gap-4 items-end">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <Input label="Year" value={s.year} onChange={(v) => onUpdate({...data, staff: data.staff.map(x => x.id === s.id ? {...x, year: v} : x)})} />
                    <Input label="Project" value={s.project} onChange={(v) => onUpdate({...data, staff: data.staff.map(x => x.id === s.id ? {...x, project: v} : x)})} />
                    <Input label="Role" value={s.role} onChange={(v) => onUpdate({...data, staff: data.staff.map(x => x.id === s.id ? {...x, role: v} : x)})} />
                    <button onClick={() => onUpdate({...data, staff: data.staff.filter(x => x.id !== s.id)})} className="text-red-500 text-[10px] uppercase self-center pt-4">Remove</button>
                  </div>
                </div>
             ))}
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="space-y-12">
            <div className="p-8 bg-zinc-900/50 border border-white/5 space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-yellow-500 font-bold">Cloud Sync Status</h3>
              <div className={`p-4 border ${supabase ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-red-500/20 bg-red-500/5 text-red-500'} text-[10px] tracking-widest uppercase`}>
                Database Connection: {supabase ? 'Live' : 'Disconnected (Credentials Missing)'}
              </div>
              
              {!supabase && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <p className="text-sm text-yellow-500 leading-relaxed font-bold">
                    해결 방법:
                  </p>
                  <ol className="text-xs text-gray-400 space-y-2 list-decimal ml-4">
                    <li>Vercel 프로젝트 설정(Settings) > Environment Variables 로 이동합니다.</li>
                    <li><strong>SUPABASE_URL</strong>과 <strong>SUPABASE_ANON_KEY</strong>를 추가합니다.</li>
                    <li>프로젝트를 다시 <strong>Redeploy</strong> 해야 변경사항이 적용됩니다.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="p-8 bg-zinc-900/50 border border-red-500/20 space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-red-500 font-bold">Troubleshooting: Image Storage</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                환경 변수 설정 후에도 업로드가 실패한다면, Supabase 대시보드에서 <strong>'media'</strong>라는 이름의 <strong>Public Bucket</strong>이 생성되어 있는지 확인하세요.
              </p>
              <div className="relative group">
                <pre className="bg-black p-4 text-[10px] font-mono text-yellow-500/80 overflow-x-auto border border-white/10">
{`-- SQL Editor에서 실행하여 권한 부여
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'media' );
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'media' );`}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(`CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'media' );\nCREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'media' );`)}
                  className="absolute top-2 right-2 bg-zinc-800 px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy SQL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`text-[10px] tracking-[0.2em] uppercase py-2 px-1 border-b-2 transition-all whitespace-nowrap ${active ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
    {children}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-xs font-cinematic tracking-widest text-yellow-600 font-bold uppercase">{title}</h3>
    <div className="grid md:grid-cols-2 gap-6 p-8 bg-zinc-900/30 border border-white/5">{children}</div>
  </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">{label}</label>
    <input className="w-full bg-zinc-800 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Textarea: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">{label}</label>
    <textarea className="w-full bg-zinc-800 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors min-h-[150px]" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default AdminPage;
