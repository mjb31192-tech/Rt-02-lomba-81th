import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Wallet, 
  Users, 
  Activity, 
  Flag, 
  User, 
  Clock,
  Menu,
  X
} from 'lucide-react';
import {
  Lomba,
  Peserta,
  Kas,
  Aktivitas,
  IuranKK,
  PermintaanLomba
} from './types';
import {
  INITIAL_LOMBA,
  INITIAL_PESERTA,
  INITIAL_KAS,
  INITIAL_AKTIVITAS,
  INITIAL_IURAN_KK,
  INITIAL_PERMINTAAN_LOMBA
} from './mockData';

import Countdown from './components/Countdown';
import QuickStats from './components/QuickStats';
import QuickActions from './components/QuickActions';
import LombaList from './components/LombaList';
import AktivitasTimeline from './components/AktivitasTimeline';
import KeuanganDetail from './components/KeuanganDetail';
import WargaDetail from './components/WargaDetail';

import ModalPendaftaran from './components/ModalPendaftaran';
import ModalInputSkor from './components/ModalInputSkor';
import ModalCatatKas from './components/ModalCatatKas';
import ModalAddLomba from './components/ModalAddLomba';
import ModalBayarIuran from './components/ModalBayarIuran';
import ModalPermintaanLomba from './components/ModalPermintaanLomba';

