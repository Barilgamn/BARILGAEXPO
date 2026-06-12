import React, { useState } from 'react';
import { Loader2, Trash2, UserPlus, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AdminUsersTab: React.FC = () => {
  const { adminEmails, addAdminUser, removeAdminUser, fetchAdminEmails } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Имэйл болон нууц үгээ бөглөнө үү.');
      return;
    }
    if (password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.');
      return;
    }
    setLoading(true);
    try {
      await addAdminUser(email, password);
      setSuccess(`"${email.trim().toLowerCase()}" админ хэрэглэгчээр амжилттай нэмэгдлээ.`);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err?.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (em: string) => {
    if (!window.confirm(`"${em}" хэрэглэгчийг админ жагсаалтаас хасах уу?`)) return;
    setError('');
    setRemovingEmail(em);
    try {
      await removeAdminUser(em);
    } catch (err: any) {
      setError(err?.message || 'Алдаа гарлаа');
    } finally {
      setRemovingEmail(null);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Одоогийн админ хэрэглэгчид
        </h3>
        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
          {adminEmails.map(em => (
            <div key={em} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-800 font-medium">{em}</span>
              {em.toLowerCase() === 'info@barilga.mn' ? (
                <span className="text-xs text-gray-400">Үндсэн (хасах боломжгүй)</span>
              ) : (
                <button
                  onClick={() => handleRemove(em)}
                  disabled={removingEmail === em}
                  className="text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                  aria-label="Хасах"
                >
                  {removingEmail === em ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}
          {adminEmails.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">Жагсаалт хоосон байна.</div>
          )}
        </div>
        <button
          onClick={() => fetchAdminEmails()}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Жагсаалтыг шинэчлэх
        </button>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Шинэ админ нэмэх
        </h3>
        <form onSubmit={handleAdd} className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Имэйл</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="newadmin@barilga.mn"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Нууц үг (хамгийн багадаа 6 тэмдэгт)</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Админ нэмэх
          </button>

          <p className="text-xs text-gray-500 pt-1">
            Шинэ хэрэглэгч имэйл, нууц үгээрээ "Нэвтрэх" хуудас руу орж нэвтэрнэ. Supabase төслийн
            тохиргооноос хамаараад имэйл баталгаажуулалт шаардлагатай байж болно.
          </p>
        </form>
      </div>
    </div>
  );
};
