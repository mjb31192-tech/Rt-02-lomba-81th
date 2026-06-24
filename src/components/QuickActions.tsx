import { UserPlus, Medal, Landmark, ClipboardCheck } from 'lucide-react';

interface QuickActionsProps {
  onOpenPendaftaran: () => void;
  onOpenInputSkor: () => void;
  onOpenCatatKas: () => void;
  onOpenAbsensi: () => void;
}

export default function QuickActions({
  onOpenPendaftaran,
  onOpenInputSkor,
  onOpenCatatKas,
  onOpenAbsensi,
}: QuickActionsProps) {
  const actions = [
    {
      label: 'Daftar Peserta',
      description: 'Tambah warga ke lomba',
      icon: <UserPlus size={18} />,
      bg: 'hover:border-red-400 hover:shadow-xs',
      iconBg: 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white shadow-xs shadow-red-100/50',
      onClick: onOpenPendaftaran,
    },
    {
      label: 'Input Skor',
      description: 'Set pemenang lomba',
      icon: <Medal size={18} />,
      bg: 'hover:border-amber-400 hover:shadow-xs',
      iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white shadow-xs shadow-amber-100/50',
      onClick: onOpenInputSkor,
    },
    {
      label: 'Catat Kas',
      description: 'Kas masuk & keluar',
      icon: <Landmark size={18} />,
      bg: 'hover:border-emerald-400 hover:shadow-xs',
      iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white shadow-xs shadow-emerald-100/50',
      onClick: onOpenCatatKas,
    },
    {
      label: 'Absensi Warga',
      description: 'Kehadiran lapangan',
      icon: <ClipboardCheck size={18} />,
      bg: 'hover:border-indigo-400 hover:shadow-xs',
      iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-xs shadow-indigo-100/50',
      onClick: onOpenAbsensi,
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Aksi Cepat Panitia Lapangan
        </h3>
        <span className="text-[9px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-red-100/40">
          Live Mode
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            className={`flex flex-col items-center justify-center p-5 bg-white border border-gray-150 rounded-2xl text-center group transition-all cursor-pointer ${act.bg}`}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${act.iconBg}`}>
              {act.icon}
            </div>
            <span className="font-display font-extrabold text-[12px] text-gray-800 uppercase tracking-wider mt-3.5 leading-none transition-colors group-hover:text-red-600">
              {act.label}
            </span>
            <span className="text-[10px] text-gray-400 mt-1.5 font-medium leading-none">
              {act.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

