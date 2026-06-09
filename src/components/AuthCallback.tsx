import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Parse Hash (Google Implicit flow passes response in URL hash)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1)); // remove '#'
        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (error) {
          setStatus('error');
          setErrorMsg(error);
          return;
        }

        if (!accessToken) {
          // If no hash, check query parameters just in case
          const queryParams = new URLSearchParams(window.location.search);
          const qToken = queryParams.get('access_token') || queryParams.get('code');
          if (!qToken) {
            setStatus('error');
            setErrorMsg('No token or code found in URL.');
            return;
          }
          handleSuccessToken(qToken);
          return;
        }

        handleSuccessToken(accessToken);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'An error occurred during authentication.');
      }
    };

    const handleSuccessToken = (token: string) => {
      setStatus('success');
      
      // Let the parent / opener window know
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, '*');
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        // Fallback: store token in sessionStorage and navigate
        sessionStorage.setItem('temp_google_token', token);
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold mb-2">Нэвтрэлтийг баталгаажуулж байна...</h2>
            <p className="text-gray-400 text-sm">Түр хүлээнэ үү...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Нэвтрэлт амжилттай!</h2>
            <p className="text-gray-400 text-sm">Цонх түр хугацааны дараа хаагдах болно.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Алдаа гарлаа</h2>
            <p className="text-red-400 text-sm mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate('/admin')}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              Буцах
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
