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
  X,
  Trash2,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import {
  Lomba,
  Peserta,
  Kas,
  Aktivitas,
  IuranKK,
  PermintaanLomba,
  LaporanIuranMingguan
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
import MerahPutihHero from './components/MerahPutihHero';
import JajaranPanitia from './components/JajaranPanitia';
import WargaGraphicDashboard from './components/WargaGraphicDashboard';
import ModalWargaIuranDetail from './components/ModalWargaIuranDetail';

import ModalPendaftaran from './components/ModalPendaftaran';
import ModalInputSkor from './components/ModalInputSkor';
import ModalCatatKas from './components/ModalCatatKas';
import ModalAddLomba from './components/ModalAddLomba';
import ModalBayarIuran from './components/ModalBayarIuran';
import ModalPermintaanLomba from './components/ModalPermintaanLomba';
import ModalAuth from './components/ModalAuth';
import ModalLaporanIuranMingguan from './components/ModalLaporanIuranMingguan';
import ModalExportPdfLaporan from './components/ModalExportPdfLaporan';

// Helper to generate a truly unique numerical ID to prevent duplicate keys in lists
function getUniqueId(): number {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

// Utility to ensure there are no duplicate IDs across any hydrated dataset
function ensureUniqueIds<T extends { id: number | string }>(items: T[]): T[] {
  const seen = new Set<string | number>();
  return items.map(item => {
    if (seen.has(item.id)) {
      const newId = typeof item.id === 'number'
        ? Date.now() + Math.floor(Math.random() * 10000000)
        : (Date.now() + Math.random()).toString();
      seen.add(newId);
      return { ...item, id: newId };
    }
    seen.add(item.id);
    return item;
  });
}

export default function App() {
  // 1. States with LocalStorage Hydration
  const [lombas, setLombas] = useState<Lomba[]>(() => {
    const saved = localStorage.getItem('hut81_lombas');
    const parsed = saved ? JSON.parse(saved) : INITIAL_LOMBA;
    return ensureUniqueIds(parsed);
  });

  const [pesertas, setPesertas] = useState<Peserta[]>(() => {
    const saved = localStorage.getItem('hut81_pesertas');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PESERTA;
    return ensureUniqueIds(parsed);
  });

  const [kas, setKas] = useState<Kas[]>(() => {
    const saved = localStorage.getItem('hut81_kas');
    const parsed = saved ? JSON.parse(saved) : INITIAL_KAS;
    // Ensure "Rekap Iuran Mingguan" records do not pollute the general kas ledger
    const cleaned = parsed.filter((item: Kas) => !item.keterangan.includes('Rekap Iuran Mingguan'));
    return ensureUniqueIds(cleaned);
  });

  const [aktivitas, setAktivitas] = useState<Aktivitas[]>(() => {
    const saved = localStorage.getItem('hut81_aktivitas');
    const parsed = saved ? JSON.parse(saved) : INITIAL_AKTIVITAS;
    return ensureUniqueIds(parsed);
  });

  const [iuranKK, setIuranKK] = useState<IuranKK[]>(() => {
    const saved = localStorage.getItem('hut81_iuran_kk');
    const parsed = saved ? JSON.parse(saved) : INITIAL_IURAN_KK;
    return ensureUniqueIds(parsed);
  });

  const [permintaanLomba, setPermintaanLomba] = useState<PermintaanLomba[]>(() => {
    const saved = localStorage.getItem('hut81_permintaan_lomba');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PERMINTAAN_LOMBA;
    return ensureUniqueIds(parsed);
  });

  const [laporanIuranMingguan, setLaporanIuranMingguan] = useState<LaporanIuranMingguan[]>(() => {
    const saved = localStorage.getItem('hut81_laporan_iuran_mingguan');
    const parsed = saved ? JSON.parse(saved) : [];
    return ensureUniqueIds(parsed);
  });

  // --- Auth State ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ 
    username: string; 
    nama: string; 
    jabatan: string;
    mewakili_kk?: string;
    sebagai_apa?: string;
    kk_id?: number;
  } | null>(() => {
    const saved = localStorage.getItem('hut81_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isPengurus = !!currentUser && currentUser.jabatan !== 'Warga';

  const [accounts, setAccounts] = useState<{ username: string; password: string; nama: string; jabatan: string }[]>(() => {
    const saved = localStorage.getItem('hut81_accounts');
    let parsed = saved ? JSON.parse(saved) : null;
    if (!parsed) {
      parsed = [
        { username: 'admin', password: 'SuperPanitia', nama: 'Ahmad Mujibur Rahman', jabatan: 'Sekretaris' },
        { username: 'sunardi', password: 'SuperPanitia', nama: 'Sunardi', jabatan: 'Ketua RT.002' },
        { username: 'anto', password: 'SuperPanitia', nama: 'Anto / Zhipo', jabatan: 'Ketua Panitia' },
        { username: 'ayeh', password: 'SuperPanitia', nama: 'Ayeh Patoni', jabatan: 'Bendahara' }
      ];
    } else {
      const defaultUsernames = ['admin', 'sunardi', 'anto', 'ayeh'];
      parsed = parsed.map((acc: any) => {
        if (defaultUsernames.includes(acc.username) && (acc.password === 'password' || acc.password === 'SuperPanitia')) {
          return { ...acc, password: 'SuperPanitia' };
        }
        return acc;
      });
    }
    localStorage.setItem('hut81_accounts', JSON.stringify(parsed));
    return parsed;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'lomba' | 'keuangan' | 'warga' | 'log'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Modal Open States
  const [isPendaftaranOpen, setIsPendaftaranOpen] = useState(false);
  const [isInputSkorOpen, setIsInputSkorOpen] = useState(false);
  const [isCatatKasOpen, setIsCatatKasOpen] = useState(false);
  const [kasToEdit, setKasToEdit] = useState<Kas | null>(null);
  const [isAddLombaOpen, setIsAddLombaOpen] = useState(false);
  const [isBayarIuranOpen, setIsBayarIuranOpen] = useState(false);
  const [isPermintaanOpen, setIsPermintaanOpen] = useState(false);
  const [isLaporanIuranMingguanOpen, setIsLaporanIuranMingguanOpen] = useState(false);
  const [laporanToEdit, setLaporanToEdit] = useState<LaporanIuranMingguan | null>(null);
  const [selectedReportForExport, setSelectedReportForExport] = useState<LaporanIuranMingguan | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedKKIdForModal, setSelectedKKIdForModal] = useState<number | ''>('');
  
  // Custom Warga & Lomba edit states
  const [lombaToEdit, setLombaToEdit] = useState<Lomba | null>(null);
  const [isWargaIuranDetailOpen, setIsWargaIuranDetailOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch initial database state from public API on mount
  useEffect(() => {
    async function fetchServerData() {
      try {
        const response = await fetch("/api/data");
        if (response.ok) {
          const data = await response.json();
          if (data) {
            if (data.lombas && Array.isArray(data.lombas)) setLombas(ensureUniqueIds(data.lombas));
            if (data.pesertas && Array.isArray(data.pesertas)) setPesertas(ensureUniqueIds(data.pesertas));
            if (data.kas && Array.isArray(data.kas)) {
              const cleaned = data.kas.filter((item: Kas) => !item.keterangan.includes('Rekap Iuran Mingguan'));
              setKas(ensureUniqueIds(cleaned));
            }
            if (data.aktivitas && Array.isArray(data.aktivitas)) setAktivitas(ensureUniqueIds(data.aktivitas));
            if (data.iuranKK && Array.isArray(data.iuranKK)) setIuranKK(ensureUniqueIds(data.iuranKK));
            if (data.permintaanLomba && Array.isArray(data.permintaanLomba)) setPermintaanLomba(ensureUniqueIds(data.permintaanLomba));
            if (data.laporanIuranMingguan && Array.isArray(data.laporanIuranMingguan)) setLaporanIuranMingguan(ensureUniqueIds(data.laporanIuranMingguan));
            if (data.accounts && Array.isArray(data.accounts)) setAccounts(data.accounts);
          }
        }
      } catch (err) {
        console.error("Gagal melakukan sinkronisasi data dari server public:", err);
      } finally {
        setIsDataLoaded(true);
      }
    }
    fetchServerData();
  }, []);

  // 2. Persist states
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hut81_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hut81_current_user');
    }
  }, [currentUser]);

  // Synchronize local states to public API server and localStorage when changed
  useEffect(() => {
    if (!isDataLoaded) return;

    const payload = {
      lombas,
      pesertas,
      kas,
      aktivitas,
      iuranKK,
      permintaanLomba,
      laporanIuranMingguan,
      accounts
    };

    localStorage.setItem('hut81_lombas', JSON.stringify(lombas));
    localStorage.setItem('hut81_pesertas', JSON.stringify(pesertas));
    localStorage.setItem('hut81_kas', JSON.stringify(kas));
    localStorage.setItem('hut81_aktivitas', JSON.stringify(aktivitas));
    localStorage.setItem('hut81_iuran_kk', JSON.stringify(iuranKK));
    localStorage.setItem('hut81_permintaan_lomba', JSON.stringify(permintaanLomba));
    localStorage.setItem('hut81_laporan_iuran_mingguan', JSON.stringify(laporanIuranMingguan));
    localStorage.setItem('hut81_accounts', JSON.stringify(accounts));

    const syncWithServer = async () => {
      try {
        await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Gagal menyimpan sinkronisasi data ke server public:", err);
      }
    };

    const handler = setTimeout(syncWithServer, 600);
    return () => clearTimeout(handler);
  }, [isDataLoaded, lombas, pesertas, kas, aktivitas, iuranKK, permintaanLomba, laporanIuranMingguan, accounts]);

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
      id: getUniqueId(),
      tipe,
      keterangan,
      waktu: 'Baru saja'
    };
    setAktivitas(prev => [newLog, ...prev]);
  };

  const checkAuth = (): boolean => {
    if (!isPengurus) {
      alert("Akses Terbatas: Fitur ini hanya untuk pengurus panitia! Warga hanya diperbolehkan melihat data.");
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // 4. Core MySQL Operations Simulation
  const handleStatusChange = (id: number, newStatus: Lomba['status']) => {
    if (!checkAuth()) return;
    setLombas(prev =>
      prev.map(l => (l.id === id ? { ...l, status: newStatus } : l))
    );
    const lomba = lombas.find(l => l.id === id);
    if (lomba) {
      logAktivitas('sistem', `Status lomba "${lomba.nama_lomba}" diperbarui menjadi "${newStatus}".`);
    }
  };

  const handleAddPeserta = (nama: string, telp: string, rt: string, lombaId: number) => {
    if (!checkAuth()) return;
    const newPeserta: Peserta = {
      id: getUniqueId(),
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
    if (!checkAuth()) return;
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

  const handleAddKas = (tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number, tanggal?: string, buktiFoto?: string) => {
    // If called via UI direct action or internally
    const newKas: Kas = {
      id: getUniqueId(),
      tipe,
      kategori,
      jumlah,
      keterangan,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      lomba_id: lombaId,
      bukti_foto: buktiFoto
    };

    setKas(prev => [newKas, ...prev]);
    logAktivitas('kas', `Buku Kas: Catat ${tipe} (${kategori}) sebesar Rp ${jumlah.toLocaleString('id-ID')} untuk "${keterangan}".`);
  };

  const handleEditKas = (id: number, tipe: 'pemasukan' | 'pengeluaran', kategori: string, jumlah: number, keterangan: string, lombaId?: number, tanggal?: string, buktiFoto?: string) => {
    if (!checkAuth()) return;
    setKas(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          tipe,
          kategori,
          jumlah,
          keterangan,
          lomba_id: lombaId,
          tanggal: tanggal || item.tanggal,
          bukti_foto: buktiFoto || item.bukti_foto
        };
      }
      return item;
    }));
    logAktivitas('kas', `Edit Kas: Revisi transaksi "${keterangan}" (${tipe}) menjadi Rp ${jumlah.toLocaleString('id-ID')}.`);
  };

  const handleAddLaporanIuranMingguan = (report: Omit<LaporanIuranMingguan, 'id' | 'tanggal_lapor' | 'dilaporkan_oleh'>) => {
    const newReport: LaporanIuranMingguan = {
      ...report,
      id: getUniqueId(),
      tanggal_lapor: new Date().toISOString().split('T')[0],
      dilaporkan_oleh: currentUser ? `${currentUser.nama} (${currentUser.jabatan})` : 'Bendahara'
    };
    setLaporanIuranMingguan(prev => [newReport, ...prev]);
    
    // Log this in activities
    logAktivitas('iuran', `Laporan Iuran: Rekap iuran ${newReport.minggu_ke} terkumpul Rp ${newReport.total_jumlah.toLocaleString('id-ID')} dilaporkan.`);
  };

  const handleEditLaporanIuranMingguan = (id: number, report: Omit<LaporanIuranMingguan, 'id' | 'tanggal_lapor' | 'dilaporkan_oleh'>) => {
    if (!checkAuth()) return;
    setLaporanIuranMingguan(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...report
        };
      }
      return item;
    }));
    logAktivitas('iuran', `Laporan Iuran: Laporan ${report.minggu_ke} direvisi dengan total Rp ${report.total_jumlah.toLocaleString('id-ID')}.`);
  };

  const handleDeleteLaporanIuranMingguan = (id: number) => {
    if (!checkAuth()) return;
    const reportToDelete = laporanIuranMingguan.find(r => r.id === id);
    if (!reportToDelete) return;
    setLaporanIuranMingguan(prev => prev.filter(r => r.id !== id));
    logAktivitas('iuran', `Laporan Iuran: Laporan ${reportToDelete.minggu_ke} dengan total Rp ${reportToDelete.total_jumlah.toLocaleString('id-ID')} telah dihapus.`);
  };

  const handleToggleAbsensi = (pesertaId: number) => {
    if (!checkAuth()) return;
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
    if (!checkAuth()) return;
    const newLomba: Lomba = {
      id: getUniqueId(),
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

  const handleEditLomba = (id: number, nama: string, pj: string, anggaran: number, kategori: string, status: Lomba['status']) => {
    if (!checkAuth()) return;
    setLombas(prev =>
      prev.map(l => l.id === id ? { ...l, nama_lomba: nama, pj, anggaran, kategori, status } : l)
    );
    logAktivitas('sistem', `Edit Lomba: Detail Lomba "${nama}" telah disesuaikan oleh Panitia (PJ: ${pj}, Anggaran: Rp ${anggaran.toLocaleString('id-ID')}, Status: ${status}).`);
  };

  const handlePayIuran = (kkId: number, amount: number) => {
    if (!checkAuth()) return;
    setIuranKK(prev =>
      prev.map(item => {
        if (item.id === kkId) {
          const newTerbayar = item.terbayar + amount;
          const newStatus = newTerbayar >= item.target ? 'Lunas' : 'Mencicil';
          const newHistoryItem = {
            id: getUniqueId(),
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
    if (!checkAuth()) return;
    const newKK: IuranKK = {
      id: getUniqueId(),
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
      id: getUniqueId(),
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
    if (!checkAuth()) return;
    const req = permintaanLomba.find(u => u.id === id);
    if (req) {
      handleAddLomba(req.nama_lomba, req.pengusul, req.estimasi_biaya, req.kategori, id);
      alert(`Aspirasi Lomba "${req.nama_lomba}" disetujui! Lomba otomatis terdaftar di Kelola Lomba.`);
    }
  };

  const handleDeleteLomba = (id: number) => {
    if (!checkAuth()) return;
    const lomba = lombas.find(l => l.id === id);
    if (lomba) {
      if (confirm(`Apakah Anda yakin ingin menghapus lomba "${lomba.nama_lomba}"? Semua peserta terkait juga akan terpengaruh.`)) {
        setLombas(prev => prev.filter(l => l.id !== id));
        setPesertas(prev => prev.filter(p => p.lomba_id !== id));
        logAktivitas('sistem', `Hapus Lomba: Lomba "${lomba.nama_lomba}" telah dihapus oleh Panitia.`);
      }
    }
  };

  const handleDeletePeserta = (id: number) => {
    if (!checkAuth()) return;
    const peserta = pesertas.find(p => p.id === id);
    if (peserta) {
      if (confirm(`Apakah Anda yakin ingin menghapus kepesertaan "${peserta.nama_peserta}"?`)) {
        setPesertas(prev => prev.filter(p => p.id !== id));
        logAktivitas('pendaftaran', `Batal Daftar: Kepesertaan "${peserta.nama_peserta}" pada lomba dibatalkan.`);
      }
    }
  };

  const handleDeleteKas = (id: number) => {
    if (!checkAuth()) return;
    const k = kas.find(item => item.id === id);
    if (k) {
      if (confirm(`Apakah Anda yakin ingin menghapus transaksi "${k.keterangan}" senilai Rp ${k.jumlah.toLocaleString('id-ID')}?`)) {
        setKas(prev => prev.filter(item => item.id !== id));
        logAktivitas('kas', `Hapus Kas: Transaksi "${k.keterangan}" (${k.tipe}) telah dihapus.`);
      }
    }
  };

  const handleDeleteKK = (id: number) => {
    if (!checkAuth()) return;
    const kk = iuranKK.find(item => item.id === id);
    if (kk) {
      if (confirm(`Apakah Anda yakin ingin menghapus data KK "${kk.nama_kk}"?`)) {
        setIuranKK(prev => prev.filter(item => item.id !== id));
        logAktivitas('iuran', `Hapus KK: Data keluarga/KK "${kk.nama_kk}" dihapus.`);
      }
    }
  };

  const handleDeletePermintaan = (id: number) => {
    if (!checkAuth()) return;
    const req = permintaanLomba.find(item => item.id === id);
    if (req) {
      if (confirm(`Apakah Anda yakin ingin menolak/menghapus usulan lomba "${req.nama_lomba}"?`)) {
        setPermintaanLomba(prev => prev.filter(item => item.id !== id));
        logAktivitas('permintaan', `Usulan Ditolak: Aspirasi lomba "${req.nama_lomba}" ditolak/dihapus.`);
      }
    }
  };

  const handleResetToDefault = () => {
    if (!checkAuth()) return;
    if (confirm("Apakah Anda yakin ingin me-reset seluruh database ke data awal bawaan lapangan?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleResetToEmpty = () => {
    if (!checkAuth()) return;
    if (confirm("Peringatan: Apakah Anda yakin ingin mengosongkan seluruh database? Semua lomba, peserta, kas, dan log aktivitas akan dibersihkan.")) {
      setLombas([]);
      setPesertas([]);
      setKas([]);
      setAktivitas([
        {
          id: getUniqueId(),
          tipe: 'sistem',
          keterangan: 'Seluruh database lama berhasil dikosongkan secara total oleh admin.',
          waktu: 'Baru saja'
        }
      ]);
      setIuranKK([]);
      setPermintaanLomba([]);
      alert("Database dikosongkan!");
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

            {/* Authentic & Dynamic Auth Profile Widget */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full shadow-3xs flex items-center justify-center font-bold text-xs font-display ${isPengurus ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    {currentUser.nama.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{currentUser.nama}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider leading-none ${isPengurus ? 'text-emerald-600' : 'text-red-500'}`}>{currentUser.jabatan}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin keluar dari akun ${currentUser.nama}?`)) {
                        logAktivitas('sistem', `Pengguna "${currentUser.nama}" (${currentUser.jabatan}) telah keluar dari sistem.`);
                        setCurrentUser(null);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer active:scale-95"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="hidden lg:inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-600 font-bold border border-amber-200/50 px-2 py-1 rounded-full uppercase tracking-wider">
                    Mode Tamu / Penonton
                  </span>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-3xs"
                  >
                    <Lock size={12} />
                    <span>Masuk / Daftar</span>
                  </button>
                </div>
              )}
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

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                {currentUser ? (
                  <div className="text-left bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-800">{currentUser.nama}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${isPengurus ? 'text-emerald-600' : 'text-red-500'}`}>{currentUser.jabatan}</p>
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin keluar dari akun ${currentUser.nama}?`)) {
                          logAktivitas('sistem', `Pengguna "${currentUser.nama}" (${currentUser.jabatan}) telah keluar.`);
                          setCurrentUser(null);
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold py-1.5 rounded-lg transition-all"
                    >
                      <LogOut size={12} />
                      <span>Log Out Akun</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    <Lock size={12} />
                    <span>Masuk / Daftar</span>
                  </button>
                )}
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-center mt-1">
                  HUT RI ke-81 &bull; Tangerang
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
              {/* Glorious Merah Putih Banner & Soundtrack */}
              <MerahPutihHero kasList={kas} lombasList={lombas} iuranKK={iuranKK} />

              {/* Countdown Kemerdekaan */}
              <Countdown />

              {/* Quick Stats Grid */}
              <QuickStats lombas={lombas} pesertas={pesertas} kas={kas} iuranKK={iuranKK} />

              {/* Warga Graphic Dashboard (Interactive Graphics Panel for Citizens & General Public) */}
              <WargaGraphicDashboard
                currentUser={currentUser}
                iuranKKList={iuranKK}
                lombasList={lombas}
                onOpenCheckIuran={() => setIsWargaIuranDetailOpen(true)}
                onOpenUsulkanLomba={() => setIsPermintaanOpen(true)}
              />

              {/* Quick Actions Grid (Pengurus Only) */}
              {!!currentUser && (
                <QuickActions
                  onOpenPendaftaran={() => setIsPendaftaranOpen(true)}
                  onOpenInputSkor={() => setIsInputSkorOpen(true)}
                  onOpenCatatKas={() => setIsCatatKasOpen(true)}
                  onOpenAbsensi={() => setActiveTab('warga')}
                />
              )}

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
                    onDeleteLomba={handleDeleteLomba}
                    onDeleteUsulan={handleDeletePermintaan}
                    isPengurus={!!currentUser}
                    onEditLombaClick={(lomba) => {
                      setLombaToEdit(lomba);
                      setIsAddLombaOpen(true);
                    }}
                    onAddLombaDirectly={handleAddLomba}
                    onCreatePermintaanDirectly={handleCreatePermintaan}
                    currentUser={currentUser}
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

              {/* Sub Landing Page: Jajaran Panitia */}
              <JajaranPanitia />

              {/* Maintenance & Reset Center */}
              <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-xs mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-gray-800 uppercase tracking-wide">
                      Pusat Manajemen &amp; Reset Data Panitia
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bersihkan data lama / hapus seluruh aktivitas untuk memulai lembaran baru kepanitiaan RT.002/RW.003.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={handleResetToDefault}
                    className="px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-3xs"
                  >
                    Reset ke Template Awal
                  </button>
                  <button
                    onClick={handleResetToEmpty}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    Kosongkan Semua Data Lama
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
                onDeleteLomba={handleDeleteLomba}
                onDeleteUsulan={handleDeletePermintaan}
                isPengurus={!!currentUser}
                onEditLombaClick={(lomba) => {
                  setLombaToEdit(lomba);
                  setIsAddLombaOpen(true);
                }}
                onAddLombaDirectly={handleAddLomba}
                onCreatePermintaanDirectly={handleCreatePermintaan}
                currentUser={currentUser}
              />
            </div>
          )}

          {activeTab === 'keuangan' && (
            <div className="animate-fade-in">
              <KeuanganDetail
                kasList={kas}
                onOpenCatatKas={() => {
                  setKasToEdit(null);
                  setIsCatatKasOpen(true);
                }}
                iuranKKList={iuranKK}
                onOpenBayarIuran={() => setIsBayarIuranOpen(true)}
                onSelectKKAndPay={(kkId) => {
                  setSelectedKKIdForModal(kkId);
                  setIsBayarIuranOpen(true);
                }}
                lombasList={lombas}
                onDeleteKas={handleDeleteKas}
                onEditKasClick={(item) => {
                  setKasToEdit(item);
                  setIsCatatKasOpen(true);
                }}
                onDeleteKK={handleDeleteKK}
                isPengurus={!!currentUser}
                laporanMingguanList={laporanIuranMingguan}
                onOpenLaporanMingguan={() => {
                  setLaporanToEdit(null);
                  setIsLaporanIuranMingguanOpen(true);
                }}
                onEditLaporanMingguan={(report) => {
                  setLaporanToEdit(report);
                  setIsLaporanIuranMingguanOpen(true);
                }}
                onDeleteLaporanMingguan={handleDeleteLaporanIuranMingguan}
                onExportReportPdf={(report) => {
                  setSelectedReportForExport(report);
                  setIsExportModalOpen(true);
                }}
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
                onDeletePeserta={handleDeletePeserta}
                isPengurus={!!currentUser}
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
        onClose={() => {
          setIsCatatKasOpen(false);
          setKasToEdit(null);
        }}
        onAddKas={handleAddKas}
        onEditKas={handleEditKas}
        kasToEdit={kasToEdit}
        lombas={lombas}
      />

      <ModalAddLomba
        isOpen={isAddLombaOpen}
        onClose={() => {
          setIsAddLombaOpen(false);
          setLombaToEdit(null);
        }}
        onAddLomba={handleAddLomba}
        permintaanLombaList={permintaanLomba}
        lombaToEdit={lombaToEdit}
        onEditLomba={handleEditLomba}
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

      <ModalLaporanIuranMingguan
        isOpen={isLaporanIuranMingguanOpen}
        onClose={() => {
          setIsLaporanIuranMingguanOpen(false);
          setLaporanToEdit(null);
        }}
        onAddLaporan={handleAddLaporanIuranMingguan}
        reportToEdit={laporanToEdit}
        onEditLaporan={handleEditLaporanIuranMingguan}
      />

      <ModalExportPdfLaporan
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setSelectedReportForExport(null);
        }}
        report={selectedReportForExport}
      />

      <ModalAuth
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.jabatan === 'Warga') {
            logAktivitas('sistem', `Warga "${user.nama}" berhasil masuk mewakili Kepala KK "${user.mewakili_kk || 'Umum'}".`);
            setIsWargaIuranDetailOpen(true);
          } else {
            logAktivitas('sistem', `Pengurus "${user.nama}" (${user.jabatan}) berhasil login ke sistem.`);
            alert(`Selamat Datang, ${user.nama}! Anda masuk sebagai ${user.jabatan}.`);
          }
        }}
        accounts={accounts}
        onSignUpSuccess={(newAcc) => {
          setAccounts((prev) => [...prev, newAcc]);
          logAktivitas('sistem', `Akun baru terdaftar: "${newAcc.nama}" (${newAcc.jabatan}).`);
        }}
        iuranKKList={iuranKK}
      />

      <ModalWargaIuranDetail
        isOpen={isWargaIuranDetailOpen}
        onClose={() => setIsWargaIuranDetailOpen(false)}
        currentUser={currentUser}
        iuranKKList={iuranKK}
      />
    </div>
  );
}
