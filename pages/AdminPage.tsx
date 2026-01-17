
import React, { useState } from 'react';
import { PortfolioData, Project, StaffHistory, Category } from '../types';
import { storageService } from '../storage';

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (urls: string[]) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => storageService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      callback(urls);
    } catch (err: any) {
      console.error("Cloud upload failed", err);
      alert(err.message || "이미지 업로드에 실패했습니다. Vercel Blob 설정을 확인하세요.");
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

  return (
    <div className="pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-white/10 pb-4">
          <div className="flex gap-8 overflow-x-auto pb-2 md:pb-0">
            <TabButton active={activeTab === 'CONTENT'} onClick={() => setActiveTab('CONTENT')}>Global Content</TabButton>
            <TabButton active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')}>Projects</TabButton>
            <TabButton active={activeTab === 'STAFF'} onClick={() => setActiveTab('STAFF')}>Staff</TabButton>
            <TabButton active={activeTab === 'SYSTEM'} onClick={() => setActiveTab('SYSTEM')}>Vercel Deployment</TabButton>
          </div>
          <div className="text-[10px] tracking-widest uppercase flex items-center gap-2">
            {isProcessing ? (
              <span className="text-yellow-500 animate-pulse">Communicating with Vercel API...</span>
            ) : (
              <span className="text-green-500">Cloud Status: Active</span>
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

        {activeTab === 'SYSTEM' && (
          <div className="space-y-12">
            <div className="p-8 bg-zinc-900/50 border border-white/5 space-y-6">
              <h3 className="text-xs tracking-widest uppercase text-yellow-500 font-bold">Vercel Backend Implementation Guide</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                이 앱은 브라우저 저장소를 사용하지 않으며, 모든 데이터는 Vercel Postgres와 Vercel Blob에 저장됩니다. 이를 위해 프로젝트에 아래의 API 라우트를 구성해야 합니다.
              </p>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] tracking-widest uppercase text-gray-300 mb-2 font-bold">1. Postgres API (api/portfolio/route.ts)</h4>
                  <pre className="bg-black p-4 text-[10px] font-mono text-yellow-500/80 overflow-x-auto border border-white/10">
{`import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  const { rows } = await sql\`SELECT data FROM portfolio WHERE id = 1\`;
  return NextResponse.json(rows[0]?.data || {});
}

export async function POST(req: Request) {
  const data = await req.json();
  await sql\`INSERT INTO portfolio (id, data) VALUES (1, \${JSON.stringify(data)})
           ON CONFLICT (id) DO UPDATE SET data = \${JSON.stringify(data)}\`;
  return NextResponse.json({ success: true });
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[10px] tracking-widest uppercase text-gray-300 mb-2 font-bold">2. Blob Upload API (api/upload/route.ts)</h4>
                  <pre className="bg-black p-4 text-[10px] font-mono text-yellow-500/80 overflow-x-auto border border-white/10">
{`import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const blob = await put(file.name, file, { access: 'public' });
  return NextResponse.json(blob);
}`}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-[10px] tracking-widest uppercase text-yellow-500">
                중요: Vercel Dashboard에서 Postgres와 Blob 스토리지를 활성화하고 환경 변수를 연결해야 합니다.
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
