
import React, { useState } from 'react';
import { PortfolioData, Project, StaffHistory, Category } from '../types';

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
          <button type="submit" className="hidden">Login</button>
        </form>
      </div>
    );
  }

  return <AdminDashboard data={data} onUpdate={onUpdate} />;
};

const AdminDashboard: React.FC<AdminPageProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'PROJECTS' | 'STAFF' | 'SYSTEM'>('CONTENT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const compressImage = (file: File, maxWidth = 1200, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (base64Strings: string[]) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const compressedImages = await Promise.all(
        Array.from(files).map((file: File) => compressImage(file))
      );
      callback(compressedImages);
    } catch (err) {
      console.error("Image processing failed", err);
      alert("Image upload failed. Please try a different file.");
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

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      onUpdate({ ...data, projects: data.projects.filter(p => p.id !== id) });
    }
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

  const deleteStaff = (id: string) => {
    onUpdate({ ...data, staff: data.staff.filter(s => s.id !== id) });
  };

  const updateStaffItem = (id: string, updates: Partial<StaffHistory>) => {
    onUpdate({
      ...data,
      staff: data.staff.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const copyDataToClipboard = () => {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      if (parsed.projects && parsed.content) {
        onUpdate(parsed);
      }
    } catch (err) {
      console.error("Invalid JSON import");
    }
  };

  return (
    <div className="pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-white/10 pb-4">
          <div className="flex gap-8 overflow-x-auto pb-2 md:pb-0">
            <TabButton active={activeTab === 'CONTENT'} onClick={() => setActiveTab('CONTENT')}>Content</TabButton>
            <TabButton active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Projects</TabButton>
            <TabButton active={activeTab === 'STAFF'} onClick={() => setActiveTab('STAFF')}>Staff</TabButton>
            <TabButton active={activeTab === 'SYSTEM'} onClick={() => setActiveTab('SYSTEM')}>Deployment</TabButton>
          </div>
          <div className="text-[10px] tracking-widest text-gray-500 uppercase flex items-center gap-2">
            {isProcessing ? (
              <span className="text-yellow-500 animate-pulse">Processing...</span>
            ) : (
              <span className="text-green-500">Autosaved to Browser</span>
            )}
          </div>
        </div>

        {activeTab === 'CONTENT' && (
          <div className="space-y-12">
            <Section title="Basic Info">
              <div className="col-span-1">
                <Input label="Name" value={data.content.name} onChange={(v) => updateContent('name', v)} />
                <Input label="Philosophy Quote" value={data.content.philosophy} onChange={(v) => updateContent('philosophy', v)} />
              </div>
              <div className="col-span-1 flex flex-col items-center justify-center p-4 border border-white/5 bg-black/20">
                <label className="block text-[10px] uppercase tracking-widest text-yellow-500 mb-2">Profile Photo</label>
                <div className="flex flex-col items-center gap-4">
                  <img src={data.content.profileImage} className="w-20 h-20 rounded-full object-cover grayscale border border-yellow-400/30" />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (imgs) => updateContent('profileImage', imgs[0]))} className="text-[10px] text-gray-500" />
                </div>
              </div>
              <div className="col-span-2">
                <Textarea label="About Me Text" value={data.content.aboutText} onChange={(v) => updateContent('aboutText', v)} />
              </div>
            </Section>

            <Section title="Contact Page">
              <div className="col-span-2">
                <Input label="Main Heading" value={data.content.contactTitle} onChange={(v) => updateContent('contactTitle', v)} />
              </div>
              <Input label="Email" value={data.content.contact.email} onChange={(v) => updateContact('email', v)} />
              <Input label="Phone" value={data.content.contact.phone} onChange={(v) => updateContact('phone', v)} />
              <Input label="Instagram URL" value={data.content.contact.instagram} onChange={(v) => updateContact('instagram', v)} />
              <Input label="YouTube URL" value={data.content.contact.youtube} onChange={(v) => updateContact('youtube', v)} />
            </Section>

            <Section title="Hero Media">
              <div className="col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-yellow-500 mb-2 font-bold">Main Background</label>
                <div className="flex items-center gap-6">
                  <img src={data.content.homeBgImage} className="w-32 aspect-video object-cover bg-zinc-900 border border-white/10" />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (imgs) => updateContent('homeBgImage', imgs[0]))} className="text-xs text-gray-500" />
                </div>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'PROJECTS' && (
          <div className="space-y-8">
            <button onClick={addProject} className="w-full py-4 border border-dashed border-yellow-500/20 hover:border-yellow-400/50 text-xs tracking-widest uppercase transition-all">
              + Add New Project
            </button>
            <div className="space-y-16">
              {data.projects.map((project) => (
                <div key={project.id} className="p-8 bg-zinc-900/50 border border-white/5 space-y-8 relative group">
                  <button 
                    onClick={() => deleteProject(project.id)}
                    className="absolute top-4 right-4 text-xs text-red-500/50 hover:text-red-500 uppercase tracking-tighter"
                  >
                    Delete Project
                  </button>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-6">
                       <label className="block text-[10px] uppercase tracking-widest text-yellow-500 mb-2 font-bold">Poster Image (2:3)</label>
                       <img src={project.mainImage} className="w-full aspect-[2/3] object-cover bg-black border border-white/10" />
                       <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (imgs) => updateProject(project.id, { mainImage: imgs[0] }))} className="text-xs text-gray-500" />
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                      <Input label="KR Title" value={project.titleKr} onChange={(v) => updateProject(project.id, { titleKr: v })} />
                      <Input label="EN Title" value={project.titleEn} onChange={(v) => updateProject(project.id, { titleEn: v })} />
                      <Input label="Year" value={project.year} onChange={(v) => updateProject(project.id, { year: v })} />
                      <Input label="Genre" value={project.genre} onChange={(v) => updateProject(project.id, { genre: v })} />
                      <Input label="Runtime" value={project.runtime} onChange={(v) => updateProject(project.id, { runtime: v })} />
                      <Input label="Role" value={project.role} onChange={(v) => updateProject(project.id, { role: v })} />
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
                    <label className="block text-[10px] uppercase tracking-widest text-yellow-500 font-bold">Awards (One per line)</label>
                    <textarea 
                      className="w-full bg-zinc-800 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none min-h-[100px]"
                      value={project.awards.join('\n')}
                      onChange={(e) => updateProject(project.id, { awards: e.target.value.split('\n').filter(s => s.trim() !== '') })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] uppercase tracking-widest text-yellow-500 font-bold">Film Stills</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, (imgs) => updateProject(project.id, { stills: [...project.stills, ...imgs] }))} className="text-xs text-gray-500" />
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                      {project.stills.map((s, idx) => (
                        <div key={idx} className="relative group">
                          <img src={s} className="w-full aspect-square object-cover opacity-60 hover:opacity-100" />
                          <button 
                            onClick={() => updateProject(project.id, { stills: project.stills.filter((_, i) => i !== idx) })}
                            className="absolute top-1 right-1 bg-black/80 text-[8px] p-1 opacity-0 group-hover:opacity-100"
                          >
                            X
                          </button>
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
             <button onClick={addStaff} className="w-full py-4 border border-dashed border-yellow-500/20 hover:border-yellow-400/50 text-xs tracking-widest uppercase">
              + Add Credit
            </button>
            <div className="space-y-8">
              {data.staff.map((s) => (
                <div key={s.id} className="p-6 bg-zinc-900/40 border border-white/5 space-y-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <Input label="Year" value={s.year} onChange={(v) => updateStaffItem(s.id, { year: v })} />
                    </div>
                    <div className="col-span-6">
                      <Input label="Project Name" value={s.project} onChange={(v) => updateStaffItem(s.id, { project: v })} />
                    </div>
                    <div className="col-span-3">
                      <Input label="Role" value={s.role} onChange={(v) => updateStaffItem(s.id, { role: v })} />
                    </div>
                    <div className="col-span-1 text-right self-end pb-1">
                      <button onClick={() => deleteStaff(s.id)} className="text-red-500/50 hover:text-red-500 text-[10px] uppercase">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="space-y-12">
            <Section title="Export for Deployment">
              <div className="col-span-2 space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  브라우저에 저장된 수정 사항을 웹사이트에 영구적으로 반영하려면 아래의 데이터를 복사하여 <code className="text-yellow-400">constants.ts</code>의 <code className="text-yellow-400">INITIAL_DATA</code> 부분에 덮어쓰세요.
                </p>
                <button 
                  onClick={copyDataToClipboard}
                  className={`w-full py-4 border transition-all uppercase tracking-widest text-xs font-bold ${copySuccess ? 'bg-green-600 border-green-500 text-white' : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black'}`}
                >
                  {copySuccess ? 'Copied to Clipboard!' : 'Copy Deployment JSON'}
                </button>
                <div className="mt-8">
                  <label className="block text-[10px] uppercase tracking-widest text-yellow-500 mb-2">Raw Data (JSON)</label>
                  <textarea 
                    className="w-full bg-zinc-900 border border-white/10 p-4 text-[10px] font-mono focus:border-yellow-400 outline-none min-h-[400px]"
                    value={JSON.stringify(data, null, 2)}
                    readOnly
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`text-[10px] tracking-[0.2em] uppercase py-2 px-1 border-b-2 transition-all whitespace-nowrap ${active ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
  >
    {children}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-xs font-cinematic tracking-widest text-yellow-600 font-bold uppercase">{title}</h3>
    <div className="grid md:grid-cols-2 gap-6 p-8 bg-zinc-900/30 border border-white/5">
      {children}
    </div>
  </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">{label}</label>
    <input 
      className="w-full bg-zinc-800 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Textarea: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-[10px] uppercase tracking-widest text-yellow-500/70 font-bold">{label}</label>
    <textarea 
      className="w-full bg-zinc-800 border border-white/10 px-3 py-2 text-sm focus:border-yellow-400 outline-none transition-colors min-h-[200px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default AdminPage;
