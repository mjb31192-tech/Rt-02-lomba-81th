import React, { useState, useEffect, FormEvent } from 'react';
import { 
  X, Lock, Unlock, User, Award, ShieldAlert, CheckCircle2, 
  Mail, Phone, Fingerprint, Timer, KeyRound, ArrowRight, Smartphone
} from 'lucide-react';
import { IuranKK } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Account {
  username: string;
  password: string;
  nama: string;
  jabatan: string;
}

interface ModalAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { 
    username: string; 
    nama: string; 
    jabatan: string;
    mewakili_kk?: string;
    sebagai_apa?: string;
    kk_id?: number;
  }) => void;
  accounts: Account[];
  onSignUpSuccess: (newAcc: Account) => void;
  iuranKKList?: IuranKK[];
}

export default function ModalAuth({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  accounts, 
  onSignUpSuccess,
  iuranKKList = []
}: ModalAuthProps) {
  // Main Navigation Mode
  const [mode, setMode] = useState<'warga' | 'panitia'>('warga');
  const [wargaTab, setWargaTab] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'nohp'>('email');

  // Warga Form States
  const [wargaNama, setWargaNama] = useState('');
  const [wargaEmail, setWargaEmail] = useState('');
  const [wargaPhone, setWargaPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // Perwakilan KK States
  const [mewakiliKkId, setMewakiliKkId] = useState<string>('');
  const [sebagaiApa, setSebagaiApa] = useState<string>('Kepala Keluarga');

  // Hidden Panitia Unlock States ("Sensor Sensitif" Gate)
  const [showPanitiaGate, setShowPanitiaGate] = useState(false);
  const [panitiaUnlocked, setPanitiaUnlocked] = useState(false);
  const [secretPasscode, setSecretPasscode] = useState('');
  const [gateError, setGateError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Active Panitia Login States (Visible only after unlocking)
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Panitia Signup States
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regJabatan, setRegJabatan] = useState('Koordinator Lapangan');
  const [regError, setRegError] = useState('');

  // Handle OTP timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle Biometric scanning simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning && scanProgress < 100) {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsScanning(false);
            setPanitiaUnlocked(true);
            setMode('panitia');
            setShowPanitiaGate(false);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    } else if (!isScanning && scanProgress < 100) {
      setScanProgress(0);
    }
    return () => clearInterval(timer);
  }, [isScanning, scanProgress]);

  // Warga Request OTP Handler
  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccessMsg('');

    const contactVal = loginMethod === 'email' ? wargaEmail : wargaPhone;
    if (!contactVal.trim()) {
      setOtpError(loginMethod === 'email' ? 'Harap masukkan alamat email.' : 'Harap masukkan nomor HP.');
      return;
    }

    if (wargaTab === 'signup' && !wargaNama.trim()) {
      setOtpError('Harap masukkan nama lengkap Anda.');
      return;
    }

    // Simulate sending OTP
    setOtpSent(true);
    setOtpTimer(60);
    setOtpSuccessMsg(`Kode OTP 4-Digit berhasil dikirim ke ${contactVal}. Silakan cek kotak masuk Anda.`);
  };

  // Warga Verify OTP & Complete Login/Register
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.trim().length !== 4) {
      setOtpError('Kode OTP harus terdiri dari 4 digit.');
      return;
    }

    const finalNama = wargaTab === 'signup' ? wargaNama.trim() : `Warga_${loginMethod === 'email' ? wargaEmail.split('@')[0] : wargaPhone.slice(-4)}`;
    
    const selectedKKItem = iuranKKList.find(item => item.id === parseInt(mewakiliKkId));
    const finalMewakiliKK = selectedKKItem ? selectedKKItem.nama_kk : '';

    onLoginSuccess({
      username: 'warga_' + Math.random().toString(36).substring(2, 9),
      nama: finalNama,
      jabatan: 'Warga',
      mewakili_kk: finalMewakiliKK,
      sebagai_apa: sebagaiApa,
      kk_id: selectedKKItem ? selectedKKItem.id : undefined
    });

    // Reset forms & close
    setWargaNama('');
    setWargaEmail('');
    setWargaPhone('');
    setMewakiliKkId('');
    setSebagaiApa('Kepala Keluarga');
    setOtpSent(false);
    setOtpCode('');
    onClose();
  };

  // Hidden Gate Passcode Submission
  const handleGatePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');

    if (secretPasscode === 'SuperPanitia') {
      setPanitiaUnlocked(true);
      setMode('panitia');
      setShowPanitiaGate(false);
    } else {
      setGateError('Sandi Pengurus tidak valid. Silakan coba lagi atau gunakan sensor biometrik.');
    }
  };

  // Panitia Login Submission
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
      // Reset
      setLoginUser('');
      setLoginPass('');
      onClose();
    } else {
      setLoginError('Username atau password pengurus salah.');
    }
  };

  // Panitia Register Submission
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
      setRegError('Username sudah terdaftar.');
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

    setRegUser('');
    setRegPass('');
    setRegNama('');
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 z-10"
          >
            {/* Decorative Top Banner */}
            <div className={`px-6 py-5 text-white relative transition-all duration-300 ${mode === 'panitia' ? 'bg-indigo-950' : 'bg-red-600'}`}>
              <button 
                type="button"
                onClick={onClose}
                className="absolute top-5 right-4 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-2.5">
                {mode === 'panitia' ? (
                  <Unlock size={20} className="text-yellow-400 shrink-0 animate-pulse" />
                ) : (
                  <User size={20} className="text-white shrink-0" />
                )}
                <div>
                  <h2 className="font-display font-extrabold text-sm uppercase tracking-wider leading-none">
                    {mode === 'panitia' ? '🔑 Panel Pengurus Panitia' : '🇮🇩 Portal Warga Kedaung Baru'}
                  </h2>
                  <p className="text-[10px] text-red-100 font-semibold uppercase tracking-widest mt-1">
                    {mode === 'panitia' ? 'Pengamanan LPJ & Kas RT 002/003' : 'HUT Republik Indonesia Ke-81'}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Body Container */}
            <div className="p-6">
              {showPanitiaGate ? (
                <div className="space-y-5 py-2">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-full bg-red-50 border border-red-100 text-red-500 mb-2">
                      <Fingerprint size={28} className="animate-pulse" />
                    </div>
                    <h4 className="font-display font-black text-gray-800 text-xs uppercase tracking-wider">
                      Autentikasi Sensor Sensitif
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                      Akses ini khusus pengurus panitia LPJ. Silakan tekan &amp; tahan tombol sidik jari untuk memindai biometrik atau masukkan sandi pengurus.
                    </p>
                  </div>

                  {/* Interactive Biometric Simulator Scanner */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <button
                      type="button"
                      onMouseDown={() => setIsScanning(true)}
                      onMouseUp={() => setIsScanning(false)}
                      onMouseLeave={() => setIsScanning(false)}
                      onTouchStart={() => setIsScanning(true)}
                      onTouchEnd={() => setIsScanning(false)}
                      className={`relative w-20 h-20 rounded-full border-3 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        isScanning 
                          ? 'bg-red-50 border-red-500 text-red-600 scale-105 shadow-lg shadow-red-100' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                      }`}
                    >
                      <Fingerprint size={32} />
                      {isScanning && (
                        <div className="absolute inset-0 rounded-full border-3 border-red-500 border-t-transparent animate-spin"></div>
                      )}
                    </button>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                      {isScanning ? `Memindai Sidik Jari... ${scanProgress}%` : 'Tekan & Tahan untuk Pindai'}
                    </span>
                  </div>

                  {/* Passcode Fallback Form */}
                  <form onSubmit={handleGatePasscodeSubmit} className="space-y-3 pt-3 border-t border-gray-100">
                    {gateError && (
                      <div className="text-[10px] font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-start gap-1">
                        <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                        <span>{gateError}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Atau Masukkan Sandi Pengurus
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input
                          type="password"
                          value={secretPasscode}
                          onChange={(e) => setSecretPasscode(e.target.value)}
                          placeholder="Masukkan Kode Keamanan Pengurus"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPanitiaGate(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Buka Panel
                      </button>
                    </div>
                  </form>
                </div>
              ) : mode === 'warga' ? (
                <div className="space-y-4">
                  {/* Tab Selector Warga: Masuk vs Daftar */}
                  <div className="flex bg-gray-100 rounded-xl p-1 mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWargaTab('login');
                        setOtpError('');
                        setOtpSuccessMsg('');
                        setOtpSent(false);
                      }}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                        wargaTab === 'login' 
                          ? 'bg-white text-red-600 shadow-3xs' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Masuk Warga
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWargaTab('signup');
                        setOtpError('');
                        setOtpSuccessMsg('');
                        setOtpSent(false);
                      }}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                        wargaTab === 'signup' 
                          ? 'bg-white text-red-600 shadow-3xs' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Daftar Warga Baru
                    </button>
                  </div>

                  {/* Status / Error Notifications */}
                  {otpError && (
                    <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-medium">
                      <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                      <span>{otpError}</span>
                    </div>
                  )}
                  {otpSuccessMsg && (
                    <div className="flex items-start gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs font-medium">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                      <span>{otpSuccessMsg}</span>
                    </div>
                  )}

                  {/* Step 1: Request OTP Form */}
                  {!otpSent ? (
                    <form onSubmit={handleRequestOTP} className="space-y-3.5">
                      {/* Select Contact Method: Email vs No. HP */}
                      <div className="flex items-center gap-4 py-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metode Masuk:</span>
                        <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 cursor-pointer">
                          <input 
                            type="radio" 
                            name="method" 
                            checked={loginMethod === 'email'} 
                            onChange={() => {
                              setLoginMethod('email');
                              setOtpError('');
                            }}
                            className="text-red-600 focus:ring-red-500 cursor-pointer text-sm"
                          />
                          <span>Email</span>
                        </label>
                        <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 cursor-pointer">
                          <input 
                            type="radio" 
                            name="method" 
                            checked={loginMethod === 'nohp'} 
                            onChange={() => {
                              setLoginMethod('nohp');
                              setOtpError('');
                            }}
                            className="text-red-600 focus:ring-red-500 cursor-pointer text-sm"
                          />
                          <span>Nomor HP</span>
                        </label>
                      </div>

                      {/* Citizen Name Field (Only for signup) */}
                      {wargaTab === 'signup' && (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Nama Lengkap Warga
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3 text-gray-400" size={15} />
                            <input
                              type="text"
                              required
                              value={wargaNama}
                              onChange={(e) => setWargaNama(e.target.value)}
                              placeholder="Masukkan nama lengkap Anda"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                            />
                          </div>
                        </div>
                      )}

                      {/* Contact Input Field */}
                      {loginMethod === 'email' ? (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Alamat Email Aktif
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 text-gray-400" size={15} />
                            <input
                              type="email"
                              required
                              value={wargaEmail}
                              onChange={(e) => setWargaEmail(e.target.value)}
                              placeholder="contoh: warga@gmail.com"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Nomor HP WhatsApp
                          </label>
                          <div className="relative">
                            <Smartphone className="absolute left-3.5 top-3 text-gray-400" size={15} />
                            <input
                              type="text"
                              required
                              value={wargaPhone}
                              onChange={(e) => setWargaPhone(e.target.value)}
                              placeholder="contoh: 08123456789"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                            />
                          </div>
                        </div>
                      )}

                      {/* Select Perwakilan KK & Hubungan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-dashed border-gray-100">
                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                            Mewakili Kepala KK <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={mewakiliKkId}
                            onChange={(e) => setMewakiliKkId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white font-medium transition-all"
                          >
                            <option value="">-- Pilih Kepala KK --</option>
                            {iuranKKList.map((kk) => (
                              <option key={kk.id} value={kk.id}>
                                {kk.nama_kk} ({kk.rt})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                            Hubungan Keluarga <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={sebagaiApa}
                            onChange={(e) => setSebagaiApa(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white font-medium transition-all"
                          >
                            <option value="Kepala Keluarga">Saya Sendiri (Kepala Keluarga)</option>
                            <option value="Istri">Istri</option>
                            <option value="Anak">Anak</option>
                            <option value="Orang Tua">Orang Tua</option>
                            <option value="Mertua">Mertua</option>
                            <option value="Kerabat / Saudara">Kerabat / Saudara</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md shadow-red-100 flex items-center justify-center gap-1.5"
                      >
                        <span>Minta Kode Keamanan OTP</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Verification Form */
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Masukkan 4-Digit OTP
                          </label>
                          {otpTimer > 0 ? (
                            <span className="text-[10px] text-gray-400 font-mono font-bold flex items-center gap-0.5">
                              <Timer size={11} className="animate-spin text-red-500" />
                              {otpTimer} Detik
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setOtpTimer(60);
                                setOtpSuccessMsg('Kode OTP baru telah dikirim ulang!');
                              }}
                              className="text-[10px] text-red-600 hover:underline font-bold"
                            >
                              Kirim Ulang OTP
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={4}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Masukkan 4 angka OTP (contoh: 1708)"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest text-red-600 placeholder-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                        />
                        <p className="text-[9px] text-gray-400 text-center mt-2">
                          💡 <em>Untuk kemudahan simulasi, Anda dapat memasukkan kode bebas/acak atau <strong>1708</strong>.</em>
                        </p>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md shadow-red-100"
                        >
                          Verifikasi &amp; Masuk
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Panitia Tabs */}
                  <div className="flex bg-indigo-50/50 rounded-xl p-1 mb-1 border border-indigo-100/50">
                    <button
                      type="button"
                      onClick={() => {
                        setWargaTab('login');
                        setLoginError('');
                      }}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                        wargaTab === 'login' 
                          ? 'bg-indigo-950 text-white shadow-3xs' 
                          : 'text-indigo-600 hover:text-indigo-900'
                      }`}
                    >
                      Masuk Pengurus
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWargaTab('signup');
                        setRegError('');
                      }}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                        wargaTab === 'signup' 
                          ? 'bg-indigo-950 text-white shadow-3xs' 
                          : 'text-indigo-600 hover:text-indigo-900'
                      }`}
                    >
                      Daftar Pengurus Baru
                    </button>
                  </div>

                  {wargaTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {loginError && (
                        <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-medium">
                          <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Username Pengurus
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="text"
                            value={loginUser}
                            onChange={(e) => setLoginUser(e.target.value)}
                            placeholder="Masukkan username"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="password"
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md"
                      >
                        Masuk Sistem Pengurus
                      </button>
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
                          <User className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="text"
                            value={regNama}
                            onChange={(e) => setRegNama(e.target.value)}
                            placeholder="Contoh: Ahmad"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Username Akun
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="text"
                            value={regUser}
                            onChange={(e) => setRegUser(e.target.value)}
                            placeholder="Kombinasi huruf & angka"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="password"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Jabatan / Penanggung Jawab
                        </label>
                        <div className="relative">
                          <Award className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <select
                            value={regJabatan}
                            onChange={(e) => setRegJabatan(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none font-medium"
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
                        className="w-full bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md"
                      >
                        Daftar &amp; Masuk Sistem
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMode('warga');
                      setPanitiaUnlocked(false);
                    }}
                    className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-[11px] py-2 rounded-xl text-center transition-all cursor-pointer"
                  >
                    &larr; Kembali ke Portal Warga
                  </button>
                </div>
              )}
            </div>

            {/* BOTTOM SENSITIVE MASKED AREA */}
            {!panitiaUnlocked && !showPanitiaGate && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Fingerprint size={14} className="animate-pulse text-gray-400" />
                  <span className="text-[9px] font-bold tracking-wider uppercase">Sistem Terenkripsi AES-256</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPanitiaGate(true);
                    setSecretPasscode('');
                    setGateError('');
                  }}
                  className="text-[10px] text-gray-500 hover:text-red-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all hover:underline"
                >
                  <Lock size={11} />
                  Akses Pengurus Panitia
                </button>
              </div>
            )}

            {panitiaUnlocked && mode === 'panitia' && (
              <div className="border-t border-indigo-100 bg-indigo-50/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-500">
                  <Unlock size={12} className="text-indigo-600" />
                  <span className="text-[9px] font-bold tracking-wider uppercase text-indigo-700">Akses Pengurus Dibuka</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPanitiaUnlocked(false);
                    setMode('warga');
                  }}
                  className="text-[10px] text-indigo-600 hover:text-red-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all hover:underline"
                >
                  Kunci Panel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
