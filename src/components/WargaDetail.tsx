import { useState } from 'react';
import { Peserta, Lomba } from '../types';
import { Search, UserPlus, Phone, MapPin, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface WargaDetailProps {
  pesertas: Peserta[];
  lombas: Lomba[];
  onToggleAbsensi: (id: number) => void;
  onOpenPendaftaran: () => void;
  onDeletePeserta?: (id: number) => void;
}

export default function WargaDetail({
  pesertas,
  lombas,
  onToggleAbsensi,
  onOpenPendaftaran,
  onDeletePeserta,
}: WargaDetailProps) {
  const [search, setSearch] = useState('');
  const [rtFilter, setRtFilter] = useState<string>('all');
  const [lombaFilter, setLombaFilter] = useState<string>('all');

  // Helper to map Lomba ID to Name
  const getLombaName = (id: number) => {
    const l = lombas.find(item => item.id === id);
    return l ? l.nama_lomba : 'Lomba tidak ditemukan';
  };

  // Filter logic
  const filteredPesertas = pesertas.filter(p => {
    const matchSearch = p.nama_peserta.toLowerCase().includes(search.toLowerCase()) || 
                        p.no_telp.includes(search);
    const matchRt = rtFilter === 'all' || p.rt === rtFilter;
    const matchLomba = lombaFilter === 'all' || p.lomba_id === Number(lombaFilter);
    return matchSearch && matchRt && matchLomba;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Daftar Partisipasi Warga</h3>
            <p className="text-xs text-gray-500 mt-1">
              Total {pesertas.length} warga terdaftar di berbagai lomba HUT RI ke-81
            </p>
          </div>

          <button
            onClick={onOpenPendaftaran}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <UserPlus size={16} />
            Daftar Peserta Baru
          </button>
        </div>

        {/* Filters grid */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama warga atau nomor telp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <select
              value={rtFilter}
              onChange={e => setRtFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Semua RT</option>
              <option value="RT 01">RT 01</option>
              <option value="RT 02">RT 02</option>
              <option value="RT 03">RT 03</option>
              <option value="RT 04">RT 04</option>
            </select>
          </div>

          <div>
            <select
              value={lombaFilter}
              onChange={e => setLombaFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Semua Lomba</option>
              {lombas.map(l => (
                <option key={l.id} value={l.id}>{l.nama_lomba}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Citizens/Participants Card/Table Grid */}
        <div className="divide-y divide-gray-100">
          {filteredPesertas.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Tidak ada warga terdaftar yang cocok dengan pencarian.
            </div>
          ) : (
            filteredPesertas.map((peserta) => (
              <div
                key={peserta.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-full mt-0.5 shrink-0 border ${peserta.absensi ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900">{peserta.nama_peserta}</h4>
                      <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold uppercase">
                        {peserta.rt}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-1 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="line-clamp-1">Ikut: <strong className="text-gray-700">{getLombaName(peserta.lomba_id)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400 shrink-0" />
                        <span>{peserta.no_telp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        <span className="text-[10px]">Daftar: {peserta.waktu_daftar}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field Check-In Absensi Button */}
                <div className="flex items-center gap-2 justify-between border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                  <span className="text-xs text-gray-500 sm:hidden">Kehadiran Lapangan:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleAbsensi(peserta.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border ${peserta.absensi ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {peserta.absensi ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-600" />
                          Hadir di Lapangan
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-gray-400" />
                          Absen Lapangan
                        </>
                      )}
                    </button>

                    {onDeletePeserta && (
                      <button
                        onClick={() => onDeletePeserta(peserta.id)}
                        className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer active:scale-95 border border-red-100/30"
                        title="Hapus Peserta"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
