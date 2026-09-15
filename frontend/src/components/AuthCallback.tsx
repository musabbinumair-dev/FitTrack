import React, { useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';

export const AuthCallback: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth callback error:', error);
      window.location.href = '/login?error=' + encodeURIComponent(error);
      return;
    }

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.location.href = '/';
    } else {
      window.location.href = '/login?error=' + encodeURIComponent('No tokens received');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F3F3]">
      <div className="text-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;