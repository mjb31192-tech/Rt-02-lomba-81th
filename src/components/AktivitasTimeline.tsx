import { Aktivitas } from '../types';
import { DollarSign, UserCheck, Medal, CheckSquare, Settings, Activity } from 'lucide-react';

interface AktivitasTimelineProps {
  aktivitases: Aktivitas[];
  isCompact?: boolean;
}

export default function AktivitasTimeline({ aktivitases, isCompact = false }: AktivitasTimelineProps) {
  const displayAktivitases = isCompact 
    ? aktivitases.filter(act => ['kas', 'iuran', 'skor', 'sistem'].includes(act.tipe)).slice(0, 5)
    : aktivitases;

  const getIcon = (tipe: Aktivitas['tipe']) => {
    switch (tipe) {
      case 'kas':
        return {
          icon: <DollarSign size={16} />,
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        };
      case 'pendaftaran':
        return {
          icon: <UserCheck size={16} />,
          bg: 'bg-red-50 text-red-600 border-red-100',
        };
      case 'skor':
        return {
          icon: <Medal size={16} />,
          bg: 'bg-amber-50 text-amber-600 border-amber-100',
        };
      case 'absensi':
        return {
          icon: <CheckSquare size={16} />,
          bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
      default:
        return {
          icon: <Settings size={16} />,
          bg: 'bg-gray-50 text-gray-600 border-gray-100',
        };
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-display font-extrabold text-gray-800 text-sm sm:text-base tracking-tight flex items-center gap-2">
            <Activity size={16} className="text-red-600" />
            Log Aktivitas &amp; Keuangan
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
            {isCompact ? 'Feed aktivitas terbaru panitia lapangan' : 'Riwayat lengkap pencatatan lapangan secara kronologis'}
          </p>
        </div>
        {isCompact && (
          <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-red-100/40">
            Live Feed
          </span>
        )}
      </div>

      <div className="p-5 overflow-y-auto flex-1 max-h-[420px]">
        {displayAktivitases.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs font-medium">
            Belum ada log aktivitas yang tercatat.
          </div>
        ) : (
          <div className="relative border-l border-gray-100 pl-4.5 ml-2 space-y-5">
            {displayAktivitases.map((act) => {
              const visual = getIcon(act.tipe);
              return (
                <div key={act.id} className="relative flex items-start gap-3">
                  {/* Bullet/Icon node on line */}
                  <div className={`absolute -left-[28.5px] top-0.5 p-1 rounded-full border bg-white ${visual.bg} shrink-0 shadow-3xs`}>
                    {visual.icon}
                  </div>

                  <div className="flex-1 bg-gray-50/50 border border-gray-100/70 p-3 rounded-xl transition-all hover:bg-gray-50">
                    <p className="text-xs font-medium text-gray-700 leading-normal">
                      {act.keterangan}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100/40">
                      <span className="text-[9px] text-gray-400 font-medium font-mono">
                        {act.waktu}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 bg-white border border-gray-100 px-1.5 py-0.5 rounded-md">
                        {act.tipe}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

