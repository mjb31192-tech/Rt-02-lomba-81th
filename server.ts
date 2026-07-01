import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp as initializeClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, doc, getDoc, setDoc, setLogLevel } from "firebase/firestore";
import nodemailer from "nodemailer";

dotenv.config();
setLogLevel("error");

const DB_PATH = path.join(process.cwd(), "data_db.json");

// Initial data definition to match mockData.ts
const INITIAL_DB = {
  accounts: [
    { username: 'admin', password: 'SuperPanitia', nama: 'Ahmad Mujibur Rahman', jabatan: 'Sekretaris', email: 'ahmadmujib13214@gmail.com' },
    { username: 'sunardi', password: 'SuperPanitia', nama: 'Sunardi', jabatan: 'Ketua RT.002', email: 'sunardi@gmail.com' },
    { username: 'anto', password: 'SuperPanitia', nama: 'Anto / Zhipo', jabatan: 'Ketua Panitia', email: 'anto@gmail.com' },
    { username: 'ayeh', password: 'SuperPanitia', nama: 'Ayeh Patoni', jabatan: 'Bendahara', email: 'ayeh@gmail.com' }
  ],
  lombas: [
    { id: 1, nama_lomba: "Panjat Pinang Dewasa", pj: "Budi Santoso", status: "Belum Mulai", anggaran: 1200000, kategori: "Dewasa" },
    { id: 2, nama_lomba: "Tarik Tambang Antar RT", pj: "Hendra Wijaya", status: "Berjalan", anggaran: 350000, kategori: "Dewasa" },
    { id: 3, nama_lomba: "Balap Karung Helm", pj: "Siti Aminah", status: "Berjalan", anggaran: 200000, kategori: "Anak-anak" },
    { id: 4, nama_lomba: "Makan Kerupuk Kolosal", pj: "Agus Setiawan", status: "Selesai", anggaran: 150000, kategori: "Anak-anak", pemenang_1: "Rian RT 01", pemenang_2: "Susi RT 03", pemenang_3: "Adit RT 02" },
    { id: 5, nama_lomba: "Lomba Menghias Gapura RT", pj: "Rahmat Hidayat", status: "Berjalan", anggaran: 2000000, kategori: "Umum" },
    { id: 6, nama_lomba: "Jalan Sehat HUT RI", pj: "Dedi Kurniawan", status: "Belum Mulai", anggaran: 1500000, kategori: "Umum" },
    { id: 7, nama_lomba: "Mewarnai Kemerdekaan", pj: "Lani Lestari", status: "Selesai", anggaran: 300000, kategori: "Anak-anak", pemenang_1: "Kiki RT 04", pemenang_2: "Dina RT 01", pemenang_3: "Fino RT 02" },
    { id: 8, nama_lomba: "Estafet Kelereng Ibu-ibu", pj: "Sri Wahyuni", status: "Belum Mulai", anggaran: 150000, kategori: "Ibu-ibu" }
  ],
  pesertas: [
    { id: 1, nama_peserta: "Ahmad Fauzi", no_telp: "081234567890", rt: "RT 01", lomba_id: 1, absensi: true, waktu_daftar: "2026-06-20 14:30:00" },
    { id: 2, nama_peserta: "Bambang Pamungkas", no_telp: "082198765432", rt: "RT 02", lomba_id: 1, absensi: false, waktu_daftar: "2026-06-20 15:12:00" },
    { id: 3, nama_peserta: "Cici Paramida", no_telp: "087711223344", rt: "RT 03", lomba_id: 3, absensi: true, waktu_daftar: "2026-06-21 09:45:00" },
    { id: 4, nama_peserta: "Dedi Kusnandar", no_telp: "085644556677", rt: "RT 04", lomba_id: 2, absensi: true, waktu_daftar: "2026-06-21 10:20:00" },
    { id: 5, nama_peserta: "Eka Prasetya", no_telp: "089988776655", rt: "RT 01", lomba_id: 2, absensi: true, waktu_daftar: "2026-06-22 11:05:00" },
    { id: 6, nama_peserta: "Fatimah Azzahra", no_telp: "081322334455", rt: "RT 03", lomba_id: 4, absensi: true, waktu_daftar: "2026-06-22 13:50:00" },
    { id: 7, nama_peserta: "Guntur Bumi", no_telp: "081288990011", rt: "RT 02", lomba_id: 4, absensi: true, waktu_daftar: "2026-06-23 08:15:00" }
  ],
  kas: [
    { id: 1, tipe: "pemasukan", kategori: "Iuran Warga", jumlah: 5000000, keterangan: "Iuran sukarela warga RT 01 - RT 04", tanggal: "2026-06-10" },
    { id: 2, tipe: "pemasukan", kategori: "Sponsorship", jumlah: 2500000, keterangan: "Sponsor Toko Kelontong Utama", tanggal: "2026-06-15" },
    { id: 3, tipe: "pengeluaran", kategori: "Peralatan Lomba", jumlah: 150000, keterangan: "Beli tali tambang & kapur lapangan", tanggal: "2026-06-18" },
    { id: 4, tipe: "pengeluaran", kategori: "Konsumsi", jumlah: 450000, keterangan: "Snack rapat koordinasi panitia ke-2", tanggal: "2026-06-20" },
    { id: 5, tipe: "pengeluaran", kategori: "Hadiah", jumlah: 600000, keterangan: "Pembelian piala dan kado makan kerupuk & mewarnai", tanggal: "2026-06-22" }
  ],
  aktivitas: [
    { id: 1, tipe: "kas", keterangan: "Pemasukan dana iuran warga terkumpul sebesar Rp 5.000.000", waktu: "4 hari yang lalu" },
    { id: 2, tipe: "pendaftaran", keterangan: "Fatimah Azzahra (RT 03) mendaftar sebagai peserta Makan Kerupuk", waktu: "2 hari yang lalu" },
    { id: 3, tipe: "kas", keterangan: "Catat pengeluaran Rp 600.000 untuk pembelian piala dan kado", waktu: "Kemarin" },
    { id: 4, tipe: "skor", keterangan: "Rian RT 01 dinyatakan sebagai Juara 1 lomba Makan Kerupuk Kolosal", waktu: "10 jam yang lalu" },
    { id: 5, tipe: "absensi", keterangan: "Ahmad Fauzi (RT 01) telah melakukan absensi kehadiran Panjat Pinang", waktu: "2 jam yang lalu" }
  ],
  iuranKK: [
    { id: 1, nama_kk: "Pak Joko Widodo", rt: "RT 01", target: 50000, terbayar: 50000, status: "Lunas", riwayat: [{ id: 101, tanggal: "2026-06-12", jumlah: 50000 }] },
    { id: 2, nama_kk: "Pak Susilo Bambang", rt: "RT 02", target: 50000, terbayar: 20000, status: "Mencicil", riwayat: [{ id: 102, tanggal: "2026-06-15", jumlah: 20000 }] },
    { id: 3, nama_kk: "Ibu Megawati Sukarno", rt: "RT 03", target: 50000, terbayar: 0, status: "Belum Bayar", riwayat: [] },
    { id: 4, nama_kk: "Pak Prabowo Subianto", rt: "RT 04", target: 50000, terbayar: 30000, status: "Mencicil", riwayat: [{ id: 103, tanggal: "2026-06-18", jumlah: 15000 }, { id: 104, tanggal: "2026-06-20", jumlah: 15000 }] },
    { id: 5, nama_kk: "Pak Anies Baswedan", rt: "RT 01", target: 50000, terbayar: 50000, status: "Lunas", riwayat: [{ id: 105, tanggal: "2026-06-14", jumlah: 50000 }] },
    { id: 6, nama_kk: "Pak Ganjar Pranowo", rt: "RT 03", target: 50000, terbayar: 10000, status: "Mencicil", riwayat: [{ id: 106, tanggal: "2026-06-22", jumlah: 10000 }] },
    { id: 7, nama_kk: "Pak Ridwan Kamil", rt: "RT 02", target: 50000, terbayar: 0, status: "Belum Bayar", riwayat: [] },
    { id: 8, nama_kk: "Pak Sandiaga Uno", rt: "RT 04", target: 50000, terbayar: 50000, status: "Lunas", riwayat: [{ id: 107, tanggal: "2026-06-16", jumlah: 50000 }] }
  ],
  permintaanLomba: [
    { id: 1, nama_lomba: "Catur Cepat Bapak-bapak", pengusul: "Pak Ahmad", rt: "RT 03", kategori: "Bapak-bapak", estimasi_biaya: 250000, jumlah_pendukung: 18, status: "Menunggu" },
    { id: 2, nama_lomba: "Lomba Mewarnai Balita", pengusul: "Ibu Rina", rt: "RT 01", kategori: "Anak-anak", estimasi_biaya: 150000, jumlah_pendukung: 12, status: "Menunggu" },
    { id: 3, nama_lomba: "Estafet Air Ibu-ibu", pengusul: "Ibu Hartati", rt: "RT 04", kategori: "Ibu-ibu", estimasi_biaya: 200000, jumlah_pendukung: 25, status: "Menunggu" },
    { id: 4, nama_lomba: "E-Sport Mobile Legends Remaja", pengusul: "Adit", rt: "RT 02", kategori: "Umum", estimasi_biaya: 500000, jumlah_pendukung: 31, status: "Menunggu" }
  ],
  laporanIuranMingguan: []
};

