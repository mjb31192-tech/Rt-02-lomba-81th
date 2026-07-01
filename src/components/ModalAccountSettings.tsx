import React, { useState, useEffect, FormEvent } from 'react';
import { X, User, Lock, Fingerprint, CheckCircle2, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalAccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    username: string;
    nama: string;
    jabatan: string;
    mewakili_kk?: string;
    sebagai_apa?: string;
    kk_id?: number;
  } | null;
  accounts: {
    username: string;
    password: string;
    nama: string;
    jabatan: string;
    hasFingerprint?: boolean;
  }[];
  onUpdateAccount: (updatedAccount: {
    username: string;
    password?: string;
    nama: string;
    hasFingerprint?: boolean;
  }) => void;
}

export default function ModalAccountSettings({
  isOpen,
  onClose,
  currentUser,
  accounts,
  onUpdateAccount,
}: ModalAccountSettingsProps) {
  // Find matching account details
  const matchingAccount = accounts.find(
    (acc) => acc.username.toLowerCase() === currentUser?.username.toLowerCase()
  );

  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [hasFingerprint, setHasFingerprint] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize values when modal opens or matchingAccount changes
  useEffect(() => {
    if (matchingAccount) {
      setNama(matchingAccount.nama);
      setPassword(matchingAccount.password);
      setHasFingerprint(!!matchingAccount.hasFingerprint);
    }
    setSaveSuccess(false);
    setIsScanning(false);
    setScanProgress(0);
  }, [matchingAccount, isOpen]);

  // Fingerprint registration scan animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning && scanProgress < 100) {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsScanning(false);
            setHasFingerprint(true);
            return 100;
          }
          return prev + 10;
        });
      }, 80);
    } else if (!isScanning && scanProgress < 100) {
      setScanProgress(0);
    }
    return () => clearInterval(timer);
  }, [isScanning, scanProgress]);

  if (!currentUser) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Nama tidak boleh kosong!');
      return;
    }
    if (!password || password.length < 4) {
      alert('Password minimal harus terdiri dari 4 karakter!');
      return;
    }

    onUpdateAccount({
      username: currentUser.username,
      nama: nama.trim(),
      password: password,
      hasFingerprint: hasFingerprint,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="modal-account-settings-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            id="modal-account-settings-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-xl">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">
                    Pengaturan Akun Saya
                  </h3>
                  <p className="text-[10px] text-white/80 font-medium">
                    {currentUser.jabatan} &bull; @{currentUser.username}
                  </p>
                </div>
              </div>
              <button
                id="close-account-settings-btn"
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-100 text-xs font-bold shadow-3xs"
                >
                  <CheckCircle2 size={16} className="text-emerald-600 animate-pulse shrink-0" />
                  <span>Pengaturan akun berhasil disimpan! Mensinkronisasikan ke server database...</span>
                </motion.div>
              )}

              {/* Read-Only Info Box */}
              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Username Utama (Permanen)</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-100 px-2.5 py-1 rounded-lg">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium font-sans">
                    Identitas login utama tidak dapat diubah
                  </span>
                </div>
              </div>

              {/* Display Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nama Lengkap / Panggilan
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-red-500" size={15} />
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-semibold"
                  />
                </div>
              </div>

              {/* Password Input with eye toggler */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Kata Sandi Baru / Saat Ini
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-red-500" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-xs text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Fingerprint Configuration Widget */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Autentikasi Sidik Jari (Biometrik Akun)
                </label>
                
                {hasFingerprint ? (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Sidik Jari Aktif untuk Login Cepat</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasFingerprint(false)}
                      className="text-[11px] text-red-600 hover:underline font-extrabold cursor-pointer"
                    >
                      Nonaktifkan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanning(true);
                      setScanProgress(0);
                    }}
                    disabled={isScanning}
                    className={`w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border border-dashed text-xs font-bold transition-all cursor-pointer ${
                      isScanning
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
                    }`}
                  >
                    <Fingerprint size={16} className={isScanning ? 'animate-pulse text-red-600' : 'text-gray-400'} />
                    <span>
                      {isScanning ? `Memindai Sidik Jari... ${scanProgress}%` : 'Aktifkan Login dengan Sidik Jari'}
                    </span>
                  </button>
                )}

                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  Bila diaktifkan, Anda dapat masuk secara cepat langsung menggunakan scan sidik jari dari layar login tanpa harus mengetik password.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <Save size={14} />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
