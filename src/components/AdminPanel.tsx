import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Settings, Image, Menu, Users, Star, FileText, Calendar, Plus, Trash2, LogOut, Lock, Loader2, Shield, RefreshCw, Download, Save, MapPin, BarChart3, UserCog } from 'lucide-react';
import { BoothRequestsTab } from './BoothRequestsTab';
import { BoothInfoContent } from './BoothInfoContent';
import { AnalyticsTab } from './AnalyticsTab';
import { AdminUsersTab } from './AdminUsersTab';
import MDEditor from '@uiw/react-md-editor';
import { supabase } from '../supabase';
import { optimizeImage } from '../utils/image';

export const AdminPanel: React.FC = () => {
  const { data, updateData, saveDataToDb, isAuthenticated, userEmail, login, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  // Registrations state
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);
  const [regsError, setRegsError] = useState<string>('');
  const [regFilter, setRegFilter] = useState<'all' | 'visitor' | 'exhibitor'>('all');

  // Registrations татах функц
  const fetchRegistrations = async () => {
    setIsLoadingRegs(true);
    setRegsError('');
    const { data: regs, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setRegsError(error.message);
    } else {
      setRegistrations(regs || []);
    }
    setIsLoadingRegs(false);
  };

  // Realtime listener + эхний load
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchRegistrations();

    const channel = supabase
      .channel('registrations_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchRegistrations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Энэ бүртгэлийг устгах уу? (Delete registration?)')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) alert("Устгахад алдаа гарлаа: " + error.message);
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert("Бүртгэл одоогоор байхгүй байна.");
      return;
    }
    
    const headers = ['ID', 'Type', 'Name', 'Phone', 'Email', 'Organization', 'Area size', 'Request details', 'Created date'];
    
    const rows = registrations.map(reg => {
      const dateStr = reg.created_at ? new Date(reg.created_at).toLocaleString('mn-MN') : '';
      return [
        reg.id,
        reg.type === 'visitor' ? 'Visitor (Үзэгч)' : 'Exhibitor (Оролцогч)',
        `"${(reg.name || '').replace(/"/g, '""')}"`,
        `"${(reg.phone || '').replace(/"/g, '""')}"`,
        `"${(reg.email || '').replace(/"/g, '""')}"`,
        `"${(reg.org || '').replace(/"/g, '""')}"`,
        reg.area ? `"${reg.area} m²"` : '',
        `"${(reg.req || '').replace(/"/g, '""')}"`,
        dateStr
      ];
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `barilgaexpo_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [loginEmail, setLoginEmail] = useState('info@barilga.mn');
  const [loginPassword, setLoginPassword] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Имэйл болон нууц үгээ оруулна уу.');
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Нэвтрэх явцад алдаа гарлаа.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
        <div className="absolute inset-0 bg-blueprint opacity-10 pointer-events-none" />
        
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            
            <h1 className="font-heading text-2xl font-bold mb-2">УДИРДЛАГЫН СИСТЕМ</h1>
            <p className="text-gray-400 text-sm mb-8">Сайтын мэдээлэл засварлах удирдах хэсэгт нэвтрэх</p>

            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4 mb-6 leading-relaxed">
                {error}
              </div>
            )}

            {isVerifying ? (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-sm text-gray-400">Нэвтрэлтийг баталгаажуулж байна...</p>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="w-full space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Имэйл хаяг</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="info@barilga.mn"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Нууц үг</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Нэвтрэх
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 w-full text-center">
              <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
                &larr; Сайтын нүүр хуудас руу буцах
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'analytics', label: 'Статистик (Analytics)', icon: <BarChart3 size={18} /> },
    { id: 'registrations', label: 'Бүртгэлүүд (Registrations)', icon: <Users size={18} /> },
    { id: 'booth_requests', label: 'Талбайн захиалга (Booth Requests)', icon: <MapPin size={18} /> },
    { id: 'booth_info', label: 'Талбайн мэдээлэл (Booth Info)', icon: <MapPin size={18} /> },
    { id: 'logo', label: 'Website Logo', icon: <Image size={18} /> },
    { id: 'menus', label: 'Menus', icon: <Menu size={18} /> },
    { id: 'organizers', label: 'Organizers', icon: <Users size={18} /> },
    { id: 'sponsors', label: 'Sponsors', icon: <Star size={18} /> },
    { id: 'news', label: 'News', icon: <FileText size={18} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> },
    { id: 'program', label: 'Program', icon: <Calendar size={18} /> },
    { id: 'contact', label: 'Contact Info', icon: <Settings size={18} /> },
    { id: 'admins', label: 'Админ хэрэглэгчид', icon: <UserCog size={18} /> },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ logoUrl: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ contact: { ...data.contact, [e.target.name]: e.target.value } });
  };

  const addMenu = () => {
    const newMenu = { id: Date.now().toString(), labelMn: 'ШИНЭ ЦЭС', labelEn: 'NEW MENU', path: '/#' };
    updateData({ menus: [...data.menus, newMenu] });
  };

  const updateMenu = (id: string, field: string, value: string) => {
    const newMenus = data.menus.map(m => m.id === id ? { ...m, [field]: value } : m);
    updateData({ menus: newMenus });
  };

  const removeMenu = (id: string) => {
    updateData({ menus: data.menus.filter(m => m.id !== id) });
  };

  const addOrganizer = () => {
    const newOrg = { id: Date.now().toString(), name: 'Нэр', logo: 'https://via.placeholder.com/150' };
    updateData({ organizers: [...data.organizers, newOrg] });
  };

  const updateOrganizer = (id: string, field: string, value: string) => {
    const updated = data.organizers.map(o => o.id === id ? { ...o, [field]: value } : o);
    updateData({ organizers: updated });
  };

  const removeOrganizer = (id: string) => {
    updateData({ organizers: data.organizers.filter(o => o.id !== id) });
  };

  const addSponsor = () => {
    const newSponsor = { id: Date.now().toString(), name: 'Нэр', logo: 'https://via.placeholder.com/150', type: 'sponsor' as const };
    updateData({ sponsors: [...data.sponsors, newSponsor] });
  };

  const updateSponsor = (id: string, field: string, value: string) => {
    const updated = data.sponsors.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateData({ sponsors: updated });
  };

  const removeSponsor = (id: string) => {
    updateData({ sponsors: data.sponsors.filter(s => s.id !== id) });
  };

  const addGalleryImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      updateData({ gallery: [url, ...data.gallery] });
    }
  };

  const removeGalleryImage = (idx: number) => {
    const updated = [...data.gallery];
    updated.splice(idx, 1);
    updateData({ gallery: updated });
  };

  const [newsEditId, setNewsEditId] = useState<number | null>(null);
  
  const addNews = () => {
    const newNews = {
      id: Date.now(),
      title: 'Шинэ мэдээ',
      description: 'Мэдээний товч',
      content: 'Мэдээний дэлгэрэнгүй',
      date: new Date().toLocaleDateString('en-CA').replace(/-/g, '.'),
      image: 'https://via.placeholder.com/400x300',
      link: '#'
    };
    updateData({ news: [newNews, ...data.news] });
    setNewsEditId(newNews.id);
  };

  const updateNews = (id: number, field: string, value: string) => {
    updateData(prev => ({ news: prev.news.map(n => n.id === id ? { ...n, [field]: value } : n) }));
  };

  const removeNews = (id: number) => {
    updateData({ news: data.news.filter(n => n.id !== id) });
  };

  const activeNews = data.news.find(n => n.id === newsEditId);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const uploadFileToMedia = async (file: File, folder: string, name: string | number) => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${name}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (uploadErr) throw uploadErr;
    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(path);
    return publicUrlData.publicUrl;
  };

  const uploadNewsImage = async (file: File, newsId: number) => {
    setUploadError('');
    setUploadingImage(true);
    try {
      const url = await uploadFileToMedia(file, 'news', newsId);
      updateNews(newsId, 'image', url);
    } catch (err: any) {
      setUploadError(err.message || 'Зураг байршуулахад алдаа гарлаа');
    } finally {
      setUploadingImage(false);
    }
  };

  const [uploadingGallery, setUploadingGallery] = useState(false);

  const uploadGalleryImages = async (files: FileList) => {
    setUploadError('');
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFileToMedia(file, 'gallery', Date.now());
        urls.push(url);
      }
      updateData(prev => ({ gallery: [...urls, ...prev.gallery] }));
    } catch (err: any) {
      setUploadError(err.message || 'Зураг байршуулахад алдаа гарлаа');
    } finally {
      setUploadingGallery(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-8 p-2 border-b border-white/20">Admin Panel</h2>
        <div className="space-y-2 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setNewsEditId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-gray-300'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-center bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all text-sm font-semibold border border-red-500/10 hover:border-red-500"
          >
            <LogOut size={16} />
            Гарах (Log Out)
          </button>
          <a href="/" className="px-4 py-2.5 text-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-semibold">
            Сайт руу очих
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className={`${activeTab === 'booth_info' || activeTab === 'booth_requests' || activeTab === 'analytics' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl font-bold capitalize text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className="text-xs text-gray-500 mt-1">Одоогийн хэрэглэгч: {userEmail}</p>
            </div>
            
            {/* Save Action Button */}
            {activeTab !== 'registrations' && activeTab !== 'booth_requests' && activeTab !== 'analytics' && activeTab !== 'admins' && (
              <button
                onClick={async () => {
                  if (isSyncing) return;
                  setIsSyncing(true);
                  try {
                    // Explicitly invoke saveDataToDb to write current state to Cloud Firestore
                    await saveDataToDb();
                    // Short timeout for highly satisfying microinteraction feedback
                    await new Promise(resolve => setTimeout(resolve, 800));
                    alert("Мэдээлэл баазад амжилттай хадгалагдлаа! Нүүр хуудасны мэдээлэл шинэчлэгдсэн. (Data saved to cloud/homepage successfully!)");
                  } catch(e) {
                    console.error(e);
                    alert("Хадгалахад алдаа гарлаа: " + String(e));
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold text-xs shadow-md cursor-pointer select-none active:scale-[0.98]"
              >
                <Save className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                {isSyncing ? "Хадгалж байна..." : "ХАДГАЛАХ"}
              </button>
            )}
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsTab />
          )}

          {/* Admin Users Tab */}
          {activeTab === 'admins' && (
            <AdminUsersTab />
          )}

          {/* Booth Requests Tab */}
          {activeTab === 'booth_requests' && (
            <BoothRequestsTab />
          )}

          {/* Booth Info Tab */}
          {activeTab === 'booth_info' && (
            <BoothInfoContent />
          )}

          {/* Registrations Tab */}
          {activeTab === 'registrations' && (
            <div className="space-y-6">
              {/* Header Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs text-blue-700 uppercase tracking-widest font-bold">Нийт бүртгэл (Total)</span>
                  <span className="text-3xl font-black text-blue-900 mt-2">{registrations.length}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100/50 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs text-emerald-700 uppercase tracking-widest font-bold">Үзэгчид (Visitors)</span>
                  <span className="text-3xl font-black text-emerald-900 mt-2">
                    {registrations.filter(r => r.type === 'visitor').length}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-100/50 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-xs text-amber-700 uppercase tracking-widest font-bold">Оролцогчид (Exhibitors)</span>
                  <span className="text-3xl font-black text-amber-900 mt-2">
                    {registrations.filter(r => r.type === 'exhibitor').length}
                  </span>
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div className="flex bg-gray-200/50 p-1 rounded-xl">
                  <button 
                    onClick={() => setRegFilter('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${regFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Бүгд ({registrations.length})
                  </button>
                  <button 
                    onClick={() => setRegFilter('visitor')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${regFilter === 'visitor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Үзэгчид ({registrations.filter(r => r.type === 'visitor').length})
                  </button>
                  <button 
                    onClick={() => setRegFilter('exhibitor')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${regFilter === 'exhibitor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Оролцогчид ({registrations.filter(r => r.type === 'exhibitor').length})
                  </button>
                </div>

                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-slate-900 font-bold hover:bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Download size={14} />
                  Excel (CSV) Татах
                </button>
              </div>

              {/* List */}
              {regsError ? (
                <div className="bg-red-50 border border-red-155 text-red-800 p-6 rounded-2xl flex flex-col items-center text-center gap-2">
                  <Shield className="w-10 h-10 text-red-500 mb-1" />
                  <span className="font-heading font-black text-sm text-red-900">Бүртгэл уншихад алдаа гарлаа (Error reading registrations)</span>
                  <p className="text-xs max-w-lg text-red-700">Файрбейз системтэй холбогдож бүртгэлийг уншихад дараах тохиргооны эсвэл хандах эрхийн алдаа заалаа:</p>
                  <code className="text-[11px] font-mono select-all bg-red-100/60 text-red-900 px-3 py-2 rounded-xl border border-red-200 w-full max-w-xl break-all mt-1">{regsError}</code>
                  <span className="text-[10px] text-red-600 mt-2 font-medium">Please verify Firebase settings, security rules, or database permissions.</span>
                </div>
              ) : isLoadingRegs ? (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <span className="text-sm text-gray-500">Уншиж байна...</span>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Одоогоор ямар нэгэн хэрэглэгчийн бүртгэл байхгүй байна.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations
                    .filter(reg => regFilter === 'all' || reg.type === regFilter)
                    .map(reg => {
                      const dateStr = reg.created_at ? new Date(reg.created_at).toLocaleString('mn-MN') : '';
                      
                      return (
                        <div key={reg.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all shadow-sm flex flex-col md:flex-row justify-between gap-4 bg-white">
                          <div className="space-y-3 flex-1">
                            {/* Badges */}
                            <div className="flex items-center gap-2">
                              {reg.type === 'visitor' ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-emerald-100">Үзэгч (Visitor)</span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-amber-100">Оролцогч (Exhibitor)</span>
                              )}
                              <span className="text-gray-400 font-mono text-[10px]">{dateStr}</span>
                            </div>

                            {/* Main Info */}
                            <div>
                              <h3 className="text-md font-bold text-gray-900">{reg.name}</h3>
                              <p className="text-sm text-gray-600 font-mono mt-1">Утас: {reg.phone}</p>
                              {reg.email && <p className="text-sm text-gray-600 font-mono">Имэйл: {reg.email}</p>}
                            </div>

                            {/* Exhibitor Specific */}
                            {reg.type === 'exhibitor' && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-700 space-y-1 mt-2">
                                <p><strong className="text-gray-900">Байгууллага:</strong> {reg.org}</p>
                                <p><strong className="text-gray-900">Сонгосон талбай:</strong> {reg.area} м²</p>
                                {reg.req && <p><strong className="text-gray-900">Хүсэлт:</strong> {reg.req}</p>}
                              </div>
                            )}
                          </div>

                          <div className="flex items-start justify-end">
                            <button 
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0 cursor-pointer"
                              title="Устгах"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Logo Tab */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Logo URL</label>
                <input
                  type="text"
                  value={data.logoUrl}
                  onChange={handleLogoChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="p-4 bg-gray-100 rounded-xl inline-block mt-4">
                <img src={data.logoUrl} alt="Logo Preview" className="h-16 object-contain" />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(data.contact).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={(data.contact as any)[key]}
                    onChange={handleContactChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Menus Tab */}
          {activeTab === 'menus' && (
            <div>
              <button onClick={addMenu} className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus size={18} /> Add Menu
              </button>
              <div className="space-y-4">
                {data.menus.map(menu => (
                  <div key={menu.id} className="flex flex-wrap md:flex-nowrap gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <input type="text" value={menu.labelMn} onChange={e => updateMenu(menu.id, 'labelMn', e.target.value)} placeholder="MN Label" className="flex-1 border border-gray-300 rounded px-3 py-2 min-w-[150px]" />
                    <input type="text" value={menu.labelEn} onChange={e => updateMenu(menu.id, 'labelEn', e.target.value)} placeholder="EN Label" className="flex-1 border border-gray-300 rounded px-3 py-2 min-w-[150px]" />
                    <input type="text" value={menu.path} onChange={e => updateMenu(menu.id, 'path', e.target.value)} placeholder="URL Path" className="flex-1 border border-gray-300 rounded px-3 py-2 min-w-[150px]" />
                    <button onClick={() => removeMenu(menu.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizers Tab */}
          {activeTab === 'organizers' && (
            <div>
              <button onClick={addOrganizer} className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus size={18} /> Add Organizer
              </button>
              <div className="space-y-4">
                {data.organizers.map(org => (
                  <div key={org.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <img src={org.logo} alt="org" className="w-16 h-16 object-contain bg-white border border-gray-200 rounded p-1" />
                    <div className="flex-1 space-y-2">
                      <input type="text" value={org.name} onChange={e => updateOrganizer(org.id, 'name', e.target.value)} placeholder="Name" className="w-full border border-gray-300 rounded px-3 py-2" />
                      <input type="text" value={org.logo} onChange={e => updateOrganizer(org.id, 'logo', e.target.value)} placeholder="Logo URL" className="w-full border border-gray-300 rounded px-3 py-2" />
                      <input type="text" value={org.url || ''} onChange={e => updateOrganizer(org.id, 'url', e.target.value)} placeholder="Вэбсайтын линк (https://...)" className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <button onClick={() => removeOrganizer(org.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors Tab */}
          {activeTab === 'sponsors' && (
            <div>
              <button onClick={addSponsor} className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus size={18} /> Add Sponsor
              </button>
              <div className="space-y-4">
                {data.sponsors.map(sponsor => (
                  <div key={sponsor.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <img src={sponsor.logo} alt="sponsor" className="w-16 h-16 object-contain bg-white border border-gray-200 rounded p-1" />
                    <div className="flex-1 space-y-2">
                      <input type="text" value={sponsor.name} onChange={e => updateSponsor(sponsor.id, 'name', e.target.value)} placeholder="Name" className="w-full border border-gray-300 rounded px-3 py-2" />
                      <input type="text" value={sponsor.logo} onChange={e => updateSponsor(sponsor.id, 'logo', e.target.value)} placeholder="Logo URL" className="w-full border border-gray-300 rounded px-3 py-2" />
                      <select value={sponsor.type} onChange={e => updateSponsor(sponsor.id, 'type', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                        <option value="main">Ерөнхий ивээн тэтгэгч (Main Sponsor)</option>
                        <option value="sponsor">Ивээн тэтгэгч (Sponsor)</option>
                        <option value="supporter">Дэмжигч (Supporter)</option>
                      </select>
                    </div>
                    <button onClick={() => removeSponsor(sponsor.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <button onClick={addGalleryImage} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  <Plus size={18} /> Add Image URL
                </button>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 text-sm font-medium">
                  {uploadingGallery ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                  {uploadingGallery ? 'Байршуулж байна...' : 'Зураг upload хийх'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadingGallery}
                    onChange={e => {
                      const files = e.target.files;
                      if (files && files.length > 0) uploadGalleryImages(files);
                      e.target.value = '';
                    }}
                  />
                </label>
                {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.gallery.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                    <img src={optimizeImage(img, 300)} alt="gallery" className="w-full h-full object-cover" loading="lazy" />
                    <button onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div>
              {newsEditId === null ? (
                <>
                  <button onClick={addNews} className="mb-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Plus size={18} /> Create News
                  </button>
                  <div className="space-y-4">
                    {data.news.map(news => (
                      <div key={news.id} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <img src={news.image} alt="news" className="w-24 h-20 object-cover rounded bg-white border border-gray-200" />
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{news.title}</h3>
                          <p className="text-sm text-gray-500">{news.date}</p>
                        </div>
                        <button onClick={() => setNewsEditId(news.id)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          Edit
                        </button>
                        <button onClick={() => removeNews(news.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                </>
              ) : activeNews && (
                <div className="space-y-6">
                  <button onClick={() => setNewsEditId(null)} className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to News List</button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input type="text" value={activeNews.title} onChange={e => updateNews(activeNews.id, 'title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input type="text" value={activeNews.date} onChange={e => updateNews(activeNews.id, 'date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
                    <div className="flex items-start gap-4">
                      {activeNews.image && (
                        <img src={activeNews.image} alt="preview" className="w-32 h-24 object-cover rounded-lg border border-gray-200 bg-white" />
                      )}
                      <div className="flex-1 space-y-2">
                        <input type="text" value={activeNews.image} onChange={e => updateNews(activeNews.id, 'image', e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 text-sm font-medium">
                          {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
                          {uploadingImage ? 'Байршуулж байна...' : 'Зургийн файл оруулах'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) uploadNewsImage(file, activeNews.id);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                    <textarea value={activeNews.description} onChange={e => updateNews(activeNews.id, 'description', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 h-20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Content (Markdown with support for images via URL)</label>
                    <div data-color-mode="light">
                      <MDEditor
                        value={activeNews.content}
                        onChange={(val) => updateNews(activeNews.id, 'content', val || '')}
                        height={400}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Program Tab */}
          {activeTab === 'program' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                 <h2 className="text-lg font-bold">Programs</h2>
                 <button onClick={() => {
                   const newDay = { id: Date.now().toString(), day: 'Day X', date: '2026-09-11', events: [] };
                   updateData({ program: [...data.program, newDay] });
                 }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                   <Plus size={18} /> Add Day
                 </button>
              </div>
              <div className="space-y-8">
                {data.program.map(prog => (
                  <div key={prog.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <div className="flex gap-4 mb-4 items-center">
                      <input type="text" value={prog.day} onChange={e => {
                        const newProg = data.program.map(p => p.id === prog.id ? {...p, day: e.target.value} : p);
                        updateData({ program: newProg });
                      }} placeholder="Day Title (e.g. Day 1)" className="font-bold border border-gray-300 rounded px-3 py-2 w-1/3" />
                      <input type="text" value={prog.date} onChange={e => {
                        const newProg = data.program.map(p => p.id === prog.id ? {...p, date: e.target.value} : p);
                        updateData({ program: newProg });
                      }} placeholder="Date" className="border border-gray-300 rounded px-3 py-2 w-1/3" />
                      <button onClick={() => {
                        updateData({ program: data.program.filter(p => p.id !== prog.id) });
                      }} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
                    </div>

                    <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                      <button onClick={() => {
                        const newEvent = { time: '10:00', title: 'New Event', desc: '', loc: 'Main Stage' };
                        const newProg = data.program.map(p => p.id === prog.id ? {...p, events: [...p.events, newEvent]} : p);
                        updateData({ program: newProg });
                      }} className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-300 text-sm">
                        <Plus size={14} /> Add Event
                      </button>

                      {prog.events.map((ev, idx) => (
                        <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-white p-4 border border-gray-200 rounded shadow-sm">
                           <input type="text" value={ev.time} onChange={e => {
                             const newEvents = [...prog.events]; newEvents[idx].time = e.target.value;
                             const newProg = data.program.map(p => p.id === prog.id ? {...p, events: newEvents} : p);
                             updateData({ program: newProg });
                           }} placeholder="Time" className="w-24 border border-gray-300 rounded px-2 py-1 text-sm" />
                           <div className="flex-1 space-y-2">
                             <input type="text" value={ev.title} onChange={e => {
                               const newEvents = [...prog.events]; newEvents[idx].title = e.target.value;
                               const newProg = data.program.map(p => p.id === prog.id ? {...p, events: newEvents} : p);
                               updateData({ program: newProg });
                             }} placeholder="Title" className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-bold" />
                             <input type="text" value={ev.desc} onChange={e => {
                               const newEvents = [...prog.events]; newEvents[idx].desc = e.target.value;
                               const newProg = data.program.map(p => p.id === prog.id ? {...p, events: newEvents} : p);
                               updateData({ program: newProg });
                             }} placeholder="Description" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                             <input type="text" value={ev.loc} onChange={e => {
                               const newEvents = [...prog.events]; newEvents[idx].loc = e.target.value;
                               const newProg = data.program.map(p => p.id === prog.id ? {...p, events: newEvents} : p);
                               updateData({ program: newProg });
                             }} placeholder="Location" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                           </div>
                           <button onClick={() => {
                             const newEvents = prog.events.filter((_, i) => i !== idx);
                             const newProg = data.program.map(p => p.id === prog.id ? {...p, events: newEvents} : p);
                             updateData({ program: newProg });
                           }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Save Action Bar */}
          {activeTab !== 'registrations' && activeTab !== 'booth_requests' && activeTab !== 'analytics' && activeTab !== 'admins' && (
            <div className="mt-8 pt-6 border-t border-gray-150 flex justify-end">
              <button
                onClick={async () => {
                  if (isSyncing) return;
                  setIsSyncing(true);
                  try {
                    await saveDataToDb();
                    await new Promise(resolve => setTimeout(resolve, 800));
                    alert("Мэдээлэл баазад амжилттай хадгалагдлаа! Нүүр хуудасны мэдээлэл шууд солигдсон байна. (Data saved to cloud/homepage successfully!)");
                  } catch(e) {
                    console.error(e);
                    alert("Хадгалахад алдаа гарлаа: " + String(e));
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-650 active:scale-[0.98] text-white rounded-xl transition-all font-bold text-sm shadow-md cursor-pointer select-none"
              >
                <Save className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                {isSyncing ? "Хадгалж байна..." : "ХАДГАЛАХ"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