export default function App() {
  // 1. States with LocalStorage Hydration
  const [lombas, setLombas] = useState<Lomba[]>(() => {
    const saved = localStorage.getItem('hut81_lombas');
    return saved ? JSON.parse(saved) : INITIAL_LOMBA;
  });

  const [pesertas, setPesertas] = useState<Peserta[]>(() => {
    const saved = localStorage.getItem('hut81_pesertas');
    return saved ? JSON.parse(saved) : INITIAL_PESERTA;
  });

  const [kas, setKas] = useState<Kas[]>(() => {
    const saved = localStorage.getItem('hut81_kas');
    return saved ? JSON.parse(saved) : INITIAL_KAS;
  });

  const [aktivitas, setAktivitas] = useState<Aktivitas[]>(() => {
    const saved = localStorage.getItem('hut81_aktivitas');
    return saved ? JSON.parse(saved) : INITIAL_AKTIVITAS;
  });

  const [iuranKK, setIuranKK] = useState<IuranKK[]>(() => {
    const saved = localStorage.getItem('hut81_iuran_kk');
    return saved ? JSON.parse(saved) : INITIAL_IURAN_KK;
  });

  const [permintaanLomba, setPermintaanLomba] = useState<PermintaanLomba[]>(() => {
    const saved = localStorage.getItem('hut81_permintaan_lomba');
    return saved ? JSON.parse(saved) : INITIAL_PERMINTAAN_LOMBA;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'lomba' | 'keuangan' | 'warga' | 'log'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Modal Open States
  const [isPendaftaranOpen, setIsPendaftaranOpen] = useState(false);
  const [isInputSkorOpen, setIsInputSkorOpen] = useState(false);
  const [isCatatKasOpen, setIsCatatKasOpen] = useState(false);
  const [isAddLombaOpen, setIsAddLombaOpen] = useState(false);
  const [isBayarIuranOpen, setIsBayarIuranOpen] = useState(false);
  const [isPermintaanOpen, setIsPermintaanOpen] = useState(false);
  const [selectedKKIdForModal, setSelectedKKIdForModal] = useState<number | ''>('');

  // 2. Persist states
  useEffect(() => {
    localStorage.setItem('hut81_lombas', JSON.stringify(lombas));
  }, [lombas]);

  useEffect(() => {
    localStorage.setItem('hut81_pesertas', JSON.stringify(pesertas));
  }, [pesertas]);

  useEffect(() => {
    localStorage.setItem('hut81_kas', JSON.stringify(kas));
  }, [kas]);

  useEffect(() => {
    localStorage.setItem('hut81_aktivitas', JSON.stringify(aktivitas));
  }, [aktivitas]);

  useEffect(() => {
    localStorage.setItem('hut81_iuran_kk', JSON.stringify(iuranKK));
  }, [iuranKK]);

  useEffect(() => {
    localStorage.setItem('hut81_permintaan_lomba', JSON.stringify(permintaanLomba));
  }, [permintaanLomba]);

  // 3. Digital Clock Live
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(formatter.format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to log audit activities
  const logAktivitas = (tipe: Aktivitas['tipe'], keterangan: string) => {
    const newLog: Aktivitas = {
      id: Date.now(),
      tipe,
      keterangan,
      waktu: 'Baru saja'
    };
    setAktivitas(prev => [newLog, ...prev]);
  };

  // 4. Core MySQL Operations Simulation
  const handleStatusChange = (id: number, newStatus: Lomba['status']) => {
    setLombas(prev =>
      prev.map(l => (l.id === id ? { ...l, status: newStatus } : l))
    );
    const lomba = lombas.find(l => l.id === id);
    if (lomba) {
      logAktivitas('sistem', `Status lomba "${lomba.nama_lomba}" diperbarui menjadi "${newStatus}".`);
    }
  };

  const handleAddPeserta = (nama: string, telp: string, rt: string, lombaId: number) => {
    const newPeserta: Peserta = {
      id: Date.now(),
      nama_peserta: nama,
      no_telp: telp,
      rt,
      lomba_id: lombaId,
      absensi: false,
      waktu_daftar: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setPesertas(prev => [newPeserta, ...prev]);
    const lomba = lombas.find(l => l.id === lombaId);
    logAktivitas('pendaftaran', `${nama} (${rt}) resmi mendaftar lomba "${lomba?.nama_lomba || 'Lomba Kemerdekaan'}".`);
  };

  const handleInputSkor = (lombaId: number, j1: string, j2: string, j3: string) => {
    setLombas(prev =>
      prev.map(l =>
        l.id === lombaId
          ? {
              ...l,
              status: 'Selesai',
              pemenang_1: j1,
              pemenang_2: j2 || undefined,
              pemenang_3: j3 || undefined,
            }
          : l
      )
    );
    const lomba = lombas.find(l => l.id === lombaId);
    logAktivitas('skor', `Hasil Juara lomba "${lomba?.nama_lomba}" telah diinput. Juara 1: ${j1}.`);
  };

  const handleAddKas = (tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number) => {
    const newKas: Kas = {
      id: Date.now(),
      tipe,
      kategori,
      jumlah,
      keterangan,
      tanggal: new Date().toISOString().split('T')[0],
      lomba_id: lombaId
    };

    setKas(prev => [newKas, ...prev]);
    logAktivitas('kas', `Buku Kas: Catat ${tipe} (${kategori}) sebesar Rp ${jumlah.toLocaleString('id-ID')} untuk "${keterangan}".`);
  };

  const handleToggleAbsensi = (pesertaId: number) => {
    let updatedStatus = false;
    let namaWarga = '';
    setPesertas(prev =>
      prev.map(p => {
        if (p.id === pesertaId) {
          updatedStatus = !p.absensi;
          namaWarga = p.nama_peserta;
          return { ...p, absensi: !p.absensi };
        }
        return p;
      })
    );
    logAktivitas('absensi', `Kehadiran Lapangan: ${namaWarga} dinyatakan ${updatedStatus ? 'HADIR' : 'ABSEN'}.`);
  };

  const handleAddLomba = (nama: string, pj: string, anggaran: number, kategori: string, dariPermintaanId?: number) => {
    const newLomba: Lomba = {
      id: Date.now(),
      nama_lomba: nama,
      pj,
      status: 'Belum Mulai',
      anggaran,
      kategori
    };

    setLombas(prev => [...prev, newLomba]);
    logAktivitas('sistem', `Kegiatan lomba baru ditambahkan: "${nama}" (PJ: ${pj}, Anggaran: Rp ${anggaran.toLocaleString('id-ID')}).`);

    if (dariPermintaanId) {
      setPermintaanLomba(prev =>
        prev.map(item => item.id === dariPermintaanId ? { ...item, status: 'Disetujui' } : item)
      );
    }
  };

  const handlePayIuran = (kkId: number, amount: number) => {
    setIuranKK(prev =>
      prev.map(item => {
        if (item.id === kkId) {
          const newTerbayar = item.terbayar + amount;
          const newStatus = newTerbayar >= item.target ? 'Lunas' : 'Mencicil';
          const newHistoryItem = {
            id: Date.now(),
            tanggal: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            jumlah: amount
          };
          
          // Log a financial transaction in state (pemasukan, category "Iuran Warga")
          handleAddKas(
            'pemasukan',
            'Iuran Warga',
            amount,
            `Iuran KK: ${item.nama_kk} (${item.rt}) [Angsuran]`
          );

          logAktivitas('iuran', `Iuran Warga: ${item.nama_kk} (${item.rt}) mencicil Rp ${amount.toLocaleString('id-ID')}. Status: ${newStatus}.`);

          return {
            ...item,
            terbayar: newTerbayar,
            status: newStatus,
            riwayat: [...item.riwayat, newHistoryItem]
          };
        }
        return item;
      })
    );
  };

  const handleAddNewKK = (namaKK: string, rt: string) => {
    const newKK: IuranKK = {
      id: Date.now(),
      nama_kk: namaKK,
      rt,
      target: 50000,
      terbayar: 0,
      status: 'Belum Bayar',
      riwayat: []
    };
    setIuranKK(prev => [...prev, newKK]);
    logAktivitas('sistem', `Menambahkan Kepala Keluarga baru: "${namaKK}" (${rt}) ke sistem iuran.`);
  };

  const handleVotePermintaan = (id: number) => {
    setPermintaanLomba(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, jumlah_pendukung: item.jumlah_pendukung + 1 };
        }
        return item;
      })
    );
    const item = permintaanLomba.find(u => u.id === id);
    if (item) {
      logAktivitas('permintaan', `Dukungan Warga: Usulan lomba "${item.nama_lomba}" mendapat tambahan 1 dukungan.`);
    }
  };

  const handleCreatePermintaan = (nama: string, pengusul: string, rt: string, kategori: string, biaya: number) => {
    const newReq: PermintaanLomba = {
      id: Date.now(),
      nama_lomba: nama,
      pengusul,
      rt,
      kategori,
      estimasi_biaya: biaya,
      jumlah_pendukung: 1,
      status: 'Menunggu'
    };
    setPermintaanLomba(prev => [...prev, newReq]);
    logAktivitas('permintaan', `Usulan Baru: ${pengusul} (${rt}) mengusulkan lomba "${nama}" dengan biaya Rp ${biaya.toLocaleString('id-ID')}.`);
  };

  const handleApproveRequestDirectly = (id: number) => {
    const req = permintaanLomba.find(u => u.id === id);
    if (req) {
      handleAddLomba(req.nama_lomba, req.pengusul, req.estimasi_biaya, req.kategori, id);
      alert(`Aspirasi Lomba "${req.nama_lomba}" disetujui! Lomba otomatis terdaftar di Kelola Lomba.`);
    }
  };

  // Navigation links
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'lomba', label: 'Kelola Lomba', icon: <Trophy size={20} /> },
    { id: 'keuangan', label: 'Kas & Keuangan', icon: <Wallet size={20} /> },
    { id: 'warga', label: 'Daftar Warga', icon: <Users size={20} /> },
    { id: 'log', label: 'Audit Log', icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 pb-20 md:pb-0">
      {/* 1. TOP NAVBAR FRAME (Sleek Interface Style) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 shrink-0 shadow-xs">
        <div className="h-full px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg md:hidden text-gray-600 transition-all cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200/80 transition-transform hover:scale-105">
                <Flag size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display font-black text-base sm:text-lg text-gray-800 uppercase tracking-tight leading-tight">
                  HUT-RI 81 RT.002/RW.003
                </h1>
                <p className="text-[9px] text-red-600 uppercase tracking-widest leading-none font-bold">
                  Guyub Rukun Merdeka
                </p>
              </div>
            </div>
          </div>

          {/* Digital Clock & Profile Widget */}
          <div className="flex items-center gap-5">
            {/* Live UTC Clock */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono text-gray-700 shadow-3xs">
              <Clock size={14} className="text-red-600 animate-pulse" />
              <span>{currentTime} WIB</span>
            </div>

            {/* Pak RT Profile Dropdown */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
              <div className="w-9 h-9 rounded-full bg-red-50 border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs text-red-600 font-display">
                PJ
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-800">Pak RT Ahmad</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Ketua Panitia</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* 2. SIDEBAR NAVIGATION (Desktop View - Sleek Interface Style) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-4 sticky top-16 h-[calc(100vh-64px)] shrink-0 justify-between">
          <div className="space-y-4">
            <div className="text-[10px] uppercase font-bold text-gray-400 px-3 tracking-widest">Menu Utama</div>
            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-red-50 text-red-600 shadow-3xs border border-red-100/50'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span className={`${activeTab === item.id ? 'text-red-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 tracking-wider">Status Database</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-700">MySQL Connected</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-white w-64 h-full p-5 flex flex-col justify-between shadow-2xl relative z-40 animate-slide-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-red-600 text-white rounded-lg">
                    <Flag size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-red-600 font-bold tracking-widest uppercase block -mb-1">Menu Panitia</span>
                    <h2 className="font-bold text-sm text-gray-900">Kemerdekaan RT 03</h2>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        activeTab === item.id
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-5 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  HUT RI ke-81 Tahun 2026
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. CORE CONTENT BODY */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* A. HEADER AREA WITH TAB INDICATOR (Sleek Interface Style) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
            <div>
              <span className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-red-100/40">
                Sistem Panitia Lapangan HUT RI ke-81
              </span>
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-gray-800 mt-2 tracking-tight">
                {activeTab === 'dashboard' && 'Beranda Utama & Ringkasan Kas'}
                {activeTab === 'lomba' && 'Kelola Daftar Perlombaan RT'}
                {activeTab === 'keuangan' && 'Catatan Keuangan Buku Kas RT'}
                {activeTab === 'warga' && 'Portal Pendaftaran & Absensi Lapangan'}
                {activeTab === 'log' && 'Feed Audit Riwayat Aktivitas'}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
              <span className="flex items-center gap-1">Database: <strong className="text-emerald-600">MySQL Online</strong></span>
              <span className="text-gray-300">&bull;</span>
              <span className="flex items-center gap-1">Status: <strong className="text-red-500 font-bold">Live Dashboard</strong></span>
            </div>
          </div>

          {/* B. TAB CONDITIONAL RENDERING */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Countdown Kemerdekaan */}
              <Countdown />

              {/* Quick Stats Grid */}
              <QuickStats lombas={lombas} pesertas={pesertas} kas={kas} />

              {/* Quick Actions Grid */}
              <QuickActions
                onOpenPendaftaran={() => setIsPendaftaranOpen(true)}
                onOpenInputSkor={() => setIsInputSkorOpen(true)}
                onOpenCatatKas={() => setIsCatatKasOpen(true)}
                onOpenAbsensi={() => setActiveTab('warga')}
              />

              {/* 2 Columns Bento Grid Layout (Desktop) / Single Column (Mobile) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column Left: Lomba List (Compact) */}
                <div className="lg:col-span-7">
                  <LombaList
                    lombas={lombas}
                    onStatusChange={handleStatusChange}
                    onOpenAddLomba={() => setIsAddLombaOpen(true)}
                    isCompact={true}
                    permintaanLombaList={permintaanLomba}
                    onVotePermintaan={handleVotePermintaan}
                    onApproveRequestDirectly={handleApproveRequestDirectly}
                    onOpenAddPermintaan={() => setIsPermintaanOpen(true)}
                  />
                  <button 
                    onClick={() => setActiveTab('lomba')}
                    className="w-full text-center text-xs font-bold text-red-600 bg-white border border-gray-100/80 hover:bg-gray-50 py-3 rounded-xl mt-3 transition-all cursor-pointer block"
                  >
                    Lihat Semua Perlombaan &rarr;
                  </button>
                </div>

                {/* Column Right: Activities feed (Compact) */}
                <div className="lg:col-span-5">
                  <AktivitasTimeline 
                    aktivitases={aktivitas}
                    isCompact={true}
                  />
                  <button 
                    onClick={() => setActiveTab('log')}
                    className="w-full text-center text-xs font-bold text-red-600 bg-white border border-gray-100/80 hover:bg-gray-50 py-3 rounded-xl mt-3 transition-all cursor-pointer block"
                  >
                    Buka Histori Lengkap &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lomba' && (
            <div className="animate-fade-in">
              <LombaList
                lombas={lombas}
                onStatusChange={handleStatusChange}
                onOpenAddLomba={() => setIsAddLombaOpen(true)}
                isCompact={false}
                permintaanLombaList={permintaanLomba}
                onVotePermintaan={handleVotePermintaan}
                onApproveRequestDirectly={handleApproveRequestDirectly}
                onOpenAddPermintaan={() => setIsPermintaanOpen(true)}
              />
            </div>
          )}

          {activeTab === 'keuangan' && (
            <div className="animate-fade-in">
              <KeuanganDetail
                kasList={kas}
                onOpenCatatKas={() => setIsCatatKasOpen(true)}
                iuranKKList={iuranKK}
                onOpenBayarIuran={() => setIsBayarIuranOpen(true)}
                onSelectKKAndPay={(kkId) => {
                  setSelectedKKIdForModal(kkId);
                  setIsBayarIuranOpen(true);
                }}
                lombasList={lombas}
              />
            </div>
          )}

          {activeTab === 'warga' && (
            <div className="animate-fade-in">
              <WargaDetail
                pesertas={pesertas}
                lombas={lombas}
                onToggleAbsensi={handleToggleAbsensi}
                onOpenPendaftaran={() => setIsPendaftaranOpen(true)}
              />
            </div>
          )}

          {activeTab === 'log' && (
            <div className="animate-fade-in">
              <AktivitasTimeline
                aktivitases={aktivitas}
                isCompact={false}
              />
            </div>
          )}
        </main>
      </div>

      {/* 4. STICKY BOTTOM NAVIGATION BAR (Mobile View) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40 md:hidden shadow-lg">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === item.id
                ? 'text-red-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === item.id ? 'bg-red-50 text-red-600' : ''}`}>
              {item.icon}
            </div>
            <span className="mt-0.5 scale-90 xs:scale-100">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 5. OVERLAY MODALS */}
      <ModalPendaftaran
        isOpen={isPendaftaranOpen}
        onClose={() => setIsPendaftaranOpen(false)}
        lombas={lombas}
        onAddPeserta={handleAddPeserta}
      />

      <ModalInputSkor
        isOpen={isInputSkorOpen}
        onClose={() => setIsInputSkorOpen(false)}
        lombas={lombas}
        onInputSkor={handleInputSkor}
      />

      <ModalCatatKas
        isOpen={isCatatKasOpen}
        onClose={() => setIsCatatKasOpen(false)}
        onAddKas={handleAddKas}
        lombas={lombas}
      />

      <ModalAddLomba
        isOpen={isAddLombaOpen}
        onClose={() => setIsAddLombaOpen(false)}
        onAddLomba={handleAddLomba}
        permintaanLombaList={permintaanLomba}
      />

      <ModalBayarIuran
        isOpen={isBayarIuranOpen}
        onClose={() => {
          setIsBayarIuranOpen(false);
          setSelectedKKIdForModal('');
        }}
        iuranKKList={iuranKK}
        onPayIuran={handlePayIuran}
        onAddNewKK={handleAddNewKK}
        initialKkId={selectedKKIdForModal}
      />

      <ModalPermintaanLomba
        isOpen={isPermintaanOpen}
        onClose={() => setIsPermintaanOpen(false)}
        onCreatePermintaan={handleCreatePermintaan}
      />
    </div>
  );
}
