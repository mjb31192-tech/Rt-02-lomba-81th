import React, { useState, useEffect } from 'react';

// Ambil URL base otomatis atau gunakan default local
const API_URL = window.location.origin;

export default function App() {
  // State untuk menampung database lengkap dari server.ts
  const [dbData, setDbData] = useState({
    lombas: [],
    pesertas: [],
    kas: [],
    iuranKK: [],
    permintaanLomba: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nama: '', lomba_id: '', no_telp: '', rt: '' });
  const [loading, setLoading] = useState(false);

  // 1. Ambil data lengkap dari endpoint /api/data (server.ts)
  const fetchAllData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/data`);
      const data = await response.json();
      setDbData(data);
    } catch (error) {
      console.error("Gagal mengambil data dari server:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. Handle input form perubahan text
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Simpan data peserta baru ke dalam array pesertas, lalu kirim kembali ke /api/data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.lomba_id || !form.rt) {
      return alert("Semua kolom wajib diisi!");
    }

    setLoading(true);

    // Buat objek peserta baru sesuai skema server.ts
    const newPeserta = {
      id: Date.now(),
      nama_peserta: form.nama,
      no_telp: form.no_telp || "-",
      rt: form.rt,
      lomba_id: parseInt(form.lomba_id),
      absensi: false,
      waktu_daftar: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    // Gabungkan dengan data lama yang ada di database json
    const updatedPesertas = [newPeserta, ...dbData.pesertas];
    const fullPayload = {
      ...dbData,
      pesertas: updatedPesertas
    };

    try {
      // Kirim seluruh objek database terbaru ke server.ts
      const response = await fetch(`${API_URL}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      const result = await response.json();

      if (result.status === "success") {
        alert("Pendaftaran berhasil disimpan ke server!");
        setForm({ nama: '', lomba_id: '', no_telp: '', rt: '' }); // Reset form
        setIsModalOpen(false); // Tutup modal
        fetchAllData(); // Muat ulang data terbaru
      }
    } catch (error) {
      alert("Gagal menyimpan data pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      
      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🏆 Pendaftaran Lomba RT 02
          </h2>
          <p className="text-sm text-gray-500">Terhubung ke Database File Lokal JSON Server</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          ➕ Tambah Peserta Baru
        </button>
      </div>

      {/* TAMPILAN UTAMA: DAFTAR PESERTA */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          👥 Warga Terdaftar ({dbData.pesertas.length})
        </h3>
        
        {dbData.pesertas.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg">
            Belum ada peserta terdaftar. Yuk daftar sekarang!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dbData.pesertas.map((p) => {
              // Cari nama lomba berdasarkan lomba_id
              const lombaSesuai = dbData.lombas.find(l => l.id === p.lomba_id);
              return (
                <div key={p.id} className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800 text-base">{p.nama_peserta}</div>
                    <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                      🎯 Lomba: {lombaSesuai ? lombaSesuai.nama_lomba : "Lomba Lainnya"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                      {p.rt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL WINDOWS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border overflow-hidden">
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">📝 Form Registrasi Peserta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Warga</label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: Budi Susanto"
                  value={form.nama}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Lomba</label>
                <select
                  name="lomba_id"
                  required
                  value={form.lomba_id}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 bg-white"
                >
                  <option value="">-- Pilih Jenis Lomba --</option>
                  {dbData.lombas.map((l) => (
                    <option key={l.id} value={l.id}>{l.nama_lomba} ({l.kategori})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon/WA</label>
                <input
                  type="text"
                  name="no_telp"
                  placeholder="Contoh: 081234xxxx"
                  value={form.no_telp}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asal RT</label>
                <input
                  type="text"
                  name="rt"
                  required
                  placeholder="Contoh: RT 02"
                  value={form.rt}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-white bg-blue-600 rounded-lg disabled:bg-blue-400"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Pendaftaran'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