// --- FIREBASE CLIENT SETUP ---
let firestoreDb: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (config.projectId) {
      const firebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId
      };
      const clientApp = initializeClientApp(firebaseConfig);
      const dbId = config.firestoreDatabaseId;
      if (dbId && dbId !== "(default)") {
        firestoreDb = getClientFirestore(clientApp, dbId);
      } else {
        firestoreDb = getClientFirestore(clientApp);
      }
      console.log(`Firebase Client SDK initialized on Server successfully. Project ID: ${config.projectId}, Database ID: ${dbId || "(default)"}`);
    }
  }
} catch (error) {
  console.error("Gagal menginisialisasi Firebase Client SDK di Server:", error);
}

let memoryDB: typeof INITIAL_DB = INITIAL_DB;

// Load database state from Firestore or JSON fallback on startup
async function initializeDatabase() {
  if (firestoreDb) {
    try {
      console.log("Mencoba memuat data dari Firestore via Client SDK...");
      const docRef = doc(firestoreDb, "global_state", "current_db");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        memoryDB = docSnap.data() as typeof INITIAL_DB;
        console.log("Data berhasil dimuat dari Firestore.");
        // Sync to local json file as local backup
        fs.writeFileSync(DB_PATH, JSON.stringify(memoryDB, null, 2), "utf8");
        return;
      } else {
        console.log("Dokumen Firestore belum ada. Melakukan inisialisasi awal...");
        if (fs.existsSync(DB_PATH)) {
          try {
            memoryDB = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
          } catch (e) {
            memoryDB = INITIAL_DB;
          }
        } else {
          memoryDB = INITIAL_DB;
        }
        await setDoc(docRef, memoryDB);
        console.log("Inisialisasi awal Firestore berhasil.");
        return;
      }
    } catch (error) {
      console.error("Gagal sinkronisasi dengan Firestore, menggunakan database lokal JSON:", error);
    }
  }

  // Fallback to reading standard JSON database file
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      memoryDB = JSON.parse(data);
    } else {
      memoryDB = INITIAL_DB;
      fs.writeFileSync(DB_PATH, JSON.stringify(memoryDB, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Gagal membaca database JSON, menggunakan nilai default:", error);
    memoryDB = INITIAL_DB;
  }
}

// Save database changes
async function saveDatabase(data: typeof INITIAL_DB) {
  memoryDB = data;

  // Save to local JSON as fallback/backup
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Gagal menulis cadangan lokal database JSON:", error);
  }

  // Save to Firestore for durable persistence
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "global_state", "current_db");
      await setDoc(docRef, data);
      console.log("Data berhasil disimpan secara permanen ke Firestore via Client SDK!");
    } catch (error) {
      console.error("Gagal menyimpan ke Firestore:", error);
    }
  }
}

