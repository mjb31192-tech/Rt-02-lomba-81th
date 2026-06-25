import React from 'react';
import { User, Shield, Briefcase, FileText, Users, Heart, Star, Compass } from 'lucide-react';

export default function JajaranPanitia() {
  const panitiaCore = [
    {
      role: 'Ketua RT.002',
      nama: 'Sunardi',
      desc: 'Pelindung & Pembina Kegiatan Lingkungan',
      icon: <Shield size={20} className="text-red-600" />,
      color: 'border-red-200 bg-red-50/50 hover:bg-red-50'
    },
    {
      role: 'Ketua Panitia',
      nama: 'Anto (Zhipo)',
      desc: 'Penanggung Jawab Utama Pelaksanaan Lapangan',
      icon: <Star size={20} className="text-amber-500 fill-amber-100" />,
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
    },
    {
      role: 'Bendahara',
      nama: 'Ayeh Fathoni',
      desc: 'Manajemen Keuangan, Iuran & Laporan Kas',
      icon: <Briefcase size={20} className="text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
    },
    {
      role: 'Sekretaris I',
      nama: 'Sutrisno',
      desc: 'Penyusunan Agenda & Koordinator Administrasi',
      icon: <FileText size={20} className="text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
    },
    {
      role: 'Sekretaris II',
      nama: 'Ahmad Mujibur Rahman',
      desc: 'Pencatatan Data Partisipasi Warga & Hubungan Publik',
      icon: <FileText size={20} className="text-indigo-600" />,
      color: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
    }
  ];

  const seksiSeksi = [
    { nama: 'Seksi Peralatan & Perlengkapan Lomba', tugas: 'Menyiapkan lapangan, tali tambang, karung, bambu pinang & sound system.' },
    { nama: 'Seksi Konsumsi Konsumsi', tugas: 'Penyediaan snack rapat panitia, minuman peserta lomba & konsumsi puncak acara.' },
    { nama: 'Seksi Keamanan & Ketertiban', tugas: 'Menjaga kondusivitas lapangan selama lomba berlangsung di RT.002.' },
    { nama: 'Seksi Humas, Dokumentasi & Publikasi', tugas: 'Mengabadikan keseruan momen warga & mengumumkan jadwal-jadwal perlombaan.' }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-scale-up">
      
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[9px] sm:text-[10px] bg-red-50 text-red-600 border border-red-100/50 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
          Struktur Kepanitiaan Resmi
        </span>
        <h3 className="font-display font-black text-gray-800 text-lg sm:text-xl uppercase tracking-tight">
          Jajaran Panitia HUT-RI ke-81
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          Sinergi kepengurusan RT.002/RW.003 Kelurahan Kedaung Baru demi menyelenggarakan perayaan kemerdekaan yang semarak dan tertib.
        </p>
      </div>

      {/* CORE COMMITTEE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {panitiaCore.map((p, idx) => (
          <div 
            key={idx} 
            className={`border rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-3xs transition-all hover:-translate-y-0.5 ${p.color}`}
          >
            <div className="space-y-2">
              <div className="p-2 w-10 h-10 rounded-xl bg-white border border-gray-150 flex items-center justify-center shadow-3xs">
                {p.icon}
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block leading-none">
                  {p.role}
                </span>
                <h4 className="font-display font-bold text-xs text-gray-800 mt-1.5 leading-tight">
                  {p.nama}
                </h4>
              </div>
            </div>
            <p className="text-[10px] text-gray-400/90 font-medium leading-relaxed border-t border-gray-100/50 pt-2">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      {/* SECTIONS & ALL CITIZENS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3">
        {/* Seksi-Seksi */}
        <div className="lg:col-span-8 border border-gray-100/80 bg-gray-50/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Compass size={14} className="text-red-600" />
            Seksi-Seksi Lapangan
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {seksiSeksi.map((seksi, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-3 rounded-xl shadow-3xs hover:border-gray-200 transition-all">
                <h5 className="text-[11px] font-bold text-gray-800 font-display">{seksi.nama}</h5>
                <p className="text-[10px] text-gray-400 mt-1 font-medium leading-relaxed">{seksi.tugas}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warga Masyarakat */}
        <div className="lg:col-span-4 border border-red-100 bg-red-50/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
              <Users size={14} />
              Elemen Warga Pendukung
            </h4>
            <h5 className="font-display font-bold text-xs text-red-950">
              Warga Lingkungan RT.002 / RW.003
            </h5>
            <p className="text-[10px] text-red-900/80 font-medium leading-relaxed">
              Masyarakat Lingkungan RT.002/003 kelurahan Kedaung Baru, Tangerang secara kolektif berpartisipasi penuh, menyokong iuran sukarela sebesar Rp 50.000 per KK, mendaftarkan anak-anak dan keluarga, serta hadir memeriahkan arena lapangan merah putih.
            </p>
          </div>

          <div className="bg-white border border-red-100/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-3xs">
            <Heart size={16} className="text-red-600 fill-red-100 animate-pulse" />
            <span className="text-[9px] text-red-700 font-bold uppercase tracking-wide">
              Guyub Rukun, Bersatu Kita Teguh!
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
