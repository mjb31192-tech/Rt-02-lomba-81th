
import React, { useState, useEffect } from 'react';

// URL API Vercel utama Anda
const API_URL = "https://api-rt02-lomba-81th.vercel.app";

export default function App() {
  const [peserta, setPeserta] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nama: '', lomba: '', no_rumah: '' });
  const [loading, setLoading] = useState(false);

  // 1. Ambil data asli dari MySQL via API Vercel
  const fetchPeserta = async () => {
    try {
      const response = await fetch(`${API_URL}/api/peserta`);
      const result = await response.json();
      if (result.success) {
        setPeserta(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data dari MySQL:", error);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  // 2. Handle input form perubahan text
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Kirim data pendaftaran baru ke MySQL via API Vercel
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.lomba || !form.no_rumah) {
      return alert("Semua kolom wajib diisi!");
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/peserta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        setForm({ nama: '', lomba: '', no_rumah: '' }); // Reset form
        setIsModalOpen(false); // Tutup modal setelah sukses
        fetchPeserta(); // Refresh otomatis daftar peserta dari MySQL
      }
    } catch (error) {
      alert("Gagal mendaftar ke server database.");
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
          <p className="text-sm text-gray-500">Data terhubung langsung ke Live MySQL Cloud via Vercel API</p>
        </div>
        
        {/* Tombol pemicu Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition flex items-center gap-2"
        >
          ➕ Tambah Peserta Baru
        </button>
      </div>

      {/* TAMPILAN UTAMA: DAFTAR PESERTA DARI MYSQL */}
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          👥 Warga Terdaftar ({peserta.length})
        </h3>
        
        {peserta.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg">
            Belum ada peserta terdaftar di database MySQL. Yuk jadi yang pertama!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {peserta.map((p) => (
              <div key={p.id} className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center hover:shadow-sm transition">
                <div>
                  <div className="font-bold text-gray-800 text-base">{p.nama}</div>
                  <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    🎯 Lomba: {p.lomba}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                    🏠 No. {p.no_rumah}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── COMPONENT MODAL PENDAFTARAN ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform overflow-hidden transition-all border">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                📝 Form Registrasi Peserta
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200 text-xl font-bold bg-blue-800 bg-opacity-30 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Isi Form Konten Modal */}
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
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori / Nama Lomba</label>
                <input
                  type="text"
                  name="lomba"
                  required
                  placeholder="Contoh: Balap Karung, Catur, dll."
                  value={form.lomba}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor / Blok Rumah</label>
                <input
                  type="text"
                  name="no_rumah"
                  required
                  placeholder="Contoh: B-14 atau RT 02/03"
                  value={form.no_rumah}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                />
              </div>

              {/* Tombol Aksi Modal */}
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition disabled:bg-blue-400"
                >
                  {loading ? 'Menyimpan ke MySQL...' : 'Simpan Pendaftaran'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
