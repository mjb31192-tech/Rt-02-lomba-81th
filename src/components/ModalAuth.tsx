import React, { useState, FormEvent } from 'react';
import { X, Lock, Unlock, User, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Account {
  username: string;
  password: string;
  nama: string;
  jabatan: string;
}

interface ModalAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { username: string; nama: string; jabatan: string }) => void;
  accounts: Account[];
  onSignUpSuccess: (newAcc: Account) => void;
}

export default function ModalAuth({ isOpen, onClose, onLoginSuccess, accounts, onSignUpSuccess }: ModalAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login Form States
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup Form States
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regJabatan, setRegJabatan] = useState('Koordinator Lapangan');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('Username dan password harus diisi.');
      return;
    }

    const found = accounts.find(
      (acc) => acc.username.toLowerCase() === loginUser.trim().toLowerCase() && acc.password === loginPass
    );

    if (found) {
      onLoginSuccess({
        username: found.username,
        nama: found.nama,
        jabatan: found.jabatan
      });
      // Reset forms
      setLoginUser('');
      setLoginPass('');
      onClose();
    } else {
      setLoginError('Username atau password salah.');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUser.trim() || !regPass.trim() || !regNama.trim()) {
      setRegError('Seluruh kolom pendaftaran harus diisi.');
      return;
    }

    if (regUser.trim().length < 3) {
      setRegError('Username minimal 3 karakter.');
      return;
    }

    const exists = accounts.some(
      (acc) => acc.username.toLowerCase() === regUser.trim().toLowerCase()
    );

    if (exists) {
      setRegError('Username sudah terdaftar. Silakan gunakan username lain.');
      return;
    }

    const newAcc: Account = {
      username: regUser.trim().toLowerCase(),
      password: regPass,
      nama: regNama.trim(),
      jabatan: regJabatan
    };

    onSignUpSuccess(newAcc);
    onLoginSuccess({
      username: newAcc.username,
      nama: newAcc.nama,
      jabatan: newAcc.jabatan
    });

    // Reset forms
    setRegUser('');
    setRegPass('');
    setRegNama('');
    setRegJabatan('Koordinator Lapangan');
    onClose();
  };

  const handleQuickLogin = (acc: Account) => {
    onLoginSuccess({
      username: acc.username,
      nama: acc.nama,
      jabatan: acc.jabatan
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-scale-up relative">
        
        {/* Decorative Top Bar */}
        <div className="bg-red-600 px-6 py-4 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <Unlock size={20} className="text-white shrink-0 animate-bounce" />
            <div>
              <h2 className="font-display font-extrabold text-sm uppercase tracking-wider">
                Autentikasi Pengurus Panitia
              </h2>
              <p className="text-[10px] text-red-100">
                Kelurahan Kedaung Baru &bull; HUT RI ke-81
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {/* Tab Selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'login' 
                  ? 'bg-white text-red-600 shadow-3xs' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Masuk Akun
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setRegError('');
              }}
              className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup' 
                  ? 'bg-white text-red-600 shadow-3xs' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-medium">
                  <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md shadow-red-100"
              >
                Masuk Sistem Pengurus
              </button>

              {/* Quick Login Section (Extremely Useful for Testing) */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  💡 Akses Cepat Pengurus LPJ & Panitia:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {accounts.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="text-left bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 p-2 rounded-xl transition-all group cursor-pointer"
                    >
                      <p className="text-[10px] font-bold text-gray-700 group-hover:text-red-700 leading-none truncate">
                        {acc.nama}
                      </p>
                      <p className="text-[8px] text-gray-400 group-hover:text-red-500/80 font-semibold mt-0.5 uppercase tracking-wide">
                        {acc.jabatan}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {regError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-medium">
                  <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pengurus
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Contoh: Ahmad"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Username Akun
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="Kombinasi huruf & angka"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Jabatan / Penanggung Jawab
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <select
                    value={regJabatan}
                    onChange={(e) => setRegJabatan(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 cursor-pointer appearance-none"
                  >
                    <option value="Ketua Panitia">Ketua Panitia</option>
                    <option value="Bendahara">Bendahara</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Ketua RT.002">Ketua RT.002</option>
                    <option value="Koordinator Lapangan">Koordinator Lapangan</option>
                    <option value="Humas & Dokumentasi">Humas & Dokumentasi</option>
                    <option value="Penanggung Jawab Lomba">Penanggung Jawab Lomba</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md shadow-red-100"
              >
                Daftar &amp; Masuk Sistem
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-[10px] text-gray-400 font-medium">
            Sistem pengaman panitia RT mencegah data tidak sengaja diubah oleh penonton/warga umum.
          </div>
        </div>
      </div>
    </div>
  );
}
