import { Lomba, Peserta, Kas, Aktivitas, IuranKK, PermintaanLomba } from './types';

export const INITIAL_LOMBA: Lomba[] = [
  {
    id: 1,
    nama_lomba: "Panjat Pinang Dewasa",
    pj: "Budi Santoso",
    status: "Belum Mulai",
    anggaran: 1200000,
    kategori: "Dewasa"
  },
  {
    id: 2,
    nama_lomba: "Tarik Tambang Antar RT",
    pj: "Hendra Wijaya",
    status: "Berjalan",
    anggaran: 350000,
    kategori: "Dewasa"
  },
  {
    id: 3,
    nama_lomba: "Balap Karung Helm",
    pj: "Siti Aminah",
    status: "Berjalan",
    anggaran: 200000,
    kategori: "Anak-anak"
  },
  {
    id: 4,
    nama_lomba: "Makan Kerupuk Kolosal",
    pj: "Agus Setiawan",
    status: "Selesai",
    anggaran: 150000,
    kategori: "Anak-anak",
    pemenang_1: "Rian RT 01",
    pemenang_2: "Susi RT 03",
    pemenang_3: "Adit RT 02"
  },
  {
    id: 5,
    nama_lomba: "Lomba Menghias Gapura RT",
    pj: "Rahmat Hidayat",
    status: "Berjalan",
    anggaran: 2000000,
    kategori: "Umum"
  },
  {
    id: 6,
    nama_lomba: "Jalan Sehat HUT RI",
    pj: "Dedi Kurniawan",
    status: "Belum Mulai",
    anggaran: 1500000,
    kategori: "Umum"
  },
  {
    id: 7,
    nama_lomba: "Mewarnai Kemerdekaan",
    pj: "Lani Lestari",
    status: "Selesai",
    anggaran: 300000,
    kategori: "Anak-anak",
    pemenang_1: "Kiki RT 04",
    pemenang_2: "Dina RT 01",
    pemenang_3: "Fino RT 02"
  },
  {
    id: 8,
    nama_lomba: "Estafet Kelereng Ibu-ibu",
    pj: "Sri Wahyuni",
    status: "Belum Mulai",
    anggaran: 150000,
    kategori: "Ibu-ibu"
  }
];

export const INITIAL_PESERTA: Peserta[] = [
  { id: 1, nama_peserta: "Ahmad Fauzi", no_telp: "081234567890", rt: "RT 01", lomba_id: 1, absensi: true, waktu_daftar: "2026-06-20 14:30:00" },
  { id: 2, nama_peserta: "Bambang Pamungkas", no_telp: "082198765432", rt: "RT 02", lomba_id: 1, absensi: false, waktu_daftar: "2026-06-20 15:12:00" },
  { id: 3, nama_peserta: "Cici Paramida", no_telp: "087711223344", rt: "RT 03", lomba_id: 3, absensi: true, waktu_daftar: "2026-06-21 09:45:00" },
  { id: 4, nama_peserta: "Dedi Kusnandar", no_telp: "085644556677", rt: "RT 04", lomba_id: 2, absensi: true, waktu_daftar: "2026-06-21 10:20:00" },
  { id: 5, nama_peserta: "Eka Prasetya", no_telp: "089988776655", rt: "RT 01", lomba_id: 2, absensi: true, waktu_daftar: "2026-06-22 11:05:00" },
  { id: 6, nama_peserta: "Fatimah Azzahra", no_telp: "081322334455", rt: "RT 03", lomba_id: 4, absensi: true, waktu_daftar: "2026-06-22 13:50:00" },
  { id: 7, nama_peserta: "Guntur Bumi", no_telp: "081288990011", rt: "RT 02", lomba_id: 4, absensi: true, waktu_daftar: "2026-06-23 08:15:00" }
];

export const INITIAL_KAS: Kas[] = [
  { id: 1, tipe: "pemasukan", kategori: "Iuran Warga", jumlah: 5000000, keterangan: "Iuran sukarela warga RT 01 - RT 04", tanggal: "2026-06-10" },
  { id: 2, tipe: "pemasukan", kategori: "Sponsorship", jumlah: 2500000, keterangan: "Sponsor Toko Kelontong Utama", tanggal: "2026-06-15" },
  { id: 3, tipe: "pengeluaran", kategori: "Peralatan Lomba", jumlah: 150000, keterangan: "Beli tali tambang & kapur lapangan", tanggal: "2026-06-18" },
  { id: 4, tipe: "pengeluaran", kategori: "Konsumsi", jumlah: 450000, keterangan: "Snack rapat koordinasi panitia ke-2", tanggal: "2026-06-20" },
  { id: 5, tipe: "pengeluaran", kategori: "Hadiah", jumlah: 600000, keterangan: "Pembelian piala dan kado makan kerupuk & mewarnai", tanggal: "2026-06-22" }
];

export const INITIAL_AKTIVITAS: Aktivitas[] = [
  { id: 1, tipe: "kas", keterangan: "Pemasukan dana iuran warga terkumpul sebesar Rp 5.000.000", waktu: "4 hari yang lalu" },
  { id: 2, tipe: "pendaftaran", keterangan: "Fatimah Azzahra (RT 03) mendaftar sebagai peserta Makan Kerupuk", waktu: "2 hari yang lalu" },
  { id: 3, tipe: "kas", keterangan: "Catat pengeluaran Rp 600.000 untuk pembelian piala dan kado", waktu: "Kemarin" },
  { id: 4, tipe: "skor", keterangan: "Rian RT 01 dinyatakan sebagai Juara 1 lomba Makan Kerupuk Kolosal", waktu: "10 jam yang lalu" },
  { id: 5, tipe: "absensi", keterangan: "Ahmad Fauzi (RT 01) telah melakukan absensi kehadiran Panjat Pinang", waktu: "2 jam yang lalu" }
];

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

export const INITIAL_PERMINTAAN_LOMBA: PermintaanLomba[] = [
  {
    id: 1,
    nama_lomba: "Catur Cepat Bapak-bapak",
    pengusul: "Pak Ahmad",
    rt: "RT 03",
    kategori: "Bapak-bapak",
    estimasi_biaya: 250000,
    jumlah_pendukung: 18,
    status: "Menunggu"
  },
  {
    id: 2,
    nama_lomba: "Lomba Mewarnai Balita",
    pengusul: "Ibu Rina",
    rt: "RT 01",
    kategori: "Anak-anak",
    estimasi_biaya: 150000,
    jumlah_pendukung: 12,
    status: "Menunggu"
  },
  {
    id: 3,
    nama_lomba: "Estafet Air Ibu-ibu",
    pengusul: "Ibu Hartati",
    rt: "RT 04",
    kategori: "Ibu-ibu",
    estimasi_biaya: 200000,
    jumlah_pendukung: 25,
    status: "Menunggu"
  },
  {
    id: 4,
    nama_lomba: "E-Sport Mobile Legends Remaja",
    pengusul: "Adit",
    rt: "RT 02",
    kategori: "Umum",
    estimasi_biaya: 500000,
    jumlah_pendukung: 31,
    status: "Menunggu"
  }
];

