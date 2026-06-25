export interface Lomba {
  id: number;
  nama_lomba: string;
  pj: string;
  status: 'Belum Mulai' | 'Berjalan' | 'Selesai';
  anggaran: number;
  kategori: string;
  pemenang_1?: string;
  pemenang_2?: string;
  pemenang_3?: string;
}

export interface Peserta {
  id: number;
  nama_peserta: string;
  no_telp: string;
  rt: string;
  lomba_id: number;
  absensi: boolean;
  waktu_daftar: string;
}

export interface Kas {
  id: number;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori: string;
  jumlah: number;
  keterangan: string;
  tanggal: string;
  lomba_id?: number; // Optional link to a specific Lomba budget
  bukti_foto?: string; // Base64 or image path for photo proof
}

export interface Aktivitas {
  id: number;
  tipe: 'kas' | 'pendaftaran' | 'skor' | 'absensi' | 'sistem' | 'iuran' | 'permintaan';
  keterangan: string;
  waktu: string;
}

export interface IuranKK {
  id: number;
  nama_kk: string;
  rt: string;
  target: number; // Rp 50.000
  terbayar: number;
  status: 'Belum Bayar' | 'Mencicil' | 'Lunas';
  riwayat: {
    id: number;
    tanggal: string;
    jumlah: number;
  }[];
}

export interface PermintaanLomba {
  id: number;
  nama_lomba: string;
  pengusul: string;
  rt: string;
  kategori: string;
  estimasi_biaya: number;
  jumlah_pendukung: number;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
}

export interface LaporanIuranMingguan {
  id: number;
  minggu_ke: string; // e.g. "Minggu I", "Minggu II"
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_jumlah: number;
  keterangan: string;
  bukti_foto?: string; // base64 photo
  tanggal_lapor: string;
  dilaporkan_oleh: string;
}

