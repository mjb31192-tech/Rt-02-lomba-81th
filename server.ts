import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
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

  // --- API ENDPOINTS ---

  // Health and Feature Info API
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      aiEnabled: !!ai,
      timestamp: new Date().toISOString(),
      app: "Sistem Manajemen Lomba HUT RI 81"
    });
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
