import { Lomba, Peserta, Kas, Aktivitas, IuranKK, PermintaanLomba } from './types';

export const INITIAL_LOMBA: Lomba[] = [];

export const INITIAL_PESERTA: Peserta[] = [];

export const INITIAL_KAS: Kas[] = [
  { id: 1, tipe: "pemasukan", kategori: "Iuran Warga", jumlah: 5000000, keterangan: "Iuran sukarela warga RT 01 - RT 04", tanggal: "2026-06-10" },
  { id: 2, tipe: "pemasukan", kategori: "Sponsorship", jumlah: 2500000, keterangan: "Sponsor Toko Kelontong Utama", tanggal: "2026-06-15" }
];

export const INITIAL_AKTIVITAS: Aktivitas[] = [];

export const INITIAL_IURAN_KK: IuranKK[] = [
  {
    id: 1,
    nama_kk: "Pak Joko Widodo",
    rt: "RT 01",
    target: 50000,
    terbayar: 50000,
    status: "Lunas",
    riwayat: [{ id: 101, tanggal: "2026-06-12", jumlah: 50000 }]
  },
  {
    id: 2,
    nama_kk: "Pak Susilo Bambang",
    rt: "RT 02",
    target: 50000,
    terbayar: 20000,
    status: "Mencicil",
    riwayat: [{ id: 102, tanggal: "2026-06-15", jumlah: 20000 }]
  },
  {
    id: 3,
    nama_kk: "Ibu Megawati Sukarno",
    rt: "RT 03",
    target: 50000,
    terbayar: 0,
    status: "Belum Bayar",
    riwayat: []
  },
  {
    id: 4,
    nama_kk: "Pak Prabowo Subianto",
    rt: "RT 04",
    target: 50000,
    terbayar: 30000,
    status: "Mencicil",
    riwayat: [
      { id: 103, tanggal: "2026-06-18", jumlah: 15000 },
      { id: 104, tanggal: "2026-06-20", jumlah: 15000 }
    ]
  },
  {
    id: 5,
    nama_kk: "Pak Anies Baswedan",
    rt: "RT 01",
    target: 50000,
    terbayar: 50000,
    status: "Lunas",
    riwayat: [{ id: 105, tanggal: "2026-06-14", jumlah: 50000 }]
  },
  {
    id: 6,
    nama_kk: "Pak Ganjar Pranowo",
    rt: "RT 03",
    target: 50000,
    terbayar: 10000,
    status: "Mencicil",
    riwayat: [{ id: 106, tanggal: "2026-06-22", jumlah: 10000 }]
  },
  {
    id: 7,
    nama_kk: "Pak Ridwan Kamil",
    rt: "RT 02",
    target: 50000,
    terbayar: 0,
    status: "Belum Bayar",
    riwayat: []
  },
  {
    id: 8,
    nama_kk: "Pak Sandiaga Uno",
    rt: "RT 04",
    target: 50000,
    terbayar: 50000,
    status: "Lunas",
    riwayat: [{ id: 107, tanggal: "2026-06-16", jumlah: 50000 }]
  }
];

export const INITIAL_PERMINTAAN_LOMBA: PermintaanLomba[] = [];