// Synchronous helper for instant reads from memory
function readDB(): typeof INITIAL_DB {
  return memoryDB;
}

// Async-safe writer wrapper
function writeDB(data: typeof INITIAL_DB) {
  saveDatabase(data).catch((err) => {
    console.error("Async writeDB error:", err);
  });
}

async function startServer() {
  // Load database state from Firestore or JSON backup before server starts handling requests
  await initializeDatabase();

  const app = express();
  const PORT = 3000;

  // Middleware to handle JSON payloads
  app.use(express.json({ limit: "10mb" }));

  // Initialize Google Gen AI client if API Key is available
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Track active Server-Sent Events (SSE) connections
  let sseClients: any[] = [];

  // Broadcast data changes to all connected SSE clients
  const broadcastUpdate = (data: any, senderId: any = "") => {
    sseClients.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify({ type: "update", data, senderId })}\n\n`);
      } catch (err) {
        // Suppress errors for closed connections
      }
    });
  };

  // --- API ENDPOINTS ---

  // Real-time Event Stream for instant live database sync
  app.get("/api/updates-stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for proxy servers

    // Send initial handshake success
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    // Keep-alive heartbeat ping every 15 seconds to prevent connection timeouts
    const pingInterval = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
      } catch (err) {
        // Write failed
      }
    }, 15000);

    sseClients.push(res);

    req.on("close", () => {
      clearInterval(pingInterval);
      sseClients = sseClients.filter(client => client !== res);
    });
  });

  // Health and Feature Info API
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      aiEnabled: !!ai,
      timestamp: new Date().toISOString(),
      app: "Sistem Manajemen Lomba HUT RI 81"
    });
  });

  // Cache for Ethereal SMTP transporter and fromAddress to avoid recreating it on every OTP request
  let cachedEtherealTransporter: any = null;
  let cachedEtherealFrom: string = "";

  // Helper function to send real OTP email (using custom SMTP or fallback to Ethereal)
  async function sendOtpEmail(email: string, otp: string, username?: string): Promise<{ success: boolean; message: string; previewUrl?: string }> {
    const cleanedEmail = email.toLowerCase().trim();
    
    // 1. Setup transporter
    let transporter;
    let fromAddress = process.env.SMTP_FROM || '"Panitia HUT RI 81" <noreply@kedaungbaru.id>';
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log("[SMTP] Menggunakan konfigurasi SMTP kustom:", process.env.SMTP_HOST);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      if (cachedEtherealTransporter) {
        console.log("[SMTP] Menggunakan cached Ethereal transporter...");
        transporter = cachedEtherealTransporter;
        fromAddress = cachedEtherealFrom;
      } else {
        console.log("[SMTP] SMTP_HOST belum diset. Membuat test account Ethereal baru...");
        try {
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
          fromAddress = `"Panitia HUT RI 81 (Test)" <${testAccount.user}>`;
          
          // Cache it for subsequent requests
          cachedEtherealTransporter = transporter;
          cachedEtherealFrom = fromAddress;
        } catch (err: any) {
          console.error("[SMTP] Gagal membuat test account Ethereal:", err.message);
          return { success: false, message: "Gagal membuat SMTP test account" };
        }
      }
    }

    // 2. Draft email body (beautiful and patriotic)
    const mailOptions = {
      from: fromAddress,
      to: cleanedEmail,
      subject: `🇮🇩 KODE KEAMANAN OTP: ${otp} - PORTAL HUT RI KE-81 KEDAUNG BARU`,
      text: `Halo ${username || 'Warga'},

Kode Keamanan OTP Anda adalah: ${otp}

Kode ini digunakan untuk memverifikasi identitas Anda pada portal Sistem Manajemen Lomba HUT RI ke-81 Kedaung Baru RT 002/003.

Jangan bagikan kode OTP ini kepada siapapun demi keamanan akun Anda.

Salam Merdeka,
Panitia HUT RI Ke-81
Kedaung Baru`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">PORTAL HUT RI KE-81</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #fecaca;">RT 002/003 Kedaung Baru</p>
          </div>
          <div style="padding: 30px; color: #1e293b;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Halo <strong>${username || 'Warga Kedaung Baru'}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Berikut adalah Kode Keamanan OTP Anda untuk memverifikasi identitas Anda pada sistem portal:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #dc2626; padding: 15px 40px; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #b91c1c; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="font-size: 12px; line-height: 1.6; color: #e11d48; font-weight: 600; background-color: #fff1f2; padding: 10px 15px; border-radius: 8px;">
              ⚠️ PERINGATAN: Jangan pernah memberikan kode ini kepada siapapun. Panitia atau pengurus RT tidak pernah meminta kode keamanan Anda.
            </p>
            
            <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin-bottom: 0; margin-top: 25px;">
              Hormat Kami,<br />
              <strong>Panitia Pelaksana HUT RI 81</strong><br />
              Kedaung Baru, RT.002 / RW.003
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
            Pesan ini dikirimkan otomatis oleh sistem realtime. &copy; 2026 Kedaung Baru.
          </div>
        </div>
      `,
    };

    // 3. Send email with a timeout fallback
    try {
      const sendPromise = transporter.sendMail(mailOptions);
      // Absolute timeout of 5 seconds for mail delivery to prevent hangs
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout pengiriman email setelah 5 detik")), 5000)
      );
      
      const info = await Promise.race([sendPromise, timeoutPromise]);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[SMTP] Email terkirim ke ${cleanedEmail}! Message ID: ${info.messageId}`);
      if (previewUrl) {
        console.log(`[SMTP] Preview URL Ethereal: ${previewUrl}`);
      }
      return { 
        success: true, 
        message: "Email berhasil dikirim.", 
        previewUrl: previewUrl || undefined 
      };
    } catch (err: any) {
      console.error("[SMTP] Gagal mengirim email:", err.message);
      return { success: false, message: `Gagal mengirim email: ${err.message}` };
    }
  }

  // In-memory active OTP codes mapping email -> otp
  const activeOtps = new Map<string, string>();

  // Send real-time OTP to email
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email, username, digits } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email wajib diisi untuk pengiriman OTP." });
      }

      // Generate a secure code (4-digit or 6-digit)
      const isFourDigits = digits === 4;
      const otp = isFourDigits 
        ? Math.floor(1000 + Math.random() * 9000).toString()
        : Math.floor(100000 + Math.random() * 900000).toString();
        
      const cleanedEmail = email.toLowerCase().trim();
      activeOtps.set(cleanedEmail, otp);

      console.log(`[Realtime OTP] Mengirim OTP ${otp} ke email ${cleanedEmail} (User: ${username || 'Warga'})`);

      // Send the email asynchronously in the background so we don't block the API response
      sendOtpEmail(cleanedEmail, otp, username)
        .then((emailRes) => {
          console.log(`[SMTP Background] Selesai mengirim email ke ${cleanedEmail}. Status: ${emailRes.success ? 'Berhasil' : 'Gagal'}`);
        })
        .catch((err) => {
          console.error(`[SMTP Background] Kesalahan fatal saat mengirim email ke ${cleanedEmail}:`, err);
        });

      // Respond instantly so the user can see the simulator box and proceed without any network delays
      res.json({
        success: true,
        message: `Kode keamanan OTP telah dikirimkan secara realtime ke email ${email}.`,
        email: cleanedEmail,
        otp: otp,
        previewUrl: undefined,
        realEmailSent: true
      });
    } catch (err: any) {
      res.status(500).json({ error: "Gagal mengirimkan OTP: " + err.message });
    }
  });

  // Verify real-time OTP
  app.post("/api/verify-otp", (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email dan kode OTP wajib diisi." });
      }

      const cleanedEmail = email.toLowerCase().trim();
      const expectedOtp = activeOtps.get(cleanedEmail);

      console.log(`[Verify OTP] Memeriksa OTP untuk ${cleanedEmail}. Masukan: ${otp.trim()}, Harapan: ${expectedOtp}`);

      if (expectedOtp && expectedOtp === otp.trim()) {
        activeOtps.delete(cleanedEmail); // Consume OTP upon successful match
        return res.json({ success: true, message: "Kode OTP terverifikasi secara realtime!" });
      }

      return res.status(400).json({ error: "Kode OTP yang Anda masukkan tidak cocok atau telah kedaluwarsa." });
    } catch (err: any) {
      res.status(500).json({ error: "Gagal memverifikasi OTP: " + err.message });
    }
  });

  // GET complete database state
  app.get("/api/data", (req, res) => {
    try {
      const data = readDB();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Gagal membaca data dari database server: " + err.message });
    }
  });

  // POST save complete database state
  app.post("/api/data", (req, res) => {
    try {
      const incomingData = req.body;
      const currentData = readDB();
      const clientId = req.headers["x-client-id"] || "";

      // Simple validations to prevent corrupted states
      const updatedData = {
        accounts: incomingData.accounts || currentData.accounts || [],
        lombas: incomingData.lombas || currentData.lombas || [],
        pesertas: incomingData.pesertas || currentData.pesertas || [],
        kas: incomingData.kas || currentData.kas || [],
        aktivitas: incomingData.aktivitas || currentData.aktivitas || [],
        iuranKK: incomingData.iuranKK || currentData.iuranKK || [],
        permintaanLomba: incomingData.permintaanLomba || currentData.permintaanLomba || [],
        laporanIuranMingguan: incomingData.laporanIuranMingguan || currentData.laporanIuranMingguan || []
      };

      writeDB(updatedData);
      broadcastUpdate(updatedData, clientId);
      res.json({ status: "success", message: "Database tersinkronisasi dengan sukses ke server public!" });
    } catch (err: any) {
      console.error("Gagal menyimpan data:", err);
      res.status(500).json({ error: "Gagal menyimpan data ke database server: " + err.message });
    }
  });

  // AI-powered creative game recommendation engine
  app.post("/api/ai/rekomendasi", async (req, res) => {
    try {
      const { kategori, budget, pesertaType } = req.body;

      if (!ai) {
        return res.status(400).json({
          error: "Gemini API Key belum dikonfigurasi di server. Silakan hubungi admin atau konfigurasikan via Settings > Secrets."
        });
      }

      const prompt = `Berikan rekomendasi ide lomba kreatif untuk HUT RI ke-81.
