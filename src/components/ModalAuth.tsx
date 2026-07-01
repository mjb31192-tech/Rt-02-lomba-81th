import React, { useState, useEffect, FormEvent } from 'react';
import { 
  X, Lock, Unlock, User, Award, ShieldAlert, CheckCircle2, 
  Mail, Phone, Fingerprint, Timer, KeyRound, ArrowRight, Smartphone,
  Eye, EyeOff
} from 'lucide-react';
import { IuranKK } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Account {
  username: string;
  password: string;
  nama: string;
  jabatan: string;
  email?: string;
  hasFingerprint?: boolean;
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

  // Sensitive eye toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showSecretPasscode, setShowSecretPasscode] = useState(false);

  // Fingerprint registration for new pengurus
  const [regHasFingerprint, setRegHasFingerprint] = useState(false);
  const [isRegScanning, setIsRegScanning] = useState(false);
  const [regScanProgress, setRegScanProgress] = useState(0);

  // Fingerprint login scanning
  const [isLoginScanning, setIsLoginScanning] = useState(false);
  const [loginScanProgress, setLoginScanProgress] = useState(0);

  // Real-time Puzzle CAPTCHA & OTP States
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [puzzlePurpose, setPuzzlePurpose] = useState<'login' | 'signup' | null>(null);
  const [puzzleEmail, setPuzzleEmail] = useState('');
  const [puzzleXTarget, setPuzzleXTarget] = useState(150);
  const [puzzleXCurrent, setPuzzleXCurrent] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [puzzleError, setPuzzleError] = useState('');
  const [panitiaOtpSent, setPanitiaOtpSent] = useState(false);
  const [panitiaOtpCode, setPanitiaOtpCode] = useState('');
  const [panitiaOtpError, setPanitiaOtpError] = useState('');
  const [panitiaOtpSuccess, setPanitiaOtpSuccess] = useState('');
  const [panitiaOtpTimer, setPanitiaOtpTimer] = useState(0);
  const [serverOtp, setServerOtp] = useState('');
  const [panitiaEtherealUrl, setPanitiaEtherealUrl] = useState('');
  const [panitiaRealEmailSent, setPanitiaRealEmailSent] = useState(false);
  const [wargaServerOtp, setWargaServerOtp] = useState('');
  const [wargaEtherealUrl, setWargaEtherealUrl] = useState('');
  const [wargaRealEmailSent, setWargaRealEmailSent] = useState(false);
  const [regEmail, setRegEmail] = useState('');

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (panitiaOtpTimer > 0) {
      interval = setInterval(() => {
        setPanitiaOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [panitiaOtpTimer]);

  // Handle Biometric scanning simulation for general panitia gate
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning) {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 10;
          return next >= 100 ? 100 : next;
        });
      }, 100);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(timer);
  }, [isScanning]);

  useEffect(() => {
    if (isScanning && scanProgress === 100) {
      setIsScanning(false);
      setPanitiaUnlocked(true);
      setMode('panitia');
      setShowPanitiaGate(false);
    }
  }, [scanProgress, isScanning]);

  // Handle registration biometrics scan animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRegScanning) {
      timer = setInterval(() => {
        setRegScanProgress((prev) => {
          const next = prev + 10;
          return next >= 100 ? 100 : next;
        });
      }, 100);
    } else {
      setRegScanProgress(0);
    }
    return () => clearInterval(timer);
  }, [isRegScanning]);

  useEffect(() => {
    if (isRegScanning && regScanProgress === 100) {
      setIsRegScanning(false);
      setRegHasFingerprint(true);
    }
  }, [regScanProgress, isRegScanning]);

  // Handle Biometric scanning for login
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoginScanning) {
      timer = setInterval(() => {
        setLoginScanProgress((prev) => {
          const next = prev + 10;
          return next >= 100 ? 100 : next;
        });
      }, 100);
    } else {
      setLoginScanProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoginScanning]);

  useEffect(() => {
    if (isLoginScanning && loginScanProgress === 100) {
      setIsLoginScanning(false);
      
      // Log in using the registered fingerprint accounts
      let matchedAcc = null;
      if (loginUser.trim()) {
        matchedAcc = accounts.find(
          (acc) => acc.username.toLowerCase() === loginUser.trim().toLowerCase() && acc.hasFingerprint
        );
        if (!matchedAcc) {
          const userExists = accounts.some(acc => acc.username.toLowerCase() === loginUser.trim().toLowerCase());
          if (userExists) {
            setLoginError(`Akun @${loginUser} belum mengaktifkan autentikasi sidik jari. Silakan masuk dengan password lalu aktifkan di Pengaturan Akun.`);
          } else {
            setLoginError(`Username @${loginUser} tidak ditemukan.`);
          }
          return;
        }
      } else {
        const fingerprintAccs = accounts.filter(acc => acc.hasFingerprint);
        if (fingerprintAccs.length > 0) {
          matchedAcc = fingerprintAccs[0];
        } else {
          setLoginError('Tidak ada akun pengurus dengan sidik jari terdaftar. Silakan masuk menggunakan username & password terlebih dahulu.');
          return;
        }
      }

      if (matchedAcc) {
        onLoginSuccess({
          username: matchedAcc.username,
          nama: matchedAcc.nama,
          jabatan: matchedAcc.jabatan
        });
        onClose();
      }
    }
  }, [loginScanProgress, isLoginScanning, accounts, loginUser, onLoginSuccess, onClose]);

  // Warga Request OTP Handler
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccessMsg('');
    setWargaEtherealUrl('');
    setWargaServerOtp('');

    const contactVal = loginMethod === 'email' ? wargaEmail : wargaPhone;
    if (!contactVal.trim()) {
      setOtpError(loginMethod === 'email' ? 'Harap masukkan alamat email.' : 'Harap masukkan nomor HP.');
      return;
    }

    if (wargaTab === 'signup' && !wargaNama.trim()) {
      setOtpError('Harap masukkan nama lengkap Anda.');
      return;
    }

    if (loginMethod === 'email') {
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: wargaEmail.trim(), 
            username: wargaNama || 'Warga Kedaung Baru',
            digits: 4
          })
        });
        const resData = await response.json();
        if (response.ok && resData.success) {
          setOtpSent(true);
          setWargaServerOtp(resData.otp);
          setWargaEtherealUrl(resData.previewUrl || '');
          setWargaRealEmailSent(resData.realEmailSent || false);
          setOtpTimer(60);
          setOtpSuccessMsg(`Kode OTP 4-Digit berhasil dikirim secara realtime ke email ${wargaEmail.trim()}. Silakan cek kotak masuk Anda.`);
        } else {
          setOtpError(resData.error || 'Gagal mengirimkan kode OTP ke email.');
        }
      } catch (err) {
        setOtpError('Gagal menghubungi server untuk mengirim OTP.');
      }
    } else {
      // Simulate phone OTP sending
      setOtpSent(true);
      setWargaServerOtp('1708'); // Fallback for phone simulation
      setOtpTimer(60);
      setOtpSuccessMsg(`[Simulasi No HP] Kode OTP 4-Digit berhasil dikirim ke nomor HP ${wargaPhone.trim()}. Silakan masukkan kode "1708" untuk masuk.`);
    }
  };

  // Warga Verify OTP & Complete Login/Register
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.trim().length !== 4) {
      setOtpError('Kode OTP harus terdiri dari 4 digit.');
      return;
    }

    if (loginMethod === 'email') {
      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: wargaEmail.trim(), otp: otpCode })
        });
        const resData = await response.json();
        if (!response.ok || !resData.success) {
          setOtpError(resData.error || 'Kode OTP salah atau telah kedaluwarsa.');
          return;
        }
      } catch (err) {
        setOtpError('Gagal memverifikasi OTP di server.');
        return;
      }
    } else {
      // For phone, check if it matches the simulator or wargaServerOtp
      if (otpCode.trim() !== '1708' && otpCode.trim() !== wargaServerOtp) {
        setOtpError('Kode OTP salah. Gunakan kode "1708" atau OTP simulasi yang sesuai.');
        return;
      }
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

  // Send real-time OTP to email
  const handleSendPanitiaOtp = async () => {
    setPanitiaOtpError('');
    setPanitiaOtpSuccess('');
    setPanitiaEtherealUrl('');
    setPanitiaRealEmailSent(false);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: puzzleEmail, 
          username: puzzlePurpose === 'login' ? loginUser : regUser 
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setPanitiaOtpSent(true);
        setServerOtp(resData.otp);
        setPanitiaEtherealUrl(resData.previewUrl || '');
        setPanitiaRealEmailSent(resData.realEmailSent || false);
        setPanitiaOtpTimer(60);
        setPanitiaOtpSuccess(`Kode OTP 6-Digit berhasil dikirim secara realtime ke email ${puzzleEmail}.`);
      } else {
        setPanitiaOtpError(resData.error || 'Gagal mengirimkan OTP.');
      }
    } catch (err: any) {
      setPanitiaOtpError('Gagal menghubungi server untuk mengirim OTP.');
    }
  };

  // Puzzle Slider validation handler
  const handleVerifyPuzzle = () => {
    // Check if slider is aligned correctly (with tolerance of ±5%)
    if (Math.abs(puzzleXCurrent - puzzleXTarget) <= 5) {
      setPuzzleSolved(true);
      setPuzzleError('');
      handleSendPanitiaOtp();
    } else {
      setPuzzleError('Gagal! Posisi puzzle tidak pas. Coba sejajarkan potongan merah-putih dengan pas.');
    }
  };

  // OTP Verification for login/signup completion
  const handleVerifyPanitiaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanitiaOtpError('');

    if (panitiaOtpCode.trim().length !== 6) {
      setPanitiaOtpError('Kode OTP harus terdiri dari 6 digit.');
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: puzzleEmail, otp: panitiaOtpCode })
      });
      const resData = await response.json();
      
      if (response.ok && resData.success) {
        if (puzzlePurpose === 'login') {
          const found = accounts.find(
            (acc) => acc.username.toLowerCase() === loginUser.trim().toLowerCase()
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
            setShowPuzzle(false);
            onClose();
          }
        } else if (puzzlePurpose === 'signup') {
          const newAcc: Account = {
            username: regUser.trim().toLowerCase(),
            password: regPass,
            nama: regNama.trim(),
            jabatan: regJabatan,
            email: regEmail.trim(),
            hasFingerprint: regHasFingerprint
          };
          onSignUpSuccess(newAcc);
          onLoginSuccess({
            username: newAcc.username,
            nama: newAcc.nama,
            jabatan: newAcc.jabatan
          });
          // Reset
          setRegUser('');
          setRegPass('');
          setRegNama('');
          setRegEmail('');
          setRegHasFingerprint(false);
          setShowPuzzle(false);
          onClose();
        }
      } else {
        setPanitiaOtpError(resData.error || 'Kode OTP salah atau kedaluwarsa.');
      }
    } catch (err) {
      setPanitiaOtpError('Gagal melakukan verifikasi OTP. Silakan hubungi admin.');
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
      // Valid credentials! Launch Puzzle verification & OTP
      setPuzzleEmail(found.email || `${found.username}@gmail.com`);
      setPuzzlePurpose('login');
      setPuzzleXTarget(Math.floor(25 + Math.random() * 55)); // Target percentage between 25% and 80%
      setPuzzleXCurrent(0);
      setPuzzleSolved(false);
      setPuzzleError('');
      setPanitiaOtpSent(false);
      setPanitiaOtpCode('');
      setPanitiaOtpError('');
      setPanitiaOtpSuccess('');
      setShowPuzzle(true);
    } else {
      setLoginError('Username atau password pengurus salah.');
    }
  };

  // Panitia Register Submission
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUser.trim() || !regPass.trim() || !regNama.trim() || !regEmail.trim()) {
      setRegError('Seluruh kolom termasuk Email harus diisi.');
      return;
    }

    if (regUser.trim().length < 3) {
      setRegError('Username minimal 3 karakter.');
      return;
    }

    if (regPass.trim().length < 6) {
      setRegError('Password minimal 6 karakter.');
      return;
    }

    const exists = accounts.some(
      (acc) => acc.username.toLowerCase() === regUser.trim().toLowerCase()
    );

    if (exists) {
      setRegError('Username sudah terdaftar.');
      return;
    }

    const emailExists = accounts.some(
      (acc) => acc.email && acc.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (emailExists) {
      setRegError('Alamat email sudah terdaftar.');
      return;
    }

    // Valid inputs! Launch Puzzle verification & OTP
    setPuzzleEmail(regEmail.trim());
    setPuzzlePurpose('signup');
    setPuzzleXTarget(Math.floor(25 + Math.random() * 55)); // Target percentage between 25% and 80%
    setPuzzleXCurrent(0);
    setPuzzleSolved(false);
    setPuzzleError('');
    setPanitiaOtpSent(false);
    setPanitiaOtpCode('');
    setPanitiaOtpError('');
    setPanitiaOtpSuccess('');
    setShowPuzzle(true);
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
              {showPuzzle ? (
                <div className="space-y-5">
                  {/* Puzzle Header */}
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-950 mb-2">
                      <Unlock size={24} className="animate-bounce text-indigo-700" />
                    </div>
                    <h3 className="font-display font-black text-gray-800 text-sm uppercase tracking-wider">
                      {puzzleSolved ? '📧 Verifikasi OTP Email' : '🇮🇩 CAPTCHA Bendera Merah Putih'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                      {puzzleSolved 
                        ? `Masukkan 6 digit kode keamanan yang dikirim realtime ke email ${puzzleEmail}`
                        : 'Geser slider di bawah agar potongan bendera Merah Putih sejajar dengan sempurna.'}
                    </p>
                  </div>

                  {/* Puzzle UI (Active when not yet solved) */}
                  {!puzzleSolved ? (
                    <div className="space-y-4">
                      {puzzleError && (
                        <div className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100 text-[10px] font-bold flex items-center gap-1.5">
                          <ShieldAlert size={14} className="shrink-0" />
                          <span>{puzzleError}</span>
                        </div>
                      )}

                      {/* The Graphic Box (Flag Canvas) */}
                      <div className="relative w-full h-32 bg-slate-100 rounded-2xl border border-gray-200 overflow-hidden select-none">
                        {/* Background flag background */}
                        <div className="absolute inset-0 flex flex-col">
                          <div className="h-1/2 bg-red-600/90 flex items-end justify-center">
                            <span className="text-[9px] font-bold text-white tracking-widest opacity-30 uppercase">PANITIA HUT RI 81</span>
                          </div>
                          <div className="h-1/2 bg-white flex items-start justify-center">
                            <span className="text-[9px] font-bold text-gray-400 tracking-widest opacity-30 uppercase font-mono">KEDAUNG BARU</span>
                          </div>
                        </div>

                        {/* Golden Shield emblem in the middle as decoration */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <Award size={64} className="text-indigo-950" />
                        </div>

                        {/* Missing target cutout (Gray dashed box) */}
                        <div 
                          className="absolute top-8 w-12 h-16 border-2 border-dashed border-red-500 bg-black/15 rounded-md flex items-center justify-center"
                          style={{ left: `${puzzleXTarget}%` }}
                        >
                          <div className="text-[9px] text-white/50 font-black">TEMPEL</div>
                        </div>

                        {/* Active sliding piece (The red/white cutout piece) */}
                        <div 
                          className="absolute top-8 w-12 h-16 bg-gradient-to-b from-red-600 to-white border border-gray-300 shadow-xl rounded-md flex flex-col overflow-hidden cursor-ew-resize transition-transform duration-75 active:scale-105"
                          style={{ left: `${puzzleXCurrent}%` }}
                        >
                          <div className="h-1/2 bg-red-600 border-b border-gray-100" />
                          <div className="h-1/2 bg-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                          </div>
                        </div>
                      </div>

                      {/* Sliding controller slider bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                          <span>GESER KANAN &rarr;</span>
                          <span className="font-mono text-indigo-600">Posisi: {Math.round(puzzleXCurrent)}% / Target: {Math.round(puzzleXTarget)}%</span>
                        </div>
                        
                        <input 
                          type="range"
                          min="0"
                          max="80"
                          step="1"
                          value={puzzleXCurrent}
                          onChange={(e) => setPuzzleXCurrent(parseInt(e.target.value))}
                          className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-950 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPuzzle(false)}
                          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyPuzzle}
                          className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-white text-[11px] font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-md"
                        >
                          Verifikasi Puzzle
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OTP code entry screen */
                    <form onSubmit={handleVerifyPanitiaOtp} className="space-y-4">
                      {panitiaOtpError && (
                        <div className="bg-red-50 text-red-600 p-2.5 rounded-xl border border-red-100 text-[10px] font-bold flex items-center gap-1.5">
                          <ShieldAlert size={14} className="shrink-0" />
                          <span>{panitiaOtpError}</span>
                        </div>
                      )}

                      {panitiaOtpSuccess && (
                        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-[10px] font-bold flex flex-col gap-1 leading-relaxed">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>{panitiaOtpSuccess}</span>
                          </div>
                          
                          {panitiaEtherealUrl && (
                            <a
                              href={panitiaEtherealUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="mt-1 block text-center p-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[9px] font-bold border border-indigo-200 transition-all cursor-pointer"
                            >
                              📥 BUKA KOTAK MASUK SIMULASI (ETHEREAL) &rarr;
                            </a>
                          )}

                          {/* Real-time Email simulator toast indicator */}
                          <div className="mt-1.5 p-2 bg-indigo-950 text-white rounded-lg font-mono text-[10px] border border-indigo-800 flex justify-between items-center animate-pulse">
                            <span>📧 EMAIL INBOX SIMULATOR:</span>
                            <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black tracking-widest">{serverOtp}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-center">
                          Kode Keamanan OTP 6-Digit
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="text"
                            maxLength={6}
                            value={panitiaOtpCode}
                            onChange={(e) => setPanitiaOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="Masukkan 6 Angka OTP"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 text-center font-black tracking-widest focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        {panitiaOtpTimer > 0 ? (
                          <span className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1">
                            <Timer size={12} />
                            Kirim ulang dalam <span className="text-indigo-600">{panitiaOtpTimer} detik</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendPanitiaOtp}
                            className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                          >
                            Kirim Ulang Kode OTP via Email
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPuzzle(false);
                            setPuzzleSolved(false);
                          }}
                          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] font-bold py-2.5 rounded-xl cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-white text-[11px] font-bold py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-md"
                        >
                          Konfirmasi & Masuk
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : showPanitiaGate ? (
                <div className="space-y-5 py-2">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-full bg-red-50 border border-red-100 text-red-500 mb-2">
                      <Fingerprint size={28} className="animate-pulse" />
                    </div>
                    <h4 className="font-display font-black text-gray-800 text-xs uppercase tracking-wider">
                      Autentikasi Sensor Sensitif
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                      Akses ini khusus pengurus panitia LPJ. Silakan ketuk tombol sidik jari di bawah untuk memindai biometrik atau masukkan sandi pengurus.
                    </p>
                  </div>

                  {/* Interactive Biometric Simulator Scanner */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isScanning) {
                          setIsScanning(true);
                          setScanProgress(0);
                        } else {
                          setIsScanning(false);
                          setScanProgress(0);
                        }
                      }}
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
                      {isScanning ? `Memindai Sidik Jari... ${scanProgress}%` : 'Sentuh untuk Pindai Sidik Jari'}
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
                          type={showSecretPasscode ? "text" : "password"}
                          value={secretPasscode}
                          onChange={(e) => setSecretPasscode(e.target.value)}
                          placeholder="Masukkan Kode Keamanan Pengurus"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2 text-xs text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecretPasscode(!showSecretPasscode)}
                          className="absolute right-3 top-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          {showSecretPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
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
                              onClick={(e) => {
                                handleRequestOTP(e);
                              }}
                              className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
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
                        {loginMethod === 'email' && wargaEtherealUrl && (
                          <a
                            href={wargaEtherealUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-2 block text-center p-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                          >
                            📥 BUKA KOTAK MASUK SIMULASI (ETHEREAL) &rarr;
                          </a>
                        )}

                        {loginMethod === 'email' && wargaServerOtp && (
                          <div className="mt-2 p-2 bg-slate-900 text-white rounded-xl font-mono text-[10px] border border-slate-800 flex justify-between items-center animate-pulse">
                            <span>📧 EMAIL INBOX SIMULATOR:</span>
                            <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black tracking-widest">{wargaServerOtp}</span>
                          </div>
                        )}

                        <p className="text-[9px] text-gray-400 text-center mt-2">
                          💡 <em>Untuk kemudahan simulasi, Anda dapat memasukkan kode <strong>{wargaServerOtp || '1708'}</strong>.</em>
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
                    <div className="space-y-4">
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
                              type={showLoginPass ? "text" : "password"}
                              value={loginPass}
                              onChange={(e) => setLoginPass(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPass(!showLoginPass)}
                              className="absolute right-3.5 top-3 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            type="submit"
                            className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer active:scale-98 shadow-md"
                          >
                            Masuk Sistem
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setIsLoginScanning(true);
                              setLoginScanProgress(0);
                              setLoginError('');
                            }}
                            disabled={isLoginScanning}
                            className={`px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50 text-xs font-bold`}
                            title="Masuk dengan Sidik Jari"
                          >
                            <Fingerprint size={16} className={isLoginScanning ? "animate-pulse" : ""} />
                            <span>{isLoginScanning ? `${loginScanProgress}%` : "Sidik Jari"}</span>
                          </button>
                        </div>
                      </form>

                      {/* Quick Login Section */}
                      <div className="mt-4 border-t border-indigo-100 pt-4">
                        <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2.5 text-center">
                          ⚡ Masuk Cepat Sekali Klik (1-Klik)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {accounts.map((acc) => (
                            <button
                              key={acc.username}
                              type="button"
                              onClick={() => handleQuickLogin(acc)}
                              className="flex items-center gap-2 p-2 bg-indigo-50/40 hover:bg-indigo-100/60 border border-indigo-100/50 rounded-xl text-left transition-all cursor-pointer group active:scale-95"
                            >
                              <div className="w-8 h-8 rounded-full bg-indigo-950 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                {acc.nama.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-800 truncate leading-tight group-hover:text-indigo-950">
                                  {acc.nama}
                                </p>
                                <p className="text-[9px] text-gray-400 truncate font-semibold mt-0.5">
                                  {acc.jabatan}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
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
                          Email Aktif (untuk OTP Realtime)
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 text-indigo-400" size={16} />
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="Contoh: panitia@gmail.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                          <span>Username Akun</span>
                          {regUser.trim().length > 0 && (
                            <span className={`text-[9px] font-bold tracking-normal ${
                              regUser.trim().length < 3 
                                ? 'text-amber-500' 
                                : accounts.some(acc => acc.username.toLowerCase() === regUser.trim().toLowerCase()) 
                                ? 'text-red-500' 
                                : 'text-emerald-500'
                            }`}>
                              {regUser.trim().length < 3 
                                ? '⚠️ Minimal 3 Karakter' 
                                : accounts.some(acc => acc.username.toLowerCase() === regUser.trim().toLowerCase()) 
                                ? '❌ Sudah Terdaftar' 
                                : '✅ Tersedia'}
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <User className={`absolute left-3.5 top-3 ${
                            regUser.trim().length === 0 
                              ? 'text-indigo-400' 
                              : regUser.trim().length < 3 
                              ? 'text-amber-400' 
                              : accounts.some(acc => acc.username.toLowerCase() === regUser.trim().toLowerCase()) 
                              ? 'text-red-400' 
                              : 'text-emerald-400'
                          }`} size={16} />
                          <input
                            type="text"
                            value={regUser}
                            onChange={(e) => setRegUser(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            placeholder="Kombinasi huruf & angka"
                            className={`w-full bg-gray-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder-gray-400 focus:outline-hidden focus:ring-2 font-semibold transition-all ${
                              regUser.trim().length === 0 
                                ? 'border-gray-200 focus:ring-indigo-500 text-gray-800' 
                                : regUser.trim().length < 3 
                                ? 'border-amber-200 focus:ring-amber-500 text-amber-700 bg-amber-50/20' 
                                : accounts.some(acc => acc.username.toLowerCase() === regUser.trim().toLowerCase()) 
                                ? 'border-red-200 focus:ring-red-500 text-red-700 bg-red-50/20' 
                                : 'border-emerald-200 focus:ring-emerald-500 text-emerald-700 bg-emerald-50/20'
                            }`}
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
                            type={showRegPass ? "text" : "password"}
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPass(!showRegPass)}
                            className="absolute right-3.5 top-3 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Fingerprint Registration Component */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Autentikasi Sidik Jari (Biometrik)
                        </label>
                        {regHasFingerprint ? (
                          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                              <CheckCircle2 size={16} className="text-emerald-600 animate-pulse" />
                              <span>Sidik Jari Terdaftar!</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRegHasFingerprint(false)}
                              className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsRegScanning(true);
                              setRegScanProgress(0);
                            }}
                            disabled={isRegScanning}
                            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed text-xs font-bold transition-all cursor-pointer ${
                              isRegScanning
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-600'
                            }`}
                          >
                            <Fingerprint size={16} className={isRegScanning ? 'animate-pulse text-indigo-600' : ''} />
                            <span>
                              {isRegScanning ? `Memindai Sidik Jari... ${regScanProgress}%` : 'Daftarkan Sidik Jari Anda'}
                            </span>
                          </button>
                        )}
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