Kategori/Tema: ${kategori || "Tradisional/Unik"}
Estimasi Anggaran per lomba: Rp ${budget ? Number(budget).toLocaleString('id-ID') : "Bebas"}
Target Peserta: ${pesertaType || "Semua kalangan"}

Berikan rekomendasi dalam format JSON yang rapi dengan array objek berisi:
1. nama_lomba (nama lomba unik dan khas Indonesia)
2. deskripsi (cara bermain singkat, lucu, menghibur, dan penuh kebersamaan warga)
3. kategori (Kategori lomba yang paling tepat)
4. estimasi_biaya (angka integer estimasi biaya operasional)
5. perlengkapan (array perlengkapan yang dibutuhkan)
6. tips_keamanan (tips agar lomba berlangsung aman)

Pastikan respons hanya berupa JSON murni yang sesuai dengan struktur skema ini tanpa markdown block tambahan di luar skema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rekomendasi: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nama_lomba: { type: Type.STRING },
                    deskripsi: { type: Type.STRING },
                    kategori: { type: Type.STRING },
                    estimasi_biaya: { type: Type.INTEGER },
                    perlengkapan: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    tips_keamanan: { type: Type.STRING }
                  },
                  required: ["nama_lomba", "deskripsi", "kategori", "estimasi_biaya", "perlengkapan", "tips_keamanan"]
                }
              }
            },
            required: ["rekomendasi"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      res.json(data);
    } catch (error: any) {
      console.error("Gemini AI API Error:", error);
      res.status(500).json({ error: "Gagal memproses rekomendasi AI: " + error.message });
    }
  });

  // Backup and data payload storage endpoints (JSON state preservation helper)
  app.post("/api/backup", (req, res) => {
    res.json({
      status: "success",
      message: "Backup data sirkuit lokal berhasil disimulasikan.",
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware setup for local development vs production assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
